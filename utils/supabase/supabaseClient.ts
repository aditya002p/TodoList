import { createClient } from "@supabase/supabase-js";
import { Database } from "../types/database.types";

declare global {
  interface Window {
    Clerk: {
      session?: {
        getToken: (options: { template: string }) => Promise<string>;
      };
    };
  }
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

function getSupabase() {
  return createClient<Database>(supabaseUrl, supabaseAnonKey, {
    global: {
      fetch: async (url, options = {}) => {
        const clerkToken = await window.Clerk.session?.getToken({
          template: "supabase",
        });

        const headers = new Headers(options?.headers);
        headers.set("Authorization", `Bearer ${clerkToken}`);

        // Convert body if it exists and contains a timestamp
        if (options.body) {
          try {
            const body = JSON.parse(options.body as string);
            if (body.updated_at) {
              body.updated_at = new Date(body.updated_at).getTime(); // Convert to timestamp
              options.body = JSON.stringify(body);
            }
          } catch (error) {
            console.error("Error parsing body:", error);
          }
        }

        return fetch(url, {
          ...options,
          headers,
        });
      },
    },
  });
}

const supabaseClient = getSupabase();

export default supabaseClient;
