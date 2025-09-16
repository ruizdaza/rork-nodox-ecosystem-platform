import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack } from "expo-router";
import {
  HelpCircle,
  MessageCircle,
  Phone,
  Mail,
  FileText,
  ChevronRight,
  Send,
  Clock,
  Users,
  BookOpen,
  AlertCircle,
  CheckCircle,
  Star,
  ExternalLink,
} from "lucide-react-native";
import NodoXLogo from "@/components/NodoXLogo";

type FAQItem = {
  question: string;
  answer: string;
  category: string;
};

type SupportTicket = {
  id: string;
  subject: string;
  status: 'open' | 'in-progress' | 'resolved';
  priority: 'low' | 'medium' | 'high';
  createdAt: Date;
  lastUpdate: Date;
};

export default function HelpSupportScreen() {
  const [activeTab, setActiveTab] = useState<'faq' | 'contact' | 'tickets'>('faq');
  const [selectedCategory, setSelectedCategory] = useState<string>('general');
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketMessage, setTicketMessage] = useState('');
  const [ticketPriority, setTicketPriority] = useState<'low' | 'medium' | 'high'>('medium');

  const faqData: FAQItem[] = [
    {
      question: "¿Cómo puedo ganar NCOP?",
      answer: "Puedes ganar NCOP de varias formas: completando ofertas, refiriendo amigos, participando en la comunidad, y realizando compras con aliados.",
      category: "general"
    },
    {
      question: "¿Cómo canjeo mis NCOP?",
      answer: "Ve a la sección de Ofertas, selecciona la oferta que deseas y toca 'Canjear'. Los NCOP se descontarán automáticamente de tu saldo.",
      category: "general"
    },
    {
      question: "¿Qué es NodePass Premium?",
      answer: "NodePass Premium es nuestra membresía que te da acceso a ofertas exclusivas, mayor porcentaje de NCOP en compras y soporte prioritario.",
      category: "premium"
    },
    {
      question: "¿Cómo me convierto en aliado?",
      answer: "Puedes aplicar para ser aliado desde tu perfil. Necesitas tener un negocio verificado y cumplir con nuestros requisitos mínimos.",
      category: "ally"
    },
    {
      question: "¿Es segura mi información personal?",
      answer: "Sí, utilizamos encriptación de grado bancario y nunca compartimos tu información personal con terceros sin tu consentimiento.",
      category: "security"
    },
    {
      question: "¿Cómo reporto un problema técnico?",
      answer: "Puedes reportar problemas técnicos a través del formulario de contacto o enviando un ticket de soporte con detalles específicos.",
      category: "technical"
    },
  ];

  const supportTickets: SupportTicket[] = [
    {
      id: "TK-001",
      subject: "Problema con canje de NCOP",
      status: "in-progress",
      priority: "high",
      createdAt: new Date(2024, 0, 15),
      lastUpdate: new Date(2024, 0, 16),
    },
    {
      id: "TK-002",
      subject: "Consulta sobre NodePass Premium",
      status: "resolved",
      priority: "medium",
      createdAt: new Date(2024, 0, 10),
      lastUpdate: new Date(2024, 0, 12),
    },
  ];

  const categories = [
    { id: 'general', name: 'General', icon: HelpCircle },
    { id: 'premium', name: 'Premium', icon: Star },
    { id: 'ally', name: 'Aliados', icon: Users },
    { id: 'security', name: 'Seguridad', icon: AlertCircle },
    { id: 'technical', name: 'Técnico', icon: BookOpen },
  ];

  const contactMethods = [
    {
      icon: MessageCircle,
      title: "Chat en vivo",
      subtitle: "Respuesta inmediata",
      available: "24/7",
      color: "#10b981",
      onPress: () => Alert.alert("Chat en vivo", "Conectando con un agente...")
    },
    {
      icon: Phone,
      title: "Teléfono",
      subtitle: "+1 (555) 123-4567",
      available: "Lun-Vie 9AM-6PM",
      color: "#3b82f6",
      onPress: () => Linking.openURL('tel:+15551234567')
    },
    {
      icon: Mail,
      title: "Email",
      subtitle: "soporte@nodox.com",
      available: "Respuesta en 24h",
      color: "#8b5cf6",
      onPress: () => Linking.openURL('mailto:soporte@nodox.com')
    },
  ];

  const filteredFAQ = faqData.filter(item => item.category === selectedCategory);

  const handleSubmitTicket = () => {
    if (!ticketSubject.trim() || !ticketMessage.trim()) {
      Alert.alert("Error", "Por favor completa todos los campos");
      return;
    }

    Alert.alert(
      "Ticket enviado",
      "Tu solicitud ha sido enviada exitosamente. Te contactaremos pronto.",
      [
        {
          text: "OK",
          onPress: () => {
            setTicketSubject('');
            setTicketMessage('');
            setTicketPriority('medium');
          }
        }
      ]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return '#f59e0b';
      case 'in-progress': return '#3b82f6';
      case 'resolved': return '#10b981';
      default: return '#64748b';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open': return Clock;
      case 'in-progress': return AlertCircle;
      case 'resolved': return CheckCircle;
      default: return HelpCircle;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'low': return '#10b981';
      default: return '#64748b';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen 
        options={{
          title: "Ayuda y Soporte",
          headerStyle: { backgroundColor: '#ffffff' },
          headerTitleStyle: { color: '#1e293b', fontWeight: 'bold' },
        }} 
      />
      
      {/* Header */}
      <View style={styles.header}>
        <NodoXLogo size="small" />
        <Text style={styles.headerTitle}>¿En qué podemos ayudarte?</Text>
        <Text style={styles.headerSubtitle}>Estamos aquí para resolver tus dudas</Text>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'faq' && styles.activeTab]}
          onPress={() => setActiveTab('faq')}
        >
          <BookOpen 
            color={activeTab === 'faq' ? '#2563eb' : '#64748b'} 
            size={20} 
          />
          <Text style={[styles.tabText, activeTab === 'faq' && styles.activeTabText]}>
            FAQ
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'contact' && styles.activeTab]}
          onPress={() => setActiveTab('contact')}
        >
          <MessageCircle 
            color={activeTab === 'contact' ? '#2563eb' : '#64748b'} 
            size={20} 
          />
          <Text style={[styles.tabText, activeTab === 'contact' && styles.activeTabText]}>
            Contacto
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'tickets' && styles.activeTab]}
          onPress={() => setActiveTab('tickets')}
        >
          <FileText 
            color={activeTab === 'tickets' ? '#2563eb' : '#64748b'} 
            size={20} 
          />
          <Text style={[styles.tabText, activeTab === 'tickets' && styles.activeTabText]}>
            Tickets
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* FAQ Tab */}
        {activeTab === 'faq' && (
          <View>
            {/* Category Filter */}
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.categoryScroll}
              contentContainerStyle={styles.categoryContainer}
            >
              {categories.map((category) => {
                const IconComponent = category.icon;
                return (
                  <TouchableOpacity
                    key={category.id}
                    style={[
                      styles.categoryChip,
                      selectedCategory === category.id && styles.activeCategoryChip
                    ]}
                    onPress={() => setSelectedCategory(category.id)}
                  >
                    <IconComponent 
                      color={selectedCategory === category.id ? '#ffffff' : '#64748b'} 
                      size={16} 
                    />
                    <Text style={[
                      styles.categoryChipText,
                      selectedCategory === category.id && styles.activeCategoryChipText
                    ]}>
                      {category.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* FAQ Items */}
            <View style={styles.faqContainer}>
              {filteredFAQ.map((item) => (
                <View key={item.question} style={styles.faqItem}>
                  <Text style={styles.faqQuestion}>{item.question}</Text>
                  <Text style={styles.faqAnswer}>{item.answer}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Contact Tab */}
        {activeTab === 'contact' && (
          <View>
            {/* Contact Methods */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Métodos de contacto</Text>
              {contactMethods.map((method) => {
                const IconComponent = method.icon;
                return (
                  <TouchableOpacity 
                    key={method.title} 
                    style={styles.contactMethod}
                    onPress={method.onPress}
                  >
                    <View style={[styles.contactIcon, { backgroundColor: `${method.color}20` }]}>
                      <IconComponent color={method.color} size={24} />
                    </View>
                    <View style={styles.contactContent}>
                      <Text style={styles.contactTitle}>{method.title}</Text>
                      <Text style={styles.contactSubtitle}>{method.subtitle}</Text>
                      <Text style={styles.contactAvailable}>{method.available}</Text>
                    </View>
                    <ChevronRight color="#64748b" size={20} />
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Contact Form */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Enviar consulta</Text>
              <View style={styles.form}>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Asunto</Text>
                  <TextInput
                    style={styles.textInput}
                    value={ticketSubject}
                    onChangeText={setTicketSubject}
                    placeholder="Describe brevemente tu consulta"
                    placeholderTextColor="#94a3b8"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Prioridad</Text>
                  <View style={styles.priorityContainer}>
                    {(['low', 'medium', 'high'] as const).map((priority) => (
                      <TouchableOpacity
                        key={priority}
                        style={[
                          styles.priorityChip,
                          ticketPriority === priority && styles.activePriorityChip,
                          { borderColor: getPriorityColor(priority) }
                        ]}
                        onPress={() => setTicketPriority(priority)}
                      >
                        <Text style={[
                          styles.priorityText,
                          ticketPriority === priority && { color: getPriorityColor(priority) }
                        ]}>
                          {priority === 'low' ? 'Baja' : priority === 'medium' ? 'Media' : 'Alta'}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Mensaje</Text>
                  <TextInput
                    style={[styles.textInput, styles.textArea]}
                    value={ticketMessage}
                    onChangeText={setTicketMessage}
                    placeholder="Describe tu consulta en detalle..."
                    placeholderTextColor="#94a3b8"
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                  />
                </View>

                <TouchableOpacity style={styles.submitButton} onPress={handleSubmitTicket}>
                  <Send color="#ffffff" size={20} />
                  <Text style={styles.submitButtonText}>Enviar consulta</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {/* Tickets Tab */}
        {activeTab === 'tickets' && (
          <View>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Mis tickets de soporte</Text>
              {supportTickets.length > 0 ? (
                supportTickets.map((ticket) => {
                  const StatusIcon = getStatusIcon(ticket.status);
                  return (
                    <View key={ticket.id} style={styles.ticketItem}>
                      <View style={styles.ticketHeader}>
                        <View style={styles.ticketInfo}>
                          <Text style={styles.ticketId}>#{ticket.id}</Text>
                          <Text style={styles.ticketSubject}>{ticket.subject}</Text>
                        </View>
                        <View style={styles.ticketBadges}>
                          <View style={[
                            styles.priorityBadge,
                            { backgroundColor: `${getPriorityColor(ticket.priority)}20` }
                          ]}>
                            <Text style={[
                              styles.priorityBadgeText,
                              { color: getPriorityColor(ticket.priority) }
                            ]}>
                              {ticket.priority === 'low' ? 'Baja' : 
                               ticket.priority === 'medium' ? 'Media' : 'Alta'}
                            </Text>
                          </View>
                          <View style={[
                            styles.statusBadge,
                            { backgroundColor: `${getStatusColor(ticket.status)}20` }
                          ]}>
                            <StatusIcon 
                              color={getStatusColor(ticket.status)} 
                              size={12} 
                            />
                            <Text style={[
                              styles.statusBadgeText,
                              { color: getStatusColor(ticket.status) }
                            ]}>
                              {ticket.status === 'open' ? 'Abierto' :
                               ticket.status === 'in-progress' ? 'En progreso' : 'Resuelto'}
                            </Text>
                          </View>
                        </View>
                      </View>
                      <View style={styles.ticketFooter}>
                        <Text style={styles.ticketDate}>
                          Creado: {ticket.createdAt.toLocaleDateString()}
                        </Text>
                        <Text style={styles.ticketDate}>
                          Actualizado: {ticket.lastUpdate.toLocaleDateString()}
                        </Text>
                      </View>
                    </View>
                  );
                })
              ) : (
                <View style={styles.emptyState}>
                  <FileText color="#94a3b8" size={48} />
                  <Text style={styles.emptyStateTitle}>No tienes tickets</Text>
                  <Text style={styles.emptyStateText}>
                    Cuando envíes una consulta, aparecerá aquí
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Quick Links */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Enlaces útiles</Text>
          <TouchableOpacity 
            style={styles.quickLink}
            onPress={() => Linking.openURL('https://nodox.com/terms')}
          >
            <FileText color="#64748b" size={20} />
            <Text style={styles.quickLinkText}>Términos y Condiciones</Text>
            <ExternalLink color="#64748b" size={16} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.quickLink}
            onPress={() => Linking.openURL('https://nodox.com/privacy')}
          >
            <FileText color="#64748b" size={20} />
            <Text style={styles.quickLinkText}>Política de Privacidad</Text>
            <ExternalLink color="#64748b" size={16} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.quickLink}
            onPress={() => Linking.openURL('https://nodox.com/guide')}
          >
            <BookOpen color="#64748b" size={20} />
            <Text style={styles.quickLinkText}>Guía de Usuario</Text>
            <ExternalLink color="#64748b" size={16} />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingVertical: 24,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginTop: 12,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#64748b',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 6,
  },
  activeTab: {
    backgroundColor: '#eff6ff',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748b',
  },
  activeTabText: {
    color: '#2563eb',
  },
  content: {
    flex: 1,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  // FAQ Styles
  categoryScroll: {
    marginBottom: 20,
  },
  categoryContainer: {
    paddingHorizontal: 20,
    gap: 8,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 6,
  },
  activeCategoryChip: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  categoryChipText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748b',
  },
  activeCategoryChipText: {
    color: '#ffffff',
  },
  faqContainer: {
    paddingHorizontal: 20,
    gap: 12,
  },
  faqItem: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  faqQuestion: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 8,
  },
  faqAnswer: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
  },
  // Contact Styles
  contactMethod: {
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  contactIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  contactContent: {
    flex: 1,
  },
  contactTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 2,
  },
  contactSubtitle: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 2,
  },
  contactAvailable: {
    fontSize: 12,
    color: '#10b981',
    fontWeight: '500',
  },
  // Form Styles
  form: {
    paddingHorizontal: 20,
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
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1f2937',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  priorityContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  priorityChip: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    backgroundColor: '#ffffff',
    alignItems: 'center',
  },
  activePriorityChip: {
    backgroundColor: '#f8fafc',
  },
  priorityText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748b',
  },
  submitButton: {
    backgroundColor: '#2563eb',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 8,
    gap: 8,
    marginTop: 8,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  // Tickets Styles
  ticketItem: {
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    marginBottom: 12,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  ticketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  ticketInfo: {
    flex: 1,
    marginRight: 12,
  },
  ticketId: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
    marginBottom: 4,
  },
  ticketSubject: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  ticketBadges: {
    gap: 6,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-end',
  },
  priorityBadgeText: {
    fontSize: 10,
    fontWeight: '600',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
    alignSelf: 'flex-end',
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '600',
  },
  ticketFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  ticketDate: {
    fontSize: 12,
    color: '#64748b',
  },
  // Empty State
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 20,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  // Quick Links
  quickLink: {
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginHorizontal: 20,
    marginBottom: 8,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  quickLinkText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginLeft: 12,
  },
});