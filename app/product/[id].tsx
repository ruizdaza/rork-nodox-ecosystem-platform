import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import {
  ArrowLeft,
  Heart,
  Share2,
  Star,
  ShoppingCart,
  Truck,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react-native';
import { useMarketplace } from '@/hooks/use-marketplace';

const { width } = Dimensions.get('window');

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { products, addToCart } = useMarketplace();
  const [selectedImage, setSelectedImage] = useState<number>(0);
  const [quantity, setQuantity] = useState<number>(1);

  const product = products.find((p) => p.id === id);

  if (!product) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Producto no encontrado</Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>Volver</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const handleAddToCart = () => {
    addToCart(product.id, quantity);
    router.push('/cart');
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => router.back()}
        >
          <ArrowLeft color="#1e293b" size={24} />
        </TouchableOpacity>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerButton}>
            <Share2 color="#1e293b" size={22} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton}>
            <Heart color="#1e293b" size={22} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.imageSection}>
          <Image
            source={{ uri: product.images[selectedImage] }}
            style={styles.mainImage}
          />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.thumbnailScroll}
            contentContainerStyle={styles.thumbnailContainer}
          >
            {product.images.map((image, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => setSelectedImage(index)}
                style={[
                  styles.thumbnail,
                  selectedImage === index && styles.selectedThumbnail,
                ]}
              >
                <Image source={{ uri: image }} style={styles.thumbnailImage} />
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.contentSection}>
          <View style={styles.sellerInfo}>
            <Image
              source={{ uri: product.sellerAvatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face' }}
              style={styles.sellerAvatar}
            />
            <View style={styles.sellerDetails}>
              <Text style={styles.sellerName}>{product.sellerName}</Text>
              <View style={styles.ratingContainer}>
                <Star color="#fbbf24" size={14} fill="#fbbf24" />
                <Text style={styles.rating}>{product.rating}</Text>
                <Text style={styles.reviewCount}>({product.reviewCount} reseñas)</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.contactButton}>
              <Text style={styles.contactButtonText}>Contactar</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.productName}>{product.name}</Text>
          
          <View style={styles.priceSection}>
            <View style={styles.priceContainer}>
              <Text style={styles.price}>${product.price.toLocaleString()}</Text>
              <Text style={styles.ncopPrice}>{product.ncopPrice} NCOP</Text>
            </View>
            <View style={styles.stockBadge}>
              <Text style={styles.stockText}>
                {product.stock > 0 ? `Stock: ${product.stock}` : 'Agotado'}
              </Text>
            </View>
          </View>

          {product.shipping && (
            <View style={styles.shippingSection}>
              <View style={styles.shippingItem}>
                <Truck color="#10b981" size={20} />
                <Text style={styles.shippingText}>
                  {product.shipping.freeShipping
                    ? 'Envío gratis'
                    : `Envío: $${product.shipping.shippingCost.toLocaleString()}`}
                </Text>
              </View>
              <View style={styles.shippingItem}>
                <ShieldCheck color="#2563eb" size={20} />
                <Text style={styles.shippingText}>
                  Entrega estimada: {product.shipping.estimatedDays} días
                </Text>
              </View>
            </View>
          )}

          <View style={styles.descriptionSection}>
            <Text style={styles.sectionTitle}>Descripción</Text>
            <Text style={styles.description}>{product.description}</Text>
          </View>

          {product.specifications && Object.keys(product.specifications).length > 0 && (
            <View style={styles.specificationsSection}>
              <Text style={styles.sectionTitle}>Especificaciones</Text>
              {Object.entries(product.specifications).map(([key, value]) => (
                <View key={key} style={styles.specItem}>
                  <Text style={styles.specKey}>{key}</Text>
                  <Text style={styles.specValue}>{value}</Text>
                </View>
              ))}
            </View>
          )}

          {product.tags && product.tags.length > 0 && (
            <View style={styles.tagsSection}>
              <Text style={styles.sectionTitle}>Etiquetas</Text>
              <View style={styles.tagsContainer}>
                {product.tags.map((tag, index) => (
                  <View key={index} style={styles.tag}>
                    <Text style={styles.tagText}>{tag}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.quantitySelector}>
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={() => setQuantity(Math.max(1, quantity - 1))}
          >
            <Text style={styles.quantityButtonText}>-</Text>
          </TouchableOpacity>
          <Text style={styles.quantityText}>{quantity}</Text>
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={() => setQuantity(Math.min(product.stock, quantity + 1))}
          >
            <Text style={styles.quantityButtonText}>+</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          style={[styles.addToCartButton, product.stock === 0 && styles.disabledButton]}
          onPress={handleAddToCart}
          disabled={product.stock === 0}
        >
          <ShoppingCart color="#ffffff" size={20} />
          <Text style={styles.addToCartText}>
            {product.stock === 0 ? 'Agotado' : 'Agregar al carrito'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  headerButton: {
    padding: 8,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  imageSection: {
    backgroundColor: '#f8fafc',
  },
  mainImage: {
    width: width,
    height: width,
    resizeMode: 'cover',
  },
  thumbnailScroll: {
    marginVertical: 16,
  },
  thumbnailContainer: {
    paddingHorizontal: 20,
    gap: 12,
  },
  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'transparent',
    overflow: 'hidden',
  },
  selectedThumbnail: {
    borderColor: '#2563eb',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  contentSection: {
    padding: 20,
  },
  sellerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  sellerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  sellerDetails: {
    flex: 1,
  },
  sellerName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rating: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748b',
  },
  reviewCount: {
    fontSize: 12,
    color: '#94a3b8',
  },
  contactButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#eff6ff',
    borderRadius: 6,
  },
  contactButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2563eb',
  },
  productName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 16,
    lineHeight: 32,
  },
  priceSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  priceContainer: {
    gap: 4,
  },
  price: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  ncopPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2563eb',
  },
  stockBadge: {
    backgroundColor: '#f0fdf4',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  stockText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#16a34a',
  },
  shippingSection: {
    backgroundColor: '#f8fafc',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    gap: 12,
  },
  shippingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  shippingText: {
    fontSize: 14,
    color: '#475569',
  },
  descriptionSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    color: '#475569',
    lineHeight: 24,
  },
  specificationsSection: {
    marginBottom: 24,
  },
  specItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  specKey: {
    fontSize: 14,
    color: '#64748b',
  },
  specValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1e293b',
  },
  tagsSection: {
    marginBottom: 24,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: '#eff6ff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tagText: {
    fontSize: 12,
    color: '#2563eb',
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    gap: 12,
    backgroundColor: '#ffffff',
  },
  quantitySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    padding: 4,
  },
  quantityButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 6,
  },
  quantityButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
  },
  quantityText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginHorizontal: 16,
    minWidth: 24,
    textAlign: 'center',
  },
  addToCartButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563eb',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  disabledButton: {
    backgroundColor: '#94a3b8',
  },
  addToCartText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#64748b',
    marginBottom: 20,
  },
  backButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#2563eb',
    borderRadius: 8,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
});
