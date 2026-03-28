import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Bell, X, Check, CheckCheck, Trash2 } from 'lucide-react-native';
import { useNotifications } from '@/hooks/use-notifications';
import { router } from 'expo-router';

const NotificationCenter = () => {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
  } = useNotifications();

  const formatTime = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return 'Ahora';
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    return `${days}d`;
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      wallet: '#10b981',
      social: '#8b5cf6',
      appointments: '#f59e0b',
      offers: '#ef4444',
      ally: '#3b82f6',
      system: '#6b7280',
      chat: '#06b6d4',
    };
    return colors[category as keyof typeof colors] || '#6b7280';
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'wallet': return '💰';
      case 'social': return '👥';
      case 'appointments': return '📅';
      case 'offers': return '🎁';
      case 'ally': return '🏪';
      case 'system': return '⚙️';
      case 'chat': return '💬';
      default: return '🔔';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <X color="#1f2937" size={24} />
        </TouchableOpacity>
        <Text style={styles.title}>Notificaciones</Text>
        <View style={styles.headerActions}>
          {unreadCount > 0 && (
            <TouchableOpacity onPress={markAllAsRead} style={styles.actionButton}>
              <CheckCheck color="#10b981" size={20} />
            </TouchableOpacity>
          )}
          {notifications.length > 0 && (
            <TouchableOpacity onPress={clearAllNotifications} style={styles.actionButton}>
              <Trash2 color="#ef4444" size={20} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {notifications.length === 0 ? (
        <View style={styles.emptyState}>
          <Bell color="#9ca3af" size={64} />
          <Text style={styles.emptyTitle}>No hay notificaciones</Text>
          <Text style={styles.emptySubtitle}>
            Cuando recibas notificaciones, aparecerán aquí
          </Text>
        </View>
      ) : (
        <ScrollView style={styles.notificationsList} showsVerticalScrollIndicator={false}>
          {notifications.map((notification) => (
            <TouchableOpacity
              key={notification.id}
              style={[
                styles.notificationItem,
                !notification.read && styles.unreadNotification
              ]}
              onPress={() => markAsRead(notification.id)}
            >
              <View style={styles.notificationContent}>
                <View style={styles.notificationHeader}>
                  <View style={styles.categoryInfo}>
                    <Text style={styles.categoryIcon}>
                      {getCategoryIcon(notification.category)}
                    </Text>
                    <View
                      style={[
                        styles.categoryDot,
                        { backgroundColor: getCategoryColor(notification.category) }
                      ]}
                    />
                  </View>
                  <Text style={styles.timestamp}>
                    {formatTime(notification.timestamp)}
                  </Text>
                </View>
                
                <Text style={styles.notificationTitle}>
                  {notification.title}
                </Text>
                <Text style={styles.notificationBody}>
                  {notification.body}
                </Text>

                {notification.priority === 'high' && (
                  <View style={styles.priorityBadge}>
                    <Text style={styles.priorityText}>Alta prioridad</Text>
                  </View>
                )}
              </View>

              <View style={styles.notificationActions}>
                {!notification.read && (
                  <TouchableOpacity
                    onPress={() => markAsRead(notification.id)}
                    style={styles.markReadButton}
                  >
                    <Check color="#10b981" size={16} />
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  onPress={() => deleteNotification(notification.id)}
                  style={styles.deleteButton}
                >
                  <X color="#ef4444" size={16} />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
    flex: 1,
    textAlign: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: 8,
    marginLeft: 8,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  notificationsList: {
    flex: 1,
  },
  notificationItem: {
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  unreadNotification: {
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6',
    backgroundColor: '#f8fafc',
  },
  notificationContent: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  categoryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  timestamp: {
    fontSize: 12,
    color: '#6b7280',
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  notificationBody: {
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 20,
  },
  priorityBadge: {
    backgroundColor: '#fef2f2',
    borderColor: '#fecaca',
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  priorityText: {
    fontSize: 12,
    color: '#dc2626',
    fontWeight: '500',
  },
  notificationActions: {
    flexDirection: 'column',
    alignItems: 'center',
    marginLeft: 12,
  },
  markReadButton: {
    padding: 8,
    marginBottom: 4,
  },
  deleteButton: {
    padding: 8,
  },
});

export default NotificationCenter;