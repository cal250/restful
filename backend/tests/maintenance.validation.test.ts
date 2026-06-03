import { describe, expect, it } from "vitest";
import { createMaintenanceSchema } from "../src/modules/maintenance/maintenance.validation.js";

describe("maintenance validation", () => {
  it("requires an action taken", () => {
    expect(createMaintenanceSchema.safeParse({
      extinguisherId: "123e4567-e89b-12d3-a456-426614174000",
      maintenanceDate: "2026-06-03"
    }).success).toBe(false);
  });
});
