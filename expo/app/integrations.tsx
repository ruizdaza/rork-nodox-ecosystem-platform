import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  RefreshControl,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import {
  Plug,
  CreditCard,
  Book,
  Mail,
  MessageCircle,
  TrendingUp,
  Users,
  Package,
  Check,
  X,
  RefreshCw,
  Settings,
  AlertCircle,
  Activity,
  ChevronRight,
  ExternalLink,
} from 'lucide-react-native';
import { useIntegrations } from '@/hooks/use-integrations';

const { width } = Dimensions.get('window');

const categoryIcons: Record<string, any> = {
  payment: CreditCard,
  accounting: Book,
  marketing: Mail,
  communication: MessageCircle,
  analytics: TrendingUp,
  crm: Users,
  erp: Package,
};

export default function IntegrationsScreen() {
  const router = useRouter();
  const {
    integrations,
    filteredIntegrations,
    templates,
    syncLogs,
    selectedCategory,
    connectedIntegrations,
    activeIntegrations,
    isLoadingIntegrations,
    setSelectedCategory,
    syncIntegration,
    toggleIntegration,
    disconnectIntegration,
    isSyncing,
  } = useIntegrations();

  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [selectedIntegrationId, setSelectedIntegrationId] = useState<string | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState<boolean>(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all(
      connectedIntegrations.map(i => syncIntegration(i.id))
    );
    setRefreshing(false);
  };

  const selectedIntegration = integrations.find(i => i.id === selectedIntegrationId);

  const categories = [
    { key: 'all', label: 'Todas', icon: Plug },
    { key: 'payment', label: 'Pagos', icon: CreditCard },
    { key: 'accounting', label: 'Contabilidad', icon: Book },
    { key: 'marketing', label: 'Marketing', icon: Mail },
    { key: 'communication', label: 'Comunicación', icon: MessageCircle },
    { key: 'analytics', label: 'Analíticas', icon: TrendingUp },
    { key: 'crm', label: 'CRM', icon: Users },
    { key: 'erp', label: 'ERP', icon: Package },
  ];

  const renderIntegrationCard = (integration: any) => {
    const Icon = categoryIcons[integration.category] || Plug;
    const isConnected = integration.status === 'connected';

    return (
      <TouchableOpacity
        key={integration.id}
        style={styles.integrationCard}
        onPress={() => {
          setSelectedIntegrationId(integration.id);
          setShowDetailsModal(true);
        }}
      >
        <View style={styles.integrationHeader}>
          <View style={[
            styles.integrationIcon,
            { backgroundColor: isConnected ? '#dcfce7' : '#f1f5f9' }
          ]}>
            <Icon 
              color={isConnected ? '#059669' : '#64748b'} 
              size={24} 
            />
          </View>
          <View style={styles.integrationInfo}>
            <Text style={styles.integrationName}>{integration.name}</Text>
            <Text style={styles.integrationDescription} numberOfLines={2}>
              {integration.description}
            </Text>
          </View>
          <View style={[
            styles.statusBadge,
            { backgroundColor: isConnected ? '#dcfce7' : '#fef3c7' }
          ]}>
            {isConnected ? (
              <Check size={14} color="#059669" />
            ) : (
              <X size={14} color="#ea580c" />
            )}
          </View>
        </View>

        {isConnected && (
          <View style={styles.integrationStats}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{integration.usageStats.totalCalls}</Text>
              <Text style={styles.statLabel}>Llamadas</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {((integration.usageStats.successfulCalls / integration.usageStats.totalCalls) * 100).toFixed(0)}%
              </Text>
              <Text style={styles.statLabel}>Éxito</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{integration.usageStats.averageResponseTime}ms</Text>
              <Text style={styles.statLabel}>Respuesta</Text>
            </View>
            {integration.lastSync && (
              <View style={styles.statItem}>
                <Text style={styles.statValue}>
                  {Math.floor((Date.now() - new Date(integration.lastSync).getTime()) / 60000)}m
                </Text>
                <Text style={styles.statLabel}>Última sync</Text>
              </View>
            )}
          </View>
        )}

        {isConnected && (
          <View style={styles.integrationActions}>
            <TouchableOpacity
              style={[styles.actionButton, !integration.isEnabled && styles.actionButtonDisabled]}
              onPress={() => toggleIntegration({ integrationId: integration.id, enabled: !integration.isEnabled })}
            >
              <Activity size={14} color={integration.isEnabled ? '#059669' : '#64748b'} />
              <Text style={[
                styles.actionButtonText,
                { color: integration.isEnabled ? '#059669' : '#64748b' }
              ]}>
                {integration.isEnabled ? 'Activa' : 'Pausada'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => syncIntegration(integration.id)}
              disabled={isSyncing}
            >
              <RefreshCw size={14} color="#2563eb" />
              <Text style={[styles.actionButtonText, { color: '#2563eb' }]}>Sincronizar</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton}>
              <Settings size={14} color="#64748b" />
              <Text style={styles.actionButtonText}>Configurar</Text>
            </TouchableOpacity>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderTemplateCard = (template: any) => {
    const Icon = categoryIcons[template.category] || Plug;

    return (
      <TouchableOpacity
        key={template.id}
        style={styles.templateCard}
      >
        <View style={styles.templateIcon}>
          <Icon color="#2563eb" size={24} />
        </View>
        <View style={styles.templateInfo}>
          <Text style={styles.templateName}>{template.name}</Text>
          <Text style={styles.templateDescription} numberOfLines={2}>
            {template.description}
          </Text>
          {template.isPremium && (
            <View style={styles.premiumBadge}>
              <Text style={styles.premiumBadgeText}>Premium</Text>
            </View>
          )}
        </View>
        <ChevronRight size={20} color="#94a3b8" />
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen 
        options={{
          title: 'Integraciones',
          headerStyle: { backgroundColor: '#2563eb' },
          headerTintColor: '#FFFFFF',
          headerTitleStyle: { fontWeight: 'bold' },
        }}
      />

      <View style={styles.header}>
        <View style={styles.statsOverview}>
          <View style={styles.overviewCard}>
            <Plug size={20} color="#2563eb" />
            <Text style={styles.overviewValue}>{connectedIntegrations.length}</Text>
            <Text style={styles.overviewLabel}>Conectadas</Text>
          </View>
          <View style={styles.overviewCard}>
            <Activity size={20} color="#059669" />
            <Text style={styles.overviewValue}>{activeIntegrations.length}</Text>
            <Text style={styles.overviewLabel}>Activas</Text>
          </View>
          <View style={styles.overviewCard}>
            <RefreshCw size={20} color="#7c3aed" />
            <Text style={styles.overviewValue}>{syncLogs.length}</Text>
            <Text style={styles.overviewLabel}>Sincronizaciones</Text>
          </View>
        </View>
      </View>

      <View style={styles.categoriesContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.categoriesRow}>
            {categories.map((category) => {
              const Icon = category.icon;
              const isSelected = selectedCategory === category.key;
              
              return (
                <TouchableOpacity
                  key={category.key}
                  style={[
                    styles.categoryChip,
                    isSelected && styles.categoryChipActive
                  ]}
                  onPress={() => setSelectedCategory(category.key)}
                >
                  <Icon 
                    size={16} 
                    color={isSelected ? '#ffffff' : '#64748b'} 
                  />
                  <Text style={[
                    styles.categoryChipText,
                    isSelected && styles.categoryChipTextActive
                  ]}>
                    {category.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {connectedIntegrations.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Integraciones Activas</Text>
            {filteredIntegrations.filter(i => i.status === 'connected').map(renderIntegrationCard)}
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {connectedIntegrations.length > 0 ? 'Agregar Nueva Integración' : 'Integraciones Disponibles'}
          </Text>
          {templates.filter(t => 
            selectedCategory === 'all' || t.category === selectedCategory
          ).map(renderTemplateCard)}
        </View>

        {syncLogs.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Historial de Sincronización</Text>
            {syncLogs.slice(0, 5).map((log) => (
              <View key={log.id} style={styles.syncLogCard}>
                <View style={styles.syncLogHeader}>
                  <Text style={styles.syncLogName}>{log.integrationName}</Text>
                  <View style={[
                    styles.syncStatusBadge,
                    { backgroundColor: log.status === 'success' ? '#dcfce7' : '#fef2f2' }
                  ]}>
                    <Text style={[
                      styles.syncStatusText,
                      { color: log.status === 'success' ? '#059669' : '#dc2626' }
                    ]}>
                      {log.status === 'success' ? 'Exitosa' : 'Fallida'}
                    </Text>
                  </View>
                </View>
                <Text style={styles.syncLogDetails}>
                  {log.recordsSynced} registros sincronizados • {log.duration}ms
                </Text>
                <Text style={styles.syncLogTime}>
                  {new Date(log.startedAt).toLocaleString()}
                </Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      <Modal
        visible={showDetailsModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowDetailsModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {selectedIntegration && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>{selectedIntegration.name}</Text>
                  <TouchableOpacity onPress={() => setShowDetailsModal(false)}>
                    <X size={24} color="#64748b" />
                  </TouchableOpacity>
                </View>

                <ScrollView style={styles.modalBody}>
                  <Text style={styles.modalDescription}>{selectedIntegration.description}</Text>

                  <View style={styles.detailsSection}>
                    <Text style={styles.detailsSectionTitle}>Estado</Text>
                    <View style={styles.detailsRow}>
                      <Text style={styles.detailsLabel}>Conexión:</Text>
                      <Text style={[
                        styles.detailsValue,
                        { color: selectedIntegration.status === 'connected' ? '#059669' : '#ea580c' }
                      ]}>
                        {selectedIntegration.status === 'connected' ? 'Conectada' : 'Desconectada'}
                      </Text>
                    </View>
                    <View style={styles.detailsRow}>
                      <Text style={styles.detailsLabel}>Sincronización:</Text>
                      <Text style={styles.detailsValue}>{selectedIntegration.syncFrequency}</Text>
                    </View>
                  </View>

                  <View style={styles.detailsSection}>
                    <Text style={styles.detailsSectionTitle}>Estadísticas</Text>
                    <View style={styles.statsGrid}>
                      <View style={styles.statDetailCard}>
                        <Text style={styles.statDetailValue}>{selectedIntegration.usageStats.totalCalls}</Text>
                        <Text style={styles.statDetailLabel}>Total llamadas</Text>
                      </View>
                      <View style={styles.statDetailCard}>
                        <Text style={styles.statDetailValue}>{selectedIntegration.usageStats.successfulCalls}</Text>
                        <Text style={styles.statDetailLabel}>Exitosas</Text>
                      </View>
                      <View style={styles.statDetailCard}>
                        <Text style={styles.statDetailValue}>{selectedIntegration.usageStats.failedCalls}</Text>
                        <Text style={styles.statDetailLabel}>Fallidas</Text>
                      </View>
                      <View style={styles.statDetailCard}>
                        <Text style={styles.statDetailValue}>{selectedIntegration.usageStats.averageResponseTime}ms</Text>
                        <Text style={styles.statDetailLabel}>Tiempo respuesta</Text>
                      </View>
                    </View>
                  </View>

                  {selectedIntegration.usageStats.quotaLimit && (
                    <View style={styles.quotaSection}>
                      <Text style={styles.detailsSectionTitle}>Cuota de Uso</Text>
                      <View style={styles.quotaBar}>
                        <View 
                          style={[
                            styles.quotaFill, 
                            { 
                              width: `${(selectedIntegration.usageStats.quotaUsed! / selectedIntegration.usageStats.quotaLimit) * 100}%` 
                            }
                          ]} 
                        />
                      </View>
                      <Text style={styles.quotaText}>
                        {selectedIntegration.usageStats.quotaUsed} / {selectedIntegration.usageStats.quotaLimit} llamadas
                      </Text>
                    </View>
                  )}
                </ScrollView>

                <View style={styles.modalActions}>
                  {selectedIntegration.status === 'connected' && (
                    <TouchableOpacity
                      style={styles.disconnectButton}
                      onPress={() => {
                        disconnectIntegration(selectedIntegration.id);
                        setShowDetailsModal(false);
                      }}
                    >
                      <Text style={styles.disconnectButtonText}>Desconectar</Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={() => setShowDetailsModal(false)}
                  >
                    <Text style={styles.closeButtonText}>Cerrar</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
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
  header: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  statsOverview: {
    flexDirection: 'row',
    gap: 12,
  },
  overviewCard: {
    flex: 1,
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  overviewValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginTop: 6,
    marginBottom: 2,
  },
  overviewLabel: {
    fontSize: 11,
    color: '#64748b',
  },
  categoriesContainer: {
    backgroundColor: '#ffffff',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  categoriesRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 20,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  categoryChipActive: {
    backgroundColor: '#2563eb',
  },
  categoryChipText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#64748b',
  },
  categoryChipTextActive: {
    color: '#ffffff',
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 12,
  },
  integrationCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  integrationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  integrationIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  integrationInfo: {
    flex: 1,
  },
  integrationName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  integrationDescription: {
    fontSize: 13,
    color: '#64748b',
    lineHeight: 18,
  },
  statusBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  integrationStats: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 10,
    color: '#94a3b8',
  },
  integrationActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8fafc',
    paddingVertical: 8,
    borderRadius: 6,
    gap: 4,
  },
  actionButtonDisabled: {
    opacity: 0.5,
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748b',
  },
  templateCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  templateIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  templateInfo: {
    flex: 1,
  },
  templateName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  templateDescription: {
    fontSize: 12,
    color: '#64748b',
    lineHeight: 16,
  },
  premiumBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#fef3c7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 6,
  },
  premiumBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#92400e',
  },
  syncLogCard: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#2563eb',
  },
  syncLogHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  syncLogName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
  },
  syncStatusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  syncStatusText: {
    fontSize: 10,
    fontWeight: '600',
  },
  syncLogDetails: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 4,
  },
  syncLogTime: {
    fontSize: 11,
    color: '#94a3b8',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  modalBody: {
    flex: 1,
    padding: 20,
  },
  modalDescription: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
    marginBottom: 20,
  },
  detailsSection: {
    marginBottom: 20,
  },
  detailsSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 12,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  detailsLabel: {
    fontSize: 13,
    color: '#64748b',
  },
  detailsValue: {
    fontSize: 13,
    fontWeight: '500',
    color: '#1e293b',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statDetailCard: {
    flex: 1,
    minWidth: '48%',
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  statDetailValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  statDetailLabel: {
    fontSize: 11,
    color: '#64748b',
    textAlign: 'center',
  },
  quotaSection: {
    marginBottom: 20,
  },
  quotaBar: {
    height: 8,
    backgroundColor: '#f1f5f9',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  quotaFill: {
    height: '100%',
    backgroundColor: '#2563eb',
    borderRadius: 4,
  },
  quotaText: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  disconnectButton: {
    flex: 1,
    backgroundColor: '#fef2f2',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  disconnectButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#dc2626',
  },
  closeButton: {
    flex: 1,
    backgroundColor: '#f1f5f9',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
  },
});
