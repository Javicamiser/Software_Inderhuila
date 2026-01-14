from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.schemas.cita import CitaCreate, CitaUpdate, CitaResponse
from app.schemas.deportista import DeportistaResponse
from app.models.deportista import Deportista
from app.crud.cita import (
    crear_cita,
    listar_citas,
    listar_citas_por_deportista,
    obtener_cita,
    actualizar_cita,
    eliminar_cita,
    obtener_deportistas_con_citas_hoy,
)

router = APIRouter(tags=["citas"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# RUTAS ESPECÍFICAS PRIMERO (antes de las rutas con parámetros)

@router.get("/deportistas-con-citas-hoy")
def deportistas_con_citas_hoy(db: Session = Depends(get_db)):
    """Obtener deportistas que tienen citas agendadas para hoy con información de las citas"""
    try:
        from datetime import date
        from app.models.cita import Cita
        
        hoy = date.today()
        
        # Obtener deportistas con sus citas para hoy
        deportistas_con_citas = db.query(Deportista, Cita).join(
            Cita, Cita.deportista_id == Deportista.id
        ).filter(
            Cita.fecha == hoy
        ).all()
        
        resultado = []
        for d, cita in deportistas_con_citas:
            dep_dict = {
                "id": str(d.id),
                "tipo_documento_id": str(d.tipo_documento_id),
                "numero_documento": d.numero_documento,
                "nombres": d.nombres,
                "apellidos": d.apellidos,
                "fecha_nacimiento": d.fecha_nacimiento.isoformat() if d.fecha_nacimiento else None,
                "sexo_id": str(d.sexo_id) if d.sexo_id else None,
                "telefono": d.telefono,
                "email": d.email,
                "direccion": d.direccion,
                "tipo_deporte": d.tipo_deporte,
                "estado_id": str(d.estado_id),
                "created_at": d.created_at.isoformat() if d.created_at else None,
                # Información de la cita
                "cita_hora": cita.hora if cita.hora else None,
                "cita_tipo": cita.tipo_cita.nombre if cita.tipo_cita else "No especificado",
                "cita_deporte": d.tipo_deporte if d.tipo_deporte else "No especificado",
                "cita_estado": cita.estado_cita.nombre if cita.estado_cita else "Pendiente",
            }
            resultado.append(dep_dict)
        
        return resultado
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error al obtener deportistas: {str(e)}")

@router.post("/", response_model=CitaResponse, status_code=201)
def crear(data: CitaCreate, db: Session = Depends(get_db)):
    """Crear una nueva cita"""
    try:
        return crear_cita(db, data)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error al crear cita: {str(e)}")

@router.get("/", response_model=list[CitaResponse])
def listar(page: int = 1, page_size: int = 10, db: Session = Depends(get_db)):
    """Listar todas las citas"""
    skip = (page - 1) * page_size
    return listar_citas(db, skip, page_size)

# RUTAS CON PARÁMETROS

@router.get("/deportista/{deportista_id}", response_model=list[CitaResponse])
def listar_por_deportista(deportista_id: str, db: Session = Depends(get_db)):
    """Obtener citas de un deportista específico"""
    return listar_citas_por_deportista(db, deportista_id)

@router.get("/{cita_id}", response_model=CitaResponse)
def obtener(cita_id: str, db: Session = Depends(get_db)):
    """Obtener una cita por su ID"""
    cita = obtener_cita(db, cita_id)
    if not cita:
        raise HTTPException(status_code=404, detail="Cita no encontrada")
    return cita

@router.put("/{cita_id}", response_model=CitaResponse)
def actualizar(cita_id: str, data: CitaUpdate, db: Session = Depends(get_db)):
    """Actualizar una cita"""
    cita = actualizar_cita(db, cita_id, data)
    if not cita:
        raise HTTPException(status_code=404, detail="Cita no encontrada")
    return cita

@router.delete("/{cita_id}", status_code=204)
def eliminar(cita_id: str, db: Session = Depends(get_db)):
    """Eliminar una cita"""
    success = eliminar_cita(db, cita_id)
    if not success:
        raise HTTPException(status_code=404, detail="Cita no encontrada")
