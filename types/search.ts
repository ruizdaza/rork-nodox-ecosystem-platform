export interface SearchSuggestion {
  id: string;
  text: string;
  type: 'product' | 'category' | 'brand' | 'query';
  count?: number;
  image?: string;
}

export interface VoiceSearchResult {
  transcript: string;
  confidence: number;
  language: string;
}

export interface SearchAnalytics {
  query: string;
  results: number;
  timestamp: string;
  userId?: string;
  filters?: Record<string, any>;
  clickedResults?: string[];
}

export interface SmartFilter {
  id: string;
  name: string;
  type: 'range' | 'select' | 'multiselect' | 'boolean';
  options?: FilterOption[];
  min?: number;
  max?: number;
  unit?: string;
  category?: string;
}

export interface FilterOption {
  id: string;
  label: string;
  value: string | number;
  count: number;
  image?: string;
}

export interface SearchFacets {
  categories: FilterOption[];
  brands: FilterOption[];
  priceRanges: FilterOption[];
  ratings: FilterOption[];
  features: FilterOption[];
  availability: FilterOption[];
}

export interface AIRecommendation {
  id: string;
  productId: string;
  reason: string;
  confidence: number;
  type: 'similar' | 'complementary' | 'trending' | 'personalized';
  metadata?: Record<string, any>;
}

export interface SearchContext {
  location?: {
    lat: number;
    lng: number;
    city: string;
    country: string;
  };
  device: {
    type: 'mobile' | 'tablet' | 'desktop';
    os: string;
    browser?: string;
  };
  session: {
    id: string;
    startTime: string;
    pageViews: number;
    searchCount: number;
  };
  user?: {
    id: string;
    preferences: Record<string, any>;
    purchaseHistory: string[];
    searchHistory: string[];
  };
}