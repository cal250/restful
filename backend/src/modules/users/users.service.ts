import { AppError } from "../../common/errors/app-error.js";
import { passwordService } from "../auth/password.service.js";
import { UpdateProfileInput, UpdateUserInput } from "./users.validation.js";
import { usersRepository } from "./users.repository.js";

async function requireUser(id: string) {
  const user = await usersRepository.findById(id);
  if (!user) throw new AppError("User not found", 404, "USER_NOT_FOUND");
  return user;
}

export const usersService = {
  list() {
    return usersRepository.list();
  },

  get(id: string) {
    return requireUser(id);
  },

  async update(id: string, input: UpdateUserInput) {
    await requireUser(id);
    return usersRepository.update(id, input);
  },

  async remove(id: string, actorId: string) {
    if (id === actorId) throw new AppError("You cannot delete your own account", 400, "SELF_DELETE_FORBIDDEN");
    await requireUser(id);
    return usersRepository.delete(id);
  },

  async updateProfile(id: string, input: UpdateProfileInput) {
    await requireUser(id);
    return usersRepository.update(id, input);
  },

  async changePassword(id: string, currentPassword: string, newPassword: string) {
    const user = await usersRepository.findWithPassword(id);
    if (!user) throw new AppError("User not found", 404, "USER_NOT_FOUND");
    const valid = await passwordService.verify(currentPassword, user.passwordHash);
    if (!valid) throw new AppError("Current password is incorrect", 400, "INVALID_CURRENT_PASSWORD");
    await usersRepository.updatePassword(id, await passwordService.hash(newPassword));
  }
};
