---
id: T18
title: Crear el dashboard con las cinco métricas y las etiquetas
milestone: "M2: Ola 3 - Eventos y panel"
priority: 2
estimate: 2
estimateHours: 1.5
blockedBy: [T15, T17]
blocks: []
areas:
  - panel
parent: null
---

## Summary

Crea la pantalla `/panel` con las cinco métricas y las dos etiquetas de transparencia, y la despliega para el 16 de noviembre.

## Scope

### In scope

- Página `/panel`, con los datos de `GET /api/panel`.
- Etiqueta «Datos de demostración, no de uso».
- Etiqueta «Casos de regresión validados contra fuente pública; certificación por firma de auditoría pendiente, no incluida en esta rebanada».
- Ambas etiquetas visibles en el panel y en las pantallas del demo.
- Despliegue y comprobación en producción.

### Out of scope

- Filtros, exportación o datos históricos.
- Video del demo.

## Deliverables

- `src/app/panel/page.tsx`, sus componentes y un componente compartido de etiquetas.
- Versión desplegada en Vercel.

## Acceptance Criteria

- [ ] Tras el recorrido de $482, el panel muestra las cinco métricas con los valores de T17.
- [ ] Ambas etiquetas aparecen con el texto exacto en `/panel`, `/bandeja` y `/propuestas/:id`.
- [ ] Sin recorridos, las métricas sin datos lo indican con texto.
- [ ] El panel se puede usar a 375 px de ancho.
- [ ] En producción se cumple completo el criterio «Recorrido completo» de la spec.
- [ ] `/panel` y `/api/panel` responden 401 sin credenciales.

## Test Plan

- `npm test -- etiquetas`, para comprobar el texto exacto.
- Recorrido manual en la URL desplegada, partiendo de `npm run db:seed`.
- `curl -i <url>/panel` y `curl -i <url>/api/panel` sin credenciales.

## Context

- `docs/spec-rebanada-a.md`, criterio 1, «Panel» y «Etiquetas visibles».
- `docs/spec-review-v2.md`, S6.

## Definition of Ready

- [x] Hidden assumptions from prior discussion are written down.
- [x] Required files, docs, and dependencies are explicitly referenced.
- [x] A coding agent could begin execution without additional planning context.

## Notes

Muestra los datos como cifras y tablas simples: con tan pocos eventos, un gráfico no agregaría información.
