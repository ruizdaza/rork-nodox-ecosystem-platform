import { protectedProcedure } from "@/backend/trpc/create-context";
import { z } from "zod";
import { InventoryMovement } from "@/types/inventory";
import { inventoryItems } from "../get-items/route";

let movements: InventoryMovement[] = [];

export const getInventoryMovementsProcedure = protectedProcedure
  .input(
    z.object({
      itemId: z.string().optional(),
      type: z.enum(["purchase", "sale", "adjustment", "return", "transfer", "waste"]).optional(),
      startDate: z.string().optional(),
      endDate: z.string().optional(),
      limit: z.number().optional().default(100),
    })
  )
  .query(async ({ input }) => {
    let filtered = [...movements];

    if (input.itemId) {
      filtered = filtered.filter((m) => m.itemId === input.itemId);
    }

    if (input.type) {
      filtered = filtered.filter((m) => m.type === input.type);
    }

    if (input.startDate) {
      filtered = filtered.filter((m) => m.createdAt >= input.startDate!);
    }

    if (input.endDate) {
      filtered = filtered.filter((m) => m.createdAt <= input.endDate!);
    }

    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return filtered.slice(0, input.limit);
  });

export const createInventoryMovementProcedure = protectedProcedure
  .input(
    z.object({
      itemId: z.string(),
      type: z.enum(["purchase", "sale", "adjustment", "return", "transfer", "waste"]),
      quantity: z.number(),
      cost: z.number().optional(),
      reason: z.string(),
      referenceId: z.string().optional(),
      referenceType: z.enum(["order", "purchase_order", "transfer", "adjustment"]).optional(),
      warehouseId: z.string().optional(),
    })
  )
  .mutation(async ({ input, ctx }) => {
    const item = inventoryItems.find((i) => i.id === input.itemId);
    if (!item) {
      throw new Error("Item not found");
    }

    const previousStock = item.currentStock;
    let newStock = previousStock;

    switch (input.type) {
      case "purchase":
      case "return":
        newStock = previousStock + input.quantity;
        break;
      case "sale":
      case "waste":
        newStock = previousStock - input.quantity;
        break;
      case "adjustment":
      case "transfer":
        newStock = input.quantity;
        break;
    }

    if (newStock < 0) {
      throw new Error("Stock cannot be negative");
    }

    const movement: InventoryMovement = {
      id: `mov-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      itemId: input.itemId,
      itemName: item.productName,
      type: input.type,
      quantity: input.quantity,
      previousStock,
      newStock,
      cost: input.cost,
      reason: input.reason,
      referenceId: input.referenceId,
      referenceType: input.referenceType,
      performedBy: ctx.user.id,
      performedByName: ctx.user.name || "Usuario",
      warehouseId: input.warehouseId,
      createdAt: new Date().toISOString(),
    };

    movements.push(movement);

    item.currentStock = newStock;
    item.updatedAt = new Date().toISOString();

    if (input.type === "purchase") {
      item.lastRestockDate = new Date().toISOString();
    }

    item.status =
      newStock === 0
        ? "out_of_stock"
        : newStock <= item.minStock
          ? "low_stock"
          : "in_stock";

    return movement;
  });

export { movements };
