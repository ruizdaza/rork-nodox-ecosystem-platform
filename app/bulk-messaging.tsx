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
  Send,
  BarChart3,
  MessageSquare,
  Users,
  CheckCircle,
  TrendingUp,
  Package,
  Target,
  Calendar,
  FileText,
  Plus,
  Settings,
  AlertCircle,
  Mail,
} from 'lucide-react-native';
import { useBulkMessaging } from '@/hooks/use-bulk-messaging';

const { width } = Dimensions.get('window');

export default function BulkMessagingScreen() {
  const {
    plans,
    subscription,
    campaigns,
    templates,
    segments,

    subscribeToPlan,
    changePlan,
    cancelSubscription,
    getStats,
  } = useBulkMessaging();

  const [showPlansModal, setShowPlansModal] = useState(false);
  const stats = getStats();

  if (!subscription) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen
          options={{
            headerShown: true,
            title: 'Mensajería Masiva',
            headerLeft: () => (
              <TouchableOpacity onPress={() => router.back()}>
                <ArrowLeft color="#1e293b" size={24} />
              </TouchableOpacity>
            ),
          }}
        />
        
        <ScrollView style={styles.content}>
          <View style={styles.heroSection}>
            <Mail color="#2563eb" size={48} />
            <Text style={styles.heroTitle}>Mensajería Masiva Profesional</Text>
            <Text style={styles.heroSubtitle}>
              Llega a miles de clientes con campañas personalizadas, segmentación avanzada y analytics en tiempo real
            </Text>
          </View>

          <View style={styles.featuresGrid}>
            <View style={styles.featureCard}>
              <Send color="#10b981" size={24} />
              <Text style={styles.featureTitle}>Envío Masivo</Text>
              <Text style={styles.featureDescription}>Miles de mensajes en minutos</Text>
            </View>
            
            <View style={styles.featureCard}>
              <Target color="#7c3aed" size={24} />
              <Text style={styles.featureTitle}>Segmentación</Text>
              <Text style={styles.featureDescription}>Audiencias personalizadas</Text>
            </View>
            
            <View style={styles.featureCard}>
              <BarChart3 color="#f59e0b" size={24} />
              <Text style={styles.featureTitle}>Analytics</Text>
              <Text style={styles.featureDescription}>Métricas en tiempo real</Text>
            </View>
            
            <View style={styles.featureCard}>
              <Calendar color="#ef4444" size={24} />
              <Text style={styles.featureTitle}>Programación</Text>
              <Text style={styles.featureDescription}>Envíos automatizados</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Planes Disponibles</Text>
            {plans.map((plan) => (
              <View key={plan.id} style={styles.planCard}>
                <View style={styles.planHeader}>
                  <View>
                    <Text style={styles.planName}>{plan.name}</Text>
                    <Text style={styles.planDescription}>{plan.description}</Text>
                  </View>
                  <View style={styles.planPricing}>
                    <Text style={styles.planPrice}>${plan.pricing.monthlyFee}</Text>
                    <Text style={styles.planPeriod}>/mes</Text>
                  </View>
                </View>

                <View style={styles.planFeatures}>
                  <View style={styles.planFeature}>
                    <CheckCircle color="#10b981" size={16} />
                    <Text style={styles.planFeatureText}>
                      {plan.features.freeMessagesPerMonth.toLocaleString()} mensajes gratis/mes
                    </Text>
                  </View>
                  <View style={styles.planFeature}>
                    <CheckCircle color="#10b981" size={16} />
                    <Text style={styles.planFeatureText}>
                      ${plan.features.costPerAdditionalMessage} por mensaje adicional
                    </Text>
                  </View>
                  <View style={styles.planFeature}>
                    <CheckCircle color="#10b981" size={16} />
                    <Text style={styles.planFeatureText}>
                      Hasta {plan.features.maxRecipientsPerCampaign.toLocaleString()} destinatarios por campaña
                    </Text>
                  </View>
                  {plan.features.allowSegmentation && (
                    <View style={styles.planFeature}>
                      <CheckCircle color="#10b981" size={16} />
                      <Text style={styles.planFeatureText}>Segmentación avanzada</Text>
                    </View>
                  )}
                  {plan.features.priorityDelivery && (
                    <View style={styles.planFeature}>
                      <CheckCircle color="#10b981" size={16} />
                      <Text style={styles.planFeatureText}>Entrega prioritaria</Text>
                    </View>
                  )}
                  {plan.features.apiAccess && (
                    <View style={styles.planFeature}>
                      <CheckCircle color="#10b981" size={16} />
                      <Text style={styles.planFeatureText}>Acceso API</Text>
                    </View>
                  )}
                </View>

                <TouchableOpacity
                  style={styles.selectPlanButton}
                  onPress={() => subscribeToPlan(plan.id, 'ally-1', 'Mi Negocio', 'monthly')}
                >
                  <Text style={styles.selectPlanButtonText}>Seleccionar Plan</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Mensajería Masiva',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <ArrowLeft color="#1e293b" size={24} />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity onPress={() => setShowPlansModal(true)}>
              <Settings color="#1e293b" size={24} />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView style={styles.content}>
        <View style={styles.subscriptionCard}>
          <View style={styles.subscriptionHeader}>
            <View>
              <Text style={styles.subscriptionPlan}>{subscription.plan.name}</Text>
              <Text style={styles.subscriptionStatus}>
                {subscription.status === 'active' ? 'Activo' : 
                 subscription.status === 'trial' ? 'Prueba' : 'Suspendido'}
              </Text>
            </View>
            <Package color="#2563eb" size={32} />
          </View>

          <View style={styles.subscriptionUsage}>
            <View style={styles.usageItem}>
              <Text style={styles.usageLabel}>Mensajes usados este mes</Text>
              <Text style={styles.usageValue}>
                {subscription.usage.messagesUsedThisMonth.toLocaleString()} / {subscription.plan.features.freeMessagesPerMonth.toLocaleString()}
              </Text>
            </View>

            <View style={styles.usageProgress}>
              <View
                style={[
                  styles.usageProgressFill,
                  {
                    width: `${Math.min(
                      (subscription.usage.messagesUsedThisMonth /
                        subscription.plan.features.freeMessagesPerMonth) *
                        100,
                      100
                    )}%`,
                  },
                ]}
              />
            </View>

            <View style={styles.usageStats}>
              <View style={styles.usageStat}>
                <Text style={styles.usageStatLabel}>Campañas</Text>
                <Text style={styles.usageStatValue}>
                  {subscription.usage.campaignsUsedThisMonth} / {subscription.plan.limits.campaignsPerMonth}
                </Text>
              </View>
              <View style={styles.usageStat}>
                <Text style={styles.usageStatLabel}>Costo mensual</Text>
                <Text style={styles.usageStatValue}>${subscription.usage.totalCostThisMonth.toLocaleString()}</Text>
              </View>
            </View>
          </View>

          <View style={styles.subscriptionActions}>
            <TouchableOpacity
              style={styles.renewalButton}
              onPress={() => setShowPlansModal(true)}
            >
              <Text style={styles.renewalButtonText}>Cambiar Plan</Text>
            </TouchableOpacity>
            <Text style={styles.renewalDate}>
              Renovación: {subscription.renewalDate.toLocaleDateString('es-ES')}
            </Text>
          </View>
        </View>

        {stats && (
          <View style={styles.statsSection}>
            <Text style={styles.sectionTitle}>Estadísticas</Text>
            
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <MessageSquare color="#2563eb" size={24} />
                <Text style={styles.statValue}>{stats.overview.totalMessagesSent.toLocaleString()}</Text>
                <Text style={styles.statLabel}>Total Mensajes</Text>
              </View>

              <View style={styles.statCard}>
                <Send color="#10b981" size={24} />
                <Text style={styles.statValue}>{stats.overview.totalCampaigns}</Text>
                <Text style={styles.statLabel}>Campañas</Text>
              </View>

              <View style={styles.statCard}>
                <CheckCircle color="#7c3aed" size={24} />
                <Text style={styles.statValue}>{stats.overview.averageDeliveryRate.toFixed(1)}%</Text>
                <Text style={styles.statLabel}>Tasa de Entrega</Text>
              </View>

              <View style={styles.statCard}>
                <TrendingUp color="#f59e0b" size={24} />
                <Text style={styles.statValue}>{stats.overview.averageOpenRate.toFixed(1)}%</Text>
                <Text style={styles.statLabel}>Tasa de Apertura</Text>
              </View>
            </View>
          </View>
        )}

        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => console.log('Nueva campaña - funcionalidad próximamente')}
          >
            <Plus color="#ffffff" size={20} />
            <Text style={styles.actionButtonText}>Nueva Campaña</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.actionButtonSecondary]}
            onPress={() => console.log('Analytics - funcionalidad próximamente')}
          >
            <BarChart3 color="#2563eb" size={20} />
            <Text style={[styles.actionButtonText, styles.actionButtonTextSecondary]}>Ver Analytics</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Campañas Recientes</Text>
          {campaigns.slice(0, 5).map((campaign) => (
            <View key={campaign.id} style={styles.campaignCard}>
              <View style={styles.campaignHeader}>
                <View style={styles.campaignInfo}>
                  <Text style={styles.campaignName}>{campaign.name}</Text>
                  <Text style={styles.campaignRecipients}>
                    {campaign.recipients.total.toLocaleString()} destinatarios
                  </Text>
                </View>
                <View
                  style={[
                    styles.campaignStatus,
                    {
                      backgroundColor:
                        campaign.status === 'sent'
                          ? '#dcfce7'
                          : campaign.status === 'scheduled'
                          ? '#dbeafe'
                          : '#fef3c7',
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.campaignStatusText,
                      {
                        color:
                          campaign.status === 'sent'
                            ? '#166534'
                            : campaign.status === 'scheduled'
                            ? '#1e40af'
                            : '#92400e',
                      },
                    ]}
                  >
                    {campaign.status === 'sent' ? 'Enviado' : 
                     campaign.status === 'scheduled' ? 'Programado' : 'Borrador'}
                  </Text>
                </View>
              </View>

              {campaign.status === 'sent' && (
                <View style={styles.campaignMetrics}>
                  <View style={styles.campaignMetric}>
                    <Text style={styles.campaignMetricLabel}>Entregado</Text>
                    <Text style={styles.campaignMetricValue}>
                      {((campaign.analytics.delivered / campaign.analytics.sent) * 100).toFixed(1)}%
                    </Text>
                  </View>
                  <View style={styles.campaignMetric}>
                    <Text style={styles.campaignMetricLabel}>Abierto</Text>
                    <Text style={styles.campaignMetricValue}>
                      {campaign.analytics.delivered > 0
                        ? ((campaign.analytics.opened / campaign.analytics.delivered) * 100).toFixed(1)
                        : 0}%
                    </Text>
                  </View>
                  <View style={styles.campaignMetric}>
                    <Text style={styles.campaignMetricLabel}>Costo</Text>
                    <Text style={styles.campaignMetricValue}>${campaign.analytics.cost.toFixed(2)}</Text>
                  </View>
                </View>
              )}
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Plantillas</Text>
            <Text style={styles.sectionCount}>{templates.length}</Text>
          </View>
          {templates.slice(0, 3).map((template) => (
            <View key={template.id} style={styles.templateCard}>
              <FileText color="#2563eb" size={20} />
              <View style={styles.templateInfo}>
                <Text style={styles.templateName}>{template.name}</Text>
                <Text style={styles.templateCategory}>{template.category}</Text>
              </View>
              <Text style={styles.templateUsage}>{template.usageCount} usos</Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Segmentos</Text>
            <Text style={styles.sectionCount}>{segments.length}</Text>
          </View>
          {segments.map((segment) => (
            <View key={segment.id} style={styles.segmentCard}>
              <Users color="#7c3aed" size={20} />
              <View style={styles.segmentInfo}>
                <Text style={styles.segmentName}>{segment.name}</Text>
                <Text style={styles.segmentDescription}>{segment.description}</Text>
              </View>
              <Text style={styles.segmentCount}>{segment.recipientCount.toLocaleString()}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      <Modal visible={showPlansModal} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowPlansModal(false)}>
              <Text style={styles.modalCancel}>Cerrar</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Gestionar Suscripción</Text>
            <View style={{ width: 60 }} />
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.currentPlanSection}>
              <Text style={styles.currentPlanLabel}>Plan Actual</Text>
              <Text style={styles.currentPlanName}>{subscription.plan.name}</Text>
              <Text style={styles.currentPlanPrice}>
                ${subscription.billingCycle === 'monthly' 
                  ? subscription.plan.pricing.monthlyFee 
                  : subscription.plan.pricing.yearlyFee}/{subscription.billingCycle === 'monthly' ? 'mes' : 'año'}
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Cambiar a otro Plan</Text>
              {plans.filter(p => p.id !== subscription.plan.id).map((plan) => (
                <TouchableOpacity
                  key={plan.id}
                  style={styles.planOption}
                  onPress={() => changePlan(plan.id)}
                >
                  <View>
                    <Text style={styles.planOptionName}>{plan.name}</Text>
                    <Text style={styles.planOptionPrice}>${plan.pricing.monthlyFee}/mes</Text>
                  </View>
                  <ArrowLeft color="#2563eb" size={20} style={{ transform: [{ rotate: '180deg' }] }} />
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={cancelSubscription}
            >
              <AlertCircle color="#ef4444" size={20} />
              <Text style={styles.cancelButtonText}>Cancelar Suscripción</Text>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </Modal>
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
  heroSection: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1e293b',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 24,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  featureCard: {
    backgroundColor: '#ffffff',
    flex: 1,
    minWidth: (width - 44) / 2,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    marginTop: 8,
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionCount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
  },
  planCard: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  planName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 4,
  },
  planDescription: {
    fontSize: 14,
    color: '#64748b',
  },
  planPricing: {
    alignItems: 'flex-end',
  },
  planPrice: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2563eb',
  },
  planPeriod: {
    fontSize: 14,
    color: '#64748b',
  },
  planFeatures: {
    marginBottom: 16,
  },
  planFeature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  planFeatureText: {
    fontSize: 14,
    color: '#374151',
  },
  selectPlanButton: {
    backgroundColor: '#2563eb',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  selectPlanButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  subscriptionCard: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  subscriptionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  subscriptionPlan: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 4,
  },
  subscriptionStatus: {
    fontSize: 14,
    color: '#10b981',
    fontWeight: '500',
  },
  subscriptionUsage: {
    marginBottom: 16,
  },
  usageItem: {
    marginBottom: 8,
  },
  usageLabel: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 4,
  },
  usageValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  usageProgress: {
    height: 8,
    backgroundColor: '#f1f5f9',
    borderRadius: 4,
    marginBottom: 12,
    overflow: 'hidden',
  },
  usageProgressFill: {
    height: '100%',
    backgroundColor: '#2563eb',
  },
  usageStats: {
    flexDirection: 'row',
    gap: 16,
  },
  usageStat: {
    flex: 1,
  },
  usageStatLabel: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 4,
  },
  usageStatValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
  },
  subscriptionActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  renewalButton: {
    backgroundColor: '#f8fafc',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  renewalButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#475569',
  },
  renewalDate: {
    fontSize: 12,
    color: '#64748b',
  },
  statsSection: {
    marginBottom: 24,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    backgroundColor: '#ffffff',
    flex: 1,
    minWidth: (width - 44) / 2,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#2563eb',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  actionButtonSecondary: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  actionButtonTextSecondary: {
    color: '#2563eb',
  },
  campaignCard: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  campaignHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  campaignInfo: {
    flex: 1,
    marginRight: 12,
  },
  campaignName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  campaignRecipients: {
    fontSize: 14,
    color: '#64748b',
  },
  campaignStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  campaignStatusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  campaignMetrics: {
    flexDirection: 'row',
    gap: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  campaignMetric: {
    flex: 1,
  },
  campaignMetricLabel: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 4,
  },
  campaignMetricValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
  },
  templateCard: {
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  templateInfo: {
    flex: 1,
  },
  templateName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 2,
  },
  templateCategory: {
    fontSize: 12,
    color: '#64748b',
    textTransform: 'capitalize',
  },
  templateUsage: {
    fontSize: 12,
    color: '#64748b',
  },
  segmentCard: {
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  segmentInfo: {
    flex: 1,
  },
  segmentName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 2,
  },
  segmentDescription: {
    fontSize: 12,
    color: '#64748b',
  },
  segmentCount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2563eb',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  modalCancel: {
    fontSize: 16,
    color: '#64748b',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  currentPlanSection: {
    backgroundColor: '#f8fafc',
    padding: 20,
    borderRadius: 12,
    marginBottom: 24,
    alignItems: 'center',
  },
  currentPlanLabel: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 8,
  },
  currentPlanName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 4,
  },
  currentPlanPrice: {
    fontSize: 16,
    color: '#2563eb',
    fontWeight: '500',
  },
  planOption: {
    backgroundColor: '#f8fafc',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  planOptionName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  planOptionPrice: {
    fontSize: 14,
    color: '#64748b',
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fef2f2',
    padding: 16,
    borderRadius: 8,
    gap: 8,
    marginTop: 24,
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ef4444',
  },
});
