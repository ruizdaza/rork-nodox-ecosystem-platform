import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Dimensions, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Users, ShoppingBag, TrendingUp, CheckCircle, XCircle, Shield } from 'lucide-react-native';
import { trpc } from '@/lib/trpc';
import { LineChart } from "react-native-chart-kit";
import { NcopDisplay } from '@/components/NcopDisplay';

const screenWidth = Dimensions.get("window").width;

export default function AdminDashboardScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'overview' | 'allies'>('overview');

  const { data: stats, isLoading: loadingStats } = trpc.admin.getStats.useQuery(undefined, {
      enabled: activeTab === 'overview'
  });

  const { data: allies, isLoading: loadingAllies, refetch: refetchAllies } = trpc.admin.getPendingAllies.useQuery(undefined, {
      enabled: activeTab === 'allies'
  });

  const manageAllyMutation = trpc.admin.manageAlly.useMutation();

  const handleAllyAction = async (userId: string, action: 'approve' | 'reject') => {
      try {
          await manageAllyMutation.mutateAsync({ userId, action });
          Alert.alert("Éxito", `Aliado ${action === 'approve' ? 'aprobado' : 'rechazado'}`);
          refetchAllies();
      } catch (error) {
          Alert.alert("Error", "No se pudo procesar la solicitud");
      }
  };

  const chartConfig = {
    backgroundGradientFrom: "#1e293b",
    backgroundGradientTo: "#0f172a",
    color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`, // Emerald green
    strokeWidth: 2,
    barPercentage: 0.5,
  };

  const renderOverview = () => (
      <View>
          <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                  <Users size={20} color="#3b82f6" />
                  <Text style={styles.statValue}>{stats?.usersCount || 0}</Text>
                  <Text style={styles.statLabel}>Usuarios</Text>
              </View>
              <View style={styles.statCard}>
                  <ShoppingBag size={20} color="#10b981" />
                  <Text style={styles.statValue}>{stats?.productsCount || 0}</Text>
                  <Text style={styles.statLabel}>Productos</Text>
              </View>
              <View style={styles.statCard}>
                  <TrendingUp size={20} color="#f59e0b" />
                  <Text style={styles.statValue}>{stats?.ordersCount || 0}</Text>
                  <Text style={styles.statLabel}>Pedidos</Text>
              </View>
          </View>

          <View style={styles.chartCard}>
              <Text style={styles.chartTitle}>Volumen Reciente (NCOP)</Text>
              {loadingStats ? (
                  <ActivityIndicator color="#10b981" />
              ) : (
                <LineChart
                    data={{
                    labels: ["Sem 1", "Sem 2", "Sem 3", "Sem 4"],
                    datasets: [{ data: [
                        (stats?.recentVolume?.ncop || 0) * 0.2,
                        (stats?.recentVolume?.ncop || 0) * 0.5,
                        (stats?.recentVolume?.ncop || 0) * 0.8,
                        (stats?.recentVolume?.ncop || 0)
                    ] }]
                    }}
                    width={screenWidth - 40}
                    height={220}
                    chartConfig={chartConfig}
                    bezier
                    style={styles.chart}
                />
              )}
              <View style={styles.volumeInfo}>
                  <Text style={styles.volumeLabel}>Total NCOP Circulante:</Text>
                  <NcopDisplay value={stats?.recentVolume?.ncop || 0} showCop={false} />
              </View>
          </View>
      </View>
  );

  const renderAllies = () => (
      <View>
          <Text style={styles.sectionTitle}>Solicitudes Pendientes ({allies?.length || 0})</Text>
          {loadingAllies ? (
              <ActivityIndicator color="#2563eb" />
          ) : (allies?.length === 0 ? (
              <Text style={styles.emptyText}>No hay solicitudes pendientes</Text>
          ) : (
              allies?.map(ally => (
                  <View key={ally.id} style={styles.allyCard}>
                      <View style={styles.allyInfo}>
                          <Text style={styles.allyName}>{ally.name}</Text>
                          <Text style={styles.allyEmail}>{ally.email}</Text>
                          <Text style={styles.allyDate}>Solicitado: {new Date(ally.allyRequestDate).toLocaleDateString()}</Text>
                      </View>
                      <View style={styles.allyActions}>
                          <TouchableOpacity
                            style={[styles.actionBtn, styles.rejectBtn]}
                            onPress={() => handleAllyAction(ally.id, 'reject')}
                          >
                              <XCircle size={20} color="#ef4444" />
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={[styles.actionBtn, styles.approveBtn]}
                            onPress={() => handleAllyAction(ally.id, 'approve')}
                          >
                              <CheckCircle size={20} color="#10b981" />
                          </TouchableOpacity>
                      </View>
                  </View>
              ))
          ))}
      </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft color="#fff" size={24} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
            <Shield size={20} color="#10b981" />
            <Text style={styles.headerTitle}>Super Admin</Text>
        </View>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'overview' && styles.activeTab]}
            onPress={() => setActiveTab('overview')}
          >
              <Text style={[styles.tabText, activeTab === 'overview' && styles.activeTabText]}>Resumen</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'allies' && styles.activeTab]}
            onPress={() => setActiveTab('allies')}
          >
              <Text style={[styles.tabText, activeTab === 'allies' && styles.activeTabText]}>Aliados</Text>
          </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
          {activeTab === 'overview' ? renderOverview() : renderAllies()}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a', // Dark theme for Admin
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#1e293b',
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  headerTitleContainer: {
      flexDirection: 'row',
      gap: 8,
      alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  backButton: { padding: 4 },
  tabs: {
      flexDirection: 'row',
      backgroundColor: '#1e293b',
      padding: 4,
      margin: 16,
      borderRadius: 12,
  },
  tab: {
      flex: 1,
      paddingVertical: 10,
      alignItems: 'center',
      borderRadius: 8,
  },
  activeTab: {
      backgroundColor: '#334155',
  },
  tabText: {
      color: '#94a3b8',
      fontWeight: '600',
  },
  activeTabText: {
      color: '#fff',
  },
  content: {
      padding: 16,
  },
  statsGrid: {
      flexDirection: 'row',
      gap: 12,
      marginBottom: 24,
  },
  statCard: {
      flex: 1,
      backgroundColor: '#1e293b',
      padding: 16,
      borderRadius: 12,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: '#334155',
  },
  statValue: {
      fontSize: 20,
      fontWeight: 'bold',
      color: '#fff',
      marginVertical: 4,
  },
  statLabel: {
      fontSize: 12,
      color: '#94a3b8',
  },
  chartCard: {
      backgroundColor: '#1e293b',
      borderRadius: 16,
      padding: 16,
      marginBottom: 24,
      borderWidth: 1,
      borderColor: '#334155',
  },
  chartTitle: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '600',
      marginBottom: 16,
  },
  chart: {
      borderRadius: 16,
      marginVertical: 8,
  },
  volumeInfo: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 12,
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: '#334155',
  },
  volumeLabel: {
      color: '#94a3b8',
  },
  sectionTitle: {
      color: '#fff',
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 16,
  },
  emptyText: {
      color: '#64748b',
      textAlign: 'center',
      marginTop: 40,
  },
  allyCard: {
      backgroundColor: '#1e293b',
      padding: 16,
      borderRadius: 12,
      marginBottom: 12,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: '#334155',
  },
  allyInfo: {
      flex: 1,
  },
  allyName: {
      color: '#fff',
      fontWeight: 'bold',
      fontSize: 16,
  },
  allyEmail: {
      color: '#94a3b8',
      fontSize: 14,
  },
  allyDate: {
      color: '#64748b',
      fontSize: 12,
      marginTop: 4,
  },
  allyActions: {
      flexDirection: 'row',
      gap: 12,
  },
  actionBtn: {
      padding: 8,
      borderRadius: 8,
      backgroundColor: '#334155',
  },
  approveBtn: {
      backgroundColor: 'rgba(16, 185, 129, 0.2)',
  },
  rejectBtn: {
      backgroundColor: 'rgba(239, 68, 68, 0.2)',
  },
});
