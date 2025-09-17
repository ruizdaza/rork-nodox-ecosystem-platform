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
  CheckCircle
} from 'lucide-react-native';
import { useMarketplace } from '@/hooks/use-marketplace';

export default function CheckoutScreen() {
  const { cart, clearCart } = useMarketplace();
  const [paymentMethod, setPaymentMethod] = useState<'ncop' | 'fiat' | 'mixed'>('ncop');
  const [shippingAddress, setShippingAddress] = useState({
    name: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    phone: ''
  });

  const handlePlaceOrder = () => {
    // Validate form
    if (!shippingAddress.name || !shippingAddress.street || !shippingAddress.city) {
      Alert.alert('Error', 'Por favor completa todos los campos requeridos');
      return;
    }

    // Simulate order placement
    Alert.alert(
      'Pedido realizado',
      'Tu pedido ha sido procesado exitosamente. Recibirás un email de confirmación.',
      [
        {
          text: 'OK',
          onPress: () => {
            clearCart();
            router.push('/(tabs)/marketplace');
          }
        }
      ]
    );
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
                paymentMethod === 'ncop' && styles.paymentMethodActive
              ]}
              onPress={() => setPaymentMethod('ncop')}
            >
              <View style={styles.paymentMethodContent}>
                <Text style={styles.paymentMethodTitle}>NCOP</Text>
                <Text style={styles.paymentMethodSubtitle}>
                  Pagar con tokens NCOP
                </Text>
              </View>
              <Text style={styles.paymentMethodPrice}>
                {cart.ncopTotal.toFixed(2)} NCOP
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.paymentMethod,
                paymentMethod === 'fiat' && styles.paymentMethodActive
              ]}
              onPress={() => setPaymentMethod('fiat')}
            >
              <View style={styles.paymentMethodContent}>
                <Text style={styles.paymentMethodTitle}>Dinero tradicional</Text>
                <Text style={styles.paymentMethodSubtitle}>
                  Pagar con tarjeta o transferencia
                </Text>
              </View>
              <Text style={styles.paymentMethodPrice}>
                ${cart.total.toFixed(2)}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.paymentMethod,
                paymentMethod === 'mixed' && styles.paymentMethodActive
              ]}
              onPress={() => setPaymentMethod('mixed')}
            >
              <View style={styles.paymentMethodContent}>
                <Text style={styles.paymentMethodTitle}>Pago mixto</Text>
                <Text style={styles.paymentMethodSubtitle}>
                  Combinar NCOP y dinero tradicional
                </Text>
              </View>
              <Text style={styles.paymentMethodPrice}>
                Personalizar
              </Text>
            </TouchableOpacity>
          </View>
        </View>

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
          style={styles.placeOrderButton}
          onPress={handlePlaceOrder}
        >
          <CheckCircle color="#ffffff" size={20} />
          <Text style={styles.placeOrderText}>
            Realizar pedido - {paymentMethod === 'ncop' 
              ? `${cart.ncopTotal.toFixed(2)} NCOP` 
              : `$${cart.total.toFixed(2)}`}
          </Text>
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
  paymentMethodContent: {
    flex: 1,
  },
  paymentMethodTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  paymentMethodSubtitle: {
    fontSize: 14,
    color: '#64748b',
  },
  paymentMethodPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2563eb',
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
  placeOrderText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});