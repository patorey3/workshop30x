import { describe, expect, it } from "vitest";
import { puedeAprobar } from "./puedeAprobar";

describe("puedeAprobar", () => {
  it("sin corrida no se puede aprobar", () => {
    expect(puedeAprobar(null, 4)).toBe(false);
  });

  it("con rojos no se puede aprobar", () => {
    expect(puedeAprobar({ total: 4, verdes: 2, rojos: 2 }, 4)).toBe(false);
  });

  it("con corrida incompleta no se puede aprobar", () => {
    expect(puedeAprobar({ total: 3, verdes: 3, rojos: 0 }, 4)).toBe(false);
  });

  it("con corrida completa y toda verde se puede aprobar", () => {
    expect(puedeAprobar({ total: 4, verdes: 4, rojos: 0 }, 4)).toBe(true);
  });

  it("con un solo rojo no se puede aprobar aunque el total coincida", () => {
    expect(puedeAprobar({ total: 4, verdes: 3, rojos: 1 }, 4)).toBe(false);
  });
});
