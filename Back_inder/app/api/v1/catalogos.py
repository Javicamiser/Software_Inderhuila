from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.crud.catalogo import listar_catalogos, obtener_items_catalogo

router = APIRouter()

@router.get("/")
def listar(db: Session = Depends(get_db)):
    return listar_catalogos(db)

@router.get("/{nombre}/items")
def obtener_items(nombre: str, db: Session = Depends(get_db)):
    items = obtener_items_catalogo(db, nombre)
    if not items:
        raise HTTPException(status_code=404, detail="Catálogo no encontrado")
    return items

# En main.py agregar:
# app.include_router(catalogos.router, prefix="/api/v1/catalogos")