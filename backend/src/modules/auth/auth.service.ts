import { AppError } from "../../common/errors/app-error.js";
import { emailService } from "../../common/email/email.service.js";
import { authRepository } from "./auth.repository.js";
import { AuthResult, SafeUser } from "./auth.types.js";
import { LoginInput, RegisterInput, VerifyRegistrationOtpInput } from "./auth.validation.js";
import { passwordService } from "./password.service.js";
import { tokenService } from "./token.service.js";

const REGISTRATION_OTP_MINUTES = 10;
const MAX_REGISTRATION_OTP_ATTEMPTS = 5;

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

/** Loads a pending registration OTP or throws when it is missing or expired. */
async function requireRegistrationOtp(email: string) {
  const record = await authRepository.findRegistrationOtp(email);
  if (!record || record.expiresAt <= new Date()) {
    throw new AppError("Verification code is invalid or expired", 400, "INVALID_REGISTRATION_OTP");
  }
  if (record.attempts >= MAX_REGISTRATION_OTP_ATTEMPTS) {
    throw new AppError("Too many invalid verification attempts", 429, "REGISTRATION_OTP_LOCKED");
  }
  return record;
}

export const authService = {
  /** Stores a pending registration and issues a one-time verification code. */
  async register(input: RegisterInput) {
    const existing = await authRepository.findUserByEmail(input.email);
    if (existing) throw new AppError("Email already exists", 409, "USER_EMAIL_EXISTS");

    const { otp } = tokenService.createRegistrationOtp();
    const expiresAt = new Date(Date.now() + REGISTRATION_OTP_MINUTES * 60 * 1000);
    await authRepository.upsertRegistrationOtp({
      email: input.email,
      passwordHash: await passwordService.hash(input.password),
      firstName: input.firstName,
      lastName: input.lastName,
      otp,
      expiresAt
    });
    await emailService.sendRegistrationOtp(input.email, otp, REGISTRATION_OTP_MINUTES);

    return {
      email: input.email,
      expiresInMinutes: REGISTRATION_OTP_MINUTES
    };
  },

  /** Verifies a registration OTP and creates the user account. */
  async verifyRegistrationOtp(input: VerifyRegistrationOtpInput): Promise<AuthResult> {
    const existing = await authRepository.findUserByEmail(input.email);
    if (existing) throw new AppError("Email already exists", 409, "USER_EMAIL_EXISTS");

    const record = await requireRegistrationOtp(input.email);
    if (record.otp !== input.otp) {
      await authRepository.incrementRegistrationOtpAttempts(input.email);
      throw new AppError("Verification code is invalid or expired", 400, "INVALID_REGISTRATION_OTP");
    }

    const user = await authRepository.createUser({
      email: record.email,
      passwordHash: record.passwordHash,
      firstName: record.firstName,
      lastName: record.lastName
    });
    await authRepository.deleteRegistrationOtp(record.email);
    return authResult(user);
  },

  /** Reissues a registration OTP for a pending signup. */
  async resendRegistrationOtp(email: string) {
    const record = await requireRegistrationOtp(email);
    const { otp } = tokenService.createRegistrationOtp();
    const expiresAt = new Date(Date.now() + REGISTRATION_OTP_MINUTES * 60 * 1000);
    await authRepository.upsertRegistrationOtp({
      email: record.email,
      passwordHash: record.passwordHash,
      firstName: record.firstName,
      lastName: record.lastName,
      otp,
      expiresAt
    });
    await emailService.sendRegistrationOtp(record.email, otp, REGISTRATION_OTP_MINUTES);
    return {
      email: record.email,
      expiresInMinutes: REGISTRATION_OTP_MINUTES
    };
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
    await emailService.sendPasswordReset(user.email, token);
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
