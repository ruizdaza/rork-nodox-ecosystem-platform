export interface InventoryItem {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  barcode?: string;
  category: string;
  currentStock: number;
  minStock: number;
  maxStock: number;
  reorderPoint: number;
  unit: 'unit' | 'kg' | 'liter' | 'pack' | 'box';
  costPrice: number;
  sellingPrice: number;
  location: string;
  warehouseId?: string;
  lastRestockDate: string;
  expiryDate?: string;
  status: 'in_stock' | 'low_stock' | 'out_of_stock' | 'discontinued';
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface InventoryMovement {
  id: string;
  itemId: string;
  itemName: string;
  type: 'purchase' | 'sale' | 'adjustment' | 'return' | 'transfer' | 'waste';
  quantity: number;
  previousStock: number;
  newStock: number;
  cost?: number;
  reason: string;
  referenceId?: string;
  referenceType?: 'order' | 'purchase_order' | 'transfer' | 'adjustment';
  performedBy: string;
  performedByName: string;
  warehouseId?: string;
  createdAt: string;
}

export interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  taxId: string;
  paymentTerms: string;
  creditLimit: number;
  currentBalance: number;
  rating: number;
  status: 'active' | 'inactive' | 'blocked';
  productsSupplied: string[];
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface PurchaseOrder {
  id: string;
  orderNumber: string;
  supplierId: string;
  supplierName: string;
  status: 'draft' | 'pending' | 'approved' | 'ordered' | 'received' | 'cancelled';
  items: PurchaseOrderItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  total: number;
  paymentTerms: string;
  paymentStatus: 'unpaid' | 'partial' | 'paid';
  expectedDelivery?: string;
  receivedDate?: string;
  notes: string;
  createdBy: string;
  createdByName: string;
  approvedBy?: string;
  approvedByName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PurchaseOrderItem {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  quantity: number;
  receivedQuantity: number;
  unitPrice: number;
  total: number;
  notes: string;
}

export interface StockAlert {
  id: string;
  itemId: string;
  itemName: string;
  alertType: 'low_stock' | 'out_of_stock' | 'expiring_soon' | 'expired' | 'overstock';
  currentStock: number;
  threshold?: number;
  expiryDate?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  isResolved: boolean;
  resolvedAt?: string;
  createdAt: string;
}

export interface Warehouse {
  id: string;
  name: string;
  code: string;
  address: string;
  capacity: number;
  currentOccupancy: number;
  managerId?: string;
  managerName?: string;
  status: 'active' | 'inactive';
  notes: string;
  createdAt: string;
}

export interface InventoryStats {
  totalItems: number;
  totalValue: number;
  lowStockItems: number;
  outOfStockItems: number;
  expiringItems: number;
  turnoverRate: number;
  reorderNeeded: number;
  warehouseUtilization: number;
  topMovingItems: {
    id: string;
    name: string;
    movements: number;
    revenue: number;
  }[];
  slowMovingItems: {
    id: string;
    name: string;
    daysSinceLastMovement: number;
    currentStock: number;
  }[];
  monthlyTrends: {
    month: string;
    purchases: number;
    sales: number;
    value: number;
  }[];
}

export interface SupplierPerformance {
  supplierId: string;
  supplierName: string;
  totalOrders: number;
  totalSpent: number;
  onTimeDeliveryRate: number;
  qualityScore: number;
  responseTime: number;
  lastOrderDate: string;
  averageOrderValue: number;
}

export interface StockValuation {
  method: 'FIFO' | 'LIFO' | 'WAC';
  totalValue: number;
  itemValuations: {
    itemId: string;
    itemName: string;
    quantity: number;
    unitCost: number;
    totalValue: number;
  }[];
  lastCalculated: string;
}
