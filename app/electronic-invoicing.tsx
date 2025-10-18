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
import { Stack, useRouter } from 'expo-router';
import {
  FileText,
  Send,
  CheckCircle,
  XCircle,
  Clock,
  Download,
  Eye,
  Plus,
  Filter,
  Search,
  TrendingUp,
  DollarSign,
  Calendar,
  Settings,
  AlertCircle,
  Printer,
  Mail,
  Edit,
} from 'lucide-react-native';
import { useElectronicInvoice } from '@/hooks/use-electronic-invoice';

const { width } = Dimensions.get('window');

const statusConfig = {
  draft: { label: 'Borrador', color: '#94a3b8', icon: Edit },
  pending: { label: 'Pendiente', color: '#ea580c', icon: Clock },
  sent: { label: 'Enviada', color: '#2563eb', icon: Send },
  accepted: { label: 'Aceptada', color: '#059669', icon: CheckCircle },
  rejected: { label: 'Rechazada', color: '#dc2626', icon: XCircle },
  cancelled: { label: 'Anulada', color: '#64748b', icon: XCircle },
};

export default function ElectronicInvoicingScreen() {
  const router = useRouter();
  const {
    invoices,
    filteredInvoices,
    stats,
    filterStatus,
    isLoadingInvoices,
    setFilterStatus,
    sendInvoice,
    cancelInvoice,
    generateReceipt,
    isSending,
  } = useElectronicInvoice();

  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const onRefresh = async () => {
    setRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  const renderInvoiceCard = (invoice: any) => {
    const statusInfo = statusConfig[invoice.status as keyof typeof statusConfig];
    const StatusIcon = statusInfo.icon;

    return (
      <TouchableOpacity
        key={invoice.id}
        style={styles.invoiceCard}
      >
        <View style={styles.invoiceHeader}>
          <View style={styles.invoiceHeaderLeft}>
            <FileText size={20} color="#2563eb" />
            <View style={styles.invoiceHeaderInfo}>
              <Text style={styles.invoiceNumber}>{invoice.invoiceNumber}</Text>
              <Text style={styles.customerName}>{invoice.customer.name}</Text>
            </View>
          </View>
          <View style={[
            styles.statusBadge,
            { backgroundColor: `${statusInfo.color}20` }
          ]}>
            <StatusIcon size={12} color={statusInfo.color} />
            <Text style={[styles.statusText, { color: statusInfo.color }]}>
              {statusInfo.label}
            </Text>
          </View>
        </View>

        <View style={styles.invoiceBody}>
          <View style={styles.invoiceRow}>
            <Text style={styles.invoiceLabel}>Total:</Text>
            <Text style={styles.invoiceAmount}>
              {invoice.currency} ${invoice.total.toLocaleString()}
            </Text>
          </View>
          <View style={styles.invoiceRow}>
            <Text style={styles.invoiceLabel}>Fecha:</Text>
            <Text style={styles.invoiceDate}>
              {new Date(invoice.createdAt).toLocaleDateString()}
            </Text>
          </View>
          {invoice.dueDate && (
            <View style={styles.invoiceRow}>
              <Text style={styles.invoiceLabel}>Vencimiento:</Text>
              <Text style={styles.invoiceDate}>
                {new Date(invoice.dueDate).toLocaleDateString()}
              </Text>
            </View>
          )}
          {invoice.cae && (
            <View style={styles.invoiceRow}>
              <Text style={styles.invoiceLabel}>CAE:</Text>
              <Text style={styles.invoiceCAE}>{invoice.cae}</Text>
            </View>
          )}
        </View>

        <View style={styles.invoiceActions}>
          {invoice.status === 'draft' && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => sendInvoice(invoice.id)}
              disabled={isSending}
            >
              <Send size={14} color="#2563eb" />
              <Text style={[styles.actionButtonText, { color: '#2563eb' }]}>Enviar</Text>
            </TouchableOpacity>
          )}
          
          {(invoice.status === 'sent' || invoice.status === 'accepted') && (
            <>
              <TouchableOpacity style={styles.actionButton}>
                <Download size={14} color="#059669" />
                <Text style={[styles.actionButtonText, { color: '#059669' }]}>PDF</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton}>
                <Mail size={14} color="#7c3aed" />
                <Text style={[styles.actionButtonText, { color: '#7c3aed' }]}>Enviar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton}>
                <Printer size={14} color="#ea580c" />
                <Text style={[styles.actionButtonText, { color: '#ea580c' }]}>Imprimir</Text>
              </TouchableOpacity>
            </>
          )}
          
          <TouchableOpacity style={styles.actionButton}>
            <Eye size={14} color="#64748b" />
            <Text style={styles.actionButtonText}>Ver</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen 
        options={{
          title: 'Facturación Electrónica',
          headerStyle: { backgroundColor: '#2563eb' },
          headerTintColor: '#FFFFFF',
          headerTitleStyle: { fontWeight: 'bold' },
          headerRight: () => (
            <TouchableOpacity
              style={styles.headerButton}
              onPress={() => {}}
            >
              <Settings size={20} color="#ffffff" />
            </TouchableOpacity>
          ),
        }}
      />

      <View style={styles.statsSection}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <FileText size={20} color="#2563eb" />
              <Text style={styles.statValue}>{stats?.totalIssued || 0}</Text>
              <Text style={styles.statLabel}>Emitidas</Text>
            </View>
            <View style={styles.statCard}>
              <DollarSign size={20} color="#059669" />
              <Text style={styles.statValue}>${(stats?.totalAmount || 0).toLocaleString()}</Text>
              <Text style={styles.statLabel}>Total Facturado</Text>
            </View>
            <View style={styles.statCard}>
              <CheckCircle size={20} color="#059669" />
              <Text style={styles.statValue}>{stats?.totalPaid || 0}</Text>
              <Text style={styles.statLabel}>Pagadas</Text>
            </View>
            <View style={styles.statCard}>
              <Clock size={20} color="#ea580c" />
              <Text style={styles.statValue}>{stats?.totalPending || 0}</Text>
              <Text style={styles.statLabel}>Pendientes</Text>
            </View>
            <View style={styles.statCard}>
              <TrendingUp size={20} color="#7c3aed" />
              <Text style={styles.statValue}>${(stats?.averageTicket || 0).toFixed(0)}</Text>
              <Text style={styles.statLabel}>Ticket Promedio</Text>
            </View>
          </View>
        </ScrollView>
      </View>

      <View style={styles.controls}>
        <View style={styles.searchBar}>
          <Search size={16} color="#64748b" />
          <Text
            style={styles.searchInput}
            onPress={() => {}}
          >
            {searchQuery || 'Buscar facturas...'}
          </Text>
        </View>
        <TouchableOpacity style={styles.filterButton}>
          <Filter size={16} color="#64748b" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => {}}
        >
          <Plus size={18} color="#ffffff" />
        </TouchableOpacity>
      </View>

      <View style={styles.filtersContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.filtersRow}>
            {[
              { key: 'all', label: 'Todas' },
              { key: 'draft', label: 'Borradores' },
              { key: 'pending', label: 'Pendientes' },
              { key: 'sent', label: 'Enviadas' },
              { key: 'accepted', label: 'Aceptadas' },
              { key: 'rejected', label: 'Rechazadas' },
            ].map((filter) => (
              <TouchableOpacity
                key={filter.key}
                style={[
                  styles.filterChip,
                  filterStatus === filter.key && styles.filterChipActive
                ]}
                onPress={() => setFilterStatus(filter.key)}
              >
                <Text style={[
                  styles.filterChipText,
                  filterStatus === filter.key && styles.filterChipTextActive
                ]}>
                  {filter.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {isLoadingInvoices ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Cargando facturas...</Text>
          </View>
        ) : filteredInvoices.length === 0 ? (
          <View style={styles.emptyState}>
            <FileText size={48} color="#94a3b8" />
            <Text style={styles.emptyStateText}>No hay facturas</Text>
            <Text style={styles.emptyStateSubtext}>
              {filterStatus === 'all' 
                ? 'Crea tu primera factura electrónica'
                : 'No hay facturas con este filtro'
              }
            </Text>
          </View>
        ) : (
          <View style={styles.invoicesList}>
            {filteredInvoices.map(renderInvoiceCard)}
          </View>
        )}

        <View style={styles.quickActions}>
          <Text style={styles.quickActionsTitle}>Acciones Rápidas</Text>
          <View style={styles.quickActionsGrid}>
            <TouchableOpacity style={styles.quickActionCard}>
              <FileText size={24} color="#2563eb" />
              <Text style={styles.quickActionText}>Nueva Factura</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickActionCard}>
              <Download size={24} color="#059669" />
              <Text style={styles.quickActionText}>Exportar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickActionCard}>
              <Calendar size={24} color="#7c3aed" />
              <Text style={styles.quickActionText}>Reportes</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickActionCard}>
              <Settings size={24} color="#64748b" />
              <Text style={styles.quickActionText}>Configuración</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.infoSection}>
          <View style={styles.infoCard}>
            <AlertCircle size={20} color="#2563eb" />
            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>Facturación Electrónica</Text>
              <Text style={styles.infoText}>
                Sistema completo de facturación electrónica integrado con las autoridades fiscales.
                Genera facturas válidas, envía comprobantes automáticamente y mantén tu contabilidad al día.
              </Text>
            </View>
          </View>

          <View style={styles.featuresGrid}>
            <View style={styles.featureItem}>
              <CheckCircle size={16} color="#059669" />
              <Text style={styles.featureText}>CAE automático</Text>
            </View>
            <View style={styles.featureItem}>
              <CheckCircle size={16} color="#059669" />
              <Text style={styles.featureText}>Código QR</Text>
            </View>
            <View style={styles.featureItem}>
              <CheckCircle size={16} color="#059669" />
              <Text style={styles.featureText}>Envío por email</Text>
            </View>
            <View style={styles.featureItem}>
              <CheckCircle size={16} color="#059669" />
              <Text style={styles.featureText}>PDF descargable</Text>
            </View>
            <View style={styles.featureItem}>
              <CheckCircle size={16} color="#059669" />
              <Text style={styles.featureText}>Reportes fiscales</Text>
            </View>
            <View style={styles.featureItem}>
              <CheckCircle size={16} color="#059669" />
              <Text style={styles.featureText}>Multi-moneda</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <TouchableOpacity
        style={styles.fab}
        onPress={() => {}}
      >
        <Plus size={24} color="#ffffff" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  headerButton: {
    padding: 8,
    marginRight: 8,
  },
  statsSection: {
    backgroundColor: '#ffffff',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
  },
  statCard: {
    backgroundColor: '#f8fafc',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    minWidth: 120,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    color: '#64748b',
    textAlign: 'center',
  },
  controls: {
    flexDirection: 'row',
    gap: 8,
    padding: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#64748b',
  },
  filterButton: {
    backgroundColor: '#f8fafc',
    padding: 10,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  createButton: {
    backgroundColor: '#2563eb',
    padding: 10,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filtersContainer: {
    backgroundColor: '#ffffff',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  filtersRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
  },
  filterChip: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  filterChipActive: {
    backgroundColor: '#2563eb',
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#64748b',
  },
  filterChipTextActive: {
    color: '#ffffff',
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
    color: '#64748b',
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748b',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
  },
  invoicesList: {
    padding: 16,
  },
  invoiceCard: {
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
  invoiceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  invoiceHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  invoiceHeaderInfo: {
    flex: 1,
  },
  invoiceNumber: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 2,
  },
  customerName: {
    fontSize: 13,
    color: '#64748b',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  invoiceBody: {
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 12,
    marginBottom: 12,
  },
  invoiceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  invoiceLabel: {
    fontSize: 13,
    color: '#64748b',
  },
  invoiceAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#059669',
  },
  invoiceDate: {
    fontSize: 13,
    fontWeight: '500',
    color: '#1e293b',
  },
  invoiceCAE: {
    fontSize: 12,
    fontWeight: '500',
    color: '#2563eb',
    fontFamily: 'monospace',
  },
  invoiceActions: {
    flexDirection: 'row',
    gap: 8,
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
  actionButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748b',
  },
  quickActions: {
    padding: 16,
  },
  quickActionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 12,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickActionCard: {
    flex: 1,
    minWidth: (width - 56) / 2,
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
  quickActionText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#374151',
    marginTop: 8,
    textAlign: 'center',
  },
  infoSection: {
    padding: 16,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#eff6ff',
    padding: 16,
    borderRadius: 12,
    gap: 12,
    marginBottom: 16,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e40af',
    marginBottom: 6,
  },
  infoText: {
    fontSize: 12,
    color: '#1e40af',
    lineHeight: 18,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  featureText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#374151',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#2563eb',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});
