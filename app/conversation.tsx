import React, { useState, useEffect } from "react";
import { View, StyleSheet, TouchableOpacity, Text, Platform, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { GiftedChat, IMessage, Bubble } from "react-native-gifted-chat";
import { useChat } from "@/hooks/use-chat";
import { useAuth } from "@/hooks/use-auth";

export default function ConversationScreen() {
  const router = useRouter();
  const { id, name } = useLocalSearchParams<{ id: string, name?: string }>();
  const { user } = useAuth();
  
  // Use the chat hook with the active conversation ID
  const { messages, sendMessage, loading } = useChat(id);

  const onSend = (newMessages: IMessage[] = []) => {
    if (newMessages.length > 0) {
      sendMessage(newMessages[0].text);
    }
  };

  const renderBubble = (props: any) => {
    return (
      <Bubble
        {...props}
        wrapperStyle={{
          right: {
            backgroundColor: "#2563eb",
          },
          left: {
            backgroundColor: "#f1f5f9",
          },
        }}
        textStyle={{
          right: {
            color: "#fff",
          },
          left: {
            color: "#1e293b",
          },
        }}
      />
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft color="#1e293b" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{name || "Chat"}</Text>
        <View style={{ width: 24 }} />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563eb" />
        </View>
      ) : (
        <GiftedChat
          messages={messages}
          onSend={(messages) => onSend(messages)}
          user={{
            _id: user?.id || 'guest',
            name: user?.name,
          }}
          renderBubble={renderBubble}
          placeholder="Escribe un mensaje..."
          locale="es"
          bottomOffset={Platform.OS === 'ios' ? 24 : 0}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1e293b",
  },
  backButton: {
    padding: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  }
});
