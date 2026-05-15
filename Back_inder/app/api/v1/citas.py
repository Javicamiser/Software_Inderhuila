from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import and_
from uuid import UUID
from typing import Optional, List
from datetime import date, time
from pydantic import BaseModel

from app.core.dependencies import get_db, get_current_user
from app.models.cita import Cita
from app.models.usuario import Usuario
from app.models.catalogo import CatalogoItem

router = APIRouter(tags=["Citas"])


# ── Helpers de rol ────────────────────────────────────────────
def _es_admin(usuario) -> bool:
    """True si el usuario tiene rol admin."""
    try:
        return usuario.rol.nombre.lower() in ('admin', 'administrador')
    except Exception:
        return False


# ── Schemas ───────────────────────────────────────────────────
class CitaCreate(BaseModel):
    deportista_id:  UUID
    medico_id:      Optional[UUID] = None
    fecha:          date
    hora:           str                  # "HH:MM"
    tipo_cita_id:   UUID
    estado_cita_id: UUID
    observaciones:  Optional[str] = None

class CitaUpdate(BaseModel):
    medico_id:      Optional[UUID] = None
    fecha:          Optional[date] = None
    hora:           Optional[str]  = None
    tipo_cita_id:   Optional[UUID] = None
    estado_cita_id: Optional[UUID] = None
    observaciones:  Optional[str]  = None


def _serializar(c: Cita) -> dict:
    return {
        "id":             str(c.id),
        "deportista_id":  str(c.deportista_id),
        "medico_id":      str(c.medico_id) if c.medico_id else None,
        "fecha":          str(c.fecha),
        "hora":           str(c.hora),
        "tipo_cita_id":   str(c.tipo_cita_id),
        "estado_cita_id": str(c.estado_cita_id),
        "observaciones":  c.observaciones,
        "tipo_cita":   {"nombre": c.tipo_cita.nombre}   if c.tipo_cita   else None,
        "estado_cita": {"nombre": c.estado_cita.nombre} if c.estado_cita else None,
        "deportista": {
            "id":               str(c.deportista.id),
            "nombres":          c.deportista.nombres,
            "apellidos":        c.deportista.apellidos,
            "numero_documento": c.deportista.numero_documento,
        } if c.deportista else None,
        "medico": {
            "id":              str(c.medico.id),
            "nombre_completo": getattr(c.medico, "nombre_completo", None)
                               or f"{getattr(c.medico,'nombres','')} {getattr(c.medico,'apellidos','')}".strip(),
        } if c.medico else None,
    }


def _cargar(db: Session, cita_id):
    return db.query(Cita).options(
        joinedload(Cita.tipo_cita),
        joinedload(Cita.estado_cita),
        joinedload(Cita.deportista),
        joinedload(Cita.medico),
    ).filter(Cita.id == cita_id).first()


# ── Rutas estáticas ───────────────────────────────────────────

@router.get("/hoy")
def citas_hoy(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """
    Citas de hoy.
    - Admin: todas las citas del día.
    - Médico: solo las citas asignadas a él.
    """
    hoy = date.today()
    q = db.query(Cita).options(
        joinedload(Cita.tipo_cita),
        joinedload(Cita.estado_cita),
        joinedload(Cita.deportista),
        joinedload(Cita.medico),
    ).filter(Cita.fecha == hoy)

    # Si no es admin, filtrar solo sus citas
    if not _es_admin(current_user):
        q = q.filter(Cita.medico_id == current_user.id)

    return [_serializar(c) for c in q.order_by(Cita.hora).all()]


@router.get("/agenda")
def agenda_medico(
    medico_id: UUID = Query(..., description="ID del médico"),
    fecha:     date = Query(..., description="Fecha a consultar (YYYY-MM-DD)"),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """
    Slots disponibles de un médico en una fecha.
    Médico solo puede consultar su propia agenda.
    Admin puede consultar cualquier agenda.
    """
    if not _es_admin(current_user) and medico_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="Solo puedes consultar tu propia agenda"
        )

    from datetime import datetime, timedelta
    inicio      = datetime.strptime("07:00", "%H:%M")
    fin         = datetime.strptime("17:00", "%H:%M")
    todos_slots = []
    cur = inicio
    while cur < fin:
        todos_slots.append(cur.strftime("%H:%M"))
        cur += timedelta(minutes=30)

    ocupadas = db.query(Cita).options(
        joinedload(Cita.deportista),
        joinedload(Cita.tipo_cita),
        joinedload(Cita.estado_cita),
    ).filter(
        and_(Cita.medico_id == medico_id, Cita.fecha == fecha)
    ).all()

    ocupadas_map = {str(c.hora)[:5]: c for c in ocupadas}

    slots = []
    for hora in todos_slots:
        cita = ocupadas_map.get(hora)
        slots.append({
            "hora":  hora,
            "libre": cita is None,
            "cita":  {
                "id":         str(cita.id),
                "deportista": f"{cita.deportista.nombres} {cita.deportista.apellidos}" if cita.deportista else "—",
                "tipo":       cita.tipo_cita.nombre   if cita.tipo_cita   else "—",
                "estado":     cita.estado_cita.nombre if cita.estado_cita else "—",
            } if cita else None,
        })

    return {
        "medico_id": str(medico_id),
        "fecha":     str(fecha),
        "slots":     slots,
        "ocupados":  len(ocupadas),
        "libres":    len(todos_slots) - len(ocupadas),
    }


@router.get("/medicos")
def listar_medicos(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Lista de usuarios activos para el selector de citas."""
    medicos = db.query(Usuario).options(
        joinedload(Usuario.rol)
    ).filter(
        Usuario.activo == True
    ).order_by(Usuario.nombre_completo).all()

    return [
        {
            "id":              str(u.id),
            "nombre_completo": getattr(u, "nombre_completo", None)
                               or f"{getattr(u,'nombres','')} {getattr(u,'apellidos','')}".strip(),
            "rol":             u.rol.nombre if u.rol else None,
            "email":           getattr(u, "email", None),
        }
        for u in medicos
    ]


# ── CRUD general ──────────────────────────────────────────────

@router.get("/")
def listar(
    page:      int           = 1,
    page_size: int           = 20,
    medico_id: Optional[UUID] = None,
    fecha:     Optional[date] = None,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """
    Lista paginada de citas.
    - Admin: ve todas (con filtros opcionales).
    - Médico: solo ve las suyas, el filtro medico_id se ignora.
    """
    q = db.query(Cita).options(
        joinedload(Cita.tipo_cita),
        joinedload(Cita.estado_cita),
        joinedload(Cita.deportista),
        joinedload(Cita.medico),
    )

    if _es_admin(current_user):
        # Admin puede filtrar por cualquier médico
        if medico_id:
            q = q.filter(Cita.medico_id == medico_id)
    else:
        # Médico siempre ve solo sus citas
        q = q.filter(Cita.medico_id == current_user.id)

    if fecha:
        q = q.filter(Cita.fecha == fecha)

    total = q.count()
    citas = q.order_by(Cita.fecha, Cita.hora) \
             .offset((page - 1) * page_size) \
             .limit(page_size) \
             .all()

    return {"total": total, "page": page, "items": [_serializar(c) for c in citas]}


@router.post("/", status_code=201)
def crear(
    data: CitaCreate,
    db:   Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    # Admin puede asignar a cualquier médico
    # Médico solo puede crear citas asignadas a sí mismo
    if _es_admin(current_user):
        medico_id = data.medico_id or current_user.id
    else:
        # Médico no puede asignar a otro
        if data.medico_id and data.medico_id != current_user.id:
            raise HTTPException(
                status_code=403,
                detail="Solo puedes crear citas asignadas a ti mismo"
            )
        medico_id = current_user.id

    # Verificar conflicto de horario
    conflicto = db.query(Cita).filter(
        and_(
            Cita.medico_id == medico_id,
            Cita.fecha     == data.fecha,
            Cita.hora      == data.hora,
        )
    ).first()
    if conflicto:
        raise HTTPException(
            status_code=409,
            detail=f"El médico ya tiene una cita a las {data.hora} el {data.fecha}"
        )

    try:
        hora_obj = time.fromisoformat(data.hora)
    except ValueError:
        raise HTTPException(status_code=422, detail="Formato de hora inválido, use HH:MM")

    cita = Cita(
        deportista_id  = data.deportista_id,
        medico_id      = medico_id,
        fecha          = data.fecha,
        hora           = hora_obj,
        tipo_cita_id   = data.tipo_cita_id,
        estado_cita_id = data.estado_cita_id,
        observaciones  = data.observaciones,
    )
    db.add(cita)
    db.commit()
    db.refresh(cita)
    return _serializar(_cargar(db, cita.id))


@router.get("/deportista/{deportista_id}")
def por_deportista(
    deportista_id: UUID,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    q = db.query(Cita).options(
        joinedload(Cita.tipo_cita),
        joinedload(Cita.estado_cita),
        joinedload(Cita.deportista),
        joinedload(Cita.medico),
    ).filter(Cita.deportista_id == deportista_id)

    # Médico solo ve las citas del deportista que le corresponden
    if not _es_admin(current_user):
        q = q.filter(Cita.medico_id == current_user.id)

    return [_serializar(c) for c in q.order_by(Cita.fecha, Cita.hora).all()]


@router.get("/{cita_id}")
def obtener(
    cita_id: UUID,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    c = _cargar(db, cita_id)
    if not c:
        raise HTTPException(status_code=404, detail="Cita no encontrada")

    # Médico solo puede ver sus propias citas
    if not _es_admin(current_user) and c.medico_id != current_user.id:
        raise HTTPException(status_code=403, detail="No tienes acceso a esta cita")

    return _serializar(c)


@router.patch("/{cita_id}")
def actualizar(
    cita_id: UUID,
    data: CitaUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    c = db.query(Cita).filter(Cita.id == cita_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Cita no encontrada")

    # Solo admin o el médico dueño pueden editar
    if not _es_admin(current_user) and c.medico_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="Solo puedes editar tus propias citas"
        )

    # Médico no puede reasignar a otro médico
    if not _es_admin(current_user) and data.medico_id and data.medico_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="No puedes reasignar la cita a otro médico"
        )

    if data.medico_id      is not None: c.medico_id      = data.medico_id
    if data.fecha          is not None: c.fecha          = data.fecha
    if data.hora           is not None: c.hora           = time.fromisoformat(data.hora)
    if data.tipo_cita_id   is not None: c.tipo_cita_id   = data.tipo_cita_id
    if data.estado_cita_id is not None: c.estado_cita_id = data.estado_cita_id
    if data.observaciones  is not None: c.observaciones  = data.observaciones

    db.commit()
    return _serializar(_cargar(db, cita_id))


@router.delete("/{cita_id}", status_code=204)
def eliminar(
    cita_id: UUID,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    c = db.query(Cita).filter(Cita.id == cita_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Cita no encontrada")

    # Solo admin o el médico dueño pueden eliminar
    if not _es_admin(current_user) and c.medico_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="Solo puedes eliminar tus propias citas"
        )

    db.delete(c)
    db.commit()