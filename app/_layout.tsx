import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StyleSheet } from "react-native";
import { NodoXProvider } from "@/hooks/use-nodox-store";
import { ChatProvider } from "@/hooks/use-chat";
import { NotificationProvider } from "@/hooks/use-notifications";
import { NotificationAnalyticsProvider } from "@/hooks/use-notification-analytics";
import { PremiumFeaturesProvider } from "@/hooks/use-premium-features";
import { AnalyticsProvider as ChatAnalyticsProvider } from "@/hooks/use-analytics";
import { ReviewProvider } from "@/hooks/use-reviews";
import { TransactionProvider } from "@/hooks/use-transactions";
import { BusinessIntelligenceProvider } from "@/hooks/use-business-intelligence";
import { AutomationProvider } from "@/hooks/use-automation";
import { InternationalizationProvider } from "@/hooks/use-internationalization";
import { BulkMessagingProvider } from "@/hooks/use-bulk-messaging";
import { WalletProvider } from "@/hooks/use-wallet";
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
      <Stack.Screen name="notification-analytics" options={{ headerShown: false, presentation: "modal" }} />
      <Stack.Screen name="business-intelligence" options={{ headerShown: false, presentation: "modal" }} />
      <Stack.Screen name="automation-dashboard" options={{ headerShown: false, presentation: "modal" }} />
      <Stack.Screen name="internationalization" options={{ headerShown: false, presentation: "modal" }} />
      <Stack.Screen name="exchange-ncop" options={{ headerShown: false, presentation: "modal" }} />
      <Stack.Screen name="contacts" options={{ headerShown: false, presentation: "modal" }} />
      <Stack.Screen name="settings" options={{ headerShown: false }} />
      <Stack.Screen name="help-support" options={{ headerShown: false }} />
      <Stack.Screen name="earn-points" options={{ presentation: "modal" }} />
      <Stack.Screen name="product/[id]" options={{ headerShown: false }} />
      <Stack.Screen name="cart" options={{ headerShown: false, presentation: "modal" }} />
      <Stack.Screen name="checkout" options={{ headerShown: false, presentation: "modal" }} />
      <Stack.Screen name="personalization" options={{ headerShown: false }} />
      <Stack.Screen name="crm-dashboard" options={{ headerShown: false }} />
      <Stack.Screen name="promotions-manager" options={{ headerShown: false }} />
      <Stack.Screen name="support-center" options={{ headerShown: false }} />
      <Stack.Screen name="wallet-admin" options={{ headerShown: false }} />
      <Stack.Screen name="referral-campaigns" options={{ headerShown: false }} />
      <Stack.Screen name="referral-analytics" options={{ headerShown: false }} />
      <Stack.Screen name="referral-materials" options={{ headerShown: false }} />
      <Stack.Screen name="referral-commissions" options={{ headerShown: false }} />
      <Stack.Screen name="referral-lead/[id]" options={{ headerShown: false }} />
      <Stack.Screen name="referral-leads" options={{ headerShown: false }} />
      <Stack.Screen name="bulk-messaging" options={{ headerShown: false }} />
      <Stack.Screen name="bulk-messaging-campaign" options={{ headerShown: false }} />
      <Stack.Screen name="bulk-messaging-analytics" options={{ headerShown: false }} />
      <Stack.Screen name="wallet-settings" options={{ headerShown: false, presentation: "modal" }} />
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
          <InternationalizationProvider>
            <NotificationAnalyticsProvider>
              <NotificationProvider>
                <NodoXProvider>
                <WalletProvider>
                <TransactionProvider>
                  <ReviewProvider>
                    <ChatProvider>
                      <BulkMessagingProvider>
                        <PremiumFeaturesProvider>
                          <ChatAnalyticsProvider>
                            <BusinessIntelligenceProvider>
                              <AutomationProvider>
                                <GestureHandlerRootView style={styles.container}>
                                  <ErrorBoundary onError={(error, errorInfo) => ErrorUtils.logError(error, 'Navigation')}>
                                    <RootLayoutNav />
                                  </ErrorBoundary>
                                </GestureHandlerRootView>
                              </AutomationProvider>
                            </BusinessIntelligenceProvider>
                          </ChatAnalyticsProvider>
                        </PremiumFeaturesProvider>
                      </BulkMessagingProvider>
                    </ChatProvider>
                  </ReviewProvider>
                </TransactionProvider>
                </WalletProvider>
                </NodoXProvider>
              </NotificationProvider>
            </NotificationAnalyticsProvider>
          </InternationalizationProvider>
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