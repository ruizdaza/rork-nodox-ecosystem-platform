import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import {
  ArrowLeft,
  ShoppingCart,
  CreditCard,
  Trash2,
  Plus,
  Minus,
  DollarSign,
  CheckCircle,
  Package,
  Search,
  X
} from 'lucide-react-native';
import { useIntegratedERP } from '@/hooks/use-integrated-erp';
import { useInventory } from '@/hooks/use-inventory';
import { POSPayment, POSProduct } from '@/types/pos';

export default function POSTerminal() {
  const router = useRouter();
  const { processSaleWithAccounting, pos, validateBusinessRules } = useIntegratedERP();
  const { allItems } = useInventory();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'ncop' | 'transfer'>('cash');
  const [amountReceived, setAmountReceived] = useState('');
  const [showPayment, setShowPayment] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [customerName, setCustomerName] = useState('');

  const products: POSProduct[] = allItems.map(item => ({
    id: item.id,
    name: item.productName,
    sku: item.sku,
    barcode: item.barcode,
    category: item.category,
    price: item.sellingPrice,
    cost: item.costPrice,
    isService: false,
    stockQuantity: item.currentStock,
    minStock: item.minStock,
    taxRate: 19,
    isActive: item.status !== 'discontinued',
    description: item.notes
  }));

  const filteredProducts = products.filter(p =>
    p.isActive &&
    (p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
     p.sku?.toLowerCase().includes(searchQuery.toLowerCase()) ||
     p.barcode?.includes(searchQuery))
  );

  const subtotal = pos.cart.reduce((sum, item) => sum + item.subtotal, 0);
  const tax = pos.cart.reduce((sum, item) => sum + item.tax, 0);
  const total = pos.cart.reduce((sum, item) => sum + item.total, 0);
  const change = amountReceived ? parseFloat(amountReceived) - total : 0;

  const handleAddToCart = (product: POSProduct) => {
    try {
      pos.addToCart(product, 1);
    } catch (err: any) {
      Alert.alert('Error', err.message);
    }
  };

  const handleProcessPayment = async () => {
    try {
      if (pos.cart.length === 0) {
        Alert.alert('Error', 'El carrito está vacío');
        return;
      }

      if (!pos.currentSession) {
        Alert.alert('Error', 'No hay sesión abierta. Abre una sesión antes de procesar ventas.');
        return;
      }

      if (paymentMethod === 'cash' && (!amountReceived || parseFloat(amountReceived) < total)) {
        Alert.alert('Error', 'El monto recibido debe ser mayor o igual al total');
        return;
      }

      setIsProcessing(true);

      const payment: POSPayment = {
        id: `pay-${Date.now()}`,
        method: paymentMethod,
        amount: total,
        amountReceived: paymentMethod === 'cash' ? parseFloat(amountReceived) : total,
        change: paymentMethod === 'cash' ? change : 0,
        status: 'completed',
        createdAt: new Date().toISOString()
      };

      const transaction = await processSaleWithAccounting(
        [payment],
        undefined,
        customerName || undefined,
        undefined
      );

      const validation = validateBusinessRules(transaction);
      if (!validation.isValid) {
        console.warn('Transaction validation warnings:', validation.warnings);
      }

      Alert.alert(
        '¡Venta Completada!',
        `Transacción: ${transaction.transactionNumber}\nTotal: $${total.toLocaleString()}\nCambio: $${change.toLocaleString()}`,
        [
          {
            text: 'Nueva Venta',
            onPress: () => {
              setShowPayment(false);
              setAmountReceived('');
              setCustomerName('');
              setPaymentMethod('cash');
            }
          }
        ]
      );
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Error procesando el pago');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Terminal POS',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <ArrowLeft color="#1e293b" size={24} />
            </TouchableOpacity>
          ),
        }}
      />

      <View style={styles.layout}>
        <View style={styles.productsSection}>
          <View style={styles.searchContainer}>
            <Search color="#64748b" size={20} />
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar productos..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#94a3b8"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <X color="#64748b" size={20} />
              </TouchableOpacity>
            )}
          </View>

          <ScrollView style={styles.productsGrid}>
            <View style={styles.productsWrapper}>
              {filteredProducts.map(product => (
                <TouchableOpacity
                  key={product.id}
                  style={styles.productCard}
                  onPress={() => handleAddToCart(product)}
                >
                  <View style={styles.productIcon}>
                    <Package color="#2563eb" size={24} />
                  </View>
                  <Text style={styles.productName} numberOfLines={2}>
                    {product.name}
                  </Text>
                  <Text style={styles.productPrice}>
                    ${product.price.toLocaleString()}
                  </Text>
                  {product.stockQuantity !== undefined && (
                    <Text style={[
                      styles.productStock,
                      product.stockQuantity < (product.minStock || 5) && styles.productStockLow
                    ]}>
                      Stock: {product.stockQuantity}
                    </Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        <View style={styles.cartSection}>
          <View style={styles.cartHeader}>
            <ShoppingCart color="#1e293b" size={24} />
            <Text style={styles.cartTitle}>Carrito</Text>
            {pos.cart.length > 0 && (
              <TouchableOpacity onPress={pos.clearCart} style={styles.clearButton}>
                <Trash2 color="#dc2626" size={16} />
              </TouchableOpacity>
            )}
          </View>

          <TextInput
            style={styles.customerInput}
            placeholder="Cliente (opcional)"
            value={customerName}
            onChangeText={setCustomerName}
            placeholderTextColor="#94a3b8"
          />

          <ScrollView style={styles.cartItems}>
            {pos.cart.length === 0 ? (
              <View style={styles.emptyCart}>
                <ShoppingCart color="#94a3b8" size={48} />
                <Text style={styles.emptyCartText}>Carrito vacío</Text>
              </View>
            ) : (
              pos.cart.map(item => (
                <View key={item.productId} style={styles.cartItem}>
                  <View style={styles.cartItemInfo}>
                    <Text style={styles.cartItemName} numberOfLines={1}>
                      {item.productName}
                    </Text>
                    <Text style={styles.cartItemPrice}>
                      ${item.unitPrice.toLocaleString()}
                    </Text>
                  </View>
                  
                  <View style={styles.cartItemControls}>
                    <TouchableOpacity
                      style={styles.qtyButton}
                      onPress={() => pos.updateCartQuantity(item.productId, item.quantity - 1)}
                    >
                      <Minus color="#64748b" size={16} />
                    </TouchableOpacity>
                    <Text style={styles.qtyText}>{item.quantity}</Text>
                    <TouchableOpacity
                      style={styles.qtyButton}
                      onPress={() => pos.updateCartQuantity(item.productId, item.quantity + 1)}
                    >
                      <Plus color="#64748b" size={16} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.removeButton}
                      onPress={() => pos.removeFromCart(item.productId)}
                    >
                      <Trash2 color="#dc2626" size={16} />
                    </TouchableOpacity>
                  </View>
                  
                  <Text style={styles.cartItemTotal}>
                    ${item.total.toLocaleString()}
                  </Text>
                </View>
              ))
            )}
          </ScrollView>

          {pos.cart.length > 0 && (
            <>
              <View style={styles.totals}>
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Subtotal:</Text>
                  <Text style={styles.totalValue}>${subtotal.toLocaleString()}</Text>
                </View>
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>IVA (19%):</Text>
                  <Text style={styles.totalValue}>${tax.toLocaleString()}</Text>
                </View>
                <View style={[styles.totalRow, styles.totalRowFinal]}>
                  <Text style={styles.totalLabelFinal}>TOTAL:</Text>
                  <Text style={styles.totalValueFinal}>${total.toLocaleString()}</Text>
                </View>
              </View>

              {!showPayment ? (
                <TouchableOpacity
                  style={styles.checkoutButton}
                  onPress={() => setShowPayment(true)}
                  disabled={!pos.currentSession}
                >
                  <CreditCard color="#ffffff" size={20} />
                  <Text style={styles.checkoutButtonText}>
                    {pos.currentSession ? 'Procesar Pago' : 'Abrir Sesión Primero'}
                  </Text>
                </TouchableOpacity>
              ) : (
                <View style={styles.paymentSection}>
                  <Text style={styles.paymentTitle}>Método de Pago</Text>
                  
                  <View style={styles.paymentMethods}>
                    {[
                      { id: 'cash', label: 'Efectivo' },
                      { id: 'card', label: 'Tarjeta' },
                      { id: 'ncop', label: 'NCOP' },
                      { id: 'transfer', label: 'Transferencia' }
                    ].map(method => (
                      <TouchableOpacity
                        key={method.id}
                        style={[
                          styles.paymentMethod,
                          paymentMethod === method.id && styles.paymentMethodActive
                        ]}
                        onPress={() => setPaymentMethod(method.id as any)}
                      >
                        <Text style={[
                          styles.paymentMethodText,
                          paymentMethod === method.id && styles.paymentMethodTextActive
                        ]}>
                          {method.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  {paymentMethod === 'cash' && (
                    <View style={styles.cashInput}>
                      <Text style={styles.cashLabel}>Monto Recibido:</Text>
                      <View style={styles.cashInputWrapper}>
                        <DollarSign color="#64748b" size={20} />
                        <TextInput
                          style={styles.cashInputField}
                          value={amountReceived}
                          onChangeText={setAmountReceived}
                          keyboardType="numeric"
                          placeholder="0"
                          placeholderTextColor="#94a3b8"
                        />
                      </View>
                      {change >= 0 && amountReceived && (
                        <Text style={styles.changeText}>
                          Cambio: ${change.toLocaleString()}
                        </Text>
                      )}
                    </View>
                  )}

                  <View style={styles.paymentActions}>
                    <TouchableOpacity
                      style={styles.cancelButton}
                      onPress={() => {
                        setShowPayment(false);
                        setAmountReceived('');
                      }}
                    >
                      <Text style={styles.cancelButtonText}>Cancelar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.confirmButton,
                        isProcessing && styles.confirmButtonDisabled
                      ]}
                      onPress={handleProcessPayment}
                      disabled={isProcessing || (paymentMethod === 'cash' && change < 0)}
                    >
                      {isProcessing ? (
                        <ActivityIndicator color="#ffffff" />
                      ) : (
                        <>
                          <CheckCircle color="#ffffff" size={20} />
                          <Text style={styles.confirmButtonText}>Confirmar</Text>
                        </>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  layout: {
    flex: 1,
    flexDirection: 'row',
    gap: 16,
    padding: 16,
  },
  productsSection: {
    flex: 2,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 16,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1e293b',
  },
  productsGrid: {
    flex: 1,
  },
  productsWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  productCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    padding: 12,
    width: 120,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  productIcon: {
    width: 48,
    height: 48,
    backgroundColor: '#eff6ff',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  productName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1e293b',
    textAlign: 'center',
    marginBottom: 4,
    minHeight: 32,
  },
  productPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#059669',
    marginBottom: 2,
  },
  productStock: {
    fontSize: 10,
    color: '#64748b',
  },
  productStockLow: {
    color: '#dc2626',
    fontWeight: '600',
  },
  cartSection: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
  },
  cartHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  cartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    flex: 1,
  },
  clearButton: {
    padding: 8,
    backgroundColor: '#fef2f2',
    borderRadius: 6,
  },
  customerInput: {
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    color: '#1e293b',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  cartItems: {
    flex: 1,
    marginBottom: 16,
  },
  emptyCart: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyCartText: {
    fontSize: 16,
    color: '#94a3b8',
    marginTop: 12,
  },
  cartItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    marginBottom: 8,
    gap: 8,
  },
  cartItemInfo: {
    flex: 1,
  },
  cartItemName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 2,
  },
  cartItemPrice: {
    fontSize: 12,
    color: '#64748b',
  },
  cartItemControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  qtyButton: {
    width: 28,
    height: 28,
    backgroundColor: '#ffffff',
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  qtyText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    minWidth: 24,
    textAlign: 'center',
  },
  removeButton: {
    width: 28,
    height: 28,
    backgroundColor: '#fef2f2',
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 4,
  },
  cartItemTotal: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#059669',
    minWidth: 80,
    textAlign: 'right',
  },
  totals: {
    backgroundColor: '#f1f5f9',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  totalRowFinal: {
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingTop: 8,
    marginTop: 4,
  },
  totalLabel: {
    fontSize: 14,
    color: '#64748b',
  },
  totalValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1e293b',
  },
  totalLabelFinal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  totalValueFinal: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#059669',
  },
  checkoutButton: {
    backgroundColor: '#2563eb',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 8,
    gap: 8,
  },
  checkoutButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  paymentSection: {
    backgroundColor: '#f8fafc',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  paymentTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 12,
  },
  paymentMethods: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  paymentMethod: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    alignItems: 'center',
  },
  paymentMethodActive: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  paymentMethodText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  paymentMethodTextActive: {
    color: '#ffffff',
  },
  cashInput: {
    marginBottom: 16,
  },
  cashLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  cashInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 8,
  },
  cashInputField: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  changeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#059669',
    marginTop: 8,
  },
  paymentActions: {
    flexDirection: 'row',
    gap: 8,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#f1f5f9',
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748b',
  },
  confirmButton: {
    flex: 2,
    backgroundColor: '#059669',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 6,
    gap: 6,
  },
  confirmButtonDisabled: {
    backgroundColor: '#94a3b8',
  },
  confirmButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ffffff',
  },
});
