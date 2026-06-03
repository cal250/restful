import { Prisma } from "@prisma/client";
import { prisma } from "../../config/prisma.js";

const select = {
  id: true, email: true, firstName: true, lastName: true,
  role: true, isActive: true, createdAt: true, updatedAt: true
} satisfies Prisma.UserSelect;

export const usersRepository = {
  /** Reads all users with safe fields only. */
  list() {
    return prisma.user.findMany({ select, orderBy: { createdAt: "desc" } });
  },

  /** Reads one user by primary key without the password hash. */
  findById(id: string) {
    return prisma.user.findUnique({ where: { id }, select });
  },

  /** Reads one user by primary key including the password hash. */
  findWithPassword(id: string) {
    return prisma.user.findUnique({ where: { id } });
  },

  /** Persists changes to an existing user record. */
  update(id: string, data: Prisma.UserUpdateInput) {
    return prisma.user.update({ where: { id }, data, select });
  },

  /** Deletes a user record. */
  delete(id: string) {
    return prisma.user.delete({ where: { id }, select });
  },

  /** Updates only the password hash for a user. */
  updatePassword(id: string, passwordHash: string) {
    return prisma.user.update({ where: { id }, data: { passwordHash } });
  }
};
