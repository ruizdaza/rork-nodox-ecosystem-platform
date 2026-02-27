import { protectedProcedure } from "@/backend/trpc/create-context";
import { z } from "zod";
import { db } from "@/lib/firebase-server";
import { doc, runTransaction, collection } from "firebase/firestore";

export const processOrderProcedure = protectedProcedure
  .input(
    z.object({
      paymentMethod: z.enum(['ncop', 'fiat', 'mixed']),
      ncopAmount: z.number().optional(),
      items: z.array(
        z.object({
          productId: z.string(),
          quantity: z.number().min(1),
          // Removed price from input as it should be fetched from DB
        })
      ),
    })
  )
  .mutation(async ({ input, ctx }) => {
    const { user } = ctx;
    const { paymentMethod, ncopAmount, items } = input;

    console.log(`[Marketplace] Processing order for user: ${user.id}`, { paymentMethod });

    try {
      const result = await runTransaction(db, async (transaction) => {
        // Calculate totals securely
        let calculatedTotal = 0;
        let calculatedNcopTotal = 0;
        const verifiedItems = [];

        // Inventory Check and Price Verification
        for (const item of items) {
           const productRef = doc(db, "products", item.productId);
           const productDoc = await transaction.get(productRef);
           if (!productDoc.exists()) throw new Error(`Product ${item.productId} not found`);

           const productData = productDoc.data();

           // Verify Stock
           if (productData.stock < item.quantity) {
               throw new Error(`Insufficient stock for product ${item.productId}`);
           }

           // Calculate Prices
           const itemPrice = productData.price || 0;
           const itemNcopPrice = productData.ncopPrice || 0;

           calculatedTotal += itemPrice * item.quantity;
           calculatedNcopTotal += itemNcopPrice * item.quantity;

           // Deduct Stock
           transaction.update(productRef, { stock: productData.stock - item.quantity });

           verifiedItems.push({
             ...item,
             productName: productData.name,
             price: itemPrice,
             ncopPrice: itemNcopPrice
           });
        }

        // Add Shipping and Tax (Simplified logic, should match frontend or be passed as parameters if variable but verified)
        // For security, we should ideally calculate this server-side too.
        // Assuming standard shipping/tax rules for now.
        const tax = calculatedTotal * 0.19; // 19% IVA
        // Shipping logic (simplified match to frontend)
        const hasPhysicalItems = verifiedItems.some(i => i.price > 0); // Mock check
        let shipping = 0;
        if (hasPhysicalItems && calculatedTotal <= 100) { // Free shipping over 100
             // Ideally fetch shipping rules. For now, assuming 0 or fixed if not passed.
             // If we want to match frontend exactly, we need shared logic.
             // Let's assume calculatedTotal includes base price, and we add tax.
        }

        const finalTotal = calculatedTotal + tax; // + shipping;
        const finalNcopTotal = calculatedNcopTotal;

        // Wallet Logic
        const walletRef = doc(db, "wallets", user.id);
        const walletDoc = await transaction.get(walletRef);

        if (!walletDoc.exists()) {
          throw new Error("Wallet not found");
        }

        const walletData = walletDoc.data();
        const currentNcop = walletData.ncopBalance || 0;
        const currentCop = walletData.copBalance || 0;

        let newNcop = currentNcop;
        let newCop = currentCop;

        switch (paymentMethod) {
          case 'ncop':
            if (currentNcop < finalNcopTotal) throw new Error("Saldo NCOP insuficiente");
            newNcop -= finalNcopTotal;
            break;
          case 'fiat':
            if (currentCop < finalTotal) throw new Error("Saldo COP insuficiente");
            newCop -= finalTotal;
            break;
          case 'mixed':
             // ncopAmount is the amount user WANTS to pay in NCOP.
             // We verify they have it, and the rest is COP.
             // BUT, we should probably enforce a split logic or trust the input split if valid.
             // Here, let's use the input `ncopAmount` as the user's choice for NCOP part,
             // provided it doesn't exceed total cost in NCOP terms?
             // Actually, mixed usually means Pay X NCOP + Y COP.
             // If items have dual prices, it's tricky.
             // Simplified: Convert NCOP amount to COP equivalent and deduct from total COP needed.
             // Assuming 1 NCOP = 100 COP rate fixed.

             const ncopPart = ncopAmount || 0;
             if (currentNcop < ncopPart) throw new Error("Saldo NCOP insuficiente");

             const conversionRate = 100; // Fixed rate for now
             const copValue = ncopPart * conversionRate;
             const remainingCop = finalTotal - copValue;

             if (remainingCop < 0) throw new Error("Monto NCOP excede el total");
             if (currentCop < remainingCop) throw new Error("Saldo COP insuficiente");

             newNcop -= ncopPart;
             newCop -= remainingCop;
            break;
        }

        // Update Wallet
        transaction.update(walletRef, {
            ncopBalance: newNcop,
            copBalance: newCop,
            lastUpdated: new Date().toISOString()
        });

        // Create Order
        const orderRef = doc(collection(db, "orders"));
        const orderData = {
            userId: user.id,
            items: verifiedItems,
            total: finalTotal,
            ncopTotal: finalNcopTotal,
            paymentMethod,
            status: 'completed',
            createdAt: new Date().toISOString()
        };
        transaction.set(orderRef, orderData);

        return { orderId: orderRef.id, status: 'success' };
      });

      console.log(`[Marketplace] Order processed successfully: ${result.orderId}`);
      return result;

    } catch (error) {
      console.error("[Marketplace] Process Order failed:", error);
      throw new Error(error.message || "Order processing failed");
    }
  });
