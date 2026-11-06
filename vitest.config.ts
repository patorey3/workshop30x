import { loadEnv } from "vite";
import { defineConfig } from "vitest/config";

export default defineConfig(({ mode }) => ({
  test: {
    include: ["src/**/*.test.ts"],
    // Carga .env completo (no solo VITE_*) en process.env de las pruebas.
    env: loadEnv(mode, process.cwd(), ""),
    setupFiles: ["src/test/setup.ts"],
    // Las pruebas comparten una base de datos: un archivo a la vez.
    fileParallelism: false,
  },
}));
