# ============================================================
# DEPENDENCIES: get_db + get_current_user
# Reemplaza app/core/dependencies.py
# ============================================================
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from uuid import UUID

from app.core.database import SessionLocal
from app.crud.usuario import verificar_token, obtener_usuario

bearer_scheme = HTTPBearer(auto_error=False)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    db: Session = Depends(get_db),
):
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token requerido",
            headers={"WWW-Authenticate": "Bearer"},
        )
    payload = verificar_token(credentials.credentials)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido o expirado",
        )
    usuario = obtener_usuario(db, UUID(payload["sub"]))
    if not usuario or not usuario.activo:
        raise HTTPException(status_code=401, detail="Usuario no encontrado o inactivo")
    return usuario


def require_admin(current_user=Depends(get_current_user)):
    if current_user.rol.nombre != "admin":
        raise HTTPException(status_code=403, detail="Se requiere rol admin")
    return current_user


def require_permiso(modulo: str, accion: str):
    def _check(current_user=Depends(get_current_user)):
        permisos = [(p.modulo, p.accion) for p in current_user.rol.permisos]
        if (modulo, accion) not in permisos:
            raise HTTPException(
                status_code=403,
                detail=f"Sin permiso para {accion} en {modulo}"
            )
        return current_user
    return _check