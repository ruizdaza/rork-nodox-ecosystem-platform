import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, router } from 'expo-router';
import {
  ArrowLeft,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  MessageSquare,
  Clock,
  Globe,
  Smartphone,
  Activity,
  DollarSign,
  Target,
  Download,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Info,
  Zap,
} from 'lucide-react-native';
import { useUsageAnalytics } from '@/hooks/use-usage-analytics';
import { MetricTrend } from '@/types/chat';

interface MetricCardProps {
  title: string;
  value: string | number;
  trend?: MetricTrend;
  icon: React.ReactNode;
  color: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, trend, icon, color }) => {
  const getTrendIcon = () => {
    if (!trend) return null;
    
    if (trend.trend === 'up') {
      return <TrendingUp size={16} color="#10b981" />;
    } else if (trend.trend === 'down') {
      return <TrendingDown size={16} color="#ef4444" />;
    }
    return null;
  };

  const getTrendColor = () => {
    if (!trend) return '#6b7280';
    return trend.trend === 'up' ? '#10b981' : trend.trend === 'down' ? '#ef4444' : '#6b7280';
  };

  return (
    <View style={styles.metricCard}>
      <View style={styles.metricHeader}>
        <View style={[styles.metricIcon, { backgroundColor: color + '20' }]}>
          {icon}
        </View>
        {getTrendIcon()}
      </View>
      
      <Text style={styles.metricValue}>
        {typeof value === 'number' ? value.toLocaleString() : value}
      </Text>
      <Text style={styles.metricTitle}>{title}</Text>
      
      {trend && (
        <Text style={[styles.metricTrend, { color: getTrendColor() }]}>
          {trend.changePercent > 0 ? '+' : ''}{trend.changePercent.toFixed(1)}%
        </Text>
      )}
    </View>
  );
};

interface SimpleChartProps {
  data: number[];
  color: string;
  height?: number;
}

const SimpleChart: React.FC<SimpleChartProps> = ({ data, color, height = 60 }) => {
  const maxValue = Math.max(...data);
  const minValue = Math.min(...data);
  const range = maxValue - minValue;
  const screenWidth = Dimensions.get('window').width;

  return (
    <View style={[styles.chartContainer, { height }]}>
      <View style={styles.chart}>
        {data.map((value, index) => {
          const normalizedHeight = range > 0 ? ((value - minValue) / range) * (height - 20) : height / 2;
          return (
            <View
              key={`chart-bar-${index}`}
              style={[
                styles.chartBar,
                {
                  height: Math.max(normalizedHeight, 2),
                  backgroundColor: color,
                  width: (screenWidth - 80) / data.length - 2,
                }
              ]}
            />
          );
        })}
      </View>
    </View>
  );
};

interface InsightCardProps {
  type: 'positive' | 'warning' | 'info';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
}

const InsightCard: React.FC<InsightCardProps> = ({ type, title, description, priority }) => {
  const getIcon = () => {
    switch (type) {
      case 'positive': return <CheckCircle size={20} color="#10b981" />;
      case 'warning': return <AlertCircle size={20} color="#f59e0b" />;
      case 'info': return <Info size={20} color="#3b82f6" />;
    }
  };

  const getBackgroundColor = () => {
    switch (type) {
      case 'positive': return '#f0fdf4';
      case 'warning': return '#fffbeb';
      case 'info': return '#eff6ff';
    }
  };

  const getBorderColor = () => {
    switch (type) {
      case 'positive': return '#10b981';
      case 'warning': return '#f59e0b';
      case 'info': return '#3b82f6';
    }
  };

  return (
    <View style={[
      styles.insightCard,
      { 
        backgroundColor: getBackgroundColor(),
        borderLeftColor: getBorderColor()
      }
    ]}>
      <View style={styles.insightHeader}>
        {getIcon()}
        <View style={styles.insightContent}>
          <Text style={styles.insightTitle}>{title}</Text>
          <Text style={styles.insightDescription}>{description}</Text>
        </View>
        <View style={[
          styles.priorityBadge,
          { backgroundColor: priority === 'high' ? '#ef4444' : priority === 'medium' ? '#f59e0b' : '#6b7280' }
        ]}>
          <Text style={styles.priorityText}>{priority.toUpperCase()}</Text>
        </View>
      </View>
    </View>
  );
};

export default function UsageAnalyticsScreen() {
  const {
    stats,
    trends,
    isLoading,
    error,
    lastUpdated,
    refreshAnalytics,
    getInsights,
    exportData
  } = useUsageAnalytics();

  const [activeTab, setActiveTab] = useState<'overview' | 'engagement' | 'business' | 'technical'>('overview');
  const [showExportModal, setShowExportModal] = useState<boolean>(false);

  const handleExport = () => {
    const data = exportData('json');
    if (data) {
      setShowExportModal(true);
    }
  };

  const insights = getInsights();

  if (isLoading && !stats) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.loadingContainer}>
          <Activity size={48} color="#2563eb" />
          <Text style={styles.loadingText}>Cargando estadísticas...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.errorContainer}>
          <AlertCircle size={48} color="#ef4444" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={refreshAnalytics}>
            <RefreshCw size={20} color="#ffffff" />
            <Text style={styles.retryButtonText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (!stats) return null;

  const renderOverview = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      {/* Métricas principales */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Resumen General</Text>
        <View style={styles.metricsGrid}>
          <MetricCard
            title="Usuarios Totales"
            value={stats.overview.totalUsers}
            trend={trends.totalUsers}
            icon={<Users size={20} color="#2563eb" />}
            color="#2563eb"
          />
          <MetricCard
            title="Usuarios Activos Hoy"
            value={stats.overview.activeUsersToday}
            trend={trends.activeUsers}
            icon={<Activity size={20} color="#10b981" />}
            color="#10b981"
          />
          <MetricCard
            title="Mensajes Totales"
            value={stats.messaging.totalMessages}
            trend={trends.totalMessages}
            icon={<MessageSquare size={20} color="#8b5cf6" />}
            color="#8b5cf6"
          />
          <MetricCard
            title="Tiempo de Respuesta"
            value={`${stats.messaging.averageResponseTime}ms`}
            trend={trends.averageResponseTime}
            icon={<Clock size={20} color="#f59e0b" />}
            color="#f59e0b"
          />
        </View>
      </View>

      {/* Gráfico de mensajes por día */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Actividad de Mensajes (30 días)</Text>
        <View style={styles.chartCard}>
          <SimpleChart 
            data={stats.messaging.messagesPerDay} 
            color="#2563eb"
            height={80}
          />
        </View>
      </View>

      {/* Insights */}
      {insights.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Insights Automáticos</Text>
          {insights.map((insight, index) => (
            <InsightCard
              key={`insight-${index}-${insight.title}`}
              type={insight.type as any}
              title={insight.title}
              description={insight.description}
              priority={insight.priority as any}
            />
          ))}
        </View>
      )}
    </ScrollView>
  );

  const renderEngagement = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Retención de Usuarios</Text>
        <View style={styles.retentionGrid}>
          <View style={styles.retentionCard}>
            <Text style={styles.retentionValue}>{stats.engagement.userRetention.day1}%</Text>
            <Text style={styles.retentionLabel}>Día 1</Text>
          </View>
          <View style={styles.retentionCard}>
            <Text style={styles.retentionValue}>{stats.engagement.userRetention.day7}%</Text>
            <Text style={styles.retentionLabel}>Día 7</Text>
          </View>
          <View style={styles.retentionCard}>
            <Text style={styles.retentionValue}>{stats.engagement.userRetention.day30}%</Text>
            <Text style={styles.retentionLabel}>Día 30</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Duración de Sesión</Text>
        <View style={styles.sessionCard}>
          <View style={styles.sessionRow}>
            <Text style={styles.sessionLabel}>Promedio:</Text>
            <Text style={styles.sessionValue}>{stats.engagement.sessionDuration.average} min</Text>
          </View>
          <View style={styles.sessionRow}>
            <Text style={styles.sessionLabel}>Mediana:</Text>
            <Text style={styles.sessionValue}>{stats.engagement.sessionDuration.median} min</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Uso de Funcionalidades</Text>
        {Object.entries(stats.engagement.featureUsage).map(([feature, usage]) => (
          <View key={feature} style={styles.featureRow}>
            <Text style={styles.featureName}>{feature.replace('_', ' ')}</Text>
            <View style={styles.featureBar}>
              <View 
                style={[
                  styles.featureBarFill, 
                  { width: `${usage}%`, backgroundColor: '#2563eb' }
                ]} 
              />
            </View>
            <Text style={styles.featureValue}>{usage}%</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );

  const renderBusiness = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Estadísticas de Aliados</Text>
        <View style={styles.businessGrid}>
          <MetricCard
            title="Aliados Totales"
            value={stats.business.allyStats.totalAllies}
            icon={<Target size={20} color="#2563eb" />}
            color="#2563eb"
          />
          <MetricCard
            title="Aliados Activos"
            value={stats.business.allyStats.activeAllies}
            icon={<Activity size={20} color="#10b981" />}
            color="#10b981"
          />
          <MetricCard
            title="Satisfacción"
            value={`${stats.business.allyStats.customerSatisfaction}/5`}
            icon={<CheckCircle size={20} color="#f59e0b" />}
            color="#f59e0b"
          />
          <MetricCard
            title="Tiempo Respuesta"
            value={`${stats.business.allyStats.averageResponseTime}h`}
            icon={<Clock size={20} color="#8b5cf6" />}
            color="#8b5cf6"
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Transacciones</Text>
        <View style={styles.transactionCard}>
          <View style={styles.transactionRow}>
            <Text style={styles.transactionLabel}>Volumen Total:</Text>
            <Text style={styles.transactionValue}>
              ${stats.business.transactionStats.transactionVolume.toLocaleString()}
            </Text>
          </View>
          <View style={styles.transactionRow}>
            <Text style={styles.transactionLabel}>Valor Promedio:</Text>
            <Text style={styles.transactionValue}>
              ${stats.business.transactionStats.averageTransactionValue.toFixed(2)}
            </Text>
          </View>
          <View style={styles.transactionRow}>
            <Text style={styles.transactionLabel}>Total Transacciones:</Text>
            <Text style={styles.transactionValue}>
              {stats.business.transactionStats.totalTransactions.toLocaleString()}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Servicios Más Populares</Text>
        {stats.business.transactionStats.topServices.map((service, index) => (
          <View key={service.name} style={styles.serviceRow}>
            <View style={styles.serviceRank}>
              <Text style={styles.serviceRankText}>{index + 1}</Text>
            </View>
            <View style={styles.serviceInfo}>
              <Text style={styles.serviceName}>{service.name}</Text>
              <Text style={styles.serviceStats}>
                {service.count} servicios • ${service.revenue.toLocaleString()}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );

  const renderTechnical = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Uso por Plataforma</Text>
        <View style={styles.platformGrid}>
          {Object.entries(stats.technical.platformUsage).map(([platform, count]) => (
            <View key={platform} style={styles.platformCard}>
              <Smartphone size={24} color="#2563eb" />
              <Text style={styles.platformName}>{platform}</Text>
              <Text style={styles.platformCount}>{count.toLocaleString()}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Métricas de Rendimiento</Text>
        <View style={styles.performanceGrid}>
          <MetricCard
            title="Tiempo de Carga"
            value={`${stats.technical.performanceMetrics.averageLoadTime}s`}
            icon={<Zap size={20} color="#10b981" />}
            color="#10b981"
          />
          <MetricCard
            title="Tasa de Errores"
            value={`${(stats.technical.errorRates.total * 100).toFixed(2)}%`}
            icon={<AlertCircle size={20} color="#ef4444" />}
            color="#ef4444"
          />
          <MetricCard
            title="Uso de Memoria"
            value={`${stats.technical.performanceMetrics.memoryUsage}MB`}
            icon={<Activity size={20} color="#8b5cf6" />}
            color="#8b5cf6"
          />
          <MetricCard
            title="Latencia Red"
            value={`${stats.technical.performanceMetrics.networkLatency}ms`}
            icon={<Globe size={20} color="#f59e0b" />}
            color="#f59e0b"
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Versiones de la App</Text>
        {Object.entries(stats.technical.appVersions).map(([version, count]) => (
          <View key={version} style={styles.versionRow}>
            <Text style={styles.versionName}>v{version}</Text>
            <View style={styles.versionBar}>
              <View 
                style={[
                  styles.versionBarFill, 
                  { 
                    width: `${(count / stats.overview.totalUsers) * 100}%`,
                    backgroundColor: '#2563eb'
                  }
                ]} 
              />
            </View>
            <Text style={styles.versionCount}>{count.toLocaleString()}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen 
        options={{
          headerShown: true,
          headerStyle: { backgroundColor: '#ffffff' },
          headerShadowVisible: true,
          headerTitle: 'Estadísticas de Uso',
          headerTitleStyle: { fontSize: 18, fontWeight: '600' },
          headerLeft: () => (
            <TouchableOpacity 
              style={styles.headerButton}
              onPress={() => router.back()}
            >
              <ArrowLeft size={24} color="#1e293b" />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <View style={styles.headerActions}>
              <TouchableOpacity 
                style={styles.headerButton}
                onPress={handleExport}
              >
                <Download size={20} color="#2563eb" />
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.headerButton}
                onPress={refreshAnalytics}
              >
                <RefreshCw size={20} color="#2563eb" />
              </TouchableOpacity>
            </View>
          ),
        }}
      />

      {/* Última actualización */}
      {lastUpdated && (
        <View style={styles.lastUpdated}>
          <Clock size={14} color="#6b7280" />
          <Text style={styles.lastUpdatedText}>
            Actualizado: {lastUpdated.toLocaleTimeString('es-ES')}
          </Text>
        </View>
      )}

      {/* Tabs */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'overview' && styles.activeTab]}
          onPress={() => setActiveTab('overview')}
        >
          <BarChart3 size={18} color={activeTab === 'overview' ? '#2563eb' : '#6b7280'} />
          <Text style={[styles.tabText, activeTab === 'overview' && styles.activeTabText]}>
            General
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'engagement' && styles.activeTab]}
          onPress={() => setActiveTab('engagement')}
        >
          <Users size={18} color={activeTab === 'engagement' ? '#2563eb' : '#6b7280'} />
          <Text style={[styles.tabText, activeTab === 'engagement' && styles.activeTabText]}>
            Engagement
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'business' && styles.activeTab]}
          onPress={() => setActiveTab('business')}
        >
          <DollarSign size={18} color={activeTab === 'business' ? '#2563eb' : '#6b7280'} />
          <Text style={[styles.tabText, activeTab === 'business' && styles.activeTabText]}>
            Negocio
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'technical' && styles.activeTab]}
          onPress={() => setActiveTab('technical')}
        >
          <Smartphone size={18} color={activeTab === 'technical' ? '#2563eb' : '#6b7280'} />
          <Text style={[styles.tabText, activeTab === 'technical' && styles.activeTabText]}>
            Técnico
          </Text>
        </TouchableOpacity>
      </View>

      {/* Contenido */}
      <View style={styles.content}>
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'engagement' && renderEngagement()}
        {activeTab === 'business' && renderBusiness()}
        {activeTab === 'technical' && renderTechnical()}
      </View>

      {/* Modal de exportación */}
      <Modal
        visible={showExportModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.exportModal}>
          <View style={styles.exportHeader}>
            <TouchableOpacity onPress={() => setShowExportModal(false)}>
              <Text style={styles.exportCancel}>Cancelar</Text>
            </TouchableOpacity>
            <Text style={styles.exportTitle}>Exportar Datos</Text>
            <TouchableOpacity onPress={() => {
              console.log('JSON copied to clipboard');
              setShowExportModal(false);
            }}>
              <Text style={styles.exportSave}>Copiar</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.exportContent}>
            <Text style={styles.exportDescription}>
              Los datos han sido preparados para exportación en formato JSON.
            </Text>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    gap: 16,
  },
  errorText: {
    fontSize: 16,
    color: '#ef4444',
    textAlign: 'center',
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2563eb',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 8,
  },
  retryButtonText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  headerButton: {
    padding: 8,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  lastUpdated: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    gap: 6,
  },
  lastUpdatedText: {
    fontSize: 12,
    color: '#6b7280',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 6,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#2563eb',
  },
  tabText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6b7280',
  },
  activeTabText: {
    color: '#2563eb',
  },
  content: {
    flex: 1,
  },
  tabContent: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 16,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  metricCard: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    flex: 1,
    minWidth: 150,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  metricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  metricIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 4,
  },
  metricTitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  metricTrend: {
    fontSize: 12,
    fontWeight: '600',
  },
  chartCard: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  chartContainer: {
    width: '100%',
  },
  chart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: '100%',
    paddingHorizontal: 4,
  },
  chartBar: {
    borderRadius: 2,
    marginHorizontal: 1,
  },
  insightCard: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  insightContent: {
    flex: 1,
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  insightDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#ffffff',
  },
  retentionGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  retentionCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  retentionValue: {
    fontSize: 28,
    fontWeight: '700',
    color: '#2563eb',
    marginBottom: 4,
  },
  retentionLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  sessionCard: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  sessionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sessionLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  sessionValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  featureName: {
    fontSize: 14,
    color: '#374151',
    width: 100,
    textTransform: 'capitalize',
  },
  featureBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#f1f5f9',
    borderRadius: 4,
  },
  featureBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  featureValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1e293b',
    width: 40,
    textAlign: 'right',
  },
  businessGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  transactionCard: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  transactionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  transactionLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  transactionValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  serviceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  serviceRank: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#2563eb',
    justifyContent: 'center',
    alignItems: 'center',
  },
  serviceRankText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 2,
  },
  serviceStats: {
    fontSize: 12,
    color: '#6b7280',
  },
  platformGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  platformCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  platformName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginTop: 8,
    marginBottom: 4,
  },
  platformCount: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
  },
  performanceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  versionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  versionName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    width: 60,
  },
  versionBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#f1f5f9',
    borderRadius: 4,
  },
  versionBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  versionCount: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1e293b',
    width: 60,
    textAlign: 'right',
  },
  exportModal: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  exportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  exportCancel: {
    fontSize: 16,
    color: '#6b7280',
  },
  exportTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
  },
  exportSave: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2563eb',
  },
  exportContent: {
    flex: 1,
    padding: 16,
  },
  exportDescription: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 40,
  },
  iconContainer: {
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  hiddenText: {
    opacity: 0,
    fontSize: 1,
  },
});