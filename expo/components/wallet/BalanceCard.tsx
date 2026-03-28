import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Zap, TrendingUp, Settings } from 'lucide-react-native';
import { router } from 'expo-router';

interface BalanceCardProps {
  ncopBalance: number;
  copBalance: number;
  monthlyEarnings: number;
  preferredCurrency: 'NCOP' | 'COP';
}

const BalanceCard = React.memo<BalanceCardProps>(({ 
  ncopBalance, 
  copBalance, 
  monthlyEarnings,
  preferredCurrency 
}) => {
  const displayBalance = preferredCurrency === 'NCOP' ? ncopBalance : copBalance;
  const displayLabel = preferredCurrency === 'NCOP' ? 'Puntos NCOP' : 'Pesos COP';

  return (
    <LinearGradient
      colors={['#2563eb', '#3b82f6']}
      style={styles.balanceCard}
    >
      <View style={styles.balanceHeader}>
        <View style={styles.balanceHeaderLeft}>
          <Zap color="#ffffff" size={24} />
          <Text style={styles.balanceLabel}>Saldo disponible</Text>
        </View>
        <TouchableOpacity 
          style={styles.settingsButton}
          onPress={() => router.push('/wallet-settings')}
        >
          <Settings color="#ffffff" size={20} />
        </TouchableOpacity>
      </View>
      
      <Text style={styles.balanceAmount}>
        {preferredCurrency === 'NCOP' 
          ? displayBalance.toLocaleString() 
          : `$${displayBalance.toLocaleString()}`}
      </Text>
      <Text style={styles.balanceSubtext}>{displayLabel}</Text>
      
      <View style={styles.monthlyEarnings}>
        <TrendingUp color="#10b981" size={16} />
        <Text style={styles.monthlyText}>
          +{monthlyEarnings} NCOP este mes
        </Text>
      </View>
    </LinearGradient>
  );
});

BalanceCard.displayName = 'BalanceCard';

const styles = StyleSheet.create({
  balanceCard: {
    marginHorizontal: 20,
    marginBottom: 24,
    padding: 24,
    borderRadius: 16,
  },
  balanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  balanceHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  balanceLabel: {
    fontSize: 16,
    color: '#e2e8f0',
    fontWeight: '500' as const,
  },
  settingsButton: {
    padding: 4,
  },
  balanceAmount: {
    fontSize: 42,
    fontWeight: 'bold' as const,
    color: '#ffffff',
    marginBottom: 4,
  },
  balanceSubtext: {
    fontSize: 14,
    color: '#cbd5e1',
    marginBottom: 16,
  },
  monthlyEarnings: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  monthlyText: {
    fontSize: 12,
    color: '#ffffff',
    fontWeight: '500' as const,
  },
});

export default BalanceCard;
