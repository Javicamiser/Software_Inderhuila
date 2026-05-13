# ============================================================
# API: Auth + Usuarios + Roles
# ============================================================
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from uuid import UUID
from typing import List

from app.core.dependencies import get_db, get_current_user, require_admin
from app.crud.usuario import (
    hay_usuarios, crear_primer_admin, autenticar_usuario, crear_token,
    obtener_usuarios, obtener_usuario, crear_usuario, actualizar_usuario,
    eliminar_usuario, obtener_roles, obtener_rol, crear_rol,
)
from app.schemas.usuario import (
    LoginRequest, TokenResponse, SetupRequest,
    UsuarioCreate, UsuarioUpdate, UsuarioResponse,
    RolCreate, RolResponse,
)

router = APIRouter(tags=["Auth y Usuarios"])


# ── Setup inicial ─────────────────────────────────────────────
@router.get("/auth/setup-requerido")
def check_setup(db: Session = Depends(get_db)):
    """Devuelve true si el sistema aún no tiene usuarios (primer uso)"""
    return {"setup_requerido": not hay_usuarios(db)}


@router.post("/auth/setup", response_model=TokenResponse)
def setup_inicial(data: SetupRequest, db: Session = Depends(get_db)):
    """Crea el primer administrador del sistema"""
    usuario = crear_primer_admin(db, data.username, data.nombre_completo, data.email, data.password)
    token = crear_token({"sub": str(usuario.id), "rol": usuario.rol.nombre})
    return TokenResponse(access_token=token, usuario=usuario)


# ── Login ────────────────────────────────────────────────────
@router.post("/auth/login", response_model=TokenResponse)
def login(data: LoginRequest, db: Session = Depends(get_db)):
    usuario = autenticar_usuario(db, data.username, data.password)
    token = crear_token({"sub": str(usuario.id), "rol": usuario.rol.nombre})
    return TokenResponse(access_token=token, usuario=usuario)


@router.get("/auth/me", response_model=UsuarioResponse)
def me(current_user=Depends(get_current_user)):
    return current_user


# ── Usuarios (solo admin) ─────────────────────────────────────
@router.get("/usuarios", response_model=List[UsuarioResponse])
def listar_usuarios(db: Session = Depends(get_db), _=Depends(require_admin)):
    return obtener_usuarios(db)


@router.post("/usuarios", response_model=UsuarioResponse)
def crear(data: UsuarioCreate, db: Session = Depends(get_db), _=Depends(require_admin)):
    return crear_usuario(db, data)


@router.put("/usuarios/{usuario_id}", response_model=UsuarioResponse)
def actualizar(usuario_id: UUID, data: UsuarioUpdate,
               db: Session = Depends(get_db), _=Depends(require_admin)):
    return actualizar_usuario(db, usuario_id, data)


@router.delete("/usuarios/{usuario_id}")
def eliminar(usuario_id: UUID, db: Session = Depends(get_db),
             current_user=Depends(require_admin)):
    if str(usuario_id) == str(current_user.id):
        raise HTTPException(status_code=400, detail="No puedes eliminarte a ti mismo")
    eliminar_usuario(db, usuario_id)
    return {"ok": True}


# ── Roles (solo admin) ────────────────────────────────────────
@router.get("/roles", response_model=List[RolResponse])
def listar_roles(db: Session = Depends(get_db), _=Depends(require_admin)):
    return obtener_roles(db)


@router.post("/roles", response_model=RolResponse)
def crear_nuevo_rol(data: RolCreate, db: Session = Depends(get_db), _=Depends(require_admin)):
    return crear_rol(db, data)


# ── Editar permisos de rol existente ─────────────────────────
from pydantic import BaseModel as _BaseModel

class _PermisoItem(_BaseModel):
    modulo: str
    accion: str

class _PermisosUpdate(_BaseModel):
    permisos: List[_PermisoItem]

@router.put("/roles/{rol_id}/permisos")
def actualizar_permisos_rol(
    rol_id: UUID,
    data: _PermisosUpdate,
    db: Session = Depends(get_db),
    _=Depends(require_admin)
):
    """Reemplaza todos los permisos de un rol con los nuevos"""
    from app.models.usuario import Rol, Permiso
    rol = db.query(Rol).filter(Rol.id == rol_id).first()
    if not rol:
        raise HTTPException(status_code=404, detail="Rol no encontrado")
    # Eliminar permisos existentes
    db.query(Permiso).filter(Permiso.rol_id == rol_id).delete()
    # Crear nuevos permisos
    for p in data.permisos:
        nuevo = Permiso(rol_id=rol_id, modulo=p.modulo, accion=p.accion)
        db.add(nuevo)
    db.commit()
    db.refresh(rol)
    return {"ok": True, "permisos": len(data.permisos)}