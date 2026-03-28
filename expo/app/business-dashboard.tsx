import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { Stack, router } from 'expo-router';
import {
  Users,
  Tag,
  MessageCircle,
  TrendingUp,
  Calendar,
  Star,
  BarChart3,
  Settings,
  ChevronRight,
  AlertCircle,
  CheckCircle,
  Gift,
  Phone,
} from 'lucide-react-native';
import { useCRM } from '@/hooks/use-crm';
import { usePromotions } from '@/hooks/use-promotions';
import { useSupport } from '@/hooks/use-support';

export default function BusinessDashboard() {
  const { crmStats } = useCRM();
  const { promotionStats } = usePromotions();
  const { supportStats } = useSupport();

  const quickActions = [
    {
      id: 'crm',
      title: 'CRM',
      subtitle: 'Gestión de Clientes',
      icon: Users,
      color: '#2563eb',
      route: '/crm-dashboard',
      stats: `${crmStats.totalCustomers} clientes`
    },
    {
      id: 'promotions',
      title: 'Promociones',
      subtitle: 'Campañas y Ofertas',
      icon: Tag,
      color: '#10b981',
      route: '/promotions-manager',
      stats: `${promotionStats.activePromotions} activas`
    },
    {
      id: 'support',
      title: 'Soporte',
      subtitle: 'Centro de Ayuda',
      icon: MessageCircle,
      color: '#f59e0b',
      route: '/support-center',
      stats: `${supportStats.openTickets} abiertos`
    },
    {
      id: 'analytics',
      title: 'Analytics',
      subtitle: 'Métricas y Reportes',
      icon: BarChart3,
      color: '#8b5cf6',
      route: '/analytics',
      stats: 'Ver reportes'
    }
  ];

  const recentActivities = [
    {
      id: '1',
      type: 'customer',
      title: 'Nuevo cliente registrado',
      subtitle: 'Ana María López se unió',
      time: 'Hace 2 horas',
      icon: Users,
      color: '#2563eb'
    },
    {
      id: '2',
      type: 'promotion',
      title: 'Promoción activada',
      subtitle: 'Descuento Clientes Nuevos',
      time: 'Hace 4 horas',
      icon: Gift,
      color: '#10b981'
    },
    {
      id: '3',
      type: 'support',
      title: 'Ticket resuelto',
      subtitle: 'Problema con reservas',
      time: 'Hace 6 horas',
      icon: CheckCircle,
      color: '#22c55e'
    },
    {
      id: '4',
      type: 'appointment',
      title: 'Cita completada',
      subtitle: 'Carlos Mendoza - Corte',
      time: 'Ayer',
      icon: Calendar,
      color: '#f59e0b'
    }
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Dashboard Empresarial',
          headerStyle: { backgroundColor: '#2563eb' },
          headerTintColor: '#ffffff',
          headerTitleStyle: { fontWeight: 'bold' },
        }}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeTitle}>¡Bienvenido de vuelta!</Text>
          <Text style={styles.welcomeSubtitle}>
            Aquí tienes un resumen de tu negocio
          </Text>
        </View>

        {/* Key Metrics */}
        <View style={styles.metricsSection}>
          <Text style={styles.sectionTitle}>Métricas Clave</Text>
          <View style={styles.metricsGrid}>
            <View style={styles.metricCard}>
              <View style={styles.metricHeader}>
                <Users size={24} color="#2563eb" />
                <Text style={styles.metricValue}>{crmStats.totalCustomers}</Text>
              </View>
              <Text style={styles.metricLabel}>Total Clientes</Text>
              <Text style={styles.metricChange}>
                +{crmStats.newCustomersThisMonth} este mes
              </Text>
            </View>

            <View style={styles.metricCard}>
              <View style={styles.metricHeader}>
                <TrendingUp size={24} color="#10b981" />
                <Text style={styles.metricValue}>{crmStats.activeCustomers}</Text>
              </View>
              <Text style={styles.metricLabel}>Clientes Activos</Text>
              <Text style={styles.metricChange}>
                {crmStats.customerRetentionRate.toFixed(1)}% retención
              </Text>
            </View>

            <View style={styles.metricCard}>
              <View style={styles.metricHeader}>
                <Tag size={24} color="#f59e0b" />
                <Text style={styles.metricValue}>{promotionStats.activePromotions}</Text>
              </View>
              <Text style={styles.metricLabel}>Promociones Activas</Text>
              <Text style={styles.metricChange}>
                {formatCurrency(promotionStats.totalSavings)} ahorrados
              </Text>
            </View>

            <View style={styles.metricCard}>
              <View style={styles.metricHeader}>
                <MessageCircle size={24} color="#8b5cf6" />
                <Text style={styles.metricValue}>{supportStats.openTickets}</Text>
              </View>
              <Text style={styles.metricLabel}>Tickets Abiertos</Text>
              <Text style={styles.metricChange}>
                {supportStats.customerSatisfactionScore.toFixed(1)}/5 satisfacción
              </Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsSection}>
          <Text style={styles.sectionTitle}>Acciones Rápidas</Text>
          <View style={styles.actionsGrid}>
            {quickActions.map((action) => (
              <TouchableOpacity
                key={action.id}
                style={styles.actionCard}
                onPress={() => router.push(action.route as any)}
              >
                <View style={[styles.actionIcon, { backgroundColor: action.color }]}>
                  <action.icon size={24} color="#ffffff" />
                </View>
                <View style={styles.actionContent}>
                  <Text style={styles.actionTitle}>{action.title}</Text>
                  <Text style={styles.actionSubtitle}>{action.subtitle}</Text>
                  <Text style={styles.actionStats}>{action.stats}</Text>
                </View>
                <ChevronRight size={20} color="#9ca3af" />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Recent Activity */}
        <View style={styles.activitySection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Actividad Reciente</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>Ver todo</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.activityList}>
            {recentActivities.map((activity) => (
              <View key={activity.id} style={styles.activityItem}>
                <View style={[styles.activityIcon, { backgroundColor: activity.color }]}>
                  <activity.icon size={16} color="#ffffff" />
                </View>
                <View style={styles.activityContent}>
                  <Text style={styles.activityTitle}>{activity.title}</Text>
                  <Text style={styles.activitySubtitle}>{activity.subtitle}</Text>
                </View>
                <Text style={styles.activityTime}>{activity.time}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Performance Summary */}
        <View style={styles.performanceSection}>
          <Text style={styles.sectionTitle}>Resumen de Rendimiento</Text>
          <View style={styles.performanceCard}>
            <View style={styles.performanceRow}>
              <View style={styles.performanceItem}>
                <Star size={20} color="#f59e0b" />
                <View style={styles.performanceText}>
                  <Text style={styles.performanceLabel}>Calificación Promedio</Text>
                  <Text style={styles.performanceValue}>4.8/5.0</Text>
                </View>
              </View>
              <View style={styles.performanceItem}>
                <Phone size={20} color="#10b981" />
                <View style={styles.performanceText}>
                  <Text style={styles.performanceLabel}>Tiempo de Respuesta</Text>
                  <Text style={styles.performanceValue}>
                    {supportStats.averageResponseTime.toFixed(1)}h
                  </Text>
                </View>
              </View>
            </View>
            
            <View style={styles.performanceRow}>
              <View style={styles.performanceItem}>
                <TrendingUp size={20} color="#2563eb" />
                <View style={styles.performanceText}>
                  <Text style={styles.performanceLabel}>Crecimiento Mensual</Text>
                  <Text style={styles.performanceValue}>+12.5%</Text>
                </View>
              </View>
              <View style={styles.performanceItem}>
                <AlertCircle size={20} color="#ef4444" />
                <View style={styles.performanceText}>
                  <Text style={styles.performanceLabel}>Tickets Urgentes</Text>
                  <Text style={styles.performanceValue}>2</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Quick Settings */}
        <View style={styles.settingsSection}>
          <TouchableOpacity
            style={styles.settingsCard}
            onPress={() => router.push('/settings')}
          >
            <Settings size={24} color="#6b7280" />
            <View style={styles.settingsContent}>
              <Text style={styles.settingsTitle}>Configuración</Text>
              <Text style={styles.settingsSubtitle}>
                Personaliza tu experiencia empresarial
              </Text>
            </View>
            <ChevronRight size={20} color="#9ca3af" />
          </TouchableOpacity>
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
  content: {
    flex: 1,
    padding: 16,
  },
  welcomeSection: {
    marginBottom: 24,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#6b7280',
  },
  metricsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  metricCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    width: '48%',
    marginBottom: 12,
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
    marginBottom: 8,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  metricLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  metricChange: {
    fontSize: 12,
    color: '#10b981',
    fontWeight: '500',
  },
  actionsSection: {
    marginBottom: 24,
  },
  actionsGrid: {
    gap: 12,
  },
  actionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 2,
  },
  actionSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  actionStats: {
    fontSize: 12,
    color: '#9ca3af',
  },
  activitySection: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  seeAllText: {
    fontSize: 14,
    color: '#2563eb',
    fontWeight: '500',
  },
  activityList: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  activityIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1f2937',
    marginBottom: 2,
  },
  activitySubtitle: {
    fontSize: 12,
    color: '#6b7280',
  },
  activityTime: {
    fontSize: 12,
    color: '#9ca3af',
  },
  performanceSection: {
    marginBottom: 24,
  },
  performanceCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  performanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  performanceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  performanceText: {
    marginLeft: 12,
  },
  performanceLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 2,
  },
  performanceValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  settingsSection: {
    marginBottom: 24,
  },
  settingsCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  settingsContent: {
    flex: 1,
    marginLeft: 16,
  },
  settingsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 2,
  },
  settingsSubtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
});