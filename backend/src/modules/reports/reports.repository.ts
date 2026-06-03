import { prisma } from "../../config/prisma.js";

export const reportsRepository = {
  extinguisherCount() { return prisma.fireExtinguisher.count(); },
  extinguisherCreatedBetween(start: Date, end: Date) {
    return prisma.fireExtinguisher.count({ where: { createdAt: { gte: start, lt: end } } });
  },
  inspectionCount(status: "SCHEDULED" | "COMPLETED" | "OVERDUE") {
    return prisma.inspection.count({ where: { status } });
  },
  expiredCount(now: Date) {
    return prisma.fireExtinguisher.count({ where: { expiryDate: { lt: now } } });
  },
  upcomingExpiryCount(now: Date, until: Date) {
    return prisma.fireExtinguisher.count({ where: { expiryDate: { gte: now, lte: until } } });
  },
  maintenanceCount() { return prisma.maintenanceRecord.count(); },
  recentMaintenance() {
    return prisma.maintenanceRecord.findMany({
      take: 10, orderBy: { maintenanceDate: "desc" },
      include: { extinguisher: { select: { serialNumber: true, location: true } } }
    });
  }
};
