import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Bell, Send, MessageCircle, Heart, Gift, CreditCard } from 'lucide-react-native';
import { useNotifications } from '@/hooks/use-notifications';
import { useNodoX } from '@/hooks/use-nodox-store';
import { useChat } from '@/hooks/use-chat';
import { useSocialFeed } from '@/hooks/use-social-feed';
import { useOffers } from '@/hooks/use-offers';

export const NotificationDemo: React.FC = () => {
  const notifications = useNotifications();
  const nodox = useNodoX();
  const chat = useChat();
  const social = useSocialFeed();
  const offers = useOffers();
  const [isLoading, setIsLoading] = useState<string | null>(null);

  const handleAction = async (actionName: string, action: () => Promise<void>) => {
    setIsLoading(actionName);
    try {
      await action();
      console.log('Éxito:', `${actionName} ejecutado correctamente`);
    } catch (error) {
      console.error('Error:', `Error al ejecutar ${actionName}:`, error);
    } finally {
      setIsLoading(null);
    }
  };

  const demoActions = [
    {
      title: 'Envío de Dinero',
      icon: Send,
      color: '#10b981',
      action: async () => {
        await nodox.sendCOP('María González', 50000);
      }
    },
    {
      title: 'Recarga Exitosa',
      icon: CreditCard,
      color: '#3b82f6',
      action: async () => {
        await nodox.rechargeCOP(100000, 'PSE');
      }
    },
    {
      title: 'Mensaje Nuevo',
      icon: MessageCircle,
      color: '#8b5cf6',
      action: async () => {
        await chat.simulateIncomingMessage('chat-1', 'user-1', '¡Hola! ¿Cómo estás? Espero que tengas un excelente día.');
      }
    },
    {
      title: 'Interacción Social',
      icon: Heart,
      color: '#ef4444',
      action: async () => {
        await social.simulateSocialInteraction('like', 'Carlos Mendoza', 'Mi experiencia en el restaurante');
      }
    },
    {
      title: 'Nueva Oferta',
      icon: Gift,
      color: '#f59e0b',
      action: async () => {
        await offers.addNewOffer({
          title: 'Pizza Familiar Especial',
          business: 'Pizzería Italiana',
          category: 'restaurant',
          description: 'Pizza familiar con ingredientes premium',
          image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&h=300&fit=crop',
          discount: '25% OFF',
          originalPrice: '$35.000',
          ncopPrice: 70,
          location: 'Zona Norte, Bogotá',
          rating: 4.7,
          expiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        });
      }
    },
    {
      title: 'Simular Pago Recibido',
      icon: CreditCard,
      color: '#059669',
      action: async () => {
        await nodox.simulatePaymentReceived(75000, 'Ana López', 'COP');
      }
    },
    {
      title: 'Canjear Oferta',
      icon: Gift,
      color: '#dc2626',
      action: async () => {
        await offers.redeemOffer('1');
      }
    },
    {
      title: 'Agregar NCOP',
      icon: Gift,
      color: '#7c3aed',
      action: async () => {
        await nodox.addNcop(250, 'Compra en aliado');
      }
    }
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Bell size={24} color="#1f2937" />
          <Text style={styles.title}>Demo de Notificaciones</Text>
        </View>
        
        <View style={styles.statusContainer}>
          <View style={styles.syncInfo}>
            <Text style={styles.syncText}>
              Notificaciones: {notifications.notifications.length}
            </Text>
            <Text style={styles.syncText}>
              No leídas: {notifications.unreadCount}
            </Text>
          </View>
        </View>
      </View>

      <ScrollView style={styles.actionsContainer} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Acciones de Demostración</Text>
        <Text style={styles.sectionDescription}>
          Toca cualquier acción para generar notificaciones automáticas
        </Text>

        {demoActions.map((action, index) => {
          const IconComponent = action.icon;
          const isCurrentlyLoading = isLoading === action.title;
          
          return (
            <TouchableOpacity
              key={`${action.title}-${index}`}
              style={[styles.actionButton, { borderLeftColor: action.color }]}
              onPress={() => handleAction(action.title, action.action)}
              disabled={isCurrentlyLoading}
            >
              <View style={styles.actionContent}>
                <View style={[styles.iconContainer, { backgroundColor: action.color + '20' }]}>
                  <IconComponent size={20} color={action.color} />
                </View>
                <View style={styles.actionText}>
                  <Text style={styles.actionTitle}>{action.title}</Text>
                  <Text style={styles.actionDescription}>
                    {isCurrentlyLoading ? 'Ejecutando...' : 'Toca para probar'}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.syncButton}
          onPress={() => notifications.markAllAsRead()}
          disabled={notifications.unreadCount === 0}
        >
          <Text style={styles.syncButtonText}>
            Marcar Todas como Leídas ({notifications.unreadCount})
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
    marginLeft: 8,
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  onlineStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#dcfce7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  offlineStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fee2e2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
    color: '#374151',
  },
  syncInfo: {
    alignItems: 'flex-end',
  },
  syncText: {
    fontSize: 12,
    color: '#6b7280',
  },
  actionsContainer: {
    flex: 1,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 20,
  },
  actionButton: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  actionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  actionText: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1f2937',
    marginBottom: 2,
  },
  actionDescription: {
    fontSize: 14,
    color: '#6b7280',
  },
  footer: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  syncButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  syncButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '500',
  },
});