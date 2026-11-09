import { Prisma } from "@prisma/client";
import type { VersionMotor } from "@prisma/client";
import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { sembrar } from "../../prisma/seed";
import { limpiarBaseDePruebas } from "../test/limpiar";
import { prisma } from "./db";
import { actualizarLineaNomina, aplicarVersionAPeriodosAbiertos, PeriodoCerradoError } from "./periodos";

async function crearV2026(vigenteDesde = "2026-01-01"): Promise<VersionMotor> {
  return prisma.versionMotor.create({
    data: {
      id: "v2026",
      parametro: "SBU",
      valor: new Prisma.Decimal("482.00"),
      vigenteDesde: new Date(vigenteDesde),
      fuente: "Acuerdo MDT-2025-195",
      citaTextual: "cita de prueba",
      estado: "APROBADA",
      aprobadoPor: "experto_demo",
      aprobadaEn: new Date(),
    },
  });
}

const linea = (id: string) => prisma.lineaNomina.findUniqueOrThrow({ where: { id } });

describe("periodos (T10)", { timeout: 60_000 }, () => {
  let v2025: VersionMotor;

  beforeEach(async () => {
    await limpiarBaseDePruebas(prisma);
    await sembrar(prisma);
    v2025 = await prisma.versionMotor.findUniqueOrThrow({ where: { id: "v2025" } });
  });

  afterAll(async () => {
    await limpiarBaseDePruebas(prisma);
    await prisma.$disconnect();
  });

  it("actualiza los períodos abiertos a $40.17 con v2026 y no toca los cerrados", async () => {
    const v2026 = await crearV2026();
    const antes = {
      juanCerrado: await linea("lin-juan-2025-12"),
      anaCerrado: await linea("lin-ana-2025-07"),
    };

    const resumen = await prisma.$transaction((tx) => aplicarVersionAPeriodosAbiertos(tx, [v2025, v2026]));

    expect(resumen).toEqual({ lineasActualizadas: 2, periodosCerradosSinTocar: 2 });
    for (const id of ["lin-juan-2026-01", "lin-ana-2026-02"]) {
      const l = await linea(id);
      expect(l.valor.toFixed(2)).toBe("40.17");
      expect(l.versionId).toBe("v2026");
    }
    for (const [id, previa] of [
      ["lin-juan-2025-12", antes.juanCerrado],
      ["lin-ana-2025-07", antes.anaCerrado],
    ] as const) {
      const l = await linea(id);
      expect(l.valor.toFixed(2)).toBe("39.17");
      expect(l.versionId).toBe("v2025");
      expect(l.actualizadaEn).toEqual(previa.actualizadaEn);
    }
  });

  it("es idempotente: aplicar la misma versión dos veces deja el mismo resultado", async () => {
    const v2026 = await crearV2026();
    const r1 = await prisma.$transaction((tx) => aplicarVersionAPeriodosAbiertos(tx, [v2025, v2026]));
    const tras1 = await prisma.lineaNomina.findMany({ orderBy: { id: "asc" }, omit: { actualizadaEn: true } });
    const r2 = await prisma.$transaction((tx) => aplicarVersionAPeriodosAbiertos(tx, [v2025, v2026]));
    const tras2 = await prisma.lineaNomina.findMany({ orderBy: { id: "asc" }, omit: { actualizadaEn: true } });

    expect(r2).toEqual(r1);
    expect(tras2).toEqual(tras1);
  });

  it("BR-04: un período abierto anterior a la vigencia conserva su versión", async () => {
    // v2026 vigente desde 2025-12-01: ene-2026 la usa, nov-2025 sigue con v2025.
    const v2026 = await crearV2026("2025-12-01");
    await prisma.periodo.create({
      data: { id: "per-juan-2025-11", empresaId: "emp-01", anio: 2025, mes: 11, estado: "ABIERTO" },
    });
    await prisma.lineaNomina.create({
      data: {
        id: "lin-juan-2025-11",
        empleadoId: "emp-juan",
        periodoId: "per-juan-2025-11",
        valor: new Prisma.Decimal("39.17"),
        versionId: "v2025",
      },
    });

    const resumen = await prisma.$transaction((tx) => aplicarVersionAPeriodosAbiertos(tx, [v2025, v2026]));

    expect(resumen.lineasActualizadas).toBe(3);
    const ene = await linea("lin-juan-2026-01");
    expect([ene.valor.toFixed(2), ene.versionId]).toEqual(["40.17", "v2026"]);
    const nov = await linea("lin-juan-2025-11");
    expect([nov.valor.toFixed(2), nov.versionId]).toEqual(["39.17", "v2025"]);
  });

  it("actualizarLineaNomina sobre un período cerrado lanza PeriodoCerradoError y no escribe", async () => {
    const v2026 = await crearV2026();
    const previa = await linea("lin-juan-2025-12");

    const intento = prisma.$transaction((tx) =>
      actualizarLineaNomina(tx, "lin-juan-2025-12", { valor: "40.17", versionId: v2026.id }),
    );
    await expect(intento).rejects.toThrow(PeriodoCerradoError);
    await expect(intento).rejects.toThrow(/lin-juan-2025-12.*per-juan-2025-12/);

    const despues = await linea("lin-juan-2025-12");
    expect(despues.valor.toFixed(2)).toBe("39.17");
    expect(despues.versionId).toBe("v2025");
    expect(despues.actualizadaEn).toEqual(previa.actualizadaEn);
  });

  it("actualizarLineaNomina sobre un período abierto actualiza sin error", async () => {
    const v2026 = await crearV2026();

    await prisma.$transaction((tx) =>
      actualizarLineaNomina(tx, "lin-juan-2026-01", { valor: new Prisma.Decimal("40.17"), versionId: v2026.id }),
    );

    const l = await linea("lin-juan-2026-01");
    expect([l.valor.toFixed(2), l.versionId]).toEqual(["40.17", "v2026"]);
  });

  it("si la transacción externa falla, ninguna línea cambia", async () => {
    const v2026 = await crearV2026();
    const antes = await prisma.lineaNomina.findMany({ orderBy: { id: "asc" } });

    await expect(
      prisma.$transaction(async (tx) => {
        const r = await aplicarVersionAPeriodosAbiertos(tx, [v2025, v2026]);
        expect(r.lineasActualizadas).toBe(2);
        throw new Error("falla al final");
      }),
    ).rejects.toThrow("falla al final");

    expect(await prisma.lineaNomina.findMany({ orderBy: { id: "asc" } })).toEqual(antes);
  });
});
