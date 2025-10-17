import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, useRouter } from "expo-router";
import {
  ArrowLeft,
  Megaphone,
  Plus,
  Calendar,
  DollarSign,
  Target,
  TrendingUp,
  Edit,
  Trash2,
  Play,
  Pause,
} from "lucide-react-native";

type Campaign = {
  id: string;
  name: string;
  description: string;
  budget: number;
  duration: number;
  status: "active" | "paused" | "completed" | "scheduled";
  startDate: string;
  endDate: string;
  leads: number;
  conversions: number;
  roi: number;
};

export default function ReferralCampaigns() {
  const router = useRouter();
  const [campaigns, setCampaigns] = useState<Campaign[]>([
    {
      id: "1",
      name: "Campaña de Lanzamiento",
      description: "Promoción inicial para nuevos usuarios",
      budget: 500000,
      duration: 30,
      status: "active",
      startDate: "2025-01-01",
      endDate: "2025-01-31",
      leads: 45,
      conversions: 12,
      roi: 240,
    },
    {
      id: "2",
      name: "Black Friday Special",
      description: "Oferta especial fin de año",
      budget: 1000000,
      duration: 7,
      status: "scheduled",
      startDate: "2025-11-24",
      endDate: "2025-11-30",
      leads: 0,
      conversions: 0,
      roi: 0,
    },
  ]);

  const [modalVisible, setModalVisible] = useState(false);
  const [newCampaign, setNewCampaign] = useState({
    name: "",
    description: "",
    budget: "",
    duration: "",
  });

  const handleCreateCampaign = () => {
    if (!newCampaign.name || !newCampaign.budget || !newCampaign.duration) {
      return;
    }

    const campaign: Campaign = {
      id: Date.now().toString(),
      name: newCampaign.name,
      description: newCampaign.description,
      budget: parseFloat(newCampaign.budget),
      duration: parseInt(newCampaign.duration),
      status: "scheduled",
      startDate: new Date().toISOString().split("T")[0],
      endDate: new Date(
        Date.now() + parseInt(newCampaign.duration) * 24 * 60 * 60 * 1000
      )
        .toISOString()
        .split("T")[0],
      leads: 0,
      conversions: 0,
      roi: 0,
    };

    setCampaigns([...campaigns, campaign]);
    setNewCampaign({ name: "", description: "", budget: "", duration: "" });
    setModalVisible(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "#10b981";
      case "paused":
        return "#f59e0b";
      case "completed":
        return "#64748b";
      case "scheduled":
        return "#3b82f6";
      default:
        return "#64748b";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "active":
        return "Activa";
      case "paused":
        return "Pausada";
      case "completed":
        return "Completada";
      case "scheduled":
        return "Programada";
      default:
        return status;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          title: "Campañas de Referidos",
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <ArrowLeft color="#1e293b" size={24} />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Gestiona tus campañas</Text>
          <Text style={styles.headerSubtitle}>
            Crea y monitorea campañas de referidos
          </Text>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Megaphone color="#3b82f6" size={24} />
            <Text style={styles.statValue}>{campaigns.length}</Text>
            <Text style={styles.statLabel}>Campañas totales</Text>
          </View>
          <View style={styles.statCard}>
            <Play color="#10b981" size={24} />
            <Text style={styles.statValue}>
              {campaigns.filter((c) => c.status === "active").length}
            </Text>
            <Text style={styles.statLabel}>Activas</Text>
          </View>
          <View style={styles.statCard}>
            <TrendingUp color="#f59e0b" size={24} />
            <Text style={styles.statValue}>
              {campaigns.reduce((acc, c) => acc + c.leads, 0)}
            </Text>
            <Text style={styles.statLabel}>Leads generados</Text>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Mis Campañas</Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setModalVisible(true)}
            >
              <Plus color="#ffffff" size={20} />
              <Text style={styles.addButtonText}>Nueva</Text>
            </TouchableOpacity>
          </View>

          {campaigns.map((campaign) => (
            <View key={campaign.id} style={styles.campaignCard}>
              <View style={styles.campaignHeader}>
                <View style={styles.campaignTitleContainer}>
                  <Megaphone color="#3b82f6" size={20} />
                  <View style={styles.campaignTitleText}>
                    <Text style={styles.campaignName}>{campaign.name}</Text>
                    <Text style={styles.campaignDescription}>
                      {campaign.description}
                    </Text>
                  </View>
                </View>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: `${getStatusColor(campaign.status)}20` },
                  ]}
                >
                  <Text
                    style={[
                      styles.statusText,
                      { color: getStatusColor(campaign.status) },
                    ]}
                  >
                    {getStatusText(campaign.status)}
                  </Text>
                </View>
              </View>

              <View style={styles.campaignMetrics}>
                <View style={styles.metricItem}>
                  <DollarSign color="#64748b" size={16} />
                  <Text style={styles.metricLabel}>Presupuesto</Text>
                  <Text style={styles.metricValue}>
                    ${(campaign.budget / 1000).toFixed(0)}K
                  </Text>
                </View>
                <View style={styles.metricItem}>
                  <Target color="#64748b" size={16} />
                  <Text style={styles.metricLabel}>Leads</Text>
                  <Text style={styles.metricValue}>{campaign.leads}</Text>
                </View>
                <View style={styles.metricItem}>
                  <TrendingUp color="#64748b" size={16} />
                  <Text style={styles.metricLabel}>ROI</Text>
                  <Text style={styles.metricValue}>{campaign.roi}%</Text>
                </View>
                <View style={styles.metricItem}>
                  <Calendar color="#64748b" size={16} />
                  <Text style={styles.metricLabel}>Duración</Text>
                  <Text style={styles.metricValue}>{campaign.duration}d</Text>
                </View>
              </View>

              <View style={styles.campaignActions}>
                <TouchableOpacity style={styles.actionButton}>
                  <Edit color="#3b82f6" size={16} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton}>
                  {campaign.status === "active" ? (
                    <Pause color="#f59e0b" size={16} />
                  ) : (
                    <Play color="#10b981" size={16} />
                  )}
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton}>
                  <Trash2 color="#ef4444" size={16} />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Nueva Campaña</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.formSection}>
              <Text style={styles.formLabel}>Nombre *</Text>
              <TextInput
                style={styles.formInput}
                placeholder="Ej: Campaña de Verano"
                value={newCampaign.name}
                onChangeText={(text) =>
                  setNewCampaign({ ...newCampaign, name: text })
                }
                placeholderTextColor="#94a3b8"
              />
            </View>

            <View style={styles.formSection}>
              <Text style={styles.formLabel}>Descripción</Text>
              <TextInput
                style={[styles.formInput, styles.formTextArea]}
                placeholder="Describe el objetivo de la campaña..."
                value={newCampaign.description}
                onChangeText={(text) =>
                  setNewCampaign({ ...newCampaign, description: text })
                }
                multiline
                numberOfLines={3}
                placeholderTextColor="#94a3b8"
              />
            </View>

            <View style={styles.formSection}>
              <Text style={styles.formLabel}>Presupuesto (COP) *</Text>
              <TextInput
                style={styles.formInput}
                placeholder="500000"
                value={newCampaign.budget}
                onChangeText={(text) =>
                  setNewCampaign({ ...newCampaign, budget: text })
                }
                keyboardType="numeric"
                placeholderTextColor="#94a3b8"
              />
            </View>

            <View style={styles.formSection}>
              <Text style={styles.formLabel}>Duración (días) *</Text>
              <TextInput
                style={styles.formInput}
                placeholder="30"
                value={newCampaign.duration}
                onChangeText={(text) =>
                  setNewCampaign({ ...newCampaign, duration: text })
                }
                keyboardType="numeric"
                placeholderTextColor="#94a3b8"
              />
            </View>

            <TouchableOpacity
              style={[
                styles.createButton,
                (!newCampaign.name ||
                  !newCampaign.budget ||
                  !newCampaign.duration) &&
                  styles.createButtonDisabled,
              ]}
              onPress={handleCreateCampaign}
              disabled={
                !newCampaign.name || !newCampaign.budget || !newCampaign.duration
              }
            >
              <Plus color="#ffffff" size={20} />
              <Text style={styles.createButtonText}>Crear Campaña</Text>
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
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold" as const,
    color: "#1e293b",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#64748b",
  },
  statsContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
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
  statValue: {
    fontSize: 20,
    fontWeight: "bold" as const,
    color: "#1e293b",
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    color: "#64748b",
    textAlign: "center",
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold" as const,
    color: "#1e293b",
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#3b82f6",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  addButtonText: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: "#ffffff",
  },
  campaignCard: {
    backgroundColor: "#ffffff",
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  campaignHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  campaignTitleContainer: {
    flex: 1,
    flexDirection: "row",
    gap: 12,
  },
  campaignTitleText: {
    flex: 1,
  },
  campaignName: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#1e293b",
    marginBottom: 4,
  },
  campaignDescription: {
    fontSize: 12,
    color: "#64748b",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    fontWeight: "600" as const,
  },
  campaignMetrics: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
    marginBottom: 16,
  },
  metricItem: {
    alignItems: "center",
    gap: 4,
  },
  metricLabel: {
    fontSize: 10,
    color: "#64748b",
  },
  metricValue: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#1e293b",
  },
  campaignActions: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    flex: 1,
    backgroundColor: "#f8fafc",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
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
    maxHeight: "80%",
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
  formSection: {
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#1e293b",
    marginBottom: 8,
  },
  formInput: {
    backgroundColor: "#f8fafc",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    fontSize: 14,
    color: "#1e293b",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  formTextArea: {
    height: 80,
    textAlignVertical: "top",
  },
  createButton: {
    backgroundColor: "#3b82f6",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    marginTop: 8,
  },
  createButtonDisabled: {
    backgroundColor: "#cbd5e1",
  },
  createButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600" as const,
  },
});
