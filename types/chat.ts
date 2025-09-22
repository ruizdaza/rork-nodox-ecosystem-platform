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

export interface ChatSecurityConfig {
  enableSpamDetection: boolean;
  enableProfanityFilter: boolean;
  enableRateLimiting: boolean;
  maxMessagesPerMinute: number;
  enableEncryption: boolean;
  enableMessageValidation: boolean;
  enableModerationLogging: boolean;
  autoDeleteViolations: boolean;
  requireApprovalForNewUsers: boolean;
  enableImageModeration: boolean;
}

export interface Report {
  id: string;
  reporterId: string;
  reporterName: string;
  reportedUserId: string;
  reportedUserName: string;
  messageId?: string;
  conversationId: string;
  type: 'spam' | 'harassment' | 'inappropriate' | 'fake_profile' | 'scam' | 'other';
  reason: string;
  description?: string;
  status: 'pending' | 'investigating' | 'resolved' | 'dismissed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignedTo?: string;
  evidence?: {
    screenshots?: string[];
    messageContent?: string;
    additionalInfo?: string;
  };
  actions?: {
    type: 'warning' | 'temporary_ban' | 'permanent_ban' | 'content_removal' | 'no_action';
    duration?: number; // in hours
    reason: string;
    executedBy: string;
    executedAt: Date;
  }[];
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
}

export interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  totalConversations: number;
  activeConversations: number;
  totalMessages: number;
  messagesLast24h: number;
  messagesLast7d: number;
  messagesLast30d: number;
  reportStats: {
    total: number;
    pending: number;
    resolved: number;
    dismissed: number;
    byType: Record<string, number>;
    byPriority: Record<string, number>;
  };
  moderationStats: {
    totalViolations: number;
    spamDetected: number;
    profanityFiltered: number;
    messagesBlocked: number;
    usersWarned: number;
    usersBanned: number;
  };
  performanceStats: {
    averageResponseTime: number;
    messageDeliveryRate: number;
    systemUptime: number;
    errorRate: number;
  };
}

export interface UserActivity {
  userId: string;
  userName: string;
  lastActive: Date;
  messageCount: number;
  reportCount: number;
  violationCount: number;
  status: 'active' | 'warned' | 'suspended' | 'banned';
  riskScore: number; // 0-100
}