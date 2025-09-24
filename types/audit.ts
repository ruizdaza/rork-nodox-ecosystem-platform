export interface AuditLog {
  id: string;
  userId: string;
  userRole: 'client' | 'ally' | 'admin' | 'referral_member';
  action: string;
  resource: string;
  resourceId?: string;
  details: Record<string, any>;
  ipAddress: string;
  userAgent: string;
  timestamp: Date;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'auth' | 'transaction' | 'data' | 'system' | 'security';
}

export interface SecurityEvent {
  id: string;
  type: 'failed_login' | 'suspicious_activity' | 'data_breach' | 'unauthorized_access';
  userId?: string;
  description: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  ipAddress: string;
  timestamp: Date;
  resolved: boolean;
  resolvedBy?: string;
  resolvedAt?: Date;
  actions: string[];
}

export interface ComplianceReport {
  id: string;
  type: 'gdpr' | 'financial' | 'security' | 'operational';
  period: {
    start: Date;
    end: Date;
  };
  generatedBy: string;
  generatedAt: Date;
  status: 'draft' | 'pending_review' | 'approved' | 'published';
  findings: ComplianceFinding[];
  recommendations: string[];
  attachments: string[];
}

export interface ComplianceFinding {
  id: string;
  category: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  evidence: string[];
  remediation: string;
  status: 'open' | 'in_progress' | 'resolved';
  assignedTo?: string;
  dueDate?: Date;
}

export interface DataRetentionPolicy {
  id: string;
  dataType: string;
  retentionPeriod: number; // days
  deletionMethod: 'soft' | 'hard';
  isActive: boolean;
  lastReviewed: Date;
  nextReview: Date;
  approvedBy: string;
}

export interface AuditFilter {
  userId?: string;
  userRole?: string;
  action?: string;
  resource?: string;
  severity?: string;
  category?: string;
  dateFrom?: Date;
  dateTo?: Date;
  ipAddress?: string;
}