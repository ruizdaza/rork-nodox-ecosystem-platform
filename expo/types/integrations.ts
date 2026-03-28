export interface Integration {
  id: string;
  name: string;
  category: 'payment' | 'accounting' | 'marketing' | 'communication' | 'analytics' | 'crm' | 'erp';
  provider: string;
  description: string;
  icon: string;
  status: 'connected' | 'disconnected' | 'error' | 'pending';
  isEnabled: boolean;
  config: IntegrationConfig;
  credentials?: IntegrationCredentials;
  lastSync?: string;
  syncFrequency: 'realtime' | 'hourly' | 'daily' | 'manual';
  dataMapping: DataMapping[];
  webhooks: Webhook[];
  permissions: string[];
  usageStats: UsageStats;
  createdAt: string;
  updatedAt: string;
}

export interface IntegrationConfig {
  apiUrl?: string;
  apiVersion?: string;
  timeout: number;
  retryAttempts: number;
  autoSync: boolean;
  syncFields: string[];
  customSettings: Record<string, any>;
}

export interface IntegrationCredentials {
  apiKey?: string;
  apiSecret?: string;
  accessToken?: string;
  refreshToken?: string;
  clientId?: string;
  clientSecret?: string;
  webhookSecret?: string;
  expiresAt?: string;
}

export interface DataMapping {
  sourceField: string;
  targetField: string;
  transform?: 'lowercase' | 'uppercase' | 'date' | 'number' | 'custom';
  customTransform?: string;
  isRequired: boolean;
}

export interface Webhook {
  id: string;
  url: string;
  events: string[];
  isActive: boolean;
  secret: string;
  lastTriggered?: string;
}

export interface UsageStats {
  totalCalls: number;
  successfulCalls: number;
  failedCalls: number;
  lastCallAt?: string;
  averageResponseTime: number;
  quotaLimit?: number;
  quotaUsed?: number;
}

export interface SyncLog {
  id: string;
  integrationId: string;
  integrationName: string;
  status: 'success' | 'failed' | 'partial';
  recordsSynced: number;
  recordsFailed: number;
  errors: SyncError[];
  startedAt: string;
  completedAt: string;
  duration: number;
}

export interface SyncError {
  recordId: string;
  recordType: string;
  errorCode: string;
  errorMessage: string;
  timestamp: string;
}

export interface IntegrationTemplate {
  id: string;
  name: string;
  provider: string;
  category: string;
  description: string;
  icon: string;
  isPremium: boolean;
  requirements: string[];
  setupInstructions: string[];
  defaultConfig: IntegrationConfig;
}

export interface PaymentIntegration extends Integration {
  supportedMethods: ('card' | 'bank_transfer' | 'wallet' | 'cash')[];
  currencies: string[];
  transactionFee: number;
  settlementPeriod: number;
}

export interface AccountingIntegration extends Integration {
  chartOfAccounts: ChartOfAccount[];
  fiscalYear: string;
  taxSettings: TaxSettings;
}

export interface ChartOfAccount {
  code: string;
  name: string;
  type: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';
  balance: number;
}

export interface TaxSettings {
  taxId: string;
  taxRates: {
    name: string;
    rate: number;
    isDefault: boolean;
  }[];
  taxExemptions: string[];
}

export interface MarketingIntegration extends Integration {
  campaigns: Campaign[];
  audiences: Audience[];
  templates: MessageTemplate[];
}

export interface Campaign {
  id: string;
  name: string;
  type: 'email' | 'sms' | 'push' | 'social';
  status: 'draft' | 'scheduled' | 'active' | 'paused' | 'completed';
  audience: string[];
  templateId: string;
  scheduledAt?: string;
  metrics: CampaignMetrics;
}

export interface CampaignMetrics {
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  converted: number;
  bounced: number;
  unsubscribed: number;
}

export interface Audience {
  id: string;
  name: string;
  size: number;
  filters: AudienceFilter[];
  lastUpdated: string;
}

export interface AudienceFilter {
  field: string;
  operator: 'equals' | 'contains' | 'greater_than' | 'less_than' | 'in' | 'not_in';
  value: any;
}

export interface MessageTemplate {
  id: string;
  name: string;
  type: 'email' | 'sms' | 'push';
  subject?: string;
  content: string;
  variables: string[];
  isActive: boolean;
}

export interface IntegrationEvent {
  id: string;
  integrationId: string;
  integrationName: string;
  eventType: 'sync_started' | 'sync_completed' | 'sync_failed' | 'connection_error' | 'quota_exceeded';
  severity: 'info' | 'warning' | 'error' | 'critical';
  message: string;
  details?: Record<string, any>;
  timestamp: string;
  isResolved: boolean;
  resolvedAt?: string;
}
