import bcrypt from "bcryptjs";

const ROUNDS = 12;

export const passwordService = {
  /** Hashes a plaintext password for storage. */
  hash(password: string): Promise<string> {
    return bcrypt.hash(password, ROUNDS);
  },

  /** Compares a plaintext password against a stored hash. */
  verify(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }
};
