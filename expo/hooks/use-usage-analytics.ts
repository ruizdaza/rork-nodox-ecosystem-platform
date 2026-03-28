import { useState, useEffect, useCallback } from 'react';
import { UsageStats, AnalyticsTimeframe, MetricTrend, DashboardWidget } from '@/types/chat';

interface UsageAnalyticsState {
  stats: UsageStats | null;
  trends: Record<string, MetricTrend>;
  widgets: DashboardWidget[];
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

const generateMockUsageStats = (): UsageStats => {
  const now = new Date();
  const daysInMonth = 30;
  const hoursInDay = 24;
  
  // Generar datos de mensajes por día (últimos 30 días)
  const messagesPerDay = Array.from({ length: daysInMonth }, (_, i) => {
    const baseMessages = 1000 + Math.random() * 500;
    const dayOfWeek = (now.getDay() - i) % 7;
    const weekendMultiplier = dayOfWeek === 0 || dayOfWeek === 6 ? 0.7 : 1;
    return Math.floor(baseMessages * weekendMultiplier);
  }).reverse();
  
  // Generar datos de mensajes por hora
  const messagesPerHour = Array.from({ length: hoursInDay }, (_, hour) => {
    let baseMessages = 50;
    // Simular patrones de uso: más actividad durante el día
    if (hour >= 9 && hour <= 18) baseMessages = 150;
    else if (hour >= 19 && hour <= 22) baseMessages = 120;
    else if (hour >= 0 && hour <= 6) baseMessages = 20;
    
    return Math.floor(baseMessages + Math.random() * 30);
  });
  
  // Generar usuarios activos diarios
  const dailyActiveUsers = Array.from({ length: daysInMonth }, (_, i) => {
    const baseUsers = 500 + Math.random() * 200;
    const dayOfWeek = (now.getDay() - i) % 7;
    const weekendMultiplier = dayOfWeek === 0 || dayOfWeek === 6 ? 0.8 : 1;
    return Math.floor(baseUsers * weekendMultiplier);
  }).reverse();
  
  return {
    overview: {
      totalUsers: 15420,
      activeUsersToday: 1234,
      activeUsersWeek: 5678,
      activeUsersMonth: 12340,
      newUsersToday: 45,
      newUsersWeek: 234,
      newUsersMonth: 890,
      retentionRate: 78.5,
      churnRate: 3.2
    },
    messaging: {
      totalMessages: 892340,
      messagesPerDay,
      messagesPerHour,
      averageMessagesPerUser: 57.8,
      averageResponseTime: 245,
      messageTypes: {
        text: 756890,
        image: 89234,
        audio: 34567,
        file: 11649
      },
      peakHours: [
        { hour: 14, count: 2340 },
        { hour: 15, count: 2280 },
        { hour: 16, count: 2190 },
        { hour: 20, count: 2150 },
        { hour: 21, count: 2080 }
      ],
      conversationDuration: {
        average: 12.5,
        median: 8.2,
        longest: 180.5
      }
    },
    engagement: {
      dailyActiveUsers,
      weeklyActiveUsers: Array.from({ length: 12 }, () => Math.floor(3000 + Math.random() * 1000)),
      monthlyActiveUsers: Array.from({ length: 12 }, () => Math.floor(8000 + Math.random() * 2000)),
      sessionDuration: {
        average: 18.5,
        median: 12.3,
        distribution: {
          '0-5min': 25,
          '5-15min': 35,
          '15-30min': 20,
          '30-60min': 15,
          '60min+': 5
        }
      },
      userRetention: {
        day1: 85.2,
        day7: 62.8,
        day30: 45.6
      },
      featureUsage: {
        chat: 98.5,
        voice_messages: 67.3,
        file_sharing: 45.2,
        group_chats: 34.8,
        video_calls: 23.1,
        screen_sharing: 12.4
      }
    },
    business: {
      allyStats: {
        totalAllies: 234,
        activeAllies: 189,
        pendingApplications: 23,
        approvedApplications: 201,
        rejectedApplications: 45,
        averageResponseTime: 4.2,
        customerSatisfaction: 4.6
      },
      transactionStats: {
        totalTransactions: 12450,
        transactionVolume: 2340000,
        averageTransactionValue: 187.95,
        transactionsPerDay: Array.from({ length: 30 }, () => Math.floor(300 + Math.random() * 200)),
        topServices: [
          { name: 'Consulta Médica', count: 2340, revenue: 468000 },
          { name: 'Servicios de Belleza', count: 1890, revenue: 378000 },
          { name: 'Reparaciones', count: 1567, revenue: 313400 },
          { name: 'Consultoría', count: 1234, revenue: 246800 },
          { name: 'Delivery', count: 1123, revenue: 224600 }
        ]
      },
      referralStats: {
        totalReferrals: 3456,
        successfulReferrals: 2789,
        referralConversionRate: 80.7,
        topReferrers: [
          { userId: 'user_1', name: 'María González', referrals: 45 },
          { userId: 'user_2', name: 'Carlos Rodríguez', referrals: 38 },
          { userId: 'user_3', name: 'Ana Martínez', referrals: 32 },
          { userId: 'user_4', name: 'Luis Pérez', referrals: 28 },
          { userId: 'user_5', name: 'Sofia López', referrals: 25 }
        ]
      }
    },
    geographic: {
      usersByCountry: {
        'Colombia': 8945,
        'México': 3456,
        'Argentina': 1890,
        'Chile': 1234,
        'Perú': 895
      },
      usersByCity: {
        'Bogotá': 4567,
        'Medellín': 2345,
        'Cali': 1890,
        'Ciudad de México': 1678,
        'Buenos Aires': 1234
      },
      messagesByRegion: {
        'Andina': 456789,
        'Caribe': 234567,
        'Pacífica': 123456,
        'Orinoquía': 67890,
        'Amazonía': 34567
      },
      peakTimesByRegion: {
        'Andina': [{ hour: 14, count: 1200 }, { hour: 20, count: 1100 }],
        'Caribe': [{ hour: 15, count: 800 }, { hour: 21, count: 750 }],
        'Pacífica': [{ hour: 13, count: 600 }, { hour: 19, count: 580 }]
      }
    },
    technical: {
      platformUsage: {
        'Android': 8945,
        'iOS': 5678,
        'Web': 797
      },
      deviceTypes: {
        'Mobile': 14623,
        'Tablet': 797,
        'Desktop': 0
      },
      osVersions: {
        'Android 13': 3456,
        'Android 12': 2890,
        'Android 11': 2599,
        'iOS 17': 2345,
        'iOS 16': 2123,
        'iOS 15': 1210
      },
      appVersions: {
        '2.1.0': 8945,
        '2.0.5': 4567,
        '2.0.4': 1890,
        '1.9.8': 18
      },
      errorRates: {
        total: 0.12,
        byType: {
          'Network': 0.05,
          'UI': 0.03,
          'Crash': 0.02,
          'Performance': 0.02
        },
        byPlatform: {
          'Android': 0.08,
          'iOS': 0.04,
          'Web': 0.15
        }
      },
      performanceMetrics: {
        averageLoadTime: 1.2,
        crashRate: 0.02,
        memoryUsage: 145.6,
        networkLatency: 89.3
      }
    }
  };
};

const generateMockTrends = (): Record<string, MetricTrend> => {
  const createTrend = (current: number, changePercent: number): MetricTrend => {
    const previous = current / (1 + changePercent / 100);
    const change = current - previous;
    return {
      current,
      previous,
      change,
      changePercent,
      trend: changePercent > 5 ? 'up' : changePercent < -5 ? 'down' : 'stable'
    };
  };
  
  return {
    totalUsers: createTrend(15420, 12.5),
    activeUsers: createTrend(1234, 8.3),
    totalMessages: createTrend(892340, 15.7),
    averageResponseTime: createTrend(245, -8.2),
    retentionRate: createTrend(78.5, 3.1),
    churnRate: createTrend(3.2, -12.4),
    transactionVolume: createTrend(2340000, 22.8),
    customerSatisfaction: createTrend(4.6, 4.5)
  };
};

const generateMockWidgets = (): DashboardWidget[] => {
  return [
    {
      id: 'users-overview',
      type: 'metric',
      title: 'Usuarios Activos',
      description: 'Usuarios activos en los últimos 30 días',
      data: { value: 12340, trend: 12.5 },
      position: { x: 0, y: 0, width: 1, height: 1 }
    },
    {
      id: 'messages-chart',
      type: 'chart',
      title: 'Mensajes por Día',
      description: 'Volumen de mensajes en los últimos 30 días',
      data: generateMockUsageStats().messaging.messagesPerDay,
      config: { chartType: 'line' },
      position: { x: 1, y: 0, width: 2, height: 1 }
    },
    {
      id: 'engagement-heatmap',
      type: 'heatmap',
      title: 'Actividad por Hora',
      description: 'Patrones de uso durante el día',
      data: generateMockUsageStats().messaging.messagesPerHour,
      position: { x: 0, y: 1, width: 3, height: 1 }
    },
    {
      id: 'top-services',
      type: 'table',
      title: 'Servicios Más Populares',
      description: 'Ranking de servicios por volumen',
      data: generateMockUsageStats().business.transactionStats.topServices,
      position: { x: 0, y: 2, width: 2, height: 1 }
    },
    {
      id: 'geographic-distribution',
      type: 'chart',
      title: 'Distribución Geográfica',
      description: 'Usuarios por país',
      data: generateMockUsageStats().geographic.usersByCountry,
      config: { chartType: 'pie' },
      position: { x: 2, y: 2, width: 1, height: 1 }
    }
  ];
};

export function useUsageAnalytics(timeframe?: AnalyticsTimeframe) {
  const [state, setState] = useState<UsageAnalyticsState>({
    stats: null,
    trends: {},
    widgets: [],
    isLoading: true,
    error: null,
    lastUpdated: null
  });

  const loadAnalytics = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      // Simular carga de datos
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const stats = generateMockUsageStats();
      const trends = generateMockTrends();
      const widgets = generateMockWidgets();
      
      console.log('Usage analytics loaded successfully');
      
      setState({
        stats,
        trends,
        widgets,
        isLoading: false,
        error: null,
        lastUpdated: new Date()
      });
    } catch (error) {
      console.error('Error loading usage analytics:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Error al cargar las estadísticas de uso'
      }));
    }
  }, [timeframe]);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  const refreshAnalytics = useCallback(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  const getMetricTrend = useCallback((metricKey: string): MetricTrend | null => {
    return state.trends[metricKey] || null;
  }, [state.trends]);

  const updateWidget = useCallback((widgetId: string, updates: Partial<DashboardWidget>) => {
    setState(prev => ({
      ...prev,
      widgets: prev.widgets.map(widget => 
        widget.id === widgetId ? { ...widget, ...updates } : widget
      )
    }));
  }, []);

  const addWidget = useCallback((widget: DashboardWidget) => {
    setState(prev => ({
      ...prev,
      widgets: [...prev.widgets, widget]
    }));
  }, []);

  const removeWidget = useCallback((widgetId: string) => {
    setState(prev => ({
      ...prev,
      widgets: prev.widgets.filter(widget => widget.id !== widgetId)
    }));
  }, []);

  const exportData = useCallback((format: 'json' | 'csv' = 'json') => {
    if (!state.stats) return null;
    
    if (format === 'json') {
      return JSON.stringify(state.stats, null, 2);
    }
    
    // Implementar exportación CSV si es necesario
    console.log('CSV export not implemented yet');
    return null;
  }, [state.stats]);

  const getInsights = useCallback(() => {
    if (!state.stats || !state.trends) return [];
    
    const insights = [];
    
    // Análisis de crecimiento de usuarios
    const userTrend = state.trends.totalUsers;
    if (userTrend && userTrend.changePercent > 10) {
      insights.push({
        type: 'positive',
        title: 'Crecimiento Acelerado',
        description: `Los usuarios han crecido un ${userTrend.changePercent.toFixed(1)}% este período`,
        priority: 'high'
      });
    }
    
    // Análisis de retención
    if (state.stats.engagement.userRetention.day7 < 60) {
      insights.push({
        type: 'warning',
        title: 'Retención Baja',
        description: 'La retención a 7 días está por debajo del 60%',
        priority: 'medium'
      });
    }
    
    // Análisis de horas pico
    const peakHour = state.stats.messaging.peakHours[0];
    if (peakHour) {
      insights.push({
        type: 'info',
        title: 'Hora Pico Identificada',
        description: `La mayor actividad ocurre a las ${peakHour.hour}:00 con ${peakHour.count} mensajes`,
        priority: 'low'
      });
    }
    
    return insights;
  }, [state.stats, state.trends]);

  return {
    ...state,
    refreshAnalytics,
    getMetricTrend,
    updateWidget,
    addWidget,
    removeWidget,
    exportData,
    getInsights,
    reload: loadAnalytics
  };
}