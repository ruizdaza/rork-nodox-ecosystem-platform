import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Language,
  Currency,
  LocalizationConfig,
  RegionalSettings,
  CulturalAdaptation,
  LocalizationAnalytics
} from '@/types/internationalization';

const STORAGE_KEY = 'internationalization_data';

export const [InternationalizationProvider, useInternationalization] = createContextHook(() => {
  const [currentLanguage, setCurrentLanguage] = useState<string>('es');
  const [currentCurrency, setCurrentCurrency] = useState<string>('COP');
  const [currentRegion, setCurrentRegion] = useState<string>('CO');
  const queryClient = useQueryClient();

  // Localization config
  const localizationConfigQuery = useQuery({
    queryKey: ['localizationConfig'],
    queryFn: async (): Promise<LocalizationConfig> => {
      const stored = await AsyncStorage.getItem(`${STORAGE_KEY}_config`);
      if (stored) {
        return JSON.parse(stored);
      }
      return generateMockLocalizationConfig();
    },
  });

  // Regional settings
  const regionalSettingsQuery = useQuery({
    queryKey: ['regionalSettings', currentRegion],
    queryFn: async (): Promise<RegionalSettings> => {
      const stored = await AsyncStorage.getItem(`${STORAGE_KEY}_regional_${currentRegion}`);
      if (stored) {
        return JSON.parse(stored);
      }
      return generateMockRegionalSettings(currentRegion);
    },
  });

  // Cultural adaptations
  const culturalAdaptationQuery = useQuery({
    queryKey: ['culturalAdaptation', currentRegion],
    queryFn: async (): Promise<CulturalAdaptation> => {
      const stored = await AsyncStorage.getItem(`${STORAGE_KEY}_cultural_${currentRegion}`);
      if (stored) {
        return JSON.parse(stored);
      }
      return generateMockCulturalAdaptation(currentRegion);
    },
  });

  // Analytics
  const analyticsQuery = useQuery({
    queryKey: ['localizationAnalytics'],
    queryFn: async (): Promise<LocalizationAnalytics> => {
      const stored = await AsyncStorage.getItem(`${STORAGE_KEY}_analytics`);
      if (stored) {
        return JSON.parse(stored);
      }
      return generateMockAnalytics();
    },
  });

  // Update language
  const updateLanguageMutation = useMutation({
    mutationFn: async (languageCode: string) => {
      await AsyncStorage.setItem(`${STORAGE_KEY}_current_language`, languageCode);
      return languageCode;
    },
    onSuccess: (languageCode) => {
      setCurrentLanguage(languageCode);
      queryClient.invalidateQueries({ queryKey: ['localizationConfig'] });
    },
  });

  // Update currency
  const updateCurrencyMutation = useMutation({
    mutationFn: async (currencyCode: string) => {
      await AsyncStorage.setItem(`${STORAGE_KEY}_current_currency`, currencyCode);
      return currencyCode;
    },
    onSuccess: (currencyCode) => {
      setCurrentCurrency(currencyCode);
      queryClient.invalidateQueries({ queryKey: ['regionalSettings'] });
    },
  });

  // Update region
  const updateRegionMutation = useMutation({
    mutationFn: async (regionCode: string) => {
      await AsyncStorage.setItem(`${STORAGE_KEY}_current_region`, regionCode);
      return regionCode;
    },
    onSuccess: (regionCode) => {
      setCurrentRegion(regionCode);
      queryClient.invalidateQueries({ queryKey: ['regionalSettings'] });
      queryClient.invalidateQueries({ queryKey: ['culturalAdaptation'] });
    },
  });

  // Add new language
  const addLanguageMutation = useMutation({
    mutationFn: async (language: Language) => {
      const config = localizationConfigQuery.data;
      if (!config) throw new Error('Config not loaded');
      
      const updatedConfig = {
        ...config,
        supportedLanguages: [...config.supportedLanguages, language],
      };
      
      await AsyncStorage.setItem(`${STORAGE_KEY}_config`, JSON.stringify(updatedConfig));
      return language;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['localizationConfig'] });
    },
  });

  // Add new currency
  const addCurrencyMutation = useMutation({
    mutationFn: async (currency: Currency) => {
      const config = localizationConfigQuery.data;
      if (!config) throw new Error('Config not loaded');
      
      const updatedConfig = {
        ...config,
        supportedCurrencies: [...config.supportedCurrencies, currency],
      };
      
      await AsyncStorage.setItem(`${STORAGE_KEY}_config`, JSON.stringify(updatedConfig));
      return currency;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['localizationConfig'] });
    },
  });

  // Translation functions
  const translate = (key: string, params?: Record<string, string>): string => {
    // In a real app, this would use a translation service
    const translations: Record<string, Record<string, string>> = {
      es: {
        'welcome': 'Bienvenido',
        'hello': 'Hola {{name}}',
        'goodbye': 'Adiós',
        'thank_you': 'Gracias',
        'please': 'Por favor',
        'yes': 'Sí',
        'no': 'No',
        'cancel': 'Cancelar',
        'confirm': 'Confirmar',
        'save': 'Guardar',
        'delete': 'Eliminar',
        'edit': 'Editar',
        'add': 'Agregar',
        'search': 'Buscar',
        'filter': 'Filtrar',
        'sort': 'Ordenar',
        'loading': 'Cargando...',
        'error': 'Error',
        'success': 'Éxito',
      },
      en: {
        'welcome': 'Welcome',
        'hello': 'Hello {{name}}',
        'goodbye': 'Goodbye',
        'thank_you': 'Thank you',
        'please': 'Please',
        'yes': 'Yes',
        'no': 'No',
        'cancel': 'Cancel',
        'confirm': 'Confirm',
        'save': 'Save',
        'delete': 'Delete',
        'edit': 'Edit',
        'add': 'Add',
        'search': 'Search',
        'filter': 'Filter',
        'sort': 'Sort',
        'loading': 'Loading...',
        'error': 'Error',
        'success': 'Success',
      },
      pt: {
        'welcome': 'Bem-vindo',
        'hello': 'Olá {{name}}',
        'goodbye': 'Tchau',
        'thank_you': 'Obrigado',
        'please': 'Por favor',
        'yes': 'Sim',
        'no': 'Não',
        'cancel': 'Cancelar',
        'confirm': 'Confirmar',
        'save': 'Salvar',
        'delete': 'Excluir',
        'edit': 'Editar',
        'add': 'Adicionar',
        'search': 'Buscar',
        'filter': 'Filtrar',
        'sort': 'Ordenar',
        'loading': 'Carregando...',
        'error': 'Erro',
        'success': 'Sucesso',
      },
    };

    let translation = translations[currentLanguage]?.[key] || translations['es'][key] || key;
    
    if (params) {
      Object.entries(params).forEach(([param, value]) => {
        translation = translation.replace(`{{${param}}}`, value);
      });
    }
    
    return translation;
  };

  // Format currency
  const formatCurrency = (amount: number, currencyCode?: string): string => {
    const currency = currencyCode || currentCurrency;
    const config = localizationConfigQuery.data;
    const currencyInfo = config?.supportedCurrencies.find(c => c.code === currency);
    
    if (!currencyInfo) return `${amount}`;
    
    const formatted = amount.toFixed(currencyInfo.decimals);
    const symbol = currencyInfo.symbol;
    
    if (config?.numberFormat.currencyPosition === 'before') {
      return config.numberFormat.currencySpacing ? `${symbol} ${formatted}` : `${symbol}${formatted}`;
    } else {
      return config.numberFormat.currencySpacing ? `${formatted} ${symbol}` : `${formatted}${symbol}`;
    }
  };

  // Format date
  const formatDate = (date: Date): string => {
    const config = localizationConfigQuery.data;
    if (!config) return date.toLocaleDateString();
    
    // Simple date formatting based on region
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    };
    
    return date.toLocaleDateString(currentLanguage, options);
  };

  // Format number
  const formatNumber = (number: number): string => {
    const config = localizationConfigQuery.data;
    if (!config) return number.toString();
    
    return number.toLocaleString(currentLanguage, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });
  };

  // Get supported regions
  const getSupportedRegions = (): string[] => {
    return ['CO', 'MX', 'AR', 'CL', 'PE', 'EC', 'VE', 'BO', 'PY', 'UY', 'US', 'CA', 'BR'];
  };

  // Load stored preferences
  useEffect(() => {
    const loadStoredPreferences = async () => {
      try {
        const storedLanguage = await AsyncStorage.getItem(`${STORAGE_KEY}_current_language`);
        const storedCurrency = await AsyncStorage.getItem(`${STORAGE_KEY}_current_currency`);
        const storedRegion = await AsyncStorage.getItem(`${STORAGE_KEY}_current_region`);
        
        if (storedLanguage) setCurrentLanguage(storedLanguage);
        if (storedCurrency) setCurrentCurrency(storedCurrency);
        if (storedRegion) setCurrentRegion(storedRegion);
      } catch (error) {
        console.error('Error loading stored preferences:', error);
      }
    };
    
    loadStoredPreferences();
  }, []);

  return {
    // Data
    localizationConfig: localizationConfigQuery.data,
    regionalSettings: regionalSettingsQuery.data,
    culturalAdaptation: culturalAdaptationQuery.data,
    analytics: analyticsQuery.data,
    
    // Current settings
    currentLanguage,
    currentCurrency,
    currentRegion,
    
    // Loading states
    isLoadingConfig: localizationConfigQuery.isLoading,
    isLoadingRegional: regionalSettingsQuery.isLoading,
    isLoadingCultural: culturalAdaptationQuery.isLoading,
    isLoadingAnalytics: analyticsQuery.isLoading,
    
    // Actions
    updateLanguage: updateLanguageMutation.mutate,
    updateCurrency: updateCurrencyMutation.mutate,
    updateRegion: updateRegionMutation.mutate,
    addLanguage: addLanguageMutation.mutate,
    addCurrency: addCurrencyMutation.mutate,
    
    // Utility functions
    translate,
    formatCurrency,
    formatDate,
    formatNumber,
    getSupportedRegions,
    
    // Mutation states
    isUpdatingLanguage: updateLanguageMutation.isPending,
    isUpdatingCurrency: updateCurrencyMutation.isPending,
    isUpdatingRegion: updateRegionMutation.isPending,
    isAddingLanguage: addLanguageMutation.isPending,
    isAddingCurrency: addCurrencyMutation.isPending,
  };
});

// Helper functions to generate mock data
function generateMockLocalizationConfig(): LocalizationConfig {
  return {
    defaultLanguage: 'es',
    defaultCurrency: 'COP',
    supportedLanguages: [
      { code: 'es', name: 'Spanish', nativeName: 'Español', isRTL: false, isActive: true, completionPercentage: 100 },
      { code: 'en', name: 'English', nativeName: 'English', isRTL: false, isActive: true, completionPercentage: 95 },
      { code: 'pt', name: 'Portuguese', nativeName: 'Português', isRTL: false, isActive: true, completionPercentage: 85 },
      { code: 'fr', name: 'French', nativeName: 'Français', isRTL: false, isActive: false, completionPercentage: 60 },
    ],
    supportedCurrencies: [
      { code: 'COP', name: 'Colombian Peso', symbol: '$', decimals: 0, exchangeRate: 1, isActive: true, lastUpdated: new Date() },
      { code: 'USD', name: 'US Dollar', symbol: '$', decimals: 2, exchangeRate: 0.00025, isActive: true, lastUpdated: new Date() },
      { code: 'EUR', name: 'Euro', symbol: '€', decimals: 2, exchangeRate: 0.00023, isActive: true, lastUpdated: new Date() },
      { code: 'MXN', name: 'Mexican Peso', symbol: '$', decimals: 2, exchangeRate: 0.0045, isActive: true, lastUpdated: new Date() },
    ],
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '24h',
    numberFormat: {
      decimalSeparator: ',',
      thousandsSeparator: '.',
      currencyPosition: 'before',
      currencySpacing: true,
    },
    addressFormat: {
      format: '{{street}} {{number}}, {{city}}, {{state}} {{postalCode}}, {{country}}',
      requiredFields: ['street', 'city', 'state', 'country'],
      optionalFields: ['number', 'postalCode', 'apartment'],
      postalCodeRegex: '^\\d{6}$',
      phoneFormat: '+57 ### ### ####',
    },
  };
}

function generateMockRegionalSettings(region: string): RegionalSettings {
  const regionData: Record<string, Partial<RegionalSettings>> = {
    CO: {
      country: 'Colombia',
      region: 'South America',
      timezone: 'America/Bogota',
      language: 'es',
      currency: 'COP',
      taxRate: 19,
    },
    MX: {
      country: 'Mexico',
      region: 'North America',
      timezone: 'America/Mexico_City',
      language: 'es',
      currency: 'MXN',
      taxRate: 16,
    },
    US: {
      country: 'United States',
      region: 'North America',
      timezone: 'America/New_York',
      language: 'en',
      currency: 'USD',
      taxRate: 8.5,
    },
  };

  const base = regionData[region] || regionData.CO;
  
  return {
    country: base.country || 'Colombia',
    region: base.region || 'South America',
    timezone: base.timezone || 'America/Bogota',
    language: base.language || 'es',
    currency: base.currency || 'COP',
    taxRate: base.taxRate || 19,
    shippingZones: [
      {
        id: 'domestic',
        name: 'Domestic',
        countries: [region],
        rates: [
          { method: 'Standard', cost: 5000, estimatedDays: [3, 5] },
          { method: 'Express', cost: 12000, estimatedDays: [1, 2] },
        ],
      },
    ],
    paymentMethods: [
      {
        id: 'card',
        name: 'Credit/Debit Card',
        type: 'card',
        isActive: true,
        supportedCurrencies: [base.currency || 'COP'],
        fees: [{ type: 'percentage', value: 2.9, description: 'Processing fee' }],
        requirements: ['Valid card', 'CVV verification'],
      },
    ],
    legalRequirements: [
      {
        type: 'tax_collection',
        description: 'Sales tax collection required',
        isRequired: true,
        implementation: 'Automatic calculation',
      },
    ],
  };
}

function generateMockCulturalAdaptation(region: string): CulturalAdaptation {
  return {
    country: region,
    colorPreferences: [
      { color: '#FFD700', meaning: 'Prosperity', usage: 'positive', context: 'Financial success' },
      { color: '#FF0000', meaning: 'Passion', usage: 'positive', context: 'Love and energy' },
      { color: '#000000', meaning: 'Elegance', usage: 'neutral', context: 'Formal occasions' },
    ],
    imageGuidelines: [
      { type: 'people', guideline: 'Show diverse representation', reasoning: 'Inclusive marketing' },
      { type: 'symbols', guideline: 'Avoid religious symbols', reasoning: 'Secular approach' },
    ],
    contentGuidelines: [
      { type: 'tone', guideline: 'Friendly and approachable', examples: ['¡Hola!', 'Te ayudamos'] },
      { type: 'formality', guideline: 'Semi-formal', examples: ['Usted/Tú balance'] },
    ],
    holidaysAndEvents: [
      { name: 'New Year', date: '01-01', type: 'national', impact: 'high', marketingOpportunity: true },
      { name: 'Christmas', date: '12-25', type: 'religious', impact: 'high', marketingOpportunity: true },
    ],
    businessHours: {
      timezone: 'America/Bogota',
      weekdays: { isOpen: true, openTime: '08:00', closeTime: '18:00' },
      weekends: { isOpen: true, openTime: '09:00', closeTime: '17:00' },
      holidays: { isOpen: false },
    },
  };
}

function generateMockAnalytics(): LocalizationAnalytics {
  return {
    languageUsage: [
      { language: 'es', users: 15000, sessions: 45000, conversionRate: 3.2, revenue: 125000 },
      { language: 'en', users: 8000, sessions: 22000, conversionRate: 4.1, revenue: 95000 },
      { language: 'pt', users: 3500, sessions: 9500, conversionRate: 2.8, revenue: 28000 },
    ],
    currencyUsage: [
      { currency: 'COP', transactions: 2500, volume: 125000000, averageOrderValue: 50000 },
      { currency: 'USD', transactions: 1200, volume: 240000, averageOrderValue: 200 },
      { currency: 'EUR', transactions: 800, volume: 160000, averageOrderValue: 200 },
    ],
    regionPerformance: [
      { region: 'Colombia', users: 12000, revenue: 85000, growthRate: 15.2, topProducts: ['Service A', 'Product B'] },
      { region: 'Mexico', users: 8500, revenue: 65000, growthRate: 22.1, topProducts: ['Product C', 'Service D'] },
      { region: 'United States', users: 5000, revenue: 95000, growthRate: 8.7, topProducts: ['Premium Service', 'Product E'] },
    ],
    translationQuality: [
      { language: 'es', completeness: 100, accuracy: 98, lastReview: new Date(), pendingUpdates: 0 },
      { language: 'en', completeness: 95, accuracy: 96, lastReview: new Date(), pendingUpdates: 5 },
      { language: 'pt', completeness: 85, accuracy: 92, lastReview: new Date(), pendingUpdates: 12 },
    ],
  };
}