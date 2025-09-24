import { createTRPCRouter } from "@/backend/trpc/create-context";
import hiRoute from "@/backend/trpc/routes/example/hi/route";
import { createPaymentIntentProcedure } from "@/backend/trpc/routes/payments/create-intent/route";
import { calculateShippingProcedure } from "@/backend/trpc/routes/logistics/calculate-shipping/route";
import { performSecurityAuditProcedure, getSecurityEventsProcedure } from "@/backend/trpc/routes/security/audit/route";

export const appRouter = createTRPCRouter({
  example: createTRPCRouter({
    hi: hiRoute,
  }),
  payments: createTRPCRouter({
    createIntent: createPaymentIntentProcedure,
  }),
  logistics: createTRPCRouter({
    calculateShipping: calculateShippingProcedure,
  }),
  security: createTRPCRouter({
    performAudit: performSecurityAuditProcedure,
    getEvents: getSecurityEventsProcedure,
  }),
});

export type AppRouter = typeof appRouter;