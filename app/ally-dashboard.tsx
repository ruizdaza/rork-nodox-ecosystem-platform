import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, useRouter } from "expo-router";
import {
  ArrowLeft,
  BarChart3,
  Package,
  Calendar,
  Users,
  CreditCard,
  Megaphone,
  Settings,
  Store,
  Clock,
  UserCheck,
  Stethoscope,
  Scissors,
  Sparkles,
  Heart,
  PawPrint,
} from "lucide-react-native";
import { useNodoX } from "@/hooks/use-nodox-store";
const { width } = Dimensions.get("window");

type AllyView = 
  | "overview" 
  | "products" 
  | "services" 
  | "appointments" 
  | "staff" 
  | "pos" 
  | "analytics" 
  | "marketing" 
  | "settings";

export default function AllyDashboard() {
  const router = useRouter();
  const { switchToUserView, allyMetrics, services, appointments } = useNodoX();
  const [currentView, setCurrentView] = useState<AllyView>("overview");

  const menuItems = [
    { id: "overview", icon: BarChart3, title: "Resumen", color: "#2563eb" },
    { id: "products", icon: Package, title: "Productos", color: "#059669" },
    { id: "services", icon: Stethoscope, title: "Servicios", color: "#7c3aed" },
    { id: "appointments", icon: Calendar, title: "Citas", color: "#dc2626" },
    { id: "staff", icon: Users, title: "Personal", color: "#ea580c" },
    { id: "pos", icon: CreditCard, title: "Terminal POS", color: "#0891b2" },
    { id: "analytics", icon: BarChart3, title: "Analíticas", color: "#7c2d12" },
    { id: "marketing", icon: Megaphone, title: "Marketing", color: "#be185d" },
    { id: "settings", icon: Settings, title: "Configuración", color: "#374151" },
  ];

  const serviceCategories = [
    { icon: Stethoscope, title: "Médico", color: "#dc2626" },
    { icon: Scissors, title: "Peluquería", color: "#7c3aed" },
    { icon: Sparkles, title: "Estética", color: "#ec4899" },
    { icon: Heart, title: "Spa", color: "#059669" },
    { icon: PawPrint, title: "Veterinario", color: "#ea580c" },
  ];

  const renderOverview = () => (
    <ScrollView style={styles.content}>
      {/* Business Header */}
      <View style={styles.businessHeader}>
        <View style={styles.businessInfo}>
          <Store color="#2563eb" size={24} />
          <View style={styles.businessDetails}>
            <Text style={styles.businessName}>Clínica Dental Sonrisa</Text>
            <Text style={styles.businessCategory}>Servicios Médicos</Text>
          </View>
        </View>
        <TouchableOpacity 
          style={styles.switchButton}
          onPress={switchToUserView}
        >
          <Text style={styles.switchButtonText}>Vista Cliente</Text>
        </TouchableOpacity>
      </View>

      {/* Quick Stats */}
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>${allyMetrics.monthlyRevenue.toLocaleString()}</Text>
          <Text style={styles.statLabel}>Ingresos del mes</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{appointments.length}</Text>
          <Text style={styles.statLabel}>Citas pendientes</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{allyMetrics.uniqueClients}</Text>
          <Text style={styles.statLabel}>Clientes únicos</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>${allyMetrics.averageTicket.toLocaleString()}</Text>
          <Text style={styles.statLabel}>Ticket promedio</Text>
        </View>
      </View>

      {/* Today's Appointments */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Citas de hoy</Text>
        {appointments.slice(0, 3).map((appointment) => (
          <View key={appointment.id} style={styles.appointmentCard}>
            <View style={styles.appointmentTime}>
              <Clock color="#2563eb" size={16} />
              <Text style={styles.timeText}>{appointment.time}</Text>
            </View>
            <View style={styles.appointmentInfo}>
              <Text style={styles.clientName}>{appointment.clientName}</Text>
              <Text style={styles.serviceNameInCard}>
                {services.find(s => s.id === appointment.serviceId)?.name}
              </Text>
            </View>
            <View style={[styles.statusBadge, 
              { backgroundColor: appointment.status === 'confirmed' ? '#dcfce7' : '#fef3c7' }
            ]}>
              <Text style={[styles.statusText, 
                { color: appointment.status === 'confirmed' ? '#166534' : '#92400e' }
              ]}>
                {appointment.status === 'confirmed' ? 'Confirmada' : 'Pendiente'}
              </Text>
            </View>
          </View>
        ))}
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Acciones rápidas</Text>
        <View style={styles.quickActions}>
          <TouchableOpacity 
            style={styles.quickAction}
            onPress={() => setCurrentView("services")}
          >
            <Stethoscope color="#7c3aed" size={24} />
            <Text style={styles.quickActionText}>Gestionar Servicios</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.quickAction}
            onPress={() => setCurrentView("appointments")}
          >
            <Calendar color="#dc2626" size={24} />
            <Text style={styles.quickActionText}>Ver Calendario</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.quickAction}
            onPress={() => setCurrentView("staff")}
          >
            <Users color="#ea580c" size={24} />
            <Text style={styles.quickActionText}>Gestionar Personal</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );

  const renderServices = () => (
    <ScrollView style={styles.content}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Gestión de Servicios</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => router.push('/add-service')}
        >
          <Text style={styles.addButtonText}>+ Agregar Servicio</Text>
        </TouchableOpacity>
      </View>

      {/* Service Categories */}
      <View style={styles.categoriesContainer}>
        <Text style={styles.subsectionTitle}>Categorías de servicios</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.categoriesRow}>
            {serviceCategories.map((category) => (
              <TouchableOpacity key={category.title} style={styles.categoryCard}>
                <View style={[styles.categoryIcon, { backgroundColor: `${category.color}20` }]}>
                  <category.icon color={category.color} size={24} />
                </View>
                <Text style={styles.categoryTitle}>{category.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Services List */}
      <View style={styles.section}>
        <Text style={styles.subsectionTitle}>Mis servicios</Text>
        {services.map((service) => (
          <View key={service.id} style={styles.serviceCard}>
            <View style={styles.serviceInfo}>
              <Text style={styles.serviceName}>{service.name}</Text>
              <Text style={styles.serviceDescription}>{service.description}</Text>
              <View style={styles.serviceDetails}>
                <Text style={styles.servicePrice}>${service.price.toLocaleString()}</Text>
                <Text style={styles.serviceDuration}>{service.duration} min</Text>
                <Text style={styles.serviceStaff}>{service.staff.length} profesionales</Text>
              </View>
            </View>
            <View style={styles.serviceActions}>
              <TouchableOpacity style={styles.editButton}>
                <Text style={styles.editButtonText}>Editar</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );

  const renderAppointments = () => (
    <ScrollView style={styles.content}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Gestión de Citas</Text>
        <TouchableOpacity 
          style={styles.calendarButton}
          onPress={() => router.push('/appointment-calendar')}
        >
          <Calendar color="#2563eb" size={16} />
          <Text style={styles.calendarButtonText}>Ver Calendario</Text>
        </TouchableOpacity>
      </View>

      {/* Appointment Filters */}
      <View style={styles.filtersContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.filtersRow}>
            <TouchableOpacity style={[styles.filterChip, styles.filterChipActive]}>
              <Text style={[styles.filterChipText, styles.filterChipTextActive]}>Todas</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.filterChip}>
              <Text style={styles.filterChipText}>Pendientes</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.filterChip}>
              <Text style={styles.filterChipText}>Confirmadas</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.filterChip}>
              <Text style={styles.filterChipText}>Completadas</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>

      {/* Appointments List */}
      <View style={styles.section}>
        {appointments.map((appointment) => {
          const service = services.find(s => s.id === appointment.serviceId);
          const staff = service?.staff.find(s => s.id === appointment.staffId);
          
          return (
            <View key={appointment.id} style={styles.appointmentDetailCard}>
              <View style={styles.appointmentHeader}>
                <View style={styles.appointmentDateTime}>
                  <Text style={styles.appointmentDate}>{appointment.date}</Text>
                  <Text style={styles.appointmentTime}>{appointment.time}</Text>
                </View>
                <View style={[styles.statusBadge, 
                  { backgroundColor: appointment.status === 'confirmed' ? '#dcfce7' : '#fef3c7' }
                ]}>
                  <Text style={[styles.statusText, 
                    { color: appointment.status === 'confirmed' ? '#166534' : '#92400e' }
                  ]}>
                    {appointment.status === 'confirmed' ? 'Confirmada' : 'Pendiente'}
                  </Text>
                </View>
              </View>
              
              <View style={styles.appointmentBody}>
                <Text style={styles.appointmentClient}>{appointment.clientName}</Text>
                <Text style={styles.appointmentService}>{service?.name}</Text>
                <Text style={styles.appointmentStaff}>Con: {staff?.name}</Text>
                {appointment.notes && (
                  <Text style={styles.appointmentNotes}>Notas: {appointment.notes}</Text>
                )}
              </View>
              
              <View style={styles.appointmentActions}>
                <TouchableOpacity style={styles.confirmButton}>
                  <UserCheck color="#059669" size={16} />
                  <Text style={styles.confirmButtonText}>Confirmar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.rescheduleButton}>
                  <Clock color="#ea580c" size={16} />
                  <Text style={styles.rescheduleButtonText}>Reprogramar</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );

  const renderStaff = () => (
    <ScrollView style={styles.content}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Gestión de Personal</Text>
        <TouchableOpacity style={styles.addButton}>
          <Text style={styles.addButtonText}>+ Agregar Personal</Text>
        </TouchableOpacity>
      </View>

      {/* Staff List */}
      <View style={styles.section}>
        {services.flatMap(service => service.staff).map((staff) => (
          <View key={staff.id} style={styles.staffCard}>
            <View style={styles.staffInfo}>
              <View style={styles.staffAvatar}>
                {staff.avatar ? (
                  <Text style={styles.staffInitials}>
                    {staff.name.split(' ').map(n => n[0]).join('')}
                  </Text>
                ) : (
                  <Users color="#64748b" size={24} />
                )}
              </View>
              <View style={styles.staffDetails}>
                <Text style={styles.staffName}>{staff.name}</Text>
                <Text style={styles.staffSpecialties}>
                  {staff.specialties.join(', ')}
                </Text>
                <Text style={styles.staffSchedule}>
                  Horario: {staff.schedule.length} días configurados
                </Text>
              </View>
            </View>
            <View style={styles.staffActions}>
              <TouchableOpacity style={styles.scheduleButton}>
                <Calendar color="#2563eb" size={16} />
                <Text style={styles.scheduleButtonText}>Horario</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );

  const renderContent = () => {
    switch (currentView) {
      case "overview":
        return renderOverview();
      case "services":
        return renderServices();
      case "appointments":
        return renderAppointments();
      case "staff":
        return renderStaff();
      case "products":
        return (
          <View style={styles.comingSoon}>
            <Package color="#64748b" size={48} />
            <Text style={styles.comingSoonText}>Gestión de Productos</Text>
            <Text style={styles.comingSoonSubtext}>Próximamente disponible</Text>
          </View>
        );
      case "pos":
        return (
          <View style={styles.comingSoon}>
            <CreditCard color="#64748b" size={48} />
            <Text style={styles.comingSoonText}>Terminal POS</Text>
            <Text style={styles.comingSoonSubtext}>Próximamente disponible</Text>
          </View>
        );
      case "analytics":
        return (
          <View style={styles.comingSoon}>
            <BarChart3 color="#64748b" size={48} />
            <Text style={styles.comingSoonText}>Analíticas Avanzadas</Text>
            <Text style={styles.comingSoonSubtext}>Próximamente disponible</Text>
          </View>
        );
      case "marketing":
        return (
          <View style={styles.comingSoon}>
            <Megaphone color="#64748b" size={48} />
            <Text style={styles.comingSoonText}>Herramientas de Marketing</Text>
            <Text style={styles.comingSoonSubtext}>Próximamente disponible</Text>
          </View>
        );
      case "settings":
        return (
          <View style={styles.comingSoon}>
            <Settings color="#64748b" size={48} />
            <Text style={styles.comingSoonText}>Configuración</Text>
            <Text style={styles.comingSoonSubtext}>Próximamente disponible</Text>
          </View>
        );
      default:
        return renderOverview();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen 
        options={{
          headerShown: true,
          title: "Panel de Aliado",
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <ArrowLeft color="#1e293b" size={24} />
            </TouchableOpacity>
          ),
        }} 
      />
      
      <View style={styles.layout}>
        {/* Sidebar */}
        <View style={styles.sidebar}>
          <ScrollView showsVerticalScrollIndicator={false}>
            {menuItems.map((item) => {
              const isActive = currentView === item.id;
              return (
                <TouchableOpacity
                  key={item.id}
                  style={[styles.menuItem, isActive && styles.menuItemActive]}
                  onPress={() => setCurrentView(item.id as AllyView)}
                >
                  <item.icon 
                    color={isActive ? "#ffffff" : item.color} 
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

        {/* Main Content */}
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
    backgroundColor: "#f8fafc",
  },
  layout: {
    flex: 1,
    flexDirection: "row",
  },
  sidebar: {
    width: 240,
    backgroundColor: "#ffffff",
    borderRightWidth: 1,
    borderRightColor: "#e2e8f0",
    paddingVertical: 16,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 8,
    borderRadius: 8,
    gap: 12,
  },
  menuItemActive: {
    backgroundColor: "#2563eb",
  },
  menuItemText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
  },
  menuItemTextActive: {
    color: "#ffffff",
  },
  mainContent: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  businessHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#ffffff",
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  businessInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  businessDetails: {
    flex: 1,
  },
  businessName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1e293b",
  },
  businessCategory: {
    fontSize: 14,
    color: "#64748b",
    marginTop: 2,
  },
  switchButton: {
    backgroundColor: "#f1f5f9",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  switchButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#475569",
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    backgroundColor: "#ffffff",
    padding: 16,
    borderRadius: 12,
    flex: 1,
    minWidth: (width - 64) / 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1e293b",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#64748b",
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1e293b",
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  addButton: {
    backgroundColor: "#2563eb",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#ffffff",
  },
  appointmentCard: {
    backgroundColor: "#ffffff",
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  appointmentTime: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginRight: 16,
  },
  timeText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2563eb",
  },
  appointmentInfo: {
    flex: 1,
  },
  clientName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
  },
  serviceNameInCard: {
    fontSize: 14,
    color: "#64748b",
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "500",
  },
  quickActions: {
    flexDirection: "row",
    gap: 12,
  },
  quickAction: {
    backgroundColor: "#ffffff",
    flex: 1,
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  quickActionText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#374151",
    marginTop: 8,
    textAlign: "center",
  },
  categoriesContainer: {
    marginBottom: 24,
  },
  subsectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 12,
  },
  categoriesRow: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 4,
  },
  categoryCard: {
    alignItems: "center",
    padding: 16,
    backgroundColor: "#ffffff",
    borderRadius: 12,
    minWidth: 100,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  categoryTitle: {
    fontSize: 12,
    fontWeight: "500",
    color: "#374151",
    textAlign: "center",
  },
  serviceCard: {
    backgroundColor: "#ffffff",
    flexDirection: "row",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 4,
  },
  serviceDescription: {
    fontSize: 14,
    color: "#64748b",
    marginBottom: 8,
  },
  serviceDetails: {
    flexDirection: "row",
    gap: 16,
  },
  servicePrice: {
    fontSize: 14,
    fontWeight: "600",
    color: "#059669",
  },
  serviceDuration: {
    fontSize: 14,
    color: "#64748b",
  },
  serviceStaff: {
    fontSize: 14,
    color: "#64748b",
  },
  serviceActions: {
    justifyContent: "center",
  },
  editButton: {
    backgroundColor: "#f1f5f9",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  editButtonText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#475569",
  },
  calendarButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#eff6ff",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  calendarButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#2563eb",
  },
  filtersContainer: {
    marginBottom: 16,
  },
  filtersRow: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 4,
  },
  filterChip: {
    backgroundColor: "#f1f5f9",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  filterChipActive: {
    backgroundColor: "#2563eb",
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#475569",
  },
  filterChipTextActive: {
    color: "#ffffff",
  },
  appointmentDetailCard: {
    backgroundColor: "#ffffff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  appointmentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  appointmentDateTime: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  appointmentDate: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1e293b",
  },
  appointmentBody: {
    marginBottom: 12,
  },
  appointmentClient: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 4,
  },
  appointmentService: {
    fontSize: 14,
    color: "#64748b",
    marginBottom: 2,
  },
  appointmentStaff: {
    fontSize: 14,
    color: "#64748b",
    marginBottom: 2,
  },
  appointmentNotes: {
    fontSize: 14,
    color: "#64748b",
    fontStyle: "italic",
    marginTop: 4,
  },
  appointmentActions: {
    flexDirection: "row",
    gap: 8,
  },
  confirmButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#dcfce7",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    gap: 4,
  },
  confirmButtonText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#059669",
  },
  rescheduleButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fed7aa",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    gap: 4,
  },
  rescheduleButtonText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#ea580c",
  },
  staffCard: {
    backgroundColor: "#ffffff",
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  staffInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 12,
  },
  staffAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#f1f5f9",
    justifyContent: "center",
    alignItems: "center",
  },
  staffInitials: {
    fontSize: 16,
    fontWeight: "600",
    color: "#475569",
  },
  staffDetails: {
    flex: 1,
  },
  staffName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 2,
  },
  staffSpecialties: {
    fontSize: 14,
    color: "#64748b",
    marginBottom: 2,
  },
  staffSchedule: {
    fontSize: 12,
    color: "#94a3b8",
  },
  staffActions: {
    flexDirection: "row",
    gap: 8,
  },
  scheduleButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#eff6ff",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    gap: 4,
  },
  scheduleButtonText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#2563eb",
  },
  comingSoon: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  comingSoonText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#64748b",
    marginTop: 16,
    marginBottom: 8,
  },
  comingSoonSubtext: {
    fontSize: 14,
    color: "#94a3b8",
    textAlign: "center",
  },
});