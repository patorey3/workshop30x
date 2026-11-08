import { describe, expect, it } from "vitest";
import { NORMA_DEMO_2026, PROPUESTA_DEMO_2026 } from "../../prisma/seed-data";
import { ErrorHttp, normalizarEspacios, validarNorma, validarPropuesta } from "./propuestas";

const TEXTO = NORMA_DEMO_2026.texto;
const valida = { ...PROPUESTA_DEMO_2026 };

function codigo(fn: () => unknown): number | undefined {
  try {
    fn();
  } catch (e) {
    if (e instanceof ErrorHttp) return e.status;
    throw e;
  }
  return undefined;
}

describe("normalizarEspacios", () => {
  it("colapsa espacios, tabuladores, saltos de línea y espacios duros, y recorta", () => {
    expect(normalizarEspacios("  a  b\tc\nd\r\ne f  \n g  ")).toBe("a b c d e f g");
  });

  it("no toca mayúsculas, tildes, comillas ni puntuación", () => {
    expect(normalizarEspacios("Fíjese «SBU», \"USD\" 482,00.")).toBe("Fíjese «SBU», \"USD\" 482,00.");
  });

  it("una cadena solo de espacios queda vacía", () => {
    expect(normalizarEspacios(" \t\n  ")).toBe("");
  });
});

describe("validarPropuesta", () => {
  it("acepta la propuesta demo de $482 desde 2026-01-01", () => {
    const r = validarPropuesta(valida, TEXTO);
    expect(r.parametro).toBe("SBU");
    expect(r.valor.toFixed(2)).toBe("482.00");
    expect(r.vigenteDesde.toISOString()).toBe("2026-01-01T00:00:00.000Z");
    expect(r.citaTextual).toBe(valida.citaTextual);
    expect(r.origen).toBe("manual");
  });

  it("acepta el valor como número", () => {
    expect(validarPropuesta({ ...valida, valor: 482 }, TEXTO).valor.toFixed(2)).toBe("482.00");
  });

  it("rechaza un parámetro distinto de SBU con 422 (BR-03)", () => {
    expect(codigo(() => validarPropuesta({ ...valida, parametro: "SUELDO" }, TEXTO))).toBe(422);
    expect(codigo(() => validarPropuesta({ ...valida, parametro: "sbu" }, TEXTO))).toBe(422);
    const { parametro: _, ...sinParametro } = valida;
    expect(codigo(() => validarPropuesta(sinParametro, TEXTO))).toBe(422);
  });

  it("rechaza una cita vacía, solo de espacios o ausente con 422 (BR-08)", () => {
    expect(codigo(() => validarPropuesta({ ...valida, citaTextual: "" }, TEXTO))).toBe(422);
    expect(codigo(() => validarPropuesta({ ...valida, citaTextual: " \n\t  " }, TEXTO))).toBe(422);
    expect(codigo(() => validarPropuesta({ ...valida, citaTextual: undefined }, TEXTO))).toBe(422);
    expect(codigo(() => validarPropuesta({ ...valida, citaTextual: "USD 428,00 mensuales" }, TEXTO))).toBe(422);
  });

  it("rechaza una cita con una tilde, una mayúscula o unas comillas alteradas", () => {
    const cita = valida.citaTextual;
    expect(codigo(() => validarPropuesta({ ...valida, citaTextual: cita.replace("Fíjese", "Fijese") }, TEXTO))).toBe(422);
    expect(codigo(() => validarPropuesta({ ...valida, citaTextual: cita.replace("Salario", "salario") }, TEXTO))).toBe(422);
    expect(codigo(() => validarPropuesta({ ...valida, citaTextual: cita.replace("(SBU)", "(\"SBU\")") }, TEXTO))).toBe(422);
  });

  it("acepta una cita que difiere solo en espacios y la guarda tal como llegó", () => {
    const doble = valida.citaTextual.replace("Salario Básico", "Salario  Básico");
    expect(validarPropuesta({ ...valida, citaTextual: doble }, TEXTO).citaTextual).toBe(doble);
    const salto = valida.citaTextual.replace("de 2026 el", "de 2026\nel");
    expect(validarPropuesta({ ...valida, citaTextual: salto }, TEXTO).citaTextual).toBe(salto);
    const bordes = `  ${valida.citaTextual} `;
    expect(validarPropuesta({ ...valida, citaTextual: bordes }, TEXTO).citaTextual).toBe(bordes);
  });

  it("acepta una cita que cruza un salto de línea del texto", () => {
    const texto = "Artículo 1.- Fíjese el SBU\nen USD 482,00.";
    expect(validarPropuesta({ ...valida, citaTextual: "SBU en USD 482,00" }, texto).origen).toBe("manual");
  });

  it("fuerza origen manual aunque llegue llm", () => {
    expect(validarPropuesta({ ...valida, origen: "llm" }, TEXTO).origen).toBe("manual");
  });

  it("valida que el valor sea positivo y con como máximo 2 decimales", () => {
    for (const v of [0, -482, "0", "-482", 482.001, "482.001", "abc", "", null, undefined, Infinity, NaN, true]) {
      expect(codigo(() => validarPropuesta({ ...valida, valor: v }, TEXTO)), String(v)).toBe(422);
    }
    expect(validarPropuesta({ ...valida, valor: 482.5 }, TEXTO).valor.toFixed(2)).toBe("482.50");
    expect(validarPropuesta({ ...valida, valor: "428.10" }, TEXTO).valor.toFixed(2)).toBe("428.10");
  });

  it("valida que vigenteDesde sea una fecha real AAAA-MM-DD", () => {
    for (const f of ["2026-02-30", "2026-13-01", "2026-1-1", "01/01/2026", "2026-01-01T00:00:00Z", "", null, 20260101]) {
      expect(codigo(() => validarPropuesta({ ...valida, vigenteDesde: f }, TEXTO)), String(f)).toBe(422);
    }
    expect(validarPropuesta({ ...valida, vigenteDesde: "2028-02-29" }, TEXTO).vigenteDesde.toISOString()).toBe(
      "2028-02-29T00:00:00.000Z",
    );
  });

  it("rechaza un cuerpo que no es objeto con 400", () => {
    for (const e of [null, [], "x", 1]) {
      expect(codigo(() => validarPropuesta(e, TEXTO))).toBe(400);
    }
  });
});

describe("validarNorma", () => {
  const norma = { identificador: NORMA_DEMO_2026.identificador, fecha: NORMA_DEMO_2026.fecha, texto: TEXTO };

  it("acepta una norma válida", () => {
    const r = validarNorma(norma);
    expect(r.identificador).toBe(norma.identificador);
    expect(r.fecha.toISOString()).toBe("2025-12-31T00:00:00.000Z");
    expect(r.texto).toBe(TEXTO);
  });

  it("exige identificador, fecha y texto (400)", () => {
    for (const campo of ["identificador", "fecha", "texto"] as const) {
      const { [campo]: _, ...sin } = norma;
      expect(codigo(() => validarNorma(sin)), campo).toBe(400);
      expect(codigo(() => validarNorma({ ...norma, [campo]: "  " })), campo).toBe(400);
    }
  });

  it("exige una fecha real (400)", () => {
    expect(codigo(() => validarNorma({ ...norma, fecha: "2025-02-30" }))).toBe(400);
    expect(codigo(() => validarNorma({ ...norma, fecha: "31/12/2025" }))).toBe(400);
  });

  it("rechaza un cuerpo que no es objeto (400)", () => {
    expect(codigo(() => validarNorma(null))).toBe(400);
    expect(codigo(() => validarNorma([]))).toBe(400);
  });
});
