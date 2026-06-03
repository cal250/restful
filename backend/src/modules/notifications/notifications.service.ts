import { AppError } from "../../common/errors/app-error.js";
import { usersService } from "../users/users.service.js";
import { notificationsRepository } from "./notifications.repository.js";
import { CreateNotificationInput } from "./notifications.validation.js";

export const notificationsService = {
  listForUser(userId: string) {
    return notificationsRepository.listForUser(userId);
  },
  async create(input: CreateNotificationInput) {
    await usersService.get(input.userId);
    return notificationsRepository.create(input);
  },
  async markRead(id: string, userId: string) {
    const notification = await notificationsRepository.findById(id);
    if (!notification || notification.userId !== userId) {
      throw new AppError("Notification not found", 404, "NOTIFICATION_NOT_FOUND");
    }
    return notificationsRepository.markRead(id);
  }
};
