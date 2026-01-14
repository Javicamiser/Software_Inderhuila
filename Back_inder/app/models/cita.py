from sqlalchemy import Column, String, Date, Time, Text, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.core.database import Base
from datetime import datetime
import uuid

class Cita(Base):
    __tablename__ = "citas"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    deportista_id = Column(UUID(as_uuid=True), ForeignKey("deportistas.id"), nullable=False)
    fecha = Column(Date, nullable=False)
    hora = Column(Time, nullable=False)
    tipo_cita_id = Column(UUID(as_uuid=True), ForeignKey("catalogo_items.id"), nullable=False)
    estado_cita_id = Column(UUID(as_uuid=True), ForeignKey("catalogo_items.id"), nullable=False)
    observaciones = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relaciones
    deportista = relationship("Deportista")
    tipo_cita = relationship("CatalogoItem", foreign_keys=[tipo_cita_id])
    estado_cita = relationship("CatalogoItem", foreign_keys=[estado_cita_id])