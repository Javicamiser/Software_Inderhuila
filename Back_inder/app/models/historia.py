from sqlalchemy import Column, Date, DateTime, ForeignKey, String, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.core.database import Base
from datetime import datetime
import uuid

class HistoriaClinica(Base):
    __tablename__ = "historias_clinicas"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    deportista_id = Column(UUID(as_uuid=True), ForeignKey("deportistas.id"), nullable=False)
    fecha_apertura = Column(Date, nullable=False)
    estado_id = Column(UUID(as_uuid=True), ForeignKey("catalogo_items.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relaciones
    deportista = relationship("Deportista", back_populates="historias")
    estado = relationship("CatalogoItem")
    archivos = relationship("ArchivoClinico", back_populates="historia_clinica", cascade="all, delete-orphan")
    grupos = relationship("RespuestaGrupo", back_populates="historia_clinica", cascade="all, delete-orphan")
    historia_json = relationship("HistoriaClinicaJSON", back_populates="historia_clinica", cascade="all, delete-orphan")
    
    # Relaciones con tablas normalizadas
    antecedentes_personales = relationship("AntecedentesPersonales", back_populates="historia_clinica", cascade="all, delete-orphan")
    antecedentes_familiares = relationship("AntecedentesFamiliares", back_populates="historia_clinica", cascade="all, delete-orphan")
    lesiones_deportivas = relationship("LesioneDeportivas", back_populates="historia_clinica", cascade="all, delete-orphan")
    cirugias_previas = relationship("CirugiasPrivas", back_populates="historia_clinica", cascade="all, delete-orphan")
    alergias = relationship("Alergias", back_populates="historia_clinica", cascade="all, delete-orphan")
    medicaciones = relationship("Medicaciones", back_populates="historia_clinica", cascade="all, delete-orphan")
    vacunas_administradas = relationship("VacunasAdministradas", back_populates="historia_clinica", cascade="all, delete-orphan")
    revision_sistemas = relationship("RevisionSistemas", back_populates="historia_clinica", cascade="all, delete-orphan")
    signos_vitales = relationship("SignosVitales", back_populates="historia_clinica", cascade="all, delete-orphan")
    pruebas_complementarias = relationship("PruebasComplementarias", back_populates="historia_clinica", cascade="all, delete-orphan")
    diagnosticos = relationship("Diagnosticos", back_populates="historia_clinica", cascade="all, delete-orphan")
    plan_tratamiento = relationship("PlanTratamiento", back_populates="historia_clinica", cascade="all, delete-orphan")
    remisiones_especialistas = relationship("RemisionesEspecialistas", back_populates="historia_clinica", cascade="all, delete-orphan")
    motivo_consulta_enfermedad = relationship("MotivoConsultaEnfermedadActual", back_populates="historia_clinica", cascade="all, delete-orphan")
    exploracion_fisica_sistemas = relationship("ExploracionFisicaSistemas", back_populates="historia_clinica", cascade="all, delete-orphan")

class HistoriaClinicaJSON(Base):
    """Modelo para almacenar la historia clínica completa como JSON"""
    __tablename__ = "historias_clinicas_json"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    historia_clinica_id = Column(UUID(as_uuid=True), ForeignKey("historias_clinicas.id"), nullable=False)
    deportista_id = Column(UUID(as_uuid=True), ForeignKey("deportistas.id"), nullable=False)
    datos_completos = Column(JSON, nullable=False)  # JSON con todos los datos
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relaciones
    historia_clinica = relationship("HistoriaClinica", back_populates="historia_json")