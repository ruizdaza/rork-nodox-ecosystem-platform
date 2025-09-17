import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  FlatList,
  Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  Search, 
  Filter, 
  ShoppingCart, 
  Star, 
  Heart,
  Grid3X3,
  List,
  Smartphone,
  Shirt,
  Home,
  Sparkles,
  Dumbbell,
  Download
} from 'lucide-react-native';
import { useMarketplace } from '@/hooks/use-marketplace';
import { Product, SearchFilters } from '@/types/marketplace';
import NodoXLogo from '@/components/NodoXLogo';
import { router } from 'expo-router';

const { width } = Dimensions.get('window');
const ITEM_WIDTH = (width - 60) / 2;

const categoryIcons: Record<string, any> = {
  electronics: Smartphone,
  fashion: Shirt,
  home: Home,
  beauty: Sparkles,
  sports: Dumbbell,
  digital: Download
};

export default function MarketplaceScreen() {
  const { 
    products, 
    categories, 
    cart, 
    loading, 
    searchProducts, 
    getFeaturedProducts,
    addToCart 
  } = useMarketplace();
  
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filters, setFilters] = useState<SearchFilters>({});
  const [showFilters, setShowFilters] = useState<boolean>(false);

  const displayProducts = searchQuery || selectedCategory || Object.keys(filters).length > 0
    ? searchProducts(searchQuery, { ...filters, category: selectedCategory || filters.category })
    : getFeaturedProducts();

  const renderCategoryIcon = (categoryId: string, color: string, size: number) => {
    const IconComponent = categoryIcons[categoryId];
    return IconComponent ? <IconComponent color={color} size={size} /> : null;
  };

  const renderProduct = ({ item }: { item: Product }) => {
    if (viewMode === 'list') {
      return (
        <TouchableOpacity 
          style={styles.productCardList}
          onPress={() => router.push(`/product/${item.id}`)}
        >
          <Image source={{ uri: item.images[0] }} style={styles.productImageList} />
          <View style={styles.productContentList}>
            <View style={styles.productHeader}>
              <Text style={styles.productTitle} numberOfLines={2}>{item.name}</Text>
              <TouchableOpacity style={styles.favoriteButton}>
                <Heart color="#64748b" size={20} />
              </TouchableOpacity>
            </View>
            <Text style={styles.sellerName}>{item.sellerName}</Text>
            <View style={styles.ratingContainer}>
              <Star color="#fbbf24" size={14} fill="#fbbf24" />
              <Text style={styles.rating}>{item.rating}</Text>
              <Text style={styles.reviewCount}>({item.reviewCount})</Text>
            </View>
            <Text style={styles.description} numberOfLines={2}>{item.description}</Text>
            <View style={styles.priceContainer}>
              <Text style={styles.price}>${item.price}</Text>
              <Text style={styles.ncopPrice}>{item.ncopPrice} NCOP</Text>
            </View>
          </View>
        </TouchableOpacity>
      );
    }

    return (
      <TouchableOpacity 
        style={[styles.productCard, { width: ITEM_WIDTH }]}
        onPress={() => router.push(`/product/${item.id}`)}
      >
        <View style={styles.productImageContainer}>
          <Image source={{ uri: item.images[0] }} style={styles.productImage} />
          <TouchableOpacity style={styles.favoriteButtonGrid}>
            <Heart color="#64748b" size={16} />
          </TouchableOpacity>
          {item.shipping?.freeShipping && (
            <View style={styles.freeShippingBadge}>
              <Text style={styles.freeShippingText}>Envío gratis</Text>
            </View>
          )}
        </View>
        <View style={styles.productContent}>
          <Text style={styles.productTitleGrid} numberOfLines={2}>{item.name}</Text>
          <Text style={styles.sellerNameGrid}>{item.sellerName}</Text>
          <View style={styles.ratingContainerGrid}>
            <Star color="#fbbf24" size={12} fill="#fbbf24" />
            <Text style={styles.ratingGrid}>{item.rating}</Text>
          </View>
          <View style={styles.priceContainerGrid}>
            <Text style={styles.priceGrid}>${item.price}</Text>
            <Text style={styles.ncopPriceGrid}>{item.ncopPrice} NCOP</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <NodoXLogo size="small" showText={false} />
          <Text style={styles.headerTitle}>Marketplace</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
          >
            {viewMode === 'grid' ? 
              <List color="#64748b" size={20} /> : 
              <Grid3X3 color="#64748b" size={20} />
            }
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={() => router.push('/cart')}
          >
            <ShoppingCart color="#64748b" size={20} />
            {cart.totalItems > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{cart.totalItems}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Search color="#64748b" size={20} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar productos..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <TouchableOpacity 
          style={styles.filterButton}
          onPress={() => setShowFilters(!showFilters)}
        >
          <Filter color="#2563eb" size={20} />
        </TouchableOpacity>
      </View>

      {/* Categories */}
      <View style={styles.categoriesContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesContent}
        >
          <TouchableOpacity
            style={[
              styles.categoryChip,
              selectedCategory === '' && styles.categoryChipActive
            ]}
            onPress={() => setSelectedCategory('')}
          >
            <Text style={[
              styles.categoryText,
              selectedCategory === '' && styles.categoryTextActive
            ]}>
              Todos
            </Text>
          </TouchableOpacity>
          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryChip,
                selectedCategory === category.id && styles.categoryChipActive
              ]}
              onPress={() => setSelectedCategory(category.id)}
            >
              {renderCategoryIcon(
                category.id, 
                selectedCategory === category.id ? '#ffffff' : '#64748b', 
                16
              )}
              <Text style={[
                styles.categoryText,
                selectedCategory === category.id && styles.categoryTextActive
              ]}>
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Products */}
      <View style={styles.productsContainer}>
        <View style={styles.productsHeader}>
          <Text style={styles.productsTitle}>
            {searchQuery ? `Resultados para "${searchQuery}"` : 
             selectedCategory ? categories.find(c => c.id === selectedCategory)?.name : 
             'Productos destacados'}
          </Text>
          <Text style={styles.productsCount}>
            {displayProducts.length} productos
          </Text>
        </View>

        <FlatList
          data={displayProducts}
          renderItem={renderProduct}
          keyExtractor={(item) => item.id}
          numColumns={viewMode === 'grid' ? 2 : 1}
          key={viewMode}
          columnWrapperStyle={viewMode === 'grid' ? styles.row : undefined}
          contentContainerStyle={styles.productsList}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No se encontraron productos</Text>
            </View>
          }
        />
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
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  headerRight: {
    flexDirection: 'row',
    gap: 12,
  },
  headerButton: {
    padding: 4,
    position: 'relative',
  },
  cartBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#ef4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBadgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    gap: 12,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1e293b',
  },
  filterButton: {
    backgroundColor: '#eff6ff',
    borderRadius: 12,
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoriesContainer: {
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  categoriesContent: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  categoryChipActive: {
    backgroundColor: '#2563eb',
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748b',
  },
  categoryTextActive: {
    color: '#ffffff',
  },
  productsContainer: {
    flex: 1,
  },
  productsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
  },
  productsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
  },
  productsCount: {
    fontSize: 14,
    color: '#64748b',
  },
  productsList: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  row: {
    justifyContent: 'space-between',
  },
  // Grid view styles
  productCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productImageContainer: {
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: 160,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  favoriteButtonGrid: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  freeShippingBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: '#10b981',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  freeShippingText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '600',
  },
  productContent: {
    padding: 12,
  },
  productTitleGrid: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
    lineHeight: 18,
  },
  sellerNameGrid: {
    fontSize: 12,
    color: '#2563eb',
    marginBottom: 4,
  },
  ratingContainerGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  ratingGrid: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748b',
  },
  priceContainerGrid: {
    gap: 2,
  },
  priceGrid: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  ncopPriceGrid: {
    fontSize: 12,
    color: '#2563eb',
    fontWeight: '500',
  },
  // List view styles
  productCardList: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productImageList: {
    width: 120,
    height: 120,
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
  },
  productContentList: {
    flex: 1,
    padding: 16,
  },
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  productTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    flex: 1,
    marginRight: 8,
    lineHeight: 20,
  },
  favoriteButton: {
    padding: 4,
  },
  sellerName: {
    fontSize: 14,
    color: '#2563eb',
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  rating: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748b',
  },
  reviewCount: {
    fontSize: 12,
    color: '#64748b',
  },
  description: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 18,
    marginBottom: 12,
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  price: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  ncopPrice: {
    fontSize: 14,
    color: '#2563eb',
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
  },
});