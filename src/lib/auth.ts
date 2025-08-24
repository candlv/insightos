// src/lib/auth.ts
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import type { Session, Role } from '@prisma/client';

const SESSION_COOKIE = 'insightos.sid'; // keep consistent with your auth routes

export type AuthContext = {
  user: {
    id: string;
    email: string;
    memberships: { workspaceId: string; role: Role }[];
  };
  session: Pick<Session, 'id' | 'token' | 'expiresAt'>;
};

/** Returns { user, session } if a valid cookie/session exists, otherwise null. */
export async function getAuth(): Promise<AuthContext | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const session = await prisma.session.findUnique({
    where: { token },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          memberships: {
            select: { workspaceId: true, role: true },
          },
        },
      },
    },
  });

  if (!session) return null;

  // Expired?
  if (session.expiresAt <= new Date()) {
    // Optional: clean up expired session here if you want
    // await prisma.session.delete({ where: { id: session.id } })
    return null;
  }

  return {
    user: session.user,
    session: { id: session.id, token: session.token, expiresAt: session.expiresAt },
  };
}

/** Same as getAuth() but throws if unauthenticated. Use inside protected routes. */
export async function requireAuth(): Promise<AuthContext> {
  const auth = await getAuth();
  if (!auth) {
    // Keep the error string stable for handlers/tests to match on.
    throw new Error('UNAUTHORIZED');
  }
  return auth;
}
