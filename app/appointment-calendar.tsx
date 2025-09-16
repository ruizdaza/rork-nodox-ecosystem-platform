import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, useRouter } from "expo-router";
import {
  ArrowLeft,
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  MapPin,
  CheckCircle,
  XCircle,
  RotateCcw,
  Plus,
} from "lucide-react-native";
import { useNodoX } from "@/hooks/use-nodox-store";

type CalendarView = "day" | "week" | "month";

export default function AppointmentCalendarScreen() {
  const router = useRouter();
  const { services, appointments, updateAppointmentStatus } = useNodoX();
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [calendarView, setCalendarView] = useState<CalendarView>("day");

  const timeSlots = [
    "08:00", "08:30", "09:00", "09:30", "10:00", "10:30",
    "11:00", "11:30", "12:00", "12:30", "13:00", "13:30",
    "14:00", "14:30", "15:00", "15:30", "16:00", "16:30",
    "17:00", "17:30", "18:00", "18:30", "19:00", "19:30"
  ];

  const getAppointmentsForDate = (date: string) => {
    return appointments.filter(apt => apt.date === date);
  };

  const getAppointmentForTimeSlot = (time: string) => {
    return appointments.find(apt => apt.date === selectedDate && apt.time === time);
  };

  const handleAppointmentAction = (appointmentId: string, action: "confirm" | "cancel" | "reschedule") => {
    switch (action) {
      case "confirm":
        updateAppointmentStatus(appointmentId, "confirmed");
        break;
      case "cancel":
        updateAppointmentStatus(appointmentId, "cancelled");
        break;
      case "reschedule":
        console.log("Reschedule appointment:", appointmentId);
        break;
    }
  };

  const renderTimeSlot = ({ item: time }: { item: string }) => {
    const appointment = getAppointmentForTimeSlot(time);
    const service = appointment ? services.find(s => s.id === appointment.serviceId) : null;
    const staff = service?.staff.find(s => s.id === appointment?.staffId);

    return (
      <View style={styles.timeSlotContainer}>
        <View style={styles.timeLabel}>
          <Text style={styles.timeText}>{time}</Text>
        </View>
        
        <View style={styles.appointmentSlot}>
          {appointment ? (
            <View style={[
              styles.appointmentBlock,
              {
                backgroundColor: appointment.status === 'confirmed' ? '#dcfce7' : 
                                appointment.status === 'cancelled' ? '#fee2e2' : '#fef3c7'
              }
            ]}>
              <View style={styles.appointmentHeader}>
                <Text style={styles.appointmentClientName}>{appointment.clientName}</Text>
                <View style={[
                  styles.appointmentStatusDot,
                  {
                    backgroundColor: appointment.status === 'confirmed' ? '#059669' : 
                                   appointment.status === 'cancelled' ? '#dc2626' : '#d97706'
                  }
                ]} />
              </View>
              
              <Text style={styles.appointmentServiceName}>{service?.name}</Text>
              <Text style={styles.appointmentStaffName}>Con: {staff?.name}</Text>
              
              <View style={styles.appointmentActions}>
                {appointment.status === 'pending' && (
                  <>
                    <TouchableOpacity 
                      style={styles.confirmActionButton}
                      onPress={() => handleAppointmentAction(appointment.id, "confirm")}
                    >
                      <CheckCircle color="#059669" size={16} />
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={styles.cancelActionButton}
                      onPress={() => handleAppointmentAction(appointment.id, "cancel")}
                    >
                      <XCircle color="#dc2626" size={16} />
                    </TouchableOpacity>
                  </>
                )}
                <TouchableOpacity 
                  style={styles.rescheduleActionButton}
                  onPress={() => handleAppointmentAction(appointment.id, "reschedule")}
                >
                  <RotateCcw color="#ea580c" size={16} />
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <TouchableOpacity style={styles.emptySlot}>
              <Plus color="#94a3b8" size={20} />
              <Text style={styles.emptySlotText}>Disponible</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  const renderDayView = () => (
    <View style={styles.dayViewContainer}>
      <View style={styles.dateHeader}>
        <TouchableOpacity 
          style={styles.dateNavButton}
          onPress={() => {
            const prevDate = new Date(selectedDate);
            prevDate.setDate(prevDate.getDate() - 1);
            setSelectedDate(prevDate.toISOString().split('T')[0]);
          }}
        >
          <Text style={styles.dateNavText}>‹</Text>
        </TouchableOpacity>
        
        <View style={styles.selectedDateContainer}>
          <Text style={styles.selectedDateText}>
            {new Date(selectedDate).toLocaleDateString('es-ES', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </Text>
          <Text style={styles.appointmentCount}>
            {getAppointmentsForDate(selectedDate).length} citas programadas
          </Text>
        </View>
        
        <TouchableOpacity 
          style={styles.dateNavButton}
          onPress={() => {
            const nextDate = new Date(selectedDate);
            nextDate.setDate(nextDate.getDate() + 1);
            setSelectedDate(nextDate.toISOString().split('T')[0]);
          }}
        >
          <Text style={styles.dateNavText}>›</Text>
        </TouchableOpacity>
      </View>
      
      <FlatList
        data={timeSlots}
        renderItem={renderTimeSlot}
        keyExtractor={(item) => item}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.timeSlotsContainer}
      />
    </View>
  );

  const renderAppointmentSummary = () => {
    const todayAppointments = getAppointmentsForDate(selectedDate);
    const confirmedCount = todayAppointments.filter(apt => apt.status === 'confirmed').length;
    const pendingCount = todayAppointments.filter(apt => apt.status === 'pending').length;
    const cancelledCount = todayAppointments.filter(apt => apt.status === 'cancelled').length;

    return (
      <View style={styles.summaryContainer}>
        <Text style={styles.summaryTitle}>Resumen del día</Text>
        <View style={styles.summaryStats}>
          <View style={styles.summaryStatItem}>
            <Text style={styles.summaryStatNumber}>{confirmedCount}</Text>
            <Text style={styles.summaryStatLabel}>Confirmadas</Text>
          </View>
          <View style={styles.summaryStatItem}>
            <Text style={[styles.summaryStatNumber, { color: '#d97706' }]}>{pendingCount}</Text>
            <Text style={styles.summaryStatLabel}>Pendientes</Text>
          </View>
          <View style={styles.summaryStatItem}>
            <Text style={[styles.summaryStatNumber, { color: '#dc2626' }]}>{cancelledCount}</Text>
            <Text style={styles.summaryStatLabel}>Canceladas</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen 
        options={{
          headerShown: true,
          title: "Calendario de Citas",
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <ArrowLeft color="#1e293b" size={24} />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity style={styles.addAppointmentButton}>
              <Plus color="#2563eb" size={20} />
              <Text style={styles.addAppointmentText}>Nueva Cita</Text>
            </TouchableOpacity>
          ),
        }} 
      />
      
      <View style={styles.content}>
        {/* View Toggle */}
        <View style={styles.viewToggle}>
          <TouchableOpacity 
            style={[styles.viewToggleButton, calendarView === 'day' && styles.viewToggleButtonActive]}
            onPress={() => setCalendarView('day')}
          >
            <Text style={[styles.viewToggleText, calendarView === 'day' && styles.viewToggleTextActive]}>Día</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.viewToggleButton, calendarView === 'week' && styles.viewToggleButtonActive]}
            onPress={() => setCalendarView('week')}
          >
            <Text style={[styles.viewToggleText, calendarView === 'week' && styles.viewToggleTextActive]}>Semana</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.viewToggleButton, calendarView === 'month' && styles.viewToggleButtonActive]}
            onPress={() => setCalendarView('month')}
          >
            <Text style={[styles.viewToggleText, calendarView === 'month' && styles.viewToggleTextActive]}>Mes</Text>
          </TouchableOpacity>
        </View>

        {renderAppointmentSummary()}
        
        {calendarView === 'day' && renderDayView()}
        
        {(calendarView === 'week' || calendarView === 'month') && (
          <View style={styles.comingSoon}>
            <Calendar color="#64748b" size={48} />
            <Text style={styles.comingSoonText}>Vista de {calendarView === 'week' ? 'Semana' : 'Mes'}</Text>
            <Text style={styles.comingSoonSubtext}>Próximamente disponible</Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  content: {
    flex: 1,
    padding: 20,
  },
  addAppointmentButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: "#eff6ff",
  },
  addAppointmentText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#2563eb",
  },
  viewToggle: {
    flexDirection: "row",
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  viewToggleButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  viewToggleButtonActive: {
    backgroundColor: "#2563eb",
  },
  viewToggleText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#64748b",
  },
  viewToggleTextActive: {
    color: "#ffffff",
  },
  summaryContainer: {
    backgroundColor: "#ffffff",
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 16,
  },
  summaryStats: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  summaryStatItem: {
    alignItems: "center",
  },
  summaryStatNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#059669",
    marginBottom: 4,
  },
  summaryStatLabel: {
    fontSize: 12,
    color: "#64748b",
  },
  dayViewContainer: {
    flex: 1,
  },
  dateHeader: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  dateNavButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f1f5f9",
    justifyContent: "center",
    alignItems: "center",
  },
  dateNavText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#475569",
  },
  selectedDateContainer: {
    flex: 1,
    alignItems: "center",
  },
  selectedDateText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
    textTransform: "capitalize",
  },
  appointmentCount: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 2,
  },
  timeSlotsContainer: {
    paddingBottom: 20,
  },
  timeSlotContainer: {
    flexDirection: "row",
    marginBottom: 8,
    alignItems: "stretch",
  },
  timeLabel: {
    width: 60,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  timeText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#64748b",
  },
  appointmentSlot: {
    flex: 1,
    minHeight: 60,
  },
  appointmentBlock: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#2563eb",
  },
  appointmentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  appointmentClientName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1e293b",
    flex: 1,
  },
  appointmentStatusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  appointmentServiceName: {
    fontSize: 12,
    color: "#64748b",
    marginBottom: 2,
  },
  appointmentStaffName: {
    fontSize: 12,
    color: "#64748b",
    marginBottom: 8,
  },
  appointmentActions: {
    flexDirection: "row",
    gap: 8,
  },
  confirmActionButton: {
    padding: 4,
    borderRadius: 4,
    backgroundColor: "#dcfce7",
  },
  cancelActionButton: {
    padding: 4,
    borderRadius: 4,
    backgroundColor: "#fee2e2",
  },
  rescheduleActionButton: {
    padding: 4,
    borderRadius: 4,
    backgroundColor: "#fed7aa",
  },
  emptySlot: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderStyle: "dashed",
    minHeight: 60,
  },
  emptySlotText: {
    fontSize: 12,
    color: "#94a3b8",
    marginTop: 4,
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