import { protectedProcedure } from "@/backend/trpc/create-context";
import { z } from "zod";

interface ReferralQRCode {
  id: string;
  referrerId: string;
  code: string;
  url: string;
  qrImageUrl: string;
  campaignId?: string;
  customData?: Record<string, any>;
  scans: number;
  uniqueScans: number;
  conversions: number;
  createdAt: string;
  expiresAt?: string;
  isActive: boolean;
}

let qrCodes: ReferralQRCode[] = [];

export const getReferralQRCodesProcedure = protectedProcedure
  .input(
    z.object({
      referrerId: z.string().optional(),
      campaignId: z.string().optional(),
      isActive: z.boolean().optional(),
    })
  )
  .query(async ({ input, ctx }) => {
    let filtered = [...qrCodes];

    const referrerId = input.referrerId || ctx.user.id;
    filtered = filtered.filter((qr) => qr.referrerId === referrerId);

    if (input.campaignId) {
      filtered = filtered.filter((qr) => qr.campaignId === input.campaignId);
    }

    if (input.isActive !== undefined) {
      filtered = filtered.filter((qr) => qr.isActive === input.isActive);
    }

    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return filtered;
  });

export const getReferralQRCodeProcedure = protectedProcedure
  .input(z.object({ qrId: z.string() }))
  .query(async ({ input }) => {
    const qr = qrCodes.find((q) => q.id === input.qrId);
    if (!qr) {
      throw new Error("QR code not found");
    }
    return qr;
  });

export const createReferralQRCodeProcedure = protectedProcedure
  .input(
    z.object({
      referrerId: z.string().optional(),
      campaignId: z.string().optional(),
      customData: z.record(z.string(), z.any()).optional(),
      expiresAt: z.string().optional(),
    })
  )
  .mutation(async ({ input, ctx }) => {
    const referrerId = input.referrerId || ctx.user.id;
    const code = `NODOX-${referrerId.slice(-6).toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;
    const url = `https://nodox.app/join?ref=${code}`;
    
    const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(url)}`;

    const newQRCode: ReferralQRCode = {
      id: `qr-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      referrerId,
      code,
      url,
      qrImageUrl,
      campaignId: input.campaignId,
      customData: input.customData || {},
      scans: 0,
      uniqueScans: 0,
      conversions: 0,
      createdAt: new Date().toISOString(),
      expiresAt: input.expiresAt,
      isActive: true,
    };

    qrCodes.push(newQRCode);
    console.log('QR Code created:', newQRCode.id, newQRCode.code);
    return newQRCode;
  });

export const updateReferralQRCodeProcedure = protectedProcedure
  .input(
    z.object({
      qrId: z.string(),
      isActive: z.boolean().optional(),
      customData: z.record(z.string(), z.any()).optional(),
      expiresAt: z.string().optional(),
    })
  )
  .mutation(async ({ input }) => {
    const index = qrCodes.findIndex((q) => q.id === input.qrId);
    if (index === -1) {
      throw new Error("QR code not found");
    }

    const updates: Partial<ReferralQRCode> = {};
    if (input.isActive !== undefined) updates.isActive = input.isActive;
    if (input.customData) updates.customData = input.customData;
    if (input.expiresAt) updates.expiresAt = input.expiresAt;

    qrCodes[index] = {
      ...qrCodes[index],
      ...updates,
    };

    console.log('QR Code updated:', qrCodes[index].id);
    return qrCodes[index];
  });

export const trackQRScanProcedure = protectedProcedure
  .input(
    z.object({
      qrId: z.string(),
      userId: z.string().optional(),
    })
  )
  .mutation(async ({ input }) => {
    const qr = qrCodes.find((q) => q.id === input.qrId);
    if (!qr) {
      throw new Error("QR code not found");
    }

    if (!qr.isActive) {
      throw new Error("QR code is inactive");
    }

    if (qr.expiresAt && new Date(qr.expiresAt) < new Date()) {
      throw new Error("QR code has expired");
    }

    qr.scans += 1;
    if (input.userId) {
      qr.uniqueScans += 1;
    }

    console.log('QR Scan tracked:', qr.id, 'Total scans:', qr.scans);
    return qr;
  });

export const trackQRConversionProcedure = protectedProcedure
  .input(z.object({ qrId: z.string() }))
  .mutation(async ({ input }) => {
    const qr = qrCodes.find((q) => q.id === input.qrId);
    if (!qr) {
      throw new Error("QR code not found");
    }

    qr.conversions += 1;

    console.log('QR Conversion tracked:', qr.id, 'Total conversions:', qr.conversions);
    return qr;
  });

export const deleteReferralQRCodeProcedure = protectedProcedure
  .input(z.object({ qrId: z.string() }))
  .mutation(async ({ input }) => {
    const index = qrCodes.findIndex((q) => q.id === input.qrId);
    if (index === -1) {
      throw new Error("QR code not found");
    }

    qrCodes.splice(index, 1);
    console.log('QR Code deleted:', input.qrId);
    return { success: true };
  });

export const getQRCodeStatsProcedure = protectedProcedure
  .input(z.object({ referrerId: z.string().optional() }))
  .query(async ({ input, ctx }) => {
    const referrerId = input.referrerId || ctx.user.id;
    const userQRCodes = qrCodes.filter((qr) => qr.referrerId === referrerId);

    const totalScans = userQRCodes.reduce((sum, qr) => sum + qr.scans, 0);
    const totalUniqueScans = userQRCodes.reduce((sum, qr) => sum + qr.uniqueScans, 0);
    const totalConversions = userQRCodes.reduce((sum, qr) => sum + qr.conversions, 0);
    const conversionRate = totalScans > 0 ? (totalConversions / totalScans) * 100 : 0;

    const activeQRCodes = userQRCodes.filter((qr) => qr.isActive).length;
    const topPerformingQR = userQRCodes.sort((a, b) => b.conversions - a.conversions)[0];

    return {
      totalQRCodes: userQRCodes.length,
      activeQRCodes,
      totalScans,
      totalUniqueScans,
      totalConversions,
      conversionRate,
      topPerformingQR,
    };
  });

export { qrCodes };
