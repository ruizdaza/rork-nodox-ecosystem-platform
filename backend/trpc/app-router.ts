import { createTRPCRouter } from "@/backend/trpc/create-context";
import hiRoute from "@/backend/trpc/routes/example/hi/route";
import { createPaymentIntentProcedure } from "@/backend/trpc/routes/payments/create-intent/route";
import { calculateShippingProcedure } from "@/backend/trpc/routes/logistics/calculate-shipping/route";
import { performSecurityAuditProcedure, getSecurityEventsProcedure } from "@/backend/trpc/routes/security/audit/route";
import { sendMessageProcedure } from "@/backend/trpc/routes/chat/send-message/route";
import { createChatProcedure } from "@/backend/trpc/routes/chat/create-chat/route";
import { getChatsProcedure } from "@/backend/trpc/routes/chat/get-chats/route";
import { getMessagesProcedure } from "@/backend/trpc/routes/chat/get-messages/route";
import { getUsersProcedure } from "@/backend/trpc/routes/chat/get-users/route";

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
  chat: createTRPCRouter({
    sendMessage: sendMessageProcedure,
    createChat: createChatProcedure,
    getChats: getChatsProcedure,
    getMessages: getMessagesProcedure,
    getUsers: getUsersProcedure,
  }),
});

export type AppRouter = typeof appRouter;