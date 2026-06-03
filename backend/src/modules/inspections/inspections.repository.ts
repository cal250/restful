import { Prisma } from "@prisma/client";
import { prisma } from "../../config/prisma.js";
import { InspectionQuery } from "./inspections.validation.js";

const include = { extinguisher: true, scheduledBy: { select: { id: true, firstName: true, lastName: true } } };

export const inspectionsRepository = {
  markOverdue(cutoff: Date) {
    return prisma.inspection.updateMany({
      where: { status: "SCHEDULED", inspectionDate: { lt: cutoff } },
      data: { status: "OVERDUE" }
    });
  },
  list(query: InspectionQuery) {
    return prisma.inspection.findMany({ where: query, include, orderBy: { inspectionDate: "desc" } });
  },
  findById(id: string) {
    return prisma.inspection.findUnique({ where: { id }, include });
  },
  create(data: Prisma.InspectionUncheckedCreateInput) {
    return prisma.inspection.create({ data, include });
  },
  update(id: string, data: Prisma.InspectionUpdateInput) {
    return prisma.inspection.update({ where: { id }, data, include });
  }
};
