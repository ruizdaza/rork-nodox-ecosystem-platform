import { protectedProcedure } from "@/backend/trpc/create-context";
import { z } from "zod";
import { POSSessionSummary } from "@/types/pos";
import { transactions } from "../transactions/route";

let sessions: POSSessionSummary[] = [];

export const getPOSSessionsProcedure = protectedProcedure
  .input(
    z.object({
      status: z.enum(["open", "closed"]).optional(),
      sellerId: z.string().optional(),
      limit: z.number().optional().default(20),
    })
  )
  .query(async ({ input }) => {
    let filtered = [...sessions];

    if (input.status) {
      filtered = filtered.filter((s) => s.status === input.status);
    }

    if (input.sellerId) {
      filtered = filtered.filter((s) => s.sellerId === input.sellerId);
    }

    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return filtered.slice(0, input.limit);
  });

export const getActivePOSSessionProcedure = protectedProcedure.query(async ({ ctx }) => {
  const activeSession = sessions.find(
    (s) => s.sellerId === ctx.user.id && s.status === "open"
  );
  return activeSession || null;
});

export const openPOSSessionProcedure = protectedProcedure
  .input(
    z.object({
      openingCash: z.number(),
      notes: z.string().optional(),
    })
  )
  .mutation(async ({ input, ctx }) => {
    const existingSession = sessions.find(
      (s) => s.sellerId === ctx.user.id && s.status === "open"
    );

    if (existingSession) {
      throw new Error("Session already open for this seller");
    }

    const session: POSSessionSummary = {
      sessionId: `sess-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      sellerId: ctx.user.id,
      sellerName: ctx.user.name || "Vendedor",
      startDate: new Date().toISOString(),
      status: "open",
      transactions: 0,
      totalSales: 0,
      totalCash: 0,
      totalCard: 0,
      totalNcop: 0,
      totalTransfer: 0,
      totalRefunds: 0,
      openingCash: input.openingCash,
      closingCash: 0,
      expectedCash: input.openingCash,
      cashDifference: 0,
      notes: input.notes,
      createdAt: new Date().toISOString(),
    };

    sessions.push(session);
    return session;
  });

export const closePOSSessionProcedure = protectedProcedure
  .input(
    z.object({
      sessionId: z.string(),
      closingCash: z.number(),
      notes: z.string().optional(),
    })
  )
  .mutation(async ({ input, ctx }) => {
    const session = sessions.find((s) => s.sessionId === input.sessionId);
    if (!session) {
      throw new Error("Session not found");
    }

    if (session.status === "closed") {
      throw new Error("Session already closed");
    }

    if (session.sellerId !== ctx.user.id) {
      throw new Error("Unauthorized to close this session");
    }

    const sessionTransactions = transactions.filter(
      (t) =>
        t.sellerId === session.sellerId &&
        t.createdAt >= session.startDate &&
        t.status === "completed"
    );

    session.transactions = sessionTransactions.length;
    session.totalSales = sessionTransactions.reduce((sum, t) => sum + t.total, 0);

    sessionTransactions.forEach((t) => {
      t.payments.forEach((p) => {
        switch (p.method) {
          case "cash":
            session.totalCash += p.amount;
            break;
          case "card":
            session.totalCard += p.amount;
            break;
          case "ncop":
            session.totalNcop += p.amount;
            break;
          case "transfer":
            session.totalTransfer += p.amount;
            break;
        }
      });

      if (t.status === "refunded") {
        session.totalRefunds += Math.abs(t.total);
      }
    });

    session.expectedCash = session.openingCash + session.totalCash;
    session.closingCash = input.closingCash;
    session.cashDifference = session.closingCash - session.expectedCash;
    session.status = "closed";
    session.endDate = new Date().toISOString();
    session.closedAt = new Date().toISOString();

    if (input.notes) {
      session.notes = (session.notes || "") + "\n" + input.notes;
    }

    return session;
  });

export { sessions };
