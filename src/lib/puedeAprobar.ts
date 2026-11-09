// BR-02: «Aprobar» solo con una corrida completa y totalmente en verde.
// Función pura: sin Prisma ni React.

export type CorridaResumen = { total: number; verdes: number; rojos: number };

export function puedeAprobar(corrida: CorridaResumen | null, totalCasosActuales: number): boolean {
  if (corrida === null) return false;
  if (corrida.rojos !== 0) return false;
  return corrida.total === totalCasosActuales;
}
