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
  Modal,
} from 'react-native';
import { Stack } from 'expo-router';
import {
  Tag,
  Search,
  Filter,
  Plus,
  Calendar,
  TrendingUp,
  Users,
  Gift,
  Percent,
  Star,
  Eye,
  Edit,
  Trash2,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react-native';
import { usePromotions } from '@/hooks/use-promotions';
import { Promotion } from '@/types/crm';

export default function PromotionsManager() {
  const {
    promotions,
    promotionStats,
    searchQuery,
    setSearchQuery,
    filterStatus,
    setFilterStatus,
    filterType,
    setFilterType,
    createPromotion,
    updatePromotion,
    deletePromotion,
    togglePromotionStatus,
  } = usePromotions();

  const [showFilters, setShowFilters] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedPromotion, setSelectedPromotion] = useState<Promotion | null>(null);

  const getTypeIcon = (type: Promotion['type']) => {
    switch (type) {
      case 'discount': return <Percent size={20} color="#2563eb" />;
      case 'bogo': return <Gift size={20} color="#10b981" />;
      case 'free_service': return <Star size={20} color="#f59e0b" />;
      case 'loyalty_points': return <Users size={20} color="#8b5cf6" />;
      default: return <Tag size={20} color="#6b7280" />;
    }
  };

  const getTypeLabel = (type: Promotion['type']) => {
    switch (type) {
      case 'discount': return 'Descuento';
      case 'bogo': return 'Lleva 2 Paga 1';
      case 'free_service': return 'Servicio Gratis';
      case 'loyalty_points': return 'Puntos Extra';
      default: return 'Desconocido';
    }
  };

  const getStatusColor = (promotion: Promotion) => {
    const now = new Date();
    const isExpired = new Date(promotion.validUntil) < now;
    
    if (isExpired) return '#ef4444';
    if (promotion.isActive) return '#10b981';
    return '#6b7280';
  };

  const getStatusText = (promotion: Promotion) => {
    const now = new Date();
    const isExpired = new Date(promotion.validUntil) < now;
    
    if (isExpired) return 'Expirada';
    if (promotion.isActive) return 'Activa';
    return 'Inactiva';
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

  const handleDeletePromotion = (promotionId: string) => {
    Alert.alert(
      'Eliminar Promoción',
      '¿Estás seguro de que quieres eliminar esta promoción?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            deletePromotion(promotionId);
            Alert.alert('Éxito', 'Promoción eliminada correctamente');
          }
        }
      ]
    );
  };

  const handleToggleStatus = (promotionId: string) => {
    togglePromotionStatus(promotionId);
    Alert.alert('Éxito', 'Estado de la promoción actualizado');
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Gestión de Promociones',
          headerStyle: { backgroundColor: '#2563eb' },
          headerTintColor: '#ffffff',
          headerTitleStyle: { fontWeight: 'bold' },
        }}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Tag size={24} color="#2563eb" />
            <Text style={styles.statNumber}>{promotionStats.totalPromotions}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={styles.statCard}>
            <TrendingUp size={24} color="#10b981" />
            <Text style={styles.statNumber}>{promotionStats.activePromotions}</Text>
            <Text style={styles.statLabel}>Activas</Text>
          </View>
          <View style={styles.statCard}>
            <Users size={24} color="#8b5cf6" />
            <Text style={styles.statNumber}>{promotionStats.totalUsage}</Text>
            <Text style={styles.statLabel}>Usos</Text>
          </View>
          <View style={styles.statCard}>
            <Gift size={24} color="#f59e0b" />
            <Text style={styles.statNumber}>{formatCurrency(promotionStats.totalSavings)}</Text>
            <Text style={styles.statLabel}>Ahorros</Text>
          </View>
        </View>

        {/* Search and Filters */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBox}>
            <Search size={20} color="#6b7280" />
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar promociones..."
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
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowCreateModal(true)}
          >
            <Plus size={20} color="#ffffff" />
          </TouchableOpacity>
        </View>

        {/* Filters Panel */}
        {showFilters && (
          <View style={styles.filtersPanel}>
            <Text style={styles.filterTitle}>Estado</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {[
                { key: 'all', label: 'Todas' },
                { key: 'active', label: 'Activas' },
                { key: 'inactive', label: 'Inactivas' },
                { key: 'expired', label: 'Expiradas' }
              ].map((option) => (
                <TouchableOpacity
                  key={option.key}
                  style={[
                    styles.filterChip,
                    filterStatus === option.key && styles.filterChipActive
                  ]}
                  onPress={() => setFilterStatus(option.key as any)}
                >
                  <Text style={[
                    styles.filterChipText,
                    filterStatus === option.key && styles.filterChipTextActive
                  ]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.filterTitle}>Tipo</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {[
                { key: 'all', label: 'Todos' },
                { key: 'discount', label: 'Descuento' },
                { key: 'bogo', label: 'BOGO' },
                { key: 'free_service', label: 'Servicio Gratis' },
                { key: 'loyalty_points', label: 'Puntos Extra' }
              ].map((option) => (
                <TouchableOpacity
                  key={option.key}
                  style={[
                    styles.filterChip,
                    filterType === option.key && styles.filterChipActive
                  ]}
                  onPress={() => setFilterType(option.key as any)}
                >
                  <Text style={[
                    styles.filterChipText,
                    filterType === option.key && styles.filterChipTextActive
                  ]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Promotions List */}
        <View style={styles.promotionsList}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Promociones ({promotions.length})</Text>
          </View>

          {promotions.map((promotion) => (
            <View key={promotion.id} style={styles.promotionCard}>
              <View style={styles.promotionHeader}>
                <View style={styles.promotionInfo}>
                  <View style={styles.promotionIcon}>
                    {getTypeIcon(promotion.type)}
                  </View>
                  <View style={styles.promotionDetails}>
                    <Text style={styles.promotionTitle}>{promotion.title}</Text>
                    <Text style={styles.promotionDescription}>{promotion.description}</Text>
                    <View style={styles.promotionMeta}>
                      <View style={styles.typeBadge}>
                        <Text style={styles.typeText}>{getTypeLabel(promotion.type)}</Text>
                      </View>
                      {promotion.code && (
                        <View style={styles.codeBadge}>
                          <Text style={styles.codeText}>{promotion.code}</Text>
                        </View>
                      )}
                    </View>
                  </View>
                </View>
                <View style={styles.promotionActions}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleToggleStatus(promotion.id)}
                  >
                    {promotion.isActive ? (
                      <ToggleRight size={20} color="#10b981" />
                    ) : (
                      <ToggleLeft size={20} color="#6b7280" />
                    )}
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => setSelectedPromotion(promotion)}
                  >
                    <Eye size={16} color="#6b7280" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleDeletePromotion(promotion.id)}
                  >
                    <Trash2 size={16} color="#ef4444" />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.promotionStats}>
                <View style={styles.promotionStat}>
                  <Text style={styles.promotionStatValue}>
                    {promotion.type === 'discount' || promotion.type === 'bogo' 
                      ? `${promotion.value}%` 
                      : promotion.value.toString()}
                  </Text>
                  <Text style={styles.promotionStatLabel}>Valor</Text>
                </View>
                <View style={styles.promotionStat}>
                  <Text style={styles.promotionStatValue}>{promotion.usedCount}</Text>
                  <Text style={styles.promotionStatLabel}>Usos</Text>
                </View>
                <View style={styles.promotionStat}>
                  <Text style={styles.promotionStatValue}>
                    {promotion.usageLimit ? promotion.usageLimit : '∞'}
                  </Text>
                  <Text style={styles.promotionStatLabel}>Límite</Text>
                </View>
                <View style={styles.promotionStat}>
                  <Text style={[
                    styles.promotionStatValue,
                    { color: getStatusColor(promotion) }
                  ]}>
                    {getStatusText(promotion)}
                  </Text>
                  <Text style={styles.promotionStatLabel}>Estado</Text>
                </View>
              </View>

              <View style={styles.promotionDates}>
                <View style={styles.dateInfo}>
                  <Calendar size={14} color="#6b7280" />
                  <Text style={styles.dateText}>
                    {formatDate(promotion.validFrom)} - {formatDate(promotion.validUntil)}
                  </Text>
                </View>
                {promotion.minPurchase && (
                  <Text style={styles.minPurchase}>
                    Compra mínima: {formatCurrency(promotion.minPurchase)}
                  </Text>
                )}
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Create Promotion Modal */}
      <Modal
        visible={showCreateModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowCreateModal(false)}>
              <Text style={styles.modalCancel}>Cancelar</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Nueva Promoción</Text>
            <TouchableOpacity>
              <Text style={styles.modalSave}>Guardar</Text>
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalContent}>
            <Text style={styles.modalText}>
              Funcionalidad de creación de promociones en desarrollo...
            </Text>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Promotion Details Modal */}
      <Modal
        visible={selectedPromotion !== null}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setSelectedPromotion(null)}>
              <Text style={styles.modalCancel}>Cerrar</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Detalles de Promoción</Text>
            <TouchableOpacity>
              <Edit size={20} color="#2563eb" />
            </TouchableOpacity>
          </View>
          {selectedPromotion && (
            <ScrollView style={styles.modalContent}>
              <View style={styles.detailSection}>
                <Text style={styles.detailTitle}>Información General</Text>
                <Text style={styles.detailLabel}>Título</Text>
                <Text style={styles.detailValue}>{selectedPromotion.title}</Text>
                <Text style={styles.detailLabel}>Descripción</Text>
                <Text style={styles.detailValue}>{selectedPromotion.description}</Text>
                <Text style={styles.detailLabel}>Tipo</Text>
                <Text style={styles.detailValue}>{getTypeLabel(selectedPromotion.type)}</Text>
              </View>

              <View style={styles.detailSection}>
                <Text style={styles.detailTitle}>Configuración</Text>
                <Text style={styles.detailLabel}>Valor</Text>
                <Text style={styles.detailValue}>
                  {selectedPromotion.type === 'discount' || selectedPromotion.type === 'bogo' 
                    ? `${selectedPromotion.value}%` 
                    : selectedPromotion.value.toString()}
                </Text>
                {selectedPromotion.code && (
                  <>
                    <Text style={styles.detailLabel}>Código</Text>
                    <Text style={styles.detailValue}>{selectedPromotion.code}</Text>
                  </>
                )}
                {selectedPromotion.minPurchase && (
                  <>
                    <Text style={styles.detailLabel}>Compra Mínima</Text>
                    <Text style={styles.detailValue}>{formatCurrency(selectedPromotion.minPurchase)}</Text>
                  </>
                )}
              </View>

              <View style={styles.detailSection}>
                <Text style={styles.detailTitle}>Estadísticas</Text>
                <Text style={styles.detailLabel}>Veces Usada</Text>
                <Text style={styles.detailValue}>{selectedPromotion.usedCount}</Text>
                {selectedPromotion.usageLimit && (
                  <>
                    <Text style={styles.detailLabel}>Límite de Uso</Text>
                    <Text style={styles.detailValue}>{selectedPromotion.usageLimit}</Text>
                  </>
                )}
                <Text style={styles.detailLabel}>Estado</Text>
                <Text style={[
                  styles.detailValue,
                  { color: getStatusColor(selectedPromotion) }
                ]}>
                  {getStatusText(selectedPromotion)}
                </Text>
              </View>
            </ScrollView>
          )}
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
    fontSize: 20,
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
    marginRight: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  addButton: {
    backgroundColor: '#2563eb',
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
  promotionsList: {
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
  promotionCard: {
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
  promotionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  promotionInfo: {
    flexDirection: 'row',
    flex: 1,
  },
  promotionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  promotionDetails: {
    flex: 1,
  },
  promotionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  promotionDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  promotionMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typeBadge: {
    backgroundColor: '#eff6ff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  typeText: {
    color: '#2563eb',
    fontSize: 12,
    fontWeight: '500',
  },
  codeBadge: {
    backgroundColor: '#f0fdf4',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  codeText: {
    color: '#16a34a',
    fontSize: 12,
    fontWeight: '500',
  },
  promotionActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: 8,
    marginLeft: 4,
  },
  promotionStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  promotionStat: {
    alignItems: 'center',
  },
  promotionStatValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  promotionStatLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  promotionDates: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    marginLeft: 6,
    fontSize: 12,
    color: '#6b7280',
  },
  minPurchase: {
    fontSize: 12,
    color: '#6b7280',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    backgroundColor: '#ffffff',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  modalCancel: {
    fontSize: 16,
    color: '#6b7280',
  },
  modalSave: {
    fontSize: 16,
    color: '#2563eb',
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  modalText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 50,
  },
  detailSection: {
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
  detailTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
  },
  detailLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
    marginTop: 12,
  },
  detailValue: {
    fontSize: 16,
    color: '#1f2937',
    fontWeight: '500',
  },
});