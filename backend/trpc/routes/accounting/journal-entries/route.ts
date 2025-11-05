import { protectedProcedure } from "@/backend/trpc/create-context";
import { z } from "zod";
import { JournalEntry, JournalEntryLine } from "@/types/accounting";
import { accounts } from "../accounts/route";

let journalEntries: JournalEntry[] = [];
let entryCounter = 1;

export const getJournalEntriesProcedure = protectedProcedure
  .input(
    z.object({
      status: z.enum(["draft", "posted", "void"]).optional(),
      startDate: z.string().optional(),
      endDate: z.string().optional(),
      type: z
        .enum(["standard", "opening", "closing", "adjusting", "reversing"])
        .optional(),
      limit: z.number().optional().default(50),
    })
  )
  .query(async ({ input }) => {
    let filtered = [...journalEntries];

    if (input.status) {
      filtered = filtered.filter((je) => je.status === input.status);
    }

    if (input.type) {
      filtered = filtered.filter((je) => je.type === input.type);
    }

    if (input.startDate) {
      filtered = filtered.filter((je) => je.date >= input.startDate!);
    }

    if (input.endDate) {
      filtered = filtered.filter((je) => je.date <= input.endDate!);
    }

    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return filtered.slice(0, input.limit);
  });

export const createJournalEntryProcedure = protectedProcedure
  .input(
    z.object({
      date: z.string(),
      description: z.string(),
      type: z.enum(["standard", "opening", "closing", "adjusting", "reversing"]),
      lines: z.array(
        z.object({
          accountId: z.string(),
          description: z.string().optional(),
          debit: z.number(),
          credit: z.number(),
          currency: z.string().default("COP"),
          exchangeRate: z.number().optional(),
          taxId: z.string().optional(),
          taxAmount: z.number().optional(),
          costCenterId: z.string().optional(),
          projectId: z.string().optional(),
        })
      ),
      referenceType: z
        .enum(["sale", "purchase", "payment", "receipt", "invoice", "expense", "adjustment"])
        .optional(),
      referenceId: z.string().optional(),
      attachments: z.array(z.string()).optional(),
    })
  )
  .mutation(async ({ input, ctx }) => {
    if (input.lines.length < 2) {
      throw new Error("Journal entry must have at least 2 lines");
    }

    const totalDebit = input.lines.reduce((sum, line) => sum + line.debit, 0);
    const totalCredit = input.lines.reduce((sum, line) => sum + line.credit, 0);

    if (Math.abs(totalDebit - totalCredit) > 0.01) {
      throw new Error("Debits must equal credits");
    }

    const lines: JournalEntryLine[] = input.lines.map((line) => {
      const account = accounts.find((a) => a.id === line.accountId);
      if (!account) {
        throw new Error(`Account ${line.accountId} not found`);
      }

      return {
        id: `jel-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        ...line,
        accountCode: account.code,
        accountName: account.name,
        description: line.description || input.description,
      };
    });

    const entry: JournalEntry = {
      id: `je-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      entryNumber: `JE${String(entryCounter++).padStart(6, "0")}`,
      date: input.date,
      description: input.description,
      type: input.type,
      status: "draft",
      lines,
      totalDebit,
      totalCredit,
      attachments: input.attachments,
      referenceType: input.referenceType,
      referenceId: input.referenceId,
      createdBy: ctx.user.id,
      createdByName: ctx.user.name || "Usuario",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    journalEntries.push(entry);
    return entry;
  });

export const postJournalEntryProcedure = protectedProcedure
  .input(z.object({ entryId: z.string() }))
  .mutation(async ({ input, ctx }) => {
    const entry = journalEntries.find((je) => je.id === input.entryId);
    if (!entry) {
      throw new Error("Journal entry not found");
    }

    if (entry.status !== "draft") {
      throw new Error("Can only post draft entries");
    }

    entry.lines.forEach((line) => {
      const account = accounts.find((a) => a.id === line.accountId);
      if (account) {
        account.debitBalance += line.debit;
        account.creditBalance += line.credit;

        if (account.type === "asset" || account.type === "expense") {
          account.balance = account.debitBalance - account.creditBalance;
        } else {
          account.balance = account.creditBalance - account.debitBalance;
        }

        account.updatedAt = new Date().toISOString();
      }
    });

    entry.status = "posted";
    entry.postedBy = ctx.user.id;
    entry.postedByName = ctx.user.name || "Usuario";
    entry.postedAt = new Date().toISOString();
    entry.updatedAt = new Date().toISOString();

    return entry;
  });

export const voidJournalEntryProcedure = protectedProcedure
  .input(
    z.object({
      entryId: z.string(),
      reason: z.string(),
    })
  )
  .mutation(async ({ input, ctx }) => {
    const entry = journalEntries.find((je) => je.id === input.entryId);
    if (!entry) {
      throw new Error("Journal entry not found");
    }

    if (entry.status !== "posted") {
      throw new Error("Can only void posted entries");
    }

    entry.lines.forEach((line) => {
      const account = accounts.find((a) => a.id === line.accountId);
      if (account) {
        account.debitBalance -= line.debit;
        account.creditBalance -= line.credit;

        if (account.type === "asset" || account.type === "expense") {
          account.balance = account.debitBalance - account.creditBalance;
        } else {
          account.balance = account.creditBalance - account.debitBalance;
        }

        account.updatedAt = new Date().toISOString();
      }
    });

    entry.status = "void";
    entry.voidedBy = ctx.user.id;
    entry.voidedByName = ctx.user.name || "Usuario";
    entry.voidedAt = new Date().toISOString();
    entry.voidReason = input.reason;
    entry.updatedAt = new Date().toISOString();

    return entry;
  });

export { journalEntries };
