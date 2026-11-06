---
id: T06
title: Parámetros versionados
milestone: "M1: Ola 1 - Flujo manual desplegado"
priority: 1
estimate: 1
estimateHours: 0.75
blockedBy: [T03]
blocks: [T09, T10]
areas:
  - motor
parent: null
---

## Summary

Implementa BR-04: resuelve qué versión del SBU corresponde a un período según su primer día, no según la fecha del cálculo.

## Scope

### In scope

- Función pura `versionVigenteEn(versiones, primerDia)`, que elige la versión con la vigencia más reciente que no supere esa fecha.
- Función `primerDiaDePeriodo(anio, mes)`, en UTC.
- Función `obtenerVersionesPublicadas(db)`, que lee las versiones del parámetro `SBU`.
- La función pura admite una lista con una versión candidata, sin escribir nada, para que T09 pueda simular.
- Error explícito si ninguna versión cubre la fecha.

### Out of scope

- Publicar versiones (T11).
- Modificar líneas de nómina (T10).
- Parámetros distintos de `SBU` (BR-03).
- Reversión de versiones (spec, sección 5).

## Deliverables

- `src/lib/parametros.ts`.
- `src/lib/parametros.test.ts`.

## Acceptance Criteria

- [ ] Con las versiones 2025 y 2026, diciembre de 2025 resuelve a 2025 y enero de 2026 resuelve a 2026.
- [ ] Una versión desde 2026-01-01 aplica a un período que empieza ese mismo día.
- [ ] Una vigencia desde 2026-01-15 no aplica a enero de 2026, porque el primer día es anterior.
- [ ] El resultado no cambia al simular otra fecha del sistema.
- [ ] Una fecha anterior a todas las versiones lanza un error explícito.
- [ ] Una lista desordenada da el mismo resultado.
- [ ] Las pruebas aprueban con `TZ=UTC` y con `TZ=America/Guayaquil`.
- [ ] `obtenerVersionesPublicadas` devuelve únicamente versiones del parámetro `SBU`.

## Test Plan

- `npm test -- parametros`
- En Git Bash: `TZ=America/Guayaquil npm test -- parametros`.

## Context

- `docs/spec-rebanada-a.md`, BR-03, BR-04 y «Estado inicial del sistema».
- `docs/spec-review-v2.md`: sin supuesto pendiente identificado.

## Definition of Ready

- [x] Hidden assumptions from prior discussion are written down.
- [x] Required files, docs, and dependencies are explicitly referenced.
- [x] A coding agent could begin execution without additional planning context.

## Notes

- T06 no depende de T04: la función pura se prueba con listas fijas, y `obtenerVersionesPublicadas`, con filas creadas por la propia prueba.
- Compara las fechas como UTC o como `AAAA-MM-DD`. En Ecuador (UTC-5), una conversión local convierte 2026-01-01 en 2025-12-31 y elegiría la versión equivocada.
- Implementación: la firma es `versionVigenteEn(versiones, primerDia)`, como pide el alcance, no `(anio, mes)`; quien llama combina `primerDiaDePeriodo(anio, mes)` con ella. La función es genérica sobre `{ vigenteDesde: Date }` y compara `AAAA-MM-DD` en UTC. `obtenerVersionesPublicadas` devuelve todas las filas `VersionMotor` con `parametro = 'SBU'` (toda fila existente está publicada: `INICIAL` o `APROBADA`), ordenadas por vigencia.
- Desvío respecto del prompt de ejecución: pedía que, con solo la versión 2025, enero de 2026 lanzara error. Según BR-04 la versión vigente desde 2025-01-01 sigue cubriendo enero de 2026 (no hay fecha de fin), así que la prueba verifica que resuelve a 2025. El error solo se lanza cuando la fecha es anterior a todas las versiones o la lista está vacía.
