import { neonAuth } from "@neondatabase/neon-js/auth/next";

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
  const { session, user } = await neonAuth();

  if (!session || !user) {
    return null;
  }

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
