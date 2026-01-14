from sqlalchemy import text
from app.core.database import engine

sql = """
ALTER TABLE deportistas 
ADD COLUMN IF NOT EXISTS tipo_deporte VARCHAR(100) NULL;
"""

from sqlalchemy import event

with engine.begin() as conn:
    conn.execute(text(sql))
    print("✅ Columna tipo_deporte agregada exitosamente a la tabla deportistas")
