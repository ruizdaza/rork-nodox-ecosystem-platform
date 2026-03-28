import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { X, CreditCard, MapPin, Check } from 'lucide-react-native';
import { useMarketplace } from '@/hooks/use-marketplace';
import { useNodoX } from '@/hooks/use-nodox-store';

type PaymentMethod = 'ncop' | 'fiat' | 'mixed';

export default function CheckoutScreen() {
  const { cart, clearCart } = useMarketplace();
  const { ncopBalance } = useNodoX();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('ncop');
  const [address, setAddress] = useState<string>('');
  const [city, setCity] = useState<string>('');
  const [postalCode, setPostalCode] = useState<string>('');
  const [phone, setPhone] = useState<string>('');

  const canPayWithNcop = ncopBalance >= cart.ncopTotal;

  const handlePlaceOrder = () => {
    if (!address || !city || !postalCode || !phone) {
      Alert.alert('Error', 'Por favor completa todos los campos de envío');
      return;
    }

    if (paymentMethod === 'ncop' && !canPayWithNcop) {
      Alert.alert(
        'Saldo insuficiente',
        'No tienes suficientes NCOP para completar esta compra'
      );
      return;
    }

    Alert.alert(
      'Confirmar pedido',
      `¿Deseas confirmar tu pedido por $${cart.total.toLocaleString()} COP?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          onPress: () => {
            console.log('Order placed with payment method:', paymentMethod);
            clearCart();
            Alert.alert(
              'Pedido confirmado',
              'Tu pedido ha sido procesado exitosamente',
              [
                {
                  text: 'Ver pedidos',
                  onPress: () => router.replace('/(tabs)'),
                },
              ]
            );
          },
        },
      ]
    );
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
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dirección de envío</Text>
          <View style={styles.form}>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Dirección</Text>
              <TextInput
                style={styles.input}
                placeholder="Calle y número"
                value={address}
                onChangeText={setAddress}
              />
            </View>
            <View style={styles.formRow}>
              <View style={[styles.formGroup, styles.formGroupHalf]}>
                <Text style={styles.label}>Ciudad</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ciudad"
                  value={city}
                  onChangeText={setCity}
                />
              </View>
              <View style={[styles.formGroup, styles.formGroupHalf]}>
                <Text style={styles.label}>Código postal</Text>
                <TextInput
                  style={styles.input}
                  placeholder="00000"
                  value={postalCode}
                  onChangeText={setPostalCode}
                  keyboardType="numeric"
                />
              </View>
            </View>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Teléfono</Text>
              <TextInput
                style={styles.input}
                placeholder="+57 300 000 0000"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
              />
            </View>
          </View>
        </View>

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
                <Text style={styles.paymentSubtitle}>
                  Saldo: {ncopBalance} NCOP
                </Text>
                {!canPayWithNcop && (
                  <Text style={styles.insufficientText}>Saldo insuficiente</Text>
                )}
              </View>
            </View>
            {paymentMethod === 'ncop' && (
              <Check color="#2563eb" size={20} />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.paymentOption,
              paymentMethod === 'fiat' && styles.selectedPayment,
            ]}
            onPress={() => setPaymentMethod('fiat')}
          >
            <View style={styles.paymentOptionContent}>
              <View style={styles.paymentIconContainer}>
                <CreditCard color="#2563eb" size={20} />
              </View>
              <View style={styles.paymentInfo}>
                <Text style={styles.paymentTitle}>Tarjeta de crédito/débito</Text>
                <Text style={styles.paymentSubtitle}>Pago con tarjeta</Text>
              </View>
            </View>
            {paymentMethod === 'fiat' && (
              <Check color="#2563eb" size={20} />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.paymentOption,
              paymentMethod === 'mixed' && styles.selectedPayment,
            ]}
            onPress={() => setPaymentMethod('mixed')}
          >
            <View style={styles.paymentOptionContent}>
              <View style={styles.paymentIconContainer}>
                <Text style={styles.paymentIcon}>💳</Text>
              </View>
              <View style={styles.paymentInfo}>
                <Text style={styles.paymentTitle}>Pago mixto</Text>
                <Text style={styles.paymentSubtitle}>
                  Combina NCOP y tarjeta
                </Text>
              </View>
            </View>
            {paymentMethod === 'mixed' && (
              <Check color="#2563eb" size={20} />
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Resumen del pedido</Text>
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Productos ({cart.totalItems})</Text>
              <Text style={styles.summaryValue}>
                ${cart.subtotal.toLocaleString()}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Envío</Text>
              <Text style={styles.summaryValue}>
                {cart.shipping === 0 ? 'Gratis' : `$${cart.shipping.toLocaleString()}`}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>IVA</Text>
              <Text style={styles.summaryValue}>
                ${cart.tax.toLocaleString()}
              </Text>
            </View>
            <View style={[styles.summaryRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total</Text>
              <View>
                <Text style={styles.totalValue}>
                  ${cart.total.toLocaleString()}
                </Text>
                {paymentMethod === 'ncop' && (
                  <Text style={styles.totalNcop}>
                    {cart.ncopTotal} NCOP
                  </Text>
                )}
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.placeOrderButton}
          onPress={handlePlaceOrder}
        >
          <Text style={styles.placeOrderText}>Realizar pedido</Text>
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
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  form: {
    paddingHorizontal: 20,
  },
  formGroup: {
    marginBottom: 16,
  },
  formRow: {
    flexDirection: 'row',
    gap: 12,
  },
  formGroupHalf: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#475569',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1e293b',
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
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
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
  totalNcop: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2563eb',
    textAlign: 'right',
    marginTop: 4,
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
  placeOrderText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
});
