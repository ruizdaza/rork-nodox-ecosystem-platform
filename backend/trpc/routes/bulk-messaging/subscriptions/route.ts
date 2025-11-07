import { protectedProcedure } from "@/backend/trpc/create-context";
import { z } from "zod";

const subscribeSchema = z.object({
  allyId: z.string(),
  allyName: z.string(),
  planId: z.string(),
  billingCycle: z.enum(["monthly", "yearly"]),
  paymentMethod: z.object({
    type: z.enum(["card", "bank_transfer", "paypal"]),
    last4: z.string().optional(),
    expiryMonth: z.number().optional(),
    expiryYear: z.number().optional(),
  }).optional(),
});

const getSubscriptionSchema = z.object({
  allyId: z.string(),
});

const updateSubscriptionSchema = z.object({
  subscriptionId: z.string(),
  planId: z.string().optional(),
  billingCycle: z.enum(["monthly", "yearly"]).optional(),
  autoRenew: z.boolean().optional(),
});

const cancelSubscriptionSchema = z.object({
  subscriptionId: z.string(),
  reason: z.string().optional(),
});

const getPlansSchema = z.object({
  includeInactive: z.boolean().optional(),
});

const getUsageStatsSchema = z.object({
  subscriptionId: z.string(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
});

const AVAILABLE_PLANS = [
  {
    id: "starter",
    name: "Plan Inicial",
    description: "Perfecto para comenzar con mensajería masiva",
    features: {
      freeMessagesPerMonth: 500,
      costPerAdditionalMessage: 0.05,
      maxRecipientsPerCampaign: 1000,
      allowScheduling: true,
      allowSegmentation: false,
      analyticsIncluded: true,
      priorityDelivery: false,
      dedicatedSupport: false,
      apiAccess: false,
      customTemplates: false,
    },
    pricing: {
      monthlyFee: 29.99,
      yearlyFee: 299.99,
      yearlyDiscount: 16.67,
    },
    limits: {
      campaignsPerMonth: 10,
      maxMessageLength: 500,
      attachmentsAllowed: false,
      maxAttachmentSize: 0,
    },
  },
  {
    id: "professional",
    name: "Plan Profesional",
    description: "Para negocios en crecimiento",
    features: {
      freeMessagesPerMonth: 2000,
      costPerAdditionalMessage: 0.04,
      maxRecipientsPerCampaign: 5000,
      allowScheduling: true,
      allowSegmentation: true,
      analyticsIncluded: true,
      priorityDelivery: true,
      dedicatedSupport: false,
      apiAccess: false,
      customTemplates: true,
    },
    pricing: {
      monthlyFee: 79.99,
      yearlyFee: 799.99,
      yearlyDiscount: 16.67,
    },
    limits: {
      campaignsPerMonth: 50,
      maxMessageLength: 1000,
      attachmentsAllowed: true,
      maxAttachmentSize: 5,
    },
  },
  {
    id: "enterprise",
    name: "Plan Empresarial",
    description: "Solución completa para grandes volúmenes",
    features: {
      freeMessagesPerMonth: 10000,
      costPerAdditionalMessage: 0.03,
      maxRecipientsPerCampaign: 50000,
      allowScheduling: true,
      allowSegmentation: true,
      analyticsIncluded: true,
      priorityDelivery: true,
      dedicatedSupport: true,
      apiAccess: true,
      customTemplates: true,
    },
    pricing: {
      monthlyFee: 299.99,
      yearlyFee: 2999.99,
      yearlyDiscount: 16.67,
    },
    limits: {
      campaignsPerMonth: 999,
      maxMessageLength: 2000,
      attachmentsAllowed: true,
      maxAttachmentSize: 25,
    },
  },
];

export const getBulkMessagingPlansProcedure = protectedProcedure
  .input(getPlansSchema)
  .query(async ({ input }) => {
    console.log("[tRPC] Getting bulk messaging plans", input);
    
    return {
      plans: AVAILABLE_PLANS,
      total: AVAILABLE_PLANS.length,
    };
  });

export const getBulkSubscriptionProcedure = protectedProcedure
  .input(getSubscriptionSchema)
  .query(async ({ input }) => {
    console.log("[tRPC] Getting bulk messaging subscription for ally", input.allyId);

    const plan = AVAILABLE_PLANS[1];

    return {
      subscription: {
        id: "sub-1",
        allyId: input.allyId,
        allyName: "Mi Negocio",
        plan,
        status: "active" as const,
        billingCycle: "monthly" as const,
        startDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15),
        renewalDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 15),
        usage: {
          messagesUsedThisMonth: 1245,
          messagesRemainingFree: 755,
          additionalMessagesUsed: 0,
          campaignsUsedThisMonth: 8,
          totalCostThisMonth: 79.99,
        },
        paymentMethod: {
          type: "card" as const,
          last4: "4242",
          expiryMonth: 12,
          expiryYear: 2026,
        },
        autoRenew: true,
      },
    };
  });

export const createBulkSubscriptionProcedure = protectedProcedure
  .input(subscribeSchema)
  .mutation(async ({ input }) => {
    console.log("[tRPC] Creating bulk messaging subscription", input);

    const plan = AVAILABLE_PLANS.find(p => p.id === input.planId);
    if (!plan) {
      throw new Error("Plan no encontrado");
    }

    const newSubscription = {
      id: `sub-${Date.now()}`,
      allyId: input.allyId,
      allyName: input.allyName,
      plan,
      status: "trial" as const,
      billingCycle: input.billingCycle,
      startDate: new Date(),
      renewalDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
      trialEndsAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14),
      usage: {
        messagesUsedThisMonth: 0,
        messagesRemainingFree: plan.features.freeMessagesPerMonth,
        additionalMessagesUsed: 0,
        campaignsUsedThisMonth: 0,
        totalCostThisMonth: 0,
      },
      paymentMethod: input.paymentMethod,
      autoRenew: true,
    };

    return {
      subscription: newSubscription,
      message: "Suscripción creada exitosamente. Tienes 14 días de prueba gratis.",
    };
  });

export const updateBulkSubscriptionProcedure = protectedProcedure
  .input(updateSubscriptionSchema)
  .mutation(async ({ input }) => {
    console.log("[tRPC] Updating bulk messaging subscription", input);

    return {
      success: true,
      subscriptionId: input.subscriptionId,
      updatedFields: {
        planId: input.planId,
        billingCycle: input.billingCycle,
        autoRenew: input.autoRenew,
      },
      updatedAt: new Date(),
      message: "Suscripción actualizada exitosamente",
    };
  });

export const cancelBulkSubscriptionProcedure = protectedProcedure
  .input(cancelSubscriptionSchema)
  .mutation(async ({ input }) => {
    console.log("[tRPC] Cancelling bulk messaging subscription", input);

    return {
      success: true,
      subscriptionId: input.subscriptionId,
      status: "cancelled" as const,
      cancelledAt: new Date(),
      accessUntil: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
      message: "Suscripción cancelada. Tendrás acceso hasta el final del período de facturación actual.",
    };
  });

export const getBulkMessagingUsageStatsProcedure = protectedProcedure
  .input(getUsageStatsSchema)
  .query(async ({ input }) => {
    console.log("[tRPC] Getting bulk messaging usage stats", input);

    return {
      subscriptionId: input.subscriptionId,
      period: {
        start: input.startDate || new Date(Date.now() - 1000 * 60 * 60 * 24 * 30),
        end: input.endDate || new Date(),
      },
      usage: {
        totalMessages: 1245,
        freeMessagesUsed: 1245,
        additionalMessagesUsed: 0,
        totalCampaigns: 8,
        totalCost: 79.99,
      },
      breakdown: [
        {
          date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
          messages: 523,
          cost: 0,
          campaigns: 1,
        },
        {
          date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10),
          messages: 320,
          cost: 0,
          campaigns: 1,
        },
        {
          date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15),
          messages: 402,
          cost: 0,
          campaigns: 1,
        },
      ],
      projectedCost: {
        remainingDays: 15,
        projectedMessages: 1867,
        projectedAdditionalMessages: 0,
        projectedCost: 79.99,
      },
    };
  });