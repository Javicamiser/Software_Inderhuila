-- Migration: Add missing columns to antecedentes tables
-- Add columns to alergias table
ALTER TABLE alergias ADD COLUMN IF NOT EXISTS descripcion TEXT;
ALTER TABLE alergias ADD COLUMN IF NOT EXISTS reaccion TEXT;

-- Add columns to medicaciones table
ALTER TABLE medicaciones ADD COLUMN IF NOT EXISTS duracion VARCHAR(100);
ALTER TABLE medicaciones ADD COLUMN IF NOT EXISTS indicacion TEXT;

-- Try to rename column (may fail if already renamed, that's OK)
-- ALTER TABLE medicaciones RENAME COLUMN nombre_medicacion TO nombre_medicamento;
