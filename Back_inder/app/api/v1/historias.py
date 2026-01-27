from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from uuid import UUID
from typing import Optional, List
from datetime import date

from app.core.dependencies import get_db
from app.models.historia import HistoriaClinica
from app.crud import antecedentes, historia
from app.crud.historia import listar_todas_historias, eliminar_historia, obtener_motivo_consulta, obtener_exploracion_fisica
from app.schemas.antecedentes import (
    AntecedentesPersonalesCreate, AntecedentesFamiliaresCreate,
    LesioneDeportavasCreate, CirugiasPrivasCreate, AlergiasCreate,
    MedicacionesCreate, VacunasAdministradasCreate, RevisionSistemasCreate,
    SignosVitalesCreate, PruebasComplementariasCreate, DiagnosticosCreate,
    PlanTratamientoCreate, RemisionesEspecialistasCreate
)
from pydantic import BaseModel

router = APIRouter(tags=["Historia Clinica"])


# =====================================================
# SCHEMAS - Reciben datos del frontend
# =====================================================
class AntecedentesPersonalesData(BaseModel):
    codigo_cie11: Optional[str] = None
    nombre_enfermedad: str
    observaciones: Optional[str] = None

class AntecedentesFamiliaresData(BaseModel):
    tipo_familiar: Optional[str] = None
    codigo_cie11: Optional[str] = None
    nombre_enfermedad: str

class LesioneDeportavasData(BaseModel):
    tipo_lesion: Optional[str] = None
    fecha_lesion: Optional[date] = None
    tratamiento: Optional[str] = None
    observaciones: Optional[str] = None

class CirugiasPrivasData(BaseModel):
    tipo_cirugia: str
    fecha_cirugia: Optional[date] = None
    observaciones: Optional[str] = None

class AlergiasData(BaseModel):
    tipo_alergia: str
    descripcion: Optional[str] = None
    reaccion: Optional[str] = None

class MedicacionesData(BaseModel):
    nombre_medicamento: Optional[str] = None
    dosis: Optional[str] = None
    frecuencia: Optional[str] = None
    duracion: Optional[str] = None
    indicacion: Optional[str] = None

class VacunasAdministradasData(BaseModel):
    nombre_vacuna: str
    fecha_administracion: Optional[date] = None
    proxima_dosis: Optional[date] = None

class RevisionSistemasData(BaseModel):
    sistema: Optional[str] = None
    hallazgos: Optional[str] = None
    observaciones: Optional[str] = None

class SignosVitalesData(BaseModel):
    presion_arterial: Optional[str] = None
    frecuencia_cardiaca: Optional[int] = None
    frecuencia_respiratoria: Optional[int] = None
    temperatura: Optional[float] = None
    peso: Optional[float] = None
    altura: Optional[float] = None
    imc: Optional[float] = None
    saturacion_oxigeno: Optional[int] = None

class PruebasComplementariasData(BaseModel):
    tipo_prueba: Optional[str] = None
    resultado: Optional[str] = None
    fecha_prueba: Optional[date] = None
    interpretacion: Optional[str] = None
    observaciones: Optional[str] = None

class DiagnosticosData(BaseModel):
    codigo_cie11: Optional[str] = None
    nombre_diagnostico: Optional[str] = None
    tipo_diagnostico: Optional[str] = "principal"
    observaciones: Optional[str] = None

class PlanTratamientoData(BaseModel):
    recomendaciones: Optional[str] = None
    medicamentos_prescritos: Optional[str] = None
    procedimientos: Optional[str] = None
    rehabilitacion: Optional[str] = None
    fecha_seguimiento: Optional[date] = None
    observaciones: Optional[str] = None

class RemisionesEspecialistasData(BaseModel):
    especialidad: Optional[str] = None
    motivo: str
    prioridad: str = "Normal"
    fecha_remision: Optional[date] = None
    institucion: Optional[str] = None
    observaciones: Optional[str] = None

class MotivoConsultaEnfermedadData(BaseModel):
    motivo_consulta: Optional[str] = None
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
    deportista_id: UUID
    fecha_apertura: date
    estado_id: UUID
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


def validar_uuid(valor: str) -> UUID:
    """Valida y convierte string a UUID"""
    try:
        return UUID(valor)
    except (ValueError, AttributeError):
        raise HTTPException(status_code=404, detail="ID no valido")


# =====================================================
# RUTAS
# =====================================================

@router.get("/")
def listar_historias(db: Session = Depends(get_db)):
    historias_list = listar_todas_historias(db)
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
                "email": getattr(h.deportista, 'email', None),
                "telefono": getattr(h.deportista, 'telefono', None) or getattr(h.deportista, 'celular', None),
                "fecha_nacimiento": getattr(h.deportista, 'fecha_nacimiento', None),
            } if h.deportista else None
        }
        for h in historias_list
    ]


@router.post("/completa", status_code=201)
def crear_historia_clinica_completa(
    data: HistoriaClinicaCompletaRequest,
    db: Session = Depends(get_db)
):
    try:
        # Crear historia clinica base
        historia_record = HistoriaClinica(
            deportista_id=data.deportista_id,
            fecha_apertura=data.fecha_apertura,
            estado_id=data.estado_id
        )
        db.add(historia_record)
        db.flush()
        
        # =====================================================
        # ANTECEDENTES PERSONALES
        # =====================================================
        if data.antecedentes_personales:
            for item in data.antecedentes_personales:
                schema_data = AntecedentesPersonalesCreate(
                    historia_clinica_id=historia_record.id,
                    codigo_cie11=item.codigo_cie11,
                    nombre_enfermedad=item.nombre_enfermedad,
                    observaciones=item.observaciones
                )
                antecedentes.crear_antecedente_personal(db, schema_data)
        
        # =====================================================
        # ANTECEDENTES FAMILIARES
        # =====================================================
        if data.antecedentes_familiares:
            for item in data.antecedentes_familiares:
                schema_data = AntecedentesFamiliaresCreate(
                    historia_clinica_id=historia_record.id,
                    tipo_familiar=item.tipo_familiar,
                    codigo_cie11=item.codigo_cie11,
                    nombre_enfermedad=item.nombre_enfermedad,
                    observaciones=None
                )
                antecedentes.crear_antecedente_familiar(db, schema_data)
        
        # =====================================================
        # LESIONES DEPORTIVAS
        # =====================================================
        if data.lesiones_deportivas:
            for item in data.lesiones_deportivas:
                descripcion = item.tipo_lesion or ""
                if item.tratamiento:
                    descripcion += f" - Tratamiento: {item.tratamiento}"
                schema_data = LesioneDeportavasCreate(
                    historia_clinica_id=historia_record.id,
                    descripcion=descripcion,
                    fecha_ultima_lesion=item.fecha_lesion,
                    observaciones=item.observaciones
                )
                antecedentes.crear_lesion_deportiva(db, schema_data)
        
        # =====================================================
        # CIRUGIAS PREVIAS
        # =====================================================
        if data.cirugias_previas:
            for item in data.cirugias_previas:
                schema_data = CirugiasPrivasCreate(
                    historia_clinica_id=historia_record.id,
                    tipo_cirugia=item.tipo_cirugia,
                    fecha_cirugia=item.fecha_cirugia,
                    observaciones=item.observaciones
                )
                antecedentes.crear_cirugia(db, schema_data)
        
        # =====================================================
        # ALERGIAS
        # =====================================================
        if data.alergias:
            for item in data.alergias:
                observaciones = ""
                if item.descripcion:
                    observaciones += item.descripcion
                if item.reaccion:
                    observaciones += f" - Reaccion: {item.reaccion}"
                schema_data = AlergiasCreate(
                    historia_clinica_id=historia_record.id,
                    tipo_alergia=item.tipo_alergia,
                    observaciones=observaciones if observaciones else None
                )
                antecedentes.crear_alergia(db, schema_data)
        
        # =====================================================
        # MEDICACIONES
        # =====================================================
        if data.medicaciones:
            for item in data.medicaciones:
                observaciones = ""
                if item.duracion:
                    observaciones += f"Duracion: {item.duracion}"
                if item.indicacion:
                    observaciones += f" - Indicacion: {item.indicacion}"
                schema_data = MedicacionesCreate(
                    historia_clinica_id=historia_record.id,
                    nombre_medicacion=item.nombre_medicamento or "",
                    dosis=item.dosis,
                    frecuencia=item.frecuencia,
                    observaciones=observaciones if observaciones else None
                )
                antecedentes.crear_medicacion(db, schema_data)
        
        # =====================================================
        # VACUNAS ADMINISTRADAS
        # =====================================================
        if data.vacunas_administradas:
            for item in data.vacunas_administradas:
                observaciones = None
                if item.proxima_dosis:
                    observaciones = f"Proxima dosis: {item.proxima_dosis}"
                schema_data = VacunasAdministradasCreate(
                    historia_clinica_id=historia_record.id,
                    nombre_vacuna=item.nombre_vacuna,
                    fecha_administracion=item.fecha_administracion,
                    observaciones=observaciones
                )
                antecedentes.crear_vacuna(db, schema_data)
        
        # =====================================================
        # REVISION SISTEMAS
        # =====================================================
        if data.revision_sistemas:
            for item in data.revision_sistemas:
                schema_data = RevisionSistemasCreate(
                    historia_clinica_id=historia_record.id,
                    sistema_nombre=item.sistema or "",
                    estado=item.hallazgos or "normal",
                    observaciones=item.observaciones,
                    tipo_revision="revision"
                )
                antecedentes.crear_revision_sistema(db, schema_data)
        
        # =====================================================
        # SIGNOS VITALES
        # =====================================================
        if data.signos_vitales:
            pa_sistolica = None
            pa_diastolica = None
            if data.signos_vitales.presion_arterial:
                try:
                    partes = data.signos_vitales.presion_arterial.split("/")
                    if len(partes) == 2:
                        pa_sistolica = int(partes[0])
                        pa_diastolica = int(partes[1])
                except:
                    pass
            
            schema_data = SignosVitalesCreate(
                historia_clinica_id=historia_record.id,
                estatura_cm=data.signos_vitales.altura,
                peso_kg=data.signos_vitales.peso,
                frecuencia_cardiaca_lpm=data.signos_vitales.frecuencia_cardiaca,
                presion_arterial_sistolica=pa_sistolica,
                presion_arterial_diastolica=pa_diastolica,
                frecuencia_respiratoria_rpm=data.signos_vitales.frecuencia_respiratoria,
                temperatura_celsius=data.signos_vitales.temperatura,
                saturacion_oxigeno_percent=float(data.signos_vitales.saturacion_oxigeno) if data.signos_vitales.saturacion_oxigeno else None,
                imc=data.signos_vitales.imc
            )
            antecedentes.crear_signos_vitales(db, schema_data)
        
        # =====================================================
        # PRUEBAS COMPLEMENTARIAS
        # =====================================================
        if data.pruebas_complementarias:
            for item in data.pruebas_complementarias:
                resultado = item.resultado or ""
                if item.interpretacion:
                    resultado += f" - Interpretacion: {item.interpretacion}"
                if item.observaciones:
                    resultado += f" - {item.observaciones}"
                schema_data = PruebasComplementariasCreate(
                    historia_clinica_id=historia_record.id,
                    categoria=item.tipo_prueba or "General",
                    nombre_prueba=item.tipo_prueba or "Prueba",
                    codigo_cups=None,
                    resultado=resultado if resultado else None
                )
                antecedentes.crear_prueba_complementaria(db, schema_data)
        
        # =====================================================
        # DIAGNOSTICOS
        # =====================================================
        if data.diagnosticos:
            for item in data.diagnosticos:
                observaciones = item.observaciones or ""
                if item.tipo_diagnostico:
                    observaciones = f"[{item.tipo_diagnostico}] {observaciones}"
                schema_data = DiagnosticosCreate(
                    historia_clinica_id=historia_record.id,
                    codigo_cie11=item.codigo_cie11,
                    nombre_enfermedad=item.nombre_diagnostico or "",
                    observaciones=observaciones.strip() if observaciones.strip() else None,
                    analisis_objetivo=None,
                    impresion_diagnostica=None
                )
                antecedentes.crear_diagnostico(db, schema_data)
        
        # =====================================================
        # PLAN TRATAMIENTO
        # =====================================================
        if data.plan_tratamiento:
            indicaciones = ""
            if data.plan_tratamiento.recomendaciones:
                indicaciones += data.plan_tratamiento.recomendaciones
            if data.plan_tratamiento.medicamentos_prescritos:
                indicaciones += f"\nMedicamentos: {data.plan_tratamiento.medicamentos_prescritos}"
            if data.plan_tratamiento.procedimientos:
                indicaciones += f"\nProcedimientos: {data.plan_tratamiento.procedimientos}"
            if data.plan_tratamiento.observaciones:
                indicaciones += f"\nObservaciones: {data.plan_tratamiento.observaciones}"
            
            plan_seguimiento = ""
            if data.plan_tratamiento.fecha_seguimiento:
                plan_seguimiento = f"Fecha seguimiento: {data.plan_tratamiento.fecha_seguimiento}"
            
            schema_data = PlanTratamientoCreate(
                historia_clinica_id=historia_record.id,
                indicaciones_medicas=indicaciones.strip() if indicaciones.strip() else None,
                recomendaciones_entrenamiento=data.plan_tratamiento.rehabilitacion,
                plan_seguimiento=plan_seguimiento if plan_seguimiento else None
            )
            antecedentes.crear_plan_tratamiento(db, schema_data)
        
        # =====================================================
        # REMISIONES ESPECIALISTAS
        # =====================================================
        if data.remisiones_especialistas:
            for item in data.remisiones_especialistas:
                schema_data = RemisionesEspecialistasCreate(
                    historia_clinica_id=historia_record.id,
                    especialista=item.especialidad or "",
                    motivo=item.motivo,
                    prioridad=item.prioridad,
                    fecha_remision=item.fecha_remision
                )
                antecedentes.crear_remision(db, schema_data)
        
        # =====================================================
        # MOTIVO CONSULTA Y EXPLORACION FISICA
        # =====================================================
        if data.motivo_consulta_enfermedad:
            try:
                historia.crear_motivo_consulta_enfermedad(db, historia_record.id, data.motivo_consulta_enfermedad.dict())
            except Exception as e:
                print(f"Advertencia: No se pudo guardar motivo_consulta_enfermedad: {e}")
        
        if data.exploracion_fisica_sistemas:
            try:
                historia.crear_exploracion_fisica(db, historia_record.id, data.exploracion_fisica_sistemas.dict())
            except Exception as e:
                print(f"Advertencia: No se pudo guardar exploracion_fisica_sistemas: {e}")
        
        db.commit()
        db.refresh(historia_record)
        
        return {
            "status": "success",
            "historia_clinica_id": str(historia_record.id),
            "deportista_id": str(historia_record.deportista_id),
            "fecha_apertura": historia_record.fecha_apertura,
            "created_at": historia_record.created_at,
            "message": "Historia clinica creada exitosamente"
        }
    
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"Error al crear historia clinica: {str(e)}")


@router.get("/{historia_clinica_id}")
def obtener_historia(historia_clinica_id: str, db: Session = Depends(get_db)):
    historia_uuid = validar_uuid(historia_clinica_id)
    
    h = db.query(HistoriaClinica).filter(HistoriaClinica.id == historia_uuid).first()
    
    if not h:
        raise HTTPException(status_code=404, detail="Historia clinica no encontrada")
    
    # Construir datos del deportista con campos de contacto
    deportista_data = None
    if h.deportista:
        deportista_data = {
            "id": str(h.deportista.id),
            "nombres": h.deportista.nombres,
            "apellidos": h.deportista.apellidos,
            "numero_documento": h.deportista.numero_documento,
            "email": getattr(h.deportista, 'email', None),
            "telefono": getattr(h.deportista, 'telefono', None) or getattr(h.deportista, 'celular', None),
            "fecha_nacimiento": getattr(h.deportista, 'fecha_nacimiento', None),
            "genero": getattr(h.deportista, 'genero', None) or getattr(h.deportista, 'sexo', None),
            "direccion": getattr(h.deportista, 'direccion', None),
            "deporte": getattr(h.deportista, 'deporte', None) or getattr(h.deportista, 'disciplina', None),
        }
    
    # =====================================================
    # OBTENER MOTIVO CONSULTA Y EXPLORACION FISICA
    # =====================================================
    motivo_consulta_data = None
    try:
        motivos = obtener_motivo_consulta(db, historia_uuid)
        if motivos and len(motivos) > 0:
            m = motivos[0]  # Tomar el primero
            motivo_consulta_data = {
                "id": str(m.id),
                "motivo_consulta": getattr(m, 'motivo_consulta', None),
                "sintomas_principales": getattr(m, 'sintomas_principales', None),
                "duracion_sintomas": getattr(m, 'duracion_sintomas', None),
                "inicio_enfermedad": getattr(m, 'inicio_enfermedad', None),
                "evolucion": getattr(m, 'evolucion', None),
                "factor_desencadenante": getattr(m, 'factor_desencadenante', None),
                "medicamentos_previos": getattr(m, 'medicamentos_previos', None),
            }
    except Exception as e:
        print(f"Advertencia: No se pudo obtener motivo_consulta: {e}")
    
    exploracion_fisica_data = None
    try:
        exploraciones = obtener_exploracion_fisica(db, historia_uuid)
        if exploraciones and len(exploraciones) > 0:
            e = exploraciones[0]  # Tomar el primero
            exploracion_fisica_data = {
                "id": str(e.id),
                "sistema_cardiovascular": getattr(e, 'sistema_cardiovascular', None),
                "sistema_respiratorio": getattr(e, 'sistema_respiratorio', None),
                "sistema_digestivo": getattr(e, 'sistema_digestivo', None),
                "sistema_neurologico": getattr(e, 'sistema_neurologico', None),
                "sistema_genitourinario": getattr(e, 'sistema_genitourinario', None),
                "sistema_musculoesqueletico": getattr(e, 'sistema_musculoesqueletico', None),
                "sistema_integumentario": getattr(e, 'sistema_integumentario', None),
                "sistema_endocrino": getattr(e, 'sistema_endocrino', None),
                "cabeza_cuello": getattr(e, 'cabeza_cuello', None),
                "extremidades": getattr(e, 'extremidades', None),
                "observaciones_generales": getattr(e, 'observaciones_generales', None),
            }
    except Exception as e:
        print(f"Advertencia: No se pudo obtener exploracion_fisica: {e}")
    
    return {
        "id": str(h.id),
        "deportista_id": str(h.deportista_id),
        "fecha_apertura": h.fecha_apertura,
        "estado_id": str(h.estado_id) if h.estado_id else None,
        "created_at": h.created_at,
        "deportista": deportista_data,
        "antecedentes_personales": [{"id": str(a.id), "codigo_cie11": a.codigo_cie11, "nombre_enfermedad": a.nombre_enfermedad, "observaciones": a.observaciones} for a in h.antecedentes_personales] if h.antecedentes_personales else [],
        "antecedentes_familiares": [{"id": str(a.id), "tipo_familiar": a.tipo_familiar, "codigo_cie11": a.codigo_cie11, "nombre_enfermedad": a.nombre_enfermedad} for a in h.antecedentes_familiares] if h.antecedentes_familiares else [],
        "lesiones_deportivas": [{"id": str(l.id), "descripcion": l.descripcion, "fecha_ultima_lesion": l.fecha_ultima_lesion, "observaciones": getattr(l, 'observaciones', None)} for l in h.lesiones_deportivas] if h.lesiones_deportivas else [],
        "cirugias_previas": [{"id": str(c.id), "tipo_cirugia": c.tipo_cirugia, "fecha_cirugia": c.fecha_cirugia, "observaciones": getattr(c, 'observaciones', None)} for c in h.cirugias_previas] if h.cirugias_previas else [],
        "alergias": [{"id": str(a.id), "tipo_alergia": a.tipo_alergia, "observaciones": a.observaciones} for a in h.alergias] if h.alergias else [],
        "medicaciones": [{"id": str(m.id), "nombre_medicacion": m.nombre_medicacion, "dosis": m.dosis, "frecuencia": getattr(m, 'frecuencia', None), "observaciones": getattr(m, 'observaciones', None)} for m in h.medicaciones] if h.medicaciones else [],
        "vacunas_administradas": [{"id": str(v.id), "nombre_vacuna": v.nombre_vacuna, "fecha_administracion": getattr(v, 'fecha_administracion', None), "observaciones": getattr(v, 'observaciones', None)} for v in h.vacunas_administradas] if hasattr(h, 'vacunas_administradas') and h.vacunas_administradas else [],
        "revision_sistemas": [{"id": str(r.id), "sistema_nombre": r.sistema_nombre, "estado": r.estado, "observaciones": getattr(r, 'observaciones', None)} for r in h.revision_sistemas] if hasattr(h, 'revision_sistemas') and h.revision_sistemas else [],
        "signos_vitales": [{"id": str(s.id), "estatura_cm": getattr(s, 'estatura_cm', None), "peso_kg": getattr(s, 'peso_kg', None), "imc": getattr(s, 'imc', None), "frecuencia_cardiaca_lpm": getattr(s, 'frecuencia_cardiaca_lpm', None), "presion_arterial_sistolica": getattr(s, 'presion_arterial_sistolica', None), "presion_arterial_diastolica": getattr(s, 'presion_arterial_diastolica', None), "frecuencia_respiratoria_rpm": getattr(s, 'frecuencia_respiratoria_rpm', None), "temperatura_celsius": getattr(s, 'temperatura_celsius', None), "saturacion_oxigeno_percent": getattr(s, 'saturacion_oxigeno_percent', None)} for s in h.signos_vitales] if hasattr(h, 'signos_vitales') and h.signos_vitales else [],
        "pruebas_complementarias": [{"id": str(p.id), "categoria": getattr(p, 'categoria', None), "nombre_prueba": getattr(p, 'nombre_prueba', None), "codigo_cups": getattr(p, 'codigo_cups', None), "resultado": getattr(p, 'resultado', None)} for p in h.pruebas_complementarias] if hasattr(h, 'pruebas_complementarias') and h.pruebas_complementarias else [],
        "diagnosticos": [{"id": str(d.id), "codigo_cie11": d.codigo_cie11, "nombre_enfermedad": d.nombre_enfermedad, "observaciones": getattr(d, 'observaciones', None), "analisis_objetivo": getattr(d, 'analisis_objetivo', None), "impresion_diagnostica": getattr(d, 'impresion_diagnostica', None)} for d in h.diagnosticos] if h.diagnosticos else [],
        "plan_tratamiento": [{"id": str(p.id), "indicaciones_medicas": getattr(p, 'indicaciones_medicas', None), "recomendaciones_entrenamiento": getattr(p, 'recomendaciones_entrenamiento', None), "plan_seguimiento": getattr(p, 'plan_seguimiento', None)} for p in h.plan_tratamiento] if hasattr(h, 'plan_tratamiento') and h.plan_tratamiento else [],
        "remisiones_especialistas": [{"id": str(r.id), "especialista": r.especialista, "motivo": r.motivo, "prioridad": r.prioridad, "fecha_remision": getattr(r, 'fecha_remision', None)} for r in h.remisiones_especialistas] if h.remisiones_especialistas else [],
        "motivo_consulta_enfermedad": motivo_consulta_data,
        "exploracion_fisica_sistemas": exploracion_fisica_data,
    }


@router.delete("/{historia_clinica_id}", status_code=204)
def eliminar_historia_clinica(historia_clinica_id: str, db: Session = Depends(get_db)):
    historia_uuid = validar_uuid(historia_clinica_id)
    
    success = eliminar_historia(db, str(historia_uuid))
    if not success:
        raise HTTPException(status_code=404, detail="Historia clinica no encontrada")


@router.get("/{historia_clinica_id}/completa")
def obtener_historia_completa(historia_clinica_id: str, db: Session = Depends(get_db)):
    historia_uuid = validar_uuid(historia_clinica_id)
    
    h = db.query(HistoriaClinica).filter(HistoriaClinica.id == historia_uuid).first()
    if not h:
        raise HTTPException(status_code=404, detail="Historia clinica no encontrada")
    
    # Obtener motivo consulta y exploracion fisica
    motivo_consulta_data = None
    try:
        motivos = obtener_motivo_consulta(db, historia_uuid)
        if motivos and len(motivos) > 0:
            m = motivos[0]
            motivo_consulta_data = {
                "id": str(m.id),
                "motivo_consulta": getattr(m, 'motivo_consulta', None),
                "sintomas_principales": getattr(m, 'sintomas_principales', None),
                "duracion_sintomas": getattr(m, 'duracion_sintomas', None),
                "inicio_enfermedad": getattr(m, 'inicio_enfermedad', None),
                "evolucion": getattr(m, 'evolucion', None),
                "factor_desencadenante": getattr(m, 'factor_desencadenante', None),
                "medicamentos_previos": getattr(m, 'medicamentos_previos', None),
            }
    except Exception as e:
        print(f"Advertencia: {e}")
    
    exploracion_fisica_data = None
    try:
        exploraciones = obtener_exploracion_fisica(db, historia_uuid)
        if exploraciones and len(exploraciones) > 0:
            e = exploraciones[0]
            exploracion_fisica_data = {
                "id": str(e.id),
                "sistema_cardiovascular": getattr(e, 'sistema_cardiovascular', None),
                "sistema_respiratorio": getattr(e, 'sistema_respiratorio', None),
                "sistema_digestivo": getattr(e, 'sistema_digestivo', None),
                "sistema_neurologico": getattr(e, 'sistema_neurologico', None),
                "sistema_genitourinario": getattr(e, 'sistema_genitourinario', None),
                "sistema_musculoesqueletico": getattr(e, 'sistema_musculoesqueletico', None),
                "sistema_integumentario": getattr(e, 'sistema_integumentario', None),
                "sistema_endocrino": getattr(e, 'sistema_endocrino', None),
                "cabeza_cuello": getattr(e, 'cabeza_cuello', None),
                "extremidades": getattr(e, 'extremidades', None),
                "observaciones_generales": getattr(e, 'observaciones_generales', None),
            }
    except Exception as e:
        print(f"Advertencia: {e}")
    
    return {
        "historia_clinica": {"id": str(h.id), "deportista_id": str(h.deportista_id), "fecha_apertura": h.fecha_apertura, "estado_id": str(h.estado_id) if h.estado_id else None},
        "antecedentes_personales": [{"id": str(a.id), "codigo_cie11": a.codigo_cie11, "nombre_enfermedad": a.nombre_enfermedad} for a in h.antecedentes_personales],
        "antecedentes_familiares": [{"id": str(a.id), "tipo_familiar": a.tipo_familiar, "codigo_cie11": a.codigo_cie11, "nombre_enfermedad": a.nombre_enfermedad} for a in h.antecedentes_familiares],
        "diagnosticos": [{"id": str(d.id), "codigo_cie11": d.codigo_cie11, "nombre_enfermedad": d.nombre_enfermedad} for d in h.diagnosticos],
        "remisiones_especialistas": [{"id": str(r.id), "especialista": r.especialista, "motivo": r.motivo, "prioridad": r.prioridad} for r in h.remisiones_especialistas],
        "motivo_consulta_enfermedad": motivo_consulta_data,
        "exploracion_fisica_sistemas": exploracion_fisica_data,
    }