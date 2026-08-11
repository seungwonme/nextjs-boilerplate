import { createNeonAuth } from "@neondatabase/neon-js/auth/next/server";

let auth: ReturnType<typeof createNeonAuth> | undefined;

export function getAuth() {
  const baseUrl = process.env.NEON_AUTH_BASE_URL;
  const secret = process.env.NEON_AUTH_COOKIE_SECRET;

  if (!baseUrl || !secret) {
    throw new Error(
      "NEON_AUTH_BASE_URL and NEON_AUTH_COOKIE_SECRET are required",
    );
  }

  auth ??= createNeonAuth({
    baseUrl,
    cookies: {
      secret,
    },
  });

  return auth;
}

export interface NeonAuthUser {
  id: string;
  email?: string;
  name?: string;
  image?: string;
}

export interface AuthSession {
  user: NeonAuthUser;
}

/**
 * Get the current session (for Server Components / Server Actions / API Routes)
 */
export async function getSession(): Promise<AuthSession | null> {
  const { data: session } = await getAuth().getSession();

  if (!session?.user) {
    return null;
  }

  const { user } = session;

  return {
    user: {
      id: user.id,
      email: user.email ?? undefined,
      name: user.name ?? undefined,
      image: user.image ?? undefined,
    },
  };
}

/**
 * Require authentication - throws if not authenticated
 */
export async function requireAuth(): Promise<AuthSession> {
  const session = await getSession();

  if (!session) {
    throw new Error("Unauthorized");
  }

  return session;
}
