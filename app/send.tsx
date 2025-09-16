import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { ArrowLeft, Send, User, Mail } from "lucide-react-native";
import { useNodoX } from "@/hooks/use-nodox-store";
import NodoXLogo from "@/components/NodoXLogo";

export default function SendScreen() {
  const { ncopBalance, copBalance, sendNCOP, sendCOP } = useNodoX();
  const [recipient, setRecipient] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [currency, setCurrency] = useState<"NCOP" | "COP">("NCOP");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSend = async () => {
    if (!recipient.trim()) {
      Alert.alert("Error", "Por favor ingresa el email del destinatario");
      return;
    }

    if (!amount.trim() || isNaN(Number(amount)) || Number(amount) <= 0) {
      Alert.alert("Error", "Por favor ingresa un monto válido");
      return;
    }

    const numAmount = Number(amount);
    const availableBalance = currency === "NCOP" ? ncopBalance : copBalance;

    if (numAmount > availableBalance) {
      Alert.alert("Error", `Saldo insuficiente. Tienes ${availableBalance} ${currency} disponibles`);
      return;
    }

    setIsLoading(true);

    try {
      if (currency === "NCOP") {
        await sendNCOP(recipient, numAmount);
      } else {
        await sendCOP(recipient, numAmount);
      }

      Alert.alert(
        "Envío exitoso", 
        `Has enviado ${numAmount} ${currency} a ${recipient}`,
        [{ text: "OK", onPress: () => router.back() }]
      );
    } catch (error) {
      Alert.alert("Error", "No se pudo completar el envío. Intenta nuevamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.content}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft color="#1e293b" size={24} />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <NodoXLogo size="small" showText={false} />
            <Text style={styles.headerTitle}>Enviar dinero</Text>
          </View>
          <View style={styles.placeholder} />
        </View>

        {/* Balance Display */}
        <View style={styles.balanceSection}>
          <Text style={styles.balanceLabel}>Saldos disponibles</Text>
          <View style={styles.balanceRow}>
            <View style={styles.balanceItem}>
              <Text style={styles.balanceAmount}>{ncopBalance.toLocaleString()}</Text>
              <Text style={styles.balanceCurrency}>NCOP</Text>
            </View>
            <View style={styles.balanceItem}>
              <Text style={styles.balanceAmount}>${copBalance.toLocaleString()}</Text>
              <Text style={styles.balanceCurrency}>COP</Text>
            </View>
          </View>
        </View>

        {/* Currency Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tipo de moneda</Text>
          <View style={styles.currencySelector}>
            <TouchableOpacity
              style={[
                styles.currencyButton,
                currency === "NCOP" && styles.currencyButtonActive
              ]}
              onPress={() => setCurrency("NCOP")}
            >
              <Text style={[
                styles.currencyButtonText,
                currency === "NCOP" && styles.currencyButtonTextActive
              ]}>NCOP</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.currencyButton,
                currency === "COP" && styles.currencyButtonActive
              ]}
              onPress={() => setCurrency("COP")}
            >
              <Text style={[
                styles.currencyButtonText,
                currency === "COP" && styles.currencyButtonTextActive
              ]}>COP</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recipient Input */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Destinatario</Text>
          <View style={styles.inputContainer}>
            <Mail color="#64748b" size={20} />
            <TextInput
              style={styles.input}
              placeholder="Email del destinatario"
              value={recipient}
              onChangeText={setRecipient}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
        </View>

        {/* Amount Input */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Monto a enviar</Text>
          <View style={styles.inputContainer}>
            <Text style={styles.currencySymbol}>{currency}</Text>
            <TextInput
              style={styles.input}
              placeholder="0"
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
            />
          </View>
          <Text style={styles.availableBalance}>
            Disponible: {currency === "NCOP" ? ncopBalance.toLocaleString() : `$${copBalance.toLocaleString()}`} {currency}
          </Text>
        </View>

        {/* Send Button */}
        <TouchableOpacity
          style={[
            styles.sendButton,
            (!recipient.trim() || !amount.trim() || isLoading) && styles.sendButtonDisabled
          ]}
          onPress={handleSend}
          disabled={!recipient.trim() || !amount.trim() || isLoading}
        >
          <Send color="#ffffff" size={20} />
          <Text style={styles.sendButtonText}>
            {isLoading ? "Enviando..." : "Enviar dinero"}
          </Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
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
  balanceSection: {
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
  balanceLabel: {
    fontSize: 14,
    color: "#64748b",
    marginBottom: 12,
    fontWeight: "500",
  },
  balanceRow: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  balanceItem: {
    alignItems: "center",
  },
  balanceAmount: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1e293b",
  },
  balanceCurrency: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 4,
  },
  section: {
    marginHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 12,
  },
  currencySelector: {
    flexDirection: "row",
    backgroundColor: "#f1f5f9",
    borderRadius: 8,
    padding: 4,
  },
  currencyButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 6,
  },
  currencyButtonActive: {
    backgroundColor: "#2563eb",
  },
  currencyButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#64748b",
  },
  currencyButtonTextActive: {
    color: "#ffffff",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#1e293b",
  },
  currencySymbol: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2563eb",
  },
  availableBalance: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 8,
    textAlign: "right",
  },
  sendButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2563eb",
    marginHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    marginTop: "auto",
    marginBottom: 20,
  },
  sendButtonDisabled: {
    backgroundColor: "#94a3b8",
  },
  sendButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ffffff",
  },
});