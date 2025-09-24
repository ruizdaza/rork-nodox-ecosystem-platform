import { useState, useEffect, useCallback } from 'react';
import { 
  UserPreferences, 
  BrowsingHistory, 
  WishlistItem, 
  Wishlist,
  ProductComparison
} from '@/types/personalization';
import { AIRecommendation } from '@/types/search';
import { Product } from '@/types/marketplace';

interface UsePersonalizationReturn {
  // User preferences
  preferences: UserPreferences | null;
  updatePreferences: (preferences: Partial<UserPreferences>) => Promise<void>;
  
  // Browsing history
  browsingHistory: BrowsingHistory[];
  addToHistory: (productId: string, viewDuration: number) => void;
  clearHistory: () => Promise<void>;
  
  // Wishlist
  wishlists: Wishlist[];
  activeWishlist: Wishlist | null;
  createWishlist: (name: string, description?: string) => Promise<Wishlist>;
  addToWishlist: (productId: string, wishlistId?: string) => Promise<void>;
  removeFromWishlist: (itemId: string) => Promise<void>;
  togglePriceAlert: (itemId: string) => Promise<void>;
  
  // Product comparison
  comparison: ProductComparison | null;
  addToComparison: (productId: string) => Promise<void>;
  removeFromComparison: (productId: string) => Promise<void>;
  clearComparison: () => void;
  
  // AI recommendations
  personalizedRecommendations: AIRecommendation[];
  getPersonalizedProducts: () => Promise<Product[]>;
  
  // Loading states
  isLoading: boolean;
  isUpdating: boolean;
}

export function usePersonalization(): UsePersonalizationReturn {
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [browsingHistory, setBrowsingHistory] = useState<BrowsingHistory[]>([]);
  const [wishlists, setWishlists] = useState<Wishlist[]>([]);
  const [activeWishlist, setActiveWishlist] = useState<Wishlist | null>(null);
  const [comparison, setComparison] = useState<ProductComparison | null>(null);
  const [personalizedRecommendations, setPersonalizedRecommendations] = useState<AIRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);

  // Load user data on mount
  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    setIsLoading(true);
    try {
      // Load all user personalization data
      await Promise.all([
        loadPreferences(),
        loadBrowsingHistory(),
        loadWishlists(),
        loadComparison(),
        loadRecommendations()
      ]);
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadPreferences = async () => {
    try {
      // Mock user preferences
      const mockPreferences: UserPreferences = {
        id: 'pref_1',
        userId: 'user_123',
        categories: ['electronics', 'fashion'],
        brands: ['Apple', 'Samsung', 'Nike'],
        priceRange: { min: 0, max: 1000 },
        colors: ['black', 'white', 'blue'],
        sizes: ['M', 'L'],
        features: ['wireless', 'waterproof'],
        shippingPreference: 'free',
        paymentPreference: 'mixed',
        notificationSettings: {
          priceDrops: true,
          newArrivals: true,
          backInStock: true,
          recommendations: true
        },
        updatedAt: new Date().toISOString()
      };
      
      setPreferences(mockPreferences);
    } catch (error) {
      console.error('Error loading preferences:', error);
    }
  };

  const loadBrowsingHistory = async () => {
    try {
      // Mock browsing history
      const mockHistory: BrowsingHistory[] = [
        {
          id: 'hist_1',
          userId: 'user_123',
          productId: 'prod_1',
          product: {
            id: 'prod_1',
            name: 'iPhone 15 Pro',
            price: 999,
            image: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400',
            category: 'electronics'
          },
          viewDuration: 45000,
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          source: 'search'
        }
      ];
      
      setBrowsingHistory(mockHistory);
    } catch (error) {
      console.error('Error loading browsing history:', error);
    }
  };

  const loadWishlists = async () => {
    try {
      // Mock wishlists
      const mockWishlists: Wishlist[] = [
        {
          id: 'wish_1',
          userId: 'user_123',
          name: 'Mi Lista Principal',
          description: 'Productos que me interesan',
          isPublic: false,
          items: [
            {
              id: 'item_1',
              userId: 'user_123',
              productId: 'prod_1',
              product: {
                id: 'prod_1',
                name: 'MacBook Pro',
                price: 1999,
                ncopPrice: 1000,
                image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400',
                inStock: true,
                rating: 4.8
              },
              addedAt: new Date().toISOString(),
              priority: 'high',
              priceAlert: true,
              targetPrice: 1800
            }
          ],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];
      
      setWishlists(mockWishlists);
      setActiveWishlist(mockWishlists[0]);
    } catch (error) {
      console.error('Error loading wishlists:', error);
    }
  };

  const loadComparison = async () => {
    try {
      // Mock comparison
      const mockComparison: ProductComparison = {
        id: 'comp_1',
        userId: 'user_123',
        products: [
          {
            id: 'prod_1',
            name: 'iPhone 15 Pro',
            price: 999,
            ncopPrice: 500,
            image: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400',
            rating: 4.8,
            features: {
              'Pantalla': '6.1"',
              'Cámara': '48MP',
              'Batería': '3274mAh',
              'Almacenamiento': '128GB'
            }
          }
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      setComparison(mockComparison);
    } catch (error) {
      console.error('Error loading comparison:', error);
    }
  };

  const loadRecommendations = async () => {
    try {
      // Mock AI recommendations
      const mockRecommendations: AIRecommendation[] = [
        {
          id: 'rec_1',
          productId: 'prod_1',
          reason: 'Basado en tu historial de navegación',
          confidence: 0.92,
          type: 'personalized',
          metadata: { category: 'electronics', viewTime: 45000 }
        },
        {
          id: 'rec_2',
          productId: 'prod_2',
          reason: 'Usuarios similares también compraron',
          confidence: 0.85,
          type: 'similar',
          metadata: { similarUsers: ['user_456', 'user_789'] }
        }
      ];
      
      setPersonalizedRecommendations(mockRecommendations);
    } catch (error) {
      console.error('Error loading recommendations:', error);
    }
  };

  // Update user preferences
  const updatePreferences = useCallback(async (newPreferences: Partial<UserPreferences>) => {
    if (!preferences) return;
    
    setIsUpdating(true);
    try {
      const updatedPreferences: UserPreferences = {
        ...preferences,
        ...newPreferences,
        updatedAt: new Date().toISOString()
      };
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setPreferences(updatedPreferences);
      
      // Reload recommendations based on new preferences
      await loadRecommendations();
    } catch (error) {
      console.error('Error updating preferences:', error);
    } finally {
      setIsUpdating(false);
    }
  }, [preferences]);

  // Add product to browsing history
  const addToHistory = useCallback((productId: string, viewDuration: number) => {
    const historyItem: BrowsingHistory = {
      id: `hist_${Date.now()}`,
      userId: 'user_123',
      productId,
      product: {
        id: productId,
        name: 'Product Name',
        price: 0,
        image: '',
        category: 'unknown'
      },
      viewDuration,
      timestamp: new Date().toISOString(),
      source: 'direct'
    };
    
    setBrowsingHistory(prev => [historyItem, ...prev.slice(0, 49)]); // Keep last 50 items
  }, []);

  const clearHistory = useCallback(async () => {
    try {
      setBrowsingHistory([]);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 200));
    } catch (error) {
      console.error('Error clearing history:', error);
    }
  }, []);

  // Wishlist management
  const createWishlist = useCallback(async (name: string, description?: string): Promise<Wishlist> => {
    const newWishlist: Wishlist = {
      id: `wish_${Date.now()}`,
      userId: 'user_123',
      name,
      description,
      isPublic: false,
      items: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    setWishlists(prev => [...prev, newWishlist]);
    
    if (!activeWishlist) {
      setActiveWishlist(newWishlist);
    }
    
    return newWishlist;
  }, [activeWishlist]);

  const addToWishlist = useCallback(async (productId: string, wishlistId?: string) => {
    const targetWishlistId = wishlistId || activeWishlist?.id;
    if (!targetWishlistId) return;
    
    const wishlistItem: WishlistItem = {
      id: `item_${Date.now()}`,
      userId: 'user_123',
      productId,
      product: {
        id: productId,
        name: 'Product Name',
        price: 0,
        ncopPrice: 0,
        image: '',
        inStock: true,
        rating: 0
      },
      addedAt: new Date().toISOString(),
      priority: 'medium',
      priceAlert: false
    };
    
    setWishlists(prev => prev.map(wishlist => 
      wishlist.id === targetWishlistId
        ? { ...wishlist, items: [...wishlist.items, wishlistItem], updatedAt: new Date().toISOString() }
        : wishlist
    ));
  }, [activeWishlist]);

  const removeFromWishlist = useCallback(async (itemId: string) => {
    setWishlists(prev => prev.map(wishlist => ({
      ...wishlist,
      items: wishlist.items.filter(item => item.id !== itemId),
      updatedAt: new Date().toISOString()
    })));
  }, []);

  const togglePriceAlert = useCallback(async (itemId: string) => {
    setWishlists(prev => prev.map(wishlist => ({
      ...wishlist,
      items: wishlist.items.map(item => 
        item.id === itemId 
          ? { ...item, priceAlert: !item.priceAlert }
          : item
      ),
      updatedAt: new Date().toISOString()
    })));
  }, []);

  // Product comparison
  const addToComparison = useCallback(async (productId: string) => {
    if (!comparison) {
      const newComparison: ProductComparison = {
        id: `comp_${Date.now()}`,
        userId: 'user_123',
        products: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      setComparison(newComparison);
    }
    
    // Limit to 4 products for comparison
    setComparison(prev => {
      if (!prev || prev.products.length >= 4) return prev;
      
      const productExists = prev.products.some(p => p.id === productId);
      if (productExists) return prev;
      
      const mockProduct = {
        id: productId,
        name: 'Product Name',
        price: 0,
        ncopPrice: 0,
        image: '',
        rating: 0,
        features: {}
      };
      
      return {
        ...prev,
        products: [...prev.products, mockProduct],
        updatedAt: new Date().toISOString()
      };
    });
  }, [comparison]);

  const removeFromComparison = useCallback(async (productId: string) => {
    setComparison(prev => {
      if (!prev) return prev;
      
      return {
        ...prev,
        products: prev.products.filter(p => p.id !== productId),
        updatedAt: new Date().toISOString()
      };
    });
  }, []);

  const clearComparison = useCallback(() => {
    setComparison(null);
  }, []);

  // Get personalized product recommendations
  const getPersonalizedProducts = useCallback(async (): Promise<Product[]> => {
    try {
      // Simulate AI-powered personalized product recommendations
      const mockProducts: Product[] = [
        {
          id: 'pers_1',
          name: 'Producto Personalizado para Ti',
          description: 'Recomendado basado en tus preferencias',
          price: 199.99,
          ncopPrice: 100,
          images: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400'],
          category: 'electronics',
          stock: 15,
          rating: 4.9,
          reviewCount: 89,
          sellerId: 'seller_ai',
          sellerName: 'AI Recommendations',
          isDigital: false,
          tags: ['personalized', 'recommended'],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];
      
      return mockProducts;
    } catch (error) {
      console.error('Error getting personalized products:', error);
      return [];
    }
  }, []);

  return {
    preferences,
    updatePreferences,
    browsingHistory,
    addToHistory,
    clearHistory,
    wishlists,
    activeWishlist,
    createWishlist,
    addToWishlist,
    removeFromWishlist,
    togglePriceAlert,
    comparison,
    addToComparison,
    removeFromComparison,
    clearComparison,
    personalizedRecommendations,
    getPersonalizedProducts,
    isLoading,
    isUpdating
  };
}