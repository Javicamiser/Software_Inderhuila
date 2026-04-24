# ============================================================
# SCHEMAS: Auth y Usuarios
# ============================================================
from pydantic import BaseModel, EmailStr
from typing import Optional, List
from uuid import UUID
from datetime import datetime


# ── Roles ────────────────────────────────────────────────────
class PermisoBase(BaseModel):
    modulo: str
    accion: str

class PermisoResponse(PermisoBase):
    id: UUID
    class Config:
        from_attributes = True

class RolCreate(BaseModel):
    nombre: str
    descripcion: Optional[str] = None
    permisos: Optional[List[PermisoBase]] = []

class RolResponse(BaseModel):
    id: UUID
    nombre: str
    descripcion: Optional[str]
    activo: bool
    permisos: List[PermisoResponse] = []
    class Config:
        from_attributes = True


# ── Usuarios ─────────────────────────────────────────────────
class UsuarioCreate(BaseModel):
    username: str
    nombre_completo: str
    email: Optional[str] = None
    password: str
    rol_id: UUID

class UsuarioUpdate(BaseModel):
    nombre_completo: Optional[str] = None
    email: Optional[str] = None
    password: Optional[str] = None
    rol_id: Optional[UUID] = None
    activo: Optional[bool] = None

class UsuarioResponse(BaseModel):
    id: UUID
    username: str
    nombre_completo: str
    email: Optional[str]
    activo: bool
    created_at: datetime
    rol: RolResponse
    class Config:
        from_attributes = True


# ── Auth ─────────────────────────────────────────────────────
class LoginRequest(BaseModel):
    username: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    usuario: UsuarioResponse


# ── Setup inicial ─────────────────────────────────────────────
class SetupRequest(BaseModel):
    username: str
    nombre_completo: str
    email: Optional[str] = None
    password: str