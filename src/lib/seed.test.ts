import { Prisma } from "@prisma/client";
import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { sembrar } from "../../prisma/seed";
import { CITA_2025, EMPLEADOS, NORMA_DEMO_2026, PROPUESTA_DEMO_2026 } from "../../prisma/seed-data";
import { limpiarBaseDePruebas } from "../test/limpiar";
import { prisma } from "./db";

const dia = (d: Date) => d.toISOString().slice(0, 10);

// Estado completo de la base sin marcas de tiempo, para comparar dos seeds.
async function estado() {
  const [empresas, empleados, periodos, versiones, lineas, casos, normas, propuestas, corridas, avisos] =
    await Promise.all([
      prisma.empresa.findMany({ orderBy: { id: "asc" } }),
      prisma.empleado.findMany({ orderBy: { id: "asc" } }),
      prisma.periodo.findMany({ orderBy: { id: "asc" } }),
      prisma.versionMotor.findMany({ orderBy: { id: "asc" }, omit: { creadaEn: true } }),
      prisma.lineaNomina.findMany({ orderBy: { id: "asc" }, omit: { actualizadaEn: true } }),
      prisma.casoRegresion.findMany({ orderBy: { id: "asc" } }),
      prisma.norma.count(),
      prisma.propuesta.count(),
      prisma.corridaRegresion.count(),
      prisma.aviso.count(),
    ]);
  return { empresas, empleados, periodos, versiones, lineas, casos, normas, propuestas, corridas, avisos };
}

// Dígito verificador de cédula ecuatoriana (módulo 10).
function cedulaValida(cedula: string): boolean {
  const d = cedula.split("").map(Number);
  const suma = d.slice(0, 9).reduce((acc, n, i) => {
    const p = i % 2 === 0 ? n * 2 : n;
    return acc + (p > 9 ? p - 9 : p);
  }, 0);
  return (10 - (suma % 10)) % 10 === d[9];
}

// Cada seed es una transacción remota contra Supabase: 5 s por defecto no alcanzan.
describe("seed (T04)", { timeout: 60_000 }, () => {
  beforeEach(async () => {
    await limpiarBaseDePruebas(prisma);
    await sembrar(prisma);
  });

  afterAll(async () => {
    await limpiarBaseDePruebas(prisma);
    await prisma.$disconnect();
  });

  it("crea 2 empresas, 2 empleados, 4 períodos y 4 líneas", async () => {
    expect((await prisma.empresa.findMany()).map((e) => e.id).sort()).toEqual(["emp-01", "emp-02"]);
    const empleados = await prisma.empleado.findMany({ orderBy: { id: "asc" } });
    expect(empleados.map((e) => [e.id, e.empresaId, e.sueldo.toFixed(2), e.optoMensualizacion])).toEqual([
      ["emp-ana", "emp-02", "600.00", true],
      ["emp-juan", "emp-01", "600.00", true],
    ]);
    expect(await prisma.periodo.count()).toBe(4);
    expect(await prisma.lineaNomina.count()).toBe(4);
  });

  it("los períodos cerrados y abiertos son los de la spec", async () => {
    const periodos = await prisma.periodo.findMany({ orderBy: { id: "asc" } });
    expect(periodos.map((p) => [p.id, p.empresaId, p.anio, p.mes, p.estado])).toEqual([
      ["per-ana-2025-07", "emp-02", 2025, 7, "CERRADO"],
      ["per-ana-2026-02", "emp-02", 2026, 2, "ABIERTO"],
      ["per-juan-2025-12", "emp-01", 2025, 12, "CERRADO"],
      ["per-juan-2026-01", "emp-01", 2026, 1, "ABIERTO"],
    ]);
  });

  it("solo existe la versión 2025: $470 desde 2025-01-01, MDT-2024-300, cita literal y sin aprobador", async () => {
    const versiones = await prisma.versionMotor.findMany();
    expect(versiones).toHaveLength(1);
    const [v] = versiones;
    expect(v.id).toBe("v2025");
    expect(v.parametro).toBe("SBU");
    expect(v.valor.toFixed(2)).toBe("470.00");
    expect(dia(v.vigenteDesde)).toBe("2025-01-01");
    expect(v.fuente).toBe("MDT-2024-300, vigente 2025-01-01");
    expect(v.citaTextual).toBe(CITA_2025);
    expect(v.citaTextual).toContain("USD. 470,00 mensuales. […] El nuevo Salario Básico Unificado");
    expect(v.estado).toBe("INICIAL");
    expect(v.aprobadoPor).toBeNull();
    expect(v.aprobadaEn).toBeNull();
    expect(v.propuestaId).toBeNull();
    expect(await prisma.versionMotor.count({ where: { vigenteDesde: { gte: new Date("2026-01-01") } } })).toBe(0);
  });

  it("las 4 líneas valen $39.17 y apuntan a la versión 2025", async () => {
    const lineas = await prisma.lineaNomina.findMany({ orderBy: { periodoId: "asc" } });
    expect(lineas.map((l) => [l.empleadoId, l.periodoId, l.valor.toFixed(2), l.versionId, l.concepto])).toEqual([
      ["emp-ana", "per-ana-2025-07", "39.17", "v2025", "Décimo cuarto mensualizado"],
      ["emp-ana", "per-ana-2026-02", "39.17", "v2025", "Décimo cuarto mensualizado"],
      ["emp-juan", "per-juan-2025-12", "39.17", "v2025", "Décimo cuarto mensualizado"],
      ["emp-juan", "per-juan-2026-01", "39.17", "v2025", "Décimo cuarto mensualizado"],
    ]);
  });

  it("existen exactamente RC-01 a RC-04 con los valores de la spec", async () => {
    const casos = await prisma.casoRegresion.findMany({ orderBy: { codigo: "asc" } });
    expect(casos.map((c) => [c.codigo, c.empleadoId, c.periodoId, c.esperado.toFixed(2)])).toEqual([
      ["RC-01", "emp-juan", "per-juan-2025-12", "39.17"],
      ["RC-02", "emp-juan", "per-juan-2026-01", "40.17"],
      ["RC-03", "emp-ana", "per-ana-2025-07", "39.17"],
      ["RC-04", "emp-ana", "per-ana-2026-02", "40.17"],
    ]);
  });

  it("no crea normas, propuestas, corridas ni avisos", async () => {
    expect(await prisma.norma.count()).toBe(0);
    expect(await prisma.propuesta.count()).toBe(0);
    expect(await prisma.corridaRegresion.count()).toBe(0);
    expect(await prisma.aviso.count()).toBe(0);
  });

  it("PROPUESTA_DEMO_2026 es SBU, 482.00 desde 2026-01-01, con cita literal en NORMA_DEMO_2026.texto", () => {
    expect(PROPUESTA_DEMO_2026.parametro).toBe("SBU");
    expect(PROPUESTA_DEMO_2026.valor).toBe("482.00");
    expect(PROPUESTA_DEMO_2026.vigenteDesde).toBe("2026-01-01");
    expect(PROPUESTA_DEMO_2026.citaTextual.trim()).not.toBe("");
    expect(NORMA_DEMO_2026.texto).toContain(PROPUESTA_DEMO_2026.citaTextual);
    expect(NORMA_DEMO_2026.identificador).toContain("MDT-2025-195");
    expect(NORMA_DEMO_2026.texto).toMatch(/EJEMPLO/);
  });

  it("correrlo dos veces deja exactamente el mismo estado", async () => {
    const antes = await estado();
    await sembrar(prisma);
    expect(await estado()).toEqual(antes);
  });

  it("tras un recorrido, vuelve al estado inicial", async () => {
    const antes = await estado();

    // Simula un recorrido: norma, propuesta, corrida, versión 2026, línea recalculada y aviso.
    const norma = await prisma.norma.create({
      data: { ...NORMA_DEMO_2026, fecha: new Date(NORMA_DEMO_2026.fecha) },
    });
    const propuesta = await prisma.propuesta.create({
      data: {
        ...PROPUESTA_DEMO_2026,
        vigenteDesde: new Date(PROPUESTA_DEMO_2026.vigenteDesde),
        normaId: norma.id,
        origen: "manual",
        estado: "APROBADA",
        actor: "experto_demo",
        decididaEn: new Date(),
      },
    });
    await prisma.corridaRegresion.create({
      data: { propuestaId: propuesta.id, total: 4, verdes: 4, rojos: 0, resultados: [] },
    });
    const v2026 = await prisma.versionMotor.create({
      data: {
        parametro: "SBU",
        valor: new Prisma.Decimal("482.00"),
        vigenteDesde: new Date("2026-01-01"),
        fuente: "Acuerdo MDT-2025-195",
        citaTextual: PROPUESTA_DEMO_2026.citaTextual,
        estado: "APROBADA",
        aprobadoPor: "experto_demo",
        aprobadaEn: new Date(),
        propuestaId: propuesta.id,
      },
    });
    // Este test de T04 simula un recorrido. T10 exige que el método update de lineaNomina no
    // aparezca fuera de `periodos.ts` y `seed.ts`, así que aquí se usa SQL crudo para no
    // violar el criterio. El comportamiento del test no cambia.
    await prisma.$executeRaw`UPDATE "LineaNomina" SET "valor" = 40.17, "versionId" = ${v2026.id} WHERE "id" = ${"lin-juan-2026-01"}`;
    await prisma.aviso.create({ data: { empresaId: "emp-01", versionId: v2026.id, mensaje: "Nuevo SBU" } });

    await sembrar(prisma);
    expect(await estado()).toEqual(antes);
  });

  it("las cédulas son ficticias (dígito verificador incorrecto)", () => {
    for (const e of EMPLEADOS) expect(cedulaValida(e.cedula)).toBe(false);
  });
});
