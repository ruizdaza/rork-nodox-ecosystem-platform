import { protectedProcedure } from "@/backend/trpc/create-context";
import { z } from "zod";

const createCampaignSchema = z.object({
  allyId: z.string(),
  allyName: z.string(),
  name: z.string(),
  description: z.string().optional(),
  message: z.object({
    subject: z.string().optional(),
    content: z.string(),
    type: z.enum(["text", "rich", "template"]),
    templateId: z.string().optional(),
    variables: z.object({}).passthrough().optional(),
    attachments: z.array(
      z.object({
        url: z.string(),
        name: z.string(),
        size: z.number(),
        type: z.string(),
      })
    ).optional(),
  }),
  recipients: z.object({
    total: z.number(),
    type: z.enum(["all_customers", "segment", "manual_list"]),
    segmentId: z.string().optional(),
    segmentName: z.string().optional(),
    userIds: z.array(z.string()).optional(),
    filters: z.object({
      hasActiveOrders: z.boolean().optional(),
      minPurchaseAmount: z.number().optional(),
      lastPurchaseDays: z.number().optional(),
      tags: z.array(z.string()).optional(),
      location: z.array(z.string()).optional(),
    }).optional(),
  }),
  scheduling: z.object({
    sendNow: z.boolean(),
    scheduledFor: z.date().optional(),
    timezone: z.string().optional(),
    sendInBatches: z.boolean().optional(),
    batchSize: z.number().optional(),
    batchDelayMinutes: z.number().optional(),
  }),
});

const updateCampaignStatusSchema = z.object({
  campaignId: z.string(),
  status: z.enum(["draft", "scheduled", "sending", "sent", "paused", "cancelled", "failed"]),
});

const sendCampaignSchema = z.object({
  campaignId: z.string(),
});

const getCampaignsSchema = z.object({
  allyId: z.string(),
  status: z.enum(["draft", "scheduled", "sending", "sent", "paused", "cancelled", "failed", "all"]).optional(),
  limit: z.number().optional(),
  offset: z.number().optional(),
});

const getCampaignAnalyticsSchema = z.object({
  campaignId: z.string(),
});

export const getBulkCampaignsProcedure = protectedProcedure
  .input(getCampaignsSchema)
  .query(async ({ input }) => {
    console.log("[tRPC] Getting bulk campaigns", input);
    
    const campaigns = [
      {
        id: "campaign-1",
        allyId: input.allyId,
        allyName: "Mi Negocio",
        name: "Promoción de Verano",
        description: "Descuentos especiales para clientes frecuentes",
        status: "sent" as const,
        message: {
          content: "¡Hola {{name}}! 🌞 Aprovecha nuestro descuento del 30% en productos seleccionados. Válido hasta el 31 de julio.",
          type: "text" as const,
        },
        recipients: {
          total: 523,
          type: "segment" as const,
          segmentName: "Clientes Frecuentes",
        },
        scheduling: {
          sendNow: false,
          scheduledFor: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
          timezone: "America/Bogota",
        },
        analytics: {
          sent: 523,
          delivered: 515,
          failed: 8,
          opened: 387,
          clicked: 124,
          unsubscribed: 2,
          cost: 0,
        },
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4),
        updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
        sentAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
        completedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
      },
    ];

    const filteredCampaigns = input.status && input.status !== "all"
      ? campaigns.filter(c => c.status === input.status)
      : campaigns;

    const paginatedCampaigns = filteredCampaigns.slice(
      input.offset || 0,
      (input.offset || 0) + (input.limit || 50)
    );

    return {
      campaigns: paginatedCampaigns,
      total: filteredCampaigns.length,
      hasMore: (input.offset || 0) + (input.limit || 50) < filteredCampaigns.length,
    };
  });

export const createBulkCampaignProcedure = protectedProcedure
  .input(createCampaignSchema)
  .mutation(async ({ input }) => {
    console.log("[tRPC] Creating bulk campaign", input.name);

    const newCampaign = {
      id: `campaign-${Date.now()}`,
      ...input,
      status: "draft" as const,
      analytics: {
        sent: 0,
        delivered: 0,
        failed: 0,
        opened: 0,
        clicked: 0,
        unsubscribed: 0,
        cost: 0,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return newCampaign;
  });

export const updateCampaignStatusProcedure = protectedProcedure
  .input(updateCampaignStatusSchema)
  .mutation(async ({ input }) => {
    console.log("[tRPC] Updating campaign status", input.campaignId, input.status);

    return {
      success: true,
      campaignId: input.campaignId,
      newStatus: input.status,
      updatedAt: new Date(),
    };
  });

export const sendBulkCampaignProcedure = protectedProcedure
  .input(sendCampaignSchema)
  .mutation(async ({ input }) => {
    console.log("[tRPC] Sending bulk campaign", input.campaignId);

    await new Promise(resolve => setTimeout(resolve, 1000));

    return {
      success: true,
      campaignId: input.campaignId,
      status: "sending" as const,
      estimatedCompletion: new Date(Date.now() + 1000 * 60 * 5),
      analytics: {
        sent: 0,
        delivered: 0,
        failed: 0,
        opened: 0,
        clicked: 0,
        unsubscribed: 0,
        cost: 0,
      },
    };
  });

export const getBulkCampaignAnalyticsProcedure = protectedProcedure
  .input(getCampaignAnalyticsSchema)
  .query(async ({ input }) => {
    console.log("[tRPC] Getting campaign analytics", input.campaignId);

    return {
      campaignId: input.campaignId,
      analytics: {
        sent: 523,
        delivered: 515,
        failed: 8,
        opened: 387,
        clicked: 124,
        unsubscribed: 2,
        cost: 0,
        deliveryRate: 98.47,
        openRate: 75.15,
        clickRate: 24.08,
        unsubscribeRate: 0.39,
      },
      timeline: [
        {
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
          event: "campaign_started",
          count: 523,
        },
        {
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3 + 1000 * 60 * 5),
          event: "delivery_completed",
          count: 515,
        },
        {
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
          event: "opens_peak",
          count: 387,
        },
      ],
      topPerformingLinks: [
        { url: "https://example.com/promo", clicks: 124 },
      ],
    };
  });