from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
import logging

from app.core.config import settings
from app.core.database import Base, engine
from app.core.auth_middleware import auth_middleware

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

from app.models import *

from app.api.v1 import deportistas, historias, citas, archivos, cie11, cups, catalogos, antecedentes, documentos
from app.api.v1 import perfil as perfil_router
from app.api.v1.descarga_segura import router as descarga_segura_router
from app.api.v1.auth import router as auth_router

app = FastAPI(
    title=settings.APP_NAME,
    version="0.1.0",
    description="Backend Historia Clinica Deportiva - INDERHUILA",
)

# ── MIDDLEWARE JWT ────────────────────────────────────────────
# Se agrega PRIMERO para que se ejecute DESPUÉS de CORS
app.add_middleware(BaseHTTPMiddleware, dispatch=auth_middleware)

# ── CORS ──────────────────────────────────────────────────────
# Se agrega DESPUÉS para que se ejecute PRIMERO (intercepta preflight)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── MANEJO DE ERRORES ─────────────────────────────────────────
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request, exc):
    logger.error(f"Validation error: {exc.errors()}")
    return JSONResponse(
        status_code=422,
        content={"detail": exc.errors()}
    )

# ── STARTUP ───────────────────────────────────────────────────
@app.on_event("startup")
def startup_event():
    try:
        logger.info("Creando tablas en la BD...")
        Base.metadata.create_all(bind=engine)
        logger.info("Tablas OK")
    except Exception as e:
        logger.warning(f"No se pudieron crear las tablas: {str(e)}")

# ── HEALTH CHECK ──────────────────────────────────────────────
@app.get("/health", tags=["Health"])
def health_check():
    return {"status": "ok", "app": settings.APP_NAME}

# ── ROUTERS ───────────────────────────────────────────────────
app.include_router(auth_router,              prefix="/api/v1")
app.include_router(deportistas.router,       prefix="/api/v1/deportistas")
app.include_router(historias.router,         prefix="/api/v1/historias_clinicas")
app.include_router(citas.router,             prefix="/api/v1/citas")
app.include_router(archivos.router,          prefix="/api/v1/archivos")
app.include_router(cie11.router,             prefix="/api/v1/cie11")
app.include_router(cups.router,              prefix="/api/v1/cups")
app.include_router(catalogos.router,         prefix="/api/v1/catalogos")
app.include_router(antecedentes.router,      prefix="/api/v1")
app.include_router(documentos.router,        prefix="/api/v1")
app.include_router(descarga_segura_router,   prefix="/api/v1")
app.include_router(perfil_router.router,       prefix="/api/v1/perfil")