import { Prisma } from "@prisma/client";
import { prisma } from "../../config/prisma.js";

export const notificationsRepository = {
  listForUser(userId: string) {
    return prisma.notification.findMany({ where: { userId }, orderBy: { createdAt: "desc" } });
  },
  findById(id: string) {
    return prisma.notification.findUnique({ where: { id } });
  },
  create(data: Prisma.NotificationUncheckedCreateInput) {
    return prisma.notification.create({ data });
  },
  markRead(id: string) {
    return prisma.notification.update({ where: { id }, data: { readAt: new Date() } });
  }
};
