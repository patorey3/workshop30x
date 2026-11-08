import { prisma } from "../../../lib/db";
import { leerJson, respuestaDeError, validarNorma } from "../../../lib/propuestas";

// POST /api/normas: { identificador, fecha: "AAAA-MM-DD", texto } → 201 { id }.
export async function POST(request: Request): Promise<Response> {
  try {
    const datos = validarNorma(await leerJson(request));
    const norma = await prisma.norma.create({ data: datos, select: { id: true } });
    return Response.json({ id: norma.id }, { status: 201 });
  } catch (error) {
    return respuestaDeError(error);
  }
}
