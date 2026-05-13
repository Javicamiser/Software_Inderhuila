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


# ── Schemas ──────────────────────────────────────────────────
class CitaCreate(BaseModel):
    deportista_id:  UUID
    medico_id:      Optional[UUID] = None          # ← NUEVO
    fecha:          date
    hora:           str                            # "HH:MM"
    tipo_cita_id:   UUID
    estado_cita_id: UUID
    observaciones:  Optional[str] = None

class CitaUpdate(BaseModel):
    medico_id:      Optional[UUID] = None
    fecha:          Optional[date] = None
    hora:           Optional[str] = None
    tipo_cita_id:   Optional[UUID] = None
    estado_cita_id: Optional[UUID] = None
    observaciones:  Optional[str] = None


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
        "tipo_cita":      {"nombre": c.tipo_cita.nombre}  if c.tipo_cita  else None,
        "estado_cita":    {"nombre": c.estado_cita.nombre} if c.estado_cita else None,
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


# ── Rutas estáticas primero ───────────────────────────────────

@router.get("/hoy")
def citas_hoy(db: Session = Depends(get_db)):
    """Deportistas con citas agendadas para hoy."""
    from app.models.deportista import Deportista
    hoy = date.today()
    rows = db.query(Cita).options(
        joinedload(Cita.tipo_cita),
        joinedload(Cita.estado_cita),
        joinedload(Cita.deportista),
        joinedload(Cita.medico),
    ).filter(Cita.fecha == hoy).order_by(Cita.hora).all()
    return [_serializar(c) for c in rows]


@router.get("/agenda")
def agenda_medico(
    medico_id: UUID = Query(..., description="ID del médico"),
    fecha:     date = Query(..., description="Fecha a consultar (YYYY-MM-DD)"),
    db: Session = Depends(get_db),
):
    """
    Devuelve los slots del médico en la fecha indicada.
    Cada slot indica si está libre u ocupado.
    Usado en GestionCitas al seleccionar médico + fecha.
    """
    # Horas de atención: 07:00 - 17:00 cada 30 min
    from datetime import datetime, timedelta
    inicio   = datetime.strptime("07:00", "%H:%M")
    fin      = datetime.strptime("17:00", "%H:%M")
    delta    = timedelta(minutes=30)
    todos_slots = []
    cur = inicio
    while cur < fin:
        todos_slots.append(cur.strftime("%H:%M"))
        cur += delta

    # Citas ya agendadas para ese médico en esa fecha
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
            "hora":    hora,
            "libre":   cita is None,
            "cita": {
                "id":         str(cita.id),
                "deportista": f"{cita.deportista.nombres} {cita.deportista.apellidos}" if cita.deportista else "—",
                "tipo":       cita.tipo_cita.nombre if cita.tipo_cita else "—",
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
def listar_medicos(db: Session = Depends(get_db)):
    """Lista de usuarios con rol médico/profesional para el selector de citas."""
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
    page:      int = 1,
    page_size: int = 20,
    medico_id: Optional[UUID] = None,
    fecha:     Optional[date] = None,
    db: Session = Depends(get_db),
):
    q = db.query(Cita).options(
        joinedload(Cita.tipo_cita),
        joinedload(Cita.estado_cita),
        joinedload(Cita.deportista),
        joinedload(Cita.medico),
    )
    if medico_id:
        q = q.filter(Cita.medico_id == medico_id)
    if fecha:
        q = q.filter(Cita.fecha == fecha)
    total  = q.count()
    citas  = q.order_by(Cita.fecha, Cita.hora).offset((page - 1) * page_size).limit(page_size).all()
    return {"total": total, "page": page, "items": [_serializar(c) for c in citas]}


@router.post("/", status_code=201)
def crear(
    data: CitaCreate,
    db:   Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    # Si no se especifica médico, asignar al usuario logueado
    medico_id = data.medico_id or current_user.id

    # Verificar conflicto de horario para ese médico
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
            detail=f"El médico ya tiene una cita agendada a las {data.hora} el {data.fecha}"
        )

    try:
        hora_obj = time.fromisoformat(data.hora)
    except ValueError:
        raise HTTPException(status_code=422, detail="Formato de hora inválido, use HH:MM")

    cita = Cita(
        deportista_id  = data.deportista_id,
        medico_id      = medico_id,                # ← asignado
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
def por_deportista(deportista_id: UUID, db: Session = Depends(get_db)):
    citas = db.query(Cita).options(
        joinedload(Cita.tipo_cita),
        joinedload(Cita.estado_cita),
        joinedload(Cita.deportista),
        joinedload(Cita.medico),
    ).filter(Cita.deportista_id == deportista_id).order_by(Cita.fecha, Cita.hora).all()
    return [_serializar(c) for c in citas]


@router.get("/{cita_id}")
def obtener(cita_id: UUID, db: Session = Depends(get_db)):
    c = _cargar(db, cita_id)
    if not c:
        raise HTTPException(status_code=404, detail="Cita no encontrada")
    return _serializar(c)


@router.patch("/{cita_id}")
def actualizar(cita_id: UUID, data: CitaUpdate, db: Session = Depends(get_db)):
    c = db.query(Cita).filter(Cita.id == cita_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Cita no encontrada")

    if data.medico_id   is not None: c.medico_id      = data.medico_id
    if data.fecha        is not None: c.fecha          = data.fecha
    if data.hora         is not None: c.hora           = time.fromisoformat(data.hora)
    if data.tipo_cita_id is not None: c.tipo_cita_id   = data.tipo_cita_id
    if data.estado_cita_id is not None: c.estado_cita_id = data.estado_cita_id
    if data.observaciones is not None: c.observaciones = data.observaciones

    db.commit()
    return _serializar(_cargar(db, cita_id))


@router.delete("/{cita_id}", status_code=204)
def eliminar(cita_id: UUID, db: Session = Depends(get_db)):
    c = db.query(Cita).filter(Cita.id == cita_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Cita no encontrada")
    db.delete(c)
    db.commit()