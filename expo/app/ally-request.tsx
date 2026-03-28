import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, useRouter } from "expo-router";
import { 
  ArrowLeft, 
  Building2, 
  Mail, 
  Phone, 
  MapPin, 
  User, 
  FileText,
  CheckCircle,
  Loader2
} from "lucide-react-native";
import { useNodoX } from "@/hooks/use-nodox-store";

interface FormData {
  businessName: string;
  businessType: string;
  businessDescription: string;
  businessAddress: string;
  businessPhone: string;
  businessEmail: string;
  taxId: string;
  legalRepresentative: string;
}

const businessTypes = [
  "Restaurante",
  "Tienda de Ropa",
  "Salón de Belleza",
  "Consultorio Médico",
  "Consultorio Odontológico",
  "Gimnasio",
  "Farmacia",
  "Supermercado",
  "Ferretería",
  "Panadería",
  "Otro"
];

export default function AllyRequestScreen() {
  const router = useRouter();
  const { submitAllyRequest, user } = useNodoX();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showTypeSelector, setShowTypeSelector] = useState(false);
  
  const [formData, setFormData] = useState<FormData>({
    businessName: "",
    businessType: "",
    businessDescription: "",
    businessAddress: "",
    businessPhone: "",
    businessEmail: "",
    taxId: "",
    legalRepresentative: "",
  });

  const [errors, setErrors] = useState<Partial<FormData>>({});

  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {};

    if (!formData.businessName.trim()) {
      newErrors.businessName = "El nombre del negocio es requerido";
    }

    if (!formData.businessType.trim()) {
      newErrors.businessType = "El tipo de negocio es requerido";
    }

    if (!formData.businessDescription.trim()) {
      newErrors.businessDescription = "La descripción es requerida";
    }

    if (!formData.businessAddress.trim()) {
      newErrors.businessAddress = "La dirección es requerida";
    }

    if (!formData.businessPhone.trim()) {
      newErrors.businessPhone = "El teléfono es requerido";
    } else if (!/^[0-9+\-\s()]+$/.test(formData.businessPhone)) {
      newErrors.businessPhone = "Formato de teléfono inválido";
    }

    if (!formData.businessEmail.trim()) {
      newErrors.businessEmail = "El email es requerido";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.businessEmail)) {
      newErrors.businessEmail = "Formato de email inválido";
    }

    if (!formData.taxId.trim()) {
      newErrors.taxId = "El NIT/RUT es requerido";
    }

    if (!formData.legalRepresentative.trim()) {
      newErrors.legalRepresentative = "El representante legal es requerido";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      Alert.alert("Error", "Por favor completa todos los campos correctamente");
      return;
    }

    setIsSubmitting(true);
    
    try {
      const success = await submitAllyRequest(formData);
      
      if (success) {
        Alert.alert(
          "¡Solicitud Enviada!",
          "Tu solicitud para ser aliado ha sido enviada exitosamente. Recibirás una respuesta en las próximas 24-48 horas.",
          [
            {
              text: "Entendido",
              onPress: () => router.back()
            }
          ]
        );
      } else {
        Alert.alert("Error", "No se pudo enviar la solicitud. Intenta nuevamente.");
      }
    } catch (error) {
      console.error('Error submitting ally request:', error);
      Alert.alert("Error", "Ocurrió un error inesperado. Intenta nuevamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateFormData = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const renderInput = (
    field: keyof FormData,
    label: string,
    icon: React.ReactNode,
    placeholder: string,
    multiline: boolean = false,
    keyboardType: "default" | "email-address" | "phone-pad" = "default"
  ) => (
    <View style={styles.inputContainer}>
      <Text style={styles.inputLabel}>{label}</Text>
      <View style={[styles.inputWrapper, errors[field] && styles.inputError]}>
        <View style={styles.inputIcon}>
          {icon}
        </View>
        <TextInput
          style={[styles.input, multiline && styles.multilineInput]}
          placeholder={placeholder}
          value={formData[field]}
          onChangeText={(value) => updateFormData(field, value)}
          multiline={multiline}
          numberOfLines={multiline ? 4 : 1}
          keyboardType={keyboardType}
          placeholderTextColor="#94a3b8"
        />
      </View>
      {errors[field] && (
        <Text style={styles.errorText}>{errors[field]}</Text>
      )}
    </View>
  );

  const renderTypeSelector = () => (
    <View style={styles.inputContainer}>
      <Text style={styles.inputLabel}>Tipo de Negocio</Text>
      <TouchableOpacity
        style={[styles.inputWrapper, errors.businessType && styles.inputError]}
        onPress={() => setShowTypeSelector(!showTypeSelector)}
      >
        <View style={styles.inputIcon}>
          <Building2 color="#64748b" size={20} />
        </View>
        <Text style={[styles.selectorText, !formData.businessType && styles.placeholderText]}>
          {formData.businessType || "Selecciona el tipo de negocio"}
        </Text>
      </TouchableOpacity>
      
      {showTypeSelector && (
        <View style={styles.typeSelector}>
          {businessTypes.map((type) => (
            <TouchableOpacity
              key={type}
              style={styles.typeOption}
              onPress={() => {
                updateFormData('businessType', type);
                setShowTypeSelector(false);
              }}
            >
              <Text style={styles.typeOptionText}>{type}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
      
      {errors.businessType && (
        <Text style={styles.errorText}>{errors.businessType}</Text>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: "Solicitud de Aliado",
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <ArrowLeft color="#1e293b" size={24} />
            </TouchableOpacity>
          ),
        }}
      />
      
      <KeyboardAvoidingView 
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerIcon}>
              <Building2 color="#8b5cf6" size={32} />
            </View>
            <Text style={styles.headerTitle}>Conviértete en Aliado NodoX</Text>
            <Text style={styles.headerSubtitle}>
              Completa la información de tu negocio para comenzar el proceso de aprobación
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {renderInput(
              "businessName",
              "Nombre del Negocio",
              <Building2 color="#64748b" size={20} />,
              "Ej: Restaurante El Sabor"
            )}

            {renderTypeSelector()}

            {renderInput(
              "businessDescription",
              "Descripción del Negocio",
              <FileText color="#64748b" size={20} />,
              "Describe brevemente tu negocio, productos o servicios...",
              true
            )}

            {renderInput(
              "businessAddress",
              "Dirección",
              <MapPin color="#64748b" size={20} />,
              "Calle 123 #45-67, Ciudad"
            )}

            {renderInput(
              "businessPhone",
              "Teléfono",
              <Phone color="#64748b" size={20} />,
              "+57 300 123 4567",
              false,
              "phone-pad"
            )}

            {renderInput(
              "businessEmail",
              "Email del Negocio",
              <Mail color="#64748b" size={20} />,
              "contacto@negocio.com",
              false,
              "email-address"
            )}

            {renderInput(
              "taxId",
              "NIT/RUT",
              <FileText color="#64748b" size={20} />,
              "123456789-0"
            )}

            {renderInput(
              "legalRepresentative",
              "Representante Legal",
              <User color="#64748b" size={20} />,
              "Nombre completo del representante"
            )}
          </View>

          {/* Info Box */}
          <View style={styles.infoBox}>
            <CheckCircle color="#10b981" size={20} />
            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>Proceso de Aprobación</Text>
              <Text style={styles.infoText}>
                • Revisión inicial: 24-48 horas{"\n"}
                • Acceso temporal: 48 horas para pruebas{"\n"}
                • Aprobación final: Después de validación
              </Text>
            </View>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <Loader2 color="#ffffff" size={20} style={styles.loadingIcon} />
            ) : (
              <CheckCircle color="#ffffff" size={20} />
            )}
            <Text style={styles.submitButtonText}>
              {isSubmitting ? "Enviando Solicitud..." : "Enviar Solicitud"}
            </Text>
          </TouchableOpacity>

          <View style={styles.bottomSpacing} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 24,
    backgroundColor: "#ffffff",
    marginBottom: 16,
  },
  headerIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#f3f4f6",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1e293b",
    textAlign: "center",
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#64748b",
    textAlign: "center",
    lineHeight: 20,
  },
  form: {
    paddingHorizontal: 20,
    gap: 20,
  },
  inputContainer: {
    gap: 8,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  inputError: {
    borderColor: "#ef4444",
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#1e293b",
    padding: 0,
  },
  multilineInput: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  selectorText: {
    flex: 1,
    fontSize: 16,
    color: "#1e293b",
  },
  placeholderText: {
    color: "#94a3b8",
  },
  typeSelector: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    marginTop: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  typeOption: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  typeOptionText: {
    fontSize: 16,
    color: "#1e293b",
  },
  errorText: {
    fontSize: 12,
    color: "#ef4444",
    marginTop: 4,
  },
  infoBox: {
    flexDirection: "row",
    backgroundColor: "#f0fdf4",
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 20,
    marginTop: 24,
    borderWidth: 1,
    borderColor: "#bbf7d0",
  },
  infoContent: {
    flex: 1,
    marginLeft: 12,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#166534",
    marginBottom: 4,
  },
  infoText: {
    fontSize: 12,
    color: "#166534",
    lineHeight: 16,
  },
  submitButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#8b5cf6",
    marginHorizontal: 20,
    marginTop: 24,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  submitButtonDisabled: {
    backgroundColor: "#94a3b8",
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ffffff",
  },
  loadingIcon: {
    transform: [{ rotate: "45deg" }],
  },
  bottomSpacing: {
    height: 32,
  },
});