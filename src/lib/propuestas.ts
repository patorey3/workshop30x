// Validación de normas y propuestas (T07). Funciones puras: no tocan la base de datos.
import { Prisma } from "@prisma/client";

// Error con el código HTTP que debe devolver la ruta.
export class ErrorHttp extends Error {
  constructor(
    public readonly status: 400 | 404 | 422,
    message: string,
  ) {
    super(message);
    this.name = "ErrorHttp";
  }
}

export type PropuestaValidada = {
  parametro: "SBU";
  valor: Prisma.Decimal;
  vigenteDesde: Date;
  citaTextual: string;
  origen: "manual";
};

export type NormaValidada = {
  identificador: string;
  fecha: Date;
  texto: string;
};

// BR-08: cada secuencia de espacios en blanco (espacios, tabuladores, saltos de
// línea, espacios duros) pasa a un espacio, y se recortan los extremos. Nada más:
// mayúsculas, tildes, comillas y puntuación quedan tal cual. La ola 2 la reutiliza.
export function normalizarEspacios(s: string): string {
  return s.replace(/\s+/g, " ").trim();
}

// Fecha real AAAA-MM-DD, interpretada en UTC (como @db.Date). Devuelve null si no lo es.
function parsearFecha(valor: unknown): Date | null {
  if (typeof valor !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(valor)) return null;
  const fecha = new Date(`${valor}T00:00:00.000Z`);
  if (Number.isNaN(fecha.getTime()) || fecha.toISOString().slice(0, 10) !== valor) return null;
  return fecha;
}

function esObjeto(entrada: unknown): entrada is Record<string, unknown> {
  return typeof entrada === "object" && entrada !== null && !Array.isArray(entrada);
}

function textoNoVacio(valor: unknown): valor is string {
  return typeof valor === "string" && valor.trim() !== "";
}

export function validarNorma(entrada: unknown): NormaValidada {
  if (!esObjeto(entrada)) {
    throw new ErrorHttp(400, "El cuerpo debe ser un objeto JSON.");
  }
  const { identificador, fecha, texto } = entrada;
  if (!textoNoVacio(identificador)) throw new ErrorHttp(400, "Falta el identificador de la norma.");
  if (!textoNoVacio(texto)) throw new ErrorHttp(400, "Falta el texto de la norma.");
  if (fecha === undefined || fecha === null || fecha === "") {
    throw new ErrorHttp(400, "Falta la fecha de la norma.");
  }
  const fechaValida = parsearFecha(fecha);
  if (!fechaValida) throw new ErrorHttp(400, "La fecha de la norma debe ser una fecha real AAAA-MM-DD.");
  return { identificador, fecha: fechaValida, texto };
}

function parsearValor(valor: unknown): number | null {
  let n: number;
  if (typeof valor === "number") {
    n = valor;
  } else if (typeof valor === "string" && /^\s*\d+(\.\d+)?\s*$/.test(valor)) {
    n = Number(valor);
  } else {
    return null;
  }
  if (!Number.isFinite(n) || n <= 0) return null;
  // Mismo criterio que el motor (T05): como máximo 2 decimales.
  if (Math.abs(n * 100 - Math.round(n * 100)) > 1e-9) return null;
  return n;
}

// Valida una propuesta contra el texto de su norma. El origen lo fija el servidor.
export function validarPropuesta(entrada: unknown, textoNorma: string): PropuestaValidada {
  if (!esObjeto(entrada)) {
    throw new ErrorHttp(400, "El cuerpo debe ser un objeto JSON.");
  }

  // BR-03: solo SBU.
  if (entrada.parametro !== "SBU") {
    throw new ErrorHttp(422, "Solo se admiten cambios del parámetro SBU (BR-03).");
  }

  const valor = parsearValor(entrada.valor);
  if (valor === null) {
    throw new ErrorHttp(422, "El valor debe ser un número positivo con como máximo 2 decimales.");
  }

  const vigenteDesde = parsearFecha(entrada.vigenteDesde);
  if (!vigenteDesde) {
    throw new ErrorHttp(422, "vigenteDesde debe ser una fecha real AAAA-MM-DD.");
  }

  // BR-08: cita no vacía y presente en el texto, tras normalizar solo espacios.
  const cita = entrada.citaTextual;
  if (typeof cita !== "string" || normalizarEspacios(cita) === "") {
    throw new ErrorHttp(422, "La cita textual no puede estar vacía (BR-08).");
  }
  if (!normalizarEspacios(textoNorma).includes(normalizarEspacios(cita))) {
    throw new ErrorHttp(422, "La cita no aparece textualmente en la norma (BR-08).");
  }

  return {
    parametro: "SBU",
    valor: new Prisma.Decimal(valor.toFixed(2)),
    vigenteDesde,
    // Se guarda tal como llegó, sin normalizar.
    citaTextual: cita,
    origen: "manual",
  };
}

// Lee el cuerpo JSON; un JSON mal formado es 400, no 500.
export async function leerJson(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    throw new ErrorHttp(400, "El cuerpo no es un JSON válido.");
  }
}

// Convierte un error en respuesta: ErrorHttp con su código; cualquier otro, 500.
export function respuestaDeError(error: unknown): Response {
  if (error instanceof ErrorHttp) {
    return Response.json({ error: error.message }, { status: error.status });
  }
  console.error(error);
  return Response.json({ error: "Error interno." }, { status: 500 });
}
