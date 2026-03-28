export interface DashboardMetric {
  id: string;
  name: string;
  value: number;
  previousValue: number;
  change: number;
  changeType: 'increase' | 'decrease' | 'neutral';
  unit: string;
  category: 'sales' | 'users' | 'engagement' | 'financial';
  timeframe: 'daily' | 'weekly' | 'monthly' | 'yearly';
  updatedAt: Date;
}

export interface CustomerSegment {
  id: string;
  name: string;
  description: string;
  criteria: SegmentCriteria;
  customerCount: number;
  averageValue: number;
  growthRate: number;
  color: string;
}

export interface SegmentCriteria {
  ageRange?: [number, number];
  location?: string[];
  purchaseHistory?: {
    minAmount?: number;
    maxAmount?: number;
    frequency?: 'low' | 'medium' | 'high';
  };
  engagement?: 'low' | 'medium' | 'high';
  loyaltyTier?: string;
}

export interface PredictiveAnalytics {
  demandForecast: DemandForecast[];
  customerLifetimeValue: CLVPrediction[];
  churnPrediction: ChurnPrediction[];
  revenueProjection: RevenueProjection;
}

export interface DemandForecast {
  productId: string;
  productName: string;
  currentDemand: number;
  predictedDemand: number;
  confidence: number;
  timeframe: string;
  factors: string[];
}

export interface CLVPrediction {
  customerId: string;
  currentValue: number;
  predictedValue: number;
  timeframe: number; // months
  confidence: number;
  riskFactors: string[];
}

export interface ChurnPrediction {
  customerId: string;
  churnProbability: number;
  riskLevel: 'low' | 'medium' | 'high';
  keyFactors: string[];
  recommendedActions: string[];
}

export interface RevenueProjection {
  currentMonth: number;
  projectedGrowth: number;
  confidenceInterval: [number, number];
  seasonalFactors: SeasonalFactor[];
  riskFactors: string[];
}

export interface SeasonalFactor {
  month: number;
  multiplier: number;
  description: string;
}

export interface RealTimeDashboard {
  activeUsers: number;
  currentSales: number;
  conversionRate: number;
  averageOrderValue: number;
  topProducts: ProductPerformance[];
  geographicDistribution: GeographicData[];
  trafficSources: TrafficSource[];
}

export interface ProductPerformance {
  id: string;
  name: string;
  sales: number;
  revenue: number;
  views: number;
  conversionRate: number;
  trend: 'up' | 'down' | 'stable';
}

export interface GeographicData {
  region: string;
  users: number;
  sales: number;
  averageOrderValue: number;
}

export interface TrafficSource {
  source: string;
  users: number;
  conversions: number;
  revenue: number;
  cost?: number;
  roi?: number;
}