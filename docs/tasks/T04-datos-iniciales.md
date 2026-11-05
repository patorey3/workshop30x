---
id: T04
title: Datos iniciales
milestone: "M1: Ola 1 - Flujo manual desplegado"
priority: 1
estimate: 1
estimateHours: 1
blockedBy: [T03]
blocks: [T07, T09, T10]
areas:
  - datos
parent: null
---

## Summary

Crea `npm run db:seed`, que restablece el estado inicial del demo con la escena de la spec y los casos de regresión.

## Scope

### In scope

- Dos empresas ficticias, con Juan en una y Ana en la otra, ambos con sueldo de $600 y `optoMensualizacion` activa.
- Juan: diciembre de 2025 `CERRADO` y enero de 2026 `ABIERTO`.
- Ana: julio de 2025 `CERRADO` y febrero de 2026 `ABIERTO`.
- Versión 2025 publicada: $470 desde 2025-01-01, fuente «MDT-2024-300, vigente 2025-01-01», la cita del comunicado oficial (spec, sección 3, «Cita de la versión 2025»), sin aprobador y con estado «Estado inicial del sistema».
- Una `LineaNomina` de $39.17 con versión 2025 en cada uno de los cuatro períodos.
- Casos RC-01 a RC-04, con los valores de la spec.
- Datos de referencia de la versión 2026, sin publicar: $482 desde 2026-01-01, Acuerdo MDT-2025-195 y su cita, listos para ingresarse en el flujo.
- Limpieza previa de todas las tablas, en una transacción, para que el seed se pueda repetir.

### Out of scope

- Publicar la versión 2026 (T11, tras la aprobación).
- Crear normas o propuestas en la base de datos.
- Evento inicial de la versión 2025 (T16).
- Editar casos desde la interfaz (spec, sección 5).

## Deliverables

- `prisma/seed.ts` y `prisma/seed-data.ts`, con `NORMA_DEMO_2026` y `PROPUESTA_DEMO_2026`.
- Script `db:seed` en `package.json`.
- `src/lib/seed.test.ts`.

## Acceptance Criteria

- [ ] Tras el seed hay 2 empresas, 2 empleados, 4 períodos y 4 líneas de nómina.
- [ ] Solo existe una `VersionMotor`: $470 desde 2025-01-01, con fuente MDT-2024-300, la cita literal del comunicado oficial y sin aprobador.
- [ ] Los períodos cerrados son diciembre de 2025 (Juan) y julio de 2025 (Ana), y los abiertos, enero de 2026 (Juan) y febrero de 2026 (Ana).
- [ ] Las 4 líneas valen $39.17 y apuntan a la versión 2025.
- [ ] Existen exactamente 4 casos: RC-01 Juan dic-2025 $39.17, RC-02 Juan ene-2026 $40.17, RC-03 Ana jul-2025 $39.17 y RC-04 Ana feb-2026 $40.17.
- [ ] `PROPUESTA_DEMO_2026` contiene `SBU`, 482.00, 2026-01-01 y una cita que aparece literalmente en `NORMA_DEMO_2026.texto`.
- [ ] No existen normas, propuestas, corridas ni avisos tras el seed.
- [ ] Ejecutar el seed dos veces, o tras un recorrido, deja exactamente el mismo estado.
- [ ] Todos los nombres de empresas y personas son ficticios.

## Test Plan

- `npm test -- seed`, contra el esquema `test`.
- `npm run db:seed` dos veces y revisión de las tablas en el panel de Supabase.

## Context

- `docs/spec-rebanada-a.md`, sección 3, «Estado inicial del sistema», «Modal de versión» y «Casos de regresión precargados»; BR-01; BR-05; y sección 6, «Datos».
- `docs/spec-review-v2.md`, S2 y S8 (aprobados).

## Definition of Ready

- [x] Hidden assumptions from prior discussion are written down.
- [x] Required files, docs, and dependencies are explicitly referenced.
- [x] A coding agent could begin execution without additional planning context.

## Notes

- S8 aprobado: 4 casos (RC-01 a RC-04). No se agregan RC-05 a RC-08.
- **La versión 2026 no se publica en el seed.** Publicarla contradiría BR-01 y el paso 6 del flujo, dejaría sin efecto la aprobación y haría que Juan empezara en $40.17. También contradiría T16, que espera solo el evento de la versión 2025 tras el seed.
- **El texto de la norma es de ejemplo.** El texto oficial de MDT-2025-195 no está verificado, así que `NORMA_DEMO_2026.texto` debe rotularse como ejemplo. T15 indica reemplazarlo antes de grabar el demo.
- La fuente del SBU 2025 es MDT-2024-300, vigente 2025-01-01 (S2).
