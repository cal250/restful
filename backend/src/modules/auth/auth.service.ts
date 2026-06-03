import { AppError } from "../../common/errors/app-error.js";
import { authRepository } from "./auth.repository.js";
import { AuthResult, SafeUser } from "./auth.types.js";
import { LoginInput, RegisterInput } from "./auth.validation.js";
import { passwordService } from "./password.service.js";
import { tokenService } from "./token.service.js";

/** Strips sensitive fields and returns only safe user attributes. */
function toSafeUser(user: SafeUser): SafeUser {
  const { id, email, firstName, lastName, role } = user;
  return { id, email, firstName, lastName, role };
}

/** Creates a signed access token, persists the session, and returns auth payload. */
async function authResult(user: SafeUser): Promise<AuthResult> {
  const tokenId = tokenService.createTokenId();
  const token = tokenService.signAccessToken(user.id, user.role, tokenId);
  await authRepository.createSession(user.id, tokenId, tokenService.getExpiry(token));
  return { user: toSafeUser(user), token };
}

export const authService = {
  /** Registers a new user account and returns an authenticated session. */
  async register(input: RegisterInput): Promise<AuthResult> {
    const existing = await authRepository.findUserByEmail(input.email);
    if (existing) throw new AppError("Email already exists", 409, "USER_EMAIL_EXISTS");
    const passwordHash = await passwordService.hash(input.password);
    const { email, firstName, lastName } = input;
    const user = await authRepository.createUser({ email, firstName, lastName, passwordHash });
    return authResult(user);
  },

  /** Validates credentials and returns an authenticated session. */
  async login(input: LoginInput): Promise<AuthResult> {
    const user = await authRepository.findUserByEmail(input.email);
    const valid = user && await passwordService.verify(input.password, user.passwordHash);
    if (!valid) throw new AppError("Invalid email or password", 401, "INVALID_CREDENTIALS");
    if (!user.isActive) throw new AppError("Account is inactive", 403, "ACCOUNT_INACTIVE");
    return authResult(user);
  },

  /** Creates a password reset token when the email matches an existing user. */
  async forgotPassword(email: string): Promise<string | undefined> {
    const user = await authRepository.findUserByEmail(email);
    if (!user) return undefined;
    const { token, tokenHash } = tokenService.createResetToken();
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000);
    await authRepository.createResetToken(user.id, tokenHash, expiresAt);
    return token;
  },

  /** Applies a new password using a valid, unexpired reset token. */
  async resetPassword(token: string, password: string): Promise<void> {
    const record = await authRepository.findResetToken(tokenService.hashResetToken(token));
    const invalid = !record || record.usedAt || record.expiresAt <= new Date();
    if (invalid) throw new AppError("Reset token is invalid or expired", 400, "INVALID_RESET_TOKEN");
    await authRepository.resetPassword(record.userId, record.id, await passwordService.hash(password));
  },

  /** Revokes the active session associated with the given token ID. */
  async logout(tokenId: string): Promise<void> {
    await authRepository.revokeSession(tokenId);
  }
};
