from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from pydantic import BaseModel
from datetime import datetime, timedelta
import uuid
import io

from app.core.database import get_db
from app.models.token_descarga import TokenDescarga
from app.models.historia import HistoriaClinica
from app.models.deportista import Deportista
from app.services.documento_service import generar_documento_historia_clinica

router = APIRouter(prefix="/descarga-segura", tags=["Descarga Segura"])

# Configuración de URL - Cambiar en producción
import os
BASE_URL_FRONTEND = os.getenv("BASE_URL_FRONTEND", "http://192.168.1.18:5173")

class VerificarTokenRequest(BaseModel):
    token: str
    cedula: str


def obtener_historia_completa(db: Session, historia_id: str) -> tuple:
    """Obtiene los datos completos de historia y deportista para el PDF"""
    from app.models.antecedentes import (
        AntecedentesPersonales, AntecedentesFamiliares, LesioneDeportivas,
        CirugiasPrivas, Alergias, Medicaciones, VacunasAdministradas,
        RevisionSistemas, SignosVitales, PruebasComplementarias,
        Diagnosticos, PlanTratamiento, RemisionesEspecialistas,
        MotivoConsultaEnfermedadActual, ExploracionFisicaSistemas
    )
    
    historia = db.query(HistoriaClinica).filter(HistoriaClinica.id == historia_id).first()
    if not historia:
        return None, None
    
    deportista = db.query(Deportista).filter(Deportista.id == historia.deportista_id).first()
    if not deportista:
        return None, None
    
    deportista_data = {
        "id": str(deportista.id),
        "nombres": deportista.nombres,
        "apellidos": deportista.apellidos,
        "numero_documento": deportista.numero_documento,
        "fecha_nacimiento": str(deportista.fecha_nacimiento) if deportista.fecha_nacimiento else None,
        "telefono": deportista.telefono,
        "email": deportista.email,
        "deporte": getattr(deportista, 'tipo_deporte', None) or getattr(deportista, 'deporte', None) or getattr(deportista, 'disciplina', None)
    }
    
    def to_dict_list(items):
        result = []
        for item in items:
            if hasattr(item, '__dict__'):
                d = {k: v for k, v in item.__dict__.items() if not k.startswith('_')}
                result.append(d)
        return result
    
    # =========================================================================
    # Seccion 1: Motivo de Consulta y Enfermedad Actual
    # =========================================================================
    motivo_consulta_data = None
    try:
        motivos = db.query(MotivoConsultaEnfermedadActual).filter(
            MotivoConsultaEnfermedadActual.historia_clinica_id == historia_id
        ).all()
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
        print(f"Advertencia motivo_consulta en descarga_segura: {e}")

    # =========================================================================
    # Seccion 5: Exploracion Fisica por Sistemas
    # =========================================================================
    exploracion_fisica_data = None
    try:
        exploraciones = db.query(ExploracionFisicaSistemas).filter(
            ExploracionFisicaSistemas.historia_clinica_id == historia_id
        ).all()
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
        print(f"Advertencia exploracion_fisica en descarga_segura: {e}")

    historia_data = {
        "id": str(historia.id),
        "fecha_apertura": str(historia.fecha_apertura) if historia.fecha_apertura else None,

        # Seccion 1: Motivo de consulta
        "motivo_consulta_enfermedad": motivo_consulta_data,

        # Seccion 2: Antecedentes
        "antecedentes_personales": to_dict_list(
            db.query(AntecedentesPersonales).filter(AntecedentesPersonales.historia_clinica_id == historia_id).all()
        ),
        "antecedentes_familiares": to_dict_list(
            db.query(AntecedentesFamiliares).filter(AntecedentesFamiliares.historia_clinica_id == historia_id).all()
        ),
        "lesiones_deportivas": to_dict_list(
            db.query(LesioneDeportivas).filter(LesioneDeportivas.historia_clinica_id == historia_id).all()
        ),
        "cirugias_previas": to_dict_list(
            db.query(CirugiasPrivas).filter(CirugiasPrivas.historia_clinica_id == historia_id).all()
        ),
        "alergias": to_dict_list(
            db.query(Alergias).filter(Alergias.historia_clinica_id == historia_id).all()
        ),
        "medicaciones": to_dict_list(
            db.query(Medicaciones).filter(Medicaciones.historia_clinica_id == historia_id).all()
        ),
        "vacunas_administradas": to_dict_list(
            db.query(VacunasAdministradas).filter(VacunasAdministradas.historia_clinica_id == historia_id).all()
        ),

        # Seccion 3: Revision por sistemas
        "revision_sistemas": to_dict_list(
            db.query(RevisionSistemas).filter(RevisionSistemas.historia_clinica_id == historia_id).all()
        ),

        # Seccion 4: Signos vitales
        "signos_vitales": to_dict_list(
            db.query(SignosVitales).filter(SignosVitales.historia_clinica_id == historia_id).all()
        ),

        # Seccion 5: Exploracion fisica
        "exploracion_fisica_sistemas": exploracion_fisica_data,

        # Seccion 6: Pruebas complementarias
        "pruebas_complementarias": to_dict_list(
            db.query(PruebasComplementarias).filter(PruebasComplementarias.historia_clinica_id == historia_id).all()
        ),

        # Seccion 7: Diagnosticos
        "diagnosticos": to_dict_list(
            db.query(Diagnosticos).filter(Diagnosticos.historia_clinica_id == historia_id).all()
        ),

        # Seccion 8: Plan de tratamiento
        "plan_tratamiento": to_dict_list(
            db.query(PlanTratamiento).filter(PlanTratamiento.historia_clinica_id == historia_id).all()
        ),

        # Seccion 9: Remisiones a especialistas
        "remisiones_especialistas": to_dict_list(
            db.query(RemisionesEspecialistas).filter(RemisionesEspecialistas.historia_clinica_id == historia_id).all()
        ),
    }
    
    return historia_data, deportista_data


@router.post("/generar-token/{historia_clinica_id}")
async def generar_token_descarga(
    historia_clinica_id: str,
    db: Session = Depends(get_db)
):
    """Genera un token de descarga segura para enviar por WhatsApp"""
    try:
        historia = db.query(HistoriaClinica).filter(
            HistoriaClinica.id == historia_clinica_id
        ).first()
        
        if not historia:
            raise HTTPException(status_code=404, detail="Historia clínica no encontrada")
        
        deportista = db.query(Deportista).filter(
            Deportista.id == historia.deportista_id
        ).first()
        
        if not deportista:
            raise HTTPException(status_code=404, detail="Deportista no encontrado")
        
        # Desactivar tokens anteriores
        db.query(TokenDescarga).filter(
            TokenDescarga.historia_id == historia_clinica_id,
            TokenDescarga.bloqueado == False,
            TokenDescarga.usado == False
        ).update({"bloqueado": True})
        
        # Crear nuevo token
        nuevo_token = TokenDescarga(
            historia_id=historia_clinica_id,
            deportista_id=deportista.id,
            numero_documento=deportista.numero_documento,
            fecha_expiracion=datetime.utcnow() + timedelta(hours=2)
        )
        
        db.add(nuevo_token)
        db.commit()
        db.refresh(nuevo_token)
        
        url_descarga = f"{BASE_URL_FRONTEND}/descargar/{nuevo_token.token}"
        
        return {
            "success": True,
            "token": nuevo_token.token,
            "url": url_descarga,
            "expira_en": "2 horas",
            "mensaje": "Enlace generado correctamente"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        print(f"Error generando token: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error al generar token: {str(e)}")


@router.post("/verificar")
async def verificar_token(
    request: VerificarTokenRequest,
    db: Session = Depends(get_db)
):
    """Verifica el token y la cédula del deportista"""
    try:
        token_db = db.query(TokenDescarga).filter(
            TokenDescarga.token == request.token,
            TokenDescarga.bloqueado == False
        ).first()
        
        if not token_db:
            raise HTTPException(status_code=404, detail="Enlace no válido o expirado")
        
        # Verificar expiración
        if datetime.utcnow() > token_db.fecha_expiracion:
            token_db.bloqueado = True
            db.commit()
            raise HTTPException(status_code=410, detail="El enlace ha expirado")
        
        # Verificar intentos (máximo 3)
        if token_db.intentos_fallidos >= 3:
            token_db.bloqueado = True
            db.commit()
            raise HTTPException(status_code=429, detail="Máximo de intentos alcanzado. Solicite un nuevo enlace.")
        
        # Verificar cédula
        cedula_limpia = request.cedula.strip().replace(".", "").replace(",", "").replace(" ", "")
        cedula_db = token_db.numero_documento.strip().replace(".", "").replace(",", "").replace(" ", "")
        
        if cedula_limpia != cedula_db:
            token_db.intentos_fallidos += 1
            db.commit()
            intentos_restantes = 3 - token_db.intentos_fallidos
            # IMPORTANTE: Devolver HTTPException con status 401
            raise HTTPException(
                status_code=401, 
                detail=f"Cédula incorrecta. Intentos restantes: {intentos_restantes}"
            )
        
        # Marcar como verificado (usado=True permite la descarga)
        token_db.usado = True
        token_db.fecha_uso = datetime.utcnow()
        db.commit()
        
        return {
            "success": True,
            "mensaje": "Verificación exitosa",
            "historia_clinica_id": str(token_db.historia_id)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error verificando token: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error al verificar: {str(e)}")


@router.get("/descargar/{token}")
async def descargar_con_token(
    token: str,
    db: Session = Depends(get_db)
):
    """Descarga el PDF si el token fue verificado"""
    try:
        token_db = db.query(TokenDescarga).filter(
            TokenDescarga.token == token
        ).first()
        
        if not token_db:
            raise HTTPException(status_code=404, detail="Token no encontrado")
        
        if token_db.bloqueado:
            raise HTTPException(status_code=403, detail="Este enlace ya no está disponible")
        
        if not token_db.usado:
            raise HTTPException(status_code=403, detail="Debe verificar su cédula primero")
        
        # Verificar expiración
        if datetime.utcnow() > token_db.fecha_expiracion:
            token_db.bloqueado = True
            db.commit()
            raise HTTPException(status_code=410, detail="El enlace ha expirado")
        
        historia_id = str(token_db.historia_id)
        historia_data, deportista_data = obtener_historia_completa(db, historia_id)
        
        if not historia_data or not deportista_data:
            raise HTTPException(status_code=404, detail="No se encontraron los datos de la historia")
        
        pdf_buffer = generar_documento_historia_clinica(historia_data, deportista_data)
        
        if not pdf_buffer:
            raise HTTPException(status_code=500, detail="Error generando el PDF")
        
        # Bloquear token después de descarga exitosa
        token_db.bloqueado = True
        db.commit()
        
        return StreamingResponse(
            pdf_buffer,
            media_type="application/pdf",
            headers={
                "Content-Disposition": f"attachment; filename=historia_clinica_{token_db.numero_documento}.pdf"
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error descargando PDF: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error al descargar: {str(e)}")


@router.get("/info/{token}")
async def obtener_info_token(
    token: str,
    db: Session = Depends(get_db)
):
    """Obtiene información del token"""
    try:
        token_db = db.query(TokenDescarga).filter(
            TokenDescarga.token == token
        ).first()
        
        if not token_db:
            return {"valido": False, "mensaje": "Enlace no válido"}
        
        if token_db.bloqueado:
            return {"valido": False, "mensaje": "Este enlace ya fue utilizado"}
        
        if datetime.utcnow() > token_db.fecha_expiracion:
            return {"valido": False, "mensaje": "Este enlace ha expirado"}
        
        if token_db.intentos_fallidos >= 3:
            return {"valido": False, "mensaje": "Máximo de intentos alcanzado"}
        
        return {
            "valido": True,
            "intentos_restantes": 3 - token_db.intentos_fallidos,
            "expira_en": token_db.fecha_expiracion.isoformat()
        }
        
    except Exception as e:
        print(f"Error obteniendo info: {str(e)}")
        return {"valido": False, "mensaje": "Error al obtener información"}