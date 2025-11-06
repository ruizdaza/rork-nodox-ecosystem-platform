import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import {
  ArrowLeft,
  Shield,
  Bell,
  DollarSign,
  Lock,
  AlertCircle,
  Settings2,
  RefreshCw,
} from 'lucide-react-native';
import { useWallet } from '@/hooks/use-wallet';

export default function WalletSettingsScreen() {
  const { settings, updateSettings, syncWithBackend, isSyncing } = useWallet();
  
  const [localSettings, setLocalSettings] = useState(settings);

  const handleSave = async () => {
    try {
      await updateSettings(localSettings);
      Alert.alert('Éxito', 'Configuración guardada correctamente');
      router.back();
    } catch (error) {
      Alert.alert('Error', 'No se pudo guardar la configuración');
    }
  };

  const handleSync = async () => {
    try {
      await syncWithBackend();
      Alert.alert('Éxito', 'Wallet sincronizada con el servidor');
    } catch (error) {
      Alert.alert('Error', 'No se pudo sincronizar');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft color="#1e293b" size={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Configuración de Wallet</Text>
          <TouchableOpacity
            style={styles.syncButton}
            onPress={handleSync}
            disabled={isSyncing}
          >
            <RefreshCw color="#2563eb" size={20} />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Shield color="#2563eb" size={20} />
            <Text style={styles.sectionTitle}>Seguridad</Text>
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Lock color="#64748b" size={18} />
              <View style={styles.settingText}>
                <Text style={styles.settingLabel}>PIN para transacciones</Text>
                <Text style={styles.settingDescription}>
                  Requerir PIN para cada transacción
                </Text>
              </View>
            </View>
            <Switch
              value={localSettings.requirePinForTransactions}
              onValueChange={(value) =>
                setLocalSettings({ ...localSettings, requirePinForTransactions: value })
              }
              trackColor={{ false: '#cbd5e1', true: '#2563eb' }}
              thumbColor="#ffffff"
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <AlertCircle color="#64748b" size={18} />
              <View style={styles.settingText}>
                <Text style={styles.settingLabel}>Confirmar transacciones grandes</Text>
                <Text style={styles.settingDescription}>
                  Requiere confirmación adicional
                </Text>
              </View>
            </View>
            <Switch
              value={localSettings.requireConfirmationForLargeTransactions}
              onValueChange={(value) =>
                setLocalSettings({
                  ...localSettings,
                  requireConfirmationForLargeTransactions: value,
                })
              }
              trackColor={{ false: '#cbd5e1', true: '#2563eb' }}
              thumbColor="#ffffff"
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <DollarSign color="#64748b" size={18} />
              <View style={styles.settingText}>
                <Text style={styles.settingLabel}>Umbral de transacción grande</Text>
                <Text style={styles.settingDescription}>
                  Monto en COP que requiere confirmación
                </Text>
              </View>
            </View>
            <TextInput
              style={styles.input}
              value={localSettings.largeTransactionThreshold.toString()}
              onChangeText={(text) =>
                setLocalSettings({
                  ...localSettings,
                  largeTransactionThreshold: parseInt(text) || 0,
                })
              }
              keyboardType="numeric"
              placeholder="500000"
            />
          </View>

          <View style={styles.infoBox}>
            <Settings2 color="#3b82f6" size={16} />
            <Text style={styles.infoText}>
              Nivel de seguridad: <Text style={styles.infoHighlight}>{localSettings.securityLevel}</Text>
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Bell color="#2563eb" size={20} />
            <Text style={styles.sectionTitle}>Notificaciones</Text>
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <View style={styles.settingText}>
                <Text style={styles.settingLabel}>Notificaciones de transacciones</Text>
                <Text style={styles.settingDescription}>
                  Recibir alertas de movimientos
                </Text>
              </View>
            </View>
            <Switch
              value={localSettings.notificationsEnabled}
              onValueChange={(value) =>
                setLocalSettings({ ...localSettings, notificationsEnabled: value })
              }
              trackColor={{ false: '#cbd5e1', true: '#2563eb' }}
              thumbColor="#ffffff"
            />
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <RefreshCw color="#2563eb" size={20} />
            <Text style={styles.sectionTitle}>Conversión Automática</Text>
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <View style={styles.settingText}>
                <Text style={styles.settingLabel}>Conversión automática</Text>
                <Text style={styles.settingDescription}>
                  Convertir automáticamente entre NCOP y COP
                </Text>
              </View>
            </View>
            <Switch
              value={localSettings.autoConvertEnabled}
              onValueChange={(value) =>
                setLocalSettings({ ...localSettings, autoConvertEnabled: value })
              }
              trackColor={{ false: '#cbd5e1', true: '#2563eb' }}
              thumbColor="#ffffff"
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <View style={styles.settingText}>
                <Text style={styles.settingLabel}>Moneda preferida</Text>
                <Text style={styles.settingDescription}>
                  Moneda principal para mostrar
                </Text>
              </View>
            </View>
            <View style={styles.segmentControl}>
              <TouchableOpacity
                style={[
                  styles.segmentButton,
                  localSettings.preferredCurrency === 'NCOP' && styles.segmentButtonActive,
                ]}
                onPress={() =>
                  setLocalSettings({ ...localSettings, preferredCurrency: 'NCOP' })
                }
              >
                <Text
                  style={[
                    styles.segmentButtonText,
                    localSettings.preferredCurrency === 'NCOP' &&
                      styles.segmentButtonTextActive,
                  ]}
                >
                  NCOP
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.segmentButton,
                  localSettings.preferredCurrency === 'COP' && styles.segmentButtonActive,
                ]}
                onPress={() =>
                  setLocalSettings({ ...localSettings, preferredCurrency: 'COP' })
                }
              >
                <Text
                  style={[
                    styles.segmentButtonText,
                    localSettings.preferredCurrency === 'COP' &&
                      styles.segmentButtonTextActive,
                  ]}
                >
                  COP
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <DollarSign color="#2563eb" size={20} />
            <Text style={styles.sectionTitle}>Límites Diarios</Text>
          </View>

          <View style={styles.limitItem}>
            <Text style={styles.limitLabel}>Límite de envío diario</Text>
            <TextInput
              style={styles.limitInput}
              value={localSettings.dailyLimits.send.toString()}
              onChangeText={(text) =>
                setLocalSettings({
                  ...localSettings,
                  dailyLimits: {
                    ...localSettings.dailyLimits,
                    send: parseInt(text) || 0,
                  },
                })
              }
              keyboardType="numeric"
              placeholder="5000000"
            />
          </View>

          <View style={styles.limitItem}>
            <Text style={styles.limitLabel}>Límite de recarga diario</Text>
            <TextInput
              style={styles.limitInput}
              value={localSettings.dailyLimits.recharge.toString()}
              onChangeText={(text) =>
                setLocalSettings({
                  ...localSettings,
                  dailyLimits: {
                    ...localSettings.dailyLimits,
                    recharge: parseInt(text) || 0,
                  },
                })
              }
              keyboardType="numeric"
              placeholder="10000000"
            />
          </View>

          <View style={styles.limitItem}>
            <Text style={styles.limitLabel}>Límite de retiro diario</Text>
            <TextInput
              style={styles.limitInput}
              value={localSettings.dailyLimits.withdraw.toString()}
              onChangeText={(text) =>
                setLocalSettings({
                  ...localSettings,
                  dailyLimits: {
                    ...localSettings.dailyLimits,
                    withdraw: parseInt(text) || 0,
                  },
                })
              }
              keyboardType="numeric"
              placeholder="2000000"
            />
          </View>
        </View>

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Guardar Configuración</Text>
        </TouchableOpacity>

        <View style={styles.bottomPadding} />
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 16,
  },
  syncButton: {
    padding: 8,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginHorizontal: 20,
    marginBottom: 8,
    borderRadius: 12,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  settingText: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 12,
    color: '#64748b',
  },
  input: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    fontSize: 14,
    color: '#1e293b',
    minWidth: 100,
    textAlign: 'right',
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#eff6ff',
    marginHorizontal: 20,
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  infoText: {
    fontSize: 12,
    color: '#1e40af',
    flex: 1,
  },
  infoHighlight: {
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  segmentControl: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    padding: 2,
  },
  segmentButton: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 6,
  },
  segmentButtonActive: {
    backgroundColor: '#2563eb',
  },
  segmentButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
  },
  segmentButtonTextActive: {
    color: '#ffffff',
  },
  limitItem: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginHorizontal: 20,
    marginBottom: 8,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  limitLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1e293b',
    flex: 1,
  },
  limitInput: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    fontSize: 14,
    color: '#1e293b',
    minWidth: 120,
    textAlign: 'right',
  },
  saveButton: {
    backgroundColor: '#2563eb',
    marginHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 24,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  bottomPadding: {
    height: 40,
  },
});
