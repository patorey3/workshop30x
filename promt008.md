Antes de T03 necesito un documento consolidado de datos del seed. Es la
fuente única para T03 (modelo) y T04 (seed). No es un documento nuevo del
plan: consolida lo que ya está en docs/spec-rebanada-a.md §3, BR-06 y la
spec, y lo enriquece con campos cosméticos (nombres, cédulas, cargos,
empresas, fechas de ingreso) que no afectan los cálculos.

## PARTE 1 — Crear docs/seed-data.md

Crea docs/seed-data.md con estas secciones exactas (tablas markdown):

### 1. Empresas
| ID | Nombre | RUC ficticio | Ciudad | Representante |
- emp-01 | Panadería La Espiga | 1792345678001 | Quito | Juan Carlos Pérez Quishpe
- emp-02 | Taller Mecánico El Roble | 1798765432001 | Quito | Ana María García Toapanta

### 2. Empleados
| ID | Nombre | Cédula | Empresa | Cargo | Sueldo | Fecha ingreso | Mensualizado |
- emp-juan | Juan Carlos Pérez Quishpe | 1712345678 | emp-01 | Panadero | 600.00 | 2024-03-15 | sí
- emp-ana | Ana María García Toapanta | 1719876543 | emp-02 | Contadora | 600.00 | 2024-08-01 | sí

### 3. Períodos
| ID | Empleado | Período | Estado | Décimo 4° inicial | Versión |
- per-juan-2025-12 | emp-juan | 2025-12 | cerrado | 39.17 | v2025
- per-juan-2026-01 | emp-juan | 2026-01 | abierto | 39.17 | v2025
- per-ana-2025-07 | emp-ana | 2025-07 | cerrado | 39.17 | v2025
- per-ana-2026-02 | emp-ana | 2026-02 | abierto | 39.17 | v2025

### 4. Versiones del motor
| Versión | SBU | Vigente desde | Fuente | Estado en seed |
- v2025 | 470.00 | 2025-01-01 | MDT-2024-300 (cita textual pendiente de transcribir) | publicada
- v2026 | 482.00 | 2026-01-01 | MDT-2025-195 (cita textual pendiente) | NO existe; se crea al aprobar
Nota: BR-01 prohíbe publicar sin aprobación humana, por eso v2026 no está
en el seed.

### 5. Líneas de nómina
Una línea por período: concepto "Décimo cuarto mensualizado", valor 39.17,
versión v2025. Tras aprobar la propuesta de $482: los dos períodos
cerrados siguen en 39.17; los dos abiertos pasan a 40.17 con v2026.

### 6. Casos de regresión
| ID | Empleado | Período | Esperado |
- RC-01 | emp-juan | 2025-12 | 39.17
- RC-02 | emp-juan | 2026-01 | 40.17
- RC-03 | emp-ana | 2025-07 | 39.17
- RC-04 | emp-ana | 2026-02 | 40.17

### 7. Propuestas de prueba
| ID | Parámetro | Valor | Vigente desde | Escenario | Resultado esperado |
- prop-ok | SBU | 482.00 | 2026-01-01 | correcta | 4/4 verde
- prop-bad-digits | SBU | 428.00 | 2026-01-01 | dígitos invertidos | RC-02 y RC-04 rojos (35.67)
- prop-bad-vigencia | SBU | 482.00 | 2025-12-01 | vigencia anticipada | RC-01 rojo (40.17)

### 8. Avisos
2 avisos generados al aprobar: uno por empresa afectada (emp-01 y emp-02),
porque ambas tienen período abierto alcanzado por la vigencia.

### 9. Eventos esperados tras una aprobación
Orden: norma_ingresada, propuesta_creada, regresion_ejecutada,
propuesta_aprobada, version_publicada. Si el recorrido es con
prop-bad-digits: propuesta_rechazada con motivo "regresión en rojo".

### 10. Cálculos (BR-06, redondeo medio-arriba)
- 470 / 12 = 39.1666... → 39.17
- 482 / 12 = 40.1666... → 40.17
- 428 / 12 = 35.6666... → 35.67
Nota: algunas calculadoras truncan y publican 39.16; este sistema usa
redondeo medio-arriba.

### 11. Referencias
- docs/spec-rebanada-a.md §3, BR-01, BR-06.
- docs/tasks/T04-datos-iniciales.md.

Reglas para la parte 1:
- No cambies SBU, sueldos ni estados. Solo enriquece campos cosméticos.
- Verifica que cada valor coincide con el spec.
- Si encuentras contradicción, señálala en lugar de inventar.
- No toques otros archivos.

## PARTE 2 — Implementar T03

Cuando docs/seed-data.md esté creado y verificado, implementa T03
exactamente como está escrito en docs/tasks/T03-modelo-de-datos.md.

Contexto:
- Windows + PowerShell. Rama main limpia.
- Trabajamos directamente en main, sin crear rama (git checkout -b roto
  por permisos, no es bloqueante).
- T01 y T02 cerradas. Prisma 6.19.3 + Supabase + .env ya configurados
  (no leas ni toques .env).
- T04 (seed) es la siguiente; no la implementes ahora.
- Los modelos deben soportar exactamente el dataset de docs/seed-data.md.
- Multi-esquema para tests: los tests usan el schema `test`. La migración
  debe aplicar al schema correcto (CREATE SCHEMA IF NOT EXISTS test si
  hace falta).

Modelos esperados (mínimo, según docs/seed-data.md):
Empresa, Empleado, Periodo, VersionMotor, Propuesta, CasoRegresion,
CorridaRegresion, LineaNomina, Aviso, Evento.

Al terminar la parte 2, en este orden:
1. Pega salida de: npx prisma validate
2. Pega salida de: npx prisma migrate dev (o el comando que T03 pida)
3. Pega salida de: npm test (deben seguir pasando los 7)
4. Pega salida de: git status
5. Dime qué archivos creaste/modificaste.
6. Si algo del plan no coincidió, dime qué cambió y anótalo en Notes
   de T03.

No hagas commit. Yo reviso primero.