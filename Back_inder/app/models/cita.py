from sqlalchemy import Column, Date, Time, ForeignKey, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.core.database import Base
import uuid

class Cita(Base):
    __tablename__ = "citas"

    id              = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    deportista_id   = Column(UUID(as_uuid=True), ForeignKey("deportistas.id"), nullable=False)
    medico_id       = Column(UUID(as_uuid=True), ForeignKey("usuarios.id"), nullable=True)   # ← NUEVO
    fecha           = Column(Date, nullable=False)
    hora            = Column(Time, nullable=False)
    tipo_cita_id    = Column(UUID(as_uuid=True), ForeignKey("catalogo_items.id"), nullable=False)
    estado_cita_id  = Column(UUID(as_uuid=True), ForeignKey("catalogo_items.id"), nullable=False)
    observaciones   = Column(String, nullable=True)

    deportista      = relationship("Deportista", back_populates="citas")
    medico          = relationship("Usuario", foreign_keys=[medico_id])                       # ← NUEVO
    tipo_cita       = relationship("CatalogoItem", foreign_keys=[tipo_cita_id])
    estado_cita     = relationship("CatalogoItem", foreign_keys=[estado_cita_id])