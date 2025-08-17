import bcrypt from 'bcrypt';

const DEFAULT_ROUNDS = 12;

/**
 * Hash a plaintext password using bcrypt.
 * @param plain The user-provided plaintext password.
 * @param rounds Optional cost factor (defaults to 12). Higher is slower & more secure.
 */
export async function hashPassword(plain: string, rounds = DEFAULT_ROUNDS): Promise<string> {
  if (typeof plain !== 'string' || plain.length < 8) {
    throw new Error('Password must be at least 8 characters.');
  }
  const salt = await bcrypt.genSalt(rounds);
  return bcrypt.hash(plain, salt);
}

/**
 * Verify a plaintext password against a stored bcrypt hash.
 * @returns true on match, false otherwise.
 */
export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  if (!hash || !plain) return false;
  // bcrypt.compare is already timing-safe
  return bcrypt.compare(plain, hash);
}
