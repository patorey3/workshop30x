---
id: T03
title: Modelo de datos
milestone: "M1: Ola 1 - Flujo manual desplegado"
priority: 1
estimate: 1
estimateHours: 1
blockedBy: [T02]
blocks: [T04, T06]
areas:
  - persistencia
parent: null
---

## Summary

Define en Prisma las entidades de la ola 1 y crea su migración inicial, con restricciones que protegen los valores y las versiones guardados.

## Scope

### In scope

- `Norma`: identificador, fecha y texto.
- `Propuesta`: norma, parámetro, valor, vigencia, cita, origen (`manual` o `llm`), estado (`PENDIENTE`, `APROBADA` o `RECHAZADA`), actor, fecha de decisión y motivo de rechazo.
- `VersionMotor`: parámetro, valor, vigencia, fuente, cita obligatoria, estado, aprobador y fecha de aprobación opcionales, y propuesta de origen opcional.
- `CasoRegresion`: código único, empleado, período y valor esperado.
- `CorridaRegresion`: propuesta, totales, verdes, rojos, resultados en JSON y fecha.
- `Empresa`, `Empleado` (sueldo y `optoMensualizacion`) y `Periodo` (empresa, año, mes y estado `ABIERTO` o `CERRADO`).
- `LineaNomina`: empleado, período, valor y versión, los dos últimos obligatorios.
- `Aviso`: empresa, versión, mensaje y fecha.
- Importes en `Decimal(10,2)` y vigencias en `@db.Date`.
- Script para aplicar las migraciones al esquema de pruebas.

### Out of scope

- `Evento` (T16).
- Datos iniciales (T04).
- Lógica de negocio y rutas.

## Deliverables

- Modelos y enums en `prisma/schema.prisma`.
- `prisma/migrations/<fecha>_modelo_inicial/migration.sql`.
- Script `db:test:migrate` en `package.json`.
- `src/lib/modelo.test.ts`.

## Acceptance Criteria

- [ ] `npx prisma validate` y `npx prisma migrate status` terminan sin errores ni migraciones pendientes.
- [ ] `npm run db:test:migrate` crea las tablas en el esquema `test`, sin tocar el esquema `public`.
- [ ] Crear una `LineaNomina` sin valor o sin versión falla.
- [ ] Una segunda `LineaNomina` para el mismo empleado y período falla.
- [ ] Una segunda `VersionMotor` con el mismo parámetro y vigencia falla.
- [ ] Un segundo `Aviso` para la misma empresa y versión falla.
- [ ] Una `VersionMotor` sin aprobador se guarda, porque la versión 2025 lo necesita.
- [ ] Crear una `VersionMotor` sin cita falla.
- [ ] Un valor de `482.00` se lee como `482.00`, y una vigencia `2026-01-01` se lee igual con `TZ=America/Guayaquil`.

## Test Plan

- `npm test -- modelo`
- `npx prisma validate` y `npx prisma migrate status`.
- Prueba manual: revisar las tablas en el panel de Supabase.

## Context

- `docs/spec-rebanada-a.md`, sección 6, «Datos»; BR-05 (valor y versión guardados); BR-07 (decisión única); y «Modal de versión».
- `docs/spec-review-v2.md`: sin supuesto pendiente identificado.

## Definition of Ready

- [x] Hidden assumptions from prior discussion are written down.
- [x] Required files, docs, and dependencies are explicitly referenced.
- [x] A coding agent could begin execution without additional planning context.

## Notes

- `Evento` figura en la lista de datos de la spec, pero se crea en T16, según el plan.
- El pedido original del plan menciona «aprobaciones», y la spec no incluye esa entidad. La decisión se guarda en `Propuesta`, y el aprobador se copia en `VersionMotor`.
- `Norma.identificador` no es único: el demo puede reingresar la misma norma.

### Notas de implementación (2026-11-06)

- Los datos que el modelo debe soportar están consolidados en `docs/seed-data.md`.
- Se añadieron campos cosméticos opcionales, que no intervienen en los cálculos: `Empresa.ruc`, `ciudad` y `representante`; `Empleado.cedula`, `cargo` y `fechaIngreso`. También `LineaNomina.concepto`, con valor por defecto «Décimo cuarto mensualizado».
- `VersionMotor.estado` es un enum `INICIAL | APROBADA`. `INICIAL` se muestra como «Estado inicial del sistema» (T04, T13). `parametro` es texto: BR-03 se valida en la aplicación.
- `OrigenPropuesta` usa `manual | llm` en minúsculas, como el contrato de la propuesta (spec §6).
- `CasoRegresion` referencia `empleadoId` y `periodoId`, y `Periodo` pertenece a la empresa (`@@unique([empresaId, anio, mes])`).
- `VersionMotor.propuestaId` es único: una propuesta publica como mucho una versión.
- `npx prisma migrate dev --name modelo_inicial` funcionó contra Supabase, base de datos sombra incluida, sin pasos extra. La migración quedó aplicada en `public`.
- `db:test:migrate` ejecuta `prisma migrate deploy` con `DATABASE_URL` y `DIRECT_URL` sustituidas por `TEST_DATABASE_URL`, tras exigir `schema=test`. Prisma crea el esquema si no existe, así que no hace falta un `CREATE SCHEMA` explícito. Hay que correrlo antes de `npm test` cada vez que se añade una migración.
- Las pruebas de NOT NULL insertan con SQL crudo para comprobar la restricción en la base de datos, no solo la validación del cliente. Comprueban el código 23502 de Postgres, porque el mensaje no nombra la columna.
- `src/test/limpiar.ts` vacía las tablas con `TRUNCATE ... CASCADE` y se niega a correr si `DATABASE_URL` no tiene `schema=test`. T04 y las tareas siguientes pueden reutilizarlo. Cuando T16 cree `Evento`, hay que añadir esa tabla a la lista.
