/** Shared domain types and constants for fire extinguisher management. */
export const EXTINGUISHER_SIZES = ["2.5 lbs.", "5 lbs.", "9 lbs.", "12 lbs."] as const;

export type Role = "ADMIN" | "INSPECTOR" | "USER";
export type User = { id: string; email: string; firstName: string; lastName: string; role: Role; isActive?: boolean };
export type Extinguisher = {
  id: string; serialNumber: string; location: string; type: string; size: string;
  installationDate: string; expiryDate: string; status: string;
};
export type Inspection = {
  id: string; inspectionDate: string; inspectionTime: string; status: string;
  result?: string; extinguisher: Extinguisher;
};
export type Maintenance = {
  id: string; actionTaken: string; maintenanceDate: string; issuesIdentified?: string;
  extinguisher: Extinguisher;
};
