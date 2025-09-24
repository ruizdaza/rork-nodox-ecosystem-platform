import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StyleSheet } from "react-native";
import { NodoXProvider } from "@/hooks/use-nodox-store";
import { ChatProvider } from "@/hooks/use-chat";
import { NotificationProvider } from "@/hooks/use-notifications";
import { PremiumFeaturesProvider } from "@/hooks/use-premium-features";
import { AnalyticsProvider } from "@/hooks/use-analytics";
import { ReviewProvider } from "@/hooks/use-reviews";
import { TransactionProvider } from "@/hooks/use-transactions";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ErrorUtils } from "@/utils/security";
import { trpc, trpcClient } from "@/lib/trpc";

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
      <Stack.Screen name="ally-request" options={{ headerShown: false, presentation: "modal" }} />
      <Stack.Screen name="ally-status" options={{ headerShown: false, presentation: "modal" }} />
      <Stack.Screen name="admin-ally-requests" options={{ headerShown: false, presentation: "modal" }} />
      <Stack.Screen name="analytics" options={{ headerShown: false, presentation: "modal" }} />
      <Stack.Screen name="financial-dashboard" options={{ headerShown: false, presentation: "modal" }} />
      <Stack.Screen name="notification-demo" options={{ headerShown: false, presentation: "modal" }} />
    </Stack>
  );
}

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  const handleError = (error: Error, errorInfo: any) => {
    ErrorUtils.logError(error, 'RootLayout');
    console.error('Root layout error:', error, errorInfo);
  };

  return (
    <ErrorBoundary onError={handleError}>
      <trpc.Provider client={trpcClient} queryClient={queryClient}>
        <QueryClientProvider client={queryClient}>
          <NotificationProvider>
            <NodoXProvider>
              <TransactionProvider>
                <ReviewProvider>
                  <ChatProvider>
                    <PremiumFeaturesProvider>
                      <AnalyticsProvider>
                        <GestureHandlerRootView style={styles.container}>
                          <ErrorBoundary onError={(error, errorInfo) => ErrorUtils.logError(error, 'Navigation')}>
                            <RootLayoutNav />
                          </ErrorBoundary>
                        </GestureHandlerRootView>
                      </AnalyticsProvider>
                    </PremiumFeaturesProvider>
                  </ChatProvider>
                </ReviewProvider>
              </TransactionProvider>
            </NodoXProvider>
          </NotificationProvider>
        </QueryClientProvider>
      </trpc.Provider>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});