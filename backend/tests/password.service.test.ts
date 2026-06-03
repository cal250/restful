import { describe, expect, it } from "vitest";
import { passwordService } from "../src/modules/auth/password.service.js";

describe("passwordService", () => {
  it("hashes and verifies passwords", async () => {
    const hash = await passwordService.hash("SecurePass1");
    expect(hash).not.toBe("SecurePass1");
    await expect(passwordService.verify("SecurePass1", hash)).resolves.toBe(true);
    await expect(passwordService.verify("WrongPass1", hash)).resolves.toBe(false);
  });
});
