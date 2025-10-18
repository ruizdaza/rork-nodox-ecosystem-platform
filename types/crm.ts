export type Employee = {
  id: string;
  userId?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  position: string;
  department: string;
  hireDate: string;
  status: 'active' | 'inactive' | 'on_leave' | 'terminated';
  salary: number;
  currency: string;
  employmentType: 'full_time' | 'part_time' | 'contractor' | 'intern';
  schedule: {
    monday?: { start: string; end: string };
    tuesday?: { start: string; end: string };
    wednesday?: { start: string; end: string };
    thursday?: { start: string; end: string };
    friday?: { start: string; end: string };
    saturday?: { start: string; end: string };
    sunday?: { start: string; end: string };
  };
  permissions: string[];
  documents: {
    id: string;
    name: string;
    type: string;
    url: string;
    uploadDate: string;
  }[];
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
  notes: string;
  createdAt: string;
  updatedAt: string;
};

export type EmployeeEvaluation = {
  id: string;
  employeeId: string;
  evaluatorId: string;
  evaluatorName: string;
  period: string;
  date: string;
  categories: {
    name: string;
    score: number;
    maxScore: number;
    comments: string;
  }[];
  overallScore: number;
  strengths: string[];
  areasForImprovement: string[];
  goals: string[];
  comments: string;
  status: 'draft' | 'completed' | 'reviewed';
  createdAt: string;
};

export type PayrollRecord = {
  id: string;
  employeeId: string;
  employeeName: string;
  period: string;
  startDate: string;
  endDate: string;
  baseSalary: number;
  bonuses: { description: string; amount: number }[];
  deductions: { description: string; amount: number }[];
  overtime: { hours: number; rate: number; amount: number };
  totalEarnings: number;
  totalDeductions: number;
  netPay: number;
  currency: string;
  status: 'pending' | 'approved' | 'paid';
  paymentDate?: string;
  paymentMethod: string;
  notes: string;
  createdAt: string;
};

export type TimeEntry = {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string;
  clockIn: string;
  clockOut?: string;
  breakDuration: number;
  totalHours?: number;
  status: 'active' | 'completed' | 'approved';
  notes: string;
  location?: { lat: number; lng: number };
};

export type Department = {
  id: string;
  name: string;
  description: string;
  managerId?: string;
  managerName?: string;
  employeeCount: number;
  budget: number;
  currency: string;
  createdAt: string;
};

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