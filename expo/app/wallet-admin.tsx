import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
  SafeAreaView
} from 'react-native';
import { Stack } from 'expo-router';
import {
  Wallet,
  Users,
  TrendingUp,
  AlertTriangle,
  Search,
  Filter,
  Download,
  Settings,
  Eye,
  Ban,
  CheckCircle,
  XCircle,
  DollarSign,
  Activity,
  Shield,
  FileText,
  RefreshCw
} from 'lucide-react-native';
import { useWalletAdmin } from '@/hooks/use-wallet-admin';
import { WalletUser, WalletTransaction, WalletAdminAction } from '@/types/wallet-admin';

export default function WalletAdminPage() {
  const {
    users,
    transactions,
    alerts,
    stats,
    auditLogs,
    exchangeRates,
    feeStructures,
    loading,
    error,
    executeAdminAction,
    getUserBalance,
    getUserLimits,
    generateComplianceReport,
    updateFeeStructure,
    resolveAlert,
    dismissAlert,
    searchUsers,
    searchTransactions,
    refreshData
  } = useWalletAdmin();

  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'transactions' | 'alerts' | 'settings'>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<WalletUser | null>(null);
  const [selectedTransaction, setSelectedTransaction] = useState<WalletTransaction | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [showActionModal, setShowActionModal] = useState(false);
  const [actionType, setActionType] = useState<WalletAdminAction['type'] | null>(null);

  const formatCurrency = (amount: number, currency: string = 'COP') => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: currency === 'COP' ? 'COP' : 'USD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-CO');
  };

  const getStatusColor = (status: string) => {
    const colors = {
      active: '#10B981',
      suspended: '#F59E0B',
      frozen: '#EF4444',
      pending: '#6B7280',
      completed: '#10B981',
      failed: '#EF4444',
      cancelled: '#6B7280',
      processing: '#3B82F6',
      approved: '#10B981',
      rejected: '#EF4444',
      expired: '#F59E0B'
    };
    return colors[status as keyof typeof colors] || '#6B7280';
  };

  const handleUserAction = async (user: WalletUser, action: WalletAdminAction['type']) => {
    const actionData: WalletAdminAction = {
      type: action,
      userId: user.id,
      reason: `Acción administrativa: ${action}`
    };

    const success = await executeAdminAction(actionData);
    if (success) {
      Alert.alert('Éxito', 'Acción ejecutada correctamente');
      setShowUserModal(false);
    } else {
      Alert.alert('Error', 'No se pudo ejecutar la acción');
    }
  };

  const renderOverview = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Resumen General</Text>
      
      {stats && (
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Users size={24} color="#3B82F6" />
            <Text style={styles.statValue}>{stats.totalUsers.toLocaleString()}</Text>
            <Text style={styles.statLabel}>Usuarios Totales</Text>
          </View>
          
          <View style={styles.statCard}>
            <Activity size={24} color="#10B981" />
            <Text style={styles.statValue}>{stats.activeUsers.toLocaleString()}</Text>
            <Text style={styles.statLabel}>Usuarios Activos</Text>
          </View>
          
          <View style={styles.statCard}>
            <DollarSign size={24} color="#F59E0B" />
            <Text style={styles.statValue}>{formatCurrency(stats.totalBalance)}</Text>
            <Text style={styles.statLabel}>Balance Total</Text>
          </View>
          
          <View style={styles.statCard}>
            <TrendingUp size={24} color="#8B5CF6" />
            <Text style={styles.statValue}>{stats.totalTransactions.toLocaleString()}</Text>
            <Text style={styles.statLabel}>Transacciones</Text>
          </View>
        </View>
      )}

      <View style={styles.alertsSection}>
        <Text style={styles.sectionTitle}>Alertas Recientes</Text>
        {alerts.slice(0, 3).map(alert => (
          <View key={alert.id} style={styles.alertCard}>
            <View style={styles.alertHeader}>
              <AlertTriangle size={20} color={alert.severity === 'high' ? '#EF4444' : '#F59E0B'} />
              <Text style={styles.alertTitle}>{alert.message}</Text>
            </View>
            <Text style={styles.alertUser}>{alert.userName}</Text>
            <Text style={styles.alertTime}>{formatDate(alert.timestamp)}</Text>
            <View style={styles.alertActions}>
              <TouchableOpacity
                style={[styles.alertButton, { backgroundColor: '#10B981' }]}
                onPress={() => resolveAlert(alert.id)}
              >
                <Text style={styles.alertButtonText}>Resolver</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.alertButton, { backgroundColor: '#6B7280' }]}
                onPress={() => dismissAlert(alert.id)}
              >
                <Text style={styles.alertButtonText}>Descartar</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>
    </View>
  );

  const renderUsers = () => (
    <View style={styles.tabContent}>
      <View style={styles.searchContainer}>
        <Search size={20} color="#6B7280" />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar usuarios..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <ScrollView style={styles.usersList}>
        {searchUsers(searchQuery).map(user => (
          <TouchableOpacity
            key={user.id}
            style={styles.userCard}
            onPress={() => {
              setSelectedUser(user);
              setShowUserModal(true);
            }}
          >
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{user.name}</Text>
              <Text style={styles.userEmail}>{user.email}</Text>
              <Text style={styles.userBalance}>{formatCurrency(user.balance)}</Text>
            </View>
            <View style={styles.userStatus}>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(user.status) }]}>
                <Text style={styles.statusText}>{user.status}</Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(user.kycStatus) }]}>
                <Text style={styles.statusText}>{user.kycStatus}</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderTransactions = () => (
    <View style={styles.tabContent}>
      <View style={styles.searchContainer}>
        <Search size={20} color="#6B7280" />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar transacciones..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <ScrollView style={styles.transactionsList}>
        {searchTransactions(searchQuery).map(transaction => (
          <TouchableOpacity
            key={transaction.id}
            style={[
              styles.transactionCard,
              transaction.flagged && styles.flaggedTransaction
            ]}
            onPress={() => {
              setSelectedTransaction(transaction);
              setShowTransactionModal(true);
            }}
          >
            <View style={styles.transactionInfo}>
              <Text style={styles.transactionId}>{transaction.id}</Text>
              <Text style={styles.transactionUser}>{transaction.userName}</Text>
              <Text style={styles.transactionDescription}>{transaction.description}</Text>
            </View>
            <View style={styles.transactionDetails}>
              <Text style={styles.transactionAmount}>
                {formatCurrency(transaction.amount)}
              </Text>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(transaction.status) }]}>
                <Text style={styles.statusText}>{transaction.status}</Text>
              </View>
              {transaction.flagged && (
                <AlertTriangle size={16} color="#EF4444" />
              )}
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderAlerts = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Alertas de Seguridad</Text>
      
      <ScrollView style={styles.alertsList}>
        {alerts.map(alert => (
          <View key={alert.id} style={styles.alertCard}>
            <View style={styles.alertHeader}>
              <AlertTriangle 
                size={24} 
                color={alert.severity === 'critical' ? '#DC2626' : 
                       alert.severity === 'high' ? '#EF4444' : 
                       alert.severity === 'medium' ? '#F59E0B' : '#6B7280'} 
              />
              <View style={styles.alertInfo}>
                <Text style={styles.alertTitle}>{alert.message}</Text>
                <Text style={styles.alertUser}>{alert.userName}</Text>
                <Text style={styles.alertTime}>{formatDate(alert.timestamp)}</Text>
              </View>
            </View>
            
            <View style={styles.alertDetails}>
              <Text style={styles.alertDetailsText}>
                {JSON.stringify(alert.details, null, 2)}
              </Text>
            </View>

            <View style={styles.alertActions}>
              <TouchableOpacity
                style={[styles.alertButton, { backgroundColor: '#10B981' }]}
                onPress={() => resolveAlert(alert.id)}
              >
                <CheckCircle size={16} color="white" />
                <Text style={styles.alertButtonText}>Resolver</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.alertButton, { backgroundColor: '#6B7280' }]}
                onPress={() => dismissAlert(alert.id)}
              >
                <XCircle size={16} color="white" />
                <Text style={styles.alertButtonText}>Descartar</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );

  const renderSettings = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Configuración de Wallet</Text>
      
      <View style={styles.settingsSection}>
        <Text style={styles.settingsTitle}>Tasas de Cambio</Text>
        {exchangeRates.map((rate, index) => (
          <View key={index} style={styles.rateCard}>
            <Text style={styles.ratePair}>{rate.from} → {rate.to}</Text>
            <Text style={styles.rateValue}>{rate.rate.toLocaleString()}</Text>
            <Text style={styles.rateTime}>{formatDate(rate.lastUpdated)}</Text>
          </View>
        ))}
      </View>

      <View style={styles.settingsSection}>
        <Text style={styles.settingsTitle}>Estructura de Comisiones</Text>
        {feeStructures.map(fee => (
          <View key={fee.id} style={styles.feeCard}>
            <Text style={styles.feeType}>{fee.type} - {fee.currency}</Text>
            <Text style={styles.feeValue}>
              {fee.feeType === 'percentage' ? `${fee.value}%` : formatCurrency(fee.value)}
            </Text>
            <TouchableOpacity
              style={[styles.toggleButton, { backgroundColor: fee.active ? '#10B981' : '#EF4444' }]}
              onPress={() => updateFeeStructure(fee.id, { active: !fee.active })}
            >
              <Text style={styles.toggleText}>{fee.active ? 'Activo' : 'Inactivo'}</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>

      <TouchableOpacity
        style={styles.reportButton}
        onPress={() => generateComplianceReport('aml')}
      >
        <FileText size={20} color="white" />
        <Text style={styles.reportButtonText}>Generar Reporte de Cumplimiento</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: 'Administración de Wallet',
          headerStyle: { backgroundColor: '#1F2937' },
          headerTintColor: 'white'
        }} 
      />

      <View style={styles.header}>
        <Text style={styles.title}>Panel de Administración - Wallet</Text>
        <TouchableOpacity style={styles.refreshButton} onPress={refreshData}>
          <RefreshCw size={20} color="white" />
        </TouchableOpacity>
      </View>

      <View style={styles.tabBar}>
        {[
          { key: 'overview', label: 'Resumen', icon: TrendingUp },
          { key: 'users', label: 'Usuarios', icon: Users },
          { key: 'transactions', label: 'Transacciones', icon: Activity },
          { key: 'alerts', label: 'Alertas', icon: AlertTriangle },
          { key: 'settings', label: 'Configuración', icon: Settings }
        ].map(tab => {
          const IconComponent = tab.icon;
          return (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tab, activeTab === tab.key && styles.activeTab]}
              onPress={() => setActiveTab(tab.key as any)}
            >
              <IconComponent size={20} color={activeTab === tab.key ? '#3B82F6' : '#6B7280'} />
              <Text style={[styles.tabText, activeTab === tab.key && styles.activeTabText]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <ScrollView style={styles.content}>
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'users' && renderUsers()}
        {activeTab === 'transactions' && renderTransactions()}
        {activeTab === 'alerts' && renderAlerts()}
        {activeTab === 'settings' && renderSettings()}
      </ScrollView>

      {/* User Details Modal */}
      <Modal visible={showUserModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedUser && (
              <>
                <Text style={styles.modalTitle}>Detalles del Usuario</Text>
                <View style={styles.userDetails}>
                  <Text style={styles.detailLabel}>Nombre: {selectedUser.name}</Text>
                  <Text style={styles.detailLabel}>Email: {selectedUser.email}</Text>
                  <Text style={styles.detailLabel}>Teléfono: {selectedUser.phone}</Text>
                  <Text style={styles.detailLabel}>Balance: {formatCurrency(selectedUser.balance)}</Text>
                  <Text style={styles.detailLabel}>Estado: {selectedUser.status}</Text>
                  <Text style={styles.detailLabel}>KYC: {selectedUser.kycStatus}</Text>
                  <Text style={styles.detailLabel}>Tier: {selectedUser.tier}</Text>
                  <Text style={styles.detailLabel}>Riesgo: {selectedUser.riskScore}/10</Text>
                </View>

                <View style={styles.actionButtons}>
                  <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: '#EF4444' }]}
                    onPress={() => handleUserAction(selectedUser, 'freeze_account')}
                  >
                    <Ban size={16} color="white" />
                    <Text style={styles.actionButtonText}>Congelar</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: '#10B981' }]}
                    onPress={() => handleUserAction(selectedUser, 'unfreeze_account')}
                  >
                    <CheckCircle size={16} color="white" />
                    <Text style={styles.actionButtonText}>Descongelar</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: '#3B82F6' }]}
                    onPress={() => handleUserAction(selectedUser, 'approve_kyc')}
                  >
                    <Shield size={16} color="white" />
                    <Text style={styles.actionButtonText}>Aprobar KYC</Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setShowUserModal(false)}
                >
                  <Text style={styles.closeButtonText}>Cerrar</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* Transaction Details Modal */}
      <Modal visible={showTransactionModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedTransaction && (
              <>
                <Text style={styles.modalTitle}>Detalles de Transacción</Text>
                <View style={styles.transactionDetails}>
                  <Text style={styles.detailLabel}>ID: {selectedTransaction.id}</Text>
                  <Text style={styles.detailLabel}>Usuario: {selectedTransaction.userName}</Text>
                  <Text style={styles.detailLabel}>Tipo: {selectedTransaction.type}</Text>
                  <Text style={styles.detailLabel}>Monto: {formatCurrency(selectedTransaction.amount)}</Text>
                  <Text style={styles.detailLabel}>Estado: {selectedTransaction.status}</Text>
                  <Text style={styles.detailLabel}>Comisión: {formatCurrency(selectedTransaction.fee)}</Text>
                  <Text style={styles.detailLabel}>Descripción: {selectedTransaction.description}</Text>
                  <Text style={styles.detailLabel}>Fecha: {formatDate(selectedTransaction.timestamp)}</Text>
                  <Text style={styles.detailLabel}>Riesgo: {selectedTransaction.riskLevel}</Text>
                  {selectedTransaction.flagged && (
                    <Text style={[styles.detailLabel, { color: '#EF4444' }]}>⚠️ TRANSACCIÓN MARCADA</Text>
                  )}
                </View>

                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setShowTransactionModal(false)}
                >
                  <Text style={styles.closeButtonText}>Cerrar</Text>
                </TouchableOpacity>
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
    backgroundColor: '#F9FAFB'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#1F2937'
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white'
  },
  refreshButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#374151'
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB'
  },
  tab: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent'
  },
  activeTab: {
    borderBottomColor: '#3B82F6'
  },
  tabText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4
  },
  activeTabText: {
    color: '#3B82F6',
    fontWeight: '600'
  },
  content: {
    flex: 1
  },
  tabContent: {
    padding: 16
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 8
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 4
  },
  alertsSection: {
    marginTop: 16
  },
  alertCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8
  },
  alertInfo: {
    flex: 1,
    marginLeft: 12
  },
  alertTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937'
  },
  alertUser: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2
  },
  alertTime: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 2
  },
  alertDetails: {
    backgroundColor: '#F3F4F6',
    padding: 8,
    borderRadius: 6,
    marginBottom: 12
  },
  alertDetailsText: {
    fontSize: 11,
    color: '#4B5563',
    fontFamily: 'monospace'
  },
  alertActions: {
    flexDirection: 'row',
    gap: 8
  },
  alertButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    gap: 4
  },
  alertButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600'
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: '#1F2937'
  },
  usersList: {
    flex: 1
  },
  userCard: {
    flexDirection: 'row',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  userInfo: {
    flex: 1
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937'
  },
  userEmail: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2
  },
  userBalance: {
    fontSize: 14,
    fontWeight: '600',
    color: '#059669',
    marginTop: 4
  },
  userStatus: {
    alignItems: 'flex-end',
    gap: 4
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12
  },
  statusText: {
    color: 'white',
    fontSize: 11,
    fontWeight: '600'
  },
  transactionsList: {
    flex: 1
  },
  transactionCard: {
    flexDirection: 'row',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  flaggedTransaction: {
    borderLeftWidth: 4,
    borderLeftColor: '#EF4444'
  },
  transactionInfo: {
    flex: 1
  },
  transactionId: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937'
  },
  transactionUser: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2
  },
  transactionDescription: {
    fontSize: 12,
    color: '#4B5563',
    marginTop: 2
  },
  transactionDetails: {
    alignItems: 'flex-end',
    gap: 4
  },
  transactionAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#059669'
  },
  alertsList: {
    flex: 1
  },
  settingsSection: {
    marginBottom: 24
  },
  settingsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12
  },
  rateCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2
  },
  ratePair: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937'
  },
  rateValue: {
    fontSize: 14,
    color: '#059669'
  },
  rateTime: {
    fontSize: 11,
    color: '#6B7280'
  },
  feeCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2
  },
  feeType: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    flex: 1
  },
  feeValue: {
    fontSize: 14,
    color: '#059669',
    marginRight: 12
  },
  toggleButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6
  },
  toggleText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600'
  },
  reportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3B82F6',
    padding: 16,
    borderRadius: 12,
    gap: 8
  },
  reportButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600'
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  modalContent: {
    backgroundColor: 'white',
    margin: 20,
    borderRadius: 12,
    padding: 20,
    maxHeight: '80%'
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
    textAlign: 'center'
  },
  userDetails: {
    marginBottom: 20
  },
  detailLabel: {
    fontSize: 14,
    color: '#4B5563',
    marginBottom: 8
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    gap: 4
  },
  actionButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600'
  },
  closeButton: {
    backgroundColor: '#6B7280',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center'
  },
  closeButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600'
  }
});