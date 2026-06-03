import { Role } from "@prisma/client";
import { describe, expect, it } from "vitest";
import { tokenService } from "../src/modules/auth/token.service.js";

describe("tokenService", () => {
  it("signs, verifies, and decodes access tokens", () => {
    const token = tokenService.signAccessToken("user-id", Role.ADMIN, "token-id");
    expect(tokenService.verifyAccessToken(token)).toMatchObject({ sub: "user-id", role: Role.ADMIN, jti: "token-id" });
    expect(tokenService.getExpiry(token)).toBeInstanceOf(Date);
  });

  it("creates and hashes reset tokens", () => {
    const reset = tokenService.createResetToken();
    expect(reset.token).toHaveLength(64);
    expect(reset.tokenHash).toBe(tokenService.hashResetToken(reset.token));
    expect(tokenService.createTokenId()).toBeTruthy();
  });
});
