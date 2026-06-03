import { Prisma, User } from "@prisma/client";
import { prisma } from "../../config/prisma.js";

export const authRepository = {
  /** Reads a user record by email address. */
  findUserByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { email } });
  },

  /** Reads a user record by primary key. */
  findUserById(id: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { id } });
  },

  /** Persists a newly registered user. */
  createUser(data: Prisma.UserCreateInput): Promise<User> {
    return prisma.user.create({ data });
  },

  /** Stores a hashed password reset token for the given user. */
  createResetToken(userId: string, tokenHash: string, expiresAt: Date) {
    return prisma.passwordResetToken.create({ data: { userId, tokenHash, expiresAt } });
  },

  /** Persists a new authenticated session for the user. */
  createSession(userId: string, tokenId: string, expiresAt: Date) {
    return prisma.session.create({ data: { userId, tokenId, expiresAt } });
  },

  /** Reads an active, non-revoked session by token ID. */
  findActiveSession(tokenId: string) {
    return prisma.session.findFirst({ where: { tokenId, revokedAt: null, expiresAt: { gt: new Date() } } });
  },

  /** Marks all matching sessions as revoked. */
  revokeSession(tokenId: string) {
    return prisma.session.updateMany({ where: { tokenId, revokedAt: null }, data: { revokedAt: new Date() } });
  },

  /** Reads a password reset token record by its hash. */
  findResetToken(tokenHash: string) {
    return prisma.passwordResetToken.findUnique({ where: { tokenHash }, include: { user: true } });
  },

  /** Updates the user password and marks the reset token as used. */
  async resetPassword(userId: string, tokenId: string, passwordHash: string): Promise<void> {
    await prisma.$transaction([
      prisma.user.update({ where: { id: userId }, data: { passwordHash } }),
      prisma.passwordResetToken.update({ where: { id: tokenId }, data: { usedAt: new Date() } })
    ]);
  },

  /** Reads a pending registration OTP record by email. */
  findRegistrationOtp(email: string) {
    return prisma.registrationOtp.findUnique({ where: { email } });
  },

  /** Creates or replaces a pending registration OTP record. */
  upsertRegistrationOtp(data: {
    email: string;
    passwordHash: string;
    firstName: string;
    lastName: string;
    otp: string;
    expiresAt: Date;
  }) {
    return prisma.registrationOtp.upsert({
      where: { email: data.email },
      update: {
        passwordHash: data.passwordHash,
        firstName: data.firstName,
        lastName: data.lastName,
        otp: data.otp,
        expiresAt: data.expiresAt,
        attempts: 0
      },
      create: data
    });
  },

  /** Increments failed OTP verification attempts for an email. */
  incrementRegistrationOtpAttempts(email: string) {
    return prisma.registrationOtp.update({
      where: { email },
      data: { attempts: { increment: 1 } }
    });
  },

  /** Removes a pending registration OTP after successful verification. */
  deleteRegistrationOtp(email: string) {
    return prisma.registrationOtp.delete({ where: { email } });
  }
};
