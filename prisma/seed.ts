// npm run db:seed: restablece el estado inicial del demo (T04).
// Vacía todas las tablas y vuelve a crear la escena en una sola transacción, así que
// correrlo dos veces, o tras un recorrido, deja exactamente el mismo estado.
// No crea normas, propuestas, corridas, avisos ni la versión 2026 (BR-01).
import { PrismaClient } from "@prisma/client";
import {
  CASOS_REGRESION,
  EMPLEADOS,
  EMPRESAS,
  LINEAS_NOMINA,
  PERIODOS,
  VERSION_2025,
} from "./seed-data";

const fecha = (iso: string) => new Date(`${iso}T00:00:00.000Z`);

export async function sembrar(db: PrismaClient): Promise<void> {
  await db.$transaction([
    // Limpieza previa, de hijos a padres.
    db.aviso.deleteMany(),
    db.lineaNomina.deleteMany(),
    db.casoRegresion.deleteMany(),
    db.corridaRegresion.deleteMany(),
    db.versionMotor.deleteMany(),
    db.propuesta.deleteMany(),
    db.norma.deleteMany(),
    db.periodo.deleteMany(),
    db.empleado.deleteMany(),
    db.empresa.deleteMany(),

    // Escena inicial.
    db.empresa.createMany({ data: [...EMPRESAS] }),
    db.empleado.createMany({
      data: EMPLEADOS.map((e) => ({ ...e, fechaIngreso: fecha(e.fechaIngreso) })),
    }),
    db.periodo.createMany({ data: [...PERIODOS] }),
    db.versionMotor.create({
      data: { ...VERSION_2025, vigenteDesde: fecha(VERSION_2025.vigenteDesde) },
    }),
    db.lineaNomina.createMany({ data: LINEAS_NOMINA }),
    db.casoRegresion.createMany({ data: [...CASOS_REGRESION] }),
  ]);
}

// Solo se ejecuta como script, no cuando una prueba importa `sembrar`.
const comoScript = (process.argv[1] ?? "").replace(/\\/g, "/").endsWith("prisma/seed.ts");

if (comoScript) {
  const db = new PrismaClient();
  sembrar(db)
    .then(() => console.log("Seed listo: estado inicial del demo restablecido."))
    .catch((error) => {
      console.error(error);
      process.exitCode = 1;
    })
    .finally(() => db.$disconnect());
}
