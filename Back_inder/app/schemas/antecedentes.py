from pydantic import BaseModel, Field
from typing import Optional
from datetime import date, datetime
from uuid import UUID


# ============================================================================
# ANTECEDENTES PERSONALES
# ============================================================================

class AntecedentesPersonalesBase(BaseModel):
    codigo_cie11: Optional[str] = None
    nombre_enfermedad: str
    observaciones: Optional[str] = None


class AntecedentesPersonalesCreate(AntecedentesPersonalesBase):
    historia_clinica_id: UUID


class AntecedentesPersonalesResponse(AntecedentesPersonalesBase):
    id: UUID
    historia_clinica_id: UUID
    created_at: datetime

    class Config:
        from_attributes = True


# ============================================================================
# ANTECEDENTES FAMILIARES
# ============================================================================

class AntecedentesFamiliaresBase(BaseModel):
    codigo_cie11: Optional[str] = None
    nombre_enfermedad: str
    tipo_familiar: Optional[str] = None
    observaciones: Optional[str] = None


class AntecedentesFamiliaresCreate(AntecedentesFamiliaresBase):
    historia_clinica_id: UUID


class AntecedentesFamiliaresResponse(AntecedentesFamiliaresBase):
    id: UUID
    historia_clinica_id: UUID
    created_at: datetime

    class Config:
        from_attributes = True


# ============================================================================
# LESIONES DEPORTIVAS
# ============================================================================

class LesioneDeportavasBase(BaseModel):
    descripcion: str
    fecha_ultima_lesion: Optional[date] = None
    observaciones: Optional[str] = None


class LesioneDeportavasCreate(LesioneDeportavasBase):
    historia_clinica_id: UUID


class LesioneDeportavasResponse(LesioneDeportavasBase):
    id: UUID
    historia_clinica_id: UUID
    created_at: datetime

    class Config:
        from_attributes = True


# ============================================================================
# CIRUGÍAS PREVIAS
# ============================================================================

class CirugiasPrivasBase(BaseModel):
    tipo_cirugia: str
    fecha_cirugia: Optional[date] = None
    observaciones: Optional[str] = None


class CirugiasPrivasCreate(CirugiasPrivasBase):
    historia_clinica_id: UUID


class CirugiasPrivasResponse(CirugiasPrivasBase):
    id: UUID
    historia_clinica_id: UUID
    created_at: datetime

    class Config:
        from_attributes = True


# ============================================================================
# ALERGIAS
# ============================================================================

class AlergiasBase(BaseModel):
    tipo_alergia: str
    observaciones: Optional[str] = None


class AlergiasCreate(AlergiasBase):
    historia_clinica_id: UUID


class AlergiasResponse(AlergiasBase):
    id: UUID
    historia_clinica_id: UUID
    created_at: datetime

    class Config:
        from_attributes = True


# ============================================================================
# VACUNAS DEPORTISTA
# ============================================================================

class VacunaDeportistaBase(BaseModel):
    nombre_vacuna: str
    fecha_administracion: Optional[date] = None
    observaciones: Optional[str] = None
    nombre_archivo: Optional[str] = None
    tipo_archivo: Optional[str] = None


class VacunaDeportistaCreate(VacunaDeportistaBase):
    """Para crear una vacuna (sin archivo, se sube por separado)"""
    pass


class VacunaDeportistaUpload(BaseModel):
    """Schema para recibir información del archivo"""
    nombre_vacuna: str
    fecha_administracion: Optional[date] = None
    observaciones: Optional[str] = None


class VacunaDeportistaResponse(VacunaDeportistaBase):
    id: UUID
    deportista_id: UUID
    ruta_archivo: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class VacunaDeportistaListResponse(BaseModel):
    """Para listar todas las vacunas de un deportista"""
    id: UUID
    deportista_id: UUID
    nombre_vacuna: str
    fecha_administracion: Optional[date] = None
    observaciones: Optional[str] = None
    nombre_archivo: Optional[str] = None
    tipo_archivo: Optional[str] = None
    ruta_archivo: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True
# ============================================================================
# MEDICACIONES
# ============================================================================

class MedicacionesBase(BaseModel):
    nombre_medicacion: str
    dosis: Optional[str] = None
    frecuencia: Optional[str] = None
    observaciones: Optional[str] = None


class MedicacionesCreate(MedicacionesBase):
    historia_clinica_id: UUID


class MedicacionesResponse(MedicacionesBase):
    id: UUID
    historia_clinica_id: UUID
    created_at: datetime

    class Config:
        from_attributes = True


# ============================================================================
# VACUNAS ADMINISTRADAS
# ============================================================================

class VacunasAdministradasBase(BaseModel):
    nombre_vacuna: str
    fecha_administracion: Optional[date] = None
    observaciones: Optional[str] = None


class VacunasAdministradasCreate(VacunasAdministradasBase):
    historia_clinica_id: UUID


class VacunasAdministradasResponse(VacunasAdministradasBase):
    id: UUID
    historia_clinica_id: UUID
    created_at: datetime

    class Config:
        from_attributes = True


# ============================================================================
# REVISIÓN POR SISTEMAS
# ============================================================================

class RevisionSistemasBase(BaseModel):
    sistema_nombre: str
    estado: str  # normal, anormal
    observaciones: Optional[str] = None
    tipo_revision: str = "revision"


class RevisionSistemasCreate(RevisionSistemasBase):
    historia_clinica_id: UUID


class RevisionSistemasResponse(RevisionSistemasBase):
    id: UUID
    historia_clinica_id: UUID
    created_at: datetime

    class Config:
        from_attributes = True


# ============================================================================
# SIGNOS VITALES
# ============================================================================

class SignosVitalesBase(BaseModel):
    estatura_cm: Optional[float] = None
    peso_kg: Optional[float] = None
    frecuencia_cardiaca_lpm: Optional[int] = None
    presion_arterial_sistolica: Optional[int] = None
    presion_arterial_diastolica: Optional[int] = None
    frecuencia_respiratoria_rpm: Optional[int] = None
    temperatura_celsius: Optional[float] = None
    saturacion_oxigeno_percent: Optional[float] = None
    imc: Optional[float] = None


class SignosVitalesCreate(SignosVitalesBase):
    historia_clinica_id: UUID


class SignosVitalesResponse(SignosVitalesBase):
    id: UUID
    historia_clinica_id: UUID
    created_at: datetime

    class Config:
        from_attributes = True


# ============================================================================
# PRUEBAS COMPLEMENTARIAS
# ============================================================================

class PruebasComplementariasBase(BaseModel):
    categoria: str
    nombre_prueba: str
    codigo_cups: Optional[str] = None
    resultado: Optional[str] = None


class PruebasComplementariasCreate(PruebasComplementariasBase):
    historia_clinica_id: UUID


class PruebasComplementariasResponse(PruebasComplementariasBase):
    id: UUID
    historia_clinica_id: UUID
    created_at: datetime

    class Config:
        from_attributes = True


# ============================================================================
# DIAGNÓSTICOS
# ============================================================================

class DiagnosticosBase(BaseModel):
    codigo_cie11: Optional[str] = None
    nombre_enfermedad: str
    observaciones: Optional[str] = None
    analisis_objetivo: Optional[str] = None
    impresion_diagnostica: Optional[str] = None


class DiagnosticosCreate(DiagnosticosBase):
    historia_clinica_id: UUID


class DiagnosticosResponse(DiagnosticosBase):
    id: UUID
    historia_clinica_id: UUID
    created_at: datetime

    class Config:
        from_attributes = True


# ============================================================================
# PLAN DE TRATAMIENTO
# ============================================================================

class PlanTratamientoBase(BaseModel):
    indicaciones_medicas: Optional[str] = None
    recomendaciones_entrenamiento: Optional[str] = None
    plan_seguimiento: Optional[str] = None


class PlanTratamientoCreate(PlanTratamientoBase):
    historia_clinica_id: UUID


class PlanTratamientoResponse(PlanTratamientoBase):
    id: UUID
    historia_clinica_id: UUID
    created_at: datetime

    class Config:
        from_attributes = True


# ============================================================================
# REMISIONES A ESPECIALISTAS
# ============================================================================

class RemisionesEspecialistasBase(BaseModel):
    especialista: str
    motivo: str
    prioridad: str = "Normal"  # Normal, Urgente
    fecha_remision: Optional[date] = None


class RemisionesEspecialistasCreate(RemisionesEspecialistasBase):
    historia_clinica_id: UUID


class RemisionesEspecialistasResponse(RemisionesEspecialistasBase):
    id: UUID
    historia_clinica_id: UUID
    created_at: datetime

    class Config:
        from_attributes = True
