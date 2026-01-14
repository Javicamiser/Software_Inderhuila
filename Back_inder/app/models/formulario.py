from sqlalchemy import Column, String, Text, DateTime, ForeignKey, Boolean, Integer
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.core.database import Base
from datetime import datetime
import uuid

class Formulario(Base):
    __tablename__ = "formularios"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    nombre = Column(String(100), nullable=False)
    modulo = Column(String(50), nullable=False)
    activo = Column(Boolean, default=True)

    # Relaciones
    campos = relationship("FormularioCampo", back_populates="formulario")
    respuestas = relationship("FormularioRespuesta")


class FormularioCampo(Base):
    __tablename__ = "formulario_campos"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    formulario_id = Column(UUID(as_uuid=True), ForeignKey("formularios.id"), nullable=False)
    etiqueta = Column(String(100), nullable=False)
    tipo_campo = Column(String(30), nullable=False)
    requerido = Column(Boolean, default=False)
    orden = Column(Integer)
    catalogo_id = Column(UUID(as_uuid=True), ForeignKey("catalogos.id"))

    # Relaciones
    formulario = relationship("Formulario", back_populates="campos")
    catalogo = relationship("Catalogo")
    respuestas = relationship("FormularioRespuesta")


class RespuestaGrupo(Base):
    __tablename__ = "respuesta_grupos"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    historia_clinica_id = Column(UUID(as_uuid=True), ForeignKey("historias_clinicas.id"), nullable=False)
    formulario_id = Column(UUID(as_uuid=True), ForeignKey("formularios.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relaciones
    historia_clinica = relationship("HistoriaClinica", back_populates="grupos")
    formulario = relationship("Formulario")
    respuestas = relationship("FormularioRespuesta", back_populates="grupo")


class FormularioRespuesta(Base):
    __tablename__ = "formulario_respuestas"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    formulario_id = Column(UUID(as_uuid=True), ForeignKey("formularios.id"), nullable=False)
    historia_clinica_id = Column(UUID(as_uuid=True), ForeignKey("historias_clinicas.id"), nullable=False)
    campo_id = Column(UUID(as_uuid=True), ForeignKey("formulario_campos.id"), nullable=False)
    valor = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    grupo_id = Column(UUID(as_uuid=True), ForeignKey("respuesta_grupos.id"))

    # Relaciones
    formulario = relationship("Formulario")
    historia_clinica = relationship("HistoriaClinica")
    campo = relationship("FormularioCampo")
    grupo = relationship("RespuestaGrupo", back_populates="respuestas")