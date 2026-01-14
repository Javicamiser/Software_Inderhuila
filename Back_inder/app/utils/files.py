import os
import shutil
from fastapi import UploadFile
from app.core.config import UPLOAD_DIR

ALLOWED_EXTENSIONS = {"pdf", "jpg", "jpeg", "png", "dcm"}

def save_upload_file(file: UploadFile, historia_id: str) -> tuple[str, str]:
    ext = file.filename.split(".")[-1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise ValueError("Tipo de archivo no permitido")

    historia_path = os.path.join(UPLOAD_DIR, historia_id)
    os.makedirs(historia_path, exist_ok=True)

    file_path = os.path.join(historia_path, file.filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    return file_path, ext
