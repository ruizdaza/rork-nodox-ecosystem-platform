import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Image,
  Share,
  Platform,
  TextInput,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import {
  ArrowLeft,
  QrCode,
  Plus,
  Download,
  Share2,
  Eye,
  Users,
  TrendingUp,
  X,
  Copy,
  CheckCircle,
  Trash2,
  MoreVertical,
  Edit,
} from "lucide-react-native";
import { useRouter, Stack } from "expo-router";
import { useNodoX } from "@/hooks/use-nodox-store";
import { trpc } from "@/lib/trpc";
import * as Clipboard from "expo-clipboard";

export default function ReferralQRCodesScreen() {
  const router = useRouter();
  const [selectedQR, setSelectedQR] = useState<any>(null);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [menuModalVisible, setMenuModalVisible] = useState(false);
  const [selectedQRForMenu, setSelectedQRForMenu] = useState<any>(null);
  const [copySuccess, setCopySuccess] = useState<string | null>(null);

  const [newQRData, setNewQRData] = useState({
    campaignName: "",
    expiresAt: "",
  });

  const qrCodesQuery = trpc.referral.getQRCodes.useQuery({});
  const qrStatsQuery = trpc.referral.getQRCodeStats.useQuery({});
  const createQRMutation = trpc.referral.createQRCode.useMutation();
  const deleteQRMutation = trpc.referral.deleteQRCode.useMutation();
  const updateQRMutation = trpc.referral.updateQRCode.useMutation();

  const qrCodes = qrCodesQuery.data || [];
  const stats = qrStatsQuery.data || {
    totalQRCodes: 0,
    activeQRCodes: 0,
    totalScans: 0,
    totalUniqueScans: 0,
    totalConversions: 0,
    conversionRate: 0,
  };

  const handleCreateQR = async () => {
    try {
      const expiresAt = newQRData.expiresAt
        ? new Date(Date.now() + parseInt(newQRData.expiresAt) * 24 * 60 * 60 * 1000).toISOString()
        : undefined;

      const result = await createQRMutation.mutateAsync({
        customData: newQRData.campaignName
          ? { campaignName: newQRData.campaignName }
          : undefined,
        expiresAt,
      });

      console.log("QR Code created:", result);
      setNewQRData({ campaignName: "", expiresAt: "" });
      setCreateModalVisible(false);
      qrCodesQuery.refetch();
      qrStatsQuery.refetch();

      setSelectedQR(result);
      setDetailsModalVisible(true);
    } catch (error) {
      console.error("Error creating QR code:", error);
      Alert.alert("Error", "No se pudo crear el código QR");
    }
  };

  const handleDeleteQR = async (qrId: string) => {
    Alert.alert(
      "Eliminar código QR",
      "¿Estás seguro de que quieres eliminar este código QR?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteQRMutation.mutateAsync({ qrId });
              console.log("QR Code deleted:", qrId);
              qrCodesQuery.refetch();
              qrStatsQuery.refetch();
              setMenuModalVisible(false);
              setSelectedQRForMenu(null);
            } catch (error) {
              console.error("Error deleting QR code:", error);
              Alert.alert("Error", "No se pudo eliminar el código QR");
            }
          },
        },
      ]
    );
  };

  const handleToggleActive = async (qrId: string, currentStatus: boolean) => {
    try {
      await updateQRMutation.mutateAsync({
        qrId,
        isActive: !currentStatus,
      });
      console.log("QR Code status updated:", qrId);
      qrCodesQuery.refetch();
      qrStatsQuery.refetch();
      setMenuModalVisible(false);
      setSelectedQRForMenu(null);
    } catch (error) {
      console.error("Error updating QR code:", error);
      Alert.alert("Error", "No se pudo actualizar el código QR");
    }
  };

  const handleCopyCode = async (code: string) => {
    await Clipboard.setStringAsync(code);
    setCopySuccess("Código copiado");
    setTimeout(() => setCopySuccess(null), 2000);
  };

  const handleCopyURL = async (url: string) => {
    await Clipboard.setStringAsync(url);
    setCopySuccess("URL copiada");
    setTimeout(() => setCopySuccess(null), 2000);
  };

  const handleDownloadQR = async (qrImageUrl: string, code: string) => {
    try {
      if (Platform.OS === "web") {
        const link = document.createElement("a");
        link.href = qrImageUrl;
        link.download = `QR-${code}.png`;
        link.click();
        setCopySuccess("QR descargado");
        setTimeout(() => setCopySuccess(null), 2000);
      } else {
        await Share.share({
          message: `Código QR de referido NodoX: ${code}`,
          url: qrImageUrl,
        });
      }
    } catch (error) {
      console.error("Error downloading QR:", error);
      Alert.alert("Error", "No se pudo descargar el código QR");
    }
  };

  const handleShareQR = async (qr: any) => {
    try {
      if (Platform.OS === "web") {
        if (navigator.share) {
          await navigator.share({
            title: "Mi código de referido NodoX",
            text: `Escanea este código QR para unirte a NodoX: ${qr.code}`,
            url: qr.url,
          });
        } else {
          await handleCopyURL(qr.url);
        }
      } else {
        await Share.share({
          message: `¡Únete a NodoX con mi código QR!\n\nCódigo: ${qr.code}\nURL: ${qr.url}`,
          url: qr.qrImageUrl,
        });
      }
    } catch (error: any) {
      if (
        error.message !== "User cancelled" &&
        !error.message.includes("AbortError")
      ) {
        console.error("Error sharing QR:", error);
      }
    }
  };

  const getStatusColor = (isActive: boolean, expiresAt?: string) => {
    if (expiresAt && new Date(expiresAt) < new Date()) return "#ef4444";
    return isActive ? "#10b981" : "#64748b";
  };

  const getStatusText = (isActive: boolean, expiresAt?: string) => {
    if (expiresAt && new Date(expiresAt) < new Date()) return "Expirado";
    return isActive ? "Activo" : "Inactivo";
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          title: "Códigos QR de Referido",
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <ArrowLeft color="#1e293b" size={24} />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity onPress={() => setCreateModalVisible(true)}>
              <Plus color="#3b82f6" size={24} />
            </TouchableOpacity>
          ),
          headerStyle: { backgroundColor: "#f8fafc" },
          headerTitleStyle: { color: "#1e293b", fontWeight: "bold" as const },
        }}
      />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Stats Section */}
        <View style={styles.statsSection}>
          <LinearGradient
            colors={["#3b82f6", "#2563eb"]}
            style={styles.statsGradient}
          >
            <View style={styles.statsHeader}>
              <View style={styles.statsIcon}>
                <QrCode color="#ffffff" size={32} />
              </View>
              <Text style={styles.statsTitle}>Estadísticas de QR</Text>
            </View>

            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{stats.totalQRCodes}</Text>
                <Text style={styles.statLabel}>Códigos totales</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{stats.activeQRCodes}</Text>
                <Text style={styles.statLabel}>Activos</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{stats.totalScans}</Text>
                <Text style={styles.statLabel}>Escaneos</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{stats.totalConversions}</Text>
                <Text style={styles.statLabel}>Conversiones</Text>
              </View>
            </View>

            <View style={styles.conversionRate}>
              <TrendingUp color="rgba(255,255,255,0.8)" size={20} />
              <Text style={styles.conversionRateText}>
                {stats.conversionRate.toFixed(1)}% tasa de conversión
              </Text>
            </View>
          </LinearGradient>
        </View>

        {/* QR Codes List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mis códigos QR</Text>

          {qrCodes.length === 0 ? (
            <View style={styles.emptyState}>
              <QrCode color="#cbd5e1" size={64} />
              <Text style={styles.emptyStateText}>
                Aún no tienes códigos QR
              </Text>
              <Text style={styles.emptyStateSubtext}>
                Crea tu primer código QR para compartir tu enlace de referido
              </Text>
              <TouchableOpacity
                style={styles.emptyStateButton}
                onPress={() => setCreateModalVisible(true)}
              >
                <Plus color="#ffffff" size={20} />
                <Text style={styles.emptyStateButtonText}>Crear código QR</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.qrList}>
              {qrCodes.map((qr) => (
                <TouchableOpacity
                  key={qr.id}
                  style={styles.qrCard}
                  onPress={() => {
                    setSelectedQR(qr);
                    setDetailsModalVisible(true);
                  }}
                >
                  <View style={styles.qrCardLeft}>
                    <Image
                      source={{ uri: qr.qrImageUrl }}
                      style={styles.qrThumbnail}
                    />
                    <View style={styles.qrInfo}>
                      <Text style={styles.qrCode}>{qr.code}</Text>
                      {qr.customData?.campaignName && (
                        <Text style={styles.qrCampaign}>
                          {qr.customData.campaignName}
                        </Text>
                      )}
                      <View style={styles.qrMeta}>
                        <View
                          style={[
                            styles.statusBadge,
                            {
                              backgroundColor: `${getStatusColor(
                                qr.isActive,
                                qr.expiresAt
                              )}20`,
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.statusText,
                              {
                                color: getStatusColor(qr.isActive, qr.expiresAt),
                              },
                            ]}
                          >
                            {getStatusText(qr.isActive, qr.expiresAt)}
                          </Text>
                        </View>
                        <View style={styles.qrStats}>
                          <Eye color="#64748b" size={14} />
                          <Text style={styles.qrStatText}>{qr.scans}</Text>
                          <Users color="#64748b" size={14} />
                          <Text style={styles.qrStatText}>{qr.conversions}</Text>
                        </View>
                      </View>
                    </View>
                  </View>

                  <TouchableOpacity
                    style={styles.qrMenuButton}
                    onPress={() => {
                      setSelectedQRForMenu(qr);
                      setMenuModalVisible(true);
                    }}
                  >
                    <MoreVertical color="#64748b" size={20} />
                  </TouchableOpacity>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Tips Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Consejos para usar QR</Text>
          <View style={styles.tipsCard}>
            <View style={styles.tipItem}>
              <View style={styles.tipIcon}>
                <CheckCircle color="#10b981" size={20} />
              </View>
              <Text style={styles.tipText}>
                Imprime los códigos QR en tarjetas de presentación
              </Text>
            </View>
            <View style={styles.tipItem}>
              <View style={styles.tipIcon}>
                <CheckCircle color="#10b981" size={20} />
              </View>
              <Text style={styles.tipText}>
                Colócalos en tu negocio o punto de venta
              </Text>
            </View>
            <View style={styles.tipItem}>
              <View style={styles.tipIcon}>
                <CheckCircle color="#10b981" size={20} />
              </View>
              <Text style={styles.tipText}>
                Compártelos en redes sociales y materiales digitales
              </Text>
            </View>
            <View style={styles.tipItem}>
              <View style={styles.tipIcon}>
                <CheckCircle color="#10b981" size={20} />
              </View>
              <Text style={styles.tipText}>
                Incluye un llamado a la acción atractivo
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Success Message */}
      {copySuccess && (
        <View style={styles.successToast}>
          <CheckCircle color="#10b981" size={16} />
          <Text style={styles.successToastText}>{copySuccess}</Text>
        </View>
      )}

      {/* Create QR Modal */}
      <Modal
        visible={createModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setCreateModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Crear código QR</Text>
              <TouchableOpacity onPress={() => setCreateModalVisible(false)}>
                <X color="#64748b" size={24} />
              </TouchableOpacity>
            </View>

            <View style={styles.formSection}>
              <Text style={styles.formLabel}>Nombre de campaña (opcional)</Text>
              <TextInput
                style={styles.formInput}
                placeholder="Ej: Evento Networking 2024"
                value={newQRData.campaignName}
                onChangeText={(text) =>
                  setNewQRData({ ...newQRData, campaignName: text })
                }
                placeholderTextColor="#94a3b8"
              />
            </View>

            <View style={styles.formSection}>
              <Text style={styles.formLabel}>Días hasta expiración (opcional)</Text>
              <TextInput
                style={styles.formInput}
                placeholder="Ej: 30"
                value={newQRData.expiresAt}
                onChangeText={(text) =>
                  setNewQRData({ ...newQRData, expiresAt: text })
                }
                keyboardType="numeric"
                placeholderTextColor="#94a3b8"
              />
              <Text style={styles.formHelper}>
                Deja vacío para que no expire
              </Text>
            </View>

            <TouchableOpacity
              style={styles.createButton}
              onPress={handleCreateQR}
              disabled={createQRMutation.isPending}
            >
              <QrCode color="#ffffff" size={20} />
              <Text style={styles.createButtonText}>
                {createQRMutation.isPending ? "Creando..." : "Crear código QR"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* QR Details Modal */}
      <Modal
        visible={detailsModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setDetailsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Detalles del QR</Text>
              <TouchableOpacity onPress={() => setDetailsModalVisible(false)}>
                <X color="#64748b" size={24} />
              </TouchableOpacity>
            </View>

            {selectedQR && (
              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.qrPreview}>
                  <Image
                    source={{ uri: selectedQR.qrImageUrl }}
                    style={styles.qrPreviewImage}
                  />
                </View>

                <View style={styles.qrDetailsSection}>
                  <Text style={styles.qrDetailsLabel}>Código</Text>
                  <View style={styles.qrDetailsValue}>
                    <Text style={styles.qrDetailsText}>{selectedQR.code}</Text>
                    <TouchableOpacity
                      onPress={() => handleCopyCode(selectedQR.code)}
                    >
                      <Copy color="#3b82f6" size={18} />
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.qrDetailsSection}>
                  <Text style={styles.qrDetailsLabel}>URL</Text>
                  <View style={styles.qrDetailsValue}>
                    <Text
                      style={[styles.qrDetailsText, styles.qrDetailsUrl]}
                      numberOfLines={1}
                    >
                      {selectedQR.url}
                    </Text>
                    <TouchableOpacity
                      onPress={() => handleCopyURL(selectedQR.url)}
                    >
                      <Copy color="#3b82f6" size={18} />
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.qrStatsGrid}>
                  <View style={styles.qrStatCard}>
                    <Eye color="#3b82f6" size={24} />
                    <Text style={styles.qrStatCardValue}>{selectedQR.scans}</Text>
                    <Text style={styles.qrStatCardLabel}>Escaneos</Text>
                  </View>
                  <View style={styles.qrStatCard}>
                    <Users color="#10b981" size={24} />
                    <Text style={styles.qrStatCardValue}>
                      {selectedQR.uniqueScans}
                    </Text>
                    <Text style={styles.qrStatCardLabel}>Únicos</Text>
                  </View>
                  <View style={styles.qrStatCard}>
                    <TrendingUp color="#f59e0b" size={24} />
                    <Text style={styles.qrStatCardValue}>
                      {selectedQR.conversions}
                    </Text>
                    <Text style={styles.qrStatCardLabel}>Conversiones</Text>
                  </View>
                </View>

                {selectedQR.customData?.campaignName && (
                  <View style={styles.qrDetailsSection}>
                    <Text style={styles.qrDetailsLabel}>Campaña</Text>
                    <Text style={styles.qrDetailsText}>
                      {selectedQR.customData.campaignName}
                    </Text>
                  </View>
                )}

                {selectedQR.expiresAt && (
                  <View style={styles.qrDetailsSection}>
                    <Text style={styles.qrDetailsLabel}>Expira el</Text>
                    <Text style={styles.qrDetailsText}>
                      {new Date(selectedQR.expiresAt).toLocaleDateString("es-ES")}
                    </Text>
                  </View>
                )}

                <View style={styles.actionButtons}>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.actionButtonPrimary]}
                    onPress={() =>
                      handleDownloadQR(selectedQR.qrImageUrl, selectedQR.code)
                    }
                  >
                    <Download color="#ffffff" size={18} />
                    <Text style={styles.actionButtonText}>Descargar</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.actionButton, styles.actionButtonSecondary]}
                    onPress={() => handleShareQR(selectedQR)}
                  >
                    <Share2 color="#3b82f6" size={18} />
                    <Text style={styles.actionButtonSecondaryText}>
                      Compartir
                    </Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* Menu Modal */}
      <Modal
        visible={menuModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.menuOverlay}
          activeOpacity={1}
          onPress={() => setMenuModalVisible(false)}
        >
          <View style={styles.menuContent}>
            {selectedQRForMenu && (
              <>
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => {
                    setSelectedQR(selectedQRForMenu);
                    setMenuModalVisible(false);
                    setDetailsModalVisible(true);
                  }}
                >
                  <Eye color="#1e293b" size={20} />
                  <Text style={styles.menuItemText}>Ver detalles</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() =>
                    handleToggleActive(
                      selectedQRForMenu.id,
                      selectedQRForMenu.isActive
                    )
                  }
                >
                  <Edit color="#1e293b" size={20} />
                  <Text style={styles.menuItemText}>
                    {selectedQRForMenu.isActive ? "Desactivar" : "Activar"}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => handleShareQR(selectedQRForMenu)}
                >
                  <Share2 color="#1e293b" size={20} />
                  <Text style={styles.menuItemText}>Compartir</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() =>
                    handleDownloadQR(
                      selectedQRForMenu.qrImageUrl,
                      selectedQRForMenu.code
                    )
                  }
                >
                  <Download color="#1e293b" size={20} />
                  <Text style={styles.menuItemText}>Descargar</Text>
                </TouchableOpacity>

                <View style={styles.menuDivider} />

                <TouchableOpacity
                  style={[styles.menuItem, styles.menuItemDanger]}
                  onPress={() => handleDeleteQR(selectedQRForMenu.id)}
                >
                  <Trash2 color="#ef4444" size={20} />
                  <Text style={styles.menuItemTextDanger}>Eliminar</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  statsSection: {
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
  statsIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  statsTitle: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "bold" as const,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  statCard: {
    width: "48%",
    backgroundColor: "rgba(255,255,255,0.15)",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 8,
  },
  statValue: {
    color: "#ffffff",
    fontSize: 28,
    fontWeight: "bold" as const,
    marginBottom: 4,
  },
  statLabel: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 12,
    textAlign: "center",
  },
  conversionRate: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.2)",
  },
  conversionRateText: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 14,
    fontWeight: "600" as const,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold" as const,
    color: "#1e293b",
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  emptyState: {
    alignItems: "center",
    padding: 40,
    marginHorizontal: 20,
    backgroundColor: "#ffffff",
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#1e293b",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: "#64748b",
    textAlign: "center",
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  emptyStateButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#3b82f6",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  emptyStateButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "600" as const,
  },
  qrList: {
    paddingHorizontal: 20,
    gap: 12,
  },
  qrCard: {
    backgroundColor: "#ffffff",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  qrCardLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 12,
  },
  qrThumbnail: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: "#f1f5f9",
  },
  qrInfo: {
    flex: 1,
  },
  qrCode: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#1e293b",
    marginBottom: 4,
  },
  qrCampaign: {
    fontSize: 12,
    color: "#64748b",
    marginBottom: 6,
  },
  qrMeta: {
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
  qrStats: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  qrStatText: {
    fontSize: 12,
    color: "#64748b",
    fontWeight: "500" as const,
  },
  qrMenuButton: {
    padding: 8,
  },
  tipsCard: {
    backgroundColor: "#ffffff",
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    gap: 16,
  },
  tipItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  tipIcon: {
    marginTop: 2,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: "#475569",
    lineHeight: 20,
  },
  successToast: {
    position: "absolute",
    bottom: 40,
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    gap: 8,
  },
  successToastText: {
    fontSize: 14,
    color: "#10b981",
    fontWeight: "600" as const,
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
    fontSize: 20,
    fontWeight: "bold" as const,
    color: "#1e293b",
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
  formHelper: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 4,
  },
  createButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#3b82f6",
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    marginTop: 8,
  },
  createButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600" as const,
  },
  qrPreview: {
    alignItems: "center",
    marginBottom: 24,
  },
  qrPreviewImage: {
    width: 250,
    height: 250,
    borderRadius: 12,
    backgroundColor: "#f1f5f9",
  },
  qrDetailsSection: {
    marginBottom: 20,
  },
  qrDetailsLabel: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: "#64748b",
    marginBottom: 6,
    textTransform: "uppercase" as const,
  },
  qrDetailsValue: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#f8fafc",
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  qrDetailsText: {
    flex: 1,
    fontSize: 14,
    color: "#1e293b",
    fontWeight: "500" as const,
  },
  qrDetailsUrl: {
    fontSize: 12,
  },
  qrStatsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  qrStatCard: {
    flex: 1,
    backgroundColor: "#f8fafc",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginHorizontal: 4,
  },
  qrStatCardValue: {
    fontSize: 24,
    fontWeight: "bold" as const,
    color: "#1e293b",
    marginTop: 8,
    marginBottom: 4,
  },
  qrStatCardLabel: {
    fontSize: 11,
    color: "#64748b",
  },
  actionButtons: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  actionButtonPrimary: {
    backgroundColor: "#3b82f6",
  },
  actionButtonSecondary: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#3b82f6",
  },
  actionButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "600" as const,
  },
  actionButtonSecondaryText: {
    color: "#3b82f6",
    fontSize: 14,
    fontWeight: "600" as const,
  },
  menuOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  menuContent: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 8,
    minWidth: 200,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    gap: 12,
  },
  menuItemText: {
    fontSize: 14,
    color: "#1e293b",
    fontWeight: "500" as const,
  },
  menuItemDanger: {
    backgroundColor: "#fef2f2",
  },
  menuItemTextDanger: {
    fontSize: 14,
    color: "#ef4444",
    fontWeight: "500" as const,
  },
  menuDivider: {
    height: 1,
    backgroundColor: "#e2e8f0",
    marginVertical: 4,
  },
});
