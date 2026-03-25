"""
Modelo para tokens de descarga segura de historias clínicas
INDERHUILA - Instituto Departamental de Recreación y Deportes del Huila
"""
from sqlalchemy import Column, String, DateTime, Integer, ForeignKey, Boolean
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime, timedelta
import uuid

from app.core.database import Base


class TokenDescarga(Base):
    """
    Token temporal para descarga segura de historia clínica.
    - Expira en 2 horas
    - Máximo 3 intentos fallidos
    """
    __tablename__ = "tokens_descarga"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    token = Column(String(64), unique=True, nullable=False, index=True)
    historia_id = Column(UUID(as_uuid=True), ForeignKey("historias_clinicas.id"), nullable=False)
    deportista_id = Column(UUID(as_uuid=True), ForeignKey("deportistas.id"), nullable=False)
    numero_documento = Column(String(20), nullable=False)
    
    # Control de seguridad
    intentos_fallidos = Column(Integer, default=0)
    bloqueado = Column(Boolean, default=False)
    
    # Control de tiempo
    fecha_creacion = Column(DateTime, default=datetime.utcnow)
    fecha_expiracion = Column(DateTime, nullable=False)
    usado = Column(Boolean, default=False)
    fecha_uso = Column(DateTime, nullable=True)

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        if not self.token:
            self.token = uuid.uuid4().hex
        if not self.fecha_expiracion:
            self.fecha_expiracion = datetime.utcnow() + timedelta(hours=2)
