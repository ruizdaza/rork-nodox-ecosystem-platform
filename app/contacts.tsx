import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  TextInput,
  Modal,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, router } from 'expo-router';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { 
  ArrowLeft, 
  Search, 
  Plus, 
  MessageCircle,
  Star,
  UserPlus,
  Users,
  QrCode,
  X
} from 'lucide-react-native';
import { useChat } from '@/hooks/use-chat';
import { Contact } from '@/types/chat';
import NodoXLogo from '@/components/NodoXLogo';

const ContactItem = ({ 
  contact, 
  onPress, 
  onStartChat, 
  onToggleFavorite 
}: { 
  contact: Contact; 
  onPress: () => void;
  onStartChat: () => void;
  onToggleFavorite: () => void;
}) => {
  return (
    <TouchableOpacity style={styles.contactItem} onPress={onPress}>
      <View style={styles.contactInfo}>
        {contact.avatar ? (
          <Image source={{ uri: contact.avatar }} style={styles.contactAvatar} />
        ) : (
          <View style={[styles.contactAvatar, styles.contactAvatarPlaceholder]}>
            <Text style={styles.contactAvatarText}>
              {contact.name.charAt(0).toUpperCase()}
            </Text>
          </View>
        )}
        
        <View style={styles.contactDetails}>
          <View style={styles.contactHeader}>
            <Text style={styles.contactName}>{contact.name}</Text>
            <View style={styles.contactStatus}>
              <View style={[
                styles.statusDot, 
                { backgroundColor: contact.isOnline ? '#10b981' : '#94a3b8' }
              ]} />
              <Text style={styles.statusText}>
                {contact.isOnline ? 'En línea' : 'Desconectado'}
              </Text>
            </View>
          </View>
          
          {contact.phone && (
            <Text style={styles.contactPhone}>{contact.phone}</Text>
          )}
          {contact.email && (
            <Text style={styles.contactEmail}>{contact.email}</Text>
          )}
        </View>
      </View>
      
      <View style={styles.contactActions}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={onToggleFavorite}
        >
          <Star 
            size={18} 
            color={contact.isFavorite ? '#fbbf24' : '#94a3b8'}
            fill={contact.isFavorite ? '#fbbf24' : 'transparent'}
          />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={onStartChat}
        >
          <MessageCircle size={18} color="#2563eb" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const QRScannerModal = ({
  visible,
  onClose,
  onScan
}: {
  visible: boolean;
  onClose: () => void;
  onScan: (data: string) => void;
}) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [isScanning, setIsScanning] = useState<boolean>(true);

  const handleBarCodeScanned = ({ data }: { data: string }) => {
    if (!isScanning) return;
    
    setIsScanning(false);
    onScan(data);
    onClose();
  };

  if (!permission) {
    return null;
  }

  if (!permission.granted) {
    return (
      <Modal
        visible={visible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={onClose}
      >
        <SafeAreaView style={styles.qrModalContainer}>
          <View style={styles.qrHeader}>
            <TouchableOpacity onPress={onClose}>
              <X size={24} color="#1e293b" />
            </TouchableOpacity>
            <Text style={styles.qrTitle}>Escanear QR</Text>
            <View style={styles.spacer} />
          </View>
          
          <View style={styles.permissionContainer}>
            <QrCode size={64} color="#cbd5e1" />
            <Text style={styles.permissionTitle}>Permiso de Cámara Requerido</Text>
            <Text style={styles.permissionText}>
              Necesitamos acceso a tu cámara para escanear códigos QR
            </Text>
            <TouchableOpacity 
              style={styles.permissionButton}
              onPress={requestPermission}
            >
              <Text style={styles.permissionButtonText}>Permitir Cámara</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
    );
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <View style={styles.qrModalContainer}>
        <SafeAreaView style={styles.qrHeader}>
          <TouchableOpacity onPress={onClose} style={styles.qrCloseButton}>
            <X size={24} color="#ffffff" />
          </TouchableOpacity>
          <Text style={styles.qrTitleWhite}>Escanear Código QR</Text>
          <View style={styles.spacer} />
        </SafeAreaView>
        
        {Platform.OS !== 'web' ? (
          <CameraView
            style={styles.camera}
            facing="back"
            onBarcodeScanned={isScanning ? handleBarCodeScanned : undefined}
          >
            <View style={styles.qrOverlay}>
              <View style={styles.qrFrame} />
              <Text style={styles.qrInstructions}>
                Apunta la cámara hacia el código QR del contacto
              </Text>
            </View>
          </CameraView>
        ) : (
          <View style={styles.webFallback}>
            <QrCode size={64} color="#cbd5e1" />
            <Text style={styles.webFallbackTitle}>Escáner QR no disponible en web</Text>
            <Text style={styles.webFallbackText}>
              Esta función solo está disponible en dispositivos móviles
            </Text>
          </View>
        )}
      </View>
    </Modal>
  );
};

const AddContactModal = ({ 
  visible, 
  onClose, 
  onAdd 
}: { 
  visible: boolean; 
  onClose: () => void;
  onAdd: (contact: Omit<Contact, 'id' | 'userId' | 'addedAt' | 'isOnline' | 'lastSeen'>) => void;
}) => {
  const [name, setName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [showQRScanner, setShowQRScanner] = useState<boolean>(false);

  const handleAdd = () => {
    if (!name.trim()) {
      Alert.alert('Error', 'El nombre es requerido');
      return;
    }

    if (!phone.trim() && !email.trim()) {
      Alert.alert('Error', 'Debes proporcionar al menos un teléfono o email');
      return;
    }

    onAdd({
      name: name.trim(),
      phone: phone.trim() || undefined,
      email: email.trim() || undefined,
      isFavorite: false,
    });

    resetForm();
    onClose();
  };

  const resetForm = () => {
    setName('');
    setPhone('');
    setEmail('');
  };

  const handleQRScan = (data: string) => {
    try {
      const contactData = JSON.parse(data);
      
      if (contactData.name) setName(contactData.name);
      if (contactData.phone) setPhone(contactData.phone);
      if (contactData.email) setEmail(contactData.email);
      
      Alert.alert('Éxito', 'Datos del contacto cargados desde QR');
    } catch {
      if (data.includes('@')) {
        setEmail(data);
        Alert.alert('Éxito', 'Email cargado desde QR');
      } else if (data.match(/^[+]?[0-9\s-()]+$/)) {
        setPhone(data);
        Alert.alert('Éxito', 'Teléfono cargado desde QR');
      } else {
        Alert.alert('Error', 'El código QR no contiene información de contacto válida');
      }
    }
  };

  const handleClose = () => {
    resetForm();
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
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={handleClose}>
            <Text style={styles.modalCancel}>Cancelar</Text>
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Agregar Contacto</Text>
          <TouchableOpacity onPress={handleAdd}>
            <Text style={styles.modalSave}>Guardar</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.modalContent}>
          <View style={styles.qrScanSection}>
            <TouchableOpacity 
              style={styles.qrScanButton}
              onPress={() => setShowQRScanner(true)}
            >
              <QrCode size={24} color="#2563eb" />
              <Text style={styles.qrScanButtonText}>Escanear Código QR</Text>
            </TouchableOpacity>
            <Text style={styles.qrScanNote}>
              Escanea el código QR del contacto para llenar automáticamente los datos
            </Text>
          </View>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>o ingresa manualmente</Text>
            <View style={styles.dividerLine} />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Nombre *</Text>
            <TextInput
              style={styles.textInput}
              value={name}
              onChangeText={setName}
              placeholder="Nombre completo"
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
            />
          </View>

          <Text style={styles.inputNote}>
            * Campos requeridos. Debes proporcionar al menos un teléfono o email.
          </Text>
        </View>

        <QRScannerModal
          visible={showQRScanner}
          onClose={() => setShowQRScanner(false)}
          onScan={handleQRScan}
        />
      </SafeAreaView>
    </Modal>
  );
};

export default function ContactsScreen() {
  const { contacts, addContact, toggleFavoriteContact, startChatWithContact } = useChat();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [selectedTab, setSelectedTab] = useState<'all' | 'favorites'>('all');

  const filteredContacts = contacts.filter((contact: Contact) => {
    const matchesSearch = contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         contact.phone?.includes(searchQuery) ||
                         contact.email?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesTab = selectedTab === 'all' || 
                      (selectedTab === 'favorites' && contact.isFavorite);
    
    return matchesSearch && matchesTab;
  });

  const handleStartChat = async (contact: Contact) => {
    try {
      await startChatWithContact(contact.userId);
      router.push('/conversation');
    } catch {
      console.log('Error al iniciar conversación');
    }
  };

  const handleAddContact = async (contactData: Omit<Contact, 'id' | 'userId' | 'addedAt' | 'isOnline' | 'lastSeen'>) => {
    if (!contactData.name.trim()) return;
    if (!contactData.phone?.trim() && !contactData.email?.trim()) return;
    
    try {
      await addContact(contactData);
      console.log('Contacto agregado correctamente');
    } catch {
      console.log('Error al agregar contacto');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen 
        options={{
          headerShown: true,
          headerStyle: { backgroundColor: '#ffffff' },
          headerShadowVisible: true,
          headerTitle: () => (
            <View style={styles.headerTitle}>
              <NodoXLogo size="small" showText={false} style={styles.headerLogo} />
              <Text style={styles.headerTitleText}>Contactos</Text>
            </View>
          ),
          headerLeft: () => (
            <TouchableOpacity 
              style={styles.headerBack}
              onPress={() => router.back()}
            >
              <ArrowLeft size={24} color="#1e293b" />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity 
              style={styles.headerAdd}
              onPress={() => setShowAddModal(true)}
            >
              <UserPlus size={24} color="#2563eb" />
            </TouchableOpacity>
          ),
        }}
      />

      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Search size={20} color="#94a3b8" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Buscar contactos..."
            placeholderTextColor="#94a3b8"
          />
        </View>
      </View>

      <View style={styles.tabsContainer}>
        <TouchableOpacity 
          style={[styles.tab, selectedTab === 'all' && styles.activeTab]}
          onPress={() => setSelectedTab('all')}
        >
          <Users size={18} color={selectedTab === 'all' ? '#2563eb' : '#64748b'} />
          <Text style={[styles.tabText, selectedTab === 'all' && styles.activeTabText]}>
            Todos ({contacts.filter((c: Contact) => c).length})
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tab, selectedTab === 'favorites' && styles.activeTab]}
          onPress={() => setSelectedTab('favorites')}
        >
          <Star size={18} color={selectedTab === 'favorites' ? '#2563eb' : '#64748b'} />
          <Text style={[styles.tabText, selectedTab === 'favorites' && styles.activeTabText]}>
            Favoritos ({contacts.filter((c: Contact) => c.isFavorite).length})
          </Text>
        </TouchableOpacity>
      </View>

      {filteredContacts.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Users size={64} color="#cbd5e1" />
          <Text style={styles.emptyTitle}>
            {searchQuery ? 'No se encontraron contactos' : 
             selectedTab === 'favorites' ? 'No tienes contactos favoritos' : 'No tienes contactos'}
          </Text>
          <Text style={styles.emptySubtitle}>
            {searchQuery ? 'Intenta con otros términos de búsqueda' :
             selectedTab === 'favorites' ? 'Marca contactos como favoritos para verlos aquí' :
             'Agrega contactos para poder chatear con ellos'}
          </Text>
          {!searchQuery && selectedTab === 'all' && (
            <TouchableOpacity 
              style={styles.addButton}
              onPress={() => setShowAddModal(true)}
            >
              <Plus size={20} color="#ffffff" />
              <Text style={styles.addButtonText}>Agregar Contacto</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <FlatList
          data={filteredContacts}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ContactItem
              contact={item}
              onPress={() => {}}
              onStartChat={() => handleStartChat(item)}
              onToggleFavorite={() => toggleFavoriteContact(item.id)}
            />
          )}
          style={styles.contactsList}
          contentContainerStyle={styles.contactsContent}
          showsVerticalScrollIndicator={false}
        />
      )}

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
  headerTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerLogo: {
    marginRight: 4,
  },
  headerTitleText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
  },
  headerBack: {
    marginRight: 8,
  },
  headerAdd: {
    marginLeft: 8,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1e293b',
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 6,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#2563eb',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748b',
  },
  activeTabText: {
    color: '#2563eb',
  },
  contactsList: {
    flex: 1,
  },
  contactsContent: {
    paddingVertical: 8,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  contactInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  contactAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  contactAvatarPlaceholder: {
    backgroundColor: '#e2e8f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contactAvatarText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#64748b',
  },
  contactDetails: {
    flex: 1,
  },
  contactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  contactName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    flex: 1,
  },
  contactStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    color: '#64748b',
  },
  contactPhone: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 2,
  },
  contactEmail: {
    fontSize: 14,
    color: '#64748b',
  },
  contactActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1e293b',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2563eb',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  addButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
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
  modalContent: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 24,
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
  qrScanSection: {
    marginBottom: 24,
    alignItems: 'center',
  },
  qrScanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eff6ff',
    borderWidth: 2,
    borderColor: '#2563eb',
    borderStyle: 'dashed',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 12,
    marginBottom: 8,
  },
  qrScanButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2563eb',
  },
  qrScanNote: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 20,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e2e8f0',
  },
  dividerText: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  qrModalContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },
  qrHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  qrCloseButton: {
    padding: 8,
  },
  qrTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
  },
  qrTitleWhite: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
  },
  camera: {
    flex: 1,
  },
  qrOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  qrFrame: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderColor: '#ffffff',
    borderRadius: 12,
    backgroundColor: 'transparent',
  },
  qrInstructions: {
    color: '#ffffff',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 24,
    paddingHorizontal: 32,
    lineHeight: 24,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    backgroundColor: '#ffffff',
  },
  permissionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1e293b',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  permissionText: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  permissionButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  permissionButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  webFallback: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    backgroundColor: '#f8fafc',
  },
  webFallbackTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1e293b',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  webFallbackText: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 24,
  },
  spacer: {
    width: 24,
  },
});