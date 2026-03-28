import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  BarChart,
  LineChart,
} from 'react-native-chart-kit';
import {
  Bell,
  TrendingUp,
  TrendingDown,
  Eye,
  MousePointer,
  AlertTriangle,
  CheckCircle,
  Target,
  Zap,
} from 'lucide-react-native';
import { useNotificationAnalytics } from '@/hooks/use-notification-analytics';
import { NotificationCategory } from '@/types/notifications';

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  trend?: 'up' | 'down' | 'stable';
  icon: React.ComponentType<any>;
  color: string;
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  change,
  trend,
  icon: Icon,
  color,
}) => {
  const getTrendIcon = () => {
    if (trend === 'up') return TrendingUp;
    if (trend === 'down') return TrendingDown;
    return null;
  };

  const TrendIcon = getTrendIcon();

  return (
    <View style={[styles.metricCard, { borderLeftColor: color }]}>
      <View style={styles.metricHeader}>
        <View style={[styles.metricIcon, { backgroundColor: color + '20' }]}>
          <Icon size={20} color={color} />
        </View>
        <Text style={styles.metricTitle}>{title}</Text>
      </View>
      
      <View style={styles.metricContent}>
        <Text style={styles.metricValue}>{value}</Text>
        {change !== undefined && TrendIcon && (
          <View style={styles.metricChange}>
            <TrendIcon 
              size={16} 
              color={trend === 'up' ? '#10b981' : '#ef4444'} 
            />
            <Text 
              style={[
                styles.changeText,
                { color: trend === 'up' ? '#10b981' : '#ef4444' }
              ]}
            >
              {Math.abs(change)}%
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

interface FilterChipProps {
  label: string;
  selected: boolean;
  onPress: () => void;
}

const FilterChip: React.FC<FilterChipProps> = ({ label, selected, onPress }) => (
  <TouchableOpacity
    style={[styles.filterChip, selected && styles.filterChipSelected]}
    onPress={onPress}
  >
    <Text style={[styles.filterChipText, selected && styles.filterChipTextSelected]}>
      {label}
    </Text>
  </TouchableOpacity>
);

export const NotificationAnalyticsDashboard: React.FC = () => {
  const { width: screenWidth } = useWindowDimensions();
  const chartWidth = screenWidth - 40;
  const analytics = useNotificationAnalytics();
  const [selectedCategory, setSelectedCategory] = useState<NotificationCategory | 'all'>('all');
  const [selectedTimeframe, setSelectedTimeframe] = useState<'7d' | '30d' | '90d'>('30d');

  // Calculate overall metrics
  const overallMetrics = useMemo(() => {
    const filters = selectedCategory !== 'all' ? { category: selectedCategory } : undefined;
    return analytics.calculateMetrics(analytics.analytics, filters);
  }, [analytics.calculateMetrics, analytics.analytics, selectedCategory]);

  // Category metrics
  const categoryMetrics = analytics.getMetricsByCategory();

  // Prepare chart data
  const categoryChartData = useMemo(() => {
    const categories = Object.keys(categoryMetrics) as NotificationCategory[];
    return {
      labels: categories.map(cat => {
        const sanitized = cat?.trim();
        return sanitized ? sanitized.charAt(0).toUpperCase() + sanitized.slice(1) : '';
      }),
      datasets: [{
        data: categories.map(cat => categoryMetrics[cat]?.engagementRate || 0),
        colors: categories.map((_, index) => () => [
          '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#84cc16'
        ][index % 7])
      }]
    };
  }, [categoryMetrics]);

  // Hourly engagement data
  const hourlyData = useMemo(() => {
    const hourlyStats = Array(24).fill(0).map((_, hour) => {
      const hourAnalytics = analytics.analytics.filter(
        item => item.sentAt.getHours() === hour
      );
      const opened = hourAnalytics.filter(item => item.openedAt).length;
      return hourAnalytics.length > 0 ? (opened / hourAnalytics.length) * 100 : 0;
    });

    return {
      labels: ['0', '4', '8', '12', '16', '20'],
      datasets: [{
        data: [0, 4, 8, 12, 16, 20].map(hour => hourlyStats[hour]),
        strokeWidth: 2,
      }]
    };
  }, [analytics.analytics]);

  // A/B Test results
  const abTestResults = useMemo(() => {
    return analytics.abTests.map(test => {
      const results = analytics.getABTestResults(test.id);
      return { test, results };
    }).filter(item => item.results);
  }, [analytics.abTests, analytics.getABTestResults]);

  const categories: (NotificationCategory | 'all')[] = [
    'all', 'wallet', 'social', 'appointments', 'offers', 'ally', 'system', 'chat'
  ];

  const timeframes: { key: '7d' | '30d' | '90d'; label: string }[] = [
    { key: '7d', label: '7 días' },
    { key: '30d', label: '30 días' },
    { key: '90d', label: '90 días' },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Bell size={24} color="#1f2937" />
          <Text style={styles.title}>Analytics de Notificaciones</Text>
        </View>
        
        <Text style={styles.subtitle}>
          Métricas completas y optimización continua
        </Text>
      </View>

      {/* Filters */}
      <View style={styles.filtersContainer}>
        <View style={styles.filterSection}>
          <Text style={styles.filterLabel}>Categoría:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.filterChips}>
              {categories.map(category => (
                <FilterChip
                  key={category}
                  label={category === 'all' ? 'Todas' : category.charAt(0).toUpperCase() + category.slice(1)}
                  selected={selectedCategory === category}
                  onPress={() => setSelectedCategory(category)}
                />
              ))}
            </View>
          </ScrollView>
        </View>

        <View style={styles.filterSection}>
          <Text style={styles.filterLabel}>Período:</Text>
          <View style={styles.filterChips}>
            {timeframes.map(timeframe => (
              <FilterChip
                key={timeframe.key}
                label={timeframe.label}
                selected={selectedTimeframe === timeframe.key}
                onPress={() => setSelectedTimeframe(timeframe.key)}
              />
            ))}
          </View>
        </View>
      </View>

      {/* Key Metrics */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Métricas Principales</Text>
        
        <View style={styles.metricsGrid}>
          <MetricCard
            title="Tasa de Entrega"
            value={`${overallMetrics.deliveryRate}%`}
            change={2.5}
            trend="up"
            icon={CheckCircle}
            color="#10b981"
          />
          
          <MetricCard
            title="Tasa de Apertura"
            value={`${overallMetrics.openRate}%`}
            change={-1.2}
            trend="down"
            icon={Eye}
            color="#3b82f6"
          />
          
          <MetricCard
            title="Tasa de Clicks"
            value={`${overallMetrics.clickRate}%`}
            change={5.8}
            trend="up"
            icon={MousePointer}
            color="#f59e0b"
          />
          
          <MetricCard
            title="Engagement"
            value={`${overallMetrics.engagementRate}%`}
            change={3.2}
            trend="up"
            icon={Zap}
            color="#8b5cf6"
          />
        </View>
      </View>

      {/* Engagement by Category */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Engagement por Categoría</Text>
        <View style={styles.chartContainer}>
          <BarChart
            data={categoryChartData}
            width={chartWidth}
            height={220}
            yAxisLabel=""
            yAxisSuffix="%"
            chartConfig={{
              backgroundColor: '#ffffff',
              backgroundGradientFrom: '#ffffff',
              backgroundGradientTo: '#ffffff',
              decimalPlaces: 1,
              color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(31, 41, 55, ${opacity})`,
              style: {
                borderRadius: 16,
              },
              propsForDots: {
                r: '6',
                strokeWidth: '2',
                stroke: '#3b82f6'
              }
            }}
            style={styles.chart}
          />
        </View>
      </View>

      {/* Hourly Performance */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Rendimiento por Hora</Text>
        <View style={styles.chartContainer}>
          <LineChart
            data={hourlyData}
            width={chartWidth}
            height={220}
            yAxisLabel=""
            yAxisSuffix="%"
            chartConfig={{
              backgroundColor: '#ffffff',
              backgroundGradientFrom: '#ffffff',
              backgroundGradientTo: '#ffffff',
              decimalPlaces: 1,
              color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(31, 41, 55, ${opacity})`,
              style: {
                borderRadius: 16,
              },
              propsForDots: {
                r: '4',
                strokeWidth: '2',
                stroke: '#10b981'
              }
            }}
            style={styles.chart}
          />
        </View>
        <Text style={styles.chartDescription}>
          Mejor horario: 20:00 - 22:00 (75% de apertura)
        </Text>
      </View>

      {/* A/B Tests */}
      {abTestResults.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pruebas A/B Activas</Text>
          {abTestResults.map(({ test, results }) => (
            <View key={test.id} style={styles.abTestCard}>
              <View style={styles.abTestHeader}>
                <Text style={styles.abTestTitle}>{test.name}</Text>
                <View style={[
                  styles.abTestStatus,
                  { backgroundColor: test.status === 'running' ? '#dcfce7' : '#fef3c7' }
                ]}>
                  <Text style={[
                    styles.abTestStatusText,
                    { color: test.status === 'running' ? '#166534' : '#92400e' }
                  ]}>
                    {test.status === 'running' ? 'Activo' : 'Completado'}
                  </Text>
                </View>
              </View>
              
              <Text style={styles.abTestDescription}>{test.description}</Text>
              
              <View style={styles.abTestVariants}>
                {test.variants.map(variant => (
                  <View key={variant.id} style={styles.variantCard}>
                    <View style={styles.variantHeader}>
                      <Text style={styles.variantName}>{variant.name}</Text>
                      {results?.winner.id === variant.id && (
                        <View style={styles.winnerBadge}>
                          <Target size={12} color="#10b981" />
                          <Text style={styles.winnerText}>Ganador</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.variantMetric}>
                      Engagement: {variant.metrics.engagementRate}%
                    </Text>
                    <Text style={styles.variantMetric}>
                      Clicks: {variant.metrics.clickRate}%
                    </Text>
                  </View>
                ))}
              </View>
              
              {results && (
                <Text style={styles.confidenceText}>
                  Confianza estadística: {results.confidence}%
                </Text>
              )}
            </View>
          ))}
        </View>
      )}

      {/* Insights */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Insights y Recomendaciones</Text>
        {analytics.insights.slice(0, 3).map(insight => (
          <View key={insight.id} style={styles.insightCard}>
            <View style={styles.insightHeader}>
              <View style={[
                styles.insightIcon,
                { backgroundColor: getSeverityColor(insight.severity) + '20' }
              ]}>
                {insight.type === 'alert' && (
                  <AlertTriangle size={16} color={getSeverityColor(insight.severity)} />
                )}
                {insight.type === 'trend' && (
                  <TrendingUp size={16} color={getSeverityColor(insight.severity)} />
                )}
                {insight.type === 'recommendation' && (
                  <Target size={16} color={getSeverityColor(insight.severity)} />
                )}
              </View>
              <View style={styles.insightContent}>
                <Text style={styles.insightTitle}>{insight.title}</Text>
                <Text style={styles.insightDescription}>{insight.description}</Text>
              </View>
            </View>
            
            {insight.actionable && insight.actions && (
              <View style={styles.insightActions}>
                {insight.actions.map((action) => (
                  <TouchableOpacity
                    key={`${insight.id}-${action.action}`}
                    style={styles.actionButton}
                    onPress={() => console.log('Action:', action.action)}
                  >
                    <Text style={styles.actionButtonText}>{action.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        ))}
      </View>

      {/* Optimizations */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Optimizaciones Sugeridas</Text>
        {analytics.optimizations.slice(0, 2).map(optimization => (
          <View key={optimization.id} style={styles.optimizationCard}>
            <View style={styles.optimizationHeader}>
              <Text style={styles.optimizationTitle}>
                {optimization.type.replace('_', ' ').toUpperCase()}
              </Text>
              <View style={[
                styles.optimizationStatus,
                { backgroundColor: getStatusColor(optimization.status) + '20' }
              ]}>
                <Text style={[
                  styles.optimizationStatusText,
                  { color: getStatusColor(optimization.status) }
                ]}>
                  {getStatusLabel(optimization.status)}
                </Text>
              </View>
            </View>
            
            <Text style={styles.optimizationRecommendation}>
              {optimization.recommendation}
            </Text>
            
            <View style={styles.optimizationImpact}>
              <View style={styles.impactMetric}>
                <Text style={styles.impactLabel}>Mejora Esperada:</Text>
                <Text style={styles.impactValue}>
                  +{optimization.impact.expectedImprovement}%
                </Text>
              </View>
              <View style={styles.impactMetric}>
                <Text style={styles.impactLabel}>Confianza:</Text>
                <Text style={styles.impactValue}>
                  {optimization.impact.confidence}%
                </Text>
              </View>
              <View style={styles.impactMetric}>
                <Text style={styles.impactLabel}>Esfuerzo:</Text>
                <Text style={styles.impactValue}>
                  {optimization.implementation.estimatedHours}h
                </Text>
              </View>
            </View>
          </View>
        ))}
      </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const getSeverityColor = (severity: string): string => {
  switch (severity) {
    case 'critical': return '#ef4444';
    case 'high': return '#f59e0b';
    case 'medium': return '#3b82f6';
    case 'low': return '#10b981';
    default: return '#6b7280';
  }
};

const getStatusColor = (status: string): string => {
  switch (status) {
    case 'implemented': return '#10b981';
    case 'in_progress': return '#3b82f6';
    case 'pending': return '#f59e0b';
    case 'rejected': return '#ef4444';
    default: return '#6b7280';
  }
};

const getStatusLabel = (status: string): string => {
  switch (status) {
    case 'implemented': return 'Implementado';
    case 'in_progress': return 'En Progreso';
    case 'pending': return 'Pendiente';
    case 'rejected': return 'Rechazado';
    default: return status;
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1f2937',
    marginLeft: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
  },
  filtersContainer: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  filterSection: {
    marginBottom: 16,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  filterChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  filterChipSelected: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#374151',
  },
  filterChipTextSelected: {
    color: '#ffffff',
  },
  section: {
    backgroundColor: '#ffffff',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  metricsGrid: {
    gap: 12,
  },
  metricCard: {
    backgroundColor: '#f9fafb',
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  metricIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  metricTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
  },
  metricContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  metricValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1f2937',
  },
  metricChange: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  changeText: {
    fontSize: 14,
    fontWeight: '600',
  },
  chartContainer: {
    alignItems: 'center',
    marginVertical: 8,
  },
  chart: {
    borderRadius: 16,
  },
  chartDescription: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 8,
  },
  abTestCard: {
    backgroundColor: '#f9fafb',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  abTestHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  abTestTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    flex: 1,
  },
  abTestStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  abTestStatusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  abTestDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 12,
  },
  abTestVariants: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
  },
  variantCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 12,
    borderRadius: 6,
  },
  variantHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  variantName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  winnerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  winnerText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#10b981',
  },
  variantMetric: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 2,
  },
  confidenceText: {
    fontSize: 12,
    color: '#6b7280',
    fontStyle: 'italic',
  },
  insightCard: {
    backgroundColor: '#f9fafb',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  insightIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  insightContent: {
    flex: 1,
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  insightDescription: {
    fontSize: 14,
    color: '#6b7280',
  },
  insightActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#ffffff',
  },
  optimizationCard: {
    backgroundColor: '#f9fafb',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  optimizationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  optimizationTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  optimizationStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  optimizationStatusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  optimizationRecommendation: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 12,
  },
  optimizationImpact: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  impactMetric: {
    alignItems: 'center',
  },
  impactLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 2,
  },
  impactValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
});