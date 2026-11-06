-- CreateEnum
CREATE TYPE "OrigenPropuesta" AS ENUM ('manual', 'llm');

-- CreateEnum
CREATE TYPE "EstadoPropuesta" AS ENUM ('PENDIENTE', 'APROBADA', 'RECHAZADA');

-- CreateEnum
CREATE TYPE "EstadoVersion" AS ENUM ('INICIAL', 'APROBADA');

-- CreateEnum
CREATE TYPE "EstadoPeriodo" AS ENUM ('ABIERTO', 'CERRADO');

-- CreateTable
CREATE TABLE "Norma" (
    "id" TEXT NOT NULL,
    "identificador" TEXT NOT NULL,
    "fecha" DATE NOT NULL,
    "texto" TEXT NOT NULL,
    "creadaEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Norma_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Propuesta" (
    "id" TEXT NOT NULL,
    "normaId" TEXT NOT NULL,
    "parametro" TEXT NOT NULL,
    "valor" DECIMAL(10,2) NOT NULL,
    "vigenteDesde" DATE NOT NULL,
    "citaTextual" TEXT NOT NULL,
    "origen" "OrigenPropuesta" NOT NULL,
    "estado" "EstadoPropuesta" NOT NULL DEFAULT 'PENDIENTE',
    "actor" TEXT,
    "decididaEn" TIMESTAMP(3),
    "motivoRechazo" TEXT,
    "creadaEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Propuesta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VersionMotor" (
    "id" TEXT NOT NULL,
    "parametro" TEXT NOT NULL,
    "valor" DECIMAL(10,2) NOT NULL,
    "vigenteDesde" DATE NOT NULL,
    "fuente" TEXT NOT NULL,
    "citaTextual" TEXT NOT NULL,
    "estado" "EstadoVersion" NOT NULL,
    "aprobadoPor" TEXT,
    "aprobadaEn" TIMESTAMP(3),
    "propuestaId" TEXT,
    "creadaEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VersionMotor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Empresa" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "ruc" TEXT,
    "ciudad" TEXT,
    "representante" TEXT,

    CONSTRAINT "Empresa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Empleado" (
    "id" TEXT NOT NULL,
    "empresaId" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "sueldo" DECIMAL(10,2) NOT NULL,
    "optoMensualizacion" BOOLEAN NOT NULL,
    "cedula" TEXT,
    "cargo" TEXT,
    "fechaIngreso" DATE,

    CONSTRAINT "Empleado_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Periodo" (
    "id" TEXT NOT NULL,
    "empresaId" TEXT NOT NULL,
    "anio" INTEGER NOT NULL,
    "mes" INTEGER NOT NULL,
    "estado" "EstadoPeriodo" NOT NULL,

    CONSTRAINT "Periodo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LineaNomina" (
    "id" TEXT NOT NULL,
    "empleadoId" TEXT NOT NULL,
    "periodoId" TEXT NOT NULL,
    "concepto" TEXT NOT NULL DEFAULT 'Décimo cuarto mensualizado',
    "valor" DECIMAL(10,2) NOT NULL,
    "versionId" TEXT NOT NULL,
    "actualizadaEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LineaNomina_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CasoRegresion" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "empleadoId" TEXT NOT NULL,
    "periodoId" TEXT NOT NULL,
    "esperado" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "CasoRegresion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CorridaRegresion" (
    "id" TEXT NOT NULL,
    "propuestaId" TEXT NOT NULL,
    "total" INTEGER NOT NULL,
    "verdes" INTEGER NOT NULL,
    "rojos" INTEGER NOT NULL,
    "resultados" JSONB NOT NULL,
    "ejecutadaEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CorridaRegresion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Aviso" (
    "id" TEXT NOT NULL,
    "empresaId" TEXT NOT NULL,
    "versionId" TEXT NOT NULL,
    "mensaje" TEXT NOT NULL,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Aviso_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "VersionMotor_propuestaId_key" ON "VersionMotor"("propuestaId");

-- CreateIndex
CREATE UNIQUE INDEX "VersionMotor_parametro_vigenteDesde_key" ON "VersionMotor"("parametro", "vigenteDesde");

-- CreateIndex
CREATE UNIQUE INDEX "Periodo_empresaId_anio_mes_key" ON "Periodo"("empresaId", "anio", "mes");

-- CreateIndex
CREATE UNIQUE INDEX "LineaNomina_empleadoId_periodoId_key" ON "LineaNomina"("empleadoId", "periodoId");

-- CreateIndex
CREATE UNIQUE INDEX "CasoRegresion_codigo_key" ON "CasoRegresion"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "Aviso_empresaId_versionId_key" ON "Aviso"("empresaId", "versionId");

-- AddForeignKey
ALTER TABLE "Propuesta" ADD CONSTRAINT "Propuesta_normaId_fkey" FOREIGN KEY ("normaId") REFERENCES "Norma"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VersionMotor" ADD CONSTRAINT "VersionMotor_propuestaId_fkey" FOREIGN KEY ("propuestaId") REFERENCES "Propuesta"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Empleado" ADD CONSTRAINT "Empleado_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Periodo" ADD CONSTRAINT "Periodo_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LineaNomina" ADD CONSTRAINT "LineaNomina_empleadoId_fkey" FOREIGN KEY ("empleadoId") REFERENCES "Empleado"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LineaNomina" ADD CONSTRAINT "LineaNomina_periodoId_fkey" FOREIGN KEY ("periodoId") REFERENCES "Periodo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LineaNomina" ADD CONSTRAINT "LineaNomina_versionId_fkey" FOREIGN KEY ("versionId") REFERENCES "VersionMotor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CasoRegresion" ADD CONSTRAINT "CasoRegresion_empleadoId_fkey" FOREIGN KEY ("empleadoId") REFERENCES "Empleado"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CasoRegresion" ADD CONSTRAINT "CasoRegresion_periodoId_fkey" FOREIGN KEY ("periodoId") REFERENCES "Periodo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CorridaRegresion" ADD CONSTRAINT "CorridaRegresion_propuestaId_fkey" FOREIGN KEY ("propuestaId") REFERENCES "Propuesta"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Aviso" ADD CONSTRAINT "Aviso_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Aviso" ADD CONSTRAINT "Aviso_versionId_fkey" FOREIGN KEY ("versionId") REFERENCES "VersionMotor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
