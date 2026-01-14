from sqlalchemy import Column, String, Text, Boolean, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.core.database import Base
import uuid

class Catalogo(Base):
    __tablename__ = "catalogos"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    nombre = Column(String(50), nullable=False, unique=True)
    descripcion = Column(Text)

    # Relaciones
    items = relationship("CatalogoItem", back_populates="catalogo")


class CatalogoItem(Base):
    __tablename__ = "catalogo_items"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    catalogo_id = Column(UUID(as_uuid=True), ForeignKey("catalogos.id"), nullable=False)
    codigo = Column(String(30))
    nombre = Column(String(100), nullable=False)
    activo = Column(Boolean, default=True)

    # Relaciones
    catalogo = relationship("Catalogo", back_populates="items")