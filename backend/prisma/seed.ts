import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

/** Creates or reuses the default system administrator account. */
async function seedAdmin() {
  const passwordHash = await bcrypt.hash("ChangeMe123!", 12);
  return prisma.user.upsert({
    where: { email: "admin@tzwltd.com" },
    update: {},
    create: {
      email: "admin@tzwltd.com",
      passwordHash,
      firstName: "System",
      lastName: "Administrator",
      role: Role.ADMIN
    }
  });
}

/** Seeds demo extinguisher, inspection, and maintenance records for local development. */
async function seedDemoData(): Promise<void> {
  const admin = await seedAdmin();
  const extinguisher = await prisma.fireExtinguisher.upsert({
    where: { serialNumber: "TZW-DEMO-001" },
    update: { size: "5 lbs." },
    create: {
      serialNumber: "TZW-DEMO-001", location: "Main Reception", type: "CO2",
      size: "5 lbs.", installationDate: new Date("2026-01-15"), expiryDate: new Date("2031-01-15"),
      status: "ACTIVE", registeredById: admin.id
    }
  });
  const inspection = await prisma.inspection.findFirst({ where: { extinguisherId: extinguisher.id } });
  if (!inspection) await prisma.inspection.create({
    data: { extinguisherId: extinguisher.id, scheduledById: admin.id, inspectionDate: new Date("2026-07-01"), inspectionTime: "10:00" }
  });
  const maintenance = await prisma.maintenanceRecord.findFirst({ where: { extinguisherId: extinguisher.id } });
  if (!maintenance) await prisma.maintenanceRecord.create({
    data: { extinguisherId: extinguisher.id, recordedById: admin.id, actionTaken: "Initial commissioning check", maintenanceDate: new Date("2026-01-15") }
  });
}

seedDemoData()
  .then(() => console.log("Seed data created."))
  .finally(() => prisma.$disconnect());
