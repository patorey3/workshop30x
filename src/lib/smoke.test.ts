import { describe, expect, it } from "vitest";

describe("smoke", () => {
  it("ejecuta una prueba sin base de datos", () => {
    expect(1 + 1).toBe(2);
  });
});
