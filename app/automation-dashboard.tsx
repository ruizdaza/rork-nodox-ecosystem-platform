import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import {
  Bot,
  MessageSquare,
  Package,
  Mail,
  Plus,
  Settings,
  Play,
  Pause,
  BarChart3,
  Brain,
  Zap,
  Users,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
} from 'lucide-react-native';
import { useAutomation } from '@/hooks/use-automation';

export default function AutomationDashboard() {
  const {
    chatBots,
    inventoryAutomations,
    marketingAutomations,
    selectedAutomationType,
    isLoadingChatBots,
    isLoadingInventory,
    isLoadingMarketing,
    setSelectedAutomationType,
    createChatBot,
    createInventoryAutomation,
    createMarketingAutomation,
    toggleAutomation,
    simulateAIResponse,
  } = useAutomation();

  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [showChatModal, setShowChatModal] = useState<boolean>(false);
  const [selectedBot, setSelectedBot] = useState<string | null>(null);
  const [chatMessage, setChatMessage] = useState<string>('');
  const [chatResponse, setChatResponse] = useState<string>('');
  const [newBotName, setNewBotName] = useState<string>('');
  const [newBotDescription, setNewBotDescription] = useState<string>('');

  const handleCreateBot = () => {
    if (!newBotName.trim() || !newBotDescription.trim()) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    createChatBot({
      name: newBotName,
      description: newBotDescription,
      isActive: true,
      language: 'es',
      personality: 'friendly',
      knowledgeBase: [],
      responses: [],
    });

    setNewBotName('');
    setNewBotDescription('');
    setShowCreateModal(false);
  };

  const handleTestBot = async () => {
    if (!selectedBot || !chatMessage.trim()) return;

    const response = await simulateAIResponse(chatMessage, selectedBot);
    setChatResponse(response);
  };

  const renderAutomationTypeSelector = () => (
    <View style={styles.typeSelector}>
      <TouchableOpacity
        style={[
          styles.typeButton,
          selectedAutomationType === 'chatbot' && styles.typeButtonActive
        ]}
        onPress={() => setSelectedAutomationType('chatbot')}
      >
        <Bot size={20} color={selectedAutomationType === 'chatbot' ? '#FFFFFF' : '#6B7280'} />
        <Text style={[
          styles.typeButtonText,
          selectedAutomationType === 'chatbot' && styles.typeButtonTextActive
        ]}>
          ChatBots
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.typeButton,
          selectedAutomationType === 'inventory' && styles.typeButtonActive
        ]}
        onPress={() => setSelectedAutomationType('inventory')}
      >
        <Package size={20} color={selectedAutomationType === 'inventory' ? '#FFFFFF' : '#6B7280'} />
        <Text style={[
          styles.typeButtonText,
          selectedAutomationType === 'inventory' && styles.typeButtonTextActive
        ]}>
          Inventario
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.typeButton,
          selectedAutomationType === 'marketing' && styles.typeButtonActive
        ]}
        onPress={() => setSelectedAutomationType('marketing')}
      >
        <Mail size={20} color={selectedAutomationType === 'marketing' ? '#FFFFFF' : '#6B7280'} />
        <Text style={[
          styles.typeButtonText,
          selectedAutomationType === 'marketing' && styles.typeButtonTextActive
        ]}>
          Marketing
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderChatBots = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>ChatBots con IA</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowCreateModal(true)}
        >
          <Plus size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {chatBots.map(bot => (
        <View key={bot.id} style={styles.automationCard}>
          <View style={styles.cardHeader}>
            <View style={styles.cardInfo}>
              <View style={styles.cardTitleRow}>
                <Bot size={24} color="#3B82F6" />
                <Text style={styles.cardTitle}>{bot.name}</Text>
                <View style={[
                  styles.statusBadge,
                  { backgroundColor: bot.isActive ? '#D1FAE5' : '#FEE2E2' }
                ]}>
                  <Text style={[
                    styles.statusText,
                    { color: bot.isActive ? '#059669' : '#DC2626' }
                  ]}>
                    {bot.isActive ? 'Activo' : 'Inactivo'}
                  </Text>
                </View>
              </View>
              <Text style={styles.cardDescription}>{bot.description}</Text>
            </View>
          </View>

          <View style={styles.cardStats}>
            <View style={styles.statItem}>
              <MessageSquare size={16} color="#6B7280" />
              <Text style={styles.statText}>
                {bot.analytics.totalConversations} conversaciones
              </Text>
            </View>
            <View style={styles.statItem}>
              <CheckCircle size={16} color="#10B981" />
              <Text style={styles.statText}>
                {((bot.analytics.resolvedQueries / bot.analytics.totalConversations) * 100).toFixed(0)}% resueltas
              </Text>
            </View>
            <View style={styles.statItem}>
              <Clock size={16} color="#F59E0B" />
              <Text style={styles.statText}>
                {bot.analytics.averageResponseTime}s promedio
              </Text>
            </View>
          </View>

          <View style={styles.cardActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => {
                setSelectedBot(bot.id);
                setShowChatModal(true);
              }}
            >
              <MessageSquare size={16} color="#3B82F6" />
              <Text style={styles.actionButtonText}>Probar</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => toggleAutomation({ type: 'chatbot', id: bot.id, isActive: !bot.isActive })}
            >
              {bot.isActive ? (
                <Pause size={16} color="#EF4444" />
              ) : (
                <Play size={16} color="#10B981" />
              )}
              <Text style={styles.actionButtonText}>
                {bot.isActive ? 'Pausar' : 'Activar'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton}>
              <Settings size={16} color="#6B7280" />
              <Text style={styles.actionButtonText}>Configurar</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.knowledgeBase}>
            <Text style={styles.knowledgeTitle}>Base de Conocimiento</Text>
            <Text style={styles.knowledgeCount}>
              {bot.knowledgeBase.length} entradas configuradas
            </Text>
            {bot.knowledgeBase.slice(0, 2).map(kb => (
              <View key={kb.id} style={styles.knowledgeItem}>
                <Text style={styles.knowledgeQuestion}>{kb.question}</Text>
                <Text style={styles.knowledgeKeywords}>
                  Palabras clave: {kb.keywords.join(', ')}
                </Text>
              </View>
            ))}
          </View>
        </View>
      ))}
    </View>
  );

  const renderInventoryAutomation = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Automatización de Inventario</Text>
        <TouchableOpacity style={styles.addButton}>
          <Plus size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {inventoryAutomations.map(automation => (
        <View key={automation.id} style={styles.automationCard}>
          <View style={styles.cardHeader}>
            <View style={styles.cardInfo}>
              <View style={styles.cardTitleRow}>
                <Package size={24} color="#10B981" />
                <Text style={styles.cardTitle}>Producto #{automation.productId}</Text>
                <View style={[
                  styles.statusBadge,
                  { backgroundColor: automation.isActive ? '#D1FAE5' : '#FEE2E2' }
                ]}>
                  <Text style={[
                    styles.statusText,
                    { color: automation.isActive ? '#059669' : '#DC2626' }
                  ]}>
                    {automation.isActive ? 'Activo' : 'Inactivo'}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.rulesContainer}>
            <Text style={styles.rulesTitle}>Reglas Configuradas</Text>
            {automation.rules.map(rule => (
              <View key={rule.id} style={styles.ruleItem}>
                <Text style={styles.ruleName}>{rule.name}</Text>
                <Text style={styles.ruleDescription}>
                  Cuando {rule.trigger.type === 'low_stock' ? 'stock bajo' : rule.trigger.type} 
                  {rule.trigger.threshold && ` (${rule.trigger.threshold})`} → 
                  {rule.action.type === 'reorder' ? ' reordenar' : ` ${rule.action.type}`}
                  {rule.action.parameters.quantity && ` ${rule.action.parameters.quantity} unidades`}
                </Text>
              </View>
            ))}
          </View>

          <View style={styles.cardStats}>
            <View style={styles.statItem}>
              <AlertCircle size={16} color="#EF4444" />
              <Text style={styles.statText}>
                {automation.analytics.stockouts} agotamientos evitados
              </Text>
            </View>
            <View style={styles.statItem}>
              <TrendingUp size={16} color="#10B981" />
              <Text style={styles.statText}>
                {automation.analytics.turnoverRate}% rotación
              </Text>
            </View>
            <View style={styles.statItem}>
              <Zap size={16} color="#F59E0B" />
              <Text style={styles.statText}>
                {automation.analytics.automationEfficiency}% eficiencia
              </Text>
            </View>
          </View>

          <View style={styles.cardActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => toggleAutomation({ 
                type: 'inventory', 
                id: automation.id, 
                isActive: !automation.isActive 
              })}
            >
              {automation.isActive ? (
                <Pause size={16} color="#EF4444" />
              ) : (
                <Play size={16} color="#10B981" />
              )}
              <Text style={styles.actionButtonText}>
                {automation.isActive ? 'Pausar' : 'Activar'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton}>
              <Settings size={16} color="#6B7280" />
              <Text style={styles.actionButtonText}>Configurar</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </View>
  );

  const renderMarketingAutomation = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Automatización de Marketing</Text>
        <TouchableOpacity style={styles.addButton}>
          <Plus size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {marketingAutomations.map(automation => (
        <View key={automation.id} style={styles.automationCard}>
          <View style={styles.cardHeader}>
            <View style={styles.cardInfo}>
              <View style={styles.cardTitleRow}>
                <Mail size={24} color="#8B5CF6" />
                <Text style={styles.cardTitle}>{automation.name}</Text>
                <View style={[
                  styles.statusBadge,
                  { backgroundColor: automation.isActive ? '#D1FAE5' : '#FEE2E2' }
                ]}>
                  <Text style={[
                    styles.statusText,
                    { color: automation.isActive ? '#059669' : '#DC2626' }
                  ]}>
                    {automation.isActive ? 'Activo' : 'Inactivo'}
                  </Text>
                </View>
              </View>
              <Text style={styles.cardDescription}>
                Tipo: {automation.type} • Audiencia: {automation.audience.name}
              </Text>
            </View>
          </View>

          <View style={styles.campaignDetails}>
            <Text style={styles.campaignTitle}>Detalles de la Campaña</Text>
            <Text style={styles.campaignTrigger}>
              Disparador: {automation.trigger.event}
            </Text>
            <Text style={styles.campaignContent}>
              {automation.content.subject && `Asunto: ${automation.content.subject}`}
            </Text>
            <Text style={styles.campaignAudience}>
              Audiencia: {automation.audience.size} usuarios
            </Text>
          </View>

          <View style={styles.cardStats}>
            <View style={styles.statItem}>
              <Users size={16} color="#3B82F6" />
              <Text style={styles.statText}>
                {automation.analytics.sent} enviados
              </Text>
            </View>
            <View style={styles.statItem}>
              <BarChart3 size={16} color="#10B981" />
              <Text style={styles.statText}>
                {((automation.analytics.opened / automation.analytics.sent) * 100).toFixed(1)}% apertura
              </Text>
            </View>
            <View style={styles.statItem}>
              <TrendingUp size={16} color="#F59E0B" />
              <Text style={styles.statText}>
                {automation.analytics.roi.toFixed(1)}x ROI
              </Text>
            </View>
          </View>

          <View style={styles.cardActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => toggleAutomation({ 
                type: 'marketing', 
                id: automation.id, 
                isActive: !automation.isActive 
              })}
            >
              {automation.isActive ? (
                <Pause size={16} color="#EF4444" />
              ) : (
                <Play size={16} color="#10B981" />
              )}
              <Text style={styles.actionButtonText}>
                {automation.isActive ? 'Pausar' : 'Activar'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton}>
              <Settings size={16} color="#6B7280" />
              <Text style={styles.actionButtonText}>Configurar</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: 'Automatización IA',
          headerStyle: { backgroundColor: '#8B5CF6' },
          headerTintColor: '#FFFFFF',
          headerTitleStyle: { fontWeight: 'bold' },
        }} 
      />

      {renderAutomationTypeSelector()}

      <ScrollView style={styles.content}>
        {selectedAutomationType === 'chatbot' && renderChatBots()}
        {selectedAutomationType === 'inventory' && renderInventoryAutomation()}
        {selectedAutomationType === 'marketing' && renderMarketingAutomation()}
      </ScrollView>

      {/* Create Bot Modal */}
      <Modal
        visible={showCreateModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Crear Nuevo ChatBot</Text>
            <TouchableOpacity onPress={() => setShowCreateModal(false)}>
              <Text style={styles.modalClose}>Cancelar</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.modalContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Nombre del Bot</Text>
              <TextInput
                style={styles.textInput}
                value={newBotName}
                onChangeText={setNewBotName}
                placeholder="Ej: Asistente de Ventas"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Descripción</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                value={newBotDescription}
                onChangeText={setNewBotDescription}
                placeholder="Describe la función del bot..."
                multiline
                numberOfLines={3}
              />
            </View>

            <TouchableOpacity
              style={styles.createButton}
              onPress={handleCreateBot}
            >
              <Text style={styles.createButtonText}>Crear ChatBot</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>

      {/* Chat Test Modal */}
      <Modal
        visible={showChatModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Probar ChatBot</Text>
            <TouchableOpacity onPress={() => setShowChatModal(false)}>
              <Text style={styles.modalClose}>Cerrar</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.modalContent}>
            <View style={styles.chatContainer}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Tu mensaje</Text>
                <TextInput
                  style={styles.textInput}
                  value={chatMessage}
                  onChangeText={setChatMessage}
                  placeholder="Escribe tu mensaje aquí..."
                />
              </View>

              <TouchableOpacity
                style={styles.testButton}
                onPress={handleTestBot}
              >
                <Brain size={20} color="#FFFFFF" />
                <Text style={styles.testButtonText}>Probar Respuesta IA</Text>
              </TouchableOpacity>

              {chatResponse ? (
                <View style={styles.responseContainer}>
                  <Text style={styles.responseLabel}>Respuesta del Bot:</Text>
                  <View style={styles.responseBubble}>
                    <Text style={styles.responseText}>{chatResponse}</Text>
                  </View>
                </View>
              ) : null}
            </View>
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  typeSelector: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  typeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginHorizontal: 4,
    backgroundColor: '#F3F4F6',
    gap: 8,
  },
  typeButtonActive: {
    backgroundColor: '#3B82F6',
  },
  typeButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  typeButtonTextActive: {
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  addButton: {
    backgroundColor: '#3B82F6',
    padding: 8,
    borderRadius: 8,
  },
  automationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    marginBottom: 12,
  },
  cardInfo: {
    flex: 1,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  cardTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  cardDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  cardStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 12,
    color: '#6B7280',
  },
  cardActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: '#F3F4F6',
    gap: 4,
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#374151',
  },
  knowledgeBase: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  knowledgeTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  knowledgeCount: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 12,
  },
  knowledgeItem: {
    marginBottom: 8,
  },
  knowledgeQuestion: {
    fontSize: 13,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 2,
  },
  knowledgeKeywords: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  rulesContainer: {
    marginBottom: 16,
  },
  rulesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  ruleItem: {
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  ruleName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  ruleDescription: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 16,
  },
  campaignDetails: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  campaignTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  campaignTrigger: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  campaignContent: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  campaignAudience: {
    fontSize: 12,
    color: '#6B7280',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  modalClose: {
    fontSize: 16,
    color: '#3B82F6',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  createButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  chatContainer: {
    flex: 1,
  },
  testButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#8B5CF6',
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 20,
    gap: 8,
  },
  testButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  responseContainer: {
    marginTop: 20,
  },
  responseLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  responseBubble: {
    backgroundColor: '#EEF2FF',
    padding: 16,
    borderRadius: 12,
    borderTopLeftRadius: 4,
  },
  responseText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
});