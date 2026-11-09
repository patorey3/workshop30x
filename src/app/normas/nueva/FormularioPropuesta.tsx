"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import {
  aContrato,
  campoDeError,
  validarFormulario,
  type CampoFormulario,
  type ErroresFormulario,
  type FormularioDatos,
} from "../../../lib/formularioPropuesta";

const VACIO: FormularioDatos = { identificador: "", fecha: "", texto: "", valor: "", vigencia: "", cita: "" };

const estiloCampo = { display: "block", width: "100%", boxSizing: "border-box", padding: 8, font: "inherit" } as const;
const estiloBloque = { marginBottom: 16 } as const;
const estiloError = { color: "#b00020", margin: "4px 0 0" } as const;

type Props = { valoresIniciales?: Partial<FormularioDatos> };

export default function FormularioPropuesta({ valoresIniciales }: Props) {
  const router = useRouter();
  const [datos, setDatos] = useState<FormularioDatos>({ ...VACIO, ...valoresIniciales });
  const [errores, setErrores] = useState<ErroresFormulario & { general?: string }>({});
  // Persiste entre intentos: evita duplicar la norma al reintentar la propuesta.
  const [normaId, setNormaId] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  function cambiar(campo: CampoFormulario, valor: string) {
    setDatos((d) => ({ ...d, [campo]: valor }));
  }

  async function leerError(res: Response): Promise<string> {
    try {
      const cuerpo = (await res.json()) as { error?: string };
      return cuerpo.error ?? "Error inesperado.";
    } catch {
      return "Error inesperado.";
    }
  }

  function mostrarErrorServidor(mensaje: string) {
    const campo = campoDeError(mensaje);
    if (campo === null || campo === "parametro") setErrores({ general: mensaje });
    else setErrores({ [campo]: mensaje });
  }

  async function enviar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const { errores: locales } = validarFormulario(datos);
    if (Object.keys(locales).length > 0) {
      setErrores(locales);
      return;
    }
    setErrores({});
    setEnviando(true);
    try {
      let id = normaId;
      if (id === null) {
        const res = await fetch("/api/normas", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ identificador: datos.identificador, fecha: datos.fecha, texto: datos.texto }),
        });
        if (res.status !== 201) {
          mostrarErrorServidor(await leerError(res));
          return;
        }
        id = ((await res.json()) as { id: string }).id;
        setNormaId(id);
      }

      const res = await fetch(`/api/normas/${id}/propuesta`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(aContrato(datos)),
      });
      if (res.status === 201) {
        const propuesta = (await res.json()) as { id: string };
        router.push(`/propuestas/${propuesta.id}`);
        return;
      }
      // Nunca se limpia normaId: el reintento solo repite la propuesta.
      mostrarErrorServidor(await leerError(res));
    } catch {
      setErrores({ general: "No se pudo conectar con el servidor." });
    } finally {
      setEnviando(false);
    }
  }

  function campo(
    nombre: CampoFormulario,
    etiqueta: string,
    opciones: { tipo?: string; multilinea?: boolean; ayuda?: string; inputMode?: "decimal" } = {},
  ) {
    const error = errores[nombre];
    const comunes = {
      id: nombre,
      name: nombre,
      value: datos[nombre],
      onChange: (ev: { target: { value: string } }) => cambiar(nombre, ev.target.value),
      "aria-invalid": error ? true : undefined,
      "aria-describedby": error ? `${nombre}-error` : undefined,
      style: estiloCampo,
    };
    return (
      <div style={estiloBloque}>
        <label htmlFor={nombre}>{etiqueta}</label>
        {opciones.multilinea ? (
          <textarea {...comunes} rows={6} />
        ) : (
          <input {...comunes} type={opciones.tipo ?? "text"} inputMode={opciones.inputMode} placeholder={opciones.ayuda} />
        )}
        {error && (
          <p id={`${nombre}-error`} role="alert" style={estiloError}>
            {error}
          </p>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={enviar} noValidate>
      <fieldset style={{ border: "none", padding: 0, margin: "0 0 16px", minWidth: 0 }}>
        <legend>
          <h2>Norma</h2>
        </legend>
        {campo("identificador", "Identificador")}
        {campo("fecha", "Fecha (AAAA-MM-DD)", { ayuda: "2025-12-31" })}
        {campo("texto", "Texto de la norma", { multilinea: true })}
      </fieldset>

      <fieldset style={{ border: "none", padding: 0, margin: "0 0 16px", minWidth: 0 }}>
        <legend>
          <h2>Propuesta</h2>
        </legend>
        <div style={estiloBloque}>
          <label htmlFor="parametro">Parámetro</label>
          <input id="parametro" name="parametro" type="text" value="SBU" readOnly style={estiloCampo} />
        </div>
        {campo("valor", "Valor (USD)", { inputMode: "decimal", ayuda: "482.00" })}
        {campo("vigencia", "Vigente desde (AAAA-MM-DD)", { ayuda: "2026-01-01" })}
        {campo("cita", "Cita textual", { multilinea: true })}
      </fieldset>

      {errores.general && (
        <p role="alert" style={estiloError}>
          {errores.general}
        </p>
      )}
      <button type="submit" disabled={enviando}>
        {enviando ? "Enviando…" : "Crear propuesta"}
      </button>
    </form>
  );
}
