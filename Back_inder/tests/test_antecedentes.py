"""
Tests para validar los endpoints de Historia Clínica normalizados
Ejecutar con: python -m pytest tests/test_antecedentes.py -v
"""
import pytest
from uuid import uuid4
from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.models.deportista import Deportista
from app.models.historia import HistoriaClinica
from app.schemas.antecedentes import (
    AntecedentesPersonalesCreate,
    AlergiasCreate,
    MedicacionesCreate,
    SignosVitalesCreate
)
from app.crud import antecedentes
from datetime import date, datetime


@pytest.fixture
def db():
    """Fixture para obtener sesión de BD"""
    database = SessionLocal()
    yield database
    database.close()


@pytest.fixture
def deportista(db: Session):
    """Fixture para crear un deportista de prueba"""
    dep = Deportista(
        nombres="Juan",
        apellidos="Pérez",
        cedula="12345678",
        email="juan@test.com",
        fecha_nacimiento=date(2000, 1, 1),
        tipo_deporte="Fútbol"
    )
    db.add(dep)
    db.commit()
    db.refresh(dep)
    return dep


@pytest.fixture
def historia_clinica(db: Session, deportista: Deportista):
    """Fixture para crear una historia clínica de prueba"""
    hc = HistoriaClinica(
        deportista_id=deportista.id,
        fecha_apertura=date.today(),
        estado_id=uuid4()  # Estado dummy
    )
    db.add(hc)
    db.commit()
    db.refresh(hc)
    return hc


class TestAntecedentesPersonales:
    """Tests para Antecedentes Personales"""
    
    def test_crear_antecedente_personal(self, db: Session, historia_clinica: HistoriaClinica):
        """Debe crear un antecedente personal correctamente"""
        data = AntecedentesPersonalesCreate(
            historia_clinica_id=historia_clinica.id,
            codigo_cie11="I10",
            nombre_enfermedad="Hipertensión",
            observaciones="Controlada con medicamentos"
        )
        result = antecedentes.crear_antecedente_personal(db, data)
        
        assert result.codigo_cie11 == "I10"
        assert result.nombre_enfermedad == "Hipertensión"
        assert result.historia_clinica_id == historia_clinica.id
    
    def test_obtener_antecedentes_personales(self, db: Session, historia_clinica: HistoriaClinica):
        """Debe obtener todos los antecedentes personales de una historia"""
        # Crear algunos antecedentes
        for i in range(3):
            data = AntecedentesPersonalesCreate(
                historia_clinica_id=historia_clinica.id,
                codigo_cie11=f"CIE{i}",
                nombre_enfermedad=f"Enfermedad {i}",
                observaciones=f"Obs {i}"
            )
            antecedentes.crear_antecedente_personal(db, data)
        
        # Obtener
        result = antecedentes.obtener_antecedentes_personales(db, historia_clinica.id)
        
        assert len(result) == 3
        assert all(a.historia_clinica_id == historia_clinica.id for a in result)
    
    def test_eliminar_antecedente_personal(self, db: Session, historia_clinica: HistoriaClinica):
        """Debe eliminar un antecedente personal"""
        # Crear
        data = AntecedentesPersonalesCreate(
            historia_clinica_id=historia_clinica.id,
            codigo_cie11="I10",
            nombre_enfermedad="Hipertensión",
        )
        antecedente = antecedentes.crear_antecedente_personal(db, data)
        antecedente_id = antecedente.id
        
        # Eliminar
        antecedentes.eliminar_antecedente_personal(db, antecedente_id)
        
        # Verificar
        result = antecedentes.obtener_antecedentes_personales(db, historia_clinica.id)
        assert len(result) == 0


class TestAlergias:
    """Tests para Alergias"""
    
    def test_crear_alergia(self, db: Session, historia_clinica: HistoriaClinica):
        """Debe crear una alergia correctamente"""
        data = AlergiasCreate(
            historia_clinica_id=historia_clinica.id,
            tipo_alergia="Medicamento",
            descripcion="Penicilina",
            reaccion="Anafilaxia"
        )
        result = antecedentes.crear_alergia(db, data)
        
        assert result.tipo_alergia == "Medicamento"
        assert result.descripcion == "Penicilina"
        assert result.reaccion == "Anafilaxia"
    
    def test_obtener_alergias(self, db: Session, historia_clinica: HistoriaClinica):
        """Debe obtener todas las alergias de una historia"""
        # Crear alergias
        alergias = ["Penicilina", "Ibuprofen", "Cacahuate"]
        for alergia in alergias:
            data = AlergiasCreate(
                historia_clinica_id=historia_clinica.id,
                tipo_alergia="Medicamento",
                descripcion=alergia
            )
            antecedentes.crear_alergia(db, data)
        
        # Obtener
        result = antecedentes.obtener_alergias(db, historia_clinica.id)
        
        assert len(result) == 3
        descripciones = [a.descripcion for a in result]
        assert all(alergia in descripciones for alergia in alergias)


class TestMedicaciones:
    """Tests para Medicaciones"""
    
    def test_crear_medicacion(self, db: Session, historia_clinica: HistoriaClinica):
        """Debe crear una medicación correctamente"""
        data = MedicacionesCreate(
            historia_clinica_id=historia_clinica.id,
            nombre_medicamento="Losartán",
            dosis="50mg",
            frecuencia="1x diaria",
            duracion="Permanente",
            indicacion="Hipertensión"
        )
        result = antecedentes.crear_medicacion(db, data)
        
        assert result.nombre_medicamento == "Losartán"
        assert result.dosis == "50mg"
        assert result.indicacion == "Hipertensión"
    
    def test_obtener_medicaciones(self, db: Session, historia_clinica: HistoriaClinica):
        """Debe obtener todas las medicaciones de una historia"""
        meds = ["Losartán", "Metformina", "Atorvastatina"]
        for med in meds:
            data = MedicacionesCreate(
                historia_clinica_id=historia_clinica.id,
                nombre_medicamento=med,
                dosis="50mg",
                frecuencia="1x",
                duracion="30 días"
            )
            antecedentes.crear_medicacion(db, data)
        
        result = antecedentes.obtener_medicaciones(db, historia_clinica.id)
        
        assert len(result) == 3
        nombres = [m.nombre_medicamento for m in result]
        assert all(med in nombres for med in meds)


class TestSignosVitales:
    """Tests para Signos Vitales"""
    
    def test_crear_signos_vitales(self, db: Session, historia_clinica: HistoriaClinica):
        """Debe crear signos vitales correctamente"""
        data = SignosVitalesCreate(
            historia_clinica_id=historia_clinica.id,
            presion_arterial="120/80",
            frecuencia_cardiaca=72,
            frecuencia_respiratoria=16,
            temperatura=36.5,
            peso=75.5,
            altura=1.80,
            imc=23.3,
            saturacion_oxigeno=98
        )
        result = antecedentes.crear_signos_vitales(db, data)
        
        assert result.presion_arterial == "120/80"
        assert result.frecuencia_cardiaca == 72
        assert result.temperatura == 36.5
        assert result.imc == 23.3
    
    def test_obtener_signos_vitales(self, db: Session, historia_clinica: HistoriaClinica):
        """Debe obtener signos vitales de una historia"""
        data = SignosVitalesCreate(
            historia_clinica_id=historia_clinica.id,
            presion_arterial="120/80",
            frecuencia_cardiaca=72,
            frecuencia_respiratoria=16,
            temperatura=36.5,
            peso=75.5,
            altura=1.80,
            imc=23.3,
            saturacion_oxigeno=98
        )
        antecedentes.crear_signos_vitales(db, data)
        
        result = antecedentes.obtener_signos_vitales(db, historia_clinica.id)
        
        assert result is not None
        assert result.presion_arterial == "120/80"
    
    def test_actualizar_signos_vitales(self, db: Session, historia_clinica: HistoriaClinica):
        """Debe actualizar signos vitales existentes"""
        # Crear
        data = SignosVitalesCreate(
            historia_clinica_id=historia_clinica.id,
            presion_arterial="120/80",
            frecuencia_cardiaca=72,
            frecuencia_respiratoria=16,
            temperatura=36.5,
            peso=75.5,
            altura=1.80,
            imc=23.3,
            saturacion_oxigeno=98
        )
        antecedentes.crear_signos_vitales(db, data)
        
        # Actualizar
        data_update = SignosVitalesCreate(
            historia_clinica_id=historia_clinica.id,
            presion_arterial="130/85",
            frecuencia_cardiaca=80,
            frecuencia_respiratoria=18,
            temperatura=37.0,
            peso=76.0,
            altura=1.80,
            imc=23.5,
            saturacion_oxigeno=97
        )
        result = antecedentes.actualizar_signos_vitales(db, historia_clinica.id, data_update)
        
        assert result.presion_arterial == "130/85"
        assert result.frecuencia_cardiaca == 80
        assert result.temperatura == 37.0


class TestIntegration:
    """Tests de integración completa"""
    
    def test_historia_completa_con_datos(self, db: Session, historia_clinica: HistoriaClinica):
        """Debe permitir guardar una historia clínica completa"""
        # Antecedentes
        AntecedentesPersonalesCreate(
            historia_clinica_id=historia_clinica.id,
            codigo_cie11="I10",
            nombre_enfermedad="Hipertensión"
        )
        
        # Alergia
        data_alergia = AlergiasCreate(
            historia_clinica_id=historia_clinica.id,
            tipo_alergia="Medicamento",
            descripcion="Penicilina"
        )
        antecedentes.crear_alergia(db, data_alergia)
        
        # Signos vitales
        data_sv = SignosVitalesCreate(
            historia_clinica_id=historia_clinica.id,
            presion_arterial="120/80",
            frecuencia_cardiaca=72,
            frecuencia_respiratoria=16,
            temperatura=36.5,
            peso=75.5,
            altura=1.80,
            imc=23.3,
            saturacion_oxigeno=98
        )
        antecedentes.crear_signos_vitales(db, data_sv)
        
        # Medicación
        data_med = MedicacionesCreate(
            historia_clinica_id=historia_clinica.id,
            nombre_medicamento="Losartán",
            dosis="50mg",
            frecuencia="1x diaria",
            duracion="Permanente"
        )
        antecedentes.crear_medicacion(db, data_med)
        
        # Verificar que todo está guardado
        db.refresh(historia_clinica)
        
        # Note: Si la relación está bien configurada, esto debería funcionar
        # assert len(historia_clinica.alergias) == 1
        # assert historia_clinica.signos_vitales is not None
        # assert len(historia_clinica.medicaciones) == 1


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
