import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Share, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Share2, Copy, Users, Gift } from 'lucide-react-native';
import { useAuth } from '@/hooks/use-auth';
import * as Clipboard from 'expo-clipboard';

export default function ReferralDashboardScreen() {
  const router = useRouter();
  const { user } = useAuth();

  const handleShare = async () => {
    try {
      await Share.share({
        message: `¡Únete a NodoX con mi código ${user?.referralCode} y gana beneficios increíbles! Descarga la app aquí: https://nodox.app`,
      });
    } catch (error) {
      console.error(error);
    }
  };

  const handleCopy = async () => {
    if (user?.referralCode) {
      await Clipboard.setStringAsync(user.referralCode);
      Alert.alert('Copiado', 'Código copiado al portapapeles');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft color="#1e293b" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Programa de Referidos</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.content}>
        <View style={styles.heroCard}>
          <Gift color="#ffffff" size={48} />
          <Text style={styles.heroTitle}>Gana NCOP Invitando</Text>
          <Text style={styles.heroSubtitle}>
            Recibe 500 NCOP por cada amigo que se registre y haga su primera recarga.
          </Text>
        </View>

        <View style={styles.codeSection}>
          <Text style={styles.codeLabel}>Tu código de referido</Text>
          <TouchableOpacity style={styles.codeContainer} onPress={handleCopy}>
            <Text style={styles.codeText}>{user?.referralCode || 'GENERANDO...'}</Text>
            <Copy color="#64748b" size={20} />
          </TouchableOpacity>
          <Text style={styles.codeHint}>Toca para copiar</Text>
        </View>

        <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
          <Share2 color="#ffffff" size={20} />
          <Text style={styles.shareButtonText}>Invitar Amigos</Text>
        </TouchableOpacity>

        {/* Stats Placeholder - Ideally fetch real stats from backend */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Users color="#2563eb" size={24} />
            <Text style={styles.statValue}>0</Text>
            <Text style={styles.statLabel}>Amigos Invitados</Text>
          </View>
          <View style={styles.statCard}>
            <Gift color="#10b981" size={24} />
            <Text style={styles.statValue}>0</Text>
            <Text style={styles.statLabel}>NCOP Ganados</Text>
          </View>
        </View>
      </View>
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
  },
  heroCard: {
    backgroundColor: '#2563eb',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 32,
    shadowColor: "#2563eb",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginTop: 16,
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 14,
    color: '#e0e7ff',
    textAlign: 'center',
    lineHeight: 20,
  },
  codeSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  codeLabel: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 12,
    fontWeight: '500',
  },
  codeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 16,
    gap: 12,
  },
  codeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    letterSpacing: 2,
  },
  codeHint: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 8,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10b981',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    marginBottom: 32,
    shadowColor: "#10b981",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  shareButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
  },
});
