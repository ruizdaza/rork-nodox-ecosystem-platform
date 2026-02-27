import { useState, useEffect } from 'react';
import { Product, Category, Cart, CartItem, SearchFilters } from '@/types/marketplace';
import { useNodoX } from './use-nodox-store';
import { ValidationUtils, ErrorUtils } from '@/utils/security';
import { useAuth } from './use-auth';
import { db } from '@/lib/firebase-client';
import { collection, getDocs } from 'firebase/firestore';
import { trpc } from '@/lib/trpc';

// Keep mock categories for UI structure if not yet in DB
const mockCategories: Category[] = [
  {
    id: 'electronics',
    name: 'Electrónicos',
    icon: 'smartphone',
    subcategories: [
      { id: 'phones', name: 'Teléfonos', categoryId: 'electronics' },
      { id: 'laptops', name: 'Laptops', categoryId: 'electronics' },
      { id: 'accessories', name: 'Accesorios', categoryId: 'electronics' }
    ]
  },
   {
    id: 'fashion',
    name: 'Moda',
    icon: 'shirt',
    subcategories: [
      { id: 'men', name: 'Hombres', categoryId: 'fashion' },
      { id: 'women', name: 'Mujeres', categoryId: 'fashion' },
      { id: 'shoes', name: 'Zapatos', categoryId: 'fashion' }
    ]
  },
  {
    id: 'home',
    name: 'Hogar',
    icon: 'home',
    subcategories: [
      { id: 'furniture', name: 'Muebles', categoryId: 'home' },
      { id: 'decor', name: 'Decoración', categoryId: 'home' },
      { id: 'kitchen', name: 'Cocina', categoryId: 'home' }
    ]
  },
  {
    id: 'beauty',
    name: 'Belleza',
    icon: 'sparkles',
    subcategories: [
      { id: 'skincare', name: 'Cuidado de la piel', categoryId: 'beauty' },
      { id: 'makeup', name: 'Maquillaje', categoryId: 'beauty' },
      { id: 'fragrance', name: 'Fragancias', categoryId: 'beauty' }
    ]
  },
  {
    id: 'sports',
    name: 'Deportes',
    icon: 'dumbbell',
    subcategories: [
      { id: 'fitness', name: 'Fitness', categoryId: 'sports' },
      { id: 'outdoor', name: 'Aire libre', categoryId: 'sports' },
      { id: 'team-sports', name: 'Deportes de equipo', categoryId: 'sports' }
    ]
  },
  {
    id: 'digital',
    name: 'Digital',
    icon: 'download',
    subcategories: [
      { id: 'software', name: 'Software', categoryId: 'digital' },
      { id: 'courses', name: 'Cursos', categoryId: 'digital' },
      { id: 'ebooks', name: 'E-books', categoryId: 'digital' }
    ]
  }
];

export function useMarketplace() {
  const { ncopBalance, copBalance } = useNodoX();
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>(mockCategories);
  const [cart, setCart] = useState<Cart>({
    items: [],
    totalItems: 0,
    subtotal: 0,
    ncopSubtotal: 0,
    shipping: 0,
    tax: 0,
    total: 0,
    ncopTotal: 0
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [processingPayment, setProcessingPayment] = useState<boolean>(false);

  const processOrderMutation = trpc.marketplace.processOrder.useMutation();

  // Fetch products from Firestore
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "products"));
        const fetchedProducts: Product[] = [];
        querySnapshot.forEach((doc) => {
          fetchedProducts.push({ id: doc.id, ...doc.data() } as Product);
        });

        if (fetchedProducts.length > 0) {
            setProducts(fetchedProducts);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const searchProducts = (query: string, filters?: SearchFilters): Product[] => {
    let filtered = products;

    if (query.trim()) {
      const searchTerm = query.toLowerCase();
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm) ||
        product.description.toLowerCase().includes(searchTerm) ||
        product.tags.some(tag => tag.toLowerCase().includes(searchTerm)) ||
        product.brand?.toLowerCase().includes(searchTerm)
      );
    }

    if (filters) {
       if (filters.category) {
        filtered = filtered.filter(p => p.category === filters.category);
      }
      if (filters.subcategory) {
        filtered = filtered.filter(p => p.subcategory === filters.subcategory);
      }
      if (filters.minPrice !== undefined) {
        filtered = filtered.filter(p => p.price >= filters.minPrice!);
      }
      if (filters.maxPrice !== undefined) {
        filtered = filtered.filter(p => p.price <= filters.maxPrice!);
      }
      if (filters.minRating !== undefined) {
        filtered = filtered.filter(p => p.rating >= filters.minRating!);
      }
      if (filters.brand) {
        filtered = filtered.filter(p => p.brand === filters.brand);
      }
      if (filters.inStock) {
        filtered = filtered.filter(p => p.stock > 0);
      }
      if (filters.freeShipping) {
        filtered = filtered.filter(p => p.shipping?.freeShipping);
      }
    }

    if (filters?.sortBy) {
        switch (filters.sortBy) {
        case 'price_low':
          filtered.sort((a, b) => a.price - b.price);
          break;
        case 'price_high':
          filtered.sort((a, b) => b.price - a.price);
          break;
        case 'rating':
          filtered.sort((a, b) => b.rating - a.rating);
          break;
        case 'newest':
          filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          break;
        default:
          break;
      }
    }

    return filtered;
  };

  const getProductsByCategory = (categoryId: string): Product[] => {
    return products.filter(product => product.category === categoryId);
  };

  const getFeaturedProducts = (): Product[] => {
    return products
      .filter(product => product.rating >= 4.5)
      .sort((a, b) => b.reviewCount - a.reviewCount)
      .slice(0, 6);
  };

  const addToCart = (productId: string, quantity: number = 1, variantId?: string) => {
    try {
      if (typeof productId !== 'string' || !productId.trim()) return;
      if (typeof quantity !== 'number' || quantity <= 0) return;

      const product = products.find(p => p.id === productId);
      if (!product) return;

      const availableStock = variantId 
        ? product.variants?.find(v => v.id === variantId)?.stock || 0
        : product.stock;
        
      if (availableStock < quantity) {
        console.warn('Insufficient stock');
        return;
      }

      const variant = variantId ? product.variants?.find(v => v.id === variantId) : undefined;
      const existingItemIndex = cart.items.findIndex(
        item => item.productId === productId && item.variantId === variantId
      );

      let newItems: CartItem[];
      
      if (existingItemIndex >= 0) {
        newItems = [...cart.items];
        const newQuantity = newItems[existingItemIndex].quantity + quantity;
        if (newQuantity > availableStock) return;
        newItems[existingItemIndex].quantity = newQuantity;
      } else {
        const newItem: CartItem = {
          id: `item-${Date.now()}`,
          productId,
          product,
          quantity,
          variantId,
          variant,
          addedAt: new Date().toISOString()
        };
        newItems = [...cart.items, newItem];
      }

      updateCart(newItems);
    } catch (error) {
      console.error(error);
    }
  };

  const removeFromCart = (itemId: string) => {
    const newItems = cart.items.filter(item => item.id !== itemId);
    updateCart(newItems);
  };

  const updateCartItemQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    const newItems = cart.items.map(item =>
      item.id === itemId ? { ...item, quantity } : item
    );
    updateCart(newItems);
  };

  const clearCart = () => {
    updateCart([]);
  };

  const processPayment = async (
    paymentMethod: 'ncop' | 'fiat' | 'mixed',
    shippingAddress?: any,
    ncopAmount?: number
  ): Promise<{ success: boolean; error?: string }> => {
    setProcessingPayment(true);
    
    try {
      if (!user) {
        return { success: false, error: 'User not authenticated' };
      }

      const orderPayload = {
        paymentMethod,
        ncopAmount,
        items: cart.items.map(item => ({
          productId: item.productId,
          productName: item.product.name,
          quantity: item.quantity,
          price: item.product.price,
          ncopPrice: item.product.ncopPrice,
        })),
        total: cart.total,
        ncopTotal: cart.ncopTotal,
        shippingAddress // Pass shipping address to backend
      };

      await processOrderMutation.mutateAsync(orderPayload);
      
      clearCart();
      console.log(`Payment processed successfully via tRPC`);
      return { success: true };
      
    } catch (error: any) {
      console.error("Order processing error:", error);
      return { success: false, error: error.message || 'Error processing payment' };
    } finally {
      setProcessingPayment(false);
    }
  };

  const updateCart = (items: CartItem[]) => {
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = items.reduce((sum, item) => {
      const price = item.variant?.price || item.product.price;
      return sum + (price * item.quantity);
    }, 0);
    const ncopSubtotal = items.reduce((sum, item) => {
      const ncopPrice = item.variant?.ncopPrice || item.product.ncopPrice || 0;
      return sum + (ncopPrice * item.quantity);
    }, 0);
    
    const hasPhysicalItems = items.some(item => !item.product.isDigital);
    const shipping = hasPhysicalItems ? items.reduce((sum, item) => {
      if (item.product.isDigital) return sum;
      if (item.product.shipping?.freeShipping || subtotal > 100) return sum;
      return sum + (item.product.shipping?.shippingCost || 0);
    }, 0) : 0;
    
    const tax = subtotal * 0.19;
    const total = subtotal + shipping + tax;
    const ncopTotal = ncopSubtotal;

    setCart({
      items,
      totalItems,
      subtotal,
      ncopSubtotal,
      shipping,
      tax,
      total,
      ncopTotal
    });
  };

  const canAffordWithNCOP = (amount: number): boolean => ncopBalance >= amount;
  const canAffordWithCOP = (amount: number): boolean => copBalance >= amount;

  const getPaymentOptions = () => ({
      ncop: canAffordWithNCOP(cart.ncopTotal),
      fiat: canAffordWithCOP(cart.total),
      mixed: ncopBalance > 0 || copBalance > 0
  });

   const processPhysicalStorePayment = async (storeId: string, amount: number, paymentMethod: 'ncop' | 'fiat') => {
       return { success: false, error: "Not implemented yet" };
   };

   const validatePayment = () => ({ valid: true });

  return {
    products,
    categories,
    cart,
    loading,
    processingPayment,
    searchProducts,
    getProductsByCategory,
    getFeaturedProducts,
    addToCart,
    removeFromCart,
    updateCartItemQuantity,
    clearCart,
    processPayment,
    processPhysicalStorePayment,
    validatePayment,
    canAffordWithNCOP,
    canAffordWithCOP,
    getPaymentOptions,
    ncopBalance,
    copBalance
  };
}
