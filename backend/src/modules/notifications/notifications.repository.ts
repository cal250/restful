import { Prisma } from "@prisma/client";
import { prisma } from "../../config/prisma.js";

export const notificationsRepository = {
  /** Reads all notifications for a user ordered by creation date. */
  listForUser(userId: string) {
    return prisma.notification.findMany({ where: { userId }, orderBy: { createdAt: "desc" } });
  },

  /** Reads one notification by primary key. */
  findById(id: string) {
    return prisma.notification.findUnique({ where: { id } });
  },

  /** Persists a new notification record. */
  create(data: Prisma.NotificationUncheckedCreateInput) {
    return prisma.notification.create({ data });
  },

  /** Sets the read timestamp on a notification. */
  markRead(id: string) {
    return prisma.notification.update({ where: { id }, data: { readAt: new Date() } });
  }
};
