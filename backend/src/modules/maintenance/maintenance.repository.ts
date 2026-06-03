import { Prisma } from "@prisma/client";
import { prisma } from "../../config/prisma.js";
import { MaintenanceQuery } from "./maintenance.validation.js";

const include = { extinguisher: true, recordedBy: { select: { id: true, firstName: true, lastName: true } } };

export const maintenanceRepository = {
  list(query: MaintenanceQuery) {
    return prisma.maintenanceRecord.findMany({
      where: query, include, orderBy: { maintenanceDate: "desc" }
    });
  },
  findById(id: string) {
    return prisma.maintenanceRecord.findUnique({ where: { id }, include });
  },
  create(data: Prisma.MaintenanceRecordUncheckedCreateInput) {
    return prisma.maintenanceRecord.create({ data, include });
  }
};
