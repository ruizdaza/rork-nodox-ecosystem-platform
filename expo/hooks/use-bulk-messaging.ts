import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useCallback, useMemo } from 'react';
import {
  BulkMessagingPlan,
  BulkMessagingSubscription,
  BulkMessageCampaign,
  MessageTemplate,
  RecipientSegment,
  BulkMessagingStats,
} from '@/types/bulk-messaging';

const STORAGE_KEYS = {
  PLANS: 'nodox_bulk_messaging_plans',
  SUBSCRIPTIONS: 'nodox_bulk_messaging_subscriptions',
  CAMPAIGNS: 'nodox_bulk_messaging_campaigns',
  TEMPLATES: 'nodox_bulk_messaging_templates',
  SEGMENTS: 'nodox_bulk_messaging_segments',
  INVOICES: 'nodox_bulk_messaging_invoices',
  NOTIFICATIONS: 'nodox_bulk_messaging_notifications',
};

const AVAILABLE_PLANS: BulkMessagingPlan[] = [
  {
    id: 'starter',
    name: 'Plan Inicial',
    description: 'Perfecto para comenzar con mensajería masiva',
    features: {
      freeMessagesPerMonth: 500,
      costPerAdditionalMessage: 0.05,
      maxRecipientsPerCampaign: 1000,
      allowScheduling: true,
      allowSegmentation: false,
      analyticsIncluded: true,
      priorityDelivery: false,
      dedicatedSupport: false,
      apiAccess: false,
      customTemplates: false,
    },
    pricing: {
      monthlyFee: 29.99,
      yearlyFee: 299.99,
      yearlyDiscount: 16.67,
    },
    limits: {
      campaignsPerMonth: 10,
      maxMessageLength: 500,
      attachmentsAllowed: false,
      maxAttachmentSize: 0,
    },
  },
  {
    id: 'professional',
    name: 'Plan Profesional',
    description: 'Para negocios en crecimiento',
    features: {
      freeMessagesPerMonth: 2000,
      costPerAdditionalMessage: 0.04,
      maxRecipientsPerCampaign: 5000,
      allowScheduling: true,
      allowSegmentation: true,
      analyticsIncluded: true,
      priorityDelivery: true,
      dedicatedSupport: false,
      apiAccess: false,
      customTemplates: true,
    },
    pricing: {
      monthlyFee: 79.99,
      yearlyFee: 799.99,
      yearlyDiscount: 16.67,
    },
    limits: {
      campaignsPerMonth: 50,
      maxMessageLength: 1000,
      attachmentsAllowed: true,
      maxAttachmentSize: 5,
    },
  },
  {
    id: 'enterprise',
    name: 'Plan Empresarial',
    description: 'Solución completa para grandes volúmenes',
    features: {
      freeMessagesPerMonth: 10000,
      costPerAdditionalMessage: 0.03,
      maxRecipientsPerCampaign: 50000,
      allowScheduling: true,
      allowSegmentation: true,
      analyticsIncluded: true,
      priorityDelivery: true,
      dedicatedSupport: true,
      apiAccess: true,
      customTemplates: true,
    },
    pricing: {
      monthlyFee: 299.99,
      yearlyFee: 2999.99,
      yearlyDiscount: 16.67,
    },
    limits: {
      campaignsPerMonth: 999,
      maxMessageLength: 2000,
      attachmentsAllowed: true,
      maxAttachmentSize: 25,
    },
  },
];

const mockSubscription: BulkMessagingSubscription = {
  id: 'sub-1',
  allyId: 'ally-1',
  allyName: 'Mi Negocio',
  plan: AVAILABLE_PLANS[1],
  status: 'active',
  billingCycle: 'monthly',
  startDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15),
  renewalDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 15),
  usage: {
    messagesUsedThisMonth: 1245,
    messagesRemainingFree: 755,
    additionalMessagesUsed: 0,
    campaignsUsedThisMonth: 8,
    totalCostThisMonth: 79.99,
  },
  paymentMethod: {
    type: 'card',
    last4: '4242',
    expiryMonth: 12,
    expiryYear: 2026,
  },
  autoRenew: true,
};

const mockCampaigns: BulkMessageCampaign[] = [
  {
    id: 'campaign-1',
    allyId: 'ally-1',
    allyName: 'Mi Negocio',
    name: 'Promoción de Verano',
    description: 'Descuentos especiales para clientes frecuentes',
    status: 'sent',
    message: {
      content: '¡Hola {{name}}! 🌞 Aprovecha nuestro descuento del 30% en productos seleccionados. Válido hasta el 31 de julio.',
      type: 'text',
    },
    recipients: {
      total: 523,
      type: 'segment',
      segmentName: 'Clientes Frecuentes',
    },
    scheduling: {
      sendNow: false,
      scheduledFor: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
      timezone: 'America/Bogota',
    },
    analytics: {
      sent: 523,
      delivered: 515,
      failed: 8,
      opened: 387,
      clicked: 124,
      unsubscribed: 2,
      cost: 0,
    },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
    sentAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
    completedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
  },
  {
    id: 'campaign-2',
    allyId: 'ally-1',
    allyName: 'Mi Negocio',
    name: 'Nuevos Productos',
    description: 'Anuncio de lanzamiento',
    status: 'scheduled',
    message: {
      content: 'Hola {{name}}, tenemos novedades increíbles para ti. Descubre nuestra nueva colección.',
      type: 'text',
    },
    recipients: {
      total: 1200,
      type: 'all_customers',
    },
    scheduling: {
      sendNow: false,
      scheduledFor: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2),
      timezone: 'America/Bogota',
    },
    analytics: {
      sent: 0,
      delivered: 0,
      failed: 0,
      opened: 0,
      clicked: 0,
      unsubscribed: 0,
      cost: 0,
    },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 12),
  },
];

const mockTemplates: MessageTemplate[] = [
  {
    id: 'template-1',
    allyId: 'ally-1',
    name: 'Bienvenida de Cliente',
    category: 'welcome',
    content: '¡Hola {{name}}! Bienvenido a {{businessName}}. Estamos felices de tenerte con nosotros. 🎉',
    variables: [
      { key: 'name', label: 'Nombre del Cliente', required: true },
      { key: 'businessName', label: 'Nombre del Negocio', defaultValue: 'Mi Negocio', required: true },
    ],
    usageCount: 45,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30),
  },
  {
    id: 'template-2',
    allyId: 'ally-1',
    name: 'Promoción Genérica',
    category: 'promotion',
    content: 'Hola {{name}}, aprovecha {{discount}}% de descuento en {{category}}. Válido hasta {{endDate}}.',
    variables: [
      { key: 'name', label: 'Nombre', required: true },
      { key: 'discount', label: 'Porcentaje de Descuento', required: true },
      { key: 'category', label: 'Categoría', required: true },
      { key: 'endDate', label: 'Fecha de Fin', required: true },
    ],
    usageCount: 23,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 20),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15),
  },
];

const mockSegments: RecipientSegment[] = [
  {
    id: 'segment-1',
    allyId: 'ally-1',
    name: 'Clientes Frecuentes',
    description: 'Clientes con más de 5 compras en los últimos 90 días',
    criteria: {
      orderCount: 5,
      lastPurchaseDays: 90,
    },
    recipientCount: 523,
    lastUpdated: new Date(),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 60),
  },
  {
    id: 'segment-2',
    allyId: 'ally-1',
    name: 'Clientes VIP',
    description: 'Clientes con compras superiores a $500,000',
    criteria: {
      totalSpent: 500000,
    },
    recipientCount: 87,
    lastUpdated: new Date(),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 45),
  },
];

export const [BulkMessagingProvider, useBulkMessaging] = createContextHook(() => {
  const queryClient = useQueryClient();
  const [selectedPlan, setSelectedPlan] = useState<string | undefined>();

  const plansQuery = useQuery({
    queryKey: ['bulk-messaging-plans'],
    queryFn: async (): Promise<BulkMessagingPlan[]> => {
      return AVAILABLE_PLANS;
    },
  });

  const subscriptionQuery = useQuery({
    queryKey: ['bulk-messaging-subscription'],
    queryFn: async (): Promise<BulkMessagingSubscription | null> => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEYS.SUBSCRIPTIONS);
        if (stored) {
          const parsed = JSON.parse(stored);
          return {
            ...parsed,
            startDate: new Date(parsed.startDate),
            renewalDate: new Date(parsed.renewalDate),
            trialEndsAt: parsed.trialEndsAt ? new Date(parsed.trialEndsAt) : undefined,
          };
        }
        return mockSubscription;
      } catch {
        return mockSubscription;
      }
    },
  });

  const campaignsQuery = useQuery({
    queryKey: ['bulk-messaging-campaigns'],
    queryFn: async (): Promise<BulkMessageCampaign[]> => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEYS.CAMPAIGNS);
        if (stored) {
          const parsed = JSON.parse(stored);
          return parsed.map((campaign: any) => ({
            ...campaign,
            scheduling: {
              ...campaign.scheduling,
              scheduledFor: campaign.scheduling.scheduledFor 
                ? new Date(campaign.scheduling.scheduledFor) 
                : undefined,
            },
            createdAt: new Date(campaign.createdAt),
            updatedAt: new Date(campaign.updatedAt),
            sentAt: campaign.sentAt ? new Date(campaign.sentAt) : undefined,
            completedAt: campaign.completedAt ? new Date(campaign.completedAt) : undefined,
          }));
        }
        return mockCampaigns;
      } catch {
        return mockCampaigns;
      }
    },
  });

  const templatesQuery = useQuery({
    queryKey: ['bulk-messaging-templates'],
    queryFn: async (): Promise<MessageTemplate[]> => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEYS.TEMPLATES);
        if (stored) {
          const parsed = JSON.parse(stored);
          return parsed.map((template: any) => ({
            ...template,
            createdAt: new Date(template.createdAt),
            updatedAt: new Date(template.updatedAt),
          }));
        }
        return mockTemplates;
      } catch {
        return mockTemplates;
      }
    },
  });

  const segmentsQuery = useQuery({
    queryKey: ['bulk-messaging-segments'],
    queryFn: async (): Promise<RecipientSegment[]> => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEYS.SEGMENTS);
        if (stored) {
          const parsed = JSON.parse(stored);
          return parsed.map((segment: any) => ({
            ...segment,
            lastUpdated: new Date(segment.lastUpdated),
            createdAt: new Date(segment.createdAt),
          }));
        }
        return mockSegments;
      } catch {
        return mockSegments;
      }
    },
  });

  const saveSubscription = useMutation({
    mutationFn: async (subscription: BulkMessagingSubscription) => {
      await AsyncStorage.setItem(STORAGE_KEYS.SUBSCRIPTIONS, JSON.stringify(subscription));
      return subscription;
    },
    onSuccess: (subscription) => {
      queryClient.setQueryData(['bulk-messaging-subscription'], subscription);
      console.log('[BulkMessaging] Subscription saved:', subscription.id);
    },
  });

  const saveCampaigns = useMutation({
    mutationFn: async (campaigns: BulkMessageCampaign[]) => {
      await AsyncStorage.setItem(STORAGE_KEYS.CAMPAIGNS, JSON.stringify(campaigns));
      return campaigns;
    },
    onSuccess: (campaigns) => {
      queryClient.setQueryData(['bulk-messaging-campaigns'], campaigns);
      console.log('[BulkMessaging] Campaigns saved:', campaigns.length);
    },
  });

  const saveTemplates = useMutation({
    mutationFn: async (templates: MessageTemplate[]) => {
      await AsyncStorage.setItem(STORAGE_KEYS.TEMPLATES, JSON.stringify(templates));
      return templates;
    },
    onSuccess: (templates) => {
      queryClient.setQueryData(['bulk-messaging-templates'], templates);
      console.log('[BulkMessaging] Templates saved:', templates.length);
    },
  });

  const saveSegments = useMutation({
    mutationFn: async (segments: RecipientSegment[]) => {
      await AsyncStorage.setItem(STORAGE_KEYS.SEGMENTS, JSON.stringify(segments));
      return segments;
    },
    onSuccess: (segments) => {
      queryClient.setQueryData(['bulk-messaging-segments'], segments);
      console.log('[BulkMessaging] Segments saved:', segments.length);
    },
  });

  const { mutateAsync: saveSubscriptionAsync } = saveSubscription;
  const { mutateAsync: saveCampaignsAsync } = saveCampaigns;
  const { mutateAsync: saveTemplatesAsync } = saveTemplates;
  const { mutateAsync: saveSegmentsAsync } = saveSegments;

  const subscribeToPlan = useCallback(async (
    planId: string,
    allyId: string,
    allyName: string,
    billingCycle: 'monthly' | 'yearly'
  ) => {
    const plan = AVAILABLE_PLANS.find(p => p.id === planId);
    if (!plan) {
      throw new Error('Plan no encontrado');
    }

    const newSubscription: BulkMessagingSubscription = {
      id: `sub-${Date.now()}`,
      allyId,
      allyName,
      plan,
      status: 'trial',
      billingCycle,
      startDate: new Date(),
      renewalDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
      trialEndsAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14),
      usage: {
        messagesUsedThisMonth: 0,
        messagesRemainingFree: plan.features.freeMessagesPerMonth,
        additionalMessagesUsed: 0,
        campaignsUsedThisMonth: 0,
        totalCostThisMonth: 0,
      },
      autoRenew: true,
    };

    await saveSubscriptionAsync(newSubscription);
    console.log('[BulkMessaging] Subscribed to plan:', planId);
    return newSubscription;
  }, [saveSubscriptionAsync]);

  const changePlan = useCallback(async (newPlanId: string) => {
    const currentSub = subscriptionQuery.data;
    if (!currentSub) {
      throw new Error('No hay suscripción activa');
    }

    const newPlan = AVAILABLE_PLANS.find(p => p.id === newPlanId);
    if (!newPlan) {
      throw new Error('Plan no encontrado');
    }

    const updatedSubscription: BulkMessagingSubscription = {
      ...currentSub,
      plan: newPlan,
      usage: {
        ...currentSub.usage,
        messagesRemainingFree: newPlan.features.freeMessagesPerMonth - currentSub.usage.messagesUsedThisMonth,
      },
    };

    await saveSubscriptionAsync(updatedSubscription);
    console.log('[BulkMessaging] Plan changed to:', newPlanId);
  }, [subscriptionQuery.data, saveSubscriptionAsync]);

  const cancelSubscription = useCallback(async () => {
    const currentSub = subscriptionQuery.data;
    if (!currentSub) {
      throw new Error('No hay suscripción activa');
    }

    const updatedSubscription: BulkMessagingSubscription = {
      ...currentSub,
      status: 'suspended',
      autoRenew: false,
    };

    await saveSubscriptionAsync(updatedSubscription);
    console.log('[BulkMessaging] Subscription cancelled');
  }, [subscriptionQuery.data, saveSubscriptionAsync]);

  const createCampaign = useCallback(async (
    campaign: Omit<BulkMessageCampaign, 'id' | 'createdAt' | 'updatedAt' | 'analytics'>
  ) => {
    const currentCampaigns = campaignsQuery.data || [];
    const currentSub = subscriptionQuery.data;

    if (!currentSub || (currentSub.status !== 'active' && currentSub.status !== 'trial')) {
      throw new Error('Se requiere una suscripción activa');
    }

    if (currentSub.usage.campaignsUsedThisMonth >= currentSub.plan.limits.campaignsPerMonth) {
      throw new Error('Has alcanzado el límite de campañas para este mes');
    }

    if (campaign.recipients.total > currentSub.plan.features.maxRecipientsPerCampaign) {
      throw new Error(`El plan actual permite máximo ${currentSub.plan.features.maxRecipientsPerCampaign} destinatarios`);
    }

    const newCampaign: BulkMessageCampaign = {
      ...campaign,
      id: `campaign-${Date.now()}`,
      analytics: {
        sent: 0,
        delivered: 0,
        failed: 0,
        opened: 0,
        clicked: 0,
        unsubscribed: 0,
        cost: 0,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const updatedCampaigns = [...currentCampaigns, newCampaign];
    await saveCampaignsAsync(updatedCampaigns);

    const updatedSubscription: BulkMessagingSubscription = {
      ...currentSub,
      usage: {
        ...currentSub.usage,
        campaignsUsedThisMonth: currentSub.usage.campaignsUsedThisMonth + 1,
      },
    };
    await saveSubscriptionAsync(updatedSubscription);

    console.log('[BulkMessaging] Campaign created:', newCampaign.id);
    return newCampaign;
  }, [campaignsQuery.data, subscriptionQuery.data, saveCampaignsAsync, saveSubscriptionAsync]);

  const sendCampaign = useCallback(async (campaignId: string) => {
    const currentCampaigns = campaignsQuery.data || [];
    const currentSub = subscriptionQuery.data;
    const campaign = currentCampaigns.find(c => c.id === campaignId);

    if (!campaign) {
      throw new Error('Campaña no encontrada');
    }

    if (!currentSub || (currentSub.status !== 'active' && currentSub.status !== 'trial')) {
      throw new Error('Se requiere una suscripción activa');
    }

    const totalMessagesAfter = currentSub.usage.messagesUsedThisMonth + campaign.recipients.total;
    const messagesOverLimit = Math.max(0, totalMessagesAfter - currentSub.plan.features.freeMessagesPerMonth);
    const additionalCost = messagesOverLimit * currentSub.plan.features.costPerAdditionalMessage;

    const delivered = Math.floor(campaign.recipients.total * 0.98);
    const failed = campaign.recipients.total - delivered;

    const updatedCampaign: BulkMessageCampaign = {
      ...campaign,
      status: 'sent',
      analytics: {
        sent: campaign.recipients.total,
        delivered,
        failed,
        opened: 0,
        clicked: 0,
        unsubscribed: 0,
        cost: additionalCost,
      },
      sentAt: new Date(),
      completedAt: new Date(),
      updatedAt: new Date(),
    };

    const updatedCampaigns = currentCampaigns.map(c => 
      c.id === campaignId ? updatedCampaign : c
    );

    await saveCampaignsAsync(updatedCampaigns);

    const updatedSubscription: BulkMessagingSubscription = {
      ...currentSub,
      usage: {
        ...currentSub.usage,
        messagesUsedThisMonth: totalMessagesAfter,
        messagesRemainingFree: Math.max(0, currentSub.plan.features.freeMessagesPerMonth - totalMessagesAfter),
        additionalMessagesUsed: currentSub.usage.additionalMessagesUsed + messagesOverLimit,
        totalCostThisMonth: currentSub.usage.totalCostThisMonth + additionalCost,
      },
    };

    await saveSubscriptionAsync(updatedSubscription);

    console.log('[BulkMessaging] Campaign sent:', campaignId, 'Cost:', additionalCost);
    return updatedCampaign;
  }, [campaignsQuery.data, subscriptionQuery.data, saveCampaignsAsync, saveSubscriptionAsync]);

  const createTemplate = useCallback(async (
    template: Omit<MessageTemplate, 'id' | 'createdAt' | 'updatedAt' | 'usageCount'>
  ) => {
    const currentTemplates = templatesQuery.data || [];

    const newTemplate: MessageTemplate = {
      ...template,
      id: `template-${Date.now()}`,
      usageCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const updatedTemplates = [...currentTemplates, newTemplate];
    await saveTemplatesAsync(updatedTemplates);

    console.log('[BulkMessaging] Template created:', newTemplate.id);
    return newTemplate;
  }, [templatesQuery.data, saveTemplatesAsync]);

  const createSegment = useCallback(async (
    segment: Omit<RecipientSegment, 'id' | 'recipientCount' | 'lastUpdated' | 'createdAt'>
  ) => {
    const currentSegments = segmentsQuery.data || [];

    const recipientCount = Math.floor(Math.random() * 500) + 100;

    const newSegment: RecipientSegment = {
      ...segment,
      id: `segment-${Date.now()}`,
      recipientCount,
      lastUpdated: new Date(),
      createdAt: new Date(),
    };

    const updatedSegments = [...currentSegments, newSegment];
    await saveSegmentsAsync(updatedSegments);

    console.log('[BulkMessaging] Segment created:', newSegment.id);
    return newSegment;
  }, [segmentsQuery.data, saveSegmentsAsync]);

  const getStats = useCallback((): BulkMessagingStats | null => {
    const subscription = subscriptionQuery.data;
    const campaigns = campaignsQuery.data || [];

    if (!subscription) return null;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const messagesSentToday = campaigns
      .filter(c => c.sentAt && c.sentAt >= today)
      .reduce((sum, c) => sum + c.analytics.sent, 0);

    const activeCampaigns = campaigns.filter(c => 
      c.status === 'sending' || c.status === 'scheduled'
    ).length;

    const totalDelivered = campaigns.reduce((sum, c) => sum + c.analytics.delivered, 0);
    const totalSent = campaigns.reduce((sum, c) => sum + c.analytics.sent, 0);
    const averageDeliveryRate = totalSent > 0 ? (totalDelivered / totalSent) * 100 : 0;

    const totalOpened = campaigns.reduce((sum, c) => sum + c.analytics.opened, 0);
    const averageOpenRate = totalDelivered > 0 ? (totalOpened / totalDelivered) * 100 : 0;

    return {
      overview: {
        totalCampaigns: campaigns.length,
        activeCampaigns,
        messagesSentToday,
        messagesSentThisMonth: subscription.usage.messagesUsedThisMonth,
        totalMessagesSent: totalSent,
        currentMonthCost: subscription.usage.totalCostThisMonth,
        averageDeliveryRate,
        averageOpenRate,
      },
      subscription: {
        plan: subscription.plan.name,
        status: subscription.status,
        messagesRemaining: subscription.usage.messagesRemainingFree,
        renewalDate: subscription.renewalDate,
        billingAmount: subscription.billingCycle === 'monthly' 
          ? subscription.plan.pricing.monthlyFee 
          : subscription.plan.pricing.yearlyFee,
      },
      recentCampaigns: campaigns
        .filter(c => c.status === 'sent')
        .sort((a, b) => (b.sentAt?.getTime() || 0) - (a.sentAt?.getTime() || 0))
        .slice(0, 5)
        .map(c => ({
          id: c.id,
          name: c.name,
          sent: c.analytics.sent,
          delivered: c.analytics.delivered,
          openRate: c.analytics.delivered > 0 
            ? (c.analytics.opened / c.analytics.delivered) * 100 
            : 0,
          cost: c.analytics.cost,
          sentAt: c.sentAt!,
        })),
      topPerformingCampaigns: campaigns
        .filter(c => c.status === 'sent' && c.analytics.delivered > 0)
        .sort((a, b) => {
          const openRateA = (a.analytics.opened / a.analytics.delivered) * 100;
          const openRateB = (b.analytics.opened / b.analytics.delivered) * 100;
          return openRateB - openRateA;
        })
        .slice(0, 5)
        .map(c => ({
          id: c.id,
          name: c.name,
          openRate: (c.analytics.opened / c.analytics.delivered) * 100,
          clickRate: c.analytics.delivered > 0 
            ? (c.analytics.clicked / c.analytics.delivered) * 100 
            : 0,
          conversions: c.analytics.clicked,
          sentAt: c.sentAt!,
        })),
    };
  }, [subscriptionQuery.data, campaignsQuery.data]);

  return useMemo(() => ({
    plans: plansQuery.data || [],
    subscription: subscriptionQuery.data,
    campaigns: campaignsQuery.data || [],
    templates: templatesQuery.data || [],
    segments: segmentsQuery.data || [],
    selectedPlan,
    setSelectedPlan,
    subscribeToPlan,
    changePlan,
    cancelSubscription,
    createCampaign,
    sendCampaign,
    createTemplate,
    createSegment,
    getStats,
    isLoading: plansQuery.isLoading || subscriptionQuery.isLoading || campaignsQuery.isLoading,
  }), [
    plansQuery.data,
    subscriptionQuery.data,
    campaignsQuery.data,
    templatesQuery.data,
    segmentsQuery.data,
    selectedPlan,
    setSelectedPlan,
    subscribeToPlan,
    changePlan,
    cancelSubscription,
    createCampaign,
    sendCampaign,
    createTemplate,
    createSegment,
    getStats,
    plansQuery.isLoading,
    subscriptionQuery.isLoading,
    campaignsQuery.isLoading,
  ]);
});
