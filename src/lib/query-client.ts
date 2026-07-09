import { QueryClient, isServer } from "@tanstack/react-query";

/**
 * TanStack Query client factory. On the server we always create a fresh client
 * (so requests never share cache across users); in the browser we reuse a
 * singleton so cache survives re-renders and Fast Refresh.
 */
function makeQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        refetchOnWindowFocus: false,
        retry: 1,
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined;

export function getQueryClient(): QueryClient {
  if (isServer) return makeQueryClient();
  if (!browserQueryClient) browserQueryClient = makeQueryClient();
  return browserQueryClient;
}
