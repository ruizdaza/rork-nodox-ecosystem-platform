export interface WalletUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  balance: number;
  currency: string;
  status: 'active' | 'suspended' | 'frozen' | 'pending';
  kycStatus: 'pending' | 'approved' | 'rejected' | 'expired';
  createdAt: string;
  lastActivity: string;
  totalTransactions: number;
  totalVolume: number;
  riskScore: number;
  tier: 'basic' | 'premium' | 'vip';
}

export interface WalletTransaction {
  id: string;
  userId: string;
  userName: string;
  type: 'deposit' | 'withdrawal' | 'transfer' | 'payment' | 'refund' | 'fee' | 'bonus';
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled' | 'processing';
  description: string;
  timestamp: string;
  fromAddress?: string;
  toAddress?: string;
  txHash?: string;
  fee: number;
  exchangeRate?: number;
  metadata?: Record<string, any>;
  flagged: boolean;
  riskLevel: 'low' | 'medium' | 'high';
}

export interface WalletBalance {
  userId: string;
  currency: string;
  available: number;
  pending: number;
  frozen: number;
  total: number;
  lastUpdated: string;
}

export interface WalletLimits {
  userId: string;
  dailyWithdrawal: number;
  monthlyWithdrawal: number;
  dailyDeposit: number;
  monthlyDeposit: number;
  transactionLimit: number;
  customLimits?: Record<string, number>;
}

export interface WalletAlert {
  id: string;
  type: 'suspicious_activity' | 'large_transaction' | 'failed_transaction' | 'kyc_expiry' | 'limit_exceeded' | 'security_breach';
  severity: 'low' | 'medium' | 'high' | 'critical';
  userId: string;
  userName: string;
  message: string;
  details: Record<string, any>;
  timestamp: string;
  status: 'new' | 'investigating' | 'resolved' | 'dismissed';
  assignedTo?: string;
}

export interface WalletStats {
  totalUsers: number;
  activeUsers: number;
  totalBalance: number;
  totalTransactions: number;
  dailyVolume: number;
  monthlyVolume: number;
  pendingTransactions: number;
  failedTransactions: number;
  suspiciousActivities: number;
  kycPending: number;
  currencyDistribution: Record<string, number>;
  transactionsByType: Record<string, number>;
  usersByTier: Record<string, number>;
}

export interface WalletAuditLog {
  id: string;
  adminId: string;
  adminName: string;
  action: string;
  targetUserId?: string;
  targetUserName?: string;
  details: Record<string, any>;
  timestamp: string;
  ipAddress: string;
  userAgent: string;
}

export interface WalletAdminAction {
  type: 'freeze_account' | 'unfreeze_account' | 'adjust_balance' | 'set_limits' | 'approve_kyc' | 'reject_kyc' | 'cancel_transaction' | 'refund_transaction';
  userId: string;
  amount?: number;
  currency?: string;
  reason: string;
  metadata?: Record<string, any>;
}

export interface WalletComplianceReport {
  id: string;
  type: 'aml' | 'kyc' | 'transaction_monitoring' | 'risk_assessment';
  period: string;
  generatedAt: string;
  data: Record<string, any>;
  status: 'generating' | 'ready' | 'exported';
  downloadUrl?: string;
}

export interface WalletExchangeRate {
  from: string;
  to: string;
  rate: number;
  lastUpdated: string;
  source: string;
}

export interface WalletFeeStructure {
  id: string;
  type: 'withdrawal' | 'deposit' | 'transfer' | 'exchange' | 'payment';
  currency: string;
  feeType: 'fixed' | 'percentage' | 'tiered';
  value: number;
  minFee?: number;
  maxFee?: number;
  tiers?: Array<{
    min: number;
    max: number;
    fee: number;
  }>;
  active: boolean;
}