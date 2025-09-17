import { useState, useEffect } from 'react';
import { Product, Category, Cart, CartItem, SearchFilters } from '@/types/marketplace';

// Mock data
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

const mockProducts: Product[] = [
  {
    id: '1',
    name: 'iPhone 15 Pro Max',
    description: 'El iPhone más avanzado con chip A17 Pro, cámara de 48MP y pantalla Super Retina XDR de 6.7 pulgadas.',
    price: 1199,
    ncopPrice: 2398,
    images: [
      'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=500',
      'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500'
    ],
    category: 'electronics',
    subcategory: 'phones',
    brand: 'Apple',
    stock: 25,
    rating: 4.8,
    reviewCount: 1247,
    sellerId: 'seller1',
    sellerName: 'TechStore Pro',
    sellerAvatar: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=100',
    isDigital: false,
    tags: ['smartphone', 'apple', 'premium', 'camera'],
    specifications: {
      'Pantalla': '6.7\" Super Retina XDR',
      'Procesador': 'A17 Pro',
      'Almacenamiento': '256GB',
      'Cámara': '48MP + 12MP + 12MP',
      'Batería': 'Hasta 29 horas de video'
    },
    shipping: {
      weight: 0.221,
      dimensions: { length: 15.9, width: 7.6, height: 0.8 },
      freeShipping: true,
      shippingCost: 0,
      estimatedDays: 2
    },
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z'
  },
  {
    id: '2',
    name: 'MacBook Air M3',
    description: 'Laptop ultradelgada con chip M3, pantalla Liquid Retina de 13.6 pulgadas y hasta 18 horas de batería.',
    price: 1099,
    ncopPrice: 2198,
    images: [
      'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=500',
      'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500'
    ],
    category: 'electronics',
    subcategory: 'laptops',
    brand: 'Apple',
    stock: 15,
    rating: 4.9,
    reviewCount: 892,
    sellerId: 'seller1',
    sellerName: 'TechStore Pro',
    sellerAvatar: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=100',
    isDigital: false,
    tags: ['laptop', 'apple', 'ultrabook', 'productivity'],
    specifications: {
      'Pantalla': '13.6\" Liquid Retina',
      'Procesador': 'Apple M3',
      'RAM': '8GB',
      'Almacenamiento': '256GB SSD',
      'Batería': 'Hasta 18 horas'
    },
    shipping: {
      weight: 1.24,
      dimensions: { length: 30.4, width: 21.5, height: 1.1 },
      freeShipping: true,
      shippingCost: 0,
      estimatedDays: 3
    },
    createdAt: '2024-01-14T09:00:00Z',
    updatedAt: '2024-01-14T09:00:00Z'
  },
  {
    id: '3',
    name: 'Camiseta Premium Cotton',
    description: 'Camiseta de algodón 100% orgánico, corte regular, perfecta para uso diario.',
    price: 29.99,
    ncopPrice: 59.98,
    images: [
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500',
      'https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=500'
    ],
    category: 'fashion',
    subcategory: 'men',
    brand: 'EcoWear',
    stock: 100,
    rating: 4.5,
    reviewCount: 324,
    sellerId: 'seller2',
    sellerName: 'Fashion Hub',
    sellerAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100',
    isDigital: false,
    tags: ['camiseta', 'algodón', 'casual', 'eco-friendly'],
    variants: [
      {
        id: 'v1',
        name: 'Negro - S',
        price: 29.99,
        ncopPrice: 59.98,
        stock: 20,
        attributes: { color: 'Negro', size: 'S' }
      },
      {
        id: 'v2',
        name: 'Negro - M',
        price: 29.99,
        ncopPrice: 59.98,
        stock: 25,
        attributes: { color: 'Negro', size: 'M' }
      },
      {
        id: 'v3',
        name: 'Blanco - M',
        price: 29.99,
        ncopPrice: 59.98,
        stock: 30,
        attributes: { color: 'Blanco', size: 'M' }
      }
    ],
    shipping: {
      weight: 0.2,
      dimensions: { length: 25, width: 20, height: 2 },
      freeShipping: false,
      shippingCost: 5.99,
      estimatedDays: 5
    },
    createdAt: '2024-01-13T08:00:00Z',
    updatedAt: '2024-01-13T08:00:00Z'
  },
  {
    id: '4',
    name: 'Curso de React Native',
    description: 'Curso completo de React Native desde cero hasta nivel avanzado. Incluye proyectos prácticos.',
    price: 99.99,
    ncopPrice: 199.98,
    images: [
      'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500',
      'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=500'
    ],
    category: 'digital',
    subcategory: 'courses',
    brand: 'CodeAcademy Pro',
    stock: 999,
    rating: 4.7,
    reviewCount: 156,
    sellerId: 'seller3',
    sellerName: 'EduTech Solutions',
    sellerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
    isDigital: true,
    tags: ['curso', 'programación', 'react-native', 'mobile'],
    specifications: {
      'Duración': '40 horas',
      'Lecciones': '120 videos',
      'Proyectos': '5 apps completas',
      'Certificado': 'Incluido',
      'Acceso': 'De por vida'
    },
    createdAt: '2024-01-12T07:00:00Z',
    updatedAt: '2024-01-12T07:00:00Z'
  },
  {
    id: '5',
    name: 'Sofá Modular Gris',
    description: 'Sofá modular de 3 plazas en tela gris, diseño moderno y cómodo para sala de estar.',
    price: 899.99,
    ncopPrice: 1799.98,
    images: [
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500',
      'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=500'
    ],
    category: 'home',
    subcategory: 'furniture',
    brand: 'HomeComfort',
    stock: 8,
    rating: 4.6,
    reviewCount: 89,
    sellerId: 'seller4',
    sellerName: 'Muebles Modernos',
    sellerAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100',
    isDigital: false,
    tags: ['sofá', 'muebles', 'sala', 'modular'],
    specifications: {
      'Material': 'Tela premium',
      'Dimensiones': '220 x 90 x 85 cm',
      'Plazas': '3 personas',
      'Color': 'Gris claro',
      'Garantía': '2 años'
    },
    shipping: {
      weight: 85,
      dimensions: { length: 220, width: 90, height: 85 },
      freeShipping: true,
      shippingCost: 0,
      estimatedDays: 7
    },
    createdAt: '2024-01-11T06:00:00Z',
    updatedAt: '2024-01-11T06:00:00Z'
  },
  {
    id: '6',
    name: 'Serum Vitamina C',
    description: 'Serum facial con vitamina C pura al 20%, antioxidante y anti-edad para todo tipo de piel.',
    price: 45.99,
    ncopPrice: 91.98,
    images: [
      'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=500',
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500'
    ],
    category: 'beauty',
    subcategory: 'skincare',
    brand: 'GlowSkin',
    stock: 45,
    rating: 4.4,
    reviewCount: 267,
    sellerId: 'seller5',
    sellerName: 'Beauty World',
    sellerAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100',
    isDigital: false,
    tags: ['serum', 'vitamina-c', 'skincare', 'anti-edad'],
    specifications: {
      'Concentración': '20% Vitamina C',
      'Volumen': '30ml',
      'Tipo de piel': 'Todo tipo',
      'Uso': 'Mañana y noche',
      'Origen': 'Dermatológicamente testado'
    },
    shipping: {
      weight: 0.1,
      dimensions: { length: 10, width: 5, height: 15 },
      freeShipping: false,
      shippingCost: 3.99,
      estimatedDays: 3
    },
    createdAt: '2024-01-10T05:00:00Z',
    updatedAt: '2024-01-10T05:00:00Z'
  }
];

export function useMarketplace() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
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

  useEffect(() => {
    // Simulate API call
    const timeout = setTimeout(() => {
      setProducts(mockProducts);
      setCategories(mockCategories);
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timeout);
  }, []);

  const searchProducts = (query: string, filters?: SearchFilters): Product[] => {
    let filtered = products;

    // Text search
    if (query.trim()) {
      const searchTerm = query.toLowerCase();
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm) ||
        product.description.toLowerCase().includes(searchTerm) ||
        product.tags.some(tag => tag.toLowerCase().includes(searchTerm)) ||
        product.brand?.toLowerCase().includes(searchTerm)
      );
    }

    // Apply filters
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

    // Sort results
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
          // relevance - keep original order
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
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const variant = variantId ? product.variants?.find(v => v.id === variantId) : undefined;
    const existingItemIndex = cart.items.findIndex(
      item => item.productId === productId && item.variantId === variantId
    );

    let newItems: CartItem[];
    
    if (existingItemIndex >= 0) {
      // Update existing item
      newItems = [...cart.items];
      newItems[existingItemIndex].quantity += quantity;
    } else {
      // Add new item
      const newItem: CartItem = {
        id: `${productId}-${variantId || 'default'}-${Date.now()}`,
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

  const updateCart = (items: CartItem[]) => {
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = items.reduce((sum, item) => {
      const price = item.variant?.price || item.product.price;
      return sum + (price * item.quantity);
    }, 0);
    const ncopSubtotal = items.reduce((sum, item) => {
      const ncopPrice = item.variant?.ncopPrice || item.product.ncopPrice;
      return sum + (ncopPrice * item.quantity);
    }, 0);
    
    const shipping = items.reduce((sum, item) => {
      if (item.product.shipping?.freeShipping || subtotal > 100) return sum;
      return sum + (item.product.shipping?.shippingCost || 0);
    }, 0);
    
    const tax = subtotal * 0.1; // 10% tax
    const total = subtotal + shipping + tax;
    const ncopTotal = ncopSubtotal + shipping + tax;

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

  return {
    products,
    categories,
    cart,
    loading,
    searchProducts,
    getProductsByCategory,
    getFeaturedProducts,
    addToCart,
    removeFromCart,
    updateCartItemQuantity,
    clearCart
  };
}