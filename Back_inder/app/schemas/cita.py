from pydantic import BaseModel, ConfigDict
from datetime import date, time, datetime
from uuid import UUID
from typing import Optional

class CatalogoItemSimple(BaseModel):
    id: UUID
    nombre: str
    
    model_config = ConfigDict(from_attributes=True)

class CitaCreate(BaseModel):
    deportista_id: str  # UUID como string
    fecha: str  # YYYY-MM-DD
    hora: str  # HH:MM:SS
    tipo_cita_id: str  # UUID como string
    estado_cita_id: str  # UUID como string
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

    model_config = ConfigDict(from_attributes=True)
