import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Share,
  Modal,
  useWindowDimensions,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import {
  ArrowLeft,
  Users,
  Share2,
  Copy,
  Trophy,
  TrendingUp,
  DollarSign,
  UserPlus,
  Star,
  Award,
  Target,
  Zap,
  QrCode,
  MessageCircle,
  Mail,
} from "lucide-react-native";
import { useRouter, Stack } from "expo-router";
import { useNodoX } from "@/hooks/use-nodox-store";
import * as Clipboard from "expo-clipboard";

interface ReferralStats {
  totalReferrals: number;
  activeReferrals: number;
  totalEarnings: number;
  monthlyEarnings: number;
  conversionRate: number;
  rank: string;
}

interface ReferredUser {
  id: string;
  name: string;
  email: string;
  joinDate: string;
  status: "active" | "pending" | "inactive";
  earnings: number;
  level: number;
}

export default function ReferralDashboard() {
  const router = useRouter();
  const { user } = useNodoX();
  const { width } = useWindowDimensions();
  const [shareModalVisible, setShareModalVisible] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<"week" | "month" | "year">("month");
  const [copySuccess, setCopySuccess] = useState<string | null>(null);
  const [shareMessage, setShareMessage] = useState<string | null>(null);

  const referralCode = "NODOX" + user.id.slice(-6).toUpperCase();
  const referralLink = `https://nodox.app/join?ref=${referralCode}`;

  const stats: ReferralStats = {
    totalReferrals: 24,
    activeReferrals: 18,
    totalEarnings: 12450,
    monthlyEarnings: 2340,
    conversionRate: 75,
    rank: "Embajador Gold",
  };

  const recentReferrals: ReferredUser[] = [
    {
      id: "1",
      name: "María González",
      email: "maria@email.com",
      joinDate: "2024-01-15",
      status: "active",
      earnings: 500,
      level: 2,
    },
    {
      id: "2",
      name: "Carlos Ruiz",
      email: "carlos@email.com",
      joinDate: "2024-01-12",
      status: "active",
      earnings: 750,
      level: 3,
    },
    {
      id: "3",
      name: "Ana López",
      email: "ana@email.com",
      joinDate: "2024-01-10",
      status: "pending",
      earnings: 0,
      level: 1,
    },
  ];

  const achievements = [
    { icon: Trophy, title: "Primer Referido", description: "Completado", earned: true },
    { icon: Users, title: "10 Referidos", description: "Completado", earned: true },
    { icon: Star, title: "Embajador", description: "Completado", earned: true },
    { icon: Award, title: "50 Referidos", description: "26/50 progreso", earned: false },
  ];

  const handleCopyCode = async () => {
    await Clipboard.setStringAsync(referralCode);
    setCopySuccess("Código copiado");
    setTimeout(() => setCopySuccess(null), 2000);
  };

  const handleCopyLink = async () => {
    await Clipboard.setStringAsync(referralLink);
    setCopySuccess("Enlace copiado");
    setTimeout(() => setCopySuccess(null), 2000);
  };

  const handleShare = async () => {
    try {
      if (Platform.OS === 'web') {
        // For web, try Web Share API first, fallback to clipboard
        if (navigator.share) {
          await navigator.share({
            title: 'Únete a NodoX',
            text: `¡Únete a NodoX con mi código de referido ${referralCode} y obtén 500 NCOP gratis!`,
            url: referralLink,
          });
        } else {
          // Fallback to clipboard for browsers without Web Share API
          await handleCopyLink();
          setShareMessage('Enlace copiado al portapapeles - ¡Compártelo donde quieras!');
          setTimeout(() => setShareMessage(null), 3000);
        }
      } else {
        // Use React Native Share for mobile
        await Share.share({
          message: `¡Únete a NodoX con mi código de referido ${referralCode} y obtén 500 NCOP gratis! ${referralLink}`,
          url: referralLink,
        });
      }
    } catch (error: any) {
      console.error("Error sharing:", error);
      // Only fallback to copying if it's not a user cancellation
      if (error.message !== 'User cancelled' && !error.message.includes('AbortError')) {
        try {
          await handleCopyLink();
          setShareMessage('Enlace copiado al portapapeles');
          setTimeout(() => setShareMessage(null), 3000);
        } catch (copyError) {
          console.error("Error copying:", copyError);
          setShareMessage('Error: No se pudo compartir el enlace');
          setTimeout(() => setShareMessage(null), 3000);
        }
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "#10b981";
      case "pending":
        return "#f59e0b";
      case "inactive":
        return "#ef4444";
      default:
        return "#64748b";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "active":
        return "Activo";
      case "pending":
        return "Pendiente";
      case "inactive":
        return "Inactivo";
      default:
        return "Desconocido";
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          title: "NodoX Conecta",
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <ArrowLeft color="#1e293b" size={24} />
            </TouchableOpacity>
          ),
          headerStyle: { backgroundColor: "#f8fafc" },
          headerTitleStyle: { color: "#1e293b", fontWeight: "bold" },
        }}
      />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header Stats */}
        <View style={styles.headerStats}>
          <LinearGradient colors={["#f59e0b", "#d97706"]} style={styles.statsGradient}>
            <View style={styles.statsHeader}>
              <View style={styles.rankBadge}>
                <Trophy color="#ffffff" size={16} />
                <Text style={styles.rankText}>{stats.rank}</Text>
              </View>
              <Text style={styles.totalEarnings}>{stats.totalEarnings.toLocaleString()} NCOP</Text>
              <Text style={styles.earningsLabel}>Ganancias totales</Text>
            </View>

            <View style={styles.quickStats}>
              <View style={styles.quickStat}>
                <Users color="rgba(255,255,255,0.8)" size={20} />
                <Text style={styles.quickStatNumber}>{stats.totalReferrals}</Text>
                <Text style={styles.quickStatLabel}>Referidos</Text>
              </View>
              <View style={styles.quickStat}>
                <TrendingUp color="rgba(255,255,255,0.8)" size={20} />
                <Text style={styles.quickStatNumber}>{stats.conversionRate}%</Text>
                <Text style={styles.quickStatLabel}>Conversión</Text>
              </View>
              <View style={styles.quickStat}>
                <DollarSign color="rgba(255,255,255,0.8)" size={20} />
                <Text style={styles.quickStatNumber}>{stats.monthlyEarnings}</Text>
                <Text style={styles.quickStatLabel}>Este mes</Text>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Referral Code Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tu código de referido</Text>
          <View style={styles.referralCodeCard}>
            <View style={styles.codeContainer}>
              <Text style={styles.referralCodeText}>{referralCode}</Text>
              <TouchableOpacity style={styles.copyButton} onPress={handleCopyCode}>
                <Copy color="#2563eb" size={16} />
              </TouchableOpacity>
            </View>
            <Text style={styles.referralLink}>{referralLink}</Text>
            {(copySuccess || shareMessage) && (
              <View style={styles.copySuccessMessage}>
                <Text style={styles.copySuccessText}>{copySuccess || shareMessage}</Text>
              </View>
            )}
            <View style={styles.shareButtons}>
              <TouchableOpacity style={styles.shareButton} onPress={handleCopyLink}>
                <Copy color="#64748b" size={16} />
                <Text style={styles.shareButtonText}>Copiar enlace</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
                <Share2 color="#64748b" size={16} />
                <Text style={styles.shareButtonText}>Compartir</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.shareButton}
                onPress={() => setShareModalVisible(true)}
              >
                <MessageCircle color="#64748b" size={16} />
                <Text style={styles.shareButtonText}>Más opciones</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Performance Metrics */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Rendimiento</Text>
            <View style={styles.periodSelector}>
              {["week", "month", "year"].map((period) => (
                <TouchableOpacity
                  key={period}
                  style={[
                    styles.periodButton,
                    selectedPeriod === period && styles.periodButtonActive,
                  ]}
                  onPress={() => setSelectedPeriod(period as any)}
                >
                  <Text
                    style={[
                      styles.periodButtonText,
                      selectedPeriod === period && styles.periodButtonTextActive,
                    ]}
                  >
                    {period === "week" ? "Semana" : period === "month" ? "Mes" : "Año"}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.metricsGrid}>
            <View style={[styles.metricCard, { width: (width - 56) / 2 }]}>
              <UserPlus color="#10b981" size={24} />
              <Text style={styles.metricValue}>8</Text>
              <Text style={styles.metricLabel}>Nuevos referidos</Text>
            </View>
            <View style={[styles.metricCard, { width: (width - 56) / 2 }]}>
              <Zap color="#f59e0b" size={24} />
              <Text style={styles.metricValue}>18</Text>
              <Text style={styles.metricLabel}>Referidos activos</Text>
            </View>
            <View style={[styles.metricCard, { width: (width - 56) / 2 }]}>
              <Target color="#8b5cf6" size={24} />
              <Text style={styles.metricValue}>2,340</Text>
              <Text style={styles.metricLabel}>NCOP ganados</Text>
            </View>
            <View style={[styles.metricCard, { width: (width - 56) / 2 }]}>
              <TrendingUp color="#ef4444" size={24} />
              <Text style={styles.metricValue}>+15%</Text>
              <Text style={styles.metricLabel}>Crecimiento</Text>
            </View>
          </View>
        </View>

        {/* Recent Referrals */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Referidos recientes</Text>
          <View style={styles.referralsList}>
            {recentReferrals.map((referral) => (
              <View key={referral.id} style={styles.referralItem}>
                <View style={styles.referralInfo}>
                  <Text style={styles.referralName}>{referral.name}</Text>
                  <Text style={styles.referralEmail}>{referral.email}</Text>
                  <Text style={styles.referralDate}>
                    Se unió el {new Date(referral.joinDate).toLocaleDateString()}
                  </Text>
                </View>
                <View style={styles.referralStats}>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: `${getStatusColor(referral.status)}20` },
                    ]}
                  >
                    <Text style={[styles.statusText, { color: getStatusColor(referral.status) }]}>
                      {getStatusText(referral.status)}
                    </Text>
                  </View>
                  <Text style={styles.referralEarnings}>{referral.earnings} NCOP</Text>
                  <Text style={styles.referralLevel}>Nivel {referral.level}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Achievements */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Logros</Text>
          <View style={styles.achievementsList}>
            {achievements.map((achievement, index) => (
              <View key={`achievement-${index}`} style={styles.achievementItem}>
                <View
                  style={[
                    styles.achievementIcon,
                    {
                      backgroundColor: achievement.earned ? "#10b98120" : "#f1f5f920",
                    },
                  ]}
                >
                  <achievement.icon
                    color={achievement.earned ? "#10b981" : "#94a3b8"}
                    size={20}
                  />
                </View>
                <View style={styles.achievementContent}>
                  <Text
                    style={[
                      styles.achievementTitle,
                      { color: achievement.earned ? "#1e293b" : "#94a3b8" },
                    ]}
                  >
                    {achievement.title}
                  </Text>
                  <Text style={styles.achievementDescription}>{achievement.description}</Text>
                </View>
                {achievement.earned && (
                  <View style={styles.earnedBadge}>
                    <Star color="#fbbf24" size={16} fill="#fbbf24" />
                  </View>
                )}
              </View>
            ))}
          </View>
        </View>

        {/* How it Works */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>¿Cómo funciona?</Text>
          <View style={styles.howItWorksCard}>
            <View style={styles.stepItem}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>1</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Comparte tu código</Text>
                <Text style={styles.stepDescription}>
                  Invita a tus amigos usando tu código único
                </Text>
              </View>
            </View>
            <View style={styles.stepItem}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>2</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Ellos se registran</Text>
                <Text style={styles.stepDescription}>
                  Tus amigos crean su cuenta con tu código
                </Text>
              </View>
            </View>
            <View style={styles.stepItem}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>3</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Ambos ganan</Text>
                <Text style={styles.stepDescription}>
                  Tú ganas 500 NCOP y ellos también reciben 500 NCOP
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Share Modal */}
      <Modal
        visible={shareModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setShareModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Compartir código de referido</Text>
              <TouchableOpacity onPress={() => setShareModalVisible(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.shareOptions}>
              <TouchableOpacity 
                style={[styles.shareOption, { width: (width - 80) / 3 }]}
                onPress={() => {
                  if (Platform.OS === 'web') {
                    window.open(`https://wa.me/?text=${encodeURIComponent(`¡Únete a NodoX con mi código de referido ${referralCode} y obtén 500 NCOP gratis! ${referralLink}`)}`, '_blank');
                  } else {
                    // For mobile, this would need Linking.openURL
                    handleShare(); // Fallback to native share
                  }
                  setShareModalVisible(false);
                }}
              >
                <MessageCircle color="#25d366" size={24} />
                <Text style={styles.shareOptionText}>WhatsApp</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.shareOption, { width: (width - 80) / 3 }]}
                onPress={() => {
                  const emailSubject = 'Únete a NodoX';
                  const emailBody = `¡Únete a NodoX con mi código de referido ${referralCode} y obtén 500 NCOP gratis!\n\n${referralLink}`;
                  const mailtoUrl = `mailto:?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
                  if (Platform.OS === 'web') {
                    window.open(mailtoUrl);
                  } else {
                    // For mobile, this would need Linking.openURL
                    handleShare(); // Fallback to native share
                  }
                  setShareModalVisible(false);
                }}
              >
                <Mail color="#ea4335" size={24} />
                <Text style={styles.shareOptionText}>Email</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.shareOption, { width: (width - 80) / 3 }]}
                onPress={() => {
                  // Generate QR code functionality would go here
                  setShareMessage('Función de código QR próximamente');
                  setTimeout(() => setShareMessage(null), 2000);
                  setShareModalVisible(false);
                }}
              >
                <QrCode color="#1e293b" size={24} />
                <Text style={styles.shareOptionText}>Código QR</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  headerStats: {
    margin: 20,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  statsGradient: {
    padding: 24,
  },
  statsHeader: {
    alignItems: "center",
    marginBottom: 24,
  },
  rankBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 12,
    gap: 6,
  },
  rankText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "600",
  },
  totalEarnings: {
    color: "#ffffff",
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 4,
  },
  earningsLabel: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 14,
  },
  quickStats: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  quickStat: {
    alignItems: "center",
    flex: 1,
  },
  quickStatNumber: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 8,
    marginBottom: 4,
  },
  quickStatLabel: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 12,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1e293b",
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  periodSelector: {
    flexDirection: "row",
    backgroundColor: "#f1f5f9",
    borderRadius: 8,
    padding: 2,
  },
  periodButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  periodButtonActive: {
    backgroundColor: "#ffffff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  periodButtonText: {
    fontSize: 12,
    color: "#64748b",
    fontWeight: "500",
  },
  periodButtonTextActive: {
    color: "#1e293b",
    fontWeight: "600",
  },
  referralCodeCard: {
    backgroundColor: "#ffffff",
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  codeContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#f8fafc",
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  referralCodeText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1e293b",
    letterSpacing: 2,
  },
  copyButton: {
    padding: 8,
  },
  referralLink: {
    fontSize: 12,
    color: "#64748b",
    marginBottom: 16,
    textAlign: "center",
  },
  shareButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
  },
  shareButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f8fafc",
    paddingVertical: 12,
    borderRadius: 8,
    gap: 6,
  },
  shareButtonText: {
    fontSize: 12,
    color: "#64748b",
    fontWeight: "500",
  },
  metricsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 20,
    gap: 12,
  },
  metricCard: {
    backgroundColor: "#ffffff",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1e293b",
    marginTop: 8,
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 12,
    color: "#64748b",
    textAlign: "center",
  },
  referralsList: {
    paddingHorizontal: 20,
    gap: 12,
  },
  referralItem: {
    backgroundColor: "#ffffff",
    flexDirection: "row",
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  referralInfo: {
    flex: 1,
  },
  referralName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 2,
  },
  referralEmail: {
    fontSize: 12,
    color: "#64748b",
    marginBottom: 4,
  },
  referralDate: {
    fontSize: 11,
    color: "#94a3b8",
  },
  referralStats: {
    alignItems: "flex-end",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 4,
  },
  statusText: {
    fontSize: 10,
    fontWeight: "600",
  },
  referralEarnings: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 2,
  },
  referralLevel: {
    fontSize: 11,
    color: "#64748b",
  },
  achievementsList: {
    paddingHorizontal: 20,
    gap: 12,
  },
  achievementItem: {
    backgroundColor: "#ffffff",
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  achievementIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  achievementContent: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 2,
  },
  achievementDescription: {
    fontSize: 12,
    color: "#64748b",
  },
  earnedBadge: {
    marginLeft: 8,
  },
  howItWorksCard: {
    backgroundColor: "#ffffff",
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  stepItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#f59e0b",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  stepNumberText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "bold",
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 4,
  },
  stepDescription: {
    fontSize: 14,
    color: "#64748b",
    lineHeight: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    maxHeight: "50%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1e293b",
  },
  modalClose: {
    fontSize: 18,
    color: "#64748b",
    fontWeight: "bold",
  },
  shareOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
  },
  shareOption: {
    alignItems: "center",
    paddingVertical: 16,
  },
  shareOptionText: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 8,
    textAlign: "center",
  },
  copySuccessMessage: {
    backgroundColor: "#10b98120",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: "center",
    marginBottom: 12,
  },
  copySuccessText: {
    fontSize: 12,
    color: "#10b981",
    fontWeight: "600",
  },
});