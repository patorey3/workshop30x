---
id: T11
title: API para aprobar y rechazar
milestone: "M1: Ola 1 - Flujo manual desplegado"
priority: 1
estimate: 2
estimateHours: 1.5
blockedBy: [T09, T10]
blocks: [T12, T16]
areas:
  - api
parent: null
---

## Summary

Implementa `POST /api/propuestas/:id/aprobar` y `POST /api/propuestas/:id/rechazar`, y publica la versión, actualiza los períodos abiertos y crea los avisos en una sola transacción.

## Scope

### In scope

- Aprobación solo si la corrida más reciente es completa y está totalmente en verde (BR-02).
- Corrida completa: su total coincide con el número de casos actual en la base de datos.
- Decisión única, también ante dos solicitudes simultáneas, con una actualización condicionada a `PENDIENTE` (BR-07).
- Transacción de aprobación: decisión, `VersionMotor`, períodos abiertos (T10) y un `Aviso` por empresa afectada.
- Versión con fuente, cita, `experto_demo` y fecha de aprobación.
- Rechazo con motivo obligatorio, sin efectos sobre el motor.
- Actor fijo `experto_demo`, sin aceptarlo desde el cuerpo de la solicitud.
- Respuesta 409 si no se cumplen BR-02 o BR-07, o si ya existe una versión con esa vigencia.

### Out of scope

- Botones y pantallas (T12).
- Escena de Juan (T13).
- Eventos (T16).
- Cuentas de usuario y reversión de versiones (spec, sección 5).

## Deliverables

- `src/lib/decisiones.ts`, con `aprobarPropuesta` y `rechazarPropuesta`.
- `src/app/api/propuestas/[id]/aprobar/route.ts` y `src/app/api/propuestas/[id]/rechazar/route.ts`.
- `src/lib/decisiones.test.ts`, contra el esquema `test`.

## Acceptance Criteria

- [ ] Al aprobar $482 con 4 de 4 en verde, la respuesta es 200, y Juan queda en $40.17 en enero de 2026, con versión 2026 y la cita.
- [ ] Tras esa aprobación, diciembre de 2025 sigue en $39.17 con versión 2025, y existen 2 avisos, uno por empresa.
- [ ] La versión 2026 registra `experto_demo`, la fecha de aprobación y la propuesta de origen.
- [ ] Aprobar $428 con casos en rojo responde 409, y la versión vigente no cambia.
- [ ] Aprobar sin corrida responde 409.
- [ ] Una corrida en verde anterior a la adición de un caso se considera incompleta y responde 409.
- [ ] Una segunda decisión responde 409, en cualquier combinación de aprobar y rechazar.
- [ ] Dos aprobaciones simultáneas dan exactamente una respuesta 200, una versión y 2 avisos.
- [ ] Rechazar con motivo responde 200 y guarda el motivo. Sin motivo o con solo espacios, responde 400.
- [ ] Un rechazo no crea versiones ni avisos, ni cambia líneas de nómina.
- [ ] Si falla la creación de un aviso, se revierte toda la aprobación.
- [ ] Una propuesta inexistente responde 404.

## Test Plan

- `npm test -- decisiones`
- Prueba manual: con `npm run db:seed` y `curl -i -X POST`, recorrer la propuesta de $482, la de $428, la aprobación sin corrida y la doble decisión.

## Context

- `docs/spec-rebanada-a.md`, sección 3, pasos 5 y 6; BR-01; BR-02; BR-05; BR-07; criterios «Recorrido completo» y «Bloqueo»; y sección 6, «Rutas».
- `docs/spec-review-v2.md`, S8 (aprobado), en lo que afecta al número de casos de una corrida completa.

## Definition of Ready

- [x] Hidden assumptions from prior discussion are written down.
- [x] Required files, docs, and dependencies are explicitly referenced.
- [x] A coding agent could begin execution without additional planning context.

## Notes

- S8 aprobado: 4 casos. La definición de «corrida completa» se basa en los casos de la base de datos, no en una cifra fija.
- La spec pide que publicación, avisos y eventos ocurran en una sola transacción. Los eventos se agregan a esta misma transacción en T16.
- Ambas empresas ficticias cuentan como afectadas. La spec no define otro criterio, y el recorrido exige 2 avisos.
- Una transacción interactiva de Prisma tiene un tiempo límite por defecto de 5 segundos. Compruébalo contra Supabase, con su latencia real, y ajusta `timeout` si hace falta.

### Notas de implementación

- Ambas rutas usan `prisma.$transaction(..., { timeout: 15_000 })`. Contra Supabase, la prueba más larga (sembrar, crear la propuesta, regresión y aprobar $482) tarda unos 15 s en total y pasa; la duración de la transacción sola no se midió.
- `aprobarPropuesta` vuelve a buscar la propuesta (con su norma) dentro de la transacción, porque necesita sus datos; la ruta hace además una consulta previa fuera de la transacción para responder 404 sin abrirla.
- La decisión (`updateMany` condicionado a `PENDIENTE`) va antes de comprobar la corrida: si BR-02 falla, el `throw` revierte la decisión y la propuesta sigue `PENDIENTE`.
- `aprobadaEn` de la versión y `decididaEn` de la propuesta comparten la misma marca de tiempo.
- Las versiones para `aplicarVersionAPeriodosAbiertos` se leen con `tx.versionMotor.findMany` dentro de la transacción (incluye la nueva). No se usa `obtenerVersionesPublicadas` (T06) porque su tipo solo admite `PrismaClient`, no el cliente de la transacción.
- Mensaje del aviso: `Nuevo SBU 482.00 desde 2026-01-01 afecta el período abierto` (valor con 2 decimales). La spec no fija este texto.
- `rechazar` sobre una propuesta inexistente responde 404 (no estaba en el plan; evita devolver 409 «ya decidida» para algo que no existe).
- Prueba de rollback: espiar `prisma.aviso.create` no sirve, porque dentro de `$transaction` el cliente `tx` es otro objeto. La prueba envuelve `tx` en un `Proxy` cuyo `aviso.create` falla en la primera llamada y llama a `aprobarPropuesta` directamente.
- Pruebas añadidas fuera del plan: una corrida posterior con rojos invalida una verde anterior (se usa la más reciente), y aprobar una segunda propuesta con la misma vigencia responde 409.
