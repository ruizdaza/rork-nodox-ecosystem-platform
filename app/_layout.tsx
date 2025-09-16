import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StyleSheet } from "react-native";
import { NodoXProvider } from "@/hooks/use-nodox-store";
import { ChatProvider } from "@/hooks/use-chat";
import { NotificationProvider } from "@/hooks/use-notifications";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerBackTitle: "Atrás" }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="send" options={{ headerShown: false, presentation: "modal" }} />
      <Stack.Screen name="recharge" options={{ headerShown: false, presentation: "modal" }} />
      <Stack.Screen name="scanner" options={{ headerShown: false, presentation: "fullScreenModal" }} />
      <Stack.Screen name="conversation" options={{ headerShown: false, presentation: "modal" }} />
      <Stack.Screen name="notifications" options={{ headerShown: false, presentation: "modal" }} />
    </Stack>
  );
}

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <NotificationProvider>
        <NodoXProvider>
          <ChatProvider>
            <GestureHandlerRootView style={styles.container}>
              <RootLayoutNav />
            </GestureHandlerRootView>
          </ChatProvider>
        </NodoXProvider>
      </NotificationProvider>
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});