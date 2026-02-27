import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { X, CreditCard, MapPin, Check, ChevronRight } from 'lucide-react-native';
import { useMarketplace } from '@/hooks/use-marketplace';
import { useNodoX } from '@/hooks/use-nodox-store';
import { trpc } from '@/lib/trpc';
import { NcopDisplay } from '@/components/NcopDisplay';

type PaymentMethod = 'ncop' | 'fiat' | 'mixed';

export default function CheckoutScreen() {
  const { cart, clearCart, processPayment, processingPayment } = useMarketplace();
  const { ncopBalance } = useNodoX();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('ncop');

  // Address State
  const { data: addresses, isLoading: loadingAddresses } = trpc.user.getAddresses.useQuery({});
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);

  const selectedAddress = addresses?.find(a => a.id === selectedAddressId) || addresses?.find(a => a.isDefault);

  const canPayWithNcop = ncopBalance >= cart.ncopTotal;

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      Alert.alert('Error', 'Por favor selecciona una dirección de envío');
      return;
    }

    if (paymentMethod === 'ncop' && !canPayWithNcop) {
      Alert.alert('Saldo insuficiente', 'No tienes suficientes NCOP');
      return;
    }

    // Process Payment passing selected address
    const result = await processPayment(paymentMethod, selectedAddress);

    if (result.success) {
        Alert.alert(
            'Pedido confirmado',
            'Tu pedido ha sido procesado exitosamente',
            [{ text: 'Ver pedidos', onPress: () => router.replace('/(tabs)') }]
        );
    } else {
        Alert.alert('Error', result.error || 'No se pudo procesar el pedido');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Finalizar compra</Text>
        <TouchableOpacity style={styles.closeButton} onPress={() => router.back()}>
          <X color="#1e293b" size={24} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>

        {/* Address Selection */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Dirección de envío</Text>
            <TouchableOpacity onPress={() => router.push('/addresses')}>
                <Text style={styles.linkText}>Gestionar</Text>
            </TouchableOpacity>
          </View>

          {loadingAddresses ? (
              <ActivityIndicator color="#2563eb" />
          ) : addresses && addresses.length > 0 ? (
              selectedAddress ? (
                <TouchableOpacity style={styles.addressCard} onPress={() => router.push('/addresses')}>
                    <MapPin color="#2563eb" size={24} />
                    <View style={styles.addressInfo}>
                        <Text style={styles.addressName}>{selectedAddress.name}</Text>
                        <Text style={styles.addressText}>{selectedAddress.street}, {selectedAddress.city}</Text>
                    </View>
                    <ChevronRight color="#94a3b8" size={20} />
                </TouchableOpacity>
              ) : (
                <TouchableOpacity style={styles.addAddressButton} onPress={() => router.push('/addresses')}>
                    <Text style={styles.addAddressText}>Seleccionar dirección</Text>
                </TouchableOpacity>
              )
          ) : (
              <TouchableOpacity style={styles.addAddressButton} onPress={() => router.push('/addresses/new')}>
                  <Text style={styles.addAddressText}>+ Agregar nueva dirección</Text>
              </TouchableOpacity>
          )}
        </View>

        {/* Payment Method */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Método de pago</Text>
          <TouchableOpacity
            style={[
              styles.paymentOption,
              paymentMethod === 'ncop' && styles.selectedPayment,
              !canPayWithNcop && styles.disabledPayment,
            ]}
            onPress={() => canPayWithNcop && setPaymentMethod('ncop')}
            disabled={!canPayWithNcop}
          >
            <View style={styles.paymentOptionContent}>
              <View style={styles.paymentIconContainer}>
                <Text style={styles.paymentIcon}>⚡</Text>
              </View>
              <View style={styles.paymentInfo}>
                <Text style={styles.paymentTitle}>NCOP</Text>
                <Text style={styles.paymentSubtitle}>Saldo: {ncopBalance.toLocaleString()} NCOP</Text>
                {!canPayWithNcop && <Text style={styles.insufficientText}>Saldo insuficiente</Text>}
              </View>
            </View>
            {paymentMethod === 'ncop' && <Check color="#2563eb" size={20} />}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.paymentOption, paymentMethod === 'fiat' && styles.selectedPayment]}
            onPress={() => setPaymentMethod('fiat')}
          >
            <View style={styles.paymentOptionContent}>
              <View style={styles.paymentIconContainer}><CreditCard color="#2563eb" size={20} /></View>
              <View style={styles.paymentInfo}>
                <Text style={styles.paymentTitle}>Tarjeta / PSE</Text>
                <Text style={styles.paymentSubtitle}>Pago en Pesos (COP)</Text>
              </View>
            </View>
            {paymentMethod === 'fiat' && <Check color="#2563eb" size={20} />}
          </TouchableOpacity>
        </View>

        {/* Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Resumen del pedido</Text>
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Productos ({cart.totalItems})</Text>
              <Text style={styles.summaryValue}>${cart.subtotal.toLocaleString()}</Text>
            </View>
            <View style={[styles.summaryRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total a Pagar</Text>
              <View style={{ alignItems: 'flex-end' }}>
                {paymentMethod === 'ncop' ? (
                    <NcopDisplay value={cart.ncopTotal} showCop={true} />
                ) : (
                    <Text style={styles.totalValue}>${cart.total.toLocaleString()} COP</Text>
                )}
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.placeOrderButton, processingPayment && styles.disabledButton]}
          onPress={handlePlaceOrder}
          disabled={processingPayment}
        >
          {processingPayment ? (
              <ActivityIndicator color="white" />
          ) : (
              <Text style={styles.placeOrderText}>Confirmar Pedido</Text>
          )}
        </TouchableOpacity>
      </View>
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
    fontSize: 20,
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
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
  },
  linkText: {
    color: '#2563eb',
    fontWeight: '600',
  },
  addressCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  addressInfo: {
    flex: 1,
    marginLeft: 12,
  },
  addressName: {
    fontWeight: '600',
    color: '#1e293b',
  },
  addressText: {
    color: '#64748b',
    fontSize: 13,
  },
  addAddressButton: {
    padding: 16,
    backgroundColor: '#eff6ff',
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#bfdbfe',
    borderStyle: 'dashed',
  },
  addAddressText: {
    color: '#2563eb',
    fontWeight: '600',
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    marginBottom: 12,
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e2e8f0',
  },
  selectedPayment: {
    borderColor: '#2563eb',
    backgroundColor: '#eff6ff',
  },
  disabledPayment: {
    opacity: 0.5,
  },
  paymentOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  paymentIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  paymentIcon: {
    fontSize: 24,
  },
  paymentInfo: {
    flex: 1,
  },
  paymentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  paymentSubtitle: {
    fontSize: 14,
    color: '#64748b',
  },
  insufficientText: {
    fontSize: 12,
    color: '#ef4444',
    marginTop: 2,
  },
  summaryCard: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 40,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#64748b',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1e293b',
  },
  totalRow: {
    marginTop: 8,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
  },
  totalValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    textAlign: 'right',
  },
  footer: {
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  placeOrderButton: {
    backgroundColor: '#2563eb',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#94a3b8',
  },
  placeOrderText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
});
