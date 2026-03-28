import { protectedProcedure } from "@/backend/trpc/create-context";
import { z } from "zod";
import { StockAlert } from "@/types/inventory";
import { inventoryItems } from "../get-items/route";

export const getStockAlertsProcedure = protectedProcedure
  .input(
    z.object({
      alertType: z
        .enum(["low_stock", "out_of_stock", "expiring_soon", "expired", "overstock"])
        .optional(),
      severity: z.enum(["low", "medium", "high", "critical"]).optional(),
      isResolved: z.boolean().optional(),
    })
  )
  .query(async ({ input }) => {
    const alerts: StockAlert[] = [];

    inventoryItems.forEach((item) => {
      if (item.currentStock === 0) {
        alerts.push({
          id: `alert-${item.id}-out`,
          itemId: item.id,
          itemName: item.productName,
          alertType: "out_of_stock",
          currentStock: item.currentStock,
          threshold: item.minStock,
          severity: "critical",
          isResolved: false,
          createdAt: new Date().toISOString(),
        });
      } else if (item.currentStock <= item.minStock) {
        alerts.push({
          id: `alert-${item.id}-low`,
          itemId: item.id,
          itemName: item.productName,
          alertType: "low_stock",
          currentStock: item.currentStock,
          threshold: item.minStock,
          severity: item.currentStock <= item.reorderPoint ? "high" : "medium",
          isResolved: false,
          createdAt: new Date().toISOString(),
        });
      }

      if (item.expiryDate) {
        const daysUntilExpiry = Math.floor(
          (new Date(item.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
        );

        if (daysUntilExpiry < 0) {
          alerts.push({
            id: `alert-${item.id}-expired`,
            itemId: item.id,
            itemName: item.productName,
            alertType: "expired",
            currentStock: item.currentStock,
            expiryDate: item.expiryDate,
            severity: "critical",
            isResolved: false,
            createdAt: new Date().toISOString(),
          });
        } else if (daysUntilExpiry <= 30) {
          alerts.push({
            id: `alert-${item.id}-expiring`,
            itemId: item.id,
            itemName: item.productName,
            alertType: "expiring_soon",
            currentStock: item.currentStock,
            expiryDate: item.expiryDate,
            severity: daysUntilExpiry <= 7 ? "high" : "medium",
            isResolved: false,
            createdAt: new Date().toISOString(),
          });
        }
      }

      if (item.currentStock > item.maxStock) {
        alerts.push({
          id: `alert-${item.id}-over`,
          itemId: item.id,
          itemName: item.productName,
          alertType: "overstock",
          currentStock: item.currentStock,
          threshold: item.maxStock,
          severity: "low",
          isResolved: false,
          createdAt: new Date().toISOString(),
        });
      }
    });

    let filtered = alerts;

    if (input.alertType) {
      filtered = filtered.filter((a) => a.alertType === input.alertType);
    }

    if (input.severity) {
      filtered = filtered.filter((a) => a.severity === input.severity);
    }

    if (input.isResolved !== undefined) {
      filtered = filtered.filter((a) => a.isResolved === input.isResolved);
    }

    return filtered;
  });
