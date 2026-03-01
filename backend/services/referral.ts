import { db } from "@/lib/firebase-server";
import { FieldValue } from "firebase-admin/firestore";

const REFERRAL_REWARD_AMOUNT = 500;

export const processReferralReward = async (userId: string) => {
  console.log(`[Referral] Checking rewards for user: ${userId}`);

  try {
    await db.runTransaction(async (t) => {
      const userRef = db.collection("users").doc(userId);
      const userDoc = await t.get(userRef);

      if (!userDoc.exists) {
        throw new Error("User not found");
      }

      const userData = userDoc.data();
      const referrerId = userData?.referredBy;
      const alreadyPaid = userData?.referralCommissionPaid;

      if (!referrerId) {
        console.log(`[Referral] User ${userId} has no referrer.`);
        return;
      }

      if (alreadyPaid) {
        console.log(`[Referral] Commission already paid for user ${userId}.`);
        return;
      }

      const referrerWalletRef = db.collection("wallets").doc(referrerId);
      const referrerWalletDoc = await t.get(referrerWalletRef);

      if (!referrerWalletDoc.exists) {
        t.set(referrerWalletRef, {
            ncopBalance: 0,
            copBalance: 0,
            userId: referrerId,
            lastUpdated: new Date().toISOString()
        });
      }

      const referrerData = referrerWalletDoc.exists ? referrerWalletDoc.data() : { ncopBalance: 0 };
      const currentNcop = referrerData?.ncopBalance || 0;
      const newNcop = currentNcop + REFERRAL_REWARD_AMOUNT;

      t.update(referrerWalletRef, {
        ncopBalance: newNcop,
        lastUpdated: new Date().toISOString()
      });

      const txRef = db.collection("transactions").doc();
      t.set(txRef, {
        id: txRef.id,
        userId: referrerId,
        type: 'earn',
        currency: 'NCOP',
        amount: REFERRAL_REWARD_AMOUNT,
        balanceAfter: newNcop,
        description: `Recompensa por referido: ${userData?.name}`,
        category: 'referral',
        status: 'completed',
        metadata: {
          referredUserId: userId,
          referralCode: userData?.referralCode
        },
        createdAt: new Date().toISOString()
      });

      t.update(userRef, {
        referralCommissionPaid: true,
        referralPaidAt: new Date().toISOString()
      });
    });

    console.log(`[Referral] Reward processed successfully for referrer of ${userId}`);
    return { success: true };

  } catch (error) {
    console.error("[Referral] Process Reward Failed:", error);
    return { success: false, error };
  }
};
