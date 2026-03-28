import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Modal,
  TextInput,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, useRouter } from "expo-router";
import {
  ArrowLeft,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  RotateCcw,
  Plus,
  X,
} from "lucide-react-native";
import { useNodoX } from "@/hooks/use-nodox-store";

type CalendarView = "day" | "week" | "month";

export default function AppointmentCalendarScreen() {
  const router = useRouter();
  const { services, appointments, updateAppointmentStatus, addAppointment } = useNodoX();
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [calendarView, setCalendarView] = useState<CalendarView>("day");
  const [showNewAppointmentModal, setShowNewAppointmentModal] = useState<boolean>(false);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>("");
  const [newAppointment, setNewAppointment] = useState<{
    clientName: string;
    serviceId: string;
    staffId: string;
    notes: string;
  }>({
    clientName: "",
    serviceId: "",
    staffId: "",
    notes: ""
  });

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
        Alert.alert("Éxito", "Cita confirmada correctamente");
        break;
      case "cancel":
        Alert.alert(
          "Cancelar Cita",
          "¿Está seguro que desea cancelar esta cita?",
          [
            { text: "No", style: "cancel" },
            { text: "Sí, Cancelar", onPress: () => {
              updateAppointmentStatus(appointmentId, "cancelled");
              Alert.alert("Cita Cancelada", "La cita ha sido cancelada");
            }}
          ]
        );
        break;
      case "reschedule":
        Alert.alert("Reprogramar Cita", "Seleccione un nuevo horario en el calendario");
        break;
    }
  };

  const handleCreateAppointment = () => {
    if (!newAppointment.clientName || !newAppointment.serviceId || !newAppointment.staffId || !selectedTimeSlot) {
      Alert.alert("Error", "Por favor complete todos los campos requeridos");
      return;
    }

    addAppointment({
      clientName: newAppointment.clientName,
      serviceId: newAppointment.serviceId,
      staffId: newAppointment.staffId,
      date: selectedDate,
      time: selectedTimeSlot,
      status: "pending",
      notes: newAppointment.notes
    });

    Alert.alert("Éxito", "Cita creada correctamente");
    setShowNewAppointmentModal(false);
    setNewAppointment({ clientName: "", serviceId: "", staffId: "", notes: "" });
    setSelectedTimeSlot("");
  };

  const openNewAppointmentModal = (timeSlot: string) => {
    setSelectedTimeSlot(timeSlot);
    setShowNewAppointmentModal(true);
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
            <TouchableOpacity 
              style={styles.emptySlot}
              onPress={() => openNewAppointmentModal(time)}
            >
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
            <TouchableOpacity 
              style={styles.addAppointmentButton}
              onPress={() => setShowNewAppointmentModal(true)}
            >
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

      {/* New Appointment Modal */}
      <Modal
        visible={showNewAppointmentModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowNewAppointmentModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Nueva Cita</Text>
              <TouchableOpacity onPress={() => setShowNewAppointmentModal(false)}>
                <X color="#64748b" size={24} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <Text style={styles.modalLabel}>Fecha y Hora</Text>
              <View style={styles.modalInfoBox}>
                <Calendar color="#2563eb" size={16} />
                <Text style={styles.modalInfoText}>
                  {new Date(selectedDate).toLocaleDateString('es-ES', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </Text>
              </View>
              {selectedTimeSlot && (
                <View style={styles.modalInfoBox}>
                  <Clock color="#2563eb" size={16} />
                  <Text style={styles.modalInfoText}>{selectedTimeSlot}</Text>
                </View>
              )}

              <Text style={styles.modalLabel}>Nombre del Cliente *</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Ej: Juan Pérez"
                value={newAppointment.clientName}
                onChangeText={(text) => setNewAppointment({ ...newAppointment, clientName: text })}
              />

              <Text style={styles.modalLabel}>Servicio *</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.serviceSelector}>
                {services.map((service) => (
                  <TouchableOpacity
                    key={service.id}
                    style={[
                      styles.servicePill,
                      newAppointment.serviceId === service.id && styles.servicePillActive
                    ]}
                    onPress={() => setNewAppointment({ ...newAppointment, serviceId: service.id, staffId: "" })}
                  >
                    <Text style={[
                      styles.servicePillText,
                      newAppointment.serviceId === service.id && styles.servicePillTextActive
                    ]}>
                      {service.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {newAppointment.serviceId && (
                <>
                  <Text style={styles.modalLabel}>Profesional *</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.serviceSelector}>
                    {services.find(s => s.id === newAppointment.serviceId)?.staff.map((staff) => (
                      <TouchableOpacity
                        key={staff.id}
                        style={[
                          styles.servicePill,
                          newAppointment.staffId === staff.id && styles.servicePillActive
                        ]}
                        onPress={() => setNewAppointment({ ...newAppointment, staffId: staff.id })}
                      >
                        <Text style={[
                          styles.servicePillText,
                          newAppointment.staffId === staff.id && styles.servicePillTextActive
                        ]}>
                          {staff.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </>
              )}

              <Text style={styles.modalLabel}>Notas (Opcional)</Text>
              <TextInput
                style={[styles.modalInput, styles.modalTextArea]}
                placeholder="Agregue notas adicionales sobre la cita..."
                value={newAppointment.notes}
                onChangeText={(text) => setNewAppointment({ ...newAppointment, notes: text })}
                multiline
                numberOfLines={4}
              />
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setShowNewAppointmentModal(false)}
              >
                <Text style={styles.modalCancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalConfirmButton}
                onPress={handleCreateAppointment}
              >
                <Text style={styles.modalConfirmButtonText}>Crear Cita</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "90%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1e293b",
  },
  modalBody: {
    padding: 20,
  },
  modalLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginTop: 16,
    marginBottom: 8,
  },
  modalInput: {
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: "#1e293b",
  },
  modalTextArea: {
    minHeight: 100,
    textAlignVertical: "top",
  },
  modalInfoBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#eff6ff",
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    gap: 8,
  },
  modalInfoText: {
    fontSize: 14,
    color: "#1e293b",
    textTransform: "capitalize",
    flex: 1,
  },
  serviceSelector: {
    marginBottom: 8,
  },
  servicePill: {
    backgroundColor: "#f1f5f9",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 2,
    borderColor: "transparent",
  },
  servicePillActive: {
    backgroundColor: "#eff6ff",
    borderColor: "#2563eb",
  },
  servicePillText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#64748b",
  },
  servicePillTextActive: {
    color: "#2563eb",
  },
  modalFooter: {
    flexDirection: "row",
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
  },
  modalCancelButton: {
    flex: 1,
    backgroundColor: "#f1f5f9",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  modalCancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#64748b",
  },
  modalConfirmButton: {
    flex: 1,
    backgroundColor: "#2563eb",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  modalConfirmButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ffffff",
  },
});