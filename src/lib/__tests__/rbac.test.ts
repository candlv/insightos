import { Role } from '@prisma/client';
import { requireRole } from '../rbac';

// --- Mocks ---
const mockRequireAuth = vi.fn();
vi.mock('@/lib/auth', () => ({
  requireAuth: (...args: any[]) => mockRequireAuth(...args),
}));

const mockFindUnique = vi.fn();
vi.mock('@/lib/prisma', () => ({
  prisma: {
    membership: {
      findUnique: (...args: any[]) => mockFindUnique(...args),
    },
  },
}));

// roleAtLeast is real (we want the actual comparator)
vi.mock('../roles', async (orig) => {
  const actual = await (orig as any)();
  return actual;
});

describe('requireRole', () => {
  const workspaceId = 'ws_123';
  const user = { id: 'u_1', email: 'x@example.com' };
  const session = { id: 's_1', token: 't', expiresAt: new Date(Date.now() + 60_000) };

  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireAuth.mockResolvedValue({ user, session });
  });

  it('throws FORBIDDEN when no membership', async () => {
    mockFindUnique.mockResolvedValue(null);
    await expect(requireRole(workspaceId, Role.VIEWER)).rejects.toThrowError('FORBIDDEN');
  });

  it('throws FORBIDDEN when role is below the required minimum', async () => {
    mockFindUnique.mockResolvedValue({ id: 'm1', role: Role.VIEWER });
    await expect(requireRole(workspaceId, Role.EDITOR)).rejects.toThrowError('FORBIDDEN');
  });

  it('returns auth + membership when role meets or exceeds', async () => {
    mockFindUnique.mockResolvedValue({ id: 'm2', role: Role.EDITOR });
    const result = await requireRole(workspaceId, Role.VIEWER);
    expect(result.auth.user.id).toBe(user.id);
    expect(result.membership.role).toBe(Role.EDITOR);
  });
});
