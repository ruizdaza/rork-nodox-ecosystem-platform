import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAuth } from '@/hooks/use-auth';

interface NcopDisplayProps {
  value: number; // Value in NCOP
  showCop?: boolean;
  style?: any;
}

const NCOP_TO_COP = 100;

export const NcopDisplay = ({ value, showCop = true, style }: NcopDisplayProps) => {
  const { user } = useAuth();

  // Calculate potential discount based on user role for display context
  // This component just displays values, but if used for "Your Price", caller handles logic
  // or we can bake it in if value represents "Base Price".
  // For now, simple display as requested in doc: "NCOP principal, COP secundario"

  const copValue = value * NCOP_TO_COP;

  return (
    <View style={[styles.container, style]}>
      <Text style={styles.ncopText}>
        {value.toLocaleString()} <Text style={styles.currency}>NCOP</Text>
      </Text>
      {showCop && (
        <Text style={styles.copText}>
          ≈ ${copValue.toLocaleString()} COP
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  ncopText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#10b981', // Accent color
  },
  currency: {
    fontSize: 12,
    fontWeight: '600',
  },
  copText: {
    fontSize: 11,
    color: '#64748b', // Muted
    marginTop: 2,
  },
});
