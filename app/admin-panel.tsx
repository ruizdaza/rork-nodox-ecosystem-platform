import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Modal,
  TextInput,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, router } from 'expo-router';
import {
  ArrowLeft,
  Shield,
  AlertTriangle,
  BarChart3,
  Users,
  MessageSquare,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Filter,
  Search,
  MoreVertical,
  Flag,
  Ban,
  AlertCircle,
  Activity,
  Zap,
  Server,
  Wifi,
  Wallet,
} from 'lucide-react-native';
import { useAdminReports } from '@/hooks/use-admin-reports';
import { Report, AdminStats } from '@/types/chat';

const { width } = Dimensions.get('window');

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  onApply: (filters: any) => void;
  currentFilters: any;
}

const FilterModal: React.FC<FilterModalProps> = ({ visible, onClose, onApply, currentFilters }) => {
  const [filters, setFilters] = useState(currentFilters);

  const handleApply = () => {
    onApply(filters);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.modalCancel}>Cancelar</Text>
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Filtros</Text>
          <TouchableOpacity onPress={handleApply}>
            <Text style={styles.modalSave}>Aplicar</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modalContent}>
          <View style={styles.filterSection}>
            <Text style={styles.filterSectionTitle}>Estado</Text>
            <View style={styles.filterOptions}>
              {['pending', 'investigating', 'resolved', 'dismissed'].map((status) => (
                <TouchableOpacity
                  key={status}
                  style={[
                    styles.filterOption,
                    filters.status === status && styles.filterOptionSelected
                  ]}
                  onPress={() => setFilters((prev: any) => ({ 
                    ...prev, 
                    status: prev.status === status ? undefined : status 
                  }))}
                >
                  <Text style={[
                    styles.filterOptionText,
                    filters.status === status && styles.filterOptionTextSelected
                  ]}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.filterSection}>
            <Text style={styles.filterSectionTitle}>Tipo</Text>
            <View style={styles.filterOptions}>
              {['spam', 'harassment', 'inappropriate', 'fake_profile', 'scam', 'other'].map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.filterOption,
                    filters.type === type && styles.filterOptionSelected
                  ]}
                  onPress={() => setFilters((prev: any) => ({ 
                    ...prev, 
                    type: prev.type === type ? undefined : type 
                  }))}
                >
                  <Text style={[
                    styles.filterOptionText,
                    filters.type === type && styles.filterOptionTextSelected
                  ]}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.filterSection}>
            <Text style={styles.filterSectionTitle}>Prioridad</Text>
            <View style={styles.filterOptions}>
              {['low', 'medium', 'high', 'urgent'].map((priority) => (
                <TouchableOpacity
                  key={priority}
                  style={[
                    styles.filterOption,
                    filters.priority === priority && styles.filterOptionSelected
                  ]}
                  onPress={() => setFilters((prev: any) => ({ 
                    ...prev, 
                    priority: prev.priority === priority ? undefined : priority 
                  }))}
                >
                  <Text style={[
                    styles.filterOptionText,
                    filters.priority === priority && styles.filterOptionTextSelected
                  ]}>
                    {priority.charAt(0).toUpperCase() + priority.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

export default function AdminPanelScreen() {
  const {
    reports,
    stats,
    userActivities,
    isLoading,
    error,
    updateReportStatus,
    addReportAction,
    updateReportPriority,
    getFilteredReports,
    refreshStats,
    reload
  } = useAdminReports();

  const [activeTab, setActiveTab] = useState<'overview' | 'reports' | 'users' | 'moderation'>('overview');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [filters, setFilters] = useState<any>({});
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [showReportModal, setShowReportModal] = useState<boolean>(false);

  const filteredReports = getFilteredReports(filters).filter(report =>
    report.reporterName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    report.reportedUserName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    report.reason.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleReportAction = async (reportId: string, actionType: string) => {
    const action = {
      type: actionType as any,
      reason: `Acción ejecutada desde panel de administración`,
      executedBy: 'admin_current',
      executedAt: new Date()
    };

    const success = await addReportAction(reportId, action);
    if (success) {
      Alert.alert('Éxito', 'Acción ejecutada correctamente');
      if (actionType !== 'no_action') {
        await updateReportStatus(reportId, 'resolved');
      }
    } else {
      Alert.alert('Error', 'No se pudo ejecutar la acción');
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return '#10b981';
      case 'medium': return '#f59e0b';
      case 'high': return '#ef4444';
      case 'urgent': return '#dc2626';
      default: return '#6b7280';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#f59e0b';
      case 'investigating': return '#3b82f6';
      case 'resolved': return '#10b981';
      case 'dismissed': return '#6b7280';
      default: return '#6b7280';
    }
  };

  const renderOverview = () => {
    if (!stats) return null;

    return (
      <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
        {/* Estadísticas Principales */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <BarChart3 size={20} color="#2563eb" />
            <Text style={styles.sectionTitle}>Estadísticas Generales</Text>
          </View>
          
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Users size={24} color="#2563eb" />
              <Text style={styles.statNumber}>{stats.totalUsers.toLocaleString()}</Text>
              <Text style={styles.statLabel}>Usuarios Totales</Text>
              <Text style={styles.statSubtext}>{stats.activeUsers.toLocaleString()} activos</Text>
            </View>
            
            <View style={styles.statCard}>
              <MessageSquare size={24} color="#10b981" />
              <Text style={styles.statNumber}>{stats.totalMessages.toLocaleString()}</Text>
              <Text style={styles.statLabel}>Mensajes</Text>
              <Text style={styles.statSubtext}>{stats.messagesLast24h.toLocaleString()} hoy</Text>
            </View>
            
            <View style={styles.statCard}>
              <Flag size={24} color="#ef4444" />
              <Text style={styles.statNumber}>{stats.reportStats.total}</Text>
              <Text style={styles.statLabel}>Reportes</Text>
              <Text style={styles.statSubtext}>{stats.reportStats.pending} pendientes</Text>
            </View>
            
            <View style={styles.statCard}>
              <Shield size={24} color="#8b5cf6" />
              <Text style={styles.statNumber}>{stats.moderationStats.totalViolations}</Text>
              <Text style={styles.statLabel}>Violaciones</Text>
              <Text style={styles.statSubtext}>{stats.moderationStats.messagesBlocked} bloqueados</Text>
            </View>
          </View>
        </View>

        {/* Rendimiento del Sistema */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Activity size={20} color="#2563eb" />
            <Text style={styles.sectionTitle}>Rendimiento del Sistema</Text>
          </View>
          
          <View style={styles.performanceGrid}>
            <View style={styles.performanceCard}>
              <View style={styles.performanceHeader}>
                <Zap size={16} color="#f59e0b" />
                <Text style={styles.performanceLabel}>Tiempo de Respuesta</Text>
              </View>
              <Text style={styles.performanceValue}>{stats.performanceStats.averageResponseTime}ms</Text>
            </View>
            
            <View style={styles.performanceCard}>
              <View style={styles.performanceHeader}>
                <CheckCircle size={16} color="#10b981" />
                <Text style={styles.performanceLabel}>Entrega de Mensajes</Text>
              </View>
              <Text style={styles.performanceValue}>{stats.performanceStats.messageDeliveryRate}%</Text>
            </View>
            
            <View style={styles.performanceCard}>
              <View style={styles.performanceHeader}>
                <Server size={16} color="#3b82f6" />
                <Text style={styles.performanceLabel}>Tiempo de Actividad</Text>
              </View>
              <Text style={styles.performanceValue}>{stats.performanceStats.systemUptime}%</Text>
            </View>
            
            <View style={styles.performanceCard}>
              <View style={styles.performanceHeader}>
                <AlertTriangle size={16} color="#ef4444" />
                <Text style={styles.performanceLabel}>Tasa de Error</Text>
              </View>
              <Text style={styles.performanceValue}>{stats.performanceStats.errorRate}%</Text>
            </View>
          </View>
        </View>

        {/* Gráfico de Reportes por Tipo */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <BarChart3 size={20} color="#2563eb" />
            <Text style={styles.sectionTitle}>Reportes por Tipo</Text>
          </View>
          
          <View style={styles.chartContainer}>
            {Object.entries(stats.reportStats.byType).map(([type, count]) => (
              <View key={type} style={styles.chartItem}>
                <View style={styles.chartBar}>
                  <View 
                    style={[
                      styles.chartBarFill, 
                      { 
                        width: `${(count / Math.max(...Object.values(stats.reportStats.byType))) * 100}%`,
                        backgroundColor: getPriorityColor(type)
                      }
                    ]} 
                  />
                </View>
                <View style={styles.chartLabel}>
                  <Text style={styles.chartLabelText}>{type}</Text>
                  <Text style={styles.chartLabelValue}>{count}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    );
  };

  const renderReports = () => (
    <View style={styles.tabContent}>
      {/* Barra de búsqueda y filtros */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Search size={20} color="#6b7280" />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar reportes..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <TouchableOpacity 
          style={styles.filterButton}
          onPress={() => setShowFilters(true)}
        >
          <Filter size={20} color="#2563eb" />
        </TouchableOpacity>
      </View>

      {/* Lista de reportes */}
      <ScrollView style={styles.reportsList} showsVerticalScrollIndicator={false}>
        {filteredReports.map((report) => (
          <TouchableOpacity
            key={report.id}
            style={styles.reportCard}
            onPress={() => {
              setSelectedReport(report);
              setShowReportModal(true);
            }}
          >
            <View style={styles.reportHeader}>
              <View style={styles.reportInfo}>
                <Text style={styles.reportTitle}>
                  {report.reporterName} reportó a {report.reportedUserName}
                </Text>
                <Text style={styles.reportReason}>{report.reason}</Text>
              </View>
              
              <View style={styles.reportBadges}>
                <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(report.priority) + '20' }]}>
                  <Text style={[styles.priorityText, { color: getPriorityColor(report.priority) }]}>
                    {report.priority.toUpperCase()}
                  </Text>
                </View>
                
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(report.status) + '20' }]}>
                  <Text style={[styles.statusText, { color: getStatusColor(report.status) }]}>
                    {report.status.toUpperCase()}
                  </Text>
                </View>
              </View>
            </View>
            
            <View style={styles.reportFooter}>
              <Text style={styles.reportDate}>
                {new Date(report.createdAt).toLocaleDateString('es-ES')}
              </Text>
              <Text style={styles.reportType}>{report.type}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Modal de detalles del reporte */}
      <Modal
        visible={showReportModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowReportModal(false)}>
              <Text style={styles.modalCancel}>Cerrar</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Detalles del Reporte</Text>
            <View style={styles.emptyView} />
          </View>
          
          {selectedReport && (
            <ScrollView style={styles.modalContent}>
              <View style={styles.reportDetailSection}>
                <Text style={styles.reportDetailTitle}>Información General</Text>
                <View style={styles.reportDetailItem}>
                  <Text style={styles.reportDetailLabel}>Reportado por:</Text>
                  <Text style={styles.reportDetailValue}>{selectedReport.reporterName}</Text>
                </View>
                <View style={styles.reportDetailItem}>
                  <Text style={styles.reportDetailLabel}>Usuario reportado:</Text>
                  <Text style={styles.reportDetailValue}>{selectedReport.reportedUserName}</Text>
                </View>
                <View style={styles.reportDetailItem}>
                  <Text style={styles.reportDetailLabel}>Tipo:</Text>
                  <Text style={styles.reportDetailValue}>{selectedReport.type}</Text>
                </View>
                <View style={styles.reportDetailItem}>
                  <Text style={styles.reportDetailLabel}>Razón:</Text>
                  <Text style={styles.reportDetailValue}>{selectedReport.reason}</Text>
                </View>
                {selectedReport.description && (
                  <View style={styles.reportDetailItem}>
                    <Text style={styles.reportDetailLabel}>Descripción:</Text>
                    <Text style={styles.reportDetailValue}>{selectedReport.description}</Text>
                  </View>
                )}
              </View>

              {selectedReport.evidence && (
                <View style={styles.reportDetailSection}>
                  <Text style={styles.reportDetailTitle}>Evidencia</Text>
                  {selectedReport.evidence.messageContent && (
                    <View style={styles.evidenceItem}>
                      <Text style={styles.evidenceLabel}>Contenido del mensaje:</Text>
                      <Text style={styles.evidenceValue}>{selectedReport.evidence.messageContent}</Text>
                    </View>
                  )}
                  {selectedReport.evidence.additionalInfo && (
                    <View style={styles.evidenceItem}>
                      <Text style={styles.evidenceLabel}>Información adicional:</Text>
                      <Text style={styles.evidenceValue}>{selectedReport.evidence.additionalInfo}</Text>
                    </View>
                  )}
                </View>
              )}

              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: '#f59e0b' }]}
                  onPress={() => handleReportAction(selectedReport.id, 'warning')}
                >
                  <AlertTriangle size={16} color="#ffffff" />
                  <Text style={styles.actionButtonText}>Advertir</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: '#ef4444' }]}
                  onPress={() => handleReportAction(selectedReport.id, 'temporary_ban')}
                >
                  <Ban size={16} color="#ffffff" />
                  <Text style={styles.actionButtonText}>Suspender</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: '#10b981' }]}
                  onPress={() => handleReportAction(selectedReport.id, 'no_action')}
                >
                  <CheckCircle size={16} color="#ffffff" />
                  <Text style={styles.actionButtonText}>Resolver</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          )}
        </SafeAreaView>
      </Modal>

      {/* Modal de filtros */}
      <FilterModal
        visible={showFilters}
        onClose={() => setShowFilters(false)}
        onApply={setFilters}
        currentFilters={filters}
      />
    </View>
  );

  const renderUsers = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Users size={20} color="#2563eb" />
          <Text style={styles.sectionTitle}>Actividad de Usuarios</Text>
        </View>
        
        {userActivities.slice(0, 20).map((user) => (
          <View key={user.userId} style={styles.userCard}>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{user.userName}</Text>
              <Text style={styles.userStats}>
                {user.messageCount} mensajes • {user.reportCount} reportes
              </Text>
              <Text style={styles.userLastActive}>
                Última actividad: {new Date(user.lastActive).toLocaleDateString('es-ES')}
              </Text>
            </View>
            
            <View style={styles.userBadges}>
              <View style={[
                styles.userStatusBadge,
                { backgroundColor: user.status === 'active' ? '#10b981' : 
                  user.status === 'warned' ? '#f59e0b' : 
                  user.status === 'suspended' ? '#ef4444' : '#dc2626' }
              ]}>
                <Text style={styles.userStatusText}>{user.status.toUpperCase()}</Text>
              </View>
              
              <View style={[
                styles.riskBadge,
                { backgroundColor: user.riskScore > 70 ? '#ef4444' : 
                  user.riskScore > 40 ? '#f59e0b' : '#10b981' }
              ]}>
                <Text style={styles.riskText}>{user.riskScore}%</Text>
              </View>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );

  const renderModeration = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      <TouchableOpacity
        style={styles.moderationButton}
        onPress={() => router.push('/admin-moderation')}
      >
        <Shield size={24} color="#2563eb" />
        <View style={styles.moderationButtonContent}>
          <Text style={styles.moderationButtonTitle}>Configuración de Moderación</Text>
          <Text style={styles.moderationButtonSubtitle}>
            Gestionar reglas y configuración de moderación automática
          </Text>
        </View>
        <ArrowLeft size={20} color="#6b7280" style={styles.rotatedArrow} />
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[styles.moderationButton, { marginTop: 12 }]}
        onPress={() => router.push('/usage-analytics')}
      >
        <BarChart3 size={24} color="#10b981" />
        <View style={styles.moderationButtonContent}>
          <Text style={styles.moderationButtonTitle}>Estadísticas Avanzadas</Text>
          <Text style={styles.moderationButtonSubtitle}>
            Análisis detallado de uso, engagement y métricas de negocio
          </Text>
        </View>
        <ArrowLeft size={20} color="#6b7280" style={styles.rotatedArrow} />
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[styles.moderationButton, { marginTop: 12 }]}
        onPress={() => router.push('/wallet-admin')}
      >
        <Wallet size={24} color="#059669" />
        <View style={styles.moderationButtonContent}>
          <Text style={styles.moderationButtonTitle}>Administración de Wallet</Text>
          <Text style={styles.moderationButtonSubtitle}>
            Gestión completa de usuarios, transacciones, balances y seguridad de wallet
          </Text>
        </View>
        <ArrowLeft size={20} color="#6b7280" style={styles.rotatedArrow} />
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[styles.moderationButton, { marginTop: 12 }]}
        onPress={() => router.push('/business-dashboard')}
      >
        <BarChart3 size={24} color="#7c3aed" />
        <View style={styles.moderationButtonContent}>
          <Text style={styles.moderationButtonTitle}>Dashboard Empresarial</Text>
          <Text style={styles.moderationButtonSubtitle}>
            Acceso rápido a CRM, Promociones, Soporte y Analytics del negocio
          </Text>
        </View>
        <ArrowLeft size={20} color="#6b7280" style={styles.rotatedArrow} />
      </TouchableOpacity>
    </ScrollView>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Cargando panel de administración...</Text>
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
          <TouchableOpacity style={styles.retryButton} onPress={reload}>
            <Text style={styles.retryButtonText}>Reintentar</Text>
          </TouchableOpacity>
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
          headerTitle: 'Panel de Administración',
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
            <TouchableOpacity 
              style={styles.headerButton}
              onPress={refreshStats}
            >
              <TrendingUp size={24} color="#2563eb" />
            </TouchableOpacity>
          ),
        }}
      />

      {/* Tabs */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'overview' && styles.activeTab]}
          onPress={() => setActiveTab('overview')}
        >
          <BarChart3 size={20} color={activeTab === 'overview' ? '#2563eb' : '#6b7280'} />
          <Text style={[styles.tabText, activeTab === 'overview' && styles.activeTabText]}>
            Resumen
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'reports' && styles.activeTab]}
          onPress={() => setActiveTab('reports')}
        >
          <Flag size={20} color={activeTab === 'reports' ? '#2563eb' : '#6b7280'} />
          <Text style={[styles.tabText, activeTab === 'reports' && styles.activeTabText]}>
            Reportes
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'users' && styles.activeTab]}
          onPress={() => setActiveTab('users')}
        >
          <Users size={20} color={activeTab === 'users' ? '#2563eb' : '#6b7280'} />
          <Text style={[styles.tabText, activeTab === 'users' && styles.activeTabText]}>
            Usuarios
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'moderation' && styles.activeTab]}
          onPress={() => setActiveTab('moderation')}
        >
          <Shield size={20} color={activeTab === 'moderation' ? '#2563eb' : '#6b7280'} />
          <Text style={[styles.tabText, activeTab === 'moderation' && styles.activeTabText]}>
            Moderación
          </Text>
        </TouchableOpacity>
      </View>

      {/* Contenido */}
      <View style={styles.content}>
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'reports' && renderReports()}
        {activeTab === 'users' && renderUsers()}
        {activeTab === 'moderation' && renderModeration()}
      </View>
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
  },
  errorText: {
    fontSize: 16,
    color: '#ef4444',
    textAlign: 'center',
    marginVertical: 16,
  },
  retryButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  headerButton: {
    padding: 8,
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
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    flex: 1,
    minWidth: (width - 44) / 2,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1e293b',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    textAlign: 'center',
  },
  statSubtext: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 2,
  },
  performanceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  performanceCard: {
    backgroundColor: '#ffffff',
    padding: 12,
    borderRadius: 8,
    flex: 1,
    minWidth: (width - 44) / 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  performanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  performanceLabel: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },
  performanceValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
  },
  chartContainer: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  chartItem: {
    marginBottom: 12,
  },
  chartBar: {
    height: 8,
    backgroundColor: '#f1f5f9',
    borderRadius: 4,
    marginBottom: 4,
  },
  chartBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  chartLabel: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chartLabelText: {
    fontSize: 12,
    color: '#374151',
    textTransform: 'capitalize',
  },
  chartLabelValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1e293b',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1e293b',
  },
  filterButton: {
    backgroundColor: '#ffffff',
    padding: 10,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  reportsList: {
    flex: 1,
  },
  reportCard: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  reportInfo: {
    flex: 1,
    marginRight: 12,
  },
  reportTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  reportReason: {
    fontSize: 13,
    color: '#6b7280',
    lineHeight: 18,
  },
  reportBadges: {
    gap: 6,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
  },
  reportFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  reportDate: {
    fontSize: 12,
    color: '#6b7280',
  },
  reportType: {
    fontSize: 12,
    color: '#6b7280',
    textTransform: 'capitalize',
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
    color: '#6b7280',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
  },
  modalSave: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2563eb',
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  reportDetailSection: {
    marginBottom: 24,
  },
  reportDetailTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 12,
  },
  reportDetailItem: {
    marginBottom: 12,
  },
  reportDetailLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 4,
  },
  reportDetailValue: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  evidenceItem: {
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  evidenceLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 4,
  },
  evidenceValue: {
    fontSize: 13,
    color: '#6b7280',
    lineHeight: 18,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 6,
  },
  actionButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 14,
  },
  filterSection: {
    marginBottom: 24,
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 12,
  },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#d1d5db',
    backgroundColor: '#ffffff',
  },
  filterOptionSelected: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  filterOptionText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6b7280',
    textTransform: 'capitalize',
  },
  filterOptionTextSelected: {
    color: '#ffffff',
  },
  userCard: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  userStats: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 2,
  },
  userLastActive: {
    fontSize: 12,
    color: '#9ca3af',
  },
  userBadges: {
    gap: 6,
  },
  userStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  userStatusText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#ffffff',
  },
  riskBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  riskText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#ffffff',
  },
  moderationButton: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  moderationButtonContent: {
    flex: 1,
  },
  moderationButtonTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  moderationButtonSubtitle: {
    fontSize: 13,
    color: '#6b7280',
    lineHeight: 18,
  },
  rotatedArrow: {
    transform: [{ rotate: '180deg' }],
  },
  emptyView: {
    width: 60,
  },
  chartBarDynamic: {
    height: '100%',
    borderRadius: 4,
  },
  userStatusDynamic: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  riskBadgeDynamic: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
});