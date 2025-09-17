import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, router } from 'expo-router';
import { 
  ArrowLeft, 
  Trash2, 
  Plus, 
  Minus,
  ShoppingBag,
  CreditCard
} from 'lucide-react-native';
import { useMarketplace } from '@/hooks/use-marketplace';

export default function CartScreen() {
  const { 
    cart, 
    removeFromCart, 
    updateCartItemQuantity, 
    clearCart 
  } = useMarketplace();

  const handleCheckout = () => {
    if (cart.items.length === 0) {
      Alert.alert('Carrito vacío', 'Agrega productos antes de proceder al pago');
      return;
    }
    
    // Navigate to checkout
    router.push('/checkout');
  };

  const handleClearCart = () => {
    Alert.alert(
      'Vaciar carrito',
      '¿Estás seguro de que quieres eliminar todos los productos?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Vaciar', style: 'destructive', onPress: clearCart }
      ]
    );
  };

  if (cart.items.length === 0) {
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
          <Text style={styles.headerTitle}>Carrito de compras</Text>
          <View style={styles.headerButton} />
        </View>

        <View style={styles.emptyContainer}>
          <ShoppingBag color="#64748b" size={64} />
          <Text style={styles.emptyTitle}>Tu carrito está vacío</Text>
          <Text style={styles.emptyText}>
            Explora nuestro marketplace y encuentra productos increíbles
          </Text>
          <TouchableOpacity 
            style={styles.shopButton}
            onPress={() => router.push('/(tabs)/marketplace')}
          >
            <Text style={styles.shopButtonText}>Ir al Marketplace</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
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
        <Text style={styles.headerTitle}>Carrito ({cart.totalItems})</Text>
        <TouchableOpacity 
          style={styles.headerButton}
          onPress={handleClearCart}
        >
          <Trash2 color="#ef4444" size={20} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Cart Items */}
        <View style={styles.itemsContainer}>
          {cart.items.map((item) => (
            <View key={item.id} style={styles.cartItem}>
              <Image 
                source={{ uri: item.product.images[0] }} 
                style={styles.itemImage} 
              />
              <View style={styles.itemContent}>
                <View style={styles.itemHeader}>
                  <Text style={styles.itemTitle} numberOfLines={2}>
                    {item.product.name}
                  </Text>
                  <TouchableOpacity 
                    style={styles.removeButton}
                    onPress={() => removeFromCart(item.id)}
                  >
                    <Trash2 color="#ef4444" size={16} />
                  </TouchableOpacity>
                </View>
                
                <Text style={styles.sellerName}>{item.product.sellerName}</Text>
                
                {item.variant && (
                  <Text style={styles.variantText}>
                    {Object.entries(item.variant.attributes)
                      .map(([key, value]) => `${key}: ${value}`)
                      .join(', ')}
                  </Text>
                )}

                <View style={styles.itemFooter}>
                  <View style={styles.priceContainer}>
                    <Text style={styles.itemPrice}>
                      ${item.variant?.price || item.product.price}
                    </Text>
                    <Text style={styles.itemNcopPrice}>
                      {item.variant?.ncopPrice || item.product.ncopPrice} NCOP
                    </Text>
                  </View>
                  
                  <View style={styles.quantityContainer}>
                    <TouchableOpacity 
                      style={styles.quantityButton}
                      onPress={() => updateCartItemQuantity(item.id, item.quantity - 1)}
                    >
                      <Minus color="#64748b" size={16} />
                    </TouchableOpacity>
                    <Text style={styles.quantity}>{item.quantity}</Text>
                    <TouchableOpacity 
                      style={styles.quantityButton}
                      onPress={() => updateCartItemQuantity(item.id, item.quantity + 1)}
                    >
                      <Plus color="#64748b" size={16} />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Order Summary */}
        <View style={styles.summaryContainer}>
          <Text style={styles.summaryTitle}>Resumen del pedido</Text>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal ({cart.totalItems} productos)</Text>
            <Text style={styles.summaryValue}>${cart.subtotal.toFixed(2)}</Text>
          </View>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal NCOP</Text>
            <Text style={styles.summaryValueNcop}>{cart.ncopSubtotal.toFixed(2)} NCOP</Text>
          </View>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Envío</Text>
            <Text style={styles.summaryValue}>
              {cart.shipping === 0 ? 'Gratis' : `$${cart.shipping.toFixed(2)}`}
            </Text>
          </View>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Impuestos</Text>
            <Text style={styles.summaryValue}>${cart.tax.toFixed(2)}</Text>
          </View>
          
          <View style={styles.summaryDivider} />
          
          <View style={styles.summaryRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>${cart.total.toFixed(2)}</Text>
          </View>
          
          <View style={styles.summaryRow}>
            <Text style={styles.totalLabel}>Total NCOP</Text>
            <Text style={styles.totalValueNcop}>{cart.ncopTotal.toFixed(2)} NCOP</Text>
          </View>
        </View>
      </ScrollView>

      {/* Checkout Button */}
      <View style={styles.checkoutContainer}>
        <TouchableOpacity 
          style={styles.checkoutButton}
          onPress={handleCheckout}
        >
          <CreditCard color="#ffffff" size={20} />
          <Text style={styles.checkoutText}>Proceder al pago</Text>
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginTop: 20,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  shopButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
  },
  shopButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  itemsContainer: {
    padding: 20,
    gap: 16,
  },
  cartItem: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 16,
  },
  itemContent: {
    flex: 1,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    flex: 1,
    marginRight: 8,
    lineHeight: 20,
  },
  removeButton: {
    padding: 4,
  },
  sellerName: {
    fontSize: 14,
    color: '#2563eb',
    marginBottom: 4,
  },
  variantText: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 8,
  },
  itemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceContainer: {
    flex: 1,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  itemNcopPrice: {
    fontSize: 12,
    color: '#2563eb',
    fontWeight: '500',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    padding: 4,
  },
  quantityButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 6,
  },
  quantity: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    paddingHorizontal: 12,
  },
  summaryContainer: {
    backgroundColor: '#ffffff',
    margin: 20,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 16,
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
  summaryValueNcop: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2563eb',
  },
  summaryDivider: {
    height: 1,
    backgroundColor: '#e2e8f0',
    marginVertical: 12,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  totalValueNcop: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2563eb',
  },
  checkoutContainer: {
    padding: 20,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  checkoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563eb',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  checkoutText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});