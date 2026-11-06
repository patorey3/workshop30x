// Motor determinista (BR-06, S14): décimo cuarto mensualizado = SBU ÷ 12,
// redondeado a 2 decimales con la mitad hacia arriba (no redondeo bancario).
// Función pura: solo aritmética de números. Quien la llame convierte el
// Decimal de la base de datos a number.

const DIVISOR = 12;

export function calcularMensualizado({
  sbu,
  optoMensualizacion,
}: {
  sbu: number;
  optoMensualizacion: boolean;
}): number | null {
  if (typeof sbu !== "number" || Number.isNaN(sbu) || !Number.isFinite(sbu)) {
    throw new Error(`SBU inválido: debe ser un número finito (recibido ${String(sbu)}).`);
  }
  if (sbu <= 0) {
    throw new Error(`SBU inválido: debe ser mayor que 0 (recibido ${sbu}).`);
  }
  if (Math.abs(sbu * 100 - Math.round(sbu * 100)) > 1e-9) {
    throw new Error(`SBU inválido: admite como máximo 2 decimales (recibido ${sbu}).`);
  }

  if (!optoMensualizacion) {
    return null;
  }

  // Aritmética en centavos enteros para evitar errores de punto flotante.
  const centavos = Math.round(sbu * 100);
  const cociente = Math.floor(centavos / DIVISOR);
  const resto = centavos - cociente * DIVISOR;
  // Mitad hacia arriba: el empate exacto (resto = 6) sube.
  const resultado = resto * 2 >= DIVISOR ? cociente + 1 : cociente;

  return resultado / 100;
}
