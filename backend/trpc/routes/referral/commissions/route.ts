import { protectedProcedure } from "@/backend/trpc/create-context";
import { z } from "zod";
import { ReferralCommission } from "@/types/referral";

let commissions: ReferralCommission[] = [];

export const getReferralCommissionsProcedure = protectedProcedure
  .input(
    z.object({
      referrerId: z.string().optional(),
      leadId: z.string().optional(),
      status: z.enum(["pending", "approved", "paid", "cancelled"]).optional(),
      type: z
        .enum(["signup_bonus", "purchase_commission", "recurring_commission", "milestone_bonus"])
        .optional(),
    })
  )
  .query(async ({ input, ctx }) => {
    let filtered = [...commissions];

    const referrerId = input.referrerId || ctx.user.id;
    filtered = filtered.filter((c) => c.referrerId === referrerId);

    if (input.leadId) {
      filtered = filtered.filter((c) => c.leadId === input.leadId);
    }

    if (input.status) {
      filtered = filtered.filter((c) => c.status === input.status);
    }

    if (input.type) {
      filtered = filtered.filter((c) => c.type === input.type);
    }

    filtered.sort((a, b) => new Date(b.earnedDate).getTime() - new Date(a.earnedDate).getTime());

    return filtered;
  });

export const createReferralCommissionProcedure = protectedProcedure
  .input(
    z.object({
      referrerId: z.string(),
      leadId: z.string(),
      type: z.enum([
        "signup_bonus",
        "purchase_commission",
        "recurring_commission",
        "milestone_bonus",
      ]),
      amount: z.number(),
      currency: z.enum(["NCOP", "COP"]).default("NCOP"),
      orderId: z.string().optional(),
      orderValue: z.number().optional(),
      commissionRate: z.number().optional(),
      description: z.string(),
    })
  )
  .mutation(async ({ input }) => {
    const newCommission: ReferralCommission = {
      id: `comm-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ...input,
      status: "pending",
      earnedDate: new Date().toISOString(),
    };

    commissions.push(newCommission);
    return newCommission;
  });

export const updateCommissionStatusProcedure = protectedProcedure
  .input(
    z.object({
      commissionId: z.string(),
      status: z.enum(["approved", "paid", "cancelled"]),
      paymentMethod: z.string().optional(),
      transactionId: z.string().optional(),
    })
  )
  .mutation(async ({ input }) => {
    const commission = commissions.find((c) => c.id === input.commissionId);
    if (!commission) {
      throw new Error("Commission not found");
    }

    commission.status = input.status;

    if (input.status === "paid") {
      commission.paidDate = new Date().toISOString();
      commission.paymentMethod = input.paymentMethod;
      commission.transactionId = input.transactionId;
    }

    return commission;
  });

export const getCommissionSummaryProcedure = protectedProcedure
  .input(
    z.object({
      referrerId: z.string().optional(),
    })
  )
  .query(async ({ input, ctx }) => {
    const referrerId = input.referrerId || ctx.user.id;
    const userCommissions = commissions.filter((c) => c.referrerId === referrerId);

    const summary = {
      totalEarned: userCommissions.reduce((sum, c) => sum + c.amount, 0),
      pending: userCommissions
        .filter((c) => c.status === "pending")
        .reduce((sum, c) => sum + c.amount, 0),
      approved: userCommissions
        .filter((c) => c.status === "approved")
        .reduce((sum, c) => sum + c.amount, 0),
      paid: userCommissions
        .filter((c) => c.status === "paid")
        .reduce((sum, c) => sum + c.amount, 0),
      cancelled: userCommissions
        .filter((c) => c.status === "cancelled")
        .reduce((sum, c) => sum + c.amount, 0),
      thisMonth: userCommissions
        .filter((c) => {
          const earnedDate = new Date(c.earnedDate);
          const now = new Date();
          return (
            earnedDate.getMonth() === now.getMonth() &&
            earnedDate.getFullYear() === now.getFullYear()
          );
        })
        .reduce((sum, c) => sum + c.amount, 0),
      count: {
        total: userCommissions.length,
        pending: userCommissions.filter((c) => c.status === "pending").length,
        approved: userCommissions.filter((c) => c.status === "approved").length,
        paid: userCommissions.filter((c) => c.status === "paid").length,
      },
    };

    return summary;
  });

export { commissions };
