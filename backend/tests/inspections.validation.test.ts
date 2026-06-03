import { describe, expect, it } from "vitest";
import { scheduleInspectionSchema } from "../src/modules/inspections/inspections.validation.js";

describe("inspection validation", () => {
  it("accepts a 24-hour inspection time", () => {
    expect(scheduleInspectionSchema.safeParse({
      extinguisherId: "123e4567-e89b-12d3-a456-426614174000",
      inspectionDate: "2026-07-01",
      inspectionTime: "14:30"
    }).success).toBe(true);
  });

  it("rejects invalid inspection times", () => {
    expect(scheduleInspectionSchema.safeParse({
      extinguisherId: "123e4567-e89b-12d3-a456-426614174000",
      inspectionDate: "2026-07-01",
      inspectionTime: "25:00"
    }).success).toBe(false);
  });
});
