export interface SecurityConfig {
  encryption: {
    algorithm: string;
    keySize: number;
    enabled: boolean;
  };
  pciCompliance: {
    level: 'level1' | 'level2' | 'level3' | 'level4';
    certified: boolean;
    certificationDate?: string;
    expiryDate?: string;
    assessor?: string;
  };
  gdprCompliance: {
    enabled: boolean;
    dataRetentionDays: number;
    cookieConsent: boolean;
    rightToErasure: boolean;
    dataPortability: boolean;
  };
  auditLog: {
    enabled: boolean;
    retentionDays: number;
    events: string[];
  };
}

export interface SecurityAudit {
  id: string;
  type: 'security_scan' | 'penetration_test' | 'compliance_check' | 'vulnerability_assessment';
  status: 'scheduled' | 'in_progress' | 'completed' | 'failed';
  severity: 'low' | 'medium' | 'high' | 'critical';
  findings: SecurityFinding[];
  recommendations: string[];
  auditor: string;
  scheduledDate: string;
  completedDate?: string;
  nextAuditDate?: string;
  metadata: Record<string, any>;
}

export interface SecurityFinding {
  id: string;
  type: 'vulnerability' | 'misconfiguration' | 'policy_violation' | 'data_exposure';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  location: string;
  impact: string;
  recommendation: string;
  status: 'open' | 'in_progress' | 'resolved' | 'accepted_risk';
  cveId?: string;
  cvssScore?: number;
  discoveredAt: string;
  resolvedAt?: string;
}

export interface EncryptionKey {
  id: string;
  type: 'aes' | 'rsa' | 'ecdsa';
  purpose: 'data_encryption' | 'key_encryption' | 'signing' | 'authentication';
  algorithm: string;
  keySize: number;
  status: 'active' | 'inactive' | 'revoked' | 'expired';
  createdAt: string;
  expiresAt?: string;
  rotationSchedule?: {
    interval: 'monthly' | 'quarterly' | 'yearly';
    nextRotation: string;
  };
}

export interface AccessControl {
  userId: string;
  resource: string;
  permissions: Permission[];
  conditions?: AccessCondition[];
  grantedAt: string;
  grantedBy: string;
  expiresAt?: string;
  metadata: Record<string, any>;
}

export interface Permission {
  action: string;
  resource: string;
  effect: 'allow' | 'deny';
  conditions?: string[];
}

export interface AccessCondition {
  type: 'ip_range' | 'time_window' | 'device_type' | 'location' | 'mfa_required';
  value: string;
  operator: 'equals' | 'contains' | 'in_range' | 'not_equals';
}

export interface SecurityEvent {
  id: string;
  type: 'login_attempt' | 'failed_login' | 'permission_denied' | 'data_access' | 'suspicious_activity';
  severity: 'info' | 'warning' | 'error' | 'critical';
  userId?: string;
  ipAddress: string;
  userAgent: string;
  resource?: string;
  action?: string;
  result: 'success' | 'failure' | 'blocked';
  details: Record<string, any>;
  timestamp: string;
  location?: {
    country: string;
    city: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
}

export interface ThreatIntelligence {
  id: string;
  type: 'malicious_ip' | 'suspicious_domain' | 'known_threat_actor' | 'vulnerability';
  source: string;
  confidence: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  indicators: {
    ips?: string[];
    domains?: string[];
    hashes?: string[];
    urls?: string[];
  };
  description: string;
  firstSeen: string;
  lastSeen: string;
  active: boolean;
}

export interface ComplianceReport {
  id: string;
  framework: 'pci_dss' | 'gdpr' | 'sox' | 'iso27001' | 'hipaa';
  version: string;
  status: 'compliant' | 'non_compliant' | 'partially_compliant';
  score: number;
  requirements: ComplianceRequirement[];
  generatedAt: string;
  validUntil: string;
  auditor?: string;
  metadata: Record<string, any>;
}

export interface ComplianceRequirement {
  id: string;
  title: string;
  description: string;
  status: 'met' | 'not_met' | 'partially_met' | 'not_applicable';
  evidence?: string[];
  notes?: string;
  lastAssessed: string;
  nextAssessment?: string;
}