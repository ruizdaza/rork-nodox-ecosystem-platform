import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Check, Star, Zap, Crown } from 'lucide-react-native';
import { useAuth } from '@/hooks/use-auth';
import { trpc } from '@/lib/trpc';
import { NcopDisplay } from '@/components/NcopDisplay';
import { useNodoX } from '@/hooks/use-nodox-store';

export default function MembershipsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { ncopBalance } = useNodoX(); // Get updated balance to prevent failed transactions
  const [loading, setLoading] = useState(false);

  const purchaseMutation = trpc.wallet.purchaseMembership.useMutation();

  const handlePurchase = async (planId: 'plus' | 'premium', price: number) => {
    if (ncopBalance < price) {
      Alert.alert(
        "Saldo Insuficiente",
        "No tienes suficientes NCOP. Recarga tu billetera para continuar.",
        [
          { text: "Cancelar", style: "cancel" },
          { text: "Recargar", onPress: () => router.push('/recharge') }
        ]
      );
      return;
    }

    Alert.alert(
      "Confirmar Compra",
      `¿Deseas mejorar tu plan por ${price} NCOP?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Confirmar",
          onPress: async () => {
            setLoading(true);
            try {
              await purchaseMutation.mutateAsync({ planId });
              Alert.alert("¡Felicidades!", "Tu membresía ha sido actualizada exitosamente.");
              router.back();
            } catch (error: any) {
              Alert.alert("Error", error.message || "No se pudo procesar la compra.");
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const isCurrentPlan = (plan: string) => user?.membershipType === plan;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft color="#1e293b" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Membresías NodoX</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.subtitle}>
          Obtén mejores descuentos y beneficios exclusivos mejorando tu plan.
        </Text>

        {/* FREE Plan */}
        <View style={[styles.card, isCurrentPlan('free') && styles.activeCard]}>
          <View style={styles.cardHeader}>
            <Star color="#64748b" size={24} />
            <Text style={styles.planName}>Free</Text>
            {isCurrentPlan('free') && <Text style={styles.currentBadge}>Actual</Text>}
          </View>
          <Text style={styles.price}>Gratis</Text>
          <View style={styles.features}>
            <View style={styles.featureRow}><Check size={16} color="#10b981" /><Text style={styles.featureText}>30% Descuento Marketplace</Text></View>
            <View style={styles.featureRow}><Check size={16} color="#10b981" /><Text style={styles.featureText}>Acceso Básico</Text></View>
          </View>
        </View>

        {/* PLUS Plan */}
        <View style={[styles.card, isCurrentPlan('plus') && styles.activeCard, styles.plusCard]}>
          <View style={styles.cardHeader}>
            <Zap color="#3b82f6" size={24} />
            <Text style={styles.planName}>Plus</Text>
            {isCurrentPlan('plus') && <Text style={styles.currentBadge}>Actual</Text>}
          </View>
          <View style={styles.priceContainer}>
            <NcopDisplay value={1000} showCop={false} />
            <Text style={styles.period}>/ mes</Text>
          </View>
          <View style={styles.features}>
            <View style={styles.featureRow}><Check size={16} color="#10b981" /><Text style={[styles.featureText, styles.highlightText]}>40% Descuento Marketplace</Text></View>
            <View style={styles.featureRow}><Check size={16} color="#10b981" /><Text style={styles.featureText}>Sin Publicidad</Text></View>
            <View style={styles.featureRow}><Check size={16} color="#10b981" /><Text style={styles.featureText}>Prioridad en Soporte</Text></View>
          </View>
          {!isCurrentPlan('plus') && !isCurrentPlan('premium') && (
            <TouchableOpacity
              style={styles.upgradeButton}
              onPress={() => handlePurchase('plus', 1000)}
              disabled={loading}
            >
              <Text style={styles.upgradeText}>Mejorar a Plus</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* PREMIUM Plan */}
        <View style={[styles.card, isCurrentPlan('premium') && styles.activeCard, styles.premiumCard]}>
          <View style={styles.cardHeader}>
            <Crown color="#eab308" size={24} />
            <Text style={styles.planName}>Premium</Text>
            {isCurrentPlan('premium') && <Text style={styles.currentBadge}>Actual</Text>}
          </View>
          <View style={styles.priceContainer}>
            <NcopDisplay value={1800} showCop={false} />
            <Text style={styles.period}>/ mes</Text>
          </View>
          <View style={styles.features}>
            <View style={styles.featureRow}><Check size={16} color="#10b981" /><Text style={[styles.featureText, styles.highlightText]}>45% Descuento Marketplace</Text></View>
            <View style={styles.featureRow}><Check size={16} color="#10b981" /><Text style={styles.featureText}>Acceso Anticipado a Ofertas</Text></View>
            <View style={styles.featureRow}><Check size={16} color="#10b981" /><Text style={styles.featureText}>Soporte VIP 24/7</Text></View>
            <View style={styles.featureRow}><Check size={16} color="#10b981" /><Text style={styles.featureText}>Laura Ads Opcionales</Text></View>
          </View>
          {!isCurrentPlan('premium') && (
            <TouchableOpacity
              style={[styles.upgradeButton, styles.premiumButton]}
              onPress={() => handlePurchase('premium', 1800)}
              disabled={loading}
            >
              <Text style={styles.upgradeText}>Mejorar a Premium</Text>
            </TouchableOpacity>
          )}
        </View>

        {loading && <ActivityIndicator size="large" color="#2563eb" style={{ marginTop: 20 }} />}

      </ScrollView>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 24,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  activeCard: {
    borderColor: '#10b981',
    borderWidth: 2,
    backgroundColor: '#f0fdf4',
  },
  plusCard: {
    borderColor: '#3b82f6',
  },
  premiumCard: {
    borderColor: '#eab308',
    backgroundColor: '#fffbeb',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  planName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    flex: 1,
  },
  currentBadge: {
    fontSize: 12,
    fontWeight: '600',
    color: '#10b981',
    backgroundColor: '#d1fae5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  price: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 16,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 16,
    gap: 4,
  },
  period: {
    fontSize: 14,
    color: '#64748b',
  },
  features: {
    gap: 8,
    marginBottom: 20,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  featureText: {
    fontSize: 14,
    color: '#475569',
  },
  highlightText: {
    fontWeight: '600',
    color: '#1e293b',
  },
  upgradeButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  premiumButton: {
    backgroundColor: '#eab308',
  },
  upgradeText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 14,
  },
});
