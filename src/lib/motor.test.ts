import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { calcularMensualizado } from "./motor";

const mensualizado = (sbu: number) => calcularMensualizado({ sbu, optoMensualizacion: true });

describe("calcularMensualizado (BR-06)", () => {
  it("SBU 470 da 39.17", () => {
    expect(mensualizado(470)).toBe(39.17);
  });

  it("SBU 482 da 40.17", () => {
    expect(mensualizado(482)).toBe(40.17);
  });

  it("SBU 428 da 35.67", () => {
    expect(mensualizado(428)).toBe(35.67);
  });

  it("SBU 481.50 da 40.13: el empate 40.125 sube (bancario daría 40.12)", () => {
    expect(mensualizado(481.5)).toBe(40.13);
  });

  it("sin mensualización devuelve null", () => {
    expect(calcularMensualizado({ sbu: 470, optoMensualizacion: false })).toBeNull();
  });

  it.each([
    ["0", 0],
    ["negativo", -470],
    ["NaN", Number.NaN],
    ["Infinity", Number.POSITIVE_INFINITY],
    ["3 decimales (470.123)", 470.123],
    ["3 decimales (39.175)", 39.175],
  ])("SBU %s lanza un error", (_nombre, sbu) => {
    expect(() => mensualizado(sbu)).toThrow(/SBU inválido/);
    expect(() => calcularMensualizado({ sbu, optoMensualizacion: false })).toThrow(/SBU inválido/);
  });

  it("SBU que no es number lanza un error", () => {
    expect(() => mensualizado("470" as unknown as number)).toThrow(/SBU inválido/);
  });

  it("acepta SBU con 2 decimales", () => {
    expect(mensualizado(470.12)).toBe(39.18); // 47012 / 12 = 3917.67 → 39.18
  });

  it("es determinista: la misma entrada da la misma salida", () => {
    expect(mensualizado(481.5)).toBe(mensualizado(481.5));
    expect(mensualizado(470)).toBe(mensualizado(470));
  });

  it("motor.ts no importa Prisma ni usa Date, Math.random o variables de entorno", () => {
    const fuente = readFileSync(fileURLToPath(new URL("./motor.ts", import.meta.url)), "utf8");
    expect(fuente).not.toMatch(/prisma/i);
    expect(fuente).not.toMatch(/\bDate\b/);
    expect(fuente).not.toMatch(/Math\.random/);
    expect(fuente).not.toMatch(/process\.env/);
    expect(fuente).not.toMatch(/\bimport\b|\brequire\(/);
  });
});
