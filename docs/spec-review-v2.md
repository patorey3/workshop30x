# Evaluación de la spec v2: rebanada A

**Spec evaluada:** [spec-rebanada-a.md](spec-rebanada-a.md), v2
**Evaluación anterior:** [spec-review.md](spec-review.md)
**Método:** criterios de la skill `evaluate-spec`, 2026-11-04, solo para las olas 1 y 3
**Limitación:** la spec, esta evaluación y las tareas tienen el mismo autor. Conviene una revisión en pareja antes de implementar.

Los supuestos S1 a S15 quedaron aprobados o descartados el 2026-11-04; ver [sección 6](#6-supuestos).

## 1. Notas por ola

| Ola | Alcance | Nota | Justificación |
| --- | --- | --- | --- |
| 1 | Flujo completo con formulario manual (9 de noviembre) | **A** | Todos los críticos cumplen y los supuestos están cerrados |
| 2 | Propuesta generada con LLM | **C** | Proveedor de LLM sin elegir; está fuera de este plan de forma intencional |
| 3 | Panel y etiquetas (16 de noviembre) | **A** | Todos los críticos cumplen: las métricas son concretas y derivan de eventos, y los supuestos están cerrados |

La nota A significa que la spec está lista para implementar. No significa que la regla esté validada legalmente: ver [sección 5](#5-los-vacíos-más-graves).

## 2. Recomendación

Implementa primero la **ola 1**, que es la entrega del 9 de noviembre y no depende del LLM. Después sigue la **ola 3**, que se apoya en el flujo ya desplegado. La **ola 2** se planifica cuando se elija el proveedor de LLM.

## 3. Evaluación por lente

### Producto

| Criterio | Estado | Evidencia | Corrección mínima |
| --- | --- | --- | --- |
| P1 (*) Problema y usuario | Cumple | Spec, secciones 1 y 2 | — |
| P2 (*) Alcance | Cumple | Spec, sección 3 y «Entrega del 9 de noviembre» | — |
| P3 (*) Fuera de alcance | Cumple | Spec, sección 5 | — |
| P4 (*) Reglas de negocio | Cumple | Spec, BR-01 a BR-08; S1, S2 y S14 aprobados | — |
| P5 Criterio de éxito | Cumple | Spec, sección 4 | — |
| P6 Decisiones pendientes | Cumple | Spec, pregunta abierta sobre el LLM, solo para la ola 2; supuestos cerrados en la sección 6 | — |

### TDD

| Criterio | Estado | Evidencia | Corrección mínima |
| --- | --- | --- | --- |
| T1 (*) Aceptación observable | Cumple | Spec, sección 4: valores, respuesta 409 y estados | — |
| T2 (*) Casos de prueba | Cumple | Spec, RC-01 a RC-04 y tabla de propuestas; S8 fija 4 casos | — |
| T3 Runner y comando | Parcial | Spec, sección 6; el repositorio aún no tiene `package.json` | Crear el comando en T01 |
| T4 Declaración TDD | N/A | Spec, sección 6: no se declaró | — |

### Diseño

| Criterio | Estado | Evidencia | Corrección mínima |
| --- | --- | --- | --- |
| D1 (*) Arquitectura | Olas 1 y 3: Cumple. Ola 2: Falta | Spec, sección 6 | Ola 2: elegir proveedor |
| D2 Contratos | Cumple | Spec, «Contrato de la propuesta» y «Rutas» | — |
| D3 `design.md` | Falta | No existe en el repositorio | Crear uno mínimo antes de T08, o aceptar componentes sin sistema visual |
| D4 Restricciones | Cumple | Spec, secciones 5 y 6: datos ficticios y HTTP Basic Auth; S12 aprobado | — |

T3 y D3 no son críticos, así que no afectan a la nota.

## 4. Coherencia entre artefactos

| Hallazgo | Detalle | Tratamiento |
| --- | --- | --- |
| **Eventos en dos olas** | La spec exige que los eventos ocurran en la transacción de aprobación, pero el plan crea `Evento` en T16, en la ola 3, después de desplegar la ola 1. Los recorridos anteriores no tienen eventos | T16 modifica las rutas de T07, T09 y T11. Tras desplegarla, hay que correr el seed |
| **Número de casos** | El pedido original del plan hablaba de 8 casos, pero la spec define 4 | Resuelto por S8: se mantienen 4 |
| **Versión 2026 en los datos iniciales** | Publicarla en el seed contradiría BR-01, el paso 6 del flujo y T16 | T04 la deja como datos de referencia sin publicar, y T11 la publica al aprobar |
| **Cita en la propuesta manual** | BR-08 habla del LLM, pero el criterio 3 de la spec pide las mismas reglas para la propuesta manual | T07 valida la cita también en la manual |
| **Fase de la certificación** | El PRD la ubica en la fase 1, y el texto acordado decía fase 2 | Resuelto por S6 |
| **Acuerdo MDT-2025-195** | Es el que fija $482 para 2026, y no hay un acuerdo identificado para los $470 de 2025 | Resuelto por S2: la versión 2025 dice «Fuente por verificar» |
| **Modal de versión** | La spec v1 no lo definía | Agregado en la spec v2. T13 pide revisarlo antes de esa tarea |
| **Artefactos ausentes** | No existen `AGENTS.md`, `README.md`, `design.md` ni código | Vacíos registrados. T01 inicia el código y T15 crea el `README.md` |

**Por verificar:**

- **Prisma con Supabase desde Vercel:** falta comprobar la conexión con pooling en un despliegue real. Se hace en T15, y conviene adelantarlo si T02 presenta problemas.
- **Texto oficial de MDT-2025-195:** el valor y la vigencia se confirmaron en comentarios legales y prensa, no en el Registro Oficial. Hay que reemplazar el texto de ejemplo antes de grabar el demo.
- **Fórmula del décimo cuarto mensualizado:** SBU ÷ 12 aparece en prensa, sin fuente normativa confirmada. S14 fija la convención de redondeo para el demo, pero no aporta esa fuente.
- **Fuente del SBU 2025:** sigue sin identificarse el acuerdo de los $470 (S2).
- **Middleware de Next.js:** la protección debe resistir el encabezado `x-middleware-subrequest` (CVE-2025-29927). T14 lo prueba, y T01 exige Next.js 14.2.25 o superior.
- **Pausa de Supabase por inactividad:** T15 debe registrar si ocurre y qué hacer antes del 18 de noviembre.

## 5. Los vacíos más graves

1. **Validación legal limitada.** Falta la fuente del SBU 2025 y la confirmación normativa de la fórmula y del redondeo, y ningún experto revisó los casos. No bloquea la implementación, pero sí la credibilidad ante un contador en la audiencia.
2. **Conexión a Supabase desde Vercel sin probar.** Un problema de pooling afectaría directamente a la entrega del 9 de noviembre.

## 6. Supuestos

| # | Supuesto | Estado | Detalle o motivo |
| --- | --- | --- | --- |
| S1 | Mensualizado = SBU ÷ 12, con redondeo a 2 decimales, mitad hacia arriba; Juan y Ana ganan $600 y optaron por la mensualización | Aprobado | Tal cual |
| S2 | El SBU 2025 ($470) se respalda provisionalmente en el PVB y la prensa hasta identificar su acuerdo | Aprobado | Con cambio de narrativa: «parámetro SBU 2025 vigente desde el 1 de enero de 2025, fuente por verificar». No se afirma que un acuerdo de 2025 fije los $470 |
| S3 | Postgres en Supabase en desarrollo y producción, sin SQLite | Aprobado | Tal cual |
| S4 | HTTP Basic Auth en el middleware de Next.js, con la contraseña en `DEMO_PASSWORD` y sin Vercel Pro | Aprobado | Sustituye a la propuesta original, que prefería Password Protection con Vercel Pro |
| S5 | Vitest con `npm test` | Aprobado | Tal cual |
| S6 | Etiqueta: «certificación por firma de auditoría pendiente, no incluida en esta rebanada» | Aprobado | Tal cual |
| S7 | El LLM se abandona tras 8 segundos y se abre el formulario | Aprobado | Tal cual |
| S8 | Se mantienen 4 casos de regresión (RC-01 a RC-04). No se agregan RC-05 a RC-08 | Aprobado | Son los únicos que la spec define, y cubren los 3 escenarios de propuesta |
| S9 | — | Descartado | Lo que T17 necesita ya está en su criterio de aceptación: «sin datos», no un cero inventado |
| S10 | — | Descartado | Ningún archivo lo cita |
| S11 | — | Descartado | Ningún archivo lo cita |
| S12 | HTTP Basic Auth valida solo la contraseña, con cualquier usuario, y rechaza todo si falta `DEMO_PASSWORD` | Aprobado | Tal cual |
| S13 | Los eventos del flujo son `norma_ingresada`, `propuesta_creada`, `regresion_ejecutada`, `propuesta_aprobada`, `version_publicada` y `propuesta_rechazada`, más el evento inicial de la versión 2025 con origen `seed` | Aprobado | Tal cual |
| S14 | La convención de redondeo de BR-06 es la mitad hacia arriba, no el redondeo bancario | Aprobado | No cambia RC-01 a RC-04 |
| S15 | — | Descartado | Lo que hace falta ya está en T18 (las dos etiquetas con texto exacto en `/panel`, `/bandeja` y `/propuestas/:id`) y en T12 (el estado en verde o rojo también se indica con texto) |

## Fuentes externas

Heredadas de [spec-review.md](spec-review.md) y de T14. No se volvieron a consultar en esta evaluación.

- [Nmslaw: SBU 2026 de USD 482](https://nmslaw.com.ec/blog/2025/12/22/ecuador-salario-basico-unificado-2026/)
- [UTPL: boletín 31-2025](https://procuraduria.utpl.edu.ec/Boletines/BOLETÍN_31-2025.pdf), cuyo campo de vigencia indica una fecha distinta, probablemente por error de transcripción, aunque el mismo documento dice que rige desde el 1 de enero de 2026
- [Extra: cálculo del décimo cuarto de 2025](https://www.extra.ec/noticia/ecuador/decimo-cuarto-sueldo-2025-ecuador-bono-escolar-calcula-ejemplos-121647.html)
- [Next.js: aviso de CVE-2025-29927](https://nextjs.org/blog/cve-2025-29927)
