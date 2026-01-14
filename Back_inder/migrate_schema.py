#!/usr/bin/env python
"""Direct database schema migration using psycopg2"""
import psycopg2
import os
from dotenv import load_dotenv
from urllib.parse import quote_plus

# Load environment variables
load_dotenv()

try:
    # Build connection string from environment variables
    db_host = os.getenv('DB_HOST', 'localhost')
    db_port = os.getenv('DB_PORT', '5432')
    db_name = os.getenv('DB_NAME')
    db_user = os.getenv('DB_USER')
    db_password = os.getenv('DB_PASSWORD')
    
    db_url = f"postgresql://{db_user}:{db_password}@{db_host}:{db_port}/{db_name}"
    
    print("Conectando a la base de datos...")
    conn = psycopg2.connect(db_url)
    cursor = conn.cursor()
    
    commands = [
        # Fix alergias table
        "ALTER TABLE alergias ADD COLUMN IF NOT EXISTS descripcion TEXT;",
        "ALTER TABLE alergias ADD COLUMN IF NOT EXISTS reaccion TEXT;",
        
        # Fix medicaciones table
        "ALTER TABLE medicaciones DROP COLUMN IF EXISTS nombre_medicacion;",
        "ALTER TABLE medicaciones ADD COLUMN IF NOT EXISTS nombre_medicamento VARCHAR(255);",
        "ALTER TABLE medicaciones ADD COLUMN IF NOT EXISTS duracion VARCHAR(100);",
        "ALTER TABLE medicaciones ADD COLUMN IF NOT EXISTS indicacion TEXT;",
        
        # Fix lesiones_deportivas table - remove old columns, add new ones
        "ALTER TABLE lesiones_deportivas DROP COLUMN IF EXISTS descripcion;",
        "ALTER TABLE lesiones_deportivas DROP COLUMN IF EXISTS fecha_ultima_lesion;",
        "ALTER TABLE lesiones_deportivas ADD COLUMN IF NOT EXISTS tipo_lesion VARCHAR(255);",
        "ALTER TABLE lesiones_deportivas ADD COLUMN IF NOT EXISTS fecha_lesion DATE;",
        "ALTER TABLE lesiones_deportivas ADD COLUMN IF NOT EXISTS tratamiento TEXT;",
    ]
    
    for cmd in commands:
        try:
            cursor.execute(cmd)
            print(f"OK: {cmd.strip()}")
        except Exception as e:
            print(f"AVISO: {cmd.strip()}")
            print(f"  Detalles: {str(e)}")
    
    conn.commit()
    cursor.close()
    conn.close()
    
    print("\nMigracion completada correctamente!")
    
except Exception as e:
    print(f"Error conectando a la BD: {str(e)}")
    print(f"Host: {os.getenv('DB_HOST')}")
    print(f"Puerto: {os.getenv('DB_PORT')}")
    print(f"BD: {os.getenv('DB_NAME')}")
