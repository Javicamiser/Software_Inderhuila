"""
Endpoint para generar y descargar documentos medicos
INDERHUILA - Instituto Departamental de Recreacion y Deportes del Huila
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from uuid import UUID
from typing import Optional, List
import base64 as _b64

from app.core.dependencies import get_db
from app.models.historia import HistoriaClinica
from app.models.deportista import Deportista
from app.models.usuario import Usuario
from app.services.documento_service import generar_documento_historia_clinica
from app.crud.historia import obtener_motivo_consulta, obtener_exploracion_fisica
from app.services.documento_service import (
       generar_documento_historia_clinica,
       generar_epicrisis,
       generar_receta_medica,
       generar_interconsulta,
)
try:
    from app.services.email_service import (
        enviar_email_con_pdf,
        generar_html_historia_clinica,
        generar_texto_plano_historia_clinica,
    )
    EMAIL_SERVICE_DISPONIBLE = True
except ImportError:
    EMAIL_SERVICE_DISPONIBLE = False

router = APIRouter(prefix="/documentos", tags=["Documentos"])


# =============================================================================
# SECCIONES VÁLIDAS
# =============================================================================
SECCIONES_VALIDAS = {
    "motivo_consulta", "antecedentes", "revision_sistemas",
    "signos_vitales", "exploracion_fisica", "pruebas_complementarias",
    "diagnosticos", "plan_tratamiento", "remisiones",
}


# =============================================================================
# HELPERS INTERNOS
# =============================================================================
def filtrar_datos_por_secciones(datos_completos: dict, secciones: List[str]) -> dict:
    if not secciones:
        return datos_completos
    secciones_set = set(secciones)
    if secciones_set == SECCIONES_VALIDAS:
        return datos_completos

    d = dict(datos_completos)
    if "motivo_consulta"       not in secciones_set: d["motivo_consulta_enfermedad"]  = None
    if "antecedentes"          not in secciones_set:
        for k in ("antecedentes_personales","antecedentes_familiares","lesiones_deportivas",
                  "cirugias_previas","alergias","medicaciones","vacunas_administradas"):
            d[k] = []
    if "revision_sistemas"     not in secciones_set: d["revision_sistemas"]           = []
    if "signos_vitales"        not in secciones_set: d["signos_vitales"]              = []
    if "exploracion_fisica"    not in secciones_set: d["exploracion_fisica_sistemas"] = None
    if "pruebas_complementarias" not in secciones_set: d["pruebas_complementarias"]  = []
    if "diagnosticos"          not in secciones_set: d["diagnosticos"]                = []
    if "plan_tratamiento"      not in secciones_set: d["plan_tratamiento"]            = []
    if "remisiones"            not in secciones_set: d["remisiones_especialistas"]    = []
    return d


def obtener_datos_historia_completa(db: Session, historia_id: str) -> dict:
    """Construye el dict completo con todos los datos de la historia para PDF y JSON."""
    try:
        historia_uuid = UUID(historia_id)
    except (ValueError, TypeError):
        historia_uuid = historia_id

    h = db.query(HistoriaClinica).filter(HistoriaClinica.id == historia_uuid).first()
    if not h:
        return None

    # Motivo consulta
    motivo_consulta_data = None
    try:
        motivos = obtener_motivo_consulta(db, historia_uuid)
        if motivos:
            m = motivos[0]
            motivo_consulta_data = {
                "id":                    str(m.id),
                "motivo_consulta":       getattr(m, 'motivo_consulta', None),
                "sintomas_principales":  getattr(m, 'sintomas_principales', None),
                "duracion_sintomas":     getattr(m, 'duracion_sintomas', None),
                "inicio_enfermedad":     getattr(m, 'inicio_enfermedad', None),
                "evolucion":             getattr(m, 'evolucion', None),
                "factor_desencadenante": getattr(m, 'factor_desencadenante', None),
                "medicamentos_previos":  getattr(m, 'medicamentos_previos', None),
                "tipo_cita":             getattr(m, 'tipo_cita', None),
                "enfermedad_actual":     getattr(m, 'enfermedad_actual', None),
            }
    except Exception as e:
        print(f"Advertencia obtener_motivo_consulta: {e}")

    # Exploración física
    exploracion_fisica_data = None
    try:
        exploraciones = obtener_exploracion_fisica(db, historia_uuid)
        if exploraciones:
            e = exploraciones[0]
            exploracion_fisica_data = {
                "id":                       str(e.id),
                "sistema_cardiovascular":   getattr(e, 'sistema_cardiovascular', None),
                "sistema_respiratorio":     getattr(e, 'sistema_respiratorio', None),
                "sistema_digestivo":        getattr(e, 'sistema_digestivo', None),
                "sistema_neurologico":      getattr(e, 'sistema_neurologico', None),
                "sistema_genitourinario":   getattr(e, 'sistema_genitourinario', None),
                "sistema_musculoesqueletico": getattr(e, 'sistema_musculoesqueletico', None),
                "sistema_integumentario":   getattr(e, 'sistema_integumentario', None),
                "sistema_endocrino":        getattr(e, 'sistema_endocrino', None),
                "cabeza_cuello":            getattr(e, 'cabeza_cuello', None),
                "extremidades":             getattr(e, 'extremidades', None),
                "observaciones_generales":  getattr(e, 'observaciones_generales', None),
            }
    except Exception as e:
        print(f"Advertencia obtener_exploracion_fisica: {e}")

    deportista = db.query(Deportista).filter(Deportista.id == h.deportista_id).first()
    deportista_data = None
    if deportista:
        deportista_data = {
            "id":               str(deportista.id),
            "nombres":          deportista.nombres,
            "apellidos":        deportista.apellidos,
            "numero_documento": str(deportista.numero_documento),
            "fecha_nacimiento": str(deportista.fecha_nacimiento) if getattr(deportista,'fecha_nacimiento',None) else None,
            "telefono":         getattr(deportista,'telefono',None) or getattr(deportista,'celular',None),
            "email":            getattr(deportista,'email',None),
            "deporte":          getattr(deportista,'tipo_deporte',None) or getattr(deportista,'deporte',None),
            "eps":              getattr(deportista,'eps',None),
            "grupo_sanguineo":  getattr(deportista,'grupo_sanguineo',None),
        }

    return {
        "id":           str(h.id),
        "deportista_id":str(h.deportista_id),
        "fecha_apertura": str(h.fecha_apertura) if h.fecha_apertura else None,
        "estado_id":    str(h.estado_id) if h.estado_id else None,
        "created_at":   str(h.created_at) if h.created_at else None,
        "deportista":   deportista_data,

        "antecedentes_personales": [
            {"id": str(a.id), "codigo_cie11": a.codigo_cie11,
             "nombre_enfermedad": a.nombre_enfermedad,
             "observaciones": getattr(a,'observaciones',None)}
            for a in (h.antecedentes_personales or [])
        ],
        "antecedentes_familiares": [
            {"id": str(a.id), "tipo_familiar": a.tipo_familiar,
             "codigo_cie11": a.codigo_cie11, "nombre_enfermedad": a.nombre_enfermedad}
            for a in (h.antecedentes_familiares or [])
        ],
        "lesiones_deportivas": [
            {"id": str(l.id),
             "descripcion":         getattr(l,'descripcion',None) or getattr(l,'tipo_lesion',None),
             "tipo_lesion":         getattr(l,'tipo_lesion',None),
             "fecha_ultima_lesion": str(getattr(l,'fecha_ultima_lesion',None) or getattr(l,'fecha_lesion',None))
                                    if (getattr(l,'fecha_ultima_lesion',None) or getattr(l,'fecha_lesion',None)) else None,
             "observaciones":       getattr(l,'observaciones',None) or getattr(l,'tratamiento',None)}
            for l in (h.lesiones_deportivas or [])
        ],
        "cirugias_previas": [
            {"id": str(c.id), "tipo_cirugia": c.tipo_cirugia,
             "fecha_cirugia": str(c.fecha_cirugia) if c.fecha_cirugia else None,
             "observaciones": getattr(c,'observaciones',None)}
            for c in (h.cirugias_previas or [])
        ],
        "alergias": [
            {"id": str(a.id), "tipo_alergia": a.tipo_alergia,
             "descripcion":  getattr(a,'descripcion',None),
             "reaccion":     getattr(a,'reaccion',None),
             "observaciones": getattr(a,'observaciones',None) or getattr(a,'descripcion',None)}
            for a in (h.alergias or [])
        ],
        "medicaciones": [
            {"id": str(m.id),
             "nombre_medicacion":  getattr(m,'nombre_medicacion',None) or getattr(m,'nombre_medicamento',None),
             "nombre_medicamento": getattr(m,'nombre_medicamento',None),
             "dosis":              getattr(m,'dosis',None),
             "frecuencia":         getattr(m,'frecuencia',None),
             "observaciones":      getattr(m,'observaciones',None) or getattr(m,'indicacion',None)}
            for m in (h.medicaciones or [])
        ],
        "vacunas_administradas": [
            {"id": str(v.id), "nombre_vacuna": v.nombre_vacuna,
             "fecha_administracion": str(getattr(v,'fecha_administracion',None))
                                     if getattr(v,'fecha_administracion',None) else None,
             "observaciones": getattr(v,'observaciones',None)}
            for v in (getattr(h,'vacunas_administradas',None) or [])
        ],
        "revision_sistemas": [
            {"id": str(r.id), "sistema_nombre": r.sistema_nombre,
             "estado": r.estado, "observaciones": getattr(r,'observaciones',None)}
            for r in (getattr(h,'revision_sistemas',None) or [])
        ],
        "signos_vitales": [
            {"id": str(sv.id),
             "estatura_cm":                  getattr(sv,'estatura_cm',None),
             "peso_kg":                      getattr(sv,'peso_kg',None),
             "imc":                          getattr(sv,'imc',None),
             "frecuencia_cardiaca_lpm":      getattr(sv,'frecuencia_cardiaca_lpm',None),
             "presion_arterial_sistolica":   getattr(sv,'presion_arterial_sistolica',None),
             "presion_arterial_diastolica":  getattr(sv,'presion_arterial_diastolica',None),
             "frecuencia_respiratoria_rpm":  getattr(sv,'frecuencia_respiratoria_rpm',None),
             "temperatura_celsius":          getattr(sv,'temperatura_celsius',None),
             "saturacion_oxigeno_percent":   getattr(sv,'saturacion_oxigeno_percent',None)}
            for sv in (getattr(h,'signos_vitales',None) or [])
        ],
        "pruebas_complementarias": [
            {"id": str(p.id), "categoria": getattr(p,'categoria',None),
             "nombre_prueba": getattr(p,'nombre_prueba',None),
             "codigo_cups":   getattr(p,'codigo_cups',None),
             "resultado":     getattr(p,'resultado',None)}
            for p in (getattr(h,'pruebas_complementarias',None) or [])
        ],
        "diagnosticos": [
            {"id": str(d.id), "codigo_cie11": d.codigo_cie11,
             "nombre_enfermedad":    d.nombre_enfermedad,
             "observaciones":        getattr(d,'observaciones',None),
             "analisis_objetivo":    getattr(d,'analisis_objetivo',None),
             "impresion_diagnostica":getattr(d,'impresion_diagnostica',None),
             "tipo_diagnostico":     getattr(d,'tipo_diagnostico',None)}
            for d in (h.diagnosticos or [])
        ],
        "plan_tratamiento": [
            {"id": str(p.id),
             "indicaciones_medicas":          getattr(p,'indicaciones_medicas',None),
             "recomendaciones_entrenamiento":  getattr(p,'recomendaciones_entrenamiento',None),
             "plan_seguimiento":               getattr(p,'plan_seguimiento',None),
             "tratamiento_farmacologico":      getattr(p,'tratamiento_farmacologico',None),
             "tratamiento_no_farmacologico":   getattr(p,'tratamiento_no_farmacologico',None),
             "recomendaciones":                getattr(p,'recomendaciones',None),
             "interconsultas":                 getattr(p,'interconsultas',None),
             "proxima_cita":                   getattr(p,'proxima_cita',None)}
            for p in (getattr(h,'plan_tratamiento',None) or [])
        ],
        "remisiones_especialistas": [
            {"id": str(r.id), "especialista": r.especialista,
             "motivo": r.motivo, "prioridad": r.prioridad,
             "fecha_remision": str(getattr(r,'fecha_remision',None)) if getattr(r,'fecha_remision',None) else None}
            for r in (h.remisiones_especialistas or [])
        ],
        "motivo_consulta_enfermedad":  motivo_consulta_data,
        "exploracion_fisica_sistemas": exploracion_fisica_data,
    }


def _parsear_secciones(secciones_str: Optional[str]) -> Optional[List[str]]:
    if not secciones_str:
        return None
    secciones = [s.strip() for s in secciones_str.split(",") if s.strip()]
    validas = [s for s in secciones if s in SECCIONES_VALIDAS]
    return validas or None


def _obtener_medico(db: Session, historia: HistoriaClinica):
    """Obtiene nombre y firma del médico asociado a la historia."""
    firma_imagen  = None
    nombre_medico = None
    try:
        medico_id = getattr(historia, 'medico_id', None) or getattr(historia, 'profesional_id', None)
        if medico_id:
            medico = db.query(Usuario).filter(Usuario.id == medico_id).first()
            if medico:
                nombre_medico = medico.nombre_completo
                # Soporta firma_imagen y firma_base64
                firma_imagen = (
                    getattr(medico, 'firma_imagen', None)
                    or getattr(medico, 'firma_base64', None)
                )
    except Exception as e:
        print(f"Advertencia _obtener_medico: {e}")
    return firma_imagen, nombre_medico


def _obtener_datos_para_pdf(db: Session, historia_id: str, secciones: Optional[List[str]] = None):
    historia = db.query(HistoriaClinica).filter(HistoriaClinica.id == historia_id).first()
    if not historia:
        raise HTTPException(status_code=404, detail="Historia clinica no encontrada")

    deportista = db.query(Deportista).filter(Deportista.id == historia.deportista_id).first()
    if not deportista:
        raise HTTPException(status_code=404, detail="Deportista no encontrado")

    datos_completos = obtener_datos_historia_completa(db, historia_id)
    if not datos_completos:
        raise HTTPException(status_code=404, detail="No se pudieron obtener los datos de la historia")

    if secciones:
        datos_completos = filtrar_datos_por_secciones(datos_completos, secciones)

    deportista_data = {
        "nombres":          deportista.nombres,
        "apellidos":        deportista.apellidos,
        "numero_documento": deportista.numero_documento,
        "fecha_nacimiento": str(deportista.fecha_nacimiento) if getattr(deportista,'fecha_nacimiento',None) else None,
        "telefono":         getattr(deportista,'telefono',None) or getattr(deportista,'celular',None),
        "email":            getattr(deportista,'email',None),
        "deporte":          getattr(deportista,'tipo_deporte',None) or getattr(deportista,'deporte',None),
        "eps":              getattr(deportista,'eps',None),
        "grupo_sanguineo":  getattr(deportista,'grupo_sanguineo',None),
    }

    firma_imagen, nombre_medico = _obtener_medico(db, historia)
    return datos_completos, deportista_data, deportista, historia, firma_imagen, nombre_medico


def _generar_pdf_response(
    datos_completos: dict,
    deportista_data: dict,
    deportista,
    historia_id: str,
    inline: bool = False,
    firma_imagen: str = None,
    nombre_medico: str = None,
):
    pdf_buffer = generar_documento_historia_clinica(
        datos_completos, deportista_data,
        firma_imagen=firma_imagen, nombre_medico=nombre_medico,
    )
    filename    = f"historia_clinica_{deportista.numero_documento}_{historia_id[:8]}.pdf"
    disposition = "inline" if inline else "attachment"
    pdf_buffer.seek(0)
    return StreamingResponse(
        iter([pdf_buffer.getvalue()]),
        media_type="application/pdf",
        headers={
            "Content-Disposition":          f"{disposition}; filename={filename}",
            "Access-Control-Expose-Headers": "Content-Disposition",
        },
    )


# =============================================================================
# ENDPOINTS
# =============================================================================

@router.get("/{historia_id}/datos-completos")
def obtener_datos_completos_json(historia_id: str, db: Session = Depends(get_db)):
    try:
        datos = obtener_datos_historia_completa(db, historia_id)
        if not datos:
            raise HTTPException(status_code=404, detail="Historia clinica no encontrada")
        return datos
    except HTTPException:
        raise
    except Exception as e:
        import traceback; traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")


@router.get("/{historia_id}/historia-clinica-pdf")
@router.get("/{historia_id}/pdf")
@router.get("/{historia_id}/generar-pdf")
def descargar_historia_clinica_pdf(
    historia_id: str,
    secciones: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    try:
        secs = _parsear_secciones(secciones)
        datos, dep_data, dep, historia, firma, medico = _obtener_datos_para_pdf(db, historia_id, secs)
        return _generar_pdf_response(datos, dep_data, dep, historia_id,
                                     inline=False, firma_imagen=firma, nombre_medico=medico)
    except HTTPException:
        raise
    except Exception as e:
        import traceback; traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error al generar documento: {str(e)}")


@router.get("/{historia_id}/compartir-pdf")
def compartir_historia_clinica_pdf(
    historia_id: str,
    secciones: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    try:
        secs = _parsear_secciones(secciones)
        datos, dep_data, dep, historia, firma, medico = _obtener_datos_para_pdf(db, historia_id, secs)
        return _generar_pdf_response(datos, dep_data, dep, historia_id,
                                     inline=True, firma_imagen=firma, nombre_medico=medico)
    except HTTPException:
        raise
    except Exception as e:
        import traceback; traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")


@router.get("/{historia_id}/imprimir")
def imprimir_historia_clinica(
    historia_id: str,
    secciones: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    try:
        secs = _parsear_secciones(secciones)
        datos, dep_data, dep, historia, firma, medico = _obtener_datos_para_pdf(db, historia_id, secs)
        return _generar_pdf_response(datos, dep_data, dep, historia_id,
                                     inline=True, firma_imagen=firma, nombre_medico=medico)
    except HTTPException:
        raise
    except Exception as e:
        import traceback; traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")


@router.get("/{historia_id}/whatsapp-pdf")
def descargar_pdf_para_whatsapp(
    historia_id: str,
    secciones: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    try:
        secs = _parsear_secciones(secciones)
        datos, dep_data, dep, historia, firma, medico = _obtener_datos_para_pdf(db, historia_id, secs)
        pdf_buffer = generar_documento_historia_clinica(
            datos, dep_data, firma_imagen=firma, nombre_medico=medico,
        )
        nombre_completo = f"{dep.nombres}_{dep.apellidos}".replace(" ", "_")
        filename = f"Historia_Clinica_{nombre_completo}_{dep.numero_documento}.pdf"
        pdf_buffer.seek(0)
        return StreamingResponse(
            iter([pdf_buffer.getvalue()]),
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename={filename}"},
        )
    except HTTPException:
        raise
    except Exception as e:
        import traceback; traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")


@router.post("/{historia_id}/enviar-email")
def enviar_historia_por_email(
    historia_id: str,
    email_destino: str,
    secciones: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    if not EMAIL_SERVICE_DISPONIBLE:
        raise HTTPException(status_code=503, detail="Servicio de email no configurado")
    try:
        secs = _parsear_secciones(secciones)
        datos, dep_data, dep, historia, firma, medico = _obtener_datos_para_pdf(db, historia_id, secs)
        pdf_buffer = generar_documento_historia_clinica(
            datos, dep_data, firma_imagen=firma, nombre_medico=medico,
        )
        pdf_buffer.seek(0)
        nombre_completo = f"{dep.nombres} {dep.apellidos}"
        cuerpo_html  = generar_html_historia_clinica(
            deportista_nombre=nombre_completo,
            deportista_documento=str(dep.numero_documento),
            fecha_apertura=str(datos.get('fecha_apertura','N/A')),
            historia_id=historia_id,
        )
        cuerpo_texto = generar_texto_plano_historia_clinica(
            deportista_nombre=nombre_completo,
            deportista_documento=str(dep.numero_documento),
            fecha_apertura=str(datos.get('fecha_apertura','N/A')),
            historia_id=historia_id,
        )
        resultado = enviar_email_con_pdf(
            destinatario=email_destino,
            asunto=f"Historia Clinica - {nombre_completo}",
            cuerpo_html=cuerpo_html,
            pdf_buffer=pdf_buffer,
            nombre_pdf=f"historia_clinica_{dep.numero_documento}.pdf",
            cuerpo_texto=cuerpo_texto,
        )
        if resultado["success"]:
            return {"success": True, "message": resultado["message"],
                    "historia_id": historia_id, "deportista": nombre_completo,
                    "email_destino": email_destino}
        raise HTTPException(status_code=500, detail=resultado["message"])
    except HTTPException:
        raise
    except Exception as e:
        import traceback; traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

# =============================================================================
# HELPER para los 3 nuevos tipos de documento
# =============================================================================
def _respuesta_doc(pdf_buffer, nombre_archivo: str, inline: bool = False):
    disposition = "inline" if inline else "attachment"
    pdf_buffer.seek(0)
    return StreamingResponse(
        iter([pdf_buffer.getvalue()]),
        media_type="application/pdf",
        headers={
            "Content-Disposition": f"{disposition}; filename={nombre_archivo}",
            "Access-Control-Expose-Headers": "Content-Disposition",
        },
    )
 
 
# =============================================================================
# EPICRISIS
# =============================================================================
@router.get("/{historia_id}/epicrisis-pdf")
@router.get("/{historia_id}/epicrisis")
def descargar_epicrisis(
    historia_id: str,
    inline: bool = Query(False, description="True para ver en navegador, False para descargar"),
    db: Session = Depends(get_db),
):
    """Generar PDF de epicrisis (resumen de consulta / egreso)."""
    try:
        datos, dep_data, dep, historia, firma, medico = _obtener_datos_para_pdf(db, historia_id)
        pdf_buffer = generar_epicrisis(
            datos, dep_data, firma_imagen=firma, nombre_medico=medico,
        )
        filename = f"epicrisis_{dep.numero_documento}_{historia_id[:8]}.pdf"
        return _respuesta_doc(pdf_buffer, filename, inline)
    except HTTPException:
        raise
    except Exception as e:
        import traceback; traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error al generar epicrisis: {str(e)}")
 
 
# =============================================================================
# RECETA MÉDICA
# =============================================================================
@router.get("/{historia_id}/receta-pdf")
@router.get("/{historia_id}/receta-medica")
@router.get("/{historia_id}/medicamentos-pdf")
def descargar_receta_medica(
    historia_id: str,
    inline: bool = Query(False),
    db: Session = Depends(get_db),
):
    """Generar PDF de receta médica con medicamentos prescritos."""
    try:
        datos, dep_data, dep, historia, firma, medico = _obtener_datos_para_pdf(db, historia_id)
        pdf_buffer = generar_receta_medica(
            datos, dep_data, firma_imagen=firma, nombre_medico=medico,
        )
        filename = f"receta_{dep.numero_documento}_{historia_id[:8]}.pdf"
        return _respuesta_doc(pdf_buffer, filename, inline)
    except HTTPException:
        raise
    except Exception as e:
        import traceback; traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error al generar receta: {str(e)}")
 
 
# =============================================================================
# INTERCONSULTA / REMISIÓN
# =============================================================================
@router.get("/{historia_id}/interconsulta-pdf")
@router.get("/{historia_id}/interconsultas-pdf")
@router.get("/{historia_id}/remision-pdf")
def descargar_interconsulta(
    historia_id: str,
    remision_idx: int = Query(0, description="Índice de la remisión (0 = primera, 1 = segunda, etc.)"),
    inline: bool = Query(False),
    db: Session = Depends(get_db),
):
    """
    Generar PDF de interconsulta / remisión formal a especialista.
    Si hay varias remisiones, usar remision_idx para seleccionar cuál.
    """
    try:
        datos, dep_data, dep, historia, firma, medico = _obtener_datos_para_pdf(db, historia_id)
        pdf_buffer = generar_interconsulta(
            datos, dep_data,
            firma_imagen=firma, nombre_medico=medico,
            remision_idx=remision_idx,
        )
        filename = f"interconsulta_{dep.numero_documento}_{historia_id[:8]}.pdf"
        return _respuesta_doc(pdf_buffer, filename, inline)
    except HTTPException:
        raise
    except Exception as e:
        import traceback; traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error al generar interconsulta: {str(e)}")
 
 
# =============================================================================
# RESUMEN DE DOCUMENTOS DISPONIBLES (útil para el frontend)
# =============================================================================
@router.get("/{historia_id}/documentos-disponibles")
def listar_documentos_disponibles(historia_id: str, db: Session = Depends(get_db)):
    """
    Retorna la lista de documentos PDF disponibles para una historia,
    con sus URLs directas. El frontend usa esto para mostrar los botones.
    """
    base = f"/api/v1/documentos/{historia_id}"
    return {
        "historia_id": historia_id,
        "documentos": [
            {
                "tipo": "historia_clinica",
                "nombre": "Historia Clínica Completa",
                "descripcion": "Todos los datos de la consulta",
                "url_descarga": f"{base}/historia-clinica-pdf",
                "url_vista": f"{base}/compartir-pdf",
            },
            {
                "tipo": "epicrisis",
                "nombre": "Epicrisis",
                "descripcion": "Resumen de egreso: diagnóstico, plan al alta y próxima cita",
                "url_descarga": f"{base}/epicrisis-pdf",
                "url_vista": f"{base}/epicrisis-pdf?inline=true",
            },
            {
                "tipo": "receta",
                "nombre": "Receta Médica",
                "descripcion": "Prescripción de medicamentos con dosis y frecuencia",
                "url_descarga": f"{base}/receta-pdf",
                "url_vista": f"{base}/receta-pdf?inline=true",
            },
            {
                "tipo": "interconsulta",
                "nombre": "Interconsulta / Remisión",
                "descripcion": "Solicitud formal de valoración por especialista",
                "url_descarga": f"{base}/interconsulta-pdf",
                "url_vista": f"{base}/interconsulta-pdf?inline=true",
            },
        ],
    }


@router.get("/{historia_id}/obtener-pdf-base64")
def obtener_pdf_base64(
    historia_id: str,
    secciones: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    try:
        secs = _parsear_secciones(secciones)
        datos, dep_data, dep, historia, firma, medico = _obtener_datos_para_pdf(db, historia_id, secs)
        pdf_buffer = generar_documento_historia_clinica(
            datos, dep_data, firma_imagen=firma, nombre_medico=medico,
        )
        pdf_buffer.seek(0)
        pdf_b64 = _b64.b64encode(pdf_buffer.getvalue()).decode('utf-8')
        return {
            "success":      True,
            "pdf_base64":   pdf_b64,
            "filename":     f"historia_clinica_{dep.numero_documento}_{historia_id[:8]}.pdf",
            "content_type": "application/pdf",
            "historia_id":  historia_id,
            "deportista":   f"{dep.nombres} {dep.apellidos}",
        }
    except HTTPException:
        raise
    except Exception as e:
        import traceback; traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")