import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  KeyboardAvoidingView,
  Platform,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, router } from 'expo-router';
import { ArrowLeft, Send, Paperclip, Mic, MoreVertical, Phone, Video } from 'lucide-react-native';
import { useChat } from '@/hooks/use-chat';
import { Message } from '@/types/chat';
import NodoXLogo from '@/components/NodoXLogo';

const formatMessageTime = (date: Date): string => {
  return date.toLocaleTimeString('es-ES', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: false 
  });
};

const MessageBubble = ({ message, isOwn }: { message: Message; isOwn: boolean }) => {
  return (
    <View style={[styles.messageContainer, isOwn ? styles.ownMessage : styles.otherMessage]}>
      <View style={[styles.messageBubble, isOwn ? styles.ownBubble : styles.otherBubble]}>
        <Text style={[styles.messageText, isOwn ? styles.ownText : styles.otherText]}>
          {message.content}
        </Text>
        <Text style={[styles.messageTime, isOwn ? styles.ownTime : styles.otherTime]}>
          {formatMessageTime(message.timestamp)}
        </Text>
      </View>
    </View>
  );
};

export default function ConversationScreen() {
  const { 
    activeChat, 
    getChatMessages, 
    getChatName, 
    getChatParticipants, 
    sendMessage, 
    markAsRead,
    chats,
    currentUserId 
  } = useChat();
  
  const [inputText, setInputText] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const flatListRef = useRef<FlatList>(null);
  const inputHeight = useRef(new Animated.Value(40)).current;

  const currentChat = chats.find(chat => chat.id === activeChat);
  const messages = activeChat ? getChatMessages(activeChat) : [];
  const chatName = currentChat ? getChatName(currentChat) : '';
  const participants = currentChat ? getChatParticipants(currentChat) : [];
  const avatar = participants[0]?.avatar;
  const isOnline = participants.some(p => p.isOnline);

  useEffect(() => {
    if (activeChat) {
      markAsRead(activeChat);
    }
  }, [activeChat, markAsRead]);

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages.length]);

  const handleSend = async () => {
    if (!inputText.trim() || !activeChat) return;

    const messageText = inputText.trim();
    setInputText('');
    setIsTyping(false);
    
    Animated.timing(inputHeight, {
      toValue: 40,
      duration: 200,
      useNativeDriver: false,
    }).start();

    await sendMessage(activeChat, messageText);
  };

  const handleInputChange = (text: string) => {
    setInputText(text);
    setIsTyping(text.length > 0);
    
    const lines = text.split('\n').length;
    const newHeight = Math.min(Math.max(40, lines * 20), 100);
    
    Animated.timing(inputHeight, {
      toValue: newHeight,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  if (!activeChat || !currentChat) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Selecciona una conversación</Text>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>Volver a chats</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen 
        options={{
          headerShown: true,
          headerStyle: { backgroundColor: '#ffffff' },
          headerShadowVisible: true,
          headerTitle: () => (
            <TouchableOpacity style={styles.headerContent}>
              <NodoXLogo size="small" showText={false} style={styles.headerLogo} />
              <View style={styles.headerInfo}>
                {avatar ? (
                  <Image source={{ uri: avatar }} style={styles.headerAvatar} />
                ) : (
                  <View style={[styles.headerAvatar, styles.headerAvatarPlaceholder]}>
                    <Text style={styles.headerAvatarText}>
                      {chatName.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                )}
                <View style={styles.headerText}>
                  <Text style={styles.headerName}>{chatName}</Text>
                  <Text style={styles.headerStatus}>
                    {isOnline ? 'En línea' : 'Desconectado'}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
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
            <View style={styles.headerActions}>
              <TouchableOpacity style={styles.headerAction}>
                <Phone size={20} color="#64748b" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.headerAction}>
                <Video size={20} color="#64748b" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.headerAction}>
                <MoreVertical size={20} color="#64748b" />
              </TouchableOpacity>
            </View>
          ),
        }}
      />

      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <MessageBubble 
              message={item} 
              isOwn={item.senderId === currentUserId} 
            />
          )}
          style={styles.messagesList}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => {
            flatListRef.current?.scrollToEnd({ animated: true });
          }}
        />

        <View style={styles.inputContainer}>
          <TouchableOpacity style={styles.attachButton}>
            <Paperclip size={22} color="#64748b" />
          </TouchableOpacity>
          
          <Animated.View style={[styles.textInputContainer, { height: inputHeight }]}>
            <TextInput
              style={styles.textInput}
              value={inputText}
              onChangeText={handleInputChange}
              placeholder="Escribe un mensaje..."
              placeholderTextColor="#94a3b8"
              multiline
              maxLength={1000}
            />
          </Animated.View>

          {inputText.trim() ? (
            <TouchableOpacity 
              style={styles.sendButton}
              onPress={handleSend}
            >
              <Send size={18} color="#ffffff" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.micButton}>
              <Mic size={22} color="#64748b" />
            </TouchableOpacity>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    color: '#64748b',
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 8,
  },
  headerLogo: {
    marginRight: 4,
  },
  headerBack: {
    marginRight: 8,
  },
  headerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 12,
  },
  headerAvatarPlaceholder: {
    backgroundColor: '#e2e8f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerAvatarText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748b',
  },
  headerText: {
    flex: 1,
  },
  headerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  headerStatus: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 1,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerAction: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  messageContainer: {
    marginVertical: 2,
  },
  ownMessage: {
    alignItems: 'flex-end',
  },
  otherMessage: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    marginVertical: 2,
  },
  ownBubble: {
    backgroundColor: '#2563eb',
    borderBottomRightRadius: 6,
  },
  otherBubble: {
    backgroundColor: '#ffffff',
    borderBottomLeftRadius: 6,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 4,
  },
  ownText: {
    color: '#ffffff',
  },
  otherText: {
    color: '#1e293b',
  },
  messageTime: {
    fontSize: 11,
    alignSelf: 'flex-end',
  },
  ownTime: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  otherTime: {
    color: '#94a3b8',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  attachButton: {
    marginRight: 12,
    marginBottom: 10,
  },
  textInputContainer: {
    flex: 1,
    backgroundColor: '#f1f5f9',
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 12,
    justifyContent: 'center',
  },
  textInput: {
    fontSize: 16,
    color: '#1e293b',
    maxHeight: 100,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2563eb',
    justifyContent: 'center',
    alignItems: 'center',
  },
  micButton: {
    marginBottom: 10,
  },
});