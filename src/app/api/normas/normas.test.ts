// Pruebas de integración de las rutas de T07 contra el esquema `test`.
// Se llama directamente a los handlers con un Request; no se levanta next dev.
import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { sembrar } from "../../../../prisma/seed";
import { NORMA_DEMO_2026, PROPUESTA_DEMO_2026 } from "../../../../prisma/seed-data";
import { prisma } from "../../../lib/db";
import { limpiarBaseDePruebas } from "../../../test/limpiar";
import { POST as postPropuesta } from "./[id]/propuesta/route";
import { POST as postNorma } from "./route";

const NORMA = { identificador: NORMA_DEMO_2026.identificador, fecha: NORMA_DEMO_2026.fecha, texto: NORMA_DEMO_2026.texto };
const PROPUESTA = { ...PROPUESTA_DEMO_2026 };

function peticion(ruta: string, cuerpo: unknown): Request {
  return new Request(`http://localhost${ruta}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: typeof cuerpo === "string" ? cuerpo : JSON.stringify(cuerpo),
  });
}

async function crearNorma(cuerpo: unknown = NORMA): Promise<Response> {
  return postNorma(peticion("/api/normas", cuerpo));
}

async function crearPropuesta(id: string, cuerpo: unknown): Promise<Response> {
  return postPropuesta(peticion(`/api/normas/${id}/propuesta`, cuerpo), { params: Promise.resolve({ id }) });
}

async function idNorma(): Promise<string> {
  const r = await crearNorma();
  expect(r.status).toBe(201);
  return ((await r.json()) as { id: string }).id;
}

describe("POST /api/normas y POST /api/normas/:id/propuesta", () => {
  beforeEach(async () => {
    await limpiarBaseDePruebas(prisma);
    // Estado inicial del demo: así VersionMotor, Periodo y LineaNomina tienen filas.
    await sembrar(prisma);
  });

  afterAll(async () => {
    await limpiarBaseDePruebas(prisma);
    await prisma.$disconnect();
  });

  it("una norma válida responde 201 con el id", async () => {
    const r = await crearNorma();
    expect(r.status).toBe(201);
    const { id } = (await r.json()) as { id: string };
    const norma = await prisma.norma.findUniqueOrThrow({ where: { id } });
    expect(norma.identificador).toBe(NORMA.identificador);
    expect(norma.fecha.toISOString().slice(0, 10)).toBe(NORMA.fecha);
    expect(norma.texto).toBe(NORMA.texto);
  });

  it("una norma sin identificador, fecha o texto responde 400", async () => {
    const antes = await prisma.norma.count();
    for (const campo of ["identificador", "fecha", "texto"] as const) {
      const { [campo]: _, ...sin } = NORMA;
      expect((await crearNorma(sin)).status, campo).toBe(400);
    }
    expect(await prisma.norma.count()).toBe(antes);
  });

  it("la propuesta de $482 desde 2026-01-01 responde 201, PENDIENTE y manual", async () => {
    const id = await idNorma();
    const r = await crearPropuesta(id, PROPUESTA);
    expect(r.status).toBe(201);
    const cuerpo = (await r.json()) as Record<string, unknown>;
    expect(cuerpo).toMatchObject({
      normaId: id,
      parametro: "SBU",
      valor: "482.00",
      vigenteDesde: "2026-01-01",
      citaTextual: PROPUESTA.citaTextual,
      origen: "manual",
      estado: "PENDIENTE",
    });
    const guardada = await prisma.propuesta.findUniqueOrThrow({ where: { id: cuerpo.id as string } });
    expect(guardada.valor.toFixed(2)).toBe("482.00");
    expect(guardada.estado).toBe("PENDIENTE");
    expect(guardada.origen).toBe("manual");
  });

  it("origen llm en el cuerpo se guarda como manual", async () => {
    const id = await idNorma();
    const r = await crearPropuesta(id, { ...PROPUESTA, origen: "llm" });
    expect(r.status).toBe(201);
    const { id: pid } = (await r.json()) as { id: string };
    expect((await prisma.propuesta.findUniqueOrThrow({ where: { id: pid } })).origen).toBe("manual");
  });

  it("parametro SUELDO responde 422 y no crea filas (BR-03)", async () => {
    const id = await idNorma();
    const antes = await prisma.propuesta.count();
    const r = await crearPropuesta(id, { ...PROPUESTA, parametro: "SUELDO" });
    expect(r.status).toBe(422);
    expect(await prisma.propuesta.count()).toBe(antes);
  });

  it("una cita con una tilde alterada responde 422 (BR-08)", async () => {
    const id = await idNorma();
    const r = await crearPropuesta(id, { ...PROPUESTA, citaTextual: PROPUESTA.citaTextual.replace("Fíjese", "Fijese") });
    expect(r.status).toBe(422);
    expect(await prisma.propuesta.count()).toBe(0);
  });

  it("una cita vacía o solo de espacios responde 422", async () => {
    const id = await idNorma();
    expect((await crearPropuesta(id, { ...PROPUESTA, citaTextual: "" })).status).toBe(422);
    expect((await crearPropuesta(id, { ...PROPUESTA, citaTextual: "   \n " })).status).toBe(422);
  });

  it("una cita con doble espacio se acepta y se guarda tal como llegó", async () => {
    const id = await idNorma();
    const cita = PROPUESTA.citaTextual.replace("Salario Básico", "Salario  Básico");
    const r = await crearPropuesta(id, { ...PROPUESTA, citaTextual: cita });
    expect(r.status).toBe(201);
    const { id: pid } = (await r.json()) as { id: string };
    expect((await prisma.propuesta.findUniqueOrThrow({ where: { id: pid } })).citaTextual).toBe(cita);
  });

  it("valor o vigenteDesde inválidos responden 422", async () => {
    const id = await idNorma();
    expect((await crearPropuesta(id, { ...PROPUESTA, valor: "482.001" })).status).toBe(422);
    expect((await crearPropuesta(id, { ...PROPUESTA, vigenteDesde: "2026-02-30" })).status).toBe(422);
  });

  it("una norma inexistente responde 404", async () => {
    expect((await crearPropuesta("no-existe", PROPUESTA)).status).toBe(404);
  });

  it("un JSON mal formado responde 400 en ambas rutas, no 500", async () => {
    expect((await crearNorma("{")).status).toBe(400);
    const id = await idNorma();
    expect((await crearPropuesta(id, "{")).status).toBe(400);
  });

  it("dos propuestas ($428 y $482) para la misma norma coexisten", async () => {
    const id = await idNorma();
    const r428 = await crearPropuesta(id, { ...PROPUESTA, valor: 428 });
    const r482 = await crearPropuesta(id, PROPUESTA);
    expect(r428.status).toBe(201);
    expect(r482.status).toBe(201);
    const propuestas = await prisma.propuesta.findMany({ where: { normaId: id }, orderBy: { valor: "asc" } });
    expect(propuestas.map((p) => p.valor.toFixed(2))).toEqual(["428.00", "482.00"]);
  });

  it("crear una propuesta no altera VersionMotor, Periodo ni LineaNomina (BR-01)", async () => {
    const id = await idNorma();
    const foto = async () => ({
      versiones: await prisma.versionMotor.findMany({ orderBy: { id: "asc" } }),
      periodos: await prisma.periodo.findMany({ orderBy: { id: "asc" } }),
      lineas: await prisma.lineaNomina.findMany({ orderBy: { id: "asc" } }),
      propuestas: await prisma.propuesta.count(),
    });
    const antes = await foto();
    expect(antes.versiones.length).toBeGreaterThan(0);
    expect(antes.lineas.length).toBeGreaterThan(0);

    expect((await crearPropuesta(id, PROPUESTA)).status).toBe(201);

    const despues = await foto();
    expect(despues.versiones).toEqual(antes.versiones);
    expect(despues.periodos).toEqual(antes.periodos);
    expect(despues.lineas).toEqual(antes.lineas);
    expect(despues.propuestas).toBe(antes.propuestas + 1);
  });
});
