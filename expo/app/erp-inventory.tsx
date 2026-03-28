import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  TextInput,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import {
  ArrowLeft,
  Package,
  Truck,
  ShoppingCart,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Plus,
  Search,
  Filter,
  Edit3,
  Eye,
  Trash2,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  BarChart3,
  Warehouse as WarehouseIcon,
  Box,
  Inbox,
  PackageCheck,
  PackageX,
  Users,
  Phone,
  Mail,
  MapPin,
  Star,
  Calendar,
} from 'lucide-react-native';
import { useInventory } from '@/hooks/use-inventory';

const { width } = Dimensions.get('window');

type ERPView = 'dashboard' | 'inventory' | 'suppliers' | 'purchase_orders' | 'movements' | 'alerts';

export default function ERPInventory() {
  const router = useRouter();
  const {
    items,
    suppliers,
    purchaseOrders,
    movements,
    alerts,
    inventoryStats,
    searchQuery,
    setSearchQuery,
    addSupplier,
    createPurchaseOrder,
    updatePurchaseOrder,
    receivePurchaseOrder,
    getSupplierPerformance
  } = useInventory();

  const [currentView, setCurrentView] = useState<ERPView>('dashboard');
  const [showAddSupplierModal, setShowAddSupplierModal] = useState<boolean>(false);
  const [showCreatePOModal, setShowCreatePOModal] = useState<boolean>(false);
  const [selectedSupplier, setSelectedSupplier] = useState<string>('');
  const [newSupplierName, setNewSupplierName] = useState<string>('');
  const [newSupplierContact, setNewSupplierContact] = useState<string>('');
  const [newSupplierEmail, setNewSupplierEmail] = useState<string>('');
  const [newSupplierPhone, setNewSupplierPhone] = useState<string>('');

  const menuItems = [
    { id: 'dashboard', icon: BarChart3, title: 'Dashboard', color: '#2563eb' },
    { id: 'inventory', icon: Package, title: 'Inventario', color: '#059669' },
    { id: 'suppliers', icon: Truck, title: 'Proveedores', color: '#7c3aed' },
    { id: 'purchase_orders', icon: ShoppingCart, title: 'Órdenes de Compra', color: '#ea580c' },
    { id: 'movements', icon: TrendingUp, title: 'Movimientos', color: '#0891b2' },
    { id: 'alerts', icon: AlertTriangle, title: 'Alertas', color: '#dc2626' },
  ];

  const renderDashboard = () => (
    <ScrollView style={styles.content}>
      <View style={styles.headerSection}>
        <Text style={styles.pageTitle}>ERP - Sistema de Inventario</Text>
        <Text style={styles.pageSubtitle}>Gestión completa de inventario y proveedores</Text>
      </View>

      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <View style={styles.statIcon}>
            <Package color="#059669" size={24} />
          </View>
          <Text style={styles.statValue}>{inventoryStats.totalItems}</Text>
          <Text style={styles.statLabel}>Productos en inventario</Text>
        </View>
        <View style={styles.statCard}>
          <View style={styles.statIcon}>
            <DollarSign color="#2563eb" size={24} />
          </View>
          <Text style={styles.statValue}>${(inventoryStats.totalValue / 1000000).toFixed(1)}M</Text>
          <Text style={styles.statLabel}>Valor total inventario</Text>
        </View>
        <View style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: '#fef2f2' }]}>
            <AlertTriangle color="#dc2626" size={24} />
          </View>
          <Text style={[styles.statValue, { color: '#dc2626' }]}>{inventoryStats.lowStockItems}</Text>
          <Text style={styles.statLabel}>Stock bajo</Text>
        </View>
        <View style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: '#fef2f2' }]}>
            <PackageX color="#dc2626" size={24} />
          </View>
          <Text style={[styles.statValue, { color: '#dc2626' }]}>{inventoryStats.outOfStockItems}</Text>
          <Text style={styles.statLabel}>Sin stock</Text>
        </View>
      </View>

      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <View style={styles.statIcon}>
            <Truck color="#7c3aed" size={24} />
          </View>
          <Text style={styles.statValue}>{suppliers.length}</Text>
          <Text style={styles.statLabel}>Proveedores activos</Text>
        </View>
        <View style={styles.statCard}>
          <View style={styles.statIcon}>
            <ShoppingCart color="#ea580c" size={24} />
          </View>
          <Text style={styles.statValue}>{purchaseOrders.filter(po => po.status === 'ordered').length}</Text>
          <Text style={styles.statLabel}>Órdenes pendientes</Text>
        </View>
        <View style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: '#fff7ed' }]}>
            <Clock color="#ea580c" size={24} />
          </View>
          <Text style={[styles.statValue, { color: '#ea580c' }]}>{inventoryStats.reorderNeeded}</Text>
          <Text style={styles.statLabel}>Requieren reorden</Text>
        </View>
        <View style={styles.statCard}>
          <View style={styles.statIcon}>
            <TrendingUp color="#059669" size={24} />
          </View>
          <Text style={styles.statValue}>{movements.length}</Text>
          <Text style={styles.statLabel}>Movimientos hoy</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Alertas Críticas</Text>
        {alerts.slice(0, 5).map((alert) => (
          <View key={alert.id} style={styles.alertCard}>
            <View style={[
              styles.alertIcon,
              { backgroundColor: alert.severity === 'critical' ? '#fef2f2' : '#fef3c7' }
            ]}>
              {alert.alertType === 'out_of_stock' ? (
                <PackageX color="#dc2626" size={20} />
              ) : (
                <AlertTriangle color="#ea580c" size={20} />
              )}
            </View>
            <View style={styles.alertContent}>
              <Text style={styles.alertTitle}>{alert.itemName}</Text>
              <Text style={styles.alertDescription}>
                {alert.alertType === 'out_of_stock' ? 'Sin stock' : 
                 alert.alertType === 'low_stock' ? `Stock bajo (${alert.currentStock} unidades)` :
                 'Alerta de inventario'}
              </Text>
            </View>
            <View style={[
              styles.alertSeverity,
              { backgroundColor: alert.severity === 'critical' ? '#dc2626' : '#ea580c' }
            ]}>
              <Text style={styles.alertSeverityText}>
                {alert.severity === 'critical' ? 'Crítico' : 'Alto'}
              </Text>
            </View>
          </View>
        ))}
        {alerts.length === 0 && (
          <View style={styles.emptyState}>
            <CheckCircle color="#059669" size={48} />
            <Text style={styles.emptyStateText}>Sin alertas activas</Text>
            <Text style={styles.emptyStateSubtext}>Todo el inventario está en buen estado</Text>
          </View>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Órdenes de Compra Recientes</Text>
        {purchaseOrders.slice(0, 3).map((po) => (
          <View key={po.id} style={styles.poCard}>
            <View style={styles.poHeader}>
              <Text style={styles.poNumber}>{po.orderNumber}</Text>
              <View style={[
                styles.poBadge,
                {
                  backgroundColor: po.status === 'received' ? '#dcfce7' :
                                 po.status === 'ordered' ? '#dbeafe' :
                                 po.status === 'pending' ? '#fef3c7' : '#f1f5f9'
                }
              ]}>
                <Text style={[
                  styles.poBadgeText,
                  {
                    color: po.status === 'received' ? '#166534' :
                           po.status === 'ordered' ? '#1e40af' :
                           po.status === 'pending' ? '#92400e' : '#475569'
                  }
                ]}>
                  {po.status === 'received' ? 'Recibida' :
                   po.status === 'ordered' ? 'Ordenada' :
                   po.status === 'pending' ? 'Pendiente' : po.status}
                </Text>
              </View>
            </View>
            <Text style={styles.poSupplier}>{po.supplierName}</Text>
            <Text style={styles.poTotal}>${po.total.toLocaleString()}</Text>
            <Text style={styles.poItems}>{po.items.length} productos</Text>
          </View>
        ))}
      </View>

      <View style={styles.quickActionsGrid}>
        <TouchableOpacity
          style={styles.quickActionButton}
          onPress={() => setCurrentView('inventory')}
        >
          <Package color="#059669" size={24} />
          <Text style={styles.quickActionText}>Ver Inventario</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.quickActionButton}
          onPress={() => setShowCreatePOModal(true)}
        >
          <ShoppingCart color="#ea580c" size={24} />
          <Text style={styles.quickActionText}>Nueva Orden</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.quickActionButton}
          onPress={() => setCurrentView('suppliers')}
        >
          <Truck color="#7c3aed" size={24} />
          <Text style={styles.quickActionText}>Proveedores</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.quickActionButton}
          onPress={() => setCurrentView('alerts')}
        >
          <AlertTriangle color="#dc2626" size={24} />
          <Text style={styles.quickActionText}>Ver Alertas</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  const renderInventory = () => (
    <ScrollView style={styles.content}>
      <View style={styles.headerSection}>
        <Text style={styles.pageTitle}>Gestión de Inventario</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.primaryButton}>
            <Plus color="#ffffff" size={16} />
            <Text style={styles.primaryButtonText}>Agregar Producto</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.searchBar}>
        <Search color="#64748b" size={16} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar por nombre, SKU o código de barras..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#94a3b8"
        />
        <TouchableOpacity style={styles.filterButton}>
          <Filter color="#64748b" size={16} />
        </TouchableOpacity>
      </View>

      <View style={styles.inventoryList}>
        {items.map((item) => (
          <View key={item.id} style={styles.inventoryCard}>
            <View style={styles.inventoryCardHeader}>
              <View style={styles.inventoryCardLeft}>
                <View style={[
                  styles.inventoryIcon,
                  { backgroundColor: item.status === 'in_stock' ? '#dcfce7' :
                                    item.status === 'low_stock' ? '#fef3c7' : '#fef2f2' }
                ]}>
                  {item.status === 'in_stock' ? (
                    <PackageCheck color="#059669" size={20} />
                  ) : item.status === 'low_stock' ? (
                    <AlertTriangle color="#ea580c" size={20} />
                  ) : (
                    <PackageX color="#dc2626" size={20} />
                  )}
                </View>
                <View style={styles.inventoryInfo}>
                  <Text style={styles.inventoryName}>{item.productName}</Text>
                  <Text style={styles.inventorySKU}>{item.sku}</Text>
                </View>
              </View>
              <View style={[
                styles.statusBadge,
                {
                  backgroundColor: item.status === 'in_stock' ? '#dcfce7' :
                                 item.status === 'low_stock' ? '#fef3c7' : '#fef2f2'
                }
              ]}>
                <Text style={[
                  styles.statusBadgeText,
                  {
                    color: item.status === 'in_stock' ? '#166534' :
                           item.status === 'low_stock' ? '#92400e' : '#991b1b'
                  }
                ]}>
                  {item.status === 'in_stock' ? 'En Stock' :
                   item.status === 'low_stock' ? 'Bajo' : 'Agotado'}
                </Text>
              </View>
            </View>
            <View style={styles.inventoryDetails}>
              <View style={styles.inventoryDetailItem}>
                <Box color="#64748b" size={14} />
                <Text style={styles.inventoryDetailText}>Stock: {item.currentStock}</Text>
              </View>
              <View style={styles.inventoryDetailItem}>
                <Inbox color="#64748b" size={14} />
                <Text style={styles.inventoryDetailText}>Min: {item.minStock}</Text>
              </View>
              <View style={styles.inventoryDetailItem}>
                <DollarSign color="#64748b" size={14} />
                <Text style={styles.inventoryDetailText}>${item.costPrice.toLocaleString()}</Text>
              </View>
              <View style={styles.inventoryDetailItem}>
                <MapPin color="#64748b" size={14} />
                <Text style={styles.inventoryDetailText}>{item.location}</Text>
              </View>
            </View>
            <View style={styles.inventoryActions}>
              <TouchableOpacity style={styles.iconButton}>
                <Eye color="#2563eb" size={16} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconButton}>
                <Edit3 color="#059669" size={16} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconButton}>
                <Trash2 color="#dc2626" size={16} />
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );

  const renderSuppliers = () => (
    <ScrollView style={styles.content}>
      <View style={styles.headerSection}>
        <Text style={styles.pageTitle}>Gestión de Proveedores</Text>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => setShowAddSupplierModal(true)}
        >
          <Plus color="#ffffff" size={16} />
          <Text style={styles.primaryButtonText}>Nuevo Proveedor</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.suppliersList}>
        {suppliers.map((supplier) => {
          const performance = getSupplierPerformance(supplier.id);
          return (
            <View key={supplier.id} style={styles.supplierCard}>
              <View style={styles.supplierHeader}>
                <View style={styles.supplierIcon}>
                  <Truck color="#7c3aed" size={24} />
                </View>
                <View style={styles.supplierInfo}>
                  <Text style={styles.supplierName}>{supplier.name}</Text>
                  <View style={styles.supplierRating}>
                    <Star color="#f59e0b" size={14} fill="#f59e0b" />
                    <Text style={styles.ratingText}>{supplier.rating.toFixed(1)}</Text>
                  </View>
                </View>
                <View style={[
                  styles.statusBadge,
                  { backgroundColor: supplier.status === 'active' ? '#dcfce7' : '#f1f5f9' }
                ]}>
                  <Text style={[
                    styles.statusBadgeText,
                    { color: supplier.status === 'active' ? '#166534' : '#64748b' }
                  ]}>
                    {supplier.status === 'active' ? 'Activo' : 'Inactivo'}
                  </Text>
                </View>
              </View>
              
              <View style={styles.supplierContacts}>
                <View style={styles.contactItem}>
                  <Users color="#64748b" size={14} />
                  <Text style={styles.contactText}>{supplier.contactPerson}</Text>
                </View>
                <View style={styles.contactItem}>
                  <Phone color="#64748b" size={14} />
                  <Text style={styles.contactText}>{supplier.phone}</Text>
                </View>
                <View style={styles.contactItem}>
                  <Mail color="#64748b" size={14} />
                  <Text style={styles.contactText}>{supplier.email}</Text>
                </View>
              </View>

              {performance && (
                <View style={styles.performanceSection}>
                  <Text style={styles.performanceTitle}>Rendimiento</Text>
                  <View style={styles.performanceGrid}>
                    <View style={styles.performanceItem}>
                      <Text style={styles.performanceValue}>{performance.totalOrders}</Text>
                      <Text style={styles.performanceLabel}>Órdenes</Text>
                    </View>
                    <View style={styles.performanceItem}>
                      <Text style={styles.performanceValue}>
                        ${(performance.totalSpent / 1000000).toFixed(1)}M
                      </Text>
                      <Text style={styles.performanceLabel}>Total compras</Text>
                    </View>
                    <View style={styles.performanceItem}>
                      <Text style={styles.performanceValue}>
                        {performance.onTimeDeliveryRate.toFixed(0)}%
                      </Text>
                      <Text style={styles.performanceLabel}>A tiempo</Text>
                    </View>
                  </View>
                </View>
              )}

              <View style={styles.supplierActions}>
                <TouchableOpacity style={styles.secondaryButton}>
                  <FileText color="#2563eb" size={14} />
                  <Text style={styles.secondaryButtonText}>Ver Historial</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.secondaryButton}>
                  <ShoppingCart color="#059669" size={14} />
                  <Text style={styles.secondaryButtonText}>Nueva Orden</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })}
      </View>

      <Modal
        visible={showAddSupplierModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAddSupplierModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Nuevo Proveedor</Text>
              <TouchableOpacity onPress={() => setShowAddSupplierModal(false)}>
                <XCircle color="#64748b" size={24} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalBody}>
              <Text style={styles.inputLabel}>Nombre del Proveedor *</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej: Distribuidora XYZ"
                value={newSupplierName}
                onChangeText={setNewSupplierName}
                placeholderTextColor="#94a3b8"
              />
              
              <Text style={styles.inputLabel}>Persona de Contacto *</Text>
              <TextInput
                style={styles.input}
                placeholder="Nombre completo"
                value={newSupplierContact}
                onChangeText={setNewSupplierContact}
                placeholderTextColor="#94a3b8"
              />
              
              <Text style={styles.inputLabel}>Email *</Text>
              <TextInput
                style={styles.input}
                placeholder="contacto@proveedor.com"
                value={newSupplierEmail}
                onChangeText={setNewSupplierEmail}
                keyboardType="email-address"
                placeholderTextColor="#94a3b8"
              />
              
              <Text style={styles.inputLabel}>Teléfono *</Text>
              <TextInput
                style={styles.input}
                placeholder="+57 300 123 4567"
                value={newSupplierPhone}
                onChangeText={setNewSupplierPhone}
                keyboardType="phone-pad"
                placeholderTextColor="#94a3b8"
              />
            </ScrollView>
            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowAddSupplierModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={() => {
                  if (newSupplierName && newSupplierContact && newSupplierEmail && newSupplierPhone) {
                    addSupplier({
                      name: newSupplierName,
                      contactPerson: newSupplierContact,
                      email: newSupplierEmail,
                      phone: newSupplierPhone,
                      address: '',
                      taxId: '',
                      paymentTerms: '30 días',
                      creditLimit: 5000000,
                      rating: 0,
                      status: 'active',
                      productsSupplied: [],
                      notes: ''
                    });
                    setShowAddSupplierModal(false);
                    setNewSupplierName('');
                    setNewSupplierContact('');
                    setNewSupplierEmail('');
                    setNewSupplierPhone('');
                  }
                }}
              >
                <Text style={styles.saveButtonText}>Guardar Proveedor</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );

  const renderPurchaseOrders = () => (
    <ScrollView style={styles.content}>
      <View style={styles.headerSection}>
        <Text style={styles.pageTitle}>Órdenes de Compra</Text>
        <TouchableOpacity style={styles.primaryButton}>
          <Plus color="#ffffff" size={16} />
          <Text style={styles.primaryButtonText}>Nueva Orden</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.poList}>
        {purchaseOrders.map((po) => (
          <View key={po.id} style={styles.poDetailCard}>
            <View style={styles.poDetailHeader}>
              <View>
                <Text style={styles.poDetailNumber}>{po.orderNumber}</Text>
                <Text style={styles.poDetailSupplier}>{po.supplierName}</Text>
              </View>
              <View style={[
                styles.poBadge,
                {
                  backgroundColor: po.status === 'received' ? '#dcfce7' :
                                 po.status === 'ordered' ? '#dbeafe' :
                                 po.status === 'pending' ? '#fef3c7' : '#f1f5f9'
                }
              ]}>
                <Text style={[
                  styles.poBadgeText,
                  {
                    color: po.status === 'received' ? '#166534' :
                           po.status === 'ordered' ? '#1e40af' :
                           po.status === 'pending' ? '#92400e' : '#475569'
                  }
                ]}>
                  {po.status === 'received' ? 'Recibida' :
                   po.status === 'ordered' ? 'Ordenada' :
                   po.status === 'pending' ? 'Pendiente' : po.status}
                </Text>
              </View>
            </View>

            <View style={styles.poItems}>
              {po.items.map((item) => (
                <View key={item.id} style={styles.poItemRow}>
                  <Text style={styles.poItemName}>{item.productName}</Text>
                  <Text style={styles.poItemQty}>x{item.quantity}</Text>
                  <Text style={styles.poItemPrice}>${item.total.toLocaleString()}</Text>
                </View>
              ))}
            </View>

            <View style={styles.poTotals}>
              <View style={styles.poTotalRow}>
                <Text style={styles.poTotalLabel}>Subtotal:</Text>
                <Text style={styles.poTotalValue}>${po.subtotal.toLocaleString()}</Text>
              </View>
              <View style={styles.poTotalRow}>
                <Text style={styles.poTotalLabel}>Impuestos:</Text>
                <Text style={styles.poTotalValue}>${po.tax.toLocaleString()}</Text>
              </View>
              <View style={styles.poTotalRow}>
                <Text style={styles.poTotalLabel}>Envío:</Text>
                <Text style={styles.poTotalValue}>${po.shipping.toLocaleString()}</Text>
              </View>
              <View style={[styles.poTotalRow, styles.poTotalFinal]}>
                <Text style={styles.poFinalLabel}>TOTAL:</Text>
                <Text style={styles.poFinalValue}>${po.total.toLocaleString()}</Text>
              </View>
            </View>

            {po.expectedDelivery && (
              <View style={styles.poDelivery}>
                <Calendar color="#64748b" size={14} />
                <Text style={styles.poDeliveryText}>
                  Entrega esperada: {new Date(po.expectedDelivery).toLocaleDateString()}
                </Text>
              </View>
            )}

            <View style={styles.poActions}>
              {po.status === 'ordered' && (
                <TouchableOpacity style={styles.receiveButton}>
                  <CheckCircle color="#059669" size={14} />
                  <Text style={styles.receiveButtonText}>Marcar como Recibida</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity style={styles.viewButton}>
                <Eye color="#2563eb" size={14} />
                <Text style={styles.viewButtonText}>Ver Detalles</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return renderDashboard();
      case 'inventory':
        return renderInventory();
      case 'suppliers':
        return renderSuppliers();
      case 'purchase_orders':
        return renderPurchaseOrders();
      case 'movements':
        return (
          <View style={styles.comingSoon}>
            <TrendingUp color="#64748b" size={48} />
            <Text style={styles.comingSoonText}>Movimientos de Inventario</Text>
            <Text style={styles.comingSoonSubtext}>Visualiza todo el historial de movimientos</Text>
          </View>
        );
      case 'alerts':
        return (
          <View style={styles.comingSoon}>
            <AlertTriangle color="#64748b" size={48} />
            <Text style={styles.comingSoonText}>Alertas de Inventario</Text>
            <Text style={styles.comingSoonSubtext}>Gestiona todas las alertas activas</Text>
          </View>
        );
      default:
        return renderDashboard();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'ERP - Inventario y Proveedores',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <ArrowLeft color="#1e293b" size={24} />
            </TouchableOpacity>
          ),
        }}
      />

      <View style={styles.layout}>
        <View style={styles.sidebar}>
          <ScrollView showsVerticalScrollIndicator={false}>
            {menuItems.map((item) => {
              const isActive = currentView === item.id;
              return (
                <TouchableOpacity
                  key={item.id}
                  style={[styles.menuItem, isActive && styles.menuItemActive]}
                  onPress={() => setCurrentView(item.id as ERPView)}
                >
                  <item.icon
                    color={isActive ? '#ffffff' : item.color}
                    size={20}
                  />
                  <Text style={[styles.menuItemText, isActive && styles.menuItemTextActive]}>
                    {item.title}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        <View style={styles.mainContent}>
          {renderContent()}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  layout: {
    flex: 1,
    flexDirection: 'row',
  },
  sidebar: {
    width: 240,
    backgroundColor: '#ffffff',
    borderRightWidth: 1,
    borderRightColor: '#e2e8f0',
    paddingVertical: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 8,
    borderRadius: 8,
    gap: 12,
  },
  menuItemActive: {
    backgroundColor: '#2563eb',
  },
  menuItemText: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: '#374151',
  },
  menuItemTextActive: {
    color: '#ffffff',
  },
  mainContent: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  headerSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    color: '#1e293b',
  },
  pageSubtitle: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  primaryButton: {
    backgroundColor: '#2563eb',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  primaryButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#ffffff',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    backgroundColor: '#ffffff',
    flex: 1,
    minWidth: (width - 104) / 4,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#dcfce7',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    color: '#1e293b',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: '#1e293b',
    marginBottom: 16,
  },
  alertCard: {
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  alertIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  alertContent: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#1e293b',
    marginBottom: 2,
  },
  alertDescription: {
    fontSize: 12,
    color: '#64748b',
  },
  alertSeverity: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  alertSeverityText: {
    fontSize: 10,
    fontWeight: '600' as const,
    color: '#ffffff',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#64748b',
    marginTop: 12,
    marginBottom: 4,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
  },
  poCard: {
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
  poHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  poNumber: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#1e293b',
  },
  poBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  poBadgeText: {
    fontSize: 12,
    fontWeight: '500' as const,
  },
  poSupplier: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 4,
  },
  poTotal: {
    fontSize: 16,
    fontWeight: 'bold' as const,
    color: '#059669',
    marginBottom: 2,
  },
  poItems: {
    fontSize: 12,
    color: '#94a3b8',
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 24,
  },
  quickActionButton: {
    backgroundColor: '#ffffff',
    flex: 1,
    minWidth: (width - 84) / 4,
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  quickActionText: {
    fontSize: 12,
    fontWeight: '500' as const,
    color: '#374151',
    marginTop: 8,
    textAlign: 'center',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 16,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#1e293b',
  },
  filterButton: {
    padding: 4,
  },
  inventoryList: {
    gap: 12,
  },
  inventoryCard: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  inventoryCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  inventoryCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  inventoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inventoryInfo: {
    flex: 1,
  },
  inventoryName: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#1e293b',
    marginBottom: 2,
  },
  inventorySKU: {
    fontSize: 12,
    color: '#64748b',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '500' as const,
  },
  inventoryDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 12,
  },
  inventoryDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  inventoryDetailText: {
    fontSize: 12,
    color: '#64748b',
  },
  inventoryActions: {
    flexDirection: 'row',
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 12,
  },
  iconButton: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: '#f8fafc',
  },
  suppliersList: {
    gap: 16,
  },
  supplierCard: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  supplierHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  supplierIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#ede9fe',
    justifyContent: 'center',
    alignItems: 'center',
  },
  supplierInfo: {
    flex: 1,
  },
  supplierName: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#1e293b',
    marginBottom: 4,
  },
  supplierRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '500' as const,
    color: '#64748b',
  },
  supplierContacts: {
    gap: 8,
    marginBottom: 12,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  contactText: {
    fontSize: 12,
    color: '#64748b',
  },
  performanceSection: {
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  performanceTitle: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: '#374151',
    marginBottom: 8,
  },
  performanceGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  performanceItem: {
    alignItems: 'center',
  },
  performanceValue: {
    fontSize: 14,
    fontWeight: 'bold' as const,
    color: '#1e293b',
    marginBottom: 2,
  },
  performanceLabel: {
    fontSize: 10,
    color: '#64748b',
  },
  supplierActions: {
    flexDirection: 'row',
    gap: 8,
  },
  secondaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8fafc',
    paddingVertical: 8,
    borderRadius: 6,
    gap: 4,
  },
  secondaryButtonText: {
    fontSize: 12,
    fontWeight: '500' as const,
    color: '#374151',
  },
  poList: {
    gap: 16,
  },
  poDetailCard: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  poDetailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  poDetailNumber: {
    fontSize: 16,
    fontWeight: 'bold' as const,
    color: '#1e293b',
    marginBottom: 4,
  },
  poDetailSupplier: {
    fontSize: 14,
    color: '#64748b',
  },
  poItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  poItemName: {
    flex: 1,
    fontSize: 14,
    color: '#1e293b',
  },
  poItemQty: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: '#64748b',
    marginHorizontal: 12,
  },
  poItemPrice: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#059669',
  },
  poTotals: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  poTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  poTotalLabel: {
    fontSize: 14,
    color: '#64748b',
  },
  poTotalValue: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: '#1e293b',
  },
  poTotalFinal: {
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingTop: 8,
    marginTop: 4,
  },
  poFinalLabel: {
    fontSize: 16,
    fontWeight: 'bold' as const,
    color: '#1e293b',
  },
  poFinalValue: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    color: '#059669',
  },
  poDelivery: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  poDeliveryText: {
    fontSize: 12,
    color: '#64748b',
  },
  poActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  receiveButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#dcfce7',
    paddingVertical: 10,
    borderRadius: 6,
    gap: 6,
  },
  receiveButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#059669',
  },
  viewButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#eff6ff',
    paddingVertical: 10,
    borderRadius: 6,
    gap: 6,
  },
  viewButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#2563eb',
  },
  comingSoon: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  comingSoonText: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: '#64748b',
    marginTop: 16,
    marginBottom: 8,
  },
  comingSoonSubtext: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    width: width * 0.9,
    maxWidth: 500,
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
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
    fontWeight: 'bold' as const,
    color: '#1e293b',
  },
  modalBody: {
    padding: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: '#374151',
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#1e293b',
  },
  modalFooter: {
    flexDirection: 'row',
    gap: 12,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#f1f5f9',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#64748b',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#2563eb',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#ffffff',
  },
});
