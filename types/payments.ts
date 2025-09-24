export interface PaymentGateway {
  id: string;
  name: string;
  type: 'stripe' | 'paypal' | 'mercadopago' | 'wompi' | 'epayco';
  enabled: boolean;
  config: {
    publicKey?: string;
    secretKey?: string;
    webhookSecret?: string;
    environment: 'sandbox' | 'production';
  };
  supportedCurrencies: string[];
  supportedCountries: string[];
  fees: {
    percentage: number;
    fixed: number;
    currency: string;
  };
}

export interface PaymentMethod {
  id: string;
  type: 'card' | 'bank_transfer' | 'digital_wallet' | 'crypto';
  provider: string;
  last4?: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
  isDefault: boolean;
  metadata: Record<string, any>;
}

export interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'succeeded' | 'failed' | 'canceled';
  paymentMethodId: string;
  gatewayId: string;
  clientSecret?: string;
  metadata: {
    orderId?: string;
    userId: string;
    description: string;
    [key: string]: any;
  };
  fraudScore?: number;
  riskLevel: 'low' | 'medium' | 'high';
  createdAt: string;
  updatedAt: string;
}

export interface Subscription {
  id: string;
  userId: string;
  planId: string;
  status: 'active' | 'canceled' | 'past_due' | 'unpaid';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  paymentMethodId: string;
  amount: number;
  currency: string;
  interval: 'day' | 'week' | 'month' | 'year';
  intervalCount: number;
  trialEnd?: string;
  metadata: Record<string, any>;
}

export interface FraudDetection {
  transactionId: string;
  riskScore: number;
  riskLevel: 'low' | 'medium' | 'high';
  flags: string[];
  recommendation: 'approve' | 'review' | 'decline';
  checks: {
    velocity: boolean;
    geolocation: boolean;
    deviceFingerprint: boolean;
    behaviorAnalysis: boolean;
  };
}

export interface CurrencyExchange {
  from: string;
  to: string;
  rate: number;
  timestamp: string;
  provider: string;
}

export interface PaymentWebhook {
  id: string;
  event: string;
  data: any;
  signature: string;
  processed: boolean;
  createdAt: string;
}