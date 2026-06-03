import { app } from "./app.js";
import { env } from "./config/env.js";
import { prisma } from "./config/prisma.js";

const server = app.listen(env.PORT, () => {
  console.log(`TZW API listening on port ${env.PORT}`);
});

/** Closes the HTTP server and disconnects the database client. */
async function shutdown(): Promise<void> {
  server.close();
  await prisma.$disconnect();
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
