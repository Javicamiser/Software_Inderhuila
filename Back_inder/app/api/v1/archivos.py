from fastapi import APIRouter, UploadFile, File, Depends, HTTPException, Form
from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.utils.files import save_upload_file
from app.crud.archivo import crear_archivo, listar_archivos_por_historia
from app.schemas.archivo import ArchivoResponse

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/", response_model=ArchivoResponse)
def subir_archivo(
    historia_id: str = Form(...),
    categoria: str = Form(None),
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    try:
        ruta, ext = save_upload_file(file, historia_id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    data = {
        "historia_id": historia_id,
        "nombre_original": file.filename,
        "tipo_archivo": ext,
        "categoria": categoria,
        "ruta": ruta
    }

    return crear_archivo(db, data)

@router.get("/historia/{historia_id}", response_model=list[ArchivoResponse])
def listar_archivos(historia_id: str, db: Session = Depends(get_db)):
    return listar_archivos_por_historia(db, historia_id)
