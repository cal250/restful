import { describe, expect, it } from "vitest";
import { changePasswordSchema, updateProfileSchema, updateUserSchema } from "../src/modules/users/users.validation.js";

describe("user validation", () => {
  it("requires at least one update field", () => {
    expect(updateUserSchema.safeParse({}).success).toBe(false);
  });

  it("accepts profile name updates", () => {
    expect(updateProfileSchema.safeParse({ firstName: "Jane" }).success).toBe(true);
  });

  it("rejects weak new passwords", () => {
    expect(changePasswordSchema.safeParse({
      currentPassword: "OldPass1", newPassword: "weak"
    }).success).toBe(false);
  });

  it("rejects reusing the current password", () => {
    expect(changePasswordSchema.safeParse({
      currentPassword: "OldPass1", newPassword: "OldPass1"
    }).success).toBe(false);
  });
});
