"""
Módulo de Reportes — INDERHUILA
Endpoints para el director: KPIs, historias, citas, deportistas, diagnósticos, médicos.
"""
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func, case, and_, or_, text
from datetime import date, datetime, timedelta
from typing import Optional
from uuid import UUID

from app.core.dependencies import get_db, get_current_user
from app.models.deportista import Deportista
from app.models.historia import HistoriaClinica
from app.models.cita import Cita
from app.models.usuario import Usuario
from app.models.catalogo import CatalogoItem

router = APIRouter(prefix="/reportes", tags=["Reportes"])


# =============================================================================
# HELPERS
# =============================================================================

def _edad(fecha_nac: date) -> int:
    hoy = date.today()
    return hoy.year - fecha_nac.year - ((hoy.month, hoy.day) < (fecha_nac.month, fecha_nac.day))


def _inicio_mes(año: int, mes: int) -> date:
    return date(año, mes, 1)


def _fin_mes(año: int, mes: int) -> date:
    if mes == 12:
        return date(año + 1, 1, 1) - timedelta(days=1)
    return date(año, mes + 1, 1) - timedelta(days=1)


# =============================================================================
# 1. RESUMEN GENERAL (KPIs)
# =============================================================================

@router.get("/resumen")
def resumen_general(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """
    KPIs principales para el panel del director.
    """
    hoy     = date.today()
    mes_act = hoy.replace(day=1)
    mes_ant = (mes_act - timedelta(days=1)).replace(day=1)

    # Estado activo
    estado_activo = db.query(CatalogoItem).filter(
        CatalogoItem.nombre.ilike('%activ%')
    ).first()
    estado_activo_id = estado_activo.id if estado_activo else None

    # Total deportistas activos
    total_deportistas = db.query(func.count(Deportista.id)).filter(
        Deportista.estado_id == estado_activo_id
    ).scalar() or 0

    # Historias este mes
    historias_mes_actual = db.query(func.count(HistoriaClinica.id)).filter(
        HistoriaClinica.fecha_apertura >= mes_act,
        HistoriaClinica.fecha_apertura <= hoy,
    ).scalar() or 0

    # Historias mes anterior
    historias_mes_anterior = db.query(func.count(HistoriaClinica.id)).filter(
        HistoriaClinica.fecha_apertura >= mes_ant,
        HistoriaClinica.fecha_apertura < mes_act,
    ).scalar() or 0

    # Variación %
    if historias_mes_anterior > 0:
        variacion_historias = round(
            (historias_mes_actual - historias_mes_anterior) / historias_mes_anterior * 100, 1
        )
    else:
        variacion_historias = 100.0 if historias_mes_actual > 0 else 0.0

    # Citas hoy pendientes (no atendidas, no canceladas)
    estados_excluir = ['atendida', 'cancelada', 'no presentado', 'no presentada']
    citas_hoy = db.query(func.count(Cita.id)).join(
        CatalogoItem, Cita.estado_cita_id == CatalogoItem.id
    ).filter(
        Cita.fecha == hoy,
        ~func.lower(CatalogoItem.nombre).in_(estados_excluir),
    ).scalar() or 0

    # Deportistas no aptos (diagnóstico con aptitud no apto)
    # Busca en aptitud_medica si existe, si no aproxima por diagnósticos con "lesion" o "no apto"
    try:
        from app.models.antecedentes import AptitudMedica
        no_aptos = db.query(func.count(func.distinct(AptitudMedica.historia_clinica_id))).filter(
            func.lower(AptitudMedica.resultado).in_(['no apto', 'no_apto', 'inhabilitado'])
        ).scalar() or 0
    except Exception:
        no_aptos = 0

    # Deportistas sin historia clínica
    sin_historia = db.query(func.count(Deportista.id)).filter(
        ~Deportista.id.in_(
            db.query(HistoriaClinica.deportista_id).distinct()
        )
    ).scalar() or 0

    # Citas sin realizar: fecha pasada, no atendida, sin historia ese día
    estado_atendida = db.query(CatalogoItem).filter(
        func.lower(CatalogoItem.nombre) == 'atendida'
    ).first()
    estado_cancelada = db.query(CatalogoItem).filter(
        func.lower(CatalogoItem.nombre) == 'cancelada'
    ).first()

    citas_sin_realizar_q = db.query(func.count(Cita.id)).filter(
        Cita.fecha < hoy,
    )
    if estado_atendida:
        citas_sin_realizar_q = citas_sin_realizar_q.filter(
            Cita.estado_cita_id != estado_atendida.id
        )
    if estado_cancelada:
        citas_sin_realizar_q = citas_sin_realizar_q.filter(
            Cita.estado_cita_id != estado_cancelada.id
        )
    citas_sin_realizar = citas_sin_realizar_q.scalar() or 0

    return {
        "fecha_reporte":          str(hoy),
        "total_deportistas":      total_deportistas,
        "historias_mes_actual":   historias_mes_actual,
        "historias_mes_anterior": historias_mes_anterior,
        "variacion_historias":    variacion_historias,
        "citas_pendientes_hoy":   citas_hoy,
        "deportistas_no_aptos":   no_aptos,
        "deportistas_sin_historia": sin_historia,
        "citas_sin_realizar":     citas_sin_realizar,
    }


# =============================================================================
# 2. HISTORIAS CLÍNICAS
# =============================================================================

@router.get("/historias/por-mes")
def historias_por_mes(
    meses: int = Query(6, ge=1, le=24),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Número de historias clínicas por mes (últimos N meses)."""
    hoy = date.today()
    resultado = []

    for i in range(meses - 1, -1, -1):
        # Calcular mes
        mes_offset = hoy.month - i - 1
        año_offset = hoy.year + mes_offset // 12
        mes_real   = mes_offset % 12
        if mes_real <= 0:
            mes_real   += 12
            año_offset -= 1

        inicio = _inicio_mes(año_offset, mes_real)
        fin    = _fin_mes(año_offset, mes_real)

        count = db.query(func.count(HistoriaClinica.id)).filter(
            HistoriaClinica.fecha_apertura >= inicio,
            HistoriaClinica.fecha_apertura <= fin,
        ).scalar() or 0

        resultado.append({
            "mes":    inicio.strftime("%b %Y"),
            "año":    año_offset,
            "mes_num": mes_real,
            "total":  count,
        })

    return resultado


@router.get("/historias/sin-realizar")
def historias_sin_realizar(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """
    Citas con fecha pasada que no tienen historia clínica creada
    (no atendidas, no canceladas).
    """
    hoy = date.today()

    estados_ok = db.query(CatalogoItem).filter(
        func.lower(CatalogoItem.nombre).in_(['atendida', 'cancelada', 'no presentado', 'no presentada'])
    ).all()
    ids_ok = [e.id for e in estados_ok]

    citas_q = db.query(Cita).filter(Cita.fecha < hoy)
    if ids_ok:
        citas_q = citas_q.filter(~Cita.estado_cita_id.in_(ids_ok))

    citas = citas_q.order_by(Cita.fecha.desc()).limit(100).all()

    # Verificar cuáles tienen historia ese día
    resultado = []
    for c in citas:
        tiene_historia = db.query(func.count(HistoriaClinica.id)).filter(
            HistoriaClinica.deportista_id == c.deportista_id,
            HistoriaClinica.fecha_apertura == c.fecha,
        ).scalar() or 0

        if not tiene_historia:
            dep = c.deportista
            med = c.medico
            resultado.append({
                "cita_id":    str(c.id),
                "fecha":      str(c.fecha),
                "hora":       str(c.hora),
                "deportista": f"{dep.nombres} {dep.apellidos}" if dep else "—",
                "documento":  dep.numero_documento if dep else "—",
                "medico":     med.nombre_completo if med else "—",
                "tipo_cita":  c.tipo_cita.nombre if c.tipo_cita else "—",
                "estado":     c.estado_cita.nombre if c.estado_cita else "—",
                "dias_vencida": (hoy - c.fecha).days,
            })

    return {"total": len(resultado), "items": resultado}


@router.get("/historias/por-medico")
def historias_por_medico(
    fecha_inicio: Optional[date] = None,
    fecha_fin:    Optional[date] = None,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Historias clínicas agrupadas por médico en un período."""
    hoy = date.today()
    fi  = fecha_inicio or hoy.replace(day=1)
    ff  = fecha_fin    or hoy

    rows = db.query(
        Usuario.nombre_completo,
        func.count(HistoriaClinica.id).label("total"),
    ).join(
        HistoriaClinica, HistoriaClinica.medico_id == Usuario.id
    ).filter(
        HistoriaClinica.fecha_apertura >= fi,
        HistoriaClinica.fecha_apertura <= ff,
    ).group_by(Usuario.nombre_completo).order_by(
        func.count(HistoriaClinica.id).desc()
    ).all()

    return [{"medico": r.nombre_completo, "total": r.total} for r in rows]


@router.get("/historias/por-tipo-consulta")
def historias_por_tipo(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Historias agrupadas por tipo de cita (valoración inicial, control, etc.)."""
    rows = db.query(
        CatalogoItem.nombre.label("tipo"),
        func.count(Cita.id).label("total"),
    ).join(
        Cita, Cita.tipo_cita_id == CatalogoItem.id
    ).group_by(CatalogoItem.nombre).order_by(
        func.count(Cita.id).desc()
    ).all()

    return [{"tipo": r.tipo, "total": r.total} for r in rows]


# =============================================================================
# 3. DEPORTISTAS
# =============================================================================

@router.get("/deportistas/por-disciplina")
def deportistas_por_disciplina(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Deportistas agrupados por disciplina deportiva."""
    rows = db.query(
        func.coalesce(Deportista.tipo_deporte, 'Sin disciplina').label("disciplina"),
        func.count(Deportista.id).label("total"),
    ).group_by(
        func.coalesce(Deportista.tipo_deporte, 'Sin disciplina')
    ).order_by(func.count(Deportista.id).desc()).all()

    return [{"disciplina": r.disciplina, "total": r.total} for r in rows]


@router.get("/deportistas/sin-historia")
def deportistas_sin_historia(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Deportistas que nunca han tenido una historia clínica."""
    deps = db.query(Deportista).filter(
        ~Deportista.id.in_(
            db.query(HistoriaClinica.deportista_id).distinct()
        )
    ).order_by(Deportista.apellidos).all()

    return {
        "total": len(deps),
        "items": [
            {
                "id":           str(d.id),
                "nombre":       f"{d.nombres} {d.apellidos}",
                "documento":    d.numero_documento,
                "disciplina":   d.tipo_deporte or "—",
                "fecha_registro": str(d.created_at.date()) if d.created_at else "—",
            }
            for d in deps
        ],
    }


@router.get("/deportistas/sin-cita-reciente")
def deportistas_sin_cita_reciente(
    dias: int = Query(90, ge=1, le=365),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Deportistas sin cita en los últimos N días."""
    corte = date.today() - timedelta(days=dias)

    con_cita_reciente = db.query(Cita.deportista_id).filter(
        Cita.fecha >= corte
    ).distinct().subquery()

    deps = db.query(Deportista).filter(
        ~Deportista.id.in_(con_cita_reciente)
    ).order_by(Deportista.apellidos).all()

    return {
        "dias":  dias,
        "total": len(deps),
        "items": [
            {
                "id":        str(d.id),
                "nombre":    f"{d.nombres} {d.apellidos}",
                "documento": d.numero_documento,
                "disciplina": d.tipo_deporte or "—",
            }
            for d in deps
        ],
    }


@router.get("/deportistas/no-aptos")
def deportistas_no_aptos(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Deportistas con aptitud médica 'no apto' en su última historia."""
    try:
        from app.models.antecedentes import AptitudMedica

        rows = db.query(
            Deportista.nombres,
            Deportista.apellidos,
            Deportista.numero_documento,
            Deportista.tipo_deporte,
            AptitudMedica.resultado,
            AptitudMedica.observaciones,
            HistoriaClinica.fecha_apertura,
        ).join(
            HistoriaClinica, HistoriaClinica.deportista_id == Deportista.id
        ).join(
            AptitudMedica, AptitudMedica.historia_clinica_id == HistoriaClinica.id
        ).filter(
            func.lower(AptitudMedica.resultado).in_(['no apto', 'no_apto', 'inhabilitado'])
        ).order_by(HistoriaClinica.fecha_apertura.desc()).all()

        return {
            "total": len(rows),
            "items": [
                {
                    "nombre":       f"{r.nombres} {r.apellidos}",
                    "documento":    r.numero_documento,
                    "disciplina":   r.tipo_deporte or "—",
                    "resultado":    r.resultado,
                    "observaciones": r.observaciones or "—",
                    "fecha":        str(r.fecha_apertura),
                }
                for r in rows
            ],
        }
    except Exception as e:
        return {"total": 0, "items": [], "nota": f"Tabla aptitud_medica no disponible: {str(e)}"}


# =============================================================================
# 4. CITAS
# =============================================================================

@router.get("/citas/resumen-estados")
def citas_resumen_estados(
    fecha_inicio: Optional[date] = None,
    fecha_fin:    Optional[date] = None,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Citas agrupadas por estado (dona)."""
    hoy = date.today()
    fi  = fecha_inicio or hoy.replace(month=1, day=1)
    ff  = fecha_fin    or hoy

    rows = db.query(
        CatalogoItem.nombre.label("estado"),
        func.count(Cita.id).label("total"),
    ).join(
        Cita, Cita.estado_cita_id == CatalogoItem.id
    ).filter(
        Cita.fecha >= fi,
        Cita.fecha <= ff,
    ).group_by(CatalogoItem.nombre).order_by(
        func.count(Cita.id).desc()
    ).all()

    total = sum(r.total for r in rows)
    return {
        "periodo": {"inicio": str(fi), "fin": str(ff)},
        "total":   total,
        "items": [
            {
                "estado":     r.estado,
                "total":      r.total,
                "porcentaje": round(r.total / total * 100, 1) if total > 0 else 0,
            }
            for r in rows
        ],
    }


@router.get("/citas/por-mes")
def citas_por_mes(
    meses: int = Query(6, ge=1, le=24),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Citas por mes, desglosadas por estado."""
    hoy = date.today()
    resultado = []

    for i in range(meses - 1, -1, -1):
        mes_offset = hoy.month - i - 1
        año_offset = hoy.year + mes_offset // 12
        mes_real   = mes_offset % 12
        if mes_real <= 0:
            mes_real   += 12
            año_offset -= 1

        inicio = _inicio_mes(año_offset, mes_real)
        fin    = _fin_mes(año_offset, mes_real)

        rows = db.query(
            CatalogoItem.nombre.label("estado"),
            func.count(Cita.id).label("total"),
        ).join(
            Cita, Cita.estado_cita_id == CatalogoItem.id
        ).filter(
            Cita.fecha >= inicio,
            Cita.fecha <= fin,
        ).group_by(CatalogoItem.nombre).all()

        mes_data = {"mes": inicio.strftime("%b %Y"), "total": 0}
        for r in rows:
            mes_data[r.estado.lower().replace(" ", "_")] = r.total
            mes_data["total"] += r.total

        resultado.append(mes_data)

    return resultado


@router.get("/citas/ausentismo-por-medico")
def ausentismo_por_medico(
    fecha_inicio: Optional[date] = None,
    fecha_fin:    Optional[date] = None,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Tasa de ausentismo (no presentados / total) por médico."""
    hoy = date.today()
    fi  = fecha_inicio or hoy.replace(month=1, day=1)
    ff  = fecha_fin    or hoy

    estado_np = db.query(CatalogoItem).filter(
        func.lower(CatalogoItem.nombre).in_(['no presentado', 'no presentada'])
    ).first()

    rows = db.query(
        Usuario.nombre_completo.label("medico"),
        func.count(Cita.id).label("total"),
        func.count(
            case((Cita.estado_cita_id == estado_np.id, 1), else_=None)
        ).label("no_presentados") if estado_np else func.count(None).label("no_presentados"),
    ).join(
        Cita, Cita.medico_id == Usuario.id
    ).filter(
        Cita.fecha >= fi,
        Cita.fecha <= ff,
    ).group_by(Usuario.nombre_completo).order_by(
        func.count(Cita.id).desc()
    ).all()

    return [
        {
            "medico":         r.medico,
            "total":          r.total,
            "no_presentados": r.no_presentados,
            "tasa_ausentismo": round(r.no_presentados / r.total * 100, 1) if r.total > 0 else 0,
        }
        for r in rows
    ]


# =============================================================================
# 5. DIAGNÓSTICOS
# =============================================================================

@router.get("/diagnosticos/top")
def top_diagnosticos(
    limite: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Top N diagnósticos más frecuentes."""
    from app.models.antecedentes import Diagnosticos

    rows = db.query(
        Diagnosticos.nombre_enfermedad,
        Diagnosticos.codigo_cie11,
        func.count(Diagnosticos.id).label("total"),
    ).group_by(
        Diagnosticos.nombre_enfermedad,
        Diagnosticos.codigo_cie11,
    ).order_by(func.count(Diagnosticos.id).desc()).limit(limite).all()

    return [
        {
            "diagnostico": r.nombre_enfermedad,
            "codigo_cie11": r.codigo_cie11 or "—",
            "total":        r.total,
        }
        for r in rows
    ]


@router.get("/diagnosticos/por-disciplina")
def diagnosticos_por_disciplina(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Top diagnósticos agrupados por disciplina deportiva."""
    from app.models.antecedentes import Diagnosticos

    rows = db.query(
        func.coalesce(Deportista.tipo_deporte, 'Sin disciplina').label("disciplina"),
        Diagnosticos.nombre_enfermedad,
        func.count(Diagnosticos.id).label("total"),
    ).join(
        HistoriaClinica, HistoriaClinica.id == Diagnosticos.historia_clinica_id
    ).join(
        Deportista, Deportista.id == HistoriaClinica.deportista_id
    ).group_by(
        func.coalesce(Deportista.tipo_deporte, 'Sin disciplina'),
        Diagnosticos.nombre_enfermedad,
    ).order_by(
        func.coalesce(Deportista.tipo_deporte, 'Sin disciplina'),
        func.count(Diagnosticos.id).desc(),
    ).all()

    # Agrupar por disciplina, top 5 cada una
    agrupado: dict = {}
    for r in rows:
        if r.disciplina not in agrupado:
            agrupado[r.disciplina] = []
        if len(agrupado[r.disciplina]) < 5:
            agrupado[r.disciplina].append({
                "diagnostico": r.nombre_enfermedad,
                "total":       r.total,
            })

    return [
        {"disciplina": d, "diagnosticos": items}
        for d, items in agrupado.items()
    ]


# =============================================================================
# 6. CARGA DE TRABAJO POR MÉDICO
# =============================================================================

@router.get("/medicos/carga-trabajo")
def carga_trabajo_medicos(
    fecha_inicio: Optional[date] = None,
    fecha_fin:    Optional[date] = None,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Historias y citas atendidas por médico en un período."""
    hoy = date.today()
    fi  = fecha_inicio or hoy.replace(month=1, day=1)
    ff  = fecha_fin    or hoy

    # Historias por médico
    historias_rows = db.query(
        Usuario.id.label("medico_id"),
        Usuario.nombre_completo.label("medico"),
        func.count(HistoriaClinica.id).label("historias"),
    ).join(
        HistoriaClinica, HistoriaClinica.medico_id == Usuario.id
    ).filter(
        HistoriaClinica.fecha_apertura >= fi,
        HistoriaClinica.fecha_apertura <= ff,
    ).group_by(Usuario.id, Usuario.nombre_completo).all()

    historias_map = {str(r.medico_id): r.historias for r in historias_rows}
    medicos_map   = {str(r.medico_id): r.medico    for r in historias_rows}

    # Citas atendidas por médico
    estado_atendida = db.query(CatalogoItem).filter(
        func.lower(CatalogoItem.nombre) == 'atendida'
    ).first()

    citas_q = db.query(
        Usuario.id.label("medico_id"),
        Usuario.nombre_completo.label("medico"),
        func.count(Cita.id).label("citas_atendidas"),
    ).join(
        Cita, Cita.medico_id == Usuario.id
    ).filter(
        Cita.fecha >= fi,
        Cita.fecha <= ff,
    )
    if estado_atendida:
        citas_q = citas_q.filter(Cita.estado_cita_id == estado_atendida.id)

    citas_rows = citas_q.group_by(Usuario.id, Usuario.nombre_completo).all()

    citas_map = {str(r.medico_id): r.citas_atendidas for r in citas_rows}

    # Unir ambos
    todos_ids = set(historias_map.keys()) | set(citas_map.keys())
    # Agregar médicos que solo tienen citas
    for r in citas_rows:
        mid = str(r.medico_id)
        if mid not in medicos_map:
            medicos_map[mid] = r.medico

    resultado = []
    for mid in todos_ids:
        resultado.append({
            "medico":          medicos_map.get(mid, "—"),
            "historias":       historias_map.get(mid, 0),
            "citas_atendidas": citas_map.get(mid, 0),
        })

    resultado.sort(key=lambda x: x["historias"], reverse=True)

    return {
        "periodo": {"inicio": str(fi), "fin": str(ff)},
        "items":   resultado,
    }


# =============================================================================
# 7. ENDPOINT COMPLETO (un solo request para el dashboard)
# =============================================================================

@router.get("/dashboard")
def dashboard_completo(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """
    Todos los datos del dashboard en una sola llamada.
    Útil para cargar el módulo de reportes de una vez.
    """
    try:
        kpis             = resumen_general(db=db, current_user=current_user)
        hist_mes         = historias_por_mes(meses=6, db=db, current_user=current_user)
        por_disciplina   = deportistas_por_disciplina(db=db, current_user=current_user)
        estados_citas    = citas_resumen_estados(db=db, current_user=current_user)
        citas_mes        = citas_por_mes(meses=6, db=db, current_user=current_user)
        top_diag         = top_diagnosticos(limite=10, db=db, current_user=current_user)
        carga            = carga_trabajo_medicos(db=db, current_user=current_user)
        sin_historia     = deportistas_sin_historia(db=db, current_user=current_user)

        return {
            "kpis":                    kpis,
            "historias_por_mes":       hist_mes,
            "deportistas_disciplina":  por_disciplina,
            "citas_estados":           estados_citas,
            "citas_por_mes":           citas_mes,
            "top_diagnosticos":        top_diag,
            "carga_medicos":           carga,
            "sin_historia":            sin_historia,
        }
    except Exception as e:
        import traceback; traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error generando dashboard: {str(e)}")