def listar_catalogos(db):
    """
    Lista todos los catálogos disponibles desde la base de datos.
    
    Args:
        db: Sesión de base de datos
        
    Returns:
        Lista de catálogos disponibles
    """
    from app.models import Catalogo
    
    catalogos = db.query(Catalogo).all()
    return {
        "catalogos": [
            {
                "id": str(cat.id),
                "nombre": cat.nombre,
                "descripcion": cat.descripcion
            }
            for cat in catalogos
        ]
    }


def obtener_items_catalogo(db, nombre: str):
    """
    Obtiene los items de un catálogo específico desde la base de datos.
    
    Args:
        db: Sesión de base de datos
        nombre: Nombre del catálogo
        
    Returns:
        Lista de items del catálogo solicitado o None si no existe
    """
    from app.models import Catalogo, CatalogoItem
    
    # Obtener el catálogo por nombre
    catalogo = db.query(Catalogo).filter(Catalogo.nombre == nombre).first()
    
    if not catalogo:
        return None
    
    # Obtener los items del catálogo
    items = db.query(CatalogoItem).filter(
        CatalogoItem.catalogo_id == catalogo.id,
        CatalogoItem.activo == True
    ).all()
    
    # Convertir a diccionarios
    return [
        {
            "id": str(item.id),
            "catalogo_id": str(item.catalogo_id),
            "codigo": item.codigo,
            "nombre": item.nombre,
            "activo": item.activo
        }
        for item in items
    ]
