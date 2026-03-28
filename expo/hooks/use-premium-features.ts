import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useCallback, useMemo } from 'react';
import { Alert, Platform } from 'react-native';
import { 
  VideoCallSession, 
  ScheduledMessage, 
  FileUpload, 
  PremiumFeatures,
  Message 
} from '@/types/chat';

const STORAGE_KEYS = {
  VIDEO_CALLS: 'nodox_video_calls',
  SCHEDULED_MESSAGES: 'nodox_scheduled_messages',
  FILE_UPLOADS: 'nodox_file_uploads',
  PREMIUM_FEATURES: 'nodox_premium_features',
};

const defaultPremiumFeatures: PremiumFeatures = {
  videoCalls: true,
  largeFileSharing: true,
  scheduledMessages: true,
  advancedAnalytics: true,
  prioritySupport: true,
  customThemes: false,
  messageEncryption: true,
  cloudBackup: false,
};

const mockVideoCallSessions: VideoCallSession[] = [
  {
    id: 'call-1',
    chatId: 'chat-1',
    initiatorId: 'current-user',
    participants: ['current-user', 'user-1'],
    status: 'ended',
    startTime: new Date(Date.now() - 1000 * 60 * 30),
    endTime: new Date(Date.now() - 1000 * 60 * 15),
    duration: 900, // 15 minutes
    quality: 'high',
    recordingEnabled: false,
  },
];

const mockScheduledMessages: ScheduledMessage[] = [
  {
    id: 'scheduled-1',
    chatId: 'chat-2',
    senderId: 'current-user',
    content: 'Recordatorio: Reunión mañana a las 10:00 AM',
    type: 'text',
    scheduledFor: new Date(Date.now() + 1000 * 60 * 60 * 24), // tomorrow
    status: 'pending',
    createdAt: new Date(),
  },
];

const mockFileUploads: FileUpload[] = [];

export const [PremiumFeaturesProvider, usePremiumFeatures] = createContextHook(() => {
  const [activeVideoCall, setActiveVideoCall] = useState<string | undefined>();
  const queryClient = useQueryClient();

  const premiumFeaturesQuery = useQuery({
    queryKey: ['premium-features'],
    queryFn: async (): Promise<PremiumFeatures> => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEYS.PREMIUM_FEATURES);
        return stored ? JSON.parse(stored) : defaultPremiumFeatures;
      } catch {
        return defaultPremiumFeatures;
      }
    },
  });

  const videoCallsQuery = useQuery({
    queryKey: ['video-calls'],
    queryFn: async (): Promise<VideoCallSession[]> => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEYS.VIDEO_CALLS);
        if (stored) {
          const parsed = JSON.parse(stored);
          return parsed.map((call: any) => ({
            ...call,
            startTime: call.startTime ? new Date(call.startTime) : undefined,
            endTime: call.endTime ? new Date(call.endTime) : undefined,
          }));
        }
        return mockVideoCallSessions;
      } catch {
        return mockVideoCallSessions;
      }
    },
  });

  const scheduledMessagesQuery = useQuery({
    queryKey: ['scheduled-messages'],
    queryFn: async (): Promise<ScheduledMessage[]> => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEYS.SCHEDULED_MESSAGES);
        if (stored) {
          const parsed = JSON.parse(stored);
          return parsed.map((msg: any) => ({
            ...msg,
            scheduledFor: new Date(msg.scheduledFor),
            createdAt: new Date(msg.createdAt),
            sentAt: msg.sentAt ? new Date(msg.sentAt) : undefined,
          }));
        }
        return mockScheduledMessages;
      } catch {
        return mockScheduledMessages;
      }
    },
  });

  const fileUploadsQuery = useQuery({
    queryKey: ['file-uploads'],
    queryFn: async (): Promise<FileUpload[]> => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEYS.FILE_UPLOADS);
        if (stored) {
          const parsed = JSON.parse(stored);
          return parsed.map((upload: any) => ({
            ...upload,
            uploadedAt: upload.uploadedAt ? new Date(upload.uploadedAt) : undefined,
            expiresAt: upload.expiresAt ? new Date(upload.expiresAt) : undefined,
          }));
        }
        return mockFileUploads;
      } catch {
        return mockFileUploads;
      }
    },
  });

  const saveVideoCalls = useMutation({
    mutationFn: async (calls: VideoCallSession[]) => {
      await AsyncStorage.setItem(STORAGE_KEYS.VIDEO_CALLS, JSON.stringify(calls));
      return calls;
    },
    onSuccess: (calls) => {
      queryClient.setQueryData(['video-calls'], calls);
    },
  });

  const saveScheduledMessages = useMutation({
    mutationFn: async (messages: ScheduledMessage[]) => {
      await AsyncStorage.setItem(STORAGE_KEYS.SCHEDULED_MESSAGES, JSON.stringify(messages));
      return messages;
    },
    onSuccess: (messages) => {
      queryClient.setQueryData(['scheduled-messages'], messages);
    },
  });

  const saveFileUploads = useMutation({
    mutationFn: async (uploads: FileUpload[]) => {
      await AsyncStorage.setItem(STORAGE_KEYS.FILE_UPLOADS, JSON.stringify(uploads));
      return uploads;
    },
    onSuccess: (uploads) => {
      queryClient.setQueryData(['file-uploads'], uploads);
    },
  });

  const savePremiumFeatures = useMutation({
    mutationFn: async (features: PremiumFeatures) => {
      await AsyncStorage.setItem(STORAGE_KEYS.PREMIUM_FEATURES, JSON.stringify(features));
      return features;
    },
    onSuccess: (features) => {
      queryClient.setQueryData(['premium-features'], features);
    },
  });

  const { mutateAsync: saveVideoCallsAsync } = saveVideoCalls;
  const { mutateAsync: saveScheduledMessagesAsync } = saveScheduledMessages;
  const { mutateAsync: saveFileUploadsAsync } = saveFileUploads;
  const { mutateAsync: savePremiumFeaturesAsync } = savePremiumFeatures;

  // Video Call Functions
  const initiateVideoCall = useCallback(async (chatId: string, participants: string[]): Promise<string> => {
    const features = premiumFeaturesQuery.data || defaultPremiumFeatures;
    
    if (!features.videoCalls) {
      throw new Error('Las videollamadas no están disponibles en tu plan');
    }

    if (Platform.OS === 'web') {
      console.log('Video calls have limited functionality on web');
    }

    const currentCalls = videoCallsQuery.data || [];
    const callId = `call-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const newCall: VideoCallSession = {
      id: callId,
      chatId,
      initiatorId: 'current-user',
      participants: ['current-user', ...participants],
      status: 'pending',
      quality: 'high',
      recordingEnabled: false,
    };

    const updatedCalls = [...currentCalls, newCall];
    await saveVideoCallsAsync(updatedCalls);
    
    setActiveVideoCall(callId);
    console.log('[Premium] Video call initiated:', callId);
    return callId;
  }, [premiumFeaturesQuery.data, videoCallsQuery.data, saveVideoCallsAsync]);

  const answerVideoCall = useCallback(async (callId: string) => {
    const currentCalls = videoCallsQuery.data || [];
    
    const updatedCalls = currentCalls.map(call => 
      call.id === callId 
        ? { ...call, status: 'active' as const, startTime: new Date() }
        : call
    );

    await saveVideoCallsAsync(updatedCalls);
    setActiveVideoCall(callId);
    console.log('[Premium] Video call answered:', callId);
  }, [videoCallsQuery.data, saveVideoCallsAsync]);

  const endVideoCall = useCallback(async (callId: string) => {
    const currentCalls = videoCallsQuery.data || [];
    const call = currentCalls.find(c => c.id === callId);
    
    if (!call) return;

    const endTime = new Date();
    const duration = call.startTime ? Math.floor((endTime.getTime() - call.startTime.getTime()) / 1000) : 0;
    
    const updatedCalls = currentCalls.map(c => 
      c.id === callId 
        ? { ...c, status: 'ended' as const, endTime, duration }
        : c
    );

    await saveVideoCallsAsync(updatedCalls);
    setActiveVideoCall(undefined);
    console.log('[Premium] Video call ended:', callId, 'Duration:', duration, 'seconds');
  }, [videoCallsQuery.data, saveVideoCallsAsync]);

  const declineVideoCall = useCallback(async (callId: string) => {
    const currentCalls = videoCallsQuery.data || [];
    
    const updatedCalls = currentCalls.map(call => 
      call.id === callId 
        ? { ...call, status: 'declined' as const }
        : call
    );

    await saveVideoCallsAsync(updatedCalls);
    console.log('[Premium] Video call declined:', callId);
  }, [videoCallsQuery.data, saveVideoCallsAsync]);

  // Scheduled Messages Functions
  const scheduleMessage = useCallback(async (
    chatId: string, 
    content: string, 
    scheduledFor: Date,
    type: Message['type'] = 'text'
  ): Promise<string> => {
    const features = premiumFeaturesQuery.data || defaultPremiumFeatures;
    
    if (!features.scheduledMessages) {
      throw new Error('Los mensajes programados no están disponibles en tu plan');
    }

    if (scheduledFor <= new Date()) {
      throw new Error('La fecha programada debe ser en el futuro');
    }

    const currentMessages = scheduledMessagesQuery.data || [];
    const messageId = `scheduled-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const newMessage: ScheduledMessage = {
      id: messageId,
      chatId,
      senderId: 'current-user',
      content,
      type,
      scheduledFor,
      status: 'pending',
      createdAt: new Date(),
    };

    const updatedMessages = [...currentMessages, newMessage];
    await saveScheduledMessagesAsync(updatedMessages);
    
    console.log('[Premium] Message scheduled:', messageId, 'for', scheduledFor);
    return messageId;
  }, [premiumFeaturesQuery.data, scheduledMessagesQuery.data, saveScheduledMessagesAsync]);

  const cancelScheduledMessage = useCallback(async (messageId: string) => {
    const currentMessages = scheduledMessagesQuery.data || [];
    
    const updatedMessages = currentMessages.map(msg => 
      msg.id === messageId 
        ? { ...msg, status: 'cancelled' as const }
        : msg
    );

    await saveScheduledMessagesAsync(updatedMessages);
    console.log('[Premium] Scheduled message cancelled:', messageId);
  }, [scheduledMessagesQuery.data, saveScheduledMessagesAsync]);

  const getPendingScheduledMessages = useCallback((chatId?: string): ScheduledMessage[] => {
    const messages = scheduledMessagesQuery.data || [];
    return messages.filter(msg => 
      msg.status === 'pending' && 
      (!chatId || msg.chatId === chatId)
    );
  }, [scheduledMessagesQuery.data]);

  // File Upload Functions
  const uploadLargeFile = useCallback(async (
    messageId: string,
    fileName: string,
    fileSize: number,
    mimeType: string,
    fileUri: string
  ): Promise<string> => {
    const features = premiumFeaturesQuery.data || defaultPremiumFeatures;
    
    if (!features.largeFileSharing) {
      throw new Error('La compartición de archivos grandes no está disponible en tu plan');
    }

    const maxSize = 100 * 1024 * 1024; // 100MB
    if (fileSize > maxSize) {
      throw new Error('El archivo es demasiado grande. Máximo 100MB permitido.');
    }

    const currentUploads = fileUploadsQuery.data || [];
    const uploadId = `upload-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const newUpload: FileUpload = {
      id: uploadId,
      messageId,
      fileName,
      fileSize,
      mimeType,
      uploadProgress: 0,
      uploadStatus: 'pending',
    };

    const updatedUploads = [...currentUploads, newUpload];
    await saveFileUploadsAsync(updatedUploads);

    // Simulate upload progress
    const simulateUpload = async () => {
      for (let progress = 0; progress <= 100; progress += 10) {
        await new Promise(resolve => setTimeout(resolve, 200));
        
        const currentUploads = queryClient.getQueryData<FileUpload[]>(['file-uploads']) || [];
        const updatedUploads = currentUploads.map(upload => 
          upload.id === uploadId 
            ? { 
                ...upload, 
                uploadProgress: progress,
                uploadStatus: progress === 100 ? 'completed' as const : 'uploading' as const,
                url: progress === 100 ? `https://files.nodox.com/${uploadId}` : undefined,
                uploadedAt: progress === 100 ? new Date() : undefined,
              }
            : upload
        );
        
        queryClient.setQueryData(['file-uploads'], updatedUploads);
        await AsyncStorage.setItem(STORAGE_KEYS.FILE_UPLOADS, JSON.stringify(updatedUploads));
      }
    };

    simulateUpload();
    console.log('[Premium] Large file upload started:', uploadId);
    return uploadId;
  }, [premiumFeaturesQuery.data, fileUploadsQuery.data, saveFileUploadsAsync, queryClient]);

  const getFileUploadProgress = useCallback((uploadId: string): FileUpload | undefined => {
    const uploads = fileUploadsQuery.data || [];
    return uploads.find(upload => upload.id === uploadId);
  }, [fileUploadsQuery.data]);

  // Feature Management
  const hasFeature = useCallback((feature: keyof PremiumFeatures): boolean => {
    const features = premiumFeaturesQuery.data || defaultPremiumFeatures;
    return features[feature];
  }, [premiumFeaturesQuery.data]);

  const toggleFeature = useCallback(async (feature: keyof PremiumFeatures) => {
    const currentFeatures = premiumFeaturesQuery.data || defaultPremiumFeatures;
    const updatedFeatures = {
      ...currentFeatures,
      [feature]: !currentFeatures[feature],
    };
    
    await savePremiumFeaturesAsync(updatedFeatures);
    console.log('[Premium] Feature toggled:', feature, updatedFeatures[feature]);
  }, [premiumFeaturesQuery.data, savePremiumFeaturesAsync]);

  const showPremiumAlert = useCallback((featureName: string) => {
    Alert.alert(
      'Función Premium',
      `${featureName} es una función premium. Actualiza tu plan para acceder a esta funcionalidad.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Actualizar Plan', onPress: () => console.log('Navigate to premium upgrade') },
      ]
    );
  }, []);

  return useMemo(() => ({
    // Data
    premiumFeatures: premiumFeaturesQuery.data || defaultPremiumFeatures,
    videoCalls: videoCallsQuery.data || [],
    scheduledMessages: scheduledMessagesQuery.data || [],
    fileUploads: fileUploadsQuery.data || [],
    activeVideoCall,
    
    // Video Call Functions
    initiateVideoCall,
    answerVideoCall,
    endVideoCall,
    declineVideoCall,
    setActiveVideoCall,
    
    // Scheduled Messages Functions
    scheduleMessage,
    cancelScheduledMessage,
    getPendingScheduledMessages,
    
    // File Upload Functions
    uploadLargeFile,
    getFileUploadProgress,
    
    // Feature Management
    hasFeature,
    toggleFeature,
    showPremiumAlert,
    
    // Loading States
    isLoading: premiumFeaturesQuery.isLoading || videoCallsQuery.isLoading || 
               scheduledMessagesQuery.isLoading || fileUploadsQuery.isLoading,
  }), [
    premiumFeaturesQuery.data,
    videoCallsQuery.data,
    scheduledMessagesQuery.data,
    fileUploadsQuery.data,
    activeVideoCall,
    initiateVideoCall,
    answerVideoCall,
    endVideoCall,
    declineVideoCall,
    scheduleMessage,
    cancelScheduledMessage,
    getPendingScheduledMessages,
    uploadLargeFile,
    getFileUploadProgress,
    hasFeature,
    toggleFeature,
    showPremiumAlert,
    premiumFeaturesQuery.isLoading,
    videoCallsQuery.isLoading,
    scheduledMessagesQuery.isLoading,
    fileUploadsQuery.isLoading,
  ]);
});