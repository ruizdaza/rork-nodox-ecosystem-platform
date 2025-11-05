import { protectedProcedure } from "@/backend/trpc/create-context";
import { z } from "zod";
import {
  TrialBalance,
  TrialBalanceAccount,
  BalanceSheet,
  IncomeStatement,
  GeneralLedger,
} from "@/types/accounting";
import { accounts } from "../accounts/route";
import { journalEntries } from "../journal-entries/route";

export const getTrialBalanceProcedure = protectedProcedure
  .input(
    z.object({
      startDate: z.string(),
      endDate: z.string(),
    })
  )
  .query(async ({ input }) => {
    const relevantEntries = journalEntries.filter(
      (je) => je.status === "posted" && je.date >= input.startDate && je.date <= input.endDate
    );

    const accountBalances = new Map<string, { debit: number; credit: number }>();

    relevantEntries.forEach((entry) => {
      entry.lines.forEach((line) => {
        const existing = accountBalances.get(line.accountId) || { debit: 0, credit: 0 };
        existing.debit += line.debit;
        existing.credit += line.credit;
        accountBalances.set(line.accountId, existing);
      });
    });

    const trialBalanceAccounts: TrialBalanceAccount[] = [];
    let totalDebit = 0;
    let totalCredit = 0;

    accounts.forEach((account) => {
      const balances = accountBalances.get(account.id) || { debit: 0, credit: 0 };

      if (balances.debit !== 0 || balances.credit !== 0) {
        let balance = 0;
        if (account.type === "asset" || account.type === "expense") {
          balance = balances.debit - balances.credit;
        } else {
          balance = balances.credit - balances.debit;
        }

        trialBalanceAccounts.push({
          accountCode: account.code,
          accountName: account.name,
          accountType: account.type,
          debit: balances.debit,
          credit: balances.credit,
          balance,
        });

        totalDebit += balances.debit;
        totalCredit += balances.credit;
      }
    });

    trialBalanceAccounts.sort((a, b) => a.accountCode.localeCompare(b.accountCode));

    const trialBalance: TrialBalance = {
      period: `${input.startDate} - ${input.endDate}`,
      date: input.endDate,
      accounts: trialBalanceAccounts,
      totalDebit,
      totalCredit,
      isBalanced: Math.abs(totalDebit - totalCredit) < 0.01,
      difference: totalDebit - totalCredit,
    };

    return trialBalance;
  });

export const getBalanceSheetProcedure = protectedProcedure
  .input(
    z.object({
      date: z.string(),
    })
  )
  .query(async ({ input }) => {
    const relevantEntries = journalEntries.filter(
      (je) => je.status === "posted" && je.date <= input.date
    );

    const accountBalances = new Map<string, number>();

    relevantEntries.forEach((entry) => {
      entry.lines.forEach((line) => {
        const account = accounts.find((a) => a.id === line.accountId);
        if (!account) return;

        const currentBalance = accountBalances.get(line.accountId) || 0;
        let newBalance = currentBalance;

        if (account.type === "asset" || account.type === "expense") {
          newBalance += line.debit - line.credit;
        } else {
          newBalance += line.credit - line.debit;
        }

        accountBalances.set(line.accountId, newBalance);
      });
    });

    const assets: any[] = [];
    const liabilities: any[] = [];
    const equity: any[] = [];

    let totalAssets = 0;
    let totalLiabilities = 0;
    let totalEquity = 0;

    accounts.forEach((account) => {
      const balance = accountBalances.get(account.id) || 0;

      if (balance === 0) return;

      const item = {
        code: account.code,
        name: account.name,
        subtype: account.subtype,
        amount: balance,
        level: account.level,
      };

      if (account.type === "asset") {
        assets.push(item);
        totalAssets += balance;
      } else if (account.type === "liability") {
        liabilities.push(item);
        totalLiabilities += balance;
      } else if (account.type === "equity") {
        equity.push(item);
        totalEquity += balance;
      }
    });

    const balanceSheet: BalanceSheet = {
      date: input.date,
      currency: "COP",
      assets: {
        accounts: assets.sort((a, b) => a.code.localeCompare(b.code)),
        subtotals: {},
        total: totalAssets,
      },
      liabilities: {
        accounts: liabilities.sort((a, b) => a.code.localeCompare(b.code)),
        subtotals: {},
        total: totalLiabilities,
      },
      equity: {
        accounts: equity.sort((a, b) => a.code.localeCompare(b.code)),
        subtotals: {},
        total: totalEquity,
      },
      totalAssets,
      totalLiabilities,
      totalEquity,
      totalLiabilitiesAndEquity: totalLiabilities + totalEquity,
      isBalanced: Math.abs(totalAssets - (totalLiabilities + totalEquity)) < 0.01,
    };

    return balanceSheet;
  });

export const getIncomeStatementProcedure = protectedProcedure
  .input(
    z.object({
      startDate: z.string(),
      endDate: z.string(),
    })
  )
  .query(async ({ input }) => {
    const relevantEntries = journalEntries.filter(
      (je) => je.status === "posted" && je.date >= input.startDate && je.date <= input.endDate
    );

    const accountBalances = new Map<string, number>();

    relevantEntries.forEach((entry) => {
      entry.lines.forEach((line) => {
        const account = accounts.find((a) => a.id === line.accountId);
        if (!account) return;

        const currentBalance = accountBalances.get(line.accountId) || 0;
        let newBalance = currentBalance;

        if (account.type === "expense") {
          newBalance += line.debit - line.credit;
        } else if (account.type === "revenue") {
          newBalance += line.credit - line.debit;
        }

        accountBalances.set(line.accountId, newBalance);
      });
    });

    const revenue: any[] = [];
    const expenses: any[] = [];

    let totalRevenue = 0;
    let totalExpenses = 0;

    accounts.forEach((account) => {
      const balance = accountBalances.get(account.id) || 0;

      if (balance === 0) return;

      const item = {
        code: account.code,
        name: account.name,
        subtype: account.subtype,
        amount: balance,
        percentage: 0,
      };

      if (account.type === "revenue") {
        revenue.push(item);
        totalRevenue += balance;
      } else if (account.type === "expense") {
        expenses.push(item);
        totalExpenses += balance;
      }
    });

    revenue.forEach((item) => {
      item.percentage = totalRevenue > 0 ? (item.amount / totalRevenue) * 100 : 0;
    });

    expenses.forEach((item) => {
      item.percentage = totalRevenue > 0 ? (item.amount / totalRevenue) * 100 : 0;
    });

    const netIncome = totalRevenue - totalExpenses;

    const incomeStatement: IncomeStatement = {
      startDate: input.startDate,
      endDate: input.endDate,
      currency: "COP",
      revenue: {
        accounts: revenue.sort((a, b) => a.code.localeCompare(b.code)),
        subtotals: {},
        total: totalRevenue,
      },
      costOfGoodsSold: {
        accounts: [],
        subtotals: {},
        total: 0,
      },
      operatingExpenses: {
        accounts: expenses.sort((a, b) => a.code.localeCompare(b.code)),
        subtotals: {},
        total: totalExpenses,
      },
      otherIncomeExpense: {
        accounts: [],
        subtotals: {},
        total: 0,
      },
      grossProfit: totalRevenue,
      operatingIncome: totalRevenue - totalExpenses,
      netIncome,
      grossProfitMargin: totalRevenue > 0 ? (totalRevenue / totalRevenue) * 100 : 0,
      operatingMargin: totalRevenue > 0 ? ((totalRevenue - totalExpenses) / totalRevenue) * 100 : 0,
      netProfitMargin: totalRevenue > 0 ? (netIncome / totalRevenue) * 100 : 0,
    };

    return incomeStatement;
  });

export const getGeneralLedgerProcedure = protectedProcedure
  .input(
    z.object({
      accountId: z.string(),
      startDate: z.string(),
      endDate: z.string(),
    })
  )
  .query(async ({ input }) => {
    const account = accounts.find((a) => a.id === input.accountId);
    if (!account) {
      throw new Error("Account not found");
    }

    const relevantEntries = journalEntries.filter(
      (je) => je.status === "posted" && je.date >= input.startDate && je.date <= input.endDate
    );

    let runningBalance = 0;
    const transactions: any[] = [];

    relevantEntries.forEach((entry) => {
      entry.lines.forEach((line) => {
        if (line.accountId === input.accountId) {
          if (account.type === "asset" || account.type === "expense") {
            runningBalance += line.debit - line.credit;
          } else {
            runningBalance += line.credit - line.debit;
          }

          transactions.push({
            date: entry.date,
            entryNumber: entry.entryNumber,
            description: line.description || entry.description,
            debit: line.debit,
            credit: line.credit,
            balance: runningBalance,
            referenceType: entry.referenceType,
            referenceId: entry.referenceId,
          });
        }
      });
    });

    const ledger: GeneralLedger = {
      accountId: account.id,
      accountCode: account.code,
      accountName: account.name,
      accountType: account.type,
      openingBalance: 0,
      debit: transactions.reduce((sum, t) => sum + t.debit, 0),
      credit: transactions.reduce((sum, t) => sum + t.credit, 0),
      closingBalance: runningBalance,
      period: `${input.startDate} - ${input.endDate}`,
      transactions,
    };

    return ledger;
  });
