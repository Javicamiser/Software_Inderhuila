"""
Servicio para generar documentos médicos en PDF
INDERHUILA - Instituto Departamental de Recreación y Deportes del Huila
"""
from io import BytesIO
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch, cm
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_JUSTIFY, TA_RIGHT
from datetime import datetime


def generar_documento_historia_clinica(historia_data: dict, deportista_data: dict):
    """
    Genera un documento PDF de historia clínica médica completa
    
    Args:
        historia_data: Datos completos de la historia clínica (desde tablas normalizadas)
        deportista_data: Datos del deportista
    
    Returns:
        BytesIO: PDF generado en bytes
    """
    pdf_buffer = BytesIO()
    doc = SimpleDocTemplate(
        pdf_buffer, 
        pagesize=letter, 
        topMargin=0.5*inch, 
        bottomMargin=0.5*inch,
        leftMargin=0.6*inch,
        rightMargin=0.6*inch
    )
    
    # Estilos
    styles = getSampleStyleSheet()
    
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=16,
        textColor=colors.HexColor('#1e40af'),
        spaceAfter=6,
        alignment=TA_CENTER,
        fontName='Helvetica-Bold'
    )
    
    subtitle_style = ParagraphStyle(
        'CustomSubtitle',
        parent=styles['Normal'],
        fontSize=10,
        textColor=colors.HexColor('#4b5563'),
        spaceAfter=12,
        alignment=TA_CENTER
    )
    
    heading_style = ParagraphStyle(
        'CustomHeading',
        parent=styles['Heading2'],
        fontSize=11,
        textColor=colors.white,
        spaceAfter=6,
        spaceBefore=12,
        fontName='Helvetica-Bold',
        backColor=colors.HexColor('#1e40af'),
        borderPadding=(6, 6, 6, 6)
    )
    
    subheading_style = ParagraphStyle(
        'CustomSubHeading',
        parent=styles['Heading3'],
        fontSize=10,
        textColor=colors.HexColor('#1e40af'),
        spaceAfter=4,
        spaceBefore=8,
        fontName='Helvetica-Bold'
    )
    
    normal_style = ParagraphStyle(
        'CustomNormal',
        parent=styles['Normal'],
        fontSize=9,
        alignment=TA_JUSTIFY,
        spaceAfter=4
    )
    
    label_style = ParagraphStyle(
        'LabelStyle',
        parent=styles['Normal'],
        fontSize=8,
        textColor=colors.HexColor('#6b7280')
    )
    
    value_style = ParagraphStyle(
        'ValueStyle',
        parent=styles['Normal'],
        fontSize=9,
        fontName='Helvetica-Bold'
    )
    
    content = []
    
    # =========================================================================
    # ENCABEZADO
    # =========================================================================
    content.append(Paragraph("HISTORIA CLÍNICA DEPORTIVA", title_style))
    content.append(Paragraph("INDERHUILA - Instituto Departamental de Recreación y Deportes del Huila", subtitle_style))
    content.append(Spacer(1, 0.1*inch))
    
    # =========================================================================
    # DATOS DEL DEPORTISTA
    # =========================================================================
    content.append(Paragraph("DATOS DEL DEPORTISTA", heading_style))
    content.append(Spacer(1, 0.1*inch))
    
    # Tabla de datos del deportista
    deportista_table_data = [
        [
            Paragraph("<b>Nombre Completo:</b>", label_style),
            Paragraph(f"{deportista_data.get('nombres', '')} {deportista_data.get('apellidos', '')}", value_style),
            Paragraph("<b>Documento:</b>", label_style),
            Paragraph(str(deportista_data.get('numero_documento', 'N/A')), value_style)
        ],
        [
            Paragraph("<b>Fecha Nacimiento:</b>", label_style),
            Paragraph(str(deportista_data.get('fecha_nacimiento', 'N/A')), value_style),
            Paragraph("<b>Teléfono:</b>", label_style),
            Paragraph(str(deportista_data.get('telefono', 'N/A')), value_style)
        ],
        [
            Paragraph("<b>Email:</b>", label_style),
            Paragraph(str(deportista_data.get('email', 'N/A')), value_style),
            Paragraph("<b>Deporte:</b>", label_style),
            Paragraph(str(deportista_data.get('deporte', 'N/A')), value_style)
        ],
        [
            Paragraph("<b>Fecha Apertura:</b>", label_style),
            Paragraph(str(historia_data.get('fecha_apertura', 'N/A')), value_style),
            Paragraph("<b>ID Historia:</b>", label_style),
            Paragraph(str(historia_data.get('id', 'N/A'))[:8] + "...", value_style)
        ]
    ]
    
    deportista_table = Table(deportista_table_data, colWidths=[1.2*inch, 2.3*inch, 1.2*inch, 2.3*inch])
    deportista_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#f8fafc')),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#e2e8f0')),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
    ]))
    content.append(deportista_table)
    content.append(Spacer(1, 0.15*inch))
    
    # =========================================================================
    # 1. MOTIVO DE CONSULTA Y ENFERMEDAD ACTUAL
    # =========================================================================
    motivo = historia_data.get('motivo_consulta_enfermedad')
    if motivo:
        content.append(Paragraph("1. MOTIVO DE CONSULTA Y ENFERMEDAD ACTUAL", heading_style))
        content.append(Spacer(1, 0.1*inch))
        
        if motivo.get('motivo_consulta'):
            content.append(Paragraph("<b>Motivo de Consulta:</b>", subheading_style))
            content.append(Paragraph(str(motivo.get('motivo_consulta', '')), normal_style))
        
        if motivo.get('sintomas_principales'):
            content.append(Paragraph("<b>Síntomas Principales:</b>", subheading_style))
            content.append(Paragraph(str(motivo.get('sintomas_principales', '')), normal_style))
        
        if motivo.get('duracion_sintomas'):
            content.append(Paragraph(f"<b>Duración de Síntomas:</b> {motivo.get('duracion_sintomas', '')}", normal_style))
        
        if motivo.get('inicio_enfermedad'):
            content.append(Paragraph(f"<b>Inicio de Enfermedad:</b> {motivo.get('inicio_enfermedad', '')}", normal_style))
        
        if motivo.get('evolucion'):
            content.append(Paragraph("<b>Evolución:</b>", subheading_style))
            content.append(Paragraph(str(motivo.get('evolucion', '')), normal_style))
        
        if motivo.get('factor_desencadenante'):
            content.append(Paragraph(f"<b>Factor Desencadenante:</b> {motivo.get('factor_desencadenante', '')}", normal_style))
        
        if motivo.get('medicamentos_previos'):
            content.append(Paragraph(f"<b>Medicamentos Previos:</b> {motivo.get('medicamentos_previos', '')}", normal_style))
        
        content.append(Spacer(1, 0.1*inch))
    
    # =========================================================================
    # 2. ANTECEDENTES
    # =========================================================================
    tiene_antecedentes = (
        historia_data.get('antecedentes_personales') or 
        historia_data.get('antecedentes_familiares') or
        historia_data.get('lesiones_deportivas') or
        historia_data.get('cirugias_previas') or
        historia_data.get('alergias') or
        historia_data.get('medicaciones') or
        historia_data.get('vacunas_administradas')
    )
    
    if tiene_antecedentes:
        content.append(Paragraph("2. ANTECEDENTES MÉDICOS", heading_style))
        content.append(Spacer(1, 0.1*inch))
        
        # Antecedentes Personales
        if historia_data.get('antecedentes_personales'):
            content.append(Paragraph("<b>Antecedentes Personales:</b>", subheading_style))
            for ant in historia_data.get('antecedentes_personales', []):
                codigo = ant.get('codigo_cie11', '')
                nombre = ant.get('nombre_enfermedad', '')
                obs = ant.get('observaciones', '')
                texto = f"• {nombre}"
                if codigo:
                    texto += f" (CIE-11: {codigo})"
                if obs:
                    texto += f" - {obs}"
                content.append(Paragraph(texto, normal_style))
        
        # Antecedentes Familiares
        if historia_data.get('antecedentes_familiares'):
            content.append(Paragraph("<b>Antecedentes Familiares:</b>", subheading_style))
            for ant in historia_data.get('antecedentes_familiares', []):
                familiar = ant.get('tipo_familiar', '')
                nombre = ant.get('nombre_enfermedad', '')
                codigo = ant.get('codigo_cie11', '')
                texto = f"• {nombre}"
                if familiar:
                    texto += f" (Relación: {familiar})"
                if codigo:
                    texto += f" - CIE-11: {codigo}"
                content.append(Paragraph(texto, normal_style))
        
        # Lesiones Deportivas
        if historia_data.get('lesiones_deportivas'):
            content.append(Paragraph("<b>Lesiones Deportivas:</b>", subheading_style))
            for lesion in historia_data.get('lesiones_deportivas', []):
                desc = lesion.get('descripcion', '') or lesion.get('tipo_lesion', '')
                fecha = lesion.get('fecha_ultima_lesion', '') or lesion.get('fecha_lesion', '')
                obs = lesion.get('observaciones', '')
                texto = f"• {desc}"
                if fecha:
                    texto += f" (Fecha: {fecha})"
                if obs:
                    texto += f" - {obs}"
                content.append(Paragraph(texto, normal_style))
        
        # Cirugías Previas
        if historia_data.get('cirugias_previas'):
            content.append(Paragraph("<b>Cirugías Previas:</b>", subheading_style))
            for cirugia in historia_data.get('cirugias_previas', []):
                tipo = cirugia.get('tipo_cirugia', '')
                fecha = cirugia.get('fecha_cirugia', '')
                obs = cirugia.get('observaciones', '')
                texto = f"• {tipo}"
                if fecha:
                    texto += f" (Fecha: {fecha})"
                if obs:
                    texto += f" - {obs}"
                content.append(Paragraph(texto, normal_style))
        
        # Alergias
        if historia_data.get('alergias'):
            content.append(Paragraph("<b>Alergias:</b>", subheading_style))
            for alergia in historia_data.get('alergias', []):
                tipo = alergia.get('tipo_alergia', '')
                obs = alergia.get('observaciones', '')
                texto = f"• {tipo}"
                if obs:
                    texto += f" - {obs}"
                content.append(Paragraph(texto, normal_style))
        
        # Medicaciones
        if historia_data.get('medicaciones'):
            content.append(Paragraph("<b>Medicaciones Actuales:</b>", subheading_style))
            for med in historia_data.get('medicaciones', []):
                nombre = med.get('nombre_medicacion', '')
                dosis = med.get('dosis', '')
                frecuencia = med.get('frecuencia', '')
                obs = med.get('observaciones', '')
                texto = f"• {nombre}"
                if dosis:
                    texto += f" - Dosis: {dosis}"
                if frecuencia:
                    texto += f" - Frecuencia: {frecuencia}"
                if obs:
                    texto += f" ({obs})"
                content.append(Paragraph(texto, normal_style))
        
        # Vacunas
        if historia_data.get('vacunas_administradas'):
            content.append(Paragraph("<b>Vacunas Administradas:</b>", subheading_style))
            for vacuna in historia_data.get('vacunas_administradas', []):
                nombre = vacuna.get('nombre_vacuna', '')
                fecha = vacuna.get('fecha_administracion', '')
                obs = vacuna.get('observaciones', '')
                texto = f"• {nombre}"
                if fecha:
                    texto += f" (Fecha: {fecha})"
                if obs:
                    texto += f" - {obs}"
                content.append(Paragraph(texto, normal_style))
        
        content.append(Spacer(1, 0.1*inch))
    
    # =========================================================================
    # 3. REVISIÓN POR SISTEMAS
    # =========================================================================
    if historia_data.get('revision_sistemas'):
        content.append(Paragraph("3. REVISIÓN POR SISTEMAS", heading_style))
        content.append(Spacer(1, 0.1*inch))
        
        for sistema in historia_data.get('revision_sistemas', []):
            nombre = sistema.get('sistema_nombre', '')
            estado = sistema.get('estado', '')
            obs = sistema.get('observaciones', '')
            
            estado_color = "green" if estado.lower() == 'normal' else "red"
            texto = f"<b>{nombre}:</b> <font color='{estado_color}'>{estado}</font>"
            if obs:
                texto += f" - {obs}"
            content.append(Paragraph(texto, normal_style))
        
        content.append(Spacer(1, 0.1*inch))
    
    # =========================================================================
    # 4. EXPLORACIÓN FÍSICA - SIGNOS VITALES
    # =========================================================================
    if historia_data.get('signos_vitales'):
        content.append(Paragraph("4. EXPLORACIÓN FÍSICA - SIGNOS VITALES", heading_style))
        content.append(Spacer(1, 0.1*inch))
        
        signos = historia_data.get('signos_vitales', [])
        if isinstance(signos, list) and len(signos) > 0:
            sv = signos[0]
        else:
            sv = signos if isinstance(signos, dict) else {}
        
        # Tabla de signos vitales
        signos_table_data = [
            [
                Paragraph("<b>Estatura:</b>", label_style),
                Paragraph(f"{sv.get('estatura_cm', 'N/A')} cm", value_style),
                Paragraph("<b>Peso:</b>", label_style),
                Paragraph(f"{sv.get('peso_kg', 'N/A')} kg", value_style),
                Paragraph("<b>IMC:</b>", label_style),
                Paragraph(f"{sv.get('imc', 'N/A')}", value_style),
            ],
            [
                Paragraph("<b>Presión Arterial:</b>", label_style),
                Paragraph(f"{sv.get('presion_arterial_sistolica', 'N/A')}/{sv.get('presion_arterial_diastolica', '')} mmHg", value_style),
                Paragraph("<b>Frec. Cardíaca:</b>", label_style),
                Paragraph(f"{sv.get('frecuencia_cardiaca_lpm', 'N/A')} lpm", value_style),
                Paragraph("<b>Frec. Respiratoria:</b>", label_style),
                Paragraph(f"{sv.get('frecuencia_respiratoria_rpm', 'N/A')} rpm", value_style),
            ],
            [
                Paragraph("<b>Temperatura:</b>", label_style),
                Paragraph(f"{sv.get('temperatura_celsius', 'N/A')} °C", value_style),
                Paragraph("<b>Saturación O₂:</b>", label_style),
                Paragraph(f"{sv.get('saturacion_oxigeno_percent', 'N/A')} %", value_style),
                Paragraph("", label_style),
                Paragraph("", value_style),
            ]
        ]
        
        signos_table = Table(signos_table_data, colWidths=[1.1*inch, 1.0*inch, 1.1*inch, 1.0*inch, 1.1*inch, 1.0*inch])
        signos_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#f0fdf4')),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#86efac')),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('TOPPADDING', (0, 0), (-1, -1), 4),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ]))
        content.append(signos_table)
        content.append(Spacer(1, 0.15*inch))
    
    # =========================================================================
    # 5. EXPLORACIÓN FÍSICA POR SISTEMAS
    # =========================================================================
    exploracion = historia_data.get('exploracion_fisica_sistemas')
    if exploracion:
        content.append(Paragraph("5. EXPLORACIÓN FÍSICA POR SISTEMAS", heading_style))
        content.append(Spacer(1, 0.1*inch))
        
        sistemas_exploracion = [
            ('Sistema Cardiovascular', exploracion.get('sistema_cardiovascular')),
            ('Sistema Respiratorio', exploracion.get('sistema_respiratorio')),
            ('Sistema Digestivo', exploracion.get('sistema_digestivo')),
            ('Sistema Neurológico', exploracion.get('sistema_neurologico')),
            ('Sistema Genitourinario', exploracion.get('sistema_genitourinario')),
            ('Sistema Musculoesquelético', exploracion.get('sistema_musculoesqueletico')),
            ('Sistema Integumentario (Piel)', exploracion.get('sistema_integumentario')),
            ('Sistema Endocrino', exploracion.get('sistema_endocrino')),
            ('Cabeza y Cuello', exploracion.get('cabeza_cuello')),
            ('Extremidades', exploracion.get('extremidades')),
        ]
        
        for nombre, hallazgo in sistemas_exploracion:
            if hallazgo:
                content.append(Paragraph(f"<b>{nombre}:</b> {hallazgo}", normal_style))
        
        if exploracion.get('observaciones_generales'):
            content.append(Paragraph(f"<b>Observaciones Generales:</b> {exploracion.get('observaciones_generales')}", normal_style))
        
        content.append(Spacer(1, 0.1*inch))
    
    # =========================================================================
    # 6. PRUEBAS COMPLEMENTARIAS
    # =========================================================================
    if historia_data.get('pruebas_complementarias'):
        content.append(Paragraph("6. PRUEBAS COMPLEMENTARIAS / AYUDAS DIAGNÓSTICAS", heading_style))
        content.append(Spacer(1, 0.1*inch))
        
        for prueba in historia_data.get('pruebas_complementarias', []):
            nombre = prueba.get('nombre_prueba', '')
            categoria = prueba.get('categoria', '')
            codigo = prueba.get('codigo_cups', '')
            resultado = prueba.get('resultado', '')
            
            texto = f"<b>• {nombre}</b>"
            if categoria:
                texto += f" ({categoria})"
            if codigo:
                texto += f" - CUPS: {codigo}"
            content.append(Paragraph(texto, normal_style))
            if resultado:
                content.append(Paragraph(f"  Resultado: {resultado}", normal_style))
        
        content.append(Spacer(1, 0.1*inch))
    
    # =========================================================================
    # 7. DIAGNÓSTICOS
    # =========================================================================
    if historia_data.get('diagnosticos'):
        content.append(Paragraph("7. DIAGNÓSTICOS", heading_style))
        content.append(Spacer(1, 0.1*inch))
        
        for diag in historia_data.get('diagnosticos', []):
            nombre = diag.get('nombre_enfermedad', '')
            codigo = diag.get('codigo_cie11', '')
            obs = diag.get('observaciones', '')
            impresion = diag.get('impresion_diagnostica', '')
            analisis = diag.get('analisis_objetivo', '')
            
            texto = f"<b>• {nombre}</b>"
            if codigo:
                texto += f" (CIE-11: {codigo})"
            content.append(Paragraph(texto, normal_style))
            
            if obs:
                content.append(Paragraph(f"  Observaciones: {obs}", normal_style))
            if impresion:
                content.append(Paragraph(f"  Impresión Diagnóstica: {impresion}", normal_style))
            if analisis:
                content.append(Paragraph(f"  Análisis Objetivo: {analisis}", normal_style))
        
        content.append(Spacer(1, 0.1*inch))
    
    # =========================================================================
    # 8. PLAN DE TRATAMIENTO
    # =========================================================================
    plan = historia_data.get('plan_tratamiento', [])
    if plan:
        content.append(Paragraph("8. PLAN DE TRATAMIENTO", heading_style))
        content.append(Spacer(1, 0.1*inch))
        
        if isinstance(plan, list):
            for p in plan:
                if p.get('indicaciones_medicas'):
                    content.append(Paragraph("<b>Indicaciones Médicas:</b>", subheading_style))
                    content.append(Paragraph(str(p.get('indicaciones_medicas', '')), normal_style))
                
                if p.get('recomendaciones_entrenamiento'):
                    content.append(Paragraph("<b>Recomendaciones de Entrenamiento:</b>", subheading_style))
                    content.append(Paragraph(str(p.get('recomendaciones_entrenamiento', '')), normal_style))
                
                if p.get('plan_seguimiento'):
                    content.append(Paragraph("<b>Plan de Seguimiento:</b>", subheading_style))
                    content.append(Paragraph(str(p.get('plan_seguimiento', '')), normal_style))
        
        content.append(Spacer(1, 0.1*inch))
    
    # =========================================================================
    # 9. REMISIONES A ESPECIALISTAS
    # =========================================================================
    if historia_data.get('remisiones_especialistas'):
        content.append(Paragraph("9. REMISIONES A ESPECIALISTAS", heading_style))
        content.append(Spacer(1, 0.1*inch))
        
        for rem in historia_data.get('remisiones_especialistas', []):
            especialista = rem.get('especialista', '')
            motivo = rem.get('motivo', '')
            prioridad = rem.get('prioridad', 'Normal')
            fecha = rem.get('fecha_remision', '')
            
            prioridad_color = "red" if prioridad == 'Urgente' else "blue"
            texto = f"<b>• {especialista}</b> - <font color='{prioridad_color}'>[{prioridad}]</font>"
            content.append(Paragraph(texto, normal_style))
            content.append(Paragraph(f"  Motivo: {motivo}", normal_style))
            if fecha:
                content.append(Paragraph(f"  Fecha: {fecha}", normal_style))
        
        content.append(Spacer(1, 0.1*inch))
    
    # =========================================================================
    # FOOTER
    # =========================================================================
    content.append(Spacer(1, 0.3*inch))
    
    # Línea de firma
    content.append(Paragraph("_" * 50, ParagraphStyle('Line', alignment=TA_CENTER)))
    content.append(Paragraph("<b>Firma del Profesional de Salud</b>", ParagraphStyle('Firma', alignment=TA_CENTER, fontSize=9)))
    content.append(Spacer(1, 0.2*inch))
    
    footer_style = ParagraphStyle(
        'Footer',
        parent=styles['Normal'],
        fontSize=7,
        textColor=colors.HexColor('#6b7280'),
        alignment=TA_CENTER
    )
    
    footer_text = f"""
    <b>INDERHUILA - Instituto Departamental de Recreación y Deportes del Huila</b><br/>
    Documento generado automáticamente el {datetime.now().strftime('%d/%m/%Y a las %H:%M:%S')}<br/>
    Este documento tiene valor legal y debe ser archivado según normativa vigente.
    """
    content.append(Paragraph(footer_text, footer_style))
    
    # Construir PDF
    doc.build(content)
    pdf_buffer.seek(0)
    
    return pdf_buffer


def generar_texto_whatsapp(historia_data: dict, deportista_data: dict) -> str:
    """
    Genera un texto estructurado para enviar por WhatsApp
    
    Args:
        historia_data: Datos de la historia clínica
        deportista_data: Datos del deportista
    
    Returns:
        str: Texto formateado para WhatsApp
    """
    texto = []
    texto.append("🏥 *HISTORIA CLÍNICA DEPORTIVA*")
    texto.append("_INDERHUILA_")
    texto.append("")
    
    # Datos del deportista
    texto.append("👤 *DATOS DEL DEPORTISTA*")
    texto.append(f"• Nombre: {deportista_data.get('nombres', '')} {deportista_data.get('apellidos', '')}")
    texto.append(f"• Documento: {deportista_data.get('numero_documento', 'N/A')}")
    texto.append(f"• Fecha: {historia_data.get('fecha_apertura', 'N/A')}")
    texto.append("")
    
    # Motivo de consulta
    motivo = historia_data.get('motivo_consulta_enfermedad')
    if motivo and motivo.get('motivo_consulta'):
        texto.append("📋 *MOTIVO DE CONSULTA*")
        texto.append(f"{motivo.get('motivo_consulta', '')}")
        texto.append("")
    
    # Signos vitales
    signos = historia_data.get('signos_vitales', [])
    if signos:
        sv = signos[0] if isinstance(signos, list) and len(signos) > 0 else signos
        if sv:
            texto.append("💓 *SIGNOS VITALES*")
            if sv.get('peso_kg'):
                texto.append(f"• Peso: {sv.get('peso_kg')} kg")
            if sv.get('estatura_cm'):
                texto.append(f"• Estatura: {sv.get('estatura_cm')} cm")
            if sv.get('imc'):
                texto.append(f"• IMC: {sv.get('imc')}")
            if sv.get('presion_arterial_sistolica'):
                texto.append(f"• TA: {sv.get('presion_arterial_sistolica')}/{sv.get('presion_arterial_diastolica')} mmHg")
            if sv.get('frecuencia_cardiaca_lpm'):
                texto.append(f"• FC: {sv.get('frecuencia_cardiaca_lpm')} lpm")
            texto.append("")
    
    # Diagnósticos
    if historia_data.get('diagnosticos'):
        texto.append("🔬 *DIAGNÓSTICOS*")
        for diag in historia_data.get('diagnosticos', []):
            nombre = diag.get('nombre_enfermedad', '')
            codigo = diag.get('codigo_cie11', '')
            texto.append(f"• {nombre} ({codigo})" if codigo else f"• {nombre}")
        texto.append("")
    
    # Plan de tratamiento
    plan = historia_data.get('plan_tratamiento', [])
    if plan:
        texto.append("💊 *PLAN DE TRATAMIENTO*")
        for p in (plan if isinstance(plan, list) else [plan]):
            if p.get('indicaciones_medicas'):
                texto.append(f"{p.get('indicaciones_medicas', '')[:200]}...")
        texto.append("")
    
    # Remisiones
    if historia_data.get('remisiones_especialistas'):
        texto.append("👨‍⚕️ *REMISIONES*")
        for rem in historia_data.get('remisiones_especialistas', []):
            prioridad = "🚨" if rem.get('prioridad') == 'Urgente' else "📌"
            texto.append(f"{prioridad} {rem.get('especialista', '')} - {rem.get('motivo', '')}")
        texto.append("")
    
    texto.append("_Para más información, comuníquese con INDERHUILA_")
    
    return "\n".join(texto)