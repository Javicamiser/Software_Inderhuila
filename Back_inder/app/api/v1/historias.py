from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.dependencies import get_db
from app.schemas.historia import HistoriaClinicaCompleteCreate
from app.crud.historia import crear_historia_completa

router = APIRouter(prefix="/historias-clinicas", tags=["Historia Clínica"])

@router.post("/completa")
def guardar_historia_completa(
    data: dict,  # ← Cambiar a dict en lugar de schema tipado
    db: Session = Depends(get_db)
):
    """
    Guardar una historia clínica completa
    Acepta el formato del frontend y normaliza internamente
    """
    try:
        # Normalizar los datos antes de pasarlos al CRUD
        data_normalizado = normalizar_historia_data(data)
        
        # Convertir a schema
        historia_data = HistoriaClinicaCompleteCreate(**data_normalizado)
        
        # Guardar
        resultado = crear_historia_completa(db, historia_data)
        return resultado
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        import traceback
        print(f"Error: {str(e)}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error interno: {str(e)}")


def normalizar_historia_data(data: dict) -> dict:
    """
    Transforma el payload del frontend al formato esperado por el backend
    """
    
    # Normalizar revisionSistemas
    if 'revisionSistemas' in data and isinstance(data['revisionSistemas'], dict):
        rev = data['revisionSistemas']
        
        # Convertir formato anidado a plano
        if 'cardiovascular' in rev and isinstance(rev['cardiovascular'], dict):
            # Es el formato anidado, convertir
            data['revisionSistemas'] = {
                'sistema_cardiovascular': rev.get('cardiovascular', {}).get('estado', 'Normal'),
                'sistema_respiratorio': rev.get('respiratorio', {}).get('estado', 'Normal'),
                'sistema_digestivo': rev.get('digestivo', {}).get('estado', 'Normal'),
                'sistema_neurologico': rev.get('neurologico', {}).get('estado', 'Normal'),
                'sistema_musculoesqueletico': rev.get('musculoesqueletico', {}).get('estado', 'Normal'),
                'sistema_genitourinario': rev.get('genitourinario', {}).get('estado', 'Normal'),
                'sistema_endocrino': rev.get('endocrino', {}).get('estado', 'Normal'),
                'sistema_integumentario': rev.get('pielFaneras', {}).get('estado', 'Normal'),
                'observaciones_generales': rev.get('observaciones', '')
            }
    
    # Normalizar exploracionSistemas
    if 'exploracionSistemas' in data and isinstance(data['exploracionSistemas'], dict):
        expl = data['exploracionSistemas']
        
        if 'cardiovascular' in expl and isinstance(expl['cardiovascular'], dict):
            # Es el formato anidado, convertir
            data['exploracionSistemas'] = {
                'sistema_cardiovascular': expl.get('cardiovascular', {}).get('estado', 'Normal'),
                'sistema_respiratorio': expl.get('respiratorio', {}).get('estado', 'Normal'),
                'sistema_digestivo': expl.get('digestivo', {}).get('estado', 'Normal'),
                'sistema_neurologico': expl.get('neurologico', {}).get('estado', 'Normal'),
                'sistema_musculoesqueletico': expl.get('musculoesqueletico', {}).get('estado', 'Normal'),
                'sistema_genitourinario': expl.get('genitourinario', {}).get('estado', 'Normal'),
                'sistema_endocrino': expl.get('endocrino', {}).get('estado', 'Normal'),
                'sistema_integumentario': expl.get('pielFaneras', {}).get('estado', 'Normal'),
                'cabeza_cuello': expl.get('cabezaCuello', {}).get('estado', 'Normal'),
                'extremidades': expl.get('extremidades', {}).get('estado', 'Normal'),
                'observaciones_generales': expl.get('observaciones', '')
            }
    
    # Normalizar antecedentesPersonales (camelCase → snake_case)
    if 'antecedentesPersonales' in data:
        data['antecedentesPersonales'] = [
            {
                'codigo_cie11': item.get('codigoCIE11') or item.get('codigo_cie11'),
                'nombre_enfermedad': item.get('nombreEnfermedad') or item.get('nombre_enfermedad'),
                'observaciones': item.get('observaciones', '')
            }
            for item in data.get('antecedentesPersonales', [])
        ]
    
    # Normalizar antecedentesFamiliares
    if 'antecedentesFamiliares' in data:
        data['antecedentesFamiliares'] = [
            {
                'tipo_familiar': item.get('tipoFamiliar') or item.get('tipo_familiar'),
                'codigo_cie11': item.get('codigoCIE11') or item.get('codigo_cie11'),
                'nombre_enfermedad': item.get('nombreEnfermedad') or item.get('nombre_enfermedad')
            }
            for item in data.get('antecedentesFamiliares', [])
        ]
    
    # Normalizar diagnosticos
    if 'diagnosticos' in data:
        data['diagnosticos'] = [
            {
                'codigo': item.get('codigo') or item.get('codigo_cie11', ''),
                'nombre': item.get('nombre') or item.get('nombre_enfermedad', ''),
                'tipo_diagnostico': item.get('tipo_diagnostico', 'Diagnóstico principal'),
                'observaciones': item.get('observaciones', '')
            }
            for item in data.get('diagnosticos', [])
        ]
    
    # Normalizar remisionesEspecialistas
    if 'remisionesEspecialistas' in data:
        data['remisionesEspecialistas'] = [
            {
                'especialista': item.get('especialista', ''),
                'motivo': item.get('motivo', ''),
                'prioridad': item.get('prioridad', 'Normal'),
                'fechaRemision': item.get('fechaRemision') or item.get('fecha_remision')
            }
            for item in data.get('remisionesEspecialistas', [])
        ]
    
    # Normalizar alergias
    if 'alergias' in data and isinstance(data['alergias'], list):
        # Convertir lista de objetos a string
        partes = []
        for alergia in data['alergias']:
            if isinstance(alergia, dict):
                tipo = alergia.get('tipo', '')
                subtipos = alergia.get('subtipos', [])
                detalles = alergia.get('detalles', '')
                
                parte = f"{tipo}: {', '.join(subtipos)}"
                if detalles:
                    parte += f" - {detalles}"
                partes.append(parte)
        
        data['alergias'] = "; ".join(partes) if partes else None
    
    return data