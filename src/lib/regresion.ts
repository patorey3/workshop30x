// Suite de regresión (T09): simula una propuesta sobre todos los casos sin
// escribir nada. Función pura: no lee la base de datos ni la fecha del sistema.
//
// Los períodos CERRADO también se recalculan desde cero con la versión que les
// corresponde. Si se leyera LineaNomina.valor, RC-01 siempre saldría en verde y
// una vigencia anticipada (p. ej. $482 desde 2025-12-01) no se detectaría. Esto
// no contradice BR-05, porque no se escribe nada.

import { Prisma } from "@prisma/client";
import { calcularMensualizado } from "./motor";
import { primerDiaDePeriodo, versionVigenteEn } from "./parametros";

// Importe tal como llega: Decimal de Prisma, texto "482.00" o número.
export type Importe = Prisma.Decimal | string | number;

export type CasoParaRegresion = {
  codigo: string;
  empleado: { optoMensualizacion: boolean; sueldo?: Importe };
  periodo: { anio: number; mes: number };
  esperado: Importe;
};

export type VersionParaRegresion = { valor: Importe; vigenteDesde: Date };

export type ResultadoCaso = {
  codigo: string;
  esperado: string;
  // null si el empleado no optó por la mensualización o si el cálculo falló.
  antes: string | null;
  despues: string | null;
  verde: boolean;
  error?: string;
};

export type ResultadoRegresion = {
  total: number;
  verdes: number;
  rojos: number;
  resultados: ResultadoCaso[];
};

const aDia = (fecha: Date) => fecha.toISOString().slice(0, 10);
const aTexto2 = (v: Importe) => new Prisma.Decimal(v).toFixed(2);

function calcular(versiones: readonly VersionParaRegresion[], caso: CasoParaRegresion): string | null {
  const version = versionVigenteEn(versiones, primerDiaDePeriodo(caso.periodo.anio, caso.periodo.mes));
  const valor = calcularMensualizado({
    sbu: Number(aTexto2(version.valor)),
    optoMensualizacion: caso.empleado.optoMensualizacion,
  });
  return valor === null ? null : valor.toFixed(2);
}

const mensaje = (e: unknown) => (e instanceof Error ? e.message : String(e));

export function ejecutarRegresion(
  casos: readonly CasoParaRegresion[],
  versiones: readonly VersionParaRegresion[],
  candidata: VersionParaRegresion,
): ResultadoRegresion {
  // La candidata prevalece si su vigencia coincide con la de una versión publicada.
  const diaCandidata = aDia(candidata.vigenteDesde);
  const conCandidata = [...versiones.filter((v) => aDia(v.vigenteDesde) !== diaCandidata), candidata];

  const resultados = casos.map((caso): ResultadoCaso => {
    const esperado = aTexto2(caso.esperado);
    const errores: string[] = [];
    let antes: string | null = null;
    let despues: string | null = null;
    try {
      antes = calcular(versiones, caso);
    } catch (e) {
      errores.push(`antes: ${mensaje(e)}`);
    }
    try {
      despues = calcular(conCandidata, caso);
    } catch (e) {
      errores.push(`después: ${mensaje(e)}`);
    }
    // Verde solo si el valor después coincide con el esperado (comparación de
    // texto con 2 decimales, no de flotantes). Un error en el cálculo lo deja rojo.
    const verde = errores.length === 0 && despues === esperado;
    return { codigo: caso.codigo, esperado, antes, despues, verde, ...(errores.length ? { error: errores.join(" ") } : {}) };
  });

  const verdes = resultados.filter((r) => r.verde).length;
  return { total: resultados.length, verdes, rojos: resultados.length - verdes, resultados };
}
