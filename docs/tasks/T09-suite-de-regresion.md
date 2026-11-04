---
id: T09
title: Suite de regresión
milestone: "M1: Ola 1 - Flujo manual desplegado"
priority: 1
estimate: 2
estimateHours: 1.5
blockedBy: [T04, T05, T06, T07]
blocks: [T11, T12]
areas:
  - motor
  - api
parent: null
---

## Summary

Implementa `POST /api/propuestas/:id/regresion`, que simula la propuesta sobre todos los casos y guarda una corrida con sus valores antes y después.

## Scope

### In scope

- Función pura `ejecutarRegresion(casos, versiones, candidata)`, basada en T05 y T06.
- Por cada caso: esperado, antes (con las versiones publicadas), después (con la candidata), y verde o rojo.
- Un caso está en verde solo si el valor después coincide con el esperado.
- Simulación sin escritura sobre `VersionMotor` ni `LineaNomina`.
- La candidata prevalece si su vigencia coincide con la de una versión publicada.
- `CorridaRegresion` con totales, resultados y fecha.
- Respuesta 404 si la propuesta no existe y 409 si ya está decidida.
- Los casos se leen de la base de datos, sin un número fijo en el código.

### Out of scope

- Editar casos (spec, sección 5).
- Decidir si se puede aprobar (T11).
- Pantalla de resultados (T12) y eventos (T16).

## Deliverables

- `src/lib/regresion.ts`.
- `src/app/api/propuestas/[id]/regresion/route.ts`.
- `src/lib/regresion.test.ts`, con los casos fijos, y `src/app/api/propuestas/regresion.test.ts`, contra el esquema `test`.

## Acceptance Criteria

- [ ] $482 desde 2026-01-01: RC-01 a RC-04 en verde.
- [ ] $428 desde 2026-01-01: RC-02 y RC-04 en rojo con $35.67, y RC-01 y RC-03 en verde.
- [ ] $482 desde 2025-12-01: RC-01 en rojo con $40.17, y RC-02, RC-03 y RC-04 en verde.
- [ ] Para RC-02 con $482, el resultado indica antes $39.17, después $40.17 y esperado $40.17.
- [ ] La ruta guarda una corrida con total, verdes, rojos y resultados por caso.
- [ ] Tras ejecutar la ruta, `VersionMotor` y `LineaNomina` quedan idénticas.
- [ ] La ruta responde 404 con una propuesta inexistente y 409 con una ya decidida.
- [ ] Agregar un caso en la base de datos lo incluye en la corrida, sin cambiar el código.

## Test Plan

- `npm test -- regresion`
- Prueba manual: con `npm run db:seed` y `curl -i -X POST`, ejecutar las tres propuestas de la tabla de la spec.

## Context

- `docs/spec-rebanada-a.md`, sección 3, paso 3; «Casos de regresión precargados» y su tabla de propuestas; BR-02; BR-04; BR-05; y BR-06.
- `docs/spec-review-v2.md`, S8 (aprobado) y S14.

## Definition of Ready

- [x] Hidden assumptions from prior discussion are written down.
- [x] Required files, docs, and dependencies are explicitly referenced.
- [x] A coding agent could begin execution without additional planning context.

## Notes

- S8 aprobado: 4 casos (RC-01 a RC-04). No se agregan RC-05 a RC-08.
- **La simulación debe recalcular también los períodos cerrados.** Si leyera el valor guardado, RC-01 siempre saldría en verde y no detectaría la vigencia anticipada de 2025-12-01. Esto no contradice BR-05, porque no se escribe nada.
- El redondeo depende de T05 y de S14. Los valores de los casos no cambian con esa convención, porque ninguno cae en un empate.
- T16 modificará esta ruta para emitir eventos.
