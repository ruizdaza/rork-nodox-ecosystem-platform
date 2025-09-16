import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  TextInput,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack } from "expo-router";
import {
  ArrowLeft,
  Bell,
  Shield,
  User,
  Palette,
  Globe,
  Smartphone,
  Lock,
  Eye,
  EyeOff,
  Save,
  Trash2,
  Download,
  Upload,
  Moon,
  Sun,
  Volume2,
  VolumeX,
  Wifi,
  Database,
  HelpCircle,
  Mail,
  Phone,
  MapPin,
  Calendar,
  CreditCard,
  Key,
  Fingerprint,
  Camera,
  Mic,
  FileText,
  Share2,
} from "lucide-react-native";
import { useRouter } from "expo-router";
import { useNodoX } from "@/hooks/use-nodox-store";
import NodoXLogo from "@/components/NodoXLogo";

type SettingSection = {
  title: string;
  items: SettingItem[];
};

type SettingItem = {
  icon: any;
  title: string;
  subtitle?: string;
  type: 'toggle' | 'navigation' | 'action' | 'info';
  value?: boolean | string;
  onPress?: () => void;
  onToggle?: (value: boolean) => void;
  color?: string;
};

export default function SettingsScreen() {
  const router = useRouter();
  const { user, updateUserSettings } = useNodoX();
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Settings state
  const [settings, setSettings] = useState({
    notifications: {
      push: true,
      email: true,
      sms: false,
      marketing: false,
      offers: true,
      social: true,
      payments: true,
    },
    privacy: {
      profileVisible: true,
      showOnlineStatus: true,
      allowMessages: true,
      shareLocation: false,
      dataCollection: true,
    },
    appearance: {
      darkMode: false,
      language: 'es',
      fontSize: 'medium',
    },
    security: {
      biometric: false,
      twoFactor: false,
      autoLock: true,
      loginAlerts: true,
    },
    app: {
      sound: true,
      vibration: true,
      autoUpdate: true,
      analytics: true,
    },
  });

  const updateSetting = (section: keyof typeof settings, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value,
      },
    }));
    updateUserSettings({ [section]: { [key]: value } });
  };

  const handleChangePassword = () => {
    if (newPassword !== confirmPassword) {
      Alert.alert("Error", "Las contraseñas no coinciden");
      return;
    }
    if (newPassword.length < 8) {
      Alert.alert("Error", "La contraseña debe tener al menos 8 caracteres");
      return;
    }
    
    Alert.alert(
      "Contraseña actualizada",
      "Tu contraseña ha sido cambiada exitosamente",
      [{ text: "OK", onPress: () => setShowPasswordModal(false) }]
    );
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Cuenta eliminada",
      "Tu cuenta ha sido programada para eliminación. Recibirás un email de confirmación.",
      [{ text: "OK", onPress: () => setShowDeleteModal(false) }]
    );
  };

  const handleExportData = () => {
    Alert.alert(
      "Exportar datos",
      "Se enviará un archivo con todos tus datos a tu email registrado en las próximas 24 horas.",
      [{ text: "OK" }]
    );
  };

  const settingSections: SettingSection[] = [
    {
      title: "Notificaciones",
      items: [
        {
          icon: Bell,
          title: "Notificaciones push",
          subtitle: "Recibe alertas en tu dispositivo",
          type: "toggle",
          value: settings.notifications.push,
          onToggle: (value) => updateSetting('notifications', 'push', value),
        },
        {
          icon: Mail,
          title: "Notificaciones por email",
          subtitle: "Recibe alertas en tu correo",
          type: "toggle",
          value: settings.notifications.email,
          onToggle: (value) => updateSetting('notifications', 'email', value),
        },
        {
          icon: Phone,
          title: "Notificaciones SMS",
          subtitle: "Recibe alertas por mensaje de texto",
          type: "toggle",
          value: settings.notifications.sms,
          onToggle: (value) => updateSetting('notifications', 'sms', value),
        },
        {
          icon: Share2,
          title: "Marketing",
          subtitle: "Ofertas y promociones especiales",
          type: "toggle",
          value: settings.notifications.marketing,
          onToggle: (value) => updateSetting('notifications', 'marketing', value),
        },
        {
          icon: CreditCard,
          title: "Pagos y transacciones",
          subtitle: "Alertas de movimientos financieros",
          type: "toggle",
          value: settings.notifications.payments,
          onToggle: (value) => updateSetting('notifications', 'payments', value),
        },
      ],
    },
    {
      title: "Privacidad",
      items: [
        {
          icon: User,
          title: "Perfil público",
          subtitle: "Otros usuarios pueden ver tu perfil",
          type: "toggle",
          value: settings.privacy.profileVisible,
          onToggle: (value) => updateSetting('privacy', 'profileVisible', value),
        },
        {
          icon: Wifi,
          title: "Estado en línea",
          subtitle: "Mostrar cuando estás activo",
          type: "toggle",
          value: settings.privacy.showOnlineStatus,
          onToggle: (value) => updateSetting('privacy', 'showOnlineStatus', value),
        },
        {
          icon: Mail,
          title: "Permitir mensajes",
          subtitle: "Otros usuarios pueden enviarte mensajes",
          type: "toggle",
          value: settings.privacy.allowMessages,
          onToggle: (value) => updateSetting('privacy', 'allowMessages', value),
        },
        {
          icon: MapPin,
          title: "Compartir ubicación",
          subtitle: "Permitir acceso a tu ubicación",
          type: "toggle",
          value: settings.privacy.shareLocation,
          onToggle: (value) => updateSetting('privacy', 'shareLocation', value),
        },
        {
          icon: Database,
          title: "Recopilación de datos",
          subtitle: "Ayudar a mejorar la app",
          type: "toggle",
          value: settings.privacy.dataCollection,
          onToggle: (value) => updateSetting('privacy', 'dataCollection', value),
        },
      ],
    },
    {
      title: "Apariencia",
      items: [
        {
          icon: settings.appearance.darkMode ? Moon : Sun,
          title: "Modo oscuro",
          subtitle: "Tema oscuro para la aplicación",
          type: "toggle",
          value: settings.appearance.darkMode,
          onToggle: (value) => updateSetting('appearance', 'darkMode', value),
        },
        {
          icon: Globe,
          title: "Idioma",
          subtitle: "Español",
          type: "navigation",
          onPress: () => Alert.alert("Idioma", "Próximamente disponible"),
        },
        {
          icon: FileText,
          title: "Tamaño de fuente",
          subtitle: "Mediano",
          type: "navigation",
          onPress: () => Alert.alert("Tamaño de fuente", "Próximamente disponible"),
        },
      ],
    },
    {
      title: "Seguridad",
      items: [
        {
          icon: Key,
          title: "Cambiar contraseña",
          subtitle: "Actualiza tu contraseña",
          type: "action",
          onPress: () => setShowPasswordModal(true),
        },
        {
          icon: Fingerprint,
          title: "Autenticación biométrica",
          subtitle: "Usar huella o Face ID",
          type: "toggle",
          value: settings.security.biometric,
          onToggle: (value) => updateSetting('security', 'biometric', value),
        },
        {
          icon: Shield,
          title: "Autenticación de dos factores",
          subtitle: "Seguridad adicional",
          type: "toggle",
          value: settings.security.twoFactor,
          onToggle: (value) => updateSetting('security', 'twoFactor', value),
        },
        {
          icon: Lock,
          title: "Bloqueo automático",
          subtitle: "Bloquear app tras inactividad",
          type: "toggle",
          value: settings.security.autoLock,
          onToggle: (value) => updateSetting('security', 'autoLock', value),
        },
        {
          icon: Bell,
          title: "Alertas de inicio de sesión",
          subtitle: "Notificar nuevos accesos",
          type: "toggle",
          value: settings.security.loginAlerts,
          onToggle: (value) => updateSetting('security', 'loginAlerts', value),
        },
      ],
    },
    {
      title: "Aplicación",
      items: [
        {
          icon: settings.app.sound ? Volume2 : VolumeX,
          title: "Sonidos",
          subtitle: "Efectos de sonido de la app",
          type: "toggle",
          value: settings.app.sound,
          onToggle: (value) => updateSetting('app', 'sound', value),
        },
        {
          icon: Smartphone,
          title: "Vibración",
          subtitle: "Feedback háptico",
          type: "toggle",
          value: settings.app.vibration,
          onToggle: (value) => updateSetting('app', 'vibration', value),
        },
        {
          icon: Download,
          title: "Actualizaciones automáticas",
          subtitle: "Descargar actualizaciones",
          type: "toggle",
          value: settings.app.autoUpdate,
          onToggle: (value) => updateSetting('app', 'autoUpdate', value),
        },
        {
          icon: Database,
          title: "Análisis de uso",
          subtitle: "Ayudar a mejorar la experiencia",
          type: "toggle",
          value: settings.app.analytics,
          onToggle: (value) => updateSetting('app', 'analytics', value),
        },
      ],
    },
    {
      title: "Datos y privacidad",
      items: [
        {
          icon: Download,
          title: "Exportar mis datos",
          subtitle: "Descargar toda tu información",
          type: "action",
          onPress: handleExportData,
        },
        {
          icon: Trash2,
          title: "Eliminar cuenta",
          subtitle: "Borrar permanentemente tu cuenta",
          type: "action",
          color: "#ef4444",
          onPress: () => setShowDeleteModal(true),
        },
      ],
    },
  ];

  const renderSettingItem = (item: SettingItem, index: number) => {
    return (
      <TouchableOpacity
        key={index}
        style={styles.settingItem}
        onPress={item.onPress}
        disabled={item.type === 'toggle'}
      >
        <View style={[styles.settingIcon, item.color && { backgroundColor: `${item.color}20` }]}>
          <item.icon color={item.color || "#64748b"} size={20} />
        </View>
        <View style={styles.settingContent}>
          <Text style={[styles.settingTitle, item.color && { color: item.color }]}>
            {item.title}
          </Text>
          {item.subtitle && (
            <Text style={styles.settingSubtitle}>{item.subtitle}</Text>
          )}
        </View>
        {item.type === 'toggle' && (
          <Switch
            value={item.value as boolean}
            onValueChange={item.onToggle}
            trackColor={{ false: "#e2e8f0", true: "#3b82f6" }}
            thumbColor={item.value ? "#ffffff" : "#f1f5f9"}
          />
        )}
        {item.type === 'info' && (
          <Text style={styles.settingValue}>{item.value as string}</Text>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          title: "Configuración",
          headerStyle: { backgroundColor: "#ffffff" },
          headerTitleStyle: { color: "#1e293b", fontWeight: "bold" },
          headerTintColor: "#64748b",
        }}
      />
      
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <NodoXLogo size="small" />
          <Text style={styles.headerTitle}>Configuración</Text>
          <Text style={styles.headerSubtitle}>Personaliza tu experiencia NodoX</Text>
        </View>

        {/* Settings Sections */}
        {settingSections.map((section, sectionIndex) => (
          <View key={sectionIndex} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.sectionContent}>
              {section.items.map((item, itemIndex) => renderSettingItem(item, itemIndex))}
            </View>
          </View>
        ))}

        {/* App Version */}
        <View style={styles.appVersion}>
          <Text style={styles.versionText}>NodoX v1.0.0</Text>
          <Text style={styles.versionSubtext}>Última actualización: 15 Sep 2024</Text>
        </View>
      </ScrollView>

      {/* Change Password Modal */}
      <Modal
        visible={showPasswordModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowPasswordModal(false)}>
              <Text style={styles.modalCancel}>Cancelar</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Cambiar contraseña</Text>
            <TouchableOpacity onPress={handleChangePassword}>
              <Text style={styles.modalSave}>Guardar</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Contraseña actual</Text>
              <View style={styles.passwordInput}>
                <TextInput
                  style={styles.textInput}
                  value={currentPassword}
                  onChangeText={setCurrentPassword}
                  secureTextEntry={!showCurrentPassword}
                  placeholder="Ingresa tu contraseña actual"
                />
                <TouchableOpacity
                  onPress={() => setShowCurrentPassword(!showCurrentPassword)}
                >
                  {showCurrentPassword ? (
                    <EyeOff color="#64748b" size={20} />
                  ) : (
                    <Eye color="#64748b" size={20} />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Nueva contraseña</Text>
              <View style={styles.passwordInput}>
                <TextInput
                  style={styles.textInput}
                  value={newPassword}
                  onChangeText={setNewPassword}
                  secureTextEntry={!showNewPassword}
                  placeholder="Mínimo 8 caracteres"
                />
                <TouchableOpacity
                  onPress={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? (
                    <EyeOff color="#64748b" size={20} />
                  ) : (
                    <Eye color="#64748b" size={20} />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Confirmar contraseña</Text>
              <View style={styles.passwordInput}>
                <TextInput
                  style={styles.textInput}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPassword}
                  placeholder="Repite la nueva contraseña"
                />
                <TouchableOpacity
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff color="#64748b" size={20} />
                  ) : (
                    <Eye color="#64748b" size={20} />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.passwordTips}>
              <Text style={styles.tipsTitle}>Consejos para una contraseña segura:</Text>
              <Text style={styles.tipText}>• Al menos 8 caracteres</Text>
              <Text style={styles.tipText}>• Combina letras, números y símbolos</Text>
              <Text style={styles.tipText}>• Evita información personal</Text>
              <Text style={styles.tipText}>• No reutilices contraseñas</Text>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Delete Account Modal */}
      <Modal
        visible={showDeleteModal}
        animationType="fade"
        transparent
      >
        <View style={styles.deleteModalOverlay}>
          <View style={styles.deleteModalContent}>
            <View style={styles.deleteModalIcon}>
              <Trash2 color="#ef4444" size={32} />
            </View>
            <Text style={styles.deleteModalTitle}>¿Eliminar cuenta?</Text>
            <Text style={styles.deleteModalText}>
              Esta acción no se puede deshacer. Se eliminarán todos tus datos, 
              transacciones y configuraciones permanentemente.
            </Text>
            <View style={styles.deleteModalButtons}>
              <TouchableOpacity
                style={styles.deleteModalCancel}
                onPress={() => setShowDeleteModal(false)}
              >
                <Text style={styles.deleteModalCancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.deleteModalConfirm}
                onPress={handleDeleteAccount}
              >
                <Text style={styles.deleteModalConfirmText}>Eliminar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  header: {
    backgroundColor: "#ffffff",
    alignItems: "center",
    paddingVertical: 24,
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1e293b",
    marginTop: 12,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#64748b",
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  sectionContent: {
    backgroundColor: "#ffffff",
    marginHorizontal: 20,
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  settingIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#f1f5f9",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1e293b",
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 12,
    color: "#64748b",
  },
  settingValue: {
    fontSize: 14,
    color: "#64748b",
  },
  appVersion: {
    alignItems: "center",
    paddingVertical: 24,
    gap: 4,
  },
  versionText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#64748b",
  },
  versionSubtext: {
    fontSize: 12,
    color: "#94a3b8",
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  modalCancel: {
    fontSize: 16,
    color: "#64748b",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1e293b",
  },
  modalSave: {
    fontSize: 16,
    fontWeight: "600",
    color: "#3b82f6",
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  inputGroup: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
    marginBottom: 8,
  },
  passwordInput: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: "#1e293b",
  },
  passwordTips: {
    backgroundColor: "#f0f9ff",
    padding: 16,
    borderRadius: 8,
    marginTop: 16,
  },
  tipsTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1e40af",
    marginBottom: 8,
  },
  tipText: {
    fontSize: 12,
    color: "#1e40af",
    marginBottom: 4,
  },
  // Delete modal styles
  deleteModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  deleteModalContent: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    maxWidth: 320,
    width: "100%",
  },
  deleteModalIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#fef2f2",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  deleteModalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1e293b",
    marginBottom: 8,
  },
  deleteModalText: {
    fontSize: 14,
    color: "#64748b",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
  },
  deleteModalButtons: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },
  deleteModalCancel: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: "#f1f5f9",
    alignItems: "center",
  },
  deleteModalCancelText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#64748b",
  },
  deleteModalConfirm: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: "#ef4444",
    alignItems: "center",
  },
  deleteModalConfirmText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#ffffff",
  },
});