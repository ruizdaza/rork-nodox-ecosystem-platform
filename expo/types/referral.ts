export interface ReferralLead {
  id: string;
  referrerId: string;
  name: string;
  email: string;
  phone: string;
  status: 'lead' | 'contacted' | 'qualified' | 'converted' | 'lost';
  source: 'direct_link' | 'qr_code' | 'social_media' | 'email' | 'whatsapp' | 'other';
  joinDate: string;
  conversionDate?: string;
  lastContactDate?: string;
  nextFollowUpDate?: string;
  tags: string[];
  notes: string;
  interactionCount: number;
  totalSpent: number;
  totalOrders: number;
  lifetimeValue: number;
  commissionEarned: number;
  level: number;
  isAlly: boolean;
  allyType?: 'business' | 'individual';
  customFields: Record<string, any>;
}

export interface ReferralInteraction {
  id: string;
  leadId: string;
  referrerId: string;
  type: 'call' | 'email' | 'message' | 'meeting' | 'demo' | 'follow_up' | 'note';
  date: string;
  description: string;
  outcome?: 'positive' | 'neutral' | 'negative';
  nextAction?: string;
  nextActionDate?: string;
  duration?: number;
  attachments?: string[];
  createdBy: string;
}

export interface ReferralCampaign {
  id: string;
  referrerId: string;
  name: string;
  description: string;
  type: 'email' | 'social' | 'whatsapp' | 'sms' | 'multi_channel';
  status: 'draft' | 'active' | 'paused' | 'completed';
  startDate: string;
  endDate?: string;
  targetAudience: string[];
  message: string;
  mediaUrl?: string;
  ctaText: string;
  ctaUrl: string;
  metrics: {
    sent: number;
    delivered: number;
    opened: number;
    clicked: number;
    converted: number;
    revenue: number;
  };
  budget?: number;
  spent?: number;
  createdAt: string;
  updatedAt: string;
}

export interface MarketingMaterial {
  id: string;
  type: 'banner' | 'story' | 'post' | 'video' | 'flyer' | 'email_template';
  title: string;
  description: string;
  imageUrl: string;
  downloadUrl?: string;
  dimensions?: { width: number; height: number };
  format: 'jpg' | 'png' | 'mp4' | 'pdf' | 'html';
  category: string;
  tags: string[];
  usageCount: number;
  createdAt: string;
}

export interface ReferralCommission {
  id: string;
  referrerId: string;
  leadId: string;
  type: 'signup_bonus' | 'purchase_commission' | 'recurring_commission' | 'milestone_bonus';
  amount: number;
  currency: 'NCOP' | 'COP';
  status: 'pending' | 'approved' | 'paid' | 'cancelled';
  orderId?: string;
  orderValue?: number;
  commissionRate?: number;
  description: string;
  earnedDate: string;
  paidDate?: string;
  paymentMethod?: string;
  transactionId?: string;
}

export interface ReferralSegment {
  id: string;
  name: string;
  description: string;
  criteria: {
    status?: ReferralLead['status'][];
    source?: ReferralLead['source'][];
    minLifetimeValue?: number;
    maxLifetimeValue?: number;
    minOrders?: number;
    maxOrders?: number;
    joinedAfter?: string;
    joinedBefore?: string;
    tags?: string[];
    isAlly?: boolean;
    hasInteractionInDays?: number;
  };
  leadCount: number;
  totalValue: number;
  conversionRate: number;
}

export interface ReferralStats {
  totalLeads: number;
  activeLeads: number;
  convertedLeads: number;
  lostLeads: number;
  conversionRate: number;
  averageConversionTime: number;
  totalCommissionsEarned: number;
  pendingCommissions: number;
  paidCommissions: number;
  totalLifetimeValue: number;
  averageLifetimeValue: number;
  topPerformingSource: string;
  monthlyGrowth: number;
  leadsThisMonth: number;
  conversionsThisMonth: number;
  revenueThisMonth: number;
  leadsThisWeek: number;
  leadsToday: number;
  activeCampaigns: number;
  campaignROI: number;
}

export interface ReferralFunnel {
  stage: 'lead' | 'contacted' | 'qualified' | 'converted';
  count: number;
  percentage: number;
  averageTimeInStage: number;
  dropoffRate: number;
}

export interface ReferralGoal {
  id: string;
  referrerId: string;
  type: 'leads' | 'conversions' | 'revenue' | 'commissions';
  target: number;
  current: number;
  period: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  startDate: string;
  endDate: string;
  status: 'active' | 'completed' | 'failed';
  reward?: {
    type: 'ncop' | 'badge' | 'tier_upgrade';
    value: number;
    description: string;
  };
}

export interface ReferralTier {
  id: string;
  name: string;
  minLeads: number;
  minRevenue: number;
  benefits: {
    commissionRate: number;
    bonusMultiplier: number;
    prioritySupport: boolean;
    customMaterials: boolean;
    dedicatedManager: boolean;
    exclusiveEvents: boolean;
  };
  badge: {
    icon: string;
    color: string;
  };
}

export interface ReferralAnalytics {
  period: 'day' | 'week' | 'month' | 'quarter' | 'year';
  startDate: string;
  endDate: string;
  metrics: {
    leads: { value: number; change: number };
    conversions: { value: number; change: number };
    revenue: { value: number; change: number };
    commissions: { value: number; change: number };
    avgConversionTime: { value: number; change: number };
    conversionRate: { value: number; change: number };
  };
  chartData: {
    date: string;
    leads: number;
    conversions: number;
    revenue: number;
  }[];
  sourceBreakdown: {
    source: string;
    leads: number;
    conversions: number;
    revenue: number;
    conversionRate: number;
  }[];
  topLeads: ReferralLead[];
  recentActivity: ReferralInteraction[];
}

export interface ReferralNotification {
  id: string;
  referrerId: string;
  type: 'new_lead' | 'conversion' | 'commission_earned' | 'milestone' | 'follow_up_reminder' | 'campaign_update';
  title: string;
  message: string;
  data?: any;
  read: boolean;
  createdAt: string;
  actionUrl?: string;
}

export interface ReferralTask {
  id: string;
  referrerId: string;
  leadId?: string;
  title: string;
  description: string;
  type: 'follow_up' | 'call' | 'email' | 'meeting' | 'demo' | 'other';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  dueDate: string;
  completedDate?: string;
  assignedTo?: string;
  reminders: {
    time: string;
    sent: boolean;
  }[];
}

export interface ReferralTemplate {
  id: string;
  type: 'email' | 'message' | 'social_post' | 'script';
  name: string;
  subject?: string;
  content: string;
  variables: string[];
  category: string;
  usageCount: number;
  rating: number;
  createdAt: string;
}

export interface ReferralLeaderboard {
  period: 'week' | 'month' | 'quarter' | 'year' | 'all_time';
  rankings: {
    rank: number;
    referrerId: string;
    referrerName: string;
    avatar?: string;
    tier: string;
    leads: number;
    conversions: number;
    revenue: number;
    commissions: number;
    change: number;
  }[];
  userRank?: number;
}
