import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  SafeAreaView,
  Modal,
} from 'react-native';
import { Stack } from 'expo-router';
import {
  MessageCircle,
  Search,
  Filter,
  Plus,
  Clock,
  User,
  AlertCircle,
  CheckCircle,
  XCircle,
  Send,
  Phone,
  Mail,
  Tag,
  Calendar,
} from 'lucide-react-native';
import { useSupport } from '@/hooks/use-support';
import { SupportTicket, SupportMessage } from '@/types/crm';

export default function SupportCenter() {
  const {
    tickets,
    supportStats,
    searchQuery,
    setSearchQuery,
    filterStatus,
    setFilterStatus,
    filterCategory,
    setFilterCategory,
    filterPriority,
    setFilterPriority,
    selectedTicket,
    setSelectedTicket,
    createTicket,
    updateTicket,
    addMessage,
    assignTicket,
    closeTicket,
    getTicketById,
  } = useSupport();

  const [showFilters, setShowFilters] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newMessage, setNewMessage] = useState('');

  const getPriorityColor = (priority: SupportTicket['priority']) => {
    switch (priority) {
      case 'urgent': return '#ef4444';
      case 'high': return '#f97316';
      case 'medium': return '#eab308';
      case 'low': return '#22c55e';
      default: return '#6b7280';
    }
  };

  const getPriorityLabel = (priority: SupportTicket['priority']) => {
    switch (priority) {
      case 'urgent': return 'Urgente';
      case 'high': return 'Alta';
      case 'medium': return 'Media';
      case 'low': return 'Baja';
      default: return 'Desconocida';
    }
  };

  const getStatusColor = (status: SupportTicket['status']) => {
    switch (status) {
      case 'open': return '#3b82f6';
      case 'in_progress': return '#f59e0b';
      case 'waiting_customer': return '#8b5cf6';
      case 'resolved': return '#10b981';
      case 'closed': return '#6b7280';
      default: return '#6b7280';
    }
  };

  const getStatusLabel = (status: SupportTicket['status']) => {
    switch (status) {
      case 'open': return 'Abierto';
      case 'in_progress': return 'En Progreso';
      case 'waiting_customer': return 'Esperando Cliente';
      case 'resolved': return 'Resuelto';
      case 'closed': return 'Cerrado';
      default: return 'Desconocido';
    }
  };

  const getStatusIcon = (status: SupportTicket['status']) => {
    switch (status) {
      case 'open': return <AlertCircle size={16} color={getStatusColor(status)} />;
      case 'in_progress': return <Clock size={16} color={getStatusColor(status)} />;
      case 'waiting_customer': return <User size={16} color={getStatusColor(status)} />;
      case 'resolved': return <CheckCircle size={16} color={getStatusColor(status)} />;
      case 'closed': return <XCircle size={16} color={getStatusColor(status)} />;
      default: return <AlertCircle size={16} color={getStatusColor(status)} />;
    }
  };

  const getCategoryLabel = (category: SupportTicket['category']) => {
    switch (category) {
      case 'technical': return 'Técnico';
      case 'billing': return 'Facturación';
      case 'general': return 'General';
      case 'complaint': return 'Queja';
      case 'feature_request': return 'Solicitud de Función';
      default: return 'Desconocida';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedTicket) return;

    addMessage(selectedTicket, {
      senderId: 'current-user',
      senderName: 'Soporte',
      senderType: 'support',
      message: newMessage.trim(),
      isInternal: false
    });

    setNewMessage('');
    Alert.alert('Éxito', 'Mensaje enviado correctamente');
  };

  const handleAssignTicket = (ticketId: string) => {
    assignTicket(ticketId, 'current-user');
    Alert.alert('Éxito', 'Ticket asignado correctamente');
  };

  const handleCloseTicket = (ticketId: string) => {
    Alert.alert(
      'Cerrar Ticket',
      '¿Estás seguro de que quieres cerrar este ticket?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cerrar',
          onPress: () => {
            closeTicket(ticketId);
            setSelectedTicket(null);
            Alert.alert('Éxito', 'Ticket cerrado correctamente');
          }
        }
      ]
    );
  };

  const selectedTicketData = selectedTicket ? getTicketById(selectedTicket) : null;

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Centro de Soporte',
          headerStyle: { backgroundColor: '#2563eb' },
          headerTintColor: '#ffffff',
          headerTitleStyle: { fontWeight: 'bold' },
        }}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <MessageCircle size={24} color="#2563eb" />
            <Text style={styles.statNumber}>{supportStats.totalTickets}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={styles.statCard}>
            <AlertCircle size={24} color="#f59e0b" />
            <Text style={styles.statNumber}>{supportStats.openTickets}</Text>
            <Text style={styles.statLabel}>Abiertos</Text>
          </View>
          <View style={styles.statCard}>
            <Clock size={24} color="#10b981" />
            <Text style={styles.statNumber}>{supportStats.averageResponseTime.toFixed(1)}h</Text>
            <Text style={styles.statLabel}>Respuesta</Text>
          </View>
          <View style={styles.statCard}>
            <CheckCircle size={24} color="#8b5cf6" />
            <Text style={styles.statNumber}>{supportStats.customerSatisfactionScore.toFixed(1)}</Text>
            <Text style={styles.statLabel}>Satisfacción</Text>
          </View>
        </View>

        {/* Search and Filters */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBox}>
            <Search size={20} color="#6b7280" />
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar tickets..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#9ca3af"
            />
          </View>
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => setShowFilters(!showFilters)}
          >
            <Filter size={20} color="#2563eb" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowCreateModal(true)}
          >
            <Plus size={20} color="#ffffff" />
          </TouchableOpacity>
        </View>

        {/* Filters Panel */}
        {showFilters && (
          <View style={styles.filtersPanel}>
            <Text style={styles.filterTitle}>Estado</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {[
                { key: 'all', label: 'Todos' },
                { key: 'open', label: 'Abiertos' },
                { key: 'in_progress', label: 'En Progreso' },
                { key: 'waiting_customer', label: 'Esperando' },
                { key: 'resolved', label: 'Resueltos' },
                { key: 'closed', label: 'Cerrados' }
              ].map((option) => (
                <TouchableOpacity
                  key={option.key}
                  style={[
                    styles.filterChip,
                    filterStatus === option.key && styles.filterChipActive
                  ]}
                  onPress={() => setFilterStatus(option.key as any)}
                >
                  <Text style={[
                    styles.filterChipText,
                    filterStatus === option.key && styles.filterChipTextActive
                  ]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.filterTitle}>Prioridad</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {[
                { key: 'all', label: 'Todas' },
                { key: 'urgent', label: 'Urgente' },
                { key: 'high', label: 'Alta' },
                { key: 'medium', label: 'Media' },
                { key: 'low', label: 'Baja' }
              ].map((option) => (
                <TouchableOpacity
                  key={option.key}
                  style={[
                    styles.filterChip,
                    filterPriority === option.key && styles.filterChipActive
                  ]}
                  onPress={() => setFilterPriority(option.key as any)}
                >
                  <Text style={[
                    styles.filterChipText,
                    filterPriority === option.key && styles.filterChipTextActive
                  ]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Tickets List */}
        <View style={styles.ticketsList}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Tickets ({tickets.length})</Text>
          </View>

          {tickets.map((ticket) => (
            <TouchableOpacity
              key={ticket.id}
              style={styles.ticketCard}
              onPress={() => setSelectedTicket(ticket.id)}
            >
              <View style={styles.ticketHeader}>
                <View style={styles.ticketInfo}>
                  <Text style={styles.ticketSubject}>{ticket.subject}</Text>
                  <Text style={styles.ticketCustomer}>{ticket.customerName}</Text>
                  <Text style={styles.ticketDescription} numberOfLines={2}>
                    {ticket.description}
                  </Text>
                </View>
                <View style={styles.ticketMeta}>
                  <View style={[
                    styles.priorityBadge,
                    { backgroundColor: getPriorityColor(ticket.priority) }
                  ]}>
                    <Text style={styles.priorityText}>{getPriorityLabel(ticket.priority)}</Text>
                  </View>
                  <View style={styles.statusContainer}>
                    {getStatusIcon(ticket.status)}
                    <Text style={[
                      styles.statusText,
                      { color: getStatusColor(ticket.status) }
                    ]}>
                      {getStatusLabel(ticket.status)}
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.ticketFooter}>
                <View style={styles.ticketDetails}>
                  <Text style={styles.ticketCategory}>{getCategoryLabel(ticket.category)}</Text>
                  <Text style={styles.ticketDate}>{formatDate(ticket.createdAt)}</Text>
                </View>
                <View style={styles.ticketActions}>
                  {ticket.assignedTo && (
                    <View style={styles.assignedBadge}>
                      <User size={12} color="#6b7280" />
                      <Text style={styles.assignedText}>Asignado</Text>
                    </View>
                  )}
                  <Text style={styles.messageCount}>
                    {ticket.messages.length} mensajes
                  </Text>
                </View>
              </View>

              {ticket.tags.length > 0 && (
                <View style={styles.ticketTags}>
                  {ticket.tags.map((tag, index) => (
                    <View key={index} style={styles.tag}>
                      <Tag size={10} color="#6b7280" />
                      <Text style={styles.tagText}>{tag}</Text>
                    </View>
                  ))}
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Ticket Details Modal */}
      <Modal
        visible={selectedTicketData !== null}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setSelectedTicket(null)}>
              <Text style={styles.modalCancel}>Cerrar</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Ticket #{selectedTicketData?.id}</Text>
            <TouchableOpacity
              onPress={() => selectedTicketData && handleCloseTicket(selectedTicketData.id)}
            >
              <Text style={styles.modalAction}>Cerrar Ticket</Text>
            </TouchableOpacity>
          </View>

          {selectedTicketData && (
            <ScrollView style={styles.modalContent}>
              {/* Ticket Info */}
              <View style={styles.ticketInfoSection}>
                <Text style={styles.modalSubject}>{selectedTicketData.subject}</Text>
                <View style={styles.modalMeta}>
                  <View style={styles.modalMetaRow}>
                    <Text style={styles.modalLabel}>Cliente:</Text>
                    <Text style={styles.modalValue}>{selectedTicketData.customerName}</Text>
                  </View>
                  <View style={styles.modalMetaRow}>
                    <Text style={styles.modalLabel}>Email:</Text>
                    <Text style={styles.modalValue}>{selectedTicketData.customerEmail}</Text>
                  </View>
                  <View style={styles.modalMetaRow}>
                    <Text style={styles.modalLabel}>Categoría:</Text>
                    <Text style={styles.modalValue}>{getCategoryLabel(selectedTicketData.category)}</Text>
                  </View>
                  <View style={styles.modalMetaRow}>
                    <Text style={styles.modalLabel}>Prioridad:</Text>
                    <View style={[
                      styles.priorityBadge,
                      { backgroundColor: getPriorityColor(selectedTicketData.priority) }
                    ]}>
                      <Text style={styles.priorityText}>{getPriorityLabel(selectedTicketData.priority)}</Text>
                    </View>
                  </View>
                  <View style={styles.modalMetaRow}>
                    <Text style={styles.modalLabel}>Estado:</Text>
                    <View style={styles.statusContainer}>
                      {getStatusIcon(selectedTicketData.status)}
                      <Text style={[
                        styles.statusText,
                        { color: getStatusColor(selectedTicketData.status) }
                      ]}>
                        {getStatusLabel(selectedTicketData.status)}
                      </Text>
                    </View>
                  </View>
                </View>

                {!selectedTicketData.assignedTo && (
                  <TouchableOpacity
                    style={styles.assignButton}
                    onPress={() => handleAssignTicket(selectedTicketData.id)}
                  >
                    <User size={16} color="#ffffff" />
                    <Text style={styles.assignButtonText}>Asignar a mí</Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Messages */}
              <View style={styles.messagesSection}>
                <Text style={styles.sectionTitle}>Conversación</Text>
                {selectedTicketData.messages.map((message) => (
                  <View
                    key={message.id}
                    style={[
                      styles.messageCard,
                      message.senderType === 'support' && styles.supportMessage
                    ]}
                  >
                    <View style={styles.messageHeader}>
                      <Text style={styles.messageSender}>{message.senderName}</Text>
                      <Text style={styles.messageDate}>{formatDate(message.createdAt)}</Text>
                    </View>
                    <Text style={styles.messageText}>{message.message}</Text>
                  </View>
                ))}
              </View>

              {/* Reply Section */}
              <View style={styles.replySection}>
                <Text style={styles.sectionTitle}>Responder</Text>
                <View style={styles.replyBox}>
                  <TextInput
                    style={styles.replyInput}
                    placeholder="Escribe tu respuesta..."
                    value={newMessage}
                    onChangeText={setNewMessage}
                    multiline
                    numberOfLines={4}
                    placeholderTextColor="#9ca3af"
                  />
                  <TouchableOpacity
                    style={styles.sendButton}
                    onPress={handleSendMessage}
                    disabled={!newMessage.trim()}
                  >
                    <Send size={16} color="#ffffff" />
                    <Text style={styles.sendButtonText}>Enviar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
          )}
        </SafeAreaView>
      </Modal>

      {/* Create Ticket Modal */}
      <Modal
        visible={showCreateModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowCreateModal(false)}>
              <Text style={styles.modalCancel}>Cancelar</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Nuevo Ticket</Text>
            <TouchableOpacity>
              <Text style={styles.modalAction}>Crear</Text>
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalContent}>
            <Text style={styles.modalText}>
              Funcionalidad de creación de tickets en desarrollo...
            </Text>
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
  content: {
    flex: 1,
    padding: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
    textAlign: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#1f2937',
  },
  filterButton: {
    backgroundColor: '#ffffff',
    padding: 12,
    borderRadius: 12,
    marginRight: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  addButton: {
    backgroundColor: '#2563eb',
    padding: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  filtersPanel: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  filterChip: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: '#2563eb',
  },
  filterChipText: {
    fontSize: 14,
    color: '#6b7280',
  },
  filterChipTextActive: {
    color: '#ffffff',
  },
  ticketsList: {
    flex: 1,
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
    color: '#1f2937',
  },
  ticketCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  ticketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  ticketInfo: {
    flex: 1,
    marginRight: 12,
  },
  ticketSubject: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  ticketCustomer: {
    fontSize: 14,
    color: '#2563eb',
    marginBottom: 4,
  },
  ticketDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  ticketMeta: {
    alignItems: 'flex-end',
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
  },
  priorityText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '500',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    marginLeft: 4,
    fontSize: 12,
    fontWeight: '500',
  },
  ticketFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  ticketDetails: {
    flex: 1,
  },
  ticketCategory: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 2,
  },
  ticketDate: {
    fontSize: 12,
    color: '#9ca3af',
  },
  ticketActions: {
    alignItems: 'flex-end',
  },
  assignedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0fdf4',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginBottom: 4,
  },
  assignedText: {
    marginLeft: 4,
    fontSize: 10,
    color: '#16a34a',
  },
  messageCount: {
    fontSize: 12,
    color: '#6b7280',
  },
  ticketTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginRight: 6,
    marginBottom: 4,
  },
  tagText: {
    marginLeft: 4,
    fontSize: 10,
    color: '#6b7280',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    backgroundColor: '#ffffff',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  modalCancel: {
    fontSize: 16,
    color: '#6b7280',
  },
  modalAction: {
    fontSize: 16,
    color: '#2563eb',
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  modalText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 50,
  },
  ticketInfoSection: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  modalSubject: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
  },
  modalMeta: {
    marginBottom: 16,
  },
  modalMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  modalLabel: {
    fontSize: 14,
    color: '#6b7280',
    width: 80,
  },
  modalValue: {
    fontSize: 14,
    color: '#1f2937',
    flex: 1,
  },
  assignButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563eb',
    paddingVertical: 12,
    borderRadius: 8,
  },
  assignButtonText: {
    marginLeft: 8,
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  messagesSection: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  messageCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#e5e7eb',
  },
  supportMessage: {
    backgroundColor: '#eff6ff',
    borderLeftColor: '#2563eb',
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  messageSender: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  messageDate: {
    fontSize: 12,
    color: '#6b7280',
  },
  messageText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  replySection: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  replyBox: {
    marginTop: 12,
  },
  replyInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#1f2937',
    textAlignVertical: 'top',
    marginBottom: 12,
  },
  sendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563eb',
    paddingVertical: 12,
    borderRadius: 8,
  },
  sendButtonText: {
    marginLeft: 8,
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});