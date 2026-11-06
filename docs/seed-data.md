# Datos del seed

Fuente única de datos para T03 (modelo) y T04 (seed). Consolida `docs/spec-rebanada-a.md` §3, BR-01, BR-05 y BR-06, y T04. Los campos cosméticos (nombres, cédulas, RUC, cargos, ciudades, fechas de ingreso) no intervienen en ningún cálculo. Si este documento y la spec difieren, manda la spec; las diferencias conocidas están en la sección 12.

Todos los datos son ficticios. Las cédulas y los RUC tienen el dígito verificador incorrecto a propósito, así que no pueden corresponder a una persona ni a una empresa reales.

## 1. Empresas

| ID | Nombre | RUC ficticio | Ciudad | Representante |
| --- | --- | --- | --- | --- |
| emp-01 | Panadería La Espiga | 1792345678001 | Quito | Juan Carlos Pérez Quishpe |
| emp-02 | Taller Mecánico El Roble | 1798765432001 | Quito | Ana María García Toapanta |

## 2. Empleados

| ID | Nombre | Cédula | Empresa | Cargo | Sueldo | Fecha ingreso | Mensualizado |
| --- | --- | --- | --- | --- | --- | --- | --- |
| emp-juan | Juan Carlos Pérez Quishpe | 1712345678 | emp-01 | Panadero | 600.00 | 2024-03-15 | sí |
| emp-ana | Ana María García Toapanta | 1719876543 | emp-02 | Contadora | 600.00 | 2024-08-01 | sí |

El sueldo de $600 evita que intervenga el piso salarial (spec §3). «Mensualizado» corresponde a `optoMensualizacion = true` (BR-06).

## 3. Períodos

| ID | Empleado | Período | Estado | Décimo 4° inicial | Versión |
| --- | --- | --- | --- | --- | --- |
| per-juan-2025-12 | emp-juan | 2025-12 | cerrado | 39.17 | v2025 |
| per-juan-2026-01 | emp-juan | 2026-01 | abierto | 39.17 | v2025 |
| per-ana-2025-07 | emp-ana | 2025-07 | cerrado | 39.17 | v2025 |
| per-ana-2026-02 | emp-ana | 2026-02 | abierto | 39.17 | v2025 |

En el modelo (T03), `Periodo` pertenece a la empresa (empresa, año, mes, estado `ABIERTO` o `CERRADO`), no al empleado. Como cada empresa tiene un solo empleado, la columna «Empleado» equivale a la empresa del empleado: `per-juan-*` pertenece a emp-01 y `per-ana-*` a emp-02. El valor y la versión no viven en el período, sino en su `LineaNomina` (sección 5).

## 4. Versiones del motor

| Versión | SBU | Vigente desde | Fuente | Estado en seed |
| --- | --- | --- | --- | --- |
| v2025 | 470.00 | 2025-01-01 | MDT-2024-300, vigente 2025-01-01 | Publicada, con estado «Estado inicial del sistema» y sin aprobador |
| v2026 | 482.00 | 2026-01-01 | Acuerdo MDT-2025-195 | **No existe**; se crea al aprobar la propuesta, con aprobador `experto_demo` y fecha de aprobación |

Nota: BR-01 prohíbe publicar sin aprobación humana, por eso v2026 no está en el seed. T04 la incluye solo como datos de referencia (`NORMA_DEMO_2026` y `PROPUESTA_DEMO_2026`), que no se escriben en la base de datos.

**Cita de v2025** (spec §3, «Cita de la versión 2025», ya transcrita; se guarda tal cual, en un solo campo):

> El Ministerio del Trabajo fijó el Salario Básico Unificado (SBU) del trabajador en general para el año 2025 en USD. 470,00 mensuales. […] El nuevo Salario Básico Unificado (SBU) regirá a partir del 01 de enero de 2025, según el Acuerdo Ministerial Nro. MDT-2024-300

Es una cita del [comunicado oficial del Ministerio del Trabajo](https://www.trabajo.gob.ec/el-salario-basico-unificado-del-trabajador-en-general-para-el-ano-2025-sera-de-usd-47000/), no del texto del acuerdo.

**Cita de v2026:** pendiente. El texto oficial de MDT-2025-195 no está verificado; `NORMA_DEMO_2026.texto` se rotula como ejemplo, y la cita de `PROPUESTA_DEMO_2026` debe aparecer literalmente en ese texto (BR-08). T15 indica reemplazarlo antes de grabar el demo.

## 5. Líneas de nómina

Una línea por período, cuatro en total: concepto «Décimo cuarto mensualizado», valor 39.17, versión v2025.

Tras aprobar la propuesta de $482 desde 2026-01-01:

| Período | Estado | Antes | Después |
| --- | --- | --- | --- |
| per-juan-2025-12 | cerrado | 39.17 · v2025 | 39.17 · v2025 (no se recalcula, BR-05) |
| per-juan-2026-01 | abierto | 39.17 · v2025 | 40.17 · v2026 |
| per-ana-2025-07 | cerrado | 39.17 · v2025 | 39.17 · v2025 (no se recalcula, BR-05) |
| per-ana-2026-02 | abierto | 39.17 · v2025 | 40.17 · v2026 |

Cada período usa la versión vigente en su primer día (BR-04).

## 6. Casos de regresión

| ID | Empleado | Período | Esperado |
| --- | --- | --- | --- |
| RC-01 | emp-juan | 2025-12 | 39.17 |
| RC-02 | emp-juan | 2026-01 | 40.17 |
| RC-03 | emp-ana | 2025-07 | 39.17 |
| RC-04 | emp-ana | 2026-02 | 40.17 |

Son los únicos 4 casos (S8). La suite simula también los períodos cerrados, sin leer el valor guardado ni escribir nada.

## 7. Propuestas de prueba

Escenarios de la spec §3, no son filas del seed: tras el seed no existen normas ni propuestas (T04). Se crean durante el recorrido o en las pruebas.

| ID | Parámetro | Valor | Vigente desde | Escenario | Resultado esperado |
| --- | --- | --- | --- | --- | --- |
| prop-ok | SBU | 482.00 | 2026-01-01 | correcta | 4/4 verde |
| prop-bad-digits | SBU | 428.00 | 2026-01-01 | dígitos invertidos | RC-02 y RC-04 rojos (35.67) |
| prop-bad-vigencia | SBU | 482.00 | 2025-12-01 | vigencia anticipada | RC-01 rojo (40.17) |

En prop-bad-vigencia, RC-03 (julio de 2025) sigue en verde, porque su primer día es anterior a 2025-12-01.

## 8. Avisos

Al aprobar se generan 2 avisos, uno por empresa afectada (emp-01 y emp-02), porque ambas tienen un período abierto alcanzado por la vigencia. T11 cuenta las dos empresas como afectadas. El seed no crea avisos. El modelo admite un solo aviso por empresa y versión.

## 9. Eventos esperados tras una aprobación

Nombres de S13. El modelo `Evento` se crea en T16, no en T03.

Orden: `norma_ingresada`, `propuesta_creada`, `regresion_ejecutada`, `propuesta_aprobada`, `version_publicada`.

Con prop-bad-digits, aprobar responde 409 y no genera eventos de decisión (BR-02, T16). Si el experto la rechaza, se registra `propuesta_rechazada` con su motivo, por ejemplo «regresión en rojo». El motivo es texto libre y obligatorio (T11).

Tras el seed solo existe el evento inicial de la versión 2025, con origen `seed` (T16).

## 10. Cálculos (BR-06, redondeo medio-arriba)

- 470 / 12 = 39.1666... → 39.17
- 482 / 12 = 40.1666... → 40.17
- 428 / 12 = 35.6666... → 35.67

Nota: algunas calculadoras truncan y publican 39.16. Este sistema usa redondeo medio-arriba, no bancario (S14).

## 11. Referencias

- `docs/spec-rebanada-a.md` §3 («Estado inicial del sistema», «Modal de versión», «Casos de regresión precargados»), BR-01, BR-04, BR-05, BR-06 y §6 «Datos».
- `docs/spec-review-v2.md`: S2, S8, S13 y S14.
- `docs/tasks/T03-modelo-de-datos.md`, `docs/tasks/T04-datos-iniciales.md`, `docs/tasks/T11-api-aprobar-y-rechazar.md` y `docs/tasks/T16-eventos.md`.

## 12. Diferencias con el pedido original, resueltas a favor de la spec

1. **Cita de v2025:** el pedido decía «pendiente de transcribir», pero la spec §3 ya la transcribe. Se copia literal.
2. **Fuente y estado de v2025:** el pedido decía «publicada». La spec y T04 piden estado «Estado inicial del sistema», sin aprobador. Ambos son compatibles: la versión está publicada, y su estado visible es ese texto.
3. **Período por empleado:** el pedido asocia el período al empleado; T03 lo asocia a la empresa. Es equivalente con un empleado por empresa.
4. **Propuestas de prueba:** no son datos del seed (T04: «No existen normas, propuestas, corridas ni avisos tras el seed»).
5. **Eventos:** `Evento` queda fuera de T03 (se crea en T16). El motivo «regresión en rojo» es un ejemplo, no un valor fijo.
6. **Representantes:** cada representante es también el único empleado de su empresa. Es un dato cosmético, se mantiene tal como se pidió.
