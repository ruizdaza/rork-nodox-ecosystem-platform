import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, useRouter } from "expo-router";
import { ArrowLeft, Users, ChevronRight, Award } from "lucide-react-native";
import { useReferralCRM } from "@/hooks/use-referral-crm";

export default function ReferralLeads() {
  const router = useRouter();
  const { leads } = useReferralCRM();

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

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          title: "Todos los Leads",
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <ArrowLeft color="#1e293b" size={24} />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Mis Leads ({leads.length})</Text>
          <Text style={styles.headerSubtitle}>
            Gestiona todos tus contactos referidos
          </Text>
        </View>

        <View style={styles.leadsList}>
          {leads.map((lead) => (
            <TouchableOpacity
              key={lead.id}
              style={styles.leadItem}
              onPress={() => router.push(`/referral-lead/${lead.id}` as any)}
            >
              <View style={styles.leadInfo}>
                <View style={styles.leadHeader}>
                  <Text style={styles.leadName}>{lead.name}</Text>
                  {lead.isAlly && (
                    <View style={styles.allyBadge}>
                      <Award color="#f59e0b" size={12} />
                    </View>
                  )}
                </View>
                <Text style={styles.leadEmail}>{lead.email}</Text>
                <View style={styles.leadMeta}>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: `${getStatusColor(lead.status)}20` },
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        { color: getStatusColor(lead.status) },
                      ]}
                    >
                      {getStatusText(lead.status)}
                    </Text>
                  </View>
                  <Text style={styles.leadValue}>
                    {lead.lifetimeValue > 0
                      ? `${(lead.lifetimeValue / 1000).toFixed(1)}K COP`
                      : "Sin compras"}
                  </Text>
                </View>
              </View>
              <ChevronRight color="#94a3b8" size={20} />
            </TouchableOpacity>
          ))}

          {leads.length === 0 && (
            <View style={styles.emptyState}>
              <Users color="#cbd5e1" size={48} />
              <Text style={styles.emptyStateText}>
                Aún no tienes leads registrados
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
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
  leadsList: {
    paddingHorizontal: 20,
    gap: 12,
  },
  leadItem: {
    backgroundColor: "#ffffff",
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  leadInfo: {
    flex: 1,
  },
  leadHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  leadName: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#1e293b",
  },
  allyBadge: {
    backgroundColor: "#fef3c7",
    padding: 4,
    borderRadius: 12,
  },
  leadEmail: {
    fontSize: 12,
    color: "#64748b",
    marginBottom: 8,
  },
  leadMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
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
  leadValue: {
    fontSize: 12,
    color: "#64748b",
    fontWeight: "500" as const,
  },
  emptyState: {
    alignItems: "center",
    padding: 40,
    backgroundColor: "#ffffff",
    borderRadius: 12,
  },
  emptyStateText: {
    fontSize: 14,
    color: "#64748b",
    marginTop: 16,
    textAlign: "center",
  },
});
