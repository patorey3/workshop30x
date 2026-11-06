import { Prisma } from "@prisma/client";
import { afterAll, afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { limpiarBaseDePruebas } from "../test/limpiar";
import { prisma } from "./db";
import { obtenerVersionesPublicadas, primerDiaDePeriodo, versionVigenteEn } from "./parametros";

type V = { id: string; vigenteDesde: Date };

const v2025: V = { id: "v2025", vigenteDesde: new Date("2025-01-01") };
const v2025mid: V = { id: "v2025-mid", vigenteDesde: new Date("2025-06-01") };
const v2026: V = { id: "v2026", vigenteDesde: new Date("2026-01-01") };

function vigente(versiones: V[], anio: number, mes: number): string {
  return versionVigenteEn(versiones, primerDiaDePeriodo(anio, mes)).id;
}

describe("primerDiaDePeriodo", () => {
  it("devuelve el primer día en UTC, con mes de 1 a 12", () => {
    expect(primerDiaDePeriodo(2026, 1).toISOString()).toBe("2026-01-01T00:00:00.000Z");
    expect(primerDiaDePeriodo(2025, 12).toISOString()).toBe("2025-12-01T00:00:00.000Z");
  });

  it("rechaza un mes fuera de rango", () => {
    expect(() => primerDiaDePeriodo(2026, 0)).toThrow(/Período inválido/);
    expect(() => primerDiaDePeriodo(2026, 13)).toThrow(/Período inválido/);
  });
});

describe("versionVigenteEn (BR-04)", () => {
  it("con 2025 y 2026, cada período usa la versión vigente en su primer día", () => {
    const versiones = [v2025, v2026];
    expect(vigente(versiones, 2025, 12)).toBe("v2025");
    expect(vigente(versiones, 2026, 1)).toBe("v2026");
    expect(vigente(versiones, 2025, 7)).toBe("v2025");
    expect(vigente(versiones, 2026, 2)).toBe("v2026");
  });

  it("una versión desde 2026-01-01 aplica a un período que empieza ese mismo día", () => {
    expect(versionVigenteEn([v2025, v2026], new Date("2026-01-01")).id).toBe("v2026");
  });

  it("una vigencia desde 2026-01-15 no aplica a enero de 2026", () => {
    const v15: V = { id: "v2026-15", vigenteDesde: new Date("2026-01-15") };
    expect(vigente([v2025, v15], 2026, 1)).toBe("v2025");
    expect(vigente([v2025, v15], 2026, 2)).toBe("v2026-15");
  });

  it("con solo 2025, diciembre resuelve y enero de 2026 también usa 2025", () => {
    expect(vigente([v2025], 2025, 12)).toBe("v2025");
    expect(vigente([v2025], 2026, 1)).toBe("v2025");
  });

  it("una fecha anterior a todas las versiones lanza un error explícito", () => {
    expect(() => vigente([v2025, v2026], 2024, 12)).toThrow(
      "Ninguna versión está vigente el 2024-12-01. Vigencias disponibles: 2025-01-01, 2026-01-01.",
    );
  });

  it("con lista vacía lanza un error explícito", () => {
    expect(() => vigente([], 2025, 12)).toThrow(
      "Ninguna versión está vigente el 2025-12-01. Vigencias disponibles: ninguna.",
    );
  });

  it("una lista desordenada da el mismo resultado", () => {
    for (const [anio, mes] of [
      [2025, 7],
      [2025, 12],
      [2026, 1],
      [2026, 2],
    ]) {
      expect(vigente([v2026, v2025], anio, mes)).toBe(vigente([v2025, v2026], anio, mes));
    }
    expect(vigente([v2026, v2025mid, v2025], 2025, 8)).toBe("v2025-mid");
  });

  it("elige la vigencia más reciente cuando hay varias aplicables", () => {
    const versiones = [v2025, v2025mid, v2026];
    expect(vigente(versiones, 2025, 8)).toBe("v2025-mid");
    expect(vigente(versiones, 2025, 12)).toBe("v2025-mid");
    expect(vigente(versiones, 2025, 5)).toBe("v2025");
  });

  it("admite una versión candidata añadida a la lista, sin modificarla", () => {
    const publicadas = [v2025];
    const candidata: V = { id: "candidata", vigenteDesde: new Date("2026-01-01") };
    const conCandidata = [...publicadas, candidata];
    expect(vigente(conCandidata, 2026, 1)).toBe("candidata");
    expect(vigente(conCandidata, 2025, 12)).toBe("v2025");
    expect(publicadas).toEqual([v2025]);
  });

  describe("con otra fecha del sistema", () => {
    afterEach(() => {
      vi.useRealTimers();
    });

    it("el resultado no cambia", () => {
      const versiones = [v2025, v2026];
      for (const ahora of ["2024-03-15T12:00:00Z", "2025-12-31T23:59:59Z", "2030-06-01T05:00:00Z"]) {
        vi.useFakeTimers();
        vi.setSystemTime(new Date(ahora));
        expect(vigente(versiones, 2025, 12)).toBe("v2025");
        expect(vigente(versiones, 2026, 1)).toBe("v2026");
        vi.useRealTimers();
      }
    });
  });
});

describe("obtenerVersionesPublicadas", () => {
  beforeEach(async () => {
    await limpiarBaseDePruebas(prisma);
  });

  afterAll(async () => {
    await limpiarBaseDePruebas(prisma);
    await prisma.$disconnect();
  });

  it("devuelve únicamente versiones del parámetro SBU", async () => {
    const base = { fuente: "fuente de prueba", citaTextual: "cita de prueba" };
    await prisma.versionMotor.createMany({
      data: [
        { ...base, parametro: "SBU", valor: new Prisma.Decimal("482.00"), vigenteDesde: new Date("2026-01-01"), estado: "APROBADA" },
        { ...base, parametro: "OTRO", valor: new Prisma.Decimal("999.00"), vigenteDesde: new Date("2025-06-01"), estado: "APROBADA" },
        { ...base, parametro: "SBU", valor: new Prisma.Decimal("470.00"), vigenteDesde: new Date("2025-01-01"), estado: "INICIAL" },
      ],
    });

    const versiones = await obtenerVersionesPublicadas(prisma);

    expect(versiones.map((v) => [v.parametro, v.valor.toFixed(2)])).toEqual([
      ["SBU", "470.00"],
      ["SBU", "482.00"],
    ]);
    expect(versionVigenteEn(versiones, primerDiaDePeriodo(2025, 12)).valor.toFixed(2)).toBe("470.00");
    expect(versionVigenteEn(versiones, primerDiaDePeriodo(2026, 1)).valor.toFixed(2)).toBe("482.00");
  });
});
