import { PrismaClient } from "@prisma/client";

// Cliente único: en `next dev` cada recarga vuelve a evaluar los módulos, y sin
// esta caché se abriría una conexión nueva en cada una.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
