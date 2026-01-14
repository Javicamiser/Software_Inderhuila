import os
from urllib.parse import quote_plus
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy.pool import NullPool
from dotenv import load_dotenv

load_dotenv()

# Obtener variables de entorno
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = os.getenv("DB_PORT", "5432")
DB_NAME = os.getenv("DB_NAME", "Inder")
DB_USER = os.getenv("DB_USER", "postgres")
DB_PASSWORD = os.getenv("DB_PASSWORD", "1234")

# Codificar la contraseña correctamente
try:
    encoded_password = quote_plus(str(DB_PASSWORD))
except Exception as e:
    print(f"Error codificando password: {e}")
    encoded_password = DB_PASSWORD

# Construir URL de conexión
DATABASE_URL = f"postgresql://{DB_USER}:{encoded_password}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

print(f"[DB] Conectando a: postgresql://{DB_USER}:***@{DB_HOST}:{DB_PORT}/{DB_NAME}")

try:
    # Crear engine con configuración robusta
    engine = create_engine(
        DATABASE_URL,
        echo=False,
        pool_pre_ping=True,
        pool_recycle=3600,
        connect_args={
            "connect_timeout": 10,
            "options": "-c statement_timeout=30000"
        }
    )
    print("[DB] Engine creado exitosamente")
except Exception as e:
    print(f"[DB] Error creando engine: {e}")
    raise

# Session factory
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

# Base para los modelos
Base = declarative_base()

def get_db():
    """
    Dependency para obtener la sesión de base de datos.
    Se usa con FastAPI Depends().
    """
    db = SessionLocal()
    try:
        yield db
    except Exception as e:
        print(f"[DB] Error en sesión: {e}")
        db.rollback()
        raise
    finally:
        db.close()