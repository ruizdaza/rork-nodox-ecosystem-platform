import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PaymentGateway, PaymentMethod, PaymentIntent, Subscription, FraudDetection, CurrencyExchange } from '@/types/payments';

interface PaymentState {
  gateways: PaymentGateway[];
  paymentMethods: PaymentMethod[];
  activeSubscriptions: Subscription[];
  supportedCurrencies: string[];
  exchangeRates: CurrencyExchange[];
  isLoading: boolean;
  error: string | null;
}

const MOCK_GATEWAYS: PaymentGateway[] = [
  {
    id: 'stripe_gateway',
    name: 'Stripe',
    type: 'stripe',
    enabled: true,
    config: {
      publicKey: 'pk_test_...',
      environment: 'sandbox'
    },
    supportedCurrencies: ['USD', 'EUR', 'GBP', 'COP', 'MXN'],
    supportedCountries: ['US', 'CA', 'GB', 'CO', 'MX'],
    fees: {
      percentage: 2.9,
      fixed: 0.30,
      currency: 'USD'
    }
  },
  {
    id: 'paypal_gateway',
    name: 'PayPal',
    type: 'paypal',
    enabled: true,
    config: {
      publicKey: 'sb_client_id_...',
      environment: 'sandbox'
    },
    supportedCurrencies: ['USD', 'EUR', 'GBP', 'COP'],
    supportedCountries: ['US', 'CA', 'GB', 'CO'],
    fees: {
      percentage: 3.49,
      fixed: 0.49,
      currency: 'USD'
    }
  },
  {
    id: 'wompi_gateway',
    name: 'Wompi',
    type: 'wompi',
    enabled: true,
    config: {
      publicKey: 'pub_test_...',
      environment: 'sandbox'
    },
    supportedCurrencies: ['COP'],
    supportedCountries: ['CO'],
    fees: {
      percentage: 3.4,
      fixed: 900,
      currency: 'COP'
    }
  }
];

const MOCK_EXCHANGE_RATES: CurrencyExchange[] = [
  {
    from: 'USD',
    to: 'COP',
    rate: 4200.50,
    timestamp: new Date().toISOString(),
    provider: 'xe.com'
  },
  {
    from: 'EUR',
    to: 'COP',
    rate: 4580.25,
    timestamp: new Date().toISOString(),
    provider: 'xe.com'
  }
];

export function usePayments() {
  const [state, setState] = useState<PaymentState>({
    gateways: [],
    paymentMethods: [],
    activeSubscriptions: [],
    supportedCurrencies: [],
    exchangeRates: [],
    isLoading: true,
    error: null
  });

  useEffect(() => {
    loadPaymentData();
  }, []);

  const loadPaymentData = async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const [storedMethods, storedSubscriptions] = await Promise.all([
        AsyncStorage.getItem('payment_methods'),
        AsyncStorage.getItem('active_subscriptions')
      ]);

      const paymentMethods = storedMethods ? JSON.parse(storedMethods) : [];
      const activeSubscriptions = storedSubscriptions ? JSON.parse(storedSubscriptions) : [];
      
      const supportedCurrencies = [...new Set(
        MOCK_GATEWAYS.flatMap(gateway => gateway.supportedCurrencies)
      )];

      setState({
        gateways: MOCK_GATEWAYS,
        paymentMethods,
        activeSubscriptions,
        supportedCurrencies,
        exchangeRates: MOCK_EXCHANGE_RATES,
        isLoading: false,
        error: null
      });
    } catch (error) {
      console.error('Error loading payment data:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Failed to load payment data'
      }));
    }
  };

  const createPaymentIntent = async (params: {
    amount: number;
    currency: string;
    paymentMethodId: string;
    gatewayId: string;
    metadata?: Record<string, any>;
  }): Promise<PaymentIntent> => {
    try {
      const gateway = state.gateways.find(g => g.id === params.gatewayId);
      if (!gateway) {
        throw new Error('Payment gateway not found');
      }

      const fraudDetection = await performFraudCheck(params);
      
      const paymentIntent: PaymentIntent = {
        id: `pi_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        amount: params.amount,
        currency: params.currency,
        status: fraudDetection.recommendation === 'decline' ? 'failed' : 'pending',
        paymentMethodId: params.paymentMethodId,
        gatewayId: params.gatewayId,
        clientSecret: `pi_${Date.now()}_secret_${Math.random().toString(36).substr(2, 9)}`,
        metadata: {
          userId: 'current_user_id',
          description: 'Payment via NodoX',
          ...params.metadata
        },
        fraudScore: fraudDetection.riskScore,
        riskLevel: fraudDetection.riskLevel,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      console.log('Payment intent created:', paymentIntent);
      return paymentIntent;
    } catch (error) {
      console.error('Error creating payment intent:', error);
      throw error;
    }
  };

  const performFraudCheck = async (params: {
    amount: number;
    currency: string;
    paymentMethodId: string;
  }): Promise<FraudDetection> => {
    const riskScore = Math.random() * 100;
    const riskLevel = riskScore > 80 ? 'high' : riskScore > 50 ? 'medium' : 'low';
    
    return {
      transactionId: `fraud_${Date.now()}`,
      riskScore,
      riskLevel,
      flags: riskLevel === 'high' ? ['high_amount', 'new_payment_method'] : [],
      recommendation: riskLevel === 'high' ? 'review' : 'approve',
      checks: {
        velocity: true,
        geolocation: true,
        deviceFingerprint: true,
        behaviorAnalysis: riskLevel !== 'high'
      }
    };
  };

  const addPaymentMethod = async (paymentMethod: Omit<PaymentMethod, 'id'>) => {
    try {
      const newMethod: PaymentMethod = {
        ...paymentMethod,
        id: `pm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      };

      const updatedMethods = [...state.paymentMethods, newMethod];
      await AsyncStorage.setItem('payment_methods', JSON.stringify(updatedMethods));
      
      setState(prev => ({
        ...prev,
        paymentMethods: updatedMethods
      }));

      console.log('Payment method added:', newMethod);
      return newMethod;
    } catch (error) {
      console.error('Error adding payment method:', error);
      throw error;
    }
  };

  const convertCurrency = (amount: number, fromCurrency: string, toCurrency: string): number => {
    if (fromCurrency === toCurrency) return amount;
    
    const exchangeRate = state.exchangeRates.find(
      rate => rate.from === fromCurrency && rate.to === toCurrency
    );
    
    if (!exchangeRate) {
      console.warn(`Exchange rate not found for ${fromCurrency} to ${toCurrency}`);
      return amount;
    }
    
    return amount * exchangeRate.rate;
  };

  const calculateFees = (amount: number, currency: string, gatewayId: string): number => {
    const gateway = state.gateways.find(g => g.id === gatewayId);
    if (!gateway) return 0;
    
    const percentageFee = (amount * gateway.fees.percentage) / 100;
    const fixedFee = gateway.fees.currency === currency 
      ? gateway.fees.fixed 
      : convertCurrency(gateway.fees.fixed, gateway.fees.currency, currency);
    
    return percentageFee + fixedFee;
  };

  return {
    ...state,
    createPaymentIntent,
    addPaymentMethod,
    convertCurrency,
    calculateFees,
    refreshData: loadPaymentData
  };
}