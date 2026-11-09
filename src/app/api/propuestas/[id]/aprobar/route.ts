import { aprobarPropuesta } from "../../../../../lib/decisiones";
import { prisma } from "../../../../../lib/db";
import { ErrorHttp, respuestaDeError } from "../../../../../lib/propuestas";

// POST /api/propuestas/:id/aprobar (T11). Decisión, VersionMotor, períodos
// abiertos (T10) y avisos en una sola transacción. El actor es siempre
// experto_demo: el cuerpo de la solicitud no se lee.
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  try {
    const { id } = await params;

    // 404 rápido, sin abrir transacción.
    const propuesta = await prisma.propuesta.findUnique({ where: { id }, select: { id: true } });
    if (!propuesta) throw new ErrorHttp(404, "propuesta no encontrada");

    // Supabase tiene latencia real: el límite por defecto de 5 s puede no alcanzar.
    const resultado = await prisma.$transaction((tx) => aprobarPropuesta(tx, id), { timeout: 15_000 });

    return Response.json({ propuestaId: id, estado: "APROBADA", ...resultado }, { status: 200 });
  } catch (error) {
    return respuestaDeError(error);
  }
}
