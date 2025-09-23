import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useCallback, useMemo } from 'react';
import { 
  ChatAnalytics, 
  UserSatisfactionSurvey, 
  UsageStats,
  AnalyticsTimeframe,
  MetricTrend,
  DashboardWidget
} from '@/types/chat';

const STORAGE_KEYS = {
  CHAT_ANALYTICS: 'nodox_chat_analytics',
  SATISFACTION_SURVEYS: 'nodox_satisfaction_surveys',
  USAGE_STATS: 'nodox_usage_stats',
  DASHBOARD_WIDGETS: 'nodox_dashboard_widgets',
};

const mockChatAnalytics: ChatAnalytics[] = [
  {
    chatId: 'chat-1',
    messageCount: 45,
    participantCount: 2,
    averageResponseTime: 120, // 2 minutes
    mostActiveUser: 'user-1',
    messagesByType: {
      text: 40,
      audio: 3,
      image: 2,
      file: 0,
    },
    messagesByHour: Array.from({ length: 24 }, (_, i) => Math.floor(Math.random() * 10)),
    messagesByDay: Array.from({ length: 7 }, (_, i) => Math.floor(Math.random() * 20)),
    engagementScore: 85,
    satisfactionRating: 4.5,
    lastAnalyzed: new Date(),
  },
  {
    chatId: 'chat-2',
    messageCount: 28,
    participantCount: 2,
    averageResponseTime: 300, // 5 minutes
    mostActiveUser: 'current-user',
    messagesByType: {
      text: 25,
      audio: 1,
      image: 2,
      file: 0,
    },
    messagesByHour: Array.from({ length: 24 }, (_, i) => Math.floor(Math.random() * 8)),
    messagesByDay: Array.from({ length: 7 }, (_, i) => Math.floor(Math.random() * 15)),
    engagementScore: 72,
    satisfactionRating: 4.2,
    lastAnalyzed: new Date(),
  },
];

const mockSatisfactionSurveys: UserSatisfactionSurvey[] = [
  {
    id: 'survey-1',
    userId: 'current-user',
    chatId: 'chat-1',
    rating: 5,
    feedback: 'Excelente servicio, muy rápido y eficiente.',
    categories: {
      responseTime: 5,
      helpfulness: 5,
      professionalism: 4,
      problemResolution: 5,
    },
    submittedAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
  },
  {
    id: 'survey-2',
    userId: 'current-user',
    chatId: 'chat-3',
    rating: 4,
    feedback: 'Buen servicio, pero podría ser más rápido.',
    categories: {
      responseTime: 3,
      helpfulness: 4,
      professionalism: 5,
      problemResolution: 4,
    },
    submittedAt: new Date(Date.now() - 1000 * 60 * 60 * 48),
  },
];

const mockUsageStats: UsageStats = {
  overview: {
    totalUsers: 1250,
    activeUsersToday: 89,
    activeUsersWeek: 456,
    activeUsersMonth: 892,
    newUsersToday: 12,
    newUsersWeek: 67,
    newUsersMonth: 234,
    retentionRate: 78.5,
    churnRate: 3.2,
  },
  messaging: {
    totalMessages: 15420,
    messagesPerDay: Array.from({ length: 30 }, (_, i) => Math.floor(Math.random() * 500) + 200),
    messagesPerHour: Array.from({ length: 24 }, (_, i) => Math.floor(Math.random() * 50) + 10),
    averageMessagesPerUser: 12.3,
    averageResponseTime: 180,
    messageTypes: {
      text: 12500,
      audio: 1800,
      image: 920,
      file: 200,
    },
    peakHours: [
      { hour: 9, count: 45 },
      { hour: 14, count: 52 },
      { hour: 20, count: 38 },
    ],
    conversationDuration: {
      average: 15.5,
      median: 12.0,
      longest: 120.0,
    },
  },
  engagement: {
    dailyActiveUsers: Array.from({ length: 30 }, (_, i) => Math.floor(Math.random() * 100) + 50),
    weeklyActiveUsers: Array.from({ length: 12 }, (_, i) => Math.floor(Math.random() * 500) + 300),
    monthlyActiveUsers: Array.from({ length: 12 }, (_, i) => Math.floor(Math.random() * 1000) + 800),
    sessionDuration: {
      average: 25.5,
      median: 18.0,
      distribution: {
        '0-5min': 25,
        '5-15min': 35,
        '15-30min': 25,
        '30min+': 15,
      },
    },
    userRetention: {
      day1: 85,
      day7: 65,
      day30: 45,
    },
    featureUsage: {
      chat: 100,
      videoCalls: 35,
      fileSharing: 60,
      scheduledMessages: 15,
      marketplace: 80,
    },
  },
  business: {
    allyStats: {
      totalAllies: 45,
      activeAllies: 38,
      pendingApplications: 12,
      approvedApplications: 156,
      rejectedApplications: 23,
      averageResponseTime: 145,
      customerSatisfaction: 4.3,
    },
    transactionStats: {
      totalTransactions: 2340,
      transactionVolume: 125000,
      averageTransactionValue: 53.4,
      transactionsPerDay: Array.from({ length: 30 }, (_, i) => Math.floor(Math.random() * 100) + 50),
      topServices: [
        { name: 'Recargas', count: 890, revenue: 45000 },
        { name: 'Transferencias', count: 650, revenue: 32500 },
        { name: 'Pagos', count: 800, revenue: 47500 },
      ],
    },
    referralStats: {
      totalReferrals: 456,
      successfulReferrals: 234,
      referralConversionRate: 51.3,
      topReferrers: [
        { userId: 'user-3', name: 'Carlos Rodríguez', referrals: 23 },
        { userId: 'user-4', name: 'Ana López', referrals: 18 },
      ],
    },
  },
  geographic: {
    usersByCountry: {
      'Colombia': 850,
      'México': 200,
      'Argentina': 150,
      'Chile': 50,
    },
    usersByCity: {
      'Bogotá': 320,
      'Medellín': 180,
      'Cali': 150,
      'Barranquilla': 100,
    },
    messagesByRegion: {
      'Andina': 8500,
      'Caribe': 3200,
      'Pacífica': 2800,
      'Orinoquía': 900,
    },
    peakTimesByRegion: {
      'Andina': [
        { hour: 9, count: 25 },
        { hour: 14, count: 30 },
        { hour: 20, count: 22 },
      ],
      'Caribe': [
        { hour: 8, count: 15 },
        { hour: 13, count: 18 },
        { hour: 19, count: 16 },
      ],
    },
  },
  technical: {
    platformUsage: {
      'Android': 65,
      'iOS': 30,
      'Web': 5,
    },
    deviceTypes: {
      'Mobile': 95,
      'Tablet': 3,
      'Desktop': 2,
    },
    osVersions: {
      'Android 12+': 45,
      'Android 11': 20,
      'iOS 16+': 25,
      'iOS 15': 5,
      'Other': 5,
    },
    appVersions: {
      '1.2.0': 70,
      '1.1.5': 25,
      '1.1.0': 5,
    },
    errorRates: {
      total: 0.8,
      byType: {
        'Network': 0.3,
        'UI': 0.2,
        'Crash': 0.1,
        'Other': 0.2,
      },
      byPlatform: {
        'Android': 0.5,
        'iOS': 0.2,
        'Web': 0.1,
      },
    },
    performanceMetrics: {
      averageLoadTime: 2.3,
      crashRate: 0.1,
      memoryUsage: 85.5,
      networkLatency: 120,
    },
  },
};

const mockDashboardWidgets: DashboardWidget[] = [
  {
    id: 'widget-1',
    type: 'metric',
    title: 'Usuarios Activos Hoy',
    data: { value: 89, trend: 'up', change: 12 },
    position: { x: 0, y: 0, width: 6, height: 3 },
  },
  {
    id: 'widget-2',
    type: 'chart',
    title: 'Mensajes por Hora',
    data: mockUsageStats.messaging.messagesPerHour,
    config: { chartType: 'line' },
    position: { x: 6, y: 0, width: 6, height: 4 },
  },
  {
    id: 'widget-3',
    type: 'metric',
    title: 'Satisfacción Promedio',
    data: { value: 4.3, trend: 'stable', change: 0 },
    position: { x: 0, y: 3, width: 6, height: 3 },
  },
];

export const [AnalyticsProvider, useAnalytics] = createContextHook(() => {
  const [selectedTimeframe, setSelectedTimeframe] = useState<AnalyticsTimeframe>({
    start: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30), // 30 days ago
    end: new Date(),
    granularity: 'day',
  });
  const queryClient = useQueryClient();

  const chatAnalyticsQuery = useQuery({
    queryKey: ['chat-analytics'],
    queryFn: async (): Promise<ChatAnalytics[]> => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEYS.CHAT_ANALYTICS);
        if (stored) {
          const parsed = JSON.parse(stored);
          return parsed.map((analytics: any) => ({
            ...analytics,
            lastAnalyzed: new Date(analytics.lastAnalyzed),
          }));
        }
        return mockChatAnalytics;
      } catch {
        return mockChatAnalytics;
      }
    },
  });

  const satisfactionSurveysQuery = useQuery({
    queryKey: ['satisfaction-surveys'],
    queryFn: async (): Promise<UserSatisfactionSurvey[]> => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEYS.SATISFACTION_SURVEYS);
        if (stored) {
          const parsed = JSON.parse(stored);
          return parsed.map((survey: any) => ({
            ...survey,
            submittedAt: new Date(survey.submittedAt),
          }));
        }
        return mockSatisfactionSurveys;
      } catch {
        return mockSatisfactionSurveys;
      }
    },
  });

  const usageStatsQuery = useQuery({
    queryKey: ['usage-stats', selectedTimeframe],
    queryFn: async (): Promise<UsageStats> => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEYS.USAGE_STATS);
        return stored ? JSON.parse(stored) : mockUsageStats;
      } catch {
        return mockUsageStats;
      }
    },
  });

  const dashboardWidgetsQuery = useQuery({
    queryKey: ['dashboard-widgets'],
    queryFn: async (): Promise<DashboardWidget[]> => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEYS.DASHBOARD_WIDGETS);
        return stored ? JSON.parse(stored) : mockDashboardWidgets;
      } catch {
        return mockDashboardWidgets;
      }
    },
  });

  const saveChatAnalytics = useMutation({
    mutationFn: async (analytics: ChatAnalytics[]) => {
      await AsyncStorage.setItem(STORAGE_KEYS.CHAT_ANALYTICS, JSON.stringify(analytics));
      return analytics;
    },
    onSuccess: (analytics) => {
      queryClient.setQueryData(['chat-analytics'], analytics);
    },
  });

  const saveSatisfactionSurveys = useMutation({
    mutationFn: async (surveys: UserSatisfactionSurvey[]) => {
      await AsyncStorage.setItem(STORAGE_KEYS.SATISFACTION_SURVEYS, JSON.stringify(surveys));
      return surveys;
    },
    onSuccess: (surveys) => {
      queryClient.setQueryData(['satisfaction-surveys'], surveys);
    },
  });

  const saveDashboardWidgets = useMutation({
    mutationFn: async (widgets: DashboardWidget[]) => {
      await AsyncStorage.setItem(STORAGE_KEYS.DASHBOARD_WIDGETS, JSON.stringify(widgets));
      return widgets;
    },
    onSuccess: (widgets) => {
      queryClient.setQueryData(['dashboard-widgets'], widgets);
    },
  });

  const { mutateAsync: saveChatAnalyticsAsync } = saveChatAnalytics;
  const { mutateAsync: saveSatisfactionSurveysAsync } = saveSatisfactionSurveys;
  const { mutateAsync: saveDashboardWidgetsAsync } = saveDashboardWidgets;

  // Analytics Functions
  const getChatAnalytics = useCallback((chatId: string): ChatAnalytics | undefined => {
    const analytics = chatAnalyticsQuery.data || [];
    return analytics.find(a => a.chatId === chatId);
  }, [chatAnalyticsQuery.data]);

  const updateChatAnalytics = useCallback(async (chatId: string, updates: Partial<ChatAnalytics>) => {
    const currentAnalytics = chatAnalyticsQuery.data || [];
    
    const updatedAnalytics = currentAnalytics.map(analytics => 
      analytics.chatId === chatId 
        ? { ...analytics, ...updates, lastAnalyzed: new Date() }
        : analytics
    );

    // If analytics for this chat doesn't exist, create it
    if (!updatedAnalytics.find(a => a.chatId === chatId)) {
      const newAnalytics: ChatAnalytics = {
        chatId,
        messageCount: 0,
        participantCount: 0,
        averageResponseTime: 0,
        mostActiveUser: '',
        messagesByType: { text: 0, audio: 0, image: 0, file: 0 },
        messagesByHour: Array(24).fill(0),
        messagesByDay: Array(7).fill(0),
        engagementScore: 0,
        lastAnalyzed: new Date(),
        ...updates,
      };
      updatedAnalytics.push(newAnalytics);
    }

    await saveChatAnalyticsAsync(updatedAnalytics);
    console.log('[Analytics] Chat analytics updated for:', chatId);
  }, [chatAnalyticsQuery.data, saveChatAnalyticsAsync]);

  const submitSatisfactionSurvey = useCallback(async (
    chatId: string,
    rating: number,
    categories: UserSatisfactionSurvey['categories'],
    feedback?: string
  ): Promise<string> => {
    const currentSurveys = satisfactionSurveysQuery.data || [];
    const surveyId = `survey-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const newSurvey: UserSatisfactionSurvey = {
      id: surveyId,
      userId: 'current-user',
      chatId,
      rating,
      feedback,
      categories,
      submittedAt: new Date(),
    };

    const updatedSurveys = [...currentSurveys, newSurvey];
    await saveSatisfactionSurveysAsync(updatedSurveys);
    
    // Update chat analytics with new satisfaction rating
    const chatAnalytics = getChatAnalytics(chatId);
    if (chatAnalytics) {
      const allChatSurveys = updatedSurveys.filter(s => s.chatId === chatId);
      const averageRating = allChatSurveys.reduce((sum, s) => sum + s.rating, 0) / allChatSurveys.length;
      
      await updateChatAnalytics(chatId, { satisfactionRating: averageRating });
    }
    
    console.log('[Analytics] Satisfaction survey submitted:', surveyId);
    return surveyId;
  }, [satisfactionSurveysQuery.data, saveSatisfactionSurveysAsync, getChatAnalytics, updateChatAnalytics]);

  const getMetricTrend = useCallback((
    current: number, 
    previous: number
  ): MetricTrend => {
    const change = current - previous;
    const changePercent = previous === 0 ? 0 : (change / previous) * 100;
    
    let trend: MetricTrend['trend'] = 'stable';
    if (Math.abs(changePercent) > 5) {
      trend = changePercent > 0 ? 'up' : 'down';
    }

    return {
      current,
      previous,
      change,
      changePercent,
      trend,
    };
  }, []);

  const generateUsageReport = useCallback((timeframe: AnalyticsTimeframe) => {
    const stats = usageStatsQuery.data;
    if (!stats) return null;

    const report = {
      timeframe,
      summary: {
        totalUsers: stats.overview.totalUsers,
        activeUsers: stats.overview.activeUsersMonth,
        totalMessages: stats.messaging.totalMessages,
        averageResponseTime: stats.messaging.averageResponseTime,
        satisfactionRating: stats.business.allyStats.customerSatisfaction,
      },
      trends: {
        userGrowth: getMetricTrend(stats.overview.newUsersMonth, stats.overview.newUsersMonth * 0.8),
        messageVolume: getMetricTrend(stats.messaging.totalMessages, stats.messaging.totalMessages * 0.9),
        engagement: getMetricTrend(stats.overview.retentionRate, stats.overview.retentionRate * 0.95),
      },
      insights: [
        'Los usuarios son más activos durante las horas de la mañana (9-11 AM)',
        'La satisfacción del cliente ha mejorado un 8% este mes',
        'Los mensajes de audio representan el 12% del total de mensajes',
        'La retención de usuarios a 30 días es del 45%',
      ],
      recommendations: [
        'Implementar notificaciones push para aumentar la retención',
        'Optimizar los tiempos de respuesta durante las horas pico',
        'Expandir las funcionalidades de mensajes multimedia',
        'Crear programas de incentivos para usuarios frecuentes',
      ],
    };

    console.log('[Analytics] Usage report generated for timeframe:', timeframe);
    return report;
  }, [usageStatsQuery.data, getMetricTrend]);

  const updateDashboardWidget = useCallback(async (
    widgetId: string, 
    updates: Partial<DashboardWidget>
  ) => {
    const currentWidgets = dashboardWidgetsQuery.data || [];
    
    const updatedWidgets = currentWidgets.map(widget => 
      widget.id === widgetId 
        ? { ...widget, ...updates }
        : widget
    );

    await saveDashboardWidgetsAsync(updatedWidgets);
    console.log('[Analytics] Dashboard widget updated:', widgetId);
  }, [dashboardWidgetsQuery.data, saveDashboardWidgetsAsync]);

  const addDashboardWidget = useCallback(async (widget: Omit<DashboardWidget, 'id'>) => {
    const currentWidgets = dashboardWidgetsQuery.data || [];
    const widgetId = `widget-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const newWidget: DashboardWidget = {
      ...widget,
      id: widgetId,
    };

    const updatedWidgets = [...currentWidgets, newWidget];
    await saveDashboardWidgetsAsync(updatedWidgets);
    
    console.log('[Analytics] Dashboard widget added:', widgetId);
    return widgetId;
  }, [dashboardWidgetsQuery.data, saveDashboardWidgetsAsync]);

  const removeDashboardWidget = useCallback(async (widgetId: string) => {
    const currentWidgets = dashboardWidgetsQuery.data || [];
    const updatedWidgets = currentWidgets.filter(widget => widget.id !== widgetId);
    
    await saveDashboardWidgetsAsync(updatedWidgets);
    console.log('[Analytics] Dashboard widget removed:', widgetId);
  }, [dashboardWidgetsQuery.data, saveDashboardWidgetsAsync]);

  const exportAnalyticsData = useCallback((format: 'json' | 'csv' = 'json') => {
    const data = {
      chatAnalytics: chatAnalyticsQuery.data,
      satisfactionSurveys: satisfactionSurveysQuery.data,
      usageStats: usageStatsQuery.data,
      generatedAt: new Date(),
    };

    if (format === 'json') {
      return JSON.stringify(data, null, 2);
    }

    // Simple CSV export for basic data
    const csvData = [
      'Chat ID,Messages,Participants,Avg Response Time,Engagement Score,Satisfaction',
      ...(chatAnalyticsQuery.data || []).map(analytics => 
        `${analytics.chatId},${analytics.messageCount},${analytics.participantCount},${analytics.averageResponseTime},${analytics.engagementScore},${analytics.satisfactionRating || 'N/A'}`
      )
    ].join('\n');

    console.log('[Analytics] Data exported in', format, 'format');
    return csvData;
  }, [chatAnalyticsQuery.data, satisfactionSurveysQuery.data, usageStatsQuery.data]);

  return useMemo(() => ({
    // Data
    chatAnalytics: chatAnalyticsQuery.data || [],
    satisfactionSurveys: satisfactionSurveysQuery.data || [],
    usageStats: usageStatsQuery.data || mockUsageStats,
    dashboardWidgets: dashboardWidgetsQuery.data || [],
    selectedTimeframe,
    
    // Analytics Functions
    getChatAnalytics,
    updateChatAnalytics,
    submitSatisfactionSurvey,
    getMetricTrend,
    generateUsageReport,
    
    // Dashboard Functions
    updateDashboardWidget,
    addDashboardWidget,
    removeDashboardWidget,
    
    // Utility Functions
    exportAnalyticsData,
    setSelectedTimeframe,
    
    // Loading States
    isLoading: chatAnalyticsQuery.isLoading || satisfactionSurveysQuery.isLoading || 
               usageStatsQuery.isLoading || dashboardWidgetsQuery.isLoading,
  }), [
    chatAnalyticsQuery.data,
    satisfactionSurveysQuery.data,
    usageStatsQuery.data,
    dashboardWidgetsQuery.data,
    selectedTimeframe,
    getChatAnalytics,
    updateChatAnalytics,
    submitSatisfactionSurvey,
    getMetricTrend,
    generateUsageReport,
    updateDashboardWidget,
    addDashboardWidget,
    removeDashboardWidget,
    exportAnalyticsData,
    chatAnalyticsQuery.isLoading,
    satisfactionSurveysQuery.isLoading,
    usageStatsQuery.isLoading,
    dashboardWidgetsQuery.isLoading,
  ]);
});