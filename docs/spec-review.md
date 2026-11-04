# Evaluación de la spec: rebanada A

**Spec evaluada:** [spec-rebanada-a.md](spec-rebanada-a.md)
**Método:** skill `evaluate-spec`, 2026-11-04
**Limitación:** la spec y esta evaluación tienen el mismo autor. Conviene una revisión en pareja antes de planificar.

## 1. Notas por ola

| Ola | Alcance | Nota | Justificación |
| --- | --- | --- | --- |
| 1 | Flujo completo con formulario manual (9 de noviembre) | **B** | Ningún crítico falta; los parciales se cierran con supuestos escritos, pendientes de tu aprobación |
| 2 | Propuesta generada con LLM | **C** | El proveedor no está elegido, y la skill cuenta ese caso como crítico faltante (D1) |
| 3 | Panel y etiquetas (16 de noviembre) | **B** | Las métricas son concretas y derivan de eventos; falta aprobar el texto de una etiqueta y no hay `design.md` |

La nota B de las olas 1 y 3 solo se confirma cuando apruebes los supuestos de la [sección 6](#6-supuestos-pendientes-de-aprobación).

## 2. Recomendación

Planifica primero la **ola 1**: es la entrega del 9 de noviembre y no depende del LLM. Después la 3, si el flujo ya genera eventos. La **ola 2** no vuelve a diseño: pasa a B en cuanto elijas el proveedor.

## 3. Evaluación por lente

### Producto

| Criterio | Estado | Evidencia | Corrección mínima |
| --- | --- | --- | --- |
| P1 (*) Problema y usuario | Cumple | Spec, secciones 1 y 2 | — |
| P2 (*) Alcance | Cumple | Spec, sección 3 y entrega del 9 de noviembre | — |
| P3 (*) Fuera de alcance | Cumple | Spec, sección 5 | — |
| P4 (*) Reglas de negocio | Parcial | Spec, BR-01 a BR-08 | Aprobar S1 y confirmar la fuente del SBU 2025 (S2) |
| P5 Criterio de éxito | Cumple | Spec, sección 4 | — |
| P6 Decisiones pendientes | Cumple | Spec, marcas «(supuesto)» y pregunta abierta sobre el LLM | — |

### TDD

| Criterio | Estado | Evidencia | Corrección mínima |
| --- | --- | --- | --- |
| T1 (*) Aceptación observable | Cumple | Spec, sección 4: valores, respuesta 409 y estados | — |
| T2 (*) Casos de prueba | Cumple | Spec, RC-01 a RC-04, propuestas con errores y criterios 2 y 3 | — |
| T3 Runner y comando | Parcial | Spec, sección 6; el repositorio no tiene `package.json` | Aprobar S5 y crear el comando al iniciar el proyecto |
| T4 Declaración TDD | N/A | La spec indica que no se declaró | — |

### Diseño

| Criterio | Estado | Evidencia | Corrección mínima |
| --- | --- | --- | --- |
| D1 (*) Arquitectura | Ola 1 y 3: Parcial. Ola 2: Falta | Spec, sección 6 | Olas 1 y 3: aprobar S3. Ola 2: elegir proveedor |
| D2 Contratos | Cumple | Spec, contrato JSON y rutas | — |
| D3 `design.md` | Falta | No existe en el repositorio | Crear uno mínimo antes de las tareas de interfaz, o aceptar componentes sin sistema visual |
| D4 Restricciones | Parcial | Spec, secciones 5 y 6: datos ficticios y contraseña | Elegir el método de contraseña (S4) |

## 4. Coherencia entre artefactos

| Hallazgo | Detalle | Tratamiento |
| --- | --- | --- |
| **Fase de la certificación** | El texto acordado en `rebanadas-candidatas.md`, línea 199, la ubica en la «fase 2 del PRD». El PRD, sección 5, la pone en la **fase 1**; la fase 2 cubre la 2ª y 3ª firma | La spec ajusta la etiqueta; confirmar (S6) |
| **Acuerdo MDT-2025-195** | `rebanadas-candidatas.md`, línea 199, habla de ese acuerdo «y su equivalente 2026». Según las fuentes consultadas, MDT-2025-195 **es** el que fija $482 para 2026; falta identificar el de $470 de 2025 | La spec usa MDT-2025-195 para 2026; ver S2 |
| **SQLite en producción** | `rebanadas-candidatas.md`, línea 202, condiciona Postgres a que «el LLM necesite persistencia». La persistencia la exige el propio flujo (versiones, aprobaciones, eventos), no el LLM, y el sistema de archivos de una función de Vercel no sirve para una base SQLite duradera | La spec usa Postgres; ver S3 |
| **Rebanada frente a RF del PRD** | RF-50, RF-55 y otros son imprescindibles para el MVP, pero esta rebanada los deja fuera o parciales | Sin conflicto: el Demo Day no equivale a completar la fase 1 |
| **Artefactos ausentes** | No existen `AGENTS.md`, `README.md`, `design.md` ni código; `promt02.md` está vacío | Vacíos registrados |

**Por verificar:**

- **Vercel Password Protection:** la [documentación](https://vercel.com/docs/deployment-protection/methods-to-protect-deployments/password-protection) indica que no está disponible en Hobby y que en Pro cuesta $20 al mes por proyecto. Falta confirmar qué plan tienes.
- **Prisma con Supabase desde Vercel:** falta comprobar la conexión con pooling en un despliegue real. Hazlo antes del 9.
- **Texto oficial de MDT-2025-195:** el valor y la vigencia se confirmaron en comentarios legales y prensa, no en el Registro Oficial.
- **Fórmula del décimo cuarto mensualizado:** SBU ÷ 12 aparece en prensa, sin fuente normativa ni regla de redondeo confirmadas.

## 5. Los tres vacíos más graves

1. **Proveedor de LLM sin elegir.** Bloquea la ola 2. Se resuelve en un minuto.
2. **Base de datos sin aprobar.** Afecta toda la implementación, y cambiarla después del 9 cuesta más.
3. **Validación legal limitada.** Falta la fuente del SBU 2025 y la confirmación de la fórmula, y ningún experto revisó los casos. No bloquea la implementación, pero sí la credibilidad ante un contador en la audiencia.

## 6. Supuestos pendientes de aprobación

| # | Supuesto | Si no se aprueba |
| --- | --- | --- |
| S1 | Mensualizado = SBU ÷ 12, con redondeo a 2 decimales, mitad hacia arriba; Juan y Ana ganan $600 y optaron por la mensualización | Hay que recalcular los casos |
| S2 | El SBU 2025 ($470) se respalda provisionalmente en el PVB y la prensa hasta identificar su acuerdo | La versión 2025 queda sin cita legal, lo que debilita el demo |
| S3 | Postgres en Supabase en desarrollo y producción, sin SQLite | Hay que definir otra persistencia para el despliegue |
| S4 | Password Protection si ya tienes Vercel Pro; si no, HTTP Basic en el middleware de Next.js con la contraseña en una variable de entorno, sin costo adicional | Hay que elegir otro método antes del 9 |
| S5 | Vitest con `npm test` | Hay que indicar otro runner |
| S6 | Etiqueta: «certificación por firma de auditoría pendiente, no incluida en esta rebanada» | Hay que dar otro texto; el original contradice el PRD |
| S7 | El LLM se abandona tras 8 segundos y se abre el formulario | Hay que indicar otro límite |

## Fuentes externas

- [Nmslaw: SBU 2026 de USD 482](https://nmslaw.com.ec/blog/2025/12/22/ecuador-salario-basico-unificado-2026/)
- [UTPL: boletín 31-2025](https://procuraduria.utpl.edu.ec/Boletines/BOLETÍN_31-2025.pdf), cuyo campo de vigencia indica una fecha distinta, probablemente por error de transcripción, aunque el mismo documento dice que rige desde el 1 de enero de 2026
- [Extra: cálculo del décimo cuarto de 2025](https://www.extra.ec/noticia/ecuador/decimo-cuarto-sueldo-2025-ecuador-bono-escolar-calcula-ejemplos-121647.html)
- [Vercel: Password Protection](https://vercel.com/docs/deployment-protection/methods-to-protect-deployments/password-protection)
