export interface Language {
  code: string; // ISO 639-1
  name: string;
  nativeName: string;
  isRTL: boolean;
  isActive: boolean;
  completionPercentage: number;
}

export interface Translation {
  key: string;
  translations: Record<string, string>;
  context?: string;
  description?: string;
  lastUpdated: Date;
}

export interface Currency {
  code: string; // ISO 4217
  name: string;
  symbol: string;
  decimals: number;
  exchangeRate: number;
  isActive: boolean;
  lastUpdated: Date;
}

export interface LocalizationConfig {
  defaultLanguage: string;
  defaultCurrency: string;
  supportedLanguages: Language[];
  supportedCurrencies: Currency[];
  dateFormat: string;
  timeFormat: string;
  numberFormat: NumberFormatConfig;
  addressFormat: AddressFormatConfig;
}

export interface NumberFormatConfig {
  decimalSeparator: string;
  thousandsSeparator: string;
  currencyPosition: 'before' | 'after';
  currencySpacing: boolean;
}

export interface AddressFormatConfig {
  format: string; // Template with placeholders
  requiredFields: string[];
  optionalFields: string[];
  postalCodeRegex?: string;
  phoneFormat?: string;
}

export interface RegionalSettings {
  country: string;
  region: string;
  timezone: string;
  language: string;
  currency: string;
  taxRate: number;
  shippingZones: ShippingZone[];
  paymentMethods: PaymentMethodConfig[];
  legalRequirements: LegalRequirement[];
}

export interface ShippingZone {
  id: string;
  name: string;
  countries: string[];
  rates: ShippingRate[];
  restrictions?: ShippingRestriction[];
}

export interface ShippingRate {
  method: string;
  cost: number;
  estimatedDays: [number, number];
  maxWeight?: number;
  maxDimensions?: Dimensions;
}

export interface Dimensions {
  length: number;
  width: number;
  height: number;
  unit: 'cm' | 'in';
}

export interface ShippingRestriction {
  type: 'product_category' | 'weight' | 'dimensions' | 'value';
  condition: string;
  message: string;
}

export interface PaymentMethodConfig {
  id: string;
  name: string;
  type: 'card' | 'bank_transfer' | 'digital_wallet' | 'cash' | 'crypto';
  isActive: boolean;
  supportedCurrencies: string[];
  fees: PaymentFee[];
  requirements: string[];
}

export interface PaymentFee {
  type: 'fixed' | 'percentage';
  value: number;
  currency?: string;
  description: string;
}

export interface LegalRequirement {
  type: 'gdpr' | 'ccpa' | 'tax_collection' | 'age_verification' | 'content_restriction';
  description: string;
  isRequired: boolean;
  implementation: string;
}

export interface CulturalAdaptation {
  country: string;
  colorPreferences: ColorPreference[];
  imageGuidelines: ImageGuideline[];
  contentGuidelines: ContentGuideline[];
  holidaysAndEvents: Holiday[];
  businessHours: BusinessHours;
}

export interface ColorPreference {
  color: string;
  meaning: string;
  usage: 'positive' | 'negative' | 'neutral' | 'avoid';
  context: string;
}

export interface ImageGuideline {
  type: 'people' | 'symbols' | 'gestures' | 'clothing';
  guideline: string;
  reasoning: string;
}

export interface ContentGuideline {
  type: 'tone' | 'formality' | 'topics' | 'references';
  guideline: string;
  examples: string[];
}

export interface Holiday {
  name: string;
  date: string; // MM-DD format
  type: 'national' | 'religious' | 'cultural' | 'commercial';
  impact: 'high' | 'medium' | 'low';
  marketingOpportunity: boolean;
}

export interface BusinessHours {
  timezone: string;
  weekdays: DaySchedule;
  weekends: DaySchedule;
  holidays: DaySchedule;
}

export interface DaySchedule {
  isOpen: boolean;
  openTime?: string; // HH:MM format
  closeTime?: string; // HH:MM format
  breaks?: TimeSlot[];
}

export interface TimeSlot {
  start: string; // HH:MM format
  end: string; // HH:MM format
}

export interface LocalizationAnalytics {
  languageUsage: LanguageUsage[];
  currencyUsage: CurrencyUsage[];
  regionPerformance: RegionPerformance[];
  translationQuality: TranslationQuality[];
}

export interface LanguageUsage {
  language: string;
  users: number;
  sessions: number;
  conversionRate: number;
  revenue: number;
}

export interface CurrencyUsage {
  currency: string;
  transactions: number;
  volume: number;
  averageOrderValue: number;
}

export interface RegionPerformance {
  region: string;
  users: number;
  revenue: number;
  growthRate: number;
  topProducts: string[];
}

export interface TranslationQuality {
  language: string;
  completeness: number;
  accuracy: number;
  lastReview: Date;
  pendingUpdates: number;
}