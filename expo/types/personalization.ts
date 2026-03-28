import { AIRecommendation } from './search';

export interface UserPreferences {
  id: string;
  userId: string;
  categories: string[];
  brands: string[];
  priceRange: {
    min: number;
    max: number;
  };
  colors: string[];
  sizes: string[];
  features: string[];
  shippingPreference: 'standard' | 'express' | 'free';
  paymentPreference: 'ncop' | 'fiat' | 'mixed';
  notificationSettings: {
    priceDrops: boolean;
    newArrivals: boolean;
    backInStock: boolean;
    recommendations: boolean;
  };
  updatedAt: string;
}

export interface BrowsingHistory {
  id: string;
  userId: string;
  productId: string;
  product: {
    id: string;
    name: string;
    price: number;
    image: string;
    category: string;
  };
  viewDuration: number;
  timestamp: string;
  source: 'search' | 'category' | 'recommendation' | 'direct';
}

export interface PurchasePattern {
  userId: string;
  categories: Record<string, number>;
  brands: Record<string, number>;
  averageOrderValue: number;
  purchaseFrequency: number;
  seasonalTrends: Record<string, number>;
  timeOfDayPreference: number[];
  dayOfWeekPreference: number[];
}

export interface WishlistItem {
  id: string;
  userId: string;
  productId: string;
  product: {
    id: string;
    name: string;
    price: number;
    ncopPrice: number;
    image: string;
    inStock: boolean;
    rating: number;
  };
  addedAt: string;
  priority: 'low' | 'medium' | 'high';
  notes?: string;
  priceAlert: boolean;
  targetPrice?: number;
}

export interface Wishlist {
  id: string;
  userId: string;
  name: string;
  description?: string;
  isPublic: boolean;
  items: WishlistItem[];
  createdAt: string;
  updatedAt: string;
}

export interface ProductComparison {
  id: string;
  userId: string;
  products: {
    id: string;
    name: string;
    price: number;
    ncopPrice: number;
    image: string;
    rating: number;
    features: Record<string, string>;
  }[];
  createdAt: string;
  updatedAt: string;
}

export interface RecommendationEngine {
  collaborative: {
    similarUsers: string[];
    confidence: number;
  };
  contentBased: {
    similarProducts: string[];
    confidence: number;
  };
  hybrid: {
    recommendations: AIRecommendation[];
    confidence: number;
  };
}

export interface PersonalizationMetrics {
  userId: string;
  engagementScore: number;
  conversionRate: number;
  averageSessionDuration: number;
  clickThroughRate: number;
  recommendationAccuracy: number;
  lastUpdated: string;
}