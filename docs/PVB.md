# PRODUCT VISION BOARD (PVB) — NominaFácil EC

**Producto:** NominaFácil EC *(nombre de trabajo)*
**Versión:** 2.0
**Fecha:** 2026

---

## PRODUCTO

**Descripción en una línea:**
Plataforma modular de gestión de personal para micro y pequeñas empresas (1–20 empleados) en Ecuador, que empieza por Nómina y se expande a Contratos, Seguridad Social, Vacaciones y Utilidades, con un agente legal por módulo que detecta y propone actualizaciones normativas, y un motor de reglas certificado por firmas de auditoría locales.

**Visión a 3 años:**
Convertirse en el estándar de cumplimiento laboral ecuatoriano para pymes: el software que las firmas de auditoría recomiendan, certifican e implementan, y que ningún contador ecuatoriano cuestiona porque su trazabilidad legal es auditable.

**Estrategia de construcción:**
Módulos de bajo costo que se desarrollan y validan de forma independiente, y que se unen progresivamente en un solo programa. Cada módulo incorpora un agente que monitorea las actualizaciones legales que le afectan. El primer módulo es Nómina, por ser el dolor más agudo y el de mayor disposición a pagar.

**Módulos previstos (roadmap):**

| Orden | Módulo | Dolor que ataca | Dependencias |
|---|---|---|---|
| 1 | Nómina | Cálculos de sueldos, décimos, horas extras, aportes IESS | — |
| 2 | Contratos | Tipos de contrato, periodos de prueba, registro y firma | Nómina |
| 3 | Seguridad Social | Afiliación, avisos de entrada/salida, historia laboral IESS | Nómina, Contratos |
| 4 | Vacaciones y Permisos | Cálculo de días, acumulación, licencias | Nómina, Contratos |
| 5 | Utilidades y Liquidaciones | Reparto del 15%, finiquitos, indemnizaciones | Todos los anteriores |

---

## 1. PROBLEMA

**Problema que resuelvo:**
Las micro y pequeñas empresas ecuatorianas (1–20 empleados) gestionan su personal de forma manual (Excel, calculadoras, plantillas desactualizadas) y desconocen o aplican incorrectamente las obligaciones del Código del Trabajo y las resoluciones del IESS/SRI. Esto genera:

- Cálculos erróneos de décimo tercer sueldo, décimo cuarto sueldo, vacaciones, horas extras, utilidades (15% para trabajadores) y aportes al IESS.
- Riesgo de sanciones por no afiliar al trabajador dentro de los primeros 15 días, no registrar avisos de entrada/salida o no presentar declaraciones de historia laboral.
- Pérdida de tiempo del dueño o contador en tareas repetitivas y en la búsqueda de actualizaciones normativas (salario básico 2025: $470; reformas como la eliminación del protocolo de acoso para empresas de 1–9 trabajadores).
- Incertidumbre legal: el dueño no sabe si está cumpliendo, y el contador no tiene un respaldo auditable de sus cálculos.

**¿Este problema sobrevive a las próximas 2–3 generaciones de modelos foundation?**
**[✓] Sí, porque es un problema de WORKFLOW/INTEGRACIÓN, no de OUTPUT.**
El cumplimiento legal requiere integración con sistemas gubernamentales (IESS, SRI), reglas de negocio locales y actualización normativa continua. Los modelos de lenguaje pueden explicar la ley, pero no ejecutan la nómina ni garantizan la presentación oportuna de avisos. La complejidad operativa y la responsabilidad legal persisten.

**Durability Score (1–5):** 5 — la normativa laboral ecuatoriana cambia con frecuencia y las obligaciones son de cumplimiento obligatorio.

---

## 2. SEGMENTO TARGET

**¿Para quién es este producto?**

**Usuario final:**
- Micro y pequeñas empresas (1–20 trabajadores) de comercio, servicios, talleres, restaurantes y consultorías en Ecuador.
- Dueños o gerentes que hoy usan Excel o software contable genérico y no tienen área de RRHH dedicada.
- Contadores externos que administran la nómina de varias pymes y necesitan una herramienta centralizada y auditable.

**Canal y guardián del veto de confianza:**
- Firmas de auditoría y contadores públicos autorizados que atienden pymes. No son el usuario final, pero:
  - Son el guardián del veto de confianza (si no confían en el cálculo, no lo recomiendan).
  - Son el canal de distribución (su cartera de clientes es tu mercado).
  - Son el validador institucional (su sello convierte tu promesa en evidencia).

**¿Quién controla el veto de confianza?**
- El contador o asesor laboral: asume la responsabilidad técnica ante el IESS y el SRI. Si la herramienta no genera cálculos exactos y comprobantes válidos, no la recomendará.
- La firma de auditoría: si certifica el motor de reglas, el contador baja la guardia y el dueño gana seguridad.
- El dueño de la empresa: teme sanciones y multas; necesita evidencia de que el sistema aplica la ley vigente.

---

## 3. MOAT PRIMARIO

**Moat primario:** [✓] Trust Moat reforzado con confianza institucional y Network Effect de dos lados.

**Componentes del moat (de menor a mayor profundidad):**

| Capa | Qué es | Commoditizable | Es tu moat |
|---|---|---|---|
| 1. Agente legal | Detecta cambios en el Registro Oficial y propone actualizaciones | Sí | No |
| 2. Motor de reglas actualizable | Traduce el cambio en reglas ejecutables | Parcialmente | Parcial |
| 3. Suite de pruebas de regresión legal | Valida que el cambio no rompe cálculos existentes | Difícil | Sí |
| 4. Certificación por firma de auditoría | Un tercero independiente valida el motor | Muy difícil | Sí |
| 5. Red de firmas certificadoras (neutralidad) | Múltiples firmas certifican el producto | Imposible de replicar rápido | Sí |
| 6. Grafo de dependencias entre módulos | Un cambio legal en Contratos afecta automáticamente Nómina, Seguridad Social, etc. | Imposible sin años de integración | Sí |
| 7. Data Moat de cumplimiento | Historial auditable de cada cliente | Imposible de replicar | Sí |
| 8. Switching Costs | Datos, historial y configuración del cliente en tu sistema | Crece con el tiempo | Sí |

**¿Qué trust única poseemos o podemos construir?**
- Motor de reglas legales ecuatorianas actualizado con cada reforma, validado por expertos y certificado por firmas de auditoría locales.
- Integración directa con el IESS (aviso de entrada/salida, historia laboral) y generación de archivos para el SRI.
- Auditoría y trazabilidad: cada cálculo queda registrado con base legal aplicada (artículo del Código del Trabajo o resolución del IESS), versión del motor y fecha de vigencia.
- Alertas de cumplimiento: recordatorios de plazos (15 días para afiliación, pagos de décimos, declaración de utilidades) basados en el calendario oficial.
- Red de firmas certificadoras: el sello no es de una firma, es de un ecosistema neutral de firmas que validan el mismo motor. Eso es el Network Effect de dos lados: más firmas → más credibilidad → más clientes → más datos → más firmas.

**Principio de diseño del moat:**
> El agente legal detecta la ley; el moat es lo que hacemos después: validarla con expertos, traducirla en reglas testeadas, certificarla con firmas independientes, integrarla entre módulos y demostrar que el cliente cumplió. Eso no se commoditiza.

---

## 4. ARENA COMPETITIVA

**Arena:** [✓] Disruptor (AI-Disrupted) — Reimaginamos un workflow existente (nómina manual o semi-automatizada) haciéndolo 10x más simple, seguro y auditable para el segmento de microempresas.

**¿Cómo sobrevives o complementas a los gigantes (Runa HR, Nómina360, SAP, etc.)?**
- Los competidores actuales (Runa, Nómina360) apuntan a pymes y ofrecen funcionalidades amplias, pero suelen tener curvas de aprendizaje y precios orientados a empresas con más empleados. NominaFácil EC se enfoca en 1–20 empleados, con interfaz ultra-simple y precios accesibles.
- Los gigantes (SAP, etc.) son sobredimensionados para microempresas.
- Ventaja competitiva: especialización radical en normativa ecuatoriana, certificación por firmas locales y neutralidad entre firmas (no estás atado a ninguna).

**Posicionamiento:**
> No vendemos "un software de RRHH respaldado por una firma". Vendemos "el estándar de cumplimiento laboral ecuatoriano que las firmas de auditoría certifican". En el primer caso la firma es proveedor; en el segundo, las firmas son red y moat.

---

## 5. UX PARADIGM

**Paradigma:** [✓] Assistant — El usuario está en control; la IA sugiere y automatiza cálculos, pero las decisiones finales (aprobación de nómina, envío de avisos) las toma el usuario.

**¿Por qué este paradigma?**
- El dueño o contador necesita confiar en lo que el sistema calcula; no puede delegar completamente la responsabilidad legal a un agente autónomo.
- La IA puede predecir el impacto de una contratación, sugerir el tipo de contrato adecuado (indefinido, temporal, por obra) y validar que los datos del empleado estén completos antes de generar el aviso al IESS.
- El usuario siempre revisa y aprueba antes de cualquier envío oficial.
- Regla de diseño: el agente legal detecta y propone, nunca ejecuta cambios en producción sin validación humana experta.

**Flujo típico del agente legal por módulo:**
1. Detecta cambio normativo (Registro Oficial, resolución IESS/MDT).
2. Genera propuesta de actualización del motor de reglas.
3. Ejecuta suite de pruebas de regresión legal.
4. Notifica al experto legal interno para validación.
5. Se certifica con la firma de auditoría (si el cambio es material).
6. Se despliega con trazabilidad y se notifica a los clientes afectados.

---

## 6. AI DECISION TRIANGLE

**Optimizo primariamente para:** [✓] Capability — Lo más inteligente/preciso (decisiones de alto riesgo).

**Trade-offs que acepto:**
- Renuncio a Speed en cálculos complejos (liquidaciones con múltiples rubros) para priorizar exactitud legal.
- Renuncio a Cost extremo: el motor de reglas, la suite de pruebas y la certificación con firmas requieren inversión continua, pero es necesaria para el Trust Moat.
- La IA se usa para asistir (explicar norma, detectar incongruencias, proponer actualizaciones), no para generar cálculos críticos sin supervisión humana.

---

## 7. MODELO ECONÓMICO

**Modelo de pricing:** [✓] Freemium + certificación + revenue share con firmas.

| Componente | Descripción |
|---|---|
| Prueba gratuita | 30 días con funcionalidad completa (hasta 5 empleados) |
| Suscripción mensual plana | Por tramo de empleados ($15–$25/empresa/mes para 1–20 empleados) |
| Certificación anual | Tarifa fija pagada a la firma certificadora (no comisión) |
| Revenue share con firmas | 15–25% recurrente sobre clientes referidos por la firma |
| Módulos adicionales | Precio incremental por módulo (Contratos, Seguridad Social, etc.) |

**¿El pricing escala si tienes 10x usuarios?**
Sí. El costo marginal por empresa adicional es bajo (infraestructura cloud + actualizaciones normativas compartidas). El valor por cliente aumenta a medida que se agregan módulos y datos históricos.

**Unit economics estimados:**

| Métrica | Valor |
|---|---|
| Costo por usuario/mes (infra + soporte + actualizaciones legales) | $3–$5 |
| Revenue por usuario/mes (suscripción por empresa) | $15–$25 |
| Gross margin bruto | 70–80% |
| Gross margin neto (tras revenue share con firmas) | 55–65% |
| CAC | Reducido significativamente porque las firmas traen clientes de su cartera |
| LTV/CAC | Mejora, no empeora, a pesar del revenue share |

**Lógica del modelo:** cedes 15–25% de margen, pero reduces CAC drásticamente y ganas un sello institucional que ningún competidor puede replicar rápido. El LTV/CAC neto es mejor que vender solo.

---

## 8. MÉTRICAS DE ÉXITO

**Métricas de usuario:**
- Tiempo de procesamiento de nómina mensual (objetivo: < 15 minutos para 10 empleados).
- Tasa de errores en cálculos legales (objetivo: < 0.5%).
- Alertas de cumplimiento atendidas a tiempo (afiliaciones, décimos, utilidades).
- NPS del contador/dueño (objetivo: > 50).

**Métricas específicas de AI:**
- Precisión de la sugerencia de tipo de contrato vs. revisión experta: > 95%.
- Tasa de detección de incongruencias en datos de empleados: > 90%.
- Tiempo de actualización del motor de reglas tras una reforma legal: < 48 horas.
- Tasa de falsos positivos del agente legal (cambios propuestos que no aplican): < 10%.

**Métricas de la red de firmas:**
- Número de firmas certificadoras activas (objetivo año 1: 1; año 2: 3–5).
- % de nuevos clientes referidos por firmas (objetivo: > 40% al año 2).
- Tasa de renovación de certificación (objetivo: > 90%).

**Métricas de moat:**
- Profundidad del grafo de dependencias (# de integraciones entre módulos activas).
- Volumen de historial de cumplimiento acumulado (data moat).
- Switching cost promedio (% de clientes con > 12 meses de datos en el sistema).

---

## 9. RIESGOS CRÍTICOS

### 1. ¿Qué pasa si el problema desaparece en 12 meses por commoditización?

Riesgo bajo, siempre que el moat esté en la capa correcta.

- Si el moat fuera "tengo un agente que lee la ley" → riesgo alto de commoditización en 12 meses.
- Pero el moat es "sistema validado, auditable, certificado por firmas, integrado entre módulos, con historial de cumplimiento" → riesgo bajo, porque eso requiere tiempo, datos, confianza y red de expertos.

Mitigación adicional: la estrategia modular profundiza el moat con cada módulo unido. A los 12 meses ya tienes Nómina + Contratos integrados; a los 24, Seguridad Social y Vacaciones; a los 36, Utilidades y Liquidaciones. Cada integración es una barrera nueva.

### 2. ¿Puede un competidor replicar tu producto con la misma API en menos de 6 semanas?

Parcialmente. La interfaz y los cálculos básicos son replicables, pero:
- El motor de reglas certificado requiere meses de validación.
- La suite de pruebas de regresión legal requiere meses de construcción.
- La red de firmas certificadoras requiere relaciones y casos de éxito.
- El grafo de dependencias entre módulos requiere años de integración.

Mitigación: velocidad de ejecución en la unión de módulos. Cada módulo nuevo que integras antes que el competidor profundiza el moat.

### 3. Si tienes éxito a escala, ¿cuál es la primera forma en que se rompe la confianza?

Un cambio normativo no detectado a tiempo que genere un cálculo erróneo masivo.

Mitigación:
- Monitoreo constante de fuentes oficiales (Registro Oficial, resoluciones IESS/MDT).
- Suite de pruebas de regresión legal automatizada.
- Canal de soporte prioritario para alertar a clientes sobre cambios.
- Doble validación: agente legal + experto humano + firma certificadora para cambios materiales.
- Seguro de responsabilidad civil profesional.

### 4. Riesgo de dependencia de una sola firma certificadora (single point of failure)

Si tu moat depende de una firma y esa firma cambia de socios, es adquirida, construye su propia solución o pierde interés, tu moat se debilita de golpe.

Mitigación:
- Diseñar el modelo para múltiples firmas certificadoras desde el día 1.
- El sello es "Certificado por firma acreditada", no "Certificado por [Firma X]".
- La primera firma da credibilidad inicial; la segunda y tercera dan independencia.
- Contrato de certificación no exclusivo.

### 5. Riesgo de conflicto de interés del auditor

Las firmas de auditoría tienen principio de independencia. Si certifican tu producto y además auditan a clientes que lo usan, pueden surgir conflictos éticos y regulatorios (especialmente ante la Superintendencia de Compañías).

Mitigación:
- Separar roles: la firma certifica el motor de reglas (auditoría de sistemas) y no audita a clientes que usan el producto, o lo hace con salvaguardas explícitas (equipos separados, divulgación).
- Acordar esto desde el inicio con la firma; si se resuelve bien, refuerza la credibilidad.

### 6. Riesgo de responsabilidad legal compartida

Si un cálculo sale mal y hay sanción, ¿quién responde? Si la firma certificó, el cliente puede argumentar corresponsabilidad.

Mitigación contractual:
- La firma certifica el motor de reglas, no los datos de entrada del cliente.
- El cliente es responsable de la veracidad de sus datos.
- La firma responde por errores en la interpretación normativa, no por uso indebido.
- Trazabilidad completa para demostrar que el cálculo siguió la norma certificada.

### 7. Riesgo de canibalización de marca

Si la firma te percibe como "su" proveedor, otras firmas no querrán certificarte.

Mitigación: posicionar el producto como infraestructura neutral. Tú eres el motor; las firmas son los validadores. Mientras más firmas te certifiquen, más fuerte es tu posición de neutralidad. Ese es el Network Effect real.

### 8. Riesgo de costo de certificación temprana

Las firmas cobran por auditoría. Si empiezas con una sola firma, el costo puede ser alto relativo a ingresos tempranos.

Mitigación: negociar la primera certificación como inversión conjunta (la firma pone horas, tú pones producto y caso de éxito). Ofrecer visibilidad y caso de estudio público. Las firmas valoran contenido y diferenciación tanto como el dinero.

---

## 10. ROADMAP DE EJECUCIÓN (resumen)

| Fase | Plazo | Foco | Hito de moat |
|---|---|---|---|
| Fase 1 | Meses 0–6 | Módulo Nómina + agente legal + suite de pruebas + primera firma certificadora (Modelo A+B) | Trust Moat inicial + primer sello institucional |
| Fase 2 | Meses 6–12 | Módulo Contratos + integración con Nómina + 2ª y 3ª firma certificadora | Network Effect de firmas + grafo de dependencias |
| Fase 3 | Meses 12–18 | Módulo Seguridad Social (IESS) + Módulo Vacaciones + partners de implementación (Modelo E) | Data Moat + switching costs |
| Fase 4 | Meses 18–24 | Módulo Utilidades/Liquidaciones + exploración de JV con firma ancla (Modelo D) | Ecosistema completo + moat estructural |
| Fase 5 | Meses 24–36 | Expansión a segmento 20–50 empleados + posicionamiento como estándar nacional | Estándar de facto |

---

## 11. CHECKLIST DE ENTREGA

- [x] Producto seleccionado: sistema modular de RRHH para microempresas en Ecuador.
- [x] Estrategia modular definida: Nómina → Contratos → Seguridad Social → Vacaciones → Utilidades.
- [x] Agente legal por módulo definido como "detector + proponedor", no ejecutor.
- [x] Moat primario identificado: Trust Moat reforzado con certificación por firmas y Network Effect.
- [x] Análisis de commoditización incorporado: el moat está en la capa de validación e integración, no en el agente.
- [x] Estrategia de alianza con firmas de auditoría diseñada (Modelos A→B→E, con mitigación de riesgos).
- [x] Modelo económico ajustado con revenue share y mejora de LTV/CAC.
- [x] Riesgos críticos identificados con mitigaciones.
- [ ] Deep research de validación de mercado (pendiente: entrevistas a 5 contadores y 5 dueños de pymes).
- [ ] Deep research de crítica competitiva (pendiente: análisis detallado de Runa HR, Nómina360 y barreras de entrada).
- [ ] Listo para presentar en la Estación 2 (ajustar según cronograma).

---

## RESUMEN EJECUTIVO EN UNA FRASE

> NominaFácil EC es el estándar de cumplimiento laboral ecuatoriano para pymes: empieza por Nómina, crece por módulos integrados, y su moat no es el agente que lee la ley, sino la red de firmas de auditoría que certifican el motor, la trazabilidad auditable de cada cálculo y el grafo de dependencias legales entre módulos que ningún competidor puede replicar rápido.