import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, useRouter } from "expo-router";
import { 
  ArrowLeft, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Building2,
  Calendar,
  Timer
} from "lucide-react-native";
import { useNodoX } from "@/hooks/use-nodox-store";

export default function AllyStatusScreen() {
  const router = useRouter();
  const { user, getTempAccessTimeRemaining, checkTempAccessExpiry } = useNodoX();
  const [timeRemaining, setTimeRemaining] = useState<number>(0);

  useEffect(() => {
    if (user.allyStatus === "temp_approved") {
      const updateTimer = () => {
        const remaining = getTempAccessTimeRemaining();
        setTimeRemaining(remaining);
      };

      updateTimer();
      const interval = setInterval(updateTimer, 1000);
      return () => clearInterval(interval);
    }
  }, [user.allyStatus, getTempAccessTimeRemaining]);

  const formatTimeRemaining = (milliseconds: number): string => {
    const hours = Math.floor(milliseconds / (1000 * 60 * 60));
    const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((milliseconds % (1000 * 60)) / 1000);
    
    return `${hours}h ${minutes}m ${seconds}s`;
  };

  const getStatusInfo = () => {
    switch (user.allyStatus) {
      case "pending":
        return {
          icon: <Clock color="#f59e0b" size={32} />,
          title: "Solicitud en Revisión",
          subtitle: "Tu solicitud está siendo evaluada por nuestro equipo",
          color: "#f59e0b",
          bgColor: "#fef3c7",
          borderColor: "#fcd34d",
          description: "Estamos revisando la información proporcionada. Recibirás una respuesta en las próximas 24-48 horas.",
        };
      case "temp_approved":
        return {
          icon: <Timer color="#8b5cf6" size={32} />,
          title: "Acceso Temporal Aprobado",
          subtitle: "Tienes acceso temporal al panel de aliado",
          color: "#8b5cf6",
          bgColor: "#f3e8ff",
          borderColor: "#c4b5fd",
          description: "Tu solicitud ha sido pre-aprobada. Tienes acceso temporal de 48 horas para explorar las funcionalidades del panel de aliado mientras completamos la validación final.",
        };
      case "approved":
        return {
          icon: <CheckCircle color="#10b981" size={32} />,
          title: "¡Solicitud Aprobada!",
          subtitle: "Bienvenido como Aliado NodoX",
          color: "#10b981",
          bgColor: "#f0fdf4",
          borderColor: "#bbf7d0",
          description: "¡Felicitaciones! Tu solicitud ha sido aprobada. Ahora tienes acceso completo al panel de aliado y todas sus funcionalidades.",
        };
      case "rejected":
        return {
          icon: <XCircle color="#ef4444" size={32} />,
          title: "Solicitud Rechazada",
          subtitle: "Tu solicitud no pudo ser aprobada",
          color: "#ef4444",
          bgColor: "#fef2f2",
          borderColor: "#fecaca",
          description: "Lamentablemente, tu solicitud no cumple con los requisitos actuales. Puedes enviar una nueva solicitud con información actualizada.",
        };
      default:
        return {
          icon: <Building2 color="#64748b" size={32} />,
          title: "Sin Solicitud",
          subtitle: "No has enviado una solicitud de aliado",
          color: "#64748b",
          bgColor: "#f8fafc",
          borderColor: "#e2e8f0",
          description: "Para convertirte en aliado NodoX, debes completar y enviar una solicitud con la información de tu negocio.",
        };
    }
  };

  const statusInfo = getStatusInfo();

  const renderTimeRemaining = () => {
    if (user.allyStatus !== "temp_approved" || timeRemaining <= 0) return null;

    return (
      <View style={styles.timerCard}>
        <View style={styles.timerHeader}>
          <Timer color="#8b5cf6" size={20} />
          <Text style={styles.timerTitle}>Tiempo Restante</Text>
        </View>
        <Text style={styles.timerText}>{formatTimeRemaining(timeRemaining)}</Text>
        <Text style={styles.timerSubtext}>
          Tu acceso temporal expirará automáticamente
        </Text>
      </View>
    );
  };

  const renderActionButton = () => {
    if (user.allyStatus === "none" || user.allyStatus === "rejected") {
      return (
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => router.push('/ally-request')}
        >
          <Building2 color="#ffffff" size={20} />
          <Text style={styles.actionButtonText}>
            {user.allyStatus === "rejected" ? "Enviar Nueva Solicitud" : "Solicitar ser Aliado"}
          </Text>
        </TouchableOpacity>
      );
    }

    if (user.allyStatus === "temp_approved" || user.allyStatus === "approved") {
      return (
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => router.push('/ally-dashboard')}
        >
          <Building2 color="#ffffff" size={20} />
          <Text style={styles.actionButtonText}>Ir al Panel de Aliado</Text>
        </TouchableOpacity>
      );
    }

    return null;
  };

  const renderRequestInfo = () => {
    if (!user.allyRequestDate) return null;

    return (
      <View style={styles.infoCard}>
        <View style={styles.infoRow}>
          <Calendar color="#64748b" size={16} />
          <Text style={styles.infoLabel}>Fecha de Solicitud:</Text>
          <Text style={styles.infoValue}>
            {new Date(user.allyRequestDate).toLocaleDateString('es-ES', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </Text>
        </View>
        
        {user.allyApprovalDate && (
          <View style={styles.infoRow}>
            <CheckCircle color="#64748b" size={16} />
            <Text style={styles.infoLabel}>Fecha de Aprobación:</Text>
            <Text style={styles.infoValue}>
              {new Date(user.allyApprovalDate).toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: "Estado de Solicitud",
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <ArrowLeft color="#1e293b" size={24} />
            </TouchableOpacity>
          ),
        }}
      />
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Status Card */}
        <View style={[styles.statusCard, { backgroundColor: statusInfo.bgColor, borderColor: statusInfo.borderColor }]}>
          <View style={styles.statusIcon}>
            {statusInfo.icon}
          </View>
          <Text style={[styles.statusTitle, { color: statusInfo.color }]}>
            {statusInfo.title}
          </Text>
          <Text style={styles.statusSubtitle}>
            {statusInfo.subtitle}
          </Text>
          <Text style={styles.statusDescription}>
            {statusInfo.description}
          </Text>
        </View>

        {/* Timer Card */}
        {renderTimeRemaining()}

        {/* Request Info */}
        {renderRequestInfo()}

        {/* Warning for temp access */}
        {user.allyStatus === "temp_approved" && (
          <View style={styles.warningCard}>
            <AlertTriangle color="#f59e0b" size={20} />
            <View style={styles.warningContent}>
              <Text style={styles.warningTitle}>Acceso Temporal</Text>
              <Text style={styles.warningText}>
                Este es un acceso temporal de prueba. Para obtener acceso permanente, 
                nuestro equipo completará la validación de tu negocio en los próximos días.
              </Text>
            </View>
          </View>
        )}

        {/* Process Steps */}
        <View style={styles.processCard}>
          <Text style={styles.processTitle}>Proceso de Aprobación</Text>
          
          <View style={styles.processStep}>
            <View style={[styles.stepIndicator, { backgroundColor: "#10b981" }]}>
              <CheckCircle color="#ffffff" size={16} />
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Solicitud Enviada</Text>
              <Text style={styles.stepDescription}>Información recibida y en cola de revisión</Text>
            </View>
          </View>

          <View style={styles.processStep}>
            <View style={[
              styles.stepIndicator, 
              { backgroundColor: user.allyStatus === "pending" ? "#f59e0b" : "#10b981" }
            ]}>
              {user.allyStatus === "pending" ? (
                <Clock color="#ffffff" size={16} />
              ) : (
                <CheckCircle color="#ffffff" size={16} />
              )}
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Revisión Inicial</Text>
              <Text style={styles.stepDescription}>Validación de documentos y información</Text>
            </View>
          </View>

          <View style={styles.processStep}>
            <View style={[
              styles.stepIndicator, 
              { backgroundColor: user.allyStatus === "temp_approved" ? "#8b5cf6" : user.allyStatus === "approved" ? "#10b981" : "#e2e8f0" }
            ]}>
              {user.allyStatus === "temp_approved" ? (
                <Timer color="#ffffff" size={16} />
              ) : user.allyStatus === "approved" ? (
                <CheckCircle color="#ffffff" size={16} />
              ) : (
                <Clock color="#94a3b8" size={16} />
              )}
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Acceso Temporal</Text>
              <Text style={styles.stepDescription}>48 horas de prueba del panel de aliado</Text>
            </View>
          </View>

          <View style={styles.processStep}>
            <View style={[
              styles.stepIndicator, 
              { backgroundColor: user.allyStatus === "approved" ? "#10b981" : "#e2e8f0" }
            ]}>
              {user.allyStatus === "approved" ? (
                <CheckCircle color="#ffffff" size={16} />
              ) : (
                <Clock color="#94a3b8" size={16} />
              )}
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Aprobación Final</Text>
              <Text style={styles.stepDescription}>Acceso completo y permanente</Text>
            </View>
          </View>
        </View>

        {/* Action Button */}
        {renderActionButton()}

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  scrollView: {
    flex: 1,
  },
  statusCard: {
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 32,
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 16,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusIcon: {
    marginBottom: 16,
  },
  statusTitle: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
  },
  statusSubtitle: {
    fontSize: 16,
    color: "#64748b",
    textAlign: "center",
    marginBottom: 16,
  },
  statusDescription: {
    fontSize: 14,
    color: "#64748b",
    textAlign: "center",
    lineHeight: 20,
  },
  timerCard: {
    backgroundColor: "#ffffff",
    marginHorizontal: 20,
    marginTop: 16,
    padding: 20,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  timerHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 8,
  },
  timerTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
  },
  timerText: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#8b5cf6",
    marginBottom: 8,
  },
  timerSubtext: {
    fontSize: 12,
    color: "#64748b",
    textAlign: "center",
  },
  infoCard: {
    backgroundColor: "#ffffff",
    marginHorizontal: 20,
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: "#64748b",
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "500",
    color: "#1e293b",
  },
  warningCard: {
    flexDirection: "row",
    backgroundColor: "#fef3c7",
    marginHorizontal: 20,
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#fcd34d",
  },
  warningContent: {
    flex: 1,
    marginLeft: 12,
  },
  warningTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#92400e",
    marginBottom: 4,
  },
  warningText: {
    fontSize: 12,
    color: "#92400e",
    lineHeight: 16,
  },
  processCard: {
    backgroundColor: "#ffffff",
    marginHorizontal: 20,
    marginTop: 16,
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  processTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1e293b",
    marginBottom: 20,
  },
  processStep: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  stepIndicator: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 2,
  },
  stepDescription: {
    fontSize: 12,
    color: "#64748b",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#8b5cf6",
    marginHorizontal: 20,
    marginTop: 24,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ffffff",
  },
  bottomSpacing: {
    height: 32,
  },
});