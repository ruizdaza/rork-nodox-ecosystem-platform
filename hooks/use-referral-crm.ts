import { useState, useMemo, useCallback } from 'react';
import {
  ReferralLead,
  ReferralInteraction,
  ReferralCampaign,
  MarketingMaterial,
  ReferralCommission,
  ReferralSegment,
  ReferralStats,
  ReferralFunnel,
  ReferralGoal,
  ReferralTier,
  ReferralAnalytics,
  ReferralNotification,
  ReferralTask,
  ReferralTemplate,
  ReferralLeaderboard,
} from '@/types/referral';

const mockLeads: ReferralLead[] = [
  {
    id: '1',
    referrerId: 'user-1',
    name: 'María González',
    email: 'maria@email.com',
    phone: '+57 300 123 4567',
    status: 'converted',
    source: 'whatsapp',
    joinDate: '2024-01-15T10:00:00Z',
    conversionDate: '2024-01-20T14:30:00Z',
    lastContactDate: '2024-01-22T09:00:00Z',
    tags: ['VIP', 'Interesado en servicios premium'],
    notes: 'Cliente muy interesada en el programa de aliados',
    interactionCount: 8,
    totalSpent: 450000,
    totalOrders: 12,
    lifetimeValue: 450000,
    commissionEarned: 45000,
    level: 2,
    isAlly: true,
    allyType: 'business',
    customFields: {
      businessName: 'Salón María',
      businessType: 'Belleza',
    },
  },
  {
    id: '2',
    referrerId: 'user-1',
    name: 'Carlos Ruiz',
    email: 'carlos@email.com',
    phone: '+57 301 234 5678',
    status: 'qualified',
    source: 'direct_link',
    joinDate: '2024-01-18T15:00:00Z',
    lastContactDate: '2024-01-21T11:00:00Z',
    nextFollowUpDate: '2024-01-25T10:00:00Z',
    tags: ['Potencial alto', 'Interesado en marketplace'],
    notes: 'Tiene un negocio de restaurante, quiere vender en marketplace',
    interactionCount: 5,
    totalSpent: 0,
    totalOrders: 0,
    lifetimeValue: 0,
    commissionEarned: 500,
    level: 1,
    isAlly: false,
    customFields: {},
  },
  {
    id: '3',
    referrerId: 'user-1',
    name: 'Ana López',
    email: 'ana@email.com',
    phone: '+57 302 345 6789',
    status: 'contacted',
    source: 'social_media',
    joinDate: '2024-01-20T12:00:00Z',
    lastContactDate: '2024-01-20T16:00:00Z',
    nextFollowUpDate: '2024-01-23T14:00:00Z',
    tags: ['Nuevo', 'Instagram'],
    notes: 'Contactada por Instagram, mostró interés inicial',
    interactionCount: 2,
    totalSpent: 0,
    totalOrders: 0,
    lifetimeValue: 0,
    commissionEarned: 0,
    level: 1,
    isAlly: false,
    customFields: {},
  },
  {
    id: '4',
    referrerId: 'user-1',
    name: 'Pedro Martínez',
    email: 'pedro@email.com',
    phone: '+57 303 456 7890',
    status: 'lead',
    source: 'qr_code',
    joinDate: '2024-01-22T09:00:00Z',
    tags: ['Evento', 'QR'],
    notes: 'Escaneó QR en evento de networking',
    interactionCount: 0,
    totalSpent: 0,
    totalOrders: 0,
    lifetimeValue: 0,
    commissionEarned: 0,
    level: 1,
    isAlly: false,
    customFields: {},
  },
];

const mockInteractions: ReferralInteraction[] = [
  {
    id: '1',
    leadId: '1',
    referrerId: 'user-1',
    type: 'call',
    date: '2024-01-22T09:00:00Z',
    description: 'Llamada de seguimiento post-conversión',
    outcome: 'positive',
    nextAction: 'Enviar información sobre programa de aliados premium',
    nextActionDate: '2024-01-25T10:00:00Z',
    duration: 15,
    createdBy: 'user-1',
  },
  {
    id: '2',
    leadId: '2',
    referrerId: 'user-1',
    type: 'meeting',
    date: '2024-01-21T11:00:00Z',
    description: 'Reunión para demostración de plataforma',
    outcome: 'positive',
    nextAction: 'Seguimiento para cierre',
    nextActionDate: '2024-01-25T10:00:00Z',
    duration: 45,
    createdBy: 'user-1',
  },
];

const mockCampaigns: ReferralCampaign[] = [
  {
    id: '1',
    referrerId: 'user-1',
    name: 'Campaña Enero 2024',
    description: 'Promoción de inicio de año para nuevos aliados',
    type: 'multi_channel',
    status: 'active',
    startDate: '2024-01-01T00:00:00Z',
    endDate: '2024-01-31T23:59:59Z',
    targetAudience: ['Negocios locales', 'Emprendedores'],
    message: '¡Únete a NodoX y obtén 500 NCOP gratis! Código: ENERO2024',
    ctaText: 'Únete ahora',
    ctaUrl: 'https://nodox.app/join?ref=ENERO2024',
    metrics: {
      sent: 150,
      delivered: 145,
      opened: 98,
      clicked: 45,
      converted: 12,
      revenue: 1200000,
    },
    budget: 50000,
    spent: 32000,
    createdAt: '2023-12-28T10:00:00Z',
    updatedAt: '2024-01-22T15:00:00Z',
  },
];

const mockMaterials: MarketingMaterial[] = [
  {
    id: '1',
    type: 'banner',
    title: 'Banner Principal NodoX',
    description: 'Banner para redes sociales 1080x1080',
    imageUrl: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1080&h=1080&fit=crop',
    dimensions: { width: 1080, height: 1080 },
    format: 'jpg',
    category: 'Social Media',
    tags: ['Instagram', 'Facebook', 'Cuadrado'],
    usageCount: 45,
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    type: 'story',
    title: 'Historia Instagram',
    description: 'Plantilla para historias de Instagram',
    imageUrl: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=1080&h=1920&fit=crop',
    dimensions: { width: 1080, height: 1920 },
    format: 'jpg',
    category: 'Social Media',
    tags: ['Instagram', 'Stories', 'Vertical'],
    usageCount: 78,
    createdAt: '2024-01-01T00:00:00Z',
  },
];

const mockCommissions: ReferralCommission[] = [
  {
    id: '1',
    referrerId: 'user-1',
    leadId: '1',
    type: 'purchase_commission',
    amount: 45000,
    currency: 'NCOP',
    status: 'paid',
    orderId: 'order-123',
    orderValue: 450000,
    commissionRate: 10,
    description: 'Comisión por compras de María González',
    earnedDate: '2024-01-20T14:30:00Z',
    paidDate: '2024-01-21T10:00:00Z',
    paymentMethod: 'wallet',
    transactionId: 'tx-456',
  },
  {
    id: '2',
    referrerId: 'user-1',
    leadId: '2',
    type: 'signup_bonus',
    amount: 500,
    currency: 'NCOP',
    status: 'approved',
    description: 'Bono por registro de Carlos Ruiz',
    earnedDate: '2024-01-18T15:00:00Z',
  },
];

const mockTiers: ReferralTier[] = [
  {
    id: '1',
    name: 'Bronce',
    minLeads: 0,
    minRevenue: 0,
    benefits: {
      commissionRate: 5,
      bonusMultiplier: 1,
      prioritySupport: false,
      customMaterials: false,
      dedicatedManager: false,
      exclusiveEvents: false,
    },
    badge: { icon: 'medal', color: '#cd7f32' },
  },
  {
    id: '2',
    name: 'Plata',
    minLeads: 10,
    minRevenue: 1000000,
    benefits: {
      commissionRate: 7,
      bonusMultiplier: 1.2,
      prioritySupport: true,
      customMaterials: false,
      dedicatedManager: false,
      exclusiveEvents: false,
    },
    badge: { icon: 'medal', color: '#c0c0c0' },
  },
  {
    id: '3',
    name: 'Oro',
    minLeads: 25,
    minRevenue: 5000000,
    benefits: {
      commissionRate: 10,
      bonusMultiplier: 1.5,
      prioritySupport: true,
      customMaterials: true,
      dedicatedManager: false,
      exclusiveEvents: true,
    },
    badge: { icon: 'medal', color: '#ffd700' },
  },
  {
    id: '4',
    name: 'Platino',
    minLeads: 50,
    minRevenue: 15000000,
    benefits: {
      commissionRate: 15,
      bonusMultiplier: 2,
      prioritySupport: true,
      customMaterials: true,
      dedicatedManager: true,
      exclusiveEvents: true,
    },
    badge: { icon: 'crown', color: '#e5e4e2' },
  },
];

export const useReferralCRM = () => {
  const [leads, setLeads] = useState<ReferralLead[]>(mockLeads);
  const [interactions, setInteractions] = useState<ReferralInteraction[]>(mockInteractions);
  const [campaigns, setCampaigns] = useState<ReferralCampaign[]>(mockCampaigns);
  const [materials, setMaterials] = useState<MarketingMaterial[]>(mockMaterials);
  const [commissions, setCommissions] = useState<ReferralCommission[]>(mockCommissions);
  const [tiers] = useState<ReferralTier[]>(mockTiers);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<ReferralLead['status'] | 'all'>('all');
  const [sourceFilter, setSourceFilter] = useState<ReferralLead['source'] | 'all'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'value' | 'status'>('date');
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'quarter' | 'year'>('month');

  const filteredLeads = useMemo(() => {
    let filtered = leads;

    if (searchQuery) {
      filtered = filtered.filter(lead =>
        lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.phone.includes(searchQuery) ||
        lead.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(lead => lead.status === statusFilter);
    }

    if (sourceFilter !== 'all') {
      filtered = filtered.filter(lead => lead.source === sourceFilter);
    }

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'date':
          return new Date(b.joinDate).getTime() - new Date(a.joinDate).getTime();
        case 'value':
          return b.lifetimeValue - a.lifetimeValue;
        case 'status':
          return a.status.localeCompare(b.status);
        default:
          return 0;
      }
    });

    return filtered;
  }, [leads, searchQuery, statusFilter, sourceFilter, sortBy]);

  const stats: ReferralStats = useMemo(() => {
    const now = new Date();
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const totalLeads = leads.length;
    const activeLeads = leads.filter(l => l.status !== 'lost').length;
    const convertedLeads = leads.filter(l => l.status === 'converted').length;
    const lostLeads = leads.filter(l => l.status === 'lost').length;
    const conversionRate = totalLeads > 0 ? (convertedLeads / totalLeads) * 100 : 0;

    const convertedWithTime = leads.filter(l => l.conversionDate && l.joinDate);
    const averageConversionTime = convertedWithTime.length > 0
      ? convertedWithTime.reduce((sum, l) => {
          const time = new Date(l.conversionDate!).getTime() - new Date(l.joinDate).getTime();
          return sum + time / (1000 * 60 * 60 * 24);
        }, 0) / convertedWithTime.length
      : 0;

    const totalCommissionsEarned = commissions.reduce((sum, c) => sum + c.amount, 0);
    const pendingCommissions = commissions.filter(c => c.status === 'pending').reduce((sum, c) => sum + c.amount, 0);
    const paidCommissions = commissions.filter(c => c.status === 'paid').reduce((sum, c) => sum + c.amount, 0);

    const totalLifetimeValue = leads.reduce((sum, l) => sum + l.lifetimeValue, 0);
    const averageLifetimeValue = totalLeads > 0 ? totalLifetimeValue / totalLeads : 0;

    const sourceCount: Record<string, number> = {};
    leads.forEach(l => {
      sourceCount[l.source] = (sourceCount[l.source] || 0) + 1;
    });
    const topPerformingSource = Object.entries(sourceCount).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';

    const leadsThisMonth = leads.filter(l => new Date(l.joinDate) >= monthAgo).length;
    const leadsLastMonth = leads.filter(l => {
      const date = new Date(l.joinDate);
      return date < monthAgo && date >= new Date(monthAgo.getTime() - 30 * 24 * 60 * 60 * 1000);
    }).length;
    const monthlyGrowth = leadsLastMonth > 0 ? ((leadsThisMonth - leadsLastMonth) / leadsLastMonth) * 100 : 0;

    const conversionsThisMonth = leads.filter(l => l.conversionDate && new Date(l.conversionDate) >= monthAgo).length;
    const revenueThisMonth = leads
      .filter(l => l.conversionDate && new Date(l.conversionDate) >= monthAgo)
      .reduce((sum, l) => sum + l.lifetimeValue, 0);

    const leadsThisWeek = leads.filter(l => new Date(l.joinDate) >= weekAgo).length;
    const leadsToday = leads.filter(l => new Date(l.joinDate) >= today).length;

    const activeCampaigns = campaigns.filter(c => c.status === 'active').length;
    const campaignROI = campaigns.reduce((sum, c) => {
      const roi = c.metrics.revenue > 0 && c.spent ? ((c.metrics.revenue - c.spent) / c.spent) * 100 : 0;
      return sum + roi;
    }, 0) / (campaigns.length || 1);

    return {
      totalLeads,
      activeLeads,
      convertedLeads,
      lostLeads,
      conversionRate,
      averageConversionTime,
      totalCommissionsEarned,
      pendingCommissions,
      paidCommissions,
      totalLifetimeValue,
      averageLifetimeValue,
      topPerformingSource,
      monthlyGrowth,
      leadsThisMonth,
      conversionsThisMonth,
      revenueThisMonth,
      leadsThisWeek,
      leadsToday,
      activeCampaigns,
      campaignROI,
    };
  }, [leads, commissions, campaigns]);

  const funnel: ReferralFunnel[] = useMemo(() => {
    const stages: ReferralFunnel['stage'][] = ['lead', 'contacted', 'qualified', 'converted'];
    const totalLeads = leads.length;

    return stages.map((stage, index) => {
      const count = leads.filter(l => l.status === stage).length;
      const percentage = totalLeads > 0 ? (count / totalLeads) * 100 : 0;
      
      const stageLeads = leads.filter(l => l.status === stage);
      const averageTimeInStage = stageLeads.length > 0
        ? stageLeads.reduce((sum, l) => {
            const joinTime = new Date(l.joinDate).getTime();
            const now = Date.now();
            return sum + (now - joinTime) / (1000 * 60 * 60 * 24);
          }, 0) / stageLeads.length
        : 0;

      const previousStageCount = index > 0 ? leads.filter(l => l.status === stages[index - 1]).length : totalLeads;
      const dropoffRate = previousStageCount > 0 ? ((previousStageCount - count) / previousStageCount) * 100 : 0;

      return {
        stage,
        count,
        percentage,
        averageTimeInStage,
        dropoffRate,
      };
    });
  }, [leads]);

  const currentTier = useMemo(() => {
    const sortedTiers = [...tiers].sort((a, b) => b.minLeads - a.minLeads);
    return sortedTiers.find(tier => 
      stats.totalLeads >= tier.minLeads && stats.totalLifetimeValue >= tier.minRevenue
    ) || tiers[0];
  }, [stats, tiers]);

  const nextTier = useMemo(() => {
    const sortedTiers = [...tiers].sort((a, b) => a.minLeads - b.minLeads);
    const currentIndex = sortedTiers.findIndex(t => t.id === currentTier.id);
    return sortedTiers[currentIndex + 1];
  }, [currentTier, tiers]);

  const addLead = useCallback((leadData: Omit<ReferralLead, 'id' | 'joinDate' | 'interactionCount' | 'totalSpent' | 'totalOrders' | 'lifetimeValue' | 'commissionEarned' | 'level'>) => {
    const newLead: ReferralLead = {
      ...leadData,
      id: Date.now().toString(),
      joinDate: new Date().toISOString(),
      interactionCount: 0,
      totalSpent: 0,
      totalOrders: 0,
      lifetimeValue: 0,
      commissionEarned: 0,
      level: 1,
    };
    setLeads(prev => [newLead, ...prev]);
    console.log('Lead added:', newLead);
    return newLead;
  }, []);

  const updateLead = useCallback((id: string, updates: Partial<ReferralLead>) => {
    setLeads(prev => prev.map(l => l.id === id ? { ...l, ...updates } : l));
    console.log('Lead updated:', id, updates);
  }, []);

  const addInteraction = useCallback((interactionData: Omit<ReferralInteraction, 'id' | 'date'>) => {
    const newInteraction: ReferralInteraction = {
      ...interactionData,
      id: Date.now().toString(),
      date: new Date().toISOString(),
    };
    setInteractions(prev => [newInteraction, ...prev]);
    
    setLeads(prev => prev.map(l => 
      l.id === interactionData.leadId 
        ? { ...l, interactionCount: l.interactionCount + 1, lastContactDate: newInteraction.date }
        : l
    ));
    
    console.log('Interaction added:', newInteraction);
    return newInteraction;
  }, []);

  const getLeadInteractions = useCallback((leadId: string) => {
    return interactions.filter(i => i.leadId === leadId).sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [interactions]);

  const createCampaign = useCallback((campaignData: Omit<ReferralCampaign, 'id' | 'metrics' | 'createdAt' | 'updatedAt'>) => {
    const newCampaign: ReferralCampaign = {
      ...campaignData,
      id: Date.now().toString(),
      metrics: { sent: 0, delivered: 0, opened: 0, clicked: 0, converted: 0, revenue: 0 },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setCampaigns(prev => [newCampaign, ...prev]);
    console.log('Campaign created:', newCampaign);
    return newCampaign;
  }, []);

  const updateCampaign = useCallback((id: string, updates: Partial<ReferralCampaign>) => {
    setCampaigns(prev => prev.map(c => 
      c.id === id ? { ...c, ...updates, updatedAt: new Date().toISOString() } : c
    ));
    console.log('Campaign updated:', id, updates);
  }, []);

  const getLeadCommissions = useCallback((leadId: string) => {
    return commissions.filter(c => c.leadId === leadId);
  }, [commissions]);

  const analytics: ReferralAnalytics = useMemo(() => {
    const now = new Date();
    const periodDays = selectedPeriod === 'week' ? 7 : selectedPeriod === 'month' ? 30 : selectedPeriod === 'quarter' ? 90 : 365;
    const startDate = new Date(now.getTime() - periodDays * 24 * 60 * 60 * 1000);
    const previousStartDate = new Date(startDate.getTime() - periodDays * 24 * 60 * 60 * 1000);

    const currentLeads = leads.filter(l => new Date(l.joinDate) >= startDate);
    const previousLeads = leads.filter(l => {
      const date = new Date(l.joinDate);
      return date >= previousStartDate && date < startDate;
    });

    const currentConversions = leads.filter(l => l.conversionDate && new Date(l.conversionDate) >= startDate);
    const previousConversions = leads.filter(l => {
      if (!l.conversionDate) return false;
      const date = new Date(l.conversionDate);
      return date >= previousStartDate && date < startDate;
    });

    const currentRevenue = currentConversions.reduce((sum, l) => sum + l.lifetimeValue, 0);
    const previousRevenue = previousConversions.reduce((sum, l) => sum + l.lifetimeValue, 0);

    const currentCommissions = commissions.filter(c => new Date(c.earnedDate) >= startDate).reduce((sum, c) => sum + c.amount, 0);
    const previousCommissions = commissions.filter(c => {
      const date = new Date(c.earnedDate);
      return date >= previousStartDate && date < startDate;
    }).reduce((sum, c) => sum + c.amount, 0);

    const currentConversionTime = currentConversions.length > 0
      ? currentConversions.reduce((sum, l) => {
          const time = new Date(l.conversionDate!).getTime() - new Date(l.joinDate).getTime();
          return sum + time / (1000 * 60 * 60 * 24);
        }, 0) / currentConversions.length
      : 0;
    const previousConversionTime = previousConversions.length > 0
      ? previousConversions.reduce((sum, l) => {
          const time = new Date(l.conversionDate!).getTime() - new Date(l.joinDate).getTime();
          return sum + time / (1000 * 60 * 60 * 24);
        }, 0) / previousConversions.length
      : 0;

    const currentConversionRate = currentLeads.length > 0 ? (currentConversions.length / currentLeads.length) * 100 : 0;
    const previousConversionRate = previousLeads.length > 0 ? (previousConversions.length / previousLeads.length) * 100 : 0;

    const chartData: ReferralAnalytics['chartData'] = [];
    for (let i = periodDays - 1; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayLeads = leads.filter(l => l.joinDate.startsWith(dateStr)).length;
      const dayConversions = leads.filter(l => l.conversionDate?.startsWith(dateStr)).length;
      const dayRevenue = leads.filter(l => l.conversionDate?.startsWith(dateStr)).reduce((sum, l) => sum + l.lifetimeValue, 0);
      
      chartData.push({ date: dateStr, leads: dayLeads, conversions: dayConversions, revenue: dayRevenue });
    }

    const sourceBreakdown: ReferralAnalytics['sourceBreakdown'] = [];
    const sources: ReferralLead['source'][] = ['direct_link', 'qr_code', 'social_media', 'email', 'whatsapp', 'other'];
    sources.forEach(source => {
      const sourceLeads = currentLeads.filter(l => l.source === source);
      const sourceConversions = sourceLeads.filter(l => l.status === 'converted');
      const sourceRevenue = sourceConversions.reduce((sum, l) => sum + l.lifetimeValue, 0);
      const sourceConversionRate = sourceLeads.length > 0 ? (sourceConversions.length / sourceLeads.length) * 100 : 0;
      
      if (sourceLeads.length > 0) {
        sourceBreakdown.push({
          source,
          leads: sourceLeads.length,
          conversions: sourceConversions.length,
          revenue: sourceRevenue,
          conversionRate: sourceConversionRate,
        });
      }
    });

    const topLeads = [...currentLeads].sort((a, b) => b.lifetimeValue - a.lifetimeValue).slice(0, 5);
    const recentActivity = interactions.filter(i => new Date(i.date) >= startDate).slice(0, 10);

    return {
      period: selectedPeriod,
      startDate: startDate.toISOString(),
      endDate: now.toISOString(),
      metrics: {
        leads: {
          value: currentLeads.length,
          change: previousLeads.length > 0 ? ((currentLeads.length - previousLeads.length) / previousLeads.length) * 100 : 0,
        },
        conversions: {
          value: currentConversions.length,
          change: previousConversions.length > 0 ? ((currentConversions.length - previousConversions.length) / previousConversions.length) * 100 : 0,
        },
        revenue: {
          value: currentRevenue,
          change: previousRevenue > 0 ? ((currentRevenue - previousRevenue) / previousRevenue) * 100 : 0,
        },
        commissions: {
          value: currentCommissions,
          change: previousCommissions > 0 ? ((currentCommissions - previousCommissions) / previousCommissions) * 100 : 0,
        },
        avgConversionTime: {
          value: currentConversionTime,
          change: previousConversionTime > 0 ? ((currentConversionTime - previousConversionTime) / previousConversionTime) * 100 : 0,
        },
        conversionRate: {
          value: currentConversionRate,
          change: previousConversionRate > 0 ? ((currentConversionRate - previousConversionRate) / previousConversionRate) * 100 : 0,
        },
      },
      chartData,
      sourceBreakdown,
      topLeads,
      recentActivity,
    };
  }, [leads, commissions, interactions, selectedPeriod]);

  return {
    leads: filteredLeads,
    allLeads: leads,
    interactions,
    campaigns,
    materials,
    commissions,
    tiers,
    currentTier,
    nextTier,
    stats,
    funnel,
    analytics,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    sourceFilter,
    setSourceFilter,
    sortBy,
    setSortBy,
    selectedPeriod,
    setSelectedPeriod,
    addLead,
    updateLead,
    addInteraction,
    getLeadInteractions,
    createCampaign,
    updateCampaign,
    getLeadCommissions,
  };
};
