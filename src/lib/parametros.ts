// Parámetros versionados (BR-04): cada período usa la versión vigente en su
// primer día, no la de la fecha del cálculo. Nada aquí lee la fecha del sistema.
//
// Las fechas se comparan como texto AAAA-MM-DD en UTC: en Ecuador (UTC-5), una
// conversión a hora local convertiría 2026-01-01 en 2025-12-31 y elegiría la
// versión equivocada.

import type { PrismaClient, VersionMotor } from "@prisma/client";

// BR-03: el único parámetro admitido.
const PARAMETRO_SBU = "SBU";

function aDiaUTC(fecha: Date): string {
  return fecha.toISOString().slice(0, 10);
}

// Primer día del período, en UTC. `mes` va de 1 (enero) a 12.
export function primerDiaDePeriodo(anio: number, mes: number): Date {
  if (!Number.isInteger(anio) || !Number.isInteger(mes) || mes < 1 || mes > 12) {
    throw new Error(`Período inválido: anio=${anio}, mes=${mes} (mes va de 1 a 12).`);
  }
  return new Date(Date.UTC(anio, mes - 1, 1));
}

// Función pura: elige la versión con la vigencia más reciente que no supere
// `primerDia`. No depende del orden de la lista ni escribe nada; T09 puede
// pasarle las versiones publicadas más una candidata para simular.
export function versionVigenteEn<V extends { vigenteDesde: Date }>(versiones: readonly V[], primerDia: Date): V {
  const dia = aDiaUTC(primerDia);
  let elegida: V | undefined;
  for (const version of versiones) {
    const desde = aDiaUTC(version.vigenteDesde);
    if (desde <= dia && (elegida === undefined || desde > aDiaUTC(elegida.vigenteDesde))) {
      elegida = version;
    }
  }
  if (elegida === undefined) {
    const disponibles = versiones.length
      ? versiones
          .map((v) => aDiaUTC(v.vigenteDesde))
          .sort()
          .join(", ")
      : "ninguna";
    throw new Error(
      `Ninguna versión está vigente el ${dia}. Vigencias disponibles: ${disponibles}.`,
    );
  }
  return elegida;
}

// Versiones publicadas del parámetro SBU, ordenadas por vigencia.
export function obtenerVersionesPublicadas(db: PrismaClient): Promise<VersionMotor[]> {
  return db.versionMotor.findMany({
    where: { parametro: PARAMETRO_SBU },
    orderBy: { vigenteDesde: "asc" },
  });
}
