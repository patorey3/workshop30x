// Datos del estado inicial del demo. Fuente única: docs/seed-data.md (manda la spec, §3).
// Todos los datos son ficticios: las cédulas y los RUC tienen el dígito verificador
// incorrecto a propósito. Importes como texto (Decimal(10,2)) y fechas en ISO (@db.Date).

export const EMPRESAS = [
  {
    id: "emp-01",
    nombre: "Panadería La Espiga",
    ruc: "1792345678001",
    ciudad: "Quito",
    representante: "Juan Carlos Pérez Quishpe",
  },
  {
    id: "emp-02",
    nombre: "Taller Mecánico El Roble",
    ruc: "1798765432001",
    ciudad: "Quito",
    representante: "Ana María García Toapanta",
  },
] as const;

export const EMPLEADOS = [
  {
    id: "emp-juan",
    empresaId: "emp-01",
    nombre: "Juan Carlos Pérez Quishpe",
    cedula: "1712345678",
    cargo: "Panadero",
    sueldo: "600.00",
    fechaIngreso: "2024-03-15",
    optoMensualizacion: true,
  },
  {
    id: "emp-ana",
    empresaId: "emp-02",
    nombre: "Ana María García Toapanta",
    cedula: "1719876543",
    cargo: "Contadora",
    sueldo: "600.00",
    fechaIngreso: "2024-08-01",
    optoMensualizacion: true,
  },
] as const;

// El período pertenece a la empresa (T03); cada empresa tiene un solo empleado.
export const PERIODOS = [
  { id: "per-juan-2025-12", empresaId: "emp-01", anio: 2025, mes: 12, estado: "CERRADO" },
  { id: "per-juan-2026-01", empresaId: "emp-01", anio: 2026, mes: 1, estado: "ABIERTO" },
  { id: "per-ana-2025-07", empresaId: "emp-02", anio: 2025, mes: 7, estado: "CERRADO" },
  { id: "per-ana-2026-02", empresaId: "emp-02", anio: 2026, mes: 2, estado: "ABIERTO" },
] as const;

// Cita literal del comunicado oficial del Ministerio del Trabajo (spec §3, «Cita de la versión 2025»):
// dos fragmentos guardados juntos, con […] entre ellos.
export const CITA_2025 =
  "El Ministerio del Trabajo fijó el Salario Básico Unificado (SBU) del trabajador en general para el año 2025 en USD. 470,00 mensuales. […] El nuevo Salario Básico Unificado (SBU) regirá a partir del 01 de enero de 2025, según el Acuerdo Ministerial Nro. MDT-2024-300";

// Única versión publicada por el seed: «Estado inicial del sistema», sin aprobador (BR-01).
export const VERSION_2025 = {
  id: "v2025",
  parametro: "SBU",
  valor: "470.00",
  vigenteDesde: "2025-01-01",
  fuente: "MDT-2024-300, vigente 2025-01-01",
  citaTextual: CITA_2025,
  estado: "INICIAL",
} as const;

// Una línea de $39.17 (470 ÷ 12, BR-06) con la versión 2025 en cada período.
export const LINEAS_NOMINA = [
  { id: "lin-juan-2025-12", empleadoId: "emp-juan", periodoId: "per-juan-2025-12" },
  { id: "lin-juan-2026-01", empleadoId: "emp-juan", periodoId: "per-juan-2026-01" },
  { id: "lin-ana-2025-07", empleadoId: "emp-ana", periodoId: "per-ana-2025-07" },
  { id: "lin-ana-2026-02", empleadoId: "emp-ana", periodoId: "per-ana-2026-02" },
].map((linea) => ({
  ...linea,
  concepto: "Décimo cuarto mensualizado",
  valor: "39.17",
  versionId: VERSION_2025.id,
}));

// Los únicos 4 casos (S8).
export const CASOS_REGRESION = [
  { id: "rc-01", codigo: "RC-01", empleadoId: "emp-juan", periodoId: "per-juan-2025-12", esperado: "39.17" },
  { id: "rc-02", codigo: "RC-02", empleadoId: "emp-juan", periodoId: "per-juan-2026-01", esperado: "40.17" },
  { id: "rc-03", codigo: "RC-03", empleadoId: "emp-ana", periodoId: "per-ana-2025-07", esperado: "39.17" },
  { id: "rc-04", codigo: "RC-04", empleadoId: "emp-ana", periodoId: "per-ana-2026-02", esperado: "40.17" },
] as const;

// ---------------------------------------------------------------------------
// Datos de referencia de la versión 2026. NO se escriben en la base de datos:
// se ingresan en el flujo y la versión se publica al aprobar (BR-01, T11).
// ---------------------------------------------------------------------------

// TEXTO DE EJEMPLO: el texto oficial del Acuerdo MDT-2025-195 no está verificado.
// T15 indica reemplazar `texto` (y, si cambia, la cita) antes de grabar el demo.
export const NORMA_DEMO_2026 = {
  identificador: "Acuerdo MDT-2025-195",
  fecha: "2025-12-31", // de ejemplo, sin verificar
  texto: [
    "[TEXTO DE EJEMPLO, NO OFICIAL: reemplazar por el texto verificado del Acuerdo MDT-2025-195 antes de grabar el demo.]",
    "",
    "Artículo 1.- Fíjese a partir del 01 de enero de 2026 el Salario Básico Unificado (SBU) del trabajador en general en USD 482,00 mensuales.",
    "",
    "Artículo 2.- El presente Acuerdo Ministerial entrará en vigencia a partir del 01 de enero de 2026.",
  ].join("\n"),
} as const;

export const PROPUESTA_DEMO_2026 = {
  parametro: "SBU",
  valor: "482.00",
  vigenteDesde: "2026-01-01",
  // Debe aparecer literalmente en NORMA_DEMO_2026.texto (BR-08).
  citaTextual:
    "Fíjese a partir del 01 de enero de 2026 el Salario Básico Unificado (SBU) del trabajador en general en USD 482,00 mensuales.",
} as const;
