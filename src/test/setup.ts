import { exigirBaseDePruebas } from "./guard";

// Se ejecuta antes de importar cada archivo de prueba: el cliente de src/lib/db.ts
// lee DATABASE_URL, así que lo apuntamos al esquema de pruebas.
process.env.DATABASE_URL = exigirBaseDePruebas(process.env.TEST_DATABASE_URL);
