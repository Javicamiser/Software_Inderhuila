# ============================================================
# CRUD: Usuarios, Roles, Auth
# ============================================================
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta
from typing import Optional
from uuid import UUID

from app.models.usuario import Usuario, Rol, Permiso
from app.schemas.usuario import UsuarioCreate, UsuarioUpdate, RolCreate
from app.core.config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

PERMISOS_ADMIN = [
    ("deportistas", "ver"), ("deportistas", "crear"), ("deportistas", "editar"), ("deportistas", "eliminar"),
    ("historia", "ver"), ("historia", "crear"), ("historia", "editar"), ("historia", "eliminar"),
    ("citas", "ver"), ("citas", "crear"), ("citas", "editar"), ("citas", "eliminar"),
    ("archivos", "ver"), ("archivos", "crear"), ("archivos", "eliminar"),
    ("reportes", "ver"),
    ("usuarios", "ver"), ("usuarios", "crear"), ("usuarios", "editar"), ("usuarios", "eliminar"),
    ("configuracion", "ver"), ("configuracion", "editar"),
]

PERMISOS_MEDICO = [
    ("deportistas", "ver"), ("deportistas", "crear"), ("deportistas", "editar"),
    ("historia", "ver"), ("historia", "crear"), ("historia", "editar"),
    ("citas", "ver"), ("citas", "crear"), ("citas", "editar"),
    ("archivos", "ver"), ("archivos", "crear"),
    ("reportes", "ver"),
]


# ── Password ─────────────────────────────────────────────────
def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)


# ── JWT ──────────────────────────────────────────────────────
def crear_token(data: dict) -> str:
    payload = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    payload.update({"exp": expire})
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

def verificar_token(token: str) -> Optional[dict]:
    try:
        return jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
    except JWTError:
        return None


# ── Roles ────────────────────────────────────────────────────
def crear_roles_iniciales(db: Session):
    for nombre, permisos in [("admin", PERMISOS_ADMIN), ("medico", PERMISOS_MEDICO)]:
        if not db.query(Rol).filter(Rol.nombre == nombre).first():
            rol = Rol(nombre=nombre, descripcion=f"Rol {nombre} — creado automáticamente")
            db.add(rol)
            db.flush()
            for modulo, accion in permisos:
                db.add(Permiso(rol_id=rol.id, modulo=modulo, accion=accion))
    db.commit()

def obtener_roles(db: Session):
    return db.query(Rol).filter(Rol.activo == True).all()

def obtener_rol(db: Session, rol_id: UUID):
    return db.query(Rol).filter(Rol.id == rol_id).first()

def crear_rol(db: Session, data: RolCreate):
    if db.query(Rol).filter(Rol.nombre == data.nombre).first():
        raise HTTPException(status_code=400, detail="Ya existe un rol con ese nombre")
    rol = Rol(nombre=data.nombre, descripcion=data.descripcion)
    db.add(rol)
    db.flush()
    for p in (data.permisos or []):
        db.add(Permiso(rol_id=rol.id, modulo=p.modulo, accion=p.accion))
    db.commit()
    db.refresh(rol)
    return rol


# ── Usuarios ─────────────────────────────────────────────────
def hay_usuarios(db: Session) -> bool:
    return db.query(Usuario).count() > 0

def obtener_usuario_por_username(db: Session, username: str):
    return db.query(Usuario).filter(Usuario.username == username).first()

def obtener_usuario(db: Session, usuario_id: UUID):
    return db.query(Usuario).filter(Usuario.id == usuario_id).first()

def obtener_usuarios(db: Session):
    return db.query(Usuario).all()

def crear_usuario(db: Session, data: UsuarioCreate):
    if obtener_usuario_por_username(db, data.username):
        raise HTTPException(status_code=400, detail="El nombre de usuario ya existe")
    if not obtener_rol(db, data.rol_id):
        raise HTTPException(status_code=404, detail="Rol no encontrado")
    usuario = Usuario(
        username=data.username,
        nombre_completo=data.nombre_completo,
        email=data.email,
        hashed_password=hash_password(data.password),
        rol_id=data.rol_id,
    )
    db.add(usuario)
    db.commit()
    db.refresh(usuario)
    return usuario

def actualizar_usuario(db: Session, usuario_id: UUID, data: UsuarioUpdate):
    usuario = obtener_usuario(db, usuario_id)
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    if data.nombre_completo is not None:
        usuario.nombre_completo = data.nombre_completo
    if data.email is not None:
        usuario.email = data.email
    if data.password is not None:
        usuario.hashed_password = hash_password(data.password)
    if data.rol_id is not None:
        usuario.rol_id = data.rol_id
    if data.activo is not None:
        usuario.activo = data.activo
    db.commit()
    db.refresh(usuario)
    return usuario

def eliminar_usuario(db: Session, usuario_id: UUID):
    usuario = obtener_usuario(db, usuario_id)
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    db.delete(usuario)
    db.commit()


# ── Login ────────────────────────────────────────────────────
def autenticar_usuario(db: Session, username: str, password: str):
    usuario = obtener_usuario_por_username(db, username)
    if not usuario or not verify_password(password, usuario.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuario o contraseña incorrectos"
        )
    if not usuario.activo:
        raise HTTPException(status_code=403, detail="Usuario desactivado")
    return usuario


# ── Setup inicial ─────────────────────────────────────────────
def crear_primer_admin(db: Session, username: str, nombre_completo: str,
                       email: Optional[str], password: str):
    if hay_usuarios(db):
        raise HTTPException(status_code=400, detail="El sistema ya fue configurado")
    crear_roles_iniciales(db)
    rol_admin = db.query(Rol).filter(Rol.nombre == "admin").first()
    usuario = Usuario(
        username=username,
        nombre_completo=nombre_completo,
        email=email,
        hashed_password=hash_password(password),
        rol_id=rol_admin.id,
    )
    db.add(usuario)
    db.commit()
    db.refresh(usuario)
    return usuario