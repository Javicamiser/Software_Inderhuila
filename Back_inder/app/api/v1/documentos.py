"""
Endpoint para generar y descargar documentos médicos
INDERHUILA - Instituto Departamental de Recreación y Deportes del Huila
"""
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from uuid import UUID
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


def obtener_datos_historia_completa(db: Session, historia_id: str) -> dict:
    """
    Obtiene todos los datos de la historia clínica desde las tablas normalizadas
    """
    try:
        historia_uuid = UUID(historia_id)
    except (ValueError, TypeError):
        historia_uuid = historia_id
    
    # Obtener historia base
    h = db.query(HistoriaClinica).filter(HistoriaClinica.id == historia_uuid).first()
    
    if not h:
        return None
    
    # Obtener motivo consulta y exploración física
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
    
    # Construir diccionario con todos los datos
    return {
        "id": str(h.id),
        "deportista_id": str(h.deportista_id),
        "fecha_apertura": str(h.fecha_apertura) if h.fecha_apertura else None,
        "estado_id": str(h.estado_id) if h.estado_id else None,
        "created_at": str(h.created_at) if h.created_at else None,
        
        # Antecedentes
        "antecedentes_personales": [
            {
                "id": str(a.id), 
                "codigo_cie11": a.codigo_cie11, 
                "nombre_enfermedad": a.nombre_enfermedad, 
                "observaciones": a.observaciones
            } for a in h.antecedentes_personales
        ] if h.antecedentes_personales else [],
        
        "antecedentes_familiares": [
            {
                "id": str(a.id), 
                "tipo_familiar": a.tipo_familiar, 
                "codigo_cie11": a.codigo_cie11, 
                "nombre_enfermedad": a.nombre_enfermedad
            } for a in h.antecedentes_familiares
        ] if h.antecedentes_familiares else [],
        
        "lesiones_deportivas": [
            {
                "id": str(l.id), 
                "descripcion": l.descripcion, 
                "fecha_ultima_lesion": str(l.fecha_ultima_lesion) if l.fecha_ultima_lesion else None,
                "observaciones": getattr(l, 'observaciones', None)
            } for l in h.lesiones_deportivas
        ] if h.lesiones_deportivas else [],
        
        "cirugias_previas": [
            {
                "id": str(c.id), 
                "tipo_cirugia": c.tipo_cirugia, 
                "fecha_cirugia": str(c.fecha_cirugia) if c.fecha_cirugia else None,
                "observaciones": getattr(c, 'observaciones', None)
            } for c in h.cirugias_previas
        ] if h.cirugias_previas else [],
        
        "alergias": [
            {
                "id": str(a.id), 
                "tipo_alergia": a.tipo_alergia, 
                "observaciones": a.observaciones
            } for a in h.alergias
        ] if h.alergias else [],
        
        "medicaciones": [
            {
                "id": str(m.id), 
                "nombre_medicacion": m.nombre_medicacion, 
                "dosis": m.dosis, 
                "frecuencia": getattr(m, 'frecuencia', None), 
                "observaciones": getattr(m, 'observaciones', None)
            } for m in h.medicaciones
        ] if h.medicaciones else [],
        
        "vacunas_administradas": [
            {
                "id": str(v.id), 
                "nombre_vacuna": v.nombre_vacuna, 
                "fecha_administracion": str(getattr(v, 'fecha_administracion', None)) if getattr(v, 'fecha_administracion', None) else None, 
                "observaciones": getattr(v, 'observaciones', None)
            } for v in h.vacunas_administradas
        ] if hasattr(h, 'vacunas_administradas') and h.vacunas_administradas else [],
        
        # Revisión por sistemas
        "revision_sistemas": [
            {
                "id": str(r.id), 
                "sistema_nombre": r.sistema_nombre, 
                "estado": r.estado, 
                "observaciones": getattr(r, 'observaciones', None)
            } for r in h.revision_sistemas
        ] if hasattr(h, 'revision_sistemas') and h.revision_sistemas else [],
        
        # Signos vitales
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
        
        # Pruebas complementarias
        "pruebas_complementarias": [
            {
                "id": str(p.id), 
                "categoria": getattr(p, 'categoria', None), 
                "nombre_prueba": getattr(p, 'nombre_prueba', None), 
                "codigo_cups": getattr(p, 'codigo_cups', None), 
                "resultado": getattr(p, 'resultado', None)
            } for p in h.pruebas_complementarias
        ] if hasattr(h, 'pruebas_complementarias') and h.pruebas_complementarias else [],
        
        # Diagnósticos
        "diagnosticos": [
            {
                "id": str(d.id), 
                "codigo_cie11": d.codigo_cie11, 
                "nombre_enfermedad": d.nombre_enfermedad, 
                "observaciones": getattr(d, 'observaciones', None), 
                "analisis_objetivo": getattr(d, 'analisis_objetivo', None), 
                "impresion_diagnostica": getattr(d, 'impresion_diagnostica', None)
            } for d in h.diagnosticos
        ] if h.diagnosticos else [],
        
        # Plan de tratamiento
        "plan_tratamiento": [
            {
                "id": str(p.id), 
                "indicaciones_medicas": getattr(p, 'indicaciones_medicas', None), 
                "recomendaciones_entrenamiento": getattr(p, 'recomendaciones_entrenamiento', None), 
                "plan_seguimiento": getattr(p, 'plan_seguimiento', None)
            } for p in h.plan_tratamiento
        ] if hasattr(h, 'plan_tratamiento') and h.plan_tratamiento else [],
        
        # Remisiones
        "remisiones_especialistas": [
            {
                "id": str(r.id), 
                "especialista": r.especialista, 
                "motivo": r.motivo, 
                "prioridad": r.prioridad, 
                "fecha_remision": str(getattr(r, 'fecha_remision', None)) if getattr(r, 'fecha_remision', None) else None
            } for r in h.remisiones_especialistas
        ] if h.remisiones_especialistas else [],
        
        # Motivo consulta y exploración física
        "motivo_consulta_enfermedad": motivo_consulta_data,
        "exploracion_fisica_sistemas": exploracion_fisica_data,
    }


def _obtener_datos_para_pdf(db: Session, historia_id: str):
    """
    Función auxiliar para obtener todos los datos necesarios para generar el PDF
    """
    historia = db.query(HistoriaClinica).filter(
        HistoriaClinica.id == historia_id
    ).first()
    
    if not historia:
        raise HTTPException(status_code=404, detail="Historia clínica no encontrada")
    
    deportista = db.query(Deportista).filter(
        Deportista.id == historia.deportista_id
    ).first()
    
    if not deportista:
        raise HTTPException(status_code=404, detail="Deportista no encontrado")
    
    datos_completos = obtener_datos_historia_completa(db, historia_id)
    
    if not datos_completos:
        raise HTTPException(status_code=404, detail="No se pudieron obtener los datos de la historia")
    
    deportista_data = {
        "nombres": deportista.nombres,
        "apellidos": deportista.apellidos,
        "numero_documento": deportista.numero_documento,
        "fecha_nacimiento": str(deportista.fecha_nacimiento) if hasattr(deportista, 'fecha_nacimiento') and deportista.fecha_nacimiento else None,
        "telefono": getattr(deportista, 'telefono', None) or getattr(deportista, 'celular', None),
        "email": getattr(deportista, 'email', None),
        "deporte": getattr(deportista, 'deporte', None) or getattr(deportista, 'disciplina', None),
    }
    
    return datos_completos, deportista_data, deportista, historia


def _generar_pdf_response(datos_completos: dict, deportista_data: dict, deportista, historia_id: str, inline: bool = False):
    """
    Función auxiliar para generar la respuesta PDF
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

@router.get("/{historia_id}/historia-clinica-pdf")
def descargar_historia_clinica_pdf(
    historia_id: str,
    db: Session = Depends(get_db)
):
    """
    Generar y descargar PDF de historia clínica completa
    """
    try:
        datos_completos, deportista_data, deportista, historia = _obtener_datos_para_pdf(db, historia_id)
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
    db: Session = Depends(get_db)
):
    """
    Generar PDF para compartir (vista en navegador)
    """
    try:
        datos_completos, deportista_data, deportista, historia = _obtener_datos_para_pdf(db, historia_id)
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
    db: Session = Depends(get_db)
):
    """
    Generar PDF para impresión
    """
    try:
        datos_completos, deportista_data, deportista, historia = _obtener_datos_para_pdf(db, historia_id)
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
    db: Session = Depends(get_db)
):
    """
    Descargar PDF para compartir por WhatsApp
    """
    try:
        datos_completos, deportista_data, deportista, historia = _obtener_datos_para_pdf(db, historia_id)
        
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
    db: Session = Depends(get_db)
):
    """
    Enviar historia clínica por correo electrónico con PDF adjunto
    """
    if not EMAIL_SERVICE_DISPONIBLE:
        raise HTTPException(
            status_code=503, 
            detail="Servicio de email no configurado"
        )
    
    try:
        datos_completos, deportista_data, deportista, historia = _obtener_datos_para_pdf(db, historia_id)
        
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
            asunto=f"Historia Clínica - {nombre_completo}",
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
    db: Session = Depends(get_db)
):
    """
    Obtener PDF como string Base64 para uso en frontend
    """
    import base64
    
    try:
        datos_completos, deportista_data, deportista, historia = _obtener_datos_para_pdf(db, historia_id)
        
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