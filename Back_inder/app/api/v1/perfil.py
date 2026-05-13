# ============================================================
# PERFIL DE USUARIO — ver y actualizar datos + firma
# ============================================================
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from app.core.dependencies import get_db
from app.models.usuario import Usuario

router = APIRouter()


class ActualizarPerfilRequest(BaseModel):
    nombre_completo: Optional[str] = None
    email: Optional[str] = None


class ActualizarFirmaRequest(BaseModel):
    firma_imagen: str


def _get_usuario(request: Request, db: Session) -> Usuario:
    user_id = getattr(request.state, "user_id", None)
    if not user_id:
        raise HTTPException(status_code=401, detail="No autenticado")
    usuario = db.query(Usuario).filter(Usuario.id == user_id).first()
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    return usuario


@router.get("/me")
def obtener_perfil(request: Request, db: Session = Depends(get_db)):
    usuario = _get_usuario(request, db)
    return {
        "id": str(usuario.id),
        "username": usuario.username,
        "nombre_completo": usuario.nombre_completo,
        "email": usuario.email,
        "rol": usuario.rol.nombre if usuario.rol else "Sin rol",
        "tiene_firma": bool(usuario.firma_imagen),
        "firma_imagen": usuario.firma_imagen,
    }


@router.put("/me")
def actualizar_perfil(
    data: ActualizarPerfilRequest,
    request: Request,
    db: Session = Depends(get_db)
):
    usuario = _get_usuario(request, db)
    if data.nombre_completo:
        usuario.nombre_completo = data.nombre_completo
    if data.email is not None:
        usuario.email = data.email
    db.commit()
    return {"message": "Perfil actualizado", "nombre_completo": usuario.nombre_completo}


@router.put("/me/firma")
def actualizar_firma(
    data: ActualizarFirmaRequest,
    request: Request,
    db: Session = Depends(get_db)
):
    usuario = _get_usuario(request, db)
    if not data.firma_imagen.startswith("data:image/"):
        raise HTTPException(status_code=400, detail="Formato inválido. Debe ser imagen base64")
    if len(data.firma_imagen) > 700_000:
        raise HTTPException(status_code=400, detail="Imagen demasiado grande (máx 500KB)")
    usuario.firma_imagen = data.firma_imagen
    db.commit()
    return {"message": "Firma guardada", "tiene_firma": True}


@router.delete("/me/firma")
def eliminar_firma(request: Request, db: Session = Depends(get_db)):
    usuario = _get_usuario(request, db)
    usuario.firma_imagen = None
    db.commit()
    return {"message": "Firma eliminada"}