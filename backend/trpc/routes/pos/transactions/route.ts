import { protectedProcedure } from "@/backend/trpc/create-context";
import { z } from "zod";
import { POSTransaction, POSTransactionItem, POSPayment } from "@/types/pos";

let transactions: POSTransaction[] = [];
let transactionCounter = 1;

export const getPOSTransactionsProcedure = protectedProcedure
  .input(
    z.object({
      startDate: z.string().optional(),
      endDate: z.string().optional(),
      status: z.enum(["pending", "completed", "cancelled", "refunded"]).optional(),
      sellerId: z.string().optional(),
      customerId: z.string().optional(),
      limit: z.number().optional().default(50),
    })
  )
  .query(async ({ input }) => {
    let filtered = [...transactions];

    if (input.startDate) {
      filtered = filtered.filter((t) => t.date >= input.startDate!);
    }

    if (input.endDate) {
      filtered = filtered.filter((t) => t.date <= input.endDate!);
    }

    if (input.status) {
      filtered = filtered.filter((t) => t.status === input.status);
    }

    if (input.sellerId) {
      filtered = filtered.filter((t) => t.sellerId === input.sellerId);
    }

    if (input.customerId) {
      filtered = filtered.filter((t) => t.customerId === input.customerId);
    }

    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return filtered.slice(0, input.limit);
  });

export const createPOSTransactionProcedure = protectedProcedure
  .input(
    z.object({
      items: z.array(
        z.object({
          productId: z.string(),
          productName: z.string(),
          sku: z.string().optional(),
          isService: z.boolean(),
          quantity: z.number(),
          unitPrice: z.number(),
          discount: z.number().default(0),
          tax: z.number(),
        })
      ),
      payments: z.array(
        z.object({
          method: z.enum(["cash", "card", "ncop", "transfer"]),
          amount: z.number(),
          amountReceived: z.number().optional(),
          reference: z.string().optional(),
          cardLast4: z.string().optional(),
          cardBrand: z.string().optional(),
        })
      ),
      customerId: z.string().optional(),
      customerName: z.string().optional(),
      discount: z.number().default(0),
      notes: z.string().optional(),
    })
  )
  .mutation(async ({ input, ctx }) => {
    const items: POSTransactionItem[] = input.items.map((item) => {
      const subtotal = item.quantity * item.unitPrice - item.discount;
      const total = subtotal + item.tax;
      return {
        id: `ti-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        ...item,
        subtotal,
        total,
      };
    });

    const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
    const tax = items.reduce((sum, item) => sum + item.tax, 0);
    const total = subtotal + tax - input.discount;

    const payments: POSPayment[] = input.payments.map((payment) => ({
      id: `pay-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ...payment,
      change: payment.amountReceived ? payment.amountReceived - payment.amount : 0,
      status: "completed",
      createdAt: new Date().toISOString(),
    }));

    const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
    if (Math.abs(totalPaid - total) > 0.01) {
      throw new Error("Payment amount does not match total");
    }

    const paymentMethod = payments.length === 1 ? payments[0].method : "mixed";

    const transaction: POSTransaction = {
      id: `trans-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      transactionNumber: `T${String(transactionCounter++).padStart(6, "0")}`,
      date: new Date().toISOString(),
      items,
      subtotal,
      tax,
      discount: input.discount,
      total,
      paymentMethod,
      payments,
      customerId: input.customerId,
      customerName: input.customerName,
      sellerId: ctx.user.id,
      sellerName: ctx.user.name || "Vendedor",
      status: "completed",
      notes: input.notes,
      createdAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
    };

    transactions.push(transaction);
    return transaction;
  });

export const refundPOSTransactionProcedure = protectedProcedure
  .input(
    z.object({
      transactionId: z.string(),
      reason: z.string(),
    })
  )
  .mutation(async ({ input, ctx }) => {
    const original = transactions.find((t) => t.id === input.transactionId);
    if (!original) {
      throw new Error("Transaction not found");
    }

    if (original.status === "refunded") {
      throw new Error("Transaction already refunded");
    }

    original.status = "refunded";
    original.refundReason = input.reason;
    original.refundedAt = new Date().toISOString();

    const refundTransaction: POSTransaction = {
      ...original,
      id: `trans-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      transactionNumber: `T${String(transactionCounter++).padStart(6, "0")}-R`,
      status: "completed",
      total: -original.total,
      subtotal: -original.subtotal,
      tax: -original.tax,
      items: original.items.map((item) => ({
        ...item,
        quantity: -item.quantity,
        subtotal: -item.subtotal,
        total: -item.total,
      })),
      refundedTransactionId: original.id,
      sellerId: ctx.user.id,
      sellerName: ctx.user.name || "Vendedor",
      createdAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
    };

    transactions.push(refundTransaction);
    return refundTransaction;
  });

export const cancelPOSTransactionProcedure = protectedProcedure
  .input(z.object({ transactionId: z.string() }))
  .mutation(async ({ input }) => {
    const transaction = transactions.find((t) => t.id === input.transactionId);
    if (!transaction) {
      throw new Error("Transaction not found");
    }

    if (transaction.status !== "pending") {
      throw new Error("Can only cancel pending transactions");
    }

    transaction.status = "cancelled";
    transaction.cancelledAt = new Date().toISOString();

    return transaction;
  });

export { transactions };
