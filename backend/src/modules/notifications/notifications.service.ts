import { AppError } from "../../common/errors/app-error.js";
import { usersService } from "../users/users.service.js";
import { notificationsRepository } from "./notifications.repository.js";
import { CreateNotificationInput } from "./notifications.validation.js";

export const notificationsService = {
  /** Returns all notifications for the given user. */
  listForUser(userId: string) {
    return notificationsRepository.listForUser(userId);
  },

  /** Creates a notification after verifying the target user exists. */
  async create(input: CreateNotificationInput) {
    await usersService.get(input.userId);
    return notificationsRepository.create(input);
  },

  /** Marks a notification as read when it belongs to the user. */
  async markRead(id: string, userId: string) {
    const notification = await notificationsRepository.findById(id);
    if (!notification || notification.userId !== userId) {
      throw new AppError("Notification not found", 404, "NOTIFICATION_NOT_FOUND");
    }
    return notificationsRepository.markRead(id);
  }
};
