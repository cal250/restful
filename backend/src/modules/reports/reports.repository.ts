import { prisma } from "../../config/prisma.js";

export const reportsRepository = {
  /** Counts all fire extinguishers in inventory. */
  extinguisherCount() { return prisma.fireExtinguisher.count(); },

  /** Counts extinguishers registered within a date range. */
  extinguisherCreatedBetween(start: Date, end: Date) {
    return prisma.fireExtinguisher.count({ where: { createdAt: { gte: start, lt: end } } });
  },

  /** Counts inspections with the given status. */
  inspectionCount(status: "SCHEDULED" | "COMPLETED" | "OVERDUE") {
    return prisma.inspection.count({ where: { status } });
  },

  /** Counts extinguishers whose expiry date is before now. */
  expiredCount(now: Date) {
    return prisma.fireExtinguisher.count({ where: { expiryDate: { lt: now } } });
  },

  /** Counts extinguishers expiring within the given window. */
  upcomingExpiryCount(now: Date, until: Date) {
    return prisma.fireExtinguisher.count({ where: { expiryDate: { gte: now, lte: until } } });
  },

  /** Counts all maintenance records. */
  maintenanceCount() { return prisma.maintenanceRecord.count(); },

  /** Returns the ten most recent maintenance records with extinguisher details. */
  recentMaintenance() {
    return prisma.maintenanceRecord.findMany({
      take: 10, orderBy: { maintenanceDate: "desc" },
      include: { extinguisher: { select: { serialNumber: true, location: true } } }
    });
  }
};
