// src/app/api/workspaces/[id]/invites/route.ts
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { requireRole } from '@/lib/rbac';
import { $Enums } from '@prisma/client';
import { randomUUID } from 'crypto';

// Next.js 15+: params is a Promise and must be awaited.
type Params = { params: Promise<{ id: string }> };

// POST /api/workspaces/:id/invites (OWNER)
// Body: { email: string }  -> who you're inviting
export async function POST(req: NextRequest, { params }: Params) {
  // Need current user to fill inviterId
  const { user } = await requireAuth();

  const { id: workspaceId } = await params;

  // Owner-only
  try {
    await requireRole(workspaceId, $Enums.Role.OWNER);
  } catch (error) {
    return Response.json(
      { ok: false, code: 'FORBIDDEN', message: 'Owner role required' },
      { status: 403 },
    );
  }
  // Parse body (very light validation)
  const body = await req.json().catch(() => ({}));
  const email = typeof body?.email === 'string' ? body.email.trim() : '';
  if (!email) {
    return Response.json(
      { ok: false, code: 'BAD_REQUEST', message: 'Missing invitee email' },
      { status: 400 },
    );
  }

  // Create token & 7-day expiry
  const token = randomUUID();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  // Persist invite (now includes required fields: inviterId, email)
  const invite = await prisma.invite.create({
    data: {
      workspaceId,
      inviterId: user.id,
      email,
      token,
      expiresAt,
    },
    select: {
      token: true,
      expiresAt: true,
      email: true,
    },
  });

  // Build join link
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/+$/, '') ?? 'http://localhost:3000';
  const link = `${baseUrl}/join/${invite.token}`;

  // Log as per acceptance
  console.log('[invite:create]', {
    workspaceId,
    inviterId: user.id,
    email: invite.email,
    link,
    expiresAt: invite.expiresAt.toISOString(),
  });

  return Response.json(
    {
      ok: true,
      invite: {
        token: invite.token,
        email: invite.email,
        expiresAt: invite.expiresAt.toISOString(),
        link,
      },
    },
    { status: 201 },
  );
}
