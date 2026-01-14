from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class FormularioBase(BaseModel):
    deportista_id: int
    tipo: str
    contenido: Optional[str] = None

class FormularioCreate(FormularioBase):
    pass

class FormularioUpdate(BaseModel):
    tipo: Optional[str] = None
    contenido: Optional[str] = None

class Formulario(FormularioBase):
    id: int
    fecha_creacion: datetime
    fecha_actualizacion: datetime
    
    class Config:
        from_attributes = True
