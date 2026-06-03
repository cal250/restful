import { describe, expect, it } from "vitest";
import { createNotificationSchema } from "../src/modules/notifications/notifications.validation.js";

describe("notification validation", () => {
  it("requires a user, title, and message", () => {
    expect(createNotificationSchema.safeParse({ title: "Hello" }).success).toBe(false);
  });
});
