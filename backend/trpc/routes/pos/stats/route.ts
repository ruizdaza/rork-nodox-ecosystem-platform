import { protectedProcedure } from "@/backend/trpc/create-context";
import { z } from "zod";
import { POSStats } from "@/types/pos";
import { transactions } from "../transactions/route";

export const getPOSStatsProcedure = protectedProcedure
  .input(
    z.object({
      date: z.string().optional(),
      sellerId: z.string().optional(),
    })
  )
  .query(async ({ input, ctx }) => {
    const targetDate = input.date || new Date().toISOString().split("T")[0];
    const sellerId = input.sellerId || ctx.user.id;

    const todayTransactions = transactions.filter((t) => {
      const transDate = t.date.split("T")[0];
      return (
        transDate === targetDate && t.status === "completed" && t.sellerId === sellerId
      );
    });

    const todaySales = todayTransactions.reduce((sum, t) => sum + t.total, 0);
    const todayTransactionCount = todayTransactions.length;
    const averageTicket = todayTransactionCount > 0 ? todaySales / todayTransactionCount : 0;

    const productSales = new Map<
      string,
      { productId: string; productName: string; quantity: number; revenue: number }
    >();

    todayTransactions.forEach((t) => {
      t.items.forEach((item) => {
        const existing = productSales.get(item.productId);
        if (existing) {
          existing.quantity += item.quantity;
          existing.revenue += item.total;
        } else {
          productSales.set(item.productId, {
            productId: item.productId,
            productName: item.productName,
            quantity: item.quantity,
            revenue: item.total,
          });
        }
      });
    });

    const topSellingProducts = Array.from(productSales.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    const paymentMethodsBreakdown = {
      cash: 0,
      card: 0,
      ncop: 0,
      transfer: 0,
    };

    todayTransactions.forEach((t) => {
      t.payments.forEach((p) => {
        if (p.method in paymentMethodsBreakdown) {
          paymentMethodsBreakdown[p.method] += p.amount;
        }
      });
    });

    const hourlySalesMap = new Map<string, { sales: number; transactions: number }>();
    for (let i = 0; i < 24; i++) {
      const hour = String(i).padStart(2, "0") + ":00";
      hourlySalesMap.set(hour, { sales: 0, transactions: 0 });
    }

    todayTransactions.forEach((t) => {
      const hour = new Date(t.date).getHours();
      const hourKey = String(hour).padStart(2, "0") + ":00";
      const existing = hourlySalesMap.get(hourKey);
      if (existing) {
        existing.sales += t.total;
        existing.transactions += 1;
      }
    });

    const hourlySales = Array.from(hourlySalesMap.entries()).map(([hour, data]) => ({
      hour,
      ...data,
    }));

    const stats: POSStats = {
      todaySales,
      todayTransactions: todayTransactionCount,
      averageTicket,
      topSellingProducts,
      paymentMethodsBreakdown,
      hourlySales,
    };

    return stats;
  });
