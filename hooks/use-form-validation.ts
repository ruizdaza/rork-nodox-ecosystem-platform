import { useState, useCallback, useMemo } from 'react';
import { InputValidator, ValidationUtils, ErrorUtils } from '@/utils/security';
import React from "react";

interface ValidationRule {
  type: 'text' | 'html' | 'numeric' | 'email' | 'phone' | 'url';
  required?: boolean;
  maxLength?: number;
  minLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => { valid: boolean; error?: string };
}

interface FormValidationState {
  values: Record<string, any>;
  errors: Record<string, string[]>;
  touched: Record<string, boolean>;
  isValid: boolean;
  isSubmitting: boolean;
}

interface UseFormValidationOptions {
  initialValues?: Record<string, any>;
  validationRules: Record<string, ValidationRule>;
  onSubmit?: (values: Record<string, any>) => Promise<void> | void;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
}

export function useFormValidation(options: UseFormValidationOptions) {
  const {
    initialValues = {},
    validationRules,
    onSubmit,
    validateOnChange = true,
    validateOnBlur = true,
  } = options;

  const [state, setState] = useState<FormValidationState>({
    values: initialValues,
    errors: {},
    touched: {},
    isValid: false,
    isSubmitting: false,
  });

  const validator = useMemo(() => InputValidator.getInstance(), []);

  // Rate limiter for validation to prevent excessive calls
  const rateLimiter = useMemo(
    () => ValidationUtils.createRateLimiter(10, 1000), // 10 calls per second
    []
  );

  // Validate a single field
  const validateField = useCallback(
    (fieldName: string, value: any): string[] => {
      const rule = validationRules[fieldName];
      if (!rule) return [];

      // Rate limiting for security
      if (!rateLimiter()) {
        ValidationUtils.logSecurityEvent('VALIDATION_RATE_LIMIT_EXCEEDED', {
          field: fieldName,
          value: typeof value === 'string' ? value.substring(0, 50) : value,
        });
        return ['Demasiadas validaciones. Intenta más lento.'];
      }

      try {
        const sanitizationResult = validator.sanitizeInput(value, {
          type: rule.type,
          maxLength: rule.maxLength,
          strictMode: true,
        });

        const fieldErrors: string[] = [...sanitizationResult.errors];

        // Required field validation
        if (rule.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
          fieldErrors.push('Este campo es requerido');
        }

        // Length validation
        if (rule.minLength && sanitizationResult.sanitized.length < rule.minLength) {
          fieldErrors.push(`Mínimo ${rule.minLength} caracteres`);
        }

        // Pattern validation
        if (rule.pattern && !rule.pattern.test(sanitizationResult.sanitized)) {
          fieldErrors.push('Formato inválido');
        }

        // Custom validation
        if (rule.custom) {
          const customResult = rule.custom(sanitizationResult.sanitized);
          if (!customResult.valid) {
            fieldErrors.push(customResult.error || 'Validación personalizada falló');
          }
        }

        return fieldErrors;
      } catch (error) {
        ErrorUtils.logError(error, `Field validation: ${fieldName}`);
        return ['Error de validación'];
      }
    },
    [validationRules, validator, rateLimiter]
  );

  // Validate all fields
  const validateForm = useCallback(
    (values: Record<string, any>): { isValid: boolean; errors: Record<string, string[]> } => {
      const errors: Record<string, string[]> = {};
      let isValid = true;

      for (const [fieldName, rule] of Object.entries(validationRules)) {
        const fieldErrors = validateField(fieldName, values[fieldName]);
        if (fieldErrors.length > 0) {
          errors[fieldName] = fieldErrors;
          isValid = false;
        }
      }

      return { isValid, errors };
    },
    [validationRules, validateField]
  );

  // Set field value with optional validation
  const setValue = useCallback(
    (fieldName: string, value: any, shouldValidate = validateOnChange) => {
      setState((prevState) => {
        const newValues = { ...prevState.values, [fieldName]: value };
        let newErrors = prevState.errors;
        let newIsValid = prevState.isValid;

        if (shouldValidate) {
          const fieldErrors = validateField(fieldName, value);
          newErrors = {
            ...prevState.errors,
            [fieldName]: fieldErrors,
          };

          // Remove field errors if validation passes
          if (fieldErrors.length === 0) {
            const { [fieldName]: removed, ...rest } = newErrors;
            newErrors = rest;
          }

          // Recalculate form validity
          const { isValid } = validateForm(newValues);
          newIsValid = isValid;
        }

        return {
          ...prevState,
          values: newValues,
          errors: newErrors,
          isValid: newIsValid,
        };
      });
    },
    [validateField, validateForm, validateOnChange]
  );

  // Set multiple values at once
  const setValues = useCallback(
    (values: Record<string, any>, shouldValidate = true) => {
      setState((prevState) => {
        const newValues = { ...prevState.values, ...values };
        let newErrors = prevState.errors;
        let newIsValid = prevState.isValid;

        if (shouldValidate) {
          const { isValid, errors } = validateForm(newValues);
          newErrors = errors;
          newIsValid = isValid;
        }

        return {
          ...prevState,
          values: newValues,
          errors: newErrors,
          isValid: newIsValid,
        };
      });
    },
    [validateForm]
  );

  // Mark field as touched
  const setTouched = useCallback(
    (fieldName: string, shouldValidate = validateOnBlur) => {
      setState((prevState) => {
        const newTouched = { ...prevState.touched, [fieldName]: true };
        let newErrors = prevState.errors;
        let newIsValid = prevState.isValid;

        if (shouldValidate && !prevState.errors[fieldName]) {
          const fieldErrors = validateField(fieldName, prevState.values[fieldName]);
          if (fieldErrors.length > 0) {
            newErrors = {
              ...prevState.errors,
              [fieldName]: fieldErrors,
            };
            newIsValid = false;
          }
        }

        return {
          ...prevState,
          touched: newTouched,
          errors: newErrors,
          isValid: newIsValid,
        };
      });
    },
    [validateField, validateOnBlur]
  );

  // Clear field error
  const clearFieldError = useCallback((fieldName: string) => {
    setState((prevState) => {
      const { [fieldName]: removed, ...newErrors } = prevState.errors;
      const { isValid } = validateForm(prevState.values);

      return {
        ...prevState,
        errors: newErrors,
        isValid,
      };
    });
  }, [validateForm]);

  // Reset form to initial state
  const reset = useCallback(() => {
    setState({
      values: initialValues,
      errors: {},
      touched: {},
      isValid: false,
      isSubmitting: false,
    });
  }, [initialValues]);

  // Submit form with validation
  const handleSubmit = useCallback(
    async (event?: React.FormEvent) => {
      if (event) {
        event.preventDefault();
      }

      // Validate all fields before submission
      const { isValid, errors } = validateForm(state.values);

      setState((prevState) => ({
        ...prevState,
        errors,
        isValid,
        isSubmitting: true,
        touched: Object.keys(validationRules).reduce(
          (acc, key) => ({ ...acc, [key]: true }),
          {}
        ),
      }));

      if (!isValid) {
        setState((prevState) => ({ ...prevState, isSubmitting: false }));
        ValidationUtils.logSecurityEvent('FORM_VALIDATION_FAILED', {
          errors: Object.keys(errors),
          formType: 'unknown',
        });
        return;
      }

      if (onSubmit) {
        try {
          await onSubmit(state.values);
          console.log('[Form] Submitted successfully with validation');
        } catch (error) {
          ErrorUtils.logError(error, 'Form submission');
          throw error;
        } finally {
          setState((prevState) => ({ ...prevState, isSubmitting: false }));
        }
      } else {
        setState((prevState) => ({ ...prevState, isSubmitting: false }));
      }
    },
    [state.values, validateForm, validationRules, onSubmit]
  );

  // Get field props for easy integration with form inputs
  const getFieldProps = useCallback(
    (fieldName: string) => ({
      value: state.values[fieldName] || '',
      onChangeText: (value: string) => setValue(fieldName, value),
      onBlur: () => setTouched(fieldName),
      error: state.touched[fieldName] ? state.errors[fieldName]?.[0] : undefined,
      hasError: Boolean(state.touched[fieldName] && state.errors[fieldName]?.length),
    }),
    [state.values, state.touched, state.errors, setValue, setTouched]
  );

  // Get sanitized values for safe usage
  const getSanitizedValues = useCallback(() => {
    const sanitizedValues: Record<string, any> = {};

    for (const [fieldName, value] of Object.entries(state.values)) {
      const rule = validationRules[fieldName];
      if (rule) {
        try {
          const sanitizationResult = validator.sanitizeInput(value, {
            type: rule.type,
            maxLength: rule.maxLength,
            strictMode: true,
          });
          sanitizedValues[fieldName] = sanitizationResult.sanitized;
        } catch (error) {
          ErrorUtils.logError(error, `Sanitization: ${fieldName}`);
          sanitizedValues[fieldName] = '';
        }
      } else {
        sanitizedValues[fieldName] = value;
      }
    }

    return sanitizedValues;
  }, [state.values, validationRules, validator]);

  // Security analysis of form data
  const getSecurityAnalysis = useCallback(() => {
    const analysis = ValidationUtils.analyzeSecurityPatterns();
    const formRisks: string[] = [];

    // Check for suspicious patterns in form values
    for (const [fieldName, value] of Object.entries(state.values)) {
      if (typeof value === 'string') {
        // Check for potential injection attempts
        if (value.includes('<script') || value.includes('javascript:')) {
          formRisks.push(`Campo ${fieldName} contiene contenido sospechoso`);
        }

        // Check for excessive length (potential DoS)
        if (value.length > 10000) {
          formRisks.push(`Campo ${fieldName} excede longitud segura`);
        }
      }
    }

    return {
      ...analysis,
      formRisks,
      hasFormRisks: formRisks.length > 0,
    };
  }, [state.values]);

  return {
    // State
    values: state.values,
    errors: state.errors,
    touched: state.touched,
    isValid: state.isValid,
    isSubmitting: state.isSubmitting,

    // Actions
    setValue,
    setValues,
    setTouched,
    clearFieldError,
    reset,
    handleSubmit,

    // Utilities
    getFieldProps,
    getSanitizedValues,
    getSecurityAnalysis,
    validateField,
    validateForm,
  };
}

// Predefined validation rules for common fields
export const commonValidationRules = {
  email: {
    type: 'email' as const,
    required: true,
    maxLength: 254,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  },
  phone: {
    type: 'phone' as const,
    required: true,
    maxLength: 20,
    pattern: /^[+]?[0-9\s\-()]{7,15}$/,
  },
  name: {
    type: 'text' as const,
    required: true,
    minLength: 2,
    maxLength: 50,
    pattern: /^[a-zA-ZÀ-ÿ\u00f1\u00d1\s'-]+$/,
  },
  password: {
    type: 'text' as const,
    required: true,
    minLength: 8,
    maxLength: 128,
    custom: (value: string) => {
      const hasUpperCase = /[A-Z]/.test(value);
      const hasLowerCase = /[a-z]/.test(value);
      const hasNumbers = /\d/.test(value);
      const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(value);

      if (!hasUpperCase || !hasLowerCase || !hasNumbers || !hasSpecialChar) {
        return {
          valid: false,
          error: 'La contraseña debe tener mayúsculas, minúsculas, números y símbolos',
        };
      }

      return { valid: true };
    },
  },
  amount: {
    type: 'numeric' as const,
    required: true,
    custom: (value: number) => {
      const validation = ValidationUtils.validatePaymentAmount(value, 1000000);
      return {
        valid: validation.valid,
        error: validation.error,
      };
    },
  },
  address: {
    type: 'text' as const,
    required: true,
    minLength: 5,
    maxLength: 200,
  },
  city: {
    type: 'text' as const,
    required: true,
    minLength: 2,
    maxLength: 50,
    pattern: /^[a-zA-ZÀ-ÿ\u00f1\u00d1\s'-]+$/,
  },
  postalCode: {
    type: 'text' as const,
    required: true,
    pattern: /^[0-9]{5,10}$/,
  },
  url: {
    type: 'url' as const,
    required: false,
    maxLength: 2048,
  },
  description: {
    type: 'text' as const,
    required: false,
    maxLength: 1000,
  },
};

export default useFormValidation;