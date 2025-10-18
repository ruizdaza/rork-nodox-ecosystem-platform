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
import { Stack, useRouter } from 'expo-router';
import {
  LayoutGrid,
  Users,
  Package,
  ShoppingCart,
  BarChart3,
  Calendar,
  CreditCard,
  FileText,
  Settings,
  Store,
  Tag,
  MessageCircle,
  Truck,
  Receipt,
  Plug,
  Shield,
  Wallet,
  Building2,
  TrendingUp,
  Award,
  Clock,
  Star,
  ArrowLeft,
  Search,
  Bell,
} from 'lucide-react-native';
import NodoXLogo from '@/components/NodoXLogo';

const { width } = Dimensions.get('window');

type ModuleCategory = 'all' | 'sales' | 'management' | 'finance' | 'admin';

interface Module {
  id: string;
  name: string;
  description: string;
  icon: any;
  color: string;
  route: string;
  category: ModuleCategory[];
  badges?: {
    text: string;
    color: string;
  }[];
}

export default function NavigationHub() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<ModuleCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const modules: Module[] = [
    {
      id: 'ally-dashboard',
      name: 'Panel de Aliado',
      description: 'Dashboard principal del negocio con todas las funciones',
      icon: LayoutGrid,
      color: '#2563eb',
      route: '/ally-dashboard',
      category: ['all', 'management'],
      badges: [{ text: 'Principal', color: '#2563eb' }],
    },
    {
      id: 'business-dashboard',
      name: 'Dashboard Empresarial',
      description: 'Resumen ejecutivo y métricas del negocio',
      icon: TrendingUp,
      color: '#7c3aed',
      route: '/business-dashboard',
      category: ['all', 'management'],
      badges: [{ text: 'CRM', color: '#0891b2' }, { text: 'Soporte', color: '#f59e0b' }],
    },
    {
      id: 'crm',
      name: 'CRM - Clientes',
      description: 'Gestión completa de clientes y relaciones',
      icon: Users,
      color: '#0891b2',
      route: '/crm-dashboard',
      category: ['all', 'sales', 'management'],
    },
    {
      id: 'erp',
      name: 'ERP - Inventario',
      description: 'Sistema de inventario y proveedores',
      icon: Package,
      color: '#059669',
      route: '/erp-inventory',
      category: ['all', 'management'],
      badges: [{ text: 'Proveedores', color: '#7c3aed' }],
    },
    {
      id: 'pos',
      name: 'Terminal POS',
      description: 'Punto de venta y procesamiento de pagos',
      icon: CreditCard,
      color: '#0891b2',
      route: '/ally-dashboard',
      category: ['all', 'sales'],
    },
    {
      id: 'hr',
      name: 'Gestión de Personal',
      description: 'RH, nómina, evaluaciones y asistencia',
      icon: Users,
      color: '#ea580c',
      route: '/hr-management',
      category: ['all', 'management'],
      badges: [{ text: 'Completo', color: '#059669' }],
    },
    {
      id: 'appointments',
      name: 'Citas y Calendario',
      description: 'Sistema de agendamiento de citas',
      icon: Calendar,
      color: '#dc2626',
      route: '/appointment-calendar',
      category: ['all', 'sales'],
    },
    {
      id: 'products',
      name: 'Productos y Servicios',
      description: 'Catálogo de productos y servicios',
      icon: Package,
      color: '#059669',
      route: '/ally-dashboard',
      category: ['all', 'sales'],
    },
    {
      id: 'promotions',
      name: 'Promociones',
      description: 'Gestión de campañas y ofertas',
      icon: Tag,
      color: '#10b981',
      route: '/promotions-manager',
      category: ['all', 'sales'],
    },
    {
      id: 'analytics',
      name: 'Analíticas Avanzadas',
      description: 'Reportes, métricas y BI',
      icon: BarChart3,
      color: '#7c2d12',
      route: '/analytics',
      category: ['all', 'management'],
      badges: [{ text: 'BI', color: '#8b5cf6' }],
    },
    {
      id: 'invoicing',
      name: 'Facturación Electrónica',
      description: 'Sistema de facturación válido fiscalmente',
      icon: Receipt,
      color: '#059669',
      route: '/electronic-invoicing',
      category: ['all', 'finance'],
      badges: [{ text: 'AFIP', color: '#059669' }],
    },
    {
      id: 'financial',
      name: 'Dashboard Financiero',
      description: 'Análisis financiero y transacciones',
      icon: FileText,
      color: '#2563eb',
      route: '/financial-dashboard',
      category: ['all', 'finance'],
    },
    {
      id: 'wallet-admin',
      name: 'Admin Wallet',
      description: 'Administración de wallets y transacciones',
      icon: Wallet,
      color: '#059669',
      route: '/wallet-admin',
      category: ['all', 'admin', 'finance'],
    },
    {
      id: 'support',
      name: 'Centro de Soporte',
      description: 'Tickets de soporte y atención al cliente',
      icon: MessageCircle,
      color: '#f59e0b',
      route: '/support-center',
      category: ['all', 'management'],
    },
    {
      id: 'integrations',
      name: 'Integraciones',
      description: 'Conexiones con herramientas externas',
      icon: Plug,
      color: '#2563eb',
      route: '/integrations',
      category: ['all', 'admin'],
    },
    {
      id: 'admin-panel',
      name: 'Panel de Administración',
      description: 'Gestión de reportes, moderación y usuarios',
      icon: Shield,
      color: '#6b7280',
      route: '/admin-panel',
      category: ['all', 'admin'],
      badges: [{ text: 'Admin', color: '#dc2626' }],
    },
    {
      id: 'moderation',
      name: 'Moderación',
      description: 'Configuración de moderación automática',
      icon: Shield,
      color: '#dc2626',
      route: '/admin-moderation',
      category: ['all', 'admin'],
    },
    {
      id: 'referrals',
      name: 'Referidos',
      description: 'Gestión de programa de referidos',
      icon: Users,
      color: '#8b5cf6',
      route: '/referral-dashboard',
      category: ['all', 'sales'],
    },
  ];

  const categories = [
    { id: 'all', label: 'Todos', icon: LayoutGrid },
    { id: 'sales', label: 'Ventas', icon: ShoppingCart },
    { id: 'management', label: 'Gestión', icon: Building2 },
    { id: 'finance', label: 'Finanzas', icon: CreditCard },
    { id: 'admin', label: 'Admin', icon: Settings },
  ];

  const filteredModules = modules.filter((module) => {
    const matchesCategory =
      selectedCategory === 'all' || module.category.includes(selectedCategory);
    const matchesSearch =
      searchQuery === '' ||
      module.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      module.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Central de Navegación',
          headerStyle: { backgroundColor: '#ffffff' },
          headerShadowVisible: true,
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
              <ArrowLeft color="#1e293b" size={24} />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <View style={styles.headerRight}>
              <TouchableOpacity style={styles.headerButton}>
                <Bell color="#1e293b" size={24} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.headerButton}
                onPress={() => router.push('/settings')}
              >
                <Settings color="#1e293b" size={24} />
              </TouchableOpacity>
            </View>
          ),
        }}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <NodoXLogo size="medium" />
          <Text style={styles.headerTitle}>Central de Navegación</Text>
          <Text style={styles.headerSubtitle}>
            Accede a todos los módulos de tu negocio desde un solo lugar
          </Text>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Search size={20} color="#64748b" />
            <Text
              style={styles.searchInput}
              onPress={() => console.log('Buscar módulos')}
            >
              {searchQuery || 'Buscar módulos...'}
            </Text>
          </View>
        </View>

        {/* Categories */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesContainer}
        >
          <View style={styles.categoriesRow}>
            {categories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryChip,
                  selectedCategory === category.id && styles.categoryChipActive,
                ]}
                onPress={() => setSelectedCategory(category.id as ModuleCategory)}
              >
                <category.icon
                  size={16}
                  color={selectedCategory === category.id ? '#ffffff' : '#64748b'}
                />
                <Text
                  style={[
                    styles.categoryChipText,
                    selectedCategory === category.id && styles.categoryChipTextActive,
                  ]}
                >
                  {category.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        {/* Modules Grid */}
        <View style={styles.modulesGrid}>
          {filteredModules.map((module) => (
            <TouchableOpacity
              key={module.id}
              style={styles.moduleCard}
              onPress={() => router.push(module.route as any)}
            >
              <View style={[styles.moduleIcon, { backgroundColor: `${module.color}20` }]}>
                <module.icon color={module.color} size={28} />
              </View>
              <View style={styles.moduleInfo}>
                <Text style={styles.moduleName}>{module.name}</Text>
                <Text style={styles.moduleDescription} numberOfLines={2}>
                  {module.description}
                </Text>
                {module.badges && module.badges.length > 0 && (
                  <View style={styles.moduleBadges}>
                    {module.badges.map((badge, idx) => (
                      <View
                        key={idx}
                        style={[
                          styles.moduleBadge,
                          { backgroundColor: `${badge.color}20` },
                        ]}
                      >
                        <Text style={[styles.moduleBadgeText, { color: badge.color }]}>
                          {badge.text}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Quick Stats */}
        <View style={styles.statsSection}>
          <Text style={styles.statsSectionTitle}>Sistema NodoX</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Package color="#059669" size={24} />
              <Text style={styles.statValue}>{modules.length}</Text>
              <Text style={styles.statLabel}>Módulos Totales</Text>
            </View>
            <View style={styles.statCard}>
              <Star color="#f59e0b" size={24} />
              <Text style={styles.statValue}>100%</Text>
              <Text style={styles.statLabel}>Integración</Text>
            </View>
            <View style={styles.statCard}>
              <TrendingUp color="#2563eb" size={24} />
              <Text style={styles.statValue}>Activo</Text>
              <Text style={styles.statLabel}>Estado</Text>
            </View>
            <View style={styles.statCard}>
              <Award color="#8b5cf6" size={24} />
              <Text style={styles.statValue}>Premium</Text>
              <Text style={styles.statLabel}>Nivel</Text>
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
  content: {
    flex: 1,
  },
  headerButton: {
    padding: 8,
  },
  headerRight: {
    flexDirection: 'row',
    gap: 4,
  },
  header: {
    padding: 24,
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    color: '#1e293b',
    marginTop: 16,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    maxWidth: 300,
  },
  searchContainer: {
    padding: 16,
    backgroundColor: '#ffffff',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#94a3b8',
  },
  categoriesContainer: {
    backgroundColor: '#ffffff',
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  categoriesRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 6,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  categoryChipActive: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  categoryChipText: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: '#64748b',
  },
  categoryChipTextActive: {
    color: '#ffffff',
  },
  modulesGrid: {
    padding: 16,
    gap: 12,
  },
  moduleCard: {
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    gap: 16,
  },
  moduleIcon: {
    width: 56,
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  moduleInfo: {
    flex: 1,
  },
  moduleName: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#1e293b',
    marginBottom: 4,
  },
  moduleDescription: {
    fontSize: 13,
    color: '#64748b',
    lineHeight: 18,
    marginBottom: 8,
  },
  moduleBadges: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
  },
  moduleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  moduleBadgeText: {
    fontSize: 11,
    fontWeight: '600' as const,
  },
  statsSection: {
    padding: 16,
    backgroundColor: '#ffffff',
    marginTop: 16,
  },
  statsSectionTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: '#1e293b',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#f8fafc',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    color: '#1e293b',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    color: '#64748b',
    textAlign: 'center',
  },
});
