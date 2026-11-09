// Pruebas puras de la suite de regresión (T09): datos fijos, sin base de datos.
import { describe, expect, it } from "vitest";
import { ejecutarRegresion, type CasoParaRegresion, type VersionParaRegresion } from "./regresion";

const dia = (iso: string) => new Date(`${iso}T00:00:00.000Z`);

const JUAN = { sueldo: "600.00", optoMensualizacion: true };
const ANA = { sueldo: "600.00", optoMensualizacion: true };

const CASOS: CasoParaRegresion[] = [
  { codigo: "RC-01", empleado: JUAN, periodo: { anio: 2025, mes: 12 }, esperado: "39.17" },
  { codigo: "RC-02", empleado: JUAN, periodo: { anio: 2026, mes: 1 }, esperado: "40.17" },
  { codigo: "RC-03", empleado: ANA, periodo: { anio: 2025, mes: 7 }, esperado: "39.17" },
  { codigo: "RC-04", empleado: ANA, periodo: { anio: 2026, mes: 2 }, esperado: "40.17" },
];

const PUBLICADAS: VersionParaRegresion[] = [{ valor: "470.00", vigenteDesde: dia("2025-01-01") }];

const porCodigo = (r: ReturnType<typeof ejecutarRegresion>) =>
  Object.fromEntries(r.resultados.map((c) => [c.codigo, c]));

describe("ejecutarRegresion", () => {
  it("$482 desde 2026-01-01: RC-01 a RC-04 en verde", () => {
    const r = ejecutarRegresion(CASOS, PUBLICADAS, { valor: "482.00", vigenteDesde: dia("2026-01-01") });
    expect(r).toMatchObject({ total: 4, verdes: 4, rojos: 0 });
    expect(r.resultados.every((c) => c.verde)).toBe(true);
  });

  it("RC-02 con $482: antes $39.17, después $40.17, esperado $40.17", () => {
    const r = ejecutarRegresion(CASOS, PUBLICADAS, { valor: "482.00", vigenteDesde: dia("2026-01-01") });
    expect(porCodigo(r)["RC-02"]).toEqual({
      codigo: "RC-02",
      esperado: "40.17",
      antes: "39.17",
      despues: "40.17",
      verde: true,
    });
  });

  it("$428 desde 2026-01-01: RC-02 y RC-04 en rojo con $35.67; RC-01 y RC-03 en verde", () => {
    const r = ejecutarRegresion(CASOS, PUBLICADAS, { valor: "428.00", vigenteDesde: dia("2026-01-01") });
    const c = porCodigo(r);
    expect(r).toMatchObject({ total: 4, verdes: 2, rojos: 2 });
    expect(c["RC-02"]).toMatchObject({ verde: false, despues: "35.67", antes: "39.17" });
    expect(c["RC-04"]).toMatchObject({ verde: false, despues: "35.67", antes: "39.17" });
    expect(c["RC-01"]).toMatchObject({ verde: true, despues: "39.17" });
    expect(c["RC-03"]).toMatchObject({ verde: true, despues: "39.17" });
  });

  it("$482 desde 2025-12-01: RC-01 (período cerrado) en rojo con $40.17; el resto en verde", () => {
    const r = ejecutarRegresion(CASOS, PUBLICADAS, { valor: "482.00", vigenteDesde: dia("2025-12-01") });
    const c = porCodigo(r);
    expect(r).toMatchObject({ total: 4, verdes: 3, rojos: 1 });
    expect(c["RC-01"]).toMatchObject({ verde: false, antes: "39.17", despues: "40.17", esperado: "39.17" });
    for (const codigo of ["RC-02", "RC-03", "RC-04"]) expect(c[codigo].verde, codigo).toBe(true);
  });

  it("acepta Decimal de Prisma y números en valor y esperado", async () => {
    const { Prisma } = await import("@prisma/client");
    const casos = CASOS.map((c) => ({ ...c, esperado: new Prisma.Decimal(c.esperado as string) }));
    const r = ejecutarRegresion(casos, [{ valor: new Prisma.Decimal("470"), vigenteDesde: dia("2025-01-01") }], {
      valor: 482,
      vigenteDesde: dia("2026-01-01"),
    });
    expect(r.verdes).toBe(4);
  });

  it("la candidata prevalece si su vigencia coincide con la de una versión publicada", () => {
    const publicadas = [...PUBLICADAS, { valor: "428.00", vigenteDesde: dia("2026-01-01") }];
    const r = ejecutarRegresion(CASOS, publicadas, { valor: "482.00", vigenteDesde: dia("2026-01-01") });
    const c = porCodigo(r);
    expect(r.verdes).toBe(4);
    // «antes» usa las publicadas, incluida la de $428.
    expect(c["RC-02"]).toMatchObject({ antes: "35.67", despues: "40.17" });
  });

  it("no depende del orden de las versiones ni modifica sus argumentos", () => {
    const publicadas = [
      { valor: "482.00", vigenteDesde: dia("2026-01-01") },
      { valor: "470.00", vigenteDesde: dia("2025-01-01") },
    ];
    const copia = structuredClone(publicadas);
    const r = ejecutarRegresion(CASOS, publicadas, { valor: "482.00", vigenteDesde: dia("2026-01-01") });
    expect(r.verdes).toBe(4);
    expect(publicadas).toEqual(copia);
  });

  it("un período anterior a todas las versiones queda en rojo con el mensaje", () => {
    const casos = [{ codigo: "RC-X", empleado: JUAN, periodo: { anio: 2024, mes: 12 }, esperado: "39.17" }];
    const r = ejecutarRegresion(casos, PUBLICADAS, { valor: "482.00", vigenteDesde: dia("2026-01-01") });
    expect(r).toMatchObject({ total: 1, verdes: 0, rojos: 1 });
    expect(r.resultados[0]).toMatchObject({ verde: false, antes: null, despues: null });
    expect(r.resultados[0].error).toMatch(/Ninguna versión está vigente el 2024-12-01/);
  });

  it("el número de casos sale de la entrada, no de una constante", () => {
    const extra = { codigo: "RC-05", empleado: ANA, periodo: { anio: 2026, mes: 3 }, esperado: "40.17" };
    const r = ejecutarRegresion([...CASOS, extra], PUBLICADAS, { valor: "482.00", vigenteDesde: dia("2026-01-01") });
    expect(r).toMatchObject({ total: 5, verdes: 5, rojos: 0 });
    expect(ejecutarRegresion([], PUBLICADAS, { valor: "482.00", vigenteDesde: dia("2026-01-01") })).toEqual({
      total: 0,
      verdes: 0,
      rojos: 0,
      resultados: [],
    });
  });
});
