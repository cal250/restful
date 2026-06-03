import { createHash, randomBytes, randomUUID } from "node:crypto";
import { Role } from "@prisma/client";
import jwt, { SignOptions } from "jsonwebtoken";
import { env } from "../../config/env.js";

type TokenPayload = { sub: string; role: Role; jti: string };

export const tokenService = {
  signAccessToken(userId: string, role: Role, tokenId: string): string {
    const options: SignOptions = { expiresIn: env.JWT_EXPIRES_IN as SignOptions["expiresIn"] };
    return jwt.sign({ sub: userId, role, jti: tokenId }, env.JWT_SECRET, options);
  },

  verifyAccessToken(token: string): TokenPayload {
    return jwt.verify(token, env.JWT_SECRET) as TokenPayload;
  },

  getExpiry(token: string): Date {
    const payload = jwt.decode(token) as { exp: number };
    return new Date(payload.exp * 1000);
  },

  createResetToken(): { token: string; tokenHash: string } {
    const token = randomBytes(32).toString("hex");
    return { token, tokenHash: this.hashResetToken(token) };
  },

  createTokenId(): string {
    return randomUUID();
  },

  hashResetToken(token: string): string {
    return createHash("sha256").update(token).digest("hex");
  }
};
