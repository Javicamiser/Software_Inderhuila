from pydantic import BaseModel
from uuid import UUID
from datetime import datetime

class ArchivoResponse(BaseModel):
    id: UUID
    historia_id: UUID
    nombre_original: str
    tipo_archivo: str
    categoria: str | None
    ruta: str
    fecha_subida: datetime
