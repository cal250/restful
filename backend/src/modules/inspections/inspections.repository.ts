import { Prisma } from "@prisma/client";
import { prisma } from "../../config/prisma.js";
import { InspectionQuery } from "./inspections.validation.js";

const include = { extinguisher: true, scheduledBy: { select: { id: true, firstName: true, lastName: true } } };

export const inspectionsRepository = {
  /** Marks scheduled inspections past the cutoff date as overdue. */
  markOverdue(cutoff: Date) {
    return prisma.inspection.updateMany({
      where: { status: "SCHEDULED", inspectionDate: { lt: cutoff } },
      data: { status: "OVERDUE" }
    });
  },

  /** Reads inspections matching optional status and extinguisher filters. */
  list(query: InspectionQuery) {
    return prisma.inspection.findMany({ where: query, include, orderBy: { inspectionDate: "desc" } });
  },

  /** Reads one inspection by primary key with related records. */
  findById(id: string) {
    return prisma.inspection.findUnique({ where: { id }, include });
  },

  /** Persists a newly scheduled inspection. */
  create(data: Prisma.InspectionUncheckedCreateInput) {
    return prisma.inspection.create({ data, include });
  },

  /** Persists changes to an existing inspection record. */
  update(id: string, data: Prisma.InspectionUpdateInput) {
    return prisma.inspection.update({ where: { id }, data, include });
  }
};
