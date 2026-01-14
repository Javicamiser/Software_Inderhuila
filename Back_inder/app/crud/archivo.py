from app.models.archivo import ArchivoClinico

def crear_archivo(db, data):
    archivo = ArchivoClinico(**data)
    db.add(archivo)
    db.commit()
    db.refresh(archivo)
    return archivo

def listar_archivos_por_historia(db, historia_id):
    return db.query(ArchivoClinico).filter(
        ArchivoClinico.historia_id == historia_id
    ).order_by(ArchivoClinico.fecha_subida.desc()).all()
