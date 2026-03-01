import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Image,
  ActivityIndicator,
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
  Camera,
  Package,
} from "lucide-react-native";
import { useNodoX } from "@/hooks/use-nodox-store";
import * as ImagePicker from 'expo-image-picker';
import { useStorage } from "@/hooks/use-storage";
import { trpc } from "@/lib/trpc";

export default function AddServiceScreen() {
  const router = useRouter();
  const { addService } = useNodoX(); // Still keeping this for legacy/state sync if needed
  const { uploadImage, uploading: uploadingImage } = useStorage();

  const createProductMutation = trpc.inventory.createProduct.useMutation();
  
  const [serviceName, setServiceName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [price, setPrice] = useState<string>("");
  const [ncopPrice, setNcOpPrice] = useState<string>("");
  const [duration, setDuration] = useState<string>("");
  const [stock, setStock] = useState<string>("100"); // Default stock for services
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [isService, setIsService] = useState<boolean>(true); // Toggle between Product/Service
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const categories = [
    { id: "medical", icon: Stethoscope, title: "Médico", color: "#dc2626" },
    { id: "beauty", icon: Scissors, title: "Peluquería", color: "#7c3aed" },
    { id: "aesthetic", icon: Sparkles, title: "Estética", color: "#ec4899" },
    { id: "spa", icon: Heart, title: "Spa", color: "#059669" },
    { id: "products", icon: Package, title: "Productos", color: "#ea580c" },
  ];

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    if (!serviceName.trim()) {
      Alert.alert("Error", "El nombre es obligatorio");
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
    
    if (isService && (!duration.trim() || isNaN(Number(duration)))) {
      Alert.alert("Error", "La duración debe ser un número válido para servicios");
      return;
    }
    
    if (!selectedCategory) {
      Alert.alert("Error", "Selecciona una categoría");
      return;
    }

    setIsLoading(true);
    
    try {
      let imageUrl = "https://placehold.co/600x400"; // Default image

      if (imageUri) {
        // Upload image to Firebase Storage
        const filename = `products/${Date.now()}_${Math.random().toString(36).substr(2, 5)}.jpg`;
        imageUrl = await uploadImage(imageUri, filename);
      }

      const productData = {
        name: serviceName.trim(),
        description: description.trim(),
        price: Number(price),
        ncopPrice: ncopPrice ? Number(ncopPrice) : Number(price) * 100, // Default 100x conversion if not set
        category: categories.find(c => c.id === selectedCategory)?.title || "General",
        images: [imageUrl],
        stock: Number(stock),
        isService: isService,
        duration: isService ? Number(duration) : undefined,
      };
      
      // Save to Backend via tRPC
      await createProductMutation.mutateAsync(productData);

      // Legacy store update (optional, but keeps immediate UI sync if using store)
      addService(productData as any);
      
      Alert.alert(
        "Éxito", 
        `${isService ? 'Servicio' : 'Producto'} creado correctamente`,
        [
          {
            text: "OK",
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error: any) {
      Alert.alert("Error", error.message || "No se pudo crear el elemento");
      console.error("Create error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen 
        options={{
          headerShown: true,
          title: isService ? "Agregar Servicio" : "Agregar Producto",
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <ArrowLeft color="#1e293b" size={24} />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity 
              onPress={handleSave}
              disabled={isLoading || uploadingImage}
              style={[styles.saveButton, (isLoading || uploadingImage) && styles.saveButtonDisabled]}
            >
              {(isLoading || uploadingImage) ? (
                <ActivityIndicator size="small" color="#94a3b8" />
              ) : (
                <Save color="#2563eb" size={20} />
              )}
              <Text style={[styles.saveButtonText, (isLoading || uploadingImage) && styles.saveButtonTextDisabled]}>
                {(isLoading || uploadingImage) ? "Procesando..." : "Guardar"}
              </Text>
            </TouchableOpacity>
          ),
        }} 
      />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Toggle Type */}
        <View style={styles.typeToggle}>
            <TouchableOpacity
                style={[styles.typeButton, isService && styles.typeButtonActive]}
                onPress={() => setIsService(true)}
            >
                <Text style={[styles.typeText, isService && styles.typeTextActive]}>Servicio</Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={[styles.typeButton, !isService && styles.typeButtonActive]}
                onPress={() => setIsService(false)}
            >
                <Text style={[styles.typeText, !isService && styles.typeTextActive]}>Producto</Text>
            </TouchableOpacity>
        </View>

        {/* Image Picker */}
        <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
            {imageUri ? (
                <Image source={{ uri: imageUri }} style={styles.previewImage} />
            ) : (
                <View style={styles.imagePlaceholder}>
                    <Camera color="#94a3b8" size={40} />
                    <Text style={styles.imagePlaceholderText}>Subir Imagen</Text>
                </View>
            )}
        </TouchableOpacity>

        {/* Basic Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Información básica</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Nombre *</Text>
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
                placeholder="Describe el detalle..."
                placeholderTextColor="#94a3b8"
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>
          </View>
        </View>

        {/* Categories */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Categoría *</Text>
          <View style={styles.categoriesGrid}>
            {categories.map((category) => (
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

        {/* Pricing & Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Detalles</Text>
          
          <View style={styles.row}>
            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.inputLabel}>Precio (COP) *</Text>
              <View style={styles.inputContainer}>
                <DollarSign color="#64748b" size={20} />
                <TextInput
                  style={styles.textInput}
                  value={price}
                  onChangeText={setPrice}
                  placeholder="0"
                  placeholderTextColor="#94a3b8"
                  keyboardType="numeric"
                />
              </View>
            </View>
            
            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.inputLabel}>Precio (NCOP)</Text>
              <View style={styles.inputContainer}>
                <Sparkles color="#64748b" size={20} />
                <TextInput
                  style={styles.textInput}
                  value={ncopPrice}
                  onChangeText={setNcOpPrice}
                  placeholder="Opcional"
                  placeholderTextColor="#94a3b8"
                  keyboardType="numeric"
                />
              </View>
            </View>
          </View>

          <View style={styles.row}>
            {isService ? (
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
            ) : (
                <View style={[styles.inputGroup, styles.halfWidth]}>
                <Text style={styles.inputLabel}>Stock *</Text>
                <View style={styles.inputContainer}>
                    <Package color="#64748b" size={20} />
                    <TextInput
                    style={styles.textInput}
                    value={stock}
                    onChangeText={setStock}
                    placeholder="100"
                    placeholderTextColor="#94a3b8"
                    keyboardType="numeric"
                    />
                </View>
                </View>
            )}
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
  typeToggle: {
      flexDirection: 'row',
      backgroundColor: '#e2e8f0',
      borderRadius: 12,
      padding: 4,
      marginBottom: 24,
  },
  typeButton: {
      flex: 1,
      paddingVertical: 12,
      alignItems: 'center',
      borderRadius: 8,
  },
  typeButtonActive: {
      backgroundColor: '#ffffff',
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
  },
  typeText: {
      fontSize: 16,
      fontWeight: '600',
      color: '#64748b',
  },
  typeTextActive: {
      color: '#2563eb',
  },
  imagePicker: {
      height: 200,
      backgroundColor: '#ffffff',
      borderRadius: 12,
      marginBottom: 24,
      overflow: 'hidden',
      borderWidth: 2,
      borderColor: '#e2e8f0',
      borderStyle: 'dashed',
      justifyContent: 'center',
      alignItems: 'center',
  },
  imagePlaceholder: {
      alignItems: 'center',
      gap: 8,
  },
  imagePlaceholderText: {
      color: '#94a3b8',
      fontSize: 16,
      fontWeight: '500',
  },
  previewImage: {
      width: '100%',
      height: '100%',
      resizeMode: 'cover',
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
