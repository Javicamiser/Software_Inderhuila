"""
Servicio para Historia Clínica con endpoints normalizados
Reemplazar el actual por este para usar la BD normalizada
"""

from typing import Optional, List
from uuid import UUID
import httpx

BASE_URL = "http://localhost:8000/api/v1"


class HistoriaClinicaService:
    """Servicio para gestionar historia clínica normalizada"""
    
    @staticmethod
    async def crear_antecedente_personal(
        historia_clinica_id: UUID,
        codigo_cie11: str,
        nombre_enfermedad: str,
        observaciones: Optional[str] = None
    ):
        """Crear antecedente personal"""
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{BASE_URL}/antecedentes/personales",
                json={
                    "historia_clinica_id": str(historia_clinica_id),
                    "codigo_cie11": codigo_cie11,
                    "nombre_enfermedad": nombre_enfermedad,
                    "observaciones": observaciones
                }
            )
            return response.json()
    
    @staticmethod
    async def crear_antecedente_familiar(
        historia_clinica_id: UUID,
        relacion: str,
        codigo_cie11: str,
        nombre_enfermedad: str
    ):
        """Crear antecedente familiar"""
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{BASE_URL}/antecedentes/familiares",
                json={
                    "historia_clinica_id": str(historia_clinica_id),
                    "relacion": relacion,
                    "codigo_cie11": codigo_cie11,
                    "nombre_enfermedad": nombre_enfermedad
                }
            )
            return response.json()
    
    @staticmethod
    async def crear_lesion_deportiva(
        historia_clinica_id: UUID,
        tipo_lesion: str,
        fecha_lesion: str,
        tratamiento: str,
        observaciones: Optional[str] = None
    ):
        """Crear lesión deportiva"""
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{BASE_URL}/antecedentes/lesiones-deportivas",
                json={
                    "historia_clinica_id": str(historia_clinica_id),
                    "tipo_lesion": tipo_lesion,
                    "fecha_lesion": fecha_lesion,
                    "tratamiento": tratamiento,
                    "observaciones": observaciones
                }
            )
            return response.json()
    
    @staticmethod
    async def crear_cirugia(
        historia_clinica_id: UUID,
        tipo_cirugia: str,
        fecha_cirugia: str,
        observaciones: Optional[str] = None
    ):
        """Crear cirugía previa"""
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{BASE_URL}/antecedentes/cirugias",
                json={
                    "historia_clinica_id": str(historia_clinica_id),
                    "tipo_cirugia": tipo_cirugia,
                    "fecha_cirugia": fecha_cirugia,
                    "observaciones": observaciones
                }
            )
            return response.json()
    
    @staticmethod
    async def crear_alergia(
        historia_clinica_id: UUID,
        tipo_alergia: str,
        descripcion: str,
        reaccion: Optional[str] = None
    ):
        """Crear alergia"""
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{BASE_URL}/antecedentes/alergias",
                json={
                    "historia_clinica_id": str(historia_clinica_id),
                    "tipo_alergia": tipo_alergia,
                    "descripcion": descripcion,
                    "reaccion": reaccion
                }
            )
            return response.json()
    
    @staticmethod
    async def crear_medicacion(
        historia_clinica_id: UUID,
        nombre_medicamento: str,
        dosis: str,
        frecuencia: str,
        duracion: str,
        indicacion: Optional[str] = None
    ):
        """Crear medicación"""
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{BASE_URL}/antecedentes/medicaciones",
                json={
                    "historia_clinica_id": str(historia_clinica_id),
                    "nombre_medicamento": nombre_medicamento,
                    "dosis": dosis,
                    "frecuencia": frecuencia,
                    "duracion": duracion,
                    "indicacion": indicacion
                }
            )
            return response.json()
    
    @staticmethod
    async def crear_vacuna(
        historia_clinica_id: UUID,
        nombre_vacuna: str,
        fecha_administracion: str,
        proxima_dosis: Optional[str] = None
    ):
        """Crear vacuna administrada"""
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{BASE_URL}/antecedentes/vacunas",
                json={
                    "historia_clinica_id": str(historia_clinica_id),
                    "nombre_vacuna": nombre_vacuna,
                    "fecha_administracion": fecha_administracion,
                    "proxima_dosis": proxima_dosis
                }
            )
            return response.json()
    
    @staticmethod
    async def crear_revision_sistema(
        historia_clinica_id: UUID,
        sistema: str,
        hallazgos: str,
        observaciones: Optional[str] = None
    ):
        """Crear revisión por sistemas"""
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{BASE_URL}/antecedentes/revision-sistemas",
                json={
                    "historia_clinica_id": str(historia_clinica_id),
                    "sistema": sistema,
                    "hallazgos": hallazgos,
                    "observaciones": observaciones
                }
            )
            return response.json()
    
    @staticmethod
    async def crear_signos_vitales(
        historia_clinica_id: UUID,
        presion_arterial: str,
        frecuencia_cardiaca: int,
        frecuencia_respiratoria: int,
        temperatura: float,
        peso: float,
        altura: float,
        imc: float,
        saturacion_oxigeno: int
    ):
        """Crear signos vitales"""
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{BASE_URL}/antecedentes/signos-vitales",
                json={
                    "historia_clinica_id": str(historia_clinica_id),
                    "presion_arterial": presion_arterial,
                    "frecuencia_cardiaca": frecuencia_cardiaca,
                    "frecuencia_respiratoria": frecuencia_respiratoria,
                    "temperatura": temperatura,
                    "peso": peso,
                    "altura": altura,
                    "imc": imc,
                    "saturacion_oxigeno": saturacion_oxigeno
                }
            )
            return response.json()
    
    @staticmethod
    async def crear_prueba_complementaria(
        historia_clinica_id: UUID,
        tipo_prueba: str,
        resultado: str,
        fecha_prueba: str,
        interpretacion: Optional[str] = None,
        observaciones: Optional[str] = None
    ):
        """Crear prueba complementaria"""
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{BASE_URL}/antecedentes/pruebas-complementarias",
                json={
                    "historia_clinica_id": str(historia_clinica_id),
                    "tipo_prueba": tipo_prueba,
                    "resultado": resultado,
                    "fecha_prueba": fecha_prueba,
                    "interpretacion": interpretacion,
                    "observaciones": observaciones
                }
            )
            return response.json()
    
    @staticmethod
    async def crear_diagnostico(
        historia_clinica_id: UUID,
        codigo_cie11: str,
        nombre_diagnostico: str,
        tipo_diagnostico: str = "principal",
        observaciones: Optional[str] = None
    ):
        """Crear diagnóstico"""
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{BASE_URL}/antecedentes/diagnosticos",
                json={
                    "historia_clinica_id": str(historia_clinica_id),
                    "codigo_cie11": codigo_cie11,
                    "nombre_diagnostico": nombre_diagnostico,
                    "tipo_diagnostico": tipo_diagnostico,
                    "observaciones": observaciones
                }
            )
            return response.json()
    
    @staticmethod
    async def crear_plan_tratamiento(
        historia_clinica_id: UUID,
        recomendaciones: str,
        medicamentos_prescritos: Optional[str] = None,
        procedimientos: Optional[str] = None,
        rehabilitacion: Optional[str] = None,
        fecha_seguimiento: Optional[str] = None,
        observaciones: Optional[str] = None
    ):
        """Crear plan de tratamiento"""
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{BASE_URL}/antecedentes/plan-tratamiento",
                json={
                    "historia_clinica_id": str(historia_clinica_id),
                    "recomendaciones": recomendaciones,
                    "medicamentos_prescritos": medicamentos_prescritos,
                    "procedimientos": procedimientos,
                    "rehabilitacion": rehabilitacion,
                    "fecha_seguimiento": fecha_seguimiento,
                    "observaciones": observaciones
                }
            )
            return response.json()
    
    @staticmethod
    async def crear_remision(
        historia_clinica_id: UUID,
        especialidad: str,
        razon_remision: str,
        prioridad: str = "Normal",
        fecha_remision: Optional[str] = None,
        institucion: Optional[str] = None,
        observaciones: Optional[str] = None
    ):
        """Crear remisión a especialista"""
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{BASE_URL}/antecedentes/remisiones",
                json={
                    "historia_clinica_id": str(historia_clinica_id),
                    "especialidad": especialidad,
                    "razon_remision": razon_remision,
                    "prioridad": prioridad,
                    "fecha_remision": fecha_remision,
                    "institucion": institucion,
                    "observaciones": observaciones
                }
            )
            return response.json()
    
    @staticmethod
    async def obtener_historia_completa(historia_clinica_id: UUID):
        """Obtener toda la historia clínica normalizada"""
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{BASE_URL}/historias-clinicas/{historia_clinica_id}/completa"
            )
            return response.json()
    
    @staticmethod
    async def obtener_antecedentes_personales(historia_clinica_id: UUID):
        """Obtener antecedentes personales"""
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{BASE_URL}/antecedentes/personales/historia/{historia_clinica_id}"
            )
            return response.json()
    
    @staticmethod
    async def obtener_alergias(historia_clinica_id: UUID):
        """Obtener alergias"""
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{BASE_URL}/antecedentes/alergias/historia/{historia_clinica_id}"
            )
            return response.json()
    
    @staticmethod
    async def obtener_medicaciones(historia_clinica_id: UUID):
        """Obtener medicaciones"""
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{BASE_URL}/antecedentes/medicaciones/historia/{historia_clinica_id}"
            )
            return response.json()
    
    @staticmethod
    async def obtener_diagnosticos(historia_clinica_id: UUID):
        """Obtener diagnósticos"""
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{BASE_URL}/antecedentes/diagnosticos/historia/{historia_clinica_id}"
            )
            return response.json()
    
    @staticmethod
    async def obtener_remisiones(historia_clinica_id: UUID):
        """Obtener remisiones"""
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{BASE_URL}/antecedentes/remisiones/historia/{historia_clinica_id}"
            )
            return response.json()
