import { createRemoteJWKSet, type JWTPayload, jwtVerify } from "jose";
import { cookies } from "next/headers";

const JWKS = createRemoteJWKSet(new URL(process.env.NEON_AUTH_JWKS_URL || ""));

export interface NeonAuthUser {
  id: string;
  email?: string;
  name?: string;
  image?: string;
}

export interface AuthSession {
  user: NeonAuthUser;
  token: string;
  payload: JWTPayload;
}

/**
 * Get the current session from cookies (for Server Components / Server Actions)
 */
export async function getSession(): Promise<AuthSession | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("neon_auth_token")?.value;

    if (!token) {
      return null;
    }

    const { payload } = await jwtVerify(token, JWKS);

    return {
      user: {
        id: payload.sub || "",
        email: payload.email as string | undefined,
        name: payload.name as string | undefined,
        image: payload.picture as string | undefined,
      },
      token,
      payload,
    };
  } catch {
    return null;
  }
}

/**
 * Verify JWT token from Authorization header (for API Routes)
 */
export async function verifyToken(
  request: Request,
): Promise<AuthSession | null> {
  try {
    const authHeader = request.headers.get("Authorization");
    const token = authHeader?.startsWith("Bearer ")
      ? authHeader.slice(7)
      : null;

    if (!token) {
      return null;
    }

    const { payload } = await jwtVerify(token, JWKS);

    return {
      user: {
        id: payload.sub || "",
        email: payload.email as string | undefined,
        name: payload.name as string | undefined,
        image: payload.picture as string | undefined,
      },
      token,
      payload,
    };
  } catch {
    return null;
  }
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
