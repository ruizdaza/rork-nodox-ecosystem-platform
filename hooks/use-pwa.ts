import { useState, useEffect, useCallback } from 'react';
import { Platform } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import * as Notifications from 'expo-notifications';
import { 
  PWACapabilities, 
  OfflineData, 
  SyncQueue, 
  PushNotificationPayload,
  BiometricAuthConfig,
  AppInstallPrompt,
  ServiceWorkerStatus
} from '@/types/pwa';

interface UsePWAReturn {
  // Capabilities
  capabilities: PWACapabilities;
  
  // Network status
  isOnline: boolean;
  connectionType: string | null;
  
  // Installation
  installPrompt: AppInstallPrompt;
  showInstallPrompt: () => void;
  installApp: () => Promise<void>;
  
  // Notifications
  requestNotificationPermission: () => Promise<boolean>;
  sendPushNotification: (payload: PushNotificationPayload) => Promise<void>;
  
  // Offline functionality
  offlineData: OfflineData;
  syncQueue: SyncQueue[];
  syncOfflineData: () => Promise<void>;
  
  // Biometric authentication
  biometricConfig: BiometricAuthConfig;
  authenticateWithBiometrics: () => Promise<boolean>;
  
  // Service worker
  serviceWorkerStatus: ServiceWorkerStatus;
  updateServiceWorker: () => Promise<void>;
  
  // Cache management
  clearCache: () => Promise<void>;
  getCacheSize: () => Promise<number>;
}

export function usePWA(): UsePWAReturn {
  const [capabilities, setCapabilities] = useState<PWACapabilities>({
    isInstallable: false,
    isInstalled: false,
    isOnline: true,
    hasNotificationPermission: false,
    hasCameraPermission: false,
    hasMicrophonePermission: false,
    hasLocationPermission: false,
    supportsPushNotifications: false,
    supportsBackgroundSync: false,
    supportsOfflineStorage: true
  });
  
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [connectionType, setConnectionType] = useState<string | null>(null);
  
  const [installPrompt, setInstallPrompt] = useState<AppInstallPrompt>({
    canInstall: false,
    hasBeenShown: false,
    userChoice: 'pending',
    installCount: 0
  });
  
  const [offlineData, setOfflineData] = useState<OfflineData>({
    products: [],
    cart: { items: [], lastUpdated: new Date().toISOString() },
    wishlist: { items: [], lastUpdated: new Date().toISOString() },
    searchHistory: { queries: [], lastUpdated: new Date().toISOString() },
    userPreferences: { data: {}, lastUpdated: new Date().toISOString() }
  });
  
  const [syncQueue, setSyncQueue] = useState<SyncQueue[]>([]);
  
  const [biometricConfig, setBiometricConfig] = useState<BiometricAuthConfig>({
    enabled: false,
    type: 'none',
    fallbackToPin: true,
    maxAttempts: 3,
    lockoutDuration: 300000 // 5 minutes
  });
  
  const [serviceWorkerStatus, setServiceWorkerStatus] = useState<ServiceWorkerStatus>({
    isRegistered: false,
    isActive: false,
    isWaiting: false,
    hasUpdate: false,
    version: '1.0.0'
  });

  // Initialize PWA capabilities
  useEffect(() => {
    initializePWA();
    setupNetworkListener();
    checkInstallability();
    checkNotificationPermissions();
    
    if (Platform.OS === 'web') {
      setupServiceWorker();
    }
  }, []);

  const initializePWA = async () => {
    const newCapabilities: PWACapabilities = {
      isInstallable: Platform.OS === 'web' && 'serviceWorker' in navigator,
      isInstalled: Platform.OS === 'web' && window.matchMedia('(display-mode: standalone)').matches,
      isOnline: true,
      hasNotificationPermission: false,
      hasCameraPermission: false,
      hasMicrophonePermission: false,
      hasLocationPermission: false,
      supportsPushNotifications: Platform.OS !== 'web' || 'PushManager' in window,
      supportsBackgroundSync: Platform.OS === 'web' && 'serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype,
      supportsOfflineStorage: true
    };
    
    setCapabilities(newCapabilities);
  };

  const setupNetworkListener = () => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsOnline(state.isConnected ?? false);
      setConnectionType(state.type);
      
      setCapabilities(prev => ({
        ...prev,
        isOnline: state.isConnected ?? false
      }));
      
      // Trigger sync when coming back online
      if (state.isConnected && syncQueue.length > 0) {
        syncOfflineData();
      }
    });
    
    return unsubscribe;
  };

  const checkInstallability = () => {
    if (Platform.OS === 'web') {
      // Listen for beforeinstallprompt event
      window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        setInstallPrompt(prev => ({
          ...prev,
          canInstall: true
        }));
      });
      
      // Check if already installed
      if (window.matchMedia('(display-mode: standalone)').matches) {
        setCapabilities(prev => ({ ...prev, isInstalled: true }));
      }
    }
  };

  const checkNotificationPermissions = async () => {
    try {
      const { status } = await Notifications.getPermissionsAsync();
      const hasPermission = status === 'granted';
      
      setCapabilities(prev => ({
        ...prev,
        hasNotificationPermission: hasPermission
      }));
    } catch (error) {
      console.error('Error checking notification permissions:', error);
    }
  };

  const setupServiceWorker = async () => {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        
        setServiceWorkerStatus({
          isRegistered: true,
          isActive: registration.active !== null,
          isWaiting: registration.waiting !== null,
          hasUpdate: registration.waiting !== null,
          version: '1.0.0'
        });
        
        // Listen for updates
        registration.addEventListener('updatefound', () => {
          setServiceWorkerStatus(prev => ({
            ...prev,
            hasUpdate: true,
            isWaiting: true
          }));
        });
      } catch (error) {
        console.error('Service worker registration failed:', error);
      }
    }
  };

  // Installation
  const showInstallPrompt = useCallback(() => {
    setInstallPrompt(prev => ({
      ...prev,
      hasBeenShown: true,
      lastShownAt: new Date().toISOString()
    }));
  }, []);

  const installApp = useCallback(async () => {
    if (Platform.OS === 'web' && installPrompt.canInstall) {
      try {
        // This would trigger the actual install prompt
        // const result = await deferredPrompt.prompt();
        setInstallPrompt(prev => ({
          ...prev,
          userChoice: 'accepted',
          installCount: prev.installCount + 1
        }));
        
        setCapabilities(prev => ({ ...prev, isInstalled: true }));
      } catch (error) {
        console.error('Installation failed:', error);
        setInstallPrompt(prev => ({ ...prev, userChoice: 'dismissed' }));
      }
    }
  }, [installPrompt.canInstall]);

  // Notifications
  const requestNotificationPermission = useCallback(async (): Promise<boolean> => {
    try {
      const { status } = await Notifications.requestPermissionsAsync();
      const granted = status === 'granted';
      
      setCapabilities(prev => ({
        ...prev,
        hasNotificationPermission: granted
      }));
      
      return granted;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }, []);

  const sendPushNotification = useCallback(async (payload: PushNotificationPayload) => {
    try {
      if (Platform.OS === 'web') {
        // Web push notification
        if ('serviceWorker' in navigator && 'PushManager' in window) {
          const registration = await navigator.serviceWorker.ready;
          // This would send the notification through the service worker
          console.log('Sending web push notification:', payload);
        }
      } else {
        // Mobile push notification
        await Notifications.scheduleNotificationAsync({
          content: {
            title: payload.title,
            body: payload.body,
            data: payload.data
          },
          trigger: null // Send immediately
        });
      }
    } catch (error) {
      console.error('Error sending push notification:', error);
    }
  }, []);

  // Offline functionality
  const syncOfflineData = useCallback(async () => {
    if (!isOnline || syncQueue.length === 0) return;
    
    const itemsToSync = syncQueue.filter(item => item.status === 'pending');
    
    for (const item of itemsToSync) {
      try {
        setSyncQueue(prev => prev.map(queueItem => 
          queueItem.id === item.id 
            ? { ...queueItem, status: 'syncing' }
            : queueItem
        ));
        
        // Simulate API sync
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setSyncQueue(prev => prev.map(queueItem => 
          queueItem.id === item.id 
            ? { ...queueItem, status: 'completed' }
            : queueItem
        ));
      } catch (error) {
        console.error('Sync failed for item:', item.id, error);
        
        setSyncQueue(prev => prev.map(queueItem => 
          queueItem.id === item.id 
            ? { 
                ...queueItem, 
                status: 'failed', 
                retryCount: queueItem.retryCount + 1 
              }
            : queueItem
        ));
      }
    }
    
    // Remove completed items
    setSyncQueue(prev => prev.filter(item => item.status !== 'completed'));
  }, [isOnline, syncQueue]);

  // Biometric authentication
  const authenticateWithBiometrics = useCallback(async (): Promise<boolean> => {
    try {
      if (Platform.OS === 'web') {
        // Web Authentication API
        if ('credentials' in navigator) {
          // This would use WebAuthn for biometric authentication
          console.log('Web biometric authentication not fully implemented');
          return false;
        }
      } else {
        // Mobile biometric authentication would use expo-local-authentication
        console.log('Mobile biometric authentication not implemented');
        return false;
      }
      
      return false;
    } catch (error) {
      console.error('Biometric authentication failed:', error);
      return false;
    }
  }, []);

  // Service worker management
  const updateServiceWorker = useCallback(async () => {
    if (Platform.OS === 'web' && 'serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.ready;
        if (registration.waiting) {
          registration.waiting.postMessage({ type: 'SKIP_WAITING' });
          window.location.reload();
        }
      } catch (error) {
        console.error('Service worker update failed:', error);
      }
    }
  }, []);

  // Cache management
  const clearCache = useCallback(async () => {
    try {
      if (Platform.OS === 'web' && 'caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.map(cacheName => caches.delete(cacheName))
        );
      }
      
      // Clear offline data
      setOfflineData({
        products: [],
        cart: { items: [], lastUpdated: new Date().toISOString() },
        wishlist: { items: [], lastUpdated: new Date().toISOString() },
        searchHistory: { queries: [], lastUpdated: new Date().toISOString() },
        userPreferences: { data: {}, lastUpdated: new Date().toISOString() }
      });
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  }, []);

  const getCacheSize = useCallback(async (): Promise<number> => {
    try {
      if (Platform.OS === 'web' && 'navigator' in window && 'storage' in navigator && 'estimate' in navigator.storage) {
        const estimate = await navigator.storage.estimate();
        return estimate.usage || 0;
      }
      return 0;
    } catch (error) {
      console.error('Error getting cache size:', error);
      return 0;
    }
  }, []);

  return {
    capabilities,
    isOnline,
    connectionType,
    installPrompt,
    showInstallPrompt,
    installApp,
    requestNotificationPermission,
    sendPushNotification,
    offlineData,
    syncQueue,
    syncOfflineData,
    biometricConfig,
    authenticateWithBiometrics,
    serviceWorkerStatus,
    updateServiceWorker,
    clearCache,
    getCacheSize
  };
}