export interface BulkMessagingPlan {
  id: string;
  name: string;
  description: string;
  features: {
    freeMessagesPerMonth: number;
    costPerAdditionalMessage: number;
    maxRecipientsPerCampaign: number;
    allowScheduling: boolean;
    allowSegmentation: boolean;
    analyticsIncluded: boolean;
    priorityDelivery: boolean;
    dedicatedSupport: boolean;
    apiAccess: boolean;
    customTemplates: boolean;
  };
  pricing: {
    monthlyFee: number;
    yearlyFee: number;
    yearlyDiscount: number;
  };
  limits: {
    campaignsPerMonth: number;
    maxMessageLength: number;
    attachmentsAllowed: boolean;
    maxAttachmentSize: number;
  };
}

export interface BulkMessagingSubscription {
  id: string;
  allyId: string;
  allyName: string;
  plan: BulkMessagingPlan;
  status: 'active' | 'suspended' | 'cancelled' | 'trial';
  billingCycle: 'monthly' | 'yearly';
  startDate: Date;
  renewalDate: Date;
  trialEndsAt?: Date;
  usage: {
    messagesUsedThisMonth: number;
    messagesRemainingFree: number;
    additionalMessagesUsed: number;
    campaignsUsedThisMonth: number;
    totalCostThisMonth: number;
  };
  paymentMethod?: {
    type: 'card' | 'bank_transfer' | 'paypal';
    last4?: string;
    expiryMonth?: number;
    expiryYear?: number;
  };
  autoRenew: boolean;
}

export interface BulkMessageCampaign {
  id: string;
  allyId: string;
  allyName: string;
  name: string;
  description?: string;
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'paused' | 'cancelled' | 'failed';
  message: {
    subject?: string;
    content: string;
    type: 'text' | 'rich' | 'template';
    templateId?: string;
    variables?: Record<string, string>;
    attachments?: {
      url: string;
      name: string;
      size: number;
      type: string;
    }[];
  };
  recipients: {
    total: number;
    type: 'all_customers' | 'segment' | 'manual_list';
    segmentId?: string;
    segmentName?: string;
    userIds?: string[];
    filters?: {
      hasActiveOrders?: boolean;
      minPurchaseAmount?: number;
      lastPurchaseDays?: number;
      tags?: string[];
      location?: string[];
    };
  };
  scheduling: {
    sendNow: boolean;
    scheduledFor?: Date;
    timezone?: string;
    sendInBatches?: boolean;
    batchSize?: number;
    batchDelayMinutes?: number;
  };
  analytics: {
    sent: number;
    delivered: number;
    failed: number;
    opened: number;
    clicked: number;
    unsubscribed: number;
    cost: number;
  };
  createdAt: Date;
  updatedAt: Date;
  sentAt?: Date;
  completedAt?: Date;
}

export interface MessageTemplate {
  id: string;
  allyId: string;
  name: string;
  category: 'promotion' | 'announcement' | 'reminder' | 'welcome' | 'custom';
  content: string;
  variables: {
    key: string;
    label: string;
    defaultValue?: string;
    required: boolean;
  }[];
  previewImage?: string;
  usageCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface RecipientSegment {
  id: string;
  allyId: string;
  name: string;
  description?: string;
  criteria: {
    hasActiveOrders?: boolean;
    minPurchaseAmount?: number;
    maxPurchaseAmount?: number;
    lastPurchaseDays?: number;
    tags?: string[];
    location?: string[];
    customerSince?: Date;
    totalSpent?: number;
    orderCount?: number;
  };
  recipientCount: number;
  lastUpdated: Date;
  createdAt: Date;
}

export interface BulkMessagingStats {
  overview: {
    totalCampaigns: number;
    activeCampaigns: number;
    messagesSentToday: number;
    messagesSentThisMonth: number;
    totalMessagesSent: number;
    currentMonthCost: number;
    averageDeliveryRate: number;
    averageOpenRate: number;
  };
  subscription: {
    plan: string;
    status: 'active' | 'trial' | 'suspended' | 'cancelled';
    messagesRemaining: number;
    renewalDate: Date;
    billingAmount: number;
  };
  recentCampaigns: {
    id: string;
    name: string;
    sent: number;
    delivered: number;
    openRate: number;
    cost: number;
    sentAt: Date;
  }[];
  topPerformingCampaigns: {
    id: string;
    name: string;
    openRate: number;
    clickRate: number;
    conversions: number;
    sentAt: Date;
  }[];
}

export interface BulkMessagingInvoice {
  id: string;
  allyId: string;
  subscriptionId: string;
  period: {
    start: Date;
    end: Date;
  };
  charges: {
    subscriptionFee: number;
    freeMessages: number;
    additionalMessages: number;
    additionalMessagesCost: number;
    totalBeforeTax: number;
    tax: number;
    total: number;
  };
  breakdown: {
    date: Date;
    campaignId: string;
    campaignName: string;
    messagesSent: number;
    cost: number;
  }[];
  status: 'pending' | 'paid' | 'overdue' | 'cancelled';
  dueDate: Date;
  paidAt?: Date;
  paymentMethod?: string;
}

export interface BulkMessagingNotification {
  id: string;
  allyId: string;
  type: 'usage_warning' | 'limit_reached' | 'campaign_completed' | 'payment_due' | 'subscription_expiring';
  title: string;
  message: string;
  severity: 'info' | 'warning' | 'error';
  data?: any;
  read: boolean;
  createdAt: Date;
}
