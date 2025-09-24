export interface ShippingCarrier {
  id: string;
  name: string;
  code: string;
  type: 'national' | 'international';
  enabled: boolean;
  config: {
    apiKey: string;
    apiSecret?: string;
    environment: 'sandbox' | 'production';
    baseUrl: string;
  };
  supportedCountries: string[];
  services: ShippingService[];
}

export interface ShippingService {
  id: string;
  carrierId: string;
  name: string;
  code: string;
  type: 'standard' | 'express' | 'overnight' | 'same_day';
  estimatedDays: {
    min: number;
    max: number;
  };
  maxWeight: number;
  maxDimensions: {
    length: number;
    width: number;
    height: number;
  };
  pricing: {
    baseRate: number;
    perKg: number;
    perKm?: number;
    currency: string;
  };
}

export interface ShippingQuote {
  id: string;
  carrierId: string;
  serviceId: string;
  cost: number;
  currency: string;
  estimatedDelivery: string;
  transitTime: string;
  metadata: {
    distance?: number;
    zones?: string[];
    surcharges?: {
      type: string;
      amount: number;
      description: string;
    }[];
  };
}

export interface Shipment {
  id: string;
  trackingNumber: string;
  carrierId: string;
  serviceId: string;
  status: 'created' | 'picked_up' | 'in_transit' | 'out_for_delivery' | 'delivered' | 'failed' | 'returned';
  origin: Address;
  destination: Address;
  package: Package;
  cost: number;
  currency: string;
  estimatedDelivery: string;
  actualDelivery?: string;
  events: TrackingEvent[];
  metadata: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface Address {
  id?: string;
  name: string;
  company?: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone?: string;
  email?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  isResidential: boolean;
}

export interface Package {
  weight: number;
  dimensions: {
    length: number;
    width: number;
    height: number;
  };
  value: number;
  currency: string;
  description: string;
  contents: PackageItem[];
  insurance?: {
    amount: number;
    currency: string;
  };
  signature_required: boolean;
}

export interface PackageItem {
  name: string;
  quantity: number;
  value: number;
  weight: number;
  sku?: string;
  hsCode?: string;
}

export interface TrackingEvent {
  id: string;
  status: string;
  description: string;
  location?: {
    city: string;
    state: string;
    country: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface ReturnRequest {
  id: string;
  shipmentId: string;
  orderId: string;
  reason: 'damaged' | 'wrong_item' | 'not_as_described' | 'defective' | 'other';
  description: string;
  status: 'requested' | 'approved' | 'rejected' | 'picked_up' | 'received' | 'processed';
  returnShipment?: Shipment;
  refundAmount?: number;
  photos?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface DeliveryZone {
  id: string;
  name: string;
  type: 'city' | 'state' | 'postal_code' | 'radius';
  boundaries: {
    cities?: string[];
    states?: string[];
    postalCodes?: string[];
    center?: {
      latitude: number;
      longitude: number;
      radius: number;
    };
  };
  pricing: {
    baseRate: number;
    perKg: number;
    currency: string;
  };
  estimatedDays: {
    min: number;
    max: number;
  };
  enabled: boolean;
}