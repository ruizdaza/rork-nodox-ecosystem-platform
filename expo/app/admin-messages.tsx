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
  Users, 
  UserCheck,
  Filter,
  Send,
  Eye,
  Ban,
  CheckCircle
} from 'lucide-react-native';
import { useChat } from '@/hooks/use-chat';

type ChatFilter = 'all' | 'user-user' | 'user-ally' | 'user-admin' | 'ally-admin' | 'support';

export default function AdminMessagesScreen() {
  const { chats, users, getChatName, getChatParticipants, startChatWithContact } = useChat();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeFilter, setActiveFilter] = useState<ChatFilter>('all');

  const allUsers = Object.values(users);
  const adminUsers = allUsers.filter(u => u.roles.includes('admin'));
  const allyUsers = allUsers.filter(u => u.roles.includes('ally'));
  const regularUsers = allUsers.filter(u => u.roles.includes('user') && !u.roles.includes('admin') && !u.roles.includes('ally'));

  const getChatType = (chat: typeof chats[0]): ChatFilter => {
    if (chat.type === 'support') return 'support';
    if (chat.type === 'ally_client') return 'user-ally';
    
    const usersMap = users as Record<string, typeof users['current-user']>;
    const participants = chat.participants.map(id => usersMap[id]).filter((p): p is typeof users['current-user'] => p !== undefined);
    const hasAdmin = participants.some(p => p.roles.includes('admin'));
    const hasAlly = participants.some(p => p.roles.includes('ally'));
    const hasUser = participants.some(p => p.roles.includes('user') && !p.roles.includes('admin') && !p.roles.includes('ally'));
    
    if (hasAdmin && hasAlly) return 'ally-admin';
    if (hasAdmin && hasUser) return 'user-admin';
    if (hasUser && hasAlly) return 'user-ally';
    if (hasUser) return 'user-user';
    
    return 'all';
  };

  const filteredChats = chats.filter(chat => {
    const chatType = getChatType(chat);
    const matchesFilter = activeFilter === 'all' || chatType === activeFilter;
    
    if (!matchesFilter) return false;
    
    if (searchQuery) {
      const name = getChatName(chat).toLowerCase();
      const participants = getChatParticipants(chat);
      const participantNames = participants.map(p => p.name.toLowerCase()).join(' ');
      return name.includes(searchQuery.toLowerCase()) || participantNames.includes(searchQuery.toLowerCase());
    }
    
    return true;
  });

  const filters: { key: ChatFilter; label: string; icon: any }[] = [
    { key: 'all', label: 'Todos', icon: MessageSquare },
    { key: 'user-user', label: 'Usuario-Usuario', icon: Users },
    { key: 'user-ally', label: 'Usuario-Aliado', icon: UserCheck },
    { key: 'user-admin', label: 'Usuario-Admin', icon: MessageSquare },
    { key: 'ally-admin', label: 'Aliado-Admin', icon: UserCheck },
    { key: 'support', label: 'Soporte', icon: MessageSquare },
  ];

  const getChatTypeColor = (type: ChatFilter): string => {
    switch (type) {
      case 'user-user': return '#10b981';
      case 'user-ally': return '#3b82f6';
      case 'user-admin': return '#f59e0b';
      case 'ally-admin': return '#8b5cf6';
      case 'support': return '#ef4444';
      default: return '#64748b';
    }
  };

  const handleViewChat = (_chatId: string) => {
    router.push('/conversation');
  };

  const handleStartChatWithUser = async (userId: string) => {
    try {
      await startChatWithContact(userId);
      router.push('/conversation');
    } catch (error) {
      console.error('Error starting chat:', error);
    }
  };

  const stats = {
    totalChats: chats.length,
    userUserChats: chats.filter(c => getChatType(c) === 'user-user').length,
    userAllyChats: chats.filter(c => getChatType(c) === 'user-ally').length,
    userAdminChats: chats.filter(c => getChatType(c) === 'user-admin').length,
    allyAdminChats: chats.filter(c => getChatType(c) === 'ally-admin').length,
    supportChats: chats.filter(c => getChatType(c) === 'support').length,
    activeUsers: allUsers.filter(u => u.isOnline).length,
    totalUsers: allUsers.length,
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Panel de Mensajería - Admin',
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
            <Text style={styles.statValue}>{stats.totalChats}</Text>
            <Text style={styles.statLabel}>Total Chats</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.activeUsers}/{stats.totalUsers}</Text>
            <Text style={styles.statLabel}>Usuarios Activos</Text>
          </View>
        </View>

        <View style={styles.statsGrid}>
          <View style={[styles.miniStatCard, { borderLeftColor: '#10b981' }]}>
            <Text style={styles.miniStatValue}>{stats.userUserChats}</Text>
            <Text style={styles.miniStatLabel}>Usuario-Usuario</Text>
          </View>
          <View style={[styles.miniStatCard, { borderLeftColor: '#3b82f6' }]}>
            <Text style={styles.miniStatValue}>{stats.userAllyChats}</Text>
            <Text style={styles.miniStatLabel}>Usuario-Aliado</Text>
          </View>
          <View style={[styles.miniStatCard, { borderLeftColor: '#f59e0b' }]}>
            <Text style={styles.miniStatValue}>{stats.userAdminChats}</Text>
            <Text style={styles.miniStatLabel}>Usuario-Admin</Text>
          </View>
          <View style={[styles.miniStatCard, { borderLeftColor: '#8b5cf6' }]}>
            <Text style={styles.miniStatValue}>{stats.allyAdminChats}</Text>
            <Text style={styles.miniStatLabel}>Aliado-Admin</Text>
          </View>
          <View style={[styles.miniStatCard, { borderLeftColor: '#ef4444' }]}>
            <Text style={styles.miniStatValue}>{stats.supportChats}</Text>
            <Text style={styles.miniStatLabel}>Soporte</Text>
          </View>
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

        <View style={styles.filtersContainer}>
          <View style={styles.filterHeader}>
            <Filter size={16} color="#64748b" />
            <Text style={styles.filterTitle}>Filtrar por tipo</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.filterButtons}>
              {filters.map(filter => {
                const Icon = filter.icon;
                const isActive = activeFilter === filter.key;
                return (
                  <TouchableOpacity
                    key={filter.key}
                    style={[
                      styles.filterButton,
                      isActive && styles.filterButtonActive
                    ]}
                    onPress={() => setActiveFilter(filter.key)}
                  >
                    <Icon 
                      size={16} 
                      color={isActive ? '#ffffff' : '#64748b'} 
                    />
                    <Text style={[
                      styles.filterButtonText,
                      isActive && styles.filterButtonTextActive
                    ]}>
                      {filter.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Conversaciones ({filteredChats.length})</Text>
          {filteredChats.map(chat => {
            const participants = getChatParticipants(chat);
            const chatType = getChatType(chat);
            const typeColor = getChatTypeColor(chatType);
            
            return (
              <View key={chat.id} style={styles.chatCard}>
                <View style={styles.chatHeader}>
                  <View style={styles.chatInfo}>
                    {participants[0]?.avatar ? (
                      <Image 
                        source={{ uri: participants[0].avatar }} 
                        style={styles.chatAvatar}
                      />
                    ) : (
                      <View style={[styles.chatAvatar, styles.chatAvatarPlaceholder]}>
                        <Text style={styles.chatAvatarText}>
                          {getChatName(chat).charAt(0).toUpperCase()}
                        </Text>
                      </View>
                    )}
                    <View style={styles.chatDetails}>
                      <Text style={styles.chatName}>{getChatName(chat)}</Text>
                      <View style={styles.chatMeta}>
                        <View style={[styles.typeBadge, { backgroundColor: typeColor }]}>
                          <Text style={styles.typeBadgeText}>{chatType}</Text>
                        </View>
                        <Text style={styles.participantsCount}>
                          {chat.participants.length} participantes
                        </Text>
                      </View>
                    </View>
                  </View>
                  {chat.unreadCount > 0 && (
                    <View style={styles.unreadBadge}>
                      <Text style={styles.unreadText}>{chat.unreadCount}</Text>
                    </View>
                  )}
                </View>

                <View style={styles.chatActions}>
                  <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={() => handleViewChat(chat.id)}
                  >
                    <Eye size={16} color="#3b82f6" />
                    <Text style={[styles.actionButtonText, { color: '#3b82f6' }]}>
                      Ver Chat
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.actionButton}>
                    <Send size={16} color="#10b981" />
                    <Text style={[styles.actionButtonText, { color: '#10b981' }]}>
                      Mensaje
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.actionButton}>
                    <Ban size={16} color="#ef4444" />
                    <Text style={[styles.actionButtonText, { color: '#ef4444' }]}>
                      Moderar
                    </Text>
                  </TouchableOpacity>
                </View>

                {chat.lastMessage && (
                  <View style={styles.lastMessage}>
                    <Text style={styles.lastMessageText} numberOfLines={1}>
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
              </View>
            );
          })}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Usuarios Disponibles</Text>
          
          <View style={styles.userTypeSection}>
            <Text style={styles.userTypeTitle}>Administradores ({adminUsers.length})</Text>
            {adminUsers.map(user => (
              <TouchableOpacity 
                key={user.id}
                style={styles.userCard}
                onPress={() => handleStartChatWithUser(user.id)}
              >
                <View style={styles.userInfo}>
                  {user.avatar ? (
                    <Image source={{ uri: user.avatar }} style={styles.userAvatar} />
                  ) : (
                    <View style={[styles.userAvatar, styles.userAvatarPlaceholder]}>
                      <Text style={styles.userAvatarText}>{user.name.charAt(0)}</Text>
                    </View>
                  )}
                  <View style={styles.userDetails}>
                    <Text style={styles.userName}>{user.name}</Text>
                    <Text style={styles.userEmail}>{user.email}</Text>
                  </View>
                </View>
                {user.isOnline && (
                  <View style={styles.onlineIndicator} />
                )}
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.userTypeSection}>
            <Text style={styles.userTypeTitle}>Aliados ({allyUsers.length})</Text>
            {allyUsers.map(user => (
              <TouchableOpacity 
                key={user.id}
                style={styles.userCard}
                onPress={() => handleStartChatWithUser(user.id)}
              >
                <View style={styles.userInfo}>
                  {user.avatar ? (
                    <Image source={{ uri: user.avatar }} style={styles.userAvatar} />
                  ) : (
                    <View style={[styles.userAvatar, styles.userAvatarPlaceholder]}>
                      <Text style={styles.userAvatarText}>{user.name.charAt(0)}</Text>
                    </View>
                  )}
                  <View style={styles.userDetails}>
                    <Text style={styles.userName}>{user.name}</Text>
                    <Text style={styles.userEmail}>{user.email}</Text>
                  </View>
                </View>
                <View style={styles.userBadges}>
                  {user.isAlly && (
                    <View style={styles.allyBadge}>
                      <CheckCircle size={12} color="#10b981" />
                    </View>
                  )}
                  {user.isOnline && (
                    <View style={styles.onlineIndicator} />
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.userTypeSection}>
            <Text style={styles.userTypeTitle}>Usuarios ({regularUsers.length})</Text>
            {regularUsers.slice(0, 10).map(user => (
              <TouchableOpacity 
                key={user.id}
                style={styles.userCard}
                onPress={() => handleStartChatWithUser(user.id)}
              >
                <View style={styles.userInfo}>
                  {user.avatar ? (
                    <Image source={{ uri: user.avatar }} style={styles.userAvatar} />
                  ) : (
                    <View style={[styles.userAvatar, styles.userAvatarPlaceholder]}>
                      <Text style={styles.userAvatarText}>{user.name.charAt(0)}</Text>
                    </View>
                  )}
                  <View style={styles.userDetails}>
                    <Text style={styles.userName}>{user.name}</Text>
                    <Text style={styles.userEmail}>{user.email}</Text>
                  </View>
                </View>
                {user.isOnline && (
                  <View style={styles.onlineIndicator} />
                )}
              </TouchableOpacity>
            ))}
            {regularUsers.length > 10 && (
              <Text style={styles.moreUsersText}>
                +{regularUsers.length - 10} usuarios más
              </Text>
            )}
          </View>
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
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '500',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 16,
  },
  miniStatCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  miniStatValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 2,
  },
  miniStatLabel: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '500',
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
  filtersContainer: {
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  filterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  filterTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
  },
  filterButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  filterButtonActive: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  filterButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748b',
  },
  filterButtonTextActive: {
    color: '#ffffff',
  },
  section: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
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
  chatAvatarText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#64748b',
  },
  chatDetails: {
    flex: 1,
  },
  chatName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  chatMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  typeBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#ffffff',
    textTransform: 'uppercase',
  },
  participantsCount: {
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
    fontWeight: '700',
  },
  chatActions: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#f8fafc',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  lastMessage: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  lastMessageText: {
    flex: 1,
    fontSize: 13,
    color: '#64748b',
  },
  lastMessageTime: {
    fontSize: 11,
    color: '#94a3b8',
    marginLeft: 8,
  },
  userTypeSection: {
    marginBottom: 24,
  },
  userTypeTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 12,
  },
  userCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  userAvatarPlaceholder: {
    backgroundColor: '#e2e8f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userAvatarText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748b',
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 12,
    color: '#64748b',
  },
  userBadges: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  allyBadge: {
    backgroundColor: '#d1fae5',
    borderRadius: 12,
    padding: 4,
  },
  onlineIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#10b981',
  },
  moreUsersText: {
    fontSize: 13,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
  },
});