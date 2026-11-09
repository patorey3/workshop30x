import { describe, expect, it } from "vitest";
import { NORMA_DEMO_2026, PROPUESTA_DEMO_2026 } from "../../prisma/seed-data";
import { aContrato, campoDeError, validarFormulario, type FormularioDatos } from "./formularioPropuesta";

const valido: FormularioDatos = {
  identificador: NORMA_DEMO_2026.identificador,
  fecha: NORMA_DEMO_2026.fecha,
  texto: NORMA_DEMO_2026.texto,
  valor: PROPUESTA_DEMO_2026.valor,
  vigencia: PROPUESTA_DEMO_2026.vigenteDesde,
  cita: PROPUESTA_DEMO_2026.citaTextual,
};

describe("validarFormulario", () => {
  it("datos válidos: sin errores", () => {
    expect(validarFormulario(valido).errores).toEqual({});
  });

  it("campos vacíos: un error por campo", () => {
    const vacio: FormularioDatos = { identificador: "", fecha: "", texto: "", valor: "", vigencia: "", cita: "" };
    expect(Object.keys(validarFormulario(vacio).errores).sort()).toEqual(
      ["cita", "fecha", "identificador", "texto", "valor", "vigencia"],
    );
  });

  it("solo espacios cuenta como vacío", () => {
    expect(validarFormulario({ ...valido, cita: "   " }).errores.cita).toBeDefined();
  });

  it("fecha y vigencia inválidas", () => {
    expect(validarFormulario({ ...valido, fecha: "31/12/2025" }).errores.fecha).toBeDefined();
    expect(validarFormulario({ ...valido, vigencia: "2026-02-30" }).errores.vigencia).toBeDefined();
  });

  it("valor no numérico, cero o negativo", () => {
    for (const v of ["abc", "0", "-5", "12abc"]) {
      expect(validarFormulario({ ...valido, valor: v }).errores.valor).toBeDefined();
    }
  });
});

describe("aContrato", () => {
  it("con PROPUESTA_DEMO_2026 produce el contrato exacto, sin origen", () => {
    const contrato = aContrato(valido);
    expect(contrato).toEqual({
      parametro: "SBU",
      valor: 482,
      vigenteDesde: "2026-01-01",
      citaTextual: PROPUESTA_DEMO_2026.citaTextual,
    });
    expect(contrato).not.toHaveProperty("origen");
    expect(typeof contrato.valor).toBe("number");
  });
});

describe("campoDeError", () => {
  it("mapea los mensajes del servidor", () => {
    expect(campoDeError("La cita no aparece textualmente en la norma (BR-08).")).toBe("cita");
    expect(campoDeError("El valor debe ser un número positivo con como máximo 2 decimales.")).toBe("valor");
    expect(campoDeError("vigenteDesde debe ser una fecha real AAAA-MM-DD.")).toBe("vigencia");
    expect(campoDeError("Solo se admiten cambios del parámetro SBU (BR-03).")).toBe("parametro");
    expect(campoDeError("Error interno.")).toBeNull();
  });
});
