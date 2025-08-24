// src/lib/active-workspace.ts
import { requireAuth } from './auth';

/** Returns the first workspaceId or null. Never throws on UNAUTHORIZED. */
export async function getActiveWorkspaceId(): Promise<string | null> {
  try {
    const { user } = await requireAuth();
    return user.memberships?.[0]?.workspaceId ?? null;
  } catch (err) {
    if (err instanceof Error && err.message === 'UNAUTHORIZED') {
      return null; // let caller redirect to /login
    }
    throw err; // surface real errors
  }
}
