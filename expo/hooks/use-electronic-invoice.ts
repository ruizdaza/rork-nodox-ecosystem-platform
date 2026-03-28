import { useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ElectronicInvoice,
  InvoiceTemplate,
  InvoiceSequence,
  TaxReceipt,
  FiscalReport,
  FiscalSettings,
  InvoiceStats,
} from '@/types/electronic-invoice';

const STORAGE_KEY = 'electronic_invoice_data';

export const [ElectronicInvoiceProvider, useElectronicInvoice] = createContextHook(() => {
  const [selectedPeriod, setSelectedPeriod] = useState<'daily' | 'monthly' | 'yearly'>('monthly');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const queryClient = useQueryClient();

  const invoicesQuery = useQuery({
    queryKey: ['electronicInvoices'],
    queryFn: async (): Promise<ElectronicInvoice[]> => {
      const stored = await AsyncStorage.getItem(`${STORAGE_KEY}_invoices`);
      if (stored) {
        return JSON.parse(stored);
      }
      return generateMockInvoices();
    },
  });

  const templatesQuery = useQuery({
    queryKey: ['invoiceTemplates'],
    queryFn: async (): Promise<InvoiceTemplate[]> => {
      const stored = await AsyncStorage.getItem(`${STORAGE_KEY}_templates`);
      if (stored) {
        return JSON.parse(stored);
      }
      return generateMockTemplates();
    },
  });

  const sequencesQuery = useQuery({
    queryKey: ['invoiceSequences'],
    queryFn: async (): Promise<InvoiceSequence[]> => {
      const stored = await AsyncStorage.getItem(`${STORAGE_KEY}_sequences`);
      if (stored) {
        return JSON.parse(stored);
      }
      return generateMockSequences();
    },
  });

  const receiptsQuery = useQuery({
    queryKey: ['taxReceipts'],
    queryFn: async (): Promise<TaxReceipt[]> => {
      const stored = await AsyncStorage.getItem(`${STORAGE_KEY}_receipts`);
      if (stored) {
        return JSON.parse(stored);
      }
      return [];
    },
  });

  const settingsQuery = useQuery({
    queryKey: ['fiscalSettings'],
    queryFn: async (): Promise<FiscalSettings | null> => {
      const stored = await AsyncStorage.getItem(`${STORAGE_KEY}_settings`);
      if (stored) {
        return JSON.parse(stored);
      }
      return null;
    },
  });

  const statsQuery = useQuery({
    queryKey: ['invoiceStats', selectedPeriod],
    queryFn: async (): Promise<InvoiceStats> => {
      const invoices = invoicesQuery.data || [];
      return calculateStats(invoices);
    },
    enabled: !!invoicesQuery.data,
  });

  const createInvoiceMutation = useMutation({
    mutationFn: async (invoiceData: Partial<ElectronicInvoice>) => {
      const sequences = sequencesQuery.data || [];
      const activeSequence = sequences.find(s => s.isActive);
      
      if (!activeSequence) {
        throw new Error('No active invoice sequence found');
      }

      const newInvoice: ElectronicInvoice = {
        id: Date.now().toString(),
        invoiceNumber: `${activeSequence.prefix}${String(activeSequence.currentNumber).padStart(8, '0')}`,
        fiscalNumber: `${activeSequence.prefix}${activeSequence.currentNumber}`,
        series: activeSequence.series,
        invoiceType: invoiceData.invoiceType || 'sale',
        status: 'draft',
        customer: invoiceData.customer!,
        supplier: invoiceData.supplier!,
        items: invoiceData.items || [],
        subtotal: invoiceData.subtotal || 0,
        taxTotal: invoiceData.taxTotal || 0,
        discountTotal: invoiceData.discountTotal || 0,
        total: invoiceData.total || 0,
        currency: 'USD',
        exchangeRate: 1,
        paymentMethod: invoiceData.paymentMethod || 'cash',
        paymentTerms: invoiceData.paymentTerms || 'immediate',
        dueDate: invoiceData.dueDate || new Date().toISOString(),
        notes: invoiceData.notes || '',
        fiscalAuthority: {
          name: 'Tax Authority',
          endpoint: 'https://api.tax-authority.com',
          authorization: 'Bearer token',
        },
        validations: [],
        createdBy: 'current_user',
        createdByName: 'Current User',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const currentInvoices = invoicesQuery.data || [];
      const updated = [newInvoice, ...currentInvoices];
      await AsyncStorage.setItem(`${STORAGE_KEY}_invoices`, JSON.stringify(updated));

      const updatedSequences = sequences.map(s =>
        s.id === activeSequence.id ? { ...s, currentNumber: s.currentNumber + 1 } : s
      );
      await AsyncStorage.setItem(`${STORAGE_KEY}_sequences`, JSON.stringify(updatedSequences));

      return newInvoice;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['electronicInvoices'] });
      queryClient.invalidateQueries({ queryKey: ['invoiceSequences'] });
      queryClient.invalidateQueries({ queryKey: ['invoiceStats'] });
    },
  });

  const sendInvoiceMutation = useMutation({
    mutationFn: async (invoiceId: string) => {
      const currentInvoices = invoicesQuery.data || [];
      const invoice = currentInvoices.find(i => i.id === invoiceId);
      
      if (!invoice) throw new Error('Invoice not found');
      if (invoice.status !== 'draft' && invoice.status !== 'pending') {
        throw new Error('Invoice cannot be sent in current status');
      }

      await new Promise(resolve => setTimeout(resolve, 2000));

      const updatedInvoice = {
        ...invoice,
        status: 'sent' as const,
        sentAt: new Date().toISOString(),
        cae: `CAE-${Date.now()}`,
        caeExpirationDate: new Date(Date.now() + 86400000 * 10).toISOString(),
        qrCode: `QR-${Date.now()}`,
      };

      const updated = currentInvoices.map(i => i.id === invoiceId ? updatedInvoice : i);
      await AsyncStorage.setItem(`${STORAGE_KEY}_invoices`, JSON.stringify(updated));

      return updatedInvoice;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['electronicInvoices'] });
    },
  });

  const cancelInvoiceMutation = useMutation({
    mutationFn: async (params: { invoiceId: string; reason: string }) => {
      const currentInvoices = invoicesQuery.data || [];
      const updated = currentInvoices.map(i =>
        i.id === params.invoiceId
          ? { ...i, status: 'cancelled' as const, rejectionReason: params.reason }
          : i
      );
      await AsyncStorage.setItem(`${STORAGE_KEY}_invoices`, JSON.stringify(updated));
      return params.invoiceId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['electronicInvoices'] });
    },
  });

  const generateReceiptMutation = useMutation({
    mutationFn: async (params: { invoiceId: string; paymentAmount: number; paymentMethod: string }) => {
      const invoice = invoicesQuery.data?.find(i => i.id === params.invoiceId);
      if (!invoice) throw new Error('Invoice not found');

      const receipt: TaxReceipt = {
        id: Date.now().toString(),
        invoiceId: params.invoiceId,
        receiptNumber: `REC-${Date.now()}`,
        paymentAmount: params.paymentAmount,
        paymentDate: new Date().toISOString(),
        paymentMethod: params.paymentMethod,
        customerName: invoice.customer.name,
        customerTaxId: invoice.customer.taxId,
        issuedBy: 'current_user',
        issuedByName: 'Current User',
        qrCode: `QR-REC-${Date.now()}`,
        status: 'active',
        createdAt: new Date().toISOString(),
      };

      const currentReceipts = receiptsQuery.data || [];
      const updated = [receipt, ...currentReceipts];
      await AsyncStorage.setItem(`${STORAGE_KEY}_receipts`, JSON.stringify(updated));

      return receipt;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['taxReceipts'] });
    },
  });

  const generateFiscalReportMutation = useMutation({
    mutationFn: async (params: { reportType: string; period: string; periodType: string }) => {
      const invoices = invoicesQuery.data || [];
      
      const report: FiscalReport = {
        id: Date.now().toString(),
        reportType: params.reportType as any,
        period: params.period,
        periodType: params.periodType as any,
        data: {
          totalInvoices: invoices.length,
          totalAmount: invoices.reduce((sum, i) => sum + i.total, 0),
          totalTax: invoices.reduce((sum, i) => sum + i.taxTotal, 0),
          invoicesByType: [],
          taxBreakdown: [],
          paymentMethods: [],
        },
        generatedAt: new Date().toISOString(),
        generatedBy: 'current_user',
        generatedByName: 'Current User',
      };

      return report;
    },
  });

  const updateSettingsMutation = useMutation({
    mutationFn: async (settings: Partial<FiscalSettings>) => {
      const current = settingsQuery.data || {} as FiscalSettings;
      const updated = { ...current, ...settings };
      await AsyncStorage.setItem(`${STORAGE_KEY}_settings`, JSON.stringify(updated));
      return updated;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fiscalSettings'] });
    },
  });

  const filteredInvoices = (invoicesQuery.data || []).filter(invoice =>
    filterStatus === 'all' ? true : invoice.status === filterStatus
  );

  return {
    invoices: invoicesQuery.data || [],
    filteredInvoices,
    templates: templatesQuery.data || [],
    sequences: sequencesQuery.data || [],
    receipts: receiptsQuery.data || [],
    settings: settingsQuery.data,
    stats: statsQuery.data,
    
    selectedPeriod,
    filterStatus,
    
    isLoadingInvoices: invoicesQuery.isLoading,
    isLoadingTemplates: templatesQuery.isLoading,
    isLoadingStats: statsQuery.isLoading,
    
    setSelectedPeriod,
    setFilterStatus,
    
    createInvoice: createInvoiceMutation.mutate,
    sendInvoice: sendInvoiceMutation.mutate,
    cancelInvoice: cancelInvoiceMutation.mutate,
    generateReceipt: generateReceiptMutation.mutate,
    generateFiscalReport: generateFiscalReportMutation.mutate,
    updateSettings: updateSettingsMutation.mutate,
    
    isCreating: createInvoiceMutation.isPending,
    isSending: sendInvoiceMutation.isPending,
    isCancelling: cancelInvoiceMutation.isPending,
  };
});

function generateMockInvoices(): ElectronicInvoice[] {
  return Array.from({ length: 10 }, (_, i) => ({
    id: (i + 1).toString(),
    invoiceNumber: `FC-A-${String(1000 + i).padStart(8, '0')}`,
    fiscalNumber: `FC-A-${1000 + i}`,
    series: 'A',
    invoiceType: 'sale' as const,
    status: ['sent', 'accepted', 'pending', 'draft'][Math.floor(Math.random() * 4)] as any,
    customer: {
      id: `customer-${i}`,
      taxId: `20-${30000000 + i}-3`,
      name: `Cliente ${i + 1}`,
      email: `cliente${i + 1}@example.com`,
      phone: `+1234567890`,
      address: {
        street: 'Main St',
        number: `${100 + i}`,
        city: 'Buenos Aires',
        state: 'CABA',
        postalCode: '1000',
        country: 'Argentina',
      },
      taxCategory: 'responsible',
    },
    supplier: {
      id: 'supplier-1',
      taxId: '20-12345678-9',
      businessName: 'Mi Negocio SRL',
      tradeName: 'Mi Negocio',
      email: 'facturacion@minegocio.com',
      phone: '+5491112345678',
      address: {
        street: 'Commerce Ave',
        number: '500',
        city: 'Buenos Aires',
        state: 'CABA',
        postalCode: '1000',
        country: 'Argentina',
      },
      taxCategory: 'responsible',
      activityCode: '620100',
    },
    items: [
      {
        id: '1',
        description: `Producto ${i + 1}`,
        quantity: Math.floor(Math.random() * 5) + 1,
        unit: 'unit',
        unitPrice: Math.floor(Math.random() * 10000) + 1000,
        discount: 0,
        discountType: 'percentage',
        taxRate: 21,
        taxAmount: 0,
        subtotal: 0,
        total: 0,
        notes: '',
      },
    ],
    subtotal: Math.floor(Math.random() * 100000) + 10000,
    taxTotal: 0,
    discountTotal: 0,
    total: 0,
    currency: 'ARS',
    exchangeRate: 1,
    paymentMethod: 'card',
    paymentTerms: 'immediate',
    dueDate: new Date(Date.now() + 86400000 * 30).toISOString(),
    notes: '',
    fiscalAuthority: {
      name: 'AFIP',
      endpoint: 'https://wswhomo.afip.gov.ar',
      authorization: 'Bearer token',
    },
    validations: [],
    createdBy: 'user-1',
    createdByName: 'User One',
    createdAt: new Date(Date.now() - 86400000 * i).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * i).toISOString(),
  }));
}

function generateMockTemplates(): InvoiceTemplate[] {
  return [
    {
      id: '1',
      name: 'Factura Standard',
      type: 'sale',
      series: 'A',
      layout: 'standard',
      headerTemplate: 'Header template',
      itemsTemplate: 'Items template',
      footerTemplate: 'Footer template',
      includeQR: true,
      includeBarcode: true,
      includePaymentInstructions: true,
      customFields: [],
      isDefault: true,
      createdAt: new Date().toISOString(),
    },
  ];
}

function generateMockSequences(): InvoiceSequence[] {
  return [
    {
      id: '1',
      series: 'A',
      prefix: 'FC-A-',
      currentNumber: 1000,
      startNumber: 1000,
      format: 'FC-A-00001000',
      fiscalYear: '2025',
      isActive: true,
      createdAt: new Date().toISOString(),
    },
  ];
}

function calculateStats(invoices: ElectronicInvoice[]): InvoiceStats {
  const totalIssued = invoices.length;
  const totalAmount = invoices.reduce((sum, i) => sum + i.total, 0);
  const sentInvoices = invoices.filter(i => i.status === 'sent' || i.status === 'accepted');
  const totalPaid = sentInvoices.filter(i => i.status === 'accepted').length;
  const totalPending = sentInvoices.length - totalPaid;

  return {
    totalIssued,
    totalAmount,
    totalPending,
    totalPaid,
    totalOverdue: 0,
    averageTicket: totalIssued > 0 ? totalAmount / totalIssued : 0,
    topCustomers: [],
    recentActivity: [],
  };
}
