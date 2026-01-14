from fastapi import APIRouter, Query
from app.services.cups_service import buscar_cups

router = APIRouter()

@router.get("/buscar")
def buscar(q: str = Query(..., min_length=2)):
    return buscar_cups(q)
