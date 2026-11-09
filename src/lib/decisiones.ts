// Decisión sobre una propuesta (T11): aprobar o rechazar. Ambas funciones reciben
// el cliente de una transacción; la ruta abre la transacción y, si cualquier paso
// lanza, Prisma revierte todo (decisión, versión, líneas y avisos).
// El actor es siempre `experto_demo`; nunca se lee del cuerpo de la solicitud.

import type { Prisma } from "@prisma/client";
import { aplicarVersionAPeriodosAbiertos } from "./periodos";
import { ErrorHttp } from "./propuestas";

export const ACTOR_DEMO = "experto_demo";

export type ResultadoAprobacion = {
  versionId: string;
  avisosCreados: number;
  lineasActualizadas: number;
  periodosCerradosSinTocar: number;
};

export async function aprobarPropuesta(
  tx: Prisma.TransactionClient,
  propuestaId: string,
): Promise<ResultadoAprobacion> {
  const propuesta = await tx.propuesta.findUnique({
    where: { id: propuestaId },
    include: { norma: true },
  });
  if (!propuesta) throw new ErrorHttp(404, "propuesta no encontrada");

  // BR-07: actualización condicionada. Ante dos solicitudes simultáneas, la
  // segunda espera el bloqueo de la fila y, tras el commit de la primera, ya no
  // encuentra la propuesta PENDIENTE: count === 0.
  const ahora = new Date();
  const r = await tx.propuesta.updateMany({
    where: { id: propuestaId, estado: "PENDIENTE" },
    data: { estado: "APROBADA", actor: ACTOR_DEMO, decididaEn: ahora },
  });
  if (r.count === 0) throw new ErrorHttp(409, "la propuesta ya fue decidida (BR-07)");

  // BR-02: la corrida más reciente, completa y totalmente en verde.
  const corrida = await tx.corridaRegresion.findFirst({
    where: { propuestaId },
    orderBy: { ejecutadaEn: "desc" },
  });
  if (!corrida) throw new ErrorHttp(409, "sin corrida de regresión (BR-02)");
  if (corrida.rojos > 0) throw new ErrorHttp(409, "corrida con rojos (BR-02)");
  const totalCasos = await tx.casoRegresion.count();
  if (corrida.total !== totalCasos) {
    throw new ErrorHttp(409, "corrida incompleta: agregaste casos después (BR-02)");
  }

  const existente = await tx.versionMotor.findFirst({
    where: { parametro: propuesta.parametro, vigenteDesde: propuesta.vigenteDesde },
  });
  if (existente) throw new ErrorHttp(409, "ya existe una versión con esa vigencia");

  const version = await tx.versionMotor.create({
    data: {
      parametro: propuesta.parametro,
      valor: propuesta.valor,
      vigenteDesde: propuesta.vigenteDesde,
      fuente: propuesta.norma.identificador,
      citaTextual: propuesta.citaTextual,
      estado: "APROBADA",
      aprobadoPor: ACTOR_DEMO,
      aprobadaEn: ahora,
      propuestaId: propuesta.id,
    },
  });

  // Versiones publicadas anteriores + la nueva (ya visible dentro de la transacción).
  const versiones = await tx.versionMotor.findMany({
    where: { parametro: propuesta.parametro },
    orderBy: { vigenteDesde: "asc" },
  });
  const { lineasActualizadas, periodosCerradosSinTocar } = await aplicarVersionAPeriodosAbiertos(tx, versiones);

  // Un aviso por empresa con período abierto (en el seed, las dos).
  const empresasAfectadas = await tx.empresa.findMany({
    where: { periodos: { some: { estado: "ABIERTO" } } },
    orderBy: { id: "asc" },
  });
  const desde = version.vigenteDesde.toISOString().slice(0, 10);
  for (const emp of empresasAfectadas) {
    await tx.aviso.create({
      data: {
        empresaId: emp.id,
        versionId: version.id,
        mensaje: `Nuevo SBU ${version.valor.toFixed(2)} desde ${desde} afecta el período abierto`,
      },
    });
  }

  return {
    versionId: version.id,
    avisosCreados: empresasAfectadas.length,
    lineasActualizadas,
    periodosCerradosSinTocar,
  };
}

// Rechazo con motivo obligatorio. No toca VersionMotor, LineaNomina, Aviso ni
// CorridaRegresion.
export async function rechazarPropuesta(
  tx: Prisma.TransactionClient,
  propuestaId: string,
  motivo: string,
): Promise<{ propuestaId: string }> {
  if (typeof motivo !== "string" || motivo.trim() === "") {
    throw new ErrorHttp(400, "motivo obligatorio");
  }
  const r = await tx.propuesta.updateMany({
    where: { id: propuestaId, estado: "PENDIENTE" },
    data: { estado: "RECHAZADA", actor: ACTOR_DEMO, decididaEn: new Date(), motivoRechazo: motivo },
  });
  if (r.count === 0) {
    const existe = await tx.propuesta.findUnique({ where: { id: propuestaId }, select: { id: true } });
    if (!existe) throw new ErrorHttp(404, "propuesta no encontrada");
    throw new ErrorHttp(409, "ya decidida (BR-07)");
  }
  return { propuestaId };
}
