export interface User {
  id: string;
  name: string;
  avatar?: string;
  isOnline: boolean;
  lastSeen?: Date;
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
  currentUserId: string;
  activeChat?: string;
}