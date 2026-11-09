import { rechazarPropuesta } from "../../../../../lib/decisiones";
import { prisma } from "../../../../../lib/db";
import { ErrorHttp, leerJson, respuestaDeError } from "../../../../../lib/propuestas";

// POST /api/propuestas/:id/rechazar (T11). Body: { motivo }. Solo cambia la
// propuesta; no toca el motor, las líneas ni los avisos. El actor es siempre
// experto_demo, aunque el cuerpo traiga otro.
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  try {
    const { id } = await params;
    const body = await leerJson(request);
    const motivo =
      typeof body === "object" && body !== null && !Array.isArray(body)
        ? (body as Record<string, unknown>).motivo
        : undefined;
    if (typeof motivo !== "string" || motivo.trim() === "") {
      throw new ErrorHttp(400, "motivo obligatorio");
    }

    await prisma.$transaction((tx) => rechazarPropuesta(tx, id, motivo), { timeout: 15_000 });

    return Response.json({ propuestaId: id, estado: "RECHAZADA", motivo }, { status: 200 });
  } catch (error) {
    return respuestaDeError(error);
  }
}
