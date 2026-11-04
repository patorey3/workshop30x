---
id: T16
title: Registrar los eventos del flujo
milestone: "M2: Ola 3 - Eventos y panel"
priority: 2
estimate: 2
estimateHours: 1.5
blockedBy: [T11]
blocks: [T17]
areas:
  - eventos
parent: null
---

## Summary

Agrega la entidad `Evento` y registra cada paso del flujo, para que el panel se alimente de hechos reales.

## Scope

### In scope

- Modelo `Evento` y su migración.
- Eventos de S13, emitidos desde T07, T09 y T11.
- Datos del evento necesarios para las métricas: valores antes y después, períodos cerrados sin tocar y versión.
- `propuesta_aprobada` y `version_publicada` dentro de la transacción de aprobación.
- Evento inicial de la versión 2025, con origen `seed`.

### Out of scope

- Cálculo de métricas (T17).
- Eventos de LLM (ola 2).

## Deliverables

- Migración de `Evento`, `src/lib/eventos.ts` y sus pruebas.
- Cambios en las rutas de T07, T09 y T11, y en `prisma/seed.ts`.

## Acceptance Criteria

- [ ] Un recorrido aprobado genera, en orden, `norma_ingresada`, `propuesta_creada`, `regresion_ejecutada`, `propuesta_aprobada` y `version_publicada`.
- [ ] Un rechazo genera `propuesta_rechazada`, con su motivo, y no genera `version_publicada`.
- [ ] Un intento bloqueado con 409 no genera eventos de decisión.
- [ ] Si la transacción de aprobación falla, no queda ningún evento de esa aprobación.
- [ ] El evento de aprobación indica 2 períodos cerrados sin tocar.
- [ ] Tras el seed, solo existe el evento de la versión 2025, con origen `seed`.
- [ ] Todas las pruebas de la ola 1 siguen aprobando.

## Test Plan

- `npm test -- eventos`, con el recorrido aprobado, el rechazo, el bloqueo y el fallo de transacción.
- `npm test` completo, para descartar regresiones.

## Context

- `docs/spec-rebanada-a.md`, «Datos», «Rutas» y «Panel».
- `docs/spec-review-v2.md`, S13 y hallazgo «Eventos en dos olas».

## Definition of Ready

- [x] Hidden assumptions from prior discussion are written down.
- [x] Required files, docs, and dependencies are explicitly referenced.
- [x] A coding agent could begin execution without additional planning context.

## Notes

Después de desplegar esta tarea, corre el seed: los recorridos anteriores no tienen eventos. Registra S13, pendiente de aprobación.
