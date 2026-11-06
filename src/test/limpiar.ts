import type { PrismaClient } from "@prisma/client";
import { exigirBaseDePruebas } from "./guard";

const TABLAS = [
  "Aviso",
  "LineaNomina",
  "CasoRegresion",
  "CorridaRegresion",
  "VersionMotor",
  "Propuesta",
  "Norma",
  "Periodo",
  "Empleado",
  "Empresa",
];

// Vacía todas las tablas del esquema de pruebas. Se niega a correr fuera de schema=test.
export async function limpiarBaseDePruebas(db: PrismaClient): Promise<void> {
  exigirBaseDePruebas(process.env.DATABASE_URL);
  const lista = TABLAS.map((t) => `"${t}"`).join(", ");
  await db.$executeRawUnsafe(`TRUNCATE TABLE ${lista} CASCADE`);
}
