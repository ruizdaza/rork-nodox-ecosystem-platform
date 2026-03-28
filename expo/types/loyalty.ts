export interface LoyaltyProgram {
  id: string;
  name: string;
  description: string;
  pointsRequired: number;
  rewardType: 'discount' | 'cashback' | 'product' | 'service';
  rewardValue: number;
  isActive: boolean;
  validUntil?: Date;
  maxRedemptions?: number;
  currentRedemptions: number;
  category?: string;
  imageUrl?: string;
}

export interface UserLoyalty {
  userId: string;
  totalPoints: number;
  currentTier: LoyaltyTier;
  pointsToNextTier: number;
  lifetimePoints: number;
  redeemedRewards: LoyaltyRedemption[];
  joinDate: Date;
  lastActivity: Date;
}

export interface LoyaltyTier {
  id: string;
  name: string;
  minPoints: number;
  benefits: string[];
  multiplier: number;
  color: string;
  icon: string;
}

export interface LoyaltyRedemption {
  id: string;
  userId: string;
  programId: string;
  pointsUsed: number;
  rewardReceived: string;
  redeemedAt: Date;
  status: 'pending' | 'completed' | 'expired';
}

export interface PointsTransaction {
  id: string;
  userId: string;
  type: 'earned' | 'redeemed' | 'expired' | 'bonus';
  points: number;
  description: string;
  relatedTransactionId?: string;
  createdAt: Date;
  expiresAt?: Date;
}

export interface LoyaltyChallenge {
  id: string;
  title: string;
  description: string;
  pointsReward: number;
  requirements: {
    type: 'transactions' | 'spending' | 'referrals' | 'reviews';
    target: number;
    timeframe?: number; // days
  };
  isActive: boolean;
  validUntil: Date;
  completedBy: string[];
}