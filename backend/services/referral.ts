import { db } from "@/lib/firebase-server";
import { doc, runTransaction, collection, getDoc } from "firebase/firestore";

const REFERRAL_REWARD_AMOUNT = 500; // 500 NCOP reward for the referrer

export const processReferralReward = async (userId: string) => {
  console.log(`[Referral] Checking rewards for user: ${userId}`);

  try {
    await runTransaction(db, async (transaction) => {
      // 1. Get User Data
      const userRef = doc(db, "users", userId);
      const userDoc = await transaction.get(userRef);

      if (!userDoc.exists()) {
        throw new Error("User not found");
      }

      const userData = userDoc.data();
      const referrerId = userData.referredBy;
      const alreadyPaid = userData.referralCommissionPaid;

      // 2. Validate Reward Conditions
      if (!referrerId) {
        console.log(`[Referral] User ${userId} has no referrer.`);
        return;
      }

      if (alreadyPaid) {
        console.log(`[Referral] Commission already paid for user ${userId}.`);
        return;
      }

      // 3. Get Referrer Wallet
      const referrerWalletRef = doc(db, "wallets", referrerId);
      const referrerWalletDoc = await transaction.get(referrerWalletRef);

      if (!referrerWalletDoc.exists()) {
        console.warn(`[Referral] Referrer wallet ${referrerId} not found. Creating...`);
        // Ideally handled by a user creation trigger, but safe to init here if missing
        transaction.set(referrerWalletRef, {
            ncopBalance: 0,
            copBalance: 0,
            userId: referrerId,
            lastUpdated: new Date().toISOString()
        });
      }

      const referrerData = referrerWalletDoc.exists() ? referrerWalletDoc.data() : { ncopBalance: 0 };
      const currentNcop = referrerData.ncopBalance || 0;
      const newNcop = currentNcop + REFERRAL_REWARD_AMOUNT;

      // 4. Update Referrer Wallet
      transaction.update(referrerWalletRef, {
        ncopBalance: newNcop,
        lastUpdated: new Date().toISOString()
      });

      // 5. Create Transaction Record for Referrer
      const txRef = doc(collection(db, "transactions"));
      transaction.set(txRef, {
        userId: referrerId,
        type: 'earn',
        currency: 'NCOP',
        amount: REFERRAL_REWARD_AMOUNT,
        balanceAfter: newNcop,
        description: `Recompensa por referido: ${userData.name}`,
        category: 'referral',
        status: 'completed',
        metadata: {
          referredUserId: userId,
          referralCode: userData.referralCode // Or own code
        },
        createdAt: new Date().toISOString()
      });

      // 6. Mark User as Paid
      transaction.update(userRef, {
        referralCommissionPaid: true,
        referralPaidAt: new Date().toISOString()
      });
    });

    console.log(`[Referral] Reward processed successfully for referrer of ${userId}`);
    return { success: true };

  } catch (error) {
    console.error("[Referral] Process Reward Failed:", error);
    // Don't throw, just log, so we don't block the main recharge flow
    return { success: false, error };
  }
};
