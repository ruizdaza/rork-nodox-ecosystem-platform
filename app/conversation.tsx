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
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, router } from 'expo-router';
import { ArrowLeft, Send, Paperclip, Mic, Play, Pause, MoreVertical, Phone, Video } from 'lucide-react-native';
import { Audio } from 'expo-av';
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

const AudioMessage = ({ message, isOwn }: { message: Message; isOwn: boolean }) => {
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [duration, setDuration] = useState<number>(0);
  const [position, setPosition] = useState<number>(0);

  useEffect(() => {
    return sound
      ? () => {
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  const playPauseAudio = async () => {
    try {
      if (sound) {
        if (isPlaying) {
          await sound.pauseAsync();
          setIsPlaying(false);
        } else {
          await sound.playAsync();
          setIsPlaying(true);
        }
      } else {
        const { sound: newSound } = await Audio.Sound.createAsync(
          { uri: message.content },
          { shouldPlay: true },
          (status) => {
            if (status.isLoaded) {
              setDuration(status.durationMillis || 0);
              setPosition(status.positionMillis || 0);
              setIsPlaying(status.isPlaying);
              if (status.didJustFinish) {
                setIsPlaying(false);
                setPosition(0);
              }
            }
          }
        );
        setSound(newSound);
        setIsPlaying(true);
      }
    } catch (error) {
      console.error('Error playing audio:', error);
      if (Platform.OS !== 'web') {
        Alert.alert('Error', 'No se pudo reproducir el audio');
      }
    }
  };

  const formatDuration = (millis: number) => {
    const seconds = Math.floor(millis / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <View style={[styles.messageContainer, isOwn ? styles.ownMessage : styles.otherMessage]}>
      <View style={[styles.messageBubble, styles.audioBubble, isOwn ? styles.ownBubble : styles.otherBubble]}>
        <TouchableOpacity onPress={playPauseAudio} style={styles.audioPlayButton}>
          {isPlaying ? (
            <Pause size={20} color={isOwn ? '#ffffff' : '#2563eb'} />
          ) : (
            <Play size={20} color={isOwn ? '#ffffff' : '#2563eb'} />
          )}
        </TouchableOpacity>
        
        <View style={styles.audioInfo}>
          <View style={[styles.audioWaveform, isOwn ? styles.ownWaveform : styles.otherWaveform]}>
            {[...Array(20)].map((_, i) => (
              <View
                key={`waveform-${i}`}
                style={[
                  styles.waveformBar,
                  {
                    height: Math.random() * 20 + 8,
                    backgroundColor: isOwn ? 'rgba(255,255,255,0.7)' : 'rgba(37,99,235,0.7)',
                    opacity: (position / duration) > (i / 20) ? 1 : 0.3,
                  },
                ]}
              />
            ))}
          </View>
          <Text style={[styles.audioDuration, isOwn ? styles.ownTime : styles.otherTime]}>
            {formatDuration(position)} / {formatDuration(duration)}
          </Text>
        </View>
        
        <Text style={[styles.messageTime, isOwn ? styles.ownTime : styles.otherTime]}>
          {formatMessageTime(message.timestamp)}
        </Text>
      </View>
    </View>
  );
};

const MessageBubble = ({ message, isOwn }: { message: Message; isOwn: boolean }) => {
  if (message.type === 'audio') {
    return <AudioMessage message={message} isOwn={isOwn} />;
  }

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
  const [, setIsTyping] = useState<boolean>(false);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [recordingDuration, setRecordingDuration] = useState<number>(0);
  const flatListRef = useRef<FlatList>(null);
  const inputHeight = useRef(new Animated.Value(40)).current;
  const recordingTimer = useRef<ReturnType<typeof setInterval> | null>(null);

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
    return () => {
      if (recordingTimer.current) {
        clearInterval(recordingTimer.current);
      }
      if (recording) {
        recording.stopAndUnloadAsync();
      }
    };
  }, [recording]);

  useEffect(() => {
    if (messages.length > 0) {
      const timeout = setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
      return () => clearTimeout(timeout);
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
    if (!text || text.length > 1000) return;
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

  const startRecording = async () => {
    if (Platform.OS === 'web') {
      console.log('Audio recording not supported on web');
      return;
    }

    try {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permisos requeridos', 'Necesitamos acceso al micrófono para grabar mensajes de voz.');
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording: newRecording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      setRecording(newRecording);
      setIsRecording(true);
      setRecordingDuration(0);

      recordingTimer.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000) as ReturnType<typeof setInterval>;

    } catch (error) {
      console.error('Error starting recording:', error);
      Alert.alert('Error', 'No se pudo iniciar la grabación');
    }
  };

  const stopRecording = async () => {
    if (!recording || Platform.OS === 'web') return;

    try {
      setIsRecording(false);
      if (recordingTimer.current) {
        clearInterval(recordingTimer.current);
        recordingTimer.current = null;
      }

      await recording.stopAndUnloadAsync();
      await Audio.setAudioModeAsync({ allowsRecordingIOS: false });
      
      const uri = recording.getURI();
      setRecording(null);
      setRecordingDuration(0);

      if (uri && activeChat) {
        await sendMessage(activeChat, uri, 'audio');
      }
    } catch (error) {
      console.error('Error stopping recording:', error);
      Alert.alert('Error', 'No se pudo detener la grabación');
    }
  };

  const cancelRecording = async () => {
    if (!recording || Platform.OS === 'web') return;

    try {
      setIsRecording(false);
      if (recordingTimer.current) {
        clearInterval(recordingTimer.current);
        recordingTimer.current = null;
      }

      await recording.stopAndUnloadAsync();
      await Audio.setAudioModeAsync({ allowsRecordingIOS: false });
      
      setRecording(null);
      setRecordingDuration(0);
    } catch (error) {
      console.error('Error canceling recording:', error);
    }
  };

  const formatRecordingTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
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
          {isRecording ? (
            <View style={styles.recordingContainer}>
              <TouchableOpacity 
                style={styles.cancelRecordingButton}
                onPress={cancelRecording}
              >
                <Text style={styles.cancelRecordingText}>Cancelar</Text>
              </TouchableOpacity>
              
              <View style={styles.recordingInfo}>
                <View style={styles.recordingIndicator} />
                <Text style={styles.recordingTime}>
                  {formatRecordingTime(recordingDuration)}
                </Text>
              </View>
              
              <TouchableOpacity 
                style={styles.stopRecordingButton}
                onPress={stopRecording}
              >
                <Send size={18} color="#ffffff" />
              </TouchableOpacity>
            </View>
          ) : (
            <>
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
                <TouchableOpacity 
                  style={[styles.micButton, Platform.OS === 'web' && styles.disabledButton]}
                  onPress={Platform.OS === 'web' ? undefined : startRecording}
                  disabled={Platform.OS === 'web'}
                >
                  <Mic size={22} color={Platform.OS === 'web' ? '#cbd5e1' : '#64748b'} />
                </TouchableOpacity>
              )}
            </>
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
  audioBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    minWidth: 200,
  },
  audioPlayButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  audioInfo: {
    flex: 1,
    marginRight: 8,
  },
  audioWaveform: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 24,
    marginBottom: 4,
    gap: 2,
  },
  ownWaveform: {
    opacity: 0.8,
  },
  otherWaveform: {
    opacity: 0.8,
  },
  waveformBar: {
    width: 3,
    borderRadius: 1.5,
    minHeight: 8,
  },
  audioDuration: {
    fontSize: 11,
    marginTop: 2,
  },
  recordingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fee2e2',
    borderRadius: 25,
    flex: 1,
    marginHorizontal: 16,
  },
  cancelRecordingButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  cancelRecordingText: {
    color: '#dc2626',
    fontSize: 14,
    fontWeight: '500',
  },
  recordingInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  recordingIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#dc2626',
  },
  recordingTime: {
    fontSize: 16,
    fontWeight: '600',
    color: '#dc2626',
  },
  stopRecordingButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2563eb',
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.5,
  },
});