from fastapi import APIRouter, Query, HTTPException
from app.services.cie11_service import buscar_cie11

router = APIRouter()

@router.get("/buscar")
def buscar(q: str = Query(..., min_length=2)):
    try:
        return buscar_cie11(q)
    except Exception as e:
        raise HTTPException(status_code=500, detail="Error consultando CIE-11")
