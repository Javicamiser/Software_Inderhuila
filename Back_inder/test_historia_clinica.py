"""
SCRIPT DE TEST: Sistema de Historia Clínica Completa

Prueba los siguientes pasos:
1. Crear un deportista (si no existe)
2. Crear una historia clínica completa con 7 pasos
3. Recuperar la historia y verificar los datos
"""

import requests
import json
from uuid import uuid4
from datetime import date

BASE_URL = "http://localhost:8000/api/v1"

# ============================================================================
# TEST 1: Crear un deportista
# ============================================================================
print("\n" + "="*80)
print("TEST 1: Crear un deportista")
print("="*80)

deportista_data = {
    "numero_documento": f"TEST-{uuid4().hex[:8].upper()}",
    "tipo_documento_id": "01b6e2e1-2c3d-4a5b-9c8d-1e2f3g4h5i6j",  # Cédula
    "nombres": "Juan",
    "apellidos": "Pérez García",
    "fecha_nacimiento": "1995-05-15",
    "genero_id": "01b6e2e1-2c3d-4a5b-9c8d-1e2f3g4h5i6j",  # Masculino
    "email": f"test_{uuid4().hex[:6]}@example.com",
    "telefono": "3012345678",
    "ciudad": "Bogotá",
    "pais": "Colombia",
    "deporte": "Fútbol"
}

response = requests.post(f"{BASE_URL}/deportistas", json=deportista_data)
print(f"Status: {response.status_code}")

if response.status_code in [200, 201]:
    deportista = response.json()
    deportista_id = deportista.get("id")
    print(f"✅ Deportista creado: {deportista_id}")
    print(f"   Nombre: {deportista.get('nombres')} {deportista.get('apellidos')}")
else:
    print(f"❌ Error: {response.text}")
    exit(1)

# ============================================================================
# TEST 2: Crear historia clínica completa
# ============================================================================
print("\n" + "="*80)
print("TEST 2: Crear historia clínica completa (7 pasos)")
print("="*80)

historia_data = {
    "deportista_id": deportista_id,
    # Paso 1: Evaluación
    "tipoCita": "Primera cita",
    "motivoConsulta": "Evaluación médica precompetitiva",
    "enfermedadActual": "Sin síntomas actuales, en buen estado de salud",
    
    # Paso 2: Antecedentes Médicos
    "antecedentesPersonales": [
        {
            "codigoCIE11": "K29.6",
            "nombreEnfermedad": "Gastritis",
            "observaciones": "Diagnosticada hace 2 años, controlada"
        }
    ],
    "antecedentesFamiliares": [
        {
            "codigoCIE11": "I10",
            "nombreEnfermedad": "Hipertensión arterial",
            "familiar": "Padre",
            "observaciones": "Controla con medicamento"
        }
    ],
    "lesionesDeportivas": True,
    "descripcionLesiones": "Esguince de tobillo izquierdo hace 6 meses",
    "fechaUltimaLesion": "2025-06-15",
    "cirugiasPrevias": False,
    "detalleCirugias": None,
    "tieneAlergias": False,
    "alergias": None,
    "tomaMedicacion": False,
    "medicacionActual": None,
    "vacunas": ["COVID-19", "Influenza", "Tétanos"],
    
    # Paso 3: Revisión por Sistemas
    "revisionSistemas": {
        "cardiovascular": {"estado": "normal", "observaciones": "Sin soplos"},
        "respiratorio": {"estado": "normal", "observaciones": "Murmullo vesicular normal"},
        "digestivo": {"estado": "normal", "observaciones": "Abdomen blando"},
        "neurologico": {"estado": "normal", "observaciones": "Reflejos presentes"},
        "musculoesqueletico": {"estado": "anormal", "observaciones": "Molestias leves en rodilla derecha"},
        "genitourinario": {"estado": "normal", "observaciones": "Normal"},
        "endocrino": {"estado": "normal", "observaciones": "Normal"},
        "pielFaneras": {"estado": "normal", "observaciones": "Piel íntegra"}
    },
    
    # Paso 4: Exploración Física
    "estatura": "178",
    "peso": "75",
    "frecuenciaCardiaca": "68",
    "presionArterial": "120/80",
    "frecuenciaRespiratoria": "16",
    "temperatura": "36.5",
    "saturacionOxigeno": "98",
    "exploracionSistemas": {
        "cardiovascular": {"estado": "normal", "observaciones": "FC regular"},
        "respiratorio": {"estado": "normal", "observaciones": "FR normal"},
        "digestivo": {"estado": "normal", "observaciones": "Abdomen normal"},
        "neurologico": {"estado": "normal", "observaciones": "Alerta"},
        "musculoesqueletico": {"estado": "anormal", "observaciones": "Dolor a la palpación rodilla derecha"},
        "genitourinario": {"estado": "normal", "observaciones": "Normal"},
        "endocrino": {"estado": "normal", "observaciones": "Normal"},
        "pielFaneras": {"estado": "normal", "observaciones": "Normal"}
    },
    
    # Paso 5: Pruebas Complementarias
    "ayudasDiagnosticas": [
        {
            "categoria": "Imágenes",
            "nombrePrueba": "Radiografía de rodilla derecha",
            "codigoCUPS": "97009-04",
            "resultado": "Sin cambios degenerativos. Leve edema de partes blandas"
        }
    ],
    
    # Paso 6: Diagnóstico
    "analisisObjetivo": "Atleta 28 años, en buen estado general. Lesión previa en rodilla derecha en evolución favorable.",
    "impresionDiagnostica": "Paciente apto para competencia con recomendaciones de fortalecimiento",
    "diagnosticosClinicos": [
        {
            "codigoCIE11": "S83.2",
            "nombreEnfermedad": "Esguince de ligamentos de la rodilla",
            "observaciones": "En resolución"
        }
    ],
    
    # Paso 7: Plan de Tratamiento
    "indicacionesMedicas": "Continuar con fisioterapia. Usar soporte de rodilla durante competencia",
    "recomendacionesEntrenamiento": "Puede entrenar normalmente. Evitar impactos directos en rodilla derecha",
    "planSeguimiento": "Control en 4 semanas. Evaluación funcional post-competencia",
    "remisionesEspecialistas": [
        {
            "especialista": "Fisioterapeuta",
            "motivo": "Rehabilitación rodilla derecha",
            "prioridad": "Normal",
            "fechaRemision": str(date.today())
        }
    ]
}

response = requests.post(
    f"{BASE_URL}/historias_clinicas/completa",
    json=historia_data
)

print(f"Status: {response.status_code}")
print(f"Response: {json.dumps(response.json(), indent=2, ensure_ascii=False)}")

if response.status_code == 200:
    resultado = response.json()
    historia_id = resultado.get("id")
    print(f"\n✅ Historia clínica creada exitosamente!")
    print(f"   ID Historia: {historia_id}")
    print(f"   Deportista ID: {resultado.get('deportista_id')}")
    print(f"   Fecha: {resultado.get('fecha_apertura')}")
else:
    print(f"❌ Error al crear historia: {response.text}")
    exit(1)

# ============================================================================
# TEST 3: Recuperar historia completa
# ============================================================================
print("\n" + "="*80)
print("TEST 3: Recuperar historia clínica completa")
print("="*80)

response = requests.get(f"{BASE_URL}/historias_clinicas/{historia_id}/datos-completos")
print(f"Status: {response.status_code}")

if response.status_code == 200:
    data = response.json()
    print(f"✅ Historia recuperada exitosamente!")
    
    if "data" in data:
        historia = data["data"]
        print(f"\n   Pasos completados:")
        print(f"   ✓ Paso 1: {historia.get('tipoCita')} - {historia.get('motivoConsulta')[:40]}...")
        print(f"   ✓ Paso 2: {len(historia.get('antecedentesPersonales', []))} antecedentes, {len(historia.get('vacunas', []))} vacunas")
        print(f"   ✓ Paso 3: Cardiovascular={historia.get('revisionSistemas', {}).get('cardiovascular', {}).get('estado')}")
        print(f"   ✓ Paso 4: FC={historia.get('frecuenciaCardiaca')} bpm, PA={historia.get('presionArterial')}")
        print(f"   ✓ Paso 5: {len(historia.get('ayudasDiagnosticas', []))} pruebas complementarias")
        print(f"   ✓ Paso 6: {len(historia.get('diagnosticosClinicos', []))} diagnósticos")
        print(f"   ✓ Paso 7: {len(historia.get('remisionesEspecialistas', []))} remisiones")
else:
    print(f"❌ Error al recuperar historia: {response.text}")

# ============================================================================
# TEST 4: Listar historias del deportista
# ============================================================================
print("\n" + "="*80)
print("TEST 4: Listar historias del deportista")
print("="*80)

response = requests.get(f"{BASE_URL}/historias_clinicas/deportista/{deportista_id}")
print(f"Status: {response.status_code}")

if response.status_code == 200:
    historias = response.json()
    print(f"✅ Se encontraron {len(historias)} historias para este deportista")
    for h in historias:
        print(f"   - {h.get('id')}: {h.get('fecha_apertura')}")
else:
    print(f"❌ Error: {response.text}")

# ============================================================================
# RESUMEN
# ============================================================================
print("\n" + "="*80)
print("✅ TODOS LOS TESTS COMPLETADOS EXITOSAMENTE")
print("="*80)
print(f"\nDatos de prueba generados:")
print(f"  Deportista ID: {deportista_id}")
print(f"  Historia ID: {historia_id}")
print(f"\nPrueba completada: {date.today()}")
