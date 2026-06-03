import bcrypt from "bcryptjs";

const ROUNDS = 12;

export const passwordService = {
  hash(password: string): Promise<string> {
    return bcrypt.hash(password, ROUNDS);
  },

  verify(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }
};
