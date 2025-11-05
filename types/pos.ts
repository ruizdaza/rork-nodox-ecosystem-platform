export interface POSTransaction {
  id: string;
  transactionNumber: string;
  date: string;
  items: POSTransactionItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  paymentMethod: 'cash' | 'card' | 'ncop' | 'transfer' | 'mixed';
  payments: POSPayment[];
  customerId?: string;
  customerName?: string;
  sellerId: string;
  sellerName: string;
  status: 'pending' | 'completed' | 'cancelled' | 'refunded';
  notes?: string;
  refundedTransactionId?: string;
  refundReason?: string;
  createdAt: string;
  completedAt?: string;
  cancelledAt?: string;
  refundedAt?: string;
}

export interface POSTransactionItem {
  id: string;
  productId: string;
  productName: string;
  sku?: string;
  isService: boolean;
  quantity: number;
  unitPrice: number;
  discount: number;
  subtotal: number;
  tax: number;
  total: number;
}

export interface POSPayment {
  id: string;
  method: 'cash' | 'card' | 'ncop' | 'transfer';
  amount: number;
  amountReceived?: number;
  change?: number;
  reference?: string;
  cardLast4?: string;
  cardBrand?: string;
  transactionId?: string;
  status: 'pending' | 'completed' | 'failed';
  createdAt: string;
}

export interface POSSessionSummary {
  sessionId: string;
  sellerId: string;
  sellerName: string;
  startDate: string;
  endDate?: string;
  status: 'open' | 'closed';
  transactions: number;
  totalSales: number;
  totalCash: number;
  totalCard: number;
  totalNcop: number;
  totalTransfer: number;
  totalRefunds: number;
  openingCash: number;
  closingCash: number;
  expectedCash: number;
  cashDifference: number;
  notes?: string;
  createdAt: string;
  closedAt?: string;
}

export interface POSProduct {
  id: string;
  name: string;
  sku?: string;
  barcode?: string;
  category: string;
  price: number;
  ncopPrice?: number;
  cost?: number;
  isService: boolean;
  stockQuantity?: number;
  minStock?: number;
  taxRate: number;
  isActive: boolean;
  imageUrl?: string;
  description?: string;
}

export interface POSStats {
  todaySales: number;
  todayTransactions: number;
  averageTicket: number;
  topSellingProducts: Array<{
    productId: string;
    productName: string;
    quantity: number;
    revenue: number;
  }>;
  paymentMethodsBreakdown: {
    cash: number;
    card: number;
    ncop: number;
    transfer: number;
  };
  hourlySales: Array<{
    hour: string;
    sales: number;
    transactions: number;
  }>;
}

export interface POSCartItem {
  productId: string;
  productName: string;
  sku?: string;
  isService: boolean;
  quantity: number;
  unitPrice: number;
  discount: number;
  subtotal: number;
  tax: number;
  total: number;
  stockQuantity?: number;
}

export interface POSReceipt {
  transactionId: string;
  transactionNumber: string;
  businessName: string;
  businessAddress?: string;
  businessPhone?: string;
  businessTaxId?: string;
  date: string;
  sellerName: string;
  customerName?: string;
  items: POSTransactionItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  paymentMethod: string;
  amountReceived: number;
  change: number;
  qrCode?: string;
}
