export type UserRole = 'user' | 'ally' | 'admin' | 'referrer';
export type ChatPermission = 'read' | 'write' | 'delete' | 'moderate' | 'admin';

export interface User {
  id: string;
  name: string;
  avatar?: string;
  isOnline: boolean;
  lastSeen?: Date;
  phone?: string;
  email?: string;
  isContact?: boolean;
  roles: UserRole[];
  permissions: ChatPermission[];
  isAlly?: boolean;
  allyStatus?: 'none' | 'pending' | 'temp_approved' | 'approved' | 'rejected';
  isBlocked?: boolean;
  blockedBy?: string[];
  blockedUsers?: string[];
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
  isDeleted?: boolean;
  deletedBy?: string;
  deletedAt?: Date;
  isEdited?: boolean;
  editedAt?: Date;
  originalContent?: string;
}

export interface Chat {
  id: string;
  type: 'individual' | 'group' | 'support' | 'ally_client';
  name?: string;
  participants: string[];
  admins?: string[];
  moderators?: string[];
  lastMessage?: Message;
  unreadCount: number;
  isArchived: boolean;
  isPinned: boolean;
  createdAt: Date;
  updatedAt: Date;
  settings?: ChatSettings;
}

export interface ChatSettings {
  allowFileSharing: boolean;
  allowImageSharing: boolean;
  allowAudioMessages: boolean;
  maxParticipants?: number;
  requireApprovalToJoin: boolean;
  onlyAdminsCanMessage: boolean;
  messageRetentionDays?: number;
}

export interface ChatState {
  chats: Chat[];
  messages: Record<string, Message[]>;
  users: Record<string, User>;
  contacts: Contact[];
  currentUserId: string;
  activeChat?: string;
  permissions: Record<string, ChatPermission[]>;
}

export interface ChatAction {
  type: 'send_message' | 'delete_message' | 'edit_message' | 'add_participant' | 'remove_participant' | 'moderate_chat' | 'archive_chat';
  chatId: string;
  userId: string;
  targetUserId?: string;
  messageId?: string;
}

export interface PermissionRule {
  role: UserRole;
  permissions: ChatPermission[];
  chatTypes: Chat['type'][];
  conditions?: {
    isOwner?: boolean;
    isParticipant?: boolean;
    isAlly?: boolean;
    allyStatus?: string[];
  };
}