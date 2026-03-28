export interface ElectronicInvoice {
  id: string;
  invoiceNumber: string;
  fiscalNumber: string;
  series: string;
  invoiceType: 'sale' | 'purchase' | 'credit_note' | 'debit_note';
  status: 'draft' | 'pending' | 'sent' | 'accepted' | 'rejected' | 'cancelled';
  customer: InvoiceCustomer;
  supplier: InvoiceSupplier;
  items: InvoiceItem[];
  subtotal: number;
  taxTotal: number;
  discountTotal: number;
  total: number;
  currency: string;
  exchangeRate: number;
  paymentMethod: 'cash' | 'card' | 'transfer' | 'check' | 'ncop';
  paymentTerms: string;
  dueDate: string;
  notes: string;
  xmlContent?: string;
  xmlSignature?: string;
  qrCode?: string;
  cae?: string;
  caeExpirationDate?: string;
  fiscalAuthority: FiscalAuthority;
  validations: InvoiceValidation[];
  sentAt?: string;
  acceptedAt?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  createdBy: string;
  createdByName: string;
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceCustomer {
  id: string;
  taxId: string;
  name: string;
  email: string;
  phone: string;
  address: InvoiceAddress;
  taxCategory: 'responsible' | 'exempt' | 'final_consumer' | 'monotax';
}

export interface InvoiceSupplier {
  id: string;
  taxId: string;
  businessName: string;
  tradeName: string;
  email: string;
  phone: string;
  address: InvoiceAddress;
  taxCategory: string;
  activityCode: string;
}

export interface InvoiceAddress {
  street: string;
  number: string;
  floor?: string;
  apartment?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface InvoiceItem {
  id: string;
  productId?: string;
  sku?: string;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  discount: number;
  discountType: 'percentage' | 'fixed';
  taxRate: number;
  taxAmount: number;
  subtotal: number;
  total: number;
  notes: string;
}

export interface FiscalAuthority {
  name: string;
  endpoint: string;
  authorization: string;
  lastResponseCode?: string;
  lastResponseMessage?: string;
  lastResponseAt?: string;
}

export interface InvoiceValidation {
  field: string;
  rule: string;
  status: 'passed' | 'failed' | 'warning';
  message: string;
  timestamp: string;
}

export interface InvoiceTemplate {
  id: string;
  name: string;
  type: 'sale' | 'purchase';
  series: string;
  layout: 'standard' | 'detailed' | 'simplified' | 'custom';
  headerTemplate: string;
  itemsTemplate: string;
  footerTemplate: string;
  includeQR: boolean;
  includeBarcode: boolean;
  includePaymentInstructions: boolean;
  customFields: CustomField[];
  isDefault: boolean;
  createdAt: string;
}

export interface CustomField {
  name: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'boolean' | 'select';
  options?: string[];
  isRequired: boolean;
  position: 'header' | 'items' | 'footer';
}

export interface InvoiceSequence {
  id: string;
  series: string;
  prefix: string;
  currentNumber: number;
  startNumber: number;
  endNumber?: number;
  format: string;
  fiscalYear: string;
  isActive: boolean;
  createdAt: string;
}

export interface TaxReceipt {
  id: string;
  invoiceId: string;
  receiptNumber: string;
  paymentAmount: number;
  paymentDate: string;
  paymentMethod: string;
  customerName: string;
  customerTaxId: string;
  issuedBy: string;
  issuedByName: string;
  qrCode?: string;
  status: 'active' | 'voided';
  createdAt: string;
}

export interface FiscalReport {
  id: string;
  reportType: 'sales' | 'purchases' | 'vat' | 'withholdings' | 'perceptions';
  period: string;
  periodType: 'daily' | 'monthly' | 'quarterly' | 'yearly';
  data: FiscalReportData;
  generatedAt: string;
  generatedBy: string;
  generatedByName: string;
  fileUrl?: string;
}

export interface FiscalReportData {
  totalInvoices: number;
  totalAmount: number;
  totalTax: number;
  invoicesByType: {
    type: string;
    count: number;
    amount: number;
  }[];
  taxBreakdown: {
    taxRate: number;
    taxableBase: number;
    taxAmount: number;
  }[];
  paymentMethods: {
    method: string;
    amount: number;
    percentage: number;
  }[];
}

export interface FiscalSettings {
  businessTaxId: string;
  businessName: string;
  fiscalCategory: string;
  activityCode: string;
  startDate: string;
  autoNumbering: boolean;
  defaultSeries: string;
  invoicePrefix: string;
  fiscalAuthority: {
    enabled: boolean;
    apiUrl: string;
    apiKey: string;
    environment: 'production' | 'sandbox';
  };
  taxRates: {
    name: string;
    rate: number;
    isDefault: boolean;
  }[];
  paymentTermsDefault: string;
  emailSettings: {
    autoSendInvoice: boolean;
    emailTemplate: string;
    ccEmail?: string;
  };
}

export interface InvoiceStats {
  totalIssued: number;
  totalAmount: number;
  totalPending: number;
  totalPaid: number;
  totalOverdue: number;
  averageTicket: number;
  topCustomers: {
    customerId: string;
    customerName: string;
    totalInvoiced: number;
    invoiceCount: number;
  }[];
  recentActivity: {
    date: string;
    count: number;
    amount: number;
  }[];
}
