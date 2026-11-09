// Validación del lado del cliente y conversión al contrato de la propuesta (T08).
// Funciones puras, sin React. La cita contra el texto la valida el servidor (T07, BR-08).

export type FormularioDatos = {
  identificador: string;
  fecha: string; // AAAA-MM-DD
  texto: string;
  valor: string;
  vigencia: string; // AAAA-MM-DD
  cita: string;
};

// Contrato de la spec, §6. Sin "origen": el servidor lo fuerza a "manual".
export type ContratoPropuesta = {
  parametro: "SBU";
  valor: number;
  vigenteDesde: string;
  citaTextual: string;
};

export type CampoFormulario = keyof FormularioDatos;
export type ErroresFormulario = Partial<Record<CampoFormulario, string>>;

function fechaReal(valor: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(valor)) return false;
  const f = new Date(`${valor}T00:00:00.000Z`);
  return !Number.isNaN(f.getTime()) && f.toISOString().slice(0, 10) === valor;
}

function valorPositivo(valor: string): boolean {
  if (!/^\s*\d+([.,]\d+)?\s*$/.test(valor)) return false;
  return Number(valor.trim().replace(",", ".")) > 0;
}

export function validarFormulario(datos: FormularioDatos): { errores: ErroresFormulario } {
  const errores: ErroresFormulario = {};

  if (datos.identificador.trim() === "") errores.identificador = "El identificador es obligatorio.";
  if (datos.texto.trim() === "") errores.texto = "El texto de la norma es obligatorio.";
  if (datos.cita.trim() === "") errores.cita = "La cita textual es obligatoria.";

  if (datos.fecha.trim() === "") errores.fecha = "La fecha es obligatoria.";
  else if (!fechaReal(datos.fecha)) errores.fecha = "La fecha debe tener el formato AAAA-MM-DD.";

  if (datos.vigencia.trim() === "") errores.vigencia = "La vigencia es obligatoria.";
  else if (!fechaReal(datos.vigencia)) errores.vigencia = "La vigencia debe tener el formato AAAA-MM-DD.";

  if (datos.valor.trim() === "") errores.valor = "El valor es obligatorio.";
  else if (!valorPositivo(datos.valor)) errores.valor = "El valor debe ser un número positivo.";

  return { errores };
}

export function aContrato(datos: FormularioDatos): ContratoPropuesta {
  return {
    parametro: "SBU",
    valor: Number(datos.valor.trim().replace(",", ".")),
    vigenteDesde: datos.vigencia.trim(),
    citaTextual: datos.cita,
  };
}

// Mapea el mensaje de error del servidor al campo del formulario.
export function campoDeError(mensaje: string): CampoFormulario | "parametro" | null {
  const m = mensaje.toLowerCase();
  if (m.includes("cita")) return "cita";
  if (m.includes("vigentedesde")) return "vigencia";
  if (m.includes("valor")) return "valor";
  if (m.includes("parámetro") || m.includes("parametro")) return "parametro";
  if (m.includes("identificador")) return "identificador";
  if (m.includes("texto")) return "texto";
  if (m.includes("fecha")) return "fecha";
  return null;
}
