import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Alert,
  TextInput,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, router } from 'expo-router';
import { ArrowLeft, Shield, AlertTriangle, Eye, Settings, Plus, Edit3 } from 'lucide-react-native';
import { ChatSecurityValidator, ModerationRule, ModerationStats, ContentModerator } from '@/utils/security';

interface ModerationRuleFormData {
  name: string;
  type: 'spam' | 'profanity' | 'harassment' | 'inappropriate' | 'phishing' | 'custom' | 'ai_detection' | 'pattern_matching';
  keywords: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  action: 'warn' | 'filter' | 'block' | 'report' | 'auto_delete' | 'quarantine' | 'escalate';
  description: string;
}

export default function AdminModerationScreen() {
  const [stats, setStats] = useState<ModerationStats | null>(null);
  const [rules, setRules] = useState<ModerationRule[]>([]);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [editingRule, setEditingRule] = useState<ModerationRule | null>(null);
  const [formData, setFormData] = useState<ModerationRuleFormData>({
    name: '',
    type: 'custom',
    keywords: '',
    severity: 'medium',
    action: 'filter',
    description: ''
  });
  const [activeTab, setActiveTab] = useState<'rules' | 'quarantine' | 'analytics'>('rules');
  const [quarantinedMessages, setQuarantinedMessages] = useState<any[]>([]);

  useEffect(() => {
    loadModerationData();
    loadQuarantinedMessages();
  }, []);

  const loadModerationData = () => {
    const validator = ChatSecurityValidator.getInstance();
    const moderationStats = validator.getModerationStats();
    const moderationRules = validator.getModerationRules();
    
    setStats(moderationStats);
    setRules(moderationRules);
  };

  const loadQuarantinedMessages = () => {
    const moderator = ContentModerator.getInstance();
    const messages = moderator.getQuarantinedMessages();
    setQuarantinedMessages(messages);
  };

  const handleReviewMessage = (messageId: string, approved: boolean) => {
    const moderator = ContentModerator.getInstance();
    const success = moderator.reviewQuarantinedMessage(messageId, approved, 'admin_current');
    
    if (success) {
      loadQuarantinedMessages();
      loadModerationData();
      Alert.alert('Éxito', approved ? 'Mensaje aprobado' : 'Mensaje rechazado');
    } else {
      Alert.alert('Error', 'No se pudo procesar la revisión');
    }
  };

  const toggleRule = (ruleId: string, enabled: boolean) => {
    const validator = ChatSecurityValidator.getInstance();
    const success = validator.updateModerationRule(ruleId, { enabled });
    
    if (success) {
      setRules(prev => prev.map(rule => 
        rule.id === ruleId ? { ...rule, enabled } : rule
      ));
    } else {
      Alert.alert('Error', 'No se pudo actualizar la regla');
    }
  };

  const handleAddRule = () => {
    if (!formData.name.trim() || !formData.description.trim()) {
      Alert.alert('Error', 'Nombre y descripción son requeridos');
      return;
    }

    const validator = ChatSecurityValidator.getInstance();
    const newRule: Omit<ModerationRule, 'id'> = {
      name: formData.name,
      type: formData.type,
      keywords: formData.keywords ? formData.keywords.split(',').map(k => k.trim()) : undefined,
      severity: formData.severity,
      action: formData.action,
      enabled: true,
      description: formData.description
    };

    const ruleId = validator.addCustomModerationRule(newRule);
    
    if (ruleId) {
      loadModerationData();
      setShowAddModal(false);
      resetForm();
      Alert.alert('Éxito', 'Regla agregada correctamente');
    } else {
      Alert.alert('Error', 'No se pudo agregar la regla');
    }
  };

  const handleEditRule = (rule: ModerationRule) => {
    setEditingRule(rule);
    setFormData({
      name: rule.name,
      type: rule.type,
      keywords: rule.keywords?.join(', ') || '',
      severity: rule.severity,
      action: rule.action,
      description: rule.description
    });
    setShowAddModal(true);
  };

  const handleUpdateRule = () => {
    if (!editingRule || !formData.name.trim() || !formData.description.trim()) {
      Alert.alert('Error', 'Nombre y descripción son requeridos');
      return;
    }

    const validator = ChatSecurityValidator.getInstance();
    const updates: Partial<ModerationRule> = {
      name: formData.name,
      type: formData.type,
      keywords: formData.keywords ? formData.keywords.split(',').map(k => k.trim()) : undefined,
      severity: formData.severity,
      action: formData.action,
      description: formData.description
    };

    const success = validator.updateModerationRule(editingRule.id, updates);
    
    if (success) {
      loadModerationData();
      setShowAddModal(false);
      setEditingRule(null);
      resetForm();
      Alert.alert('Éxito', 'Regla actualizada correctamente');
    } else {
      Alert.alert('Error', 'No se pudo actualizar la regla');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'custom',
      keywords: '',
      severity: 'medium',
      action: 'filter',
      description: ''
    });
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return '#10b981';
      case 'medium': return '#f59e0b';
      case 'high': return '#ef4444';
      case 'critical': return '#dc2626';
      default: return '#6b7280';
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'warn': return '#3b82f6';
      case 'filter': return '#f59e0b';
      case 'block': return '#ef4444';
      case 'report': return '#8b5cf6';
      case 'auto_delete': return '#dc2626';
      default: return '#6b7280';
    }
  };

  if (!stats) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Cargando estadísticas...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen 
        options={{
          headerShown: true,
          headerStyle: { backgroundColor: '#ffffff' },
          headerShadowVisible: true,
          headerTitle: 'Moderación de Contenido',
          headerTitleStyle: { fontSize: 18, fontWeight: '600' },
          headerLeft: () => (
            <TouchableOpacity 
              style={styles.headerButton}
              onPress={() => router.back()}
            >
              <ArrowLeft size={24} color="#1e293b" />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity 
              style={styles.headerButton}
              onPress={() => setShowAddModal(true)}
            >
              <Plus size={24} color="#2563eb" />
            </TouchableOpacity>
          ),
        }}
      />

      {/* Tabs */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'rules' && styles.activeTab]}
          onPress={() => setActiveTab('rules')}
        >
          <Settings size={20} color={activeTab === 'rules' ? '#2563eb' : '#6b7280'} />
          <Text style={[styles.tabText, activeTab === 'rules' && styles.activeTabText]}>
            Reglas
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'quarantine' && styles.activeTab]}
          onPress={() => setActiveTab('quarantine')}
        >
          <Eye size={20} color={activeTab === 'quarantine' ? '#2563eb' : '#6b7280'} />
          <Text style={[styles.tabText, activeTab === 'quarantine' && styles.activeTabText]}>
            Cuarentena
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'analytics' && styles.activeTab]}
          onPress={() => setActiveTab('analytics')}
        >
          <AlertTriangle size={20} color={activeTab === 'analytics' ? '#2563eb' : '#6b7280'} />
          <Text style={[styles.tabText, activeTab === 'analytics' && styles.activeTabText]}>
            Análisis
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {activeTab === 'rules' && (
          <>
            {/* Estadísticas */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Shield size={20} color="#2563eb" />
                <Text style={styles.sectionTitle}>Estadísticas de Moderación</Text>
              </View>
              
              <View style={styles.statsGrid}>
                <View style={styles.statCard}>
                  <Text style={styles.statNumber}>{stats.totalMessages.toLocaleString()}</Text>
                  <Text style={styles.statLabel}>Mensajes Totales</Text>
                </View>
                
                <View style={styles.statCard}>
                  <Text style={[styles.statNumber, { color: '#ef4444' }]}>{stats.blockedMessages.toLocaleString()}</Text>
                  <Text style={styles.statLabel}>Bloqueados</Text>
                </View>
                
                <View style={styles.statCard}>
                  <Text style={[styles.statNumber, { color: '#f59e0b' }]}>{stats.filteredMessages.toLocaleString()}</Text>
                  <Text style={styles.statLabel}>Filtrados</Text>
                </View>
                
                <View style={styles.statCard}>
                  <Text style={[styles.statNumber, { color: '#8b5cf6' }]}>{stats.reportedMessages.toLocaleString()}</Text>
                  <Text style={styles.statLabel}>Reportados</Text>
                </View>
                
                <View style={styles.statCard}>
                  <Text style={[styles.statNumber, { color: '#10b981' }]}>{stats.spamDetected.toLocaleString()}</Text>
                  <Text style={styles.statLabel}>Spam Detectado</Text>
                </View>
                
                <View style={styles.statCard}>
                  <Text style={[styles.statNumber, { color: '#f97316' }]}>{stats.profanityDetected.toLocaleString()}</Text>
                  <Text style={styles.statLabel}>Profanidad</Text>
                </View>
                
                <View style={styles.statCard}>
                  <Text style={[styles.statNumber, { color: '#3b82f6' }]}>{stats.autoModeratedMessages?.toLocaleString() || '0'}</Text>
                  <Text style={styles.statLabel}>Auto-Moderados</Text>
                </View>
                
                <View style={styles.statCard}>
                  <Text style={[styles.statNumber, { color: '#10b981' }]}>{stats.accuracyRate?.toFixed(1) || '0'}%</Text>
                  <Text style={styles.statLabel}>Precisión IA</Text>
                </View>
              </View>
            </View>

            {/* Reglas de Moderación */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Settings size={20} color="#2563eb" />
                <Text style={styles.sectionTitle}>Reglas de Moderación</Text>
              </View>
              
              {rules.map((rule) => (
                <View key={rule.id} style={styles.ruleCard}>
                  <View style={styles.ruleHeader}>
                    <View style={styles.ruleInfo}>
                      <Text style={styles.ruleName}>{rule.name}</Text>
                      <Text style={styles.ruleDescription}>{rule.description}</Text>
                    </View>
                    
                    <View style={styles.ruleActions}>
                      <TouchableOpacity 
                        style={styles.editButton}
                        onPress={() => handleEditRule(rule)}
                      >
                        <Edit3 size={16} color="#6b7280" />
                      </TouchableOpacity>
                      
                      <Switch
                        value={rule.enabled}
                        onValueChange={(enabled) => toggleRule(rule.id, enabled)}
                        trackColor={{ false: '#f3f4f6', true: '#dbeafe' }}
                        thumbColor={rule.enabled ? '#2563eb' : '#9ca3af'}
                      />
                    </View>
                  </View>
                  
                  <View style={styles.ruleTags}>
                    <View style={[styles.tag, { backgroundColor: getSeverityColor(rule.severity) + '20' }]}>
                      <Text style={[styles.tagText, { color: getSeverityColor(rule.severity) }]}>
                        {rule.severity.toUpperCase()}
                      </Text>
                    </View>
                    
                    <View style={[styles.tag, { backgroundColor: getActionColor(rule.action) + '20' }]}>
                      <Text style={[styles.tagText, { color: getActionColor(rule.action) }]}>
                        {rule.action.toUpperCase()}
                      </Text>
                    </View>
                    
                    <View style={[styles.tag, { backgroundColor: '#e5e7eb' }]}>
                      <Text style={[styles.tagText, { color: '#6b7280' }]}>
                        {rule.type.toUpperCase()}
                      </Text>
                    </View>
                    
                    {rule.confidence && (
                      <View style={[styles.tag, { backgroundColor: '#dbeafe' }]}>
                        <Text style={[styles.tagText, { color: '#2563eb' }]}>
                          {(rule.confidence * 100).toFixed(0)}% CONF
                        </Text>
                      </View>
                    )}
                  </View>
                  
                  {rule.keywords && rule.keywords.length > 0 && (
                    <View style={styles.keywordsContainer}>
                      <Text style={styles.keywordsLabel}>Palabras clave:</Text>
                      <Text style={styles.keywordsText}>{rule.keywords.join(', ')}</Text>
                    </View>
                  )}
                </View>
              ))}
            </View>
          </>
        )}

        {activeTab === 'quarantine' && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Eye size={20} color="#2563eb" />
              <Text style={styles.sectionTitle}>Mensajes en Cuarentena</Text>
            </View>
            
            {quarantinedMessages.length === 0 ? (
              <View style={styles.emptyState}>
                <Eye size={48} color="#9ca3af" />
                <Text style={styles.emptyStateText}>No hay mensajes en cuarentena</Text>
                <Text style={styles.emptyStateSubtext}>Los mensajes sospechosos aparecerán aquí para revisión</Text>
              </View>
            ) : (
              quarantinedMessages.map((message) => (
                <View key={message.messageId} style={styles.quarantineCard}>
                  <View style={styles.quarantineHeader}>
                    <View style={styles.quarantineInfo}>
                      <Text style={styles.quarantineUser}>Usuario: {message.userId}</Text>
                      <Text style={styles.quarantineDate}>
                        {new Date(message.timestamp).toLocaleString('es-ES')}
                      </Text>
                    </View>
                    
                    <View style={styles.confidenceBadge}>
                      <Text style={styles.confidenceText}>
                        {(message.confidence * 100).toFixed(0)}%
                      </Text>
                    </View>
                  </View>
                  
                  <View style={styles.quarantineContent}>
                    <Text style={styles.quarantineContentText}>{message.content}</Text>
                  </View>
                  
                  <View style={styles.quarantineStatus}>
                    <View style={[
                      styles.statusBadge,
                      { backgroundColor: 
                        message.reviewStatus === 'pending' ? '#f59e0b' :
                        message.reviewStatus === 'approved' ? '#10b981' : '#ef4444'
                      }
                    ]}>
                      <Text style={styles.statusText}>
                        {message.reviewStatus === 'pending' ? 'PENDIENTE' :
                         message.reviewStatus === 'approved' ? 'APROBADO' : 'RECHAZADO'}
                      </Text>
                    </View>
                  </View>
                  
                  {message.reviewStatus === 'pending' && (
                    <View style={styles.quarantineActions}>
                      <TouchableOpacity
                        style={[styles.quarantineButton, { backgroundColor: '#10b981' }]}
                        onPress={() => handleReviewMessage(message.messageId, true)}
                      >
                        <Text style={styles.quarantineButtonText}>Aprobar</Text>
                      </TouchableOpacity>
                      
                      <TouchableOpacity
                        style={[styles.quarantineButton, { backgroundColor: '#ef4444' }]}
                        onPress={() => handleReviewMessage(message.messageId, false)}
                      >
                        <Text style={styles.quarantineButtonText}>Rechazar</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              ))
            )}
          </View>
        )}

        {activeTab === 'analytics' && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <AlertTriangle size={20} color="#2563eb" />
              <Text style={styles.sectionTitle}>Análisis de Moderación</Text>
            </View>
            
            <View style={styles.analyticsCard}>
              <Text style={styles.analyticsTitle}>Rendimiento del Sistema</Text>
              
              <View style={styles.analyticsRow}>
                <Text style={styles.analyticsLabel}>Precisión de IA:</Text>
                <Text style={[styles.analyticsValue, { color: '#10b981' }]}>
                  {stats.accuracyRate?.toFixed(1) || '0'}%
                </Text>
              </View>
              
              <View style={styles.analyticsRow}>
                <Text style={styles.analyticsLabel}>Falsos Positivos:</Text>
                <Text style={[styles.analyticsValue, { color: '#ef4444' }]}>
                  {stats.falsePositives || 0}
                </Text>
              </View>
              
              <View style={styles.analyticsRow}>
                <Text style={styles.analyticsLabel}>Mensajes en Cuarentena:</Text>
                <Text style={[styles.analyticsValue, { color: '#f59e0b' }]}>
                  {quarantinedMessages.filter(m => m.reviewStatus === 'pending').length}
                </Text>
              </View>
            </View>
            
            <View style={styles.analyticsCard}>
              <Text style={styles.analyticsTitle}>Recomendaciones</Text>
              
              <View style={styles.recommendationItem}>
                <Text style={styles.recommendationText}>
                  • Revisar mensajes en cuarentena regularmente
                </Text>
              </View>
              
              <View style={styles.recommendationItem}>
                <Text style={styles.recommendationText}>
                  • Ajustar reglas con baja precisión
                </Text>
              </View>
              
              <View style={styles.recommendationItem}>
                <Text style={styles.recommendationText}>
                  • Monitorear usuarios con alto riesgo
                </Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Modal para agregar/editar regla */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity 
              onPress={() => {
                setShowAddModal(false);
                setEditingRule(null);
                resetForm();
              }}
            >
              <Text style={styles.modalCancel}>Cancelar</Text>
            </TouchableOpacity>
            
            <Text style={styles.modalTitle}>
              {editingRule ? 'Editar Regla' : 'Nueva Regla'}
            </Text>
            
            <TouchableOpacity 
              onPress={editingRule ? handleUpdateRule : handleAddRule}
            >
              <Text style={styles.modalSave}>Guardar</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent}>
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Nombre</Text>
              <TextInput
                style={styles.formInput}
                value={formData.name}
                onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
                placeholder="Nombre de la regla"
              />
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Descripción</Text>
              <TextInput
                style={[styles.formInput, styles.textArea]}
                value={formData.description}
                onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
                placeholder="Descripción de la regla"
                multiline
                numberOfLines={3}
              />
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Palabras Clave (separadas por comas)</Text>
              <TextInput
                style={styles.formInput}
                value={formData.keywords}
                onChangeText={(text) => setFormData(prev => ({ ...prev, keywords: text }))}
                placeholder="palabra1, palabra2, palabra3"
              />
            </View>
            
            <View style={styles.formRow}>
              <View style={styles.formHalf}>
                <Text style={styles.formLabel}>Severidad</Text>
                <View style={styles.pickerContainer}>
                  {['low', 'medium', 'high', 'critical'].map((severity) => (
                    <TouchableOpacity
                      key={severity}
                      style={[
                        styles.pickerOption,
                        formData.severity === severity && styles.pickerOptionSelected
                      ]}
                      onPress={() => setFormData(prev => ({ ...prev, severity: severity as any }))}
                    >
                      <Text style={[
                        styles.pickerOptionText,
                        formData.severity === severity && styles.pickerOptionTextSelected
                      ]}>
                        {severity.toUpperCase()}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              
              <View style={styles.formHalf}>
                <Text style={styles.formLabel}>Acción</Text>
                <View style={styles.pickerContainer}>
                  {['warn', 'filter', 'block', 'report', 'auto_delete'].map((action) => (
                    <TouchableOpacity
                      key={action}
                      style={[
                        styles.pickerOption,
                        formData.action === action && styles.pickerOptionSelected
                      ]}
                      onPress={() => setFormData(prev => ({ ...prev, action: action as any }))}
                    >
                      <Text style={[
                        styles.pickerOptionText,
                        formData.action === action && styles.pickerOptionTextSelected
                      ]}>
                        {action.toUpperCase()}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 6,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#2563eb',
  },
  tabText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6b7280',
  },
  activeTabText: {
    color: '#2563eb',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
  },
  headerButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
  ruleCard: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  ruleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  ruleInfo: {
    flex: 1,
    marginRight: 12,
  },
  ruleName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  ruleDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  ruleActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  editButton: {
    padding: 4,
  },
  ruleTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  tagText: {
    fontSize: 10,
    fontWeight: '600',
  },
  keywordsContainer: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  keywordsLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6b7280',
    marginBottom: 4,
  },
  keywordsText: {
    fontSize: 12,
    color: '#374151',
    fontStyle: 'italic',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  modalCancel: {
    fontSize: 16,
    color: '#6b7280',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
  },
  modalSave: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2563eb',
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  formGroup: {
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  formInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#1e293b',
    backgroundColor: '#ffffff',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  formRow: {
    flexDirection: 'row',
    gap: 12,
  },
  formHalf: {
    flex: 1,
  },
  pickerContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  pickerOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#d1d5db',
    backgroundColor: '#ffffff',
  },
  pickerOptionSelected: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  pickerOptionText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6b7280',
  },
  pickerOptionTextSelected: {
    color: '#ffffff',
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginBottom: 16,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginTop: 12,
    marginBottom: 4,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  quarantineCard: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  quarantineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  quarantineInfo: {
    flex: 1,
  },
  quarantineUser: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 2,
  },
  quarantineDate: {
    fontSize: 12,
    color: '#6b7280',
  },
  confidenceBadge: {
    backgroundColor: '#dbeafe',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  confidenceText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2563eb',
  },
  quarantineContent: {
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  quarantineContentText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  quarantineStatus: {
    marginBottom: 12,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#ffffff',
  },
  quarantineActions: {
    flexDirection: 'row',
    gap: 12,
  },
  quarantineButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  quarantineButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 14,
  },
  analyticsCard: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  analyticsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 12,
  },
  analyticsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  analyticsLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  analyticsValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  recommendationItem: {
    marginBottom: 8,
  },
  recommendationText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
});