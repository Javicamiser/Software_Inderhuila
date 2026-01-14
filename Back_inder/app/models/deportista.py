from sqlalchemy import Column, String, Date, Text, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.core.database import Base
from datetime import datetime
import uuid

class Deportista(Base):
    __tablename__ = "deportistas"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tipo_documento_id = Column(UUID(as_uuid=True), ForeignKey("catalogo_items.id"), nullable=False)
    numero_documento = Column(String(30), unique=True, nullable=False)
    nombres = Column(String(100), nullable=False)
    apellidos = Column(String(100), nullable=False)
    fecha_nacimiento = Column(Date, nullable=False)
    sexo_id = Column(UUID(as_uuid=True), ForeignKey("catalogo_items.id"), nullable=False)
    telefono = Column(String(20))
    email = Column(String(100))
    direccion = Column(Text)
    tipo_deporte = Column(String(100))
    estado_id = Column(UUID(as_uuid=True), ForeignKey("catalogo_items.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relaciones
    tipo_documento = relationship("CatalogoItem", foreign_keys=[tipo_documento_id])
    sexo = relationship("CatalogoItem", foreign_keys=[sexo_id])
    estado = relationship("CatalogoItem", foreign_keys=[estado_id])
    historias = relationship("HistoriaClinica", back_populates="deportista")
    citas = relationship("Cita", back_populates="deportista")
    vacunas = relationship("VacunasDeportista", back_populates="deportista", cascade="all, delete-orphan")
