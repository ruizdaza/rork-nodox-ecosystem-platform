import { protectedProcedure } from "@/backend/trpc/create-context";
import { z } from "zod";
import { PurchaseOrder, PurchaseOrderItem } from "@/types/inventory";

let purchaseOrders: PurchaseOrder[] = [];

export const getPurchaseOrdersProcedure = protectedProcedure
  .input(
    z.object({
      status: z
        .enum(["draft", "pending", "approved", "ordered", "received", "cancelled"])
        .optional(),
      supplierId: z.string().optional(),
    })
  )
  .query(async ({ input }) => {
    let filtered = [...purchaseOrders];

    if (input.status) {
      filtered = filtered.filter((po) => po.status === input.status);
    }

    if (input.supplierId) {
      filtered = filtered.filter((po) => po.supplierId === input.supplierId);
    }

    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return filtered;
  });

export const createPurchaseOrderProcedure = protectedProcedure
  .input(
    z.object({
      supplierId: z.string(),
      supplierName: z.string(),
      items: z.array(
        z.object({
          productId: z.string(),
          productName: z.string(),
          sku: z.string(),
          quantity: z.number(),
          unitPrice: z.number(),
          notes: z.string().optional(),
        })
      ),
      paymentTerms: z.string(),
      expectedDelivery: z.string().optional(),
      notes: z.string().optional(),
    })
  )
  .mutation(async ({ input, ctx }) => {
    const items: PurchaseOrderItem[] = input.items.map((item) => ({
      id: `poi-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ...item,
      receivedQuantity: 0,
      total: item.quantity * item.unitPrice,
      notes: item.notes || "",
    }));

    const subtotal = items.reduce((sum, item) => sum + item.total, 0);
    const tax = subtotal * 0.19;
    const total = subtotal + tax;

    const newPO: PurchaseOrder = {
      id: `po-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      orderNumber: `PO-${Date.now()}`,
      supplierId: input.supplierId,
      supplierName: input.supplierName,
      status: "draft",
      items,
      subtotal,
      tax,
      shipping: 0,
      discount: 0,
      total,
      paymentTerms: input.paymentTerms,
      paymentStatus: "unpaid",
      expectedDelivery: input.expectedDelivery,
      notes: input.notes || "",
      createdBy: ctx.user.id,
      createdByName: ctx.user.name || "Usuario",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    purchaseOrders.push(newPO);
    return newPO;
  });

export const updatePurchaseOrderProcedure = protectedProcedure
  .input(
    z.object({
      id: z.string(),
      status: z
        .enum(["draft", "pending", "approved", "ordered", "received", "cancelled"])
        .optional(),
      receivedDate: z.string().optional(),
      notes: z.string().optional(),
    })
  )
  .mutation(async ({ input, ctx }) => {
    const index = purchaseOrders.findIndex((po) => po.id === input.id);
    if (index === -1) {
      throw new Error("Purchase order not found");
    }

    const updates: Partial<PurchaseOrder> = {
      ...input,
      updatedAt: new Date().toISOString(),
    };

    if (input.status === "approved") {
      updates.approvedBy = ctx.user.id;
      updates.approvedByName = ctx.user.name || "Usuario";
    }

    purchaseOrders[index] = {
      ...purchaseOrders[index],
      ...updates,
    };

    return purchaseOrders[index];
  });

export const receiveItemsProcedure = protectedProcedure
  .input(
    z.object({
      orderId: z.string(),
      items: z.array(
        z.object({
          itemId: z.string(),
          receivedQuantity: z.number(),
        })
      ),
    })
  )
  .mutation(async ({ input }) => {
    const po = purchaseOrders.find((p) => p.id === input.orderId);
    if (!po) {
      throw new Error("Purchase order not found");
    }

    input.items.forEach((receivedItem) => {
      const item = po.items.find((i) => i.id === receivedItem.itemId);
      if (item) {
        item.receivedQuantity += receivedItem.receivedQuantity;
      }
    });

    const allReceived = po.items.every((item) => item.receivedQuantity >= item.quantity);

    if (allReceived) {
      po.status = "received";
      po.receivedDate = new Date().toISOString();
    }

    po.updatedAt = new Date().toISOString();

    return po;
  });

export { purchaseOrders };
