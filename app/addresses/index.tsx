import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, MapPin, Plus, Trash2, Home, Briefcase } from 'lucide-react-native';
import { trpc } from '@/lib/trpc';

export default function AddressesScreen() {
  const router = useRouter();
  const { data: addresses, isLoading, refetch } = trpc.user.getAddresses.useQuery({});
  const deleteMutation = trpc.user.deleteAddress.useMutation();

  const handleDelete = (id: string) => {
    Alert.alert(
      "Eliminar dirección",
      "¿Estás seguro?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteMutation.mutateAsync({ addressId: id });
              refetch();
            } catch (error) {
              Alert.alert("Error", "No se pudo eliminar");
            }
          }
        }
      ]
    );
  };

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.card}>
      <View style={styles.iconContainer}>
        {item.name.toLowerCase().includes('oficina') ? <Briefcase size={20} color="#2563eb" /> : <Home size={20} color="#2563eb" />}
      </View>
      <View style={styles.info}>
        <Text style={styles.name}>
          {item.name} {item.isDefault && <Text style={styles.defaultBadge}>(Predeterminada)</Text>}
        </Text>
        <Text style={styles.address}>{item.street}, {item.city}</Text>
        {item.instructions && <Text style={styles.instructions}>Nota: {item.instructions}</Text>}
      </View>
      <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.deleteBtn}>
        <Trash2 size={18} color="#ef4444" />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft color="#1e293b" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mis Direcciones</Text>
        <View style={{ width: 24 }} />
      </View>

      {isLoading ? (
        <ActivityIndicator size="large" color="#2563eb" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={addresses}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.empty}>
              <MapPin size={48} color="#cbd5e1" />
              <Text style={styles.emptyText}>No tienes direcciones guardadas</Text>
            </View>
          }
        />
      )}

      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/addresses/new')}
      >
        <Plus color="white" size={24} />
        <Text style={styles.fabText}>Agregar Dirección</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
  },
  backButton: { padding: 4 },
  list: {
    padding: 20,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  info: {
    flex: 1,
  },
  name: {
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  defaultBadge: {
    color: '#10b981',
    fontSize: 12,
    fontWeight: '500',
  },
  address: {
    color: '#64748b',
    fontSize: 13,
  },
  instructions: {
    color: '#94a3b8',
    fontSize: 12,
    marginTop: 2,
    fontStyle: 'italic',
  },
  deleteBtn: {
    padding: 8,
  },
  empty: {
    alignItems: 'center',
    marginTop: 60,
    gap: 12,
  },
  emptyText: {
    color: '#94a3b8',
    fontSize: 16,
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    left: 20,
    backgroundColor: '#2563eb',
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    shadowColor: "#2563eb",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  fabText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
