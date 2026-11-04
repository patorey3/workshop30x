# PRD — NominaFácil EC

| | |
|---|---|
| **Producto** | NominaFácil EC *(nombre de trabajo)* |
| **Alcance de este PRD** | Detalle completo de la Fase 1 (MVP: módulo Nómina, meses 0–6); visión general de las fases 2–5 |
| **Documento base** | [PVB.md](PVB.md), versión 2.0 |
| **Versión / estado** | 0.1 — Borrador para revisión |
| **Fecha** | 2026-11-04 |
| **Responsable** | Patricio Reinoso |

**Convención:** los elementos marcados con **(propuesta)** no vienen del PVB; se agregaron porque el MVP los necesita y requieren confirmación. Las inconsistencias y los vacíos del PVB están en la [sección 15](#15-preguntas-abiertas-e-inconsistencias-del-pvb).

---

## 1. Resumen

NominaFácil EC es una plataforma modular de gestión de personal para micro y pequeñas empresas de Ecuador (1–20 empleados). Empieza por Nómina y se expande a Contratos, Seguridad Social, Vacaciones y Utilidades.

Cada módulo tiene un agente legal que detecta cambios normativos y propone actualizaciones, sin ejecutarlas por sí solo. Un motor de reglas certificado por firmas de auditoría locales aplica esas actualizaciones, y cada cálculo queda registrado con su base legal.

**Visión a 3 años:** ser el estándar de cumplimiento laboral ecuatoriano para pymes, el software que las firmas de auditoría recomiendan, certifican e implementan.

**Principio rector:** el agente legal es commoditizable. El valor está en lo que ocurre después de detectar la ley: validarla con expertos, traducirla en reglas testeadas, certificarla, integrarla entre módulos y demostrar que el cliente cumplió.

---

## 2. Problema

Las microempresas ecuatorianas gestionan su personal con Excel, calculadoras y plantillas desactualizadas, y desconocen o aplican mal el Código del Trabajo y las resoluciones del IESS y el SRI. Las consecuencias son:

- **Errores de cálculo:** décimos tercero y cuarto, vacaciones, horas extras, utilidades y aportes al IESS.
- **Riesgo de sanciones:** afiliación fuera de plazo (15 días), avisos de entrada/salida no registrados e historia laboral no presentada.
- **Tiempo perdido:** el dueño o contador repite tareas manuales y busca por su cuenta los cambios normativos.
- **Incertidumbre legal:** el dueño no sabe si cumple y el contador no tiene un respaldo auditable.

**Por qué el problema perdura (Durability Score 5/5):** es un problema de workflow e integración, no de generación de texto. Un modelo de lenguaje puede explicar la ley, pero no ejecuta la nómina ni garantiza la presentación oportuna, y la responsabilidad legal sigue existiendo.

---

## 3. Objetivos y no-objetivos

### Objetivos de la Fase 1

| # | Objetivo | Medida |
|---|---|---|
| O1 | Reducir el tiempo de la nómina mensual | < 15 minutos para 10 empleados |
| O2 | Calcular con exactitud legal | Tasa de error < 0.5% (ver [P6](#15-preguntas-abiertas-e-inconsistencias-del-pvb)) |
| O3 | Hacer auditable cada cálculo | 100% de los cálculos con base legal, versión del motor y fecha de vigencia **(propuesta)** |
| O4 | Mantener el motor al día | Actualización < 48 horas tras una reforma (ver [P5](#15-preguntas-abiertas-e-inconsistencias-del-pvb)) |
| O5 | Obtener el primer sello institucional | 1 firma certificadora activa en el año 1 |

### No-objetivos de la Fase 1

- Gestión de contratos, firma y registro (Fase 2).
- Envío directo de avisos al IESS e integración con historia laboral (Fase 3).
- Gestión de vacaciones, permisos y licencias (Fase 3).
- Reparto de utilidades, finiquitos e indemnizaciones (Fase 4).
- Empresas de más de 20 empleados (Fase 5).
- Agentes autónomos: ningún envío oficial ni cambio en producción ocurre sin aprobación humana.
- Cálculos críticos generados por IA: los resuelve el motor de reglas determinista.

---

## 4. Usuarios

| Perfil | Necesidad principal | Rol en la decisión |
|---|---|---|
| **Dueño o gerente de pyme** (comercio, servicios, talleres, restaurantes, consultorías; sin área de RRHH) | Pagar correctamente sin ser experto y evitar multas | Usuario y comprador; necesita evidencia de que cumple |
| **Contador externo** (administra la nómina de varias pymes) | Herramienta centralizada y cálculos que pueda defender | Usuario y veto de confianza; responde técnicamente ante IESS y SRI |
| **Firma de auditoría / CPA** | Verificar el motor de reglas y atender mejor a su cartera | No es usuario final; es canal, veto y validador institucional |
| **Experto legal interno** | Revisar los cambios propuestos por el agente legal | Usuario interno; aprueba actualizaciones del motor |

---

## 5. Alcance por fase

| Fase | Plazo | Entregable | Hito de moat |
|---|---|---|---|
| **1 (este PRD)** | Meses 0–6 | Nómina, agente legal, suite de pruebas, primera firma certificadora | Trust Moat inicial y primer sello |
| 2 | Meses 6–12 | Contratos integrado con Nómina; 2ª y 3ª firma | Network Effect de firmas y grafo de dependencias |
| 3 | Meses 12–18 | Seguridad Social (IESS), Vacaciones, partners de implementación | Data Moat y switching costs |
| 4 | Meses 18–24 | Utilidades y Liquidaciones; exploración de JV con firma ancla | Ecosistema completo |
| 5 | Meses 24–36 | Expansión a 20–50 empleados; posicionamiento como estándar nacional | Estándar de facto |

---

## 6. Flujos principales

### 6.1 Nómina mensual

1. El usuario abre el período y el sistema precarga empleados y parámetros vigentes.
2. El usuario registra las novedades del mes (horas extras, ausencias, otros rubros).
3. El asistente de IA señala incongruencias o datos faltantes.
4. El motor de reglas calcula cada rubro por empleado y registra su base legal.
5. El usuario revisa el resultado, consulta el detalle y corrige si hace falta.
6. El usuario aprueba y cierra el período.
7. El sistema genera roles de pago y reportes, y conserva el registro de auditoría.

### 6.2 Actualización normativa (agente legal)

1. El agente detecta un cambio en el Registro Oficial o en resoluciones del IESS o el MDT.
2. Genera una propuesta de actualización del motor de reglas.
3. La propuesta pasa por la suite de pruebas de regresión legal.
4. El experto legal interno recibe la notificación y valida, ajusta o rechaza.
5. Si el cambio es material, se certifica con la firma de auditoría.
6. Se despliega con trazabilidad y se notifica a los clientes afectados.

**Regla invariable:** el agente detecta y propone; nunca modifica producción sin validación humana experta.

---

## 7. Requisitos funcionales (Fase 1)

Prioridad: **M** = imprescindible para el MVP, **S** = importante, **C** = deseable.

### 7.1 Empresas, usuarios y empleados

| ID | Requisito | Prioridad |
|---|---|---|
| RF-01 | Registrar una empresa con sus datos legales y patronales | M |
| RF-02 | Permitir que un contador administre varias empresas desde una sola cuenta y cambie entre ellas | M |
| RF-03 | Roles con permisos diferenciados: dueño, contador y solo lectura para auditor **(propuesta)** | M |
| RF-04 | Ficha de empleado con los datos necesarios para calcular: identificación, fecha de ingreso, cargo, sueldo y tipo de contrato | M |
| RF-05 | Validar que la ficha esté completa y señalar los datos que impiden calcular | M |
| RF-06 | Importar empleados desde una plantilla de Excel para reducir la fricción de migración **(propuesta)** | S |

### 7.2 Cálculo de nómina

| ID | Requisito | Prioridad |
|---|---|---|
| RF-10 | Calcular sueldos, incluidos períodos parciales por ingreso o salida a mitad de mes | M |
| RF-11 | Calcular horas extras y suplementarias a partir de las novedades registradas | M |
| RF-12 | Calcular y provisionar décimo tercer y décimo cuarto sueldo | M |
| RF-13 | Calcular aportes al IESS, personal y patronal | M |
| RF-14 | Calcular fondos de reserva y retención de impuesto a la renta **(propuesta; ver [P8](#15-preguntas-abiertas-e-inconsistencias-del-pvb))** | M |
| RF-15 | Aplicar la regla vigente en el **período de nómina**, no la vigente en la fecha en que se ejecuta el cálculo **(propuesta)** | M |
| RF-16 | Mantener parámetros legales (por ejemplo, el salario básico) versionados por fecha de vigencia, nunca fijos en el código **(propuesta)** | M |

### 7.3 Revisión, aprobación y documentos

| ID | Requisito | Prioridad |
|---|---|---|
| RF-20 | Mostrar el resumen de nómina por empleado y por rubro antes de aprobar | M |
| RF-21 | Exigir aprobación explícita del usuario para cerrar un período | M |
| RF-22 | Bloquear los períodos cerrados; toda corrección crea una versión nueva con motivo y autor **(propuesta)** | M |
| RF-23 | Generar el rol de pago de cada empleado en PDF | M |
| RF-24 | Generar los reportes de nómina y aportes que el contador necesita para sus presentaciones | M |
| RF-25 | Generar archivos para el SRI (formato por definir según P8) | S |

### 7.4 Trazabilidad

| ID | Requisito | Prioridad |
|---|---|---|
| RF-30 | Registrar por cada cálculo la base legal (artículo o resolución), la versión del motor y la fecha de vigencia | M |
| RF-31 | Mostrar al usuario, desde cualquier rubro, cómo se calculó y qué norma aplicó | M |
| RF-32 | Mantener un registro inalterable de cálculos, aprobaciones y correcciones **(propuesta)** | M |
| RF-33 | Exportar un paquete de auditoría por período y empresa **(propuesta)** | S |

### 7.5 Alertas de cumplimiento

| ID | Requisito | Prioridad |
|---|---|---|
| RF-40 | Avisar los plazos del calendario oficial: afiliación (15 días), pago de décimos y declaración de utilidades | M |
| RF-41 | Mostrar el estado de cada alerta (pendiente, atendida, vencida) para medir su atención a tiempo | M |
| RF-42 | Notificar por correo y dentro de la aplicación **(propuesta)** | S |

### 7.6 Agente legal y motor de reglas (herramienta interna)

| ID | Requisito | Prioridad |
|---|---|---|
| RF-50 | Monitorear las fuentes oficiales: Registro Oficial y resoluciones del IESS y el MDT | M |
| RF-51 | Generar una propuesta con la norma de origen, las reglas afectadas y la vigencia | M |
| RF-52 | Ejecutar automáticamente la suite de regresión legal sobre cada propuesta | M |
| RF-53 | Ofrecer al experto una bandeja para aprobar, ajustar o rechazar propuestas | M |
| RF-54 | Impedir técnicamente el despliegue de reglas sin aprobación humana registrada | M |
| RF-55 | Registrar la certificación de la firma en los cambios materiales antes de desplegarlos | M |
| RF-56 | Notificar a los clientes afectados qué cambió, desde cuándo y con qué efecto | M |
| RF-57 | Permitir revertir una versión del motor a la anterior **(propuesta)** | M |

### 7.7 Suscripción

| ID | Requisito | Prioridad |
|---|---|---|
| RF-60 | Ofrecer una prueba gratuita de 30 días con funcionalidad completa, hasta 5 empleados | M |
| RF-61 | Cobrar una suscripción mensual por tramo de empleados | M |
| RF-62 | Atribuir cada cliente a la firma que lo refirió para calcular el revenue share | S |

### 7.8 Asistente de IA

La IA explica la norma, detecta incongruencias y propone actualizaciones. No genera cálculos críticos.

| ID | Requisito | Prioridad |
|---|---|---|
| RF-70 | Detectar incongruencias en datos de empleados y novedades antes del cálculo (por ejemplo, un sueldo inferior al básico) | M |
| RF-71 | Explicar en lenguaje simple un rubro y la norma que lo sustenta, citando la fuente | S |
| RF-72 | Predecir el impacto en costos de una contratación | C |

La sugerencia del tipo de contrato se entrega con el módulo Contratos (Fase 2).

---

## 8. Historias de usuario clave

**H1. Procesar la nómina del mes.** Como dueño, quiero procesar la nómina en pocos minutos para no depender de hojas de cálculo.
- Dados 10 empleados con fichas completas, el proceso desde abrir el período hasta aprobarlo toma menos de 15 minutos.
- No se puede cerrar el período si hay empleados con datos faltantes.
- Al aprobar, se generan los roles de pago de todos los empleados.

**H2. Defender un cálculo.** Como contador, quiero ver la norma y la versión detrás de cada rubro para respaldarlo ante el IESS, el SRI o un auditor.
- Cada rubro muestra la fórmula, los valores usados, la base legal, la versión del motor y la vigencia.
- La información de un período cerrado no cambia aunque el motor se actualice después.

**H3. Administrar varias empresas.** Como contador externo, quiero gestionar todas mis pymes desde una cuenta para centralizar el trabajo.
- Veo el estado de la nómina y las alertas vencidas de cada empresa.
- Los datos de una empresa no son visibles desde otra ni para usuarios sin acceso a ella.

**H4. Cumplir los plazos.** Como dueño, quiero recibir avisos de mis obligaciones para no ser sancionado.
- Las alertas se generan según el calendario oficial vigente.
- Al registrar un ingreso, se crea una alerta con el plazo de afiliación.

**H5. Validar un cambio normativo.** Como experto legal, quiero revisar cada propuesta del agente con sus resultados de pruebas para aprobar solo lo correcto.
- Cada propuesta muestra la norma de origen, las reglas afectadas y los resultados de regresión.
- Una propuesta sin aprobación registrada no puede llegar a producción.
- Al desplegarse, los clientes afectados reciben la notificación.

**H6. Verificar el motor.** Como firma de auditoría, quiero inspeccionar reglas, pruebas e historial para certificar el motor sin ver datos de los clientes.
- Tengo acceso a las versiones de reglas, los casos de prueba y sus resultados.
- Ese acceso no incluye datos personales de empleados **(propuesta)**.

---

## 9. Requisitos no funcionales

| ID | Categoría | Requisito |
|---|---|---|
| RNF-01 | Exactitud | Los cálculos críticos los produce un motor determinista: mismas entradas y misma versión, mismo resultado. Se prioriza la exactitud sobre la velocidad |
| RNF-02 | Calidad legal | Toda regla tiene casos de regresión validados por un experto antes de desplegarse |
| RNF-03 | Auditabilidad | Los registros de cálculo y aprobación no se pueden alterar ni borrar durante el plazo de retención legal **(propuesta)** |
| RNF-04 | Usabilidad | Un dueño sin formación contable completa su primera nómina sin asistencia (interfaz ultra-simple) |
| RNF-05 | Modularidad | Cada módulo se desarrolla y valida de forma independiente, y sus reglas declaran dependencias para alimentar el grafo entre módulos |
| RNF-06 | Privacidad | Cumplir la Ley Orgánica de Protección de Datos Personales de Ecuador; sueldos y datos de empleados se cifran en tránsito y en reposo **(propuesta)** |
| RNF-07 | Aislamiento | Separación estricta de datos entre empresas y control de acceso por rol **(propuesta)** |
| RNF-08 | Continuidad | Respaldos automáticos y restauración probada; disponibilidad objetivo por definir **(propuesta)** |
| RNF-09 | Costo | Costo total por empresa de $3–$5 al mes (infraestructura, soporte y actualizaciones legales) |

---

## 10. Modelo de negocio

| Componente | Descripción |
|---|---|
| Prueba gratuita | 30 días con funcionalidad completa, hasta 5 empleados |
| Suscripción | Plana por tramo de empleados: $15–$25 por empresa al mes |
| Certificación anual | Tarifa fija pagada a la firma certificadora, sin comisión |
| Revenue share | 15–25% recurrente sobre clientes referidos por la firma |
| Módulos adicionales | Precio incremental por módulo |

**Unit economics estimados:** margen bruto de 70–80% y de 55–65% tras el revenue share. La hipótesis es que la reducción de CAC por el canal de firmas compensa el margen cedido; todavía no hay datos que lo confirmen.

---

## 11. Métricas de éxito

| Tipo | Métrica | Objetivo | Desde |
|---|---|---|---|
| Usuario | Tiempo de nómina mensual (10 empleados) | < 15 min | Fase 1 |
| Usuario | Tasa de errores en cálculos legales | < 0.5% | Fase 1 |
| Usuario | Alertas de cumplimiento atendidas a tiempo | Línea base por definir | Fase 1 |
| Usuario | NPS de contador y dueño | > 50 | Fase 1 |
| IA | Detección de incongruencias en datos | > 90% | Fase 1 |
| IA | Tiempo de actualización del motor tras una reforma | < 48 h | Fase 1 |
| IA | Falsos positivos del agente legal | < 10% | Fase 1 |
| IA | Precisión de sugerencia de contrato vs. revisión experta | > 95% | Fase 2 |
| Red | Firmas certificadoras activas | Año 1: 1; año 2: 3–5 | Fase 1 |
| Red | Nuevos clientes referidos por firmas | > 40% al año 2 | Fase 2 |
| Red | Renovación de certificación | > 90% | Fase 2 |
| Moat | Integraciones activas entre módulos | Línea base por definir | Fase 2 |
| Moat | Historial de cumplimiento acumulado | Línea base por definir | Fase 1 |
| Moat | Clientes con más de 12 meses de datos | Línea base por definir | Fase 3 |

---

## 12. Riesgos

| Riesgo | Impacto | Mitigación |
|---|---|---|
| Cambio normativo no detectado que causa un error masivo | Crítico: es la primera forma en que se rompe la confianza | Monitoreo constante, regresión automatizada, doble validación, soporte prioritario y seguro de responsabilidad civil |
| Responsabilidad compartida ante una sanción | Alto | La firma certifica el motor, no los datos; el cliente responde por sus datos; trazabilidad completa |
| Conflicto de interés del auditor | Alto | Separar roles: quien certifica no audita a clientes usuarios, o lo hace con equipos separados y divulgación (ver [P4](#15-preguntas-abiertas-e-inconsistencias-del-pvb)) |
| Dependencia de una sola firma | Alto | Modelo multifirma desde el día 1, sello "Certificado por firma acreditada" y contrato no exclusivo |
| Percepción de que el producto es de una firma | Medio | Posicionamiento como infraestructura neutral |
| Costo alto de la certificación temprana | Medio | Primera certificación como inversión conjunta, con caso de estudio público |
| Réplica por un competidor | Medio | La interfaz es replicable, pero el motor certificado, las pruebas y la red no; ejecutar rápido la unión de módulos |
| Commoditización | Bajo | Moat en validación e integración, no en el agente |

---

## 13. Dependencias

- **Firma certificadora:** acuerdo no exclusivo con la primera firma, con independencia y responsabilidad definidas por contrato. Un retraso aquí afecta directamente el hito de la Fase 1.
- **Experto legal interno:** necesario desde el inicio para validar reglas y casos de regresión.
- **Fuentes oficiales:** acceso fiable y monitoreable al Registro Oficial y a las resoluciones del IESS, el MDT y el SRI.
- **Seguro de responsabilidad civil profesional:** contratado antes de operar con clientes de pago **(propuesta)**.

---

## 14. Supuestos por validar

El PVB marca esta investigación como **pendiente**. Hasta completarla, los siguientes puntos son hipótesis:

| Supuesto | Cómo validarlo |
|---|---|
| Nómina es el dolor más agudo y con mayor disposición a pagar | Entrevistas a 5 contadores y 5 dueños de pymes |
| $15–$25 al mes es un precio aceptable | Mismas entrevistas y prueba de precio |
| Las firmas aceptarán certificar y referir clientes | Conversaciones con firmas candidatas |
| Runa y Nómina360 son demasiado complejos o caros para 1–20 empleados | Análisis competitivo detallado |
| Existen vías técnicas para integrarse con el IESS y el SRI | Investigación técnica antes de la Fase 3 |

---

## 15. Preguntas abiertas e inconsistencias del PVB

| # | Tema | Situación | Recomendación |
|---|---|---|---|
| P1 | **Cronograma contradictorio** | El roadmap ubica Seguridad Social y Vacaciones en los meses 12–18 y Utilidades en los 18–24. El riesgo 1 del PVB los ubica a los 24 y 36 meses | Este PRD usa el roadmap; confirmar cuál rige |
| P2 | **Modelos de alianza sin definir** | El PVB cita los Modelos A, B, D y E, pero no los describe | Agregar sus definiciones; el alcance de la Fase 1 depende de A+B |
| P3 | **"Freemium" mal rotulado** | El PVB dice freemium, pero describe una prueba de 30 días sin plan gratuito permanente | Este PRD asume prueba gratuita; confirmar |
| P4 | **Revenue share y certificación** | Una firma que certifica el motor y además cobra 15–25% por los clientes referidos tiene un interés económico en el producto que certifica. La mitigación del PVB no cubre este caso | Consultar con un asesor regulatorio antes de firmar; considerar separar la firma que certifica de la que refiere |
| P5 | **Objetivo de 48 horas** | El flujo incluye validación experta y certificación para cambios materiales, lo que puede no caber en 48 horas | Medir por separado: 48 h hasta la propuesta validada y otro plazo para la certificación |
| P6 | **Error de 0.5%** | No está definido si se mide por rubro, empleado o nómina. En una empresa con 20 empleados, una tasa así puede ser visible, y choca con la promesa de que ningún contador cuestione el cálculo | Definir la unidad; considerar 0 errores atribuibles al motor como condición de despliegue en la suite de regresión |
| P7 | **Cambio "material"** | Determina qué requiere certificación, pero no está definido | Acordar criterios con la primera firma |
| P8 | **Rubros ausentes** | El PVB no menciona fondos de reserva ni retención de impuesto a la renta, aunque forman parte de la nómina. Tampoco especifica qué archivos del SRI se generan | Confirmar con el experto legal; este PRD los incluye como propuesta |
| P9 | **Salidas de empleados en el MVP** | Las liquidaciones llegan en la Fase 4, pero un empleado puede renunciar desde el primer mes | Calcular el último período parcial y advertir que el finiquito queda fuera del sistema; evaluar adelantarlo |
| P10 | **Avisos al IESS** | El PVB presenta la integración directa como parte de la confianza del producto, pero el módulo llega en la Fase 3 | En el MVP, solo alertar y entregar los datos; el usuario hace el trámite |
| P11 | **Costo de certificación** | Aparece como componente de precio, pero no queda claro quién la paga ni está en los unit economics | Definir quién la paga y recalcular márgenes |
| P12 | **Precio para contadores** | El precio es por empresa; no hay condiciones para un contador con varias pymes | Decidir si habrá plan o descuento de cartera |
| P13 | **Datos normativos** | El PVB cita el salario básico de 2025 ($470), y las cifras y plazos legales no han sido validados por un experto | Tratar todos los valores legales como parámetros versionados y validarlos antes de la Fase 1 |

---

## 16. Criterios de salida de la Fase 1

- [ ] Nómina completa en producción con clientes reales, procesada en menos de 15 minutos para 10 empleados.
- [ ] Suite de regresión legal validada por el experto y sin fallos.
- [ ] Al menos una actualización normativa real completada de punta a punta con el flujo del agente legal.
- [ ] Motor de reglas certificado por la primera firma, con contrato no exclusivo.
- [ ] 100% de los cálculos con trazabilidad legal completa.
- [ ] Preguntas P1–P8 resueltas.
- [ ] Entrevistas a 5 contadores y 5 dueños de pymes completadas, y sus hallazgos incorporados a este PRD.
