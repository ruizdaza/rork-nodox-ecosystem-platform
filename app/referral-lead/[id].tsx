import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, useRouter, useLocalSearchParams } from "expo-router";
import {
  ArrowLeft,
  Mail,
  Phone,
  Calendar,
  DollarSign,
  Edit,
  MessageCircle,
  Tag,
  FileText,
} from "lucide-react-native";
import { useReferralCRM } from "@/hooks/use-referral-crm";

export default function ReferralLeadDetail() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { leads } = useReferralCRM();
  const [noteModalVisible, setNoteModalVisible] = useState(false);
  const [newNote, setNewNote] = useState("");

  const lead = leads.find((l) => l.id === id);

  if (!lead) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen
          options={{
            title: "Lead no encontrado",
            headerLeft: () => (
              <TouchableOpacity onPress={() => router.back()}>
                <ArrowLeft color="#1e293b" size={24} />
              </TouchableOpacity>
            ),
          }}
        />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Lead no encontrado</Text>
        </View>
      </SafeAreaView>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "converted":
        return "#10b981";
      case "qualified":
        return "#f59e0b";
      case "contacted":
        return "#3b82f6";
      case "lead":
        return "#8b5cf6";
      case "lost":
        return "#ef4444";
      default:
        return "#64748b";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "converted":
        return "Convertido";
      case "qualified":
        return "Calificado";
      case "contacted":
        return "Contactado";
      case "lead":
        return "Lead";
      case "lost":
        return "Perdido";
      default:
        return status;
    }
  };

  const handleAddNote = () => {
    if (!newNote.trim()) return;
    console.log(`Agregando nota para lead ${lead.id}: ${newNote}`);
    setNewNote("");
    setNoteModalVisible(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          title: lead.name,
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <ArrowLeft color="#1e293b" size={24} />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.nameContainer}>
            <Text style={styles.leadName}>{lead.name}</Text>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: `${getStatusColor(lead.status)}20` },
              ]}
            >
              <Text style={[styles.statusText, { color: getStatusColor(lead.status) }]}>
                {getStatusText(lead.status)}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Información de contacto</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoItem}>
              <Mail color="#64748b" size={20} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Email</Text>
                <Text style={styles.infoValue}>{lead.email}</Text>
              </View>
            </View>
            {lead.phone && (
              <View style={styles.infoItem}>
                <Phone color="#64748b" size={20} />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Teléfono</Text>
                  <Text style={styles.infoValue}>{lead.phone}</Text>
                </View>
              </View>
            )}
            <View style={styles.infoItem}>
              <Calendar color="#64748b" size={20} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Fecha de registro</Text>
                <Text style={styles.infoValue}>
                  {new Date(lead.joinDate).toLocaleDateString("es-ES")}
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Valor y rendimiento</Text>
          <View style={styles.metricsGrid}>
            <View style={styles.metricCard}>
              <DollarSign color="#10b981" size={24} />
              <Text style={styles.metricValue}>
                ${(lead.lifetimeValue / 1000).toFixed(1)}K
              </Text>
              <Text style={styles.metricLabel}>Valor total</Text>
            </View>
            <View style={styles.metricCard}>
              <Tag color="#3b82f6" size={24} />
              <Text style={styles.metricValue}>{lead.tags.length}</Text>
              <Text style={styles.metricLabel}>Tags</Text>
            </View>
          </View>
        </View>

        {lead.notes && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Notas</Text>
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => setNoteModalVisible(true)}
              >
                <Edit color="#3b82f6" size={16} />
              </TouchableOpacity>
            </View>
            <View style={styles.notesCard}>
              <FileText color="#64748b" size={20} />
              <Text style={styles.notesText}>{lead.notes}</Text>
            </View>
          </View>
        )}

        <View style={styles.actionsSection}>
          <TouchableOpacity style={styles.actionButton}>
            <MessageCircle color="#ffffff" size={20} />
            <Text style={styles.actionButtonText}>Enviar mensaje</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionButton, styles.secondaryAction]}>
            <Edit color="#3b82f6" size={20} />
            <Text style={[styles.actionButtonText, styles.secondaryActionText]}>
              Editar lead
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Modal
        visible={noteModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setNoteModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Agregar nota</Text>
              <TouchableOpacity onPress={() => setNoteModalVisible(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>
            <TextInput
              style={styles.noteInput}
              placeholder="Escribe una nota sobre este lead..."
              value={newNote}
              onChangeText={setNewNote}
              multiline
              numberOfLines={4}
              placeholderTextColor="#94a3b8"
            />
            <TouchableOpacity
              style={[
                styles.saveButton,
                !newNote.trim() && styles.saveButtonDisabled,
              ]}
              onPress={handleAddNote}
              disabled={!newNote.trim()}
            >
              <Text style={styles.saveButtonText}>Guardar nota</Text>
            </TouchableOpacity>
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
  header: {
    padding: 20,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  nameContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  leadName: {
    fontSize: 24,
    fontWeight: "bold" as const,
    color: "#1e293b",
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600" as const,
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold" as const,
    color: "#1e293b",
    marginBottom: 16,
  },
  infoCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    gap: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: "#64748b",
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 14,
    color: "#1e293b",
    fontWeight: "500" as const,
  },
  metricsGrid: {
    flexDirection: "row",
    gap: 12,
  },
  metricCard: {
    flex: 1,
    backgroundColor: "#ffffff",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: "bold" as const,
    color: "#1e293b",
    marginTop: 8,
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 11,
    color: "#64748b",
  },
  notesCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  notesText: {
    flex: 1,
    fontSize: 14,
    color: "#475569",
    lineHeight: 20,
  },
  addButton: {
    padding: 8,
  },
  actionsSection: {
    padding: 20,
    gap: 12,
    marginBottom: 24,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#3b82f6",
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#ffffff",
  },
  secondaryAction: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#3b82f6",
  },
  secondaryActionText: {
    color: "#3b82f6",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: "#64748b",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold" as const,
    color: "#1e293b",
  },
  modalClose: {
    fontSize: 18,
    color: "#64748b",
    fontWeight: "bold" as const,
  },
  noteInput: {
    backgroundColor: "#f8fafc",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    fontSize: 14,
    color: "#1e293b",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    height: 100,
    textAlignVertical: "top",
    marginBottom: 16,
  },
  saveButton: {
    backgroundColor: "#3b82f6",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  saveButtonDisabled: {
    backgroundColor: "#cbd5e1",
  },
  saveButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600" as const,
  },
});
