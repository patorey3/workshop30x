// Las pruebas solo pueden correr contra el esquema `test`, nunca contra los datos del demo.
export function exigirBaseDePruebas(url: string | undefined): string {
  if (!url) {
    throw new Error("Falta TEST_DATABASE_URL. Defínela en .env (ver .env.example).");
  }
  if (!url.includes("schema=test")) {
    throw new Error("TEST_DATABASE_URL debe contener schema=test, para no tocar los datos del demo.");
  }
  return url;
}
