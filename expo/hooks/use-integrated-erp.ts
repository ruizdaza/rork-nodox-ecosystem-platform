import { useCallback } from 'react';
import { usePOS } from './use-pos';
import { useAccounting } from './use-accounting';
import { usePayments } from './use-payments';
import { POSPayment, POSTransaction } from '@/types/pos';

export const useIntegratedERP = () => {
  const pos = usePOS();
  const accounting = useAccounting();
  const payments = usePayments();

  const processSaleWithAccounting = useCallback(async (
    posPayments: POSPayment[],
    customerId?: string,
    customerName?: string,
    notes?: string
  ) => {
    try {
      const transaction = await pos.processTransaction(
        posPayments,
        customerId,
        customerName,
        notes
      );

      const primaryPayment = posPayments[0];
      await accounting.recordSaleTransaction(
        transaction.subtotal,
        transaction.tax,
        primaryPayment.method,
        transaction.id,
        `Venta POS ${transaction.transactionNumber} - ${customerName || 'Cliente General'}`,
        transaction.sellerId,
        transaction.sellerName
      );

      if (primaryPayment.method === 'card') {
        await payments.createPaymentIntent({
          amount: transaction.total,
          currency: 'COP',
          paymentMethodId: 'default',
          gatewayId: 'stripe_gateway',
          metadata: {
            transactionId: transaction.id,
            transactionNumber: transaction.transactionNumber,
            type: 'pos_sale'
          }
        });
      }

      console.log('Sale processed with accounting integration:', transaction.id);
      return transaction;
    } catch (err) {
      console.error('Error processing sale with accounting:', err);
      throw err;
    }
  }, [pos, accounting, payments]);

  const refundSaleWithAccounting = useCallback(async (
    transactionId: string,
    reason: string,
    restockItems: boolean = true
  ) => {
    try {
      const refundedTransaction = await pos.refundTransaction(
        transactionId,
        reason,
        restockItems
      );

      await accounting.recordSaleTransaction(
        -refundedTransaction.subtotal,
        -refundedTransaction.tax,
        refundedTransaction.paymentMethod === 'mixed' ? 'cash' : refundedTransaction.paymentMethod,
        `refund-${transactionId}`,
        `Reembolso de venta ${refundedTransaction.transactionNumber} - ${reason}`,
        'system',
        'Sistema'
      );

      console.log('Sale refunded with accounting integration:', transactionId);
      return refundedTransaction;
    } catch (err) {
      console.error('Error refunding sale with accounting:', err);
      throw err;
    }
  }, [pos, accounting]);

  const getFinancialSummary = useCallback((startDate?: string, endDate?: string) => {
    const posStats = pos.getPOSStats();
    const trialBalance = accounting.getTrialBalance(endDate);

    const cashAccount = accounting.accounts.find(a => a.code === '1110');
    const salesAccount = accounting.accounts.find(a => a.code === '4100');
    const inventoryAccount = accounting.accounts.find(a => a.code === '1120');

    return {
      pos: {
        todaySales: posStats.todaySales,
        todayTransactions: posStats.todayTransactions,
        averageTicket: posStats.averageTicket,
        topSellingProducts: posStats.topSellingProducts,
        paymentMethods: posStats.paymentMethodsBreakdown
      },
      accounting: {
        cashBalance: cashAccount?.balance || 0,
        salesRevenue: salesAccount?.balance || 0,
        inventoryValue: inventoryAccount?.balance || 0,
        isBalanced: trialBalance.isBalanced,
        totalAssets: trialBalance.accounts
          .filter(a => a.accountType === 'asset')
          .reduce((sum, a) => sum + a.balance, 0),
        totalLiabilities: trialBalance.accounts
          .filter(a => a.accountType === 'liability')
          .reduce((sum, a) => sum + a.balance, 0),
        totalEquity: trialBalance.accounts
          .filter(a => a.accountType === 'equity')
          .reduce((sum, a) => sum + a.balance, 0)
      },
      payments: {
        supportedCurrencies: payments.supportedCurrencies,
        availableGateways: payments.gateways.filter(g => g.enabled).length
      }
    };
  }, [pos, accounting, payments]);

  const validateBusinessRules = useCallback((transaction: POSTransaction) => {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (transaction.total < 0) {
      errors.push('El total de la transacción no puede ser negativo');
    }

    if (transaction.items.length === 0) {
      errors.push('La transacción debe tener al menos un item');
    }

    const subtotal = transaction.items.reduce((sum, item) => sum + item.subtotal, 0);
    const calculatedTotal = subtotal + transaction.tax - transaction.discount;
    
    if (Math.abs(calculatedTotal - transaction.total) > 0.01) {
      errors.push('El total calculado no coincide con el total de la transacción');
    }

    transaction.items.forEach((item, index) => {
      if (item.quantity <= 0) {
        errors.push(`Item ${index + 1}: La cantidad debe ser mayor a 0`);
      }

      if (item.unitPrice < 0) {
        errors.push(`Item ${index + 1}: El precio unitario no puede ser negativo`);
      }

      if (!item.isService && item.quantity > 100) {
        warnings.push(`Item ${index + 1}: Cantidad inusualmente alta (${item.quantity})`);
      }
    });

    if (transaction.discount > subtotal) {
      errors.push('El descuento no puede ser mayor al subtotal');
    }

    const totalPayments = transaction.payments.reduce((sum, p) => sum + p.amount, 0);
    if (Math.abs(totalPayments - transaction.total) > 0.01) {
      errors.push('El total de pagos no coincide con el total de la transacción');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }, []);

  return {
    pos,
    accounting,
    payments,
    processSaleWithAccounting,
    refundSaleWithAccounting,
    getFinancialSummary,
    validateBusinessRules
  };
};
