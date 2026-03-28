import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import {
  ArrowLeft,
  Gift,
  Coffee,
  Utensils,
  Car,
  Smartphone,
  Shirt,
  Heart,
  Check,
} from "lucide-react-native";
import { useRouter } from "expo-router";
import { useNodoX, ncopToCop } from "@/hooks/use-nodox-store";
import NodoXLogo from "@/components/NodoXLogo";

interface ExchangeOption {
  id: string;
  title: string;
  description: string;
  ncopCost: number;
  category: string;
  icon: any;
  color: string;
  discount?: string;
  partner?: string;
}

const exchangeOptions: ExchangeOption[] = [
  {
    id: "1",
    title: "20% descuento en restaurantes",
    description: "Válido en más de 50 restaurantes aliados",
    ncopCost: 500,
    category: "Gastronomía",
    icon: Utensils,
    color: "#ef4444",
    discount: "20%",
    partner: "Restaurantes aliados",
  },
  {
    id: "2",
    title: "15% descuento en moda",
    description: "Aplica en tiendas de ropa y accesorios",
    ncopCost: 400,
    category: "Moda",
    icon: Shirt,
    color: "#8b5cf6",
    discount: "15%",
    partner: "Tiendas de moda",
  },
  {
    id: "3",
    title: "Café gratis",
    description: "Un café de cualquier tamaño en cafeterías aliadas",
    ncopCost: 200,
    category: "Bebidas",
    icon: Coffee,
    color: "#92400e",
    partner: "Cafeterías aliadas",
  },
  {
    id: "4",
    title: "10% descuento en tecnología",
    description: "Válido en productos electrónicos y gadgets",
    ncopCost: 800,
    category: "Tecnología",
    icon: Smartphone,
    color: "#1d4ed8",
    discount: "10%",
    partner: "Tiendas de tecnología",
  },
  {
    id: "5",
    title: "25% descuento en spa y bienestar",
    description: "Tratamientos de relajación y belleza",
    ncopCost: 600,
    category: "Bienestar",
    icon: Heart,
    color: "#dc2626",
    discount: "25%",
    partner: "Spas y centros de bienestar",
  },
  {
    id: "6",
    title: "Descuento en transporte",
    description: "15% off en viajes con apps de transporte",
    ncopCost: 300,
    category: "Transporte",
    icon: Car,
    color: "#059669",
    discount: "15%",
    partner: "Apps de transporte",
  },
];

const categories = [
  { id: "all", name: "Todos", icon: Gift },
  { id: "Gastronomía", name: "Gastronomía", icon: Utensils },
  { id: "Moda", name: "Moda", icon: Shirt },
  { id: "Bebidas", name: "Bebidas", icon: Coffee },
  { id: "Tecnología", name: "Tecnología", icon: Smartphone },
  { id: "Bienestar", name: "Bienestar", icon: Heart },
  { id: "Transporte", name: "Transporte", icon: Car },
];

export default function ExchangeNCOPScreen() {
  const router = useRouter();
  const { ncopBalance, exchangeNCOP } = useNodoX();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedOption, setSelectedOption] = useState<ExchangeOption | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const filteredOptions = selectedCategory === "all" 
    ? exchangeOptions 
    : exchangeOptions.filter(option => option.category === selectedCategory);

  const handleExchange = (option: ExchangeOption) => {
    if (ncopBalance < option.ncopCost) {
      Alert.alert(
        "NCOP insuficientes",
        `Necesitas ${option.ncopCost} NCOP para este canje. Tu saldo actual es ${ncopBalance} NCOP.`,
        [{ text: "Entendido" }]
      );
      return;
    }
    
    setSelectedOption(option);
    setShowConfirmModal(true);
  };

  const confirmExchange = () => {
    if (!selectedOption) return;
    
    exchangeNCOP(selectedOption.ncopCost, selectedOption.title);
    setShowConfirmModal(false);
    setShowSuccessModal(true);
    
    setTimeout(() => {
      setShowSuccessModal(false);
      setSelectedOption(null);
    }, 2000);
  };

  const renderExchangeOption = (option: ExchangeOption) => {
    const IconComponent = option.icon;
    const canAfford = ncopBalance >= option.ncopCost;
    
    return (
      <TouchableOpacity
        key={option.id}
        style={[styles.optionCard, !canAfford && styles.optionCardDisabled]}
        onPress={() => handleExchange(option)}
        disabled={!canAfford}
      >
        <View style={[styles.optionIcon, { backgroundColor: option.color + "20" }]}>
          <IconComponent color={option.color} size={24} />
        </View>
        
        <View style={styles.optionContent}>
          <Text style={[styles.optionTitle, !canAfford && styles.disabledText]}>
            {option.title}
          </Text>
          <Text style={[styles.optionDescription, !canAfford && styles.disabledText]}>
            {option.description}
          </Text>
          {option.partner && (
            <Text style={[styles.optionPartner, !canAfford && styles.disabledText]}>
              {option.partner}
            </Text>
          )}
        </View>
        
        <View style={styles.optionPrice}>
          <Text style={[styles.ncopCost, !canAfford && styles.disabledText]}>
            {option.ncopCost} NCOP
          </Text>
          <Text style={[styles.copEquivalent, !canAfford && styles.disabledText]}>
            ${ncopToCop(option.ncopCost).toLocaleString()} COP
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft color="#1f2937" size={24} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <NodoXLogo size="medium" showText={false} />
          <Text style={styles.headerTitle}>Canjear NCOP</Text>
        </View>
        <View style={styles.placeholder} />
      </View>

      {/* Balance Card */}
      <LinearGradient
        colors={["#3b82f6", "#1d4ed8"]}
        style={styles.balanceCard}
      >
        <View style={styles.balanceHeader}>
          <Gift color="#ffffff" size={24} />
          <Text style={styles.balanceTitle}>Tu saldo NCOP</Text>
        </View>
        <Text style={styles.balanceAmount}>{ncopBalance.toLocaleString()}</Text>
        <Text style={styles.balanceEquivalent}>
          ${ncopToCop(ncopBalance).toLocaleString()} COP disponibles
        </Text>
      </LinearGradient>

      {/* Categories */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesContainer}
        contentContainerStyle={styles.categoriesContent}
      >
        {categories.map((category) => {
          const IconComponent = category.icon;
          const isSelected = selectedCategory === category.id;
          
          return (
            <TouchableOpacity
              key={category.id}
              style={[styles.categoryChip, isSelected && styles.categoryChipSelected]}
              onPress={() => setSelectedCategory(category.id)}
            >
              <IconComponent 
                color={isSelected ? "#ffffff" : "#6b7280"} 
                size={16} 
              />
              <Text style={[styles.categoryText, isSelected && styles.categoryTextSelected]}>
                {category.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Exchange Options */}
      <ScrollView style={styles.optionsContainer}>
        <Text style={styles.sectionTitle}>Opciones de canje</Text>
        {filteredOptions.map(renderExchangeOption)}
      </ScrollView>

      {/* Confirmation Modal */}
      <Modal
        visible={showConfirmModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowConfirmModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Gift color="#3b82f6" size={32} />
              <Text style={styles.modalTitle}>Confirmar canje</Text>
            </View>
            
            {selectedOption && (
              <>
                <Text style={styles.modalDescription}>
                  ¿Estás seguro de que quieres canjear {selectedOption.ncopCost} NCOP por:
                </Text>
                <Text style={styles.modalOptionTitle}>
                  {selectedOption.title}
                </Text>
                <Text style={styles.modalOptionDescription}>
                  {selectedOption.description}
                </Text>
                
                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => setShowConfirmModal(false)}
                  >
                    <Text style={styles.cancelButtonText}>Cancelar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.confirmButton}
                    onPress={confirmExchange}
                  >
                    <Text style={styles.confirmButtonText}>Confirmar canje</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* Success Modal */}
      <Modal
        visible={showSuccessModal}
        transparent
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.successModal}>
            <LinearGradient
              colors={["#10b981", "#059669"]}
              style={styles.successIcon}
            >
              <Check color="#ffffff" size={32} />
            </LinearGradient>
            <Text style={styles.successTitle}>¡Canje exitoso!</Text>
            <Text style={styles.successDescription}>
              Tu cupón ha sido activado y estará disponible en tu perfil.
            </Text>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  backButton: {
    padding: 8,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1f2937",
  },
  placeholder: {
    width: 40,
  },
  balanceCard: {
    margin: 20,
    padding: 24,
    borderRadius: 16,
    alignItems: "center",
  },
  balanceHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  balanceTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#ffffff",
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: "700",
    color: "#ffffff",
    marginBottom: 4,
  },
  balanceEquivalent: {
    fontSize: 14,
    color: "#bfdbfe",
  },
  categoriesContainer: {
    maxHeight: 60,
  },
  categoriesContent: {
    paddingHorizontal: 20,
    gap: 12,
  },
  categoryChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#ffffff",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  categoryChipSelected: {
    backgroundColor: "#3b82f6",
    borderColor: "#3b82f6",
  },
  categoryText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#6b7280",
  },
  categoryTextSelected: {
    color: "#ffffff",
  },
  optionsContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1f2937",
    marginVertical: 16,
  },
  optionCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  optionCardDisabled: {
    opacity: 0.5,
  },
  optionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 2,
  },
  optionPartner: {
    fontSize: 12,
    color: "#9ca3af",
  },
  optionPrice: {
    alignItems: "flex-end",
  },
  ncopCost: {
    fontSize: 16,
    fontWeight: "700",
    color: "#3b82f6",
  },
  copEquivalent: {
    fontSize: 12,
    color: "#6b7280",
  },
  disabledText: {
    color: "#9ca3af",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 24,
    width: "100%",
    maxWidth: 400,
  },
  modalHeader: {
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1f2937",
    marginTop: 8,
  },
  modalDescription: {
    fontSize: 16,
    color: "#6b7280",
    textAlign: "center",
    marginBottom: 12,
  },
  modalOptionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1f2937",
    textAlign: "center",
    marginBottom: 8,
  },
  modalOptionDescription: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
    marginBottom: 24,
  },
  modalActions: {
    flexDirection: "row",
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#d1d5db",
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#6b7280",
  },
  confirmButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: "#3b82f6",
    alignItems: "center",
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#ffffff",
  },
  successModal: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 32,
    alignItems: "center",
    width: "100%",
    maxWidth: 300,
  },
  successIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 8,
  },
  successDescription: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
  },
});