-- Script de migración para crear catálogos de citas
-- Ejecutar en: psql -U postgres -d Inder -f migrations/002_create_citas_catalogos.sql

-- ===================================================================
-- 1. CREAR CATÁLOGOS PARA TIPOS DE CITA
-- ===================================================================

-- Primero verificar si el catálogo ya existe
DO $$
DECLARE
    catalogo_id UUID;
BEGIN
    -- Crear catálogo de "Tipos de Cita"
    INSERT INTO catalogos (nombre, descripcion)
    VALUES ('Tipos de Cita', 'Tipos de citas médicas para deportistas')
    ON CONFLICT (nombre) DO NOTHING
    RETURNING id INTO catalogo_id;
    
    -- Si no se retorna ID, buscarlo
    IF catalogo_id IS NULL THEN
        SELECT id INTO catalogo_id FROM catalogos WHERE nombre = 'Tipos de Cita';
    END IF;
    
    -- Insertar items del catálogo
    INSERT INTO catalogo_items (catalogo_id, codigo, nombre, activo)
    VALUES 
        (catalogo_id, 'primera_cita', 'Primera Cita', true),
        (catalogo_id, 'control', 'Control', true),
        (catalogo_id, 'novedad', 'Novedad', true),
        (catalogo_id, 'seguimiento', 'Seguimiento', true),
        (catalogo_id, 'evaluacion', 'Evaluación Inicial', true)
    ON CONFLICT DO NOTHING;
END $$;

-- ===================================================================
-- 2. CREAR CATÁLOGOS PARA ESTADOS DE CITA
-- ===================================================================

DO $$
DECLARE
    catalogo_id UUID;
BEGIN
    -- Crear catálogo de "Estados de Cita"
    INSERT INTO catalogos (nombre, descripcion)
    VALUES ('Estados de Cita', 'Estados posibles de una cita médica')
    ON CONFLICT (nombre) DO NOTHING
    RETURNING id INTO catalogo_id;
    
    -- Si no se retorna ID, buscarlo
    IF catalogo_id IS NULL THEN
        SELECT id INTO catalogo_id FROM catalogos WHERE nombre = 'Estados de Cita';
    END IF;
    
    -- Insertar items del catálogo
    INSERT INTO catalogo_items (catalogo_id, codigo, nombre, activo)
    VALUES 
        (catalogo_id, 'programada', 'Programada', true),
        (catalogo_id, 'confirmada', 'Confirmada', true),
        (catalogo_id, 'realizada', 'Realizada', true),
        (catalogo_id, 'cancelada', 'Cancelada', true),
        (catalogo_id, 'no_asistio', 'No Asistió', true),
        (catalogo_id, 'reprogramada', 'Reprogramada', true)
    ON CONFLICT DO NOTHING;
END $$;

-- ===================================================================
-- 3. VERIFICAR QUE LOS DATOS FUERON CREADOS
-- ===================================================================

SELECT 'Tipos de Cita' as catalogo_nombre, 
       COUNT(*) as total_items
FROM catalogo_items ci
JOIN catalogos c ON ci.catalogo_id = c.id
WHERE c.nombre = 'Tipos de Cita'
GROUP BY c.nombre;

SELECT 'Estados de Cita' as catalogo_nombre, 
       COUNT(*) as total_items
FROM catalogo_items ci
JOIN catalogos c ON ci.catalogo_id = c.id
WHERE c.nombre = 'Estados de Cita'
GROUP BY c.nombre;

-- Mostrar todos los items
SELECT c.nombre as catalogo, ci.codigo, ci.nombre, ci.activo
FROM catalogo_items ci
JOIN catalogos c ON ci.catalogo_id = c.id
WHERE c.nombre IN ('Tipos de Cita', 'Estados de Cita')
ORDER BY c.nombre, ci.nombre;
