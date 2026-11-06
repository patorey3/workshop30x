import { afterAll, describe, expect, it } from "vitest";
import { exigirBaseDePruebas } from "../test/guard";
import { prisma } from "./db";
import { redactarCredenciales } from "./redactar";

describe("base de datos de pruebas", () => {
  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("el cliente apunta a TEST_DATABASE_URL", () => {
    expect(process.env.DATABASE_URL).toBe(process.env.TEST_DATABASE_URL);
  });

  it("ejecuta una consulta real", async () => {
    const filas = await prisma.$queryRaw<Array<{ ok: number }>>`SELECT 1 AS ok`;
    expect(filas).toEqual([{ ok: 1 }]);
  });
});

describe("exigirBaseDePruebas", () => {
  it("rechaza una URL ausente", () => {
    expect(() => exigirBaseDePruebas(undefined)).toThrow(/Falta TEST_DATABASE_URL/);
  });

  it("rechaza una URL sin schema=test", () => {
    expect(() => exigirBaseDePruebas("postgresql://u:p@h:5432/postgres")).toThrow(/schema=test/);
  });

  it("acepta una URL con schema=test", () => {
    const url = "postgresql://u:p@h:5432/postgres?schema=test";
    expect(exigirBaseDePruebas(url)).toBe(url);
  });
});

describe("redactarCredenciales", () => {
  it("no deja la contraseña en el texto", () => {
    const url = "postgresql://postgres.abc:s3cr3t%21@aws-0.pooler.supabase.com:6543/postgres";
    const texto = `fallo al conectar a ${url} con s3cr3t!`;
    const limpio = redactarCredenciales(texto, [url]);
    expect(limpio).not.toContain("s3cr3t");
    expect(limpio).toContain("postgresql://***@aws-0.pooler.supabase.com");
  });
});
