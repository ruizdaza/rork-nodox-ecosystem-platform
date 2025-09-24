export interface ChatBot {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  language: string;
  personality: 'professional' | 'friendly' | 'casual' | 'formal';
  knowledgeBase: KnowledgeBase[];
  responses: AutoResponse[];
  analytics: ChatBotAnalytics;
}

export interface KnowledgeBase {
  id: string;
  category: string;
  question: string;
  answer: string;
  keywords: string[];
  confidence: number;
  lastUpdated: Date;
}

export interface AutoResponse {
  id: string;
  trigger: ResponseTrigger;
  message: string;
  actions?: AutoAction[];
  conditions?: ResponseCondition[];
  isActive: boolean;
}

export interface ResponseTrigger {
  type: 'keyword' | 'intent' | 'time' | 'event' | 'sentiment';
  value: string;
  confidence?: number;
}

export interface AutoAction {
  type: 'send_email' | 'create_ticket' | 'update_status' | 'schedule_call' | 'send_notification';
  parameters: Record<string, any>;
}

export interface ResponseCondition {
  field: string;
  operator: 'equals' | 'contains' | 'greater_than' | 'less_than';
  value: any;
}

export interface ChatBotAnalytics {
  totalConversations: number;
  resolvedQueries: number;
  escalatedToHuman: number;
  averageResponseTime: number;
  satisfactionScore: number;
  topQuestions: string[];
  improvementSuggestions: string[];
}

export interface InventoryAutomation {
  id: string;
  productId: string;
  rules: InventoryRule[];
  isActive: boolean;
  lastTriggered?: Date;
  analytics: InventoryAnalytics;
}

export interface InventoryRule {
  id: string;
  name: string;
  trigger: InventoryTrigger;
  action: InventoryAction;
  conditions: InventoryCondition[];
}

export interface InventoryTrigger {
  type: 'low_stock' | 'high_demand' | 'seasonal' | 'supplier_delay';
  threshold?: number;
  timeframe?: string;
}

export interface InventoryAction {
  type: 'reorder' | 'adjust_price' | 'notify_supplier' | 'create_promotion';
  parameters: {
    quantity?: number;
    priceAdjustment?: number;
    supplierId?: string;
    promotionType?: string;
  };
}

export interface InventoryCondition {
  field: 'stock_level' | 'demand_rate' | 'season' | 'supplier_status';
  operator: 'equals' | 'greater_than' | 'less_than' | 'between';
  value: any;
}

export interface InventoryAnalytics {
  stockouts: number;
  overstock: number;
  turnoverRate: number;
  costSavings: number;
  automationEfficiency: number;
}

export interface MarketingAutomation {
  id: string;
  name: string;
  type: 'email_campaign' | 'push_notification' | 'sms' | 'social_media';
  trigger: MarketingTrigger;
  content: MarketingContent;
  audience: AudienceSegment;
  schedule: AutomationSchedule;
  analytics: MarketingAnalytics;
  isActive: boolean;
}

export interface MarketingTrigger {
  type: 'user_action' | 'date_based' | 'behavior' | 'lifecycle_stage';
  event: string;
  conditions: MarketingCondition[];
}

export interface MarketingContent {
  subject?: string;
  message: string;
  images?: string[];
  cta: CallToAction;
  personalization: PersonalizationRule[];
}

export interface CallToAction {
  text: string;
  url: string;
  type: 'button' | 'link' | 'image';
}

export interface PersonalizationRule {
  field: string;
  placeholder: string;
  fallback: string;
}

export interface AudienceSegment {
  id: string;
  name: string;
  criteria: SegmentCriteria;
  size: number;
}

export interface SegmentCriteria {
  demographics?: DemographicCriteria;
  behavior?: BehaviorCriteria;
  purchase?: PurchaseCriteria;
  engagement?: EngagementCriteria;
}

export interface DemographicCriteria {
  age?: [number, number];
  gender?: string;
  location?: string[];
  language?: string;
}

export interface BehaviorCriteria {
  pageViews?: number;
  sessionDuration?: number;
  lastActivity?: Date;
  deviceType?: string;
}

export interface PurchaseCriteria {
  totalSpent?: [number, number];
  orderCount?: [number, number];
  lastPurchase?: Date;
  categories?: string[];
}

export interface EngagementCriteria {
  emailOpens?: number;
  clickRate?: number;
  socialShares?: number;
  reviewsWritten?: number;
}

export interface AutomationSchedule {
  type: 'immediate' | 'delayed' | 'recurring';
  delay?: number; // minutes
  frequency?: 'daily' | 'weekly' | 'monthly';
  startDate?: Date;
  endDate?: Date;
  timezone: string;
}

export interface MarketingAnalytics {
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  converted: number;
  revenue: number;
  roi: number;
  unsubscribed: number;
}

export interface MarketingCondition {
  field: string;
  operator: 'equals' | 'contains' | 'greater_than' | 'less_than' | 'in_last';
  value: any;
}