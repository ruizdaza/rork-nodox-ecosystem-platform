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
  TextInput,
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
  Target,
  Zap,
  QrCode,
  MessageCircle,
  Mail,
  Filter,
  Search,
  Plus,
  BarChart3,
  Megaphone,
  FileText,
  Wallet,
  Award,
  ChevronRight,
} from "lucide-react-native";
import { useRouter, Stack } from "expo-router";
import { useNodoX } from "@/hooks/use-nodox-store";
import { useReferralCRM } from "@/hooks/use-referral-crm";
import * as Clipboard from "expo-clipboard";
import { FunnelChart, MetricCard } from "@/components/ReferralCharts";

export default function ReferralDashboard() {
  const router = useRouter();
  const { user } = useNodoX();
  const { width } = useWindowDimensions();
  const [shareModalVisible, setShareModalVisible] = useState(false);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [addLeadModalVisible, setAddLeadModalVisible] = useState(false);
  const [copySuccess, setCopySuccess] = useState<string | null>(null);

  const {
    leads,
    stats,
    funnel,
    currentTier,
    nextTier,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    sourceFilter,
    setSourceFilter,
    sortBy,
    setSortBy,
    addLead,
  } = useReferralCRM();

  const [newLeadData, setNewLeadData] = useState({
    name: "",
    email: "",
    phone: "",
    notes: "",
  });

  const referralCode = "NODOX" + user.id.slice(-6).toUpperCase();
  const referralLink = `https://nodox.app/join?ref=${referralCode}`;

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

  const handleNativeShare = async () => {
    try {
      if (Platform.OS === "web") {
        if (navigator.share) {
          await navigator.share({
            title: "Únete a NodoX",
            text: `¡Únete a NodoX con mi código de referido ${referralCode} y obtén 500 NCOP gratis!`,
            url: referralLink,
          });
        } else {
          setShareModalVisible(true);
        }
      } else {
        await Share.share({
          message: `¡Únete a NodoX con mi código de referido ${referralCode} y obtén 500 NCOP gratis! ${referralLink}`,
          url: referralLink,
        });
      }
    } catch (error: any) {
      console.error("Error sharing:", error);
      if (
        error.message !== "User cancelled" &&
        !error.message.includes("AbortError")
      ) {
        setShareModalVisible(true);
      }
    }
  };

  const handleAddLead = () => {
    if (!newLeadData.name || !newLeadData.email) {
      return;
    }

    addLead({
      referrerId: user.id,
      name: newLeadData.name,
      email: newLeadData.email,
      phone: newLeadData.phone,
      status: "lead",
      source: "other",
      tags: [],
      notes: newLeadData.notes,
      isAlly: false,
      customFields: {},
    });

    setNewLeadData({ name: "", email: "", phone: "", notes: "" });
    setAddLeadModalVisible(false);
    setCopySuccess("Lead agregado exitosamente");
    setTimeout(() => setCopySuccess(null), 2000);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "converted":
        return "#10b981";
      case "qualified":
        return "#f59e0b";
      case "contacted":
        return "#3b82f6";
      case "lead":
        return "#8b5cf6";
      case "lost":
        return "#ef4444";
      default:
        return "#64748b";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "converted":
        return "Convertido";
      case "qualified":
        return "Calificado";
      case "contacted":
        return "Contactado";
      case "lead":
        return "Lead";
      case "lost":
        return "Perdido";
      default:
        return status;
    }
  };

  const tierProgress = nextTier
    ? {
        leads: (stats.totalLeads / nextTier.minLeads) * 100,
        revenue: (stats.totalLifetimeValue / nextTier.minRevenue) * 100,
      }
    : null;

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          title: "NodoX Conecta - CRM",
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <ArrowLeft color="#1e293b" size={24} />
            </TouchableOpacity>
          ),
          headerStyle: { backgroundColor: "#f8fafc" },
          headerTitleStyle: { color: "#1e293b", fontWeight: "bold" as const },
        }}
      />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header Stats */}
        <View style={styles.headerStats}>
          <LinearGradient
            colors={[currentTier.badge.color, currentTier.badge.color + "dd"]}
            style={styles.statsGradient}
          >
            <View style={styles.statsHeader}>
              <View style={styles.rankBadge}>
                <Trophy color="#ffffff" size={16} />
                <Text style={styles.rankText}>{currentTier.name}</Text>
              </View>
              <Text style={styles.totalEarnings}>
                {stats.totalCommissionsEarned.toLocaleString()} NCOP
              </Text>
              <Text style={styles.earningsLabel}>Comisiones totales</Text>
            </View>

            <View style={styles.quickStats}>
              <View style={styles.quickStat}>
                <Users color="rgba(255,255,255,0.8)" size={20} />
                <Text style={styles.quickStatNumber}>{stats.totalLeads}</Text>
                <Text style={styles.quickStatLabel}>Leads</Text>
              </View>
              <View style={styles.quickStat}>
                <TrendingUp color="rgba(255,255,255,0.8)" size={20} />
                <Text style={styles.quickStatNumber}>
                  {stats.conversionRate.toFixed(1)}%
                </Text>
                <Text style={styles.quickStatLabel}>Conversión</Text>
              </View>
              <View style={styles.quickStat}>
                <DollarSign color="rgba(255,255,255,0.8)" size={20} />
                <Text style={styles.quickStatNumber}>
                  {(stats.totalLifetimeValue / 1000).toFixed(0)}K
                </Text>
                <Text style={styles.quickStatLabel}>Valor Total</Text>
              </View>
            </View>

            {nextTier && tierProgress && (
              <View style={styles.tierProgress}>
                <Text style={styles.tierProgressLabel}>
                  Progreso a {nextTier.name}
                </Text>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      { width: `${Math.min(tierProgress.leads, 100)}%` },
                    ]}
                  />
                </View>
                <Text style={styles.tierProgressText}>
                  {stats.totalLeads} / {nextTier.minLeads} leads
                </Text>
              </View>
            )}
          </LinearGradient>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Acciones rápidas</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.quickActions}
          >
            <TouchableOpacity
              style={styles.quickActionCard}
              onPress={() => setAddLeadModalVisible(true)}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: "#3b82f620" }]}>
                <UserPlus color="#3b82f6" size={24} />
              </View>
              <Text style={styles.quickActionText}>Agregar Lead</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickActionCard}
              onPress={() => router.push("/referral-campaigns" as any)}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: "#f59e0b20" }]}>
                <Megaphone color="#f59e0b" size={24} />
              </View>
              <Text style={styles.quickActionText}>Campañas</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickActionCard}
              onPress={() => router.push("/referral-analytics" as any)}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: "#8b5cf620" }]}>
                <BarChart3 color="#8b5cf6" size={24} />
              </View>
              <Text style={styles.quickActionText}>Analytics</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickActionCard}
              onPress={() => router.push("/referral-materials" as any)}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: "#10b98120" }]}>
                <FileText color="#10b981" size={24} />
              </View>
              <Text style={styles.quickActionText}>Materiales</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickActionCard}
              onPress={() => router.push("/referral-commissions" as any)}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: "#ef444420" }]}>
                <Wallet color="#ef4444" size={24} />
              </View>
              <Text style={styles.quickActionText}>Comisiones</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* Key Metrics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Métricas clave</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.metricsScroll}
          >
            <MetricCard
              label="Leads este mes"
              value={stats.leadsThisMonth}
              change={stats.monthlyGrowth}
              color="#3b82f6"
            />
            <MetricCard
              label="Conversiones"
              value={stats.convertedLeads}
              color="#10b981"
            />
            <MetricCard
              label="Comisiones pendientes"
              value={`${stats.pendingCommissions.toLocaleString()} NCOP`}
              color="#f59e0b"
            />
            <MetricCard
              label="Valor promedio"
              value={`${(stats.averageLifetimeValue / 1000).toFixed(1)}K`}
              color="#8b5cf6"
            />
          </ScrollView>
        </View>

        {/* Conversion Funnel */}
        <View style={styles.section}>
          <FunnelChart data={funnel} />
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
            {copySuccess && (
              <View style={styles.copySuccessMessage}>
                <Text style={styles.copySuccessText}>{copySuccess}</Text>
              </View>
            )}
            <View style={styles.shareButtons}>
              <TouchableOpacity style={styles.shareButton} onPress={handleCopyLink}>
                <Copy color="#64748b" size={16} />
                <Text style={styles.shareButtonText}>Copiar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.shareButton} onPress={handleNativeShare}>
                <Share2 color="#64748b" size={16} />
                <Text style={styles.shareButtonText}>Compartir</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.shareButton}
                onPress={() => setShareModalVisible(true)}
              >
                <MessageCircle color="#64748b" size={16} />
                <Text style={styles.shareButtonText}>Más</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Leads List */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Mis Leads ({leads.length})</Text>
            <TouchableOpacity onPress={() => setFilterModalVisible(true)}>
              <Filter color="#64748b" size={20} />
            </TouchableOpacity>
          </View>

          <View style={styles.searchContainer}>
            <Search color="#64748b" size={20} />
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar por nombre, email o teléfono..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#94a3b8"
            />
          </View>

          <View style={styles.leadsList}>
            {leads.slice(0, 5).map((lead) => (
              <TouchableOpacity
                key={lead.id}
                style={styles.leadItem}
                onPress={() => router.push(`/referral-lead/${lead.id}` as any)}
              >
                <View style={styles.leadInfo}>
                  <View style={styles.leadHeader}>
                    <Text style={styles.leadName}>{lead.name}</Text>
                    {lead.isAlly && (
                      <View style={styles.allyBadge}>
                        <Award color="#f59e0b" size={12} />
                      </View>
                    )}
                  </View>
                  <Text style={styles.leadEmail}>{lead.email}</Text>
                  <View style={styles.leadMeta}>
                    <View
                      style={[
                        styles.statusBadge,
                        { backgroundColor: `${getStatusColor(lead.status)}20` },
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusText,
                          { color: getStatusColor(lead.status) },
                        ]}
                      >
                        {getStatusText(lead.status)}
                      </Text>
                    </View>
                    <Text style={styles.leadValue}>
                      {lead.lifetimeValue > 0
                        ? `${(lead.lifetimeValue / 1000).toFixed(1)}K COP`
                        : "Sin compras"}
                    </Text>
                  </View>
                </View>
                <ChevronRight color="#94a3b8" size={20} />
              </TouchableOpacity>
            ))}

            {leads.length > 5 && (
              <TouchableOpacity
                style={styles.viewAllButton}
                onPress={() => router.push("/referral-leads" as any)}
              >
                <Text style={styles.viewAllText}>Ver todos los leads</Text>
                <ChevronRight color="#3b82f6" size={16} />
              </TouchableOpacity>
            )}

            {leads.length === 0 && (
              <View style={styles.emptyState}>
                <Users color="#cbd5e1" size={48} />
                <Text style={styles.emptyStateText}>
                  Aún no tienes leads registrados
                </Text>
                <TouchableOpacity
                  style={styles.emptyStateButton}
                  onPress={() => setAddLeadModalVisible(true)}
                >
                  <Text style={styles.emptyStateButtonText}>Agregar primer lead</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>

        {/* Benefits Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Beneficios de tu tier</Text>
          <View style={styles.benefitsCard}>
            <View style={styles.benefitItem}>
              <Target color="#10b981" size={20} />
              <Text style={styles.benefitText}>
                {currentTier.benefits.commissionRate}% de comisión
              </Text>
            </View>
            <View style={styles.benefitItem}>
              <Zap color="#f59e0b" size={20} />
              <Text style={styles.benefitText}>
                {currentTier.benefits.bonusMultiplier}x multiplicador de bonos
              </Text>
            </View>
            {currentTier.benefits.prioritySupport && (
              <View style={styles.benefitItem}>
                <MessageCircle color="#3b82f6" size={20} />
                <Text style={styles.benefitText}>Soporte prioritario</Text>
              </View>
            )}
            {currentTier.benefits.customMaterials && (
              <View style={styles.benefitItem}>
                <FileText color="#8b5cf6" size={20} />
                <Text style={styles.benefitText}>Materiales personalizados</Text>
              </View>
            )}
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
                  if (Platform.OS === "web") {
                    window.open(
                      `https://wa.me/?text=${encodeURIComponent(
                        `¡Únete a NodoX con mi código de referido ${referralCode} y obtén 500 NCOP gratis! ${referralLink}`
                      )}`,
                      "_blank"
                    );
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
                  const emailSubject = "Únete a NodoX";
                  const emailBody = `¡Únete a NodoX con mi código de referido ${referralCode} y obtén 500 NCOP gratis!\\n\\n${referralLink}`;
                  const mailtoUrl = `mailto:?subject=${encodeURIComponent(
                    emailSubject
                  )}&body=${encodeURIComponent(emailBody)}`;
                  if (Platform.OS === "web") {
                    window.open(mailtoUrl);
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

      {/* Filter Modal */}
      <Modal
        visible={filterModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setFilterModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filtros</Text>
              <TouchableOpacity onPress={() => setFilterModalVisible(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>Estado</Text>
              <View style={styles.filterOptions}>
                {["all", "lead", "contacted", "qualified", "converted", "lost"].map(
                  (status) => (
                    <TouchableOpacity
                      key={status}
                      style={[
                        styles.filterChip,
                        statusFilter === status && styles.filterChipActive,
                      ]}
                      onPress={() => setStatusFilter(status as any)}
                    >
                      <Text
                        style={[
                          styles.filterChipText,
                          statusFilter === status && styles.filterChipTextActive,
                        ]}
                      >
                        {status === "all" ? "Todos" : getStatusText(status)}
                      </Text>
                    </TouchableOpacity>
                  )
                )}
              </View>
            </View>

            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>Fuente</Text>
              <View style={styles.filterOptions}>
                {[
                  "all",
                  "direct_link",
                  "qr_code",
                  "social_media",
                  "email",
                  "whatsapp",
                ].map((source) => (
                  <TouchableOpacity
                    key={source}
                    style={[
                      styles.filterChip,
                      sourceFilter === source && styles.filterChipActive,
                    ]}
                    onPress={() => setSourceFilter(source as any)}
                  >
                    <Text
                      style={[
                        styles.filterChipText,
                        sourceFilter === source && styles.filterChipTextActive,
                      ]}
                    >
                      {source === "all"
                        ? "Todas"
                        : source === "direct_link"
                        ? "Link"
                        : source === "qr_code"
                        ? "QR"
                        : source === "social_media"
                        ? "Social"
                        : source}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>Ordenar por</Text>
              <View style={styles.filterOptions}>
                {["date", "name", "value", "status"].map((sort) => (
                  <TouchableOpacity
                    key={sort}
                    style={[
                      styles.filterChip,
                      sortBy === sort && styles.filterChipActive,
                    ]}
                    onPress={() => setSortBy(sort as any)}
                  >
                    <Text
                      style={[
                        styles.filterChipText,
                        sortBy === sort && styles.filterChipTextActive,
                      ]}
                    >
                      {sort === "date"
                        ? "Fecha"
                        : sort === "name"
                        ? "Nombre"
                        : sort === "value"
                        ? "Valor"
                        : "Estado"}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <TouchableOpacity
              style={styles.applyFiltersButton}
              onPress={() => setFilterModalVisible(false)}
            >
              <Text style={styles.applyFiltersText}>Aplicar filtros</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Add Lead Modal */}
      <Modal
        visible={addLeadModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setAddLeadModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Agregar nuevo lead</Text>
              <TouchableOpacity onPress={() => setAddLeadModalVisible(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.formSection}>
              <Text style={styles.formLabel}>Nombre *</Text>
              <TextInput
                style={styles.formInput}
                placeholder="Nombre completo"
                value={newLeadData.name}
                onChangeText={(text) =>
                  setNewLeadData({ ...newLeadData, name: text })
                }
                placeholderTextColor="#94a3b8"
              />
            </View>

            <View style={styles.formSection}>
              <Text style={styles.formLabel}>Email *</Text>
              <TextInput
                style={styles.formInput}
                placeholder="email@ejemplo.com"
                value={newLeadData.email}
                onChangeText={(text) =>
                  setNewLeadData({ ...newLeadData, email: text })
                }
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor="#94a3b8"
              />
            </View>

            <View style={styles.formSection}>
              <Text style={styles.formLabel}>Teléfono</Text>
              <TextInput
                style={styles.formInput}
                placeholder="+57 300 123 4567"
                value={newLeadData.phone}
                onChangeText={(text) =>
                  setNewLeadData({ ...newLeadData, phone: text })
                }
                keyboardType="phone-pad"
                placeholderTextColor="#94a3b8"
              />
            </View>

            <View style={styles.formSection}>
              <Text style={styles.formLabel}>Notas</Text>
              <TextInput
                style={[styles.formInput, styles.formTextArea]}
                placeholder="Información adicional sobre el lead..."
                value={newLeadData.notes}
                onChangeText={(text) =>
                  setNewLeadData({ ...newLeadData, notes: text })
                }
                multiline
                numberOfLines={3}
                placeholderTextColor="#94a3b8"
              />
            </View>

            <TouchableOpacity
              style={[
                styles.addLeadButton,
                (!newLeadData.name || !newLeadData.email) &&
                  styles.addLeadButtonDisabled,
              ]}
              onPress={handleAddLead}
              disabled={!newLeadData.name || !newLeadData.email}
            >
              <Plus color="#ffffff" size={20} />
              <Text style={styles.addLeadButtonText}>Agregar lead</Text>
            </TouchableOpacity>
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
    fontWeight: "600" as const,
  },
  totalEarnings: {
    color: "#ffffff",
    fontSize: 32,
    fontWeight: "bold" as const,
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
    fontWeight: "bold" as const,
    marginTop: 8,
    marginBottom: 4,
  },
  quickStatLabel: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 12,
  },
  tierProgress: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.2)",
  },
  tierProgressLabel: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 12,
    marginBottom: 8,
    fontWeight: "600" as const,
  },
  progressBar: {
    height: 8,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#ffffff",
    borderRadius: 4,
  },
  tierProgressText: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 11,
    marginTop: 4,
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
    fontWeight: "bold" as const,
    color: "#1e293b",
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  quickActions: {
    paddingHorizontal: 20,
    gap: 12,
  },
  quickActionCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    minWidth: 100,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  quickActionText: {
    fontSize: 12,
    color: "#1e293b",
    fontWeight: "600" as const,
    textAlign: "center",
  },
  metricsScroll: {
    paddingHorizontal: 20,
    gap: 12,
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
    fontWeight: "bold" as const,
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
    fontWeight: "500" as const,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    marginHorizontal: 20,
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: "#1e293b",
  },
  leadsList: {
    paddingHorizontal: 20,
    gap: 12,
  },
  leadItem: {
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
  leadInfo: {
    flex: 1,
  },
  leadHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  leadName: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#1e293b",
  },
  allyBadge: {
    backgroundColor: "#fef3c7",
    padding: 4,
    borderRadius: 12,
  },
  leadEmail: {
    fontSize: 12,
    color: "#64748b",
    marginBottom: 8,
  },
  leadMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    fontWeight: "600" as const,
  },
  leadValue: {
    fontSize: 12,
    color: "#64748b",
    fontWeight: "500" as const,
  },
  viewAllButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ffffff",
    padding: 16,
    borderRadius: 12,
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  viewAllText: {
    fontSize: 14,
    color: "#3b82f6",
    fontWeight: "600" as const,
  },
  emptyState: {
    alignItems: "center",
    padding: 40,
    backgroundColor: "#ffffff",
    borderRadius: 12,
  },
  emptyStateText: {
    fontSize: 14,
    color: "#64748b",
    marginTop: 16,
    marginBottom: 20,
    textAlign: "center",
  },
  emptyStateButton: {
    backgroundColor: "#3b82f6",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyStateButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "600" as const,
  },
  benefitsCard: {
    backgroundColor: "#ffffff",
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    gap: 16,
  },
  benefitItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  benefitText: {
    fontSize: 14,
    color: "#1e293b",
    fontWeight: "500" as const,
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
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold" as const,
    color: "#1e293b",
  },
  modalClose: {
    fontSize: 18,
    color: "#64748b",
    fontWeight: "bold" as const,
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
    fontWeight: "600" as const,
  },
  filterSection: {
    marginBottom: 24,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#1e293b",
    marginBottom: 12,
  },
  filterOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#f1f5f9",
  },
  filterChipActive: {
    backgroundColor: "#3b82f6",
  },
  filterChipText: {
    fontSize: 12,
    color: "#64748b",
    fontWeight: "500" as const,
  },
  filterChipTextActive: {
    color: "#ffffff",
  },
  applyFiltersButton: {
    backgroundColor: "#3b82f6",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 8,
  },
  applyFiltersText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600" as const,
  },
  formSection: {
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#1e293b",
    marginBottom: 8,
  },
  formInput: {
    backgroundColor: "#f8fafc",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    fontSize: 14,
    color: "#1e293b",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  formTextArea: {
    height: 80,
    textAlignVertical: "top",
  },
  addLeadButton: {
    backgroundColor: "#3b82f6",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    marginTop: 8,
  },
  addLeadButtonDisabled: {
    backgroundColor: "#cbd5e1",
  },
  addLeadButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600" as const,
  },
});
