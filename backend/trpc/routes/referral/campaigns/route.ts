import { protectedProcedure } from "@/backend/trpc/create-context";
import { z } from "zod";
import { ReferralCampaign } from "@/types/referral";

let campaigns: ReferralCampaign[] = [];

export const getReferralCampaignsProcedure = protectedProcedure
  .input(
    z.object({
      referrerId: z.string().optional(),
      status: z.enum(["draft", "active", "paused", "completed"]).optional(),
    })
  )
  .query(async ({ input, ctx }) => {
    let filtered = [...campaigns];

    const referrerId = input.referrerId || ctx.user.id;
    filtered = filtered.filter((c) => c.referrerId === referrerId);

    if (input.status) {
      filtered = filtered.filter((c) => c.status === input.status);
    }

    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return filtered;
  });

export const createReferralCampaignProcedure = protectedProcedure
  .input(
    z.object({
      referrerId: z.string().optional(),
      name: z.string(),
      description: z.string(),
      type: z.enum(["email", "social", "whatsapp", "sms", "multi_channel"]),
      startDate: z.string(),
      endDate: z.string().optional(),
      targetAudience: z.array(z.string()),
      message: z.string(),
      mediaUrl: z.string().optional(),
      ctaText: z.string(),
      ctaUrl: z.string(),
      budget: z.number().optional(),
    })
  )
  .mutation(async ({ input, ctx }) => {
    const newCampaign: ReferralCampaign = {
      id: `camp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      referrerId: input.referrerId || ctx.user.id,
      name: input.name,
      description: input.description,
      type: input.type,
      status: "draft",
      startDate: input.startDate,
      endDate: input.endDate,
      targetAudience: input.targetAudience,
      message: input.message,
      mediaUrl: input.mediaUrl,
      ctaText: input.ctaText,
      ctaUrl: input.ctaUrl,
      metrics: {
        sent: 0,
        delivered: 0,
        opened: 0,
        clicked: 0,
        converted: 0,
        revenue: 0,
      },
      budget: input.budget,
      spent: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    campaigns.push(newCampaign);
    return newCampaign;
  });

export const updateReferralCampaignProcedure = protectedProcedure
  .input(
    z.object({
      campaignId: z.string(),
      status: z.enum(["draft", "active", "paused", "completed"]).optional(),
      name: z.string().optional(),
      description: z.string().optional(),
      message: z.string().optional(),
      mediaUrl: z.string().optional(),
      endDate: z.string().optional(),
    })
  )
  .mutation(async ({ input }) => {
    const index = campaigns.findIndex((c) => c.id === input.campaignId);
    if (index === -1) {
      throw new Error("Campaign not found");
    }

    campaigns[index] = {
      ...campaigns[index],
      ...input,
      updatedAt: new Date().toISOString(),
    };

    return campaigns[index];
  });

export const updateCampaignMetricsProcedure = protectedProcedure
  .input(
    z.object({
      campaignId: z.string(),
      metric: z.enum(["sent", "delivered", "opened", "clicked", "converted"]),
      increment: z.number().default(1),
    })
  )
  .mutation(async ({ input }) => {
    const campaign = campaigns.find((c) => c.id === input.campaignId);
    if (!campaign) {
      throw new Error("Campaign not found");
    }

    campaign.metrics[input.metric] += input.increment;
    campaign.updatedAt = new Date().toISOString();

    return campaign;
  });

export const deleteCampaignProcedure = protectedProcedure
  .input(z.object({ campaignId: z.string() }))
  .mutation(async ({ input }) => {
    const index = campaigns.findIndex((c) => c.id === input.campaignId);
    if (index === -1) {
      throw new Error("Campaign not found");
    }

    if (campaigns[index].status === "active") {
      throw new Error("Cannot delete active campaign");
    }

    campaigns.splice(index, 1);
    return { success: true };
  });

export { campaigns };
