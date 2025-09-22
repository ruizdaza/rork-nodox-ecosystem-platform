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

export interface UsageStats {
  overview: {
    totalUsers: number;
    activeUsersToday: number;
    activeUsersWeek: number;
    activeUsersMonth: number;
    newUsersToday: number;
    newUsersWeek: number;
    newUsersMonth: number;
    retentionRate: number;
    churnRate: number;
  };
  messaging: {
    totalMessages: number;
    messagesPerDay: number[];
    messagesPerHour: number[];
    averageMessagesPerUser: number;
    averageResponseTime: number;
    messageTypes: Record<string, number>;
    peakHours: { hour: number; count: number }[];
    conversationDuration: {
      average: number;
      median: number;
      longest: number;
    };
  };
  engagement: {
    dailyActiveUsers: number[];
    weeklyActiveUsers: number[];
    monthlyActiveUsers: number[];
    sessionDuration: {
      average: number;
      median: number;
      distribution: Record<string, number>;
    };
    userRetention: {
      day1: number;
      day7: number;
      day30: number;
    };
    featureUsage: Record<string, number>;
  };
  business: {
    allyStats: {
      totalAllies: number;
      activeAllies: number;
      pendingApplications: number;
      approvedApplications: number;
      rejectedApplications: number;
      averageResponseTime: number;
      customerSatisfaction: number;
    };
    transactionStats: {
      totalTransactions: number;
      transactionVolume: number;
      averageTransactionValue: number;
      transactionsPerDay: number[];
      topServices: { name: string; count: number; revenue: number }[];
    };
    referralStats: {
      totalReferrals: number;
      successfulReferrals: number;
      referralConversionRate: number;
      topReferrers: { userId: string; name: string; referrals: number }[];
    };
  };
  geographic: {
    usersByCountry: Record<string, number>;
    usersByCity: Record<string, number>;
    messagesByRegion: Record<string, number>;
    peakTimesByRegion: Record<string, { hour: number; count: number }[]>;
  };
  technical: {
    platformUsage: Record<string, number>;
    deviceTypes: Record<string, number>;
    osVersions: Record<string, number>;
    appVersions: Record<string, number>;
    errorRates: {
      total: number;
      byType: Record<string, number>;
      byPlatform: Record<string, number>;
    };
    performanceMetrics: {
      averageLoadTime: number;
      crashRate: number;
      memoryUsage: number;
      networkLatency: number;
    };
  };
}

export interface AnalyticsTimeframe {
  start: Date;
  end: Date;
  granularity: 'hour' | 'day' | 'week' | 'month';
}

export interface MetricTrend {
  current: number;
  previous: number;
  change: number;
  changePercent: number;
  trend: 'up' | 'down' | 'stable';
}

export interface DashboardWidget {
  id: string;
  type: 'metric' | 'chart' | 'table' | 'heatmap';
  title: string;
  description?: string;
  data: any;
  config?: {
    chartType?: 'line' | 'bar' | 'pie' | 'area';
    timeframe?: AnalyticsTimeframe;
    filters?: Record<string, any>;
  };
  position: { x: number; y: number; width: number; height: number };
  refreshInterval?: number;
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