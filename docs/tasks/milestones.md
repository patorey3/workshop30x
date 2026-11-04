# Hitos del plan

**Fuente:** [spec v2](../spec-rebanada-a.md) y [evaluación v2](../spec-review-v2.md). La ola 2 (LLM) no entra en este plan.

**Estimaciones:** una persona con un agente de código, incluida la revisión y las pruebas. Son criterio propio, no mediciones. Total: 20 horas.

## M1: Ola 1 - Flujo manual desplegado

Objetivo: entregar el 9 de noviembre el flujo completo con formulario manual, sin LLM ni panel. Total: 15.5 horas.

| Tarea | Título | Horas | Depende de |
| --- | --- | --- | --- |
| T01 | Crear el proyecto | 0.75 | — |
| T02 | Persistencia en Supabase | 1 | T01 |
| T03 | Modelo de datos | 1 | T02 |
| T04 | Datos iniciales | 1 | T03 |
| T05 | Motor determinista | 0.75 | T01 |
| T06 | Parámetros versionados | 0.75 | T03 |
| T07 | API de norma y propuesta | 1 | T04 |
| T08 | Formulario de propuesta manual | 1 | T07 |
| T09 | Suite de regresión | 1.5 | T04, T05, T06, T07 |
| T10 | Bloqueo de período cerrado | 1 | T04, T05, T06 |
| T11 | API para aprobar y rechazar | 1.5 | T09, T10 |
| T12 | Bandeja de aprobación | 1.5 | T08, T09, T11 |
| T13 | Escena de Juan y modal de versión | 1 | T10, T12 |
| T14 | HTTP Basic Auth | 0.75 | T01 |
| T15 | Despliegue en Vercel | 1 | T13, T14 |

## M2: Ola 3 - Eventos y panel

Objetivo: entregar el 16 de noviembre el panel con las cinco métricas y las dos etiquetas de transparencia. Total: 4.5 horas.

| Tarea | Título | Horas | Depende de |
| --- | --- | --- | --- |
| T16 | Eventos del flujo | 1.5 | T11 |
| T17 | API del panel | 1.5 | T16 |
| T18 | Dashboard y etiquetas | 1.5 | T15, T17 |

## Requieren acción tuya

- **Antes de T02:** crear el proyecto de Supabase y entregar sus cadenas de conexión.
- **Antes de T04 y T09:** decidir S8 (los 8 casos).
- **Antes de T15:** tener una cuenta de Vercel y definir `DEMO_PASSWORD`.
