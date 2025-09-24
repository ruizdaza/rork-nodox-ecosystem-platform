import { useState, useEffect, useCallback, useMemo } from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  SearchSuggestion, 
  VoiceSearchResult, 
  SearchAnalytics, 
  SearchFacets,
  AIRecommendation,
  SearchContext
} from '@/types/search';
import { Product } from '@/types/marketplace';

interface UseSmartSearchReturn {
  // Search state
  query: string;
  suggestions: SearchSuggestion[];
  results: Product[];
  facets: SearchFacets;
  isLoading: boolean;
  isVoiceSearching: boolean;
  
  // Search functions
  setQuery: (query: string) => void;
  search: (query: string, filters?: Record<string, any>) => Promise<Product[]>;
  getSuggestions: (query: string) => Promise<SearchSuggestion[]>;
  
  // Voice search
  startVoiceSearch: () => Promise<void>;
  stopVoiceSearch: () => void;
  
  // AI recommendations
  getRecommendations: (productId?: string) => Promise<AIRecommendation[]>;
  
  // Analytics
  trackSearch: (query: string, results: number) => void;
  trackClick: (productId: string, position: number) => void;
  
  // History
  searchHistory: string[];
  clearSearchHistory: () => void;
}

export function useSmartSearch(): UseSmartSearchReturn {
  const [query, setQuery] = useState<string>('');
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [results, setResults] = useState<Product[]>([]);
  const [facets, setFacets] = useState<SearchFacets>({
    categories: [],
    brands: [],
    priceRanges: [],
    ratings: [],
    features: [],
    availability: []
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isVoiceSearching, setIsVoiceSearching] = useState<boolean>(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);

  // Load search history on mount
  useEffect(() => {
    loadSearchHistory();
  }, []);

  const loadSearchHistory = async () => {
    try {
      const history = await AsyncStorage.getItem('search_history');
      if (history) {
        setSearchHistory(JSON.parse(history));
      }
    } catch (error) {
      console.error('Error loading search history:', error);
    }
  };

  const saveSearchHistory = async (newHistory: string[]) => {
    try {
      await AsyncStorage.setItem('search_history', JSON.stringify(newHistory));
      setSearchHistory(newHistory);
    } catch (error) {
      console.error('Error saving search history:', error);
    }
  };

  // Mock search context
  const searchContext = useMemo<SearchContext>(() => ({
    device: {
      type: Platform.OS === 'ios' || Platform.OS === 'android' ? 'mobile' : 'desktop',
      os: Platform.OS,
      browser: Platform.OS === 'web' ? 'unknown' : undefined
    },
    session: {
      id: 'session_' + Date.now(),
      startTime: new Date().toISOString(),
      pageViews: 1,
      searchCount: 0
    }
  }), []);

  // Enhanced search with AI
  const search = useCallback(async (searchQuery: string, filters?: Record<string, any>): Promise<Product[]> => {
    if (!searchQuery.trim()) return [];
    
    setIsLoading(true);
    
    try {
      // Simulate AI-powered search API call
      const searchResults = await performAISearch(searchQuery, filters, searchContext);
      
      // Update search history
      const newHistory = [searchQuery, ...searchHistory.filter(h => h !== searchQuery)].slice(0, 10);
      saveSearchHistory(newHistory);
      
      // Track search analytics
      trackSearch(searchQuery, searchResults.length);
      
      setResults(searchResults);
      return searchResults;
    } catch (error) {
      console.error('Search error:', error);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [searchHistory, searchContext]);

  // Get intelligent suggestions
  const getSuggestions = useCallback(async (searchQuery: string): Promise<SearchSuggestion[]> => {
    if (!searchQuery.trim()) return [];
    
    try {
      // Simulate AI-powered suggestions
      const mockSuggestions: SearchSuggestion[] = [
        {
          id: '1',
          text: `${searchQuery} smartphone`,
          type: 'product',
          count: 45
        },
        {
          id: '2',
          text: `${searchQuery} accessories`,
          type: 'category',
          count: 23
        },
        {
          id: '3',
          text: searchQuery,
          type: 'query',
          count: 156
        }
      ];
      
      setSuggestions(mockSuggestions);
      return mockSuggestions;
    } catch (error) {
      console.error('Error getting suggestions:', error);
      return [];
    }
  }, []);

  // Voice search implementation
  const startVoiceSearch = useCallback(async (): Promise<void> => {
    if (Platform.OS === 'web') {
      // Web Speech API implementation
      if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
        const recognition = new SpeechRecognition();
        
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'es-ES';
        
        setIsVoiceSearching(true);
        
        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setQuery(transcript);
          search(transcript);
        };
        
        recognition.onerror = (event: any) => {
          console.error('Voice search error:', event.error);
          setIsVoiceSearching(false);
        };
        
        recognition.onend = () => {
          setIsVoiceSearching(false);
        };
        
        recognition.start();
      } else {
        console.warn('Speech recognition not supported');
      }
    } else {
      // Mobile voice search would use expo-speech or similar
      console.log('Voice search not implemented for mobile yet');
    }
  }, [search]);

  const stopVoiceSearch = useCallback(() => {
    setIsVoiceSearching(false);
  }, []);

  // AI recommendations
  const getRecommendations = useCallback(async (productId?: string): Promise<AIRecommendation[]> => {
    try {
      // Simulate AI recommendation API
      const mockRecommendations: AIRecommendation[] = [
        {
          id: '1',
          productId: 'prod_1',
          reason: 'Usuarios que vieron este producto también compraron',
          confidence: 0.85,
          type: 'similar'
        },
        {
          id: '2',
          productId: 'prod_2',
          reason: 'Basado en tu historial de compras',
          confidence: 0.92,
          type: 'personalized'
        },
        {
          id: '3',
          productId: 'prod_3',
          reason: 'Producto trending en tu categoría favorita',
          confidence: 0.78,
          type: 'trending'
        }
      ];
      
      return mockRecommendations;
    } catch (error) {
      console.error('Error getting recommendations:', error);
      return [];
    }
  }, []);

  // Analytics tracking
  const trackSearch = useCallback((searchQuery: string, resultCount: number) => {
    const analytics: SearchAnalytics = {
      query: searchQuery,
      results: resultCount,
      timestamp: new Date().toISOString(),
      userId: 'user_123' // Would come from auth context
    };
    
    // Send to analytics service
    console.log('Search analytics:', analytics);
  }, []);

  const trackClick = useCallback((productId: string, position: number) => {
    console.log('Product click tracked:', { productId, position, query });
  }, [query]);

  const clearSearchHistory = useCallback(async () => {
    try {
      await AsyncStorage.removeItem('search_history');
      setSearchHistory([]);
    } catch (error) {
      console.error('Error clearing search history:', error);
    }
  }, []);

  return {
    query,
    suggestions,
    results,
    facets,
    isLoading,
    isVoiceSearching,
    setQuery,
    search,
    getSuggestions,
    startVoiceSearch,
    stopVoiceSearch,
    getRecommendations,
    trackSearch,
    trackClick,
    searchHistory,
    clearSearchHistory
  };
}

// Mock AI search function
async function performAISearch(
  query: string, 
  filters?: Record<string, any>, 
  context?: SearchContext
): Promise<Product[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Mock search results with AI ranking
  const mockProducts: Product[] = [
    {
      id: 'ai_1',
      name: `${query} - Producto AI Recomendado`,
      description: 'Producto encontrado usando inteligencia artificial',
      price: 299.99,
      ncopPrice: 150,
      images: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400'],
      category: 'electronics',
      stock: 25,
      rating: 4.8,
      reviewCount: 156,
      sellerId: 'seller_ai',
      sellerName: 'AI Store',
      isDigital: false,
      tags: ['ai-recommended', 'trending'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];
  
  return mockProducts;
}