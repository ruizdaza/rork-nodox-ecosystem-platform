import React, { useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { 
  Gift, 
  Users, 
  ShoppingBag,
  Calendar,
  TrendingUp,
  BarChart3,
} from "lucide-react-native";
import { useWallet } from "@/hooks/use-wallet";
import NodoXLogo from "@/components/NodoXLogo";
import NotificationBell from "@/components/NotificationBell";
import BalanceCard from "@/components/wallet/BalanceCard";
import QuickActions from "@/components/wallet/QuickActions";
import TransactionItem from "@/components/wallet/TransactionItem";

export default function WalletScreen() {
  const {
    balance,
    settings,
    isLoading,
    recentTransactions,
    ncopStats,
    copStats,
    syncWithBackend,
    formatCurrency,
  } = useWallet();

  const monthlyEarnings = useMemo(
    () => ncopStats?.totalEarned || 0,
    [ncopStats]
  );

  const handleRefresh = async () => {
    await syncWithBackend();
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={handleRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <NodoXLogo size="small" showText={false} />
            <Text style={styles.headerTitle}>Mi Billetera</Text>
          </View>
          <NotificationBell />
        </View>

        {/* Balance Card */}
        <BalanceCard
          ncopBalance={balance.ncop}
          copBalance={balance.cop}
          monthlyEarnings={monthlyEarnings}
          preferredCurrency={settings.preferredCurrency}
        />

        {/* Quick Actions */}
        <QuickActions isLoading={isLoading} />

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

        {/* Stats Cards */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Estadísticas</Text>
          <View style={styles.statsGrid}>
            <TouchableOpacity 
              style={styles.statCard}
              onPress={() => router.push('/financial-dashboard')}
            >
              <BarChart3 color="#2563eb" size={24} />
              <Text style={styles.statValue}>
                {formatCurrency(ncopStats?.totalEarned || 0, 'NCOP')}
              </Text>
              <Text style={styles.statLabel}>Ganados</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.statCard}
              onPress={() => router.push('/financial-dashboard')}
            >
              <TrendingUp color="#10b981" size={24} />
              <Text style={styles.statValue}>
                {ncopStats?.transactionCount || 0}
              </Text>
              <Text style={styles.statLabel}>Transacciones</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Transaction History */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Transacciones Recientes</Text>
            <TouchableOpacity 
              style={styles.viewAllButton}
              onPress={() => router.push('/financial-dashboard')}
            >
              <Text style={styles.viewAllText}>Ver Todas</Text>
            </TouchableOpacity>
          </View>
          
          {recentTransactions.length > 0 ? (
            recentTransactions.map((transaction) => (
              <TransactionItem key={transaction.id} transaction={transaction} />
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No hay transacciones recientes</Text>
            </View>
          )}
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 20,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#64748b',
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

  statsGrid: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    gap: 8,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#1e293b',
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500' as const,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  viewAllButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#2563eb',
    borderRadius: 6,
  },
  viewAllText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
  },

});