import Link from "next/link";
import { prisma } from "@/lib/db";

// Lee la base en cada petición: no se puede prerenderizar en el build.
export const dynamic = "force-dynamic";

const dia = (f: Date) => f.toISOString().slice(0, 10);

export default async function Bandeja() {
  const propuestas = await prisma.propuesta.findMany({
    include: { norma: true },
    orderBy: { creadaEn: "desc" },
  });

  return (
    <main style={{ maxWidth: 960, margin: "0 auto", padding: 16 }}>
      <h1>Bandeja de propuestas</h1>
      {propuestas.length === 0 ? (
        <p>No hay propuestas.</p>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ borderCollapse: "collapse", width: "100%" }}>
            <thead>
              <tr>
                {["Norma", "Parámetro", "Valor", "Vigencia", "Origen", "Estado", ""].map((c, i) => (
                  <th key={i} style={{ textAlign: "left", borderBottom: "1px solid #999", padding: 6 }}>
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {propuestas.map((p) => (
                <tr key={p.id}>
                  <td style={{ padding: 6 }}>{p.norma.identificador}</td>
                  <td style={{ padding: 6 }}>{p.parametro}</td>
                  <td style={{ padding: 6 }}>${p.valor.toFixed(2)}</td>
                  <td style={{ padding: 6 }}>{dia(p.vigenteDesde)}</td>
                  <td style={{ padding: 6 }}>{p.origen}</td>
                  <td style={{ padding: 6 }}>{p.estado}</td>
                  <td style={{ padding: 6 }}>
                    <Link href={`/propuestas/${p.id}`} aria-label={`Revisar propuesta de ${p.norma.identificador}`}>
                      Revisar
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
