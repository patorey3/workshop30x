---
id: T13
title: Crear la escena de Juan y el modal de versión
milestone: "M1: Ola 1 - Flujo manual desplegado"
priority: 1
estimate: 1
estimateHours: 1
blockedBy: [T10, T12]
blocks: [T15]
areas:
  - interfaz
parent: null
---

## Summary

Muestra el efecto de la reforma en Juan, con el período cerrado intacto, y permite abrir la versión que produjo cada valor.

## Scope

### In scope

- Escena en `/propuestas/:id`: diciembre de 2025 (cerrado) y enero de 2026 (abierto), con valores antes y después.
- Modal de versión, con parámetro, valor, vigencia, fuente y estado.
- Versión 2025: «Fuente por verificar», sin cita.
- Versión 2026: Acuerdo MDT-2025-195, cita, `experto_demo` y fecha de aprobación.

### Out of scope

- Pantallas para dueño o contador.
- Comparar versiones entre sí.

## Deliverables

- Componentes `EscenaJuan` y `ModalVersion`, y sus pruebas de lógica.

## Acceptance Criteria

- [ ] Antes de aprobar: diciembre sigue en $39.17 y enero muestra $39.17 → $40.17 como vista previa.
- [ ] Después de aprobar: diciembre sigue en $39.17 con versión 2025, y enero queda en $40.17 con versión 2026.
- [ ] El modal de 2025 dice «Fuente por verificar» y no nombra ningún acuerdo.
- [ ] El modal de 2026 muestra MDT-2025-195 y su cita textual.
- [ ] El modal se abre y se cierra con teclado.
- [ ] Con una propuesta en rojo, la vista previa no se presenta como un resultado aprobado.

## Test Plan

- `npm test -- escena`, para el contenido de cada versión.
- Prueba manual: recorrido completo con `npm run db:seed`, antes y después de aprobar, solo con teclado y a 375 px.

## Context

- `docs/spec-rebanada-a.md`, sección 3, paso 4, «Estado inicial» y «Modal de versión».
- `promt03.md`, S2.

## Definition of Ready

- [x] Hidden assumptions from prior discussion are written down.
- [x] Required files, docs, and dependencies are explicitly referenced.
- [x] A coding agent could begin execution without additional planning context.

## Notes

La spec v1 no definía el modal. Su contenido se agregó en la v2 y conviene que lo revises antes de esta tarea.
