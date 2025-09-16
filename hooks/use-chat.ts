import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useCallback, useMemo } from 'react';
import { Chat, Message, User } from '@/types/chat';

const STORAGE_KEYS = {
  CHATS: 'nodox_chats',
  MESSAGES: 'nodox_messages',
  USERS: 'nodox_users',
};

const mockUsers: Record<string, User> = {
  'user-1': {
    id: 'user-1',
    name: 'Soporte NodoX',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
    isOnline: true,
  },
  'user-2': {
    id: 'user-2',
    name: 'María González',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face',
    isOnline: false,
    lastSeen: new Date(Date.now() - 1000 * 60 * 30),
  },
  'user-3': {
    id: 'user-3',
    name: 'Carlos Rodríguez',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
    isOnline: true,
  },
  'user-4': {
    id: 'user-4',
    name: 'Ana López',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
    isOnline: false,
    lastSeen: new Date(Date.now() - 1000 * 60 * 60 * 2),
  },
};

const mockChats: Chat[] = [
  {
    id: 'chat-1',
    type: 'individual',
    participants: ['current-user', 'user-1'],
    unreadCount: 2,
    isArchived: false,
    isPinned: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
    updatedAt: new Date(Date.now() - 1000 * 60 * 5),
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
    type: 'group',
    name: 'Comunidad NodoX',
    participants: ['current-user', 'user-2', 'user-3', 'user-4'],
    unreadCount: 5,
    isArchived: false,
    isPinned: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72),
    updatedAt: new Date(Date.now() - 1000 * 60 * 15),
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

export const [ChatProvider, useChat] = createContextHook(() => {
  const [activeChat, setActiveChat] = useState<string | undefined>();
  const queryClient = useQueryClient();

  const chatsQuery = useQuery({
    queryKey: ['chats'],
    queryFn: async (): Promise<Chat[]> => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEYS.CHATS);
        return stored ? JSON.parse(stored) : mockChats;
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
        return stored ? JSON.parse(stored) : mockUsers;
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
        return stored ? JSON.parse(stored) : mockMessages;
      } catch {
        return mockMessages;
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

  const { mutateAsync: saveMessagesAsync } = saveMessages;
  const { mutateAsync: saveChatsAsync } = saveChats;

  const sendMessage = useCallback(async (chatId: string, content: string, type: Message['type'] = 'text') => {
    const currentMessages = messagesQuery.data || {};
    const currentChats = chatsQuery.data || [];
    
    const newMessage: Message = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      chatId,
      senderId: 'current-user',
      content,
      type,
      timestamp: new Date(),
      isRead: false,
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
  }, [messagesQuery.data, chatsQuery.data, saveMessagesAsync, saveChatsAsync]);

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

  return useMemo(() => ({
    chats: chatsQuery.data || [],
    messages: messagesQuery.data || {},
    users: usersQuery.data || {},
    activeChat,
    setActiveChat,
    sendMessage,
    markAsRead,
    getChatMessages,
    getChatParticipants,
    getChatName,
    getTotalUnreadCount,
    isLoading: chatsQuery.isLoading || messagesQuery.isLoading || usersQuery.isLoading,
    currentUserId: 'current-user',
  }), [
    chatsQuery.data,
    messagesQuery.data,
    usersQuery.data,
    activeChat,
    setActiveChat,
    sendMessage,
    markAsRead,
    getChatMessages,
    getChatParticipants,
    getChatName,
    getTotalUnreadCount,
    chatsQuery.isLoading,
    messagesQuery.isLoading,
    usersQuery.isLoading,
  ]);
});