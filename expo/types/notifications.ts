export interface NotificationAnalytics {
  id: string;
  notificationId: string;
  type: NotificationType;
  category: NotificationCategory;
  sentAt: Date;
  deliveredAt?: Date;
  openedAt?: Date;
  clickedAt?: Date;
  dismissedAt?: Date;
  userId: string;
  deviceType: 'mobile' | 'web' | 'tablet';
  platform: 'ios' | 'android' | 'web';
  metadata?: {
    title: string;
    body: string;
    priority: 'low' | 'normal' | 'high';
    hasAction: boolean;
    actionType?: string;
  };
}

export interface NotificationMetrics {
  totalSent: number;
  totalDelivered: number;
  totalOpened: number;
  totalClicked: number;
  totalDismissed: number;
  deliveryRate: number; // delivered / sent
  openRate: number; // opened / delivered
  clickRate: number; // clicked / opened
  dismissalRate: number; // dismissed / delivered
  engagementRate: number; // (opened + clicked) / delivered
  conversionRate: number; // clicked / sent
}

export interface NotificationSegment {
  id: string;
  name: string;
  description: string;
  criteria: {
    userType?: 'new' | 'active' | 'inactive' | 'premium';
    location?: string[];
    deviceType?: ('mobile' | 'web' | 'tablet')[];
    platform?: ('ios' | 'android' | 'web')[];
    categories?: NotificationCategory[];
    lastActiveWithin?: number; // days
    transactionCount?: { min?: number; max?: number };
    ncopBalance?: { min?: number; max?: number };
  };
  userCount: number;
  metrics: NotificationMetrics;
  createdAt: Date;
  updatedAt: Date;
}

export interface ABTestVariant {
  id: string;
  name: string;
  title: string;
  body: string;
  priority: 'low' | 'normal' | 'high';
  hasAction: boolean;
  actionText?: string;
  weight: number; // percentage of traffic
  metrics: NotificationMetrics;
}

export interface ABTest {
  id: string;
  name: string;
  description: string;
  type: NotificationType;
  category: NotificationCategory;
  status: 'draft' | 'running' | 'paused' | 'completed';
  variants: ABTestVariant[];
  targetSegment?: string; // segment ID
  startDate: Date;
  endDate?: Date;
  sampleSize: number;
  confidenceLevel: number;
  winner?: string; // variant ID
  createdAt: Date;
  updatedAt: Date;
}

export interface NotificationFrequencyRule {
  id: string;
  category: NotificationCategory;
  maxPerHour: number;
  maxPerDay: number;
  maxPerWeek: number;
  cooldownMinutes: number;
  priority: 'low' | 'normal' | 'high';
  exemptTypes?: NotificationType[];
}

export interface PersonalizationRule {
  id: string;
  name: string;
  condition: {
    userSegment?: string;
    timeOfDay?: { start: string; end: string };
    dayOfWeek?: number[];
    userActivity?: 'high' | 'medium' | 'low';
    lastNotificationHours?: number;
  };
  action: {
    adjustPriority?: 'increase' | 'decrease';
    changeTitle?: string;
    changeBody?: string;
    addEmoji?: boolean;
    personalizeContent?: boolean;
  };
  isActive: boolean;
  createdAt: Date;
}

export interface NotificationCampaign {
  id: string;
  name: string;
  description: string;
  type: NotificationType;
  category: NotificationCategory;
  status: 'draft' | 'scheduled' | 'running' | 'completed' | 'cancelled';
  targetSegments: string[];
  template: {
    title: string;
    body: string;
    priority: 'low' | 'normal' | 'high';
    hasAction: boolean;
    actionText?: string;
    actionUrl?: string;
  };
  scheduling: {
    sendAt?: Date;
    timezone: string;
    respectQuietHours: boolean;
    respectFrequencyLimits: boolean;
  };
  abTest?: string; // AB test ID
  metrics: NotificationMetrics;
  createdAt: Date;
  updatedAt: Date;
}

export interface NotificationInsight {
  id: string;
  type: 'trend' | 'anomaly' | 'recommendation' | 'alert';
  category: NotificationCategory;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  data: any;
  actionable: boolean;
  actions?: {
    label: string;
    action: string;
    params?: any;
  }[];
  createdAt: Date;
  acknowledgedAt?: Date;
}

export interface NotificationOptimization {
  id: string;
  type: 'send_time' | 'frequency' | 'content' | 'segmentation';
  recommendation: string;
  impact: {
    metric: 'open_rate' | 'click_rate' | 'engagement_rate' | 'conversion_rate';
    expectedImprovement: number; // percentage
    confidence: number; // percentage
  };
  implementation: {
    difficulty: 'easy' | 'medium' | 'hard';
    estimatedHours: number;
    requirements: string[];
  };
  status: 'pending' | 'in_progress' | 'implemented' | 'rejected';
  createdAt: Date;
  implementedAt?: Date;
}

export type NotificationType = 
  | 'payment_received'
  | 'payment_sent'
  | 'ncop_earned'
  | 'ncop_exchanged'
  | 'referral_success'
  | 'appointment_confirmed'
  | 'appointment_reminder'
  | 'appointment_cancelled'
  | 'new_message'
  | 'social_like'
  | 'social_comment'
  | 'social_share'
  | 'offer_available'
  | 'offer_expiring'
  | 'ally_order'
  | 'ally_review'
  | 'system_update'
  | 'security_alert'
  | 'promotion'
  | 'recharge_success'
  | 'low_balance';

export type NotificationCategory = 
  | 'wallet'
  | 'social'
  | 'appointments'
  | 'offers'
  | 'ally'
  | 'system'
  | 'chat';

export interface NotificationData {
  id: string;
  title: string;
  body: string;
  data?: any;
  timestamp: number;
  read: boolean;
  type: NotificationType;
  priority: 'low' | 'normal' | 'high';
  category: NotificationCategory;
}

export interface NotificationSettings {
  enabled: boolean;
  categories: {
    wallet: boolean;
    social: boolean;
    appointments: boolean;
    offers: boolean;
    ally: boolean;
    system: boolean;
    chat: boolean;
  };
  sound: boolean;
  vibration: boolean;
  badge: boolean;
  quietHours: {
    enabled: boolean;
    start: string;
    end: string;
  };
}