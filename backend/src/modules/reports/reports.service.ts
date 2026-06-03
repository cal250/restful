import { reportsRepository } from "./reports.repository.js";

function periodBounds(now: Date) {
  return {
    day: [new Date(now.getFullYear(), now.getMonth(), now.getDate()), new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)] as const,
    month: [new Date(now.getFullYear(), now.getMonth(), 1), new Date(now.getFullYear(), now.getMonth() + 1, 1)] as const,
    year: [new Date(now.getFullYear(), 0, 1), new Date(now.getFullYear() + 1, 0, 1)] as const
  };
}

export const reportsService = {
  async dashboard() {
    const now = new Date();
    const bounds = periodBounds(now);
    const upcoming = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const values = await Promise.all([
      reportsRepository.extinguisherCount(),
      reportsRepository.extinguisherCreatedBetween(...bounds.day),
      reportsRepository.extinguisherCreatedBetween(...bounds.month),
      reportsRepository.extinguisherCreatedBetween(...bounds.year),
      reportsRepository.inspectionCount("SCHEDULED"),
      reportsRepository.inspectionCount("COMPLETED"),
      reportsRepository.inspectionCount("OVERDUE"),
      reportsRepository.expiredCount(now),
      reportsRepository.upcomingExpiryCount(now, upcoming),
      reportsRepository.maintenanceCount(),
      reportsRepository.recentMaintenance()
    ]);
    return this.format(values);
  },

  format(values: unknown[]) {
    const [total, daily, monthly, yearly, pending, completed, overdue, expired, upcoming, maintenanceFrequency, recentMaintenance] = values;
    const compliant = Number(total) - Number(expired);
    const complianceRate = Number(total) ? Math.round((compliant / Number(total)) * 100) : 100;
    return {
      inventory: { total, daily, monthly, yearly },
      inspections: { pending, completed, overdue },
      compliance: { expired, upcoming, compliant, complianceRate },
      maintenance: { maintenanceFrequency, recentMaintenance }
    };
  }
};
