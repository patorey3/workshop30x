---
id: T15
title: Desplegar la ola 1 en Vercel y verificar el recorrido
milestone: "M1: Ola 1 - Flujo manual desplegado"
priority: 1
estimate: 1
estimateHours: 1
blockedBy: [T13, T14]
blocks: [T18]
areas:
  - despliegue
parent: null
---

## Summary

Publica el flujo manual para la entrega del 9 de noviembre y comprueba en producción la conexión, la protección y el recorrido.

## Scope

### In scope

- Proyecto en Vercel, sin plan Pro, con `DATABASE_URL`, `DIRECT_URL` y `DEMO_PASSWORD`.
- `prisma generate` en la instalación.
- `prisma migrate deploy` y `npm run db:seed` sobre la base del demo.
- Recorrido completo y bloqueo en la URL desplegada.
- Procedimiento para restablecer el demo en `README.md`.

### Out of scope

- LLM y panel.
- Dominio propio.

## Deliverables

- URL desplegada y protegida.
- `README.md` con los pasos de despliegue y restablecimiento.

## Acceptance Criteria

- [ ] Sin credenciales, la URL responde 401, también con `x-middleware-subrequest`.
- [ ] Prisma se conecta por pooling desde Vercel.
- [ ] En producción, la propuesta de $482 termina con Juan en $40.17 en enero, $39.17 en diciembre y 2 avisos.
- [ ] En producción, la propuesta de $428 no se puede aprobar, y la ruta responde 409.
- [ ] Tras el seed, el demo vuelve a su estado inicial.
- [ ] Queda registrado si Supabase pausa el proyecto por inactividad y qué hacer antes del 18.

## Test Plan

- `curl -i <url>` con y sin credenciales.
- Recorrido manual de los criterios 1 y 2 de la spec, sin la parte del panel.
- `npm run db:seed` contra producción y comprobación del estado inicial.

## Context

- `docs/spec-rebanada-a.md`, sección 4 y «Entrega del 9 de noviembre».
- `docs/spec-review-v2.md`, «Por verificar».

## Definition of Ready

- [x] Hidden assumptions from prior discussion are written down.
- [x] Required files, docs, and dependencies are explicitly referenced.
- [ ] **Acción tuya:** tener una cuenta de Vercel y definir `DEMO_PASSWORD`.

## Notes

- Esta tarea existe porque la entrega del 9 es un despliegue (`docs/spec-rebanada-a.md`, «Hitos» y «Entrega del 9 de noviembre»).
- Conviene adelantar una prueba de conexión si T02 presenta problemas de pooling.
- Antes de grabar el demo, reemplaza el texto de ejemplo por el texto real de MDT-2025-195 de una fuente verificable.
