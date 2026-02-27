import { db } from "@/lib/firebase-server";
import { stripe } from "@/lib/stripe-server";
import { doc, runTransaction, collection, query, where, getDocs } from "firebase/firestore";
import { RECHARGE_BONUS_PERCENTAGE } from "@/types/wallet";

// Logic extracted from confirmRechargeProcedure for reuse
export const processRechargeConfirmation = async (paymentIntentId: string, userId: string) => {
    console.log(`[Webhook] Processing recharge confirmation for ${paymentIntentId}`);

    // 1. Verify Payment with Stripe (Double check)
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== 'succeeded') {
        throw new Error(`Payment not successful. Status: ${paymentIntent.status}`);
    }

    // Verify metadata matches user (if userId passed, otherwise trust metadata)
    if (userId && paymentIntent.metadata.userId !== userId) {
        throw new Error("Payment metadata mismatch");
    }

    const targetUserId = paymentIntent.metadata.userId;

    // 2. Check if transaction already processed (Idempotency)
    const transactionsRef = collection(db, "transactions");
    const q = query(transactionsRef, where("metadata.stripePaymentIntentId", "==", paymentIntentId));
    const existingDocs = await getDocs(q);

    if (!existingDocs.empty) {
        console.log("Transaction already processed");
        return { status: "already_processed" };
    }

    // 3. Process Recharge Transaction
    const amount = paymentIntent.amount / 100;
    const bonusNcop = Math.floor((amount * RECHARGE_BONUS_PERCENTAGE) / 100);

    await runTransaction(db, async (transaction) => {
        const walletRef = doc(db, "wallets", targetUserId);
        const walletDoc = await transaction.get(walletRef);

        let currentCop = 0;
        let currentNcop = 0;

        if (walletDoc.exists()) {
            const data = walletDoc.data();
            currentCop = data.copBalance || 0;
            currentNcop = data.ncopBalance || 0;
        }

        const newCop = currentCop + amount;
        const newNcop = currentNcop + bonusNcop;

        transaction.set(walletRef, {
            copBalance: newCop,
            ncopBalance: newNcop,
            lastUpdated: new Date().toISOString(),
            userId: targetUserId
        }, { merge: true });

        const txRef = doc(collection(db, "transactions"));
        transaction.set(txRef, {
            userId: targetUserId,
            type: 'recharge',
            currency: 'COP',
            amount,
            balanceAfter: newCop,
            description: 'Recarga con Stripe (Webhook)',
            category: 'top_up',
            status: 'completed',
            metadata: {
                stripePaymentIntentId: paymentIntentId,
                bonusNcop
            },
            createdAt: new Date().toISOString()
        });

        if (bonusNcop > 0) {
            const bonusRef = doc(collection(db, "transactions"));
            transaction.set(bonusRef, {
                userId: targetUserId,
                type: 'bonus',
                currency: 'NCOP',
                amount: bonusNcop,
                balanceAfter: newNcop,
                description: 'Bonus por recarga',
                category: 'reward',
                status: 'completed',
                metadata: {
                    relatedTransactionId: txRef.id
                },
                createdAt: new Date().toISOString()
            });
        }
    });

    return { status: "success" };
};

// Webhook Handler Entry Point (Simulated for Hono/Express)
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
