import { Prisma, User } from "@prisma/client";
import { prisma } from "../../config/prisma.js";

export const authRepository = {
  findUserByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { email } });
  },

  findUserById(id: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { id } });
  },

  createUser(data: Prisma.UserCreateInput): Promise<User> {
    return prisma.user.create({ data });
  },

  createResetToken(userId: string, tokenHash: string, expiresAt: Date) {
    return prisma.passwordResetToken.create({ data: { userId, tokenHash, expiresAt } });
  },

  createSession(userId: string, tokenId: string, expiresAt: Date) {
    return prisma.session.create({ data: { userId, tokenId, expiresAt } });
  },

  findActiveSession(tokenId: string) {
    return prisma.session.findFirst({ where: { tokenId, revokedAt: null, expiresAt: { gt: new Date() } } });
  },

  revokeSession(tokenId: string) {
    return prisma.session.updateMany({ where: { tokenId, revokedAt: null }, data: { revokedAt: new Date() } });
  },

  findResetToken(tokenHash: string) {
    return prisma.passwordResetToken.findUnique({ where: { tokenHash }, include: { user: true } });
  },

  async resetPassword(userId: string, tokenId: string, passwordHash: string): Promise<void> {
    await prisma.$transaction([
      prisma.user.update({ where: { id: userId }, data: { passwordHash } }),
      prisma.passwordResetToken.update({ where: { id: tokenId }, data: { usedAt: new Date() } })
    ]);
  }
};
