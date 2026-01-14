"""
Endpoint especializado para obtener toda la historia clínica normalizada
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from uuid import UUID
from app.core.dependencies import get_db
from app.models.historia import HistoriaClinica
from app.crud.historia import listar_todas_historias, eliminar_historia

router = APIRouter(prefix="/historias_clinicas", tags=["Historia Clínica"])


@router.get("")
def listar_historias(db: Session = Depends(get_db)):
    """
    Listar todas las historias clínicas
    """
    historias = listar_todas_historias(db)
    return [
        {
            "id": str(h.id),
            "deportista_id": str(h.deportista_id),
            "fecha_apertura": h.fecha_apertura,
            "created_at": h.created_at,
            "deportista": {
                "id": str(h.deportista.id),
                "nombres": h.deportista.nombres,
                "apellidos": h.deportista.apellidos,
                "numero_documento": h.deportista.numero_documento,
            } if h.deportista else None
        }
        for h in historias
    ]


@router.get("/{historia_clinica_id}")
def obtener_historia(
    historia_clinica_id: str,
    db: Session = Depends(get_db)
):
    """
    Obtener una historia clínica por ID con todos sus datos
    """
    from sqlalchemy import text
    
    try:
        # Convertir a UUID si es necesario
        from uuid import UUID
        try:
            historia_uuid = UUID(historia_clinica_id)
        except:
            historia_uuid = historia_clinica_id
        
        historia = db.query(HistoriaClinica).filter(
            HistoriaClinica.id == historia_uuid
        ).first()
        
        if not historia:
            raise HTTPException(status_code=404, detail="Historia clínica no encontrada")
        
        # Retornar todos los datos de la historia
        return {
            "id": str(historia.id),
            "deportista_id": str(historia.deportista_id),
            "fecha_apertura": historia.fecha_apertura,
            "estado_id": str(historia.estado_id) if historia.estado_id else None,
            "created_at": historia.created_at,
            "deportista": {
                "id": str(historia.deportista.id),
                "nombres": historia.deportista.nombres,
                "apellidos": historia.deportista.apellidos,
                "numero_documento": historia.deportista.numero_documento,
            } if historia.deportista else None,
            "antecedentes_personales": [
                {
                    "id": str(a.id),
                    "codigo_cie11": a.codigo_cie11,
                    "nombre_enfermedad": a.nombre_enfermedad,
                    "observaciones": a.observaciones,
                    "created_at": a.created_at
                }
                for a in historia.antecedentes_personales
            ] if historia.antecedentes_personales else [],
            "antecedentes_familiares": [
                {
                    "id": str(a.id),
                    "tipo_familiar": a.tipo_familiar,
                    "codigo_cie11": a.codigo_cie11,
                    "nombre_enfermedad": a.nombre_enfermedad,
                    "created_at": a.created_at
                }
                for a in historia.antecedentes_familiares
            ] if historia.antecedentes_familiares else [],
            "lesiones_deportivas": [
                {
                    "id": str(l.id),
                    "tipo_lesion": l.tipo_lesion,
                    "fecha_lesion": l.fecha_lesion,
                    "tratamiento": l.tratamiento,
                    "observaciones": l.observaciones,
                    "created_at": l.created_at
                }
                for l in historia.lesiones_deportivas
            ] if historia.lesiones_deportivas else [],
            "cirugias_previas": [
                {
                    "id": str(c.id),
                    "tipo_cirugia": c.tipo_cirugia,
                    "fecha_cirugia": c.fecha_cirugia,
                    "observaciones": c.observaciones,
                    "created_at": c.created_at
                }
                for c in historia.cirugias_previas
            ] if historia.cirugias_previas else [],
            "alergias": [
                {
                    "id": str(a.id),
                    "tipo_alergia": a.tipo_alergia,
                    "descripcion": a.descripcion,
                    "reaccion": a.reaccion,
                    "created_at": a.created_at
                }
                for a in historia.alergias
            ] if historia.alergias else [],
            "medicaciones": [
                {
                    "id": str(m.id),
                    "nombre_medicamento": m.nombre_medicamento,
                    "dosis": m.dosis,
                    "frecuencia": m.frecuencia,
                    "duracion": m.duracion,
                    "indicacion": m.indicacion,
                    "created_at": m.created_at
                }
                for m in historia.medicaciones
            ] if historia.medicaciones else [],
            "vacunas_administradas": [
                {
                    "id": str(v.id),
                    "nombre_vacuna": v.nombre_vacuna,
                    "fecha_administracion": v.fecha_administracion,
                    "observaciones": v.observaciones,
                    "created_at": v.created_at
                }
                for v in historia.vacunas_administradas
            ] if historia.vacunas_administradas else [],
            "signos_vitales": [
                {
                    "id": str(s.id),
                    "estatura_cm": float(s.estatura_cm) if s.estatura_cm else None,
                    "peso_kg": float(s.peso_kg) if s.peso_kg else None,
                    "frecuencia_cardiaca_lpm": s.frecuencia_cardiaca_lpm,
                    "presion_arterial_sistolica": s.presion_arterial_sistolica,
                    "presion_arterial_diastolica": s.presion_arterial_diastolica,
                    "frecuencia_respiratoria_rpm": s.frecuencia_respiratoria_rpm,
                    "temperatura_celsius": float(s.temperatura_celsius) if s.temperatura_celsius else None,
                    "saturacion_oxigeno_percent": float(s.saturacion_oxigeno_percent) if s.saturacion_oxigeno_percent else None,
                    "imc": float(s.imc) if s.imc else None,
                    "created_at": s.created_at
                }
                for s in historia.signos_vitales
            ] if historia.signos_vitales else [],
            "diagnosticos": [
                {
                    "id": str(d.id),
                    "codigo_cie11": d.codigo_cie11,
                    "nombre_enfermedad": d.nombre_enfermedad,
                    "observaciones": d.observaciones,
                    "analisis_objetivo": d.analisis_objetivo,
                    "impresion_diagnostica": d.impresion_diagnostica,
                    "created_at": d.created_at
                }
                for d in historia.diagnosticos
            ] if historia.diagnosticos else [],
            "plan_tratamiento": [
                {
                    "id": str(p.id),
                    "indicaciones_medicas": p.indicaciones_medicas,
                    "recomendaciones_entrenamiento": p.recomendaciones_entrenamiento,
                    "plan_seguimiento": p.plan_seguimiento,
                    "created_at": p.created_at
                }
                for p in historia.plan_tratamiento
            ] if historia.plan_tratamiento else [],
            "remisiones_especialistas": [
                {
                    "id": str(r.id),
                    "especialista": r.especialista,
                    "motivo": r.motivo,
                    "prioridad": r.prioridad,
                    "fecha_remision": r.fecha_remision,
                    "created_at": r.created_at
                }
                for r in historia.remisiones_especialistas
            ] if historia.remisiones_especialistas else [],
            "pruebas_complementarias": [
                {
                    "id": str(p.id),
                    "categoria": p.categoria,
                    "nombre_prueba": p.nombre_prueba,
                    "codigo_cups": p.codigo_cups,
                    "resultado": p.resultado,
                    "created_at": p.created_at
                }
                for p in historia.pruebas_complementarias
            ] if historia.pruebas_complementarias else [],
            "revision_sistemas": [
                {
                    "id": str(r.id),
                    "sistema_nombre": r.sistema_nombre,
                    "estado": r.estado,
                    "observaciones": r.observaciones,
                    "tipo_revision": r.tipo_revision,
                    "created_at": r.created_at
                }
                for r in historia.revision_sistemas
            ] if historia.revision_sistemas else [],
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")


@router.delete("/{historia_clinica_id}", status_code=204)
def eliminar_historia_clinica(
    historia_clinica_id: str,
    db: Session = Depends(get_db)
):
    """
    Eliminar una historia clínica por ID
    """
    try:
        success = eliminar_historia(db, historia_clinica_id)
        if not success:
            raise HTTPException(status_code=404, detail="Historia clínica no encontrada")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al eliminar: {str(e)}")


@router.get("/{historia_clinica_id}/completa")
def obtener_historia_clinica_completa(
    historia_clinica_id: UUID,
    db: Session = Depends(get_db)
):
    """
    Obtener la historia clínica completa con todos los datos normalizados
    """
    historia = db.query(HistoriaClinica).filter(
        HistoriaClinica.id == historia_clinica_id
    ).first()
    
    if not historia:
        raise HTTPException(status_code=404, detail="Historia clínica no encontrada")
    
    return {
        "historia_clinica": {
            "id": str(historia.id),
            "deportista_id": str(historia.deportista_id),
            "fecha_apertura": historia.fecha_apertura,
            "estado_id": str(historia.estado_id),
            "created_at": historia.created_at
        },
        "antecedentes_personales": [
            {
                "id": str(a.id),
                "codigo_cie11": a.codigo_cie11,
                "nombre_enfermedad": a.nombre_enfermedad,
                "observaciones": a.observaciones,
                "created_at": a.created_at
            }
            for a in historia.antecedentes_personales
        ],
        "antecedentes_familiares": [
            {
                "id": str(a.id),
                "relacion": a.relacion,
                "codigo_cie11": a.codigo_cie11,
                "nombre_enfermedad": a.nombre_enfermedad,
                "created_at": a.created_at
            }
            for a in historia.antecedentes_familiares
        ],
        "lesiones_deportivas": [
            {
                "id": str(l.id),
                "tipo_lesion": l.tipo_lesion,
                "fecha_lesion": l.fecha_lesion,
                "tratamiento": l.tratamiento,
                "observaciones": l.observaciones,
                "created_at": l.created_at
            }
            for l in historia.lesiones_deportivas
        ],
        "cirugias_previas": [
            {
                "id": str(c.id),
                "tipo_cirugia": c.tipo_cirugia,
                "fecha_cirugia": c.fecha_cirugia,
                "observaciones": c.observaciones,
                "created_at": c.created_at
            }
            for c in historia.cirugias_previas
        ],
        "alergias": [
            {
                "id": str(a.id),
                "tipo_alergia": a.tipo_alergia,
                "descripcion": a.descripcion,
                "reaccion": a.reaccion,
                "created_at": a.created_at
            }
            for a in historia.alergias
        ],
        "medicaciones": [
            {
                "id": str(m.id),
                "nombre_medicamento": m.nombre_medicamento,
                "dosis": m.dosis,
                "frecuencia": m.frecuencia,
                "duracion": m.duracion,
                "indicacion": m.indicacion,
                "created_at": m.created_at
            }
            for m in historia.medicaciones
        ],
        "vacunas_administradas": [
            {
                "id": str(v.id),
                "nombre_vacuna": v.nombre_vacuna,
                "fecha_administracion": v.fecha_administracion,
                "proxima_dosis": v.proxima_dosis,
                "created_at": v.created_at
            }
            for v in historia.vacunas_administradas
        ],
        "revision_sistemas": [
            {
                "id": str(r.id),
                "sistema": r.sistema,
                "hallazgos": r.hallazgos,
                "observaciones": r.observaciones,
                "created_at": r.created_at
            }
            for r in historia.revision_sistemas
        ],
        "signos_vitales": {
            "id": str(historia.signos_vitales[0].id) if historia.signos_vitales else None,
            "presion_arterial": historia.signos_vitales[0].presion_arterial if historia.signos_vitales else None,
            "frecuencia_cardiaca": historia.signos_vitales[0].frecuencia_cardiaca if historia.signos_vitales else None,
            "frecuencia_respiratoria": historia.signos_vitales[0].frecuencia_respiratoria if historia.signos_vitales else None,
            "temperatura": historia.signos_vitales[0].temperatura if historia.signos_vitales else None,
            "peso": historia.signos_vitales[0].peso if historia.signos_vitales else None,
            "altura": historia.signos_vitales[0].altura if historia.signos_vitales else None,
            "imc": historia.signos_vitales[0].imc if historia.signos_vitales else None,
            "saturacion_oxigeno": historia.signos_vitales[0].saturacion_oxigeno if historia.signos_vitales else None,
            "created_at": historia.signos_vitales[0].created_at if historia.signos_vitales else None
        } if historia.signos_vitales else None,
        "pruebas_complementarias": [
            {
                "id": str(p.id),
                "tipo_prueba": p.tipo_prueba,
                "resultado": p.resultado,
                "fecha_prueba": p.fecha_prueba,
                "interpretacion": p.interpretacion,
                "observaciones": p.observaciones,
                "created_at": p.created_at
            }
            for p in historia.pruebas_complementarias
        ],
        "diagnosticos": [
            {
                "id": str(d.id),
                "codigo_cie11": d.codigo_cie11,
                "nombre_diagnostico": d.nombre_diagnostico,
                "tipo_diagnostico": d.tipo_diagnostico,
                "observaciones": d.observaciones,
                "created_at": d.created_at
            }
            for d in historia.diagnosticos
        ],
        "plan_tratamiento": {
            "id": str(historia.plan_tratamiento[0].id) if historia.plan_tratamiento else None,
            "recomendaciones": historia.plan_tratamiento[0].recomendaciones if historia.plan_tratamiento else None,
            "medicamentos_prescritos": historia.plan_tratamiento[0].medicamentos_prescritos if historia.plan_tratamiento else None,
            "procedimientos": historia.plan_tratamiento[0].procedimientos if historia.plan_tratamiento else None,
            "rehabilitacion": historia.plan_tratamiento[0].rehabilitacion if historia.plan_tratamiento else None,
            "fecha_seguimiento": historia.plan_tratamiento[0].fecha_seguimiento if historia.plan_tratamiento else None,
            "observaciones": historia.plan_tratamiento[0].observaciones if historia.plan_tratamiento else None,
            "created_at": historia.plan_tratamiento[0].created_at if historia.plan_tratamiento else None
        } if historia.plan_tratamiento else None,
        "remisiones_especialistas": [
            {
                "id": str(r.id),
                "especialidad": r.especialidad,
                "razon_remision": r.razon_remision,
                "prioridad": r.prioridad,
                "fecha_remision": r.fecha_remision,
                "institucion": r.institucion,
                "observaciones": r.observaciones,
                "created_at": r.created_at
            }
            for r in historia.remisiones_especialistas
        ],
        "motivo_consulta_enfermedad": {
            "id": str(historia.motivo_consulta_enfermedad[0].id) if historia.motivo_consulta_enfermedad else None,
            "motivo_consulta": historia.motivo_consulta_enfermedad[0].motivo_consulta if historia.motivo_consulta_enfermedad else None,
            "sintomas_principales": historia.motivo_consulta_enfermedad[0].sintomas_principales if historia.motivo_consulta_enfermedad else None,
            "duracion_sintomas": historia.motivo_consulta_enfermedad[0].duracion_sintomas if historia.motivo_consulta_enfermedad else None,
            "inicio_enfermedad": historia.motivo_consulta_enfermedad[0].inicio_enfermedad if historia.motivo_consulta_enfermedad else None,
            "evolucion": historia.motivo_consulta_enfermedad[0].evolucion if historia.motivo_consulta_enfermedad else None,
            "factor_desencadenante": historia.motivo_consulta_enfermedad[0].factor_desencadenante if historia.motivo_consulta_enfermedad else None,
            "medicamentos_previos": historia.motivo_consulta_enfermedad[0].medicamentos_previos if historia.motivo_consulta_enfermedad else None,
            "created_at": historia.motivo_consulta_enfermedad[0].created_at if historia.motivo_consulta_enfermedad else None
        } if historia.motivo_consulta_enfermedad else None,
        "exploracion_fisica_sistemas": {
            "id": str(historia.exploracion_fisica_sistemas[0].id) if historia.exploracion_fisica_sistemas else None,
            "sistema_cardiovascular": historia.exploracion_fisica_sistemas[0].sistema_cardiovascular if historia.exploracion_fisica_sistemas else None,
            "sistema_respiratorio": historia.exploracion_fisica_sistemas[0].sistema_respiratorio if historia.exploracion_fisica_sistemas else None,
            "sistema_digestivo": historia.exploracion_fisica_sistemas[0].sistema_digestivo if historia.exploracion_fisica_sistemas else None,
            "sistema_neurologico": historia.exploracion_fisica_sistemas[0].sistema_neurologico if historia.exploracion_fisica_sistemas else None,
            "sistema_genitourinario": historia.exploracion_fisica_sistemas[0].sistema_genitourinario if historia.exploracion_fisica_sistemas else None,
            "sistema_musculoesqueletico": historia.exploracion_fisica_sistemas[0].sistema_musculoesqueletico if historia.exploracion_fisica_sistemas else None,
            "sistema_integumentario": historia.exploracion_fisica_sistemas[0].sistema_integumentario if historia.exploracion_fisica_sistemas else None,
            "sistema_endocrino": historia.exploracion_fisica_sistemas[0].sistema_endocrino if historia.exploracion_fisica_sistemas else None,
            "cabeza_cuello": historia.exploracion_fisica_sistemas[0].cabeza_cuello if historia.exploracion_fisica_sistemas else None,
            "extremidades": historia.exploracion_fisica_sistemas[0].extremidades if historia.exploracion_fisica_sistemas else None,
            "observaciones_generales": historia.exploracion_fisica_sistemas[0].observaciones_generales if historia.exploracion_fisica_sistemas else None,
            "created_at": historia.exploracion_fisica_sistemas[0].created_at if historia.exploracion_fisica_sistemas else None
        } if historia.exploracion_fisica_sistemas else None
    }
