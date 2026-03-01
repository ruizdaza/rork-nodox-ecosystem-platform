import { protectedProcedure } from "@/backend/trpc/create-context";
import { z } from "zod";
import { db } from "@/lib/firebase-server";
import { FieldValue } from "firebase-admin/firestore";

const MEMBERSHIP_DISCOUNTS = {
  free: 0.30,
  plus: 0.40,
  premium: 0.45,
};

const PLATFORM_FEE_PERCENTAGE = 0.10;

export const processOrderProcedure = protectedProcedure
  .input(
    z.object({
      paymentMethod: z.enum(['ncop', 'fiat', 'mixed']),
      ncopAmount: z.number().optional(),
      items: z.array(
        z.object({
          productId: z.string(),
          quantity: z.number().min(1),
        })
      ),
      shippingAddress: z.object({
        id: z.string().optional(),
        name: z.string(),
        street: z.string(),
        city: z.string(),
        state: z.string().optional(),
        zipCode: z.string().optional(),
        instructions: z.string().optional(),
      }).optional(),
      shippingCost: z.number().optional().default(0), // Shipping cost sent from client (to be validated)
    })
  )
  .mutation(async ({ input, ctx }) => {
    const { user } = ctx;
    const { paymentMethod, ncopAmount, items, shippingAddress, shippingCost } = input;

    console.log(`[Marketplace] Processing order for user: ${user.id} (${user.email})`);

    try {
      const result = await db.runTransaction(async (t) => {
        const userRef = db.collection("users").doc(user.id);
        const walletRef = db.collection("wallets").doc(user.id);

        const userDoc = await t.get(userRef);
        const walletDoc = await t.get(walletRef);

        if (!userDoc.exists) throw new Error("User not found");
        if (!walletDoc.exists) throw new Error("Wallet not found");

        const userData = userDoc.data();
        const walletData = walletDoc.data();

        const productRefs = items.map(i => db.collection("products").doc(i.productId));
        const productDocs = await t.getAll(...productRefs);

        const membershipType = (userData?.membershipType || 'free') as keyof typeof MEMBERSHIP_DISCOUNTS;
        const discountRate = MEMBERSHIP_DISCOUNTS[membershipType] || MEMBERSHIP_DISCOUNTS.free;

        let totalToPayCOP = 0;
        let totalToPayNCOP = 0;
        const verifiedItems: any[] = [];
        const sellerCredits = new Map<string, { ncop: number, cop: number }>();
        const productUpdates: any[] = [];

        items.forEach((item, index) => {
           const productDoc = productDocs[index];
           if (!productDoc.exists) throw new Error(`Product ${item.productId} not found`);

           const product = productDoc.data();
           const productRef = productDoc.ref;

           if (product?.stock < item.quantity) {
               throw new Error(`Insufficient stock for ${product?.name}`);
           }

           const basePriceCOP = product?.price || 0;
           const basePriceNCOP = product?.ncopPrice || (basePriceCOP * 100);

           const pricePaidCOP = basePriceCOP * (1 - discountRate);
           const pricePaidNCOP = basePriceNCOP * (1 - discountRate);

           const allyNetShare = 0.50;
           const amountForAliadoCOP = basePriceCOP * allyNetShare;
           const amountForAliadoNCOP = basePriceNCOP * allyNetShare;

           const platformFeeCOP = amountForAliadoCOP * PLATFORM_FEE_PERCENTAGE;
           const platformFeeNCOP = amountForAliadoNCOP * PLATFORM_FEE_PERCENTAGE;

           const finalCreditAliadoCOP = amountForAliadoCOP - platformFeeCOP;
           const finalCreditAliadoNCOP = amountForAliadoNCOP - platformFeeNCOP;

           totalToPayCOP += pricePaidCOP * item.quantity;
           totalToPayNCOP += pricePaidNCOP * item.quantity;

           const sellerId = product?.sellerId;
           if (!sellerCredits.has(sellerId)) {
               sellerCredits.set(sellerId, { ncop: 0, cop: 0 });
           }
           const currentCredit = sellerCredits.get(sellerId)!;
           sellerCredits.set(sellerId, {
               ncop: currentCredit.ncop + (finalCreditAliadoNCOP * item.quantity),
               cop: currentCredit.cop + (finalCreditAliadoCOP * item.quantity)
           });

           productUpdates.push({
               ref: productRef,
               newStock: (product?.stock || 0) - item.quantity
           });

           verifiedItems.push({
             ...item,
             productName: product?.name,
             basePrice: basePriceCOP,
             discountRate: discountRate,
             pricePaid: pricePaidCOP,
             ncopPricePaid: pricePaidNCOP,
             sellerId
           });
        });

        // TAX & SHIPPING CALCULATION (Sync with frontend cart logic)

        // 1. Calculate Tax (19% IVA on discounted subtotal)
        // The frontend uses `tax = subtotal * 0.19`. We apply it here to the calculated subtotal.
        const taxCOP = totalToPayCOP * 0.19;
        const taxNCOP = totalToPayNCOP * 0.19;

        // Add tax to totals
        totalToPayCOP += taxCOP;
        totalToPayNCOP += taxNCOP;

        // 2. Add Shipping Cost (Validation)
        let validShippingCost = 0;
        if (shippingAddress) {
             validShippingCost = Math.max(0, shippingCost);
        }

        // Add shipping to Totals
        if (paymentMethod === 'ncop') {
            // Document says 1 NCOP = 100 COP.
            // So to get NCOP cost from COP shipping cost: cost / 100
            const shippingNcop = validShippingCost / 100;
            totalToPayNCOP += shippingNcop;
        } else {
            totalToPayCOP += validShippingCost;
        }

        let buyerNcop = walletData?.ncopBalance || 0;
        let buyerCop = walletData?.copBalance || 0;

        if (paymentMethod === 'ncop') {
            if (buyerNcop < totalToPayNCOP) throw new Error("Saldo NCOP insuficiente");
            buyerNcop -= totalToPayNCOP;
        } else if (paymentMethod === 'fiat') {
            if (buyerCop < totalToPayCOP) throw new Error("Saldo COP insuficiente");
            buyerCop -= totalToPayCOP;
        } else {
            const ncopPart = ncopAmount || 0;
            // Mixed logic with shipping:
            // Total needed in COP terms = Product Total + Shipping
            // User pays X in NCOP. Remaining in COP.
            const totalRequiredCOP = totalToPayCOP + (paymentMethod !== 'fiat' ? 0 : validShippingCost);
            // Wait, totalToPayCOP already includes shipping if Fiat/Mixed?
            // Above logic added validShippingCost to totalToPayCOP if not NCOP. Correct.

            const copPart = totalToPayCOP - (ncopPart * 100);

            if (buyerNcop < ncopPart) throw new Error("Saldo NCOP insuficiente");
            if (buyerCop < copPart) throw new Error("Saldo COP insuficiente");
            buyerNcop -= ncopPart;
            buyerCop -= copPart;
        }

        for (const update of productUpdates) {
            t.update(update.ref, { stock: update.newStock });
        }

        t.update(walletRef, {
            ncopBalance: buyerNcop,
            copBalance: buyerCop,
            lastUpdated: new Date().toISOString()
        });

        for (const [sellerId, credit] of sellerCredits) {
            const sellerWalletRef = db.collection("wallets").doc(sellerId);
            const creditUpdate: any = {
                lastUpdated: new Date().toISOString()
            };

            if (paymentMethod === 'ncop') {
                creditUpdate.ncopBalance = FieldValue.increment(credit.ncop);
            } else {
                creditUpdate.copBalance = FieldValue.increment(credit.cop);
            }

            t.set(sellerWalletRef, creditUpdate, { merge: true });
        }

        // Extract unique seller IDs for efficient querying later
        const sellerIdsArray = Array.from(sellerCredits.keys());

        const orderRef = db.collection("orders").doc();
        t.set(orderRef, {
            id: orderRef.id,
            userId: user.id,
            sellerIds: sellerIdsArray, // Added for efficient getAllyOrders queries
            items: verifiedItems,
            totalPaidCOP: paymentMethod !== 'ncop' ? totalToPayCOP : 0,
            totalPaidNCOP: paymentMethod === 'ncop' ? totalToPayNCOP : (ncopAmount || 0),
            shippingCost: validShippingCost,
            paymentMethod,
            status: 'completed',
            membershipApplied: membershipType,
            discountRate,
            shippingAddress: shippingAddress || null,
            createdAt: new Date().toISOString()
        });

        return { orderId: orderRef.id, status: 'success' };
      });

      return result;

    } catch (error: any) {
      console.error("[Marketplace] Transaction Failed:", error);
      throw new Error(error.message || "Order failed");
    }
  });
