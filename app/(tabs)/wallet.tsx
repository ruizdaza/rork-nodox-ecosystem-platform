import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { 
  Zap, 
  TrendingUp, 
  Gift, 
  Users, 
  ShoppingBag,
  Calendar,
  ArrowUpRight,
  ArrowDownLeft,
  QrCode,
  Send,
  Plus
} from "lucide-react-native";
import { useNodoX } from "@/hooks/use-nodox-store";
import NodoXLogo from "@/components/NodoXLogo";

export default function WalletScreen() {
  const { ncopBalance, ncopHistory, monthlyEarnings } = useNodoX();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <NodoXLogo size="small" showText={false} />
            <Text style={styles.headerTitle}>Mi Billetera NCOP</Text>
          </View>
        </View>

        {/* Balance Card */}
        <LinearGradient
          colors={["#2563eb", "#3b82f6"]}
          style={styles.balanceCard}
        >
          <View style={styles.balanceHeader}>
            <Zap color="#ffffff" size={24} />
            <Text style={styles.balanceLabel}>Saldo disponible</Text>
          </View>
          <Text style={styles.balanceAmount}>{ncopBalance.toLocaleString()}</Text>
          <Text style={styles.balanceSubtext}>Puntos NCOP</Text>
          
          <View style={styles.monthlyEarnings}>
            <TrendingUp color="#10b981" size={16} />
            <Text style={styles.monthlyText}>
              +{monthlyEarnings} NCOP este mes
            </Text>
          </View>
        </LinearGradient>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Acciones rápidas</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => router.push('/scanner')}
            >
              <QrCode color="#ffffff" size={20} />
              <Text style={styles.actionButtonText}>Escanear y Pagar</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => router.push('/send')}
            >
              <Send color="#ffffff" size={20} />
              <Text style={styles.actionButtonText}>Enviar NCOP</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => router.push('/recharge')}
            >
              <Plus color="#ffffff" size={20} />
              <Text style={styles.actionButtonText}>Recargar</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Earning Methods */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Formas de ganar NCOP</Text>
          <View style={styles.earningMethods}>
            <TouchableOpacity style={styles.methodCard}>
              <ShoppingBag color="#2563eb" size={24} />
              <Text style={styles.methodTitle}>Comprar en aliados</Text>
              <Text style={styles.methodSubtitle}>Hasta 10% en NCOP</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.methodCard}>
              <Users color="#10b981" size={24} />
              <Text style={styles.methodTitle}>Referir amigos</Text>
              <Text style={styles.methodSubtitle}>500 NCOP por referido</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.methodCard}>
              <Calendar color="#8b5cf6" size={24} />
              <Text style={styles.methodTitle}>Actividad mensual</Text>
              <Text style={styles.methodSubtitle}>Liberación automática</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Transaction History */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Historial de transacciones</Text>
          {ncopHistory.map((transaction, index) => (
            <View key={index} style={styles.transactionItem}>
              <View style={[
                styles.transactionIcon,
                { backgroundColor: transaction.type === "earned" ? "#dcfce7" : "#fef2f2" }
              ]}>
                {transaction.type === "earned" ? (
                  <ArrowDownLeft color="#10b981" size={16} />
                ) : (
                  <ArrowUpRight color="#ef4444" size={16} />
                )}
              </View>
              <View style={styles.transactionContent}>
                <Text style={styles.transactionTitle}>{transaction.description}</Text>
                <Text style={styles.transactionDate}>{transaction.date}</Text>
              </View>
              <Text style={[
                styles.transactionAmount,
                { color: transaction.type === "earned" ? "#10b981" : "#ef4444" }
              ]}>
                {transaction.type === "earned" ? "+" : "-"}{transaction.amount} NCOP
              </Text>
            </View>
          ))}
        </View>

        {/* Benefits Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Beneficios NodePass</Text>
          <View style={styles.benefitCard}>
            <Gift color="#fbbf24" size={24} />
            <View style={styles.benefitContent}>
              <Text style={styles.benefitTitle}>Membresía NodePass Activa</Text>
              <Text style={styles.benefitDescription}>
                Acceso a descuentos exclusivos y liberación mensual de NCOP
              </Text>
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
    backgroundColor: "#f8fafc",
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1e293b",
  },
  balanceCard: {
    marginHorizontal: 20,
    marginBottom: 24,
    padding: 24,
    borderRadius: 16,
  },
  balanceHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 8,
  },
  balanceLabel: {
    fontSize: 16,
    color: "#e2e8f0",
    fontWeight: "500",
  },
  balanceAmount: {
    fontSize: 42,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 4,
  },
  balanceSubtext: {
    fontSize: 14,
    color: "#cbd5e1",
    marginBottom: 16,
  },
  monthlyEarnings: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: "flex-start",
  },
  monthlyText: {
    fontSize: 12,
    color: "#ffffff",
    fontWeight: "500",
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
  earningMethods: {
    paddingHorizontal: 20,
    gap: 12,
  },
  methodCard: {
    backgroundColor: "#ffffff",
    padding: 16,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  methodTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
    flex: 1,
  },
  methodSubtitle: {
    fontSize: 12,
    color: "#64748b",
    fontWeight: "500",
  },
  transactionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: "#ffffff",
    marginHorizontal: 20,
    marginBottom: 8,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  transactionIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  transactionContent: {
    flex: 1,
  },
  transactionTitle: {
    fontSize: 14,
    fontWeight: "500",
    color: "#1e293b",
  },
  transactionDate: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 2,
  },
  transactionAmount: {
    fontSize: 14,
    fontWeight: "600",
  },
  benefitCard: {
    backgroundColor: "#ffffff",
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  benefitContent: {
    flex: 1,
  },
  benefitTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 4,
  },
  benefitDescription: {
    fontSize: 12,
    color: "#64748b",
    lineHeight: 16,
  },
  quickActions: {
    flexDirection: "row",
    paddingHorizontal: 20,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2563eb",
    paddingVertical: 12,
    borderRadius: 8,
    gap: 6,
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#ffffff",
  },
});