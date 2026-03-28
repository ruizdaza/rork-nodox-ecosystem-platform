import { protectedProcedure } from "@/backend/trpc/create-context";
import { z } from "zod";
import { InventoryItem } from "@/types/inventory";

let inventoryItems: InventoryItem[] = [
  {
    id: "inv-1",
    productId: "prod-1",
    productName: "Producto Demo",
    sku: "SKU-001",
    barcode: "7501234567890",
    category: "Electrónica",
    currentStock: 150,
    minStock: 20,
    maxStock: 500,
    reorderPoint: 50,
    unit: "unit",
    costPrice: 50000,
    sellingPrice: 85000,
    location: "Almacén A - Estante 1",
    status: "in_stock",
    notes: "Producto demo inicial",
    lastRestockDate: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const getInventoryItemsProcedure = protectedProcedure
  .input(
    z.object({
      search: z.string().optional(),
      category: z.string().optional(),
      status: z.enum(["in_stock", "low_stock", "out_of_stock", "discontinued"]).optional(),
      warehouseId: z.string().optional(),
    })
  )
  .query(async ({ input }) => {
    let filtered = [...inventoryItems];

    if (input.search) {
      const searchLower = input.search.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.productName.toLowerCase().includes(searchLower) ||
          item.sku.toLowerCase().includes(searchLower) ||
          item.barcode?.toLowerCase().includes(searchLower)
      );
    }

    if (input.category) {
      filtered = filtered.filter((item) => item.category === input.category);
    }

    if (input.status) {
      filtered = filtered.filter((item) => item.status === input.status);
    }

    if (input.warehouseId) {
      filtered = filtered.filter((item) => item.warehouseId === input.warehouseId);
    }

    return filtered;
  });

export const getInventoryItemProcedure = protectedProcedure
  .input(z.object({ id: z.string() }))
  .query(async ({ input }) => {
    const item = inventoryItems.find((i) => i.id === input.id);
    if (!item) {
      throw new Error("Item not found");
    }
    return item;
  });

export const createInventoryItemProcedure = protectedProcedure
  .input(
    z.object({
      productId: z.string(),
      productName: z.string(),
      sku: z.string(),
      barcode: z.string().optional(),
      category: z.string(),
      currentStock: z.number(),
      minStock: z.number(),
      maxStock: z.number(),
      reorderPoint: z.number(),
      unit: z.enum(["unit", "kg", "liter", "pack", "box"]),
      costPrice: z.number(),
      sellingPrice: z.number(),
      location: z.string(),
      warehouseId: z.string().optional(),
      expiryDate: z.string().optional(),
      notes: z.string().optional(),
    })
  )
  .mutation(async ({ input, ctx }) => {
    const newItem: InventoryItem = {
      id: `inv-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ...input,
      status:
        input.currentStock === 0
          ? "out_of_stock"
          : input.currentStock <= input.minStock
            ? "low_stock"
            : "in_stock",
      notes: input.notes || "",
      lastRestockDate: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    inventoryItems.push(newItem);
    return newItem;
  });

export const updateInventoryItemProcedure = protectedProcedure
  .input(
    z.object({
      id: z.string(),
      productName: z.string().optional(),
      category: z.string().optional(),
      minStock: z.number().optional(),
      maxStock: z.number().optional(),
      reorderPoint: z.number().optional(),
      costPrice: z.number().optional(),
      sellingPrice: z.number().optional(),
      location: z.string().optional(),
      warehouseId: z.string().optional(),
      expiryDate: z.string().optional(),
      notes: z.string().optional(),
      status: z.enum(["in_stock", "low_stock", "out_of_stock", "discontinued"]).optional(),
    })
  )
  .mutation(async ({ input }) => {
    const index = inventoryItems.findIndex((i) => i.id === input.id);
    if (index === -1) {
      throw new Error("Item not found");
    }

    inventoryItems[index] = {
      ...inventoryItems[index],
      ...input,
      updatedAt: new Date().toISOString(),
    };

    return inventoryItems[index];
  });

export const deleteInventoryItemProcedure = protectedProcedure
  .input(z.object({ id: z.string() }))
  .mutation(async ({ input }) => {
    const index = inventoryItems.findIndex((i) => i.id === input.id);
    if (index === -1) {
      throw new Error("Item not found");
    }

    inventoryItems.splice(index, 1);
    return { success: true };
  });

export { inventoryItems };
