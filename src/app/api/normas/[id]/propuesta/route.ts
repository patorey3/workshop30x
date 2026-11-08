import { prisma } from "../../../../../lib/db";
import { ErrorHttp, leerJson, respuestaDeError, validarPropuesta } from "../../../../../lib/propuestas";

// POST /api/normas/:id/propuesta: contrato de la spec, §6. Solo crea una fila en
// Propuesta (estado PENDIENTE, origen manual); no toca VersionMotor, Periodo ni
// LineaNomina (BR-01).
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  try {
    const { id } = await params;
    const cuerpo = await leerJson(request);

    const norma = await prisma.norma.findUnique({ where: { id }, select: { id: true, texto: true } });
    if (!norma) throw new ErrorHttp(404, "La norma no existe.");

    const datos = validarPropuesta(cuerpo, norma.texto);
    const p = await prisma.propuesta.create({
      data: { ...datos, normaId: norma.id, estado: "PENDIENTE" },
    });

    return Response.json(
      {
        id: p.id,
        normaId: p.normaId,
        parametro: p.parametro,
        valor: p.valor.toFixed(2),
        vigenteDesde: p.vigenteDesde.toISOString().slice(0, 10),
        citaTextual: p.citaTextual,
        origen: p.origen,
        estado: p.estado,
        creadaEn: p.creadaEn.toISOString(),
      },
      { status: 201 },
    );
  } catch (error) {
    return respuestaDeError(error);
  }
}
