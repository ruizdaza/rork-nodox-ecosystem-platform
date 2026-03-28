import { protectedProcedure } from "@/backend/trpc/create-context";
import { z } from "zod";
import { Supplier } from "@/types/inventory";

let suppliers: Supplier[] = [
  {
    id: "sup-1",
    name: "Proveedor Demo S.A.S",
    contactPerson: "Juan Pérez",
    email: "contacto@proveedor.com",
    phone: "+57 300 123 4567",
    address: "Calle 123 #45-67, Bogotá",
    taxId: "900123456-7",
    paymentTerms: "30 días",
    creditLimit: 50000000,
    currentBalance: 0,
    rating: 4.5,
    status: "active",
    productsSupplied: ["Electrónica", "Computadores"],
    notes: "Proveedor confiable",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const getSuppliersProcedure = protectedProcedure
  .input(
    z.object({
      search: z.string().optional(),
      status: z.enum(["active", "inactive", "blocked"]).optional(),
    })
  )
  .query(async ({ input }) => {
    let filtered = [...suppliers];

    if (input.search) {
      const searchLower = input.search.toLowerCase();
      filtered = filtered.filter(
        (s) =>
          s.name.toLowerCase().includes(searchLower) ||
          s.contactPerson.toLowerCase().includes(searchLower) ||
          s.email.toLowerCase().includes(searchLower)
      );
    }

    if (input.status) {
      filtered = filtered.filter((s) => s.status === input.status);
    }

    return filtered;
  });

export const createSupplierProcedure = protectedProcedure
  .input(
    z.object({
      name: z.string(),
      contactPerson: z.string(),
      email: z.string().email(),
      phone: z.string(),
      address: z.string(),
      taxId: z.string(),
      paymentTerms: z.string(),
      creditLimit: z.number(),
      productsSupplied: z.array(z.string()),
      notes: z.string().optional(),
    })
  )
  .mutation(async ({ input }) => {
    const newSupplier: Supplier = {
      id: `sup-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ...input,
      currentBalance: 0,
      rating: 0,
      status: "active",
      notes: input.notes || "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    suppliers.push(newSupplier);
    return newSupplier;
  });

export const updateSupplierProcedure = protectedProcedure
  .input(
    z.object({
      id: z.string(),
      name: z.string().optional(),
      contactPerson: z.string().optional(),
      email: z.string().email().optional(),
      phone: z.string().optional(),
      address: z.string().optional(),
      taxId: z.string().optional(),
      paymentTerms: z.string().optional(),
      creditLimit: z.number().optional(),
      currentBalance: z.number().optional(),
      rating: z.number().optional(),
      status: z.enum(["active", "inactive", "blocked"]).optional(),
      productsSupplied: z.array(z.string()).optional(),
      notes: z.string().optional(),
    })
  )
  .mutation(async ({ input }) => {
    const index = suppliers.findIndex((s) => s.id === input.id);
    if (index === -1) {
      throw new Error("Supplier not found");
    }

    suppliers[index] = {
      ...suppliers[index],
      ...input,
      updatedAt: new Date().toISOString(),
    };

    return suppliers[index];
  });

export { suppliers };
