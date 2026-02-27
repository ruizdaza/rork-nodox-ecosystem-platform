import { useState, useEffect, useRef } from 'react';
import { db } from '@/lib/firebase-client';
import { collection, query, where, orderBy, limit, onSnapshot, addDoc, doc, setDoc, updateDoc } from 'firebase/firestore';
import { useAuth } from './use-auth';
import { trpc } from '@/lib/trpc';

export interface Message {
  _id: string;
  text: string;
  createdAt: Date;
  user: {
    _id: string;
    name: string;
    avatar?: string;
  };
  image?: string;
  received?: boolean;
}

export interface Conversation {
  id: string;
  participants: string[];
  lastMessage?: {
    text: string;
    createdAt: string;
    read: boolean;
  };
  metadata?: Record<string, { name: string, avatar?: string }>;
}

export const useChat = (conversationId?: string) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  // tRPC mutation for secure creation if complex logic needed,
  // but for realtime chat, client often writes to firestore directly securely via rules
  // For sending, we can use tRPC or Direct Firestore.
  // Given previous step implemented tRPC `sendMessage`, we can use that OR direct.
  // Using direct Firestore usually gives instant optimistic UI updates better.
  // But let's stick to tRPC for consistency if desired, OR direct for speed.
  // The plan said "Hooks Real: Suscribirse a messages con onSnapshot".
  
  const sendMessageMutation = trpc.chat.sendMessage.useMutation();

  // Listen to Messages (if active conversation)
  useEffect(() => {
    if (!user || !conversationId) return;

    const q = query(
      collection(db, "messages"),
      where("conversationId", "==", conversationId),
      orderBy("createdAt", "desc"),
      limit(50)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          _id: doc.id,
          text: data.text,
          createdAt: new Date(data.createdAt),
          user: {
            _id: data.senderId,
            name: data.senderName || 'Usuario', // Ideally fetch or store in msg
            avatar: data.senderAvatar,
          },
          image: data.type === 'image' ? data.url : undefined,
        };
      });
      setMessages(msgs);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [conversationId, user]);

  // Listen to Conversations List
  useEffect(() => {
    if (!user) return;

    // "participantIds.uid" == true
    // Note: Client SDK syntax for map query is simple string path
    const q = query(
      collection(db, "conversations"),
      where(`participantIds.${user.id}`, "==", true),
      orderBy("updatedAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const convs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Conversation[];
      setConversations(convs);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const sendMessage = async (text: string) => {
    if (!conversationId || !user) return;

    // Optimistic update handled by GiftedChat usually, but Firestore listener handles it fast.
    // We use tRPC to ensure backend logic (notifications, lastMessage update) runs securely.
    try {
        await sendMessageMutation.mutateAsync({
            conversationId,
            text,
            type: 'text'
        });
    } catch (error) {
        console.error("Failed to send:", error);
    }
  };

  return {
    messages,
    conversations,
    sendMessage,
    loading
  };
};
