import { RequestHandler } from "express";
import { success } from "../../common/http/api-response.js";
import { reportToCsv } from "./csv-export.service.js";
import { reportToPdf } from "./pdf-export.service.js";
import { reportsService } from "./reports.service.js";

/** Returns aggregated dashboard metrics for inventory, inspections, and compliance. */
export const dashboard: RequestHandler = async (_req, res, next) => {
  try { res.json(success(await reportsService.dashboard())); } catch (error) { next(error); }
};

/** Streams dashboard metrics as a downloadable CSV file. */
export const csv: RequestHandler = async (_req, res, next) => {
  try {
    res.attachment("fire-extinguisher-report.csv");
    res.type("text/csv").send(reportToCsv(await reportsService.dashboard()));
  } catch (error) { next(error); }
};

/** Streams dashboard metrics as a downloadable PDF file. */
export const pdf: RequestHandler = async (_req, res, next) => {
  try {
    res.attachment("fire-extinguisher-report.pdf");
    res.type("application/pdf");
    const document = reportToPdf(await reportsService.dashboard());
    document.pipe(res);
    document.end();
  } catch (error) { next(error); }
};
