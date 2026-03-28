import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, router } from 'expo-router';
import { 
  ArrowLeft, 
  TrendingUp, 
  Users, 
  MessageCircle, 
  Clock,
  Star,
  BarChart3,
  PieChart,
  Activity,
  Download
} from 'lucide-react-native';
import { useAnalytics } from '@/hooks/use-analytics';
import { usePremiumFeatures } from '@/hooks/use-premium-features';

const { width } = Dimensions.get('window');

const MetricCard = ({ 
  title, 
  value, 
  trend, 
  icon: Icon, 
  color = '#2563eb' 
}: {
  title: string;
  value: string | number;
  trend?: { value: number; isPositive: boolean };
  icon: any;
  color?: string;
}) => (
  <View style={styles.metricCard}>
    <View style={styles.metricHeader}>
      <View style={[styles.metricIcon, { backgroundColor: `${color}20` }]}>
        <Icon size={20} color={color} />
      </View>
      {trend && (
        <View style={[styles.trendBadge, { backgroundColor: trend.isPositive ? '#dcfce7' : '#fee2e2' }]}>
          <TrendingUp 
            size={12} 
            color={trend.isPositive ? '#16a34a' : '#dc2626'} 
            style={{ transform: [{ rotate: trend.isPositive ? '0deg' : '180deg' }] }}
          />
          <Text style={[styles.trendText, { color: trend.isPositive ? '#16a34a' : '#dc2626' }]}>
            {Math.abs(trend.value)}%
          </Text>
        </View>
      )}
    </View>
    <Text style={styles.metricValue}>{value}</Text>
    <Text style={styles.metricTitle}>{title}</Text>
  </View>
);

const ChartCard = ({ 
  title, 
  children, 
  onExport 
}: {
  title: string;
  children: React.ReactNode;
  onExport?: () => void;
}) => (
  <View style={styles.chartCard}>
    <View style={styles.chartHeader}>
      <Text style={styles.chartTitle}>{title}</Text>
      {onExport && (
        <TouchableOpacity onPress={onExport} style={styles.exportButton}>
          <Download size={16} color="#64748b" />
        </TouchableOpacity>
      )}
    </View>
    {children}
  </View>
);

const SimpleBarChart = ({ data, maxValue }: { data: number[]; maxValue: number }) => (
  <View style={styles.barChart}>
    {data.slice(0, 12).map((value, index) => (
      <View key={index} style={styles.barContainer}>
        <View 
          style={[
            styles.bar, 
            { 
              height: Math.max((value / maxValue) * 100, 2),
              backgroundColor: value > maxValue * 0.7 ? '#2563eb' : '#94a3b8'
            }
          ]} 
        />
        <Text style={styles.barLabel}>{index + 1}</Text>
      </View>
    ))}
  </View>
);

const SimplePieChart = ({ data }: { data: { label: string; value: number; color: string }[] }) => (
  <View style={styles.pieChartContainer}>
    <View style={styles.pieChart}>
      {data.map((item, index) => (
        <View key={index} style={styles.pieSlice}>
          <View style={[styles.pieColor, { backgroundColor: item.color }]} />
          <Text style={styles.pieLabel}>{item.label}</Text>
          <Text style={styles.pieValue}>{item.value}%</Text>
        </View>
      ))}
    </View>
  </View>
);

export default function AnalyticsScreen() {
  const { usageStats, chatAnalytics, generateUsageReport, exportAnalyticsData } = useAnalytics();
  const { hasFeature, showPremiumAlert } = usePremiumFeatures();
  const [selectedTimeframe, setSelectedTimeframe] = useState<'day' | 'week' | 'month'>('week');

  const handleExportData = () => {
    if (!hasFeature('advancedAnalytics')) {
      showPremiumAlert('Analytics Avanzados');
      return;
    }

    try {
      const data = exportAnalyticsData('json');
      console.log('Analytics data exported:', data.length, 'characters');
      // In a real app, this would trigger a file download or share
    } catch (error) {
      console.error('Error exporting analytics:', error);
    }
  };

  const handleGenerateReport = () => {
    if (!hasFeature('advancedAnalytics')) {
      showPremiumAlert('Reportes Avanzados');
      return;
    }

    const timeframe = {
      start: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30),
      end: new Date(),
      granularity: 'day' as const,
    };

    const report = generateUsageReport(timeframe);
    console.log('Usage report generated:', report);
  };

  const messageTypeData = [
    { label: 'Texto', value: 81, color: '#2563eb' },
    { label: 'Audio', value: 12, color: '#16a34a' },
    { label: 'Imagen', value: 6, color: '#f59e0b' },
    { label: 'Archivo', value: 1, color: '#dc2626' },
  ];

  const platformData = [
    { label: 'Android', value: 65, color: '#22c55e' },
    { label: 'iOS', value: 30, color: '#3b82f6' },
    { label: 'Web', value: 5, color: '#f59e0b' },
  ];

  if (!usageStats) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.loadingContainer}>
          <Activity size={32} color="#2563eb" />
          <Text style={styles.loadingText}>Cargando analytics...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen 
        options={{
          headerShown: true,
          headerStyle: { backgroundColor: '#ffffff' },
          headerShadowVisible: true,
          headerTitle: 'Analytics y Métricas',
          headerTitleStyle: { fontSize: 18, fontWeight: '600' },
          headerLeft: () => (
            <TouchableOpacity 
              style={styles.headerBack}
              onPress={() => router.back()}
            >
              <ArrowLeft size={24} color="#1e293b" />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity 
              style={styles.exportButton}
              onPress={handleExportData}
            >
              <Download size={20} color={hasFeature('advancedAnalytics') ? "#2563eb" : "#cbd5e1"} />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Timeframe Selector */}
        <View style={styles.timeframeSelector}>
          {(['day', 'week', 'month'] as const).map((timeframe) => (
            <TouchableOpacity
              key={timeframe}
              style={[
                styles.timeframeButton,
                selectedTimeframe === timeframe && styles.timeframeButtonActive
              ]}
              onPress={() => setSelectedTimeframe(timeframe)}
            >
              <Text style={[
                styles.timeframeButtonText,
                selectedTimeframe === timeframe && styles.timeframeButtonTextActive
              ]}>
                {timeframe === 'day' ? 'Hoy' : timeframe === 'week' ? 'Semana' : 'Mes'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Key Metrics */}
        <View style={styles.metricsGrid}>
          <MetricCard
            title="Usuarios Activos"
            value={usageStats.overview.activeUsersToday}
            trend={{ value: 12, isPositive: true }}
            icon={Users}
            color="#2563eb"
          />
          <MetricCard
            title="Mensajes Enviados"
            value={usageStats.messaging.messagesPerDay[29] || 0}
            trend={{ value: 8, isPositive: true }}
            icon={MessageCircle}
            color="#16a34a"
          />
          <MetricCard
            title="Tiempo Respuesta"
            value={`${Math.round(usageStats.messaging.averageResponseTime / 60)}min`}
            trend={{ value: 5, isPositive: false }}
            icon={Clock}
            color="#f59e0b"
          />
          <MetricCard
            title="Satisfacción"
            value={`${usageStats.business.allyStats.customerSatisfaction}/5`}
            trend={{ value: 3, isPositive: true }}
            icon={Star}
            color="#8b5cf6"
          />
        </View>

        {/* Message Activity Chart */}
        <ChartCard title="Actividad de Mensajes (Últimos 12 días)" onExport={handleExportData}>
          <SimpleBarChart 
            data={usageStats.messaging.messagesPerDay.slice(-12)} 
            maxValue={Math.max(...usageStats.messaging.messagesPerDay)}
          />
        </ChartCard>

        {/* Message Types Distribution */}
        <ChartCard title="Distribución por Tipo de Mensaje">
          <SimplePieChart data={messageTypeData} />
        </ChartCard>

        {/* Platform Usage */}
        <ChartCard title="Uso por Plataforma">
          <SimplePieChart data={platformData} />
        </ChartCard>

        {/* Business Metrics */}
        <View style={styles.businessSection}>
          <Text style={styles.sectionTitle}>Métricas de Negocio</Text>
          
          <View style={styles.businessGrid}>
            <View style={styles.businessCard}>
              <Text style={styles.businessValue}>{usageStats.business.allyStats.totalAllies}</Text>
              <Text style={styles.businessLabel}>Aliados Totales</Text>
            </View>
            <View style={styles.businessCard}>
              <Text style={styles.businessValue}>{usageStats.business.allyStats.activeAllies}</Text>
              <Text style={styles.businessLabel}>Aliados Activos</Text>
            </View>
            <View style={styles.businessCard}>
              <Text style={styles.businessValue}>${usageStats.business.transactionStats.transactionVolume.toLocaleString()}</Text>
              <Text style={styles.businessLabel}>Volumen Transacciones</Text>
            </View>
            <View style={styles.businessCard}>
              <Text style={styles.businessValue}>{usageStats.business.referralStats.successfulReferrals}</Text>
              <Text style={styles.businessLabel}>Referidos Exitosos</Text>
            </View>
          </View>
        </View>

        {/* Chat Analytics */}
        {chatAnalytics.length > 0 && (
          <View style={styles.chatSection}>
            <Text style={styles.sectionTitle}>Analytics de Conversaciones</Text>
            {chatAnalytics.slice(0, 3).map((analytics) => (
              <View key={analytics.chatId} style={styles.chatAnalyticsCard}>
                <View style={styles.chatAnalyticsHeader}>
                  <Text style={styles.chatAnalyticsTitle}>Chat {analytics.chatId}</Text>
                  <View style={styles.engagementBadge}>
                    <Text style={styles.engagementText}>{analytics.engagementScore}%</Text>
                  </View>
                </View>
                <View style={styles.chatAnalyticsStats}>
                  <View style={styles.chatStat}>
                    <Text style={styles.chatStatValue}>{analytics.messageCount}</Text>
                    <Text style={styles.chatStatLabel}>Mensajes</Text>
                  </View>
                  <View style={styles.chatStat}>
                    <Text style={styles.chatStatValue}>{Math.round(analytics.averageResponseTime / 60)}min</Text>
                    <Text style={styles.chatStatLabel}>Respuesta</Text>
                  </View>
                  <View style={styles.chatStat}>
                    <Text style={styles.chatStatValue}>{analytics.satisfactionRating?.toFixed(1) || 'N/A'}</Text>
                    <Text style={styles.chatStatLabel}>Satisfacción</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Generate Report Button */}
        <TouchableOpacity 
          style={[
            styles.generateReportButton,
            !hasFeature('advancedAnalytics') && styles.disabledButton
          ]}
          onPress={handleGenerateReport}
        >
          <BarChart3 size={20} color="#ffffff" />
          <Text style={styles.generateReportText}>Generar Reporte Completo</Text>
        </TouchableOpacity>

        {/* Premium Features Notice */}
        {!hasFeature('advancedAnalytics') && (
          <View style={styles.premiumNotice}>
            <PieChart size={24} color="#8b5cf6" />
            <Text style={styles.premiumNoticeText}>
              Actualiza a Premium para acceder a analytics avanzados, reportes personalizados y exportación de datos.
            </Text>
            <TouchableOpacity 
              style={styles.upgradeButton}
              onPress={() => showPremiumAlert('Analytics Avanzados')}
            >
              <Text style={styles.upgradeButtonText}>Actualizar Plan</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.bottomSpacing} />
      </ScrollView>
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
    color: '#64748b',
  },
  headerBack: {
    marginRight: 8,
  },
  exportButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  timeframeSelector: {
    flexDirection: 'row',
    margin: 16,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  timeframeButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  timeframeButtonActive: {
    backgroundColor: '#2563eb',
  },
  timeframeButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748b',
  },
  timeframeButtonTextActive: {
    color: '#ffffff',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 12,
  },
  metricCard: {
    width: (width - 44) / 2,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
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
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 12,
    gap: 2,
  },
  trendText: {
    fontSize: 10,
    fontWeight: '600',
  },
  metricValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 4,
  },
  metricTitle: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
  },
  chartCard: {
    margin: 16,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  barChart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 120,
    gap: 4,
  },
  barContainer: {
    flex: 1,
    alignItems: 'center',
    height: 120,
    justifyContent: 'flex-end',
  },
  bar: {
    width: '80%',
    borderRadius: 2,
    marginBottom: 8,
  },
  barLabel: {
    fontSize: 10,
    color: '#64748b',
  },
  pieChartContainer: {
    alignItems: 'center',
  },
  pieChart: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  pieSlice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    width: '45%',
  },
  pieColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  pieLabel: {
    fontSize: 12,
    color: '#64748b',
    flex: 1,
  },
  pieValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1e293b',
  },
  businessSection: {
    margin: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 16,
  },
  businessGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  businessCard: {
    width: (width - 44) / 2,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  businessValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2563eb',
    marginBottom: 4,
  },
  businessLabel: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
  },
  chatSection: {
    margin: 16,
  },
  chatAnalyticsCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  chatAnalyticsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  chatAnalyticsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
  },
  engagementBadge: {
    backgroundColor: '#dcfce7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  engagementText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#16a34a',
  },
  chatAnalyticsStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  chatStat: {
    alignItems: 'center',
  },
  chatStatValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  chatStatLabel: {
    fontSize: 10,
    color: '#64748b',
    marginTop: 2,
  },
  generateReportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563eb',
    margin: 16,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  generateReportText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    backgroundColor: '#cbd5e1',
  },
  premiumNotice: {
    margin: 16,
    backgroundColor: '#faf5ff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e9d5ff',
  },
  premiumNoticeText: {
    fontSize: 14,
    color: '#7c3aed',
    textAlign: 'center',
    marginVertical: 12,
    lineHeight: 20,
  },
  upgradeButton: {
    backgroundColor: '#8b5cf6',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  upgradeButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  bottomSpacing: {
    height: 32,
  },
});