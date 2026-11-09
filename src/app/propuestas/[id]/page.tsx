import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { puedeAprobar } from "@/lib/puedeAprobar";
import type { ResultadoCaso } from "@/lib/regresion";
import Acciones from "./Acciones";

export const dynamic = "force-dynamic";

const dia = (f: Date) => f.toISOString().slice(0, 10);
const cel = { padding: 6, textAlign: "left" as const, borderBottom: "1px solid #ddd" };

export default async function PaginaPropuesta({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const propuesta = await prisma.propuesta.findUnique({
    where: { id },
    include: { norma: true, corridas: { orderBy: { ejecutadaEn: "desc" } } },
  });
  if (!propuesta) notFound();

  const totalCasosActuales = await prisma.casoRegresion.count();
  const corrida = propuesta.corridas[0] ?? null;
  const resultados = corrida ? (corrida.resultados as unknown as ResultadoCaso[]) : [];
  const aprobable = puedeAprobar(corrida, totalCasosActuales);

  return (
    <main style={{ maxWidth: 960, margin: "0 auto", padding: 16 }}>
      <p>
        <a href="/bandeja">← Bandeja de propuestas</a>
      </p>
      <h1>Propuesta {propuesta.norma.identificador}</h1>

      <section>
        <h2>Norma</h2>
        <p>
          <strong>{propuesta.norma.identificador}</strong> — {dia(propuesta.norma.fecha)}
        </p>
        <p style={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>{propuesta.norma.texto}</p>
        <p style={{ overflowWrap: "anywhere" }}>
          Cita: <q>{propuesta.citaTextual}</q>
        </p>
      </section>

      <section>
        <h2>Propuesta</h2>
        <ul>
          <li>Parámetro: {propuesta.parametro}</li>
          <li>Valor: ${propuesta.valor.toFixed(2)}</li>
          <li>Vigente desde: {dia(propuesta.vigenteDesde)}</li>
          <li>Origen: {propuesta.origen}</li>
          <li>Estado: {propuesta.estado}</li>
        </ul>
      </section>

      <section>
        <h2>Corrida de regresión</h2>
        {corrida === null ? (
          <p>Sin corrida</p>
        ) : (
          <>
            <p>
              {corrida.verdes} de {corrida.total} en verde, {corrida.rojos} en rojo.
            </p>
            <div style={{ overflowX: "auto" }}>
              <table style={{ borderCollapse: "collapse", width: "100%" }}>
                <thead>
                  <tr>
                    {["Código", "Esperado", "Antes", "Después", "Estado"].map((c) => (
                      <th key={c} style={cel}>
                        {c}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {resultados.map((r) => (
                    <tr key={r.codigo}>
                      <td style={cel}>{r.codigo}</td>
                      <td style={cel}>{r.esperado}</td>
                      <td style={cel}>{r.antes ?? "—"}</td>
                      <td style={cel}>{r.despues ?? "—"}</td>
                      <td style={{ ...cel, color: r.verde ? "#116611" : "#b00020" }}>
                        {r.verde ? "✅ Verde" : "❌ Rojo"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </section>

      <section>
        <h2>Decisión</h2>
        {propuesta.estado === "APROBADA" && (
          <p>
            APROBADA por {propuesta.actor ?? "experto_demo"}
            {propuesta.decididaEn ? ` el ${propuesta.decididaEn.toISOString()}` : ""}
          </p>
        )}
        {propuesta.estado === "RECHAZADA" && <p>RECHAZADA: {propuesta.motivoRechazo}</p>}
        <Acciones
          propuestaId={propuesta.id}
          puedeAprobar={aprobable}
          estado={propuesta.estado}
          hayCorrida={corrida !== null}
        />
      </section>
    </main>
  );
}
