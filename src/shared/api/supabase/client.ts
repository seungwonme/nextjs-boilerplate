"use client";

import { createBrowserClient } from "@supabase/ssr";
import { getSupabaseEnv } from "../../config/index.ts";

export function createClient() {
  const { publishableKey, url } = getSupabaseEnv();
  return createBrowserClient(url, publishableKey);
}
