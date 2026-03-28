import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Share } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, useRouter } from "expo-router";
import { ArrowLeft, FileText, Image, Video, Download, Share2 } from "lucide-react-native";

export default function ReferralMaterials() {
  const router = useRouter();

  const materials = [
    { id: "1", title: "Banner principal", type: "image", format: "PNG", size: "1200x628px" },
    { id: "2", title: "Historia Instagram", type: "image", format: "PNG", size: "1080x1920px" },
    { id: "3", title: "Video presentación", type: "video", format: "MP4", size: "30 seg" },
    { id: "4", title: "Plantilla de email", type: "document", format: "HTML", size: "2KB" },
  ];

  const handleDownload = (materialId: string) => {
    console.log(`Descargando material: ${materialId}`);
  };

  const handleShare = async (material: any) => {
    try {
      await Share.share({
        message: `Mira este material de NodoX: ${material.title}`,
      });
    } catch (error) {
      console.error(error);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "image":
        return Image;
      case "video":
        return Video;
      case "document":
        return FileText;
      default:
        return FileText;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          title: "Materiales de Marketing",
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <ArrowLeft color="#1e293b" size={24} />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Materiales de Marketing</Text>
          <Text style={styles.headerSubtitle}>
            Descarga recursos para promocionar NodoX
          </Text>
        </View>

        <View style={styles.materialsGrid}>
          {materials.map((material) => {
            const IconComponent = getIcon(material.type);
            return (
              <View key={material.id} style={styles.materialCard}>
                <View style={styles.materialIcon}>
                  <IconComponent color="#3b82f6" size={32} />
                </View>
                <Text style={styles.materialTitle}>{material.title}</Text>
                <Text style={styles.materialDetails}>
                  {material.format} • {material.size}
                </Text>
                <View style={styles.materialActions}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleDownload(material.id)}
                  >
                    <Download color="#ffffff" size={16} />
                    <Text style={styles.actionButtonText}>Descargar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.secondaryButton]}
                    onPress={() => handleShare(material)}
                  >
                    <Share2 color="#3b82f6" size={16} />
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
        </View>
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
    padding: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold" as const,
    color: "#1e293b",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#64748b",
  },
  materialsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 20,
    gap: 16,
  },
  materialCard: {
    width: "47%",
    backgroundColor: "#ffffff",
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  materialIcon: {
    width: 64,
    height: 64,
    backgroundColor: "#eff6ff",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  materialTitle: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#1e293b",
    marginBottom: 4,
  },
  materialDetails: {
    fontSize: 11,
    color: "#64748b",
    marginBottom: 12,
  },
  materialActions: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#3b82f6",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    gap: 4,
  },
  secondaryButton: {
    flex: 0,
    backgroundColor: "#eff6ff",
    paddingHorizontal: 12,
  },
  actionButtonText: {
    fontSize: 11,
    fontWeight: "600" as const,
    color: "#ffffff",
  },
});
