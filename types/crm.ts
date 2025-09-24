export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  joinDate: string;
  lastVisit?: string;
  totalSpent: number;
  totalOrders: number;
  averageOrderValue: number;
  preferredServices: string[];
  notes: string;
  status: 'active' | 'inactive' | 'vip';
  birthDate?: string;
  address?: string;
  loyaltyPoints: number;
  tags: string[];
}

export interface CustomerInteraction {
  id: string;
  customerId: string;
  type: 'call' | 'email' | 'visit' | 'message' | 'appointment';
  date: string;
  description: string;
  outcome?: string;
  followUpDate?: string;
  createdBy: string;
}

export interface CustomerSegment {
  id: string;
  name: string;
  description: string;
  criteria: {
    totalSpent?: { min?: number; max?: number };
    lastVisit?: { days: number };
    orderCount?: { min?: number; max?: number };
    services?: string[];
    tags?: string[];
  };
  customerCount: number;
}

export interface CRMStats {
  totalCustomers: number;
  activeCustomers: number;
  newCustomersThisMonth: number;
  customerRetentionRate: number;
  averageCustomerLifetime: number;
  topCustomers: Customer[];
  recentInteractions: CustomerInteraction[];
}

export interface Promotion {
  id: string;
  title: string;
  description: string;
  type: 'discount' | 'bogo' | 'free_service' | 'loyalty_points';
  value: number; // percentage for discount, points for loyalty
  minPurchase?: number;
  validFrom: string;
  validUntil: string;
  isActive: boolean;
  targetSegments: string[];
  usageLimit?: number;
  usedCount: number;
  code?: string;
  applicableServices: string[];
  createdBy: string;
  createdAt: string;
}

export interface PromotionUsage {
  id: string;
  promotionId: string;
  customerId: string;
  usedAt: string;
  orderValue: number;
  discountApplied: number;
}

export interface SupportTicket {
  id: string;
  customerId?: string;
  customerName: string;
  customerEmail: string;
  subject: string;
  description: string;
  category: 'technical' | 'billing' | 'general' | 'complaint' | 'feature_request';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'waiting_customer' | 'resolved' | 'closed';
  assignedTo?: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  messages: SupportMessage[];
  tags: string[];
}

export interface SupportMessage {
  id: string;
  ticketId: string;
  senderId: string;
  senderName: string;
  senderType: 'customer' | 'support' | 'system';
  message: string;
  attachments?: string[];
  createdAt: string;
  isInternal: boolean;
}

export interface SupportStats {
  totalTickets: number;
  openTickets: number;
  averageResponseTime: number; // in hours
  averageResolutionTime: number; // in hours
  customerSatisfactionScore: number;
  ticketsByCategory: { category: string; count: number }[];
  ticketsByPriority: { priority: string; count: number }[];
  recentTickets: SupportTicket[];
}