import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Integration,
  IntegrationTemplate,
  SyncLog,
  IntegrationEvent,
  PaymentIntegration,
  AccountingIntegration,
  MarketingIntegration,
} from '@/types/integrations';

const STORAGE_KEY = 'integrations_data';

export const [IntegrationsProvider, useIntegrations] = createContextHook(() => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showSetupModal, setShowSetupModal] = useState<boolean>(false);
  const [selectedIntegration, setSelectedIntegration] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const integrationsQuery = useQuery({
    queryKey: ['integrations'],
    queryFn: async (): Promise<Integration[]> => {
      const stored = await AsyncStorage.getItem(`${STORAGE_KEY}_list`);
      if (stored) {
        return JSON.parse(stored);
      }
      return generateMockIntegrations();
    },
  });

  const templatesQuery = useQuery({
    queryKey: ['integrationTemplates'],
    queryFn: async (): Promise<IntegrationTemplate[]> => {
      return generateMockTemplates();
    },
  });

  const syncLogsQuery = useQuery({
    queryKey: ['syncLogs'],
    queryFn: async (): Promise<SyncLog[]> => {
      const stored = await AsyncStorage.getItem(`${STORAGE_KEY}_sync_logs`);
      if (stored) {
        return JSON.parse(stored);
      }
      return [];
    },
  });

  const eventsQuery = useQuery({
    queryKey: ['integrationEvents'],
    queryFn: async (): Promise<IntegrationEvent[]> => {
      const stored = await AsyncStorage.getItem(`${STORAGE_KEY}_events`);
      if (stored) {
        return JSON.parse(stored);
      }
      return [];
    },
  });

  const connectIntegrationMutation = useMutation({
    mutationFn: async (params: { templateId: string; config: any; credentials: any }) => {
      const template = templatesQuery.data?.find(t => t.id === params.templateId);
      if (!template) throw new Error('Template not found');

      const newIntegration: Integration = {
        id: Date.now().toString(),
        name: template.name,
        category: template.category as any,
        provider: template.provider,
        description: template.description,
        icon: template.icon,
        status: 'connected',
        isEnabled: true,
        config: { ...template.defaultConfig, ...params.config },
        credentials: params.credentials,
        syncFrequency: 'hourly',
        dataMapping: [],
        webhooks: [],
        permissions: [],
        usageStats: {
          totalCalls: 0,
          successfulCalls: 0,
          failedCalls: 0,
          averageResponseTime: 0,
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const currentIntegrations = integrationsQuery.data || [];
      const updated = [...currentIntegrations, newIntegration];
      await AsyncStorage.setItem(`${STORAGE_KEY}_list`, JSON.stringify(updated));
      
      return newIntegration;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integrations'] });
    },
  });

  const disconnectIntegrationMutation = useMutation({
    mutationFn: async (integrationId: string) => {
      const currentIntegrations = integrationsQuery.data || [];
      const updated = currentIntegrations.filter(i => i.id !== integrationId);
      await AsyncStorage.setItem(`${STORAGE_KEY}_list`, JSON.stringify(updated));
      return integrationId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integrations'] });
    },
  });

  const toggleIntegrationMutation = useMutation({
    mutationFn: async (params: { integrationId: string; enabled: boolean }) => {
      const currentIntegrations = integrationsQuery.data || [];
      const updated = currentIntegrations.map(i =>
        i.id === params.integrationId ? { ...i, isEnabled: params.enabled } : i
      );
      await AsyncStorage.setItem(`${STORAGE_KEY}_list`, JSON.stringify(updated));
      return params;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integrations'] });
    },
  });

  const syncIntegrationMutation = useMutation({
    mutationFn: async (integrationId: string) => {
      const integration = integrationsQuery.data?.find(i => i.id === integrationId);
      if (!integration) throw new Error('Integration not found');

      const startTime = Date.now();
      
      await new Promise(resolve => setTimeout(resolve, 2000));

      const syncLog: SyncLog = {
        id: Date.now().toString(),
        integrationId,
        integrationName: integration.name,
        status: 'success',
        recordsSynced: Math.floor(Math.random() * 100) + 50,
        recordsFailed: Math.floor(Math.random() * 5),
        errors: [],
        startedAt: new Date().toISOString(),
        completedAt: new Date().toISOString(),
        duration: Date.now() - startTime,
      };

      const currentLogs = syncLogsQuery.data || [];
      const updatedLogs = [syncLog, ...currentLogs].slice(0, 50);
      await AsyncStorage.setItem(`${STORAGE_KEY}_sync_logs`, JSON.stringify(updatedLogs));

      const currentIntegrations = integrationsQuery.data || [];
      const updated = currentIntegrations.map(i =>
        i.id === integrationId ? { ...i, lastSync: new Date().toISOString() } : i
      );
      await AsyncStorage.setItem(`${STORAGE_KEY}_list`, JSON.stringify(updated));

      return syncLog;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integrations'] });
      queryClient.invalidateQueries({ queryKey: ['syncLogs'] });
    },
  });

  const updateIntegrationConfigMutation = useMutation({
    mutationFn: async (params: { integrationId: string; config: any }) => {
      const currentIntegrations = integrationsQuery.data || [];
      const updated = currentIntegrations.map(i =>
        i.id === params.integrationId 
          ? { ...i, config: { ...i.config, ...params.config }, updatedAt: new Date().toISOString() }
          : i
      );
      await AsyncStorage.setItem(`${STORAGE_KEY}_list`, JSON.stringify(updated));
      return params;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integrations'] });
    },
  });

  const filteredIntegrations = (integrationsQuery.data || []).filter(integration =>
    selectedCategory === 'all' ? true : integration.category === selectedCategory
  );

  const connectedIntegrations = (integrationsQuery.data || []).filter(i => i.status === 'connected');
  const activeIntegrations = (integrationsQuery.data || []).filter(i => i.isEnabled);

  return {
    integrations: integrationsQuery.data || [],
    filteredIntegrations,
    templates: templatesQuery.data || [],
    syncLogs: syncLogsQuery.data || [],
    events: eventsQuery.data || [],
    
    selectedCategory,
    selectedIntegration,
    showSetupModal,
    
    connectedIntegrations,
    activeIntegrations,
    
    isLoadingIntegrations: integrationsQuery.isLoading,
    isLoadingTemplates: templatesQuery.isLoading,
    
    setSelectedCategory,
    setSelectedIntegration,
    setShowSetupModal,
    
    connectIntegration: connectIntegrationMutation.mutate,
    disconnectIntegration: disconnectIntegrationMutation.mutate,
    toggleIntegration: toggleIntegrationMutation.mutate,
    syncIntegration: syncIntegrationMutation.mutate,
    updateIntegrationConfig: updateIntegrationConfigMutation.mutate,
    
    isConnecting: connectIntegrationMutation.isPending,
    isDisconnecting: disconnectIntegrationMutation.isPending,
    isSyncing: syncIntegrationMutation.isPending,
  };
});

function generateMockIntegrations(): Integration[] {
  return [
    {
      id: '1',
      name: 'Stripe',
      category: 'payment',
      provider: 'stripe',
      description: 'Procesamiento de pagos con tarjeta',
      icon: 'credit-card',
      status: 'connected',
      isEnabled: true,
      config: {
        timeout: 30000,
        retryAttempts: 3,
        autoSync: true,
        syncFields: ['payments', 'customers'],
        customSettings: {},
      },
      lastSync: new Date(Date.now() - 3600000).toISOString(),
      syncFrequency: 'realtime',
      dataMapping: [],
      webhooks: [],
      permissions: ['read_payments', 'write_payments'],
      usageStats: {
        totalCalls: 1250,
        successfulCalls: 1240,
        failedCalls: 10,
        averageResponseTime: 245,
        quotaLimit: 10000,
        quotaUsed: 1250,
      },
      createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
      updatedAt: new Date(Date.now() - 3600000).toISOString(),
    },
  ];
}

function generateMockTemplates(): IntegrationTemplate[] {
  return [
    {
      id: '1',
      name: 'Stripe',
      provider: 'stripe',
      category: 'payment',
      description: 'Acepta pagos con tarjeta de crédito y débito de forma segura',
      icon: 'credit-card',
      isPremium: false,
      requirements: ['Cuenta de Stripe', 'API Keys'],
      setupInstructions: [
        'Crea una cuenta en stripe.com',
        'Obtén tus API keys desde el dashboard',
        'Ingresa las credenciales en NodoX',
        'Configura tus webhooks',
      ],
      defaultConfig: {
        timeout: 30000,
        retryAttempts: 3,
        autoSync: true,
        syncFields: ['payments', 'customers', 'invoices'],
        customSettings: {},
      },
    },
    {
      id: '2',
      name: 'Mercado Pago',
      provider: 'mercadopago',
      category: 'payment',
      description: 'Acepta pagos en América Latina con múltiples métodos',
      icon: 'dollar-sign',
      isPremium: false,
      requirements: ['Cuenta de Mercado Pago', 'Access Token'],
      setupInstructions: [
        'Crea una cuenta de Mercado Pago',
        'Ve a Developers y crea una aplicación',
        'Copia tu Access Token',
        'Ingresa el token en NodoX',
      ],
      defaultConfig: {
        timeout: 30000,
        retryAttempts: 3,
        autoSync: true,
        syncFields: ['payments', 'preferences'],
        customSettings: {},
      },
    },
    {
      id: '3',
      name: 'QuickBooks',
      provider: 'quickbooks',
      category: 'accounting',
      description: 'Sincroniza tu contabilidad automáticamente',
      icon: 'book',
      isPremium: true,
      requirements: ['Cuenta de QuickBooks', 'OAuth credentials'],
      setupInstructions: [
        'Conecta tu cuenta de QuickBooks',
        'Autoriza el acceso a NodoX',
        'Configura las cuentas contables',
        'Inicia la sincronización',
      ],
      defaultConfig: {
        timeout: 30000,
        retryAttempts: 3,
        autoSync: true,
        syncFields: ['invoices', 'expenses', 'customers', 'vendors'],
        customSettings: {},
      },
    },
    {
      id: '4',
      name: 'Mailchimp',
      provider: 'mailchimp',
      category: 'marketing',
      description: 'Email marketing y automatización',
      icon: 'mail',
      isPremium: false,
      requirements: ['Cuenta de Mailchimp', 'API Key'],
      setupInstructions: [
        'Crea una cuenta en Mailchimp',
        'Genera tu API Key',
        'Ingresa la API Key en NodoX',
        'Selecciona tus listas de contactos',
      ],
      defaultConfig: {
        timeout: 30000,
        retryAttempts: 3,
        autoSync: true,
        syncFields: ['subscribers', 'campaigns'],
        customSettings: {},
      },
    },
    {
      id: '5',
      name: 'WhatsApp Business',
      provider: 'whatsapp',
      category: 'communication',
      description: 'Mensajería directa con clientes',
      icon: 'message-circle',
      isPremium: true,
      requirements: ['WhatsApp Business API', 'Meta Developer Account'],
      setupInstructions: [
        'Solicita acceso a WhatsApp Business API',
        'Configura tu número de teléfono',
        'Obtén tu token de acceso',
        'Conecta con NodoX',
      ],
      defaultConfig: {
        timeout: 30000,
        retryAttempts: 3,
        autoSync: false,
        syncFields: ['messages', 'contacts'],
        customSettings: {},
      },
    },
    {
      id: '6',
      name: 'Google Analytics',
      provider: 'google_analytics',
      category: 'analytics',
      description: 'Análisis avanzado de comportamiento de usuarios',
      icon: 'trending-up',
      isPremium: false,
      requirements: ['Google Account', 'Analytics Property'],
      setupInstructions: [
        'Crea una propiedad en Google Analytics',
        'Obtén tu Measurement ID',
        'Ingresa el ID en NodoX',
        'Configura eventos personalizados',
      ],
      defaultConfig: {
        timeout: 30000,
        retryAttempts: 3,
        autoSync: true,
        syncFields: ['events', 'users', 'sessions'],
        customSettings: {},
      },
    },
    {
      id: '7',
      name: 'Salesforce',
      provider: 'salesforce',
      category: 'crm',
      description: 'CRM empresarial integrado',
      icon: 'users',
      isPremium: true,
      requirements: ['Salesforce Account', 'Connected App'],
      setupInstructions: [
        'Crea una Connected App en Salesforce',
        'Obtén tus credenciales OAuth',
        'Autoriza el acceso desde NodoX',
        'Mapea los campos de datos',
      ],
      defaultConfig: {
        timeout: 30000,
        retryAttempts: 3,
        autoSync: true,
        syncFields: ['leads', 'contacts', 'opportunities', 'accounts'],
        customSettings: {},
      },
    },
    {
      id: '8',
      name: 'SAP Business One',
      provider: 'sap',
      category: 'erp',
      description: 'Sistema ERP empresarial completo',
      icon: 'package',
      isPremium: true,
      requirements: ['SAP Business One License', 'Service Layer Access'],
      setupInstructions: [
        'Configura SAP Service Layer',
        'Obtén las credenciales de acceso',
        'Ingresa la URL del servidor',
        'Sincroniza los módulos necesarios',
      ],
      defaultConfig: {
        timeout: 60000,
        retryAttempts: 5,
        autoSync: true,
        syncFields: ['inventory', 'orders', 'invoices', 'suppliers'],
        customSettings: {},
      },
    },
  ];
}
