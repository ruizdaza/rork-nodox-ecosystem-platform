import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { 
  Settings, 
  HelpCircle, 
  Shield, 
  Bell,
  ChevronRight,
  Star,
  Users,
  Gift,
  LogOut,
  Store,
  Sparkles,
  UserPlus,
  Crown
} from "lucide-react-native";
import { useNodoX } from "@/hooks/use-nodox-store";
import { useRouter } from "expo-router";
import NodoXLogo from "@/components/NodoXLogo";

export default function ProfileScreen() {
  const { user, ncopBalance } = useNodoX();
  const router = useRouter();

  const menuItems = [
    { 
      icon: Settings, 
      title: "Configuración", 
      subtitle: "Personaliza tu experiencia",
      onPress: () => router.push('/settings')
    },
    { 
      icon: Bell, 
      title: "Notificaciones", 
      subtitle: "Gestiona tus alertas",
      onPress: () => router.push('/settings')
    },
    { 
      icon: Shield, 
      title: "Privacidad y Seguridad", 
      subtitle: "Controla tu información",
      onPress: () => router.push('/settings')
    },
    { 
      icon: HelpCircle, 
      title: "Ayuda y Soporte", 
      subtitle: "Obtén asistencia 24/7",
      onPress: () => router.push('/help-support')
    },
  ];

  const statsItems = [
    { icon: Star, title: "Puntos ganados", value: "12,450 NCOP", color: "#fbbf24" },
    { icon: Users, title: "Amigos referidos", value: "8 personas", color: "#10b981" },
    { icon: Gift, title: "Ofertas canjeadas", value: "23 ofertas", color: "#8b5cf6" },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <NodoXLogo size="medium" style={styles.profileLogo} />
          <Image source={{ uri: user.avatar }} style={styles.profileImage} />
          <Text style={styles.userName}>{user.name}</Text>
          <Text style={styles.userEmail}>{user.email}</Text>
          
          <View style={styles.membershipBadge}>
            <Star color="#fbbf24" size={16} fill="#fbbf24" />
            <Text style={styles.membershipText}>NodePass Premium</Text>
          </View>
        </View>

        {/* Balance Summary */}
        <View style={styles.balanceSummary}>
          <Text style={styles.balanceLabel}>Saldo NCOP disponible</Text>
          <Text style={styles.balanceAmount}>{ncopBalance.toLocaleString()}</Text>
        </View>

        {/* Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mis estadísticas</Text>
          <View style={styles.statsContainer}>
            {statsItems.map((stat, index) => (
              <View key={index} style={styles.statItem}>
                <View style={[styles.statIcon, { backgroundColor: `${stat.color}20` }]}>
                  <stat.icon color={stat.color} size={20} />
                </View>
                <View style={styles.statContent}>
                  <Text style={styles.statValue}>{stat.value}</Text>
                  <Text style={styles.statTitle}>{stat.title}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Role Panels */}
        {user.roles.length > 1 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Mis Paneles</Text>
            
            {/* Panel de Aliado */}
            {user.roles.includes("ally") && (
              <TouchableOpacity 
                style={styles.roleCard}
                onPress={() => router.push('/ally-dashboard')}
              >
                <LinearGradient
                  colors={["#8b5cf6", "#a855f7"]}
                  style={styles.roleGradient}
                >
                  <Store color="#ffffff" size={24} />
                  <View style={styles.roleContent}>
                    <Text style={styles.roleTitle}>Panel de Aliado</Text>
                    <Text style={styles.roleSubtitle}>Gestiona tu negocio</Text>
                  </View>
                  <ChevronRight color="#ffffff" size={20} />
                </LinearGradient>
              </TouchableOpacity>
            )}
            
            {/* Panel de Artista */}
            {user.roles.includes("artist") && (
              <TouchableOpacity style={styles.roleCard}>
                <LinearGradient
                  colors={["#10b981", "#059669"]}
                  style={styles.roleGradient}
                >
                  <Sparkles color="#ffffff" size={24} />
                  <View style={styles.roleContent}>
                    <Text style={styles.roleTitle}>Panel de Artista</Text>
                    <Text style={styles.roleSubtitle}>Contenido digital</Text>
                  </View>
                  <ChevronRight color="#ffffff" size={20} />
                </LinearGradient>
              </TouchableOpacity>
            )}
            
            {/* Panel Conecta */}
            {user.roles.includes("referrer") && (
              <TouchableOpacity 
                style={styles.roleCard}
                onPress={() => router.push('/referral-dashboard')}
              >
                <LinearGradient
                  colors={["#f59e0b", "#d97706"]}
                  style={styles.roleGradient}
                >
                  <UserPlus color="#ffffff" size={24} />
                  <View style={styles.roleContent}>
                    <Text style={styles.roleTitle}>NodoX Conecta</Text>
                    <Text style={styles.roleSubtitle}>Referidos</Text>
                  </View>
                  <ChevronRight color="#ffffff" size={20} />
                </LinearGradient>
              </TouchableOpacity>
            )}
            
            {/* Panel de Admin */}
            {user.roles.includes("admin") && (
              <TouchableOpacity style={styles.roleCard}>
                <LinearGradient
                  colors={["#ef4444", "#dc2626"]}
                  style={styles.roleGradient}
                >
                  <Crown color="#ffffff" size={24} />
                  <View style={styles.roleContent}>
                    <Text style={styles.roleTitle}>Administración</Text>
                    <Text style={styles.roleSubtitle}>Panel completo</Text>
                  </View>
                  <ChevronRight color="#ffffff" size={20} />
                </LinearGradient>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Menu Items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Configuración</Text>
          {menuItems.map((item, index) => (
            <TouchableOpacity key={index} style={styles.menuItem} onPress={item.onPress}>
              <View style={styles.menuIcon}>
                <item.icon color="#64748b" size={20} />
              </View>
              <View style={styles.menuContent}>
                <Text style={styles.menuTitle}>{item.title}</Text>
                <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
              </View>
              <ChevronRight color="#64748b" size={20} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutButton}>
          <LogOut color="#ef4444" size={20} />
          <Text style={styles.logoutText}>Cerrar sesión</Text>
        </TouchableOpacity>

        {/* App Info */}
        <View style={styles.appInfo}>
          <Text style={styles.appInfoText}>NodoX v1.0.0</Text>
          <Text style={styles.appInfoText}>© 2024 NodoX. Todos los derechos reservados.</Text>
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
  profileHeader: {
    alignItems: "center",
    paddingVertical: 32,
    backgroundColor: "#ffffff",
    marginBottom: 16,
  },
  profileLogo: {
    marginBottom: 16,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 16,
  },
  userName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1e293b",
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: "#64748b",
    marginBottom: 16,
  },
  membershipBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fef3c7",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  membershipText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#92400e",
  },
  balanceSummary: {
    backgroundColor: "#ffffff",
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 20,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  balanceLabel: {
    fontSize: 14,
    color: "#64748b",
    marginBottom: 8,
  },
  balanceAmount: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#2563eb",
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1e293b",
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  statsContainer: {
    paddingHorizontal: 20,
    gap: 12,
  },
  statItem: {
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
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  statContent: {
    flex: 1,
  },
  statValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
  },
  statTitle: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 2,
  },
  menuItem: {
    backgroundColor: "#ffffff",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginHorizontal: 20,
    marginBottom: 8,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  menuIcon: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1e293b",
  },
  menuSubtitle: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 2,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ffffff",
    marginHorizontal: 20,
    marginBottom: 24,
    paddingVertical: 16,
    borderRadius: 8,
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#ef4444",
  },
  appInfo: {
    alignItems: "center",
    paddingVertical: 16,
    gap: 4,
  },
  appInfoText: {
    fontSize: 12,
    color: "#94a3b8",
  },
  // Role Panels
  roleCard: {
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  roleGradient: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 12,
  },
  roleContent: {
    flex: 1,
  },
  roleTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 2,
  },
  roleSubtitle: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.8)",
  },
});