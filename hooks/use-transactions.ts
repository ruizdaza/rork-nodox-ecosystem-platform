import createContextHook from '@nkzw/create-context-hook';
import { useState, useCallback, useMemo } from 'react';
import { TransactionHistory, FinancialMetrics } from '@/types/marketplace';

const mockTransactions: TransactionHistory[] = [
  {
    id: '1',
    type: 'purchase',
    description: 'Compra de Corte de Cabello Clásico',
    amount: 25000,
    ncopAmount: 250,
    currency: 'MIXED',
    status: 'completed',
    orderId: 'ORD-001',
    productId: '1',
    productName: 'Corte de Cabello Clásico',
    sellerId: '1',
    sellerName: 'Salón Belleza Total',
    createdAt: '2024-01-20T10:30:00Z',
    completedAt: '2024-01-20T10:35:00Z',
  },
  {
    id: '2',
    type: 'sale',
    description: 'Venta de Shampoo Premium',
    amount: 35000,
    ncopAmount: 350,
    currency: 'COP',
    status: 'completed',
    orderId: 'ORD-002',
    productId: '2',
    productName: 'Shampoo Premium',
    buyerId: '3',
    buyerName: 'Laura Pérez',
    createdAt: '2024-01-18T14:15:00Z',
    completedAt: '2024-01-18T14:20:00Z',
  },
  {
    id: '3',
    type: 'commission',
    description: 'Comisión por venta en marketplace',
    amount: 3500,
    currency: 'COP',
    status: 'completed',
    orderId: 'ORD-002',
    createdAt: '2024-01-18T14:20:00Z',
    completedAt: '2024-01-18T14:20:00Z',
  },
  {
    id: '4',
    type: 'refund',
    description: 'Reembolso por cancelación',
    amount: 15000,
    currency: 'COP',
    status: 'completed',
    orderId: 'ORD-003',
    productName: 'Tratamiento Capilar',
    createdAt: '2024-01-15T16:45:00Z',
    completedAt: '2024-01-15T17:00:00Z',
  },
  {
    id: '5',
    type: 'withdrawal',
    description: 'Retiro a cuenta bancaria',
    amount: 100000,
    currency: 'COP',
    status: 'pending',
    createdAt: '2024-01-22T09:00:00Z',
  },
];

const mockFinancialMetrics: FinancialMetrics = {
  totalRevenue: 2450000,
  totalNcopRevenue: 24500,
  monthlyRevenue: 850000,
  monthlyNcopRevenue: 8500,
  totalTransactions: 156,
  averageOrderValue: 32500,
  topSellingProducts: [
    { id: '1', name: 'Corte de Cabello Clásico', sales: 45, revenue: 1125000 },
    { id: '2', name: 'Shampoo Premium', sales: 23, revenue: 805000 },
    { id: '3', name: 'Tratamiento Capilar', sales: 18, revenue: 540000 },
  ],
  topSellers: [
    { id: '1', name: 'Salón Belleza Total', sales: 89, revenue: 2890000 },
    { id: '2', name: 'Estética Moderna', sales: 67, revenue: 2010000 },
    { id: '3', name: 'Spa Relajante', sales: 45, revenue: 1350000 },
  ],
  revenueByCategory: [
    { category: 'Servicios de Belleza', revenue: 1470000, percentage: 60 },
    { category: 'Productos de Belleza', revenue: 735000, percentage: 30 },
    { category: 'Tratamientos', revenue: 245000, percentage: 10 },
  ],
  monthlyGrowth: [
    { month: 'Ene 2024', revenue: 850000, transactions: 45 },
    { month: 'Dic 2023', revenue: 720000, transactions: 38 },
    { month: 'Nov 2023', revenue: 680000, transactions: 35 },
    { month: 'Oct 2023', revenue: 590000, transactions: 32 },
    { month: 'Sep 2023', revenue: 520000, transactions: 28 },
    { month: 'Ago 2023', revenue: 480000, transactions: 25 },
  ],
};

export const [TransactionProvider, useTransactions] = createContextHook(() => {
  const [transactions, setTransactions] = useState<TransactionHistory[]>(mockTransactions);
  const [financialMetrics] = useState<FinancialMetrics>(mockFinancialMetrics);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const getTransactionsByType = useCallback((type: TransactionHistory['type']): TransactionHistory[] => {
    return transactions.filter(transaction => transaction.type === type)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [transactions]);

  const getTransactionsByStatus = useCallback((status: TransactionHistory['status']): TransactionHistory[] => {
    return transactions.filter(transaction => transaction.status === status)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [transactions]);

  const getTransactionsByDateRange = useCallback((startDate: string, endDate: string): TransactionHistory[] => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    return transactions.filter(transaction => {
      const transactionDate = new Date(transaction.createdAt);
      return transactionDate >= start && transactionDate <= end;
    }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [transactions]);

  const getUserTransactions = useCallback((userId: string): TransactionHistory[] => {
    return transactions.filter(transaction => 
      transaction.buyerId === userId || transaction.sellerId === userId
    ).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [transactions]);

  const getTransactionStats = useMemo(() => {
    const totalAmount = transactions.reduce((sum, t) => sum + t.amount, 0);
    const completedTransactions = transactions.filter(t => t.status === 'completed');
    const pendingTransactions = transactions.filter(t => t.status === 'pending');
    const failedTransactions = transactions.filter(t => t.status === 'failed');

    const revenueByType = transactions.reduce((acc, transaction) => {
      if (!acc[transaction.type]) {
        acc[transaction.type] = 0;
      }
      acc[transaction.type] += transaction.amount;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalAmount,
      totalTransactions: transactions.length,
      completedCount: completedTransactions.length,
      pendingCount: pendingTransactions.length,
      failedCount: failedTransactions.length,
      averageAmount: transactions.length > 0 ? totalAmount / transactions.length : 0,
      revenueByType,
    };
  }, [transactions]);

  const addTransaction = useCallback(async (transaction: Omit<TransactionHistory, 'id' | 'createdAt'>): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newTransaction: TransactionHistory = {
        ...transaction,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
      };
      
      setTransactions(prev => [newTransaction, ...prev]);
      console.log('Transaction added:', newTransaction);
      return true;
    } catch (error) {
      console.error('Error adding transaction:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateTransactionStatus = useCallback(async (
    transactionId: string, 
    status: TransactionHistory['status']
  ): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setTransactions(prev => prev.map(transaction => 
        transaction.id === transactionId 
          ? { 
              ...transaction, 
              status,
              completedAt: status === 'completed' ? new Date().toISOString() : transaction.completedAt
            }
          : transaction
      ));
      
      console.log('Transaction status updated:', transactionId, status);
      return true;
    } catch (error) {
      console.error('Error updating transaction status:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getMonthlyRevenue = useCallback((year: number, month: number): number => {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    
    return transactions
      .filter(transaction => {
        const transactionDate = new Date(transaction.createdAt);
        return transactionDate >= startDate && 
               transactionDate <= endDate && 
               transaction.status === 'completed' &&
               (transaction.type === 'sale' || transaction.type === 'commission');
      })
      .reduce((sum, transaction) => sum + transaction.amount, 0);
  }, [transactions]);

  const exportTransactions = useCallback((format: 'csv' | 'json' = 'csv'): string => {
    if (format === 'json') {
      return JSON.stringify(transactions, null, 2);
    }
    
    const headers = ['ID', 'Tipo', 'Descripción', 'Monto', 'Moneda', 'Estado', 'Fecha'];
    const csvContent = [
      headers.join(','),
      ...transactions.map(t => [
        t.id,
        t.type,
        `"${t.description}"`,
        t.amount,
        t.currency,
        t.status,
        new Date(t.createdAt).toLocaleDateString()
      ].join(','))
    ].join('\n');
    
    return csvContent;
  }, [transactions]);

  return {
    transactions,
    financialMetrics,
    isLoading,
    getTransactionsByType,
    getTransactionsByStatus,
    getTransactionsByDateRange,
    getUserTransactions,
    getTransactionStats,
    addTransaction,
    updateTransactionStatus,
    getMonthlyRevenue,
    exportTransactions,
  };
});