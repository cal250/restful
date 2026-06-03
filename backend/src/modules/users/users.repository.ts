import { Prisma } from "@prisma/client";
import { prisma } from "../../config/prisma.js";

const select = {
  id: true, email: true, firstName: true, lastName: true,
  role: true, isActive: true, createdAt: true, updatedAt: true
} satisfies Prisma.UserSelect;

export const usersRepository = {
  list() {
    return prisma.user.findMany({ select, orderBy: { createdAt: "desc" } });
  },

  findById(id: string) {
    return prisma.user.findUnique({ where: { id }, select });
  },

  findWithPassword(id: string) {
    return prisma.user.findUnique({ where: { id } });
  },

  update(id: string, data: Prisma.UserUpdateInput) {
    return prisma.user.update({ where: { id }, data, select });
  },

  delete(id: string) {
    return prisma.user.delete({ where: { id }, select });
  },

  updatePassword(id: string, passwordHash: string) {
    return prisma.user.update({ where: { id }, data: { passwordHash } });
  }
};
