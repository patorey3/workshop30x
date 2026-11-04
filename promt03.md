Apruebo los supuestos S1 a S7 del review con estas precisiones:

- S1: aprobado tal cual.
- S2: aprobado con cambio de narrativa. En el demo y en la spec, el estado
  inicial del sistema se describe como "parámetro SBU 2025 vigente desde el
  1 de enero de 2025, fuente por verificar". No afirmes que un acuerdo de
  2025 fija el 470. El acuerdo documentado (MDT-2025-195) es el de 2026 (482)
  y es el que el sistema ingresa en el flujo del demo. Actualiza el spec para
  reflejar esto en la sección 3 (flujo) y en el modal de versión.
- S3: aprobado tal cual.
- S4: aprobado, pero con HTTP Basic Auth en el middleware de Next.js en vez
  de Vercel Password Protection. La contraseña se lee de la variable de
  entorno DEMO_PASSWORD. Actualiza el spec para reflejar esto en sección 6
  (Decisiones técnicas). Sin Vercel Pro.
- S5: aprobado tal cual.
- S6: aprobado tal cual.
- S7: aprobado tal cual.

Después de actualizar el spec:

1. Vuelve a correr evaluate-spec sobre la spec corregida (solo la ola 1 y
   la 3; la ola 2 sigue en C por falta de proveedor de LLM y eso es
   intencional). Escribe el nuevo resultado en docs/spec-review-v2.md.
   No sobrescribas spec-review.md (el v1). Nota (skills/evaluate-spec/SKILL.md del repo del curso: https://github.com/30x-llc/ai-for-devs-cohorte-5)
2. Si la ola 1 y la ola 3 quedan en A o B, genera el plan de tareas SOLO
   para las olas 1 y 3 (la ola 2 no entra en el plan todavía), siguiendo
   create-implementation-plan:
   https://github.com/30x-llc/ai-for-devs-cohorte-5/blob/main/skills/create-implementation-plan/SKILL.md

   Reglas del plan:
   - Primera tarea: crear el proyecto Next.js 14 + TypeScript + Prisma +
     Vitest, con un test que corra (`npm test`). Esta tarea debe hacerse en
     menos de 1 hora.
   - Tareas de ola 1: persistencia (Postgres/Supabase), modelo de datos
     (empleados ficticios, versiones, propuestas, aprobaciones, períodos),
     parámetros versionados, motor determinista, formulario de propuesta
     manual, suite de regresión con los 8 casos, bandeja de aprobación,
     bloqueo de período cerrado, HTTP Basic Auth.
   - Tareas de ola 3: eventos y dashboard con las 5 métricas.
   - Cada tarea con: alcance, criterios de aceptación, plan de pruebas,
     dependencias explícitas. Sin ciclos.
   - Guarda cada tarea como archivo separado en docs/tasks/T01-...md hasta
     T0N-...md.
3. No implementes nada todavía.

Al final, dime en el chat:
- Nota final de la ola 1 y de la ola 3 tras la corrección.
- Número de tareas en el plan y cuáles son de ola 1 vs ola 3.
- La tarea 1: cuánto tiempo estimas que toma.
- Cualquier tarea cuya estimación sea mayor a 1 hora.