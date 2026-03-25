from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
import logging

from app.core.config import settings
from app.core.database import Base, engine

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

from app.models import *

from app.api.v1 import deportistas, historias, citas, archivos, cie11, cups, catalogos, antecedentes, documentos
from app.api.v1.descarga_segura import router as descarga_segura_router

app = FastAPI(
    title=settings.APP_NAME,
    version="0.1.0",
    description="Backend Historia Clinica Deportiva - INDER"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request, exc):
    print(f"DEBUG: Validation error details: {exc.errors()}")
    logger.error(f"Validation error: {exc.errors()}")
    return JSONResponse(
        status_code=422,
        content={"detail": exc.errors(), "body": exc.body if hasattr(exc, 'body') else None}
    )

@app.on_event("startup")
def startup_event():
    try:
        logger.info("Intentando crear tablas en la BD...")
        Base.metadata.create_all(bind=engine)
        logger.info("Tablas creadas exitosamente")
    except Exception as e:
        logger.warning(f"No se pudieron crear las tablas: {str(e)}")

@app.get("/health", tags=["Health"])
def health_check():
    return {"status": "ok", "app": settings.APP_NAME, "environment": settings.APP_ENV}


app.include_router(deportistas.router, prefix="/api/v1/deportistas")
app.include_router(historias.router, prefix="/api/v1/historias_clinicas")
app.include_router(citas.router, prefix="/api/v1/citas")
app.include_router(archivos.router, prefix="/api/v1/archivos")
app.include_router(cie11.router, prefix="/api/v1/cie11")
app.include_router(cups.router, prefix="/api/v1/cups")
app.include_router(catalogos.router, prefix="/api/v1/catalogos")
app.include_router(antecedentes.router, prefix="/api/v1")
app.include_router(documentos.router, prefix="/api/v1")
app.include_router(descarga_segura_router, prefix="/api/v1")