---
id: T07
title: API de norma y propuesta
milestone: "M1: Ola 1 - Flujo manual desplegado"
priority: 1
estimate: 1
estimateHours: 1
blockedBy: [T04]
blocks: [T08, T09]
areas:
  - api
parent: null
---

## Summary

Implementa `POST /api/normas` y `POST /api/normas/:id/propuesta`, para ingresar una norma y registrar una propuesta manual validada.

## Scope

### In scope

- `POST /api/normas`, con identificador, fecha y texto.
- `POST /api/normas/:id/propuesta`, con el contrato de la spec.
- Validación de BR-03: solo se admite el parámetro `SBU`.
- Validación de la cita: no vacía y presente literalmente en el texto de la norma.
- Validación de `valor` (positivo, hasta 2 decimales) y `vigenteDesde` (fecha real `AAAA-MM-DD`).
- `origen` fijado en `manual` por el servidor, sin importar lo que envíe el cliente.
- Propuesta creada en estado `PENDIENTE`.
- Varias propuestas por norma, para probar $428 y $482 con el mismo acuerdo.

### Out of scope

- Generación con LLM (ola 2).
- Formulario (T08).
- Regresión (T09), decisiones (T11) y eventos (T16).

## Deliverables

- `src/app/api/normas/route.ts` y `src/app/api/normas/[id]/propuesta/route.ts`.
- `src/lib/propuestas.ts`, con `validarPropuesta(entrada, textoNorma)`.
- `src/lib/propuestas.test.ts` y `src/app/api/normas/normas.test.ts`.

## Acceptance Criteria

- [ ] `POST /api/normas` con datos válidos responde 201 con el `id`.
- [ ] `POST /api/normas` sin identificador, fecha o texto responde 400.
- [ ] La propuesta de $482 desde 2026-01-01, con una cita literal, responde 201 con estado `PENDIENTE` y origen `manual`.
- [ ] Un `parametro` distinto de `SBU` responde 422 y no crea ninguna fila (BR-03).
- [ ] Una cita ausente del texto, o una cadena vacía, responde 422 (BR-08).
- [ ] Una propuesta con `origen: "llm"` en el cuerpo se guarda con origen `manual`.
- [ ] Una norma inexistente responde 404.
- [ ] Un JSON mal formado responde 400, no 500.
- [ ] Crear una propuesta no altera `VersionMotor` ni `LineaNomina` (BR-01).

## Test Plan

- `npm test -- propuestas`
- `npm test -- normas`, contra el esquema `test`.
- Prueba manual: `curl -i -X POST` a ambas rutas con `npm run dev`, usando `PROPUESTA_DEMO_2026`.

## Context

- `docs/spec-rebanada-a.md`, sección 3, pasos 1 y 2; BR-01; BR-03; BR-08; criterio «El demo no depende del LLM»; y sección 6, «Contrato de la propuesta» y «Rutas».
- `docs/spec-review-v2.md`: sin supuesto pendiente identificado.

## Definition of Ready

- [x] Hidden assumptions from prior discussion are written down.
- [x] Required files, docs, and dependencies are explicitly referenced.
- [x] A coding agent could begin execution without additional planning context.

## Notes

- BR-08 habla de la salida del LLM, pero el criterio 3 dice que la propuesta manual «recorre las mismas reglas». Por eso la cita también se valida aquí.
- La comparación de la cita es literal, sin normalizar mayúsculas ni espacios.
- La spec no define los códigos 400, 404 y 422. Son una decisión de esta tarea. El 409 de la spec corresponde a T11.
- T16 modificará estas rutas para emitir eventos.
