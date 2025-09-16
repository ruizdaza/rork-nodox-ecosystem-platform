import createContextHook from '@nkzw/create-context-hook';
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

interface NotificationData {
  id: string;
  title: string;
  body: string;
  data?: any;
  timestamp: number;
  read: boolean;
  type: NotificationType;
  priority: 'low' | 'normal' | 'high';
  category: NotificationCategory;
}

type NotificationType = 
  | 'payment_received'
  | 'payment_sent'
  | 'ncop_earned'
  | 'ncop_exchanged'
  | 'referral_success'
  | 'appointment_confirmed'
  | 'appointment_reminder'
  | 'appointment_cancelled'
  | 'new_message'
  | 'social_like'
  | 'social_comment'
  | 'social_share'
  | 'offer_available'
  | 'offer_expiring'
  | 'ally_order'
  | 'ally_review'
  | 'system_update'
  | 'security_alert'
  | 'promotion'
  | 'recharge_success'
  | 'low_balance';

type NotificationCategory = 
  | 'wallet'
  | 'social'
  | 'appointments'
  | 'offers'
  | 'ally'
  | 'system'
  | 'chat';

interface NotificationSettings {
  enabled: boolean;
  categories: {
    wallet: boolean;
    social: boolean;
    appointments: boolean;
    offers: boolean;
    ally: boolean;
    system: boolean;
    chat: boolean;
  };
  sound: boolean;
  vibration: boolean;
  badge: boolean;
  quietHours: {
    enabled: boolean;
    start: string;
    end: string;
  };
}

const defaultSettings: NotificationSettings = {
  enabled: true,
  categories: {
    wallet: true,
    social: true,
    appointments: true,
    offers: true,
    ally: true,
    system: true,
    chat: true,
  },
  sound: true,
  vibration: true,
  badge: true,
  quietHours: {
    enabled: false,
    start: '22:00',
    end: '08:00',
  },
};

// Configure notification behavior
if (Platform.OS !== 'web') {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

export const [NotificationProvider, useNotifications] = createContextHook(() => {
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [settings, setSettings] = useState<NotificationSettings>(defaultSettings);
  const [expoPushToken, setExpoPushToken] = useState<string>('');
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const notificationListener = useRef<Notifications.Subscription | undefined>(undefined);
  const responseListener = useRef<Notifications.Subscription | undefined>(undefined);

  const loadNotifications = useCallback(async () => {
    try {
      console.log('Loading notifications from storage');
    } catch (error) {
      console.log('Error loading notifications:', error);
    }
  }, []);

  const loadSettings = useCallback(async () => {
    try {
      console.log('Loading notification settings from storage');
    } catch (error) {
      console.log('Error loading notification settings:', error);
    }
  }, []);

  const saveNotifications = useCallback(async (notifs: NotificationData[]) => {
    if (!notifs || !Array.isArray(notifs)) return;
    try {
      console.log('Saving notifications to storage:', notifs.length);
    } catch (error) {
      console.log('Error saving notifications:', error);
    }
  }, []);

  const saveSettings = useCallback(async (newSettings: NotificationSettings) => {
    if (!newSettings) return;
    try {
      console.log('Saving notification settings to storage');
      setSettings(newSettings);
    } catch (error) {
      console.log('Error saving notification settings:', error);
    }
  }, []);

  const markAsRead = useCallback((id: string) => {
    if (!id?.trim()) return;
    const updatedNotifications = notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    );
    setNotifications(updatedNotifications);
    saveNotifications(updatedNotifications);
  }, [notifications, saveNotifications]);

  const handleIncomingNotification = useCallback((notification: Notifications.Notification) => {
    if (!notification) return;
    console.log('Handling incoming notification:', notification);
  }, []);

  const handleNotificationResponse = useCallback((response: Notifications.NotificationResponse) => {
    if (!response) return;
    const notificationData = response.notification.request.content.data;
    console.log('User tapped notification:', notificationData);
    
    if (notificationData?.id && typeof notificationData.id === 'string') {
      markAsRead(notificationData.id);
    }
  }, [markAsRead]);

  useEffect(() => {
    loadNotifications();
    loadSettings();
    registerForPushNotificationsAsync();

    if (Platform.OS !== 'web') {
      notificationListener.current = Notifications.addNotificationReceivedListener(handleIncomingNotification);
      responseListener.current = Notifications.addNotificationResponseReceivedListener(handleNotificationResponse);
    }

    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, [handleIncomingNotification, handleNotificationResponse, loadNotifications, loadSettings]);

  useEffect(() => {
    const count = notifications.filter(n => !n.read).length;
    setUnreadCount(count);
    if (Platform.OS !== 'web') {
      Notifications.setBadgeCountAsync(count);
    }
  }, [notifications]);

  const registerForPushNotificationsAsync = async () => {
    if (Platform.OS === 'web') {
      console.log('Push notifications not supported on web');
      return;
    }

    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        console.log('Failed to get push token for push notification!');
        return;
      }
      
      const tokenData = await Notifications.getExpoPushTokenAsync();
      console.log('Expo push token:', tokenData.data);
      setExpoPushToken(tokenData.data);
    } catch (error) {
      console.log('Error getting push token:', error);
    }
  };

  const isQuietHours = useCallback((): boolean => {
    if (!settings.quietHours.enabled) return false;
    
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    const [startHour, startMin] = settings.quietHours.start.split(':').map(Number);
    const [endHour, endMin] = settings.quietHours.end.split(':').map(Number);
    
    const startTime = startHour * 60 + startMin;
    const endTime = endHour * 60 + endMin;
    
    if (startTime <= endTime) {
      return currentTime >= startTime && currentTime <= endTime;
    } else {
      return currentTime >= startTime || currentTime <= endTime;
    }
  }, [settings.quietHours]);

  const shouldShowNotification = useCallback((category: NotificationCategory): boolean => {
    if (!category?.trim()) return false;
    if (!settings.enabled) return false;
    if (!settings.categories[category]) return false;
    if (isQuietHours()) return false;
    return true;
  }, [settings, isQuietHours]);

  const scheduleLocalNotification = useCallback(async (notification: NotificationData) => {
    if (!notification) return;
    if (Platform.OS === 'web') {
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(notification.title, {
          body: notification.body,
          icon: '/favicon.png',
        });
      }
      return;
    }

    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: notification.title,
          body: notification.body,
          data: notification.data,
          sound: settings.sound ? 'default' : undefined,
          priority: notification.priority === 'high' ? 
            Notifications.AndroidNotificationPriority.HIGH : 
            Notifications.AndroidNotificationPriority.DEFAULT,
        },
        trigger: null,
      });
    } catch (error) {
      console.log('Error scheduling notification:', error);
    }
  }, [settings]);

  const createNotification = useCallback(async (
    title: string,
    body: string,
    type: NotificationType,
    category: NotificationCategory,
    data?: any,
    priority: 'low' | 'normal' | 'high' = 'normal'
  ) => {
    const notification: NotificationData = {
      id: Date.now().toString(),
      title,
      body,
      data,
      timestamp: Date.now(),
      read: false,
      type,
      priority,
      category,
    };

    const updatedNotifications = [notification, ...notifications];
    setNotifications(updatedNotifications);
    await saveNotifications(updatedNotifications);

    if (shouldShowNotification(category)) {
      await scheduleLocalNotification(notification);
    }

    console.log('Notification created:', notification);
    return notification;
  }, [notifications, saveNotifications, shouldShowNotification, scheduleLocalNotification]);

  const markAllAsRead = useCallback(() => {
    const updatedNotifications = notifications.map(n => ({ ...n, read: true }));
    setNotifications(updatedNotifications);
    saveNotifications(updatedNotifications);
  }, [notifications, saveNotifications]);

  const deleteNotification = useCallback((id: string) => {
    if (!id?.trim()) return;
    const updatedNotifications = notifications.filter(n => n.id !== id);
    setNotifications(updatedNotifications);
    saveNotifications(updatedNotifications);
  }, [notifications, saveNotifications]);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
    saveNotifications([]);
  }, [saveNotifications]);

  const getNotificationsByCategory = useCallback((category: NotificationCategory) => {
    if (!category?.trim()) return [];
    return notifications.filter(n => n.category === category);
  }, [notifications]);

  const getUnreadNotificationsByCategory = useCallback((category: NotificationCategory) => {
    if (!category?.trim()) return [];
    return notifications.filter(n => n.category === category && !n.read);
  }, [notifications]);

  // Specific notification creators
  const notifyPaymentReceived = useCallback((amount: number, from: string, currency: 'COP' | 'NCOP') => {
    if (!from?.trim()) return;
    return createNotification(
      'Pago Recibido',
      `Has recibido ${amount} ${currency} de ${from.trim()}`,
      'payment_received',
      'wallet',
      { amount, from: from.trim(), currency },
      'high'
    );
  }, [createNotification]);

  const notifyPaymentSent = useCallback((amount: number, to: string, currency: 'COP' | 'NCOP') => {
    if (!to?.trim()) return;
    return createNotification(
      'Pago Enviado',
      `Has enviado ${amount} ${currency} a ${to.trim()}`,
      'payment_sent',
      'wallet',
      { amount, to: to.trim(), currency }
    );
  }, [createNotification]);

  const notifyNCOPEarned = useCallback((amount: number, source: string) => {
    if (!source?.trim()) return;
    return createNotification(
      'NCOP Ganados',
      `Has ganado ${amount} NCOP por ${source.trim()}`,
      'ncop_earned',
      'wallet',
      { amount, source: source.trim() },
      'normal'
    );
  }, [createNotification]);

  const notifyReferralSuccess = useCallback((referredName: string, bonus: number) => {
    if (!referredName?.trim()) return;
    return createNotification(
      'Referido Exitoso',
      `${referredName.trim()} se unió usando tu código. Has ganado ${bonus} NCOP`,
      'referral_success',
      'wallet',
      { referredName: referredName.trim(), bonus },
      'high'
    );
  }, [createNotification]);

  const notifyAppointmentConfirmed = useCallback((serviceName: string, date: string, time: string) => {
    if (!serviceName?.trim() || !date?.trim() || !time?.trim()) return;
    return createNotification(
      'Cita Confirmada',
      `Tu cita para ${serviceName.trim()} el ${date.trim()} a las ${time.trim()} ha sido confirmada`,
      'appointment_confirmed',
      'appointments',
      { serviceName: serviceName.trim(), date: date.trim(), time: time.trim() },
      'high'
    );
  }, [createNotification]);

  const notifyAppointmentReminder = useCallback((serviceName: string, time: string) => {
    if (!serviceName?.trim() || !time?.trim()) return;
    return createNotification(
      'Recordatorio de Cita',
      `Tu cita para ${serviceName.trim()} es en 1 hora (${time.trim()})`,
      'appointment_reminder',
      'appointments',
      { serviceName: serviceName.trim(), time: time.trim() },
      'high'
    );
  }, [createNotification]);

  const notifyNewMessage = useCallback((senderName: string, preview: string) => {
    if (!senderName?.trim() || !preview?.trim()) return;
    const sanitizedPreview = preview.trim().length > 100 ? preview.trim().substring(0, 100) + '...' : preview.trim();
    return createNotification(
      `Mensaje de ${senderName.trim()}`,
      sanitizedPreview,
      'new_message',
      'chat',
      { senderName: senderName.trim(), preview: sanitizedPreview },
      'high'
    );
  }, [createNotification]);

  const notifySocialInteraction = useCallback((type: 'like' | 'comment' | 'share', userName: string, postTitle?: string) => {
    if (!userName?.trim()) return;
    const actions = {
      like: 'le gustó tu publicación',
      comment: 'comentó en tu publicación',
      share: 'compartió tu publicación'
    };
    
    const sanitizedPostTitle = postTitle?.trim();
    return createNotification(
      'Actividad Social',
      `${userName.trim()} ${actions[type]}${sanitizedPostTitle ? `: "${sanitizedPostTitle}"` : ''}`,
      `social_${type}` as NotificationType,
      'social',
      { type, userName: userName.trim(), postTitle: sanitizedPostTitle }
    );
  }, [createNotification]);

  const notifyOfferAvailable = useCallback((offerTitle: string, discount: string) => {
    if (!offerTitle?.trim() || !discount?.trim()) return;
    return createNotification(
      'Nueva Oferta Disponible',
      `${offerTitle.trim()} - ${discount.trim()} de descuento`,
      'offer_available',
      'offers',
      { offerTitle: offerTitle.trim(), discount: discount.trim() },
      'normal'
    );
  }, [createNotification]);

  const notifyOfferExpiring = useCallback((offerTitle: string, hoursLeft: number) => {
    if (!offerTitle?.trim()) return;
    return createNotification(
      'Oferta Por Vencer',
      `${offerTitle.trim()} vence en ${hoursLeft} horas`,
      'offer_expiring',
      'offers',
      { offerTitle: offerTitle.trim(), hoursLeft },
      'high'
    );
  }, [createNotification]);

  const notifyAllyOrder = useCallback((customerName: string, orderTotal: number, serviceName: string) => {
    if (!customerName?.trim() || !serviceName?.trim()) return;
    return createNotification(
      'Nueva Orden',
      `${customerName.trim()} ha solicitado ${serviceName.trim()} por $${orderTotal.toLocaleString()}`,
      'ally_order',
      'ally',
      { customerName: customerName.trim(), orderTotal, serviceName: serviceName.trim() },
      'high'
    );
  }, [createNotification]);

  const notifyAllyReview = useCallback((customerName: string, rating: number, serviceName: string) => {
    if (!customerName?.trim() || !serviceName?.trim()) return;
    return createNotification(
      'Nueva Reseña',
      `${customerName.trim()} calificó ${serviceName.trim()} con ${rating} estrellas`,
      'ally_review',
      'ally',
      { customerName: customerName.trim(), rating, serviceName: serviceName.trim() }
    );
  }, [createNotification]);

  const notifyLowBalance = useCallback((currency: 'COP' | 'NCOP', balance: number) => {
    return createNotification(
      'Saldo Bajo',
      `Tu saldo de ${currency} es bajo: ${balance} ${currency}`,
      'low_balance',
      'wallet',
      { currency, balance },
      'normal'
    );
  }, [createNotification]);

  const notifyRechargeSuccess = useCallback((amount: number, method: string) => {
    if (!method?.trim()) return;
    return createNotification(
      'Recarga Exitosa',
      `Has recargado $${amount.toLocaleString()} COP via ${method.trim()}`,
      'recharge_success',
      'wallet',
      { amount, method: method.trim() },
      'normal'
    );
  }, [createNotification]);

  return useMemo(() => ({
    notifications,
    settings,
    expoPushToken,
    unreadCount,
    createNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
    saveSettings,
    getNotificationsByCategory,
    getUnreadNotificationsByCategory,
    // Specific notification methods
    notifyPaymentReceived,
    notifyPaymentSent,
    notifyNCOPEarned,
    notifyReferralSuccess,
    notifyAppointmentConfirmed,
    notifyAppointmentReminder,
    notifyNewMessage,
    notifySocialInteraction,
    notifyOfferAvailable,
    notifyOfferExpiring,
    notifyAllyOrder,
    notifyAllyReview,
    notifyLowBalance,
    notifyRechargeSuccess,
  }), [
    notifications,
    settings,
    expoPushToken,
    unreadCount,
    createNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
    saveSettings,
    getNotificationsByCategory,
    getUnreadNotificationsByCategory,
    notifyPaymentReceived,
    notifyPaymentSent,
    notifyNCOPEarned,
    notifyReferralSuccess,
    notifyAppointmentConfirmed,
    notifyAppointmentReminder,
    notifyNewMessage,
    notifySocialInteraction,
    notifyOfferAvailable,
    notifyOfferExpiring,
    notifyAllyOrder,
    notifyAllyReview,
    notifyLowBalance,
    notifyRechargeSuccess,
  ]);
});