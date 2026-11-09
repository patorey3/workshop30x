// BR-05: una versión nueva solo actualiza las líneas de períodos abiertos; los
// cerrados conservan valor y versión. La protección está en la aplicación, no en
// la base de datos. Este archivo es el único de src/ que escribe LineaNomina
// (junto con prisma/seed.ts); las funciones reciben el cliente de la transacción
// para que T11 las ejecute dentro de la suya.

import type { Prisma, VersionMotor } from "@prisma/client";
import { calcularMensualizado } from "./motor";
import { primerDiaDePeriodo, versionVigenteEn } from "./parametros";

export class PeriodoCerradoError extends Error {
  readonly lineaId: string;
  readonly periodoId: string;

  constructor(lineaId: string, periodoId: string) {
    super(`La línea ${lineaId} pertenece al período cerrado ${periodoId}: no se puede modificar (BR-05).`);
    this.name = "PeriodoCerradoError";
    this.lineaId = lineaId;
    this.periodoId = periodoId;
  }
}

export async function aplicarVersionAPeriodosAbiertos(
  tx: Prisma.TransactionClient,
  versiones: VersionMotor[],
): Promise<{ lineasActualizadas: number; periodosCerradosSinTocar: number }> {
  const abiertos = await tx.periodo.findMany({
    where: { estado: "ABIERTO" },
    include: { lineas: { include: { empleado: true } } },
    orderBy: { id: "asc" },
  });

  let lineasActualizadas = 0;
  for (const periodo of abiertos) {
    const version = versionVigenteEn(versiones, primerDiaDePeriodo(periodo.anio, periodo.mes));
    for (const linea of periodo.lineas) {
      const nuevo = calcularMensualizado({
        sbu: version.valor.toNumber(),
        optoMensualizacion: linea.empleado.optoMensualizacion,
      });
      if (nuevo === null) continue;
      await tx.lineaNomina.update({
        where: { id: linea.id },
        data: { valor: nuevo.toFixed(2), versionId: version.id },
      });
      lineasActualizadas++;
    }
  }

  // Solo se cuentan: sus líneas no se leen ni se escriben.
  const periodosCerradosSinTocar = await tx.periodo.count({ where: { estado: "CERRADO" } });

  return { lineasActualizadas, periodosCerradosSinTocar };
}

export async function actualizarLineaNomina(
  tx: Prisma.TransactionClient,
  lineaId: string,
  datos: { valor: Prisma.Decimal | string; versionId: string },
): Promise<void> {
  const linea = await tx.lineaNomina.findUniqueOrThrow({
    where: { id: lineaId },
    include: { periodo: true },
  });
  if (linea.periodo.estado === "CERRADO") {
    throw new PeriodoCerradoError(lineaId, linea.periodoId);
  }
  await tx.lineaNomina.update({
    where: { id: lineaId },
    data: { valor: datos.valor, versionId: datos.versionId },
  });
}
