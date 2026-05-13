# ============================================================
# ROUTER CIE-11
# Archivo: app/api/v1/cie11.py
# ============================================================
from fastapi import APIRouter, Query, HTTPException
from app.services.cie11_service import buscar_cie11

router = APIRouter()


@router.get("/buscar")
def buscar(q: str = Query(..., min_length=2, description="Texto o código a buscar")):
    """Busca códigos CIE-11 en la API oficial de la OMS."""
    try:
        resultados = buscar_cie11(q)
        return resultados
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))