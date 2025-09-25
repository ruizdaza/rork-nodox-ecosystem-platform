import createContextHook from '@nkzw/create-context-hook';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useCallback, useMemo, useEffect } from 'react';
import { Platform } from 'react-native';
import {
  NotificationAnalytics,
  NotificationMetrics,
  NotificationSegment,
  ABTest,
  ABTestVariant,
  NotificationFrequencyRule,
  NotificationInsight,
  NotificationOptimization,
  NotificationType,
  NotificationCategory
} from '@/types/notifications';

const STORAGE_KEYS = {
  NOTIFICATION_ANALYTICS: 'nodox_notification_analytics',
  NOTIFICATION_SEGMENTS: 'nodox_notification_segments',
  AB_TESTS: 'nodox_ab_tests',
  FREQUENCY_RULES: 'nodox_frequency_rules',
  PERSONALIZATION_RULES: 'nodox_personalization_rules',
  CAMPAIGNS: 'nodox_campaigns',
  INSIGHTS: 'nodox_insights',
  OPTIMIZATIONS: 'nodox_optimizations',
};

// Mock data for demonstration
const mockAnalytics: NotificationAnalytics[] = [
  {
    id: 'analytics-1',
    notificationId: 'notif-1',
    type: 'payment_received',
    category: 'wallet',
    sentAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
    deliveredAt: new Date(Date.now() - 1000 * 60 * 60 * 2 + 1000),
    openedAt: new Date(Date.now() - 1000 * 60 * 60 * 1),
    clickedAt: new Date(Date.now() - 1000 * 60 * 50),
    userId: 'user-1',
    deviceType: 'mobile',
    platform: Platform.OS as 'ios' | 'android' | 'web',
    metadata: {
      title: 'Pago Recibido',
      body: 'Has recibido $50.000 COP',
      priority: 'high',
      hasAction: true,
      actionType: 'view_transaction'
    }
  },
  {
    id: 'analytics-2',
    notificationId: 'notif-2',
    type: 'offer_available',
    category: 'offers',
    sentAt: new Date(Date.now() - 1000 * 60 * 60 * 4),
    deliveredAt: new Date(Date.now() - 1000 * 60 * 60 * 4 + 2000),
    openedAt: new Date(Date.now() - 1000 * 60 * 60 * 3),
    userId: 'user-1',
    deviceType: 'mobile',
    platform: Platform.OS as 'ios' | 'android' | 'web',
    metadata: {
      title: 'Nueva Oferta',
      body: '25% OFF en Pizza Familiar',
      priority: 'normal',
      hasAction: true,
      actionType: 'view_offer'
    }
  }
];

const mockSegments: NotificationSegment[] = [
  {
    id: 'segment-1',
    name: 'Usuarios Activos',
    description: 'Usuarios que han realizado transacciones en los últimos 7 días',
    criteria: {
      userType: 'active',
      lastActiveWithin: 7,
      transactionCount: { min: 1 }
    },
    userCount: 1250,
    metrics: {
      totalSent: 5000,
      totalDelivered: 4850,
      totalOpened: 3395,
      totalClicked: 1455,
      totalDismissed: 485,
      deliveryRate: 97.0,
      openRate: 70.0,
      clickRate: 42.9,
      dismissalRate: 10.0,
      engagementRate: 79.4,
      conversionRate: 29.1
    },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30),
    updatedAt: new Date()
  }
];

const mockABTests: ABTest[] = [
  {
    id: 'ab-test-1',
    name: 'Título de Pago Recibido',
    description: 'Probar diferentes títulos para notificaciones de pago recibido',
    type: 'payment_received',
    category: 'wallet',
    status: 'running',
    variants: [
      {
        id: 'variant-a',
        name: 'Control',
        title: 'Pago Recibido',
        body: 'Has recibido {amount} {currency}',
        priority: 'high',
        hasAction: true,
        actionText: 'Ver Detalles',
        weight: 50,
        metrics: {
          totalSent: 1000,
          totalDelivered: 970,
          totalOpened: 679,
          totalClicked: 271,
          totalDismissed: 97,
          deliveryRate: 97.0,
          openRate: 70.0,
          clickRate: 39.9,
          dismissalRate: 10.0,
          engagementRate: 77.9,
          conversionRate: 27.1
        }
      },
      {
        id: 'variant-b',
        name: 'Emoji + Personalizado',
        title: '💰 ¡Dinero recibido!',
        body: '¡Genial! Recibiste {amount} {currency}',
        priority: 'high',
        hasAction: true,
        actionText: '👀 Ver Ahora',
        weight: 50,
        metrics: {
          totalSent: 1000,
          totalDelivered: 975,
          totalOpened: 731,
          totalClicked: 329,
          totalDismissed: 98,
          deliveryRate: 97.5,
          openRate: 75.0,
          clickRate: 45.0,
          dismissalRate: 10.1,
          engagementRate: 82.6,
          conversionRate: 32.9
        }
      }
    ],
    targetSegment: 'segment-1',
    startDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
    sampleSize: 2000,
    confidenceLevel: 95,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10),
    updatedAt: new Date()
  }
];

const mockFrequencyRules: NotificationFrequencyRule[] = [
  {
    id: 'freq-1',
    category: 'offers',
    maxPerHour: 1,
    maxPerDay: 3,
    maxPerWeek: 10,
    cooldownMinutes: 60,
    priority: 'normal'
  },
  {
    id: 'freq-2',
    category: 'social',
    maxPerHour: 5,
    maxPerDay: 20,
    maxPerWeek: 100,
    cooldownMinutes: 10,
    priority: 'low'
  }
];

const mockInsights: NotificationInsight[] = [
  {
    id: 'insight-1',
    type: 'trend',
    category: 'wallet',
    title: 'Mejora en Engagement de Pagos',
    description: 'Las notificaciones de pago han mejorado su tasa de apertura en un 15% esta semana',
    severity: 'medium',
    data: {
      metric: 'open_rate',
      change: 15.2,
      period: '7d',
      previousValue: 65.3,
      currentValue: 75.2
    },
    actionable: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2)
  },
  {
    id: 'insight-2',
    type: 'recommendation',
    category: 'offers',
    title: 'Optimizar Horario de Ofertas',
    description: 'Las ofertas enviadas entre 7-9 PM tienen 40% más engagement',
    severity: 'high',
    data: {
      optimalHours: [19, 20, 21],
      currentEngagement: 45.2,
      potentialEngagement: 63.3,
      improvement: 40.0
    },
    actionable: true,
    actions: [
      {
        label: 'Programar Ofertas en Horario Óptimo',
        action: 'schedule_optimal_time',
        params: { hours: [19, 20, 21] }
      }
    ],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6)
  }
];

const mockOptimizations: NotificationOptimization[] = [
  {
    id: 'opt-1',
    type: 'send_time',
    recommendation: 'Enviar notificaciones de ofertas entre 7-9 PM para maximizar engagement',
    impact: {
      metric: 'engagement_rate',
      expectedImprovement: 35.0,
      confidence: 92.0
    },
    implementation: {
      difficulty: 'easy',
      estimatedHours: 2,
      requirements: ['Configurar horarios de envío', 'Actualizar lógica de scheduling']
    },
    status: 'pending',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2)
  }
];

export const [NotificationAnalyticsProvider, useNotificationAnalytics] = createContextHook(() => {
  const [selectedTimeframe, setSelectedTimeframe] = useState<{
    start: Date;
    end: Date;
    granularity: 'hour' | 'day' | 'week' | 'month';
  }>({
    start: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30),
    end: new Date(),
    granularity: 'day'
  });

  const queryClient = useQueryClient();

  // Queries
  const analyticsQuery = useQuery({
    queryKey: ['notification-analytics', selectedTimeframe],
    queryFn: async (): Promise<NotificationAnalytics[]> => {
      try {
        // TODO: Implement storage
        return mockAnalytics;
      } catch {
        return mockAnalytics;
      }
    },
  });

  const segmentsQuery = useQuery({
    queryKey: ['notification-segments'],
    queryFn: async (): Promise<NotificationSegment[]> => {
      try {
        // TODO: Implement storage
        return mockSegments;
      } catch {
        return mockSegments;
      }
    },
  });

  const abTestsQuery = useQuery({
    queryKey: ['ab-tests'],
    queryFn: async (): Promise<ABTest[]> => {
      try {
        // TODO: Implement storage
        return mockABTests;
      } catch {
        return mockABTests;
      }
    },
  });

  const frequencyRulesQuery = useQuery({
    queryKey: ['frequency-rules'],
    queryFn: async (): Promise<NotificationFrequencyRule[]> => {
      try {
        // TODO: Implement storage
        return mockFrequencyRules;
      } catch {
        return mockFrequencyRules;
      }
    },
  });

  const insightsQuery = useQuery({
    queryKey: ['notification-insights'],
    queryFn: async (): Promise<NotificationInsight[]> => {
      try {
        // TODO: Implement storage
        return mockInsights;
      } catch {
        return mockInsights;
      }
    },
  });

  const optimizationsQuery = useQuery({
    queryKey: ['notification-optimizations'],
    queryFn: async (): Promise<NotificationOptimization[]> => {
      try {
        // TODO: Implement storage
        return mockOptimizations;
      } catch {
        return mockOptimizations;
      }
    },
  });

  // Mutations
  const saveAnalytics = useMutation({
    mutationFn: async (analytics: NotificationAnalytics[]) => {
      if (!analytics || !Array.isArray(analytics)) {
        throw new Error('Invalid analytics data');
      }
      // TODO: Implement storage
      console.log('Saving analytics:', analytics.length);
      return analytics;
    },
    onSuccess: (analytics) => {
      queryClient.setQueryData(['notification-analytics', selectedTimeframe], analytics);
    },
  });

  const saveInsights = useMutation({
    mutationFn: async (insights: NotificationInsight[]) => {
      if (!insights || !Array.isArray(insights)) {
        throw new Error('Invalid insights data');
      }
      // TODO: Implement storage
      console.log('Saving insights:', insights.length);
      return insights;
    },
    onSuccess: (insights) => {
      queryClient.setQueryData(['notification-insights'], insights);
    },
  });

  const { mutateAsync: saveAnalyticsAsync } = saveAnalytics;
  const { mutateAsync: saveInsightsAsync } = saveInsights;

  // Analytics Functions
  const trackNotificationSent = useCallback(async (
    notificationId: string,
    type: NotificationType,
    category: NotificationCategory,
    metadata: NotificationAnalytics['metadata']
  ) => {
    if (!notificationId?.trim()) return;
    
    const analytics: NotificationAnalytics = {
      id: `analytics-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      notificationId: notificationId.trim(),
      type,
      category,
      sentAt: new Date(),
      userId: 'current-user',
      deviceType: Platform.OS === 'web' ? 'web' : 'mobile',
      platform: Platform.OS as 'ios' | 'android' | 'web',
      metadata
    };

    const currentAnalytics = analyticsQuery.data || [];
    const updatedAnalytics = [...currentAnalytics, analytics];
    
    await saveAnalyticsAsync(updatedAnalytics);
    console.log('[NotificationAnalytics] Tracked notification sent:', notificationId);
  }, [analyticsQuery.data, saveAnalyticsAsync]);

  const trackNotificationDelivered = useCallback(async (notificationId: string) => {
    if (!notificationId?.trim()) return;
    
    const currentAnalytics = analyticsQuery.data || [];
    const updatedAnalytics = currentAnalytics.map(item =>
      item.notificationId === notificationId.trim()
        ? { ...item, deliveredAt: new Date() }
        : item
    );
    
    await saveAnalyticsAsync(updatedAnalytics);
    console.log('[NotificationAnalytics] Tracked notification delivered:', notificationId);
  }, [analyticsQuery.data, saveAnalyticsAsync]);

  const trackNotificationOpened = useCallback(async (notificationId: string) => {
    if (!notificationId?.trim()) return;
    
    const currentAnalytics = analyticsQuery.data || [];
    const updatedAnalytics = currentAnalytics.map(item =>
      item.notificationId === notificationId.trim()
        ? { ...item, openedAt: new Date() }
        : item
    );
    
    await saveAnalyticsAsync(updatedAnalytics);
    console.log('[NotificationAnalytics] Tracked notification opened:', notificationId);
  }, [analyticsQuery.data, saveAnalyticsAsync]);

  const trackNotificationClicked = useCallback(async (notificationId: string) => {
    if (!notificationId?.trim()) return;
    
    const currentAnalytics = analyticsQuery.data || [];
    const updatedAnalytics = currentAnalytics.map(item =>
      item.notificationId === notificationId.trim()
        ? { ...item, clickedAt: new Date() }
        : item
    );
    
    await saveAnalyticsAsync(updatedAnalytics);
    console.log('[NotificationAnalytics] Tracked notification clicked:', notificationId);
  }, [analyticsQuery.data, saveAnalyticsAsync]);

  const trackNotificationDismissed = useCallback(async (notificationId: string) => {
    if (!notificationId?.trim()) return;
    
    const currentAnalytics = analyticsQuery.data || [];
    const updatedAnalytics = currentAnalytics.map(item =>
      item.notificationId === notificationId.trim()
        ? { ...item, dismissedAt: new Date() }
        : item
    );
    
    await saveAnalyticsAsync(updatedAnalytics);
    console.log('[NotificationAnalytics] Tracked notification dismissed:', notificationId);
  }, [analyticsQuery.data, saveAnalyticsAsync]);

  // Metrics Calculation
  const calculateMetrics = useCallback((
    analytics: NotificationAnalytics[],
    filters?: {
      type?: NotificationType;
      category?: NotificationCategory;
      dateRange?: { start: Date; end: Date };
    }
  ): NotificationMetrics => {
    if (!analytics || !Array.isArray(analytics)) {
      return {
        totalSent: 0,
        totalDelivered: 0,
        totalOpened: 0,
        totalClicked: 0,
        totalDismissed: 0,
        deliveryRate: 0,
        openRate: 0,
        clickRate: 0,
        dismissalRate: 0,
        engagementRate: 0,
        conversionRate: 0,
      };
    }

    let filteredAnalytics = analytics;

    if (filters) {
      filteredAnalytics = analytics.filter(item => {
        if (filters.type && item.type !== filters.type) return false;
        if (filters.category && item.category !== filters.category) return false;
        if (filters.dateRange) {
          const sentAt = item.sentAt.getTime();
          if (sentAt < filters.dateRange.start.getTime() || sentAt > filters.dateRange.end.getTime()) {
            return false;
          }
        }
        return true;
      });
    }

    const totalSent = filteredAnalytics.length;
    const totalDelivered = filteredAnalytics.filter(item => item.deliveredAt).length;
    const totalOpened = filteredAnalytics.filter(item => item.openedAt).length;
    const totalClicked = filteredAnalytics.filter(item => item.clickedAt).length;
    const totalDismissed = filteredAnalytics.filter(item => item.dismissedAt).length;

    const deliveryRate = totalSent > 0 ? (totalDelivered / totalSent) * 100 : 0;
    const openRate = totalDelivered > 0 ? (totalOpened / totalDelivered) * 100 : 0;
    const clickRate = totalOpened > 0 ? (totalClicked / totalOpened) * 100 : 0;
    const dismissalRate = totalDelivered > 0 ? (totalDismissed / totalDelivered) * 100 : 0;
    const engagementRate = totalDelivered > 0 ? ((totalOpened + totalClicked) / totalDelivered) * 100 : 0;
    const conversionRate = totalSent > 0 ? (totalClicked / totalSent) * 100 : 0;

    return {
      totalSent,
      totalDelivered,
      totalOpened,
      totalClicked,
      totalDismissed,
      deliveryRate: Math.round(deliveryRate * 100) / 100,
      openRate: Math.round(openRate * 100) / 100,
      clickRate: Math.round(clickRate * 100) / 100,
      dismissalRate: Math.round(dismissalRate * 100) / 100,
      engagementRate: Math.round(engagementRate * 100) / 100,
      conversionRate: Math.round(conversionRate * 100) / 100,
    };
  }, []);

  const getMetricsByCategory = useCallback(() => {
    const analytics = analyticsQuery.data || [];
    const categories: NotificationCategory[] = ['wallet', 'social', 'appointments', 'offers', 'ally', 'system', 'chat'];
    
    return categories.reduce((acc, category) => {
      acc[category] = calculateMetrics(analytics, { category });
      return acc;
    }, {} as Record<NotificationCategory, NotificationMetrics>);
  }, [analyticsQuery.data, calculateMetrics]);

  const getMetricsByType = useCallback(() => {
    const analytics = analyticsQuery.data || [];
    const types: NotificationType[] = [
      'payment_received', 'payment_sent', 'ncop_earned', 'offer_available',
      'new_message', 'social_like', 'appointment_confirmed'
    ];
    
    return types.reduce((acc, type) => {
      const typeAnalytics = analytics.filter(item => item.type === type);
      if (typeAnalytics.length > 0) {
        acc[type] = calculateMetrics(typeAnalytics);
      }
      return acc;
    }, {} as Record<NotificationType, NotificationMetrics>);
  }, [analyticsQuery.data, calculateMetrics]);

  const calculateStatisticalSignificance = useCallback((variants: ABTestVariant[]): number => {
    if (variants.length !== 2) return 0;
    
    const [variantA, variantB] = variants;
    const rateA = variantA.metrics.engagementRate / 100;
    const rateB = variantB.metrics.engagementRate / 100;
    const nA = variantA.metrics.totalDelivered;
    const nB = variantB.metrics.totalDelivered;

    if (nA === 0 || nB === 0) return 0;

    const pooledRate = (rateA * nA + rateB * nB) / (nA + nB);
    const standardError = Math.sqrt(pooledRate * (1 - pooledRate) * (1/nA + 1/nB));
    const zScore = Math.abs(rateA - rateB) / standardError;
    
    // Convert z-score to confidence level (simplified)
    if (zScore >= 2.58) return 99;
    if (zScore >= 1.96) return 95;
    if (zScore >= 1.65) return 90;
    return Math.round(zScore * 40); // Rough approximation
  }, []);

  // A/B Testing Functions
  const getABTestResults = useCallback((testId: string) => {
    if (!testId?.trim()) return null;
    
    const test = abTestsQuery.data?.find(t => t.id === testId.trim());
    if (!test) return null;

    const winner = test.variants.reduce((best, variant) => {
      return variant.metrics.engagementRate > best.metrics.engagementRate ? variant : best;
    });

    const confidence = calculateStatisticalSignificance(test.variants);

    return {
      test,
      winner,
      confidence,
      isSignificant: confidence >= test.confidenceLevel
    };
  }, [abTestsQuery.data, calculateStatisticalSignificance]);

  // Insights Generation
  const generateInsights = useCallback(async () => {
    const analytics = analyticsQuery.data || [];
    const metrics = calculateMetrics(analytics);
    const categoryMetrics = getMetricsByCategory();
    const newInsights: NotificationInsight[] = [];

    // Check for low delivery rates
    if (metrics.deliveryRate < 90) {
      newInsights.push({
        id: `insight-delivery-${Date.now()}`,
        type: 'alert',
        category: 'system',
        title: 'Baja Tasa de Entrega',
        description: `La tasa de entrega general es del ${metrics.deliveryRate}%, por debajo del objetivo del 95%`,
        severity: 'critical',
        data: { deliveryRate: metrics.deliveryRate, target: 95 },
        actionable: true,
        actions: [
          { label: 'Revisar Configuración', action: 'check_delivery_config' },
          { label: 'Analizar Logs', action: 'analyze_delivery_logs' }
        ],
        createdAt: new Date()
      });
    }

    // Check for high-performing categories
    Object.entries(categoryMetrics).forEach(([category, categoryMetric]) => {
      if (categoryMetric.engagementRate > 80) {
        newInsights.push({
          id: `insight-performance-${category}-${Date.now()}`,
          type: 'trend',
          category: category as NotificationCategory,
          title: `Excelente Performance en ${category}`,
          description: `Las notificaciones de ${category} tienen una tasa de engagement del ${categoryMetric.engagementRate}%`,
          severity: 'low',
          data: { engagementRate: categoryMetric.engagementRate },
          actionable: false,
          createdAt: new Date()
        });
      }
    });

    // Time-based insights
    const hourlyData = analytics.reduce((acc, item) => {
      const hour = item.sentAt.getHours();
      if (!acc[hour]) acc[hour] = { sent: 0, opened: 0 };
      acc[hour].sent++;
      if (item.openedAt) acc[hour].opened++;
      return acc;
    }, {} as Record<number, { sent: number; opened: number }>);

    const bestHour = Object.entries(hourlyData).reduce((best, [hour, data]) => {
      const rate = data.sent > 0 ? (data.opened / data.sent) * 100 : 0;
      return rate > best.rate ? { hour: parseInt(hour), rate } : best;
    }, { hour: 0, rate: 0 });

    if (bestHour.rate > 0) {
      newInsights.push({
        id: `insight-timing-${Date.now()}`,
        type: 'recommendation',
        category: 'system',
        title: 'Horario Óptimo Identificado',
        description: `Las ${bestHour.hour}:00 es la mejor hora para enviar notificaciones (${bestHour.rate.toFixed(1)}% de apertura)`,
        severity: 'medium',
        data: { optimalHour: bestHour.hour, openRate: bestHour.rate },
        actionable: true,
        actions: [
          { label: 'Programar Envíos', action: 'schedule_optimal_time', params: { hour: bestHour.hour } }
        ],
        createdAt: new Date()
      });
    }

    const currentInsights = insightsQuery.data || [];
    const updatedInsights = [...currentInsights, ...newInsights];
    await saveInsightsAsync(updatedInsights);
    
    console.log('[NotificationAnalytics] Generated', newInsights.length, 'new insights');
    return newInsights;
  }, [analyticsQuery.data, calculateMetrics, getMetricsByCategory, insightsQuery.data, saveInsightsAsync]);

  const acknowledgeInsight = useCallback(async (insightId: string) => {
    if (!insightId?.trim()) return;
    
    const currentInsights = insightsQuery.data || [];
    const updatedInsights = currentInsights.map(insight =>
      insight.id === insightId.trim()
        ? { ...insight, acknowledgedAt: new Date() }
        : insight
    );
    
    await saveInsightsAsync(updatedInsights);
    console.log('[NotificationAnalytics] Acknowledged insight:', insightId);
  }, [insightsQuery.data, saveInsightsAsync]);

  // Auto-generate insights periodically
  useEffect(() => {
    const interval = setInterval(() => {
      generateInsights();
    }, 1000 * 60 * 60); // Every hour

    return () => clearInterval(interval);
  }, [generateInsights]);

  return useMemo(() => ({
    // Data
    analytics: analyticsQuery.data || [],
    segments: segmentsQuery.data || [],
    abTests: abTestsQuery.data || [],
    frequencyRules: frequencyRulesQuery.data || [],
    insights: insightsQuery.data || [],
    optimizations: optimizationsQuery.data || [],
    selectedTimeframe,

    // Tracking Functions
    trackNotificationSent,
    trackNotificationDelivered,
    trackNotificationOpened,
    trackNotificationClicked,
    trackNotificationDismissed,

    // Metrics Functions
    calculateMetrics,
    getMetricsByCategory,
    getMetricsByType,

    // A/B Testing
    getABTestResults,

    // Insights
    generateInsights,
    acknowledgeInsight,

    // Utility Functions
    setSelectedTimeframe,

    // Loading States
    isLoading: analyticsQuery.isLoading || segmentsQuery.isLoading || 
               abTestsQuery.isLoading || insightsQuery.isLoading,
  }), [
    analyticsQuery.data,
    segmentsQuery.data,
    abTestsQuery.data,
    frequencyRulesQuery.data,
    insightsQuery.data,
    optimizationsQuery.data,
    selectedTimeframe,
    trackNotificationSent,
    trackNotificationDelivered,
    trackNotificationOpened,
    trackNotificationClicked,
    trackNotificationDismissed,
    calculateMetrics,
    getMetricsByCategory,
    getMetricsByType,
    getABTestResults,
    generateInsights,
    acknowledgeInsight,
    analyticsQuery.isLoading,
    segmentsQuery.isLoading,
    abTestsQuery.isLoading,
    insightsQuery.isLoading,
  ]);
});