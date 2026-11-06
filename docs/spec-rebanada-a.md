# Spec mínima: de la reforma a la nómina

**Fecha:** 2026-11-04 · **Estado:** v2, con los supuestos S1 a S7 aprobados
**Origen:** rebanada A de [rebanadas-candidatas.md](rebanadas-candidatas.md); requisitos de [PRD.md](PRD.md); moat de [PVB.md](PVB.md), sección 3
**Hitos:** despliegue el 9 de noviembre; panel y video el 16; Demo Day el 18

Los supuestos S1 a S7 de [spec-review.md](spec-review.md) quedaron aprobados y ya no se marcan en el texto. Los supuestos S1 a S15 quedaron aprobados o descartados el 2026-11-04; el detalle está en [spec-review-v2.md](spec-review-v2.md). Ningún supuesto queda abierto.

## 1. Problema

Cuando cambia una norma laboral, el contador y el dueño no pueden comprobar que el software la aplicó bien ni que no alteró lo ya cerrado. Detectar la norma es fácil de copiar; demostrar que el cambio es correcto, aprobado y trazable, no.

## 2. Usuario

El experto legal interno, que decide si una reforma entra al motor de reglas. En el demo, este rol lo interpreta el desarrollador.

## 3. El flujo, paso a paso

**Estado inicial del sistema:** parámetro SBU 2025 ($470), Acuerdo Ministerial MDT-2024-300, vigente desde el 1 de enero de 2025.

**Caso del demo:** reproducción del ingreso del Acuerdo MDT-2025-195, el acuerdo documentado, que fija el SBU de 2026 en $482. Es la norma que el sistema ingresa en este flujo. No es una detección en vivo, y se dice así.

1. El experto abre «Nueva norma» y registra el identificador, la fecha y el texto.
2. El sistema genera una propuesta: parámetro, valor, vigencia y cita. Si el LLM falla, el experto la completa en un formulario.
3. El sistema ejecuta la suite de regresión sobre la propuesta y muestra cada caso en verde o rojo, con sus valores antes y después.
4. El experto revisa la escena de Juan, empleado ficticio: diciembre de 2025, período cerrado, se mantiene en $39.17; enero de 2026, período abierto, pasa de $39.17 a $40.17.
5. El experto aprueba, solo si todo está en verde, o rechaza con un motivo.
6. Al aprobar, el sistema publica la versión nueva y crea un aviso por cada empresa afectada.
7. El panel muestra la evidencia del recorrido.

### Modal de versión

Desde la escena de Juan, cada valor abre un modal con los datos de la versión que lo produjo: parámetro, valor, vigencia, fuente y estado.

| Versión | Valor | Vigente desde | Fuente | Estado |
| --- | --- | --- | --- | --- |
| 2025 | $470 | 2025-01-01 | Acuerdo Ministerial MDT-2024-300, cita textual | Estado inicial del sistema |
| 2026 | $482 | 2026-01-01 | Acuerdo MDT-2025-195, con su cita textual | Aprobada por `experto_demo`, con fecha de aprobación |

**Cita de la versión 2025:** «El Ministerio del Trabajo fijó el Salario Básico Unificado (SBU) del trabajador en general para el año 2025 en USD. 470,00 mensuales. […] El nuevo Salario Básico Unificado (SBU) regirá a partir del 01 de enero de 2025, según el Acuerdo Ministerial Nro. MDT-2024-300» Son dos fragmentos literales del [comunicado oficial del Ministerio del Trabajo](https://www.trabajo.gob.ec/el-salario-basico-unificado-del-trabajador-en-general-para-el-ano-2025-sera-de-usd-47000/): el primero fija el valor, y el segundo, la vigencia y el acuerdo. Se guardan juntos, en un solo campo y con `[…]` entre ellos. Es una cita del comunicado, no del texto del acuerdo.

### Reglas de negocio

| ID | Regla |
| --- | --- |
| BR-01 | Ninguna versión se publica sin una aprobación humana registrada; el LLM nunca escribe en el motor |
| BR-02 | El servidor rechaza la aprobación si la propuesta no tiene una corrida de regresión completa y totalmente en verde |
| BR-03 | Solo se admiten cambios del parámetro `SBU`; cualquier otro parámetro se rechaza |
| BR-04 | Cada período usa la versión vigente en su primer día, no la de la fecha del cálculo |
| BR-05 | Los períodos cerrados guardan valor y versión, y nunca se recalculan |
| BR-06 | Décimo cuarto mensualizado = SBU ÷ 12, redondeado a 2 decimales, mitad hacia arriba. Se calcula sobre mes completo y para empleados que optaron por la mensualización |
| BR-07 | Una propuesta solo se decide una vez; una segunda decisión se rechaza |
| BR-08 | La salida del LLM se valida contra el esquema, y ninguna propuesta, del LLM o manual, se acepta si su cita no aparece textualmente en la norma. Antes de comparar, en la cita y en el texto cada secuencia de espacios en blanco (espacios, tabuladores, saltos de línea, espacios duros) se reduce a un espacio y se recortan los extremos. Mayúsculas, tildes, comillas y puntuación se comparan tal cual |

### Casos de regresión precargados

Juan y Ana son empleados ficticios de dos empresas ficticias, con sueldo de $600 para que el piso salarial no intervenga.

| Caso | Empleado y período | Esperado |
| --- | --- | --- |
| RC-01 | Juan, diciembre de 2025 | $39.17 |
| RC-02 | Juan, enero de 2026 | $40.17 |
| RC-03 | Ana, julio de 2025 | $39.17 |
| RC-04 | Ana, febrero de 2026 | $40.17 |

Nota para el demo: algunas calculadoras publican $39,16 para 2025 porque truncan. Este sistema usa redondeo medio-arriba (BR-06) y por eso muestra $39,17. La diferencia es de convención, no de cálculo.

Estos son los resultados esperados con cada propuesta:

| Propuesta | Resultado | Motivo |
| --- | --- | --- |
| $482 desde 2026-01-01 | 4 de 4 en verde | Propuesta correcta |
| $428 desde 2026-01-01 | RC-02 y RC-04 en rojo ($35.67) | Dígitos invertidos |
| $482 desde 2025-12-01 | RC-01 en rojo ($40.17) | Vigencia anticipada: alteraría un período pasado |

## 4. Criterios de aceptación

- [ ] **Recorrido completo.** Al aprobar la propuesta de $482 desde 2026-01-01, Juan queda en $40.17 en enero de 2026, con versión 2026 y cita del Acuerdo MDT-2025-195; su período cerrado de diciembre de 2025 sigue en $39.17 con versión 2025, y existen 2 avisos. El panel muestra las cinco métricas de la sección 6 con esos datos y las dos etiquetas de transparencia.
- [ ] **Bloqueo.** Con la propuesta de $428, la interfaz desactiva «Aprobar», `POST /api/propuestas/:id/aprobar` responde 409 y la versión vigente no cambia. Lo mismo ocurre si se intenta aprobar sin corrida o decidir dos veces.
- [ ] **El demo no depende del LLM.** Si el LLM da error, excede 8 segundos o devuelve una salida que no cumple BR-03 o BR-08, se abre el formulario manual sin perder el texto, y la propuesta manual recorre las mismas reglas con origen «manual».

## 5. Qué queda fuera

- Monitoreo automático de fuentes oficiales.
- Cambios estructurales: fórmulas o rubros nuevos, y cualquier parámetro distinto del SBU.
- Otros efectos del SBU: piso salarial, multas y demás rubros de nómina.
- Décimo cuarto acumulado, períodos parciales y diferencias por región.
- Certificación real por una firma y reversión de versiones.
- Pantallas para dueño o contador, roles de pago en PDF y correos.
- Cuentas de usuario: la decisión se registra con el actor fijo `experto_demo`.
- Edición de casos de regresión desde la interfaz: se cargan desde los datos iniciales.
- Datos reales: todo es ficticio.

## 6. Decisiones técnicas

| Tema | Decisión |
| --- | --- |
| Aplicación | Next.js 15.5.x (App Router) y TypeScript |
| Base de datos | Prisma con Postgres en Supabase, también en desarrollo |
| Despliegue | Vercel, sin plan Pro |
| Acceso | HTTP Basic Auth en el middleware de Next.js. La contraseña se lee de la variable de entorno `DEMO_PASSWORD`. No se usa Vercel Password Protection |
| LLM | Ola 2 (fuera del plan activo hasta después del demo). Un solo endpoint con prompt cerrado y salida JSON. Proveedor elegido el 2026-11-05: Claude Haiku 5.5 (`claude-haiku-5-5`). No se implementa en la ola 1 ni en la ola 3. |
| Pruebas | Vitest, con `npm test`. No se declaró TDD |

**Datos:** `Norma`, `Propuesta`, `VersionMotor`, `CasoRegresion`, `CorridaRegresion`, `Empresa`, `Empleado`, `Periodo`, `LineaNomina` (valor y versión guardados), `Aviso` y `Evento` (alimenta el panel). `npm run db:seed` restablece el estado inicial del demo.

**Contrato de la propuesta:**

```json
{
  "parametro": "SBU",
  "valor": 482.00,
  "vigenteDesde": "2026-01-01",
  "citaTextual": "<fragmento literal de la norma>",
  "origen": "llm"
}
```

**Rutas:** `POST /api/normas`, `POST /api/normas/:id/propuesta`, `POST /api/propuestas/:id/regresion`, `POST /api/propuestas/:id/aprobar`, `POST /api/propuestas/:id/rechazar`, `GET /api/panel`. La publicación, los avisos y los eventos de una aprobación ocurren en una sola transacción.

**Panel (16 de noviembre).** Todas las métricas salen de eventos del flujo:

1. Tiempo desde «norma ingresada» hasta «propuesta aprobada», en el último caso.
2. Propuestas: total, aprobadas y rechazadas.
3. Casos de regresión: total, verdes y rojos, con valores antes y después del último cambio.
4. Versiones del motor vigentes por fecha.
5. Períodos cerrados que la última reforma no alteró.

**Etiquetas visibles en el panel y el demo:**

- «Datos de demostración, no de uso».
- «Casos de regresión validados contra fuente pública; certificación por firma de auditoría pendiente, no incluida en esta rebanada». Ajusta el texto acordado, que la ubicaba en la fase 2, porque el PRD la pone en la fase 1.

**Entrega del 9 de noviembre:** flujo completo con el formulario manual, sin LLM ni panel.
