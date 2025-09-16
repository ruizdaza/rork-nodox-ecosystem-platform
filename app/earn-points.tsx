import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Modal,
  TextInput,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import {
  ArrowLeft,
  TrendingUp,
  Users,
  ShoppingBag,
  Calendar,
  Star,
  Gift,
  CheckCircle,
  Clock,
  Target,
  Zap,
  Share2,
  MessageCircle,
  Camera,
  Heart,
  Play,
  Award,
  Coins,
  X,
  UserPlus,
} from "lucide-react-native";
import { useRouter, Stack } from "expo-router";
import { useNodoX } from "@/hooks/use-nodox-store";

interface EarnMethod {
  id: string;
  title: string;
  description: string;
  points: number;
  icon: any;
  color: string;
  category: "daily" | "social" | "shopping" | "referral" | "special";
  completed?: boolean;
  progress?: number;
  maxProgress?: number;
  timeLeft?: string;
}

interface Challenge {
  id: string;
  title: string;
  description: string;
  points: number;
  progress: number;
  maxProgress: number;
  timeLeft: string;
  difficulty: "easy" | "medium" | "hard";
  category: string;
}

export default function EarnPointsScreen() {
  const router = useRouter();
  const { ncopBalance, addNcop } = useNodoX();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [showTaskModal, setShowTaskModal] = useState<boolean>(false);
  const [selectedTask, setSelectedTask] = useState<EarnMethod | null>(null);
  const [completedTasks, setCompletedTasks] = useState<Set<string>>(new Set());

  const earnMethods: EarnMethod[] = [
    // Daily Tasks
    {
      id: "daily-login",
      title: "Inicio de sesión diario",
      description: "Inicia sesión todos los días para ganar puntos",
      points: 50,
      icon: Calendar,
      color: "#10b981",
      category: "daily",
      completed: true,
    },
    {
      id: "daily-check",
      title: "Revisar ofertas del día",
      description: "Explora las ofertas destacadas de hoy",
      points: 25,
      icon: Gift,
      color: "#f59e0b",
      category: "daily",
      progress: 3,
      maxProgress: 5,
    },
    {
      id: "daily-profile",
      title: "Completar perfil",
      description: "Actualiza tu información personal",
      points: 100,
      icon: Star,
      color: "#8b5cf6",
      category: "daily",
      progress: 4,
      maxProgress: 5,
    },

    // Social Tasks
    {
      id: "social-share",
      title: "Compartir en redes sociales",
      description: "Comparte NodoX con tus amigos",
      points: 75,
      icon: Share2,
      color: "#2563eb",
      category: "social",
    },
    {
      id: "social-review",
      title: "Escribir reseña",
      description: "Califica un negocio aliado",
      points: 150,
      icon: MessageCircle,
      color: "#06b6d4",
      category: "social",
    },
    {
      id: "social-photo",
      title: "Subir foto de compra",
      description: "Comparte una foto de tu experiencia",
      points: 100,
      icon: Camera,
      color: "#ec4899",
      category: "social",
    },

    // Shopping Tasks
    {
      id: "shopping-first",
      title: "Primera compra",
      description: "Realiza tu primera compra con NCOP",
      points: 500,
      icon: ShoppingBag,
      color: "#10b981",
      category: "shopping",
    },
    {
      id: "shopping-weekly",
      title: "Compra semanal",
      description: "Compra en 3 negocios diferentes esta semana",
      points: 300,
      icon: Target,
      color: "#f59e0b",
      category: "shopping",
      progress: 1,
      maxProgress: 3,
      timeLeft: "5 días",
    },
    {
      id: "shopping-loyalty",
      title: "Cliente frecuente",
      description: "Visita el mismo negocio 5 veces",
      points: 250,
      icon: Heart,
      color: "#ef4444",
      category: "shopping",
      progress: 3,
      maxProgress: 5,
    },

    // Referral Tasks
    {
      id: "referral-invite",
      title: "Invitar amigos",
      description: "Invita a 3 amigos a unirse a NodoX",
      points: 1500,
      icon: Users,
      color: "#8b5cf6",
      category: "referral",
      progress: 1,
      maxProgress: 3,
    },
    {
      id: "referral-active",
      title: "Amigos activos",
      description: "Tus referidos realizan su primera compra",
      points: 1000,
      icon: UserPlus,
      color: "#10b981",
      category: "referral",
      progress: 0,
      maxProgress: 1,
    },

    // Special Tasks
    {
      id: "special-video",
      title: "Ver video tutorial",
      description: "Aprende cómo usar NodoX al máximo",
      points: 50,
      icon: Play,
      color: "#ef4444",
      category: "special",
    },
    {
      id: "special-survey",
      title: "Completar encuesta",
      description: "Ayúdanos a mejorar la app",
      points: 200,
      icon: CheckCircle,
      color: "#06b6d4",
      category: "special",
    },
  ];

  const challenges: Challenge[] = [
    {
      id: "challenge-1",
      title: "Explorador de la semana",
      description: "Visita 10 negocios diferentes",
      points: 1000,
      progress: 6,
      maxProgress: 10,
      timeLeft: "3 días",
      difficulty: "medium",
      category: "Exploración",
    },
    {
      id: "challenge-2",
      title: "Influencer NCOP",
      description: "Consigue 50 likes en tus reseñas",
      points: 750,
      progress: 23,
      maxProgress: 50,
      timeLeft: "1 semana",
      difficulty: "hard",
      category: "Social",
    },
    {
      id: "challenge-3",
      title: "Comprador inteligente",
      description: "Ahorra $50,000 COP usando ofertas",
      points: 500,
      progress: 32000,
      maxProgress: 50000,
      timeLeft: "2 semanas",
      difficulty: "easy",
      category: "Ahorro",
    },
  ];

  const categories = [
    { id: "all", name: "Todas", color: "#64748b" },
    { id: "daily", name: "Diarias", color: "#10b981" },
    { id: "social", name: "Sociales", color: "#2563eb" },
    { id: "shopping", name: "Compras", color: "#f59e0b" },
    { id: "referral", name: "Referidos", color: "#8b5cf6" },
    { id: "special", name: "Especiales", color: "#ef4444" },
  ];

  const filteredMethods = earnMethods.filter(
    (method) => selectedCategory === "all" || method.category === selectedCategory
  );

  const handleCompleteTask = (taskId: string, points: number) => {
    if (!completedTasks.has(taskId)) {
      setCompletedTasks(prev => new Set([...prev, taskId]));
      addNcop(points);
      setShowTaskModal(false);
      setSelectedTask(null);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy": return "#10b981";
      case "medium": return "#f59e0b";
      case "hard": return "#ef4444";
      default: return "#64748b";
    }
  };

  const formatProgress = (current: number, max: number, isAmount = false) => {
    if (isAmount) {
      return `$${current.toLocaleString()} / $${max.toLocaleString()}`;
    }
    return `${current} / ${max}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          title: "Ganar Puntos NCOP",
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
        <LinearGradient colors={["#10b981", "#059669"]} style={styles.headerGradient}>
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Coins color="#ffffff" size={24} />
              <Text style={styles.statValue}>{ncopBalance.toLocaleString()}</Text>
              <Text style={styles.statLabel}>NCOP Disponibles</Text>
            </View>
            <View style={styles.statItem}>
              <TrendingUp color="#ffffff" size={24} />
              <Text style={styles.statValue}>+{completedTasks.size * 50}</Text>
              <Text style={styles.statLabel}>Ganados Hoy</Text>
            </View>
            <View style={styles.statItem}>
              <Award color="#ffffff" size={24} />
              <Text style={styles.statValue}>{completedTasks.size}</Text>
              <Text style={styles.statLabel}>Tareas Completadas</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Categories */}
        <View style={styles.categoriesSection}>
          <Text style={styles.sectionTitle}>Categorías</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.categoriesContainer}>
              {categories.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.categoryChip,
                    selectedCategory === category.id && styles.categoryChipActive,
                    { borderColor: category.color },
                    selectedCategory === category.id && { backgroundColor: category.color },
                  ]}
                  onPress={() => setSelectedCategory(category.id)}
                >
                  <Text
                    style={[
                      styles.categoryText,
                      { color: selectedCategory === category.id ? "#ffffff" : category.color },
                    ]}
                  >
                    {category.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Active Challenges */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Desafíos Activos</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.challengesContainer}>
              {challenges.map((challenge) => (
                <View key={challenge.id} style={styles.challengeCard}>
                  <View style={styles.challengeHeader}>
                    <View
                      style={[
                        styles.difficultyBadge,
                        { backgroundColor: getDifficultyColor(challenge.difficulty) },
                      ]}
                    >
                      <Text style={styles.difficultyText}>
                        {challenge.difficulty === "easy" ? "Fácil" : 
                         challenge.difficulty === "medium" ? "Medio" : "Difícil"}
                      </Text>
                    </View>
                    <Text style={styles.challengePoints}>+{challenge.points} NCOP</Text>
                  </View>
                  <Text style={styles.challengeTitle}>{challenge.title}</Text>
                  <Text style={styles.challengeDescription}>{challenge.description}</Text>
                  
                  <View style={styles.progressContainer}>
                    <View style={styles.progressBar}>
                      <View
                        style={[
                          styles.progressFill,
                          {
                            width: `${(challenge.progress / challenge.maxProgress) * 100}%`,
                            backgroundColor: getDifficultyColor(challenge.difficulty),
                          },
                        ]}
                      />
                    </View>
                    <Text style={styles.progressText}>
                      {formatProgress(
                        challenge.progress,
                        challenge.maxProgress,
                        challenge.id === "challenge-3"
                      )}
                    </Text>
                  </View>
                  
                  <View style={styles.challengeFooter}>
                    <Text style={styles.timeLeft}>⏰ {challenge.timeLeft}</Text>
                    <Text style={styles.challengeCategory}>{challenge.category}</Text>
                  </View>
                </View>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Earn Methods */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Formas de Ganar Puntos</Text>
          <View style={styles.methodsList}>
            {filteredMethods.map((method) => {
              const isCompleted = completedTasks.has(method.id) || method.completed;
              return (
                <TouchableOpacity
                  key={method.id}
                  style={[
                    styles.methodCard,
                    isCompleted && styles.methodCardCompleted,
                  ]}
                  onPress={() => {
                    if (!isCompleted) {
                      setSelectedTask(method);
                      setShowTaskModal(true);
                    }
                  }}
                  disabled={isCompleted}
                >
                  <View style={[styles.methodIcon, { backgroundColor: `${method.color}20` }]}>
                    <method.icon color={method.color} size={24} />
                  </View>
                  
                  <View style={styles.methodContent}>
                    <View style={styles.methodHeader}>
                      <Text style={[styles.methodTitle, isCompleted && styles.completedText]}>
                        {method.title}
                      </Text>
                      <View style={styles.pointsBadge}>
                        <Text style={styles.pointsText}>+{method.points}</Text>
                      </View>
                    </View>
                    
                    <Text style={[styles.methodDescription, isCompleted && styles.completedText]}>
                      {method.description}
                    </Text>
                    
                    {method.progress !== undefined && method.maxProgress && (
                      <View style={styles.taskProgressContainer}>
                        <View style={styles.taskProgressBar}>
                          <View
                            style={[
                              styles.taskProgressFill,
                              {
                                width: `${(method.progress / method.maxProgress) * 100}%`,
                                backgroundColor: method.color,
                              },
                            ]}
                          />
                        </View>
                        <Text style={styles.taskProgressText}>
                          {method.progress}/{method.maxProgress}
                        </Text>
                      </View>
                    )}
                    
                    {method.timeLeft && (
                      <Text style={styles.timeLeftText}>⏰ {method.timeLeft}</Text>
                    )}
                  </View>
                  
                  {isCompleted && (
                    <View style={styles.completedBadge}>
                      <CheckCircle color="#10b981" size={20} fill="#10b981" />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Tips Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💡 Consejos para Ganar Más Puntos</Text>
          <View style={styles.tipsContainer}>
            <View style={styles.tipItem}>
              <Zap color="#f59e0b" size={20} />
              <Text style={styles.tipText}>
                Completa las tareas diarias para mantener tu racha activa
              </Text>
            </View>
            <View style={styles.tipItem}>
              <Users color="#8b5cf6" size={20} />
              <Text style={styles.tipText}>
                Invita amigos para obtener los mayores bonos de puntos
              </Text>
            </View>
            <View style={styles.tipItem}>
              <Target color="#10b981" size={20} />
              <Text style={styles.tipText}>
                Participa en desafíos para ganar puntos extra
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Task Modal */}
      <Modal
        visible={showTaskModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowTaskModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedTask && (
              <>
                <View style={styles.modalHeader}>
                  <View style={[styles.modalIcon, { backgroundColor: `${selectedTask.color}20` }]}>
                    <selectedTask.icon color={selectedTask.color} size={32} />
                  </View>
                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={() => setShowTaskModal(false)}
                  >
                    <X color="#64748b" size={24} />
                  </TouchableOpacity>
                </View>
                
                <Text style={styles.modalTitle}>{selectedTask.title}</Text>
                <Text style={styles.modalDescription}>{selectedTask.description}</Text>
                
                <View style={styles.modalPoints}>
                  <Coins color="#f59e0b" size={24} />
                  <Text style={styles.modalPointsText}>+{selectedTask.points} NCOP</Text>
                </View>
                
                {selectedTask.progress !== undefined && selectedTask.maxProgress && (
                  <View style={styles.modalProgress}>
                    <Text style={styles.modalProgressLabel}>Progreso actual:</Text>
                    <View style={styles.modalProgressBar}>
                      <View
                        style={[
                          styles.modalProgressFill,
                          {
                            width: `${(selectedTask.progress / selectedTask.maxProgress) * 100}%`,
                            backgroundColor: selectedTask.color,
                          },
                        ]}
                      />
                    </View>
                    <Text style={styles.modalProgressText}>
                      {selectedTask.progress}/{selectedTask.maxProgress}
                    </Text>
                  </View>
                )}
                
                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => setShowTaskModal(false)}
                  >
                    <Text style={styles.cancelButtonText}>Cancelar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.completeButton, { backgroundColor: selectedTask.color }]}
                    onPress={() => handleCompleteTask(selectedTask.id, selectedTask.points)}
                  >
                    <Text style={styles.completeButtonText}>Completar Tarea</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
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
  headerGradient: {
    margin: 20,
    borderRadius: 16,
    padding: 24,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#ffffff",
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.8)",
    textAlign: "center",
  },
  categoriesSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1e293b",
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  categoriesContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    gap: 12,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    backgroundColor: "#ffffff",
  },
  categoryChipActive: {
    borderWidth: 0,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: "600",
  },
  section: {
    marginBottom: 24,
  },
  challengesContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    gap: 16,
  },
  challengeCard: {
    width: 280,
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  challengeHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  difficultyText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#ffffff",
  },
  challengePoints: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#10b981",
  },
  challengeTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 4,
  },
  challengeDescription: {
    fontSize: 12,
    color: "#64748b",
    marginBottom: 12,
    lineHeight: 16,
  },
  progressContainer: {
    marginBottom: 12,
  },
  progressBar: {
    height: 6,
    backgroundColor: "#e2e8f0",
    borderRadius: 3,
    marginBottom: 4,
  },
  progressFill: {
    height: "100%",
    borderRadius: 3,
  },
  progressText: {
    fontSize: 11,
    color: "#64748b",
    textAlign: "right",
  },
  challengeFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  timeLeft: {
    fontSize: 11,
    color: "#f59e0b",
    fontWeight: "500",
  },
  challengeCategory: {
    fontSize: 11,
    color: "#8b5cf6",
    fontWeight: "500",
  },
  methodsList: {
    paddingHorizontal: 20,
    gap: 12,
  },
  methodCard: {
    flexDirection: "row",
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  methodCardCompleted: {
    opacity: 0.6,
    backgroundColor: "#f1f5f9",
  },
  methodIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  methodContent: {
    flex: 1,
  },
  methodHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  methodTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
    flex: 1,
    marginRight: 8,
  },
  pointsBadge: {
    backgroundColor: "#10b98120",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  pointsText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#10b981",
  },
  methodDescription: {
    fontSize: 14,
    color: "#64748b",
    marginBottom: 8,
    lineHeight: 18,
  },
  completedText: {
    color: "#94a3b8",
  },
  taskProgressContainer: {
    marginBottom: 8,
  },
  taskProgressBar: {
    height: 4,
    backgroundColor: "#e2e8f0",
    borderRadius: 2,
    marginBottom: 4,
  },
  taskProgressFill: {
    height: "100%",
    borderRadius: 2,
  },
  taskProgressText: {
    fontSize: 11,
    color: "#64748b",
  },
  timeLeftText: {
    fontSize: 11,
    color: "#f59e0b",
    fontWeight: "500",
  },
  completedBadge: {
    marginLeft: 12,
  },
  tipsContainer: {
    paddingHorizontal: 20,
    gap: 12,
  },
  tipItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    padding: 16,
    borderRadius: 12,
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: "#374151",
    lineHeight: 18,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 24,
    width: "100%",
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  modalIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  closeButton: {
    padding: 4,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1e293b",
    marginBottom: 8,
    textAlign: "center",
  },
  modalDescription: {
    fontSize: 14,
    color: "#64748b",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 16,
  },
  modalPoints: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fef3c7",
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    gap: 8,
  },
  modalPointsText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#92400e",
  },
  modalProgress: {
    marginBottom: 24,
  },
  modalProgressLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 8,
  },
  modalProgressBar: {
    height: 8,
    backgroundColor: "#e2e8f0",
    borderRadius: 4,
    marginBottom: 8,
  },
  modalProgressFill: {
    height: "100%",
    borderRadius: 4,
  },
  modalProgressText: {
    fontSize: 12,
    color: "#64748b",
    textAlign: "center",
  },
  modalActions: {
    flexDirection: "row",
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: "#f1f5f9",
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#64748b",
  },
  completeButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  completeButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#ffffff",
  },
});