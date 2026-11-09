// Pruebas de integración de T11 (aprobar y rechazar) contra el esquema `test`.
// Se llama directamente a los handlers; no se levanta next dev.
import type { Prisma } from "@prisma/client";
import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { sembrar } from "../../prisma/seed";
import { NORMA_DEMO_2026, PROPUESTA_DEMO_2026 } from "../../prisma/seed-data";
import { POST as postPropuesta } from "../app/api/normas/[id]/propuesta/route";
import { POST as postNorma } from "../app/api/normas/route";
import { POST as postAprobar } from "../app/api/propuestas/[id]/aprobar/route";
import { POST as postRechazar } from "../app/api/propuestas/[id]/rechazar/route";
import { POST as postRegresion } from "../app/api/propuestas/[id]/regresion/route";
import { limpiarBaseDePruebas } from "../test/limpiar";
import { prisma } from "./db";
import { aprobarPropuesta } from "./decisiones";

function peticion(ruta: string, cuerpo?: unknown): Request {
  return new Request(`http://localhost${ruta}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: cuerpo === undefined ? undefined : JSON.stringify(cuerpo),
  });
}

const conId = (id: string) => ({ params: Promise.resolve({ id }) });

async function crearPropuesta(cambios: { valor?: string; vigenteDesde?: string } = {}): Promise<string> {
  const { identificador, fecha, texto } = NORMA_DEMO_2026;
  const norma = await postNorma(peticion("/api/normas", { identificador, fecha, texto }));
  expect(norma.status).toBe(201);
  const { id: normaId } = (await norma.json()) as { id: string };
  const r = await postPropuesta(
    peticion(`/api/normas/${normaId}/propuesta`, { ...PROPUESTA_DEMO_2026, ...cambios }),
    conId(normaId),
  );
  expect(r.status).toBe(201);
  return ((await r.json()) as { id: string }).id;
}

async function regresion(id: string): Promise<{ total: number; verdes: number; rojos: number }> {
  const r = await postRegresion(peticion(`/api/propuestas/${id}/regresion`), conId(id));
  expect(r.status).toBe(201);
  return (await r.json()) as { total: number; verdes: number; rojos: number };
}

const aprobar = (id: string, cuerpo?: unknown) => postAprobar(peticion(`/api/propuestas/${id}/aprobar`, cuerpo), conId(id));
const rechazar = (id: string, cuerpo?: unknown) =>
  postRechazar(peticion(`/api/propuestas/${id}/rechazar`, cuerpo), conId(id));

async function linea(id: string) {
  const l = await prisma.lineaNomina.findUniqueOrThrow({ where: { id } });
  return { valor: l.valor.toFixed(2), versionId: l.versionId };
}

async function instantanea() {
  const [versiones, lineas, avisos] = await Promise.all([
    prisma.versionMotor.findMany({ orderBy: { id: "asc" } }),
    prisma.lineaNomina.findMany({ orderBy: { id: "asc" } }),
    prisma.aviso.findMany({ orderBy: { id: "asc" } }),
  ]);
  return JSON.parse(JSON.stringify({ versiones, lineas, avisos }));
}

describe("decisiones (T11)", { timeout: 60_000 }, () => {
  beforeEach(async () => {
    await limpiarBaseDePruebas(prisma);
    await sembrar(prisma);
  });

  afterAll(async () => {
    await limpiarBaseDePruebas(prisma);
    await prisma.$disconnect();
  });

  describe("aprobar", () => {
    it("$482 con 4/4 en verde: 200, propuesta APROBADA por experto_demo", async () => {
      const id = await crearPropuesta();
      expect(await regresion(id)).toMatchObject({ total: 4, verdes: 4, rojos: 0 });

      // El actor del cuerpo se ignora.
      const r = await aprobar(id, { actor: "intruso" });
      expect(r.status).toBe(200);
      const cuerpo = (await r.json()) as { versionId: string; avisosCreados: number; lineasActualizadas: number };
      expect(cuerpo).toMatchObject({ avisosCreados: 2, lineasActualizadas: 2, periodosCerradosSinTocar: 2 });

      expect(await prisma.versionMotor.findUnique({ where: { id: cuerpo.versionId } })).not.toBeNull();
      const p = await prisma.propuesta.findUniqueOrThrow({ where: { id } });
      expect(p.estado).toBe("APROBADA");
      expect(p.actor).toBe("experto_demo");
      expect(p.decididaEn).toBeInstanceOf(Date);
    });

    it("tras aprobar $482: abiertos en $40.17 con v2026, cerrados intactos, 2 avisos y versión completa", async () => {
      const id = await crearPropuesta();
      await regresion(id);
      const { versionId } = (await (await aprobar(id)).json()) as { versionId: string };

      expect(await linea("lin-juan-2026-01")).toEqual({ valor: "40.17", versionId });
      expect(await linea("lin-juan-2025-12")).toEqual({ valor: "39.17", versionId: "v2025" });
      expect(await linea("lin-ana-2026-02")).toEqual({ valor: "40.17", versionId });
      expect(await linea("lin-ana-2025-07")).toEqual({ valor: "39.17", versionId: "v2025" });

      const avisos = await prisma.aviso.findMany({ orderBy: { empresaId: "asc" } });
      expect(avisos.map((a) => [a.empresaId, a.versionId])).toEqual([
        ["emp-01", versionId],
        ["emp-02", versionId],
      ]);

      const v = await prisma.versionMotor.findUniqueOrThrow({ where: { id: versionId } });
      expect(v).toMatchObject({
        parametro: "SBU",
        estado: "APROBADA",
        aprobadoPor: "experto_demo",
        propuestaId: id,
        fuente: NORMA_DEMO_2026.identificador,
        citaTextual: PROPUESTA_DEMO_2026.citaTextual,
      });
      expect(v.valor.toFixed(2)).toBe("482.00");
      expect(v.vigenteDesde.toISOString().slice(0, 10)).toBe("2026-01-01");
      expect(v.aprobadaEn).toBeInstanceOf(Date);
    });

    it("$428 con 2 rojos: 409, propuesta PENDIENTE y sin versión nueva", async () => {
      const id = await crearPropuesta({ valor: "428.00" });
      expect(await regresion(id)).toMatchObject({ rojos: 2 });
      const antes = await instantanea();
      const r = await aprobar(id);
      expect(r.status).toBe(409);
      expect(await r.json()).toHaveProperty("error");
      expect((await prisma.propuesta.findUniqueOrThrow({ where: { id } })).estado).toBe("PENDIENTE");
      expect(await instantanea()).toEqual(antes);
    });

    it("sin corrida: 409 y propuesta PENDIENTE", async () => {
      const id = await crearPropuesta();
      const r = await aprobar(id);
      expect(r.status).toBe(409);
      expect((await prisma.propuesta.findUniqueOrThrow({ where: { id } })).estado).toBe("PENDIENTE");
      expect(await prisma.versionMotor.count()).toBe(1);
    });

    it("se usa la corrida más reciente: una verde anterior no salva a una roja posterior", async () => {
      const id = await crearPropuesta();
      await regresion(id);
      // Una corrida posterior con rojos (insertada a mano, mismo efecto que una regresión fallida).
      await prisma.corridaRegresion.create({
        data: { propuestaId: id, total: 4, verdes: 3, rojos: 1, resultados: [], ejecutadaEn: new Date(Date.now() + 1000) },
      });
      expect((await aprobar(id)).status).toBe(409);
    });

    it("corrida verde anterior a un caso nuevo: incompleta, 409", async () => {
      const id = await crearPropuesta();
      expect(await regresion(id)).toMatchObject({ total: 4, rojos: 0 });
      await prisma.casoRegresion.create({
        data: { codigo: "RC-EXTRA", empleadoId: "emp-ana", periodoId: "per-ana-2026-02", esperado: "40.17" },
      });
      const r = await aprobar(id);
      expect(r.status).toBe(409);
      expect(((await r.json()) as { error: string }).error).toMatch(/incompleta/);
      expect((await prisma.propuesta.findUniqueOrThrow({ where: { id } })).estado).toBe("PENDIENTE");
    });

    it("ya existe una versión con esa vigencia: 409", async () => {
      const primera = await crearPropuesta();
      const segunda = await crearPropuesta();
      await regresion(primera);
      await regresion(segunda);
      expect((await aprobar(primera)).status).toBe(200);
      const r = await aprobar(segunda);
      expect(r.status).toBe(409);
      expect(((await r.json()) as { error: string }).error).toMatch(/vigencia/);
      expect((await prisma.propuesta.findUniqueOrThrow({ where: { id: segunda } })).estado).toBe("PENDIENTE");
    });

    it("segunda aprobación de la misma propuesta: 409", async () => {
      const id = await crearPropuesta();
      await regresion(id);
      expect((await aprobar(id)).status).toBe(200);
      expect((await aprobar(id)).status).toBe(409);
      expect(await prisma.versionMotor.count()).toBe(2);
      expect(await prisma.aviso.count()).toBe(2);
    });

    it("aprobar después de rechazar: 409", async () => {
      const id = await crearPropuesta();
      await regresion(id);
      expect((await rechazar(id, { motivo: "no procede" })).status).toBe(200);
      expect((await aprobar(id)).status).toBe(409);
      expect((await prisma.propuesta.findUniqueOrThrow({ where: { id } })).estado).toBe("RECHAZADA");
    });

    it("rechazar después de aprobar: 409", async () => {
      const id = await crearPropuesta();
      await regresion(id);
      expect((await aprobar(id)).status).toBe(200);
      expect((await rechazar(id, { motivo: "tarde" })).status).toBe(409);
      const p = await prisma.propuesta.findUniqueOrThrow({ where: { id } });
      expect(p.estado).toBe("APROBADA");
      expect(p.motivoRechazo).toBeNull();
    });

    it("dos aprobaciones simultáneas: una 200 y una 409, una versión y 2 avisos", async () => {
      const id = await crearPropuesta();
      await regresion(id);
      const respuestas = await Promise.all([aprobar(id), aprobar(id)]);
      expect(respuestas.map((r) => r.status).sort()).toEqual([200, 409]);
      expect(await prisma.versionMotor.count({ where: { propuestaId: id } })).toBe(1);
      expect(await prisma.versionMotor.count()).toBe(2);
      expect(await prisma.aviso.count()).toBe(2);
    });

    it("propuesta inexistente: 404", async () => {
      const r = await aprobar("no-existe");
      expect(r.status).toBe(404);
      expect(await r.json()).toHaveProperty("error");
    });
  });

  describe("rechazar", () => {
    it("con motivo: 200, RECHAZADA con motivo y experto_demo", async () => {
      const id = await crearPropuesta();
      const r = await rechazar(id, { motivo: "no cumple BR-02", actor: "intruso" });
      expect(r.status).toBe(200);
      expect(await r.json()).toEqual({ propuestaId: id, estado: "RECHAZADA", motivo: "no cumple BR-02" });
      const p = await prisma.propuesta.findUniqueOrThrow({ where: { id } });
      expect(p).toMatchObject({ estado: "RECHAZADA", motivoRechazo: "no cumple BR-02", actor: "experto_demo" });
      expect(p.decididaEn).toBeInstanceOf(Date);
    });

    it("sin motivo, con solo espacios o sin cuerpo: 400 y sigue PENDIENTE", async () => {
      const id = await crearPropuesta();
      for (const cuerpo of [{}, { motivo: "   " }, { motivo: 3 }, undefined]) {
        const r = await rechazar(id, cuerpo);
        expect(r.status, JSON.stringify(cuerpo)).toBe(400);
      }
      expect((await prisma.propuesta.findUniqueOrThrow({ where: { id } })).estado).toBe("PENDIENTE");
    });

    it("no crea versiones ni avisos ni cambia líneas", async () => {
      const id = await crearPropuesta();
      await regresion(id);
      const antes = await instantanea();
      expect((await rechazar(id, { motivo: "no procede" })).status).toBe(200);
      expect(await instantanea()).toEqual(antes);
      expect(await prisma.corridaRegresion.count({ where: { propuestaId: id } })).toBe(1);
    });

    it("propuesta inexistente: 404", async () => {
      expect((await rechazar("no-existe", { motivo: "x" })).status).toBe(404);
    });
  });

  describe("rollback", () => {
    it("si falla la creación de un aviso, se revierte toda la aprobación", async () => {
      const id = await crearPropuesta();
      await regresion(id);
      const antes = await instantanea();

      // tx.aviso.create es un objeto distinto de prisma.aviso.create, así que se
      // envuelve el cliente de la transacción para que la primera llamada falle.
      const conFalla = (tx: Prisma.TransactionClient): Prisma.TransactionClient => {
        let llamadas = 0;
        const aviso = new Proxy(tx.aviso, {
          get(objetivo, prop, receptor) {
            if (prop === "create") {
              return (...args: Parameters<typeof tx.aviso.create>) => {
                if (++llamadas === 1) return Promise.reject(new Error("fallo simulado en Aviso"));
                return objetivo.create(...args);
              };
            }
            return Reflect.get(objetivo, prop, receptor);
          },
        });
        return new Proxy(tx, {
          get(objetivo, prop, receptor) {
            return prop === "aviso" ? aviso : Reflect.get(objetivo, prop, receptor);
          },
        });
      };

      await expect(
        prisma.$transaction((tx) => aprobarPropuesta(conFalla(tx), id), { timeout: 15_000 }),
      ).rejects.toThrow("fallo simulado en Aviso");

      const p = await prisma.propuesta.findUniqueOrThrow({ where: { id } });
      expect(p.estado).toBe("PENDIENTE");
      expect(p.actor).toBeNull();
      expect(p.decididaEn).toBeNull();
      expect(await instantanea()).toEqual(antes);
    });
  });
});
