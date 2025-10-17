import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import {
  X,
  User,
  Lock,
  Bell,
  Globe,
  CreditCard,
  Shield,
  HelpCircle,
  LogOut,
  ChevronRight,
  Moon,
  Smartphone,
} from 'lucide-react-native';
import { useNodoX } from '@/hooks/use-nodox-store';

export default function SettingsScreen() {
  const { user } = useNodoX();
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(true);
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [biometricAuth, setBiometricAuth] = useState<boolean>(false);

  const handleLogout = () => {
    Alert.alert(
      'Cerrar sesión',
      '¿Estás seguro de que quieres cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cerrar sesión',
          style: 'destructive',
          onPress: () => {
            console.log('Logout');
            router.replace('/(tabs)');
          },
        },
      ]
    );
  };

  const SettingItem = ({
    icon: Icon,
    title,
    subtitle,
    onPress,
    showChevron = true,
  }: {
    icon: any;
    title: string;
    subtitle?: string;
    onPress: () => void;
    showChevron?: boolean;
  }) => (
    <TouchableOpacity style={styles.settingItem} onPress={onPress}>
      <View style={styles.settingIcon}>
        <Icon color="#2563eb" size={20} />
      </View>
      <View style={styles.settingContent}>
        <Text style={styles.settingTitle}>{title}</Text>
        {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
      </View>
      {showChevron && <ChevronRight color="#94a3b8" size={20} />}
    </TouchableOpacity>
  );

  const SettingToggle = ({
    icon: Icon,
    title,
    subtitle,
    value,
    onValueChange,
  }: {
    icon: any;
    title: string;
    subtitle?: string;
    value: boolean;
    onValueChange: (value: boolean) => void;
  }) => (
    <View style={styles.settingItem}>
      <View style={styles.settingIcon}>
        <Icon color="#2563eb" size={20} />
      </View>
      <View style={styles.settingContent}>
        <Text style={styles.settingTitle}>{title}</Text>
        {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: '#e2e8f0', true: '#93c5fd' }}
        thumbColor={value ? '#2563eb' : '#f1f5f9'}
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Configuración</Text>
        <TouchableOpacity style={styles.closeButton} onPress={() => router.back()}>
          <X color="#1e293b" size={24} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cuenta</Text>
          <View style={styles.settingsGroup}>
            <SettingItem
              icon={User}
              title="Perfil"
              subtitle={user.name}
              onPress={() => router.push('/(tabs)/profile')}
            />
            <SettingItem
              icon={Lock}
              title="Privacidad y seguridad"
              subtitle="Control de privacidad"
              onPress={() => console.log('Privacy settings')}
            />
            <SettingItem
              icon={CreditCard}
              title="Métodos de pago"
              subtitle="Gestiona tus tarjetas"
              onPress={() => console.log('Payment methods')}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notificaciones</Text>
          <View style={styles.settingsGroup}>
            <SettingToggle
              icon={Bell}
              title="Notificaciones push"
              subtitle="Recibe alertas importantes"
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
            />
            <SettingItem
              icon={Bell}
              title="Preferencias de notificación"
              subtitle="Personaliza tus alertas"
              onPress={() => console.log('Notification preferences')}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Apariencia</Text>
          <View style={styles.settingsGroup}>
            <SettingToggle
              icon={Moon}
              title="Modo oscuro"
              subtitle="Activa el tema oscuro"
              value={darkMode}
              onValueChange={setDarkMode}
            />
            <SettingItem
              icon={Globe}
              title="Idioma"
              subtitle="Español"
              onPress={() => console.log('Language settings')}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Seguridad</Text>
          <View style={styles.settingsGroup}>
            <SettingToggle
              icon={Smartphone}
              title="Autenticación biométrica"
              subtitle="Usa huella o Face ID"
              value={biometricAuth}
              onValueChange={setBiometricAuth}
            />
            <SettingItem
              icon={Shield}
              title="Cambiar contraseña"
              onPress={() => console.log('Change password')}
            />
            <SettingItem
              icon={Lock}
              title="Verificación en dos pasos"
              subtitle="Seguridad adicional"
              onPress={() => console.log('2FA settings')}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Soporte</Text>
          <View style={styles.settingsGroup}>
            <SettingItem
              icon={HelpCircle}
              title="Centro de ayuda"
              onPress={() => router.push('/help-support')}
            />
            <SettingItem
              icon={HelpCircle}
              title="Términos y condiciones"
              onPress={() => console.log('Terms')}
            />
            <SettingItem
              icon={HelpCircle}
              title="Política de privacidad"
              onPress={() => console.log('Privacy policy')}
            />
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.settingsGroup}>
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <LogOut color="#ef4444" size={20} />
              <Text style={styles.logoutText}>Cerrar sesión</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.versionText}>Versión 1.0.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  settingsGroup: {
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#e2e8f0',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1e293b',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
    color: '#64748b',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    gap: 12,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ef4444',
  },
  footer: {
    paddingVertical: 32,
    alignItems: 'center',
  },
  versionText: {
    fontSize: 14,
    color: '#94a3b8',
  },
});
