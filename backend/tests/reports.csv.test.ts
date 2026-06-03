import { describe, expect, it } from "vitest";
import { reportToCsv } from "../src/modules/reports/csv-export.service.js";

describe("reportToCsv", () => {
  it("exports scalar report metrics", () => {
    const csv = reportToCsv({ inventory: { total: 5 }, maintenance: { recent: [] } });
    expect(csv).toContain('"inventory","total","5"');
    expect(csv).not.toContain("recent");
  });
});
