// Security validation utilities
export const ValidationUtils = {
  // Sanitize text input to prevent XSS and injection attacks
  sanitizeText: (input: string, maxLength: number = 1000): string => {
    if (typeof input !== 'string') return '';
    return input
      .replace(/[<>"'&]/g, '') // Remove potentially dangerous characters
      .trim()
      .slice(0, maxLength);
  },

  // Validate and sanitize numeric input
  sanitizeNumeric: (input: string, min: number = 0, max: number = Number.MAX_SAFE_INTEGER): number => {
    if (typeof input !== 'string') return 0;
    const sanitized = input.replace(/[^0-9.]/g, '');
    const num = parseFloat(sanitized) || 0;
    return Math.max(min, Math.min(max, num));
  },

  // Validate phone number format
  validatePhone: (phone: string): boolean => {
    if (typeof phone !== 'string') return false;
    const cleaned = phone.trim();
    return /^[+]?[0-9\s\-()]{7,15}$/.test(cleaned);
  },

  // Validate email format
  validateEmail: (email: string): boolean => {
    if (typeof email !== 'string') return false;
    const cleaned = email.trim().toLowerCase();
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleaned);
  },

  // Validate postal code
  validatePostalCode: (code: string): boolean => {
    if (typeof code !== 'string') return false;
    const cleaned = code.trim();
    return /^[0-9]{5,10}$/.test(cleaned);
  },

  // Validate required field
  validateRequired: (value: string, minLength: number = 1): boolean => {
    if (typeof value !== 'string') return false;
    return value.trim().length >= minLength;
  },

  // Validate name (only letters, spaces, and common name characters)
  validateName: (name: string): boolean => {
    if (typeof name !== 'string') return false;
    const cleaned = name.trim();
    return /^[a-zA-ZÀ-ÿ\u00f1\u00d1\s'-]{2,50}$/.test(cleaned);
  },

  // Validate address
  validateAddress: (address: string): boolean => {
    if (typeof address !== 'string') return false;
    const cleaned = address.trim();
    return cleaned.length >= 5 && cleaned.length <= 200;
  },

  // Validate city name
  validateCity: (city: string): boolean => {
    if (typeof city !== 'string') return false;
    const cleaned = city.trim();
    return /^[a-zA-ZÀ-ÿ\u00f1\u00d1\s'-]{2,50}$/.test(cleaned);
  },

  // Rate limiting for API calls
  createRateLimiter: (maxCalls: number, windowMs: number) => {
    const calls: number[] = [];
    
    return (): boolean => {
      const now = Date.now();
      const windowStart = now - windowMs;
      
      // Remove old calls outside the window
      while (calls.length > 0 && calls[0] < windowStart) {
        calls.shift();
      }
      
      // Check if we're within the limit
      if (calls.length >= maxCalls) {
        return false;
      }
      
      // Add current call
      calls.push(now);
      return true;
    };
  },

  // Validate payment amounts
  validatePaymentAmount: (amount: number, balance: number): { valid: boolean; error?: string } => {
    if (typeof amount !== 'number' || isNaN(amount)) {
      return { valid: false, error: 'Cantidad inválida' };
    }
    
    if (amount <= 0) {
      return { valid: false, error: 'La cantidad debe ser mayor a cero' };
    }
    
    if (amount > balance) {
      return { valid: false, error: 'Saldo insuficiente' };
    }
    
    if (amount > 1000000) { // Max transaction limit
      return { valid: false, error: 'Cantidad excede el límite máximo' };
    }
    
    return { valid: true };
  },

  // Validate cart integrity
  validateCart: (cart: any): { valid: boolean; error?: string } => {
    if (!cart || typeof cart !== 'object') {
      return { valid: false, error: 'Carrito inválido' };
    }
    
    if (!Array.isArray(cart.items) || cart.items.length === 0) {
      return { valid: false, error: 'Carrito vacío' };
    }
    
    if (typeof cart.total !== 'number' || cart.total <= 0) {
      return { valid: false, error: 'Total del carrito inválido' };
    }
    
    if (typeof cart.ncopTotal !== 'number' || cart.ncopTotal < 0) {
      return { valid: false, error: 'Total NCOP inválido' };
    }
    
    // Validate each item
    for (const item of cart.items) {
      if (!item.product || typeof item.quantity !== 'number' || item.quantity <= 0) {
        return { valid: false, error: 'Producto inválido en el carrito' };
      }
    }
    
    return { valid: true };
  },

  // Debounce function for input validation
  debounce: <T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): ((...args: Parameters<T>) => void) => {
    let timeout: ReturnType<typeof setTimeout>;
    
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  },

  // Secure random string generator
  generateSecureId: (length: number = 16): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  },

  // Log security events
  logSecurityEvent: (event: string, details: any = {}) => {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      event,
      details: typeof details === 'object' ? details : { message: details },
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
    };
    
    console.warn('[SECURITY]', logEntry);
    
    // In production, send to monitoring service
    if (!__DEV__) {
      // sendToMonitoringService(logEntry);
    }
  },
};

// Error handling utilities
export const ErrorUtils = {
  // Classify error types
  classifyError: (error: any): 'network' | 'validation' | 'security' | 'system' | 'unknown' => {
    if (!error) return 'unknown';
    
    const message = error.message?.toLowerCase() || '';
    
    if (message.includes('network') || message.includes('fetch') || message.includes('timeout')) {
      return 'network';
    }
    
    if (message.includes('validation') || message.includes('invalid') || message.includes('required')) {
      return 'validation';
    }
    
    if (message.includes('unauthorized') || message.includes('forbidden') || message.includes('security')) {
      return 'security';
    }
    
    if (error.name === 'TypeError' || error.name === 'ReferenceError') {
      return 'system';
    }
    
    return 'unknown';
  },

  // Get user-friendly error message
  getUserFriendlyMessage: (error: any): string => {
    const errorType = ErrorUtils.classifyError(error);
    
    switch (errorType) {
      case 'network':
        return 'Error de conexión. Verifica tu internet e intenta nuevamente.';
      case 'validation':
        return 'Por favor verifica que todos los campos estén correctamente completados.';
      case 'security':
        return 'Error de seguridad. Por favor contacta al soporte.';
      case 'system':
        return 'Error del sistema. La aplicación se reiniciará automáticamente.';
      default:
        return 'Ha ocurrido un error inesperado. Intenta nuevamente.';
    }
  },

  // Safe error logging
  logError: (error: any, context: string = 'unknown') => {
    const errorInfo = {
      message: error?.message || 'Unknown error',
      stack: error?.stack || 'No stack trace',
      context,
      timestamp: new Date().toISOString(),
      type: ErrorUtils.classifyError(error),
    };
    
    console.error('[ERROR]', errorInfo);
    
    // In production, send to error tracking service
    if (!__DEV__) {
      // sendToErrorTrackingService(errorInfo);
    }
  },

  // Create safe async wrapper
  safeAsync: <T>(
    asyncFn: () => Promise<T>,
    fallback?: T
  ): Promise<T | undefined> => {
    return asyncFn().catch((error) => {
      ErrorUtils.logError(error, 'safeAsync');
      return fallback;
    });
  },

  // Retry mechanism with exponential backoff
  retryWithBackoff: async <T>(
    fn: () => Promise<T>,
    maxRetries: number = 3,
    baseDelay: number = 1000
  ): Promise<T> => {
    let lastError: any;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;
        
        if (attempt === maxRetries) {
          throw error;
        }
        
        const delay = baseDelay * Math.pow(2, attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    throw lastError;
  },
};