"""
MIGRACIÓN: Crear tabla historias_clinicas_json

Ejecutar en PostgreSQL:

CREATE TABLE IF NOT EXISTS historias_clinicas_json (
    id VARCHAR(36) PRIMARY KEY,
    historia_clinica_id VARCHAR(36) NOT NULL,
    deportista_id VARCHAR(36) NOT NULL,
    datos_completos JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (historia_clinica_id) REFERENCES historias_clinicas(id),
    FOREIGN KEY (deportista_id) REFERENCES deportistas(id)
);

CREATE INDEX idx_historia_clinica_json_historia_id ON historias_clinicas_json(historia_clinica_id);
CREATE INDEX idx_historia_clinica_json_deportista_id ON historias_clinicas_json(deportista_id);
"""
