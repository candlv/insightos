import { describe, it, expect } from 'vitest';
import { hashPassword, verifyPassword } from '../password';

describe('password hashing utilities', () => {
  it('hashes and verifies a valid password', async () => {
    const plain = 'StrongPass_123';
    const hash = await hashPassword(plain);
    expect(hash).toMatch(/^\$2[aby]\$.{56}$/); // basic bcrypt hash shape
    const ok = await verifyPassword(plain, hash);
    expect(ok).toBe(true);
  });

  it('rejects incorrect password', async () => {
    const hash = await hashPassword('CorrectHorseBatteryStaple');
    const ok = await verifyPassword('WrongPassword!', hash);
    expect(ok).toBe(false);
  });

  it('enforces minimum length', async () => {
    await expect(hashPassword('short')).rejects.toThrow(/at least 8/);
  });
});
