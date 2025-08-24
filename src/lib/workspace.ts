// src/lib/workspace.ts
import { prisma } from '@/lib/prisma';
import { Role, Prisma } from '@prisma/client';
import { randomBytes } from 'crypto';

export async function ensureDefaultWorkspace(userId: string) {
  // If the user already has any membership, do nothing (idempotent)
  const hasAny = await prisma.membership.count({ where: { userId } });
  if (hasAny > 0) return;

  await prisma.$transaction(async (tx) => {
    let workspaceName = `Workspace ${userId.slice(0, 8)}`;

    // Try to create a unique name; if name collides, add a short random suffix and retry
    for (let attempt = 0; attempt < 5; attempt++) {
      try {
        const ws = await tx.workspace.create({
          data: { name: workspaceName },
          select: { id: true },
        });

        await tx.membership.create({
          data: { userId, workspaceId: ws.id, role: Role.OWNER },
        });

        return; // success
      } catch (e) {
        const isUniqueNameViolation =
          e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002';
        if (isUniqueNameViolation) {
          // Add a short random suffix and retry
          const suffix = randomBytes(2).toString('hex'); // 4 hex chars
          workspaceName = `Workspace ${userId.slice(0, 6)}-${suffix}`;
          continue;
        }
        throw e; // rethrow other errors
      }
    }

    // If we somehow failed 5 times, throw a clear error
    throw new Error('Failed to create a unique default workspace name after several attempts.');
  });
}

// --- Role-aware workspace context (auth + membership) ---
import { requireAuth } from '@/lib/auth'; // add at top if not already imported

export async function getWorkspaceContext(workspaceId: string): Promise<{
  userId: string;
  role: Role | null;
}> {
  const { user } = await requireAuth();

  // Fast path: use memberships already attached to user
  const cached = user.memberships?.find((m) => m.workspaceId === workspaceId);
  if (cached) {
    return { userId: user.id, role: cached.role };
  }

  // Fallback: query Prisma if needed (defensive)
  const membership = await prisma.membership.findUnique({
    where: { userId_workspaceId: { userId: user.id, workspaceId } },
    select: { role: true },
  });

  return { userId: user.id, role: membership?.role ?? null };
}
