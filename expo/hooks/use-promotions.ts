import { useState, useMemo } from 'react';
import { Promotion, PromotionUsage } from '@/types/crm';

const mockPromotions: Promotion[] = [
  {
    id: '1',
    title: 'Descuento Clientes Nuevos',
    description: '20% de descuento en tu primera visita',
    type: 'discount',
    value: 20,
    minPurchase: 50000,
    validFrom: '2024-01-01T00:00:00Z',
    validUntil: '2024-12-31T23:59:59Z',
    isActive: true,
    targetSegments: ['2'], // Clientes Nuevos
    usageLimit: 100,
    usedCount: 23,
    code: 'NUEVO20',
    applicableServices: ['1', '2'],
    createdBy: 'admin-1',
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '2',
    title: 'Combo Belleza VIP',
    description: 'Lleva 2 servicios y paga 1 - Solo para clientes VIP',
    type: 'bogo',
    value: 50,
    validFrom: '2024-01-15T00:00:00Z',
    validUntil: '2024-02-15T23:59:59Z',
    isActive: true,
    targetSegments: ['1'], // Clientes VIP
    usageLimit: 50,
    usedCount: 8,
    code: 'VIP2X1',
    applicableServices: ['1', '2', '3'],
    createdBy: 'admin-1',
    createdAt: '2024-01-15T00:00:00Z'
  },
  {
    id: '3',
    title: 'Puntos Dobles Fin de Semana',
    description: 'Gana el doble de puntos de lealtad los fines de semana',
    type: 'loyalty_points',
    value: 100, // 100% extra points
    validFrom: '2024-01-01T00:00:00Z',
    validUntil: '2024-12-31T23:59:59Z',
    isActive: true,
    targetSegments: [],
    usedCount: 45,
    applicableServices: [],
    createdBy: 'admin-1',
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '4',
    title: 'Servicio Gratis Cumpleaños',
    description: 'Servicio básico gratis en tu mes de cumpleaños',
    type: 'free_service',
    value: 100,
    validFrom: '2024-01-01T00:00:00Z',
    validUntil: '2024-12-31T23:59:59Z',
    isActive: true,
    targetSegments: [],
    usedCount: 12,
    code: 'CUMPLE',
    applicableServices: ['1'],
    createdBy: 'admin-1',
    createdAt: '2024-01-01T00:00:00Z'
  }
];

const mockPromotionUsage: PromotionUsage[] = [
  {
    id: '1',
    promotionId: '1',
    customerId: '3',
    usedAt: '2024-01-20T14:30:00Z',
    orderValue: 75000,
    discountApplied: 15000
  },
  {
    id: '2',
    promotionId: '2',
    customerId: '1',
    usedAt: '2024-01-18T10:00:00Z',
    orderValue: 50000,
    discountApplied: 25000
  }
];

export const usePromotions = () => {
  const [promotions, setPromotions] = useState<Promotion[]>(mockPromotions);
  const [promotionUsage, setPromotionUsage] = useState<PromotionUsage[]>(mockPromotionUsage);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive' | 'expired'>('all');
  const [filterType, setFilterType] = useState<'all' | Promotion['type']>('all');

  const filteredPromotions = useMemo(() => {
    let filtered = promotions;

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(promo => 
        promo.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        promo.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (promo.code && promo.code.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Apply status filter
    if (filterStatus !== 'all') {
      const now = new Date();
      filtered = filtered.filter(promo => {
        const isExpired = new Date(promo.validUntil) < now;
        const isActive = promo.isActive && !isExpired;
        
        switch (filterStatus) {
          case 'active':
            return isActive;
          case 'inactive':
            return !promo.isActive && !isExpired;
          case 'expired':
            return isExpired;
          default:
            return true;
        }
      });
    }

    // Apply type filter
    if (filterType !== 'all') {
      filtered = filtered.filter(promo => promo.type === filterType);
    }

    return filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [promotions, searchQuery, filterStatus, filterType]);

  const promotionStats = useMemo(() => {
    const now = new Date();
    const activePromotions = promotions.filter(p => p.isActive && new Date(p.validUntil) >= now);
    const totalUsage = promotions.reduce((sum, p) => sum + p.usedCount, 0);
    const totalSavings = promotionUsage.reduce((sum, u) => sum + u.discountApplied, 0);
    
    const usageByType = promotions.reduce((acc, promo) => {
      acc[promo.type] = (acc[promo.type] || 0) + promo.usedCount;
      return acc;
    }, {} as Record<Promotion['type'], number>);

    return {
      totalPromotions: promotions.length,
      activePromotions: activePromotions.length,
      totalUsage,
      totalSavings,
      usageByType,
      topPromotions: [...promotions]
        .sort((a, b) => b.usedCount - a.usedCount)
        .slice(0, 5)
    };
  }, [promotions, promotionUsage]);

  const createPromotion = (promotionData: Omit<Promotion, 'id' | 'createdAt' | 'usedCount'>) => {
    const newPromotion: Promotion = {
      ...promotionData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      usedCount: 0
    };
    
    setPromotions(prev => [...prev, newPromotion]);
    console.log('Promotion created:', newPromotion);
    return newPromotion;
  };

  const updatePromotion = (id: string, updates: Partial<Promotion>) => {
    setPromotions(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
    console.log('Promotion updated:', id, updates);
  };

  const deletePromotion = (id: string) => {
    setPromotions(prev => prev.filter(p => p.id !== id));
    console.log('Promotion deleted:', id);
  };

  const togglePromotionStatus = (id: string) => {
    setPromotions(prev => prev.map(p => 
      p.id === id ? { ...p, isActive: !p.isActive } : p
    ));
  };

  const applyPromotion = (promotionId: string, customerId: string, orderValue: number): number => {
    const promotion = promotions.find(p => p.id === promotionId);
    if (!promotion || !promotion.isActive) return 0;

    const now = new Date();
    if (new Date(promotion.validUntil) < now) return 0;
    if (promotion.minPurchase && orderValue < promotion.minPurchase) return 0;
    if (promotion.usageLimit && promotion.usedCount >= promotion.usageLimit) return 0;

    let discountAmount = 0;

    switch (promotion.type) {
      case 'discount':
        discountAmount = Math.floor(orderValue * (promotion.value / 100));
        break;
      case 'bogo':
        discountAmount = Math.floor(orderValue * (promotion.value / 100));
        break;
      case 'free_service':
        // This would need service price information
        discountAmount = Math.min(orderValue, 25000); // Assuming basic service price
        break;
      case 'loyalty_points':
        // This doesn't apply discount, just extra points
        discountAmount = 0;
        break;
    }

    // Record usage
    const usage: PromotionUsage = {
      id: Date.now().toString(),
      promotionId,
      customerId,
      usedAt: new Date().toISOString(),
      orderValue,
      discountApplied: discountAmount
    };

    setPromotionUsage(prev => [...prev, usage]);
    setPromotions(prev => prev.map(p => 
      p.id === promotionId ? { ...p, usedCount: p.usedCount + 1 } : p
    ));

    console.log('Promotion applied:', usage);
    return discountAmount;
  };

  const getPromotionUsage = (promotionId: string) => {
    return promotionUsage.filter(u => u.promotionId === promotionId);
  };

  const validatePromotionCode = (code: string): Promotion | null => {
    const promotion = promotions.find(p => 
      p.code?.toLowerCase() === code.toLowerCase() && 
      p.isActive &&
      new Date(p.validUntil) >= new Date()
    );
    
    return promotion || null;
  };

  return {
    promotions: filteredPromotions,
    allPromotions: promotions,
    promotionUsage,
    promotionStats,
    searchQuery,
    setSearchQuery,
    filterStatus,
    setFilterStatus,
    filterType,
    setFilterType,
    createPromotion,
    updatePromotion,
    deletePromotion,
    togglePromotionStatus,
    applyPromotion,
    getPromotionUsage,
    validatePromotionCode
  };
};