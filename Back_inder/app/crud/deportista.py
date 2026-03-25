from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session
from app.models.deportista import Deportista

def crear_deportista(db: Session, data):
    """Crear nuevo deportista con validaciones previas"""
    
    # Validar que no exista primero
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
    """
    Eliminar un deportista por ID.
    Elimina primero todos los registros dependientes para evitar errores de FK.
    """
    deportista = db.query(Deportista).filter(Deportista.id == deportista_id).first()
    if not deportista:
        return False
    
    try:
        # =====================================================================
        # Eliminar registros dependientes en orden correcto
        # =====================================================================
        
        # 1. Obtener IDs de historias clinicas del deportista
        from app.models.historia import HistoriaClinica
        historias = db.query(HistoriaClinica).filter(
            HistoriaClinica.deportista_id == deportista_id
        ).all()
        
        historia_ids = [str(h.id) for h in historias]
        
        if historia_ids:
            # 2. Eliminar registros de tablas normalizadas vinculadas a historias
            from app.models.antecedentes import (
                AntecedentesPersonales, AntecedentesFamiliares, LesioneDeportivas,
                CirugiasPrivas, Alergias, Medicaciones, VacunasAdministradas,
                RevisionSistemas, SignosVitales, PruebasComplementarias,
                Diagnosticos, PlanTratamiento, RemisionesEspecialistas,
                MotivoConsultaEnfermedadActual, ExploracionFisicaSistemas
            )
            
            tablas_historia = [
                AntecedentesPersonales, AntecedentesFamiliares, LesioneDeportivas,
                CirugiasPrivas, Alergias, Medicaciones, VacunasAdministradas,
                RevisionSistemas, SignosVitales, PruebasComplementarias,
                Diagnosticos, PlanTratamiento, RemisionesEspecialistas,
                MotivoConsultaEnfermedadActual, ExploracionFisicaSistemas
            ]
            
            for tabla in tablas_historia:
                db.query(tabla).filter(
                    tabla.historia_clinica_id.in_(historia_ids)
                ).delete(synchronize_session=False)
            
            # 3. Eliminar archivos clinicos si existen
            try:
                from app.models.archivo import ArchivoClinico
                db.query(ArchivoClinico).filter(
                    ArchivoClinico.historia_clinica_id.in_(historia_ids)
                ).delete(synchronize_session=False)
            except Exception:
                pass  # Tabla puede no existir
            
            # 4. Eliminar historias JSON si existen
            try:
                from app.models.historia import HistoriaClinicaJSON
                db.query(HistoriaClinicaJSON).filter(
                    HistoriaClinicaJSON.historia_clinica_id.in_(historia_ids)
                ).delete(synchronize_session=False)
            except Exception:
                pass  # Tabla puede no existir
            
            # 5. Eliminar tokens de descarga si existen
            try:
                from app.models.token_descarga import TokenDescarga
                db.query(TokenDescarga).filter(
                    TokenDescarga.historia_id.in_(historia_ids)
                ).delete(synchronize_session=False)
            except Exception:
                pass  # Tabla puede no existir
            
            # 6. Eliminar respuestas de grupo si existen
            try:
                from app.models.formulario import RespuestaGrupo
                db.query(RespuestaGrupo).filter(
                    RespuestaGrupo.historia_clinica_id.in_(historia_ids)
                ).delete(synchronize_session=False)
            except Exception:
                pass  # Tabla puede no existir
            
            # 7. Eliminar historias clinicas
            db.query(HistoriaClinica).filter(
                HistoriaClinica.deportista_id == deportista_id
            ).delete(synchronize_session=False)
        
        # 8. Eliminar citas del deportista
        try:
            from app.models.cita import Cita
            db.query(Cita).filter(
                Cita.deportista_id == deportista_id
            ).delete(synchronize_session=False)
        except Exception:
            pass  # Tabla puede no existir
        
        # 9. Eliminar vacunas del deportista
        try:
            from app.models.antecedentes import VacunasDeportista
            db.query(VacunasDeportista).filter(
                VacunasDeportista.deportista_id == deportista_id
            ).delete(synchronize_session=False)
        except Exception:
            pass  # Tabla puede no existir
        
        # 10. Finalmente eliminar el deportista
        db.delete(deportista)
        db.commit()
        return True
        
    except Exception as e:
        db.rollback()
        print(f"Error al eliminar deportista {deportista_id}: {str(e)}")
        import traceback
        traceback.print_exc()
        raise

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