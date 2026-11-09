---
id: T08
title: Formulario de propuesta manual
milestone: "M1: Ola 1 - Flujo manual desplegado"
priority: 1
estimate: 1
estimateHours: 1
blockedBy: [T07]
blocks: [T12]
areas:
  - interfaz
parent: null
---

## Summary

Crea la pantalla «Nueva norma», donde el experto registra la norma y completa la propuesta manual, sin perder el texto si hay errores.

## Scope

### In scope

- Página `/normas/nueva`, titulada «Nueva norma», con identificador, fecha y texto.
- Campos de la propuesta: valor, vigencia y cita. El parámetro se muestra fijo como `SBU`.
- Envío a las rutas de T07, sin duplicar la norma si se reintenta la propuesta.
- Errores del servidor junto al campo correspondiente, con todo lo escrito intacto.
- Navegación a `/propuestas/:id` tras crear la propuesta.

### Out of scope

- LLM y paso automático al formulario (ola 2).
- Pantalla de revisión y decisión (T12).
- Editar una propuesta ya creada.

## Deliverables

- `src/app/normas/nueva/page.tsx` y el componente `FormularioPropuesta`.
- `src/lib/formularioPropuesta.ts`, con la validación del lado del cliente y la conversión a contrato.
- `src/lib/formularioPropuesta.test.ts`.

## Acceptance Criteria

- [ ] Con los datos de `PROPUESTA_DEMO_2026`, se crean una norma y una propuesta con origen `manual`, y el navegador pasa a `/propuestas/:id`.
- [ ] La conversión produce exactamente el contrato de la spec, con `parametro: "SBU"` y `valor` numérico.
- [ ] Una cita que no está en el texto muestra el error y conserva el texto y los demás campos.
- [ ] Reintentar tras ese error crea una sola norma.
- [ ] Un campo obligatorio vacío impide el envío y se indica con texto.
- [ ] El parámetro no se puede cambiar desde el formulario.
- [ ] Todos los campos tienen etiqueta, y el formulario se puede completar solo con teclado.
- [ ] La pantalla se puede usar a 375 px de ancho.

## Test Plan

- `npm test -- formularioPropuesta`
- Prueba manual con `npm run db:seed` y `npm run dev`: envío correcto, cita inválida seguida de reintento, solo con teclado y a 375 px.

## Context

- `docs/spec-rebanada-a.md`, sección 3, pasos 1 y 2; criterio «El demo no depende del LLM»; «Contrato de la propuesta»; y «Entrega del 9 de noviembre».
- `docs/spec-review-v2.md`: sin supuesto pendiente identificado.

## Definition of Ready

- [x] Hidden assumptions from prior discussion are written down.
- [x] Required files, docs, and dependencies are explicitly referenced.
- [x] A coding agent could begin execution without additional planning context.

## Notes

- `/propuestas/:id` se crea en T12, que depende de esta tarea. Hasta entonces, esa navegación termina en 404. Comprueba aquí la URL de destino y la fila creada.
- En la ola 1, el formulario es el único camino. La ola 2 lo reutilizará como alternativa si falla el LLM, así que conviene que acepte valores iniciales.
- No existe `design.md`, por lo que se usan componentes simples, sin sistema visual.
- Implementación: el formulario navega a `/propuestas/<id de la propuesta>` (el `id` de la respuesta 201), no al id de la norma; el prompt decía `normaId`, pero la spec habla de `/propuestas/:id` y T12 buscará la propuesta.
- El servidor solo devuelve `{ error }` sin campo; `campoDeError` (en `formularioPropuesta.ts`) mapea el mensaje al campo por palabras clave. Un error sin campo identificable se muestra como mensaje general.
- El componente acepta `valoresIniciales` (ola 2). Si se edita la norma tras crearla, solo se reintenta la propuesta, tal como pide el alcance.
- Pendiente de la prueba manual (no ejecutada por mí, requiere `npm run db:seed` y `npm run dev`): envío correcto, cita alterada + reintento con una sola norma en BD, solo teclado y 375 px.
