import { useState, useEffect } from 'react';
import { ShippingCarrier, ShippingQuote, Shipment, ReturnRequest, DeliveryZone, Address, Package } from '@/types/logistics';

interface LogisticsState {
  carriers: ShippingCarrier[];
  deliveryZones: DeliveryZone[];
  activeShipments: Shipment[];
  returnRequests: ReturnRequest[];
  isLoading: boolean;
  error: string | null;
}

const MOCK_CARRIERS: ShippingCarrier[] = [
  {
    id: 'coordinadora',
    name: 'Coordinadora',
    code: 'COORD',
    type: 'national',
    enabled: true,
    config: {
      apiKey: 'coord_api_key',
      environment: 'sandbox',
      baseUrl: 'https://api.coordinadora.com'
    },
    supportedCountries: ['CO'],
    services: [
      {
        id: 'coord_standard',
        carrierId: 'coordinadora',
        name: 'Envío Estándar',
        code: 'STD',
        type: 'standard',
        estimatedDays: { min: 2, max: 5 },
        maxWeight: 50,
        maxDimensions: { length: 100, width: 100, height: 100 },
        pricing: { baseRate: 8000, perKg: 2000, currency: 'COP' }
      },
      {
        id: 'coord_express',
        carrierId: 'coordinadora',
        name: 'Envío Express',
        code: 'EXP',
        type: 'express',
        estimatedDays: { min: 1, max: 2 },
        maxWeight: 30,
        maxDimensions: { length: 80, width: 80, height: 80 },
        pricing: { baseRate: 15000, perKg: 3500, currency: 'COP' }
      }
    ]
  },
  {
    id: 'servientrega',
    name: 'Servientrega',
    code: 'SERVI',
    type: 'national',
    enabled: true,
    config: {
      apiKey: 'servi_api_key',
      environment: 'sandbox',
      baseUrl: 'https://api.servientrega.com'
    },
    supportedCountries: ['CO'],
    services: [
      {
        id: 'servi_standard',
        carrierId: 'servientrega',
        name: 'Envío Nacional',
        code: 'NAC',
        type: 'standard',
        estimatedDays: { min: 3, max: 7 },
        maxWeight: 70,
        maxDimensions: { length: 120, width: 120, height: 120 },
        pricing: { baseRate: 7500, perKg: 1800, currency: 'COP' }
      }
    ]
  },
  {
    id: 'dhl',
    name: 'DHL Express',
    code: 'DHL',
    type: 'international',
    enabled: true,
    config: {
      apiKey: 'dhl_api_key',
      environment: 'sandbox',
      baseUrl: 'https://api.dhl.com'
    },
    supportedCountries: ['CO', 'US', 'CA', 'MX', 'BR', 'AR'],
    services: [
      {
        id: 'dhl_express',
        carrierId: 'dhl',
        name: 'DHL Express Worldwide',
        code: 'EXP',
        type: 'express',
        estimatedDays: { min: 1, max: 3 },
        maxWeight: 70,
        maxDimensions: { length: 120, width: 80, height: 80 },
        pricing: { baseRate: 45000, perKg: 8000, currency: 'COP' }
      }
    ]
  }
];

const MOCK_DELIVERY_ZONES: DeliveryZone[] = [
  {
    id: 'bogota_zone',
    name: 'Bogotá y Área Metropolitana',
    type: 'city',
    boundaries: {
      cities: ['Bogotá', 'Soacha', 'Chía', 'Cajicá', 'Zipaquirá']
    },
    pricing: { baseRate: 5000, perKg: 1000, currency: 'COP' },
    estimatedDays: { min: 1, max: 2 },
    enabled: true
  },
  {
    id: 'medellin_zone',
    name: 'Medellín y Valle de Aburrá',
    type: 'city',
    boundaries: {
      cities: ['Medellín', 'Envigado', 'Itagüí', 'Sabaneta', 'Bello']
    },
    pricing: { baseRate: 6000, perKg: 1200, currency: 'COP' },
    estimatedDays: { min: 2, max: 3 },
    enabled: true
  }
];

export function useLogistics() {
  const [state, setState] = useState<LogisticsState>({
    carriers: [],
    deliveryZones: [],
    activeShipments: [],
    returnRequests: [],
    isLoading: true,
    error: null
  });

  useEffect(() => {
    loadLogisticsData();
  }, []);

  const loadLogisticsData = async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      setState({
        carriers: MOCK_CARRIERS,
        deliveryZones: MOCK_DELIVERY_ZONES,
        activeShipments: [],
        returnRequests: [],
        isLoading: false,
        error: null
      });
    } catch (error) {
      console.error('Error loading logistics data:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Failed to load logistics data'
      }));
    }
  };

  const calculateShippingQuotes = async (params: {
    origin: Address;
    destination: Address;
    package: Package;
    serviceTypes?: ('standard' | 'express' | 'overnight' | 'same_day')[];
  }): Promise<ShippingQuote[]> => {
    try {
      const quotes: ShippingQuote[] = [];
      
      for (const carrier of state.carriers) {
        if (!carrier.enabled) continue;
        
        const availableServices = carrier.services.filter(service => {
          if (params.serviceTypes && !params.serviceTypes.includes(service.type)) {
            return false;
          }
          
          if (params.package.weight > service.maxWeight) return false;
          
          const { length, width, height } = params.package.dimensions;
          const maxDim = service.maxDimensions;
          if (length > maxDim.length || width > maxDim.width || height > maxDim.height) {
            return false;
          }
          
          return true;
        });
        
        for (const service of availableServices) {
          const baseCost = service.pricing.baseRate;
          const weightCost = params.package.weight * service.pricing.perKg;
          const totalCost = baseCost + weightCost;
          
          const estimatedDelivery = new Date();
          estimatedDelivery.setDate(estimatedDelivery.getDate() + service.estimatedDays.max);
          
          quotes.push({
            id: `quote_${carrier.id}_${service.id}_${Date.now()}`,
            carrierId: carrier.id,
            serviceId: service.id,
            cost: totalCost,
            currency: service.pricing.currency,
            estimatedDelivery: estimatedDelivery.toISOString(),
            transitTime: `${service.estimatedDays.min}-${service.estimatedDays.max} días`,
            metadata: {}
          });
        }
      }
      
      return quotes.sort((a, b) => a.cost - b.cost);
    } catch (error) {
      console.error('Error calculating shipping quotes:', error);
      throw error;
    }
  };

  const createShipment = async (params: {
    quoteId: string;
    origin: Address;
    destination: Address;
    package: Package;
    metadata?: Record<string, any>;
  }): Promise<Shipment> => {
    try {
      const trackingNumber = `TRK${Date.now()}${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
      
      const shipment: Shipment = {
        id: `ship_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        trackingNumber,
        carrierId: 'coordinadora',
        serviceId: 'coord_standard',
        status: 'created',
        origin: params.origin,
        destination: params.destination,
        package: params.package,
        cost: 12000,
        currency: 'COP',
        estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        events: [
          {
            id: `event_${Date.now()}`,
            status: 'created',
            description: 'Envío creado y listo para recolección',
            timestamp: new Date().toISOString()
          }
        ],
        metadata: params.metadata || {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const updatedShipments = [...state.activeShipments, shipment];
      setState(prev => ({
        ...prev,
        activeShipments: updatedShipments
      }));

      console.log('Shipment created:', shipment);
      return shipment;
    } catch (error) {
      console.error('Error creating shipment:', error);
      throw error;
    }
  };

  const trackShipment = async (trackingNumber: string): Promise<Shipment | null> => {
    try {
      const shipment = state.activeShipments.find(s => s.trackingNumber === trackingNumber);
      
      if (!shipment) {
        console.warn('Shipment not found:', trackingNumber);
        return null;
      }

      const mockStatuses = ['created', 'picked_up', 'in_transit', 'out_for_delivery', 'delivered'];
      const currentStatusIndex = mockStatuses.indexOf(shipment.status);
      
      if (currentStatusIndex < mockStatuses.length - 1 && Math.random() > 0.5) {
        const newStatus = mockStatuses[currentStatusIndex + 1] as any;
        const updatedShipment = {
          ...shipment,
          status: newStatus,
          events: [
            ...shipment.events,
            {
              id: `event_${Date.now()}`,
              status: newStatus,
              description: getStatusDescription(newStatus),
              timestamp: new Date().toISOString()
            }
          ],
          updatedAt: new Date().toISOString()
        };

        const updatedShipments = state.activeShipments.map(s => 
          s.id === shipment.id ? updatedShipment : s
        );
        
        setState(prev => ({
          ...prev,
          activeShipments: updatedShipments
        }));

        return updatedShipment;
      }

      return shipment;
    } catch (error) {
      console.error('Error tracking shipment:', error);
      throw error;
    }
  };

  const createReturnRequest = async (params: {
    shipmentId: string;
    orderId: string;
    reason: 'damaged' | 'wrong_item' | 'not_as_described' | 'defective' | 'other';
    description: string;
    photos?: string[];
  }): Promise<ReturnRequest> => {
    try {
      const returnRequest: ReturnRequest = {
        id: `ret_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        shipmentId: params.shipmentId,
        orderId: params.orderId,
        reason: params.reason,
        description: params.description,
        status: 'requested',
        photos: params.photos || [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const updatedReturns = [...state.returnRequests, returnRequest];
      setState(prev => ({
        ...prev,
        returnRequests: updatedReturns
      }));

      console.log('Return request created:', returnRequest);
      return returnRequest;
    } catch (error) {
      console.error('Error creating return request:', error);
      throw error;
    }
  };

  const getStatusDescription = (status: string): string => {
    const descriptions: Record<string, string> = {
      created: 'Envío creado y listo para recolección',
      picked_up: 'Paquete recolectado por la transportadora',
      in_transit: 'Paquete en tránsito hacia su destino',
      out_for_delivery: 'Paquete en reparto, será entregado hoy',
      delivered: 'Paquete entregado exitosamente',
      failed: 'Intento de entrega fallido',
      returned: 'Paquete devuelto al remitente'
    };
    return descriptions[status] || 'Estado desconocido';
  };

  return {
    ...state,
    calculateShippingQuotes,
    createShipment,
    trackShipment,
    createReturnRequest,
    refreshData: loadLogisticsData
  };
}