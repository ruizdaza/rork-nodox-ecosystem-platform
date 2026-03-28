import { useState, useMemo } from 'react';
import {
  InventoryItem,
  InventoryMovement,
  Supplier,
  PurchaseOrder,
  StockAlert,
  Warehouse,
  InventoryStats,
  SupplierPerformance,
  PurchaseOrderItem
} from '@/types/inventory';

const mockInventoryItems: InventoryItem[] = [
  {
    id: '1',
    productId: 'prod-1',
    productName: 'Shampoo Professional 500ml',
    sku: 'SHP-PRO-500',
    barcode: '7891234567890',
    category: 'Cuidado Capilar',
    currentStock: 45,
    minStock: 20,
    maxStock: 100,
    reorderPoint: 25,
    unit: 'unit',
    costPrice: 25000,
    sellingPrice: 45000,
    location: 'Bodega A-12',
    lastRestockDate: '2024-01-10',
    status: 'in_stock',
    notes: 'Producto premium',
    createdAt: '2023-06-01T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z'
  },
  {
    id: '2',
    productId: 'prod-2',
    productName: 'Acondicionador Reparador 500ml',
    sku: 'ACD-REP-500',
    barcode: '7891234567891',
    category: 'Cuidado Capilar',
    currentStock: 8,
    minStock: 15,
    maxStock: 80,
    reorderPoint: 20,
    unit: 'unit',
    costPrice: 28000,
    sellingPrice: 50000,
    location: 'Bodega A-13',
    lastRestockDate: '2023-12-20',
    status: 'low_stock',
    notes: 'Popular entre clientes',
    createdAt: '2023-06-01T00:00:00Z',
    updatedAt: '2024-01-12T00:00:00Z'
  },
  {
    id: '3',
    productId: 'prod-3',
    productName: 'Tinte Capilar Negro',
    sku: 'TIN-CAP-NEG',
    barcode: '7891234567892',
    category: 'Coloración',
    currentStock: 0,
    minStock: 10,
    maxStock: 50,
    reorderPoint: 15,
    unit: 'unit',
    costPrice: 15000,
    sellingPrice: 30000,
    location: 'Bodega B-05',
    lastRestockDate: '2023-11-15',
    status: 'out_of_stock',
    notes: 'Urgente reabastecer',
    createdAt: '2023-06-01T00:00:00Z',
    updatedAt: '2024-01-08T00:00:00Z'
  },
  {
    id: '4',
    productId: 'prod-4',
    productName: 'Mascarilla Hidratante 300ml',
    sku: 'MAS-HID-300',
    category: 'Tratamientos',
    currentStock: 32,
    minStock: 15,
    maxStock: 60,
    reorderPoint: 20,
    unit: 'unit',
    costPrice: 35000,
    sellingPrice: 65000,
    location: 'Bodega A-14',
    lastRestockDate: '2024-01-05',
    status: 'in_stock',
    notes: '',
    createdAt: '2023-07-01T00:00:00Z',
    updatedAt: '2024-01-10T00:00:00Z'
  }
];

const mockSuppliers: Supplier[] = [
  {
    id: '1',
    name: 'Distribuidora Beauty Pro',
    contactPerson: 'Juan Rodríguez',
    email: 'juan@beautypro.com',
    phone: '+57 310 123 4567',
    address: 'Calle 50 #23-45, Bogotá',
    taxId: '900123456-1',
    paymentTerms: '30 días',
    creditLimit: 10000000,
    currentBalance: 2500000,
    rating: 4.5,
    status: 'active',
    productsSupplied: ['Shampoo', 'Acondicionador', 'Mascarillas'],
    notes: 'Proveedor principal, excelente servicio',
    createdAt: '2023-01-15T00:00:00Z',
    updatedAt: '2024-01-10T00:00:00Z'
  },
  {
    id: '2',
    name: 'Cosméticos Profesionales SAS',
    contactPerson: 'María García',
    email: 'maria@cosprofe.com',
    phone: '+57 311 234 5678',
    address: 'Av. 68 #45-67, Medellín',
    taxId: '900234567-2',
    paymentTerms: '15 días',
    creditLimit: 5000000,
    currentBalance: 850000,
    rating: 4.2,
    status: 'active',
    productsSupplied: ['Tintes', 'Decolorantes', 'Herramientas'],
    notes: 'Buenos precios en tintes',
    createdAt: '2023-03-20T00:00:00Z',
    updatedAt: '2024-01-08T00:00:00Z'
  },
  {
    id: '3',
    name: 'Importadora Style Plus',
    contactPerson: 'Carlos Mendoza',
    email: 'carlos@styleplus.com',
    phone: '+57 312 345 6789',
    address: 'Carrera 15 #88-23, Cali',
    taxId: '900345678-3',
    paymentTerms: '45 días',
    creditLimit: 15000000,
    currentBalance: 5200000,
    rating: 4.8,
    status: 'active',
    productsSupplied: ['Productos importados', 'Equipos profesionales'],
    notes: 'Proveedor de productos premium',
    createdAt: '2023-02-10T00:00:00Z',
    updatedAt: '2024-01-12T00:00:00Z'
  }
];

const mockPurchaseOrders: PurchaseOrder[] = [
  {
    id: '1',
    orderNumber: 'PO-2024-001',
    supplierId: '1',
    supplierName: 'Distribuidora Beauty Pro',
    status: 'ordered',
    items: [
      {
        id: '1',
        productId: 'prod-1',
        productName: 'Shampoo Professional 500ml',
        sku: 'SHP-PRO-500',
        quantity: 50,
        receivedQuantity: 0,
        unitPrice: 25000,
        total: 1250000,
        notes: ''
      },
      {
        id: '2',
        productId: 'prod-2',
        productName: 'Acondicionador Reparador 500ml',
        sku: 'ACD-REP-500',
        quantity: 40,
        receivedQuantity: 0,
        unitPrice: 28000,
        total: 1120000,
        notes: ''
      }
    ],
    subtotal: 2370000,
    tax: 450300,
    shipping: 50000,
    discount: 0,
    total: 2870300,
    paymentTerms: '30 días',
    paymentStatus: 'unpaid',
    expectedDelivery: '2024-02-05',
    notes: 'Reabastecimiento mensual',
    createdBy: 'user-1',
    createdByName: 'Admin Usuario',
    createdAt: '2024-01-20T10:00:00Z',
    updatedAt: '2024-01-20T10:00:00Z'
  },
  {
    id: '2',
    orderNumber: 'PO-2024-002',
    supplierId: '2',
    supplierName: 'Cosméticos Profesionales SAS',
    status: 'received',
    items: [
      {
        id: '3',
        productId: 'prod-3',
        productName: 'Tinte Capilar Negro',
        sku: 'TIN-CAP-NEG',
        quantity: 30,
        receivedQuantity: 30,
        unitPrice: 15000,
        total: 450000,
        notes: ''
      }
    ],
    subtotal: 450000,
    tax: 85500,
    shipping: 25000,
    discount: 0,
    total: 560500,
    paymentTerms: '15 días',
    paymentStatus: 'paid',
    expectedDelivery: '2024-01-18',
    receivedDate: '2024-01-18',
    notes: 'Entrega completa y a tiempo',
    createdBy: 'user-1',
    createdByName: 'Admin Usuario',
    createdAt: '2024-01-10T08:00:00Z',
    updatedAt: '2024-01-18T14:30:00Z'
  }
];

const mockMovements: InventoryMovement[] = [
  {
    id: '1',
    itemId: '1',
    itemName: 'Shampoo Professional 500ml',
    type: 'sale',
    quantity: -5,
    previousStock: 50,
    newStock: 45,
    cost: 125000,
    reason: 'Venta a cliente',
    referenceId: 'order-123',
    referenceType: 'order',
    performedBy: 'user-1',
    performedByName: 'Vendedor 1',
    createdAt: '2024-01-15T14:30:00Z'
  },
  {
    id: '2',
    itemId: '2',
    itemName: 'Acondicionador Reparador 500ml',
    type: 'sale',
    quantity: -3,
    previousStock: 11,
    newStock: 8,
    cost: 84000,
    reason: 'Venta a cliente',
    referenceId: 'order-124',
    referenceType: 'order',
    performedBy: 'user-1',
    performedByName: 'Vendedor 1',
    createdAt: '2024-01-12T10:15:00Z'
  }
];

const mockAlerts: StockAlert[] = [
  {
    id: '1',
    itemId: '2',
    itemName: 'Acondicionador Reparador 500ml',
    alertType: 'low_stock',
    currentStock: 8,
    threshold: 15,
    severity: 'high',
    isResolved: false,
    createdAt: '2024-01-12T10:15:00Z'
  },
  {
    id: '2',
    itemId: '3',
    itemName: 'Tinte Capilar Negro',
    alertType: 'out_of_stock',
    currentStock: 0,
    threshold: 10,
    severity: 'critical',
    isResolved: false,
    createdAt: '2024-01-08T09:00:00Z'
  }
];

export const useInventory = () => {
  const [items, setItems] = useState<InventoryItem[]>(mockInventoryItems);
  const [suppliers, setSuppliers] = useState<Supplier[]>(mockSuppliers);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(mockPurchaseOrders);
  const [movements, setMovements] = useState<InventoryMovement[]>(mockMovements);
  const [alerts, setAlerts] = useState<StockAlert[]>(mockAlerts);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredItems = useMemo(() => {
    let filtered = items;

    if (searchQuery) {
      filtered = filtered.filter(item =>
        item.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.barcode?.includes(searchQuery)
      );
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(item => item.category === categoryFilter);
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(item => item.status === statusFilter);
    }

    return filtered;
  }, [items, searchQuery, categoryFilter, statusFilter]);

  const inventoryStats: InventoryStats = useMemo(() => {
    const totalValue = items.reduce((sum, item) => sum + (item.currentStock * item.costPrice), 0);
    const lowStockItems = items.filter(i => i.status === 'low_stock').length;
    const outOfStockItems = items.filter(i => i.status === 'out_of_stock').length;
    const reorderNeeded = items.filter(i => i.currentStock <= i.reorderPoint).length;

    return {
      totalItems: items.length,
      totalValue,
      lowStockItems,
      outOfStockItems,
      expiringItems: 0,
      turnoverRate: 0,
      reorderNeeded,
      warehouseUtilization: 0,
      topMovingItems: [],
      slowMovingItems: [],
      monthlyTrends: []
    };
  }, [items]);

  const addInventoryItem = (itemData: Omit<InventoryItem, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newItem: InventoryItem = {
      ...itemData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    setItems(prev => [...prev, newItem]);
    console.log('Inventory item added:', newItem);
  };

  const updateInventoryItem = (id: string, updates: Partial<InventoryItem>) => {
    setItems(prev => prev.map(item => 
      item.id === id 
        ? { ...item, ...updates, updatedAt: new Date().toISOString() }
        : item
    ));
    console.log('Inventory item updated:', id, updates);
  };

  const addSupplier = (supplierData: Omit<Supplier, 'id' | 'createdAt' | 'updatedAt' | 'currentBalance'>) => {
    const newSupplier: Supplier = {
      ...supplierData,
      id: Date.now().toString(),
      currentBalance: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    setSuppliers(prev => [...prev, newSupplier]);
    console.log('Supplier added:', newSupplier);
  };

  const updateSupplier = (id: string, updates: Partial<Supplier>) => {
    setSuppliers(prev => prev.map(s => 
      s.id === id 
        ? { ...s, ...updates, updatedAt: new Date().toISOString() }
        : s
    ));
    console.log('Supplier updated:', id, updates);
  };

  const createPurchaseOrder = (orderData: Omit<PurchaseOrder, 'id' | 'orderNumber' | 'createdAt' | 'updatedAt'>) => {
    const orderNumber = `PO-${new Date().getFullYear()}-${String(purchaseOrders.length + 1).padStart(3, '0')}`;
    const newOrder: PurchaseOrder = {
      ...orderData,
      id: Date.now().toString(),
      orderNumber,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    setPurchaseOrders(prev => [...prev, newOrder]);
    console.log('Purchase order created:', newOrder);
    
    return newOrder;
  };

  const updatePurchaseOrder = (id: string, updates: Partial<PurchaseOrder>) => {
    setPurchaseOrders(prev => prev.map(po => 
      po.id === id 
        ? { ...po, ...updates, updatedAt: new Date().toISOString() }
        : po
    ));
    console.log('Purchase order updated:', id, updates);
  };

  const receivePurchaseOrder = (orderId: string, receivedItems: { itemId: string; quantity: number }[]) => {
    const order = purchaseOrders.find(po => po.id === orderId);
    if (!order) return;

    const updatedItems = order.items.map(item => {
      const received = receivedItems.find(ri => ri.itemId === item.id);
      if (received) {
        return {
          ...item,
          receivedQuantity: item.receivedQuantity + received.quantity
        };
      }
      return item;
    });

    updatePurchaseOrder(orderId, {
      items: updatedItems,
      status: updatedItems.every(i => i.receivedQuantity >= i.quantity) ? 'received' : 'ordered',
      receivedDate: new Date().toISOString()
    });

    receivedItems.forEach(({ itemId, quantity }) => {
      const orderItem = order.items.find(i => i.id === itemId);
      if (orderItem) {
        const inventoryItem = items.find(i => i.productId === orderItem.productId);
        if (inventoryItem) {
          const newStock = inventoryItem.currentStock + quantity;
          updateInventoryItem(inventoryItem.id, {
            currentStock: newStock,
            status: newStock > inventoryItem.minStock ? 'in_stock' : 
                    newStock > 0 ? 'low_stock' : 'out_of_stock',
            lastRestockDate: new Date().toISOString()
          });

          addMovement({
            itemId: inventoryItem.id,
            itemName: inventoryItem.productName,
            type: 'purchase',
            quantity,
            previousStock: inventoryItem.currentStock,
            newStock,
            cost: orderItem.unitPrice * quantity,
            reason: `Recepción de orden ${order.orderNumber}`,
            referenceId: orderId,
            referenceType: 'purchase_order',
            performedBy: order.createdBy,
            performedByName: order.createdByName
          });
        }
      }
    });

    console.log('Purchase order received:', orderId, receivedItems);
  };

  const addMovement = (movementData: Omit<InventoryMovement, 'id' | 'createdAt'>) => {
    const newMovement: InventoryMovement = {
      ...movementData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    
    setMovements(prev => [...prev, newMovement]);
    console.log('Inventory movement added:', newMovement);
  };

  const resolveAlert = (alertId: string) => {
    setAlerts(prev => prev.map(alert =>
      alert.id === alertId
        ? { ...alert, isResolved: true, resolvedAt: new Date().toISOString() }
        : alert
    ));
  };

  const getSupplierPerformance = (supplierId: string): SupplierPerformance | null => {
    const supplier = suppliers.find(s => s.id === supplierId);
    if (!supplier) return null;

    const supplierOrders = purchaseOrders.filter(po => po.supplierId === supplierId);
    const totalSpent = supplierOrders.reduce((sum, po) => sum + po.total, 0);
    const onTimeOrders = supplierOrders.filter(po => 
      po.status === 'received' && 
      po.expectedDelivery && 
      po.receivedDate &&
      new Date(po.receivedDate) <= new Date(po.expectedDelivery)
    ).length;

    return {
      supplierId,
      supplierName: supplier.name,
      totalOrders: supplierOrders.length,
      totalSpent,
      onTimeDeliveryRate: supplierOrders.length > 0 ? (onTimeOrders / supplierOrders.length) * 100 : 0,
      qualityScore: supplier.rating,
      responseTime: 24,
      lastOrderDate: supplierOrders.length > 0 
        ? supplierOrders[supplierOrders.length - 1].createdAt 
        : supplier.createdAt,
      averageOrderValue: supplierOrders.length > 0 ? totalSpent / supplierOrders.length : 0
    };
  };

  return {
    items: filteredItems,
    allItems: items,
    suppliers,
    purchaseOrders,
    movements,
    alerts: alerts.filter(a => !a.isResolved),
    inventoryStats,
    searchQuery,
    setSearchQuery,
    categoryFilter,
    setCategoryFilter,
    statusFilter,
    setStatusFilter,
    addInventoryItem,
    updateInventoryItem,
    addSupplier,
    updateSupplier,
    createPurchaseOrder,
    updatePurchaseOrder,
    receivePurchaseOrder,
    addMovement,
    resolveAlert,
    getSupplierPerformance
  };
};
