export interface PWACapabilities {
  isInstallable: boolean;
  isInstalled: boolean;
  isOnline: boolean;
  hasNotificationPermission: boolean;
  hasCameraPermission: boolean;
  hasMicrophonePermission: boolean;
  hasLocationPermission: boolean;
  supportsPushNotifications: boolean;
  supportsBackgroundSync: boolean;
  supportsOfflineStorage: boolean;
}

export interface OfflineData {
  products: {
    id: string;
    data: any;
    lastUpdated: string;
  }[];
  cart: {
    items: any[];
    lastUpdated: string;
  };
  wishlist: {
    items: any[];
    lastUpdated: string;
  };
  searchHistory: {
    queries: string[];
    lastUpdated: string;
  };
  userPreferences: {
    data: any;
    lastUpdated: string;
  };
}

export interface SyncQueue {
  id: string;
  type: 'cart_update' | 'wishlist_update' | 'purchase' | 'review' | 'search';
  data: any;
  timestamp: string;
  retryCount: number;
  status: 'pending' | 'syncing' | 'completed' | 'failed';
}

export interface PushNotificationPayload {
  title: string;
  body: string;
  icon?: string;
  image?: string;
  badge?: string;
  tag?: string;
  data?: Record<string, any>;
  actions?: {
    action: string;
    title: string;
    icon?: string;
  }[];
}

export interface BiometricAuthConfig {
  enabled: boolean;
  type: 'fingerprint' | 'face' | 'voice' | 'none';
  fallbackToPin: boolean;
  maxAttempts: number;
  lockoutDuration: number;
}

export interface AppInstallPrompt {
  canInstall: boolean;
  hasBeenShown: boolean;
  userChoice: 'accepted' | 'dismissed' | 'pending';
  lastShownAt?: string;
  installCount: number;
}

export interface ServiceWorkerStatus {
  isRegistered: boolean;
  isActive: boolean;
  isWaiting: boolean;
  hasUpdate: boolean;
  lastUpdated?: string;
  version: string;
}

export interface CacheStrategy {
  name: string;
  pattern: RegExp;
  strategy: 'cache-first' | 'network-first' | 'stale-while-revalidate';
  maxAge: number;
  maxEntries: number;
}