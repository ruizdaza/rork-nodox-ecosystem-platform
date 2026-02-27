import { db } from "@/lib/firebase-server";
import { stripe } from "@/lib/stripe-server";
import { RECHARGE_BONUS_PERCENTAGE } from "@/types/wallet";
import { processReferralReward } from "@/backend/services/referral";

export const processRechargeConfirmation = async (paymentIntentId: string, userId: string) => {
    console.log(`[Webhook] Processing recharge confirmation for ${paymentIntentId}`);

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== 'succeeded') {
        throw new Error(`Payment not successful. Status: ${paymentIntent.status}`);
    }

    if (userId && paymentIntent.metadata.userId !== userId) {
        throw new Error("Payment metadata mismatch");
    }

    const targetUserId = paymentIntent.metadata.userId;

    const amount = paymentIntent.amount / 100;
    const bonusNcop = Math.floor((amount * RECHARGE_BONUS_PERCENTAGE) / 100);

    try {
        await db.runTransaction(async (t) => {
            const txRef = db.collection("transactions").doc(paymentIntentId);
            const txDoc = await t.get(txRef);

            if (txDoc.exists) {
                return;
            }

            const walletRef = db.collection("wallets").doc(targetUserId);
            const walletDoc = await t.get(walletRef);

            let currentCop = 0;
            let currentNcop = 0;

            if (walletDoc.exists) {
                const data = walletDoc.data();
                currentCop = data?.copBalance || 0;
                currentNcop = data?.ncopBalance || 0;
            }

            const newCop = currentCop + amount;
            const newNcop = currentNcop + bonusNcop;

            t.set(walletRef, {
                copBalance: newCop,
                ncopBalance: newNcop,
                lastUpdated: new Date().toISOString(),
                userId: targetUserId
            }, { merge: true });

            t.set(txRef, {
                userId: targetUserId,
                type: 'recharge',
                currency: 'COP',
                amount,
                balanceAfter: newCop,
                description: 'Recarga con Stripe',
                category: 'top_up',
                status: 'completed',
                metadata: {
                    stripePaymentIntentId: paymentIntentId,
                    bonusNcop
                },
                createdAt: new Date().toISOString()
            });

            if (bonusNcop > 0) {
                const bonusRef = db.collection("transactions").doc(`${paymentIntentId}_bonus`);
                t.set(bonusRef, {
                    userId: targetUserId,
                    type: 'bonus',
                    currency: 'NCOP',
                    amount: bonusNcop,
                    balanceAfter: newNcop,
                    description: 'Bonus por recarga',
                    category: 'reward',
                    status: 'completed',
                    metadata: {
                        relatedTransactionId: paymentIntentId
                    },
                    createdAt: new Date().toISOString()
                });
            }
        });

        processReferralReward(targetUserId).catch(err => {
            console.error("Failed to process referral reward after recharge:", err);
        });

        return { status: "success" };

    } catch (error) {
        console.error("Transaction failed:", error);
        throw error;
    }
};

export const handleStripeWebhook = async (req: any, res: any) => {
    const sig = req.headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;

    try {
        event = stripe.webhooks.constructEvent(req.rawBody, sig, endpointSecret);
    } catch (err: any) {
        console.error(`Webhook Error: ${err.message}`);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === 'payment_intent.succeeded') {
        const paymentIntent = event.data.object;
        try {
            await processRechargeConfirmation(paymentIntent.id, paymentIntent.metadata.userId);
            console.log('PaymentIntent was successful!');
        } catch (err) {
            console.error('Error processing webhook:', err);
            return res.status(500).send('Internal Server Error');
        }
    }

    res.json({ received: true });
};
