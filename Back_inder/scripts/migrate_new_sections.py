#!/usr/bin/env python3
"""
Script para agregar las nuevas tablas de Motivo de Consulta/Enfermedad Actual 
y Exploración Física por Sistemas
"""

import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT
import os
from dotenv import load_dotenv

load_dotenv()

# Configuración de la base de datos
DB_USER = os.getenv("DB_USER", "postgres")
DB_PASSWORD = os.getenv("DB_PASSWORD", "")
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = os.getenv("DB_PORT", "5432")
DB_NAME = os.getenv("DB_NAME", "inder_db")

def execute_migration():
    """Ejecuta la migración de schema"""
    
    try:
        # Conectar a PostgreSQL
        conn = psycopg2.connect(
            user=DB_USER,
            password=DB_PASSWORD,
            host=DB_HOST,
            port=DB_PORT,
            database=DB_NAME
        )
        conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
        cursor = conn.cursor()
        
        print("[OK] Conectado a la base de datos")
        
        # 1. Crear tabla motivo_consulta_enfermedad_actual
        create_motivo_consulta_sql = """
        CREATE TABLE IF NOT EXISTS motivo_consulta_enfermedad_actual (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            historia_clinica_id UUID NOT NULL,
            motivo_consulta TEXT NOT NULL,
            sintomas_principales TEXT,
            duracion_sintomas VARCHAR(100),
            inicio_enfermedad TEXT,
            evolucion TEXT,
            factor_desencadenante TEXT,
            medicamentos_previos TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (historia_clinica_id) REFERENCES historias_clinicas(id) ON DELETE CASCADE
        );
        """
        cursor.execute(create_motivo_consulta_sql)
        print("[OK] Tabla 'motivo_consulta_enfermedad_actual' creada")
        
        # 2. Crear tabla exploracion_fisica_sistemas
        create_exploracion_sql = """
        CREATE TABLE IF NOT EXISTS exploracion_fisica_sistemas (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            historia_clinica_id UUID NOT NULL,
            sistema_cardiovascular TEXT,
            sistema_respiratorio TEXT,
            sistema_digestivo TEXT,
            sistema_neurologico TEXT,
            sistema_genitourinario TEXT,
            sistema_musculoesqueletico TEXT,
            sistema_integumentario TEXT,
            sistema_endocrino TEXT,
            cabeza_cuello TEXT,
            extremidades TEXT,
            observaciones_generales TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (historia_clinica_id) REFERENCES historias_clinicas(id) ON DELETE CASCADE
        );
        """
        cursor.execute(create_exploracion_sql)
        print("[OK] Tabla 'exploracion_fisica_sistemas' creada")
        
        # 3. Crear índices para mejorar queries
        cursor.execute("""
        CREATE INDEX IF NOT EXISTS idx_motivo_consulta_historia 
        ON motivo_consulta_enfermedad_actual(historia_clinica_id);
        """)
        print("[OK] Indice en 'motivo_consulta_enfermedad_actual' creado")
        
        cursor.execute("""
        CREATE INDEX IF NOT EXISTS idx_exploracion_fisica_historia 
        ON exploracion_fisica_sistemas(historia_clinica_id);
        """)
        print("[OK] Indice en 'exploracion_fisica_sistemas' creado")
        
        conn.commit()
        print("")
        print("[SUCCESS] Migracion completada exitosamente")
        cursor.close()
        conn.close()
        
    except psycopg2.Error as e:
        print(f"[ERROR] Error en la migracion: {e}")
        exit(1)
    except Exception as e:
        print(f"[ERROR] Error inesperado: {e}")
        exit(1)

if __name__ == "__main__":
    print("[START] Iniciando migracion de nuevas secciones de Historia Clinica...")
    execute_migration()
