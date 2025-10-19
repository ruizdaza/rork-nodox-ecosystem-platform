import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, router } from 'expo-router';
import { 
  ArrowLeft, 
  Search, 
  MessageSquare, 
  User,
  Send,
  Eye,
  Clock,
  CheckCircle2
} from 'lucide-react-native';
import { useChat } from '@/hooks/use-chat';

type ChatStatus = 'active' | 'pending' | 'resolved';

export default function AllyMessagesScreen() {
  const { chats, users, getChatName, getChatParticipants, startChatWithContact } = useChat();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeTab, setActiveTab] = useState<ChatStatus>('active');

  const usersMap = users as Record<string, typeof users['current-user']>;

  const myChats = chats.filter(chat => {
    const participants = chat.participants.map(id => usersMap[id]).filter(Boolean);
    return participants.some(p => p?.isAlly);
  });

  const getMessageStatus = (_chat: typeof chats[0]): ChatStatus => {
    return 'active';
  };

  const filteredChats = myChats.filter(chat => {
    const status = getMessageStatus(chat);
    const matchesTab = status === activeTab;
    
    if (!matchesTab) return false;
    
    if (searchQuery) {
      const name = getChatName(chat).toLowerCase();
      const participants = getChatParticipants(chat);
      const participantNames = participants.map(p => p.name.toLowerCase()).join(' ');
      return name.includes(searchQuery.toLowerCase()) || participantNames.includes(searchQuery.toLowerCase());
    }
    
    return true;
  });

  const stats = {
    totalChats: myChats.length,
    activeChats: myChats.filter(c => getMessageStatus(c) === 'active').length,
    pendingChats: myChats.filter(c => getMessageStatus(c) === 'pending').length,
    resolvedChats: myChats.filter(c => getMessageStatus(c) === 'resolved').length,
    unreadMessages: myChats.reduce((sum, chat) => sum + chat.unreadCount, 0),
  };

  const handleViewChat = (_chatId: string) => {
    router.push('/conversation');
  };

  const allCustomers = Object.values(users).filter(u => 
    u.roles.includes('user') && !u.roles.includes('admin')
  );

  const tabs: { key: ChatStatus; label: string; count: number }[] = [
    { key: 'active', label: 'Activos', count: stats.activeChats },
    { key: 'pending', label: 'Pendientes', count: stats.pendingChats },
    { key: 'resolved', label: 'Resueltos', count: stats.resolvedChats },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Mensajería - Aliado',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <ArrowLeft size={24} color="#1e293b" />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <MessageSquare size={24} color="#2563eb" />
            <Text style={styles.statValue}>{stats.totalChats}</Text>
            <Text style={styles.statLabel}>Total Chats</Text>
          </View>
          <View style={styles.statCard}>
            <Clock size={24} color="#f59e0b" />
            <Text style={styles.statValue}>{stats.unreadMessages}</Text>
            <Text style={styles.statLabel}>No Leídos</Text>
          </View>
        </View>

        <View style={styles.tabsContainer}>
          {tabs.map(tab => (
            <TouchableOpacity
              key={tab.key}
              style={[
                styles.tab,
                activeTab === tab.key && styles.tabActive
              ]}
              onPress={() => setActiveTab(tab.key)}
            >
              <Text style={[
                styles.tabText,
                activeTab === tab.key && styles.tabTextActive
              ]}>
                {tab.label}
              </Text>
              <View style={[
                styles.tabBadge,
                activeTab === tab.key && styles.tabBadgeActive
              ]}>
                <Text style={[
                  styles.tabBadgeText,
                  activeTab === tab.key && styles.tabBadgeTextActive
                ]}>
                  {tab.count}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.searchContainer}>
          <Search size={20} color="#94a3b8" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar conversaciones..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#94a3b8"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Conversaciones {activeTab === 'active' ? 'Activas' : activeTab === 'pending' ? 'Pendientes' : 'Resueltas'} ({filteredChats.length})
          </Text>
          {filteredChats.map(chat => {
            const participants = getChatParticipants(chat);
            const customer = participants.find(p => !p.isAlly);
            
            return (
              <View key={chat.id} style={styles.chatCard}>
                <View style={styles.chatHeader}>
                  <View style={styles.chatInfo}>
                    {customer?.avatar ? (
                      <Image 
                        source={{ uri: customer.avatar }} 
                        style={styles.chatAvatar}
                      />
                    ) : (
                      <View style={[styles.chatAvatar, styles.chatAvatarPlaceholder]}>
                        <User size={24} color="#64748b" />
                      </View>
                    )}
                    <View style={styles.chatDetails}>
                      <Text style={styles.chatName}>{getChatName(chat)}</Text>
                      <View style={styles.chatMeta}>
                        {customer?.isOnline ? (
                          <View style={styles.onlineStatus}>
                            <View style={styles.onlineDot} />
                            <Text style={styles.onlineText}>En línea</Text>
                          </View>
                        ) : (
                          <Text style={styles.offlineText}>
                            {customer?.lastSeen 
                              ? `Visto ${new Date(customer.lastSeen).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })}`
                              : 'Desconectado'
                            }
                          </Text>
                        )}
                      </View>
                    </View>
                  </View>
                  {chat.unreadCount > 0 && (
                    <View style={styles.unreadBadge}>
                      <Text style={styles.unreadText}>{chat.unreadCount}</Text>
                    </View>
                  )}
                </View>

                {chat.lastMessage && (
                  <View style={styles.lastMessage}>
                    <Text style={styles.lastMessageText} numberOfLines={2}>
                      {chat.lastMessage.content}
                    </Text>
                    <Text style={styles.lastMessageTime}>
                      {new Date(chat.lastMessage.timestamp).toLocaleString('es-ES', {
                        hour: '2-digit',
                        minute: '2-digit',
                        day: '2-digit',
                        month: 'short',
                      })}
                    </Text>
                  </View>
                )}

                <View style={styles.chatActions}>
                  <TouchableOpacity 
                    style={[styles.actionButton, styles.actionButtonPrimary]}
                    onPress={() => handleViewChat(chat.id)}
                  >
                    <Eye size={16} color="#ffffff" />
                    <Text style={styles.actionButtonPrimaryText}>Ver Chat</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.actionButton}>
                    <Send size={16} color="#2563eb" />
                    <Text style={styles.actionButtonText}>Responder</Text>
                  </TouchableOpacity>
                  {activeTab === 'active' && (
                    <TouchableOpacity style={styles.actionButton}>
                      <CheckCircle2 size={16} color="#10b981" />
                      <Text style={styles.actionButtonText}>Resolver</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            );
          })}
          
          {filteredChats.length === 0 && (
            <View style={styles.emptyState}>
              <MessageSquare size={48} color="#cbd5e1" />
              <Text style={styles.emptyStateTitle}>No hay conversaciones</Text>
              <Text style={styles.emptyStateText}>
                {activeTab === 'active' 
                  ? 'No tienes conversaciones activas en este momento'
                  : activeTab === 'pending'
                  ? 'No hay mensajes pendientes de respuesta'
                  : 'No hay conversaciones resueltas'
                }
              </Text>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Clientes Frecuentes</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.customersRow}>
              {allCustomers.slice(0, 10).map(customer => (
                <TouchableOpacity 
                  key={customer.id}
                  style={styles.customerCard}
                  onPress={async () => {
                    await startChatWithContact(customer.id);
                    router.push('/conversation');
                  }}
                >
                  {customer.avatar ? (
                    <Image source={{ uri: customer.avatar }} style={styles.customerAvatar} />
                  ) : (
                    <View style={[styles.customerAvatar, styles.customerAvatarPlaceholder]}>
                      <Text style={styles.customerAvatarText}>{customer.name.charAt(0)}</Text>
                    </View>
                  )}
                  <Text style={styles.customerName} numberOfLines={1}>{customer.name}</Text>
                  {customer.isOnline && (
                    <View style={styles.customerOnlineDot} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
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
  backButton: {
    marginLeft: 8,
  },
  scrollView: {
    flex: 1,
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: '#1e293b',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '500' as const,
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
    gap: 8,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#ffffff',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e2e8f0',
  },
  tabActive: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#64748b',
  },
  tabTextActive: {
    color: '#ffffff',
  },
  tabBadge: {
    backgroundColor: '#f1f5f9',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  tabBadgeActive: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  tabBadgeText: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: '#64748b',
  },
  tabBadgeTextActive: {
    color: '#ffffff',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1e293b',
  },
  section: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#1e293b',
    marginBottom: 16,
  },
  chatCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  chatInfo: {
    flexDirection: 'row',
    flex: 1,
    gap: 12,
  },
  chatAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  chatAvatarPlaceholder: {
    backgroundColor: '#e2e8f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  chatDetails: {
    flex: 1,
  },
  chatName: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#1e293b',
    marginBottom: 4,
  },
  chatMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  onlineStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10b981',
  },
  onlineText: {
    fontSize: 12,
    color: '#10b981',
    fontWeight: '500' as const,
  },
  offlineText: {
    fontSize: 12,
    color: '#64748b',
  },
  unreadBadge: {
    backgroundColor: '#ef4444',
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  unreadText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700' as const,
  },
  lastMessage: {
    marginBottom: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  lastMessageText: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 6,
  },
  lastMessageTime: {
    fontSize: 11,
    color: '#94a3b8',
  },
  chatActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    flex: 1,
    backgroundColor: '#f8fafc',
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  actionButtonPrimary: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  actionButtonText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: '#2563eb',
  },
  actionButtonPrimaryText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: '#ffffff',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: '#64748b',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
  },
  customersRow: {
    flexDirection: 'row',
    gap: 12,
  },
  customerCard: {
    alignItems: 'center',
    width: 80,
  },
  customerAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginBottom: 8,
  },
  customerAvatarPlaceholder: {
    backgroundColor: '#e2e8f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  customerAvatarText: {
    fontSize: 20,
    fontWeight: '600' as const,
    color: '#64748b',
  },
  customerName: {
    fontSize: 12,
    fontWeight: '500' as const,
    color: '#64748b',
    textAlign: 'center',
  },
  customerOnlineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#10b981',
    position: 'absolute',
    top: 0,
    right: 12,
    borderWidth: 2,
    borderColor: '#ffffff',
  },
});
