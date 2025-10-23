import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Image,
  Modal,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Search, X, MessageCircle, UserPlus, QrCode, Star, Users, Send as SendIcon } from 'lucide-react-native';
import { useChat } from '@/hooks/use-chat';
import { Contact as ChatContact } from '@/types/chat';

type TabType = 'all' | 'favorites' | 'groups';

type ContactAction = 'chat' | 'call' | 'videocall' | 'send_money';

const AddContactModal = ({ 
  visible, 
  onClose, 
  onAdd 
}: { 
  visible: boolean; 
  onClose: () => void; 
  onAdd: (contactData: Omit<ChatContact, 'id' | 'userId' | 'addedAt' | 'isOnline' | 'lastSeen'>) => void;
}) => {
  const [name, setName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [avatar, setAvatar] = useState<string>('');

  const handleAdd = () => {
    if (!name.trim()) {
      Alert.alert('Error', 'El nombre es requerido');
      return;
    }

    if (!phone.trim() && !email.trim()) {
      Alert.alert('Error', 'Debes proporcionar al menos teléfono o email');
      return;
    }

    onAdd({
      name: name.trim(),
      phone: phone.trim() || undefined,
      email: email.trim() || undefined,
      avatar: avatar.trim() || `https://ui-avatars.com/api/?name=${encodeURIComponent(name.trim())}&background=2563eb&color=fff&size=150`,
      isFavorite: false,
    });

    setName('');
    setPhone('');
    setEmail('');
    setAvatar('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.modalContainer}>
        <KeyboardAvoidingView
          style={styles.modalContent}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={onClose} style={styles.modalButton}>
              <Text style={styles.modalCancel}>Cancelar</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Agregar Contacto</Text>
            <TouchableOpacity onPress={handleAdd} style={styles.modalButton}>
              <Text style={styles.modalSave}>Agregar</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.modalBody}>
            <Text style={styles.modalDescription}>
              Agrega un nuevo contacto para poder chatear y enviar dinero
            </Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Nombre completo *</Text>
              <TextInput
                style={styles.textInput}
                value={name}
                onChangeText={setName}
                placeholder="Ej: Juan Pérez"
                placeholderTextColor="#94a3b8"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Teléfono</Text>
              <TextInput
                style={styles.textInput}
                value={phone}
                onChangeText={setPhone}
                placeholder="+57 300 123 4567"
                placeholderTextColor="#94a3b8"
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email</Text>
              <TextInput
                style={styles.textInput}
                value={email}
                onChangeText={setEmail}
                placeholder="ejemplo@correo.com"
                placeholderTextColor="#94a3b8"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <Text style={styles.inputNote}>
              * El nombre es obligatorio. Debes proporcionar al menos teléfono o email.
            </Text>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
};

export default function ContactsScreen() {
  const { contacts, addContact, toggleFavoriteContact, startChatWithContact, users } = useChat();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [showAddModal, setShowAddModal] = useState<boolean>(false);

  const enrichedContacts = contacts.map(contact => {
    const user = users[contact.userId as keyof typeof users];
    return {
      ...contact,
      isOnline: user?.isOnline || false,
      status: user?.isOnline ? ('online' as const) : ('offline' as const),
      lastSeen: user?.lastSeen,
    };
  });

  const filteredContacts = enrichedContacts.filter(contact => {
    const matchesSearch = contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.phone?.includes(searchQuery);

    if (activeTab === 'favorites') {
      return matchesSearch && contact.isFavorite;
    }
    
    return matchesSearch;
  });

  const handleAddContact = async (contactData: Omit<ChatContact, 'id' | 'userId' | 'addedAt' | 'isOnline' | 'lastSeen'>) => {
    try {
      await addContact(contactData);
      Alert.alert('Éxito', `${contactData.name} ha sido agregado a tus contactos`);
    } catch (error) {
      console.error('Error adding contact:', error);
      Alert.alert('Error', 'No se pudo agregar el contacto');
    }
  };

  const handleContactAction = async (contact: typeof enrichedContacts[0], action: ContactAction) => {
    try {
      switch (action) {
        case 'chat':
          await startChatWithContact(contact.userId);
          router.push('/conversation');
          break;
        case 'send_money':
          router.push('/send');
          break;
        case 'call':
        case 'videocall':
          Alert.alert('Próximamente', `Función de ${action === 'call' ? 'llamada' : 'videollamada'} disponible pronto`);
          break;
      }
    } catch (error) {
      console.error(`Error performing ${action}:`, error);
      Alert.alert('Error', 'No se pudo realizar la acción');
    }
  };

  const handleToggleFavorite = async (contactId: string) => {
    try {
      await toggleFavoriteContact(contactId);
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const renderContact = ({ item }: { item: typeof enrichedContacts[0] }) => (
    <View style={styles.contactItem}>
      <TouchableOpacity
        style={styles.contactMainInfo}
        onPress={() => handleContactAction(item, 'chat')}
      >
        <View style={styles.avatarContainer}>
          <Image source={{ uri: item.avatar }} style={styles.avatar} />
          <View
            style={[
              styles.statusDot,
              {
                backgroundColor: item.isOnline ? '#10b981' : '#94a3b8',
              },
            ]}
          />
          {item.isFavorite && (
            <View style={styles.favoriteIndicator}>
              <Star size={10} color="#f59e0b" fill="#f59e0b" />
            </View>
          )}
        </View>
        <View style={styles.contactInfo}>
          <Text style={styles.contactName}>{item.name}</Text>
          <Text style={styles.contactStatus}>
            {item.isOnline ? 'En línea' : item.lastSeen ? `Visto ${new Date(item.lastSeen).toLocaleDateString()}` : 'Desconectado'}
          </Text>
          {(item.email || item.phone) && (
            <Text style={styles.contactDetail}>
              {item.email || item.phone}
            </Text>
          )}
        </View>
      </TouchableOpacity>
      
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleToggleFavorite(item.id)}
        >
          <Star 
            size={18} 
            color={item.isFavorite ? '#f59e0b' : '#cbd5e1'} 
            fill={item.isFavorite ? '#f59e0b' : 'none'}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleContactAction(item, 'chat')}
        >
          <MessageCircle color="#2563eb" size={18} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleContactAction(item, 'send_money')}
        >
          <SendIcon color="#10b981" size={18} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.headerTitle}>Contactos</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={() => Alert.alert('Escanear QR', 'Escanea el código QR de un contacto para agregarlo')}
            >
              <QrCode color="#2563eb" size={20} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={() => setShowAddModal(true)}
            >
              <UserPlus color="#2563eb" size={20} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => router.back()}
            >
              <X color="#1e293b" size={24} />
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.searchBar}>
          <Search color="#64748b" size={20} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar contactos..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#94a3b8"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <X color="#94a3b8" size={18} />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'all' && styles.tabActive]}
            onPress={() => setActiveTab('all')}
          >
            <Users size={16} color={activeTab === 'all' ? '#2563eb' : '#64748b'} />
            <Text style={[styles.tabText, activeTab === 'all' && styles.tabTextActive]}>
              Todos ({enrichedContacts.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'favorites' && styles.tabActive]}
            onPress={() => setActiveTab('favorites')}
          >
            <Star size={16} color={activeTab === 'favorites' ? '#2563eb' : '#64748b'} />
            <Text style={[styles.tabText, activeTab === 'favorites' && styles.tabTextActive]}>
              Favoritos ({enrichedContacts.filter(c => c.isFavorite).length})
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={filteredContacts}
        renderItem={renderContact}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.contactsList}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <UserPlus size={48} color="#cbd5e1" />
            <Text style={styles.emptyText}>
              {activeTab === 'favorites' 
                ? 'No tienes contactos favoritos' 
                : searchQuery 
                  ? 'No se encontraron contactos' 
                  : 'No tienes contactos'}
            </Text>
            {!searchQuery && activeTab === 'all' && (
              <TouchableOpacity 
                style={styles.emptyButton}
                onPress={() => setShowAddModal(true)}
              >
                <Text style={styles.emptyButtonText}>Agregar primer contacto</Text>
              </TouchableOpacity>
            )}
          </View>
        }
      />
      
      <AddContactModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddContact}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    padding: 4,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1e293b',
  },
  tabs: {
    flexDirection: 'row',
    gap: 8,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    gap: 6,
  },
  tabActive: {
    backgroundColor: '#eff6ff',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748b',
  },
  tabTextActive: {
    color: '#2563eb',
    fontWeight: '600',
  },
  contactsList: {
    padding: 20,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  contactMainInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  favoriteIndicator: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f59e0b',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  statusDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 2,
  },
  contactStatus: {
    fontSize: 13,
    color: '#64748b',
    marginBottom: 2,
  },
  contactDetail: {
    fontSize: 12,
    color: '#94a3b8',
  },
  actions: {
    flexDirection: 'row',
    gap: 6,
  },
  actionButton: {
    padding: 8,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    gap: 12,
  },
  emptyText: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
  },
  emptyButton: {
    marginTop: 8,
    backgroundColor: '#2563eb',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  modalContent: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  modalButton: {
    padding: 4,
  },
  modalCancel: {
    fontSize: 16,
    color: '#64748b',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
  },
  modalSave: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2563eb',
  },
  modalBody: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  modalDescription: {
    fontSize: 16,
    color: '#64748b',
    lineHeight: 24,
    marginBottom: 24,
    textAlign: 'center',
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
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1e293b',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  inputNote: {
    fontSize: 14,
    color: '#64748b',
    fontStyle: 'italic',
    marginTop: 8,
  },
});
