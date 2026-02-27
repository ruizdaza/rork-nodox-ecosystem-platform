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

import { processOrderProcedure } from "@/backend/trpc/routes/marketplace/process-order/route";

import { createProductProcedure } from "@/backend/trpc/routes/inventory/create-product/route";
import { getMyProductsProcedure } from "@/backend/trpc/routes/inventory/get-my-products/route";
import { getAllyOrdersProcedure } from "@/backend/trpc/routes/inventory/orders/get-ally-orders";
import { updateOrderStatusProcedure } from "@/backend/trpc/routes/inventory/orders/update-status";

import {
  getInventoryItemsProcedure,
  getInventoryItemProcedure,
  createInventoryItemProcedure,
  updateInventoryItemProcedure,
  deleteInventoryItemProcedure,
} from "@/backend/trpc/routes/inventory/get-items/route";
import {
  getInventoryMovementsProcedure,
  createInventoryMovementProcedure,
} from "@/backend/trpc/routes/inventory/movements/route";
import {
  getSuppliersProcedure,
  createSupplierProcedure,
  updateSupplierProcedure,
} from "@/backend/trpc/routes/inventory/suppliers/route";
import {
  getPurchaseOrdersProcedure,
  createPurchaseOrderProcedure,
  updatePurchaseOrderProcedure,
  receiveItemsProcedure,
} from "@/backend/trpc/routes/inventory/purchase-orders/route";
import { getStockAlertsProcedure } from "@/backend/trpc/routes/inventory/alerts/route";

import {
  getPOSTransactionsProcedure,
  createPOSTransactionProcedure,
  refundPOSTransactionProcedure,
  cancelPOSTransactionProcedure,
} from "@/backend/trpc/routes/pos/transactions/route";
import {
  getPOSSessionsProcedure,
  getActivePOSSessionProcedure,
  openPOSSessionProcedure,
  closePOSSessionProcedure,
} from "@/backend/trpc/routes/pos/sessions/route";
import {
  getPOSProductsProcedure,
  createPOSProductProcedure,
  updatePOSProductProcedure,
  deletePOSProductProcedure,
} from "@/backend/trpc/routes/pos/products/route";
import { getPOSStatsProcedure } from "@/backend/trpc/routes/pos/stats/route";

import {
  getAccountingAccountsProcedure,
  createAccountingAccountProcedure,
  updateAccountingAccountProcedure,
  updateAccountBalanceProcedure,
} from "@/backend/trpc/routes/accounting/accounts/route";
import {
  getJournalEntriesProcedure,
  createJournalEntryProcedure,
  postJournalEntryProcedure,
  voidJournalEntryProcedure,
} from "@/backend/trpc/routes/accounting/journal-entries/route";
import {
  getTrialBalanceProcedure,
  getBalanceSheetProcedure,
  getIncomeStatementProcedure,
  getGeneralLedgerProcedure,
} from "@/backend/trpc/routes/accounting/reports/route";

import {
  getReferralLeadsProcedure,
  getReferralLeadProcedure,
  createReferralLeadProcedure,
  updateReferralLeadProcedure,
  deleteReferralLeadProcedure,
  updateLeadSpentProcedure,
} from "@/backend/trpc/routes/referral/leads/route";
import {
  getReferralCampaignsProcedure,
  createReferralCampaignProcedure,
  updateReferralCampaignProcedure,
  updateCampaignMetricsProcedure,
  deleteCampaignProcedure,
} from "@/backend/trpc/routes/referral/campaigns/route";
import {
  getReferralCommissionsProcedure,
  createReferralCommissionProcedure,
  updateCommissionStatusProcedure,
  getCommissionSummaryProcedure,
} from "@/backend/trpc/routes/referral/commissions/route";
import {
  getReferralStatsProcedure,
  getReferralAnalyticsProcedure,
} from "@/backend/trpc/routes/referral/analytics/route";
import {
  getReferralQRCodesProcedure,
  getReferralQRCodeProcedure,
  createReferralQRCodeProcedure,
  updateReferralQRCodeProcedure,
  trackQRScanProcedure,
  trackQRConversionProcedure,
  deleteReferralQRCodeProcedure,
  getQRCodeStatsProcedure,
} from "@/backend/trpc/routes/referral/qr-codes/route";
import {
  startChatWithLeadProcedure,
  sendMessageToLeadProcedure,
  notifyLeadConversionProcedure,
  sendBulkMessagesToLeadsProcedure,
} from "@/backend/trpc/routes/referral/start-chat/route";
import { getBalanceProcedure } from "@/backend/trpc/routes/wallet/get-balance/route";
import { getTransactionsProcedure } from "@/backend/trpc/routes/wallet/get-transactions/route";
import { rechargeProcedure } from "@/backend/trpc/routes/wallet/recharge/route";
import { confirmRechargeProcedure } from "@/backend/trpc/routes/wallet/confirm-recharge/route";
import { sendMoneyProcedure } from "@/backend/trpc/routes/wallet/send-money/route";
import { exchangeProcedure } from "@/backend/trpc/routes/wallet/exchange/route";
import { getStatsProcedure } from "@/backend/trpc/routes/wallet/get-stats/route";
import { createPaymentIntentProcedure } from "@/backend/trpc/routes/payments/create-intent/route";

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
  marketplace: createTRPCRouter({
    processOrder: processOrderProcedure,
  }),
  inventory: createTRPCRouter({
    createProduct: createProductProcedure, // New route for Ally Product Management
    getMyProducts: getMyProductsProcedure,
    getAllyOrders: getAllyOrdersProcedure,
    updateOrderStatus: updateOrderStatusProcedure,
    getItems: getInventoryItemsProcedure,
    getItem: getInventoryItemProcedure,
    createItem: createInventoryItemProcedure,
    updateItem: updateInventoryItemProcedure,
    deleteItem: deleteInventoryItemProcedure,
    getMovements: getInventoryMovementsProcedure,
    createMovement: createInventoryMovementProcedure,
    getSuppliers: getSuppliersProcedure,
    createSupplier: createSupplierProcedure,
    updateSupplier: updateSupplierProcedure,
    getPurchaseOrders: getPurchaseOrdersProcedure,
    createPurchaseOrder: createPurchaseOrderProcedure,
    updatePurchaseOrder: updatePurchaseOrderProcedure,
    receiveItems: receiveItemsProcedure,
    getStockAlerts: getStockAlertsProcedure,
  }),
  pos: createTRPCRouter({
    getTransactions: getPOSTransactionsProcedure,
    createTransaction: createPOSTransactionProcedure,
    refundTransaction: refundPOSTransactionProcedure,
    cancelTransaction: cancelPOSTransactionProcedure,
    getSessions: getPOSSessionsProcedure,
    getActiveSession: getActivePOSSessionProcedure,
    openSession: openPOSSessionProcedure,
    closeSession: closePOSSessionProcedure,
    getProducts: getPOSProductsProcedure,
    createProduct: createPOSProductProcedure,
    updateProduct: updatePOSProductProcedure,
    deleteProduct: deletePOSProductProcedure,
    getStats: getPOSStatsProcedure,
  }),
  accounting: createTRPCRouter({
    getAccounts: getAccountingAccountsProcedure,
    createAccount: createAccountingAccountProcedure,
    updateAccount: updateAccountingAccountProcedure,
    updateAccountBalance: updateAccountBalanceProcedure,
    getJournalEntries: getJournalEntriesProcedure,
    createJournalEntry: createJournalEntryProcedure,
    postJournalEntry: postJournalEntryProcedure,
    voidJournalEntry: voidJournalEntryProcedure,
    getTrialBalance: getTrialBalanceProcedure,
    getBalanceSheet: getBalanceSheetProcedure,
    getIncomeStatement: getIncomeStatementProcedure,
    getGeneralLedger: getGeneralLedgerProcedure,
  }),
  referral: createTRPCRouter({
    getLeads: getReferralLeadsProcedure,
    getLead: getReferralLeadProcedure,
    createLead: createReferralLeadProcedure,
    updateLead: updateReferralLeadProcedure,
    deleteLead: deleteReferralLeadProcedure,
    updateLeadSpent: updateLeadSpentProcedure,
    getCampaigns: getReferralCampaignsProcedure,
    createCampaign: createReferralCampaignProcedure,
    updateCampaign: updateReferralCampaignProcedure,
    updateCampaignMetrics: updateCampaignMetricsProcedure,
    deleteCampaign: deleteCampaignProcedure,
    getCommissions: getReferralCommissionsProcedure,
    createCommission: createReferralCommissionProcedure,
    updateCommissionStatus: updateCommissionStatusProcedure,
    getCommissionSummary: getCommissionSummaryProcedure,
    getStats: getReferralStatsProcedure,
    getAnalytics: getReferralAnalyticsProcedure,
    getQRCodes: getReferralQRCodesProcedure,
    getQRCode: getReferralQRCodeProcedure,
    createQRCode: createReferralQRCodeProcedure,
    updateQRCode: updateReferralQRCodeProcedure,
    trackQRScan: trackQRScanProcedure,
    trackQRConversion: trackQRConversionProcedure,
    deleteQRCode: deleteReferralQRCodeProcedure,
    getQRCodeStats: getQRCodeStatsProcedure,
    startChat: startChatWithLeadProcedure,
    sendMessageToLead: sendMessageToLeadProcedure,
    notifyConversion: notifyLeadConversionProcedure,
    sendBulkMessages: sendBulkMessagesToLeadsProcedure,
  }),
  wallet: createTRPCRouter({
    getBalance: getBalanceProcedure,
    getTransactions: getTransactionsProcedure,
    recharge: rechargeProcedure,
    confirmRecharge: confirmRechargeProcedure,
    sendMoney: sendMoneyProcedure,
    exchange: exchangeProcedure,
    getStats: getStatsProcedure,
  }),
});

export type AppRouter = typeof appRouter;