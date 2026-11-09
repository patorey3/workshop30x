"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  propuestaId: string;
  puedeAprobar: boolean;
  estado: "PENDIENTE" | "APROBADA" | "RECHAZADA";
  hayCorrida: boolean;
};

export default function Acciones({ propuestaId, puedeAprobar, estado, hayCorrida }: Props) {
  const router = useRouter();
  const [ocupado, setOcupado] = useState(false);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [rechazando, setRechazando] = useState(false);
  const [motivo, setMotivo] = useState("");

  async function llamar(ruta: string, cuerpo?: unknown) {
    setOcupado(true);
    setError(null);
    setMensaje(null);
    try {
      const r = await fetch(`/api/propuestas/${propuestaId}/${ruta}`, {
        method: "POST",
        headers: cuerpo ? { "Content-Type": "application/json" } : undefined,
        body: cuerpo ? JSON.stringify(cuerpo) : undefined,
      });
      const datos = await r.json().catch(() => ({}));
      return { ok: r.ok, estado: r.status, datos };
    } catch {
      setError("No se pudo conectar con el servidor.");
      return null;
    } finally {
      setOcupado(false);
    }
  }

  const msg = (d: { error?: string; mensaje?: string }) => d.error ?? d.mensaje ?? "La operación falló.";

  async function regresion() {
    const r = await llamar("regresion");
    if (!r) return;
    if (r.ok) router.refresh();
    else setError(msg(r.datos));
  }

  async function aprobar() {
    const r = await llamar("aprobar");
    if (!r) return;
    if (r.ok) {
      setMensaje("Propuesta aprobada.");
      router.refresh();
    } else setError(msg(r.datos));
  }

  async function confirmarRechazo() {
    if (motivo.trim() === "") {
      setError("El motivo es obligatorio.");
      return;
    }
    const r = await llamar("rechazar", { motivo });
    if (!r) return;
    if (r.ok) {
      setMensaje("Propuesta rechazada.");
      router.refresh();
    } else setError(msg(r.datos));
  }

  const pendiente = estado === "PENDIENTE";

  return (
    <div>
      {pendiente && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          <button type="button" onClick={regresion} disabled={rechazando || ocupado}>
            {hayCorrida ? "Ejecutar regresión de nuevo" : "Ejecutar regresión"}
          </button>
          <button
            type="button"
            onClick={aprobar}
            disabled={rechazando || ocupado || !puedeAprobar}
            title={puedeAprobar ? undefined : "Necesita corrida completa en verde"}
          >
            Aprobar
          </button>
          <button type="button" onClick={() => setRechazando(true)} disabled={ocupado || rechazando}>
            Rechazar
          </button>
        </div>
      )}
      {pendiente && rechazando && (
        <div style={{ marginTop: 12 }}>
          <label htmlFor="motivo">Motivo del rechazo</label>
          <br />
          <textarea
            id="motivo"
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            rows={3}
            style={{ width: "100%", maxWidth: 480, boxSizing: "border-box" }}
          />
          <br />
          <button type="button" onClick={confirmarRechazo} disabled={ocupado}>
            Confirmar rechazo
          </button>{" "}
          <button type="button" onClick={() => { setRechazando(false); setError(null); }} disabled={ocupado}>
            Cancelar
          </button>
        </div>
      )}
      {error && (
        <p role="alert" style={{ color: "#b00020" }}>
          {error}
        </p>
      )}
      {mensaje && <p role="status">{mensaje}</p>}
    </div>
  );
}
