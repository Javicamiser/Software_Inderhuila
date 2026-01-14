#!/usr/bin/env python
"""
Script para ejecutar la migración de la BD
"""
from sqlalchemy import text
from app.core.database import engine

# Leer el script SQL
with open('migration_script.sql', 'r', encoding='utf-8') as f:
    sql_script = f.read()

# Ejecutar cada sentencia SQL
with engine.begin() as conn:
    # Dividir por sentencias (;)
    statements = [s.strip() for s in sql_script.split(';') if s.strip() and not s.strip().startswith('--')]
    
    for i, statement in enumerate(statements, 1):
        try:
            conn.execute(text(statement))
            print(f"✅ Sentencia {i}/{len(statements)}: OK")
        except Exception as e:
            error_msg = str(e)[:150]
            if 'already exists' in error_msg.lower():
                print(f"ℹ️  Sentencia {i}/{len(statements)}: Ya existe (skipped)")
            else:
                print(f"⚠️  Sentencia {i}/{len(statements)}: {error_msg}")

print("\n🎉 Script SQL ejecutado!")
