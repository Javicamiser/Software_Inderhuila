from app.models.cita import Cita
from app.models.deportista import Deportista
from sqlalchemy import desc
from sqlalchemy.orm import joinedload
from datetime import date

def crear_cita(db, data):
    """Crear una nueva cita"""
    cita = Cita(
        deportista_id=data.deportista_id,
        fecha=data.fecha,
        hora=data.hora,
        tipo_cita_id=data.tipo_cita_id,
        estado_cita_id=data.estado_cita_id,
        observaciones=data.observaciones
    )
    db.add(cita)
    db.commit()
    db.refresh(cita)
    return cita

def listar_citas(db, skip: int = 0, limit: int = 100):
    """Listar todas las citas ordenadas por fecha con relaciones cargadas"""
    return db.query(Cita).options(
        joinedload(Cita.tipo_cita),
        joinedload(Cita.estado_cita),
        joinedload(Cita.deportista)
    ).order_by(Cita.fecha, Cita.hora).offset(skip).limit(limit).all()

def listar_citas_por_deportista(db, deportista_id):
    """Listar citas de un deportista específico con relaciones cargadas"""
    return db.query(Cita).options(
        joinedload(Cita.tipo_cita),
        joinedload(Cita.estado_cita),
        joinedload(Cita.deportista)
    ).filter(
        Cita.deportista_id == deportista_id
    ).order_by(Cita.fecha, Cita.hora).all()

def obtener_cita(db, cita_id):
    """Obtener una cita por su ID con relaciones cargadas"""
    return db.query(Cita).options(
        joinedload(Cita.tipo_cita),
        joinedload(Cita.estado_cita),
        joinedload(Cita.deportista)
    ).filter(Cita.id == cita_id).first()

def actualizar_cita(db, cita_id, data):
    """Actualizar una cita"""
    cita = obtener_cita(db, cita_id)
    if not cita:
        return None
    
    # Actualizar solo los campos proporcionados
    update_data = data.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(cita, field, value)
    
    db.commit()
    db.refresh(cita)
    return cita

def eliminar_cita(db, cita_id):
    """Eliminar una cita"""
    cita = obtener_cita(db, cita_id)
    if not cita:
        return False
    
    db.delete(cita)
    db.commit()
    return True

def obtener_deportistas_con_citas_hoy(db):
    """
    Obtener lista de deportistas que tienen citas agendadas para hoy
    
    Returns:
        Lista de deportistas con citas para hoy
    """
    hoy = date.today()
    
    deportistas = db.query(Deportista).join(
        Cita, Cita.deportista_id == Deportista.id
    ).filter(
        Cita.fecha == hoy
    ).distinct().order_by(Deportista.apellidos, Deportista.nombres).all()
    
    return deportistas
