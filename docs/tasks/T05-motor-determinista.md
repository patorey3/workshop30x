---
id: T05
title: Motor determinista
milestone: "M1: Ola 1 - Flujo manual desplegado"
priority: 1
estimate: 1
estimateHours: 0.75
blockedBy: [T01]
blocks: [T09, T10]
areas:
  - motor
parent: null
---

## Summary

Implementa BR-06 como una función pura: décimo cuarto mensualizado = SBU ÷ 12, redondeado a 2 decimales, con la mitad hacia arriba.

## Scope

### In scope

- Función `calcularMensualizado({ sbu, optoMensualizacion })`.
- Cálculo en centavos enteros, para evitar errores de punto flotante.
- Redondeo mitad hacia arriba, no redondeo bancario.
- Resultado `null` si el empleado no optó por la mensualización.
- Error si el SBU no es un número positivo con hasta 2 decimales.

### Out of scope

- Elegir la versión vigente (T06).
- Acceso a la base de datos o a la fecha del sistema.
- Períodos parciales, décimo cuarto acumulado, diferencias por región y piso salarial (spec, sección 5).

## Deliverables

- `src/lib/motor.ts`, con `calcularMensualizado`.
- `src/lib/motor.test.ts`.

## Acceptance Criteria

- [ ] SBU 470 da 39.17.
- [ ] SBU 482 da 40.17.
- [ ] SBU 428 da 35.67.
- [ ] SBU 481.50 da 40.13: el empate exacto (40.125) sube, y el redondeo bancario daría 40.12.
- [ ] Con `optoMensualizacion: false`, el resultado es `null`.
- [ ] SBU 0, negativo, `NaN` o con más de 2 decimales lanza un error.
- [ ] La misma entrada siempre da la misma salida, y `motor.ts` no importa Prisma ni usa `Date`, `Math.random` o variables de entorno.

## Test Plan

- `npm test -- motor`

## Context

- `docs/spec-rebanada-a.md`, BR-06 y «Casos de regresión precargados».
- `docs/spec-review.md`, S1 (aprobado) y «Por verificar», sobre la fórmula.
- `docs/spec-review-v2.md`, S14.

## Definition of Ready

- [x] Hidden assumptions from prior discussion are written down.
- [x] Required files, docs, and dependencies are explicitly referenced.
- [x] A coding agent could begin execution without additional planning context.

## Notes

- S14 aprobado: la convención de BR-06 es la mitad hacia arriba, no el redondeo bancario. La fuente normativa de la fórmula sigue por verificar (`docs/spec-review-v2.md`, «Por verificar»).
- Ningún valor del demo cae en un empate (39.1666…, 40.1666… y 35.6666…), así que la convención no cambia RC-01 a RC-04. Solo la prueba de 481.50 la distingue.
- La función recibe un número porque T05 no depende de Prisma. Quien la llame debe convertir el `Decimal` de la base de datos.
