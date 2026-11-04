---
id: T12
title: Crear la bandeja de aprobación
milestone: "M1: Ola 1 - Flujo manual desplegado"
priority: 1
estimate: 2
estimateHours: 1.5
blockedBy: [T08, T09, T11]
blocks: [T13]
areas:
  - interfaz
parent: null
---

## Summary

Crea las pantallas donde el experto revisa propuestas, ejecuta la regresión y decide.

## Scope

### In scope

- `/bandeja`: propuestas con estado, valor, vigencia y origen.
- `/propuestas/:id`: norma, cita, botón de regresión y resultados en verde o rojo con valores antes y después.
- «Aprobar» desactivado salvo con una corrida completa en verde.
- «Rechazar» con motivo obligatorio.
- Lectura de datos desde componentes de servidor, sin rutas nuevas.

### Out of scope

- Escena de Juan y modal (T13).
- Panel (T18).

## Deliverables

- `src/app/bandeja/page.tsx` y `src/app/propuestas/[id]/page.tsx`, con sus componentes.
- `src/lib/puedeAprobar.ts` y su prueba.

## Acceptance Criteria

- [ ] La propuesta de $482 muestra 4 casos en verde y «Aprobar» activo.
- [ ] La propuesta de $428 muestra sus casos en rojo con $35.67 y «Aprobar» desactivado.
- [ ] Sin corrida, «Aprobar» está desactivado.
- [ ] Tras decidir, la pantalla muestra la decisión y ya no ofrece botones.
- [ ] El estado en verde o rojo también se indica con texto, no solo con color.
- [ ] Las pantallas se pueden usar a 375 px de ancho.

## Test Plan

- `npm test -- puedeAprobar`
- Prueba manual con `npm run db:seed` y `npm run dev`: propuestas de $482 y $428, rechazo sin motivo y a 375 px.

## Context

- `docs/spec-rebanada-a.md`, sección 3, pasos 3 y 5, y criterio 2.
- `docs/spec-review-v2.md`, S8.

## Definition of Ready

- [x] Hidden assumptions from prior discussion are written down.
- [x] Required files, docs, and dependencies are explicitly referenced.
- [x] A coding agent could begin execution without additional planning context.

## Notes

S8 aprobado: 4 casos.
