import { Prisma } from "@prisma/client";
import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { limpiarBaseDePruebas } from "../test/limpiar";
import { prisma } from "./db";

const CITA_2025 = "cita de prueba";

async function crearEscena() {
  const empresa = await prisma.empresa.create({ data: { id: "emp-01", nombre: "Panadería La Espiga" } });
  const empleado = await prisma.empleado.create({
    data: {
      id: "emp-juan",
      empresaId: empresa.id,
      nombre: "Juan Carlos Pérez Quishpe",
      sueldo: new Prisma.Decimal("600.00"),
      optoMensualizacion: true,
    },
  });
  const periodo = await prisma.periodo.create({
    data: { id: "per-juan-2025-12", empresaId: empresa.id, anio: 2025, mes: 12, estado: "CERRADO" },
  });
  const version = await prisma.versionMotor.create({
    data: {
      parametro: "SBU",
      valor: new Prisma.Decimal("470.00"),
      vigenteDesde: new Date("2025-01-01"),
      fuente: "MDT-2024-300, vigente 2025-01-01",
      citaTextual: CITA_2025,
      estado: "INICIAL",
    },
  });
  return { empresa, empleado, periodo, version };
}

describe("modelo de datos", () => {
  beforeEach(async () => {
    await limpiarBaseDePruebas(prisma);
  });

  afterAll(async () => {
    await limpiarBaseDePruebas(prisma);
    await prisma.$disconnect();
  });

  it("las tablas viven en el esquema test", async () => {
    const filas = await prisma.$queryRaw<Array<{ esquema: string }>>`
      SELECT table_schema AS esquema FROM information_schema.tables WHERE table_name = 'LineaNomina'
      AND table_schema = current_schema()`;
    expect(filas).toEqual([{ esquema: "test" }]);
  });

  it("una VersionMotor sin aprobador se guarda", async () => {
    const { version } = await crearEscena();
    expect(version.aprobadoPor).toBeNull();
    expect(version.aprobadaEn).toBeNull();
  });

  it("una VersionMotor sin cita falla", async () => {
    await expect(
      prisma.$executeRaw`INSERT INTO "VersionMotor" (id, parametro, valor, "vigenteDesde", fuente, estado)
        VALUES ('v-sin-cita', 'SBU', 470.00, '2025-01-01', 'f', 'INICIAL')`,
    ).rejects.toThrow(/23502/);
  });

  it("una segunda VersionMotor con el mismo parámetro y vigencia falla", async () => {
    const { version } = await crearEscena();
    await expect(
      prisma.versionMotor.create({
        data: {
          parametro: version.parametro,
          valor: new Prisma.Decimal("482.00"),
          vigenteDesde: version.vigenteDesde,
          fuente: "otra",
          citaTextual: "otra",
          estado: "APROBADA",
        },
      }),
    ).rejects.toMatchObject({ code: "P2002" });
  });

  it("una LineaNomina sin valor falla", async () => {
    const { empleado, periodo, version } = await crearEscena();
    await expect(
      prisma.$executeRaw`INSERT INTO "LineaNomina" (id, "empleadoId", "periodoId", "versionId")
        VALUES ('l-sin-valor', ${empleado.id}, ${periodo.id}, ${version.id})`,
    ).rejects.toThrow(/23502/);
  });

  it("una LineaNomina sin versión falla", async () => {
    const { empleado, periodo } = await crearEscena();
    await expect(
      prisma.$executeRaw`INSERT INTO "LineaNomina" (id, "empleadoId", "periodoId", valor)
        VALUES ('l-sin-version', ${empleado.id}, ${periodo.id}, 39.17)`,
    ).rejects.toThrow(/23502/);
  });

  it("una segunda LineaNomina para el mismo empleado y período falla", async () => {
    const { empleado, periodo, version } = await crearEscena();
    const datos = {
      empleadoId: empleado.id,
      periodoId: periodo.id,
      valor: new Prisma.Decimal("39.17"),
      versionId: version.id,
    };
    await prisma.lineaNomina.create({ data: datos });
    await expect(prisma.lineaNomina.create({ data: datos })).rejects.toMatchObject({ code: "P2002" });
  });

  it("un segundo Aviso para la misma empresa y versión falla", async () => {
    const { empresa, version } = await crearEscena();
    const datos = { empresaId: empresa.id, versionId: version.id, mensaje: "Nueva versión del SBU" };
    await prisma.aviso.create({ data: datos });
    await expect(prisma.aviso.create({ data: datos })).rejects.toMatchObject({ code: "P2002" });
  });

  it("482.00 y 2026-01-01 se leen igual con TZ=America/Guayaquil", async () => {
    const tzOriginal = process.env.TZ;
    process.env.TZ = "America/Guayaquil";
    try {
      const creada = await prisma.versionMotor.create({
        data: {
          parametro: "SBU",
          valor: new Prisma.Decimal("482.00"),
          vigenteDesde: new Date("2026-01-01"),
          fuente: "Acuerdo MDT-2025-195",
          citaTextual: "cita",
          estado: "APROBADA",
        },
      });
      const leida = await prisma.versionMotor.findUniqueOrThrow({ where: { id: creada.id } });
      expect(leida.valor.toFixed(2)).toBe("482.00");
      expect(leida.vigenteDesde.toISOString().slice(0, 10)).toBe("2026-01-01");
      expect(new Date().getTimezoneOffset()).toBe(300);
    } finally {
      process.env.TZ = tzOriginal;
    }
  });
});
