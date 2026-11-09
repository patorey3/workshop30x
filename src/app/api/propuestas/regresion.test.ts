// Pruebas de integración de POST /api/propuestas/:id/regresion (T09) contra el
// esquema `test`. Se llama directamente a los handlers; no se levanta next dev.
import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { sembrar } from "../../../../prisma/seed";
import { NORMA_DEMO_2026, PROPUESTA_DEMO_2026 } from "../../../../prisma/seed-data";
import { prisma } from "../../../lib/db";
import type { ResultadoCaso } from "../../../lib/regresion";
import { limpiarBaseDePruebas } from "../../../test/limpiar";
import { POST as postPropuesta } from "../normas/[id]/propuesta/route";
import { POST as postNorma } from "../normas/route";
import { POST as postRegresion } from "./[id]/regresion/route";

type Corrida = { id: string; total: number; verdes: number; rojos: number; resultados: ResultadoCaso[] };

function peticion(ruta: string, cuerpo?: unknown): Request {
  return new Request(`http://localhost${ruta}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: cuerpo === undefined ? undefined : JSON.stringify(cuerpo),
  });
}

// Crea una norma y una propuesta con la API de T07; devuelve el id de la propuesta.
async function crearPropuesta(cambios: { valor?: string; vigenteDesde?: string } = {}): Promise<string> {
  const { identificador, fecha, texto } = NORMA_DEMO_2026;
  const norma = await postNorma(peticion("/api/normas", { identificador, fecha, texto }));
  expect(norma.status).toBe(201);
  const { id: normaId } = (await norma.json()) as { id: string };
  const r = await postPropuesta(peticion(`/api/normas/${normaId}/propuesta`, { ...PROPUESTA_DEMO_2026, ...cambios }), {
    params: Promise.resolve({ id: normaId }),
  });
  expect(r.status).toBe(201);
  return ((await r.json()) as { id: string }).id;
}

function regresion(id: string): Promise<Response> {
  return postRegresion(peticion(`/api/propuestas/${id}/regresion`), { params: Promise.resolve({ id }) });
}

// Contenido completo de las tablas que la ruta no debe tocar.
async function instantanea() {
  const [versiones, lineas] = await Promise.all([
    prisma.versionMotor.findMany({ orderBy: { id: "asc" } }),
    prisma.lineaNomina.findMany({ orderBy: { id: "asc" } }),
  ]);
  return JSON.parse(JSON.stringify({ versiones, lineas }));
}

const porCodigo = (c: Corrida) => Object.fromEntries(c.resultados.map((r) => [r.codigo, r]));

describe("POST /api/propuestas/:id/regresion", () => {
  beforeEach(async () => {
    await limpiarBaseDePruebas(prisma);
    await sembrar(prisma);
  });

  afterAll(async () => {
    await limpiarBaseDePruebas(prisma);
    await prisma.$disconnect();
  });

  it("$482 desde 2026-01-01 responde 201 con 4/4 en verde y guarda la corrida", async () => {
    const id = await crearPropuesta();
    const r = await regresion(id);
    expect(r.status).toBe(201);
    const cuerpo = (await r.json()) as Corrida;
    expect(cuerpo).toMatchObject({ total: 4, verdes: 4, rojos: 0 });
    expect(porCodigo(cuerpo)["RC-02"]).toEqual({
      codigo: "RC-02",
      esperado: "40.17",
      antes: "39.17",
      despues: "40.17",
      verde: true,
    });

    const guardada = await prisma.corridaRegresion.findUniqueOrThrow({ where: { id: cuerpo.id } });
    expect(guardada).toMatchObject({ propuestaId: id, total: 4, verdes: 4, rojos: 0 });
    expect(guardada.resultados).toEqual(cuerpo.resultados);
    expect(guardada.ejecutadaEn).toBeInstanceOf(Date);
  });

  it("VersionMotor y LineaNomina quedan idénticas tras la corrida", async () => {
    const id = await crearPropuesta({ valor: "482.00", vigenteDesde: "2025-12-01" });
    const antes = await instantanea();
    expect((await regresion(id)).status).toBe(201);
    expect(await instantanea()).toEqual(antes);
  });

  it("se puede repetir mientras la propuesta esté PENDIENTE: cada llamada guarda una corrida", async () => {
    const id = await crearPropuesta();
    expect((await regresion(id)).status).toBe(201);
    expect((await regresion(id)).status).toBe(201);
    expect(await prisma.corridaRegresion.count({ where: { propuestaId: id } })).toBe(2);
    expect((await prisma.propuesta.findUniqueOrThrow({ where: { id } })).estado).toBe("PENDIENTE");
  });

  it("$428 desde 2026-01-01: RC-02 y RC-04 en rojo con $35.67", async () => {
    // Dígitos invertidos: la cita sigue siendo literal (BR-08), el valor no.
    const id = await crearPropuesta({ valor: "428.00" });
    const cuerpo = (await (await regresion(id)).json()) as Corrida;
    const c = porCodigo(cuerpo);
    expect(cuerpo).toMatchObject({ total: 4, verdes: 2, rojos: 2 });
    expect(c["RC-02"]).toMatchObject({ verde: false, despues: "35.67" });
    expect(c["RC-04"]).toMatchObject({ verde: false, despues: "35.67" });
    expect(c["RC-01"].verde).toBe(true);
    expect(c["RC-03"].verde).toBe(true);
  });

  it("$482 desde 2025-12-01: RC-01 en rojo con $40.17", async () => {
    const id = await crearPropuesta({ vigenteDesde: "2025-12-01" });
    const cuerpo = (await (await regresion(id)).json()) as Corrida;
    expect(cuerpo).toMatchObject({ total: 4, verdes: 3, rojos: 1 });
    expect(porCodigo(cuerpo)["RC-01"]).toMatchObject({ verde: false, despues: "40.17", esperado: "39.17" });
  });

  it("una propuesta inexistente responde 404 y no guarda corridas", async () => {
    const r = await regresion("no-existe");
    expect(r.status).toBe(404);
    expect(await r.json()).toHaveProperty("error");
    expect(await prisma.corridaRegresion.count()).toBe(0);
  });

  it("una propuesta ya decidida responde 409 y no guarda corridas", async () => {
    for (const estado of ["APROBADA", "RECHAZADA"] as const) {
      const id = await crearPropuesta();
      await prisma.propuesta.update({ where: { id }, data: { estado } });
      const r = await regresion(id);
      expect(r.status, estado).toBe(409);
      expect(await r.json()).toHaveProperty("error");
      expect(await prisma.corridaRegresion.count({ where: { propuestaId: id } })).toBe(0);
    }
  });

  it("un caso agregado en la base de datos se incluye en la corrida", async () => {
    await prisma.casoRegresion.create({
      data: { codigo: "RC-EXTRA", empleadoId: "emp-ana", periodoId: "per-ana-2026-02", esperado: "40.17" },
    });
    const id = await crearPropuesta();
    const cuerpo = (await (await regresion(id)).json()) as Corrida;
    expect(cuerpo).toMatchObject({ total: 5, verdes: 5, rojos: 0 });
    expect(cuerpo.resultados.map((r) => r.codigo)).toContain("RC-EXTRA");
  });
});
