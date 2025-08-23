// src/lib/rbac.ts
import { prisma } from '@/lib/prisma';
import { Role } from '@prisma/client';
import { requireAuth, type AuthContext } from '@/lib/auth';
import { roleAtLeast } from '@/lib/roles';

export type MembershipContext = {
  auth: AuthContext;
  membership: { id: string; role: Role };
};

/** Fetch the user's membership for a workspace (or null). */
export async function getMembership(userId: string, workspaceId: string) {
  return prisma.membership.findUnique({
    where: {
      userId_workspaceId: { userId, workspaceId },
    },
    select: { id: true, role: true },
  });
}

/** Ensures the current user has >= minRole in the given workspace. Throws "FORBIDDEN". */
export async function requireRole(workspaceId: string, minRole: Role): Promise<MembershipContext> {
  const auth = await requireAuth();

  const membership = await getMembership(auth.user.id, workspaceId);
  if (!membership) throw new Error('FORBIDDEN');

  if (!roleAtLeast(membership.role, minRole)) {
    throw new Error('FORBIDDEN');
  }

  return { auth, membership };
}
