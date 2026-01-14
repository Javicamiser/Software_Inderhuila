"""
Script para insertar catálogos y sus items en la base de datos
Ejecutar desde la raíz del proyecto: python -m scripts.seed_catalogos
"""

from app.core.database import SessionLocal, Base, engine
from app.models import Catalogo, CatalogoItem
from sqlalchemy.exc import IntegrityError

# Crear tablas si no existen
Base.metadata.create_all(bind=engine)

db = SessionLocal()

try:
    # Verificar si ya existen catalogos
    catalogos_existentes = db.query(Catalogo).count()
    
    if catalogos_existentes > 0:
        print("Los catálogos ya existen en la base de datos")
        db.close()
        exit(0)
    
    # Datos de catálogos
    catalogos_data = {
        "tipos_documento": {
            "descripcion": "Tipos de documento de identidad",
            "items": [
                {"codigo": "CC", "nombre": "Cédula de Ciudadanía"},
                {"codigo": "CE", "nombre": "Cédula de Extranjería"},
                {"codigo": "PA", "nombre": "Pasaporte"},
                {"codigo": "TE", "nombre": "Tarjeta de Extranjería"},
                {"codigo": "RC", "nombre": "Registro Civil"}
            ]
        },
        "sexos": {
            "descripcion": "Sexo/Género",
            "items": [
                {"codigo": "M", "nombre": "Masculino"},
                {"codigo": "F", "nombre": "Femenino"},
                {"codigo": "O", "nombre": "Otro"}
            ]
        },
        "estados": {
            "descripcion": "Estados del deportista",
            "items": [
                {"codigo": "ACT", "nombre": "Activo"},
                {"codigo": "INA", "nombre": "Inactivo"},
                {"codigo": "SUS", "nombre": "Suspendido"}
            ]
        },
        "tipos_cita": {
            "descripcion": "Tipos de cita médica",
            "items": [
                {"codigo": "REV", "nombre": "Revisión Médica"},
                {"codigo": "THR", "nombre": "Terapia"},
                {"codigo": "FIS", "nombre": "Fisioterapia"},
                {"codigo": "LAB", "nombre": "Laboratorio"},
                {"codigo": "IMG", "nombre": "Imagenología"}
            ]
        },
        "estados_cita": {
            "descripcion": "Estados de la cita",
            "items": [
                {"codigo": "PROG", "nombre": "Programada"},
                {"codigo": "CONF", "nombre": "Confirmada"},
                {"codigo": "CAN", "nombre": "Cancelada"},
                {"codigo": "RES", "nombre": "Realizada"},
                {"codigo": "NOPRES", "nombre": "No Presentó"}
            ]
        },
        "estado_historia": {
            "descripcion": "Estados de la historia clínica",
            "items": [
                {"codigo": "ABIERTA", "nombre": "Abierta"},
                {"codigo": "CERRADA", "nombre": "Cerrada"},
                {"codigo": "ARCHIVADA", "nombre": "Archivada"}
            ]
        }
    }
    
    # Insertar catálogos e items
    for nombre_catalogo, datos in catalogos_data.items():
        print(f"Insertando catálogo: {nombre_catalogo}")
        
        # Crear catálogo
        catalogo = Catalogo(
            nombre=nombre_catalogo,
            descripcion=datos.get("descripcion")
        )
        db.add(catalogo)
        db.flush()  # Para obtener el ID del catálogo
        
        # Insertar items del catálogo
        for item_data in datos.get("items", []):
            item = CatalogoItem(
                catalogo_id=catalogo.id,
                codigo=item_data.get("codigo"),
                nombre=item_data["nombre"],
                activo=True
            )
            db.add(item)
            print(f"  - {item_data['nombre']}")
    
    # Confirmar cambios
    db.commit()
    print("\n✅ Catálogos insertados correctamente")
    
except IntegrityError as e:
    db.rollback()
    print(f"⚠️  Error de integridad: {str(e)}")
except Exception as e:
    db.rollback()
    print(f"❌ Error: {str(e)}")
finally:
    db.close()
