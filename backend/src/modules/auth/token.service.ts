import { createHash, randomBytes, randomUUID } from "node:crypto";
import { Role } from "@prisma/client";
import jwt, { SignOptions } from "jsonwebtoken";
import { env } from "../../config/env.js";

type TokenPayload = { sub: string; role: Role; jti: string };

export const tokenService = {
  /** Signs a JWT access token for the given user, role, and session ID. */
  signAccessToken(userId: string, role: Role, tokenId: string): string {
    const options: SignOptions = { expiresIn: env.JWT_EXPIRES_IN as SignOptions["expiresIn"] };
    return jwt.sign({ sub: userId, role, jti: tokenId }, env.JWT_SECRET, options);
  },

  /** Verifies and decodes a JWT access token. */
  verifyAccessToken(token: string): TokenPayload {
    return jwt.verify(token, env.JWT_SECRET) as TokenPayload;
  },

  /** Extracts the expiration timestamp from a signed token. */
  getExpiry(token: string): Date {
    const payload = jwt.decode(token) as { exp: number };
    return new Date(payload.exp * 1000);
  },

  /** Generates a random reset token and its SHA-256 hash. */
  createResetToken(): { token: string; tokenHash: string } {
    const token = randomBytes(32).toString("hex");
    return { token, tokenHash: this.hashResetToken(token) };
  },

  /** Generates a unique session token identifier. */
  createTokenId(): string {
    return randomUUID();
  },

  /** Hashes a reset token for secure storage. */
  hashResetToken(token: string): string {
    return createHash("sha256").update(token).digest("hex");
  },

  /** Generates a 6-digit registration OTP and its SHA-256 hash. */
  createRegistrationOtp(): { otp: string } {
    const otp = String(Math.floor(100000 + Math.random() * 900000));
    return { otp };
  }
};
