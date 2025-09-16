export interface User {
  id: string;
  name: string;
  avatar?: string;
  isOnline: boolean;
  lastSeen?: Date;
  phone?: string;
  email?: string;
  isContact?: boolean;
}

export interface Contact {
  id: string;
  userId: string;
  name: string;
  phone?: string;
  email?: string;
  avatar?: string;
  isOnline: boolean;
  lastSeen?: Date;
  addedAt: Date;
  isFavorite: boolean;
}

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  content: string;
  type: 'text' | 'image' | 'audio' | 'file';
  timestamp: Date;
  isRead: boolean;
  replyTo?: string;
}

export interface Chat {
  id: string;
  type: 'individual' | 'group';
  name?: string;
  participants: string[];
  lastMessage?: Message;
  unreadCount: number;
  isArchived: boolean;
  isPinned: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatState {
  chats: Chat[];
  messages: Record<string, Message[]>;
  users: Record<string, User>;
  contacts: Contact[];
  currentUserId: string;
  activeChat?: string;
}