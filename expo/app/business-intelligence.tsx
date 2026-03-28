import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import {
  BarChart,
  LineChart,
  PieChart,
} from 'react-native-chart-kit';
import {
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  Activity,
  Eye,
  Download,
  Filter,
  Calendar,
  AlertTriangle,
} from 'lucide-react-native';
import { useBusinessIntelligence } from '@/hooks/use-business-intelligence';

const { width: screenWidth } = Dimensions.get('window');

export default function BusinessIntelligenceDashboard() {
  const {
    realTimeDashboard,
    metrics,
    segments,
    predictiveAnalytics,
    selectedTimeframe,
    isLoadingRealTime,
    isLoadingMetrics,
    setSelectedTimeframe,
    refreshRealTime,
    exportData,
    generateAlerts,
  } = useBusinessIntelligence();

  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [selectedView, setSelectedView] = useState<'overview' | 'segments' | 'predictive'>('overview');

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshRealTime();
    setRefreshing(false);
  };

  const alerts = generateAlerts();

  const chartConfig = {
    backgroundColor: '#ffffff',
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '6',
      strokeWidth: '2',
      stroke: '#3B82F6',
    },
  };

  const renderMetricCard = (metric: any) => {
    const isPositive = metric.changeType === 'increase';
    const TrendIcon = isPositive ? TrendingUp : TrendingDown;
    const trendColor = isPositive ? '#10B981' : '#EF4444';

    return (
      <View key={metric.id} style={styles.metricCard}>
        <View style={styles.metricHeader}>
          <Text style={styles.metricName}>{metric.name}</Text>
          <View style={[styles.trendBadge, { backgroundColor: `${trendColor}20` }]}>
            <TrendIcon size={16} color={trendColor} />
            <Text style={[styles.trendText, { color: trendColor }]}>
              {Math.abs(metric.change)}%
            </Text>
          </View>
        </View>
        <Text style={styles.metricValue}>
          {metric.unit === '$' ? `$${metric.value.toLocaleString()}` : 
           metric.unit === 'users' ? `${metric.value.toLocaleString()} usuarios` :
           `${metric.value}${metric.unit}`}
        </Text>
        <Text style={styles.metricSubtext}>
          vs. período anterior: {metric.unit === '$' ? `$${metric.previousValue.toLocaleString()}` : 
                                metric.unit === 'users' ? `${metric.previousValue.toLocaleString()} usuarios` :
                                `${metric.previousValue}${metric.unit}`}
        </Text>
      </View>
    );
  };

  const renderRealTimeStats = () => {
    if (!realTimeDashboard) return null;

    return (
      <View style={styles.realTimeContainer}>
        <Text style={styles.sectionTitle}>Estadísticas en Tiempo Real</Text>
        <View style={styles.realTimeGrid}>
          <View style={styles.realTimeCard}>
            <Users size={24} color="#3B82F6" />
            <Text style={styles.realTimeValue}>{realTimeDashboard.activeUsers}</Text>
            <Text style={styles.realTimeLabel}>Usuarios Activos</Text>
          </View>
          <View style={styles.realTimeCard}>
            <DollarSign size={24} color="#10B981" />
            <Text style={styles.realTimeValue}>${realTimeDashboard.currentSales.toLocaleString()}</Text>
            <Text style={styles.realTimeLabel}>Ventas Hoy</Text>
          </View>
          <View style={styles.realTimeCard}>
            <Activity size={24} color="#F59E0B" />
            <Text style={styles.realTimeValue}>{realTimeDashboard.conversionRate.toFixed(1)}%</Text>
            <Text style={styles.realTimeLabel}>Conversión</Text>
          </View>
          <View style={styles.realTimeCard}>
            <Eye size={24} color="#8B5CF6" />
            <Text style={styles.realTimeValue}>${realTimeDashboard.averageOrderValue.toFixed(0)}</Text>
            <Text style={styles.realTimeLabel}>Ticket Promedio</Text>
          </View>
        </View>
      </View>
    );
  };

  const renderSegments = () => {
    if (!segments.length) return null;

    const segmentData = segments.map(segment => ({
      name: segment.name,
      population: segment.customerCount,
      color: segment.color,
      legendFontColor: '#7F7F7F',
      legendFontSize: 12,
    }));

    return (
      <View style={styles.chartContainer}>
        <Text style={styles.sectionTitle}>Segmentos de Clientes</Text>
        <PieChart
          data={segmentData}
          width={screenWidth - 40}
          height={220}
          chartConfig={chartConfig}
          accessor="population"
          backgroundColor="transparent"
          paddingLeft="15"
          absolute
        />
        <View style={styles.segmentsList}>
          {segments.map(segment => (
            <View key={segment.id} style={styles.segmentItem}>
              <View style={[styles.segmentColor, { backgroundColor: segment.color }]} />
              <View style={styles.segmentInfo}>
                <Text style={styles.segmentName}>{segment.name}</Text>
                <Text style={styles.segmentStats}>
                  {segment.customerCount} clientes • ${segment.averageValue} promedio
                </Text>
                <Text style={[styles.segmentGrowth, { 
                  color: segment.growthRate > 0 ? '#10B981' : '#EF4444' 
                }]}>
                  {segment.growthRate > 0 ? '+' : ''}{segment.growthRate}% crecimiento
                </Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    );
  };

  const renderPredictiveAnalytics = () => {
    if (!predictiveAnalytics) return null;

    return (
      <View style={styles.predictiveContainer}>
        <Text style={styles.sectionTitle}>Análisis Predictivo</Text>
        
        {/* Revenue Projection */}
        <View style={styles.predictionCard}>
          <Text style={styles.predictionTitle}>Proyección de Ingresos</Text>
          <Text style={styles.predictionValue}>
            ${predictiveAnalytics.revenueProjection.currentMonth.toLocaleString()}
          </Text>
          <Text style={styles.predictionGrowth}>
            +{predictiveAnalytics.revenueProjection.projectedGrowth}% proyectado
          </Text>
          <Text style={styles.predictionRange}>
            Rango: ${predictiveAnalytics.revenueProjection.confidenceInterval[0].toLocaleString()} - 
            ${predictiveAnalytics.revenueProjection.confidenceInterval[1].toLocaleString()}
          </Text>
        </View>

        {/* Demand Forecast */}
        <View style={styles.predictionCard}>
          <Text style={styles.predictionTitle}>Pronóstico de Demanda</Text>
          {predictiveAnalytics.demandForecast.map(forecast => (
            <View key={forecast.productId} style={styles.forecastItem}>
              <Text style={styles.forecastProduct}>{forecast.productName}</Text>
              <View style={styles.forecastStats}>
                <Text style={styles.forecastCurrent}>Actual: {forecast.currentDemand}</Text>
                <Text style={styles.forecastPredicted}>
                  Predicción: {forecast.predictedDemand} ({(forecast.confidence * 100).toFixed(0)}% confianza)
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Churn Prediction */}
        <View style={styles.predictionCard}>
          <Text style={styles.predictionTitle}>Predicción de Abandono</Text>
          {predictiveAnalytics.churnPrediction.map(churn => (
            <View key={churn.customerId} style={styles.churnItem}>
              <View style={styles.churnHeader}>
                <Text style={styles.churnCustomer}>Cliente #{churn.customerId}</Text>
                <View style={[styles.riskBadge, { 
                  backgroundColor: churn.riskLevel === 'high' ? '#FEE2E2' : 
                                   churn.riskLevel === 'medium' ? '#FEF3C7' : '#D1FAE5'
                }]}>
                  <Text style={[styles.riskText, {
                    color: churn.riskLevel === 'high' ? '#DC2626' : 
                           churn.riskLevel === 'medium' ? '#D97706' : '#059669'
                  }]}>
                    {churn.riskLevel === 'high' ? 'Alto' : 
                     churn.riskLevel === 'medium' ? 'Medio' : 'Bajo'} Riesgo
                  </Text>
                </View>
              </View>
              <Text style={styles.churnProbability}>
                {(churn.churnProbability * 100).toFixed(0)}% probabilidad de abandono
              </Text>
              <Text style={styles.churnActions}>
                Acciones: {churn.recommendedActions.join(', ')}
              </Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  const renderAlerts = () => {
    if (!alerts.length) return null;

    return (
      <View style={styles.alertsContainer}>
        <Text style={styles.sectionTitle}>Alertas</Text>
        {alerts.map((alert, index) => (
          <View key={index} style={styles.alertItem}>
            <AlertTriangle size={20} color="#F59E0B" />
            <Text style={styles.alertText}>{alert}</Text>
          </View>
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: 'Business Intelligence',
          headerStyle: { backgroundColor: '#3B82F6' },
          headerTintColor: '#FFFFFF',
          headerTitleStyle: { fontWeight: 'bold' },
        }} 
      />
      
      <View style={styles.header}>
        <View style={styles.timeframeSelector}>
          {(['daily', 'weekly', 'monthly', 'yearly'] as const).map(timeframe => (
            <TouchableOpacity
              key={timeframe}
              style={[
                styles.timeframeButton,
                selectedTimeframe === timeframe && styles.timeframeButtonActive
              ]}
              onPress={() => setSelectedTimeframe(timeframe)}
            >
              <Text style={[
                styles.timeframeText,
                selectedTimeframe === timeframe && styles.timeframeTextActive
              ]}>
                {timeframe === 'daily' ? 'Diario' :
                 timeframe === 'weekly' ? 'Semanal' :
                 timeframe === 'monthly' ? 'Mensual' : 'Anual'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.actionButton}>
            <Filter size={20} color="#6B7280" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => exportData('pdf')}
          >
            <Download size={20} color="#6B7280" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.viewSelector}>
        {(['overview', 'segments', 'predictive'] as const).map(view => (
          <TouchableOpacity
            key={view}
            style={[
              styles.viewButton,
              selectedView === view && styles.viewButtonActive
            ]}
            onPress={() => setSelectedView(view)}
          >
            <Text style={[
              styles.viewText,
              selectedView === view && styles.viewTextActive
            ]}>
              {view === 'overview' ? 'Resumen' :
               view === 'segments' ? 'Segmentos' : 'Predictivo'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {renderAlerts()}
        
        {selectedView === 'overview' && (
          <>
            {renderRealTimeStats()}
            
            <View style={styles.metricsContainer}>
              <Text style={styles.sectionTitle}>Métricas Clave</Text>
              <View style={styles.metricsGrid}>
                {metrics.map(renderMetricCard)}
              </View>
            </View>

            {realTimeDashboard?.topProducts && (
              <View style={styles.chartContainer}>
                <Text style={styles.sectionTitle}>Productos Top</Text>
                <View style={styles.productsList}>
                  {realTimeDashboard.topProducts.map(product => (
                    <View key={product.id} style={styles.productItem}>
                      <View style={styles.productInfo}>
                        <Text style={styles.productName}>{product.name}</Text>
                        <Text style={styles.productStats}>
                          {product.sales} ventas • ${product.revenue.toLocaleString()} ingresos
                        </Text>
                      </View>
                      <View style={styles.productTrend}>
                        {product.trend === 'up' ? (
                          <TrendingUp size={16} color="#10B981" />
                        ) : product.trend === 'down' ? (
                          <TrendingDown size={16} color="#EF4444" />
                        ) : (
                          <Activity size={16} color="#6B7280" />
                        )}
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </>
        )}

        {selectedView === 'segments' && renderSegments()}
        {selectedView === 'predictive' && renderPredictiveAnalytics()}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  timeframeSelector: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 4,
  },
  timeframeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  timeframeButtonActive: {
    backgroundColor: '#3B82F6',
  },
  timeframeText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
  },
  timeframeTextActive: {
    color: '#FFFFFF',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  viewSelector: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  viewButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  viewButtonActive: {
    borderBottomColor: '#3B82F6',
  },
  viewText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  viewTextActive: {
    color: '#3B82F6',
  },
  content: {
    flex: 1,
  },
  alertsContainer: {
    margin: 20,
    marginBottom: 0,
  },
  alertItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    gap: 8,
  },
  alertText: {
    flex: 1,
    fontSize: 14,
    color: '#92400E',
  },
  realTimeContainer: {
    margin: 20,
  },
  realTimeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  realTimeCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  realTimeValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 8,
  },
  realTimeLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  metricsContainer: {
    margin: 20,
  },
  metricsGrid: {
    gap: 12,
  },
  metricCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  metricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  metricName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  trendText: {
    fontSize: 12,
    fontWeight: '600',
  },
  metricValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  metricSubtext: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  chartContainer: {
    margin: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  segmentsList: {
    marginTop: 16,
    gap: 12,
  },
  segmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  segmentColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  segmentInfo: {
    flex: 1,
  },
  segmentName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  segmentStats: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  segmentGrowth: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  productsList: {
    gap: 12,
  },
  productItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  productStats: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  productTrend: {
    padding: 4,
  },
  predictiveContainer: {
    margin: 20,
    gap: 16,
  },
  predictionCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  predictionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  predictionValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3B82F6',
    marginBottom: 4,
  },
  predictionGrowth: {
    fontSize: 14,
    fontWeight: '500',
    color: '#10B981',
    marginBottom: 8,
  },
  predictionRange: {
    fontSize: 12,
    color: '#6B7280',
  },
  forecastItem: {
    marginBottom: 12,
  },
  forecastProduct: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  forecastStats: {
    gap: 2,
  },
  forecastCurrent: {
    fontSize: 12,
    color: '#6B7280',
  },
  forecastPredicted: {
    fontSize: 12,
    color: '#3B82F6',
    fontWeight: '500',
  },
  churnItem: {
    marginBottom: 16,
  },
  churnHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  churnCustomer: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  riskBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  riskText: {
    fontSize: 12,
    fontWeight: '600',
  },
  churnProbability: {
    fontSize: 14,
    fontWeight: '500',
    color: '#EF4444',
    marginBottom: 4,
  },
  churnActions: {
    fontSize: 12,
    color: '#6B7280',
  },
});