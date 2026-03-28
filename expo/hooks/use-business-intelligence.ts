import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  DashboardMetric,
  CustomerSegment,
  PredictiveAnalytics,
  RealTimeDashboard,
  ProductPerformance,
  GeographicData,
  TrafficSource
} from '@/types/business-intelligence';

const STORAGE_KEY = 'business_intelligence_data';

export const [BusinessIntelligenceProvider, useBusinessIntelligence] = createContextHook(() => {
  const [selectedTimeframe, setSelectedTimeframe] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('monthly');
  const [selectedSegment, setSelectedSegment] = useState<string | null>(null);
  const [dashboardConfig, setDashboardConfig] = useState<string[]>([
    'sales', 'users', 'engagement', 'financial'
  ]);
  const queryClient = useQueryClient();

  // Real-time dashboard data
  const realTimeDashboardQuery = useQuery({
    queryKey: ['realTimeDashboard'],
    queryFn: async (): Promise<RealTimeDashboard> => {
      // Simulate real-time data
      return {
        activeUsers: Math.floor(Math.random() * 1000) + 500,
        currentSales: Math.floor(Math.random() * 50000) + 10000,
        conversionRate: Math.random() * 5 + 2,
        averageOrderValue: Math.random() * 100 + 50,
        topProducts: generateMockProductPerformance(),
        geographicDistribution: generateMockGeographicData(),
        trafficSources: generateMockTrafficSources()
      };
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Dashboard metrics
  const metricsQuery = useQuery({
    queryKey: ['dashboardMetrics', selectedTimeframe],
    queryFn: async (): Promise<DashboardMetric[]> => {
      const stored = await AsyncStorage.getItem(`${STORAGE_KEY}_metrics_${selectedTimeframe}`);
      if (stored) {
        return JSON.parse(stored);
      }
      return generateMockMetrics(selectedTimeframe);
    },
  });

  // Customer segments
  const segmentsQuery = useQuery({
    queryKey: ['customerSegments'],
    queryFn: async (): Promise<CustomerSegment[]> => {
      const stored = await AsyncStorage.getItem(`${STORAGE_KEY}_segments`);
      if (stored) {
        return JSON.parse(stored);
      }
      return generateMockSegments();
    },
  });

  // Predictive analytics
  const predictiveAnalyticsQuery = useQuery({
    queryKey: ['predictiveAnalytics'],
    queryFn: async (): Promise<PredictiveAnalytics> => {
      const stored = await AsyncStorage.getItem(`${STORAGE_KEY}_predictive`);
      if (stored) {
        return JSON.parse(stored);
      }
      return generateMockPredictiveAnalytics();
    },
  });

  // Update dashboard configuration
  const updateDashboardConfigMutation = useMutation({
    mutationFn: async (config: string[]) => {
      await AsyncStorage.setItem(`${STORAGE_KEY}_config`, JSON.stringify(config));
      return config;
    },
    onSuccess: (config) => {
      setDashboardConfig(config);
      queryClient.invalidateQueries({ queryKey: ['dashboardMetrics'] });
    },
  });

  // Create custom segment
  const createSegmentMutation = useMutation({
    mutationFn: async (segment: Omit<CustomerSegment, 'id'>) => {
      const newSegment: CustomerSegment = {
        ...segment,
        id: Date.now().toString(),
      };
      
      const currentSegments = segmentsQuery.data || [];
      const updatedSegments = [...currentSegments, newSegment];
      
      await AsyncStorage.setItem(`${STORAGE_KEY}_segments`, JSON.stringify(updatedSegments));
      return newSegment;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customerSegments'] });
    },
  });

  // Export data
  const exportDataMutation = useMutation({
    mutationFn: async (format: 'csv' | 'json' | 'pdf') => {
      const data = {
        metrics: metricsQuery.data,
        segments: segmentsQuery.data,
        predictive: predictiveAnalyticsQuery.data,
        realTime: realTimeDashboardQuery.data,
      };
      
      // In a real app, this would generate and download the file
      console.log(`Exporting data in ${format} format:`, data);
      return { success: true, format, timestamp: new Date() };
    },
  });

  // Generate alerts based on metrics
  const generateAlerts = () => {
    const metrics = metricsQuery.data || [];
    const alerts: string[] = [];

    metrics.forEach(metric => {
      if (metric.changeType === 'decrease' && Math.abs(metric.change) > 10) {
        alerts.push(`${metric.name} has decreased by ${Math.abs(metric.change)}%`);
      }
      if (metric.category === 'financial' && metric.change < -5) {
        alerts.push(`Financial metric ${metric.name} requires attention`);
      }
    });

    return alerts;
  };

  return {
    // Data
    realTimeDashboard: realTimeDashboardQuery.data,
    metrics: metricsQuery.data || [],
    segments: segmentsQuery.data || [],
    predictiveAnalytics: predictiveAnalyticsQuery.data,
    
    // State
    selectedTimeframe,
    selectedSegment,
    dashboardConfig,
    
    // Loading states
    isLoadingRealTime: realTimeDashboardQuery.isLoading,
    isLoadingMetrics: metricsQuery.isLoading,
    isLoadingSegments: segmentsQuery.isLoading,
    isLoadingPredictive: predictiveAnalyticsQuery.isLoading,
    
    // Actions
    setSelectedTimeframe,
    setSelectedSegment,
    updateDashboardConfig: updateDashboardConfigMutation.mutate,
    createSegment: createSegmentMutation.mutate,
    exportData: exportDataMutation.mutate,
    refreshRealTime: realTimeDashboardQuery.refetch,
    generateAlerts,
    
    // Mutation states
    isUpdatingConfig: updateDashboardConfigMutation.isPending,
    isCreatingSegment: createSegmentMutation.isPending,
    isExporting: exportDataMutation.isPending,
  };
});

// Helper functions to generate mock data
function generateMockMetrics(timeframe: string): DashboardMetric[] {
  const categories = ['sales', 'users', 'engagement', 'financial'] as const;
  const metrics: DashboardMetric[] = [];

  categories.forEach(category => {
    const baseValue = Math.floor(Math.random() * 10000) + 1000;
    const previousValue = baseValue + (Math.random() - 0.5) * 2000;
    const change = ((baseValue - previousValue) / previousValue) * 100;

    metrics.push({
      id: `${category}_${timeframe}`,
      name: `${category.charAt(0).toUpperCase() + category.slice(1)} ${timeframe}`,
      value: baseValue,
      previousValue,
      change: Math.round(change * 100) / 100,
      changeType: change > 0 ? 'increase' : change < 0 ? 'decrease' : 'neutral',
      unit: category === 'financial' ? '$' : category === 'users' ? 'users' : '%',
      category,
      timeframe: timeframe as any,
      updatedAt: new Date(),
    });
  });

  return metrics;
}

function generateMockSegments(): CustomerSegment[] {
  return [
    {
      id: '1',
      name: 'High Value Customers',
      description: 'Customers with high lifetime value',
      criteria: {
        purchaseHistory: { minAmount: 1000, frequency: 'high' },
        engagement: 'high',
      },
      customerCount: 1250,
      averageValue: 2500,
      growthRate: 15.5,
      color: '#10B981',
    },
    {
      id: '2',
      name: 'New Customers',
      description: 'Recently acquired customers',
      criteria: {
        purchaseHistory: { frequency: 'low' },
        engagement: 'medium',
      },
      customerCount: 3200,
      averageValue: 150,
      growthRate: 25.2,
      color: '#3B82F6',
    },
    {
      id: '3',
      name: 'At Risk',
      description: 'Customers showing signs of churn',
      criteria: {
        engagement: 'low',
        purchaseHistory: { frequency: 'low' },
      },
      customerCount: 850,
      averageValue: 75,
      growthRate: -8.3,
      color: '#EF4444',
    },
  ];
}

function generateMockPredictiveAnalytics(): PredictiveAnalytics {
  return {
    demandForecast: [
      {
        productId: '1',
        productName: 'Premium Service',
        currentDemand: 100,
        predictedDemand: 125,
        confidence: 0.85,
        timeframe: 'Next 30 days',
        factors: ['Seasonal trend', 'Marketing campaign', 'Price optimization'],
      },
    ],
    customerLifetimeValue: [
      {
        customerId: '1',
        currentValue: 500,
        predictedValue: 750,
        timeframe: 12,
        confidence: 0.78,
        riskFactors: ['Payment delays', 'Reduced engagement'],
      },
    ],
    churnPrediction: [
      {
        customerId: '2',
        churnProbability: 0.65,
        riskLevel: 'high',
        keyFactors: ['No recent purchases', 'Low app usage', 'Support tickets'],
        recommendedActions: ['Send retention offer', 'Personal outreach', 'Survey feedback'],
      },
    ],
    revenueProjection: {
      currentMonth: 50000,
      projectedGrowth: 12.5,
      confidenceInterval: [45000, 65000],
      seasonalFactors: [
        { month: 12, multiplier: 1.3, description: 'Holiday season boost' },
        { month: 1, multiplier: 0.8, description: 'Post-holiday decline' },
      ],
      riskFactors: ['Economic uncertainty', 'Increased competition'],
    },
  };
}

function generateMockProductPerformance(): ProductPerformance[] {
  return [
    {
      id: '1',
      name: 'Premium Service',
      sales: 150,
      revenue: 15000,
      views: 2500,
      conversionRate: 6.0,
      trend: 'up',
    },
    {
      id: '2',
      name: 'Basic Package',
      sales: 300,
      revenue: 9000,
      views: 5000,
      conversionRate: 6.0,
      trend: 'stable',
    },
  ];
}

function generateMockGeographicData(): GeographicData[] {
  return [
    {
      region: 'North America',
      users: 5000,
      sales: 25000,
      averageOrderValue: 125,
    },
    {
      region: 'Europe',
      users: 3500,
      sales: 18000,
      averageOrderValue: 110,
    },
    {
      region: 'Latin America',
      users: 2800,
      sales: 12000,
      averageOrderValue: 85,
    },
  ];
}

function generateMockTrafficSources(): TrafficSource[] {
  return [
    {
      source: 'Organic Search',
      users: 4500,
      conversions: 450,
      revenue: 22500,
      cost: 0,
      roi: Infinity,
    },
    {
      source: 'Social Media',
      users: 2800,
      conversions: 280,
      revenue: 14000,
      cost: 2000,
      roi: 6.0,
    },
    {
      source: 'Paid Ads',
      users: 1200,
      conversions: 180,
      revenue: 9000,
      cost: 3000,
      roi: 2.0,
    },
  ];
}