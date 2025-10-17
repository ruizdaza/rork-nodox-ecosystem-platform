import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, useRouter } from "expo-router";
import { ArrowLeft, DollarSign, Clock, CheckCircle, Calendar } from "lucide-react-native";

type Commission = {
  id: string;
  leadName: string;
  amount: number;
  status: "pending" | "approved" | "paid";
  date: string;
  type: string;
};

export default function ReferralCommissions() {
  const router = useRouter();

  const commissions: Commission[] = [
    { id: "1", leadName: "Juan Pérez", amount: 5000, status: "paid", date: "2025-01-15", type: "Conversión" },
    { id: "2", leadName: "María García", amount: 3000, status: "approved", date: "2025-01-18", type: "Registro" },
    { id: "3", leadName: "Carlos López", amount: 10000, status: "pending", date: "2025-01-20", type: "Compra" },
  ];

  const totalPaid = commissions.filter(c => c.status === "paid").reduce((sum, c) => sum + c.amount, 0);
  const totalPending = commissions.filter(c => c.status === "pending").reduce((sum, c) => sum + c.amount, 0);
  const totalApproved = commissions.filter(c => c.status === "approved").reduce((sum, c) => sum + c.amount, 0);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "#10b981";
      case "approved":
        return "#3b82f6";
      case "pending":
        return "#f59e0b";
      default:
        return "#64748b";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "paid":
        return "Pagada";
      case "approved":
        return "Aprobada";
      case "pending":
        return "Pendiente";
      default:
        return status;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          title: "Mis Comisiones",
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <ArrowLeft color="#1e293b" size={24} />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Historial de Comisiones</Text>
          <Text style={styles.headerSubtitle}>Revisa tus ganancias y pagos</Text>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <CheckCircle color="#10b981" size={20} />
            <Text style={styles.statValue}>${totalPaid.toLocaleString()}</Text>
            <Text style={styles.statLabel}>Pagado</Text>
          </View>
          <View style={styles.statCard}>
            <DollarSign color="#3b82f6" size={20} />
            <Text style={styles.statValue}>${totalApproved.toLocaleString()}</Text>
            <Text style={styles.statLabel}>Aprobado</Text>
          </View>
          <View style={styles.statCard}>
            <Clock color="#f59e0b" size={20} />
            <Text style={styles.statValue}>${totalPending.toLocaleString()}</Text>
            <Text style={styles.statLabel}>Pendiente</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Todas las comisiones</Text>
          {commissions.map((commission) => (
            <View key={commission.id} style={styles.commissionCard}>
              <View style={styles.commissionHeader}>
                <View>
                  <Text style={styles.leadName}>{commission.leadName}</Text>
                  <Text style={styles.commissionType}>{commission.type}</Text>
                </View>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: `${getStatusColor(commission.status)}20` },
                  ]}
                >
                  <Text
                    style={[
                      styles.statusText,
                      { color: getStatusColor(commission.status) },
                    ]}
                  >
                    {getStatusText(commission.status)}
                  </Text>
                </View>
              </View>
              <View style={styles.commissionFooter}>
                <View style={styles.amountContainer}>
                  <DollarSign color="#10b981" size={16} />
                  <Text style={styles.amount}>${commission.amount.toLocaleString()} NCOP</Text>
                </View>
                <View style={styles.dateContainer}>
                  <Calendar color="#64748b" size={12} />
                  <Text style={styles.date}>{commission.date}</Text>
                </View>
              </View>
            </View>
          ))}
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
    fontSize: 18,
    fontWeight: "bold" as const,
    color: "#1e293b",
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    color: "#64748b",
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold" as const,
    color: "#1e293b",
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  commissionCard: {
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
  commissionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  leadName: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#1e293b",
    marginBottom: 2,
  },
  commissionType: {
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
  commissionFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  amountContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  amount: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#10b981",
  },
  dateContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  date: {
    fontSize: 11,
    color: "#64748b",
  },
});
