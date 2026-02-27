import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, Switch, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, MapPin } from 'lucide-react-native';
import { trpc } from '@/lib/trpc';

export default function NewAddressScreen() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: '',
    street: '',
    city: '',
    instructions: '',
    isDefault: false
  });
  const [loading, setLoading] = useState(false);

  const addMutation = trpc.user.addAddress.useMutation();

  const handleSave = async () => {
    if (!form.name || !form.street || !form.city) {
      Alert.alert("Error", "Nombre, calle y ciudad son obligatorios");
      return;
    }

    setLoading(true);
    try {
      await addMutation.mutateAsync(form);
      Alert.alert("Éxito", "Dirección guardada");
      router.back();
    } catch (error) {
      Alert.alert("Error", "No se pudo guardar la dirección");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft color="#1e293b" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Nueva Dirección</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.formGroup}>
          <Text style={styles.label}>Nombre (ej. Casa, Oficina)</Text>
          <TextInput
            style={styles.input}
            placeholder="Casa"
            value={form.name}
            onChangeText={t => setForm(p => ({...p, name: t}))}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Dirección / Calle</Text>
          <TextInput
            style={styles.input}
            placeholder="Calle 123 # 45-67"
            value={form.street}
            onChangeText={t => setForm(p => ({...p, street: t}))}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Ciudad</Text>
          <TextInput
            style={styles.input}
            placeholder="Bogotá"
            value={form.city}
            onChangeText={t => setForm(p => ({...p, city: t}))}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Indicaciones adicionales (Opcional)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Torre 2, Apto 501, dejar en portería..."
            multiline
            numberOfLines={3}
            textAlignVertical="top"
            value={form.instructions}
            onChangeText={t => setForm(p => ({...p, instructions: t}))}
          />
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Marcar como predeterminada</Text>
          <Switch
            value={form.isDefault}
            onValueChange={v => setForm(p => ({...p, isDefault: v}))}
            trackColor={{ false: "#e2e8f0", true: "#2563eb" }}
          />
        </View>

        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? <ActivityIndicator color="white" /> : <Text style={styles.saveText}>Guardar Dirección</Text>}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
  },
  backButton: { padding: 4 },
  content: {
    padding: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#475569',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#1e293b',
  },
  textArea: {
    minHeight: 80,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
    paddingVertical: 8,
  },
  saveButton: {
    backgroundColor: '#2563eb',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
