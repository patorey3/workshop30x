# Rebanadas candidatas para el Demo Day

**Fecha:** 2026-11-04
**Fuentes:** [PVB.md](PVB.md) (sección 3, moat), [PRD.md](PRD.md), skill `evaluate-spec` y plantilla `spec-minima`
**Hitos:** despliegue el 9 de noviembre; dashboard y video de 3 minutos el 16; Demo Day el 18.

**Recomendación: la rebanada A.** Es la única que demuestra la tesis del PVB: el agente legal es commoditizable, y el moat es lo que ocurre después de detectar la ley. La [comparación](#comparación) resume el porqué. Las estimaciones de riesgo son criterio propio, no mediciones.

## Lo que comparten las tres

- **Base técnica:** un motor determinista con parámetros legales versionados por vigencia (RF-16), empresas y empleados ficticios precargados, y casos de prueba con resultados esperados.
- **Forma:** un solo usuario y de 3 a 7 pasos, como pide la plantilla.
- **Sin datos reales:** usar solo datos ficticios evita tener que resolver la protección de datos personales (RNF-06) en este plazo.
- **Fuera en todas:** cobros (RF-60 a RF-62), alertas (RF-40 a RF-42), multiempresa real (RF-02), integración con IESS y SRI, y los módulos de las fases 2 a 5.
- **Capas del moat que ninguna muestra de verdad:**
  - **Capa 5, red de firmas:** requiere varias firmas reales.
  - **Capa 6, grafo de dependencias:** requiere varios módulos.
  - **Capa 8, switching costs:** requiere clientes con historial.

---

## A. De la reforma a la nómina: «la ley cambia y el sistema lo demuestra»

**Usuario:** el experto legal interno.

**Flujo:**

1. Ingresa el texto de una norma real.
2. El agente propone qué parámetro cambia y desde qué fecha.
3. El sistema ejecuta la suite de regresión y muestra qué casos cambian.
4. El experto ve el impacto, con valores antes y después, en las empresas ficticias.
5. Aprueba o rechaza, y queda registrado.
6. La versión nueva se aplica a los períodos futuros; los cerrados no cambian.
7. Se generan los avisos para los clientes afectados.

**Caso del demo:** la transición del salario básico de 2025 a 2026 y su efecto en el décimo cuarto sueldo. Es una reproducción de una norma real, no una detección en vivo, y hay que decirlo así. *Verificar:* el valor de 2026 y su acuerdo ministerial en la fuente oficial, porque el PVB solo cita el de 2025 ($470).

### (a) Qué entra

- Ingreso manual de una norma y propuesta generada con un LLM, limitada a **cambios de parámetros**.
- Suite de regresión con casos validados y su resultado visible.
- Bandeja de aprobación, con bloqueo real de despliegue si no hay aprobación.
- Versiones del motor con vigencia y comparación antes y después.
- Una nómina mínima, solo con los rubros que dependen del parámetro.
- Avisos a clientes como registros dentro de la aplicación.

### (b) Qué queda fuera

- Monitoreo automático de fuentes oficiales (RF-50 completo).
- Cambios estructurales de reglas: fórmulas nuevas o rubros nuevos.
- Certificación por firma (RF-55) y reversión de versiones (RF-57).
- Pantallas para dueño o contador, roles de pago en PDF y envío de correos.

### (c) RF cubiertos

| Cobertura | RF |
| --- | --- |
| Completa | RF-52, RF-53, RF-54, RF-15, RF-16 |
| Parcial | RF-51 (solo parámetros), RF-56 (sin correo), RF-12 (solo décimo cuarto), RF-30 y RF-32 (solo en este flujo) |

### (d) Capas del moat visibles

- **Capa 3, suite de regresión:** es la protagonista del demo y la capa más fuerte que se puede mostrar.
- **Capa 2, motor actualizable:** la reforma se convierte en una versión con vigencia.
- **Capa 1, agente legal:** aparece a propósito como la pieza reemplazable.

### (e) Riesgo en 10 días: **medio**

- **Principal:** que el agente proponga mal en vivo. Se mitiga porque el LLM nunca escribe en el motor, y se puede grabar el video con una corrida ya validada.
- **Secundario:** que el alcance crezca hacia reglas estructurales. La restricción a parámetros debe quedar escrita en la spec.
- **Si hay que recortar:** el experto ingresa la propuesta a mano. El demo sobrevive, porque el moat no depende del agente.

---

## B. Nómina defendible: «cada centavo tiene su artículo»

**Usuario:** el contador externo.

**Flujo:**

1. Abre el período de una empresa precargada.
2. Registra novedades de horas extras.
3. El sistema calcula los rubros.
4. Abre un rubro y ve la fórmula, los valores, el artículo, la versión del motor y la vigencia.
5. Aprueba y cierra el período.
6. Descarga el rol de pago y el registro de auditoría.

### (a) Qué entra

- Ficha de empleado con validación de datos completos.
- Cálculo de sueldo mensual completo, horas extras, décimos y aportes al IESS.
- Detalle legal por rubro, aprobación y bloqueo del período cerrado.
- Rol de pago en PDF.

### (b) Qué queda fuera

- Agente legal y flujo de actualización normativa (RF-50 a RF-57).
- Períodos parciales por ingreso o salida a mitad de mes.
- Fondos de reserva y retención de impuesto a la renta (RF-14), por lo que el rol de pago **no sirve para pagos reales** y debe decirlo.
- Correcciones de períodos cerrados con versión nueva, importación desde Excel y archivos para el SRI.

### (c) RF cubiertos

| Cobertura | RF |
| --- | --- |
| Completa | RF-04, RF-05, RF-11, RF-12, RF-13, RF-20, RF-21, RF-23, RF-30, RF-31 |
| Parcial | RF-10 (sin períodos parciales), RF-15 y RF-16 (una sola versión en uso), RF-22 (bloqueo sin correcciones), RF-32 (registro sin garantía de inalterabilidad) |

### (d) Capas del moat visibles

- **Capa 7, data moat de cumplimiento:** cada cálculo queda como evidencia. Solo se muestra el mecanismo, porque aún no hay historial acumulado.
- **Capa 2, motor de reglas:** se ve la versión aplicada, pero no cómo se actualiza.

### (e) Riesgo en 10 días: **medio en ejecución, alto en el mensaje**

- **Principal:** que se perciba como una calculadora con citas legales, justo lo que la tarea pide evitar. Runa o Nómina360 podrían mostrar una pantalla parecida.
- **Secundario:** es la rebanada con más superficie (más RF y más rubros), y cada fórmula y cita legal necesita validación. Un contador en la audiencia notará cualquier error o rubro ausente.
- **Si hay que recortar:** quitar horas extras y el PDF.

---

## C. Expediente de certificación: «la firma verifica el motor»

**Usuario:** el auditor de una firma.

**Flujo:**

1. Abre el expediente de una versión del motor.
2. Revisa cada regla junto a su norma de origen.
3. Vuelve a ejecutar la suite de regresión.
4. Revisa los resultados y registra observaciones.
5. Aprueba o rechaza la versión.
6. El sello queda atado a esa versión.
7. Si se publica otra versión, el sello de la anterior no se traslada a la nueva.

### (a) Qué entra

- Vista de auditor de solo lectura, sin datos personales.
- Catálogo de reglas con norma, vigencia y casos de prueba.
- Ejecución de la suite bajo demanda y resultado reproducible.
- Registro de la decisión y sello genérico vinculado a la versión.

### (b) Qué queda fuera

- Agente legal, flujo de nómina del cliente y pantallas para dueño o contador.
- Certificación real: sin una firma con acuerdo firmado, todo sello debe rotularse como **simulación**. Presentarlo como real sería engañoso.
- Administración de varias firmas (capa 5).
- Criterio de cambio material (P7) y resolución del conflicto de interés (P4).

### (c) RF cubiertos

| Cobertura | RF |
| --- | --- |
| Completa | RF-52 |
| Parcial | RF-55 (simulado), RF-03 (solo rol de auditor), RF-16 y RF-30 (a nivel de regla, no de cálculo), RF-32 (solo decisiones), historia H6 |

### (d) Capas del moat visibles

- **Capa 4, certificación:** es la barrera más difícil de copiar del conjunto, pero aquí solo se muestra el mecanismo, no una certificación real.
- **Capa 3, suite de regresión:** el auditor la ejecuta y comprueba por sí mismo.

### (e) Riesgo en 10 días: **bajo en código, alto en credibilidad**

- **Principal:** depende de una persona externa. Sin un CPA real que revise el flujo o participe, es una maqueta de un proceso que nadie ha validado, y conseguirlo en 10 días no depende solo de ti.
- **Secundario:** expone en público las preguntas P4 y P7 sin respuesta, y el usuario no es quien paga, lo que hace el demo menos directo.
- **Si hay que recortar:** quitar la invalidación del sello entre versiones.

---

## Comparación

| Criterio | A. Reforma a nómina | B. Nómina defendible | C. Expediente |
| --- | --- | --- | --- |
| Capa más fuerte visible | 3, funcionando de verdad | 7, solo el mecanismo | 4, simulada |
| Se distingue de un competidor | Alto | Bajo | Alto |
| Superficie de reglas por validar | Baja | Alta | Media |
| Depende de terceros | No | No | Sí, de un CPA |
| Demo en 3 minutos | Historia con antes y después | Recorrido de pantallas | Proceso más abstracto |
| Riesgo principal | Propuesta incorrecta del agente, con alternativa manual | Parecer una calculadora | Sin validación externa |

**Por qué no B ni C:** B es la más útil para un cliente, pero la que menos muestra el moat. C apunta a la capa correcta, pero el demo se apoyaría en una certificación que todavía no existe. Si consigues un CPA dispuesto a participar antes del 9, C gana fuerza como cierre de A para una etapa posterior.

## Lo que se desplegaría el 9 de noviembre con A

El motor, los casos de regresión, los datos ficticios y la bandeja de aprobación, con la propuesta ingresada a mano. El LLM se conecta después. Así, el despliegue del 9 ya muestra el flujo completo aunque el agente no esté listo.

## Decisiones que necesito antes de la spec

1. **¿Cuál rebanada eliges?** A, con el ajuste del demo: la escena de Juan (empleado ficticio) con SBU 470 → 482 mostrando antes/después y el período cerrado que no cambia. El flujo del spec debe incluir esa escena explícitamente.
2. **¿Qué debe mostrar el dashboard del 16?** 
Un panel con estas cinco métricas, todas alimentadas por eventos del flujo real (no inventadas):
Tiempo desde "norma ingresada" hasta "propuesta aprobada" (último caso).
Propuestas: total, aprobadas, rechazadas.
Casos de regresión: total, verdes, rojos, con valores antes/después del último cambio.
Versiones del motor vigentes por fecha.
Períodos cerrados que la última reforma no alteró (número).
Si hay pocos eventos (porque el flujo se ejecutó 2 veces), se muestra con esos pocos eventos y se etiqueta "datos de demostración, no de uso".
3. **¿Quién valida los casos de regresión?** 
Nadie externo en 10 días. Los casos se validan contra fuentes públicas (Acuerdo MDT-2025-195 y su equivalente 2026). En el demo y en el dashboard se rotula: "casos de regresión validados contra fuente pública; certificación por firma de auditoría pendiente (fase 2 del PRD)". Ocultarlo no es opción.
4. **¿Qué stack, proveedor de LLM y hosting usarás?** 
Stack: Next.js 14 (App Router) + TypeScript.
Base de datos: SQLite vía Prisma (local en dev; para deploy, Postgres en Supabase si el LLM necesita persistencia).
Deploy: Vercel con protección por contraseña (Vercel Password Protection o Cloudflare Access). Sin esto, los datos ficticios de cédula/sueldo quedarían públicos, y aunque sean ficticios, el mensaje importa en E10.
LLM: un solo endpoint (Anthropic Claude Haiku o GPT-4o-mini) para la propuesta de cambio de parámetro, con prompt cerrado y salida JSON.
Fallback garantizado: si el LLM falla o tarda, la propuesta se ingresa manualmente por un formulario. El demo NO depende del LLM.
