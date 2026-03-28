import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  SafeAreaView,
} from 'react-native';
import { Stack, router } from 'expo-router';
import {
  Users,
  Search,
  Filter,
  Plus,
  Phone,
  Mail,
  Calendar,
  TrendingUp,
  Star,
  MessageCircle,
  Eye,
  Edit,
  UserPlus,
} from 'lucide-react-native';
import { useCRM } from '@/hooks/use-crm';
import { Customer } from '@/types/crm';

export default function CRMDashboard() {
  const {
    customers,
    segments,
    crmStats,
    searchQuery,
    setSearchQuery,
    selectedSegment,
    setSelectedSegment,
    sortBy,
    setSortBy,
    addInteraction,
  } = useCRM();

  const [showFilters, setShowFilters] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const handleAddInteraction = (customerId: string, type: 'call' | 'email' | 'message') => {
    const customer = customers.find(c => c.id === customerId);
    if (!customer) return;

    const interactionTypes = {
      call: 'Llamada de seguimiento',
      email: 'Email enviado',
      message: 'Mensaje enviado'
    };

    addInteraction({
      customerId,
      type,
      description: interactionTypes[type],
      createdBy: 'current-user'
    });

    Alert.alert('Éxito', `${interactionTypes[type]} registrado correctamente`);
  };

  const getStatusColor = (status: Customer['status']) => {
    switch (status) {
      case 'vip': return '#8b5cf6';
      case 'active': return '#10b981';
      case 'inactive': return '#6b7280';
      default: return '#6b7280';
    }
  };

  const getStatusText = (status: Customer['status']) => {
    switch (status) {
      case 'vip': return 'VIP';
      case 'active': return 'Activo';
      case 'inactive': return 'Inactivo';
      default: return 'Desconocido';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          title: 'CRM - Gestión de Clientes',
          headerStyle: { backgroundColor: '#2563eb' },
          headerTintColor: '#ffffff',
          headerTitleStyle: { fontWeight: 'bold' },
        }}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Users size={24} color="#2563eb" />
            <Text style={styles.statNumber}>{crmStats.totalCustomers}</Text>
            <Text style={styles.statLabel}>Total Clientes</Text>
          </View>
          <View style={styles.statCard}>
            <TrendingUp size={24} color="#10b981" />
            <Text style={styles.statNumber}>{crmStats.activeCustomers}</Text>
            <Text style={styles.statLabel}>Activos</Text>
          </View>
          <View style={styles.statCard}>
            <UserPlus size={24} color="#8b5cf6" />
            <Text style={styles.statNumber}>{crmStats.newCustomersThisMonth}</Text>
            <Text style={styles.statLabel}>Nuevos</Text>
          </View>
          <View style={styles.statCard}>
            <Star size={24} color="#f59e0b" />
            <Text style={styles.statNumber}>{crmStats.customerRetentionRate.toFixed(1)}%</Text>
            <Text style={styles.statLabel}>Retención</Text>
          </View>
        </View>

        {/* Search and Filters */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBox}>
            <Search size={20} color="#6b7280" />
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar clientes..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#9ca3af"
            />
          </View>
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => setShowFilters(!showFilters)}
          >
            <Filter size={20} color="#2563eb" />
          </TouchableOpacity>
        </View>

        {/* Filters Panel */}
        {showFilters && (
          <View style={styles.filtersPanel}>
            <Text style={styles.filterTitle}>Segmentos</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <TouchableOpacity
                style={[
                  styles.filterChip,
                  selectedSegment === 'all' && styles.filterChipActive
                ]}
                onPress={() => setSelectedSegment('all')}
              >
                <Text style={[
                  styles.filterChipText,
                  selectedSegment === 'all' && styles.filterChipTextActive
                ]}>
                  Todos
                </Text>
              </TouchableOpacity>
              {segments.map((segment) => (
                <TouchableOpacity
                  key={segment.id}
                  style={[
                    styles.filterChip,
                    selectedSegment === segment.id && styles.filterChipActive
                  ]}
                  onPress={() => setSelectedSegment(segment.id)}
                >
                  <Text style={[
                    styles.filterChipText,
                    selectedSegment === segment.id && styles.filterChipTextActive
                  ]}>
                    {segment.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.filterTitle}>Ordenar por</Text>
            <View style={styles.sortOptions}>
              {[
                { key: 'name', label: 'Nombre' },
                { key: 'lastVisit', label: 'Última visita' },
                { key: 'totalSpent', label: 'Total gastado' }
              ].map((option) => (
                <TouchableOpacity
                  key={option.key}
                  style={[
                    styles.sortOption,
                    sortBy === option.key && styles.sortOptionActive
                  ]}
                  onPress={() => setSortBy(option.key as any)}
                >
                  <Text style={[
                    styles.sortOptionText,
                    sortBy === option.key && styles.sortOptionTextActive
                  ]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Customer List */}
        <View style={styles.customerList}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Clientes ({customers.length})</Text>
            <TouchableOpacity style={styles.addButton}>
              <Plus size={20} color="#2563eb" />
            </TouchableOpacity>
          </View>

          {customers.map((customer) => (
            <View key={customer.id} style={styles.customerCard}>
              <View style={styles.customerHeader}>
                <View style={styles.customerInfo}>
                  <View style={styles.customerAvatar}>
                    <Text style={styles.customerInitials}>
                      {customer.name.split(' ').map(n => n[0]).join('')}
                    </Text>
                  </View>
                  <View style={styles.customerDetails}>
                    <Text style={styles.customerName}>{customer.name}</Text>
                    <Text style={styles.customerEmail}>{customer.email}</Text>
                    <View style={styles.customerMeta}>
                      <View style={[styles.statusBadge, { backgroundColor: getStatusColor(customer.status) }]}>
                        <Text style={styles.statusText}>{getStatusText(customer.status)}</Text>
                      </View>
                      <Text style={styles.customerPhone}>{customer.phone}</Text>
                    </View>
                  </View>
                </View>
                <TouchableOpacity
                  style={styles.viewButton}
                  onPress={() => setSelectedCustomer(customer)}
                >
                  <Eye size={16} color="#6b7280" />
                </TouchableOpacity>
              </View>

              <View style={styles.customerStats}>
                <View style={styles.customerStat}>
                  <Text style={styles.customerStatValue}>{formatCurrency(customer.totalSpent)}</Text>
                  <Text style={styles.customerStatLabel}>Total gastado</Text>
                </View>
                <View style={styles.customerStat}>
                  <Text style={styles.customerStatValue}>{customer.totalOrders}</Text>
                  <Text style={styles.customerStatLabel}>Órdenes</Text>
                </View>
                <View style={styles.customerStat}>
                  <Text style={styles.customerStatValue}>
                    {customer.lastVisit ? formatDate(customer.lastVisit) : 'Nunca'}
                  </Text>
                  <Text style={styles.customerStatLabel}>Última visita</Text>
                </View>
              </View>

              <View style={styles.customerActions}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleAddInteraction(customer.id, 'call')}
                >
                  <Phone size={16} color="#2563eb" />
                  <Text style={styles.actionButtonText}>Llamar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleAddInteraction(customer.id, 'email')}
                >
                  <Mail size={16} color="#2563eb" />
                  <Text style={styles.actionButtonText}>Email</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleAddInteraction(customer.id, 'message')}
                >
                  <MessageCircle size={16} color="#2563eb" />
                  <Text style={styles.actionButtonText}>Mensaje</Text>
                </TouchableOpacity>
              </View>

              {customer.tags.length > 0 && (
                <View style={styles.customerTags}>
                  {customer.tags.map((tag, index) => (
                    <View key={index} style={styles.tag}>
                      <Text style={styles.tagText}>{tag}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          ))}
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
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
    textAlign: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#1f2937',
  },
  filterButton: {
    backgroundColor: '#ffffff',
    padding: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  filtersPanel: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  filterChip: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: '#2563eb',
  },
  filterChipText: {
    fontSize: 14,
    color: '#6b7280',
  },
  filterChipTextActive: {
    color: '#ffffff',
  },
  sortOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  sortOption: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  sortOptionActive: {
    backgroundColor: '#2563eb',
  },
  sortOptionText: {
    fontSize: 14,
    color: '#6b7280',
  },
  sortOptionTextActive: {
    color: '#ffffff',
  },
  customerList: {
    flex: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  addButton: {
    backgroundColor: '#ffffff',
    padding: 8,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  customerCard: {
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
  customerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  customerInfo: {
    flexDirection: 'row',
    flex: 1,
  },
  customerAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#2563eb',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  customerInitials: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  customerDetails: {
    flex: 1,
  },
  customerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  customerEmail: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  customerMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  statusText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '500',
  },
  customerPhone: {
    fontSize: 12,
    color: '#6b7280',
  },
  viewButton: {
    padding: 8,
  },
  customerStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  customerStat: {
    alignItems: 'center',
  },
  customerStatValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  customerStatLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  customerActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eff6ff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  actionButtonText: {
    marginLeft: 6,
    fontSize: 14,
    color: '#2563eb',
    fontWeight: '500',
  },
  customerTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  tag: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
    marginBottom: 4,
  },
  tagText: {
    fontSize: 12,
    color: '#6b7280',
  },
});