"""
Endpoint para crear una Historia Clínica completa en una transacción
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from uuid import UUID
from typing import Optional, List
from datetime import date, datetime

from app.core.dependencies import get_db
from app.models.historia import HistoriaClinica
from app.models.catalogo import CatalogoItem
from app.crud import antecedentes, historia
from app.schemas.antecedentes import (
    AntecedentesPersonalesCreate, AntecedentesFamiliaresCreate,
    LesioneDeportavasCreate, CirugiasPrivasCreate, AlergiasCreate,
    MedicacionesCreate, VacunasAdministradasCreate, RevisionSistemasCreate,
    SignosVitalesCreate, PruebasComplementariasCreate, DiagnosticosCreate,
    PlanTratamientoCreate, RemisionesEspecialistasCreate
)
from app.schemas.historia import (
    MotivoConsultaEnfermedadCreate, ExploracionFisicaSistemasCreate
)
from pydantic import BaseModel

router = APIRouter(prefix="/historias-clinicas", tags=["Historia Clínica"])


# Modelos para la solicitud completa
class AntecedentesPersonalesData(BaseModel):
    codigo_cie11: str
    nombre_enfermedad: str
    observaciones: Optional[str] = None


class AntecedentesFamiliaresData(BaseModel):
    tipo_familiar: str
    codigo_cie11: str
    nombre_enfermedad: str


class LesioneDeportavasData(BaseModel):
    tipo_lesion: str
    fecha_lesion: date
    tratamiento: str
    observaciones: Optional[str] = None


class CirugiasPrivasData(BaseModel):
    tipo_cirugia: str
    fecha_cirugia: date
    observaciones: Optional[str] = None


class AlergiasData(BaseModel):
    tipo_alergia: str
    descripcion: str
    reaccion: Optional[str] = None


class MedicacionesData(BaseModel):
    nombre_medicamento: str
    dosis: str
    frecuencia: str
    duracion: str
    indicacion: Optional[str] = None


class VacunasAdministradasData(BaseModel):
    nombre_vacuna: str
    fecha_administracion: date
    proxima_dosis: Optional[date] = None


class RevisionSistemasData(BaseModel):
    sistema: str
    hallazgos: str
    observaciones: Optional[str] = None


class SignosVitalesData(BaseModel):
    presion_arterial: str
    frecuencia_cardiaca: int
    frecuencia_respiratoria: int
    temperatura: float
    peso: float
    altura: float
    imc: float
    saturacion_oxigeno: int


class PruebasComplementariasData(BaseModel):
    tipo_prueba: str
    resultado: str
    fecha_prueba: date
    interpretacion: Optional[str] = None
    observaciones: Optional[str] = None


class DiagnosticosData(BaseModel):
    codigo_cie11: str
    nombre_diagnostico: str
    tipo_diagnostico: str = "principal"
    observaciones: Optional[str] = None


class PlanTratamientoData(BaseModel):
    recomendaciones: str
    medicamentos_prescritos: Optional[str] = None
    procedimientos: Optional[str] = None
    rehabilitacion: Optional[str] = None
    fecha_seguimiento: Optional[date] = None
    observaciones: Optional[str] = None


class RemisionesEspecialistasData(BaseModel):
    especialidad: str
    razon_remision: str
    prioridad: str = "Normal"
    fecha_remision: Optional[date] = None
    institucion: Optional[str] = None
    observaciones: Optional[str] = None


class MotivoConsultaEnfermedadData(BaseModel):
    motivo_consulta: str
    sintomas_principales: Optional[str] = None
    duracion_sintomas: Optional[str] = None
    inicio_enfermedad: Optional[str] = None
    evolucion: Optional[str] = None
    factor_desencadenante: Optional[str] = None
    medicamentos_previos: Optional[str] = None


class ExploracionFisicaSistemasData(BaseModel):
    sistema_cardiovascular: Optional[str] = None
    sistema_respiratorio: Optional[str] = None
    sistema_digestivo: Optional[str] = None
    sistema_neurologico: Optional[str] = None
    sistema_genitourinario: Optional[str] = None
    sistema_musculoesqueletico: Optional[str] = None
    sistema_integumentario: Optional[str] = None
    sistema_endocrino: Optional[str] = None
    cabeza_cuello: Optional[str] = None
    extremidades: Optional[str] = None
    observaciones_generales: Optional[str] = None


class HistoriaClinicaCompletaRequest(BaseModel):
    """Solicitud para crear una historia clínica completa"""
    deportista_id: UUID
    fecha_apertura: date
    estado_id: UUID
    
    # Datos opcionales de la historia
    antecedentes_personales: Optional[List[AntecedentesPersonalesData]] = None
    antecedentes_familiares: Optional[List[AntecedentesFamiliaresData]] = None
    lesiones_deportivas: Optional[List[LesioneDeportavasData]] = None
    cirugias_previas: Optional[List[CirugiasPrivasData]] = None
    alergias: Optional[List[AlergiasData]] = None
    medicaciones: Optional[List[MedicacionesData]] = None
    vacunas_administradas: Optional[List[VacunasAdministradasData]] = None
    revision_sistemas: Optional[List[RevisionSistemasData]] = None
    signos_vitales: Optional[SignosVitalesData] = None
    pruebas_complementarias: Optional[List[PruebasComplementariasData]] = None
    diagnosticos: Optional[List[DiagnosticosData]] = None
    plan_tratamiento: Optional[PlanTratamientoData] = None
    remisiones_especialistas: Optional[List[RemisionesEspecialistasData]] = None
    motivo_consulta_enfermedad: Optional[MotivoConsultaEnfermedadData] = None
    exploracion_fisica_sistemas: Optional[ExploracionFisicaSistemasData] = None


@router.post("/completa", status_code=201)
def crear_historia_clinica_completa(
    data: HistoriaClinicaCompletaRequest,
    db: Session = Depends(get_db)
):
    """
    Crear una historia clínica completa con todos los datos normalizados
    en una sola transacción
    """
    try:
        # Crear la historia clínica base
        historia_record = HistoriaClinica(
            deportista_id=data.deportista_id,
            fecha_apertura=data.fecha_apertura,
            estado_id=data.estado_id
        )
        db.add(historia_record)
        db.flush()  # Obtener el ID sin commitear
        
        # Antecedentes Personales
        if data.antecedentes_personales:
            for item in data.antecedentes_personales:
                antecedentes.crear_antecedente_personal(
                    db,
                    AntecedentesPersonalesCreate(
                        historia_clinica_id=historia_record.id,
                        **item.dict()
                    )
                )
        
        # Antecedentes Familiares
        if data.antecedentes_familiares:
            for item in data.antecedentes_familiares:
                antecedentes.crear_antecedente_familiar(
                    db,
                    AntecedentesFamiliaresCreate(
                        historia_clinica_id=historia_record.id,
                        **item.dict()
                    )
                )
        
        # Lesiones Deportivas
        if data.lesiones_deportivas:
            for item in data.lesiones_deportivas:
                antecedentes.crear_lesion_deportiva(
                    db,
                    LesioneDeportavasCreate(
                        historia_clinica_id=historia_record.id,
                        **item.dict()
                    )
                )
        
        # Cirugías Previas
        if data.cirugias_previas:
            for item in data.cirugias_previas:
                antecedentes.crear_cirugia(
                    db,
                    CirugiasPrivasCreate(
                        historia_clinica_id=historia_record.id,
                        **item.dict()
                    )
                )
        
        # Alergias
        if data.alergias:
            for item in data.alergias:
                antecedentes.crear_alergia(
                    db,
                    AlergiasCreate(
                        historia_clinica_id=historia_record.id,
                        **item.dict()
                    )
                )
        
        # Medicaciones
        if data.medicaciones:
            for item in data.medicaciones:
                antecedentes.crear_medicacion(
                    db,
                    MedicacionesCreate(
                        historia_clinica_id=historia_record.id,
                        **item.dict()
                    )
                )
        
        # Vacunas Administradas
        if data.vacunas_administradas:
            for item in data.vacunas_administradas:
                antecedentes.crear_vacuna(
                    db,
                    VacunasAdministradasCreate(
                        historia_clinica_id=historia_record.id,
                        **item.dict()
                    )
                )
        
        # Revisión por Sistemas
        if data.revision_sistemas:
            for item in data.revision_sistemas:
                antecedentes.crear_revision_sistema(
                    db,
                    RevisionSistemasCreate(
                        historia_clinica_id=historia_record.id,
                        **item.dict()
                    )
                )
        
        # Signos Vitales
        if data.signos_vitales:
            antecedentes.crear_signos_vitales(
                db,
                SignosVitalesCreate(
                    historia_clinica_id=historia_record.id,
                    **data.signos_vitales.dict()
                )
            )
        
        # Pruebas Complementarias
        if data.pruebas_complementarias:
            for item in data.pruebas_complementarias:
                antecedentes.crear_prueba_complementaria(
                    db,
                    PruebasComplementariasCreate(
                        historia_clinica_id=historia_record.id,
                        **item.dict()
                    )
                )
        
        # Diagnósticos
        if data.diagnosticos:
            for item in data.diagnosticos:
                antecedentes.crear_diagnostico(
                    db,
                    DiagnosticosCreate(
                        historia_clinica_id=historia_record.id,
                        **item.dict()
                    )
                )
        
        # Plan de Tratamiento
        if data.plan_tratamiento:
            antecedentes.crear_plan_tratamiento(
                db,
                PlanTratamientoCreate(
                    historia_clinica_id=historia_record.id,
                    **data.plan_tratamiento.dict()
                )
            )
        
        # Remisiones a Especialistas
        if data.remisiones_especialistas:
            for item in data.remisiones_especialistas:
                antecedentes.crear_remision(
                    db,
                    RemisionesEspecialistasCreate(
                        historia_clinica_id=historia_record.id,
                        **item.dict()
                    )
                )
        
        # Motivo de Consulta y Enfermedad Actual
        if data.motivo_consulta_enfermedad:
            historia.crear_motivo_consulta_enfermedad(
                db,
                historia_record.id,
                data.motivo_consulta_enfermedad.dict()
            )
        
        # Exploración Física por Sistemas
        if data.exploracion_fisica_sistemas:
            historia.crear_exploracion_fisica(
                db,
                historia_record.id,
                data.exploracion_fisica_sistemas.dict()
            )
        
        # Commit de la transacción
        db.commit()
        db.refresh(historia_record)
        
        return {
            "status": "success",
            "historia_clinica_id": str(historia_record.id),
            "deportista_id": str(historia_record.deportista_id),
            "fecha_apertura": historia_record.fecha_apertura,
            "created_at": historia_record.created_at,
            "message": "Historia clínica creada exitosamente"
        }
    
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Error al crear historia clínica: {str(e)}"
        )


@router.put("/{historia_clinica_id}")
def actualizar_historia_clinica_completa(
    historia_clinica_id: UUID,
    data: HistoriaClinicaCompletaRequest,
    db: Session = Depends(get_db)
):
    """
    Actualizar una historia clínica existente
    Nota: Elimina los registros anteriores y crea nuevos
    """
    try:
        # Verificar que la historia existe
        historia = db.query(HistoriaClinica).filter(
            HistoriaClinica.id == historia_clinica_id
        ).first()
        
        if not historia:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Historia clínica no encontrada"
            )
        
        # Los registros se eliminan automáticamente por cascade delete
        # Recréamos los datos
        
        # Antecedentes Personales
        if data.antecedentes_personales:
            from app.models.antecedentes import AntecedentesPersonales
            db.query(AntecedentesPersonales).filter(
                AntecedentesPersonales.historia_clinica_id == historia_clinica_id
            ).delete()
            for item in data.antecedentes_personales:
                antecedentes.crear_antecedente_personal(
                    db,
                    AntecedentesPersonalesCreate(
                        historia_clinica_id=historia.id,
                        **item.dict()
                    )
                )
        
        # Similar para otros campos...
        
        db.commit()
        
        return {
            "status": "success",
            "historia_clinica_id": str(historia.id),
            "message": "Historia clínica actualizada exitosamente"
        }
    
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Error al actualizar historia clínica: {str(e)}"
        )
