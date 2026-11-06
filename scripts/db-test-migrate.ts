// npm run db:test:migrate: aplica las migraciones al esquema `test`, nunca a `public`.
// Prisma crea el esquema si no existe (equivale a CREATE SCHEMA IF NOT EXISTS test).
import { spawnSync } from "node:child_process";
import { redactarCredenciales } from "../src/lib/redactar";
import { exigirBaseDePruebas } from "../src/test/guard";

let url: string;
try {
  url = exigirBaseDePruebas(process.env.TEST_DATABASE_URL);
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}

// Las variables del proceso tienen prioridad sobre .env en la CLI de Prisma.
const resultado = spawnSync("npx prisma migrate deploy", {
  shell: true,
  encoding: "utf8",
  env: { ...process.env, DATABASE_URL: url, DIRECT_URL: url },
});

const salida = `${resultado.stdout ?? ""}${resultado.stderr ?? ""}`;
console.log(redactarCredenciales(salida, [url]).trimEnd());
process.exit(resultado.status ?? 1);
