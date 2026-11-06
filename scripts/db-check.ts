// npm run db:check: ejecuta SELECT 1 por DATABASE_URL y por DIRECT_URL.
// Nunca imprime las credenciales; termina con código 1 si alguna falla.
import { PrismaClient } from "@prisma/client";
import { redactarCredenciales } from "../src/lib/redactar";

const variables = ["DATABASE_URL", "DIRECT_URL"] as const;
const urls = variables.map((nombre) => process.env[nombre]);

async function comprobar(nombre: string, url: string | undefined): Promise<boolean> {
  if (!url) {
    console.error(`✗ ${nombre}: no está definida (ver .env.example).`);
    return false;
  }
  const cliente = new PrismaClient({ datasourceUrl: url });
  try {
    await cliente.$queryRaw`SELECT 1`;
    console.log(`✓ ${nombre}: SELECT 1 correcto.`);
    return true;
  } catch (error) {
    const mensaje = error instanceof Error ? error.message : String(error);
    console.error(`✗ ${nombre}: ${redactarCredenciales(mensaje, urls).trim()}`);
    return false;
  } finally {
    await cliente.$disconnect().catch(() => {});
  }
}

async function main() {
  let ok = true;
  for (const nombre of variables) {
    ok = (await comprobar(nombre, process.env[nombre])) && ok;
  }
  process.exit(ok ? 0 : 1);
}

main();
