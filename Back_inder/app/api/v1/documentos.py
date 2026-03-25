"""
Endpoint para generar y descargar documentos medicos
INDERHUILA - Instituto Departamental de Recreacion y Deportes del Huila
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from uuid import UUID
from typing import Optional, List
import io

from app.core.dependencies import get_db
from app.models.historia import HistoriaClinica
from app.models.deportista import Deportista
from app.services.documento_service import generar_documento_historia_clinica
from app.crud.historia import obtener_motivo_consulta, obtener_exploracion_fisica

# Importar servicio de email (opcional)
try:
    from app.services.email_service import (
        enviar_email_con_pdf,
        generar_html_historia_clinica,
        generar_texto_plano_historia_clinica
    )
    EMAIL_SERVICE_DISPONIBLE = True
except ImportError:
    EMAIL_SERVICE_DISPONIBLE = False

router = APIRouter(prefix="/documentos", tags=["Documentos"])


# =============================================================================
# SECCIONES VALIDAS
# =============================================================================
# Identificadores de las 9 secciones que el frontend puede seleccionar
SECCIONES_VALIDAS = {
    "motivo_consulta",
    "antecedentes",
    "revision_sistemas",
    "signos_vitales",
    "exploracion_fisica",
    "pruebas_complementarias",
    "diagnosticos",
    "plan_tratamiento",
    "remisiones",
}


def filtrar_datos_por_secciones(datos_completos: dict, secciones: List[str]) -> dict:
    """
    Filtra los datos completos de la historia clinica segun las secciones seleccionadas.
    Si no se especifican secciones o se pasan todas, devuelve los datos sin modificar.
    """
    if not secciones:
        return datos_completos

    # Validar secciones
    secciones_set = set(secciones)

    # Si pidieron todas las secciones, no filtrar
    if secciones_set == SECCIONES_VALIDAS:
        return datos_completos

    # Copia superficial para no modificar el original
    datos_filtrados = dict(datos_completos)

    # Seccion 1: Motivo de consulta
    if "motivo_consulta" not in secciones_set:
        datos_filtrados["motivo_consulta_enfermedad"] = None

    # Seccion 2: Antecedentes (personales, familiares, lesiones, cirugias, alergias, medicaciones, vacunas)
    if "antecedentes" not in secciones_set:
        datos_filtrados["antecedentes_personales"] = []
        datos_filtrados["antecedentes_familiares"] = []
        datos_filtrados["lesiones_deportivas"] = []
        datos_filtrados["cirugias_previas"] = []
        datos_filtrados["alergias"] = []
        datos_filtrados["medicaciones"] = []
        datos_filtrados["vacunas_administradas"] = []

    # Seccion 3: Revision por sistemas
    if "revision_sistemas" not in secciones_set:
        datos_filtrados["revision_sistemas"] = []

    # Seccion 4: Signos vitales
    if "signos_vitales" not in secciones_set:
        datos_filtrados["signos_vitales"] = []

    # Seccion 5: Exploracion fisica
    if "exploracion_fisica" not in secciones_set:
        datos_filtrados["exploracion_fisica_sistemas"] = None

    # Seccion 6: Pruebas complementarias
    if "pruebas_complementarias" not in secciones_set:
        datos_filtrados["pruebas_complementarias"] = []

    # Seccion 7: Diagnosticos
    if "diagnosticos" not in secciones_set:
        datos_filtrados["diagnosticos"] = []

    # Seccion 8: Plan de tratamiento
    if "plan_tratamiento" not in secciones_set:
        datos_filtrados["plan_tratamiento"] = []

    # Seccion 9: Remisiones
    if "remisiones" not in secciones_set:
        datos_filtrados["remisiones_especialistas"] = []

    return datos_filtrados


def obtener_datos_historia_completa(db: Session, historia_id: str) -> dict:
    """
    Obtiene todos los datos de la historia clinica desde las tablas normalizadas
    """
    try:
        historia_uuid = UUID(historia_id)
    except (ValueError, TypeError):
        historia_uuid = historia_id

    # Obtener historia base
    h = db.query(HistoriaClinica).filter(HistoriaClinica.id == historia_uuid).first()

    if not h:
        return None

    # Obtener motivo consulta y exploracion fisica
    motivo_consulta_data = None
    try:
        motivos = obtener_motivo_consulta(db, historia_uuid)
        if motivos and len(motivos) > 0:
            m = motivos[0]
            motivo_consulta_data = {
                "id": str(m.id),
                "motivo_consulta": getattr(m, 'motivo_consulta', None),
                "sintomas_principales": getattr(m, 'sintomas_principales', None),
                "duracion_sintomas": getattr(m, 'duracion_sintomas', None),
                "inicio_enfermedad": getattr(m, 'inicio_enfermedad', None),
                "evolucion": getattr(m, 'evolucion', None),
                "factor_desencadenante": getattr(m, 'factor_desencadenante', None),
                "medicamentos_previos": getattr(m, 'medicamentos_previos', None),
            }
    except Exception as e:
        print(f"Advertencia obtener_motivo_consulta: {e}")

    exploracion_fisica_data = None
    try:
        exploraciones = obtener_exploracion_fisica(db, historia_uuid)
        if exploraciones and len(exploraciones) > 0:
            e = exploraciones[0]
            exploracion_fisica_data = {
                "id": str(e.id),
                "sistema_cardiovascular": getattr(e, 'sistema_cardiovascular', None),
                "sistema_respiratorio": getattr(e, 'sistema_respiratorio', None),
                "sistema_digestivo": getattr(e, 'sistema_digestivo', None),
                "sistema_neurologico": getattr(e, 'sistema_neurologico', None),
                "sistema_genitourinario": getattr(e, 'sistema_genitourinario', None),
                "sistema_musculoesqueletico": getattr(e, 'sistema_musculoesqueletico', None),
                "sistema_integumentario": getattr(e, 'sistema_integumentario', None),
                "sistema_endocrino": getattr(e, 'sistema_endocrino', None),
                "cabeza_cuello": getattr(e, 'cabeza_cuello', None),
                "extremidades": getattr(e, 'extremidades', None),
                "observaciones_generales": getattr(e, 'observaciones_generales', None),
            }
    except Exception as e:
        print(f"Advertencia obtener_exploracion_fisica: {e}")

    # Obtener datos del deportista
    deportista = db.query(Deportista).filter(Deportista.id == h.deportista_id).first()
    deportista_data = None
    if deportista:
        deportista_data = {
            "id": str(deportista.id),
            "nombres": deportista.nombres,
            "apellidos": deportista.apellidos,
            "numero_documento": str(deportista.numero_documento),
            "fecha_nacimiento": str(deportista.fecha_nacimiento) if hasattr(deportista, 'fecha_nacimiento') and deportista.fecha_nacimiento else None,
            "telefono": getattr(deportista, 'telefono', None) or getattr(deportista, 'celular', None),
            "email": getattr(deportista, 'email', None),
            "deporte": getattr(deportista, 'tipo_deporte', None) or getattr(deportista, 'deporte', None) or getattr(deportista, 'disciplina', None),
            "sexo_id": str(deportista.sexo_id) if hasattr(deportista, 'sexo_id') and deportista.sexo_id else None,
            "direccion": getattr(deportista, 'direccion', None),
        }

    # =========================================================================
    # Construir diccionario con todos los datos
    # NOTA: Se usa getattr con fallback para compatibilidad con ambos nombres
    #       de columna (modelo original vs nombres corregidos)
    # =========================================================================
    return {
        "id": str(h.id),
        "deportista_id": str(h.deportista_id),
        "fecha_apertura": str(h.fecha_apertura) if h.fecha_apertura else None,
        "estado_id": str(h.estado_id) if h.estado_id else None,
        "created_at": str(h.created_at) if h.created_at else None,

        # Datos del deportista incluidos
        "deportista": deportista_data,

        # Antecedentes personales
        "antecedentes_personales": [
            {
                "id": str(a.id),
                "codigo_cie11": a.codigo_cie11,
                "nombre_enfermedad": a.nombre_enfermedad,
                "observaciones": getattr(a, 'observaciones', None)
            } for a in h.antecedentes_personales
        ] if h.antecedentes_personales else [],

        # Antecedentes familiares
        "antecedentes_familiares": [
            {
                "id": str(a.id),
                "tipo_familiar": a.tipo_familiar,
                "codigo_cie11": a.codigo_cie11,
                "nombre_enfermedad": a.nombre_enfermedad
            } for a in h.antecedentes_familiares
        ] if h.antecedentes_familiares else [],

        # =====================================================================
        # CORREGIDO: Lesiones deportivas
        # Modelo tiene: tipo_lesion, fecha_lesion
        # Frontend espera: descripcion, fecha_ultima_lesion
        # Se envian AMBOS para compatibilidad
        # =====================================================================
        "lesiones_deportivas": [
            {
                "id": str(l.id),
                "descripcion": getattr(l, 'descripcion', None) or getattr(l, 'tipo_lesion', None),
                "tipo_lesion": getattr(l, 'tipo_lesion', None),
                "fecha_ultima_lesion": str(getattr(l, 'fecha_ultima_lesion', None) or getattr(l, 'fecha_lesion', None)) if (getattr(l, 'fecha_ultima_lesion', None) or getattr(l, 'fecha_lesion', None)) else None,
                "fecha_lesion": str(l.fecha_lesion) if getattr(l, 'fecha_lesion', None) else None,
                "observaciones": getattr(l, 'observaciones', None) or getattr(l, 'tratamiento', None)
            } for l in h.lesiones_deportivas
        ] if h.lesiones_deportivas else [],

        # Cirugias previas
        "cirugias_previas": [
            {
                "id": str(c.id),
                "tipo_cirugia": c.tipo_cirugia,
                "fecha_cirugia": str(c.fecha_cirugia) if c.fecha_cirugia else None,
                "observaciones": getattr(c, 'observaciones', None)
            } for c in h.cirugias_previas
        ] if h.cirugias_previas else [],

        # =====================================================================
        # CORREGIDO: Alergias
        # Modelo tiene: tipo_alergia, descripcion, reaccion
        # Frontend espera: tipo_alergia, observaciones
        # Se envian AMBOS para compatibilidad
        # =====================================================================
        "alergias": [
            {
                "id": str(a.id),
                "tipo_alergia": a.tipo_alergia,
                "observaciones": getattr(a, 'observaciones', None) or getattr(a, 'descripcion', None),
                "descripcion": getattr(a, 'descripcion', None),
                "reaccion": getattr(a, 'reaccion', None)
            } for a in h.alergias
        ] if h.alergias else [],

        # =====================================================================
        # CORREGIDO: Medicaciones
        # Modelo tiene: nombre_medicamento
        # Frontend espera: nombre_medicacion
        # Se envian AMBOS para compatibilidad
        # =====================================================================
        "medicaciones": [
            {
                "id": str(m.id),
                "nombre_medicacion": getattr(m, 'nombre_medicacion', None) or getattr(m, 'nombre_medicamento', None),
                "nombre_medicamento": getattr(m, 'nombre_medicamento', None),
                "dosis": getattr(m, 'dosis', None),
                "frecuencia": getattr(m, 'frecuencia', None),
                "observaciones": getattr(m, 'observaciones', None) or getattr(m, 'indicacion', None)
            } for m in h.medicaciones
        ] if h.medicaciones else [],

        # Vacunas administradas
        "vacunas_administradas": [
            {
                "id": str(v.id),
                "nombre_vacuna": v.nombre_vacuna,
                "fecha_administracion": str(getattr(v, 'fecha_administracion', None)) if getattr(v, 'fecha_administracion', None) else None,
                "observaciones": getattr(v, 'observaciones', None)
            } for v in h.vacunas_administradas
        ] if hasattr(h, 'vacunas_administradas') and h.vacunas_administradas else [],

        # Revision por sistemas (sin cambios - ya estaba correcto)
        "revision_sistemas": [
            {
                "id": str(r.id),
                "sistema_nombre": r.sistema_nombre,
                "estado": r.estado,
                "observaciones": getattr(r, 'observaciones', None)
            } for r in h.revision_sistemas
        ] if hasattr(h, 'revision_sistemas') and h.revision_sistemas else [],

        # Signos vitales (sin cambios)
        "signos_vitales": [
            {
                "id": str(s.id),
                "estatura_cm": getattr(s, 'estatura_cm', None),
                "peso_kg": getattr(s, 'peso_kg', None),
                "imc": getattr(s, 'imc', None),
                "frecuencia_cardiaca_lpm": getattr(s, 'frecuencia_cardiaca_lpm', None),
                "presion_arterial_sistolica": getattr(s, 'presion_arterial_sistolica', None),
                "presion_arterial_diastolica": getattr(s, 'presion_arterial_diastolica', None),
                "frecuencia_respiratoria_rpm": getattr(s, 'frecuencia_respiratoria_rpm', None),
                "temperatura_celsius": getattr(s, 'temperatura_celsius', None),
                "saturacion_oxigeno_percent": getattr(s, 'saturacion_oxigeno_percent', None)
            } for s in h.signos_vitales
        ] if hasattr(h, 'signos_vitales') and h.signos_vitales else [],

        # Pruebas complementarias (sin cambios - ya estaba correcto)
        "pruebas_complementarias": [
            {
                "id": str(p.id),
                "categoria": getattr(p, 'categoria', None),
                "nombre_prueba": getattr(p, 'nombre_prueba', None),
                "codigo_cups": getattr(p, 'codigo_cups', None),
                "resultado": getattr(p, 'resultado', None)
            } for p in h.pruebas_complementarias
        ] if hasattr(h, 'pruebas_complementarias') and h.pruebas_complementarias else [],

        # Diagnosticos (sin cambios)
        "diagnosticos": [
            {
                "id": str(d.id),
                "codigo_cie11": d.codigo_cie11,
                "nombre_enfermedad": d.nombre_enfermedad,
                "observaciones": getattr(d, 'observaciones', None),
                "analisis_objetivo": getattr(d, 'analisis_objetivo', None),
                "impresion_diagnostica": getattr(d, 'impresion_diagnostica', None),
                "tipo_diagnostico": getattr(d, 'tipo_diagnostico', None)
            } for d in h.diagnosticos
        ] if h.diagnosticos else [],

        # Plan de tratamiento (sin cambios - ya estaba correcto)
        "plan_tratamiento": [
            {
                "id": str(p.id),
                "indicaciones_medicas": getattr(p, 'indicaciones_medicas', None),
                "recomendaciones_entrenamiento": getattr(p, 'recomendaciones_entrenamiento', None),
                "plan_seguimiento": getattr(p, 'plan_seguimiento', None)
            } for p in h.plan_tratamiento
        ] if hasattr(h, 'plan_tratamiento') and h.plan_tratamiento else [],

        # Remisiones a especialistas (sin cambios - ya estaba correcto)
        "remisiones_especialistas": [
            {
                "id": str(r.id),
                "especialista": r.especialista,
                "motivo": r.motivo,
                "prioridad": r.prioridad,
                "fecha_remision": str(getattr(r, 'fecha_remision', None)) if getattr(r, 'fecha_remision', None) else None
            } for r in h.remisiones_especialistas
        ] if h.remisiones_especialistas else [],

        # Motivo consulta y exploracion fisica
        "motivo_consulta_enfermedad": motivo_consulta_data,
        "exploracion_fisica_sistemas": exploracion_fisica_data,
    }


def _parsear_secciones(secciones_str: Optional[str]) -> Optional[List[str]]:
    """
    Convierte el string de secciones separadas por coma en una lista validada.
    Retorna None si no se especificaron secciones (= incluir todas).
    """
    if not secciones_str:
        return None

    secciones = [s.strip() for s in secciones_str.split(",") if s.strip()]
    # Filtrar solo secciones validas
    secciones_validas = [s for s in secciones if s in SECCIONES_VALIDAS]

    if not secciones_validas:
        return None

    return secciones_validas


def _obtener_datos_para_pdf(db: Session, historia_id: str, secciones: Optional[List[str]] = None):
    """
    Funcion auxiliar para obtener todos los datos necesarios para generar el PDF.
    Opcionalmente filtra por secciones seleccionadas.
    """
    historia = db.query(HistoriaClinica).filter(
        HistoriaClinica.id == historia_id
    ).first()

    if not historia:
        raise HTTPException(status_code=404, detail="Historia clinica no encontrada")

    deportista = db.query(Deportista).filter(
        Deportista.id == historia.deportista_id
    ).first()

    if not deportista:
        raise HTTPException(status_code=404, detail="Deportista no encontrado")

    datos_completos = obtener_datos_historia_completa(db, historia_id)

    if not datos_completos:
        raise HTTPException(status_code=404, detail="No se pudieron obtener los datos de la historia")

    # Filtrar por secciones si se especificaron
    if secciones:
        datos_completos = filtrar_datos_por_secciones(datos_completos, secciones)

    deportista_data = {
        "nombres": deportista.nombres,
        "apellidos": deportista.apellidos,
        "numero_documento": deportista.numero_documento,
        "fecha_nacimiento": str(deportista.fecha_nacimiento) if hasattr(deportista, 'fecha_nacimiento') and deportista.fecha_nacimiento else None,
        "telefono": getattr(deportista, 'telefono', None) or getattr(deportista, 'celular', None),
        "email": getattr(deportista, 'email', None),
        "deporte": getattr(deportista, 'tipo_deporte', None) or getattr(deportista, 'deporte', None) or getattr(deportista, 'disciplina', None),
    }

    return datos_completos, deportista_data, deportista, historia


def _generar_pdf_response(datos_completos: dict, deportista_data: dict, deportista, historia_id: str, inline: bool = False):
    """
    Funcion auxiliar para generar la respuesta PDF
    """
    pdf_buffer = generar_documento_historia_clinica(datos_completos, deportista_data)

    filename = f"historia_clinica_{deportista.numero_documento}_{historia_id[:8]}.pdf"
    disposition = "inline" if inline else "attachment"

    pdf_buffer.seek(0)
    return StreamingResponse(
        iter([pdf_buffer.getvalue()]),
        media_type="application/pdf",
        headers={
            "Content-Disposition": f"{disposition}; filename={filename}"
        }
    )


# =============================================================================
# ENDPOINTS
# =============================================================================

@router.get("/{historia_id}/datos-completos")
def obtener_datos_completos_json(
    historia_id: str,
    db: Session = Depends(get_db)
):
    """
    Obtener todos los datos de la historia clinica como JSON.
    Este endpoint devuelve la misma informacion que se usa para generar el PDF,
    incluyendo deportista, motivo de consulta, antecedentes, revision por sistemas,
    signos vitales, exploracion fisica, pruebas, diagnosticos, plan de tratamiento
    y remisiones a especialistas.
    """
    try:
        datos = obtener_datos_historia_completa(db, historia_id)

        if not datos:
            raise HTTPException(status_code=404, detail="Historia clinica no encontrada")

        return datos

    except HTTPException:
        raise
    except Exception as e:
        print(f"Error al obtener datos completos: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error al obtener datos: {str(e)}")


@router.get("/{historia_id}/historia-clinica-pdf")
def descargar_historia_clinica_pdf(
    historia_id: str,
    secciones: Optional[str] = Query(None, description="Secciones a incluir separadas por coma. Ej: motivo_consulta,diagnosticos,plan_tratamiento"),
    db: Session = Depends(get_db)
):
    """
    Generar y descargar PDF de historia clinica.
    Opcionalmente filtrar por secciones seleccionadas.
    """
    try:
        secciones_lista = _parsear_secciones(secciones)
        datos_completos, deportista_data, deportista, historia = _obtener_datos_para_pdf(db, historia_id, secciones_lista)
        return _generar_pdf_response(datos_completos, deportista_data, deportista, historia_id, inline=False)
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error al generar PDF: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error al generar documento: {str(e)}")


@router.get("/{historia_id}/compartir-pdf")
def compartir_historia_clinica_pdf(
    historia_id: str,
    secciones: Optional[str] = Query(None, description="Secciones a incluir separadas por coma"),
    db: Session = Depends(get_db)
):
    """
    Generar PDF para compartir (vista en navegador)
    """
    try:
        secciones_lista = _parsear_secciones(secciones)
        datos_completos, deportista_data, deportista, historia = _obtener_datos_para_pdf(db, historia_id, secciones_lista)
        return _generar_pdf_response(datos_completos, deportista_data, deportista, historia_id, inline=True)
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error al generar PDF para compartir: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")


@router.get("/{historia_id}/imprimir")
def imprimir_historia_clinica(
    historia_id: str,
    secciones: Optional[str] = Query(None, description="Secciones a incluir separadas por coma"),
    db: Session = Depends(get_db)
):
    """
    Generar PDF para impresion
    """
    try:
        secciones_lista = _parsear_secciones(secciones)
        datos_completos, deportista_data, deportista, historia = _obtener_datos_para_pdf(db, historia_id, secciones_lista)
        return _generar_pdf_response(datos_completos, deportista_data, deportista, historia_id, inline=True)
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error al generar PDF para imprimir: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")


@router.get("/{historia_id}/whatsapp-pdf")
def descargar_pdf_para_whatsapp(
    historia_id: str,
    secciones: Optional[str] = Query(None, description="Secciones a incluir separadas por coma"),
    db: Session = Depends(get_db)
):
    """
    Descargar PDF para compartir por WhatsApp
    """
    try:
        secciones_lista = _parsear_secciones(secciones)
        datos_completos, deportista_data, deportista, historia = _obtener_datos_para_pdf(db, historia_id, secciones_lista)

        pdf_buffer = generar_documento_historia_clinica(datos_completos, deportista_data)

        nombre_completo = f"{deportista.nombres}_{deportista.apellidos}".replace(" ", "_")
        filename = f"Historia_Clinica_{nombre_completo}_{deportista.numero_documento}.pdf"

        pdf_buffer.seek(0)
        return StreamingResponse(
            iter([pdf_buffer.getvalue()]),
            media_type="application/pdf",
            headers={
                "Content-Disposition": f"attachment; filename={filename}",
                "Content-Type": "application/pdf"
            }
        )
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error al generar PDF para WhatsApp: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")


@router.post("/{historia_id}/enviar-email")
def enviar_historia_por_email(
    historia_id: str,
    email_destino: str,
    secciones: Optional[str] = Query(None, description="Secciones a incluir separadas por coma"),
    db: Session = Depends(get_db)
):
    """
    Enviar historia clinica por correo electronico con PDF adjunto.
    Opcionalmente filtrar por secciones seleccionadas.
    """
    if not EMAIL_SERVICE_DISPONIBLE:
        raise HTTPException(
            status_code=503,
            detail="Servicio de email no configurado"
        )

    try:
        secciones_lista = _parsear_secciones(secciones)
        datos_completos, deportista_data, deportista, historia = _obtener_datos_para_pdf(db, historia_id, secciones_lista)

        pdf_buffer = generar_documento_historia_clinica(datos_completos, deportista_data)
        pdf_buffer.seek(0)

        nombre_completo = f"{deportista.nombres} {deportista.apellidos}"

        cuerpo_html = generar_html_historia_clinica(
            deportista_nombre=nombre_completo,
            deportista_documento=str(deportista.numero_documento),
            fecha_apertura=str(datos_completos.get('fecha_apertura', 'N/A')),
            historia_id=historia_id
        )

        cuerpo_texto = generar_texto_plano_historia_clinica(
            deportista_nombre=nombre_completo,
            deportista_documento=str(deportista.numero_documento),
            fecha_apertura=str(datos_completos.get('fecha_apertura', 'N/A')),
            historia_id=historia_id
        )

        nombre_pdf = f"historia_clinica_{deportista.numero_documento}.pdf"

        resultado = enviar_email_con_pdf(
            destinatario=email_destino,
            asunto=f"Historia Clinica - {nombre_completo}",
            cuerpo_html=cuerpo_html,
            pdf_buffer=pdf_buffer,
            nombre_pdf=nombre_pdf,
            cuerpo_texto=cuerpo_texto
        )

        if resultado["success"]:
            return {
                "success": True,
                "message": resultado["message"],
                "historia_id": historia_id,
                "deportista": nombre_completo,
                "email_destino": email_destino
            }
        else:
            raise HTTPException(status_code=500, detail=resultado["message"])
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error al enviar email: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")


@router.get("/{historia_id}/obtener-pdf-base64")
def obtener_pdf_base64(
    historia_id: str,
    secciones: Optional[str] = Query(None, description="Secciones a incluir separadas por coma"),
    db: Session = Depends(get_db)
):
    """
    Obtener PDF como string Base64 para uso en frontend
    """
    import base64

    try:
        secciones_lista = _parsear_secciones(secciones)
        datos_completos, deportista_data, deportista, historia = _obtener_datos_para_pdf(db, historia_id, secciones_lista)

        pdf_buffer = generar_documento_historia_clinica(datos_completos, deportista_data)
        pdf_buffer.seek(0)

        pdf_base64 = base64.b64encode(pdf_buffer.getvalue()).decode('utf-8')

        filename = f"historia_clinica_{deportista.numero_documento}_{historia_id[:8]}.pdf"

        return {
            "success": True,
            "pdf_base64": pdf_base64,
            "filename": filename,
            "content_type": "application/pdf",
            "historia_id": historia_id,
            "deportista": f"{deportista.nombres} {deportista.apellidos}"
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error al generar PDF Base64: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")