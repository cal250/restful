import { AppError } from "../../common/errors/app-error.js";
import { extinguishersService } from "../extinguishers/extinguishers.service.js";
import { maintenanceRepository } from "./maintenance.repository.js";
import { CreateMaintenanceInput, MaintenanceQuery } from "./maintenance.validation.js";

export const maintenanceService = {
  /** Returns maintenance records filtered by extinguisher ID. */
  list(query: MaintenanceQuery) {
    return maintenanceRepository.list(query);
  },

  /** Returns a single maintenance record by UUID. */
  async get(id: string) {
    const record = await maintenanceRepository.findById(id);
    if (!record) throw new AppError("Maintenance record not found", 404, "MAINTENANCE_NOT_FOUND");
    return record;
  },

  /** Logs a maintenance action for a verified extinguisher. */
  async create(input: CreateMaintenanceInput, recordedById: string) {
    await extinguishersService.get(input.extinguisherId);
    return maintenanceRepository.create({ ...input, recordedById });
  }
};
