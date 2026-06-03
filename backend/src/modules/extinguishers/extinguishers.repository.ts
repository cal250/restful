import { Prisma } from "@prisma/client";
import { prisma } from "../../config/prisma.js";
import { ExtinguisherQuery } from "./extinguishers.validation.js";

/** Builds a Prisma filter from optional search, status, and type query params. */
function where(query: ExtinguisherQuery): Prisma.FireExtinguisherWhereInput {
  return {
    status: query.status,
    type: query.type,
    OR: query.search ? [
      { serialNumber: { contains: query.search, mode: "insensitive" } },
      { location: { contains: query.search, mode: "insensitive" } }
    ] : undefined
  };
}

export const extinguishersRepository = {
  /** Reads extinguishers that match the supplied filters. */
  list(query: ExtinguisherQuery) {
    return prisma.fireExtinguisher.findMany({ where: where(query), orderBy: { createdAt: "desc" } });
  },

  /** Reads one extinguisher by primary key. */
  findById(id: string) {
    return prisma.fireExtinguisher.findUnique({ where: { id } });
  },

  /** Reads one extinguisher by unique serial number. */
  findBySerialNumber(serialNumber: string) {
    return prisma.fireExtinguisher.findUnique({ where: { serialNumber } });
  },

  /** Persists a new extinguisher record. */
  create(data: Prisma.FireExtinguisherUncheckedCreateInput) {
    return prisma.fireExtinguisher.create({ data });
  },

  /** Persists changes to an existing extinguisher record. */
  update(id: string, data: Prisma.FireExtinguisherUpdateInput) {
    return prisma.fireExtinguisher.update({ where: { id }, data });
  },

  /** Deletes an extinguisher record. */
  remove(id: string) {
    return prisma.fireExtinguisher.delete({ where: { id } });
  }
};
