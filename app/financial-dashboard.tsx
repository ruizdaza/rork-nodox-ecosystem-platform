import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  ShoppingBag,
  Calendar,
  Download,
  Filter,
  BarChart3,
  PieChart,
} from 'lucide-react-native';
import { useTransactions } from '@/hooks/use-transactions';

const { width } = Dimensions.get('window');

export default function FinancialDashboardScreen() {
  const { financialMetrics, getTransactionStats, exportTransactions } = useTransactions();
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('month');
  const [selectedView, setSelectedView] = useState<'overview' | 'products' | 'sellers'>('overview');

  const stats = getTransactionStats;

  const handleExport = () => {
    const csvData = exportTransactions('csv');
    console.log('Exporting financial data:', csvData);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const calculateGrowth = (current: number, previous: number) => {
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  };

  const monthlyGrowth = calculateGrowth(
    financialMetrics.monthlyRevenue,
    financialMetrics.monthlyGrowth[1]?.revenue || 0
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft color="#1e293b" size={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Dashboard Financiero</Text>
          <TouchableOpacity style={styles.exportButton} onPress={handleExport}>
            <Download color="#2563eb" size={20} />
          </TouchableOpacity>
        </View>

        {/* Period Selector */}
        <View style={styles.periodSelector}>
          {(['week', 'month', 'year'] as const).map((period) => (
            <TouchableOpacity
              key={period}
              style={[
                styles.periodButton,
                selectedPeriod === period && styles.periodButtonActive,
              ]}
              onPress={() => setSelectedPeriod(period)}
            >
              <Text
                style={[
                  styles.periodButtonText,
                  selectedPeriod === period && styles.periodButtonTextActive,
                ]}
              >
                {period === 'week' ? 'Semana' : period === 'month' ? 'Mes' : 'Año'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Key Metrics */}
        <View style={styles.metricsGrid}>
          <LinearGradient
            colors={['#2563eb', '#3b82f6']}
            style={styles.metricCard}
          >
            <View style={styles.metricHeader}>
              <DollarSign color="#ffffff" size={24} />
              <View style={styles.metricGrowth}>
                {monthlyGrowth >= 0 ? (
                  <TrendingUp color="#10b981" size={16} />
                ) : (
                  <TrendingDown color="#ef4444" size={16} />
                )}
                <Text style={styles.metricGrowthText}>
                  {Math.abs(monthlyGrowth).toFixed(1)}%
                </Text>
              </View>
            </View>
            <Text style={styles.metricValue}>
              {formatCurrency(financialMetrics.monthlyRevenue)}
            </Text>
            <Text style={styles.metricLabel}>Ingresos del Mes</Text>
          </LinearGradient>

          <View style={styles.metricCard}>
            <View style={styles.metricHeader}>
              <ShoppingBag color="#2563eb" size={24} />
            </View>
            <Text style={[styles.metricValue, { color: '#1e293b' }]}>
              {financialMetrics.totalTransactions}
            </Text>
            <Text style={styles.metricLabel}>Transacciones</Text>
          </View>

          <View style={styles.metricCard}>
            <View style={styles.metricHeader}>
              <Users color="#10b981" size={24} />
            </View>
            <Text style={[styles.metricValue, { color: '#1e293b' }]}>
              {formatCurrency(financialMetrics.averageOrderValue)}
            </Text>
            <Text style={styles.metricLabel}>Ticket Promedio</Text>
          </View>

          <View style={styles.metricCard}>
            <View style={styles.metricHeader}>
              <BarChart3 color="#8b5cf6" size={24} />
            </View>
            <Text style={[styles.metricValue, { color: '#1e293b' }]}>
              {formatCurrency(financialMetrics.totalNcopRevenue * 100)}
            </Text>
            <Text style={styles.metricLabel}>NCOP Generados</Text>
          </View>
        </View>

        {/* View Selector */}
        <View style={styles.viewSelector}>
          {(['overview', 'products', 'sellers'] as const).map((view) => (
            <TouchableOpacity
              key={view}
              style={[
                styles.viewButton,
                selectedView === view && styles.viewButtonActive,
              ]}
              onPress={() => setSelectedView(view)}
            >
              <Text
                style={[
                  styles.viewButtonText,
                  selectedView === view && styles.viewButtonTextActive,
                ]}
              >
                {view === 'overview' ? 'Resumen' : 
                 view === 'products' ? 'Productos' : 'Vendedores'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Content based on selected view */}
        {selectedView === 'overview' && (
          <>
            {/* Revenue by Category */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Ingresos por Categoría</Text>
                <PieChart color="#64748b" size={20} />
              </View>
              {financialMetrics.revenueByCategory.map((category, index) => (
                <View key={index} style={styles.categoryItem}>
                  <View style={styles.categoryInfo}>
                    <Text style={styles.categoryName}>{category.category}</Text>
                    <Text style={styles.categoryRevenue}>
                      {formatCurrency(category.revenue)}
                    </Text>
                  </View>
                  <View style={styles.categoryBar}>
                    <View
                      style={[
                        styles.categoryBarFill,
                        { width: `${category.percentage}%` },
                      ]}
                    />
                  </View>
                  <Text style={styles.categoryPercentage}>{category.percentage}%</Text>
                </View>
              ))}
            </View>

            {/* Monthly Growth */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Crecimiento Mensual</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.growthChart}>
                  {financialMetrics.monthlyGrowth.map((month, index) => (
                    <View key={index} style={styles.growthBar}>
                      <View
                        style={[
                          styles.growthBarFill,
                          {
                            height: (month.revenue / Math.max(...financialMetrics.monthlyGrowth.map(m => m.revenue))) * 100,
                          },
                        ]}
                      />
                      <Text style={styles.growthBarLabel}>
                        {month.month.split(' ')[0]}
                      </Text>
                      <Text style={styles.growthBarValue}>
                        {formatCurrency(month.revenue)}
                      </Text>
                    </View>
                  ))}
                </View>
              </ScrollView>
            </View>
          </>
        )}

        {selectedView === 'products' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Productos Más Vendidos</Text>
            {financialMetrics.topSellingProducts.map((product, index) => (
              <View key={product.id} style={styles.rankingItem}>
                <View style={styles.rankingNumber}>
                  <Text style={styles.rankingNumberText}>{index + 1}</Text>
                </View>
                <View style={styles.rankingInfo}>
                  <Text style={styles.rankingName}>{product.name}</Text>
                  <Text style={styles.rankingStats}>
                    {product.sales} ventas • {formatCurrency(product.revenue)}
                  </Text>
                </View>
                <View style={styles.rankingBadge}>
                  <Text style={styles.rankingBadgeText}>
                    {formatCurrency(product.revenue / product.sales)}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {selectedView === 'sellers' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Mejores Vendedores</Text>
            {financialMetrics.topSellers.map((seller, index) => (
              <View key={seller.id} style={styles.rankingItem}>
                <View style={styles.rankingNumber}>
                  <Text style={styles.rankingNumberText}>{index + 1}</Text>
                </View>
                <View style={styles.rankingInfo}>
                  <Text style={styles.rankingName}>{seller.name}</Text>
                  <Text style={styles.rankingStats}>
                    {seller.sales} ventas • {formatCurrency(seller.revenue)}
                  </Text>
                </View>
                <View style={styles.rankingBadge}>
                  <Text style={styles.rankingBadgeText}>
                    {formatCurrency(seller.revenue / seller.sales)}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Transaction Status Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Estado de Transacciones</Text>
          <View style={styles.statusGrid}>
            <View style={styles.statusCard}>
              <Text style={styles.statusValue}>{stats.completedCount}</Text>
              <Text style={styles.statusLabel}>Completadas</Text>
              <View style={[styles.statusIndicator, { backgroundColor: '#10b981' }]} />
            </View>
            <View style={styles.statusCard}>
              <Text style={styles.statusValue}>{stats.pendingCount}</Text>
              <Text style={styles.statusLabel}>Pendientes</Text>
              <View style={[styles.statusIndicator, { backgroundColor: '#f59e0b' }]} />
            </View>
            <View style={styles.statusCard}>
              <Text style={styles.statusValue}>{stats.failedCount}</Text>
              <Text style={styles.statusLabel}>Fallidas</Text>
              <View style={[styles.statusIndicator, { backgroundColor: '#ef4444' }]} />
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 16,
  },
  exportButton: {
    padding: 8,
  },
  periodSelector: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: '#e2e8f0',
    borderRadius: 8,
    padding: 4,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 6,
  },
  periodButtonActive: {
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  periodButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748b',
  },
  periodButtonTextActive: {
    color: '#1e293b',
    fontWeight: '600',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 24,
  },
  metricCard: {
    width: (width - 52) / 2,
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  metricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  metricGrowth: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  metricGrowthText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
  },
  metricValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 12,
    color: '#cbd5e1',
    fontWeight: '500',
  },
  viewSelector: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: '#e2e8f0',
    borderRadius: 8,
    padding: 4,
  },
  viewButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 6,
  },
  viewButtonActive: {
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  viewButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748b',
  },
  viewButtonTextActive: {
    color: '#1e293b',
    fontWeight: '600',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 2,
  },
  categoryRevenue: {
    fontSize: 12,
    color: '#64748b',
  },
  categoryBar: {
    flex: 2,
    height: 8,
    backgroundColor: '#e2e8f0',
    borderRadius: 4,
    marginHorizontal: 12,
    overflow: 'hidden',
  },
  categoryBarFill: {
    height: '100%',
    backgroundColor: '#2563eb',
    borderRadius: 4,
  },
  categoryPercentage: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1e293b',
    width: 40,
    textAlign: 'right',
  },
  growthChart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    gap: 12,
  },
  growthBar: {
    alignItems: 'center',
    width: 60,
  },
  growthBarFill: {
    width: 24,
    backgroundColor: '#2563eb',
    borderRadius: 4,
    marginBottom: 8,
  },
  growthBarLabel: {
    fontSize: 10,
    color: '#64748b',
    marginBottom: 2,
  },
  growthBarValue: {
    fontSize: 8,
    color: '#64748b',
    textAlign: 'center',
  },
  rankingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    marginBottom: 8,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  rankingNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#2563eb',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  rankingNumberText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  rankingInfo: {
    flex: 1,
  },
  rankingName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 2,
  },
  rankingStats: {
    fontSize: 12,
    color: '#64748b',
  },
  rankingBadge: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  rankingBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2563eb',
  },
  statusGrid: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
  },
  statusCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  statusValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  statusLabel: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 8,
  },
  statusIndicator: {
    width: 24,
    height: 4,
    borderRadius: 2,
  },
});