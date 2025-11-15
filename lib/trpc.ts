import { createTRPCReact } from "@trpc/react-query";
import { httpLink } from "@trpc/client";
import { Platform } from "react-native";
import Constants from "expo-constants";
import type { AppRouter } from "@/backend/trpc/app-router";
import superjson from "superjson";

export const trpc = createTRPCReact<AppRouter>();

type TrpcClient = ReturnType<typeof trpc.createClient>;

const stripTrailingSlash = (url: string) => url.replace(/\/$/, "");

const ensureProtocol = (url: string) => {
  if (/^https?:\/\//i.test(url)) {
    return url;
  }
  return `http://${url}`;
};

const resolveBaseUrl = () => {
  const envUrl = process.env.EXPO_PUBLIC_RORK_API_BASE_URL?.trim();
  if (envUrl) {
    return stripTrailingSlash(envUrl);
  }

  if (Platform.OS === "web" && typeof window !== "undefined") {
    const origin = window.location.origin;
    console.warn(
      "[tRPC] Using window origin as base URL. Set EXPO_PUBLIC_RORK_API_BASE_URL to silence this warning."
    );
    return stripTrailingSlash(origin);
  }

  const hostUri = Constants.expoConfig?.hostUri || "";
  if (hostUri) {
    const sanitizedHost = hostUri.replace(/https?:\/\//i, "").split("?")[0];
    const normalized = stripTrailingSlash(ensureProtocol(sanitizedHost));
    console.warn(
      "[tRPC] Derived base URL from Expo host URI. Configure EXPO_PUBLIC_RORK_API_BASE_URL for explicit control."
    );
    return normalized;
  }

  const fallback = "http://127.0.0.1:3000";
  console.error(
    "[tRPC] Falling back to default base URL", fallback,
    "Set EXPO_PUBLIC_RORK_API_BASE_URL or ensure Constants.expoConfig.hostUri is available."
  );
  return fallback;
};

let cachedClient: TrpcClient | null = null;

export const getTrpcClient = () => {
  if (!cachedClient) {
    const baseUrl = resolveBaseUrl();
    cachedClient = trpc.createClient({
      links: [
        httpLink({
          url: `${baseUrl}/api/trpc`,
          transformer: superjson,
        }),
      ],
    });
  }
  return cachedClient;
};

export const trpcClient = getTrpcClient();