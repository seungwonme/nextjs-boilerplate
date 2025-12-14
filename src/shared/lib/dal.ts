"use server";

import type { User } from "@supabase/supabase-js";
import { cache } from "react";
import { createServerClient } from "@/shared/api/supabase";

export interface Session {
  isAuth: boolean;
  user: User | null;
}

/**
 * Data Access Layer - Verify user session
 *
 * This function should be called in:
 * - Server Components (for page-level auth checks)
 * - Server Actions (before mutations)
 * - Route Handlers (for API endpoints)
 *
 * Uses React cache() to deduplicate requests within a single render.
 */
export const verifySession = cache(async (): Promise<Session> => {
  const supabase = await createServerClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return { isAuth: false, user: null };
  }

  return { isAuth: true, user };
});

/**
 * Get current user or throw error
 * Use this when you need to enforce authentication
 */
export async function requireAuth(): Promise<User> {
  const { isAuth, user } = await verifySession();

  if (!isAuth || !user) {
    throw new Error("Unauthorized");
  }

  return user;
}
