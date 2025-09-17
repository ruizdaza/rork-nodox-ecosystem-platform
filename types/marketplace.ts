export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  ncopPrice: number;
  images: string[];
  category: string;
  subcategory?: string;
  brand?: string;
  stock: number;
  rating: number;
  reviewCount: number;
  sellerId: string;
  sellerName: string;
  sellerAvatar?: string;
  isDigital: boolean;
  tags: string[];
  specifications?: Record<string, string>;
  variants?: ProductVariant[];
  shipping?: ShippingInfo;
  createdAt: string;
  updatedAt: string;
}

export interface ProductVariant {
  id: string;
  name: string;
  price: number;
  ncopPrice: number;
  stock: number;
  attributes: Record<string, string>; // color: "red", size: "M"
}

export interface ShippingInfo {
  weight: number;
  dimensions: {
    length: number;
    width: number;
    height: number;
  };
  freeShipping: boolean;
  shippingCost: number;
  estimatedDays: number;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  subcategories: Subcategory[];
}

export interface Subcategory {
  id: string;
  name: string;
  categoryId: string;
}

export interface CartItem {
  id: string;
  productId: string;
  product: Product;
  quantity: number;
  variantId?: string;
  variant?: ProductVariant;
  addedAt: string;
}

export interface Cart {
  items: CartItem[];
  totalItems: number;
  subtotal: number;
  ncopSubtotal: number;
  shipping: number;
  tax: number;
  total: number;
  ncopTotal: number;
}

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  status: OrderStatus;
  paymentMethod: 'ncop' | 'fiat' | 'mixed';
  paymentStatus: PaymentStatus;
  shippingAddress: Address;
  billingAddress: Address;
  subtotal: number;
  ncopSubtotal: number;
  shipping: number;
  tax: number;
  total: number;
  ncopTotal: number;
  trackingNumber?: string;
  estimatedDelivery?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  product: Product;
  quantity: number;
  price: number;
  ncopPrice: number;
  variantId?: string;
  variant?: ProductVariant;
}

export type OrderStatus = 
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded';

export type PaymentStatus = 
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'refunded';

export interface Address {
  id: string;
  name: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone: string;
  isDefault: boolean;
}

export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  title: string;
  comment: string;
  images?: string[];
  helpful: number;
  verified: boolean;
  createdAt: string;
}

export interface SearchFilters {
  category?: string;
  subcategory?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  brand?: string;
  inStock?: boolean;
  freeShipping?: boolean;
  sortBy?: 'relevance' | 'price_low' | 'price_high' | 'rating' | 'newest';
}