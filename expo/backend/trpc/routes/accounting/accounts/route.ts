import { protectedProcedure } from "@/backend/trpc/create-context";
import { z } from "zod";
import { AccountingAccount } from "@/types/accounting";

let accounts: AccountingAccount[] = [
  {
    id: "acc-1",
    code: "1105",
    name: "Caja",
    type: "asset",
    subtype: "Efectivo",
    level: 1,
    currency: "COP",
    balance: 0,
    debitBalance: 0,
    creditBalance: 0,
    isActive: true,
    taxAccount: false,
    bankAccount: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "acc-2",
    code: "1110",
    name: "Bancos",
    type: "asset",
    subtype: "Efectivo",
    level: 1,
    currency: "COP",
    balance: 0,
    debitBalance: 0,
    creditBalance: 0,
    isActive: true,
    taxAccount: false,
    bankAccount: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "acc-3",
    code: "4135",
    name: "Comercio al por mayor y al por menor",
    type: "revenue",
    subtype: "Ingresos operacionales",
    level: 1,
    currency: "COP",
    balance: 0,
    debitBalance: 0,
    creditBalance: 0,
    isActive: true,
    taxAccount: false,
    bankAccount: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "acc-4",
    code: "2408",
    name: "Impuesto a las ventas por pagar",
    type: "liability",
    subtype: "Impuestos",
    level: 1,
    currency: "COP",
    balance: 0,
    debitBalance: 0,
    creditBalance: 0,
    isActive: true,
    taxAccount: true,
    bankAccount: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const getAccountingAccountsProcedure = protectedProcedure
  .input(
    z.object({
      type: z.enum(["asset", "liability", "equity", "revenue", "expense"]).optional(),
      isActive: z.boolean().optional(),
      search: z.string().optional(),
    })
  )
  .query(async ({ input }) => {
    let filtered = [...accounts];

    if (input.type) {
      filtered = filtered.filter((a) => a.type === input.type);
    }

    if (input.isActive !== undefined) {
      filtered = filtered.filter((a) => a.isActive === input.isActive);
    }

    if (input.search) {
      const searchLower = input.search.toLowerCase();
      filtered = filtered.filter(
        (a) =>
          a.name.toLowerCase().includes(searchLower) ||
          a.code.toLowerCase().includes(searchLower)
      );
    }

    filtered.sort((a, b) => a.code.localeCompare(b.code));

    return filtered;
  });

export const createAccountingAccountProcedure = protectedProcedure
  .input(
    z.object({
      code: z.string(),
      name: z.string(),
      type: z.enum(["asset", "liability", "equity", "revenue", "expense"]),
      subtype: z.string(),
      parentAccountId: z.string().optional(),
      level: z.number(),
      currency: z.string(),
      description: z.string().optional(),
      taxAccount: z.boolean().default(false),
      bankAccount: z.boolean().default(false),
      bankAccountNumber: z.string().optional(),
    })
  )
  .mutation(async ({ input }) => {
    const existing = accounts.find((a) => a.code === input.code);
    if (existing) {
      throw new Error("Account code already exists");
    }

    const newAccount: AccountingAccount = {
      id: `acc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ...input,
      balance: 0,
      debitBalance: 0,
      creditBalance: 0,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    accounts.push(newAccount);
    return newAccount;
  });

export const updateAccountingAccountProcedure = protectedProcedure
  .input(
    z.object({
      id: z.string(),
      name: z.string().optional(),
      subtype: z.string().optional(),
      isActive: z.boolean().optional(),
      description: z.string().optional(),
      bankAccountNumber: z.string().optional(),
    })
  )
  .mutation(async ({ input }) => {
    const index = accounts.findIndex((a) => a.id === input.id);
    if (index === -1) {
      throw new Error("Account not found");
    }

    accounts[index] = {
      ...accounts[index],
      ...input,
      updatedAt: new Date().toISOString(),
    };

    return accounts[index];
  });

export const updateAccountBalanceProcedure = protectedProcedure
  .input(
    z.object({
      accountId: z.string(),
      debit: z.number(),
      credit: z.number(),
    })
  )
  .mutation(async ({ input }) => {
    const account = accounts.find((a) => a.id === input.accountId);
    if (!account) {
      throw new Error("Account not found");
    }

    account.debitBalance += input.debit;
    account.creditBalance += input.credit;

    if (account.type === "asset" || account.type === "expense") {
      account.balance = account.debitBalance - account.creditBalance;
    } else {
      account.balance = account.creditBalance - account.debitBalance;
    }

    account.updatedAt = new Date().toISOString();

    return account;
  });

export { accounts };
