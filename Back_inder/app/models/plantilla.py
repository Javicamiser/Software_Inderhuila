from sqlalchemy import Column, String, Text, Boolean
from sqlalchemy.dialects.postgresql import UUID
from app.core.database import Base
import uuid

class PlantillaClinica(Base):
    __tablename__ = "plantillas_clinicas"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    sistema = Column(String(50), nullable=False)
    contenido = Column(Text, nullable=False)
    activo = Column(Boolean, default=True)