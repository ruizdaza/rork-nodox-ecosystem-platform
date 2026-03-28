export type WalletCurrency = 'NCOP' | 'COP';

export interface WalletBalance {
  ncop: number;
  cop: number;
  lastUpdated: string;
}

export interface WalletTransaction {
  id: string;
  userId: string;
  type: TransactionType;
  currency: WalletCurrency;
  amount: number;
  balanceAfter: number;
  description: string;
  category: TransactionCategory;
  status: TransactionStatus;
  metadata?: TransactionMetadata;
  createdAt: string;
  completedAt?: string;
  failedAt?: string;
  failureReason?: string;
}

export type TransactionType = 
  | 'earn'
  | 'spend'
  | 'send'
  | 'receive'
  | 'recharge'
  | 'withdraw'
  | 'exchange'
  | 'refund'
  | 'bonus'
  | 'commission';

export type TransactionCategory =
  | 'purchase'
  | 'transfer'
  | 'reward'
  | 'referral'
  | 'cashback'
  | 'payment'
  | 'top_up'
  | 'withdrawal'
  | 'conversion'
  | 'other';

export type TransactionStatus =
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'cancelled'
  | 'refunded';

export interface TransactionMetadata {
  recipientId?: string;
  recipientName?: string;
  senderId?: string;
  senderName?: string;
  orderId?: string;
  productId?: string;
  productName?: string;
  paymentMethod?: PaymentMethod;
  referralId?: string;
  campaignId?: string;
  notes?: string;
}

export type PaymentMethod = 
  | 'PSE'
  | 'CARD'
  | 'BANK_TRANSFER'
  | 'WALLET'
  | 'CASH';

export interface RechargeRequest {
  amount: number;
  paymentMethod: PaymentMethod;
  currency: 'COP';
  returnUrl?: string;
}

export interface RechargeResponse {
  transactionId: string;
  status: TransactionStatus;
  amount: number;
  bonusNcop: number;
  paymentUrl?: string;
  expiresAt?: string;
}

export interface SendMoneyRequest {
  recipientId: string;
  amount: number;
  currency: WalletCurrency;
  description?: string;
  requireConfirmation?: boolean;
}

export interface SendMoneyResponse {
  transactionId: string;
  status: TransactionStatus;
  amount: number;
  recipientName: string;
  fee: number;
}

export interface ExchangeRequest {
  fromCurrency: WalletCurrency;
  toCurrency: WalletCurrency;
  amount: number;
  exchangeRate: number;
}

export interface ExchangeResponse {
  transactionId: string;
  fromAmount: number;
  toAmount: number;
  exchangeRate: number;
  fee: number;
  status: TransactionStatus;
}

export interface WalletLimits {
  dailySendLimit: number;
  dailyRechargeLimit: number;
  maxTransactionAmount: number;
  minTransactionAmount: number;
  dailyWithdrawalLimit: number;
  monthlyLimits: {
    send: number;
    recharge: number;
    withdraw: number;
  };
}

export interface WalletSettings {
  userId: string;
  requirePinForTransactions: boolean;
  requireConfirmationForLargeTransactions: boolean;
  largeTransactionThreshold: number;
  notificationsEnabled: boolean;
  autoConvertEnabled: boolean;
  preferredCurrency: WalletCurrency;
  dailyLimits: {
    send: number;
    recharge: number;
    withdraw: number;
  };
  securityLevel: 'low' | 'medium' | 'high';
}

export interface TransactionFilter {
  userId?: string;
  type?: TransactionType | TransactionType[];
  currency?: WalletCurrency;
  status?: TransactionStatus | TransactionStatus[];
  category?: TransactionCategory;
  fromDate?: string;
  toDate?: string;
  minAmount?: number;
  maxAmount?: number;
  limit?: number;
  offset?: number;
}

export interface TransactionStats {
  totalEarned: number;
  totalSpent: number;
  totalSent: number;
  totalReceived: number;
  totalRecharged: number;
  netFlow: number;
  transactionCount: number;
  averageTransaction: number;
  largestTransaction: number;
  currency: WalletCurrency;
  period: {
    from: string;
    to: string;
  };
}

export interface WalletAlert {
  id: string;
  userId: string;
  type: AlertType;
  severity: 'info' | 'warning' | 'critical';
  title: string;
  message: string;
  data?: any;
  isRead: boolean;
  createdAt: string;
}

export type AlertType =
  | 'low_balance'
  | 'limit_reached'
  | 'suspicious_activity'
  | 'large_transaction'
  | 'failed_transaction'
  | 'security_update';

export const NCOP_TO_COP_EXCHANGE_RATE = 100;
export const COP_TO_NCOP_EXCHANGE_RATE = 0.01;
export const RECHARGE_BONUS_PERCENTAGE = 0.05;
export const TRANSACTION_FEE_PERCENTAGE = 0.01;
export const MIN_TRANSACTION_AMOUNT = 1000;
export const MAX_DAILY_SEND_LIMIT = 5000000;
export const MAX_DAILY_RECHARGE_LIMIT = 10000000;
export const LARGE_TRANSACTION_THRESHOLD = 500000;
