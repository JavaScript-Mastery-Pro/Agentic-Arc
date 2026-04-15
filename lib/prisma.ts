import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = global as unknown as {
  prisma: PrismaClient | undefined;
};

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is not set.");
}

const createPrismaClient = () =>
  databaseUrl.startsWith("prisma+postgres://")
    ? new PrismaClient({
        accelerateUrl: databaseUrl,
      })
    : new PrismaClient({
        adapter: new PrismaPg({
          connectionString: databaseUrl,
        }),
      });

const cachedPrisma = globalForPrisma.prisma;
const prisma =
  cachedPrisma && "project" in cachedPrisma
    ? cachedPrisma
    : createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
export default prisma;
