---
id: T02
title: Persistencia en Supabase
milestone: "M1: Ola 1 - Flujo manual desplegado"
priority: 1
estimate: 1
estimateHours: 1
blockedBy: [T01]
blocks: [T03]
areas:
  - persistencia
parent: null
---

## Summary

Deja Prisma apuntando a Postgres en Supabase con `DATABASE_URL` y `DIRECT_URL`, y separa la base de pruebas de los datos del demo.

## Scope

### In scope

- `datasource` de Prisma con `url = env("DATABASE_URL")` y `directUrl = env("DIRECT_URL")`.
- `DATABASE_URL` por pooling, para la aplicación, y `DIRECT_URL` para las migraciones.
- Cliente de Prisma único, reutilizado entre recargas de `next dev`.
- `TEST_DATABASE_URL`, con `?schema=test`, para que las pruebas no borren los datos del demo.
- Vitest carga `.env`, usa `TEST_DATABASE_URL` y ejecuta los archivos de prueba en serie.
- Comprobación de conexión con `npm run db:check`.

### Out of scope

- Modelos y migraciones (T03).
- Conexión desde Vercel (T15).
- SQLite o cualquier otra persistencia (spec, sección 6).

## Deliverables

- `prisma/schema.prisma` actualizado y `.env.example` con las tres variables, sin valores reales.
- `src/lib/db.ts`, con el cliente único.
- `vitest.config.ts` actualizado y `src/test/setup.ts`.
- `scripts/db-check.ts` y el script `db:check` en `package.json`.
- `src/lib/db.test.ts`.

## Acceptance Criteria

- [ ] `npx prisma validate` termina con código 0.
- [ ] `npm run db:check` ejecuta `SELECT 1` por `DATABASE_URL` y otro por `DIRECT_URL`, y termina con código 0.
- [ ] Con una `DATABASE_URL` inválida, `npm run db:check` termina con un código distinto de 0 y no imprime la contraseña.
- [ ] `npm test -- db` confirma una consulta real contra `TEST_DATABASE_URL`.
- [ ] Las pruebas se niegan a iniciar si `TEST_DATABASE_URL` falta o no contiene `schema=test`.
- [ ] `.env.example` está versionado y `git status` no muestra `.env`.

## Test Plan

- `npm test -- db`
- `npx prisma validate` y `npm run db:check`.
- Prueba manual: repetir `npm run db:check` con una `DATABASE_URL` inválida y revisar la salida.

## Context

- `docs/spec-rebanada-a.md`, sección 6, «Base de datos».
- `docs/spec-review.md`, S3 (aprobado) y «Por verificar», sobre Prisma con Supabase desde Vercel.
- `docs/spec-review-v2.md`: sin supuesto pendiente identificado.

## Definition of Ready

- [x] Hidden assumptions from prior discussion are written down.
- [x] Required files, docs, and dependencies are explicitly referenced.
- [ ] **Acción tuya:** crear el proyecto en Supabase y entregar sus cadenas de conexión.

## Notes

- **Requiere que el desarrollador cree el proyecto en Supabase antes de empezar.** Sin las cadenas de conexión, esta tarea no puede completarse.
- Copia las cadenas desde el panel de Supabase. El modo de transacción del pooler suele requerir `?pgbouncer=true&connection_limit=1` en `DATABASE_URL`.
- Si la conexión directa falla por no tener IPv6, usa el pooler en modo sesión como `DIRECT_URL`.
- La prueba definitiva del pooling desde Vercel queda en T15. Si aquí aparecen problemas, conviene adelantarla.

### Notas de implementación (2026-11-06)

- Prisma 6.19.3 acepta `url` y `directUrl` en `schema.prisma` sin cambios respecto al plan. La CLI anuncia Prisma 8 (rc); no se actualiza (ver CLAUDE.md, versiones fijadas).
- Las variables viven en `.env`, no en `.env.local`: la CLI de Prisma solo lee `.env` de forma automática. `.gitignore` ya cubría `.env*` con la excepción `!.env.example`.
- `TEST_DATABASE_URL` se basa en `DIRECT_URL` (sin pgbouncer) más `schema=test`, para que `db:test:migrate` (T03) pueda migrar ese esquema.
- `db:check` corre con `tsx` (añadido como dependencia de desarrollo, 4.19.2 exacta) y `--env-file=.env` de Node 20.6+. Crea un `PrismaClient` por URL con `datasourceUrl` y redacta las credenciales de cualquier error (`src/lib/redactar.ts`).
- Vitest carga `.env` con `loadEnv` de Vite. `src/test/setup.ts` exige `TEST_DATABASE_URL` con `schema=test` y la copia a `DATABASE_URL`, para que el cliente de `src/lib/db.ts` apunte al esquema de pruebas. Sin `.env`, ninguna prueba arranca, ni siquiera la de humo.
- Antes de T03 el esquema `test` todavía no existe en Postgres; `SELECT 1` funciona igual.
- Vitest muestra el aviso «The CJS build of Vite's Node API is deprecated», porque el proyecto no es `"type": "module"`. Es inofensivo; se quitaría renombrando el archivo a `vitest.config.mts`.
