import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList, ActivityIndicator, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, useRouter } from "expo-router";
import { ArrowLeft, Package, Truck, CheckCircle, XCircle, Clock } from "lucide-react-native";
import { trpc } from "@/lib/trpc";

export default function AllyOrdersScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'pending' | 'shipped' | 'delivered' | 'cancelled'>('pending');

  const { data: orders, isLoading, refetch } = trpc.inventory.getAllyOrders.useQuery({});
  const updateStatusMutation = trpc.inventory.updateOrderStatus.useMutation();

  const filteredOrders = orders?.filter(order =>
    activeTab === 'pending' ? (order.status === 'pending' || !order.status) : order.status === activeTab
  ) || [];

  const handleStatusUpdate = async (orderId: string, newStatus: any) => {
    try {
      await updateStatusMutation.mutateAsync({ orderId, status: newStatus });
      Alert.alert("Éxito", "Estado actualizado correctamente");
      refetch();
    } catch (error) {
      Alert.alert("Error", "No se pudo actualizar el estado");
    }
  };

  const renderOrderItem = ({ item }: { item: any }) => (
    <View style={styles.orderCard}>
      <View style={styles.orderHeader}>
        <Text style={styles.orderId}>Pedido #{item.id.slice(-6).toUpperCase()}</Text>
        <Text style={styles.orderDate}>{new Date(item.createdAt).toLocaleDateString()}</Text>
      </View>

      <View style={styles.orderItems}>
        {item.items.map((prod: any, index: number) => (
          <View key={index} style={styles.productRow}>
            <Text style={styles.productName}>{prod.quantity}x {prod.productName || 'Producto'}</Text>
            <Text style={styles.productPrice}>${(prod.price * prod.quantity).toLocaleString()}</Text>
          </View>
        ))}
      </View>

      <View style={styles.orderFooter}>
        <Text style={styles.totalLabel}>Total</Text>
        <Text style={styles.totalValue}>${item.total.toLocaleString()}</Text>
      </View>

      {/* Actions based on status */}
      <View style={styles.actions}>
        {item.status === 'pending' && (
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: '#3b82f6' }]}
            onPress={() => handleStatusUpdate(item.id, 'shipped')}
          >
            <Truck color="white" size={16} />
            <Text style={styles.actionText}>Marcar Enviado</Text>
          </TouchableOpacity>
        )}
        {item.status === 'shipped' && (
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: '#10b981' }]}
            onPress={() => handleStatusUpdate(item.id, 'delivered')}
          >
            <CheckCircle color="white" size={16} />
            <Text style={styles.actionText}>Marcar Entregado</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft color="#1e293b" size={24} />
        </TouchableOpacity>
        <Text style={styles.title}>Gestión de Pedidos</Text>
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'pending' && styles.activeTab]}
          onPress={() => setActiveTab('pending')}
        >
          <Clock size={16} color={activeTab === 'pending' ? '#2563eb' : '#64748b'} />
          <Text style={[styles.tabText, activeTab === 'pending' && styles.activeTabText]}>Pendientes</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'shipped' && styles.activeTab]}
          onPress={() => setActiveTab('shipped')}
        >
          <Truck size={16} color={activeTab === 'shipped' ? '#2563eb' : '#64748b'} />
          <Text style={[styles.tabText, activeTab === 'shipped' && styles.activeTabText]}>Enviados</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'delivered' && styles.activeTab]}
          onPress={() => setActiveTab('delivered')}
        >
          <CheckCircle size={16} color={activeTab === 'delivered' ? '#2563eb' : '#64748b'} />
          <Text style={[styles.tabText, activeTab === 'delivered' && styles.activeTabText]}>Historial</Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#2563eb" />
        </View>
      ) : (
        <FlatList
          data={filteredOrders}
          renderItem={renderOrderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Package size={48} color="#cbd5e1" />
              <Text style={styles.emptyText}>No hay pedidos en esta sección</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    gap: 16,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1e293b",
  },
  tabs: {
    flexDirection: "row",
    backgroundColor: "white",
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  tab: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginRight: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  activeTab: {
    backgroundColor: "#eff6ff",
    borderColor: "#2563eb",
  },
  tabText: {
    color: "#64748b",
    fontSize: 14,
    fontWeight: "500",
  },
  activeTabText: {
    color: "#2563eb",
  },
  list: {
    padding: 20,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyState: {
    alignItems: "center",
    marginTop: 60,
    gap: 12,
  },
  emptyText: {
    color: "#94a3b8",
    fontSize: 16,
  },
  orderCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  orderId: {
    fontWeight: "600",
    color: "#1e293b",
  },
  orderDate: {
    color: "#64748b",
    fontSize: 12,
  },
  orderItems: {
    marginBottom: 12,
  },
  productRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  productName: {
    color: "#334155",
    flex: 1,
  },
  productPrice: {
    fontWeight: "500",
    color: "#1e293b",
  },
  orderFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  totalLabel: {
    fontWeight: "600",
    color: "#1e293b",
  },
  totalValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2563eb",
  },
  actions: {
    flexDirection: "row",
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
    borderRadius: 8,
    gap: 6,
  },
  actionText: {
    color: "white",
    fontWeight: "600",
    fontSize: 14,
  },
});
