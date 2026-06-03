import { AppError } from "../../common/errors/app-error.js";
import { extinguishersService } from "../extinguishers/extinguishers.service.js";
import { notificationsService } from "../notifications/notifications.service.js";
import { inspectionsRepository } from "./inspections.repository.js";
import { InspectionQuery, ScheduleInspectionInput, UpdateInspectionInput } from "./inspections.validation.js";

async function requireInspection(id: string) {
  const inspection = await inspectionsRepository.findById(id);
  if (!inspection) throw new AppError("Inspection not found", 404, "INSPECTION_NOT_FOUND");
  return inspection;
}

export const inspectionsService = {
  async list(query: InspectionQuery) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    await inspectionsRepository.markOverdue(today);
    return inspectionsRepository.list(query);
  },
  get(id: string) {
    return requireInspection(id);
  },
  async schedule(input: ScheduleInspectionInput, scheduledById: string) {
    await extinguishersService.get(input.extinguisherId);
    const inspection = await inspectionsRepository.create({ ...input, scheduledById });
    await notificationsService.create({
      userId: scheduledById,
      title: "Inspection scheduled",
      message: `Inspection scheduled for ${input.inspectionDate.toISOString().slice(0, 10)} at ${input.inspectionTime}.`
    });
    return inspection;
  },
  async update(id: string, input: UpdateInspectionInput) {
    await requireInspection(id);
    if (input.status === "COMPLETED" && !input.result) {
      throw new AppError("A result is required to complete an inspection", 400, "RESULT_REQUIRED");
    }
    return inspectionsRepository.update(id, input);
  }
};
