"""
API endpoints para Historia Clínica - Datos normalizados
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from uuid import UUID
from typing import List

from app.core.dependencies import get_db
from app.schemas.antecedentes import (
    AntecedentesPersonalesCreate, AntecedentesPersonalesResponse,
    AntecedentesFamiliaresCreate, AntecedentesFamiliaresResponse,
    LesioneDeportavasCreate, LesioneDeportavasResponse,
    CirugiasPrivasCreate, CirugiasPrivasResponse,
    AlergiasCreate, AlergiasResponse,
    MedicacionesCreate, MedicacionesResponse,
    VacunasAdministradasCreate, VacunasAdministradasResponse,
    RevisionSistemasCreate, RevisionSistemasResponse,
    SignosVitalesCreate, SignosVitalesResponse,
    PruebasComplementariasCreate, PruebasComplementariasResponse,
    DiagnosticosCreate, DiagnosticosResponse,
    PlanTratamientoCreate, PlanTratamientoResponse,
    RemisionesEspecialistasCreate, RemisionesEspecialistasResponse
)
from app.crud import antecedentes

router = APIRouter(prefix="/antecedentes", tags=["Historia Clínica"])


# ============================================================================
# ANTECEDENTES PERSONALES
# ============================================================================

@router.post("/personales", response_model=AntecedentesPersonalesResponse)
def crear_antecedente_personal(
    data: AntecedentesPersonalesCreate,
    db: Session = Depends(get_db)
):
    """Crear un nuevo antecedente personal"""
    return antecedentes.crear_antecedente_personal(db, data)


@router.get("/personales/historia/{historia_clinica_id}", response_model=List[AntecedentesPersonalesResponse])
def obtener_antecedentes_personales(
    historia_clinica_id: UUID,
    db: Session = Depends(get_db)
):
    """Obtener antecedentes personales de una historia clínica"""
    return antecedentes.obtener_antecedentes_personales(db, historia_clinica_id)


@router.delete("/personales/{antecedente_id}")
def eliminar_antecedente_personal(
    antecedente_id: UUID,
    db: Session = Depends(get_db)
):
    """Eliminar un antecedente personal"""
    antecedentes.eliminar_antecedente_personal(db, antecedente_id)
    return {"message": "Antecedente personal eliminado"}


# ============================================================================
# ANTECEDENTES FAMILIARES
# ============================================================================

@router.post("/familiares", response_model=AntecedentesFamiliaresResponse)
def crear_antecedente_familiar(
    data: AntecedentesFamiliaresCreate,
    db: Session = Depends(get_db)
):
    """Crear un nuevo antecedente familiar"""
    return antecedentes.crear_antecedente_familiar(db, data)


@router.get("/familiares/historia/{historia_clinica_id}", response_model=List[AntecedentesFamiliaresResponse])
def obtener_antecedentes_familiares(
    historia_clinica_id: UUID,
    db: Session = Depends(get_db)
):
    """Obtener antecedentes familiares de una historia clínica"""
    return antecedentes.obtener_antecedentes_familiares(db, historia_clinica_id)


@router.delete("/familiares/{antecedente_id}")
def eliminar_antecedente_familiar(
    antecedente_id: UUID,
    db: Session = Depends(get_db)
):
    """Eliminar un antecedente familiar"""
    antecedentes.eliminar_antecedente_familiar(db, antecedente_id)
    return {"message": "Antecedente familiar eliminado"}


# ============================================================================
# LESIONES DEPORTIVAS
# ============================================================================

@router.post("/lesiones-deportivas", response_model=LesioneDeportavasResponse)
def crear_lesion_deportiva(
    data: LesioneDeportavasCreate,
    db: Session = Depends(get_db)
):
    """Crear una nueva lesión deportiva"""
    return antecedentes.crear_lesion_deportiva(db, data)


@router.get("/lesiones-deportivas/historia/{historia_clinica_id}", response_model=List[LesioneDeportavasResponse])
def obtener_lesiones_deportivas(
    historia_clinica_id: UUID,
    db: Session = Depends(get_db)
):
    """Obtener lesiones deportivas de una historia clínica"""
    return antecedentes.obtener_lesiones_deportivas(db, historia_clinica_id)


@router.delete("/lesiones-deportivas/{lesion_id}")
def eliminar_lesion_deportiva(
    lesion_id: UUID,
    db: Session = Depends(get_db)
):
    """Eliminar una lesión deportiva"""
    antecedentes.eliminar_lesion_deportiva(db, lesion_id)
    return {"message": "Lesión deportiva eliminada"}


# ============================================================================
# CIRUGÍAS PREVIAS
# ============================================================================

@router.post("/cirugias", response_model=CirugiasPrivasResponse)
def crear_cirugia(
    data: CirugiasPrivasCreate,
    db: Session = Depends(get_db)
):
    """Crear una nueva cirugía previa"""
    return antecedentes.crear_cirugia(db, data)


@router.get("/cirugias/historia/{historia_clinica_id}", response_model=List[CirugiasPrivasResponse])
def obtener_cirugias(
    historia_clinica_id: UUID,
    db: Session = Depends(get_db)
):
    """Obtener cirugías previas de una historia clínica"""
    return antecedentes.obtener_cirugias(db, historia_clinica_id)


@router.delete("/cirugias/{cirugia_id}")
def eliminar_cirugia(
    cirugia_id: UUID,
    db: Session = Depends(get_db)
):
    """Eliminar una cirugía previa"""
    antecedentes.eliminar_cirugia(db, cirugia_id)
    return {"message": "Cirugía previa eliminada"}


# ============================================================================
# ALERGIAS
# ============================================================================

@router.post("/alergias", response_model=AlergiasResponse)
def crear_alergia(
    data: AlergiasCreate,
    db: Session = Depends(get_db)
):
    """Crear una nueva alergia"""
    return antecedentes.crear_alergia(db, data)


@router.get("/alergias/historia/{historia_clinica_id}", response_model=List[AlergiasResponse])
def obtener_alergias(
    historia_clinica_id: UUID,
    db: Session = Depends(get_db)
):
    """Obtener alergias de una historia clínica"""
    return antecedentes.obtener_alergias(db, historia_clinica_id)


@router.delete("/alergias/{alergia_id}")
def eliminar_alergia(
    alergia_id: UUID,
    db: Session = Depends(get_db)
):
    """Eliminar una alergia"""
    antecedentes.eliminar_alergia(db, alergia_id)
    return {"message": "Alergia eliminada"}


# ============================================================================
# MEDICACIONES
# ============================================================================

@router.post("/medicaciones", response_model=MedicacionesResponse)
def crear_medicacion(
    data: MedicacionesCreate,
    db: Session = Depends(get_db)
):
    """Crear una nueva medicación"""
    return antecedentes.crear_medicacion(db, data)


@router.get("/medicaciones/historia/{historia_clinica_id}", response_model=List[MedicacionesResponse])
def obtener_medicaciones(
    historia_clinica_id: UUID,
    db: Session = Depends(get_db)
):
    """Obtener medicaciones de una historia clínica"""
    return antecedentes.obtener_medicaciones(db, historia_clinica_id)


@router.delete("/medicaciones/{medicacion_id}")
def eliminar_medicacion(
    medicacion_id: UUID,
    db: Session = Depends(get_db)
):
    """Eliminar una medicación"""
    antecedentes.eliminar_medicacion(db, medicacion_id)
    return {"message": "Medicación eliminada"}


# ============================================================================
# VACUNAS
# ============================================================================

@router.post("/vacunas", response_model=VacunasAdministradasResponse)
def crear_vacuna(
    data: VacunasAdministradasCreate,
    db: Session = Depends(get_db)
):
    """Crear una nueva vacuna administrada"""
    return antecedentes.crear_vacuna(db, data)


@router.get("/vacunas/historia/{historia_clinica_id}", response_model=List[VacunasAdministradasResponse])
def obtener_vacunas(
    historia_clinica_id: UUID,
    db: Session = Depends(get_db)
):
    """Obtener vacunas de una historia clínica"""
    return antecedentes.obtener_vacunas(db, historia_clinica_id)


@router.delete("/vacunas/{vacuna_id}")
def eliminar_vacuna(
    vacuna_id: UUID,
    db: Session = Depends(get_db)
):
    """Eliminar una vacuna"""
    antecedentes.eliminar_vacuna(db, vacuna_id)
    return {"message": "Vacuna eliminada"}


# ============================================================================
# REVISIÓN POR SISTEMAS
# ============================================================================

@router.post("/revision-sistemas", response_model=RevisionSistemasResponse)
def crear_revision_sistema(
    data: RevisionSistemasCreate,
    db: Session = Depends(get_db)
):
    """Crear una nueva revisión por sistemas"""
    return antecedentes.crear_revision_sistema(db, data)


@router.get("/revision-sistemas/historia/{historia_clinica_id}", response_model=List[RevisionSistemasResponse])
def obtener_revision_sistemas(
    historia_clinica_id: UUID,
    db: Session = Depends(get_db)
):
    """Obtener revisión por sistemas de una historia clínica"""
    return antecedentes.obtener_revision_sistemas(db, historia_clinica_id)


@router.delete("/revision-sistemas/{revision_id}")
def eliminar_revision_sistema(
    revision_id: UUID,
    db: Session = Depends(get_db)
):
    """Eliminar una revisión por sistemas"""
    antecedentes.eliminar_revision_sistema(db, revision_id)
    return {"message": "Revisión por sistemas eliminada"}


# ============================================================================
# SIGNOS VITALES
# ============================================================================

@router.post("/signos-vitales", response_model=SignosVitalesResponse)
def crear_signos_vitales(
    data: SignosVitalesCreate,
    db: Session = Depends(get_db)
):
    """Crear signos vitales"""
    return antecedentes.crear_signos_vitales(db, data)


@router.get("/signos-vitales/historia/{historia_clinica_id}", response_model=SignosVitalesResponse)
def obtener_signos_vitales(
    historia_clinica_id: UUID,
    db: Session = Depends(get_db)
):
    """Obtener signos vitales de una historia clínica"""
    sv = antecedentes.obtener_signos_vitales(db, historia_clinica_id)
    if not sv:
        raise HTTPException(status_code=404, detail="Signos vitales no encontrados")
    return sv


@router.put("/signos-vitales/historia/{historia_clinica_id}", response_model=SignosVitalesResponse)
def actualizar_signos_vitales(
    historia_clinica_id: UUID,
    data: SignosVitalesCreate,
    db: Session = Depends(get_db)
):
    """Actualizar signos vitales"""
    return antecedentes.actualizar_signos_vitales(db, historia_clinica_id, data)


# ============================================================================
# PRUEBAS COMPLEMENTARIAS
# ============================================================================

@router.post("/pruebas-complementarias", response_model=PruebasComplementariasResponse)
def crear_prueba_complementaria(
    data: PruebasComplementariasCreate,
    db: Session = Depends(get_db)
):
    """Crear una nueva prueba complementaria"""
    return antecedentes.crear_prueba_complementaria(db, data)


@router.get("/pruebas-complementarias/{prueba_id}", response_model=PruebasComplementariasResponse)
def obtener_prueba_por_id(
    prueba_id: UUID,
    db: Session = Depends(get_db)
):
    """Obtener una prueba complementaria por ID"""
    prueba = antecedentes.obtener_prueba_por_id(db, prueba_id)
    if not prueba:
        raise HTTPException(status_code=404, detail="Prueba complementaria no encontrada")
    return prueba


@router.get("/pruebas-complementarias/historia/{historia_clinica_id}", response_model=List[PruebasComplementariasResponse])
def obtener_pruebas_complementarias(
    historia_clinica_id: UUID,
    db: Session = Depends(get_db)
):
    """Obtener pruebas complementarias de una historia clínica"""
    return antecedentes.obtener_pruebas_complementarias(db, historia_clinica_id)


@router.put("/pruebas-complementarias/{prueba_id}", response_model=PruebasComplementariasResponse)
def actualizar_prueba_complementaria(
    prueba_id: UUID,
    data: PruebasComplementariasCreate,
    db: Session = Depends(get_db)
):
    """Actualizar una prueba complementaria"""
    prueba = antecedentes.actualizar_prueba_complementaria(db, prueba_id, data)
    if not prueba:
        raise HTTPException(status_code=404, detail="Prueba complementaria no encontrada")
    return prueba


@router.delete("/pruebas-complementarias/{prueba_id}")
def eliminar_prueba_complementaria(
    prueba_id: UUID,
    db: Session = Depends(get_db)
):
    """Eliminar una prueba complementaria"""
    antecedentes.eliminar_prueba_complementaria(db, prueba_id)
    return {"message": "Prueba complementaria eliminada"}


# ============================================================================
# DIAGNÓSTICOS
# ============================================================================

@router.post("/diagnosticos", response_model=DiagnosticosResponse)
def crear_diagnostico(
    data: DiagnosticosCreate,
    db: Session = Depends(get_db)
):
    """Crear un nuevo diagnóstico"""
    return antecedentes.crear_diagnostico(db, data)


@router.get("/diagnosticos/historia/{historia_clinica_id}", response_model=List[DiagnosticosResponse])
def obtener_diagnosticos(
    historia_clinica_id: UUID,
    db: Session = Depends(get_db)
):
    """Obtener diagnósticos de una historia clínica"""
    return antecedentes.obtener_diagnosticos(db, historia_clinica_id)


@router.delete("/diagnosticos/{diagnostico_id}")
def eliminar_diagnostico(
    diagnostico_id: UUID,
    db: Session = Depends(get_db)
):
    """Eliminar un diagnóstico"""
    antecedentes.eliminar_diagnostico(db, diagnostico_id)
    return {"message": "Diagnóstico eliminado"}


# ============================================================================
# PLAN DE TRATAMIENTO
# ============================================================================

@router.post("/plan-tratamiento", response_model=PlanTratamientoResponse)
def crear_plan_tratamiento(
    data: PlanTratamientoCreate,
    db: Session = Depends(get_db)
):
    """Crear un plan de tratamiento"""
    return antecedentes.crear_plan_tratamiento(db, data)


@router.get("/plan-tratamiento/historia/{historia_clinica_id}", response_model=PlanTratamientoResponse)
def obtener_plan_tratamiento(
    historia_clinica_id: UUID,
    db: Session = Depends(get_db)
):
    """Obtener plan de tratamiento de una historia clínica"""
    plan = antecedentes.obtener_plan_tratamiento(db, historia_clinica_id)
    if not plan:
        raise HTTPException(status_code=404, detail="Plan de tratamiento no encontrado")
    return plan


@router.put("/plan-tratamiento/historia/{historia_clinica_id}", response_model=PlanTratamientoResponse)
def actualizar_plan_tratamiento(
    historia_clinica_id: UUID,
    data: PlanTratamientoCreate,
    db: Session = Depends(get_db)
):
    """Actualizar plan de tratamiento"""
    return antecedentes.actualizar_plan_tratamiento(db, historia_clinica_id, data)


# ============================================================================
# REMISIONES A ESPECIALISTAS
# ============================================================================

@router.post("/remisiones", response_model=RemisionesEspecialistasResponse)
def crear_remision(
    data: RemisionesEspecialistasCreate,
    db: Session = Depends(get_db)
):
    """Crear una nueva remisión a especialista"""
    return antecedentes.crear_remision(db, data)


@router.get("/remisiones/historia/{historia_clinica_id}", response_model=List[RemisionesEspecialistasResponse])
def obtener_remisiones(
    historia_clinica_id: UUID,
    db: Session = Depends(get_db)
):
    """Obtener remisiones de una historia clínica"""
    return antecedentes.obtener_remisiones(db, historia_clinica_id)


@router.get("/remisiones/urgentes", response_model=List[RemisionesEspecialistasResponse])
def obtener_remisiones_urgentes(
    historia_clinica_id: UUID = None,
    db: Session = Depends(get_db)
):
    """Obtener remisiones urgentes"""
    return antecedentes.obtener_remisiones_urgentes(db, historia_clinica_id)


@router.delete("/remisiones/{remision_id}")
def eliminar_remision(
    remision_id: UUID,
    db: Session = Depends(get_db)
):
    """Eliminar una remisión"""
    antecedentes.eliminar_remision(db, remision_id)
    return {"message": "Remisión eliminada"}
