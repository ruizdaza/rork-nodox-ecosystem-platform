import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ChatBot,
  KnowledgeBase,
  AutoResponse,
  InventoryAutomation,
  MarketingAutomation,
  ChatBotAnalytics,
  InventoryAnalytics,
  MarketingAnalytics
} from '@/types/automation';

const STORAGE_KEY = 'automation_data';

export const [AutomationProvider, useAutomation] = createContextHook(() => {
  const [selectedBot, setSelectedBot] = useState<string | null>(null);
  const [selectedAutomationType, setSelectedAutomationType] = useState<'chatbot' | 'inventory' | 'marketing'>('chatbot');
  const queryClient = useQueryClient();

  // ChatBots
  const chatBotsQuery = useQuery({
    queryKey: ['chatBots'],
    queryFn: async (): Promise<ChatBot[]> => {
      const stored = await AsyncStorage.getItem(`${STORAGE_KEY}_chatbots`);
      if (stored) {
        return JSON.parse(stored);
      }
      return generateMockChatBots();
    },
  });

  // Inventory Automation
  const inventoryAutomationQuery = useQuery({
    queryKey: ['inventoryAutomation'],
    queryFn: async (): Promise<InventoryAutomation[]> => {
      const stored = await AsyncStorage.getItem(`${STORAGE_KEY}_inventory`);
      if (stored) {
        return JSON.parse(stored);
      }
      return generateMockInventoryAutomation();
    },
  });

  // Marketing Automation
  const marketingAutomationQuery = useQuery({
    queryKey: ['marketingAutomation'],
    queryFn: async (): Promise<MarketingAutomation[]> => {
      const stored = await AsyncStorage.getItem(`${STORAGE_KEY}_marketing`);
      if (stored) {
        return JSON.parse(stored);
      }
      return generateMockMarketingAutomation();
    },
  });

  // Create ChatBot
  const createChatBotMutation = useMutation({
    mutationFn: async (botData: Omit<ChatBot, 'id' | 'analytics'>) => {
      const newBot: ChatBot = {
        ...botData,
        id: Date.now().toString(),
        analytics: {
          totalConversations: 0,
          resolvedQueries: 0,
          escalatedToHuman: 0,
          averageResponseTime: 0,
          satisfactionScore: 0,
          topQuestions: [],
          improvementSuggestions: [],
        },
      };
      
      const currentBots = chatBotsQuery.data || [];
      const updatedBots = [...currentBots, newBot];
      
      await AsyncStorage.setItem(`${STORAGE_KEY}_chatbots`, JSON.stringify(updatedBots));
      return newBot;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chatBots'] });
    },
  });

  // Update ChatBot
  const updateChatBotMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<ChatBot> }) => {
      const currentBots = chatBotsQuery.data || [];
      const updatedBots = currentBots.map(bot => 
        bot.id === id ? { ...bot, ...updates } : bot
      );
      
      await AsyncStorage.setItem(`${STORAGE_KEY}_chatbots`, JSON.stringify(updatedBots));
      return updatedBots.find(bot => bot.id === id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chatBots'] });
    },
  });

  // Add Knowledge Base Entry
  const addKnowledgeBaseMutation = useMutation({
    mutationFn: async ({ botId, entry }: { botId: string; entry: Omit<KnowledgeBase, 'id' | 'lastUpdated'> }) => {
      const newEntry: KnowledgeBase = {
        ...entry,
        id: Date.now().toString(),
        lastUpdated: new Date(),
      };
      
      const currentBots = chatBotsQuery.data || [];
      const updatedBots = currentBots.map(bot => 
        bot.id === botId 
          ? { ...bot, knowledgeBase: [...bot.knowledgeBase, newEntry] }
          : bot
      );
      
      await AsyncStorage.setItem(`${STORAGE_KEY}_chatbots`, JSON.stringify(updatedBots));
      return newEntry;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chatBots'] });
    },
  });

  // Create Inventory Automation
  const createInventoryAutomationMutation = useMutation({
    mutationFn: async (automationData: Omit<InventoryAutomation, 'id' | 'analytics'>) => {
      const newAutomation: InventoryAutomation = {
        ...automationData,
        id: Date.now().toString(),
        analytics: {
          stockouts: 0,
          overstock: 0,
          turnoverRate: 0,
          costSavings: 0,
          automationEfficiency: 0,
        },
      };
      
      const currentAutomations = inventoryAutomationQuery.data || [];
      const updatedAutomations = [...currentAutomations, newAutomation];
      
      await AsyncStorage.setItem(`${STORAGE_KEY}_inventory`, JSON.stringify(updatedAutomations));
      return newAutomation;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventoryAutomation'] });
    },
  });

  // Create Marketing Automation
  const createMarketingAutomationMutation = useMutation({
    mutationFn: async (automationData: Omit<MarketingAutomation, 'id' | 'analytics'>) => {
      const newAutomation: MarketingAutomation = {
        ...automationData,
        id: Date.now().toString(),
        analytics: {
          sent: 0,
          delivered: 0,
          opened: 0,
          clicked: 0,
          converted: 0,
          revenue: 0,
          roi: 0,
          unsubscribed: 0,
        },
      };
      
      const currentAutomations = marketingAutomationQuery.data || [];
      const updatedAutomations = [...currentAutomations, newAutomation];
      
      await AsyncStorage.setItem(`${STORAGE_KEY}_marketing`, JSON.stringify(updatedAutomations));
      return newAutomation;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketingAutomation'] });
    },
  });

  // Toggle automation status
  const toggleAutomationMutation = useMutation({
    mutationFn: async ({ type, id, isActive }: { type: 'chatbot' | 'inventory' | 'marketing'; id: string; isActive: boolean }) => {
      if (type === 'chatbot') {
        const currentBots = chatBotsQuery.data || [];
        const updatedBots = currentBots.map(bot => 
          bot.id === id ? { ...bot, isActive } : bot
        );
        await AsyncStorage.setItem(`${STORAGE_KEY}_chatbots`, JSON.stringify(updatedBots));
      } else if (type === 'inventory') {
        const currentAutomations = inventoryAutomationQuery.data || [];
        const updatedAutomations = currentAutomations.map(automation => 
          automation.id === id ? { ...automation, isActive } : automation
        );
        await AsyncStorage.setItem(`${STORAGE_KEY}_inventory`, JSON.stringify(updatedAutomations));
      } else if (type === 'marketing') {
        const currentAutomations = marketingAutomationQuery.data || [];
        const updatedAutomations = currentAutomations.map(automation => 
          automation.id === id ? { ...automation, isActive } : automation
        );
        await AsyncStorage.setItem(`${STORAGE_KEY}_marketing`, JSON.stringify(updatedAutomations));
      }
      
      return { type, id, isActive };
    },
    onSuccess: ({ type }) => {
      if (type === 'chatbot') {
        queryClient.invalidateQueries({ queryKey: ['chatBots'] });
      } else if (type === 'inventory') {
        queryClient.invalidateQueries({ queryKey: ['inventoryAutomation'] });
      } else if (type === 'marketing') {
        queryClient.invalidateQueries({ queryKey: ['marketingAutomation'] });
      }
    },
  });

  // Simulate AI response
  const simulateAIResponse = async (message: string, botId: string): Promise<string> => {
    const bot = chatBotsQuery.data?.find(b => b.id === botId);
    if (!bot) return 'Lo siento, no pude procesar tu mensaje.';

    // Simple keyword matching
    const lowerMessage = message.toLowerCase();
    
    for (const kb of bot.knowledgeBase) {
      for (const keyword of kb.keywords) {
        if (lowerMessage.includes(keyword.toLowerCase())) {
          return kb.answer;
        }
      }
    }

    // Default responses based on personality
    const defaultResponses = {
      professional: 'Gracias por tu consulta. Te conectaré con un especialista para brindarte la mejor asistencia.',
      friendly: '¡Hola! Me encantaría ayudarte. Déjame buscar la información que necesitas.',
      casual: '¡Hey! No tengo esa info a mano, pero puedo conseguir a alguien que te ayude.',
      formal: 'Estimado usuario, su consulta ha sido recibida y será atendida por nuestro equipo especializado.',
    };

    return defaultResponses[bot.personality] || defaultResponses.professional;
  };

  return {
    // Data
    chatBots: chatBotsQuery.data || [],
    inventoryAutomations: inventoryAutomationQuery.data || [],
    marketingAutomations: marketingAutomationQuery.data || [],
    
    // State
    selectedBot,
    selectedAutomationType,
    
    // Loading states
    isLoadingChatBots: chatBotsQuery.isLoading,
    isLoadingInventory: inventoryAutomationQuery.isLoading,
    isLoadingMarketing: marketingAutomationQuery.isLoading,
    
    // Actions
    setSelectedBot,
    setSelectedAutomationType,
    createChatBot: createChatBotMutation.mutate,
    updateChatBot: updateChatBotMutation.mutate,
    addKnowledgeBase: addKnowledgeBaseMutation.mutate,
    createInventoryAutomation: createInventoryAutomationMutation.mutate,
    createMarketingAutomation: createMarketingAutomationMutation.mutate,
    toggleAutomation: toggleAutomationMutation.mutate,
    simulateAIResponse,
    
    // Mutation states
    isCreatingChatBot: createChatBotMutation.isPending,
    isUpdatingChatBot: updateChatBotMutation.isPending,
    isAddingKnowledge: addKnowledgeBaseMutation.isPending,
    isCreatingInventory: createInventoryAutomationMutation.isPending,
    isCreatingMarketing: createMarketingAutomationMutation.isPending,
    isTogglingAutomation: toggleAutomationMutation.isPending,
  };
});

// Helper functions to generate mock data
function generateMockChatBots(): ChatBot[] {
  return [
    {
      id: '1',
      name: 'Asistente de Ventas',
      description: 'Bot especializado en consultas de productos y ventas',
      isActive: true,
      language: 'es',
      personality: 'friendly',
      knowledgeBase: [
        {
          id: '1',
          category: 'Productos',
          question: '¿Qué productos ofrecen?',
          answer: 'Ofrecemos una amplia gama de productos y servicios. ¿Te interesa alguna categoría en particular?',
          keywords: ['productos', 'servicios', 'catálogo', 'ofertas'],
          confidence: 0.9,
          lastUpdated: new Date(),
        },
        {
          id: '2',
          category: 'Precios',
          question: '¿Cuáles son los precios?',
          answer: 'Nuestros precios varían según el producto. Te puedo conectar con un especialista para una cotización personalizada.',
          keywords: ['precio', 'costo', 'cotización', 'tarifa'],
          confidence: 0.85,
          lastUpdated: new Date(),
        },
      ],
      responses: [],
      analytics: {
        totalConversations: 1250,
        resolvedQueries: 1000,
        escalatedToHuman: 250,
        averageResponseTime: 1.2,
        satisfactionScore: 4.3,
        topQuestions: ['¿Qué productos ofrecen?', '¿Cuáles son los precios?', '¿Cómo puedo comprar?'],
        improvementSuggestions: ['Agregar más información sobre envíos', 'Mejorar respuestas sobre garantías'],
      },
    },
    {
      id: '2',
      name: 'Soporte Técnico',
      description: 'Bot para resolver problemas técnicos y dudas de uso',
      isActive: true,
      language: 'es',
      personality: 'professional',
      knowledgeBase: [
        {
          id: '3',
          category: 'Técnico',
          question: '¿Cómo resetear mi contraseña?',
          answer: 'Para resetear tu contraseña, ve a la pantalla de login y toca \"¿Olvidaste tu contraseña?\". Te enviaremos un enlace por email.',
          keywords: ['contraseña', 'password', 'resetear', 'olvidé', 'login'],
          confidence: 0.95,
          lastUpdated: new Date(),
        },
      ],
      responses: [],
      analytics: {
        totalConversations: 800,
        resolvedQueries: 650,
        escalatedToHuman: 150,
        averageResponseTime: 0.8,
        satisfactionScore: 4.1,
        topQuestions: ['¿Cómo resetear mi contraseña?', 'La app no funciona', '¿Cómo actualizar?'],
        improvementSuggestions: ['Agregar guías visuales', 'Mejorar detección de problemas'],
      },
    },
  ];
}

function generateMockInventoryAutomation(): InventoryAutomation[] {
  return [
    {
      id: '1',
      productId: 'prod_1',
      rules: [
        {
          id: 'rule_1',
          name: 'Reorden Automático',
          trigger: { type: 'low_stock', threshold: 10 },
          action: { type: 'reorder', parameters: { quantity: 50 } },
          conditions: [
            { field: 'stock_level', operator: 'less_than', value: 10 },
          ],
        },
      ],
      isActive: true,
      lastTriggered: new Date(Date.now() - 86400000), // Yesterday
      analytics: {
        stockouts: 2,
        overstock: 0,
        turnoverRate: 85.5,
        costSavings: 1250,
        automationEfficiency: 92.3,
      },
    },
  ];
}

function generateMockMarketingAutomation(): MarketingAutomation[] {
  return [
    {
      id: '1',
      name: 'Bienvenida Nuevos Usuarios',
      type: 'email_campaign',
      trigger: {
        type: 'user_action',
        event: 'user_registered',
        conditions: [],
      },
      content: {
        subject: '¡Bienvenido a NodoX!',
        message: 'Gracias por unirte a nuestra comunidad. Descubre todo lo que puedes hacer con NodoX.',
        cta: {
          text: 'Explorar App',
          url: '/explore',
          type: 'button',
        },
        personalization: [
          { field: 'firstName', placeholder: '{{firstName}}', fallback: 'Usuario' },
        ],
      },
      audience: {
        id: 'new_users',
        name: 'Nuevos Usuarios',
        criteria: {},
        size: 150,
      },
      schedule: {
        type: 'immediate',
        timezone: 'America/Bogota',
      },
      analytics: {
        sent: 150,
        delivered: 148,
        opened: 89,
        clicked: 34,
        converted: 12,
        revenue: 1200,
        roi: 4.2,
        unsubscribed: 2,
      },
      isActive: true,
    },
  ];
}