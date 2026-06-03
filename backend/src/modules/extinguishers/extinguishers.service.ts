import { ExtinguisherStatus } from "@prisma/client";
import { AppError } from "../../common/errors/app-error.js";
import { extinguishersRepository } from "./extinguishers.repository.js";
import {
  collectExtinguisherDateIssues,
  CreateExtinguisherInput,
  ExtinguisherQuery,
  UpdateExtinguisherInput
} from "./extinguishers.validation.js";

/** Throws when installation, expiry, or status dates break extinguisher business rules. */
function assertExtinguisherDates(
  installationDate: Date,
  expiryDate: Date,
  status: UpdateExtinguisherInput["status"] | CreateExtinguisherInput["status"]
): void {
  const issue = collectExtinguisherDateIssues(installationDate, expiryDate, status!)[0];
  if (issue) throw new AppError(issue.message, 400, "INVALID_EXTINGUISHER_DATES");
}

/** Loads an extinguisher or responds with a not-found error. */
async function requireExtinguisher(id: string) {
  const extinguisher = await extinguishersRepository.findById(id);
  if (!extinguisher) throw new AppError("Fire extinguisher not found", 404, "EXTINGUISHER_NOT_FOUND");
  return extinguisher;
}

export const extinguishersService = {
  /** Returns extinguishers filtered by search text, status, and/or type. */
  list(query: ExtinguisherQuery) {
    return extinguishersRepository.list(query);
  },

  /** Returns a single extinguisher record by its UUID. */
  get(id: string) {
    return requireExtinguisher(id);
  },

  /** Registers a new extinguisher and links it to the authenticated user. */
  async create(input: CreateExtinguisherInput, registeredById: string) {
    if (input.status === ExtinguisherStatus.EXPIRED) {
      throw new AppError("New extinguishers cannot be registered with an expired status", 400, "INVALID_REGISTRATION_STATUS");
    }
    const existing = await extinguishersRepository.findBySerialNumber(input.serialNumber);
    if (existing) throw new AppError("Serial number already exists", 409, "SERIAL_NUMBER_EXISTS");
    assertExtinguisherDates(input.installationDate, input.expiryDate, input.status);
    return extinguishersRepository.create({ ...input, registeredById });
  },

  /** Updates an existing extinguisher while preserving date and serial constraints. */
  async update(id: string, input: UpdateExtinguisherInput) {
    const current = await requireExtinguisher(id);
    if (input.serialNumber && input.serialNumber !== current.serialNumber) {
      const existing = await extinguishersRepository.findBySerialNumber(input.serialNumber);
      if (existing) throw new AppError("Serial number already exists", 409, "SERIAL_NUMBER_EXISTS");
    }
    const installation = input.installationDate ?? current.installationDate;
    const expiry = input.expiryDate ?? current.expiryDate;
    const status = input.status ?? current.status;
    assertExtinguisherDates(installation, expiry, status);
    return extinguishersRepository.update(id, input);
  },

  /** Permanently removes an extinguisher from inventory. */
  async remove(id: string) {
    await requireExtinguisher(id);
    return extinguishersRepository.remove(id);
  }
};
