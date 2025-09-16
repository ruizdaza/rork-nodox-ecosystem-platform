import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  FlatList,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { ArrowLeft, Send, User, Mail, Phone, UserPlus, Check, X } from "lucide-react-native";
import { useNodoX } from "@/hooks/use-nodox-store";
import { useChat } from "@/hooks/use-chat";
import { Contact } from "@/types/chat";
import NodoXLogo from "@/components/NodoXLogo";

type RecipientData = {
  name: string;
  email?: string;
  phone?: string;
  isContact: boolean;
  contactId?: string;
};

const ContactSuggestionItem = ({ 
  contact, 
  onSelect 
}: { 
  contact: Contact; 
  onSelect: (contact: Contact) => void;
}) => {
  return (
    <TouchableOpacity 
      style={styles.suggestionItem} 
      onPress={() => onSelect(contact)}
    >
      <View style={styles.suggestionAvatar}>
        <Text style={styles.suggestionAvatarText}>
          {contact.name.charAt(0).toUpperCase()}
        </Text>
      </View>
      <View style={styles.suggestionInfo}>
        <Text style={styles.suggestionName}>{contact.name}</Text>
        <Text style={styles.suggestionDetail}>
          {contact.email || contact.phone || 'Sin información de contacto'}
        </Text>
      </View>
      <Check size={16} color="#2563eb" />
    </TouchableOpacity>
  );
};

const AddRecipientModal = ({
  visible,
  onClose,
  onAdd,
  searchQuery
}: {
  visible: boolean;
  onClose: () => void;
  onAdd: (recipient: RecipientData) => void;
  searchQuery: string;
}) => {
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [contactMethod, setContactMethod] = useState<'email' | 'phone'>('email');

  React.useEffect(() => {
    if (visible) {
      // Auto-fill if search query looks like email or phone
      if (searchQuery.includes('@')) {
        setEmail(searchQuery);
        setContactMethod('email');
      } else if (searchQuery.match(/^[+]?[0-9\s-()]+$/)) {
        setPhone(searchQuery);
        setContactMethod('phone');
      }
    }
  }, [visible, searchQuery]);

  const handleAdd = () => {
    if (!name.trim()) {
      Alert.alert('Error', 'El nombre es requerido');
      return;
    }

    const contactInfo = contactMethod === 'email' ? email.trim() : phone.trim();
    if (!contactInfo) {
      Alert.alert('Error', `El ${contactMethod === 'email' ? 'email' : 'teléfono'} es requerido`);
      return;
    }

    if (contactMethod === 'email' && !contactInfo.includes('@')) {
      Alert.alert('Error', 'Por favor ingresa un email válido');
      return;
    }

    onAdd({
      name: name.trim(),
      email: contactMethod === 'email' ? contactInfo : undefined,
      phone: contactMethod === 'phone' ? contactInfo : undefined,
      isContact: false
    });

    resetForm();
    onClose();
  };

  const resetForm = () => {
    setName('');
    setEmail('');
    setPhone('');
    setContactMethod('email');
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
          <Text style={styles.modalTitle}>Nuevo Destinatario</Text>
          <TouchableOpacity onPress={handleAdd}>
            <Text style={styles.modalSave}>Agregar</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.modalContent}>
          <Text style={styles.modalDescription}>
            Agrega la información del destinatario para poder enviarle dinero
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
            <Text style={styles.inputLabel}>Método de contacto *</Text>
            <View style={styles.contactMethodSelector}>
              <TouchableOpacity
                style={[
                  styles.methodButton,
                  contactMethod === 'email' && styles.methodButtonActive
                ]}
                onPress={() => setContactMethod('email')}
              >
                <Mail size={16} color={contactMethod === 'email' ? '#ffffff' : '#64748b'} />
                <Text style={[
                  styles.methodButtonText,
                  contactMethod === 'email' && styles.methodButtonTextActive
                ]}>Email</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.methodButton,
                  contactMethod === 'phone' && styles.methodButtonActive
                ]}
                onPress={() => setContactMethod('phone')}
              >
                <Phone size={16} color={contactMethod === 'phone' ? '#ffffff' : '#64748b'} />
                <Text style={[
                  styles.methodButtonText,
                  contactMethod === 'phone' && styles.methodButtonTextActive
                ]}>Teléfono</Text>
              </TouchableOpacity>
            </View>
          </View>

          {contactMethod === 'email' ? (
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email *</Text>
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
          ) : (
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Teléfono *</Text>
              <TextInput
                style={styles.textInput}
                value={phone}
                onChangeText={setPhone}
                placeholder="+57 300 123 4567"
                placeholderTextColor="#94a3b8"
                keyboardType="phone-pad"
              />
            </View>
          )}

          <Text style={styles.inputNote}>
            * Campos requeridos. Esta información se usará para enviar el dinero.
          </Text>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

export default function SendScreen() {
  const { ncopBalance, copBalance, sendNCOP, sendCOP } = useNodoX();
  const { contacts } = useChat();
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedRecipient, setSelectedRecipient] = useState<RecipientData | null>(null);
  const [amount, setAmount] = useState<string>("");
  const [currency, setCurrency] = useState<"NCOP" | "COP">("NCOP");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);

  // Filter contacts based on search query
  const filteredContacts = useMemo(() => {
    if (!searchQuery.trim()) return [];
    
    return contacts.filter(contact => 
      contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.phone?.includes(searchQuery)
    ).slice(0, 5); // Limit to 5 suggestions
  }, [contacts, searchQuery]);

  const handleContactSelect = (contact: Contact) => {
    setSelectedRecipient({
      name: contact.name,
      email: contact.email,
      phone: contact.phone,
      isContact: true,
      contactId: contact.id
    });
    setSearchQuery('');
    setShowSuggestions(false);
  };

  const handleAddRecipient = (recipient: RecipientData) => {
    setSelectedRecipient(recipient);
    setSearchQuery('');
    setShowSuggestions(false);
  };

  const handleSearchChange = (text: string) => {
    setSearchQuery(text);
    setShowSuggestions(text.length > 0);
    if (text.length === 0) {
      setSelectedRecipient(null);
    }
  };

  const clearRecipient = () => {
    setSelectedRecipient(null);
    setSearchQuery('');
    setShowSuggestions(false);
  };

  const handleSend = async () => {
    if (!selectedRecipient) {
      Alert.alert("Error", "Por favor selecciona un destinatario");
      return;
    }

    if (!amount.trim() || isNaN(Number(amount)) || Number(amount) <= 0) {
      Alert.alert("Error", "Por favor ingresa un monto válido");
      return;
    }

    const numAmount = Number(amount);
    const availableBalance = currency === "NCOP" ? ncopBalance : copBalance;

    if (numAmount > availableBalance) {
      Alert.alert("Error", `Saldo insuficiente. Tienes ${availableBalance} ${currency} disponibles`);
      return;
    }

    const recipientIdentifier = selectedRecipient.email || selectedRecipient.phone || '';
    if (!recipientIdentifier) {
      Alert.alert("Error", "El destinatario debe tener email o teléfono");
      return;
    }

    setIsLoading(true);

    try {
      if (currency === "NCOP") {
        await sendNCOP(recipientIdentifier, numAmount);
      } else {
        await sendCOP(recipientIdentifier, numAmount);
      }

      Alert.alert(
        "Envío exitoso", 
        `Has enviado ${numAmount} ${currency} a ${selectedRecipient.name}`,
        [{ text: "OK", onPress: () => router.back() }]
      );
    } catch {
      Alert.alert("Error", "No se pudo completar el envío. Intenta nuevamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.content}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft color="#1e293b" size={24} />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <NodoXLogo size="small" showText={false} />
            <Text style={styles.headerTitle}>Enviar dinero</Text>
          </View>
          <View style={styles.placeholder} />
        </View>

        {/* Balance Display */}
        <View style={styles.balanceSection}>
          <Text style={styles.balanceLabel}>Saldos disponibles</Text>
          <View style={styles.balanceRow}>
            <View style={styles.balanceItem}>
              <Text style={styles.balanceAmount}>{ncopBalance.toLocaleString()}</Text>
              <Text style={styles.balanceCurrency}>NCOP</Text>
            </View>
            <View style={styles.balanceItem}>
              <Text style={styles.balanceAmount}>${copBalance.toLocaleString()}</Text>
              <Text style={styles.balanceCurrency}>COP</Text>
            </View>
          </View>
        </View>

        {/* Currency Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tipo de moneda</Text>
          <View style={styles.currencySelector}>
            <TouchableOpacity
              style={[
                styles.currencyButton,
                currency === "NCOP" && styles.currencyButtonActive
              ]}
              onPress={() => setCurrency("NCOP")}
            >
              <Text style={[
                styles.currencyButtonText,
                currency === "NCOP" && styles.currencyButtonTextActive
              ]}>NCOP</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.currencyButton,
                currency === "COP" && styles.currencyButtonActive
              ]}
              onPress={() => setCurrency("COP")}
            >
              <Text style={[
                styles.currencyButtonText,
                currency === "COP" && styles.currencyButtonTextActive
              ]}>COP</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recipient Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Destinatario</Text>
          
          {selectedRecipient ? (
            <View style={styles.selectedRecipientContainer}>
              <View style={styles.selectedRecipient}>
                <View style={styles.recipientAvatar}>
                  <Text style={styles.recipientAvatarText}>
                    {selectedRecipient.name.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View style={styles.recipientInfo}>
                  <Text style={styles.recipientName}>{selectedRecipient.name}</Text>
                  <Text style={styles.recipientDetail}>
                    {selectedRecipient.email || selectedRecipient.phone}
                  </Text>
                  {selectedRecipient.isContact && (
                    <Text style={styles.recipientBadge}>En tus contactos</Text>
                  )}
                </View>
                <TouchableOpacity 
                  style={styles.clearRecipientButton}
                  onPress={clearRecipient}
                >
                  <X size={20} color="#64748b" />
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={styles.recipientSearchContainer}>
              <View style={styles.inputContainer}>
                <User color="#64748b" size={20} />
                <TextInput
                  style={styles.input}
                  placeholder="Buscar contacto o agregar nuevo..."
                  value={searchQuery}
                  onChangeText={handleSearchChange}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
              
              {showSuggestions && (
                <View style={styles.suggestionsContainer}>
                  {filteredContacts.length > 0 ? (
                    <FlatList
                      data={filteredContacts}
                      keyExtractor={(item) => item.id}
                      renderItem={({ item }) => (
                        <ContactSuggestionItem
                          contact={item}
                          onSelect={handleContactSelect}
                        />
                      )}
                      style={styles.suggestionsList}
                      keyboardShouldPersistTaps="handled"
                    />
                  ) : searchQuery.length > 2 ? (
                    <TouchableOpacity 
                      style={styles.addNewRecipient}
                      onPress={() => setShowAddModal(true)}
                    >
                      <UserPlus size={20} color="#2563eb" />
                      <View style={styles.addNewRecipientText}>
                        <Text style={styles.addNewRecipientTitle}>
                          Agregar &quot;{searchQuery}&quot; como nuevo destinatario
                        </Text>
                        <Text style={styles.addNewRecipientSubtitle}>
                          No encontrado en tus contactos
                        </Text>
                      </View>
                    </TouchableOpacity>
                  ) : (
                    <View style={styles.searchHint}>
                      <Text style={styles.searchHintText}>
                        Escribe al menos 3 caracteres para buscar contactos
                      </Text>
                    </View>
                  )}
                </View>
              )}
            </View>
          )}
        </View>

        {/* Amount Input */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Monto a enviar</Text>
          <View style={styles.inputContainer}>
            <Text style={styles.currencySymbol}>{currency}</Text>
            <TextInput
              style={styles.input}
              placeholder="0"
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
            />
          </View>
          <Text style={styles.availableBalance}>
            Disponible: {currency === "NCOP" ? ncopBalance.toLocaleString() : `$${copBalance.toLocaleString()}`} {currency}
          </Text>
        </View>

        {/* Send Button */}
        <TouchableOpacity
          style={[
            styles.sendButton,
            (!selectedRecipient || !amount.trim() || isLoading) && styles.sendButtonDisabled
          ]}
          onPress={handleSend}
          disabled={!selectedRecipient || !amount.trim() || isLoading}
        >
          <Send color="#ffffff" size={20} />
          <Text style={styles.sendButtonText}>
            {isLoading ? "Enviando..." : "Enviar dinero"}
          </Text>
        </TouchableOpacity>
        
        <AddRecipientModal
          visible={showAddModal}
          onClose={() => setShowAddModal(false)}
          onAdd={handleAddRecipient}
          searchQuery={searchQuery}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  backButton: {
    padding: 4,
  },
  headerCenter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1e293b",
  },
  placeholder: {
    width: 32,
  },
  balanceSection: {
    backgroundColor: "#ffffff",
    margin: 20,
    padding: 20,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  balanceLabel: {
    fontSize: 14,
    color: "#64748b",
    marginBottom: 12,
    fontWeight: "500",
  },
  balanceRow: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  balanceItem: {
    alignItems: "center",
  },
  balanceAmount: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1e293b",
  },
  balanceCurrency: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 4,
  },
  section: {
    marginHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 12,
  },
  currencySelector: {
    flexDirection: "row",
    backgroundColor: "#f1f5f9",
    borderRadius: 8,
    padding: 4,
  },
  currencyButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 6,
  },
  currencyButtonActive: {
    backgroundColor: "#2563eb",
  },
  currencyButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#64748b",
  },
  currencyButtonTextActive: {
    color: "#ffffff",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#1e293b",
  },
  currencySymbol: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2563eb",
  },
  availableBalance: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 8,
    textAlign: "right",
  },
  sendButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2563eb",
    marginHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    marginTop: "auto",
    marginBottom: 20,
  },
  sendButtonDisabled: {
    backgroundColor: "#94a3b8",
  },
  sendButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ffffff",
  },
  recipientSearchContainer: {
    position: 'relative',
  },
  selectedRecipientContainer: {
    marginBottom: 8,
  },
  selectedRecipient: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#2563eb',
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  recipientAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2563eb',
    justifyContent: 'center',
    alignItems: 'center',
  },
  recipientAvatarText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  recipientInfo: {
    flex: 1,
  },
  recipientName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 2,
  },
  recipientDetail: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 4,
  },
  recipientBadge: {
    fontSize: 12,
    color: '#2563eb',
    fontWeight: '500',
  },
  clearRecipientButton: {
    padding: 4,
  },
  suggestionsContainer: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    zIndex: 1000,
    maxHeight: 300,
  },
  suggestionsList: {
    maxHeight: 250,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    gap: 12,
  },
  suggestionAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#e2e8f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  suggestionAvatarText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
  },
  suggestionInfo: {
    flex: 1,
  },
  suggestionName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 2,
  },
  suggestionDetail: {
    fontSize: 12,
    color: '#64748b',
  },
  addNewRecipient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  addNewRecipientText: {
    flex: 1,
  },
  addNewRecipientTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2563eb',
    marginBottom: 2,
  },
  addNewRecipientSubtitle: {
    fontSize: 12,
    color: '#64748b',
  },
  searchHint: {
    padding: 16,
    alignItems: 'center',
  },
  searchHintText: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
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
  contactMethodSelector: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    padding: 4,
    gap: 4,
  },
  methodButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 6,
    gap: 8,
  },
  methodButtonActive: {
    backgroundColor: '#2563eb',
  },
  methodButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
  },
  methodButtonTextActive: {
    color: '#ffffff',
  },
});