from sqlalchemy.orm import Session
from app.models.historia import HistoriaClinica, HistoriaClinicaJSON
from app.models.formulario import RespuestaGrupo, FormularioRespuesta
from app.models.deportista import Deportista
from app.models.archivo import ArchivoClinico
from app.models.catalogo import Catalogo, CatalogoItem
from app.models.antecedentes import (
    AntecedentesPersonales, AntecedentesFamiliares, LesioneDeportivas,
    CirugiasPrivas, Alergias, Medicaciones, VacunasAdministradas,
    RevisionSistemas, SignosVitales, PruebasComplementarias,
    Diagnosticos, PlanTratamiento, RemisionesEspecialistas
)
from app.models.cita import Cita
from datetime import date
from uuid import uuid4

def crear_historia(db, deportista_id):
    historia = HistoriaClinica(deportista_id=deportista_id)
    db.add(historia)
    db.commit()
    db.refresh(historia)
    return historia

def obtener_historias_por_deportista(db, deportista_id):
    return db.query(HistoriaClinica).filter(
        HistoriaClinica.deportista_id == deportista_id
    ).all()

def obtener_historia_completa(db, historia_id):
    historia = db.query(HistoriaClinica).filter(
        HistoriaClinica.id == historia_id
    ).first()

    if not historia:
        return None

    deportista = db.query(Deportista).filter(
        Deportista.id == historia.deportista_id
    ).first()

    grupos = db.query(RespuestaGrupo).filter(
        RespuestaGrupo.historia_clinica_id == historia_id
    ).all()

    formularios = []
    for grupo in grupos:
        respuestas = db.query(FormularioRespuesta).filter(
            FormularioRespuesta.grupo_id == grupo.id
        ).all()

        formularios.append({
            "formulario_id": grupo.formulario_id,
            "respuestas": [
                {"campo": r.campo, "valor": r.valor}
                for r in respuestas
            ]
        })

    archivos = db.query(ArchivoClinico).filter(
        ArchivoClinico.historia_id == historia_id
    ).all()

    return {
        "historia": {
            "id": historia.id,
            "fecha_apertura": historia.fecha_apertura
        },
        "deportista": {
            "id": deportista.id,
            "documento": deportista.documento,
            "nombres": deportista.nombres,
            "apellidos": deportista.apellidos
        },
        "formularios": formularios,
        "archivos": [
            {
                "id": a.id,
                "nombre_original": a.nombre_original,
                "categoria": a.categoria,
                "tipo_archivo": a.tipo_archivo,
                "ruta": a.ruta,
                "fecha_subida": a.fecha_subida
            }
            for a in archivos
        ]
    }

def crear_historia_completa(db, data):
    """
    Crear una historia clínica completa con todos los 7 pasos
    Guarda datos en tablas normalizadas
    
    Args:
        db: Sesión de base de datos
        data: HistoriaClinicaCompleteCreate con todos los datos
    
    Returns:
        Diccionario con el ID de la historia creada
    """
    try:
        # 1. Crear historia clínica básica
        print(f"📝 Buscando catálogo 'estado_historia'...")
        estado_catalogo = db.query(Catalogo).filter(
            Catalogo.nombre == "estado_historia"
        ).first()
        
        if not estado_catalogo:
            raise ValueError("Catálogo 'estado_historia' no encontrado")
        
        print(f"📝 Buscando estado 'Abierta'...")
        estado_abierta = db.query(CatalogoItem).filter(
            CatalogoItem.catalogo_id == estado_catalogo.id,
            CatalogoItem.nombre == "Abierta"
        ).first()
        
        if not estado_abierta:
            raise ValueError("Estado 'Abierta' no encontrado en el catálogo")
        
        print(f"📝 Creando historia clínica...")
        historia = HistoriaClinica(
            deportista_id=data.deportista_id,
            fecha_apertura=date.today(),
            estado_id=estado_abierta.id
        )
        db.add(historia)
        db.flush()  # Obtener el ID generado
        
        # 2. Guardar datos en tablas normalizadas
        print(f"📝 Guardando antecedentes personales...")
        for ant in data.antecedentesPersonales:
            ap = AntecedentesPersonales(
                historia_clinica_id=historia.id,
                codigo_cie11=ant.codigoCIE11,
                nombre_enfermedad=ant.nombreEnfermedad,
                observaciones=ant.observaciones
            )
            db.add(ap)
        
        print(f"📝 Guardando antecedentes familiares...")
        for ant in data.antecedentesFamiliares:
            af = AntecedentesFamiliares(
                historia_clinica_id=historia.id,
                tipo_familiar=ant.familiar,
                codigo_cie11=ant.codigoCIE11,
                nombre_enfermedad=ant.nombreEnfermedad
            )
            db.add(af)
        
        # Lesiones deportivas
        if data.lesionesDeportivas and data.descripcionLesiones:
            fecha_lesion = date.today()
            if data.fechaUltimaLesion:
                try:
                    # Convertir string a date
                    fecha_lesion = date.fromisoformat(data.fechaUltimaLesion)
                except (ValueError, TypeError):
                    fecha_lesion = date.today()
            
            ld = LesioneDeportivas(
                historia_clinica_id=historia.id,
                tipo_lesion=data.descripcionLesiones,
                fecha_lesion=fecha_lesion,
                tratamiento="",
                observaciones=""
            )
            db.add(ld)
        
        # Cirugías previas
        if data.cirugiasPrevias and data.detalleCirugias:
            cp = CirugiasPrivas(
                historia_clinica_id=historia.id,
                tipo_cirugia=data.detalleCirugias,
                fecha_cirugia=date.today(),
                observaciones=""
            )
            db.add(cp)
        
        # Alergias
        if data.tieneAlergias and data.alergias:
            alergia = Alergias(
                historia_clinica_id=historia.id,
                tipo_alergia="General",
                descripcion=data.alergias,
                reaccion=""
            )
            db.add(alergia)
        
        # Medicaciones
        if data.tomaMedicacion and data.medicacionActual:
            med = Medicaciones(
                historia_clinica_id=historia.id,
                nombre_medicamento=data.medicacionActual,
                dosis="",
                frecuencia="",
                duracion="",
                indicacion=""
            )
            db.add(med)
        
        # Vacunas
        print(f"📝 Guardando vacunas...")
        for vacuna in data.vacunas:
            vac = VacunasAdministradas(
                historia_clinica_id=historia.id,
                nombre_vacuna=vacuna,
                fecha_administracion=date.today(),
                observaciones=""
            )
            db.add(vac)
        
        # Revisión por sistemas
        print(f"📝 Guardando revisión por sistemas...")
        sistemas = [
            ("cardiovascular", data.revisionSistemas.cardiovascular),
            ("respiratorio", data.revisionSistemas.respiratorio),
            ("digestivo", data.revisionSistemas.digestivo),
            ("neurologico", data.revisionSistemas.neurologico),
            ("musculoesqueletico", data.revisionSistemas.musculoesqueletico),
            ("genitourinario", data.revisionSistemas.genitourinario),
            ("endocrino", data.revisionSistemas.endocrino),
            ("piel y faneras", data.revisionSistemas.pielFaneras),
        ]
        
        for nombre_sistema, revision in sistemas:
            if revision.estado or revision.observaciones:
                rs = RevisionSistemas(
                    historia_clinica_id=historia.id,
                    sistema_nombre=nombre_sistema,
                    estado=revision.estado or "",
                    observaciones=revision.observaciones or ""
                )
                db.add(rs)
        
        # Signos vitales
        print(f"📝 Guardando signos vitales...")
        # Parsear presión arterial (ej: "120/80")
        presion_sistolica = 120
        presion_diastolica = 80
        if data.presionArterial:
            try:
                partes = data.presionArterial.split("/")
                presion_sistolica = int(partes[0])
                presion_diastolica = int(partes[1]) if len(partes) > 1 else 80
            except (ValueError, IndexError):
                pass
        
        sv = SignosVitales(
            historia_clinica_id=historia.id,
            presion_arterial_sistolica=presion_sistolica,
            presion_arterial_diastolica=presion_diastolica,
            frecuencia_cardiaca_lpm=int(data.frecuenciaCardiaca) if data.frecuenciaCardiaca else 70,
            frecuencia_respiratoria_rpm=int(data.frecuenciaRespiratoria) if data.frecuenciaRespiratoria else 16,
            temperatura_celsius=float(data.temperatura) if data.temperatura else 36.5,
            peso_kg=float(data.peso) if data.peso else 0,
            estatura_cm=float(data.estatura) if data.estatura else 0,
            imc=0,
            saturacion_oxigeno_percent=float(data.saturacionOxigeno) if data.saturacionOxigeno else 98
        )
        db.add(sv)
        
        # Pruebas complementarias
        print(f"📝 Guardando pruebas complementarias...")
        for prueba in data.ayudasDiagnosticas:
            pc = PruebasComplementarias(
                historia_clinica_id=historia.id,
                categoria=prueba.categoria,
                nombre_prueba=prueba.nombrePrueba,
                codigo_cups=prueba.codigoCUPS,
                resultado=prueba.resultado or ""
            )
            db.add(pc)
        
        # Diagnósticos
        print(f"📝 Guardando diagnósticos...")
        for diag in data.diagnosticos:
            d = Diagnosticos(
                historia_clinica_id=historia.id,
                codigo_cie11=diag.codigo,
                nombre_enfermedad=diag.nombre,
                observaciones=diag.observaciones or ""
            )
            db.add(d)
        
        # Plan de tratamiento
        print(f"📝 Guardando plan de tratamiento...")
        pt = PlanTratamiento(
            historia_clinica_id=historia.id,
            indicaciones_medicas=data.indicacionesMedicas or "",
            recomendaciones_entrenamiento=data.recomendacionesEntrenamiento or "",
            plan_seguimiento=data.planSeguimiento or ""
        )
        db.add(pt)
        
        # Remisiones a especialistas
        print(f"📝 Guardando remisiones...")
        for remision in data.remisionesEspecialistas:
            fecha_remision = date.today()
            if remision.fechaRemision:
                try:
                    # Convertir string a date
                    fecha_remision = date.fromisoformat(remision.fechaRemision)
                except (ValueError, TypeError):
                    fecha_remision = date.today()
            
            re = RemisionesEspecialistas(
                historia_clinica_id=historia.id,
                especialista=remision.especialista,
                motivo=remision.motivo,
                prioridad=remision.prioridad or "Normal",
                fecha_remision=fecha_remision
            )
            db.add(re)
        
        # 3. Guardar datos completos como JSON (backup)
        datos_json = HistoriaClinicaJSON(
            historia_clinica_id=str(historia.id),
            deportista_id=str(data.deportista_id),
            datos_completos=data.model_dump(mode='json')
        )
        db.add(datos_json)
        
        # 4. Actualizar estado de cita a "Realizada"
        print(f"📝 Actualizando estado de cita a 'Realizada'...")
        try:
            # Obtener el estado "Realizada" del catálogo
            estado_catalogo = db.query(Catalogo).filter(
                Catalogo.nombre == "estados_cita"
            ).first()
            
            if estado_catalogo:
                estado_realizada = db.query(CatalogoItem).filter(
                    CatalogoItem.catalogo_id == estado_catalogo.id,
                    CatalogoItem.nombre == "Realizada"
                ).first()
                
                if estado_realizada:
                    # Buscar la cita del deportista de hoy
                    cita = db.query(Cita).filter(
                        Cita.deportista_id == data.deportista_id,
                        Cita.fecha == date.today()
                    ).first()
                    
                    if cita:
                        cita.estado_cita_id = estado_realizada.id
                        db.add(cita)
                        print(f"✅ Cita actualizada a 'Realizada'")
        except Exception as e:
            print(f"⚠️ Error al actualizar cita (no es crítico): {str(e)}")
        
        # 5. Commit
        db.commit()
        db.refresh(historia)
        
        print(f"✅ Historia creada exitosamente con datos normalizados: {historia.id}")
        return {
            "id": str(historia.id),
            "deportista_id": str(data.deportista_id),
            "fecha_apertura": historia.fecha_apertura.isoformat(),
            "message": "Historia clínica creada exitosamente con datos normalizados"
        }
        
    except Exception as e:
        db.rollback()
        import traceback
        traceback.print_exc()
        raise ValueError(f"Error al crear historia clínica: {str(e)}")

def obtener_historia_datos_completos(db, historia_id: str) -> dict:
    """
    Obtener historia clínica completa con todos los datos
    
    Args:
        db: Sesión de base de datos
        historia_id: ID de la historia clínica
    
    Returns:
        Datos completos de la historia clínica
    """
    historia_json = db.query(HistoriaClinicaJSON).filter(
        HistoriaClinicaJSON.historia_clinica_id == historia_id
    ).first()
    
    if not historia_json:
        raise ValueError(f"Historia clínica con ID {historia_id} no encontrada")
    
    return historia_json.datos_completos

def listar_todas_historias(db):
    """Listar todas las historias clínicas con información del deportista"""
    return db.query(HistoriaClinica).all()

def eliminar_historia(db: Session, historia_id: str):
    """Eliminar una historia clínica por ID"""
    try:
        from uuid import UUID
        
        # Try to parse as UUID
        try:
            historia_uuid = UUID(historia_id)
        except (ValueError, TypeError):
            historia_uuid = historia_id
        
        # Find the historia
        historia = db.query(HistoriaClinica).filter(
            HistoriaClinica.id == historia_uuid
        ).first()
        
        if not historia:
            return False
        
        # Delete related HistoriaClinicaJSON records first
        from app.models.historia import HistoriaClinicaJSON
        db.query(HistoriaClinicaJSON).filter(
            HistoriaClinicaJSON.historia_clinica_id == historia_uuid
        ).delete()
        
        # Now delete the historia
        db.delete(historia)
        db.commit()
        return True
    except Exception as e:
        db.rollback()
        print(f"Error eliminar_historia: {str(e)}")
        raise


# ============================================================================
# CRUD para Motivo de Consulta y Enfermedad Actual
# ============================================================================

def crear_motivo_consulta_enfermedad(db: Session, historia_id, data: dict):
    """Crear registro de motivo de consulta y enfermedad actual"""
    from app.models.antecedentes import MotivoConsultaEnfermedadActual
    
    motivo = MotivoConsultaEnfermedadActual(
        historia_clinica_id=historia_id,
        **data
    )
    db.add(motivo)
    db.commit()
    db.refresh(motivo)
    return motivo


def obtener_motivo_consulta(db: Session, historia_id):
    """Obtener motivo de consulta por historia"""
    from app.models.antecedentes import MotivoConsultaEnfermedadActual
    return db.query(MotivoConsultaEnfermedadActual).filter(
        MotivoConsultaEnfermedadActual.historia_clinica_id == historia_id
    ).all()


def actualizar_motivo_consulta(db: Session, motivo_id, data: dict):
    """Actualizar motivo de consulta"""
    from app.models.antecedentes import MotivoConsultaEnfermedadActual
    
    motivo = db.query(MotivoConsultaEnfermedadActual).filter(
        MotivoConsultaEnfermedadActual.id == motivo_id
    ).first()
    
    if motivo:
        for key, value in data.items():
            setattr(motivo, key, value)
        db.commit()
        db.refresh(motivo)
    return motivo


def eliminar_motivo_consulta(db: Session, motivo_id):
    """Eliminar motivo de consulta"""
    from app.models.antecedentes import MotivoConsultaEnfermedadActual
    
    motivo = db.query(MotivoConsultaEnfermedadActual).filter(
        MotivoConsultaEnfermedadActual.id == motivo_id
    ).first()
    
    if motivo:
        db.delete(motivo)
        db.commit()
    return motivo


# ============================================================================
# CRUD para Exploración Física por Sistemas
# ============================================================================

def crear_exploracion_fisica(db: Session, historia_id, data: dict):
    """Crear registro de exploración física por sistemas"""
    from app.models.antecedentes import ExploracionFisicaSistemas
    
    exploracion = ExploracionFisicaSistemas(
        historia_clinica_id=historia_id,
        **data
    )
    db.add(exploracion)
    db.commit()
    db.refresh(exploracion)
    return exploracion


def obtener_exploracion_fisica(db: Session, historia_id):
    """Obtener exploración física por historia"""
    from app.models.antecedentes import ExploracionFisicaSistemas
    return db.query(ExploracionFisicaSistemas).filter(
        ExploracionFisicaSistemas.historia_clinica_id == historia_id
    ).all()


def actualizar_exploracion_fisica(db: Session, exploracion_id, data: dict):
    """Actualizar exploración física"""
    from app.models.antecedentes import ExploracionFisicaSistemas
    
    exploracion = db.query(ExploracionFisicaSistemas).filter(
        ExploracionFisicaSistemas.id == exploracion_id
    ).first()
    
    if exploracion:
        for key, value in data.items():
            setattr(exploracion, key, value)
        db.commit()
        db.refresh(exploracion)
    return exploracion


def eliminar_exploracion_fisica(db: Session, exploracion_id):
    """Eliminar exploración física"""
    from app.models.antecedentes import ExploracionFisicaSistemas
    
    exploracion = db.query(ExploracionFisicaSistemas).filter(
        ExploracionFisicaSistemas.id == exploracion_id
    ).first()
    
    if exploracion:
        db.delete(exploracion)
        db.commit()
    return exploracion
