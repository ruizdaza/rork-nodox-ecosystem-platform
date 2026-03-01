import { publicProcedure } from "@/backend/trpc/create-context";
import { z } from "zod";
import { db } from "@/lib/firebase-server";

export const validateReferralCodeProcedure = publicProcedure
  .input(z.object({
    code: z.string().min(1),
  }))
  .mutation(async ({ input }) => {
    try {
      const usersRef = db.collection("users");
      const snapshot = await usersRef.where("referralCode", "==", input.code.trim()).limit(1).get();

      if (!snapshot.empty) {
        return {
            valid: true,
            referrerId: snapshot.docs[0].id
        };
      }

      return { valid: false, referrerId: null };

    } catch (error) {
      console.error("[Referral] Validation Error:", error);
      throw new Error("Failed to validate referral code");
    }
  });
