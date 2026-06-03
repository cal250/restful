import { describe, expect, it } from "vitest";
import { collectExtinguisherDateIssues, createExtinguisherSchema } from "../src/modules/extinguishers/extinguishers.validation.js";

const input = {
  serialNumber: "TZW-001",
  location: "Reception",
  type: "CO2",
  size: "5 lbs.",
  installationDate: "2026-01-01",
  expiryDate: "2031-01-01",
  status: "ACTIVE"
};

describe("extinguisher validation", () => {
  it("accepts a valid extinguisher", () => {
    expect(createExtinguisherSchema.safeParse(input).success).toBe(true);
  });

  it("rejects expiry before installation", () => {
    expect(createExtinguisherSchema.safeParse({ ...input, expiryDate: "2025-01-01" }).success).toBe(false);
  });

  it("rejects installation dates in the future", () => {
    const future = new Date();
    future.setUTCFullYear(future.getUTCFullYear() + 1);
    const installationDate = future.toISOString().slice(0, 10);
    const expiryDate = new Date(future);
    expiryDate.setUTCFullYear(expiryDate.getUTCFullYear() + 5);

    expect(createExtinguisherSchema.safeParse({
      ...input,
      installationDate,
      expiryDate: expiryDate.toISOString().slice(0, 10)
    }).success).toBe(false);
  });

  it("rejects active extinguishers that are already expired", () => {
    expect(createExtinguisherSchema.safeParse({
      ...input,
      installationDate: "2020-01-01",
      expiryDate: "2021-01-01",
      status: "ACTIVE"
    }).success).toBe(false);
  });

  it("rejects expired status when registering a new extinguisher", () => {
    expect(createExtinguisherSchema.safeParse({
      ...input,
      installationDate: "2020-01-01",
      expiryDate: "2021-01-01",
      status: "EXPIRED"
    }).success).toBe(false);
  });

  it("rejects unsupported sizes", () => {
    expect(createExtinguisherSchema.safeParse({ ...input, size: "5kg" }).success).toBe(false);
  });

  it("collects multiple date issues", () => {
    const issues = collectExtinguisherDateIssues(
      new Date("2020-01-01"),
      new Date("2019-01-01"),
      "ACTIVE"
    );
    expect(issues.some((issue) => issue.message.includes("after installation"))).toBe(true);
    expect(issues.some((issue) => issue.message.includes("already expired"))).toBe(true);
  });
});
