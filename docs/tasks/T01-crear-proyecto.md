---
id: T01
title: Crear el proyecto
milestone: "M1: Ola 1 - Flujo manual desplegado"
priority: 1
estimate: 1
estimateHours: 0.75
blockedBy: []
blocks: [T02, T05, T14]
areas:
  - infraestructura
parent: null
---

## Summary

Crea la base del repositorio con Next.js 15.5.x (App Router), TypeScript, Prisma y Vitest, con una prueba que corre con `npm test`.

## Scope

### In scope

- Next.js 15.5.x con App Router, TypeScript en modo estricto y carpeta `src/`.
- Next.js en la última versión 15.5.x, nunca inferior a 15.5.28, la primera sin los avisos críticos de ejecución remota de código. Esa rama ya incluye el parche de CVE-2025-29927, del que depende T14.
- Prisma instalado con un `prisma/schema.prisma` inicial, sin modelos ni conexión real.
- Vitest, con `npm test` como `vitest run`, para que `npm test -- <filtro>` funcione.
- Una prueba mínima que no necesita base de datos.
- Página inicial mínima y `.gitignore` que excluye `.env*` salvo `.env.example`.

### Out of scope

- Conexión a Supabase (T02).
- Modelos de datos (T03).
- Sistema visual o componentes de interfaz.
- Protección con contraseña (T14).

## Deliverables

- `package.json` con los scripts `dev`, `build`, `start` y `test`.
- `tsconfig.json`, `next.config.mjs`, `vitest.config.ts` y `.gitignore`.
- `prisma/schema.prisma`.
- `src/app/layout.tsx` y `src/app/page.tsx`.
- `src/lib/smoke.test.ts`.

## Acceptance Criteria

- [ ] `npm test` termina con código 0 y ejecuta al menos una prueba.
- [ ] `npm test -- smoke` ejecuta solo esa prueba.
- [ ] `npm run build` termina con código 0.
- [ ] `npx prisma generate` termina con código 0 sin una base de datos disponible.
- [ ] `npm ls next` muestra una versión 15.5.x igual o superior a 15.5.28.
- [ ] `npx tsc --noEmit` termina con código 0.
- [ ] `git status` no muestra `node_modules`, `.next` ni archivos `.env`.

## Test Plan

- `npm test` y `npm test -- smoke`.
- `npm run build`, `npx tsc --noEmit`, `npx prisma generate` y `npm ls next`.
- Prueba manual: `npm run dev` y abrir `http://localhost:3000`.

## Context

- `docs/spec-rebanada-a.md`, sección 6, «Aplicación» y «Pruebas».
- `docs/spec-review.md`, S5 (aprobado).
- `docs/spec-review-v2.md`: sin supuesto pendiente identificado.

## Definition of Ready

- [x] Hidden assumptions from prior discussion are written down.
- [x] Required files, docs, and dependencies are explicitly referenced.
- [x] A coding agent could begin execution without additional planning context.

## Notes

- El repositorio ya contiene `docs/` y archivos sueltos, y `create-next-app` puede negarse a usar una carpeta con contenido. Si ocurre, genera el proyecto en una carpeta temporal y copia los archivos, sin tocar `docs/`.
- Fija Prisma en una versión mayor que todavía admita `url` y `directUrl` en `schema.prisma` (T02 los usa). Comprueba esto al instalar: las versiones mayores recientes movieron esa configuración.
