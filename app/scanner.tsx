import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform,
  Modal
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, router } from 'expo-router';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { ArrowLeft, Flashlight, FlashlightOff, CreditCard, Coins } from 'lucide-react-native';
import { useNodoX } from '@/hooks/use-nodox-store';
import { useMarketplace } from '@/hooks/use-marketplace';
import NodoXLogo from '@/components/NodoXLogo';

interface PaymentData {
  type: 'nodox_payment';
  storeId: string;
  storeName: string;
  amount: number;
  currency: 'COP';
  description?: string;
}

export default function ScannerScreen() {
  const { ncopBalance, copBalance } = useNodoX();
  const { processPhysicalStorePayment } = useMarketplace();
  const [facing] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [flashlight, setFlashlight] = useState<boolean>(false);
  const [scanned, setScanned] = useState<boolean>(false);
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState<boolean>(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'ncop' | 'fiat'>('ncop');
  const [processing, setProcessing] = useState<boolean>(false);

  if (!permission) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Cargando cámara...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.permissionContainer}>
          <Text style={styles.permissionTitle}>Acceso a la Cámara</Text>
          <Text style={styles.permissionText}>
            Necesitamos acceso a tu cámara para escanear códigos QR
          </Text>
          <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
            <Text style={styles.permissionButtonText}>Permitir Acceso</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Volver</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const handleBarCodeScanned = ({ data }: { data: string }) => {
    if (scanned) return;
    
    setScanned(true);
    console.log('QR Code scanned:', data);
    
    try {
      const qrData: PaymentData = JSON.parse(data);
      
      if (qrData.type === 'nodox_payment' && qrData.storeId && qrData.amount) {
        setPaymentData(qrData);
        setShowPaymentModal(true);
      } else {
        showError('Código QR no válido', 'Este código QR no es compatible con NodoX.');
      }
    } catch (error) {
      console.error('QR parsing error:', error);
      showError('Error', 'No se pudo leer el código QR.');
    }
  };

  const showError = (title: string, message: string) => {
    if (Platform.OS === 'web') {
      console.error(`${title}: ${message}`);
      setScanned(false);
    } else {
      Alert.alert(title, message, [{ text: 'OK', onPress: () => setScanned(false) }]);
    }
  };

  const showSuccess = (title: string, message: string) => {
    if (Platform.OS === 'web') {
      console.log(`${title}: ${message}`);
      router.back();
    } else {
      Alert.alert(title, message, [{ text: 'OK', onPress: () => router.back() }]);
    }
  };

  const processPayment = async () => {
    if (!paymentData) return;
    
    setProcessing(true);
    
    try {
      const result = await processPhysicalStorePayment(
        paymentData.storeId,
        paymentData.amount,
        selectedPaymentMethod
      );
      
      if (result.success) {
        setShowPaymentModal(false);
        const currency = selectedPaymentMethod === 'ncop' ? 'NCOP' : 'COP';
        const displayAmount = selectedPaymentMethod === 'ncop' 
          ? Math.ceil(paymentData.amount / 100)
          : paymentData.amount;
        
        showSuccess(
          'Pago Exitoso',
          `Se procesó el pago de ${displayAmount} ${currency} en ${paymentData.storeName}`
        );
      } else {
        showError('Error en el pago', result.error || 'No se pudo procesar el pago');
      }
    } catch (error) {
      console.error('Payment processing error:', error);
      showError('Error', 'Ocurrió un error inesperado. Intenta nuevamente.');
    } finally {
      setProcessing(false);
    }
  };

  const closeModal = () => {
    setShowPaymentModal(false);
    setPaymentData(null);
    setScanned(false);
  };

  const canPayWithNCOP = () => {
    if (!paymentData) return false;
    const ncopAmount = Math.ceil(paymentData.amount / 100);
    return ncopBalance >= ncopAmount;
  };

  const canPayWithCOP = () => {
    if (!paymentData) return false;
    return copBalance >= paymentData.amount;
  };

  const toggleFlashlight = () => {
    setFlashlight(!flashlight);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={() => router.back()}>
          <ArrowLeft color="#ffffff" size={24} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <NodoXLogo size="small" showText={false} style={styles.logoWhite} />
          <Text style={styles.headerTitle}>Escanear QR</Text>
        </View>
        <TouchableOpacity style={styles.headerButton} onPress={toggleFlashlight}>
          {flashlight ? (
            <FlashlightOff color="#ffffff" size={24} />
          ) : (
            <Flashlight color="#ffffff" size={24} />
          )}
        </TouchableOpacity>
      </View>

      {Platform.OS !== 'web' ? (
        <CameraView
          style={styles.camera}
          facing={facing}
          onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
          barcodeScannerSettings={{
            barcodeTypes: ['qr'],
          }}
        >
          <View style={styles.overlay}>
            <View style={styles.scanArea}>
              <View style={styles.scanFrame} />
            </View>
            <View style={styles.instructionsContainer}>
              <Text style={styles.instructions}>
                Apunta la cámara hacia el código QR del comercio
              </Text>
              <View style={styles.balanceContainer}>
                <View style={styles.balanceItem}>
                  <Text style={styles.balanceLabel}>NCOP:</Text>
                  <Text style={styles.balanceValue}>{ncopBalance.toLocaleString()}</Text>
                </View>
                <View style={styles.balanceItem}>
                  <Text style={styles.balanceLabel}>COP:</Text>
                  <Text style={styles.balanceValue}>${copBalance.toLocaleString()}</Text>
                </View>
              </View>
            </View>
          </View>
        </CameraView>
      ) : (
        <View style={styles.webFallback}>
          <Text style={styles.webFallbackText}>
            La cámara no está disponible en la versión web.
            Usa la aplicación móvil para escanear códigos QR.
          </Text>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Volver</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Payment Modal */}
      <Modal
        visible={showPaymentModal}
        transparent
        animationType="slide"
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Confirmar Pago</Text>
            
            {paymentData && (
              <>
                <View style={styles.paymentInfo}>
                  <Text style={styles.storeName}>{paymentData.storeName}</Text>
                  <Text style={styles.paymentAmount}>
                    ${paymentData.amount.toLocaleString()} COP
                  </Text>
                  {paymentData.description && (
                    <Text style={styles.paymentDescription}>
                      {paymentData.description}
                    </Text>
                  )}
                </View>

                <View style={styles.paymentMethods}>
                  <Text style={styles.paymentMethodsTitle}>Método de pago:</Text>
                  
                  <TouchableOpacity
                    style={[
                      styles.paymentMethodOption,
                      selectedPaymentMethod === 'ncop' && styles.paymentMethodSelected,
                      !canPayWithNCOP() && styles.paymentMethodDisabled
                    ]}
                    onPress={() => canPayWithNCOP() && setSelectedPaymentMethod('ncop')}
                    disabled={!canPayWithNCOP()}
                  >
                    <Coins color={selectedPaymentMethod === 'ncop' ? '#ffffff' : '#2563eb'} size={20} />
                    <View style={styles.paymentMethodText}>
                      <Text style={[
                        styles.paymentMethodTitle,
                        selectedPaymentMethod === 'ncop' && styles.paymentMethodTitleSelected,
                        !canPayWithNCOP() && styles.paymentMethodTitleDisabled
                      ]}>
                        NCOP
                      </Text>
                      <Text style={[
                        styles.paymentMethodSubtitle,
                        selectedPaymentMethod === 'ncop' && styles.paymentMethodSubtitleSelected,
                        !canPayWithNCOP() && styles.paymentMethodSubtitleDisabled
                      ]}>
                        {Math.ceil(paymentData.amount / 100)} NCOP
                      </Text>
                    </View>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.paymentMethodOption,
                      selectedPaymentMethod === 'fiat' && styles.paymentMethodSelected,
                      !canPayWithCOP() && styles.paymentMethodDisabled
                    ]}
                    onPress={() => canPayWithCOP() && setSelectedPaymentMethod('fiat')}
                    disabled={!canPayWithCOP()}
                  >
                    <CreditCard color={selectedPaymentMethod === 'fiat' ? '#ffffff' : '#2563eb'} size={20} />
                    <View style={styles.paymentMethodText}>
                      <Text style={[
                        styles.paymentMethodTitle,
                        selectedPaymentMethod === 'fiat' && styles.paymentMethodTitleSelected,
                        !canPayWithCOP() && styles.paymentMethodTitleDisabled
                      ]}>
                        Dinero tradicional
                      </Text>
                      <Text style={[
                        styles.paymentMethodSubtitle,
                        selectedPaymentMethod === 'fiat' && styles.paymentMethodSubtitleSelected,
                        !canPayWithCOP() && styles.paymentMethodSubtitleDisabled
                      ]}>
                        ${paymentData.amount.toLocaleString()} COP
                      </Text>
                    </View>
                  </TouchableOpacity>
                </View>

                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={closeModal}
                    disabled={processing}
                  >
                    <Text style={styles.cancelButtonText}>Cancelar</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[
                      styles.confirmButton,
                      processing && styles.confirmButtonDisabled
                    ]}
                    onPress={processPayment}
                    disabled={processing || (!canPayWithNCOP() && !canPayWithCOP())}
                  >
                    <Text style={styles.confirmButtonText}>
                      {processing ? 'Procesando...' : 'Pagar'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#ffffff',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  permissionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 16,
    textAlign: 'center',
  },
  permissionText: {
    fontSize: 16,
    color: '#cbd5e1',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  permissionButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  permissionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  backButton: {
    paddingHorizontal: 24,
    paddingVertical: 8,
  },
  backButtonText: {
    fontSize: 14,
    color: '#64748b',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
  },
  logoWhite: {
    tintColor: '#ffffff',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  scanArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanFrame: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderColor: '#2563eb',
    borderRadius: 12,
    backgroundColor: 'transparent',
  },
  instructionsContainer: {
    position: 'absolute',
    bottom: 100,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  instructions: {
    fontSize: 16,
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 8,
  },
  balanceContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
    marginTop: 8,
  },
  balanceItem: {
    alignItems: 'center',
  },
  balanceLabel: {
    fontSize: 12,
    color: '#9ca3af',
    marginBottom: 2,
  },
  balanceValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  webFallback: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  webFallbackText: {
    fontSize: 16,
    color: '#cbd5e1',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    textAlign: 'center',
    marginBottom: 20,
  },
  paymentInfo: {
    alignItems: 'center',
    marginBottom: 24,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  storeName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 8,
  },
  paymentAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2563eb',
    marginBottom: 8,
  },
  paymentDescription: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
  },
  paymentMethods: {
    marginBottom: 24,
  },
  paymentMethodsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 12,
  },
  paymentMethodOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: '#f8fafc',
  },
  paymentMethodSelected: {
    borderColor: '#2563eb',
    backgroundColor: '#2563eb',
  },
  paymentMethodDisabled: {
    opacity: 0.5,
    backgroundColor: '#f1f5f9',
  },
  paymentMethodText: {
    marginLeft: 12,
    flex: 1,
  },
  paymentMethodTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 2,
  },
  paymentMethodTitleSelected: {
    color: '#ffffff',
  },
  paymentMethodTitleDisabled: {
    color: '#94a3b8',
  },
  paymentMethodSubtitle: {
    fontSize: 14,
    color: '#64748b',
  },
  paymentMethodSubtitleSelected: {
    color: '#e0e7ff',
  },
  paymentMethodSubtitleDisabled: {
    color: '#94a3b8',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748b',
  },
  confirmButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: '#10b981',
    alignItems: 'center',
  },
  confirmButtonDisabled: {
    backgroundColor: '#94a3b8',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
});