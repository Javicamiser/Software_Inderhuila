from pydantic import BaseModel
from typing import List

class RespuestaItem(BaseModel):
    campo: str
    valor: str

class FormularioRespuestaCreate(BaseModel):
    formulario_id: int
    respuestas: List[RespuestaItem]
