/** Escapes a value for safe inclusion in a CSV field. */
function escape(value: unknown): string {
  return `"${String(value).replaceAll('"', '""')}"`;
}

/** Serializes dashboard report metrics into CSV rows. */
export function reportToCsv(report: Record<string, Record<string, unknown>>): string {
  const rows = ["section,metric,value"];
  for (const [section, metrics] of Object.entries(report)) {
    for (const [metric, value] of Object.entries(metrics)) {
      if (!Array.isArray(value)) rows.push([section, metric, value].map(escape).join(","));
    }
  }
  return rows.join("\n");
}
