---
id: T10
title: Bloqueo de período cerrado
milestone: "M1: Ola 1 - Flujo manual desplegado"
priority: 1
estimate: 1
estimateHours: 1
blockedBy: [T04, T05, T06]
blocks: [T11, T13]
areas:
  - motor
  - persistencia
parent: null
---

## Summary

Implementa BR-05: una versión nueva solo actualiza las líneas de períodos abiertos que le correspondan, y los períodos cerrados conservan su valor y su versión.

## Scope

### In scope

- `aplicarVersionAPeriodosAbiertos(tx, versiones)`, que recalcula solo las líneas de períodos `ABIERTO`, usando la versión vigente en su primer día.
- `actualizarLineaNomina(tx, lineaId, datos)`, que lanza `PeriodoCerradoError` si el período está cerrado.
- Un resumen con las líneas actualizadas y los períodos cerrados sin tocar.
- Ambas funciones reciben un cliente de transacción, para que T11 las use dentro de la suya.

### Out of scope

- Rutas de aprobación y publicación (T11).
- Abrir o cerrar períodos desde la interfaz.
- Restricciones en la base de datos, como triggers.
- La simulación de regresión (T09), que no escribe líneas.

## Deliverables

- `src/lib/periodos.ts`, con `aplicarVersionAPeriodosAbiertos`, `actualizarLineaNomina` y `PeriodoCerradoError`.
- `src/lib/periodos.test.ts`, contra el esquema `test`.

## Acceptance Criteria

- [ ] Con la versión 2026 de $482, Juan en enero de 2026 y Ana en febrero de 2026 quedan en $40.17 con versión 2026.
- [ ] Con esa misma versión, Juan en diciembre de 2025 y Ana en julio de 2025 siguen en $39.17 con versión 2025, y su fecha de actualización no cambia.
- [ ] El resumen indica 2 líneas actualizadas y 2 períodos cerrados sin tocar.
- [ ] Un período abierto anterior a la vigencia de la versión nueva conserva su versión anterior (BR-04).
- [ ] `actualizarLineaNomina` sobre un período cerrado lanza `PeriodoCerradoError` y no escribe nada.
- [ ] Aplicar la misma versión dos veces deja el mismo resultado.
- [ ] Si la transacción externa se revierte, ninguna línea cambia.
- [ ] Fuera de `prisma/seed.ts` y `src/lib/periodos.ts`, una búsqueda de `lineaNomina.update` en `src/` no da resultados.

## Test Plan

- `npm test -- periodos`
- Búsqueda de `lineaNomina.update` en `src/` y `prisma/`.

## Context

- `docs/spec-rebanada-a.md`, BR-04, BR-05 y BR-06; sección 3, paso 4; y criterio «Recorrido completo».
- `docs/spec-review-v2.md`: sin supuesto pendiente identificado.

## Definition of Ready

- [x] Hidden assumptions from prior discussion are written down.
- [x] Required files, docs, and dependencies are explicitly referenced.
- [x] A coding agent could begin execution without additional planning context.

## Notes

- La protección está en la aplicación, no en la base de datos, y esto es suficiente para un demo con datos ficticios. El último criterio evita que otra parte del código la esquive.
- Las pruebas crean directamente la versión 2026, porque su publicación real se implementa en T11.
- El resumen alimenta el evento de aprobación de T16, que espera 2 períodos cerrados sin tocar.
