export interface PremiumFeature {
  id: string;
  name: string;
  description: string;
  category: 'communication' | 'storage' | 'analytics' | 'automation';
  requiredTier: 'basic' | 'premium' | 'enterprise';
  isActive: boolean;
  usageLimit?: number;
  resetPeriod?: 'daily' | 'weekly' | 'monthly';
}

export interface VideoCall {
  id: string;
  initiatorId: string;
  participantId: string;
  status: 'pending' | 'active' | 'ended' | 'missed';
  startTime?: Date;
  endTime?: Date;
  duration?: number; // seconds
  quality: 'low' | 'medium' | 'high';
  recordingUrl?: string;
  isRecorded: boolean;
}

export interface FileShare {
  id: string;
  senderId: string;
  receiverId: string;
  fileName: string;
  fileSize: number; // bytes
  fileType: string;
  fileUrl: string;
  uploadedAt: Date;
  expiresAt?: Date;
  downloadCount: number;
  maxDownloads?: number;
  isEncrypted: boolean;
  status: 'uploading' | 'available' | 'expired' | 'deleted';
}

export interface ScheduledMessage {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  scheduledFor: Date;
  status: 'scheduled' | 'sent' | 'failed' | 'cancelled';
  messageType: 'text' | 'image' | 'file';
  attachments?: string[];
  createdAt: Date;
  sentAt?: Date;
  retryCount: number;
}

export interface PremiumUsage {
  userId: string;
  feature: string;
  usageCount: number;
  lastUsed: Date;
  resetDate: Date;
  isLimitReached: boolean;
}

export interface AdvancedAnalytics {
  id: string;
  userId: string;
  metric: string;
  value: number;
  metadata: Record<string, any>;
  timestamp: Date;
  category: 'engagement' | 'performance' | 'revenue' | 'satisfaction';
}

export interface AutomationRule {
  id: string;
  userId: string;
  name: string;
  description: string;
  trigger: {
    type: 'time' | 'event' | 'condition';
    config: Record<string, any>;
  };
  actions: {
    type: 'message' | 'notification' | 'api_call' | 'email';
    config: Record<string, any>;
  }[];
  isActive: boolean;
  lastExecuted?: Date;
  executionCount: number;
  createdAt: Date;
}