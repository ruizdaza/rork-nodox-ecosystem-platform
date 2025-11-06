import createContextHook from '@nkzw/create-context-hook';
import { useState, useEffect, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { trpc } from '@/lib/trpc';
import {
  WalletBalance,
  WalletSettings,
  WalletLimits,
  NCOP_TO_COP_EXCHANGE_RATE,
  COP_TO_NCOP_EXCHANGE_RATE,
  MAX_DAILY_SEND_LIMIT,
  MAX_DAILY_RECHARGE_LIMIT,
  LARGE_TRANSACTION_THRESHOLD,
  WalletCurrency,
  TransactionType,
  TransactionStatus,
} from '@/types/wallet';

const WALLET_STORAGE_KEY = 'nodox_wallet_data';
const SETTINGS_STORAGE_KEY = 'nodox_wallet_settings';

const DEFAULT_SETTINGS: WalletSettings = {
  userId: '1',
  requirePinForTransactions: false,
  requireConfirmationForLargeTransactions: true,
  largeTransactionThreshold: LARGE_TRANSACTION_THRESHOLD,
  notificationsEnabled: true,
  autoConvertEnabled: false,
  preferredCurrency: 'NCOP',
  dailyLimits: {
    send: MAX_DAILY_SEND_LIMIT,
    recharge: MAX_DAILY_RECHARGE_LIMIT,
    withdraw: 2000000,
  },
  securityLevel: 'medium',
};

export const [WalletProvider, useWallet] = createContextHook(() => {
  const [balance, setBalance] = useState<WalletBalance>({
    ncop: 2450,
    cop: 150000,
    lastUpdated: new Date().toISOString(),
  });

  const [settings, setSettings] = useState<WalletSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);

  const userId = '1';

  const balanceQuery = trpc.wallet.getBalance.useQuery(
    { userId },
    { 
      enabled: true,
      refetchInterval: 60000,
    }
  );

  useEffect(() => {
    if (balanceQuery.data) {
      setBalance(balanceQuery.data);
      saveBalanceToStorage(balanceQuery.data);
    }
  }, [balanceQuery.data]);

  const transactionsQuery = trpc.wallet.getTransactions.useQuery(
    { userId, limit: 50, offset: 0 },
    { enabled: true, refetchInterval: 30000 }
  );

  const statsQuery = trpc.wallet.getStats.useQuery(
    { userId, currency: 'NCOP' },
    { enabled: true }
  );

  const copStatsQuery = trpc.wallet.getStats.useQuery(
    { userId, currency: 'COP' },
    { enabled: true }
  );

  const rechargeMutation = trpc.wallet.recharge.useMutation({
    onSuccess: () => {
      balanceQuery.refetch();
      transactionsQuery.refetch();
      statsQuery.refetch();
      copStatsQuery.refetch();
    },
  });

  const sendMoneyMutation = trpc.wallet.sendMoney.useMutation({
    onSuccess: () => {
      balanceQuery.refetch();
      transactionsQuery.refetch();
      statsQuery.refetch();
      copStatsQuery.refetch();
    },
  });

  const exchangeMutation = trpc.wallet.exchange.useMutation({
    onSuccess: () => {
      balanceQuery.refetch();
      transactionsQuery.refetch();
      statsQuery.refetch();
      copStatsQuery.refetch();
    },
  });

  useEffect(() => {
    loadFromStorage();
  }, []);

  const loadFromStorage = async () => {
    try {
      const [storedBalance, storedSettings] = await Promise.all([
        AsyncStorage.getItem(WALLET_STORAGE_KEY),
        AsyncStorage.getItem(SETTINGS_STORAGE_KEY),
      ]);

      if (storedBalance) {
        const parsedBalance = JSON.parse(storedBalance);
        setBalance(parsedBalance);
      }

      if (storedSettings) {
        const parsedSettings = JSON.parse(storedSettings);
        setSettings({ ...DEFAULT_SETTINGS, ...parsedSettings });
      }
    } catch (error) {
      console.error('[Wallet] Error loading from storage:', error);
    }
  };

  const saveBalanceToStorage = async (newBalance: WalletBalance) => {
    try {
      await AsyncStorage.setItem(WALLET_STORAGE_KEY, JSON.stringify(newBalance));
      console.log('[Wallet] Balance saved to storage');
    } catch (error) {
      console.error('[Wallet] Error saving balance:', error);
    }
  };

  const saveSettingsToStorage = async (newSettings: WalletSettings) => {
    try {
      await AsyncStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(newSettings));
      console.log('[Wallet] Settings saved to storage');
    } catch (error) {
      console.error('[Wallet] Error saving settings:', error);
    }
  };

  const syncWithBackend = useCallback(async () => {
    setIsSyncing(true);
    try {
      await balanceQuery.refetch();
      setLastSyncTime(new Date().toISOString());
      console.log('[Wallet] Synced with backend successfully');
    } catch (error) {
      console.error('[Wallet] Error syncing with backend:', error);
    } finally {
      setIsSyncing(false);
    }
  }, [balanceQuery]);

  const recharge = useCallback(async (
    amount: number,
    paymentMethod: 'PSE' | 'CARD' | 'BANK_TRANSFER'
  ) => {
    if (settings.requireConfirmationForLargeTransactions && amount >= settings.largeTransactionThreshold) {
      console.log('[Wallet] Large transaction requires confirmation');
      return { requiresConfirmation: true };
    }

    setIsLoading(true);
    try {
      const result = await rechargeMutation.mutateAsync({
        userId,
        amount,
        paymentMethod,
      });

      console.log('[Wallet] Recharge successful:', result);
      return result;
    } catch (error) {
      console.error('[Wallet] Recharge failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [userId, settings, rechargeMutation]);

  const sendMoney = useCallback(async (
    recipientId: string,
    amount: number,
    currency: WalletCurrency,
    description?: string
  ) => {
    if (currency === 'NCOP' && amount > balance.ncop) {
      throw new Error('Saldo insuficiente de NCOP');
    }

    if (currency === 'COP' && amount > balance.cop) {
      throw new Error('Saldo insuficiente de COP');
    }

    if (settings.requireConfirmationForLargeTransactions && amount >= settings.largeTransactionThreshold) {
      console.log('[Wallet] Large transaction requires confirmation');
      return { requiresConfirmation: true };
    }

    setIsLoading(true);
    try {
      const result = await sendMoneyMutation.mutateAsync({
        userId,
        recipientId,
        amount,
        currency,
        description,
      });

      console.log('[Wallet] Send money successful:', result);
      return result;
    } catch (error) {
      console.error('[Wallet] Send money failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [userId, balance, settings, sendMoneyMutation]);

  const exchange = useCallback(async (
    fromCurrency: WalletCurrency,
    toCurrency: WalletCurrency,
    amount: number
  ) => {
    if (fromCurrency === 'NCOP' && amount > balance.ncop) {
      throw new Error('Saldo insuficiente de NCOP');
    }

    if (fromCurrency === 'COP' && amount > balance.cop) {
      throw new Error('Saldo insuficiente de COP');
    }

    setIsLoading(true);
    try {
      const result = await exchangeMutation.mutateAsync({
        userId,
        fromCurrency,
        toCurrency,
        amount,
      });

      console.log('[Wallet] Exchange successful:', result);
      return result;
    } catch (error) {
      console.error('[Wallet] Exchange failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [userId, balance, exchangeMutation]);

  const updateSettings = useCallback(async (newSettings: Partial<WalletSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    await saveSettingsToStorage(updated);
    console.log('[Wallet] Settings updated:', updated);
  }, [settings]);

  const getTransactionsByType = useCallback((type: TransactionType) => {
    return transactionsQuery.data?.transactions.filter(t => t.type === type) || [];
  }, [transactionsQuery.data]);

  const getTransactionsByStatus = useCallback((status: TransactionStatus) => {
    return transactionsQuery.data?.transactions.filter(t => t.status === status) || [];
  }, [transactionsQuery.data]);

  const formatCurrency = useCallback((amount: number, currency: WalletCurrency) => {
    if (currency === 'NCOP') {
      return `${amount.toLocaleString()} NCOP`;
    }
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(amount);
  }, []);

  const convertNCOPToCOP = useCallback((ncop: number): number => {
    return ncop * NCOP_TO_COP_EXCHANGE_RATE;
  }, []);

  const convertCOPToNCOP = useCallback((cop: number): number => {
    return Math.floor(cop * COP_TO_NCOP_EXCHANGE_RATE);
  }, []);

  const limits: WalletLimits = useMemo(() => ({
    dailySendLimit: settings.dailyLimits.send,
    dailyRechargeLimit: settings.dailyLimits.recharge,
    maxTransactionAmount: settings.dailyLimits.send,
    minTransactionAmount: 1000,
    dailyWithdrawalLimit: settings.dailyLimits.withdraw,
    monthlyLimits: {
      send: settings.dailyLimits.send * 30,
      recharge: settings.dailyLimits.recharge * 30,
      withdraw: settings.dailyLimits.withdraw * 30,
    },
  }), [settings]);

  const recentTransactions = useMemo(() => {
    return transactionsQuery.data?.transactions.slice(0, 5) || [];
  }, [transactionsQuery.data]);

  const ncopStats = useMemo(() => {
    return statsQuery.data || null;
  }, [statsQuery.data]);

  const copStats = useMemo(() => {
    return copStatsQuery.data || null;
  }, [copStatsQuery.data]);

  return {
    balance,
    settings,
    limits,
    isLoading: isLoading || balanceQuery.isLoading,
    isSyncing,
    lastSyncTime,
    transactions: transactionsQuery.data?.transactions || [],
    recentTransactions,
    ncopStats,
    copStats,
    hasMore: transactionsQuery.data?.hasMore || false,
    recharge,
    sendMoney,
    exchange,
    updateSettings,
    syncWithBackend,
    getTransactionsByType,
    getTransactionsByStatus,
    formatCurrency,
    convertNCOPToCOP,
    convertCOPToNCOP,
    refetchBalance: balanceQuery.refetch,
    refetchTransactions: transactionsQuery.refetch,
    isRechargePending: rechargeMutation.isPending,
    isSendingMoney: sendMoneyMutation.isPending,
    isExchanging: exchangeMutation.isPending,
  };
});
