from pydantic import BaseModel, field_validator, ConfigDict
from datetime import date, datetime
from uuid import UUID

class DeportistaCreate(BaseModel):
    model_config = ConfigDict(arbitrary_types_allowed=True)
    
    tipo_documento_id: str | UUID
    numero_documento: str
    nombres: str
    apellidos: str
    fecha_nacimiento: date
    sexo_id: str | UUID
    telefono: str | None = None
    email: str | None = None
    direccion: str | None = None
    tipo_deporte: str | None = None
    estado_id: str | UUID
    
    @field_validator('tipo_documento_id', 'sexo_id', 'estado_id', mode='before')
    @classmethod
    def validate_uuids(cls, v):
        if v is None:
            return v
        if isinstance(v, UUID):
            return v
        if isinstance(v, str):
            try:
                return UUID(v)
            except (ValueError, TypeError) as e:
                raise ValueError(f"Invalid UUID format: {v}. Error: {str(e)}")
        raise ValueError(f"Expected UUID or string, got {type(v).__name__}")

class DeportistaUpdate(BaseModel):
    """Schema para actualizar deportista - todos los campos son opcionales"""
    model_config = ConfigDict(extra="ignore")
    
    numero_documento: str | None = None
    nombres: str | None = None
    apellidos: str | None = None
    fecha_nacimiento: date | None = None
    telefono: str | None = None
    email: str | None = None
    direccion: str | None = None
    tipo_deporte: str | None = None

class DeportistaResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True, extra="ignore", arbitrary_types_allowed=True)
    
    id: UUID
    tipo_documento_id: UUID
    numero_documento: str
    nombres: str
    apellidos: str
    fecha_nacimiento: date
    sexo_id: UUID
    telefono: str | None = None
    email: str | None = None
    direccion: str | None = None
    tipo_deporte: str | None = None
    estado_id: UUID
    created_at: datetime | None = None
