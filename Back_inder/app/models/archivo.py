from sqlalchemy import Column, String, Text, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.core.database import Base
from datetime import datetime
import uuid

class ArchivoClinico(Base):
    __tablename__ = "archivos_clinicos"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    historia_clinica_id = Column(UUID(as_uuid=True), ForeignKey("historias_clinicas.id"), nullable=False)
    formulario_id = Column(UUID(as_uuid=True), ForeignKey("formularios.id"), nullable=True)
    grupo_id = Column(UUID(as_uuid=True), ForeignKey("respuesta_grupos.id"), nullable=True)
    prueba_complementaria_id = Column(UUID(as_uuid=True), ForeignKey("pruebas_complementarias.id"), nullable=True)
    nombre_archivo = Column(String(255), nullable=False)
    ruta_archivo = Column(Text, nullable=False)
    tipo_archivo = Column(String(50), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relaciones
    historia_clinica = relationship("HistoriaClinica")
    formulario = relationship("Formulario")
    grupo = relationship("RespuestaGrupo")
    prueba = relationship("PruebasComplementarias", back_populates="archivos")