import { useState, useCallback, useEffect, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  AccountingAccount,
  JournalEntry,
  JournalEntryLine,
  GeneralLedger,
  TrialBalance,
  BalanceSheet,
  IncomeStatement,
  AccountingValidation,
  AccountingPeriod
} from '@/types/accounting';

const ACCOUNTING_ACCOUNTS_KEY = 'accounting_accounts';
const ACCOUNTING_ENTRIES_KEY = 'accounting_entries';
const ACCOUNTING_PERIODS_KEY = 'accounting_periods';

const INITIAL_CHART_OF_ACCOUNTS: AccountingAccount[] = [
  {
    id: 'acc-1',
    code: '1000',
    name: 'Activos',
    type: 'asset',
    subtype: 'root',
    level: 1,
    currency: 'COP',
    balance: 0,
    debitBalance: 0,
    creditBalance: 0,
    isActive: true,
    taxAccount: false,
    bankAccount: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'acc-2',
    code: '1100',
    name: 'Activos Corrientes',
    type: 'asset',
    subtype: 'current',
    parentAccountId: 'acc-1',
    level: 2,
    currency: 'COP',
    balance: 0,
    debitBalance: 0,
    creditBalance: 0,
    isActive: true,
    taxAccount: false,
    bankAccount: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'acc-3',
    code: '1110',
    name: 'Caja y Bancos',
    type: 'asset',
    subtype: 'cash',
    parentAccountId: 'acc-2',
    level: 3,
    currency: 'COP',
    balance: 0,
    debitBalance: 0,
    creditBalance: 0,
    isActive: true,
    taxAccount: false,
    bankAccount: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'acc-4',
    code: '1120',
    name: 'Inventarios',
    type: 'asset',
    subtype: 'inventory',
    parentAccountId: 'acc-2',
    level: 3,
    currency: 'COP',
    balance: 0,
    debitBalance: 0,
    creditBalance: 0,
    isActive: true,
    taxAccount: false,
    bankAccount: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'acc-5',
    code: '1130',
    name: 'Cuentas por Cobrar',
    type: 'asset',
    subtype: 'receivables',
    parentAccountId: 'acc-2',
    level: 3,
    currency: 'COP',
    balance: 0,
    debitBalance: 0,
    creditBalance: 0,
    isActive: true,
    taxAccount: false,
    bankAccount: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'acc-6',
    code: '2000',
    name: 'Pasivos',
    type: 'liability',
    subtype: 'root',
    level: 1,
    currency: 'COP',
    balance: 0,
    debitBalance: 0,
    creditBalance: 0,
    isActive: true,
    taxAccount: false,
    bankAccount: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'acc-7',
    code: '2100',
    name: 'Pasivos Corrientes',
    type: 'liability',
    subtype: 'current',
    parentAccountId: 'acc-6',
    level: 2,
    currency: 'COP',
    balance: 0,
    debitBalance: 0,
    creditBalance: 0,
    isActive: true,
    taxAccount: false,
    bankAccount: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'acc-8',
    code: '2110',
    name: 'Cuentas por Pagar',
    type: 'liability',
    subtype: 'payables',
    parentAccountId: 'acc-7',
    level: 2,
    currency: 'COP',
    balance: 0,
    debitBalance: 0,
    creditBalance: 0,
    isActive: true,
    taxAccount: false,
    bankAccount: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'acc-9',
    code: '3000',
    name: 'Patrimonio',
    type: 'equity',
    subtype: 'root',
    level: 1,
    currency: 'COP',
    balance: 0,
    debitBalance: 0,
    creditBalance: 0,
    isActive: true,
    taxAccount: false,
    bankAccount: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'acc-10',
    code: '3100',
    name: 'Capital',
    type: 'equity',
    subtype: 'capital',
    parentAccountId: 'acc-9',
    level: 2,
    currency: 'COP',
    balance: 0,
    debitBalance: 0,
    creditBalance: 0,
    isActive: true,
    taxAccount: false,
    bankAccount: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'acc-11',
    code: '4000',
    name: 'Ingresos',
    type: 'revenue',
    subtype: 'root',
    level: 1,
    currency: 'COP',
    balance: 0,
    debitBalance: 0,
    creditBalance: 0,
    isActive: true,
    taxAccount: false,
    bankAccount: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'acc-12',
    code: '4100',
    name: 'Ingresos por Ventas',
    type: 'revenue',
    subtype: 'sales',
    parentAccountId: 'acc-11',
    level: 2,
    currency: 'COP',
    balance: 0,
    debitBalance: 0,
    creditBalance: 0,
    isActive: true,
    taxAccount: false,
    bankAccount: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'acc-13',
    code: '5000',
    name: 'Gastos',
    type: 'expense',
    subtype: 'root',
    level: 1,
    currency: 'COP',
    balance: 0,
    debitBalance: 0,
    creditBalance: 0,
    isActive: true,
    taxAccount: false,
    bankAccount: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'acc-14',
    code: '5100',
    name: 'Costo de Ventas',
    type: 'expense',
    subtype: 'cost_of_sales',
    parentAccountId: 'acc-13',
    level: 2,
    currency: 'COP',
    balance: 0,
    debitBalance: 0,
    creditBalance: 0,
    isActive: true,
    taxAccount: false,
    bankAccount: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'acc-15',
    code: '5200',
    name: 'Gastos Operacionales',
    type: 'expense',
    subtype: 'operating',
    parentAccountId: 'acc-13',
    level: 2,
    currency: 'COP',
    balance: 0,
    debitBalance: 0,
    creditBalance: 0,
    isActive: true,
    taxAccount: false,
    bankAccount: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export const useAccounting = () => {
  const [accounts, setAccounts] = useState<AccountingAccount[]>([]);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [periods, setPeriods] = useState<AccountingPeriod[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAccountingData();
  }, []);

  const loadAccountingData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [storedAccounts, storedEntries, storedPeriods] = await Promise.all([
        AsyncStorage.getItem(ACCOUNTING_ACCOUNTS_KEY),
        AsyncStorage.getItem(ACCOUNTING_ENTRIES_KEY),
        AsyncStorage.getItem(ACCOUNTING_PERIODS_KEY)
      ]);

      if (storedAccounts) {
        setAccounts(JSON.parse(storedAccounts));
      } else {
        setAccounts(INITIAL_CHART_OF_ACCOUNTS);
        await AsyncStorage.setItem(ACCOUNTING_ACCOUNTS_KEY, JSON.stringify(INITIAL_CHART_OF_ACCOUNTS));
      }

      if (storedEntries) {
        setJournalEntries(JSON.parse(storedEntries));
      }

      if (storedPeriods) {
        setPeriods(JSON.parse(storedPeriods));
      }

      console.log('Accounting data loaded successfully');
    } catch (err) {
      console.error('Error loading accounting data:', err);
      setError('Failed to load accounting data');
    } finally {
      setIsLoading(false);
    }
  };

  const saveAccountingData = async (
    newAccounts: AccountingAccount[],
    newEntries: JournalEntry[],
    newPeriods: AccountingPeriod[]
  ) => {
    try {
      await Promise.all([
        AsyncStorage.setItem(ACCOUNTING_ACCOUNTS_KEY, JSON.stringify(newAccounts)),
        AsyncStorage.setItem(ACCOUNTING_ENTRIES_KEY, JSON.stringify(newEntries)),
        AsyncStorage.setItem(ACCOUNTING_PERIODS_KEY, JSON.stringify(newPeriods))
      ]);
      console.log('Accounting data saved successfully');
    } catch (err) {
      console.error('Error saving accounting data:', err);
      throw new Error('Failed to save accounting data');
    }
  };

  const validateJournalEntry = useCallback((entry: Omit<JournalEntry, 'id' | 'createdAt' | 'updatedAt'>): AccountingValidation => {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!entry.description || entry.description.trim() === '') {
      errors.push('La descripción es requerida');
    }

    if (!entry.lines || entry.lines.length < 2) {
      errors.push('Debe tener al menos dos líneas (débito y crédito)');
    }

    const totalDebit = entry.lines.reduce((sum, line) => sum + line.debit, 0);
    const totalCredit = entry.lines.reduce((sum, line) => sum + line.credit, 0);

    if (Math.abs(totalDebit - totalCredit) > 0.01) {
      errors.push(`El asiento no está balanceado. Débito: ${totalDebit}, Crédito: ${totalCredit}`);
    }

    entry.lines.forEach((line, index) => {
      if (!line.accountId) {
        errors.push(`Línea ${index + 1}: Debe seleccionar una cuenta`);
      }

      if (line.debit === 0 && line.credit === 0) {
        errors.push(`Línea ${index + 1}: Debe tener un valor de débito o crédito`);
      }

      if (line.debit > 0 && line.credit > 0) {
        errors.push(`Línea ${index + 1}: No puede tener débito y crédito al mismo tiempo`);
      }

      if (line.debit < 0 || line.credit < 0) {
        errors.push(`Línea ${index + 1}: Los valores no pueden ser negativos`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }, []);

  const createJournalEntry = useCallback(async (
    entryData: Omit<JournalEntry, 'id' | 'entryNumber' | 'createdAt' | 'updatedAt'>
  ) => {
    try {
      const validation = validateJournalEntry(entryData);
      if (!validation.isValid) {
        throw new Error(validation.errors.join(', '));
      }

      const entryNumber = `JE-${Date.now().toString().slice(-8)}`;
      const newEntry: JournalEntry = {
        ...entryData,
        id: `je-${Date.now()}`,
        entryNumber,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const updatedEntries = [...journalEntries, newEntry];
      setJournalEntries(updatedEntries);

      if (newEntry.status === 'posted') {
        const updatedAccounts = updateAccountBalances(accounts, newEntry);
        setAccounts(updatedAccounts);
        await saveAccountingData(updatedAccounts, updatedEntries, periods);
      } else {
        await saveAccountingData(accounts, updatedEntries, periods);
      }

      console.log('Journal entry created:', newEntry.id);
      return newEntry;
    } catch (err: any) {
      console.error('Error creating journal entry:', err);
      setError(err.message || 'Failed to create journal entry');
      throw err;
    }
  }, [accounts, journalEntries, periods, validateJournalEntry]);

  const updateAccountBalances = (currentAccounts: AccountingAccount[], entry: JournalEntry): AccountingAccount[] => {
    return currentAccounts.map(account => {
      const accountLines = entry.lines.filter(line => line.accountId === account.id);
      if (accountLines.length === 0) return account;

      const totalDebit = accountLines.reduce((sum, line) => sum + line.debit, 0);
      const totalCredit = accountLines.reduce((sum, line) => sum + line.credit, 0);

      const newDebitBalance = account.debitBalance + totalDebit;
      const newCreditBalance = account.creditBalance + totalCredit;
      
      let newBalance: number;
      if (account.type === 'asset' || account.type === 'expense') {
        newBalance = newDebitBalance - newCreditBalance;
      } else {
        newBalance = newCreditBalance - newDebitBalance;
      }

      return {
        ...account,
        debitBalance: newDebitBalance,
        creditBalance: newCreditBalance,
        balance: newBalance,
        updatedAt: new Date().toISOString()
      };
    });
  };

  const postJournalEntry = useCallback(async (entryId: string, postedBy: string, postedByName: string) => {
    try {
      const entry = journalEntries.find(e => e.id === entryId);
      if (!entry) {
        throw new Error('Journal entry not found');
      }

      if (entry.status === 'posted') {
        throw new Error('This entry has already been posted');
      }

      const validation = validateJournalEntry(entry);
      if (!validation.isValid) {
        throw new Error(validation.errors.join(', '));
      }

      const postedEntry: JournalEntry = {
        ...entry,
        status: 'posted',
        postedBy,
        postedByName,
        postedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const updatedEntries = journalEntries.map(e => e.id === entryId ? postedEntry : e);
      const updatedAccounts = updateAccountBalances(accounts, postedEntry);

      setJournalEntries(updatedEntries);
      setAccounts(updatedAccounts);

      await saveAccountingData(updatedAccounts, updatedEntries, periods);

      console.log('Journal entry posted:', entryId);
      return postedEntry;
    } catch (err: any) {
      console.error('Error posting journal entry:', err);
      setError(err.message || 'Failed to post journal entry');
      throw err;
    }
  }, [accounts, journalEntries, periods, validateJournalEntry, updateAccountBalances]);

  const recordSaleTransaction = useCallback(async (
    amount: number,
    tax: number,
    paymentMethod: 'cash' | 'card' | 'ncop' | 'transfer',
    referenceId: string,
    description: string,
    userId: string,
    userName: string
  ) => {
    try {
      const cashAccount = accounts.find(a => a.code === '1110');
      const salesAccount = accounts.find(a => a.code === '4100');
      
      if (!cashAccount || !salesAccount) {
        throw new Error('Required accounts not found');
      }

      const lines: JournalEntryLine[] = [
        {
          id: `line-${Date.now()}-1`,
          accountId: cashAccount.id,
          accountCode: cashAccount.code,
          accountName: cashAccount.name,
          description: `Pago por ${paymentMethod}`,
          debit: amount + tax,
          credit: 0,
          currency: 'COP'
        },
        {
          id: `line-${Date.now()}-2`,
          accountId: salesAccount.id,
          accountCode: salesAccount.code,
          accountName: salesAccount.name,
          description: 'Ingreso por venta',
          debit: 0,
          credit: amount,
          currency: 'COP'
        }
      ];

      if (tax > 0) {
        const taxAccount = accounts.find(a => a.taxAccount);
        if (taxAccount) {
          lines.push({
            id: `line-${Date.now()}-3`,
            accountId: taxAccount.id,
            accountCode: taxAccount.code,
            accountName: taxAccount.name,
            description: 'IVA',
            debit: 0,
            credit: tax,
            currency: 'COP'
          });
        }
      }

      const entry = await createJournalEntry({
        date: new Date().toISOString(),
        description,
        type: 'standard',
        status: 'posted',
        lines,
        totalDebit: amount + tax,
        totalCredit: amount + tax,
        referenceType: 'sale',
        referenceId,
        createdBy: userId,
        createdByName: userName,
        postedBy: userId,
        postedByName: userName,
        postedAt: new Date().toISOString()
      });

      console.log('Sale transaction recorded:', entry.id);
      return entry;
    } catch (err: any) {
      console.error('Error recording sale transaction:', err);
      throw err;
    }
  }, [accounts, createJournalEntry]);

  const getGeneralLedger = useCallback((accountId: string, startDate?: string, endDate?: string): GeneralLedger | null => {
    const account = accounts.find(a => a.id === accountId);
    if (!account) return null;

    let filteredEntries = journalEntries.filter(e => e.status === 'posted');
    
    if (startDate) {
      filteredEntries = filteredEntries.filter(e => e.date >= startDate);
    }
    if (endDate) {
      filteredEntries = filteredEntries.filter(e => e.date <= endDate);
    }

    const transactions: any[] = [];
    let balance = 0;

    filteredEntries.forEach(entry => {
      const accountLines = entry.lines.filter(line => line.accountId === accountId);
      accountLines.forEach(line => {
        const debit = line.debit;
        const credit = line.credit;
        
        if (account.type === 'asset' || account.type === 'expense') {
          balance += debit - credit;
        } else {
          balance += credit - debit;
        }

        transactions.push({
          date: entry.date,
          entryNumber: entry.entryNumber,
          description: line.description || entry.description,
          debit,
          credit,
          balance,
          referenceType: entry.referenceType,
          referenceId: entry.referenceId
        });
      });
    });

    return {
      accountId: account.id,
      accountCode: account.code,
      accountName: account.name,
      accountType: account.type,
      openingBalance: 0,
      debit: account.debitBalance,
      credit: account.creditBalance,
      closingBalance: account.balance,
      period: `${startDate || ''} - ${endDate || ''}`,
      transactions
    };
  }, [accounts, journalEntries]);

  const getTrialBalance = useCallback((date?: string): TrialBalance => {
    const filteredEntries = date 
      ? journalEntries.filter(e => e.status === 'posted' && e.date <= date)
      : journalEntries.filter(e => e.status === 'posted');

    const accountBalances: { [key: string]: AccountingAccount } = {};
    accounts.forEach(acc => {
      accountBalances[acc.id] = { ...acc, debitBalance: 0, creditBalance: 0, balance: 0 };
    });

    filteredEntries.forEach(entry => {
      entry.lines.forEach(line => {
        if (accountBalances[line.accountId]) {
          accountBalances[line.accountId].debitBalance += line.debit;
          accountBalances[line.accountId].creditBalance += line.credit;
        }
      });
    });

    Object.values(accountBalances).forEach(acc => {
      if (acc.type === 'asset' || acc.type === 'expense') {
        acc.balance = acc.debitBalance - acc.creditBalance;
      } else {
        acc.balance = acc.creditBalance - acc.debitBalance;
      }
    });

    const trialBalanceAccounts = Object.values(accountBalances)
      .filter(acc => acc.debitBalance > 0 || acc.creditBalance > 0)
      .map(acc => ({
        accountCode: acc.code,
        accountName: acc.name,
        accountType: acc.type,
        debit: acc.debitBalance,
        credit: acc.creditBalance,
        balance: acc.balance
      }))
      .sort((a, b) => a.accountCode.localeCompare(b.accountCode));

    const totalDebit = trialBalanceAccounts.reduce((sum, acc) => sum + acc.debit, 0);
    const totalCredit = trialBalanceAccounts.reduce((sum, acc) => sum + acc.credit, 0);

    return {
      period: date || new Date().toISOString(),
      date: date || new Date().toISOString(),
      accounts: trialBalanceAccounts,
      totalDebit,
      totalCredit,
      isBalanced: Math.abs(totalDebit - totalCredit) < 0.01,
      difference: totalDebit - totalCredit
    };
  }, [accounts, journalEntries]);

  return {
    accounts,
    journalEntries,
    periods,
    isLoading,
    error,
    createJournalEntry,
    postJournalEntry,
    recordSaleTransaction,
    getGeneralLedger,
    getTrialBalance,
    validateJournalEntry,
    refreshData: loadAccountingData
  };
};
