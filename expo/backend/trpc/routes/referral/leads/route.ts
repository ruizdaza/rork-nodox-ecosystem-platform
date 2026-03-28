import { protectedProcedure } from "@/backend/trpc/create-context";
import { z } from "zod";
import { ReferralLead } from "@/types/referral";

let referralLeads: ReferralLead[] = [];

export const getReferralLeadsProcedure = protectedProcedure
  .input(
    z.object({
      referrerId: z.string().optional(),
      status: z.enum(["lead", "contacted", "qualified", "converted", "lost"]).optional(),
      search: z.string().optional(),
      tags: z.array(z.string()).optional(),
      limit: z.number().optional().default(50),
    })
  )
  .query(async ({ input, ctx }) => {
    let filtered = [...referralLeads];

    const referrerId = input.referrerId || ctx.user.id;
    filtered = filtered.filter((lead) => lead.referrerId === referrerId);

    if (input.status) {
      filtered = filtered.filter((lead) => lead.status === input.status);
    }

    if (input.search) {
      const searchLower = input.search.toLowerCase();
      filtered = filtered.filter(
        (lead) =>
          lead.name.toLowerCase().includes(searchLower) ||
          lead.email.toLowerCase().includes(searchLower) ||
          lead.phone.toLowerCase().includes(searchLower)
      );
    }

    if (input.tags && input.tags.length > 0) {
      filtered = filtered.filter((lead) =>
        input.tags!.some((tag) => lead.tags.includes(tag))
      );
    }

    filtered.sort((a, b) => new Date(b.joinDate).getTime() - new Date(a.joinDate).getTime());

    return filtered.slice(0, input.limit);
  });

export const getReferralLeadProcedure = protectedProcedure
  .input(z.object({ leadId: z.string() }))
  .query(async ({ input }) => {
    const lead = referralLeads.find((l) => l.id === input.leadId);
    if (!lead) {
      throw new Error("Lead not found");
    }
    return lead;
  });

export const createReferralLeadProcedure = protectedProcedure
  .input(
    z.object({
      referrerId: z.string().optional(),
      name: z.string(),
      email: z.string().email(),
      phone: z.string(),
      source: z.enum([
        "direct_link",
        "qr_code",
        "social_media",
        "email",
        "whatsapp",
        "other",
      ]),
      tags: z.array(z.string()).optional(),
      notes: z.string().optional(),
      customFields: z.record(z.string(), z.any()).optional(),
    })
  )
  .mutation(async ({ input, ctx }) => {
    const newLead: ReferralLead = {
      id: `lead-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      referrerId: input.referrerId || ctx.user.id,
      name: input.name,
      email: input.email,
      phone: input.phone,
      status: "lead",
      source: input.source,
      joinDate: new Date().toISOString(),
      tags: input.tags || [],
      notes: input.notes || "",
      interactionCount: 0,
      totalSpent: 0,
      totalOrders: 0,
      lifetimeValue: 0,
      commissionEarned: 0,
      level: 1,
      isAlly: false,
      customFields: input.customFields || {},
    };

    referralLeads.push(newLead);
    return newLead;
  });

export const updateReferralLeadProcedure = protectedProcedure
  .input(
    z.object({
      leadId: z.string(),
      status: z.enum(["lead", "contacted", "qualified", "converted", "lost"]).optional(),
      lastContactDate: z.string().optional(),
      nextFollowUpDate: z.string().optional(),
      tags: z.array(z.string()).optional(),
      notes: z.string().optional(),
      isAlly: z.boolean().optional(),
      allyType: z.enum(["business", "individual"]).optional(),
      customFields: z.record(z.string(), z.any()).optional(),
    })
  )
  .mutation(async ({ input }) => {
    const index = referralLeads.findIndex((l) => l.id === input.leadId);
    if (index === -1) {
      throw new Error("Lead not found");
    }

    const updates: Partial<ReferralLead> = { ...input };

    if (input.status === "converted" && !referralLeads[index].conversionDate) {
      updates.conversionDate = new Date().toISOString();
    }

    delete (updates as any).leadId;

    referralLeads[index] = {
      ...referralLeads[index],
      ...updates,
    };

    return referralLeads[index];
  });

export const deleteReferralLeadProcedure = protectedProcedure
  .input(z.object({ leadId: z.string() }))
  .mutation(async ({ input }) => {
    const index = referralLeads.findIndex((l) => l.id === input.leadId);
    if (index === -1) {
      throw new Error("Lead not found");
    }

    referralLeads.splice(index, 1);
    return { success: true };
  });

export const updateLeadSpentProcedure = protectedProcedure
  .input(
    z.object({
      leadId: z.string(),
      amount: z.number(),
    })
  )
  .mutation(async ({ input }) => {
    const lead = referralLeads.find((l) => l.id === input.leadId);
    if (!lead) {
      throw new Error("Lead not found");
    }

    lead.totalSpent += input.amount;
    lead.totalOrders += 1;
    lead.lifetimeValue = lead.totalSpent;

    return lead;
  });

export { referralLeads };
