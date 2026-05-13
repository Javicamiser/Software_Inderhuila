# ============================================================
# MODELOS: Usuario, Rol, Permiso
# ============================================================
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Text, LargeBinary
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
from app.core.database import Base


class Rol(Base):
    __tablename__ = "roles"

    id          = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    nombre      = Column(String(50), unique=True, nullable=False)
    descripcion = Column(Text, nullable=True)
    activo      = Column(Boolean, default=True)
    created_at  = Column(DateTime, default=datetime.utcnow)

    usuarios    = relationship("Usuario", back_populates="rol")
    permisos    = relationship("Permiso", back_populates="rol", cascade="all, delete-orphan")


class Permiso(Base):
    __tablename__ = "permisos"

    id      = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    rol_id  = Column(UUID(as_uuid=True), ForeignKey("roles.id", ondelete="CASCADE"), nullable=False)
    modulo  = Column(String(50), nullable=False)
    accion  = Column(String(20), nullable=False)

    rol     = relationship("Rol", back_populates="permisos")


class Usuario(Base):
    __tablename__ = "usuarios"

    id              = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    username        = Column(String(50), unique=True, nullable=False, index=True)
    nombre_completo = Column(String(150), nullable=False)
    email           = Column(String(150), unique=True, nullable=True)
    hashed_password = Column(String(255), nullable=False)
    rol_id          = Column(UUID(as_uuid=True), ForeignKey("roles.id"), nullable=False)
    activo          = Column(Boolean, default=True)
    # Firma digital del médico — almacenada como base64 en Text
    firma_imagen    = Column(Text, nullable=True)
    created_at      = Column(DateTime, default=datetime.utcnow)
    updated_at      = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    rol             = relationship("Rol", back_populates="usuarios")