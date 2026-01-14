#!/usr/bin/env python
"""
Script para completar la migración - agregar tablas faltantes
"""
from sqlalchemy import text
from app.core.database import engine

sql_statements = [
    # Tabla faltante: antecedentes_personales
    """CREATE TABLE IF NOT EXISTS antecedentes_personales (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        historia_clinica_id UUID NOT NULL REFERENCES historias_clinicas(id) ON DELETE CASCADE,
        codigo_cie11 VARCHAR(10),
        nombre_enfermedad VARCHAR(255) NOT NULL,
        observaciones TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )""",
    
    # Tabla faltante: revision_sistemas
    """CREATE TABLE IF NOT EXISTS revision_sistemas (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        historia_clinica_id UUID NOT NULL REFERENCES historias_clinicas(id) ON DELETE CASCADE,
        sistema_nombre VARCHAR(50) NOT NULL,
        estado VARCHAR(20) NOT NULL,
        observaciones TEXT,
        tipo_revision VARCHAR(50) DEFAULT 'revision',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )""",
    
    # Tabla faltante: signos_vitales
    """CREATE TABLE IF NOT EXISTS signos_vitales (
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
        imc DECIMAL(5,2),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )""",
    
    # Tabla faltante: pruebas_complementarias
    """CREATE TABLE IF NOT EXISTS pruebas_complementarias (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        historia_clinica_id UUID NOT NULL REFERENCES historias_clinicas(id) ON DELETE CASCADE,
        categoria VARCHAR(100) NOT NULL,
        nombre_prueba VARCHAR(255) NOT NULL,
        codigo_cups VARCHAR(10),
        resultado TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )""",
    
    # Tabla faltante: diagnosticos
    """CREATE TABLE IF NOT EXISTS diagnosticos (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        historia_clinica_id UUID NOT NULL REFERENCES historias_clinicas(id) ON DELETE CASCADE,
        codigo_cie11 VARCHAR(10),
        nombre_enfermedad VARCHAR(255) NOT NULL,
        observaciones TEXT,
        analisis_objetivo TEXT,
        impresion_diagnostica TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )""",
    
    # Tabla faltante: plan_tratamiento
    """CREATE TABLE IF NOT EXISTS plan_tratamiento (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        historia_clinica_id UUID NOT NULL REFERENCES historias_clinicas(id) ON DELETE CASCADE,
        indicaciones_medicas TEXT,
        recomendaciones_entrenamiento TEXT,
        plan_seguimiento TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )""",
    
    # Tabla faltante: remisiones_especialistas
    """CREATE TABLE IF NOT EXISTS remisiones_especialistas (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        historia_clinica_id UUID NOT NULL REFERENCES historias_clinicas(id) ON DELETE CASCADE,
        especialista VARCHAR(100) NOT NULL,
        motivo TEXT NOT NULL,
        prioridad VARCHAR(20) NOT NULL DEFAULT 'Normal',
        fecha_remision DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )""",
    
    # Modificar archivos_clinicos
    """ALTER TABLE archivos_clinicos 
    ADD COLUMN IF NOT EXISTS prueba_complementaria_id UUID REFERENCES pruebas_complementarias(id) ON DELETE SET NULL""",
    
    # Crear índices
    """CREATE INDEX IF NOT EXISTS idx_antecedentes_personales_historia ON antecedentes_personales(historia_clinica_id)""",
    """CREATE INDEX IF NOT EXISTS idx_antecedentes_personales_cie11 ON antecedentes_personales(codigo_cie11)""",
]

with engine.begin() as conn:
    for i, statement in enumerate(sql_statements, 1):
        try:
            conn.execute(text(statement))
            print(f"✅ Sentencia {i}/{len(sql_statements)}: OK")
        except Exception as e:
            error_msg = str(e)[:100]
            print(f"⚠️  Sentencia {i}/{len(sql_statements)}: {error_msg}")

print("\n✅ Todas las tablas faltantes han sido creadas!")
