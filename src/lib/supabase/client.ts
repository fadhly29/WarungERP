import { createBrowserClient } from "@supabase/ssr";

let client: ReturnType<typeof createBrowserClient> | null = null;

export function createClient() {
  if (typeof window === "undefined") {
    const proxy = new Proxy(
      {},
      {
        get() {
          return () => Promise.resolve({ data: null, error: null });
        },
      }
    );
    return proxy as ReturnType<typeof createBrowserClient>;
  }

  if (client) return client;

  client = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  return client;
}
