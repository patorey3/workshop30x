---
id: T17
title: Calcular las cinco métricas en la API del panel
milestone: "M2: Ola 3 - Eventos y panel"
priority: 2
estimate: 2
estimateHours: 1.5
blockedBy: [T16]
blocks: [T18]
areas:
  - panel
parent: null
---

## Summary

Implementa `GET /api/panel`, que deriva las cinco métricas solo de los eventos.

## Scope

### In scope

- Función pura `calcularPanel(eventos)`.
- Métrica 1: tiempo de «norma ingresada» a «propuesta aprobada», en el último caso.
- Métrica 2: propuestas totales, aprobadas y rechazadas.
- Métrica 3: casos totales, verdes y rojos, con valores antes y después del último cambio.
- Métrica 4: versiones vigentes por fecha.
- Métrica 5: períodos cerrados que la última reforma no alteró.

### Out of scope

- Pantalla (T18).
- Métricas distintas de estas cinco.

## Deliverables

- `src/lib/panel.ts`, `src/lib/panel.test.ts` y `src/app/api/panel/route.ts`.

## Acceptance Criteria

- [ ] Tras un recorrido aprobado de $482: métrica 2 con 1 total, 1 aprobada y 0 rechazadas.
- [ ] Métrica 3 con 4 casos, 4 verdes y 0 rojos, y sus valores antes y después.
- [ ] Métrica 4 con las versiones 2025-01-01 y 2026-01-01.
- [ ] Métrica 5 con 2 períodos.
- [ ] La métrica 1 coincide con la diferencia entre las fechas de ambos eventos.
- [ ] Tras el seed, sin recorridos, las métricas 1, 3 y 5 indican «sin datos», no un cero inventado.
- [ ] El módulo no consulta ninguna tabla distinta de `Evento`.

## Test Plan

- `npm test -- panel`, con listas de eventos fijas para cada escenario.
- Prueba de integración: recorrido por API y `GET /api/panel`.

## Context

- `docs/spec-rebanada-a.md`, «Panel (16 de noviembre)».
- `docs/spec-review-v2.md`, S8 y S13.

## Definition of Ready

- [x] Hidden assumptions from prior discussion are written down.
- [x] Required files, docs, and dependencies are explicitly referenced.
- [x] A coding agent could begin execution without additional planning context.

## Notes

S8 aprobado: 4 casos.
