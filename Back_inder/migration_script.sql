-- ============================================================================
-- SCRIPT DE MIGRACIÓN - INDER BASE DE DATOS
-- Fecha: 2025-12-30
-- Propósito: Normalizar la estructura de la Historia Clínica
-- ============================================================================

-- PASO 1: Crear tablas para Antecedentes Médicos
-- ============================================================================

CREATE TABLE IF NOT EXISTS antecedentes_personales (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    historia_clinica_id UUID NOT NULL REFERENCES historias_clinicas(id) ON DELETE CASCADE,
    codigo_cie11 VARCHAR(10),
    nombre_enfermedad VARCHAR(255) NOT NULL,
    observaciones TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS antecedentes_familiares (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    historia_clinica_id UUID NOT NULL REFERENCES historias_clinicas(id) ON DELETE CASCADE,
    codigo_cie11 VARCHAR(10),
    nombre_enfermedad VARCHAR(255) NOT NULL,
    tipo_familiar VARCHAR(50), -- madre, padre, hermano, abuelo, etc.
    observaciones TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS lesiones_deportivas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    historia_clinica_id UUID NOT NULL REFERENCES historias_clinicas(id) ON DELETE CASCADE,
    descripcion TEXT NOT NULL,
    fecha_ultima_lesion DATE,
    observaciones TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS cirugias_previas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    historia_clinica_id UUID NOT NULL REFERENCES historias_clinicas(id) ON DELETE CASCADE,
    tipo_cirugia VARCHAR(255) NOT NULL,
    fecha_cirugia DATE,
    observaciones TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS alergias (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    historia_clinica_id UUID NOT NULL REFERENCES historias_clinicas(id) ON DELETE CASCADE,
    tipo_alergia VARCHAR(255) NOT NULL,
    observaciones TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS medicaciones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    historia_clinica_id UUID NOT NULL REFERENCES historias_clinicas(id) ON DELETE CASCADE,
    nombre_medicacion VARCHAR(255) NOT NULL,
    dosis VARCHAR(100),
    frecuencia VARCHAR(100),
    observaciones TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS vacunas_administradas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    historia_clinica_id UUID NOT NULL REFERENCES historias_clinicas(id) ON DELETE CASCADE,
    nombre_vacuna VARCHAR(255) NOT NULL,
    fecha_administracion DATE,
    observaciones TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- PASO 2: Crear tablas para Revisión y Exploración por Sistemas
-- ============================================================================

CREATE TABLE IF NOT EXISTS revision_sistemas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    historia_clinica_id UUID NOT NULL REFERENCES historias_clinicas(id) ON DELETE CASCADE,
    sistema_nombre VARCHAR(50) NOT NULL, -- cardiovascular, respiratorio, etc.
    estado VARCHAR(20) NOT NULL, -- normal, anormal
    observaciones TEXT,
    tipo_revision VARCHAR(50) DEFAULT 'revision', -- revision o exploracion
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- PASO 3: Crear tabla para Signos Vitales (Exploración Física)
-- ============================================================================

CREATE TABLE IF NOT EXISTS signos_vitales (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    historia_clinica_id UUID NOT NULL REFERENCES historias_clinicas(id) ON DELETE CASCADE,
    estatura_cm DECIMAL(5,2),
    peso_kg DECIMAL(5,2),
    frecuencia_cardiaca_lpm INT,
    presion_arterial_sistolica INT,
    presion_arterial_diastolica INT,
    frecuencia_respiratoria_rpm INT,
    temperatura_celsius DECIMAL(4,2),
    saturacion_oxigeno_percent DECIMAL(5,2),
    imc DECIMAL(5,2), -- Calculado: peso / (altura²)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- PASO 4: Crear tabla para Pruebas Complementarias
-- ============================================================================

CREATE TABLE IF NOT EXISTS pruebas_complementarias (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    historia_clinica_id UUID NOT NULL REFERENCES historias_clinicas(id) ON DELETE CASCADE,
    categoria VARCHAR(100) NOT NULL, -- Laboratorio, Imaging, Funcional, etc.
    nombre_prueba VARCHAR(255) NOT NULL,
    codigo_cups VARCHAR(10),
    resultado TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- PASO 5: Crear tabla para Diagnósticos
-- ============================================================================

CREATE TABLE IF NOT EXISTS diagnosticos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    historia_clinica_id UUID NOT NULL REFERENCES historias_clinicas(id) ON DELETE CASCADE,
    codigo_cie11 VARCHAR(10),
    nombre_enfermedad VARCHAR(255) NOT NULL,
    observaciones TEXT,
    analisis_objetivo TEXT,
    impresion_diagnostica TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- PASO 6: Crear tabla para Plan de Tratamiento
-- ============================================================================

CREATE TABLE IF NOT EXISTS plan_tratamiento (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    historia_clinica_id UUID NOT NULL REFERENCES historias_clinicas(id) ON DELETE CASCADE,
    indicaciones_medicas TEXT,
    recomendaciones_entrenamiento TEXT,
    plan_seguimiento TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- PASO 7: Crear tabla para Remisiones a Especialistas
-- ============================================================================

CREATE TABLE IF NOT EXISTS remisiones_especialistas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    historia_clinica_id UUID NOT NULL REFERENCES historias_clinicas(id) ON DELETE CASCADE,
    especialista VARCHAR(100) NOT NULL,
    motivo TEXT NOT NULL,
    prioridad VARCHAR(20) NOT NULL DEFAULT 'Normal', -- Normal, Urgente
    fecha_remision DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- PASO 8: Modificar tabla archivos_clinicos para vincular con pruebas
-- ============================================================================

ALTER TABLE archivos_clinicos 
ADD COLUMN IF NOT EXISTS prueba_complementaria_id UUID REFERENCES pruebas_complementarias(id) ON DELETE SET NULL;

-- ============================================================================
-- PASO 9: Crear índices para optimizar búsquedas
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_antecedentes_personales_historia ON antecedentes_personales(historia_clinica_id);
CREATE INDEX IF NOT EXISTS idx_antecedentes_familiares_historia ON antecedentes_familiares(historia_clinica_id);
CREATE INDEX IF NOT EXISTS idx_lesiones_deportivas_historia ON lesiones_deportivas(historia_clinica_id);
CREATE INDEX IF NOT EXISTS idx_cirugias_previas_historia ON cirugias_previas(historia_clinica_id);
CREATE INDEX IF NOT EXISTS idx_alergias_historia ON alergias(historia_clinica_id);
CREATE INDEX IF NOT EXISTS idx_medicaciones_historia ON medicaciones(historia_clinica_id);
CREATE INDEX IF NOT EXISTS idx_vacunas_historia ON vacunas_administradas(historia_clinica_id);
CREATE INDEX IF NOT EXISTS idx_revision_sistemas_historia ON revision_sistemas(historia_clinica_id);
CREATE INDEX IF NOT EXISTS idx_signos_vitales_historia ON signos_vitales(historia_clinica_id);
CREATE INDEX IF NOT EXISTS idx_pruebas_complementarias_historia ON pruebas_complementarias(historia_clinica_id);
CREATE INDEX IF NOT EXISTS idx_diagnosticos_historia ON diagnosticos(historia_clinica_id);
CREATE INDEX IF NOT EXISTS idx_plan_tratamiento_historia ON plan_tratamiento(historia_clinica_id);
CREATE INDEX IF NOT EXISTS idx_remisiones_especialistas_historia ON remisiones_especialistas(historia_clinica_id);

-- Índices por código
CREATE INDEX IF NOT EXISTS idx_antecedentes_personales_cie11 ON antecedentes_personales(codigo_cie11);
CREATE INDEX IF NOT EXISTS idx_antecedentes_familiares_cie11 ON antecedentes_familiares(codigo_cie11);
CREATE INDEX IF NOT EXISTS idx_diagnosticos_cie11 ON diagnosticos(codigo_cie11);
CREATE INDEX IF NOT EXISTS idx_pruebas_complementarias_cups ON pruebas_complementarias(codigo_cups);

-- ============================================================================
-- PASO 10: Ver estructura final
-- ============================================================================

-- Para verificar que todas las tablas fueron creadas, ejecutar:
-- SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;

-- ============================================================================
-- NOTAS IMPORTANTES
-- ============================================================================
/*
1. Las tablas incluyen ON DELETE CASCADE para asegurar integridad referencial
2. Se han creado índices en las columnas más consultadas
3. Todas las tablas tienen campos created_at para auditoría
4. La tabla historias_clinicas_json sigue siendo un respaldo
5. Se recomienda migrar datos históricos desde el JSON a las nuevas tablas

PRÓXIMAS ACCIONES:
- Actualizar los modelos Python/SQLAlchemy
- Actualizar los endpoints FastAPI
- Migrar datos históricos (si existen)
- Actualizar el frontend para usar las nuevas tablas
*/
