import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, router } from 'expo-router';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { ArrowLeft, Flashlight, FlashlightOff } from 'lucide-react-native';
import { useNodoX } from '@/hooks/use-nodox-store';
import NodoXLogo from '@/components/NodoXLogo';

export default function ScannerScreen() {
  const { ncopBalance, spendNcop } = useNodoX();
  const [facing] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [flashlight, setFlashlight] = useState<boolean>(false);
  const [scanned, setScanned] = useState<boolean>(false);

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
      const qrData = JSON.parse(data);
      
      if (qrData.type === 'payment' && qrData.amount) {
        Alert.alert(
          'Confirmar Pago',
          `¿Deseas pagar $${qrData.amount.toLocaleString()} a ${qrData.merchantName || 'este comercio'}?`,
          [
            {
              text: 'Cancelar',
              style: 'cancel',
              onPress: () => setScanned(false),
            },
            {
              text: 'Pagar',
              onPress: () => {
                if (ncopBalance >= qrData.amount) {
                  spendNcop(qrData.amount);
                  Alert.alert('Éxito', 'Pago realizado correctamente');
                  router.back();
                } else {
                  Alert.alert('Error', 'Saldo insuficiente');
                  setScanned(false);
                }
              },
            },
          ]
        );
      } else {
        Alert.alert('Código QR no válido', 'Este código QR no es válido para pagos');
        setScanned(false);
      }
    } catch {
      Alert.alert('Error', 'No se pudo procesar el código QR');
      setScanned(false);
    }
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
                Apunta la cámara hacia el código QR
              </Text>
              <Text style={styles.balanceInfo}>
                Saldo disponible: {ncopBalance.toLocaleString()} NCOP
              </Text>
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
  balanceInfo: {
    fontSize: 14,
    color: '#cbd5e1',
    textAlign: 'center',
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
});