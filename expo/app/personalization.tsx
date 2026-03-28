import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Modal,
  TextInput,
  Switch,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  Heart, 
  HeartOff, 
  Star, 
  Bell, 
  BellOff, 
  Plus, 
  X, 
  Edit3,
  Trash2,
  Share,
  Eye,
  EyeOff
} from 'lucide-react-native';
import { usePersonalization } from '@/hooks/use-personalization';
import { Wishlist, WishlistItem } from '@/types/personalization';

export default function PersonalizationScreen() {
  const {
    wishlists,
    activeWishlist,
    createWishlist,
    addToWishlist,
    removeFromWishlist,
    togglePriceAlert,
    preferences,
    updatePreferences,
    isLoading,
    isUpdating
  } = usePersonalization();

  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [newWishlistName, setNewWishlistName] = useState<string>('');
  const [newWishlistDescription, setNewWishlistDescription] = useState<string>('');
  const [selectedWishlist, setSelectedWishlist] = useState<Wishlist | null>(activeWishlist);

  const handleCreateWishlist = async () => {
    if (!newWishlistName.trim()) {
      Alert.alert('Error', 'Por favor ingresa un nombre para la lista');
      return;
    }

    try {
      await createWishlist(newWishlistName.trim(), newWishlistDescription.trim());
      setNewWishlistName('');
      setNewWishlistDescription('');
      setShowCreateModal(false);
      Alert.alert('Éxito', 'Lista de deseos creada correctamente');
    } catch (error) {
      Alert.alert('Error', 'No se pudo crear la lista de deseos');
    }
  };

  const handleRemoveFromWishlist = (itemId: string, productName: string) => {
    Alert.alert(
      'Eliminar producto',
      `¿Estás seguro de que quieres eliminar "${productName}" de tu lista de deseos?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Eliminar', 
          style: 'destructive',
          onPress: () => removeFromWishlist(itemId)
        }
      ]
    );
  };

  const handleTogglePriceAlert = async (itemId: string) => {
    try {
      await togglePriceAlert(itemId);
    } catch (error) {
      Alert.alert('Error', 'No se pudo actualizar la alerta de precio');
    }
  };

  const handleUpdateNotificationSettings = async (setting: string, value: boolean) => {
    if (!preferences) return;

    try {
      await updatePreferences({
        notificationSettings: {
          ...preferences.notificationSettings,
          [setting]: value
        }
      });
    } catch (error) {
      Alert.alert('Error', 'No se pudieron actualizar las preferencias');
    }
  };

  const renderWishlistItem = (item: WishlistItem) => (
    <View key={item.id} style={styles.wishlistItem}>
      <Image source={{ uri: item.product.image }} style={styles.productImage} />
      
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={2}>
          {item.product.name}
        </Text>
        
        <View style={styles.priceContainer}>
          <Text style={styles.price}>${item.product.price}</Text>
          <Text style={styles.ncopPrice}>{item.product.ncopPrice} NCOP</Text>
        </View>
        
        <View style={styles.ratingContainer}>
          <Star color="#fbbf24" size={14} fill="#fbbf24" />
          <Text style={styles.rating}>{item.product.rating}</Text>
          <Text style={[
            styles.stockStatus,
            { color: item.product.inStock ? '#10b981' : '#ef4444' }
          ]}>
            {item.product.inStock ? 'En stock' : 'Agotado'}
          </Text>
        </View>
        
        <View style={styles.itemActions}>
          <TouchableOpacity
            style={[
              styles.alertButton,
              item.priceAlert && styles.alertButtonActive
            ]}
            onPress={() => handleTogglePriceAlert(item.id)}
          >
            {item.priceAlert ? (
              <Bell color="#ffffff" size={16} />
            ) : (
              <BellOff color="#64748b" size={16} />
            )}
            <Text style={[
              styles.alertButtonText,
              item.priceAlert && styles.alertButtonTextActive
            ]}>
              {item.priceAlert ? 'Alerta activa' : 'Crear alerta'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.itemControls}>
        <TouchableOpacity
          style={styles.controlButton}
          onPress={() => handleRemoveFromWishlist(item.id, item.product.name)}
        >
          <Trash2 color="#ef4444" size={20} />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderCreateModal = () => (
    <Modal
      visible={showCreateModal}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => setShowCreateModal(false)}
    >
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={() => setShowCreateModal(false)}>
            <X color="#64748b" size={24} />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Nueva Lista de Deseos</Text>
          <TouchableOpacity onPress={handleCreateWishlist} disabled={isUpdating}>
            <Text style={[
              styles.saveButton,
              isUpdating && styles.saveButtonDisabled
            ]}>
              {isUpdating ? 'Guardando...' : 'Guardar'}
            </Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.modalContent}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Nombre de la lista *</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Ej: Productos favoritos"
              value={newWishlistName}
              onChangeText={setNewWishlistName}
              maxLength={50}
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Descripción (opcional)</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              placeholder="Describe tu lista de deseos..."
              value={newWishlistDescription}
              onChangeText={setNewWishlistDescription}
              multiline
              numberOfLines={3}
              maxLength={200}
            />
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Cargando personalización...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Personalización</Text>
          <Text style={styles.headerSubtitle}>
            Gestiona tus listas de deseos y preferencias
          </Text>
        </View>

        {/* Notification Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notificaciones</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingName}>Alertas de precio</Text>
              <Text style={styles.settingDescription}>
                Recibe notificaciones cuando bajen los precios
              </Text>
            </View>
            <Switch
              value={preferences?.notificationSettings.priceDrops ?? false}
              onValueChange={(value) => handleUpdateNotificationSettings('priceDrops', value)}
              trackColor={{ false: '#e2e8f0', true: '#2563eb' }}
              thumbColor="#ffffff"
            />
          </View>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingName}>Nuevos productos</Text>
              <Text style={styles.settingDescription}>
                Notificaciones de productos nuevos en tus categorías favoritas
              </Text>
            </View>
            <Switch
              value={preferences?.notificationSettings.newArrivals ?? false}
              onValueChange={(value) => handleUpdateNotificationSettings('newArrivals', value)}
              trackColor={{ false: '#e2e8f0', true: '#2563eb' }}
              thumbColor="#ffffff"
            />
          </View>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingName}>Productos disponibles</Text>
              <Text style={styles.settingDescription}>
                Avísame cuando un producto agotado esté disponible
              </Text>
            </View>
            <Switch
              value={preferences?.notificationSettings.backInStock ?? false}
              onValueChange={(value) => handleUpdateNotificationSettings('backInStock', value)}
              trackColor={{ false: '#e2e8f0', true: '#2563eb' }}
              thumbColor="#ffffff"
            />
          </View>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingName}>Recomendaciones</Text>
              <Text style={styles.settingDescription}>
                Recibe sugerencias personalizadas de productos
              </Text>
            </View>
            <Switch
              value={preferences?.notificationSettings.recommendations ?? false}
              onValueChange={(value) => handleUpdateNotificationSettings('recommendations', value)}
              trackColor={{ false: '#e2e8f0', true: '#2563eb' }}
              thumbColor="#ffffff"
            />
          </View>
        </View>

        {/* Wishlists */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Listas de Deseos</Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setShowCreateModal(true)}
            >
              <Plus color="#2563eb" size={20} />
              <Text style={styles.addButtonText}>Nueva Lista</Text>
            </TouchableOpacity>
          </View>
          
          {wishlists.length === 0 ? (
            <View style={styles.emptyState}>
              <Heart color="#64748b" size={48} />
              <Text style={styles.emptyStateTitle}>No tienes listas de deseos</Text>
              <Text style={styles.emptyStateDescription}>
                Crea tu primera lista para guardar productos que te interesen
              </Text>
              <TouchableOpacity
                style={styles.createFirstButton}
                onPress={() => setShowCreateModal(true)}
              >
                <Text style={styles.createFirstButtonText}>Crear mi primera lista</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              {/* Wishlist Tabs */}
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                style={styles.wishlistTabs}
              >
                {wishlists.map((wishlist) => (
                  <TouchableOpacity
                    key={wishlist.id}
                    style={[
                      styles.wishlistTab,
                      selectedWishlist?.id === wishlist.id && styles.wishlistTabActive
                    ]}
                    onPress={() => setSelectedWishlist(wishlist)}
                  >
                    <Text style={[
                      styles.wishlistTabText,
                      selectedWishlist?.id === wishlist.id && styles.wishlistTabTextActive
                    ]}>
                      {wishlist.name}
                    </Text>
                    <Text style={styles.wishlistTabCount}>
                      {wishlist.items.length} productos
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              
              {/* Selected Wishlist Content */}
              {selectedWishlist && (
                <View style={styles.wishlistContent}>
                  <View style={styles.wishlistHeader}>
                    <View style={styles.wishlistInfo}>
                      <Text style={styles.wishlistName}>{selectedWishlist.name}</Text>
                      {selectedWishlist.description && (
                        <Text style={styles.wishlistDescription}>
                          {selectedWishlist.description}
                        </Text>
                      )}
                    </View>
                    <View style={styles.wishlistActions}>
                      <TouchableOpacity style={styles.wishlistActionButton}>
                        {selectedWishlist.isPublic ? (
                          <Eye color="#64748b" size={20} />
                        ) : (
                          <EyeOff color="#64748b" size={20} />
                        )}
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.wishlistActionButton}>
                        <Share color="#64748b" size={20} />
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.wishlistActionButton}>
                        <Edit3 color="#64748b" size={20} />
                      </TouchableOpacity>
                    </View>
                  </View>
                  
                  {selectedWishlist.items.length === 0 ? (
                    <View style={styles.emptyWishlist}>
                      <HeartOff color="#64748b" size={32} />
                      <Text style={styles.emptyWishlistText}>
                        Esta lista está vacía
                      </Text>
                      <Text style={styles.emptyWishlistDescription}>
                        Explora productos y agrégalos a esta lista
                      </Text>
                    </View>
                  ) : (
                    <View style={styles.wishlistItems}>
                      {selectedWishlist.items.map(renderWishlistItem)}
                    </View>
                  )}
                </View>
              )}
            </>
          )}
        </View>
      </ScrollView>
      
      {renderCreateModal()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#64748b',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#64748b',
  },
  section: {
    backgroundColor: '#ffffff',
    marginTop: 8,
    paddingVertical: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1e293b',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eff6ff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2563eb',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1e293b',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 18,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateDescription: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  createFirstButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  createFirstButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '500',
  },
  wishlistTabs: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  wishlistTab: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginRight: 12,
    minWidth: 120,
  },
  wishlistTabActive: {
    backgroundColor: '#2563eb',
  },
  wishlistTabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748b',
    marginBottom: 2,
  },
  wishlistTabTextActive: {
    color: '#ffffff',
  },
  wishlistTabCount: {
    fontSize: 12,
    color: '#94a3b8',
  },
  wishlistContent: {
    paddingHorizontal: 20,
  },
  wishlistHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  wishlistInfo: {
    flex: 1,
  },
  wishlistName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  wishlistDescription: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 18,
  },
  wishlistActions: {
    flexDirection: 'row',
    gap: 8,
  },
  wishlistActionButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
  },
  emptyWishlist: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyWishlistText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1e293b',
    marginTop: 12,
    marginBottom: 4,
  },
  emptyWishlistDescription: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
  },
  wishlistItems: {
    gap: 16,
  },
  wishlistItem: {
    flexDirection: 'row',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1e293b',
    marginBottom: 8,
    lineHeight: 20,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 6,
  },
  price: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  ncopPrice: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2563eb',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 12,
  },
  rating: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748b',
    marginRight: 8,
  },
  stockStatus: {
    fontSize: 12,
    fontWeight: '500',
  },
  itemActions: {
    flexDirection: 'row',
    gap: 8,
  },
  alertButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    gap: 6,
  },
  alertButtonActive: {
    backgroundColor: '#2563eb',
  },
  alertButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748b',
  },
  alertButtonTextActive: {
    color: '#ffffff',
  },
  itemControls: {
    justifyContent: 'center',
  },
  controlButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#ffffff',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
  },
  saveButton: {
    fontSize: 16,
    fontWeight: '500',
    color: '#2563eb',
  },
  saveButtonDisabled: {
    color: '#94a3b8',
  },
  modalContent: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1e293b',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1e293b',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
});