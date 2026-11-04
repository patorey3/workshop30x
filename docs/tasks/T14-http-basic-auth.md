---
id: T14
title: Proteger la aplicación con HTTP Basic Auth
milestone: "M1: Ola 1 - Flujo manual desplegado"
priority: 1
estimate: 1
estimateHours: 0.75
blockedBy: [T01]
blocks: [T15]
areas:
  - seguridad
parent: null
---

## Summary

Protege páginas y API con HTTP Basic Auth en el middleware de Next.js, con la contraseña en `DEMO_PASSWORD`.

## Scope

### In scope

- `src/middleware.ts`, con respuesta 401 y `WWW-Authenticate`.
- Protección de páginas y `/api`, excluidos solo los recursos estáticos de `_next`.
- Validación solo de la contraseña, con cualquier usuario (S12).
- Rechazo total si falta `DEMO_PASSWORD` (S12).

### Out of scope

- Cuentas de usuario y roles (spec, sección 5).
- Vercel Password Protection.

## Deliverables

- `src/middleware.ts` y `src/middleware.test.ts`.

## Acceptance Criteria

- [ ] Sin credenciales, una página y una ruta de `/api` responden 401 con `WWW-Authenticate: Basic`.
- [ ] Con una contraseña incorrecta, responden 401.
- [ ] Con la contraseña correcta y cualquier usuario, la solicitud continúa.
- [ ] Sin `DEMO_PASSWORD` definida, se rechaza todo, incluida una contraseña vacía.
- [ ] Un encabezado `Authorization` mal formado responde 401, no 500.
- [ ] Con `x-middleware-subrequest` y sin credenciales, responde 401 en `next start`.

## Test Plan

- `npm test -- middleware`
- Con `npm run build` y `npm start`: `curl -i` sin credenciales, con credenciales y con el encabezado `x-middleware-subrequest`.

## Context

- `docs/spec-rebanada-a.md`, sección 6.
- `docs/spec-review-v2.md`, S12 y «Por verificar».
- [Aviso de CVE-2025-29927](https://nextjs.org/blog/cve-2025-29927).

## Definition of Ready

- [x] Hidden assumptions from prior discussion are written down.
- [x] Required files, docs, and dependencies are explicitly referenced.
- [x] A coding agent could begin execution without additional planning context.

## Notes

La contraseña nunca se registra en logs ni se incluye en el código. S12 aprobado.
