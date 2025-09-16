import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, useRouter } from "expo-router";
import {
  ArrowLeft,
  Save,
  Clock,
  DollarSign,
  FileText,
  Users,
  Stethoscope,
  Scissors,
  Sparkles,
  Heart,
  PawPrint,
} from "lucide-react-native";
import { useNodoX } from "@/hooks/use-nodox-store";

export default function AddServiceScreen() {
  const router = useRouter();
  const { addService } = useNodoX();
  
  const [serviceName, setServiceName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [price, setPrice] = useState<string>("");
  const [duration, setDuration] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const serviceCategories = [
    { id: "medical", icon: Stethoscope, title: "Médico", color: "#dc2626" },
    { id: "beauty", icon: Scissors, title: "Peluquería", color: "#7c3aed" },
    { id: "aesthetic", icon: Sparkles, title: "Estética", color: "#ec4899" },
    { id: "spa", icon: Heart, title: "Spa", color: "#059669" },
    { id: "veterinary", icon: PawPrint, title: "Veterinario", color: "#ea580c" },
  ];

  const handleSaveService = async () => {
    if (!serviceName.trim()) {
      Alert.alert("Error", "El nombre del servicio es obligatorio");
      return;
    }
    
    if (!description.trim()) {
      Alert.alert("Error", "La descripción es obligatoria");
      return;
    }
    
    if (!price.trim() || isNaN(Number(price))) {
      Alert.alert("Error", "El precio debe ser un número válido");
      return;
    }
    
    if (!duration.trim() || isNaN(Number(duration))) {
      Alert.alert("Error", "La duración debe ser un número válido");
      return;
    }
    
    if (!selectedCategory) {
      Alert.alert("Error", "Selecciona una categoría");
      return;
    }

    setIsLoading(true);
    
    try {
      const newService = {
        name: serviceName.trim(),
        description: description.trim(),
        price: Number(price),
        duration: Number(duration),
        category: serviceCategories.find(c => c.id === selectedCategory)?.title || "",
        staff: [],
        isActive: true,
      };
      
      addService(newService);
      
      Alert.alert(
        "Éxito", 
        "Servicio agregado correctamente",
        [
          {
            text: "OK",
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error) {
      Alert.alert("Error", "No se pudo agregar el servicio");
      console.error("Error adding service:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen 
        options={{
          headerShown: true,
          title: "Agregar Servicio",
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <ArrowLeft color="#1e293b" size={24} />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity 
              onPress={handleSaveService}
              disabled={isLoading}
              style={[styles.saveButton, isLoading && styles.saveButtonDisabled]}
            >
              <Save color={isLoading ? "#94a3b8" : "#2563eb"} size={20} />
              <Text style={[styles.saveButtonText, isLoading && styles.saveButtonTextDisabled]}>
                {isLoading ? "Guardando..." : "Guardar"}
              </Text>
            </TouchableOpacity>
          ),
        }} 
      />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Service Name */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Información básica</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Nombre del servicio *</Text>
            <View style={styles.inputContainer}>
              <FileText color="#64748b" size={20} />
              <TextInput
                style={styles.textInput}
                value={serviceName}
                onChangeText={setServiceName}
                placeholder="Ej: Consulta médica general"
                placeholderTextColor="#94a3b8"
              />
            </View>
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Descripción *</Text>
            <View style={styles.inputContainer}>
              <FileText color="#64748b" size={20} />
              <TextInput
                style={[styles.textInput, styles.textArea]}
                value={description}
                onChangeText={setDescription}
                placeholder="Describe el servicio que ofreces..."
                placeholderTextColor="#94a3b8"
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>
          </View>
        </View>

        {/* Category Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Categoría del servicio *</Text>
          <View style={styles.categoriesGrid}>
            {serviceCategories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryCard,
                  selectedCategory === category.id && styles.categoryCardSelected
                ]}
                onPress={() => setSelectedCategory(category.id)}
              >
                <View style={[
                  styles.categoryIcon,
                  { backgroundColor: selectedCategory === category.id ? category.color : `${category.color}20` }
                ]}>
                  <category.icon 
                    color={selectedCategory === category.id ? "#ffffff" : category.color} 
                    size={24} 
                  />
                </View>
                <Text style={[
                  styles.categoryTitle,
                  selectedCategory === category.id && styles.categoryTitleSelected
                ]}>
                  {category.title}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Price and Duration */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Precio y duración</Text>
          
          <View style={styles.row}>
            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.inputLabel}>Precio (COP) *</Text>
              <View style={styles.inputContainer}>
                <DollarSign color="#64748b" size={20} />
                <TextInput
                  style={styles.textInput}
                  value={price}
                  onChangeText={setPrice}
                  placeholder="25000"
                  placeholderTextColor="#94a3b8"
                  keyboardType="numeric"
                />
              </View>
            </View>
            
            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.inputLabel}>Duración (min) *</Text>
              <View style={styles.inputContainer}>
                <Clock color="#64748b" size={20} />
                <TextInput
                  style={styles.textInput}
                  value={duration}
                  onChangeText={setDuration}
                  placeholder="45"
                  placeholderTextColor="#94a3b8"
                  keyboardType="numeric"
                />
              </View>
            </View>
          </View>
        </View>

        {/* Staff Assignment */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal asignado</Text>
          <View style={styles.staffPlaceholder}>
            <Users color="#94a3b8" size={32} />
            <Text style={styles.staffPlaceholderText}>
              Podrás asignar personal después de crear el servicio
            </Text>
          </View>
        </View>

        {/* Service Preview */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Vista previa</Text>
          <View style={styles.previewCard}>
            <View style={styles.previewHeader}>
              <Text style={styles.previewName}>
                {serviceName || "Nombre del servicio"}
              </Text>
              <Text style={styles.previewPrice}>
                ${price ? Number(price).toLocaleString() : "0"}
              </Text>
            </View>
            <Text style={styles.previewDescription}>
              {description || "Descripción del servicio"}
            </Text>
            <View style={styles.previewDetails}>
              <Text style={styles.previewDuration}>
                {duration ? `${duration} min` : "0 min"}
              </Text>
              <Text style={styles.previewCategory}>
                {selectedCategory ? serviceCategories.find(c => c.id === selectedCategory)?.title : "Sin categoría"}
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
  content: {
    flex: 1,
    padding: 20,
  },
  saveButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: "#eff6ff",
  },
  saveButtonDisabled: {
    backgroundColor: "#f1f5f9",
  },
  saveButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#2563eb",
  },
  saveButtonTextDisabled: {
    color: "#94a3b8",
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1e293b",
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: "#1e293b",
  },
  textArea: {
    minHeight: 80,
    paddingTop: 12,
  },
  row: {
    flexDirection: "row",
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  categoriesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  categoryCard: {
    alignItems: "center",
    padding: 16,
    backgroundColor: "#ffffff",
    borderRadius: 12,
    minWidth: 100,
    flex: 1,
    maxWidth: "48%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    borderWidth: 2,
    borderColor: "transparent",
  },
  categoryCardSelected: {
    borderColor: "#2563eb",
    backgroundColor: "#eff6ff",
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  categoryTitle: {
    fontSize: 12,
    fontWeight: "500",
    color: "#374151",
    textAlign: "center",
  },
  categoryTitleSelected: {
    color: "#2563eb",
    fontWeight: "600",
  },
  staffPlaceholder: {
    backgroundColor: "#ffffff",
    padding: 32,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  staffPlaceholderText: {
    fontSize: 14,
    color: "#64748b",
    textAlign: "center",
    marginTop: 12,
  },
  previewCard: {
    backgroundColor: "#ffffff",
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  previewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  previewName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
    flex: 1,
  },
  previewPrice: {
    fontSize: 16,
    fontWeight: "600",
    color: "#059669",
  },
  previewDescription: {
    fontSize: 14,
    color: "#64748b",
    marginBottom: 12,
  },
  previewDetails: {
    flexDirection: "row",
    gap: 16,
  },
  previewDuration: {
    fontSize: 14,
    color: "#64748b",
  },
  previewCategory: {
    fontSize: 14,
    color: "#64748b",
  },
});