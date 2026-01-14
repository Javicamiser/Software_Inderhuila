"""
Endpoint para generar y descargar documentos médicos
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
from app.crud.historia import obtener_historia_datos_completos

router = APIRouter(prefix="/documentos", tags=["Documentos"])


@router.get("/{historia_id}/historia-clinica-pdf")
def descargar_historia_clinica_pdf(
    historia_id: str,
    db: Session = Depends(get_db)
):
    """
    Generar y descargar PDF de historia clínica
    
    GET /api/v1/documentos/{historia_id}/historia-clinica-pdf
    """
    try:
        # Obtener historia clínica
        historia = db.query(HistoriaClinica).filter(
            HistoriaClinica.id == historia_id
        ).first()
        
        if not historia:
            raise HTTPException(status_code=404, detail="Historia clínica no encontrada")
        
        # Obtener deportista
        deportista = db.query(Deportista).filter(
            Deportista.id == historia.deportista_id
        ).first()
        
        if not deportista:
            raise HTTPException(status_code=404, detail="Deportista no encontrado")
        
        # Obtener datos completos
        datos_completos = obtener_historia_datos_completos(db, historia_id)
        
        # Generar PDF
        pdf_buffer = generar_documento_historia_clinica(
            datos_completos,
            {
                "nombres": deportista.nombres,
                "apellidos": deportista.apellidos,
                "numero_documento": deportista.numero_documento,
            }
        )
        
        # Retornar PDF
        pdf_buffer.seek(0)  # Ir al inicio del buffer
        return StreamingResponse(
            iter([pdf_buffer.getvalue()]),
            media_type="application/pdf",
            headers={
                "Content-Disposition": f"attachment; filename=historia_clinica_{deportista.numero_documento}_{historia.id}.pdf"
            }
        )
    
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error al generar PDF: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error al generar documento: {str(e)}")
