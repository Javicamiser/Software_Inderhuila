from sqlalchemy import Column, String, Text, DateTime, ForeignKey, Date, Integer, Numeric
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.core.database import Base
from datetime import datetime
import uuid


class AntecedentesPersonales(Base):
    __tablename__ = "antecedentes_personales"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    historia_clinica_id = Column(UUID(as_uuid=True), ForeignKey("historias_clinicas.id"), nullable=False)
    codigo_cie11 = Column(String(10))
    nombre_enfermedad = Column(String(255), nullable=False)
    observaciones = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

    historia_clinica = relationship("HistoriaClinica")


class AntecedentesFamiliares(Base):
    __tablename__ = "antecedentes_familiares"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    historia_clinica_id = Column(UUID(as_uuid=True), ForeignKey("historias_clinicas.id"), nullable=False)
    codigo_cie11 = Column(String(10))
    nombre_enfermedad = Column(String(255), nullable=False)
    tipo_familiar = Column(String(50))
    observaciones = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

    historia_clinica = relationship("HistoriaClinica")


class LesioneDeportivas(Base):
    __tablename__ = "lesiones_deportivas"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    historia_clinica_id = Column(UUID(as_uuid=True), ForeignKey("historias_clinicas.id"), nullable=False)
    tipo_lesion = Column(String(255), nullable=False)
    fecha_lesion = Column(Date)
    tratamiento = Column(Text)
    observaciones = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

    historia_clinica = relationship("HistoriaClinica")


class CirugiasPrivas(Base):
    __tablename__ = "cirugias_previas"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    historia_clinica_id = Column(UUID(as_uuid=True), ForeignKey("historias_clinicas.id"), nullable=False)
    tipo_cirugia = Column(String(255), nullable=False)
    fecha_cirugia = Column(Date)
    observaciones = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

    historia_clinica = relationship("HistoriaClinica")


class Alergias(Base):
    __tablename__ = "alergias"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    historia_clinica_id = Column(UUID(as_uuid=True), ForeignKey("historias_clinicas.id"), nullable=False)
    tipo_alergia = Column(String(255), nullable=False)
    descripcion = Column(Text)
    reaccion = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

    historia_clinica = relationship("HistoriaClinica")

class VacunasDeportista(Base):

    __tablename__ = "vacunas_deportista"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    deportista_id = Column(UUID(as_uuid=True), ForeignKey("deportistas.id"), nullable=False)
    nombre_vacuna = Column(String(255), nullable=False)  # Tétanos, Hepatitis, etc.
    fecha_administracion = Column(Date)
    ruta_archivo = Column(Text)  # Ruta del archivo adjunto
    nombre_archivo = Column(String(255))  # Nombre del archivo original
    tipo_archivo = Column(String(50))  # pdf, jpg, png, etc.
    observaciones = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relaciones
    deportista = relationship("Deportista", back_populates="vacunas")

class Medicaciones(Base):
    __tablename__ = "medicaciones"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    historia_clinica_id = Column(UUID(as_uuid=True), ForeignKey("historias_clinicas.id"), nullable=False)
    nombre_medicamento = Column(String(255), nullable=False)
    dosis = Column(String(100))
    frecuencia = Column(String(100))
    duracion = Column(String(100))
    indicacion = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

    historia_clinica = relationship("HistoriaClinica")


class VacunasAdministradas(Base):
    __tablename__ = "vacunas_administradas"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    historia_clinica_id = Column(UUID(as_uuid=True), ForeignKey("historias_clinicas.id"), nullable=False)
    nombre_vacuna = Column(String(255), nullable=False)
    fecha_administracion = Column(Date)
    observaciones = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

    historia_clinica = relationship("HistoriaClinica")


class RevisionSistemas(Base):
    __tablename__ = "revision_sistemas"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    historia_clinica_id = Column(UUID(as_uuid=True), ForeignKey("historias_clinicas.id"), nullable=False)
    sistema_nombre = Column(String(50), nullable=False)
    estado = Column(String(20), nullable=False)
    observaciones = Column(Text)
    tipo_revision = Column(String(50), default="revision")
    created_at = Column(DateTime, default=datetime.utcnow)

    historia_clinica = relationship("HistoriaClinica")


class SignosVitales(Base):
    __tablename__ = "signos_vitales"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    historia_clinica_id = Column(UUID(as_uuid=True), ForeignKey("historias_clinicas.id"), nullable=False)
    estatura_cm = Column(Numeric(5, 2))
    peso_kg = Column(Numeric(5, 2))
    frecuencia_cardiaca_lpm = Column(Integer)
    presion_arterial_sistolica = Column(Integer)
    presion_arterial_diastolica = Column(Integer)
    frecuencia_respiratoria_rpm = Column(Integer)
    temperatura_celsius = Column(Numeric(4, 2))
    saturacion_oxigeno_percent = Column(Numeric(5, 2))
    imc = Column(Numeric(5, 2))
    created_at = Column(DateTime, default=datetime.utcnow)

    historia_clinica = relationship("HistoriaClinica")


class PruebasComplementarias(Base):
    __tablename__ = "pruebas_complementarias"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    historia_clinica_id = Column(UUID(as_uuid=True), ForeignKey("historias_clinicas.id"), nullable=False)
    categoria = Column(String(100), nullable=False)
    nombre_prueba = Column(String(255), nullable=False)
    codigo_cups = Column(String(10))
    resultado = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

    historia_clinica = relationship("HistoriaClinica")
    archivos = relationship("ArchivoClinico", back_populates="prueba")


class Diagnosticos(Base):
    __tablename__ = "diagnosticos"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    historia_clinica_id = Column(UUID(as_uuid=True), ForeignKey("historias_clinicas.id"), nullable=False)
    codigo_cie11 = Column(String(10))
    nombre_enfermedad = Column(String(255), nullable=False)
    observaciones = Column(Text)
    analisis_objetivo = Column(Text)
    impresion_diagnostica = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

    historia_clinica = relationship("HistoriaClinica")


class PlanTratamiento(Base):
    __tablename__ = "plan_tratamiento"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    historia_clinica_id = Column(UUID(as_uuid=True), ForeignKey("historias_clinicas.id"), nullable=False)
    indicaciones_medicas = Column(Text)
    recomendaciones_entrenamiento = Column(Text)
    plan_seguimiento = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

    historia_clinica = relationship("HistoriaClinica")


class RemisionesEspecialistas(Base):
    __tablename__ = "remisiones_especialistas"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    historia_clinica_id = Column(UUID(as_uuid=True), ForeignKey("historias_clinicas.id"), nullable=False)
    especialista = Column(String(100), nullable=False)
    motivo = Column(Text, nullable=False)
    prioridad = Column(String(20), nullable=False, default="Normal")
    fecha_remision = Column(Date)
    created_at = Column(DateTime, default=datetime.utcnow)

    historia_clinica = relationship("HistoriaClinica")


class MotivoConsultaEnfermedadActual(Base):
    __tablename__ = "motivo_consulta_enfermedad_actual"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    historia_clinica_id = Column(UUID(as_uuid=True), ForeignKey("historias_clinicas.id"), nullable=False)
    motivo_consulta = Column(Text, nullable=False)
    sintomas_principales = Column(Text)
    duracion_sintomas = Column(String(100))
    inicio_enfermedad = Column(Text)
    evolucion = Column(Text)
    factor_desencadenante = Column(Text)
    medicamentos_previos = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

    historia_clinica = relationship("HistoriaClinica")


class ExploracionFisicaSistemas(Base):
    __tablename__ = "exploracion_fisica_sistemas"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    historia_clinica_id = Column(UUID(as_uuid=True), ForeignKey("historias_clinicas.id"), nullable=False)
    sistema_cardiovascular = Column(Text)
    sistema_respiratorio = Column(Text)
    sistema_digestivo = Column(Text)
    sistema_neurologico = Column(Text)
    sistema_genitourinario = Column(Text)
    sistema_musculoesqueletico = Column(Text)
    sistema_integumentario = Column(Text)
    sistema_endocrino = Column(Text)
    cabeza_cuello = Column(Text)
    extremidades = Column(Text)
    observaciones_generales = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

    historia_clinica = relationship("HistoriaClinica")
