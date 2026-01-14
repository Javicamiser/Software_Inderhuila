from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File
from sqlalchemy.orm import Session
from sqlalchemy import or_
from uuid import UUID
import os
from datetime import datetime
from app.core.dependencies import get_db
from app.schemas.deportista import DeportistaCreate, DeportistaUpdate, DeportistaResponse
from app.schemas.antecedentes import (
    VacunaDeportistaCreate,
    VacunaDeportistaResponse,
    VacunaDeportistaListResponse,
)
from app.crud.deportista import (
    crear_deportista, 
    listar_deportistas, 
    obtener_deportista, 
    eliminar_deportista, 
    actualizar_deportista
)
from app.crud.antecedentes import (
    crear_vacuna_deportista,
    obtener_vacunas_deportista,
    obtener_vacuna_por_id,
    actualizar_vacuna,
    eliminar_vacuna,
    actualizar_archivo_vacuna,
)
from app.models.deportista import Deportista
from fastapi.responses import FileResponse

router = APIRouter()

# Configuración de almacenamiento de archivos
UPLOAD_DIR = "uploads/vacunas"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# ============================================================================
# ENDPOINTS DE DEPORTISTAS - SIN PARÁMETROS
# ============================================================================

@router.post("", response_model=DeportistaResponse)
def crear(data: DeportistaCreate, db: Session = Depends(get_db)):
    """Crear un nuevo deportista"""
    try:
        # Debug: log the incoming data
        print(f"DEBUG: Datos recibidos en POST deportistas: {data.dict()}")
        print(f"DEBUG: Tipos de datos: tipo_documento_id={type(data.tipo_documento_id).__name__}, sexo_id={type(data.sexo_id).__name__}, estado_id={type(data.estado_id).__name__}")
        return crear_deportista(db, data)
    except ValueError as e:
        print(f"DEBUG: ValueError en crear_deportista: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        print(f"DEBUG: Exception en crear_deportista: {type(e).__name__}: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error al crear deportista: {str(e)}")

@router.get("", response_model=list[DeportistaResponse])
def listar(db: Session = Depends(get_db)):
    """Listar todos los deportistas"""
    return listar_deportistas(db)

@router.get("/search", response_model=list[DeportistaResponse])
def buscar(q: str = Query(...), db: Session = Depends(get_db)):
    """Buscar deportistas por nombre, apellido o documento"""
    q = q.strip()
    if not q or len(q) < 2:
        raise HTTPException(status_code=400, detail="El término de búsqueda debe tener al menos 2 caracteres")
    
    resultados = db.query(Deportista).filter(
        or_(
            Deportista.nombres.ilike(f"%{q}%"),
            Deportista.apellidos.ilike(f"%{q}%"),
            Deportista.numero_documento.ilike(f"%{q}%")
        )
    ).limit(10).all()
    
    return resultados

# ============================================================================
# ENDPOINTS DE VACUNAS POR DEPORTISTA - RUTAS ESPECÍFICAS
# ============================================================================
# IMPORTANTE: Estas rutas deben venir ANTES de las rutas con {deportista_id}
# porque FastAPI evalúa en orden y /vacunas podría interpretarse como un ID

@router.get("/{deportista_id}/vacunas", response_model=list[VacunaDeportistaListResponse])
def listar_vacunas(deportista_id: str, db: Session = Depends(get_db)):
    """
    Obtener todas las vacunas de un deportista
    
    GET /api/v1/deportistas/{deportista_id}/vacunas
    """
    # Verificar que el deportista existe
    deportista = db.query(Deportista).filter(Deportista.id == deportista_id).first()
    if not deportista:
        raise HTTPException(status_code=404, detail="Deportista no encontrado")
    
    vacunas = obtener_vacunas_deportista(db, deportista_id)
    return vacunas


@router.post("/{deportista_id}/vacunas", response_model=VacunaDeportistaResponse)
def crear_vacuna(
    deportista_id: str,
    data: VacunaDeportistaCreate,
    db: Session = Depends(get_db),
):
    """
    Crear una nueva vacuna para un deportista
    
    POST /api/v1/deportistas/{deportista_id}/vacunas
    {
        "nombre_vacuna": "Tétanos",
        "fecha_administracion": "2024-01-15",
        "observaciones": "Lote XYZ"
    }
    """
    # Verificar que el deportista existe
    deportista = db.query(Deportista).filter(Deportista.id == deportista_id).first()
    if not deportista:
        raise HTTPException(status_code=404, detail="Deportista no encontrado")
    
    try:
        vacuna = crear_vacuna_deportista(db, deportista_id, data)
        return vacuna
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al crear vacuna: {str(e)}")


@router.post("/{deportista_id}/vacunas/{vacuna_id}/archivo")
def cargar_archivo_vacuna(
    deportista_id: str,
    vacuna_id: str,
    archivo: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    """
    Cargar un archivo para una vacuna (certificado, carnet, etc)
    
    POST /api/v1/deportistas/{deportista_id}/vacunas/{vacuna_id}/archivo
    Body: multipart/form-data con archivo
    """
    # Verificar que la vacuna existe
    vacuna = obtener_vacuna_por_id(db, vacuna_id)
    if not vacuna or str(vacuna.deportista_id) != deportista_id:
        raise HTTPException(status_code=404, detail="Vacuna no encontrada")
    
    # Validar tipo de archivo
    tipos_permitidos = ["application/pdf", "image/jpeg", "image/png", "image/jpg"]
    if archivo.content_type not in tipos_permitidos:
        raise HTTPException(
            status_code=400,
            detail="Solo se permiten archivos PDF, JPG o PNG",
        )
    
    try:
        # Crear directorio si no existe
        dir_vacunas = f"{UPLOAD_DIR}/{deportista_id}"
        os.makedirs(dir_vacunas, exist_ok=True)
        
        # Guardar archivo
        timestamp = datetime.utcnow().strftime("%Y%m%d%H%M%S")
        extension = archivo.filename.split(".")[-1] if archivo.filename else "pdf"
        nombre_archivo = f"{timestamp}_{vacuna_id}.{extension}"
        ruta_archivo = f"{dir_vacunas}/{nombre_archivo}"
        
        with open(ruta_archivo, "wb") as f:
            contenido = archivo.file.read()
            f.write(contenido)
        
        # Actualizar vacuna con información del archivo
        actualizar_archivo_vacuna(
            db,
            vacuna_id,
            ruta_archivo,
            archivo.filename,
            archivo.content_type,
        )
        
        return {
            "success": True,
            "message": "Archivo cargado correctamente",
            "archivo": archivo.filename,
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al cargar archivo: {str(e)}")


@router.get("/{deportista_id}/vacunas/{vacuna_id}/archivo")
def descargar_archivo_vacuna(
    deportista_id: str,
    vacuna_id: str,
    db: Session = Depends(get_db),
):
    """
    Descargar archivo de una vacuna
    
    GET /api/v1/deportistas/{deportista_id}/vacunas/{vacuna_id}/archivo
    """
    # Verificar que la vacuna existe
    vacuna = obtener_vacuna_por_id(db, vacuna_id)
    if not vacuna or str(vacuna.deportista_id) != deportista_id:
        raise HTTPException(status_code=404, detail="Vacuna no encontrada")
    
    # Verificar que tiene archivo
    if not vacuna.ruta_archivo or not os.path.exists(vacuna.ruta_archivo):
        raise HTTPException(status_code=404, detail="Archivo no encontrado")
    
    return FileResponse(
        path=vacuna.ruta_archivo,
        filename=vacuna.nombre_archivo,
        media_type=vacuna.tipo_archivo,
    )


@router.put("/{deportista_id}/vacunas/{vacuna_id}", response_model=VacunaDeportistaResponse)
def actualizar_vacuna_endpoint(
    deportista_id: str,
    vacuna_id: str,
    data: VacunaDeportistaCreate,
    db: Session = Depends(get_db),
):
    """
    Actualizar información de una vacuna
    
    PUT /api/v1/deportistas/{deportista_id}/vacunas/{vacuna_id}
    """
    # Verificar que la vacuna existe
    vacuna = obtener_vacuna_por_id(db, vacuna_id)
    if not vacuna or str(vacuna.deportista_id) != deportista_id:
        raise HTTPException(status_code=404, detail="Vacuna no encontrada")
    
    try:
        vacuna_actualizada = actualizar_vacuna(db, vacuna_id, data)
        return vacuna_actualizada
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al actualizar vacuna: {str(e)}")


@router.delete("/{deportista_id}/vacunas/{vacuna_id}")
def eliminar_vacuna_endpoint(
    deportista_id: str,
    vacuna_id: str,
    eliminar_archivo: bool = True,
    db: Session = Depends(get_db),
):
    """
    Eliminar una vacuna
    
    DELETE /api/v1/deportistas/{deportista_id}/vacunas/{vacuna_id}
    ?eliminar_archivo=true
    """
    # Verificar que la vacuna existe
    vacuna = obtener_vacuna_por_id(db, vacuna_id)
    if not vacuna or str(vacuna.deportista_id) != deportista_id:
        raise HTTPException(status_code=404, detail="Vacuna no encontrada")
    
    try:
        eliminar_vacuna(db, vacuna_id, eliminar_archivo)
        return {
            "success": True,
            "message": "Vacuna eliminada correctamente",
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al eliminar vacuna: {str(e)}")

# ============================================================================
# ENDPOINTS DE DEPORTISTAS - CON PARÁMETRO (DEBEN IR AL FINAL)
# ============================================================================

@router.get("/{deportista_id}", response_model=DeportistaResponse)
def obtener(deportista_id: str, db: Session = Depends(get_db)):
    """Obtener un deportista por ID"""
    deportista = obtener_deportista(db, deportista_id)
    if not deportista:
        raise HTTPException(status_code=404, detail="Deportista no encontrado")
    return deportista

@router.put("/{deportista_id}", response_model=DeportistaResponse)
def actualizar(deportista_id: str, data: DeportistaUpdate, db: Session = Depends(get_db)):
    """Actualizar un deportista existente"""
    try:
        deportista = actualizar_deportista(db, deportista_id, data)
        if not deportista:
            raise HTTPException(status_code=404, detail="Deportista no encontrado")
        return deportista
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Error al actualizar deportista")

@router.delete("/{deportista_id}", status_code=204)
def eliminar(deportista_id: str, db: Session = Depends(get_db)):
    """Eliminar un deportista por ID"""
    success = eliminar_deportista(db, deportista_id)
    if not success:
        raise HTTPException(status_code=404, detail="Deportista no encontrado")