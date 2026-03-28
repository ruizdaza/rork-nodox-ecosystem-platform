import { useState, useEffect } from 'react';
import {
  WalletUser,
  WalletTransaction,
  WalletBalance,
  WalletLimits,
  WalletAlert,
  WalletStats,
  WalletAuditLog,
  WalletAdminAction,
  WalletComplianceReport,
  WalletExchangeRate,
  WalletFeeStructure
} from '@/types/wallet-admin';

export function useWalletAdmin() {
  const [users, setUsers] = useState<WalletUser[]>([]);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [alerts, setAlerts] = useState<WalletAlert[]>([]);
  const [stats, setStats] = useState<WalletStats | null>(null);
  const [auditLogs, setAuditLogs] = useState<WalletAuditLog[]>([]);
  const [exchangeRates, setExchangeRates] = useState<WalletExchangeRate[]>([]);
  const [feeStructures, setFeeStructures] = useState<WalletFeeStructure[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Mock data initialization
  useEffect(() => {
    initializeMockData();
  }, []);

  const initializeMockData = () => {
    // Mock users
    const mockUsers: WalletUser[] = [
      {
        id: '1',
        name: 'Juan Pérez',
        email: 'juan@example.com',
        phone: '+57 300 123 4567',
        balance: 1250000,
        currency: 'COP',
        status: 'active',
        kycStatus: 'approved',
        createdAt: '2024-01-15T10:00:00Z',
        lastActivity: '2024-12-28T15:30:00Z',
        totalTransactions: 45,
        totalVolume: 5600000,
        riskScore: 2,
        tier: 'premium'
      },
      {
        id: '2',
        name: 'María González',
        email: 'maria@example.com',
        phone: '+57 301 987 6543',
        balance: 850000,
        currency: 'COP',
        status: 'active',
        kycStatus: 'pending',
        createdAt: '2024-02-20T14:00:00Z',
        lastActivity: '2024-12-27T09:15:00Z',
        totalTransactions: 23,
        totalVolume: 2300000,
        riskScore: 1,
        tier: 'basic'
      },
      {
        id: '3',
        name: 'Carlos Rodríguez',
        email: 'carlos@example.com',
        phone: '+57 302 456 7890',
        balance: 2100000,
        currency: 'COP',
        status: 'suspended',
        kycStatus: 'approved',
        createdAt: '2024-01-10T08:00:00Z',
        lastActivity: '2024-12-26T18:45:00Z',
        totalTransactions: 78,
        totalVolume: 12400000,
        riskScore: 7,
        tier: 'vip'
      }
    ];

    // Mock transactions
    const mockTransactions: WalletTransaction[] = [
      {
        id: 'tx1',
        userId: '1',
        userName: 'Juan Pérez',
        type: 'deposit',
        amount: 500000,
        currency: 'COP',
        status: 'completed',
        description: 'Depósito desde cuenta bancaria',
        timestamp: '2024-12-28T10:00:00Z',
        fee: 5000,
        flagged: false,
        riskLevel: 'low'
      },
      {
        id: 'tx2',
        userId: '2',
        userName: 'María González',
        type: 'withdrawal',
        amount: 200000,
        currency: 'COP',
        status: 'pending',
        description: 'Retiro a cuenta bancaria',
        timestamp: '2024-12-28T11:30:00Z',
        fee: 8000,
        flagged: false,
        riskLevel: 'low'
      },
      {
        id: 'tx3',
        userId: '3',
        userName: 'Carlos Rodríguez',
        type: 'transfer',
        amount: 1000000,
        currency: 'COP',
        status: 'failed',
        description: 'Transferencia sospechosa',
        timestamp: '2024-12-28T12:15:00Z',
        fee: 10000,
        flagged: true,
        riskLevel: 'high'
      }
    ];

    // Mock alerts
    const mockAlerts: WalletAlert[] = [
      {
        id: 'alert1',
        type: 'suspicious_activity',
        severity: 'high',
        userId: '3',
        userName: 'Carlos Rodríguez',
        message: 'Múltiples transacciones de alto valor en corto período',
        details: { transactionCount: 5, totalAmount: 5000000, timeWindow: '2 horas' },
        timestamp: '2024-12-28T12:00:00Z',
        status: 'investigating'
      },
      {
        id: 'alert2',
        type: 'kyc_expiry',
        severity: 'medium',
        userId: '2',
        userName: 'María González',
        message: 'Documentos KYC pendientes de verificación',
        details: { daysOverdue: 15 },
        timestamp: '2024-12-27T09:00:00Z',
        status: 'new'
      }
    ];

    // Mock stats
    const mockStats: WalletStats = {
      totalUsers: 1250,
      activeUsers: 980,
      totalBalance: 45600000000,
      totalTransactions: 12450,
      dailyVolume: 2300000000,
      monthlyVolume: 68900000000,
      pendingTransactions: 23,
      failedTransactions: 8,
      suspiciousActivities: 3,
      kycPending: 45,
      currencyDistribution: { COP: 85, USD: 12, EUR: 3 },
      transactionsByType: { deposit: 35, withdrawal: 25, transfer: 30, payment: 10 },
      usersByTier: { basic: 60, premium: 30, vip: 10 }
    };

    // Mock exchange rates
    const mockExchangeRates: WalletExchangeRate[] = [
      { from: 'USD', to: 'COP', rate: 4200, lastUpdated: '2024-12-28T15:00:00Z', source: 'Central Bank' },
      { from: 'EUR', to: 'COP', rate: 4600, lastUpdated: '2024-12-28T15:00:00Z', source: 'Central Bank' },
      { from: 'BTC', to: 'COP', rate: 420000000, lastUpdated: '2024-12-28T15:00:00Z', source: 'Crypto Exchange' }
    ];

    // Mock fee structures
    const mockFeeStructures: WalletFeeStructure[] = [
      {
        id: 'fee1',
        type: 'withdrawal',
        currency: 'COP',
        feeType: 'percentage',
        value: 0.5,
        minFee: 5000,
        maxFee: 50000,
        active: true
      },
      {
        id: 'fee2',
        type: 'deposit',
        currency: 'COP',
        feeType: 'fixed',
        value: 3000,
        active: true
      }
    ];

    setUsers(mockUsers);
    setTransactions(mockTransactions);
    setAlerts(mockAlerts);
    setStats(mockStats);
    setExchangeRates(mockExchangeRates);
    setFeeStructures(mockFeeStructures);
  };

  const executeAdminAction = async (action: WalletAdminAction): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Update local state based on action
      switch (action.type) {
        case 'freeze_account':
          setUsers(prev => prev.map(user => 
            user.id === action.userId 
              ? { ...user, status: 'frozen' as const }
              : user
          ));
          break;
        
        case 'unfreeze_account':
          setUsers(prev => prev.map(user => 
            user.id === action.userId 
              ? { ...user, status: 'active' as const }
              : user
          ));
          break;

        case 'adjust_balance':
          setUsers(prev => prev.map(user => 
            user.id === action.userId 
              ? { ...user, balance: user.balance + (action.amount || 0) }
              : user
          ));
          break;

        case 'approve_kyc':
          setUsers(prev => prev.map(user => 
            user.id === action.userId 
              ? { ...user, kycStatus: 'approved' as const }
              : user
          ));
          break;

        case 'reject_kyc':
          setUsers(prev => prev.map(user => 
            user.id === action.userId 
              ? { ...user, kycStatus: 'rejected' as const }
              : user
          ));
          break;
      }

      // Add audit log
      const auditLog: WalletAuditLog = {
        id: `audit_${Date.now()}`,
        adminId: 'admin1',
        adminName: 'Admin User',
        action: action.type,
        targetUserId: action.userId,
        targetUserName: users.find(u => u.id === action.userId)?.name,
        details: action,
        timestamp: new Date().toISOString(),
        ipAddress: '192.168.1.1',
        userAgent: 'Admin Panel'
      };

      setAuditLogs(prev => [auditLog, ...prev]);

      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error ejecutando acción');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const getUserBalance = (userId: string): WalletBalance | null => {
    const user = users.find(u => u.id === userId);
    if (!user) return null;

    return {
      userId,
      currency: user.currency,
      available: user.balance * 0.9,
      pending: user.balance * 0.05,
      frozen: user.balance * 0.05,
      total: user.balance,
      lastUpdated: new Date().toISOString()
    };
  };

  const getUserLimits = (userId: string): WalletLimits | null => {
    const user = users.find(u => u.id === userId);
    if (!user) return null;

    const baseLimits = {
      basic: { daily: 1000000, monthly: 10000000, transaction: 500000 },
      premium: { daily: 5000000, monthly: 50000000, transaction: 2000000 },
      vip: { daily: 20000000, monthly: 200000000, transaction: 10000000 }
    };

    const limits = baseLimits[user.tier];

    return {
      userId,
      dailyWithdrawal: limits.daily,
      monthlyWithdrawal: limits.monthly,
      dailyDeposit: limits.daily * 2,
      monthlyDeposit: limits.monthly * 2,
      transactionLimit: limits.transaction
    };
  };

  const generateComplianceReport = async (type: WalletComplianceReport['type']): Promise<string> => {
    setLoading(true);
    
    try {
      // Simulate report generation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const reportId = `report_${Date.now()}`;
      return reportId;
    } finally {
      setLoading(false);
    }
  };

  const updateFeeStructure = (feeId: string, updates: Partial<WalletFeeStructure>) => {
    setFeeStructures(prev => prev.map(fee => 
      fee.id === feeId ? { ...fee, ...updates } : fee
    ));
  };

  const resolveAlert = (alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, status: 'resolved' as const } : alert
    ));
  };

  const dismissAlert = (alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, status: 'dismissed' as const } : alert
    ));
  };

  const searchUsers = (query: string): WalletUser[] => {
    if (!query.trim()) return users;
    
    const lowercaseQuery = query.toLowerCase();
    return users.filter(user => 
      user.name.toLowerCase().includes(lowercaseQuery) ||
      user.email.toLowerCase().includes(lowercaseQuery) ||
      user.phone.includes(query) ||
      user.id.includes(query)
    );
  };

  const searchTransactions = (query: string): WalletTransaction[] => {
    if (!query.trim()) return transactions;
    
    const lowercaseQuery = query.toLowerCase();
    return transactions.filter(tx => 
      tx.id.toLowerCase().includes(lowercaseQuery) ||
      tx.userName.toLowerCase().includes(lowercaseQuery) ||
      tx.description.toLowerCase().includes(lowercaseQuery) ||
      tx.txHash?.toLowerCase().includes(lowercaseQuery)
    );
  };

  return {
    // Data
    users,
    transactions,
    alerts,
    stats,
    auditLogs,
    exchangeRates,
    feeStructures,
    loading,
    error,

    // Actions
    executeAdminAction,
    getUserBalance,
    getUserLimits,
    generateComplianceReport,
    updateFeeStructure,
    resolveAlert,
    dismissAlert,
    searchUsers,
    searchTransactions,

    // Utilities
    refreshData: initializeMockData
  };
}