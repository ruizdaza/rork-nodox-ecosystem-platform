import { useState, useEffect } from 'react';
import { LoyaltyProgram, UserLoyalty, LoyaltyTier, PointsTransaction, LoyaltyChallenge, LoyaltyRedemption } from '@/types/loyalty';

const LOYALTY_TIERS: LoyaltyTier[] = [
  {
    id: 'bronze',
    name: 'Bronce',
    minPoints: 0,
    benefits: ['Puntos básicos por compras', 'Ofertas exclusivas'],
    multiplier: 1,
    color: '#CD7F32',
    icon: '🥉'
  },
  {
    id: 'silver',
    name: 'Plata',
    minPoints: 1000,
    benefits: ['1.5x puntos por compras', 'Descuentos adicionales', 'Soporte prioritario'],
    multiplier: 1.5,
    color: '#C0C0C0',
    icon: '🥈'
  },
  {
    id: 'gold',
    name: 'Oro',
    minPoints: 5000,
    benefits: ['2x puntos por compras', 'Envío gratuito', 'Acceso anticipado a ofertas'],
    multiplier: 2,
    color: '#FFD700',
    icon: '🥇'
  },
  {
    id: 'platinum',
    name: 'Platino',
    minPoints: 15000,
    benefits: ['3x puntos por compras', 'Concierge personal', 'Eventos exclusivos'],
    multiplier: 3,
    color: '#E5E4E2',
    icon: '💎'
  }
];

const MOCK_LOYALTY_PROGRAMS: LoyaltyProgram[] = [
  {
    id: '1',
    name: '10% Descuento en Servicios',
    description: 'Obtén 10% de descuento en cualquier servicio',
    pointsRequired: 500,
    rewardType: 'discount',
    rewardValue: 10,
    isActive: true,
    maxRedemptions: 100,
    currentRedemptions: 23,
    category: 'servicios'
  },
  {
    id: '2',
    name: 'Cashback $50',
    description: 'Recibe $50 de cashback en tu billetera',
    pointsRequired: 1000,
    rewardType: 'cashback',
    rewardValue: 50,
    isActive: true,
    maxRedemptions: 50,
    currentRedemptions: 12,
    category: 'dinero'
  },
  {
    id: '3',
    name: 'Producto Gratis',
    description: 'Elige cualquier producto hasta $25',
    pointsRequired: 750,
    rewardType: 'product',
    rewardValue: 25,
    isActive: true,
    maxRedemptions: 30,
    currentRedemptions: 8,
    category: 'productos'
  }
];

const MOCK_CHALLENGES: LoyaltyChallenge[] = [
  {
    id: '1',
    title: 'Comprador Frecuente',
    description: 'Realiza 5 compras este mes',
    pointsReward: 200,
    requirements: {
      type: 'transactions',
      target: 5,
      timeframe: 30
    },
    isActive: true,
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    completedBy: []
  },
  {
    id: '2',
    title: 'Gran Gastador',
    description: 'Gasta $500 en total',
    pointsReward: 500,
    requirements: {
      type: 'spending',
      target: 500
    },
    isActive: true,
    validUntil: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
    completedBy: []
  },
  {
    id: '3',
    title: 'Embajador',
    description: 'Refiere 3 nuevos usuarios',
    pointsReward: 300,
    requirements: {
      type: 'referrals',
      target: 3
    },
    isActive: true,
    validUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    completedBy: []
  }
];

export function useLoyalty() {
  const [userLoyalty, setUserLoyalty] = useState<UserLoyalty | null>(null);
  const [loyaltyPrograms, setLoyaltyPrograms] = useState<LoyaltyProgram[]>(MOCK_LOYALTY_PROGRAMS);
  const [pointsHistory, setPointsHistory] = useState<PointsTransaction[]>([]);
  const [challenges, setChallenges] = useState<LoyaltyChallenge[]>(MOCK_CHALLENGES);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUserLoyalty();
    loadPointsHistory();
  }, []);

  const loadUserLoyalty = async () => {
    try {
      setIsLoading(true);
      // Simular carga de datos del usuario
      const mockUserLoyalty: UserLoyalty = {
        userId: 'user1',
        totalPoints: 2500,
        currentTier: LOYALTY_TIERS[1], // Silver
        pointsToNextTier: 2500,
        lifetimePoints: 3200,
        redeemedRewards: [],
        joinDate: new Date('2024-01-15'),
        lastActivity: new Date()
      };
      setUserLoyalty(mockUserLoyalty);
    } catch (error) {
      console.error('Error loading user loyalty:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadPointsHistory = async () => {
    try {
      const mockHistory: PointsTransaction[] = [
        {
          id: '1',
          userId: 'user1',
          type: 'earned',
          points: 100,
          description: 'Compra en marketplace',
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
        },
        {
          id: '2',
          userId: 'user1',
          type: 'earned',
          points: 50,
          description: 'Reseña de producto',
          createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
        },
        {
          id: '3',
          userId: 'user1',
          type: 'redeemed',
          points: -500,
          description: 'Descuento 10% en servicios',
          createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        }
      ];
      setPointsHistory(mockHistory);
    } catch (error) {
      console.error('Error loading points history:', error);
    }
  };

  const earnPoints = async (points: number, description: string, relatedTransactionId?: string) => {
    try {
      const newTransaction: PointsTransaction = {
        id: Date.now().toString(),
        userId: 'user1',
        type: 'earned',
        points,
        description,
        relatedTransactionId,
        createdAt: new Date()
      };

      setPointsHistory(prev => [newTransaction, ...prev]);
      
      if (userLoyalty) {
        const newTotalPoints = userLoyalty.totalPoints + points;
        const newTier = calculateTier(newTotalPoints);
        
        setUserLoyalty({
          ...userLoyalty,
          totalPoints: newTotalPoints,
          lifetimePoints: userLoyalty.lifetimePoints + points,
          currentTier: newTier,
          pointsToNextTier: calculatePointsToNextTier(newTotalPoints, newTier),
          lastActivity: new Date()
        });
      }

      return true;
    } catch (error) {
      console.error('Error earning points:', error);
      return false;
    }
  };

  const redeemReward = async (programId: string) => {
    try {
      const program = loyaltyPrograms.find(p => p.id === programId);
      if (!program || !userLoyalty) return false;

      if (userLoyalty.totalPoints < program.pointsRequired) {
        throw new Error('Puntos insuficientes');
      }

      const redemption: LoyaltyRedemption = {
        id: Date.now().toString(),
        userId: userLoyalty.userId,
        programId,
        pointsUsed: program.pointsRequired,
        rewardReceived: program.name,
        redeemedAt: new Date(),
        status: 'completed'
      };

      const newTransaction: PointsTransaction = {
        id: Date.now().toString(),
        userId: userLoyalty.userId,
        type: 'redeemed',
        points: -program.pointsRequired,
        description: `Canjeado: ${program.name}`,
        createdAt: new Date()
      };

      setPointsHistory(prev => [newTransaction, ...prev]);
      setUserLoyalty({
        ...userLoyalty,
        totalPoints: userLoyalty.totalPoints - program.pointsRequired,
        redeemedRewards: [...userLoyalty.redeemedRewards, redemption],
        lastActivity: new Date()
      });

      // Actualizar contador de canjes del programa
      setLoyaltyPrograms(prev => 
        prev.map(p => 
          p.id === programId 
            ? { ...p, currentRedemptions: p.currentRedemptions + 1 }
            : p
        )
      );

      return true;
    } catch (error) {
      console.error('Error redeeming reward:', error);
      return false;
    }
  };

  const calculateTier = (points: number): LoyaltyTier => {
    return LOYALTY_TIERS.reduce((currentTier, tier) => {
      return points >= tier.minPoints ? tier : currentTier;
    }, LOYALTY_TIERS[0]);
  };

  const calculatePointsToNextTier = (currentPoints: number, currentTier: LoyaltyTier): number => {
    const nextTierIndex = LOYALTY_TIERS.findIndex(t => t.id === currentTier.id) + 1;
    if (nextTierIndex >= LOYALTY_TIERS.length) return 0;
    
    const nextTier = LOYALTY_TIERS[nextTierIndex];
    return nextTier.minPoints - currentPoints;
  };

  const checkChallengeProgress = async (challengeId: string, userId: string) => {
    // Simular verificación de progreso del desafío
    const challenge = challenges.find(c => c.id === challengeId);
    if (!challenge) return null;

    // Aquí iría la lógica real para verificar el progreso
    const mockProgress = Math.floor(Math.random() * challenge.requirements.target);
    
    return {
      challengeId,
      progress: mockProgress,
      target: challenge.requirements.target,
      isCompleted: mockProgress >= challenge.requirements.target,
      pointsReward: challenge.pointsReward
    };
  };

  return {
    userLoyalty,
    loyaltyPrograms,
    pointsHistory,
    challenges,
    loyaltyTiers: LOYALTY_TIERS,
    isLoading,
    earnPoints,
    redeemReward,
    checkChallengeProgress,
    refreshData: loadUserLoyalty
  };
}