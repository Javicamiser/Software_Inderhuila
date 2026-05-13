from pydantic import BaseModel, ConfigDict
from datetime import date, time, datetime
from uuid import UUID
from typing import Optional


class CatalogoItemSimple(BaseModel):
    id: UUID
    nombre: str
    model_config = ConfigDict(from_attributes=True)


class DeportistaSimple(BaseModel):
    id: UUID
    nombres: str
    apellidos: str
    numero_documento: Optional[str] = None
    model_config = ConfigDict(from_attributes=True)


class CitaCreate(BaseModel):
    deportista_id: str
    fecha: str
    hora: str
    tipo_cita_id: str
    estado_cita_id: str
    observaciones: Optional[str] = None
    model_config = ConfigDict(from_attributes=True)


class CitaUpdate(BaseModel):
    fecha: Optional[str] = None
    hora: Optional[str] = None
    tipo_cita_id: Optional[str] = None
    estado_cita_id: Optional[str] = None
    observaciones: Optional[str] = None
    model_config = ConfigDict(from_attributes=True)


class CitaResponse(BaseModel):
    id: UUID
    deportista_id: UUID
    fecha: date
    hora: time
    tipo_cita_id: UUID
    estado_cita_id: UUID
    observaciones: Optional[str]
    created_at: Optional[datetime]
    tipo_cita: Optional[CatalogoItemSimple] = None
    estado_cita: Optional[CatalogoItemSimple] = None
    deportista: Optional[DeportistaSimple] = None   # ← NUEVO
    model_config = ConfigDict(from_attributes=True)