// src/app/api/invites/accept/route.ts
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { $Enums } from '@prisma/client';

// POST /api/invites/accept
// Body: { token: string }
// Effect: If invite exists & not expired -> add VIEWER membership for current user, then consume the invite.
export async function POST(req: NextRequest) {
  // Get the current user (who is accepting)
  const { user } = await requireAuth();

  // Parse & validate body
  const body = await req.json().catch(() => ({}));
  const token = typeof body?.token === 'string' ? body.token.trim() : '';
  if (!token) {
    return Response.json(
      { ok: false, code: 'BAD_REQUEST', message: 'Missing invite token' },
      { status: 400 },
    );
  }

  // Look up invite & ensure it is valid (exists and not expired)
  const invite = await prisma.invite.findUnique({
    where: { token },
    select: {
      token: true,
      email: true,
      workspaceId: true,
      expiresAt: true,
    },
  });

  if (!invite) {
    return Response.json(
      { ok: false, code: 'NOT_FOUND', message: 'Invite not found' },
      { status: 404 },
    );
  }
  if (invite.expiresAt <= new Date()) {
    return Response.json(
      { ok: false, code: 'EXPIRED', message: 'Invite has expired' },
      { status: 410 },
    );
  }

  // Add membership (VIEWER by default) and consume the invite atomically
  try {
    const result = await prisma.$transaction(async (tx) => {
      // Create membership if it doesn't already exist
      const existing = await tx.membership.findFirst({
        where: { userId: user.id, workspaceId: invite.workspaceId },
        select: { id: true, role: true },
      });

      if (!existing) {
        await tx.membership.create({
          data: {
            userId: user.id,
            workspaceId: invite.workspaceId,
            role: $Enums.Role.VIEWER,
          },
        });
      }

      // Consume the invite (delete by token to avoid schema assumptions)
      await tx.invite.delete({ where: { token: invite.token } });

      return { alreadyMember: !!existing };
    });

    return Response.json(
      {
        ok: true,
        joined: true,
        alreadyMember: result.alreadyMember,
        workspaceId: invite.workspaceId,
        role: $Enums.Role.VIEWER,
      },
      { status: 200 },
    );
  } catch (err) {
    // Unique constraint or other failure -> safe generic message
    console.error('[invite:accept:error]', err);
    return Response.json(
      { ok: false, code: 'INVITE_ACCEPT_FAILED', message: 'Could not accept invite' },
      { status: 500 },
    );
  }
}
