import { AppError } from "../../common/errors/app-error.js";
import { passwordService } from "../auth/password.service.js";
import { UpdateProfileInput, UpdateUserInput } from "./users.validation.js";
import { usersRepository } from "./users.repository.js";

/** Loads a user or responds with a not-found error. */
async function requireUser(id: string) {
  const user = await usersRepository.findById(id);
  if (!user) throw new AppError("User not found", 404, "USER_NOT_FOUND");
  return user;
}

export const usersService = {
  /** Returns all users ordered by creation date. */
  list() {
    return usersRepository.list();
  },

  /** Returns a single user record by UUID. */
  get(id: string) {
    return requireUser(id);
  },

  /** Updates an existing user while preserving account constraints. */
  async update(id: string, input: UpdateUserInput) {
    await requireUser(id);
    return usersRepository.update(id, input);
  },

  /** Deletes a user account, preventing self-deletion. */
  async remove(id: string, actorId: string) {
    if (id === actorId) throw new AppError("You cannot delete your own account", 400, "SELF_DELETE_FORBIDDEN");
    await requireUser(id);
    return usersRepository.delete(id);
  },

  /** Updates the authenticated user's own profile fields. */
  async updateProfile(id: string, input: UpdateProfileInput) {
    await requireUser(id);
    return usersRepository.update(id, input);
  },

  /** Verifies the current password and stores a new hash. */
  async changePassword(id: string, currentPassword: string, newPassword: string) {
    const user = await usersRepository.findWithPassword(id);
    if (!user) throw new AppError("User not found", 404, "USER_NOT_FOUND");
    const valid = await passwordService.verify(currentPassword, user.passwordHash);
    if (!valid) throw new AppError("Current password is incorrect", 400, "INVALID_CURRENT_PASSWORD");
    await usersRepository.updatePassword(id, await passwordService.hash(newPassword));
  }
};
