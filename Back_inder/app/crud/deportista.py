from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session
from app.models.deportista import Deportista

def crear_deportista(db: Session, data):
    """Crear nuevo deportista con validaciones previas"""
    
    # ✅ VALIDAR QUE NO EXISTA PRIMERO
    deportista_existente = db.query(Deportista).filter(
        Deportista.numero_documento == data.numero_documento
    ).first()
    
    if deportista_existente:
        raise ValueError(f"Ya existe un deportista con documento: {data.numero_documento}")
    
    try:
        deportista = Deportista(**data.dict())
        db.add(deportista)
        db.commit()
        db.refresh(deportista)
        return deportista
        
    except IntegrityError as e:
        db.rollback()
        if "numero_documento" in str(e):
            raise ValueError("El número de documento ya existe en el sistema")
        raise ValueError(f"Error de integridad: {str(e)}")
        
    except Exception as e:
        db.rollback()
        raise

def listar_deportistas(db):
    return db.query(Deportista).all()

def obtener_deportista(db, deportista_id):
    return db.query(Deportista).filter(Deportista.id == deportista_id).first()

def eliminar_deportista(db: Session, deportista_id: str):
    """Eliminar un deportista por ID"""
    deportista = db.query(Deportista).filter(Deportista.id == deportista_id).first()
    if not deportista:
        return False
    db.delete(deportista)
    db.commit()
    return True

def actualizar_deportista(db: Session, deportista_id: str, data):
    """Actualizar un deportista existente"""
    deportista = db.query(Deportista).filter(Deportista.id == deportista_id).first()
    if not deportista:
        return None
    
    try:
        # Actualizar solo los campos que vienen en data
        for key, value in data.dict(exclude_unset=True).items():
            if value is not None:
                setattr(deportista, key, value)
        
        db.commit()
        db.refresh(deportista)
        return deportista
        
    except IntegrityError as e:
        db.rollback()
        if "numero_documento" in str(e):
            raise ValueError("El número de documento ya existe en el sistema")
        raise ValueError(f"Error de integridad: {str(e)}")
        
    except Exception as e:
        db.rollback()
        raise
