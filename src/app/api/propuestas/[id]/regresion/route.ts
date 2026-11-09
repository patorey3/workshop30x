import { prisma } from "../../../../../lib/db";
import { ErrorHttp, respuestaDeError } from "../../../../../lib/propuestas";
import { ejecutarRegresion } from "../../../../../lib/regresion";

// POST /api/propuestas/:id/regresion (T09): simula la propuesta sobre todos los
// casos de la base de datos y guarda una CorridaRegresion. Solo inserta en
// CorridaRegresion; no toca VersionMotor ni LineaNomina.
// Puede ejecutarse varias veces mientras la propuesta esté PENDIENTE: una corrida
// es evidencia, no una decisión.
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  try {
    const { id } = await params;

    const propuesta = await prisma.propuesta.findUnique({ where: { id } });
    if (!propuesta) throw new ErrorHttp(404, "La propuesta no existe.");
    if (propuesta.estado !== "PENDIENTE") throw new ErrorHttp(409, "La propuesta ya está decidida.");

    const [casos, versiones] = await Promise.all([
      prisma.casoRegresion.findMany({
        include: { empleado: true, periodo: true },
        orderBy: { codigo: "asc" },
      }),
      prisma.versionMotor.findMany({
        where: { parametro: propuesta.parametro, estado: { in: ["INICIAL", "APROBADA"] } },
        orderBy: { vigenteDesde: "asc" },
      }),
    ]);

    const resultado = ejecutarRegresion(casos, versiones, {
      valor: propuesta.valor,
      vigenteDesde: propuesta.vigenteDesde,
    });

    const corrida = await prisma.corridaRegresion.create({
      data: {
        propuestaId: propuesta.id,
        total: resultado.total,
        verdes: resultado.verdes,
        rojos: resultado.rojos,
        resultados: resultado.resultados,
      },
    });

    return Response.json(
      {
        id: corrida.id,
        propuestaId: corrida.propuestaId,
        total: corrida.total,
        verdes: corrida.verdes,
        rojos: corrida.rojos,
        resultados: resultado.resultados,
        ejecutadaEn: corrida.ejecutadaEn.toISOString(),
      },
      { status: 201 },
    );
  } catch (error) {
    return respuestaDeError(error);
  }
}
