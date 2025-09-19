import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, router } from 'expo-router';
import { 
  ArrowLeft, 
  CreditCard,
  MapPin,
  Truck,
  CheckCircle,
  Loader2
} from 'lucide-react-native';
import { useMarketplace } from '@/hooks/use-marketplace';

export default function CheckoutScreen() {
  const { cart, processPayment, processingPayment, getPaymentOptions, ncopBalance, copBalance } = useMarketplace();
  const [paymentMethod, setPaymentMethod] = useState<'ncop' | 'fiat' | 'mixed'>('ncop');
  const [ncopAmount, setNcopAmount] = useState<number>(0);
  const [shippingAddress, setShippingAddress] = useState({
    name: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    phone: ''
  });
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  
  const paymentOptions = getPaymentOptions();

  const handlePlaceOrder = async () => {
    // Validate form
    if (!shippingAddress.name || !shippingAddress.street || !shippingAddress.city) {
      Alert.alert('Error', 'Por favor completa todos los campos requeridos');
      return;
    }

    // Validate payment method availability
    if (paymentMethod === 'ncop' && !paymentOptions.ncop) {
      Alert.alert('Error', 'Saldo NCOP insuficiente para este pedido');
      return;
    }
    
    if (paymentMethod === 'fiat' && !paymentOptions.fiat) {
      Alert.alert('Error', 'Saldo COP insuficiente para este pedido');
      return;
    }

    setIsProcessing(true);
    
    try {
      const result = await processPayment(paymentMethod, paymentMethod === 'mixed' ? ncopAmount : undefined);
      
      if (result.success) {
        Alert.alert(
          '¡Pedido realizado!',
          'Tu pedido ha sido procesado exitosamente. Recibirás un email de confirmación.',
          [
            {
              text: 'OK',
              onPress: () => {
                router.push('/(tabs)/marketplace');
              }
            }
          ]
        );
      } else {
        Alert.alert('Error en el pago', result.error || 'No se pudo procesar el pago');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      Alert.alert('Error', 'Ocurrió un error inesperado. Intenta nuevamente.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (cart.items.length === 0) {
    router.replace('/(tabs)/marketplace');
    return null;
  }

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.headerButton}
          onPress={() => router.back()}
        >
          <ArrowLeft color="#1e293b" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Checkout</Text>
        <View style={styles.headerButton} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Shipping Address */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MapPin color="#2563eb" size={20} />
            <Text style={styles.sectionTitle}>Dirección de envío</Text>
          </View>
          
          <View style={styles.form}>
            <TextInput
              style={styles.input}
              placeholder="Nombre completo *"
              value={shippingAddress.name}
              onChangeText={(text) => setShippingAddress(prev => ({ ...prev, name: text }))}
            />
            <TextInput
              style={styles.input}
              placeholder="Dirección *"
              value={shippingAddress.street}
              onChangeText={(text) => setShippingAddress(prev => ({ ...prev, street: text }))}
            />
            <View style={styles.row}>
              <TextInput
                style={[styles.input, styles.halfInput]}
                placeholder="Ciudad *"
                value={shippingAddress.city}
                onChangeText={(text) => setShippingAddress(prev => ({ ...prev, city: text }))}
              />
              <TextInput
                style={[styles.input, styles.halfInput]}
                placeholder="Estado"
                value={shippingAddress.state}
                onChangeText={(text) => setShippingAddress(prev => ({ ...prev, state: text }))}
              />
            </View>
            <View style={styles.row}>
              <TextInput
                style={[styles.input, styles.halfInput]}
                placeholder="Código postal"
                value={shippingAddress.zipCode}
                onChangeText={(text) => setShippingAddress(prev => ({ ...prev, zipCode: text }))}
              />
              <TextInput
                style={[styles.input, styles.halfInput]}
                placeholder="Teléfono"
                value={shippingAddress.phone}
                onChangeText={(text) => setShippingAddress(prev => ({ ...prev, phone: text }))}
                keyboardType="phone-pad"
              />
            </View>
          </View>
        </View>

        {/* Payment Method */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <CreditCard color="#2563eb" size={20} />
            <Text style={styles.sectionTitle}>Método de pago</Text>
          </View>
          
          <View style={styles.paymentMethods}>
            <TouchableOpacity
              style={[
                styles.paymentMethod,
                paymentMethod === 'ncop' && styles.paymentMethodActive,
                !paymentOptions.ncop && styles.paymentMethodDisabled
              ]}
              onPress={() => paymentOptions.ncop && setPaymentMethod('ncop')}
              disabled={!paymentOptions.ncop}
            >
              <View style={styles.paymentMethodContent}>
                <Text style={[styles.paymentMethodTitle, !paymentOptions.ncop && styles.paymentMethodTitleDisabled]}>NCOP</Text>
                <Text style={[styles.paymentMethodSubtitle, !paymentOptions.ncop && styles.paymentMethodSubtitleDisabled]}>
                  Pagar con tokens NCOP
                </Text>
                <Text style={[styles.paymentMethodBalance, !paymentOptions.ncop && styles.paymentMethodBalanceDisabled]}>
                  Disponible: {ncopBalance.toLocaleString()} NCOP
                </Text>
              </View>
              <Text style={[styles.paymentMethodPrice, !paymentOptions.ncop && styles.paymentMethodPriceDisabled]}>
                {cart.ncopTotal.toFixed(2)} NCOP
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.paymentMethod,
                paymentMethod === 'fiat' && styles.paymentMethodActive,
                !paymentOptions.fiat && styles.paymentMethodDisabled
              ]}
              onPress={() => paymentOptions.fiat && setPaymentMethod('fiat')}
              disabled={!paymentOptions.fiat}
            >
              <View style={styles.paymentMethodContent}>
                <Text style={[styles.paymentMethodTitle, !paymentOptions.fiat && styles.paymentMethodTitleDisabled]}>Dinero tradicional</Text>
                <Text style={[styles.paymentMethodSubtitle, !paymentOptions.fiat && styles.paymentMethodSubtitleDisabled]}>
                  Pagar con saldo COP
                </Text>
                <Text style={[styles.paymentMethodBalance, !paymentOptions.fiat && styles.paymentMethodBalanceDisabled]}>
                  Disponible: ${copBalance.toLocaleString()}
                </Text>
              </View>
              <Text style={[styles.paymentMethodPrice, !paymentOptions.fiat && styles.paymentMethodPriceDisabled]}>
                ${cart.total.toFixed(2)}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.paymentMethod,
                paymentMethod === 'mixed' && styles.paymentMethodActive,
                !paymentOptions.mixed && styles.paymentMethodDisabled
              ]}
              onPress={() => paymentOptions.mixed && setPaymentMethod('mixed')}
              disabled={!paymentOptions.mixed}
            >
              <View style={styles.paymentMethodContent}>
                <Text style={[styles.paymentMethodTitle, !paymentOptions.mixed && styles.paymentMethodTitleDisabled]}>Pago mixto</Text>
                <Text style={[styles.paymentMethodSubtitle, !paymentOptions.mixed && styles.paymentMethodSubtitleDisabled]}>
                  Combinar NCOP y dinero tradicional
                </Text>
              </View>
              <Text style={[styles.paymentMethodPrice, !paymentOptions.mixed && styles.paymentMethodPriceDisabled]}>
                Personalizar
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Mixed Payment Controls */}
        {paymentMethod === 'mixed' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Configurar Pago Mixto</Text>
            <View style={styles.mixedPaymentControls}>
              <View style={styles.mixedPaymentInput}>
                <Text style={styles.mixedPaymentLabel}>Cantidad NCOP:</Text>
                <TextInput
                  style={styles.mixedPaymentTextInput}
                  value={ncopAmount.toString()}
                  onChangeText={(text) => {
                    const amount = parseFloat(text) || 0;
                    setNcopAmount(Math.min(amount, Math.min(ncopBalance, cart.ncopTotal)));
                  }}
                  keyboardType="numeric"
                  placeholder="0"
                />
                <Text style={styles.mixedPaymentMax}>
                  Máx: {Math.min(ncopBalance, cart.ncopTotal).toFixed(2)}
                </Text>
              </View>
              <View style={styles.mixedPaymentSummary}>
                <Text style={styles.mixedPaymentSummaryText}>
                  NCOP: {ncopAmount.toFixed(2)} • COP: ${(cart.total - (ncopAmount * 100)).toFixed(2)}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Order Summary */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Truck color="#2563eb" size={20} />
            <Text style={styles.sectionTitle}>Resumen del pedido</Text>
          </View>
          
          <View style={styles.orderSummary}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>
                Productos ({cart.totalItems})
              </Text>
              <Text style={styles.summaryValue}>
                ${cart.subtotal.toFixed(2)}
              </Text>
            </View>
            
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Envío</Text>
              <Text style={styles.summaryValue}>
                {cart.shipping === 0 ? 'Gratis' : `$${cart.shipping.toFixed(2)}`}
              </Text>
            </View>
            
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Impuestos</Text>
              <Text style={styles.summaryValue}>
                ${cart.tax.toFixed(2)}
              </Text>
            </View>
            
            <View style={styles.summaryDivider} />
            
            <View style={styles.summaryRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <View style={styles.totalPrices}>
                <Text style={styles.totalValue}>
                  ${cart.total.toFixed(2)}
                </Text>
                <Text style={styles.totalValueNcop}>
                  {cart.ncopTotal.toFixed(2)} NCOP
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Order Items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Productos en tu pedido</Text>
          <View style={styles.orderItems}>
            {cart.items.map((item) => (
              <View key={item.id} style={styles.orderItem}>
                <Text style={styles.itemName} numberOfLines={1}>
                  {item.product.name}
                </Text>
                <Text style={styles.itemQuantity}>
                  Cantidad: {item.quantity}
                </Text>
                <Text style={styles.itemPrice}>
                  ${(item.variant?.price || item.product.price) * item.quantity}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Place Order Button */}
      <View style={styles.checkoutContainer}>
        <TouchableOpacity 
          style={[styles.placeOrderButton, (isProcessing || processingPayment) && styles.placeOrderButtonDisabled]}
          onPress={handlePlaceOrder}
          disabled={isProcessing || processingPayment}
        >
          {(isProcessing || processingPayment) ? (
            <>
              <Loader2 color="#ffffff" size={20} />
              <Text style={styles.placeOrderText}>Procesando...</Text>
            </>
          ) : (
            <>
              <CheckCircle color="#ffffff" size={20} />
              <Text style={styles.placeOrderText}>
                Realizar pedido - {paymentMethod === 'ncop' 
                  ? `${cart.ncopTotal.toFixed(2)} NCOP` 
                  : paymentMethod === 'mixed'
                  ? `${ncopAmount.toFixed(2)} NCOP + $${(cart.total - (ncopAmount * 100)).toFixed(2)}`
                  : `$${cart.total.toFixed(2)}`}
              </Text>
            </>
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
  headerButton: {
    padding: 4,
    width: 32,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  content: {
    flex: 1,
  },
  section: {
    backgroundColor: '#ffffff',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
  },
  form: {
    gap: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1e293b',
    backgroundColor: '#ffffff',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfInput: {
    flex: 1,
  },
  paymentMethods: {
    gap: 12,
  },
  paymentMethod: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    backgroundColor: '#f8fafc',
  },
  paymentMethodActive: {
    borderColor: '#2563eb',
    backgroundColor: '#eff6ff',
  },
  paymentMethodDisabled: {
    opacity: 0.5,
    backgroundColor: '#f1f5f9',
  },
  paymentMethodContent: {
    flex: 1,
  },
  paymentMethodTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  paymentMethodTitleDisabled: {
    color: '#94a3b8',
  },
  paymentMethodSubtitle: {
    fontSize: 14,
    color: '#64748b',
  },
  paymentMethodSubtitleDisabled: {
    color: '#94a3b8',
  },
  paymentMethodBalance: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  paymentMethodBalanceDisabled: {
    color: '#94a3b8',
  },
  paymentMethodPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2563eb',
  },
  paymentMethodPriceDisabled: {
    color: '#94a3b8',
  },
  mixedPaymentControls: {
    gap: 12,
  },
  mixedPaymentInput: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  mixedPaymentLabel: {
    fontSize: 14,
    color: '#374151',
    minWidth: 100,
  },
  mixedPaymentTextInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    backgroundColor: '#ffffff',
  },
  mixedPaymentMax: {
    fontSize: 12,
    color: '#64748b',
    minWidth: 80,
  },
  mixedPaymentSummary: {
    backgroundColor: '#eff6ff',
    padding: 12,
    borderRadius: 8,
  },
  mixedPaymentSummaryText: {
    fontSize: 14,
    color: '#2563eb',
    fontWeight: '500',
    textAlign: 'center',
  },
  orderSummary: {
    gap: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  summaryDivider: {
    height: 1,
    backgroundColor: '#e2e8f0',
    marginVertical: 8,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
  },
  totalPrices: {
    alignItems: 'flex-end',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  totalValueNcop: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2563eb',
  },
  orderItems: {
    marginTop: 12,
    gap: 12,
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  itemName: {
    flex: 2,
    fontSize: 14,
    color: '#1e293b',
    fontWeight: '500',
  },
  itemQuantity: {
    flex: 1,
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
  },
  itemPrice: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    textAlign: 'right',
  },
  checkoutContainer: {
    padding: 20,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  placeOrderButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10b981',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  placeOrderButtonDisabled: {
    backgroundColor: '#94a3b8',
  },
  placeOrderText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});