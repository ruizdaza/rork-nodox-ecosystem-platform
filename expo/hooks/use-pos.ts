import { useState, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  POSTransaction,
  POSTransactionItem,
  POSPayment,
  POSSessionSummary,
  POSCartItem,
  POSProduct,
  POSStats
} from '@/types/pos';
import { useInventory } from './use-inventory';

const POS_TRANSACTIONS_KEY = 'pos_transactions';
const POS_SESSIONS_KEY = 'pos_sessions';
const POS_CURRENT_SESSION_KEY = 'pos_current_session';

export const usePOS = () => {
  const [transactions, setTransactions] = useState<POSTransaction[]>([]);
  const [sessions, setSessions] = useState<POSSessionSummary[]>([]);
  const [currentSession, setCurrentSession] = useState<POSSessionSummary | null>(null);
  const [cart, setCart] = useState<POSCartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { updateInventoryItem, allItems, addMovement } = useInventory();

  useEffect(() => {
    loadPOSData();
  }, []);

  const loadPOSData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [storedTransactions, storedSessions, storedCurrentSession] = await Promise.all([
        AsyncStorage.getItem(POS_TRANSACTIONS_KEY),
        AsyncStorage.getItem(POS_SESSIONS_KEY),
        AsyncStorage.getItem(POS_CURRENT_SESSION_KEY)
      ]);

      if (storedTransactions) {
        setTransactions(JSON.parse(storedTransactions));
      }

      if (storedSessions) {
        setSessions(JSON.parse(storedSessions));
      }

      if (storedCurrentSession) {
        setCurrentSession(JSON.parse(storedCurrentSession));
      }

      console.log('POS data loaded successfully');
    } catch (err) {
      console.error('Error loading POS data:', err);
      setError('Failed to load POS data');
    } finally {
      setIsLoading(false);
    }
  };

  const savePOSData = async (
    newTransactions: POSTransaction[],
    newSessions: POSSessionSummary[],
    newCurrentSession: POSSessionSummary | null
  ) => {
    try {
      await Promise.all([
        AsyncStorage.setItem(POS_TRANSACTIONS_KEY, JSON.stringify(newTransactions)),
        AsyncStorage.setItem(POS_SESSIONS_KEY, JSON.stringify(newSessions)),
        newCurrentSession 
          ? AsyncStorage.setItem(POS_CURRENT_SESSION_KEY, JSON.stringify(newCurrentSession))
          : AsyncStorage.removeItem(POS_CURRENT_SESSION_KEY)
      ]);
      console.log('POS data saved successfully');
    } catch (err) {
      console.error('Error saving POS data:', err);
      throw new Error('Failed to save POS data');
    }
  };

  const validateStockAvailability = (items: POSCartItem[]): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    items.forEach(item => {
      if (!item.isService && item.stockQuantity !== undefined) {
        if (item.stockQuantity < item.quantity) {
          errors.push(`Stock insuficiente para ${item.productName}. Disponible: ${item.stockQuantity}, Requerido: ${item.quantity}`);
        }
      }
    });

    return {
      isValid: errors.length === 0,
      errors
    };
  };

  const updateInventoryStock = async (items: POSTransactionItem[], transactionId: string) => {
    for (const item of items) {
      if (!item.isService) {
        const inventoryItem = allItems.find(i => i.productId === item.productId);
        if (inventoryItem) {
          const newStock = inventoryItem.currentStock - item.quantity;
          
          updateInventoryItem(inventoryItem.id, {
            currentStock: newStock,
            status: newStock > inventoryItem.minStock ? 'in_stock' : 
                    newStock > 0 ? 'low_stock' : 'out_of_stock',
            updatedAt: new Date().toISOString()
          });

          addMovement({
            itemId: inventoryItem.id,
            itemName: inventoryItem.productName,
            type: 'sale',
            quantity: -item.quantity,
            previousStock: inventoryItem.currentStock,
            newStock,
            cost: item.total,
            reason: `Venta POS #${transactionId}`,
            referenceId: transactionId,
            referenceType: 'order',
            performedBy: 'pos-system',
            performedByName: 'Sistema POS'
          });
        }
      }
    }
  };

  const openSession = useCallback(async (sellerId: string, sellerName: string, openingCash: number) => {
    try {
      if (currentSession && currentSession.status === 'open') {
        throw new Error('Ya existe una sesión abierta');
      }

      const newSession: POSSessionSummary = {
        sessionId: `session-${Date.now()}`,
        sellerId,
        sellerName,
        startDate: new Date().toISOString(),
        status: 'open',
        transactions: 0,
        totalSales: 0,
        totalCash: 0,
        totalCard: 0,
        totalNcop: 0,
        totalTransfer: 0,
        totalRefunds: 0,
        openingCash,
        closingCash: 0,
        expectedCash: openingCash,
        cashDifference: 0,
        createdAt: new Date().toISOString()
      };

      const updatedSessions = [...sessions, newSession];
      setCurrentSession(newSession);
      setSessions(updatedSessions);
      
      await savePOSData(transactions, updatedSessions, newSession);
      
      console.log('Session opened:', newSession.sessionId);
      return newSession;
    } catch (err: any) {
      console.error('Error opening session:', err);
      setError(err.message || 'Failed to open session');
      throw err;
    }
  }, [currentSession, sessions, transactions]);

  const closeSession = useCallback(async (closingCash: number, notes?: string) => {
    try {
      if (!currentSession || currentSession.status !== 'open') {
        throw new Error('No hay una sesión abierta');
      }

      const cashDifference = closingCash - currentSession.expectedCash;
      
      const closedSession: POSSessionSummary = {
        ...currentSession,
        endDate: new Date().toISOString(),
        status: 'closed',
        closingCash,
        cashDifference,
        notes,
        closedAt: new Date().toISOString()
      };

      const updatedSessions = sessions.map(s => 
        s.sessionId === closedSession.sessionId ? closedSession : s
      );

      setCurrentSession(null);
      setSessions(updatedSessions);
      
      await savePOSData(transactions, updatedSessions, null);
      
      console.log('Session closed:', closedSession.sessionId);
      return closedSession;
    } catch (err: any) {
      console.error('Error closing session:', err);
      setError(err.message || 'Failed to close session');
      throw err;
    }
  }, [currentSession, sessions, transactions]);

  const addToCart = useCallback((product: POSProduct, quantity: number = 1) => {
    const existingItem = cart.find(item => item.productId === product.id);
    
    if (existingItem) {
      const newQuantity = existingItem.quantity + quantity;
      
      if (!product.isService && product.stockQuantity !== undefined && newQuantity > product.stockQuantity) {
        throw new Error(`Stock insuficiente para ${product.name}`);
      }

      setCart(cart.map(item => 
        item.productId === product.id
          ? {
              ...item,
              quantity: newQuantity,
              subtotal: newQuantity * item.unitPrice,
              tax: (newQuantity * item.unitPrice * product.taxRate) / 100,
              total: newQuantity * item.unitPrice + ((newQuantity * item.unitPrice * product.taxRate) / 100) - item.discount
            }
          : item
      ));
    } else {
      const subtotal = product.price * quantity;
      const tax = (subtotal * product.taxRate) / 100;
      const total = subtotal + tax;
      
      const newItem: POSCartItem = {
        productId: product.id,
        productName: product.name,
        sku: product.sku,
        isService: product.isService,
        quantity,
        unitPrice: product.price,
        discount: 0,
        subtotal,
        tax,
        total,
        stockQuantity: product.stockQuantity
      };
      
      setCart([...cart, newItem]);
    }
  }, [cart]);

  const removeFromCart = useCallback((productId: string) => {
    setCart(cart.filter(item => item.productId !== productId));
  }, [cart]);

  const updateCartQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCart(cart.map(item => {
      if (item.productId === productId) {
        const subtotal = quantity * item.unitPrice;
        const tax = (subtotal * 0.19) / 100;
        const total = subtotal + tax - item.discount;
        
        return {
          ...item,
          quantity,
          subtotal,
          tax,
          total
        };
      }
      return item;
    }));
  }, [cart, removeFromCart]);

  const applyDiscount = useCallback((productId: string, discount: number) => {
    setCart(cart.map(item => {
      if (item.productId === productId) {
        const total = item.subtotal + item.tax - discount;
        return {
          ...item,
          discount,
          total
        };
      }
      return item;
    }));
  }, [cart]);

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  const processTransaction = useCallback(async (
    payments: POSPayment[],
    customerId?: string,
    customerName?: string,
    notes?: string
  ) => {
    try {
      if (!currentSession || currentSession.status !== 'open') {
        throw new Error('No hay una sesión abierta');
      }

      if (cart.length === 0) {
        throw new Error('El carrito está vacío');
      }

      const validation = validateStockAvailability(cart);
      if (!validation.isValid) {
        throw new Error(validation.errors.join(', '));
      }

      const subtotal = cart.reduce((sum, item) => sum + item.subtotal, 0);
      const tax = cart.reduce((sum, item) => sum + item.tax, 0);
      const discount = cart.reduce((sum, item) => sum + item.discount, 0);
      const total = cart.reduce((sum, item) => sum + item.total, 0);

      const totalPayments = payments.reduce((sum, p) => sum + p.amount, 0);
      if (Math.abs(totalPayments - total) > 0.01) {
        throw new Error('El total de pagos no coincide con el total de la transacción');
      }

      const transactionItems: POSTransactionItem[] = cart.map(item => ({
        id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        productId: item.productId,
        productName: item.productName,
        sku: item.sku,
        isService: item.isService,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        discount: item.discount,
        subtotal: item.subtotal,
        tax: item.tax,
        total: item.total
      }));

      const paymentMethod = payments.length === 1 ? payments[0].method : 'mixed';

      const transaction: POSTransaction = {
        id: `trans-${Date.now()}`,
        transactionNumber: `TXN-${Date.now().toString().slice(-8)}`,
        date: new Date().toISOString(),
        items: transactionItems,
        subtotal,
        tax,
        discount,
        total,
        paymentMethod,
        payments,
        customerId,
        customerName,
        sellerId: currentSession.sellerId,
        sellerName: currentSession.sellerName,
        status: 'completed',
        notes,
        createdAt: new Date().toISOString(),
        completedAt: new Date().toISOString()
      };

      await updateInventoryStock(transactionItems, transaction.id);

      const updatedSession: POSSessionSummary = {
        ...currentSession,
        transactions: currentSession.transactions + 1,
        totalSales: currentSession.totalSales + total,
        totalCash: currentSession.totalCash + (payments.find(p => p.method === 'cash')?.amount || 0),
        totalCard: currentSession.totalCard + (payments.find(p => p.method === 'card')?.amount || 0),
        totalNcop: currentSession.totalNcop + (payments.find(p => p.method === 'ncop')?.amount || 0),
        totalTransfer: currentSession.totalTransfer + (payments.find(p => p.method === 'transfer')?.amount || 0),
        expectedCash: currentSession.expectedCash + (payments.find(p => p.method === 'cash')?.amount || 0)
      };

      const updatedTransactions = [...transactions, transaction];
      const updatedSessions = sessions.map(s => 
        s.sessionId === updatedSession.sessionId ? updatedSession : s
      );

      setTransactions(updatedTransactions);
      setCurrentSession(updatedSession);
      setSessions(updatedSessions);
      setCart([]);

      await savePOSData(updatedTransactions, updatedSessions, updatedSession);

      console.log('Transaction processed:', transaction.id);
      return transaction;
    } catch (err: any) {
      console.error('Error processing transaction:', err);
      setError(err.message || 'Failed to process transaction');
      throw err;
    }
  }, [cart, currentSession, sessions, transactions, validateStockAvailability, updateInventoryStock]);

  const refundTransaction = useCallback(async (
    transactionId: string,
    reason: string,
    restockItems: boolean = true
  ) => {
    try {
      const transaction = transactions.find(t => t.id === transactionId);
      if (!transaction) {
        throw new Error('Transacción no encontrada');
      }

      if (transaction.status === 'refunded') {
        throw new Error('Esta transacción ya fue reembolsada');
      }

      if (restockItems) {
        for (const item of transaction.items) {
          if (!item.isService) {
            const inventoryItem = allItems.find(i => i.productId === item.productId);
            if (inventoryItem) {
              const newStock = inventoryItem.currentStock + item.quantity;
              
              updateInventoryItem(inventoryItem.id, {
                currentStock: newStock,
                status: newStock > inventoryItem.minStock ? 'in_stock' : 'low_stock',
                updatedAt: new Date().toISOString()
              });

              addMovement({
                itemId: inventoryItem.id,
                itemName: inventoryItem.productName,
                type: 'return',
                quantity: item.quantity,
                previousStock: inventoryItem.currentStock,
                newStock,
                cost: item.total,
                reason: `Reembolso POS #${transactionId}`,
                referenceId: transactionId,
                referenceType: 'order',
                performedBy: 'pos-system',
                performedByName: 'Sistema POS'
              });
            }
          }
        }
      }

      const refundedTransaction: POSTransaction = {
        ...transaction,
        status: 'refunded',
        refundReason: reason,
        refundedAt: new Date().toISOString()
      };

      const updatedTransactions = transactions.map(t => 
        t.id === transactionId ? refundedTransaction : t
      );

      if (currentSession && currentSession.status === 'open') {
        const updatedSession: POSSessionSummary = {
          ...currentSession,
          totalRefunds: currentSession.totalRefunds + transaction.total,
          totalSales: currentSession.totalSales - transaction.total,
          expectedCash: currentSession.expectedCash - (transaction.payments.find(p => p.method === 'cash')?.amount || 0)
        };

        const updatedSessions = sessions.map(s => 
          s.sessionId === updatedSession.sessionId ? updatedSession : s
        );

        setCurrentSession(updatedSession);
        setSessions(updatedSessions);
        setTransactions(updatedTransactions);

        await savePOSData(updatedTransactions, updatedSessions, updatedSession);
      } else {
        setTransactions(updatedTransactions);
        await savePOSData(updatedTransactions, sessions, currentSession);
      }

      console.log('Transaction refunded:', transactionId);
      return refundedTransaction;
    } catch (err: any) {
      console.error('Error refunding transaction:', err);
      setError(err.message || 'Failed to refund transaction');
      throw err;
    }
  }, [transactions, currentSession, sessions, allItems, updateInventoryItem, addMovement]);

  const getPOSStats = useCallback((): POSStats => {
    const today = new Date().toISOString().split('T')[0];
    const todayTransactions = transactions.filter(t => 
      t.date.startsWith(today) && t.status === 'completed'
    );

    const todaySales = todayTransactions.reduce((sum, t) => sum + t.total, 0);
    const averageTicket = todayTransactions.length > 0 ? todaySales / todayTransactions.length : 0;

    const productSales: { [key: string]: { name: string; quantity: number; revenue: number } } = {};
    todayTransactions.forEach(t => {
      t.items.forEach(item => {
        if (!productSales[item.productId]) {
          productSales[item.productId] = {
            name: item.productName,
            quantity: 0,
            revenue: 0
          };
        }
        productSales[item.productId].quantity += item.quantity;
        productSales[item.productId].revenue += item.total;
      });
    });

    const topSellingProducts = Object.entries(productSales)
      .map(([productId, data]) => ({
        productId,
        productName: data.name,
        quantity: data.quantity,
        revenue: data.revenue
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    const paymentMethodsBreakdown = {
      cash: todayTransactions.reduce((sum, t) => 
        sum + (t.payments.find(p => p.method === 'cash')?.amount || 0), 0),
      card: todayTransactions.reduce((sum, t) => 
        sum + (t.payments.find(p => p.method === 'card')?.amount || 0), 0),
      ncop: todayTransactions.reduce((sum, t) => 
        sum + (t.payments.find(p => p.method === 'ncop')?.amount || 0), 0),
      transfer: todayTransactions.reduce((sum, t) => 
        sum + (t.payments.find(p => p.method === 'transfer')?.amount || 0), 0)
    };

    const hourlySales = Array.from({ length: 24 }, (_, hour) => {
      const hourTransactions = todayTransactions.filter(t => {
        const transactionHour = new Date(t.date).getHours();
        return transactionHour === hour;
      });
      
      return {
        hour: `${hour.toString().padStart(2, '0')}:00`,
        sales: hourTransactions.reduce((sum, t) => sum + t.total, 0),
        transactions: hourTransactions.length
      };
    });

    return {
      todaySales,
      todayTransactions: todayTransactions.length,
      averageTicket,
      topSellingProducts,
      paymentMethodsBreakdown,
      hourlySales
    };
  }, [transactions]);

  return {
    transactions,
    sessions,
    currentSession,
    cart,
    isLoading,
    error,
    openSession,
    closeSession,
    addToCart,
    removeFromCart,
    updateCartQuantity,
    applyDiscount,
    clearCart,
    processTransaction,
    refundTransaction,
    getPOSStats,
    refreshData: loadPOSData
  };
};
