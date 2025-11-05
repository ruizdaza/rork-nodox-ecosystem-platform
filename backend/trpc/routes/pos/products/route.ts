import { protectedProcedure } from "@/backend/trpc/create-context";
import { z } from "zod";
import { POSProduct } from "@/types/pos";

let posProducts: POSProduct[] = [
  {
    id: "pos-prod-1",
    name: "Producto POS Demo",
    sku: "SKU-POS-001",
    barcode: "7501234567890",
    category: "General",
    price: 50000,
    ncopPrice: 45000,
    cost: 30000,
    isService: false,
    stockQuantity: 100,
    minStock: 10,
    taxRate: 0.19,
    isActive: true,
    description: "Producto de ejemplo para POS",
  },
  {
    id: "pos-prod-2",
    name: "Servicio de Consultoría",
    category: "Servicios",
    price: 100000,
    ncopPrice: 95000,
    isService: true,
    taxRate: 0.19,
    isActive: true,
    description: "Servicio de consultoría profesional",
  },
];

export const getPOSProductsProcedure = protectedProcedure
  .input(
    z.object({
      search: z.string().optional(),
      category: z.string().optional(),
      isActive: z.boolean().optional(),
      isService: z.boolean().optional(),
    })
  )
  .query(async ({ input }) => {
    let filtered = [...posProducts];

    if (input.search) {
      const searchLower = input.search.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(searchLower) ||
          p.sku?.toLowerCase().includes(searchLower) ||
          p.barcode?.toLowerCase().includes(searchLower)
      );
    }

    if (input.category) {
      filtered = filtered.filter((p) => p.category === input.category);
    }

    if (input.isActive !== undefined) {
      filtered = filtered.filter((p) => p.isActive === input.isActive);
    }

    if (input.isService !== undefined) {
      filtered = filtered.filter((p) => p.isService === input.isService);
    }

    return filtered;
  });

export const createPOSProductProcedure = protectedProcedure
  .input(
    z.object({
      name: z.string(),
      sku: z.string().optional(),
      barcode: z.string().optional(),
      category: z.string(),
      price: z.number(),
      ncopPrice: z.number().optional(),
      cost: z.number().optional(),
      isService: z.boolean(),
      stockQuantity: z.number().optional(),
      minStock: z.number().optional(),
      taxRate: z.number(),
      imageUrl: z.string().optional(),
      description: z.string().optional(),
    })
  )
  .mutation(async ({ input }) => {
    const newProduct: POSProduct = {
      id: `pos-prod-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ...input,
      isActive: true,
    };

    posProducts.push(newProduct);
    return newProduct;
  });

export const updatePOSProductProcedure = protectedProcedure
  .input(
    z.object({
      id: z.string(),
      name: z.string().optional(),
      sku: z.string().optional(),
      barcode: z.string().optional(),
      category: z.string().optional(),
      price: z.number().optional(),
      ncopPrice: z.number().optional(),
      cost: z.number().optional(),
      stockQuantity: z.number().optional(),
      minStock: z.number().optional(),
      taxRate: z.number().optional(),
      isActive: z.boolean().optional(),
      imageUrl: z.string().optional(),
      description: z.string().optional(),
    })
  )
  .mutation(async ({ input }) => {
    const index = posProducts.findIndex((p) => p.id === input.id);
    if (index === -1) {
      throw new Error("Product not found");
    }

    posProducts[index] = {
      ...posProducts[index],
      ...input,
    };

    return posProducts[index];
  });

export const deletePOSProductProcedure = protectedProcedure
  .input(z.object({ id: z.string() }))
  .mutation(async ({ input }) => {
    const index = posProducts.findIndex((p) => p.id === input.id);
    if (index === -1) {
      throw new Error("Product not found");
    }

    posProducts.splice(index, 1);
    return { success: true };
  });

export { posProducts };
