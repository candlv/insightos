import { Role } from '@prisma/client';
import { roleAtLeast, roleWeight } from '../roles';

describe('roles comparator', () => {
  it('weights are OWNER > EDITOR > VIEWER', () => {
    expect(roleWeight(Role.OWNER)).toBeGreaterThan(roleWeight(Role.EDITOR));
    expect(roleWeight(Role.EDITOR)).toBeGreaterThan(roleWeight(Role.VIEWER));
  });

  it('roleAtLeast returns true when left >= right', () => {
    expect(roleAtLeast(Role.OWNER, Role.VIEWER)).toBe(true);
    expect(roleAtLeast(Role.OWNER, Role.EDITOR)).toBe(true);
    expect(roleAtLeast(Role.EDITOR, Role.VIEWER)).toBe(true);
    expect(roleAtLeast(Role.EDITOR, Role.EDITOR)).toBe(true);
    expect(roleAtLeast(Role.VIEWER, Role.VIEWER)).toBe(true);
  });

  it('roleAtLeast returns false when left < right', () => {
    expect(roleAtLeast(Role.EDITOR, Role.OWNER)).toBe(false);
    expect(roleAtLeast(Role.VIEWER, Role.EDITOR)).toBe(false);
    expect(roleAtLeast(Role.VIEWER, Role.OWNER)).toBe(false);
  });
});
