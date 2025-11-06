import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { QrCode, Send, Plus, RefreshCw } from 'lucide-react-native';

interface QuickActionsProps {
  isLoading?: boolean;
}

const QuickActions = React.memo<QuickActionsProps>(({ isLoading = false }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Acciones rápidas</Text>
      <View style={styles.quickActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => router.push('/scanner')}
          disabled={isLoading}
        >
          <QrCode color="#ffffff" size={20} />
          <Text style={styles.actionButtonText}>Escanear</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => router.push('/send')}
          disabled={isLoading}
        >
          <Send color="#ffffff" size={20} />
          <Text style={styles.actionButtonText}>Enviar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => router.push('/recharge')}
          disabled={isLoading}
        >
          <Plus color="#ffffff" size={20} />
          <Text style={styles.actionButtonText}>Recargar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => router.push('/exchange-ncop')}
          disabled={isLoading}
        >
          <RefreshCw color="#ffffff" size={20} />
          <Text style={styles.actionButtonText}>Cambiar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
});

QuickActions.displayName = 'QuickActions';

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    color: '#1e293b',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563eb',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 6,
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: '#ffffff',
  },
});

export default QuickActions;
