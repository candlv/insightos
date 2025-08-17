import { Role } from '@prisma/client';

const roleOrder: Record<Role, number> = {
  [Role.OWNER]: 3,
  [Role.EDITOR]: 2,
  [Role.VIEWER]: 1,
};

export function roleAtLeast(roleA: Role, roleB: Role): boolean {
  return roleOrder[roleA] >= roleOrder[roleB];
}

export function roleWeight(role: Role): number {
  return roleOrder[role];
}
