import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, useRouter } from "expo-router";
import { 
  ArrowLeft, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Building2,
  User,
  Mail,
  Phone,
  MapPin,
  FileText,
  Calendar,
  Eye,
  ThumbsUp,
  ThumbsDown
} from "lucide-react-native";
import { useNodoX } from "@/hooks/use-nodox-store";

export default function AdminAllyRequestsScreen() {
  const router = useRouter();
  const { allyRequests, approveAllyRequest, rejectAllyRequest } = useNodoX();
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "#f59e0b";
      case "temp_approved":
        return "#8b5cf6";
      case "approved":
        return "#10b981";
      case "rejected":
        return "#ef4444";
      default:
        return "#64748b";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return "Pendiente";
      case "temp_approved":
        return "Aprobado Temporal";
      case "approved":
        return "Aprobado";
      case "rejected":
        return "Rechazado";
      default:
        return "Desconocido";
    }
  };

  const handleApprove = (requestId: string, tempAccess: boolean = true) => {
    Alert.alert(
      tempAccess ? "Aprobar Temporalmente" : "Aprobar Permanentemente",
      tempAccess 
        ? "¿Deseas otorgar acceso temporal de 48 horas a este aliado?"
        : "¿Deseas aprobar permanentemente esta solicitud?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Aprobar",
          onPress: () => {
            const success = approveAllyRequest(requestId, tempAccess);
            if (success) {
              Alert.alert(
                "Éxito",
                `Solicitud ${tempAccess ? 'temporalmente' : 'permanentemente'} aprobada`
              );
            }
          }
        }
      ]
    );
  };

  const handleReject = (requestId: string) => {
    setSelectedRequest(requestId);
    setShowRejectModal(true);
  };

  const confirmReject = () => {
    if (!rejectionReason.trim()) {
      Alert.alert("Error", "Debes proporcionar una razón para el rechazo");
      return;
    }

    const success = rejectAllyRequest(selectedRequest, rejectionReason);
    if (success) {
      Alert.alert("Éxito", "Solicitud rechazada");
      setShowRejectModal(false);
      setRejectionReason("");
      setSelectedRequest(null);
    }
  };

  const renderRequestCard = (request: any) => (
    <View key={request.id} style={styles.requestCard}>
      <View style={styles.requestHeader}>
        <View style={styles.businessInfo}>
          <Building2 color="#1e293b" size={20} />
          <View style={styles.businessDetails}>
            <Text style={styles.businessName}>{request.businessName}</Text>
            <Text style={styles.businessType}>{request.businessType}</Text>
          </View>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(request.status)}20` }]}>
          <Text style={[styles.statusText, { color: getStatusColor(request.status) }]}>
            {getStatusText(request.status)}
          </Text>
        </View>
      </View>

      <View style={styles.requestInfo}>
        <View style={styles.infoRow}>
          <User color="#64748b" size={16} />
          <Text style={styles.infoText}>{request.legalRepresentative}</Text>
        </View>
        <View style={styles.infoRow}>
          <Mail color="#64748b" size={16} />
          <Text style={styles.infoText}>{request.businessEmail}</Text>
        </View>
        <View style={styles.infoRow}>
          <Phone color="#64748b" size={16} />
          <Text style={styles.infoText}>{request.businessPhone}</Text>
        </View>
        <View style={styles.infoRow}>
          <MapPin color="#64748b" size={16} />
          <Text style={styles.infoText}>{request.businessAddress}</Text>
        </View>
        <View style={styles.infoRow}>
          <Calendar color="#64748b" size={16} />
          <Text style={styles.infoText}>
            {new Date(request.requestDate).toLocaleDateString('es-ES', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </Text>
        </View>
      </View>

      <View style={styles.descriptionSection}>
        <Text style={styles.descriptionLabel}>Descripción del Negocio:</Text>
        <Text style={styles.descriptionText}>{request.businessDescription}</Text>
      </View>

      {request.status === "pending" && (
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, styles.tempApproveButton]}
            onPress={() => handleApprove(request.id, true)}
          >
            <Clock color="#ffffff" size={16} />
            <Text style={styles.actionButtonText}>Aprobar 48h</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.actionButton, styles.approveButton]}
            onPress={() => handleApprove(request.id, false)}
          >
            <CheckCircle color="#ffffff" size={16} />
            <Text style={styles.actionButtonText}>Aprobar</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.actionButton, styles.rejectButton]}
            onPress={() => handleReject(request.id)}
          >
            <XCircle color="#ffffff" size={16} />
            <Text style={styles.actionButtonText}>Rechazar</Text>
          </TouchableOpacity>
        </View>
      )}

      {request.rejectionReason && (
        <View style={styles.rejectionSection}>
          <Text style={styles.rejectionLabel}>Razón del Rechazo:</Text>
          <Text style={styles.rejectionText}>{request.rejectionReason}</Text>
        </View>
      )}
    </View>
  );

  const pendingRequests = allyRequests.filter(r => r.status === "pending");
  const processedRequests = allyRequests.filter(r => r.status !== "pending");

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: "Solicitudes de Aliados",
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <ArrowLeft color="#1e293b" size={24} />
            </TouchableOpacity>
          ),
        }}
      />
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{pendingRequests.length}</Text>
            <Text style={styles.statLabel}>Pendientes</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {allyRequests.filter(r => r.status === "approved" || r.status === "temp_approved").length}
            </Text>
            <Text style={styles.statLabel}>Aprobadas</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {allyRequests.filter(r => r.status === "rejected").length}
            </Text>
            <Text style={styles.statLabel}>Rechazadas</Text>
          </View>
        </View>

        {/* Pending Requests */}
        {pendingRequests.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Solicitudes Pendientes</Text>
            {pendingRequests.map(renderRequestCard)}
          </View>
        )}

        {/* Processed Requests */}
        {processedRequests.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Solicitudes Procesadas</Text>
            {processedRequests.map(renderRequestCard)}
          </View>
        )}

        {allyRequests.length === 0 && (
          <View style={styles.emptyState}>
            <Building2 color="#94a3b8" size={48} />
            <Text style={styles.emptyTitle}>No hay solicitudes</Text>
            <Text style={styles.emptyText}>
              Las solicitudes de aliados aparecerán aquí cuando se envíen
            </Text>
          </View>
        )}

        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Rejection Modal */}
      <Modal
        visible={showRejectModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowRejectModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Rechazar Solicitud</Text>
            <Text style={styles.modalSubtitle}>
              Proporciona una razón para el rechazo:
            </Text>
            
            <TextInput
              style={styles.reasonInput}
              placeholder="Ej: Documentación incompleta, negocio no cumple requisitos..."
              value={rejectionReason}
              onChangeText={setRejectionReason}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              placeholderTextColor="#94a3b8"
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setShowRejectModal(false);
                  setRejectionReason("");
                  setSelectedRequest(null);
                }}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={confirmReject}
              >
                <Text style={styles.confirmButtonText}>Rechazar</Text>
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
  scrollView: {
    flex: 1,
  },
  statsContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#ffffff",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  statNumber: {
    fontSize: 24,
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
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  requestCard: {
    backgroundColor: "#ffffff",
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  requestHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  businessInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 12,
  },
  businessDetails: {
    flex: 1,
  },
  businessName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1e293b",
    marginBottom: 2,
  },
  businessType: {
    fontSize: 12,
    color: "#64748b",
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  requestInfo: {
    gap: 8,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  infoText: {
    fontSize: 14,
    color: "#64748b",
    flex: 1,
  },
  descriptionSection: {
    marginBottom: 16,
  },
  descriptionLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 4,
  },
  descriptionText: {
    fontSize: 14,
    color: "#64748b",
    lineHeight: 20,
  },
  actionButtons: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 8,
    gap: 6,
  },
  tempApproveButton: {
    backgroundColor: "#8b5cf6",
  },
  approveButton: {
    backgroundColor: "#10b981",
  },
  rejectButton: {
    backgroundColor: "#ef4444",
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#ffffff",
  },
  rejectionSection: {
    marginTop: 16,
    padding: 12,
    backgroundColor: "#fef2f2",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#fecaca",
  },
  rejectionLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#dc2626",
    marginBottom: 4,
  },
  rejectionText: {
    fontSize: 12,
    color: "#dc2626",
    lineHeight: 16,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 48,
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1e293b",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: "#64748b",
    textAlign: "center",
    lineHeight: 20,
  },
  bottomSpacing: {
    height: 32,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 24,
    width: "100%",
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1e293b",
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    color: "#64748b",
    marginBottom: 16,
  },
  reasonInput: {
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: "#1e293b",
    minHeight: 100,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: "row",
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#f1f5f9",
  },
  confirmButton: {
    backgroundColor: "#ef4444",
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#64748b",
  },
  confirmButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#ffffff",
  },
});