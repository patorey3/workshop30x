// Quita las credenciales de cualquier cadena de conexión que aparezca en un texto.
export function redactarCredenciales(texto: string, urls: Array<string | undefined> = []): string {
  let resultado = texto.replace(/(postgres(?:ql)?:\/\/)[^@\s/]*@/gi, "$1***@");
  for (const url of urls) {
    const password = extraerPassword(url);
    if (password) resultado = resultado.split(password).join("***");
  }
  return resultado;
}

function extraerPassword(url: string | undefined): string | null {
  if (!url) return null;
  try {
    const password = new URL(url).password;
    return password ? decodeURIComponent(password) : null;
  } catch {
    return null;
  }
}
