import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { ArrowLeft, CreditCard, Smartphone, Plus, Zap } from "lucide-react-native";
import { useNodoX } from "@/hooks/use-nodox-store";
import NodoXLogo from "@/components/NodoXLogo";

const RECHARGE_AMOUNTS = [10000, 20000, 50000, 100000, 200000, 500000];

export default function RechargeScreen() {
  const { copBalance, rechargeCOP } = useNodoX();
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"PSE" | "CARD">("PSE");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleRecharge = async () => {
    if (!selectedAmount) {
      Alert.alert("Error", "Por favor selecciona un monto a recargar");
      return;
    }

    setIsLoading(true);

    try {
      await rechargeCOP(selectedAmount, paymentMethod);
      
      Alert.alert(
        "Recarga exitosa", 
        `Has recargado $${selectedAmount.toLocaleString()} COP a tu billetera`,
        [{ text: "OK", onPress: () => router.back() }]
      );
    } catch (error) {
      Alert.alert("Error", "No se pudo completar la recarga. Intenta nuevamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft color="#1e293b" size={24} />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <NodoXLogo size="small" showText={false} />
            <Text style={styles.headerTitle}>Recargar saldo</Text>
          </View>
          <View style={styles.placeholder} />
        </View>

        {/* Current Balance */}
        <View style={styles.balanceCard}>
          <View style={styles.balanceHeader}>
            <Zap color="#2563eb" size={24} />
            <Text style={styles.balanceLabel}>Saldo actual</Text>
          </View>
          <Text style={styles.balanceAmount}>${copBalance.toLocaleString()}</Text>
          <Text style={styles.balanceSubtext}>Pesos colombianos (COP)</Text>
        </View>

        {/* Amount Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Selecciona el monto</Text>
          <View style={styles.amountGrid}>
            {RECHARGE_AMOUNTS.map((amount) => (
              <TouchableOpacity
                key={amount}
                style={[
                  styles.amountButton,
                  selectedAmount === amount && styles.amountButtonSelected
                ]}
                onPress={() => setSelectedAmount(amount)}
              >
                <Text style={[
                  styles.amountButtonText,
                  selectedAmount === amount && styles.amountButtonTextSelected
                ]}>
                  ${amount.toLocaleString()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Payment Method */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Método de pago</Text>
          <View style={styles.paymentMethods}>
            <TouchableOpacity
              style={[
                styles.paymentMethod,
                paymentMethod === "PSE" && styles.paymentMethodSelected
              ]}
              onPress={() => setPaymentMethod("PSE")}
            >
              <Smartphone color={paymentMethod === "PSE" ? "#ffffff" : "#2563eb"} size={24} />
              <View style={styles.paymentMethodContent}>
                <Text style={[
                  styles.paymentMethodTitle,
                  paymentMethod === "PSE" && styles.paymentMethodTitleSelected
                ]}>PSE</Text>
                <Text style={[
                  styles.paymentMethodSubtitle,
                  paymentMethod === "PSE" && styles.paymentMethodSubtitleSelected
                ]}>Débito desde tu banco</Text>
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.paymentMethod,
                paymentMethod === "CARD" && styles.paymentMethodSelected
              ]}
              onPress={() => setPaymentMethod("CARD")}
            >
              <CreditCard color={paymentMethod === "CARD" ? "#ffffff" : "#2563eb"} size={24} />
              <View style={styles.paymentMethodContent}>
                <Text style={[
                  styles.paymentMethodTitle,
                  paymentMethod === "CARD" && styles.paymentMethodTitleSelected
                ]}>Tarjeta</Text>
                <Text style={[
                  styles.paymentMethodSubtitle,
                  paymentMethod === "CARD" && styles.paymentMethodSubtitleSelected
                ]}>Crédito o débito</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Benefits Info */}
        <View style={styles.benefitsCard}>
          <Plus color="#10b981" size={20} />
          <View style={styles.benefitsContent}>
            <Text style={styles.benefitsTitle}>Beneficio por recarga</Text>
            <Text style={styles.benefitsDescription}>
              Recibe 5% adicional en NCOP por cada recarga que realices
            </Text>
          </View>
        </View>

        {/* Summary */}
        {selectedAmount && (
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Resumen de recarga</Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Monto a recargar:</Text>
              <Text style={styles.summaryValue}>${selectedAmount.toLocaleString()} COP</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Bonificación NCOP (5%):</Text>
              <Text style={styles.summaryValue}>+{Math.floor(selectedAmount * 0.05).toLocaleString()} NCOP</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Método de pago:</Text>
              <Text style={styles.summaryValue}>{paymentMethod}</Text>
            </View>
          </View>
        )}

        {/* Recharge Button */}
        <TouchableOpacity
          style={[
            styles.rechargeButton,
            (!selectedAmount || isLoading) && styles.rechargeButtonDisabled
          ]}
          onPress={handleRecharge}
          disabled={!selectedAmount || isLoading}
        >
          <Plus color="#ffffff" size={20} />
          <Text style={styles.rechargeButtonText}>
            {isLoading ? "Procesando..." : "Recargar saldo"}
          </Text>
        </TouchableOpacity>
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  backButton: {
    padding: 4,
  },
  headerCenter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1e293b",
  },
  placeholder: {
    width: 32,
  },
  balanceCard: {
    backgroundColor: "#ffffff",
    margin: 20,
    padding: 20,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  balanceHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 8,
  },
  balanceLabel: {
    fontSize: 16,
    color: "#64748b",
    fontWeight: "500",
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#1e293b",
    marginBottom: 4,
  },
  balanceSubtext: {
    fontSize: 14,
    color: "#64748b",
  },
  section: {
    marginHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 16,
  },
  amountGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  amountButton: {
    width: "48%",
    paddingVertical: 16,
    backgroundColor: "#ffffff",
    borderWidth: 2,
    borderColor: "#e2e8f0",
    borderRadius: 8,
    alignItems: "center",
  },
  amountButtonSelected: {
    borderColor: "#2563eb",
    backgroundColor: "#eff6ff",
  },
  amountButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#64748b",
  },
  amountButtonTextSelected: {
    color: "#2563eb",
  },
  paymentMethods: {
    gap: 12,
  },
  paymentMethod: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#e2e8f0",
    gap: 12,
  },
  paymentMethodSelected: {
    backgroundColor: "#2563eb",
    borderColor: "#2563eb",
  },
  paymentMethodContent: {
    flex: 1,
  },
  paymentMethodTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
  },
  paymentMethodTitleSelected: {
    color: "#ffffff",
  },
  paymentMethodSubtitle: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 2,
  },
  paymentMethodSubtitleSelected: {
    color: "#e2e8f0",
  },
  benefitsCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0fdf4",
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 12,
    gap: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#bbf7d0",
  },
  benefitsContent: {
    flex: 1,
  },
  benefitsTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#166534",
  },
  benefitsDescription: {
    fontSize: 12,
    color: "#15803d",
    marginTop: 2,
  },
  summaryCard: {
    backgroundColor: "#ffffff",
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 12,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: "#64748b",
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1e293b",
  },
  rechargeButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2563eb",
    marginHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    marginBottom: 20,
  },
  rechargeButtonDisabled: {
    backgroundColor: "#94a3b8",
  },
  rechargeButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ffffff",
  },
});