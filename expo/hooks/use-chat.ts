import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useCallback, useMemo } from 'react';
import { Chat, Message, User, Contact, ChatPermission, MessageReaction, TypingIndicator, VoiceCallSession, ChatSearchResult } from '@/types/chat';
import { ChatSecurityValidator, chatAuthMiddleware, chatSecurityUtils } from '@/utils/security';
import { useNotifications } from './use-notifications';

const STORAGE_KEYS = {
  CHATS: 'nodox_chats',
  MESSAGES: 'nodox_messages',
  USERS: 'nodox_users',
  CONTACTS: 'nodox_contacts',
};

const mockUsers: Record<string, User> = {
  'user-1': {
    id: 'user-1',
    name: 'Soporte NodoX',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
    isOnline: true,
    phone: '+57 300 123 4567',
    email: 'soporte@nodox.com',
    isContact: true,
    roles: ['admin'],
    permissions: ['read', 'write', 'delete', 'moderate', 'admin'],
    isAlly: false,
    allyStatus: 'none',
    isBlocked: false,
    blockedBy: [],
    blockedUsers: [],
  },
  'user-2': {
    id: 'user-2',
    name: 'María González',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face',
    isOnline: false,
    lastSeen: new Date(Date.now() - 1000 * 60 * 30),
    phone: '+57 301 234 5678',
    email: 'maria@example.com',
    isContact: true,
    roles: ['user'],
    permissions: ['read', 'write'],
    isAlly: false,
    allyStatus: 'none',
    isBlocked: false,
    blockedBy: [],
    blockedUsers: [],
  },
  'user-3': {
    id: 'user-3',
    name: 'Carlos Rodríguez',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
    isOnline: true,
    phone: '+57 302 345 6789',
    email: 'carlos@example.com',
    isContact: true,
    roles: ['ally'],
    permissions: ['read', 'write', 'moderate'],
    isAlly: true,
    allyStatus: 'approved',
    isBlocked: false,
    blockedBy: [],
    blockedUsers: [],
  },
  'user-4': {
    id: 'user-4',
    name: 'Ana López',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
    isOnline: false,
    lastSeen: new Date(Date.now() - 1000 * 60 * 60 * 2),
    phone: '+57 303 456 7890',
    email: 'ana@example.com',
    isContact: true,
    roles: ['referrer'],
    permissions: ['read', 'write'],
    isAlly: false,
    allyStatus: 'none',
    isBlocked: false,
    blockedBy: [],
    blockedUsers: [],
  },
};

// Usuario actual con permisos de admin para pruebas
const currentUser: User = {
  id: 'current-user',
  name: 'Usuario Actual',
  avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&crop=face',
  isOnline: true,
  roles: ['admin'],
  permissions: ['read', 'write', 'delete', 'moderate', 'admin'],
  isAlly: false,
  allyStatus: 'none',
  isBlocked: false,
  blockedBy: [],
  blockedUsers: [],
  isContact: false,
};

const mockChats: Chat[] = [
  {
    id: 'chat-1',
    type: 'support',
    participants: ['current-user', 'user-1'],
    admins: ['user-1'],
    moderators: ['user-1'],
    unreadCount: 2,
    isArchived: false,
    isPinned: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
    updatedAt: new Date(Date.now() - 1000 * 60 * 5),
    settings: {
      allowFileSharing: true,
      allowImageSharing: true,
      allowAudioMessages: true,
      allowVideoCalls: true,
      allowLargeFiles: true,
      allowScheduledMessages: true,
      maxFileSize: 10,
      requireApprovalToJoin: false,
      onlyAdminsCanMessage: false,
    },
    lastMessage: {
      id: 'msg-1',
      chatId: 'chat-1',
      senderId: 'user-1',
      content: '¡Hola! ¿En qué puedo ayudarte hoy?',
      type: 'text',
      timestamp: new Date(Date.now() - 1000 * 60 * 5),
      isRead: false,
    },
  },
  {
    id: 'chat-2',
    type: 'individual',
    participants: ['current-user', 'user-2'],
    unreadCount: 0,
    isArchived: false,
    isPinned: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60),
    settings: {
      allowFileSharing: true,
      allowImageSharing: true,
      allowAudioMessages: true,
      allowVideoCalls: true,
      allowLargeFiles: true,
      allowScheduledMessages: true,
      maxFileSize: 10,
      requireApprovalToJoin: false,
      onlyAdminsCanMessage: false,
    },
    lastMessage: {
      id: 'msg-2',
      chatId: 'chat-2',
      senderId: 'current-user',
      content: 'Perfecto, gracias por la información',
      type: 'text',
      timestamp: new Date(Date.now() - 1000 * 60 * 60),
      isRead: true,
    },
  },
  {
    id: 'chat-3',
    type: 'ally_client',
    name: 'Chat Aliado - Carlos',
    participants: ['current-user', 'user-3'],
    admins: ['user-3'],
    moderators: ['user-3'],
    unreadCount: 5,
    isArchived: false,
    isPinned: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72),
    updatedAt: new Date(Date.now() - 1000 * 60 * 15),
    settings: {
      allowFileSharing: true,
      allowImageSharing: true,
      allowAudioMessages: true,
      allowVideoCalls: true,
      allowLargeFiles: true,
      allowScheduledMessages: true,
      maxFileSize: 10,
      requireApprovalToJoin: true,
      onlyAdminsCanMessage: false,
    },
    lastMessage: {
      id: 'msg-3',
      chatId: 'chat-3',
      senderId: 'user-3',
      content: '¿Alguien ha probado la nueva oferta de descuentos?',
      type: 'text',
      timestamp: new Date(Date.now() - 1000 * 60 * 15),
      isRead: false,
    },
  },
];

const mockMessages: Record<string, Message[]> = {
  'chat-1': [
    {
      id: 'msg-1-1',
      chatId: 'chat-1',
      senderId: 'user-1',
      content: 'Bienvenido a NodoX. Soy tu asistente virtual.',
      type: 'text',
      timestamp: new Date(Date.now() - 1000 * 60 * 60),
      isRead: true,
    },
    {
      id: 'msg-1-2',
      chatId: 'chat-1',
      senderId: 'current-user',
      content: 'Hola, tengo una pregunta sobre mi membresía',
      type: 'text',
      timestamp: new Date(Date.now() - 1000 * 60 * 30),
      isRead: true,
    },
    {
      id: 'msg-1-4',
      chatId: 'chat-1',
      senderId: 'current-user',
      content: 'https://www2.cs.uic.edu/~i101/SoundFiles/BabyElephantWalk60.wav',
      type: 'audio',
      timestamp: new Date(Date.now() - 1000 * 60 * 10),
      isRead: true,
    },
    {
      id: 'msg-1-3',
      chatId: 'chat-1',
      senderId: 'user-1',
      content: '¡Hola! ¿En qué puedo ayudarte hoy?',
      type: 'text',
      timestamp: new Date(Date.now() - 1000 * 60 * 5),
      isRead: false,
    },
  ],
  'chat-2': [
    {
      id: 'msg-2-1',
      chatId: 'chat-2',
      senderId: 'user-2',
      content: 'Hola, ¿cómo estás?',
      type: 'text',
      timestamp: new Date(Date.now() - 1000 * 60 * 120),
      isRead: true,
    },
    {
      id: 'msg-2-2',
      chatId: 'chat-2',
      senderId: 'current-user',
      content: 'Todo bien, gracias. ¿Y tú?',
      type: 'text',
      timestamp: new Date(Date.now() - 1000 * 60 * 90),
      isRead: true,
    },
    {
      id: 'msg-2-3',
      chatId: 'chat-2',
      senderId: 'user-2',
      content: 'Excelente. Te quería comentar sobre las nuevas ofertas',
      type: 'text',
      timestamp: new Date(Date.now() - 1000 * 60 * 80),
      isRead: true,
    },
    {
      id: 'msg-2-4',
      chatId: 'chat-2',
      senderId: 'current-user',
      content: 'Perfecto, gracias por la información',
      type: 'text',
      timestamp: new Date(Date.now() - 1000 * 60 * 60),
      isRead: true,
    },
  ],
  'chat-3': [
    {
      id: 'msg-3-1',
      chatId: 'chat-3',
      senderId: 'user-2',
      content: '¡Hola a todos!',
      type: 'text',
      timestamp: new Date(Date.now() - 1000 * 60 * 60),
      isRead: true,
    },
    {
      id: 'msg-3-2',
      chatId: 'chat-3',
      senderId: 'user-4',
      content: 'Hola María, ¿cómo va todo?',
      type: 'text',
      timestamp: new Date(Date.now() - 1000 * 60 * 45),
      isRead: true,
    },
    {
      id: 'msg-3-3',
      chatId: 'chat-3',
      senderId: 'user-3',
      content: '¿Alguien ha probado la nueva oferta de descuentos?',
      type: 'text',
      timestamp: new Date(Date.now() - 1000 * 60 * 15),
      isRead: false,
    },
  ],
};

const mockContacts: Contact[] = [
  {
    id: 'contact-1',
    userId: 'user-1',
    name: 'Soporte NodoX',
    phone: '+57 300 123 4567',
    email: 'soporte@nodox.com',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
    isOnline: true,
    addedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
    isFavorite: true,
  },
  {
    id: 'contact-2',
    userId: 'user-2',
    name: 'María González',
    phone: '+57 301 234 5678',
    email: 'maria@example.com',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face',
    isOnline: false,
    lastSeen: new Date(Date.now() - 1000 * 60 * 30),
    addedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
    isFavorite: false,
  },
  {
    id: 'contact-3',
    userId: 'user-3',
    name: 'Carlos Rodríguez',
    phone: '+57 302 345 6789',
    email: 'carlos@example.com',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
    isOnline: true,
    addedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5),
    isFavorite: true,
  },
  {
    id: 'contact-4',
    userId: 'user-4',
    name: 'Ana López',
    phone: '+57 303 456 7890',
    email: 'ana@example.com',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
    isOnline: false,
    lastSeen: new Date(Date.now() - 1000 * 60 * 60 * 2),
    addedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
    isFavorite: false,
  },
];

export const [ChatProvider, useChat] = createContextHook(() => {
  const [activeChat, setActiveChat] = useState<string | undefined>();
  const queryClient = useQueryClient();
  const notifications = useNotifications();

  const chatsQuery = useQuery({
    queryKey: ['chats'],
    queryFn: async (): Promise<Chat[]> => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEYS.CHATS);
        if (stored) {
          const parsed = JSON.parse(stored);
          return parsed.map((chat: any) => ({
            ...chat,
            createdAt: new Date(chat.createdAt),
            updatedAt: new Date(chat.updatedAt),
            lastMessage: chat.lastMessage ? {
              ...chat.lastMessage,
              timestamp: new Date(chat.lastMessage.timestamp)
            } : undefined
          }));
        }
        return mockChats;
      } catch {
        return mockChats;
      }
    },
  });

  const usersQuery = useQuery({
    queryKey: ['chat-users'],
    queryFn: async (): Promise<Record<string, User>> => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEYS.USERS);
        if (stored) {
          const parsed = JSON.parse(stored);
          const result: Record<string, User> = {};
          for (const [userId, user] of Object.entries(parsed)) {
            result[userId] = {
              ...(user as any),
              lastSeen: (user as any).lastSeen ? new Date((user as any).lastSeen) : undefined
            };
          }
          return result;
        }
        return mockUsers;
      } catch {
        return mockUsers;
      }
    },
  });

  const messagesQuery = useQuery({
    queryKey: ['messages'],
    queryFn: async (): Promise<Record<string, Message[]>> => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEYS.MESSAGES);
        if (stored) {
          const parsed = JSON.parse(stored);
          const result: Record<string, Message[]> = {};
          for (const [chatId, messages] of Object.entries(parsed)) {
            result[chatId] = (messages as any[]).map(msg => ({
              ...msg,
              timestamp: new Date(msg.timestamp)
            }));
          }
          return result;
        }
        return mockMessages;
      } catch {
        return mockMessages;
      }
    },
  });

  const contactsQuery = useQuery({
    queryKey: ['contacts'],
    queryFn: async (): Promise<Contact[]> => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEYS.CONTACTS);
        if (stored) {
          const parsed = JSON.parse(stored);
          return parsed.map((contact: any) => ({
            ...contact,
            addedAt: new Date(contact.addedAt),
            lastSeen: contact.lastSeen ? new Date(contact.lastSeen) : undefined
          }));
        }
        return mockContacts;
      } catch {
        return mockContacts;
      }
    },
  });

  const saveChats = useMutation({
    mutationFn: async (chats: Chat[]) => {
      await AsyncStorage.setItem(STORAGE_KEYS.CHATS, JSON.stringify(chats));
      return chats;
    },
    onSuccess: (chats) => {
      queryClient.setQueryData(['chats'], chats);
    },
  });

  const saveMessages = useMutation({
    mutationFn: async (messages: Record<string, Message[]>) => {
      await AsyncStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(messages));
      return messages;
    },
    onSuccess: (messages) => {
      queryClient.setQueryData(['messages'], messages);
    },
  });

  const saveContacts = useMutation({
    mutationFn: async (contacts: Contact[]) => {
      await AsyncStorage.setItem(STORAGE_KEYS.CONTACTS, JSON.stringify(contacts));
      return contacts;
    },
    onSuccess: (contacts) => {
      queryClient.setQueryData(['contacts'], contacts);
    },
  });

  const saveUsers = useMutation({
    mutationFn: async (users: Record<string, User>) => {
      await AsyncStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
      return users;
    },
    onSuccess: (users) => {
      queryClient.setQueryData(['chat-users'], users);
    },
  });

  const { mutateAsync: saveMessagesAsync } = saveMessages;
  const { mutateAsync: saveChatsAsync } = saveChats;
  const { mutateAsync: saveContactsAsync } = saveContacts;
  const { mutateAsync: saveUsersAsync } = saveUsers;

  const sendMessage = useCallback(async (chatId: string, content: string, type: Message['type'] = 'text') => {
    const currentMessages = messagesQuery.data || {};
    const currentChats = chatsQuery.data || [];
    const currentUsers = usersQuery.data || {};
    
    const chat = currentChats.find(c => c.id === chatId);
    if (!chat) {
      throw new Error('Chat no encontrado');
    }
    
    // Validar permisos usando el middleware de seguridad
    let validationResult;
    try {
      validationResult = chatAuthMiddleware.validateSendMessage(currentUser, chat, content, type);
    } catch (error) {
      console.error('[Chat] Send message validation failed:', error);
      throw error;
    }
    
    // Usar contenido filtrado si está disponible
    const finalContent = validationResult.filteredContent || content;
    
    // Sanitizar contenido del mensaje con moderación
    const sanitizedContent = chatSecurityUtils.sanitizeMessageContent(finalContent, 'current-user', chat.type);
    
    const newMessage: Message = {
      id: chatSecurityUtils.generateSecureMessageId(),
      chatId,
      senderId: 'current-user',
      content: sanitizedContent,
      type,
      timestamp: new Date(),
      isRead: false,
      isDeleted: false,
      isEdited: false,
    };

    const updatedMessages = {
      ...currentMessages,
      [chatId]: [...(currentMessages[chatId] || []), newMessage],
    };

    const updatedChats = currentChats.map(chat => 
      chat.id === chatId 
        ? { ...chat, lastMessage: newMessage, updatedAt: new Date() }
        : chat
    );

    await Promise.all([
      saveMessagesAsync(updatedMessages),
      saveChatsAsync(updatedChats),
    ]);
    
    // Trigger automatic notifications for other participants
    const otherParticipants = chat.participants.filter(id => id !== 'current-user');
    for (const participantId of otherParticipants) {
      const participant = currentUsers[participantId];
      if (participant) {
        const messagePreview = sanitizedContent.length > 50 
          ? sanitizedContent.substring(0, 50) + '...' 
          : sanitizedContent;
        
        await notifications.notifyNewMessage(
          currentUser.name,
          messagePreview
        );
      }
    }
    
    console.log('[Chat] Message sent successfully with security validation and notifications');
  }, [messagesQuery.data, chatsQuery.data, usersQuery.data, saveMessagesAsync, saveChatsAsync, notifications]);

  const markAsRead = useCallback(async (chatId: string) => {
    const currentMessages = messagesQuery.data || {};
    const currentChats = chatsQuery.data || [];
    
    const updatedMessages = {
      ...currentMessages,
      [chatId]: (currentMessages[chatId] || []).map(msg => ({ ...msg, isRead: true })),
    };

    const updatedChats = currentChats.map(chat => 
      chat.id === chatId 
        ? { ...chat, unreadCount: 0 }
        : chat
    );

    await Promise.all([
      saveMessagesAsync(updatedMessages),
      saveChatsAsync(updatedChats),
    ]);
    
    console.log('[Chat] Messages marked as read for chat:', chatId);
  }, [messagesQuery.data, chatsQuery.data, saveMessagesAsync, saveChatsAsync]);

  const getChatMessages = useCallback((chatId: string): Message[] => {
    return messagesQuery.data?.[chatId] || [];
  }, [messagesQuery.data]);

  const getChatParticipants = useCallback((chat: Chat): User[] => {
    const users = usersQuery.data || {};
    return chat.participants
      .filter(id => id !== 'current-user')
      .map(id => users[id])
      .filter(Boolean);
  }, [usersQuery.data]);

  const getChatName = useCallback((chat: Chat): string => {
    if (chat.name) return chat.name;
    const participants = getChatParticipants(chat);
    return participants.map(p => p.name).join(', ');
  }, [getChatParticipants]);

  const getTotalUnreadCount = useCallback((): number => {
    return (chatsQuery.data || []).reduce((total, chat) => total + chat.unreadCount, 0);
  }, [chatsQuery.data]);

  const addContact = useCallback(async (contactData: Omit<Contact, 'id' | 'userId' | 'addedAt' | 'isOnline' | 'lastSeen'>) => {
    const currentContacts = contactsQuery.data || [];
    const currentUsers = usersQuery.data || {};
    
    const newUserId = `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newContactId = `contact-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const newUser: User = {
      id: newUserId,
      name: contactData.name,
      phone: contactData.phone,
      email: contactData.email,
      avatar: contactData.avatar,
      isOnline: false,
      isContact: true,
      roles: ['user'],
      permissions: ['read', 'write'],
      isAlly: false,
      allyStatus: 'none',
      isBlocked: false,
      blockedBy: [],
      blockedUsers: [],
    };
    
    const newContact: Contact = {
      ...contactData,
      id: newContactId,
      userId: newUserId,
      addedAt: new Date(),
      isOnline: false,
    };
    
    const updatedContacts = [...currentContacts, newContact];
    const updatedUsers = { ...currentUsers, [newUserId]: newUser };
    
    await Promise.all([
      saveContactsAsync(updatedContacts),
      saveUsersAsync(updatedUsers),
    ]);
    
    // Notify about new contact added
    await notifications.createNotification(
      'Contacto Agregado',
      `${contactData.name} ha sido agregado a tus contactos`,
      'system_update',
      'chat',
      { contactName: contactData.name, contactId: newContactId },
      'normal'
    );
    
    console.log('[Chat] New contact added with notification:', contactData.name);
  }, [contactsQuery.data, usersQuery.data, saveContactsAsync, saveUsersAsync, notifications]);

  const toggleFavoriteContact = useCallback(async (contactId: string) => {
    const currentContacts = contactsQuery.data || [];
    
    const updatedContacts = currentContacts.map(contact => 
      contact.id === contactId 
        ? { ...contact, isFavorite: !contact.isFavorite }
        : contact
    );
    
    await saveContactsAsync(updatedContacts);
  }, [contactsQuery.data, saveContactsAsync]);

  const startChatWithContact = useCallback(async (userId: string): Promise<string> => {
    const currentChats = chatsQuery.data || [];
    const currentUsers = usersQuery.data || {};
    
    const existingChat = currentChats.find(chat => 
      chat.type === 'individual' && 
      chat.participants.includes(userId) && 
      chat.participants.includes('current-user')
    );
    
    if (existingChat) {
      // Validar acceso al chat existente
      try {
        chatAuthMiddleware.validateChatAccess(currentUser, existingChat);
        setActiveChat(existingChat.id);
        return existingChat.id;
      } catch (error) {
        console.error('[Chat] Access denied to existing chat:', error);
        throw error;
      }
    }
    
    // Validar creación de nuevo chat
    const validator = ChatSecurityValidator.getInstance();
    const canCreate = validator.canCreateChat(
      currentUser,
      'individual',
      ['current-user', userId],
      { ...currentUsers, 'current-user': currentUser }
    );
    
    if (!canCreate.canCreate) {
      throw new Error(canCreate.reason || 'No se puede crear el chat');
    }
    
    const newChatId = `chat-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newChat: Chat = {
      id: newChatId,
      type: 'individual',
      participants: ['current-user', userId],
      unreadCount: 0,
      isArchived: false,
      isPinned: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      settings: {
        allowFileSharing: true,
        allowImageSharing: true,
        allowAudioMessages: true,
        allowVideoCalls: true,
        allowLargeFiles: true,
        allowScheduledMessages: true,
        maxFileSize: 10,
        requireApprovalToJoin: false,
        onlyAdminsCanMessage: false,
      },
    };
    
    const updatedChats = [...currentChats, newChat];
    await saveChatsAsync(updatedChats);
    
    // Notify the other participant about the new chat
    const otherUser = currentUsers[userId];
    if (otherUser) {
      await notifications.createNotification(
        'Nuevo Chat Iniciado',
        `${currentUser.name} ha iniciado una conversación contigo`,
        'new_message',
        'chat',
        { chatId: newChatId, initiatorName: currentUser.name },
        'normal'
      );
    }
    
    setActiveChat(newChatId);
    console.log('[Chat] New chat created with security validation and notification');
    return newChatId;
  }, [chatsQuery.data, usersQuery.data, saveChatsAsync, setActiveChat, notifications]);

  // Simulate incoming message (for demo purposes)
  const simulateIncomingMessage = useCallback(async (chatId: string, senderId: string, content: string) => {
    const currentMessages = messagesQuery.data || {};
    const currentChats = chatsQuery.data || [];
    const currentUsers = usersQuery.data || {};
    
    const chat = currentChats.find(c => c.id === chatId);
    const sender = currentUsers[senderId];
    
    if (!chat || !sender) {
      console.error('[Chat] Chat or sender not found for incoming message');
      return;
    }
    
    const newMessage: Message = {
      id: chatSecurityUtils.generateSecureMessageId(),
      chatId,
      senderId,
      content,
      type: 'text',
      timestamp: new Date(),
      isRead: false,
      isDeleted: false,
      isEdited: false,
    };

    const updatedMessages = {
      ...currentMessages,
      [chatId]: [...(currentMessages[chatId] || []), newMessage],
    };

    const updatedChats = currentChats.map(c => 
      c.id === chatId 
        ? { ...c, lastMessage: newMessage, updatedAt: new Date(), unreadCount: c.unreadCount + 1 }
        : c
    );

    await Promise.all([
      saveMessagesAsync(updatedMessages),
      saveChatsAsync(updatedChats),
    ]);
    
    // Trigger notification for incoming message
    if (senderId !== 'current-user') {
      const messagePreview = content.length > 50 
        ? content.substring(0, 50) + '...' 
        : content;
      
      await notifications.notifyNewMessage(
        sender.name,
        messagePreview
      );
    }
    
    console.log('[Chat] Incoming message simulated with notification:', newMessage);
  }, [messagesQuery.data, chatsQuery.data, usersQuery.data, saveMessagesAsync, saveChatsAsync, notifications]);

  // Funciones de seguridad y permisos
  const deleteMessage = useCallback(async (messageId: string, chatId: string) => {
    const currentMessages = messagesQuery.data || {};
    const currentChats = chatsQuery.data || [];
    
    const chat = currentChats.find(c => c.id === chatId);
    const message = currentMessages[chatId]?.find(m => m.id === messageId);
    
    if (!chat || !message) {
      throw new Error('Chat o mensaje no encontrado');
    }
    
    // Validar permisos de eliminación
    try {
      chatAuthMiddleware.validateDeleteMessage(currentUser, chat, message.senderId);
    } catch (error) {
      console.error('[Chat] Delete message validation failed:', error);
      throw error;
    }
    
    const updatedMessages = {
      ...currentMessages,
      [chatId]: currentMessages[chatId].map(msg => 
        msg.id === messageId 
          ? { ...msg, isDeleted: true, deletedBy: currentUser.id, deletedAt: new Date() }
          : msg
      ),
    };
    
    await saveMessagesAsync(updatedMessages);
    console.log('[Chat] Message deleted with security validation');
  }, [messagesQuery.data, chatsQuery.data, saveMessagesAsync]);
  
  const getUserPermissions = useCallback((chatId: string): ChatPermission[] => {
    const chat = (chatsQuery.data || []).find(c => c.id === chatId);
    if (!chat) return [];
    
    const validator = ChatSecurityValidator.getInstance();
    return validator.getUserPermissions(currentUser, chat);
  }, [chatsQuery.data]);
  
  const canPerformAction = useCallback((chatId: string, permission: ChatPermission): boolean => {
    const chat = (chatsQuery.data || []).find(c => c.id === chatId);
    if (!chat) return false;
    
    const validator = ChatSecurityValidator.getInstance();
    return validator.hasPermission(currentUser, chat, permission);
  }, [chatsQuery.data]);
  
  const blockUser = useCallback(async (userId: string) => {
    const currentUsers = usersQuery.data || {};
    const updatedCurrentUser = {
      ...currentUser,
      blockedUsers: [...(currentUser.blockedUsers || []), userId],
    };
    
    const updatedUsers = {
      ...currentUsers,
      'current-user': updatedCurrentUser,
      [userId]: {
        ...currentUsers[userId],
        blockedBy: [...(currentUsers[userId]?.blockedBy || []), 'current-user'],
      },
    };
    
    await saveUsersAsync(updatedUsers);
    console.log('[Chat] User blocked:', userId);
  }, [usersQuery.data, saveUsersAsync]);
  
  const unblockUser = useCallback(async (userId: string) => {
    const currentUsers = usersQuery.data || {};
    const updatedCurrentUser = {
      ...currentUser,
      blockedUsers: (currentUser.blockedUsers || []).filter(id => id !== userId),
    };
    
    const updatedUsers = {
      ...currentUsers,
      'current-user': updatedCurrentUser,
      [userId]: {
        ...currentUsers[userId],
        blockedBy: (currentUsers[userId]?.blockedBy || []).filter(id => id !== 'current-user'),
      },
    };
    
    await saveUsersAsync(updatedUsers);
    console.log('[Chat] User unblocked:', userId);
  }, [usersQuery.data, saveUsersAsync]);

  const addReaction = useCallback(async (messageId: string, chatId: string, emoji: string) => {
    const currentMessages = messagesQuery.data || {};
    
    const reaction: MessageReaction = {
      emoji,
      userId: 'current-user',
      userName: currentUser.name,
      timestamp: new Date(),
    };
    
    const updatedMessages = {
      ...currentMessages,
      [chatId]: (currentMessages[chatId] || []).map(msg => {
        if (msg.id === messageId) {
          const existingReactions = msg.reactions || [];
          const userReactionIndex = existingReactions.findIndex(
            r => r.userId === 'current-user' && r.emoji === emoji
          );
          
          if (userReactionIndex >= 0) {
            return {
              ...msg,
              reactions: existingReactions.filter((_, i) => i !== userReactionIndex),
            };
          }
          
          return {
            ...msg,
            reactions: [...existingReactions, reaction],
          };
        }
        return msg;
      }),
    };
    
    await saveMessagesAsync(updatedMessages);
    console.log('[Chat] Reaction added/removed:', emoji);
  }, [messagesQuery.data, saveMessagesAsync]);

  const setTyping = useCallback(async (chatId: string, isTyping: boolean) => {
    const currentChats = chatsQuery.data || [];
    
    const typingIndicator: TypingIndicator = {
      userId: 'current-user',
      userName: currentUser.name,
      timestamp: new Date(),
    };
    
    const updatedChats = currentChats.map(chat => {
      if (chat.id === chatId) {
        const typingUsers = chat.typingUsers || [];
        
        if (isTyping) {
          const alreadyTyping = typingUsers.some(t => t.userId === 'current-user');
          if (alreadyTyping) return chat;
          
          return {
            ...chat,
            typingUsers: [...typingUsers, typingIndicator],
          };
        } else {
          return {
            ...chat,
            typingUsers: typingUsers.filter(t => t.userId !== 'current-user'),
          };
        }
      }
      return chat;
    });
    
    await saveChatsAsync(updatedChats);
  }, [chatsQuery.data, saveChatsAsync]);

  const forwardMessage = useCallback(async (messageId: string, fromChatId: string, toChatIds: string[]) => {
    const currentMessages = messagesQuery.data || {};
    const originalMessage = currentMessages[fromChatId]?.find(m => m.id === messageId);
    
    if (!originalMessage) {
      throw new Error('Mensaje no encontrado');
    }
    
    for (const toChatId of toChatIds) {
      const forwardedMessage: Message = {
        ...originalMessage,
        id: chatSecurityUtils.generateSecureMessageId(),
        chatId: toChatId,
        senderId: 'current-user',
        timestamp: new Date(),
        isRead: false,
        isForwarded: true,
        forwardedFrom: originalMessage.senderId,
      };
      
      currentMessages[toChatId] = [...(currentMessages[toChatId] || []), forwardedMessage];
    }
    
    await saveMessagesAsync(currentMessages);
    console.log('[Chat] Message forwarded to', toChatIds.length, 'chats');
  }, [messagesQuery.data, saveMessagesAsync]);

  const toggleStarMessage = useCallback(async (messageId: string, chatId: string) => {
    const currentMessages = messagesQuery.data || {};
    const currentChats = chatsQuery.data || [];
    
    const updatedMessages = {
      ...currentMessages,
      [chatId]: (currentMessages[chatId] || []).map(msg => {
        if (msg.id === messageId) {
          const starredBy = msg.starredBy || [];
          const isStarred = starredBy.includes('current-user');
          
          return {
            ...msg,
            isStarred: !isStarred,
            starredBy: isStarred
              ? starredBy.filter(id => id !== 'current-user')
              : [...starredBy, 'current-user'],
          };
        }
        return msg;
      }),
    };
    
    const message = updatedMessages[chatId].find(m => m.id === messageId);
    const updatedChats = currentChats.map(chat => {
      if (chat.id === chatId) {
        const starredMessages = chat.starredMessages || [];
        const isStarred = message?.isStarred;
        
        return {
          ...chat,
          starredMessages: isStarred
            ? [...starredMessages, messageId]
            : starredMessages.filter(id => id !== messageId),
        };
      }
      return chat;
    });
    
    await Promise.all([
      saveMessagesAsync(updatedMessages),
      saveChatsAsync(updatedChats),
    ]);
    console.log('[Chat] Message star toggled');
  }, [messagesQuery.data, chatsQuery.data, saveMessagesAsync, saveChatsAsync]);

  const searchMessages = useCallback((query: string, chatId?: string): ChatSearchResult[] => {
    const currentMessages = messagesQuery.data || {};
    const currentUsers = usersQuery.data || {};
    const results: ChatSearchResult[] = [];
    
    const chatsToSearch = chatId ? [chatId] : Object.keys(currentMessages);
    
    for (const searchChatId of chatsToSearch) {
      const messages = currentMessages[searchChatId] || [];
      
      messages.forEach((msg, index) => {
        if (msg.content.toLowerCase().includes(query.toLowerCase()) && !msg.isDeleted) {
          const sender = currentUsers[msg.senderId];
          results.push({
            messageId: msg.id,
            chatId: searchChatId,
            content: msg.content,
            senderId: msg.senderId,
            senderName: sender?.name || 'Usuario',
            timestamp: msg.timestamp,
            context: {
              before: messages[index - 1]?.content,
              after: messages[index + 1]?.content,
            },
          });
        }
      });
    }
    
    return results.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }, [messagesQuery.data, usersQuery.data]);

  const sendTemporaryMessage = useCallback(async (
    chatId: string,
    content: string,
    expiresInSeconds: number
  ) => {
    const currentMessages = messagesQuery.data || {};
    const currentChats = chatsQuery.data || [];
    
    const expiresAt = new Date(Date.now() + expiresInSeconds * 1000);
    
    const newMessage: Message = {
      id: chatSecurityUtils.generateSecureMessageId(),
      chatId,
      senderId: 'current-user',
      content,
      type: 'text',
      timestamp: new Date(),
      isRead: false,
      isDeleted: false,
      isTemporary: true,
      expiresAt,
      viewedBy: [],
    };

    const updatedMessages = {
      ...currentMessages,
      [chatId]: [...(currentMessages[chatId] || []), newMessage],
    };

    const updatedChats = currentChats.map(chat => 
      chat.id === chatId 
        ? { ...chat, lastMessage: newMessage, updatedAt: new Date() }
        : chat
    );

    await Promise.all([
      saveMessagesAsync(updatedMessages),
      saveChatsAsync(updatedChats),
    ]);
    
    setTimeout(async () => {
      const latestMessages = messagesQuery.data || {};
      const deleted = {
        ...latestMessages,
        [chatId]: (latestMessages[chatId] || []).filter(m => m.id !== newMessage.id),
      };
      await saveMessagesAsync(deleted);
      console.log('[Chat] Temporary message deleted:', newMessage.id);
    }, expiresInSeconds * 1000);
    
    console.log('[Chat] Temporary message sent, expires in', expiresInSeconds, 'seconds');
  }, [messagesQuery.data, chatsQuery.data, saveMessagesAsync, saveChatsAsync]);

  const sendLocationMessage = useCallback(async (
    chatId: string,
    latitude: number,
    longitude: number,
    address?: string
  ) => {
    const currentMessages = messagesQuery.data || {};
    const currentChats = chatsQuery.data || [];
    
    const locationData = {
      latitude,
      longitude,
      address: address || `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
    };
    
    const newMessage: Message = {
      id: chatSecurityUtils.generateSecureMessageId(),
      chatId,
      senderId: 'current-user',
      content: `📍 ${locationData.address}`,
      type: 'location',
      timestamp: new Date(),
      isRead: false,
      location: locationData,
    };

    const updatedMessages = {
      ...currentMessages,
      [chatId]: [...(currentMessages[chatId] || []), newMessage],
    };

    const updatedChats = currentChats.map(chat => 
      chat.id === chatId 
        ? { ...chat, lastMessage: newMessage, updatedAt: new Date() }
        : chat
    );

    await Promise.all([
      saveMessagesAsync(updatedMessages),
      saveChatsAsync(updatedChats),
    ]);
    
    console.log('[Chat] Location message sent');
  }, [messagesQuery.data, chatsQuery.data, saveMessagesAsync, saveChatsAsync]);

  const [activeVoiceCall, setActiveVoiceCall] = useState<VoiceCallSession | null>(null);

  const initiateVoiceCall = useCallback(async (chatId: string) => {
    const chat = (chatsQuery.data || []).find(c => c.id === chatId);
    if (!chat) {
      throw new Error('Chat no encontrado');
    }
    
    const callSession: VoiceCallSession = {
      id: `call-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      chatId,
      initiatorId: 'current-user',
      participants: chat.participants,
      status: 'ringing',
      callType: 'voice',
      quality: 'high',
      recordingEnabled: false,
      startTime: new Date(),
    };
    
    setActiveVoiceCall(callSession);
    
    await notifications.createNotification(
      'Llamada de Voz',
      `${currentUser.name} está llamando...`,
      'system_update',
      'chat',
      { callId: callSession.id, chatId },
      'high'
    );
    
    console.log('[Chat] Voice call initiated:', callSession.id);
    return callSession;
  }, [chatsQuery.data, notifications]);

  const endVoiceCall = useCallback(async () => {
    if (activeVoiceCall) {
      const endedCall: VoiceCallSession = {
        ...activeVoiceCall,
        status: 'ended',
        endTime: new Date(),
        duration: activeVoiceCall.startTime
          ? Math.floor((Date.now() - activeVoiceCall.startTime.getTime()) / 1000)
          : 0,
      };
      
      setActiveVoiceCall(null);
      console.log('[Chat] Voice call ended. Duration:', endedCall.duration, 'seconds');
    }
  }, [activeVoiceCall]);

  return useMemo(() => ({
    chats: chatsQuery.data || [],
    messages: messagesQuery.data || {},
    users: { ...usersQuery.data || {}, 'current-user': currentUser },
    contacts: contactsQuery.data || [],
    activeChat,
    setActiveChat,
    sendMessage,
    markAsRead,
    getChatMessages,
    getChatParticipants,
    getChatName,
    getTotalUnreadCount,
    addContact,
    toggleFavoriteContact,
    startChatWithContact,
    simulateIncomingMessage,
    deleteMessage,
    getUserPermissions,
    canPerformAction,
    blockUser,
    unblockUser,
    addReaction,
    setTyping,
    forwardMessage,
    toggleStarMessage,
    searchMessages,
    sendTemporaryMessage,
    sendLocationMessage,
    initiateVoiceCall,
    endVoiceCall,
    activeVoiceCall,
    currentUser,
    isLoading: chatsQuery.isLoading || messagesQuery.isLoading || usersQuery.isLoading || contactsQuery.isLoading,
    currentUserId: 'current-user',
  }), [
    chatsQuery.data,
    messagesQuery.data,
    usersQuery.data,
    contactsQuery.data,
    activeChat,
    setActiveChat,
    sendMessage,
    markAsRead,
    getChatMessages,
    getChatParticipants,
    getChatName,
    getTotalUnreadCount,
    addContact,
    toggleFavoriteContact,
    startChatWithContact,
    simulateIncomingMessage,
    deleteMessage,
    getUserPermissions,
    canPerformAction,
    blockUser,
    unblockUser,
    addReaction,
    setTyping,
    forwardMessage,
    toggleStarMessage,
    searchMessages,
    sendTemporaryMessage,
    sendLocationMessage,
    initiateVoiceCall,
    endVoiceCall,
    activeVoiceCall,
    chatsQuery.isLoading,
    messagesQuery.isLoading,
    usersQuery.isLoading,
    contactsQuery.isLoading,
  ]);
});