"""
Servicio para generar documentos médicos en PDF
"""
from io import BytesIO
from reportlab.lib.pagesizes import letter, A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_JUSTIFY
from datetime import datetime


def generar_documento_historia_clinica(historia_data: dict, deportista_data: dict):
    """
    Genera un documento PDF de historia clínica médica
    
    Args:
        historia_data: Datos de la historia clínica
        deportista_data: Datos del deportista
    
    Returns:
        BytesIO: PDF generado en bytes
    """
    # Crear documento en memoria
    pdf_buffer = BytesIO()
    doc = SimpleDocTemplate(pdf_buffer, pagesize=letter, topMargin=0.5*inch, bottomMargin=0.5*inch)
    
    # Estilos
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=18,
        textColor=colors.HexColor('#1e40af'),
        spaceAfter=12,
        alignment=TA_CENTER,
        fontName='Helvetica-Bold'
    )
    
    heading_style = ParagraphStyle(
        'CustomHeading',
        parent=styles['Heading2'],
        fontSize=12,
        textColor=colors.HexColor('#1e40af'),
        spaceAfter=8,
        spaceBefore=8,
        fontName='Helvetica-Bold'
    )
    
    normal_style = ParagraphStyle(
        'CustomNormal',
        parent=styles['Normal'],
        fontSize=10,
        alignment=TA_JUSTIFY,
        spaceAfter=6
    )
    
    # Contenido del documento
    content = []
    
    # Header
    content.append(Paragraph("HISTORIA CLÍNICA DEPORTIVA", title_style))
    content.append(Spacer(1, 0.2*inch))
    
    # Datos del deportista
    deportista_info = f"""
    <b>Deportista:</b> {deportista_data.get('nombres', '')} {deportista_data.get('apellidos', '')}<br/>
    <b>Documento:</b> {deportista_data.get('numero_documento', '')}<br/>
    <b>Fecha:</b> {datetime.now().strftime('%d/%m/%Y')}<br/>
    """
    content.append(Paragraph(deportista_info, normal_style))
    content.append(Spacer(1, 0.2*inch))
    
    # PASO 1: Evaluación
    if historia_data.get('tipoCita') or historia_data.get('motivoConsulta'):
        content.append(Paragraph("1. EVALUACIÓN INICIAL", heading_style))
        eval_info = f"""
        <b>Tipo de Cita:</b> {historia_data.get('tipoCita', 'N/A')}<br/>
        <b>Motivo de Consulta:</b> {historia_data.get('motivoConsulta', 'N/A')}<br/>
        <b>Enfermedad Actual:</b> {historia_data.get('enfermedadActual', 'N/A')}<br/>
        """
        content.append(Paragraph(eval_info, normal_style))
        content.append(Spacer(1, 0.15*inch))
    
    # PASO 2: Antecedentes
    if historia_data.get('antecedentesPersonales') or historia_data.get('lesionesDeportivas'):
        content.append(Paragraph("2. ANTECEDENTES MÉDICOS", heading_style))
        
        if historia_data.get('antecedentesPersonales'):
            content.append(Paragraph("<b>Antecedentes Personales:</b>", normal_style))
            for ant in historia_data.get('antecedentesPersonales', []):
                content.append(Paragraph(
                    f"• {ant.get('nombreEnfermedad', '')} ({ant.get('codigoCIE11', '')}) - {ant.get('observaciones', '')}",
                    normal_style
                ))
        
        if historia_data.get('lesionesDeportivas'):
            content.append(Paragraph(
                f"<b>Lesiones Deportivas:</b> {historia_data.get('descripcionLesiones', 'N/A')}",
                normal_style
            ))
        
        if historia_data.get('cirugiasPrevias'):
            content.append(Paragraph(
                f"<b>Cirugías Previas:</b> {historia_data.get('detalleCirugias', 'N/A')}",
                normal_style
            ))
        
        if historia_data.get('tieneAlergias'):
            content.append(Paragraph(
                f"<b>Alergias:</b> {historia_data.get('alergias', 'N/A')}",
                normal_style
            ))
        
        if historia_data.get('tomaMedicacion'):
            content.append(Paragraph(
                f"<b>Medicación Actual:</b> {historia_data.get('medicacionActual', 'N/A')}",
                normal_style
            ))
        
        if historia_data.get('vacunas'):
            vacunas_str = ', '.join(historia_data.get('vacunas', []))
            content.append(Paragraph(f"<b>Vacunas:</b> {vacunas_str}", normal_style))
        
        content.append(Spacer(1, 0.15*inch))
    
    # PASO 3: Revisión por Sistemas
    if historia_data.get('revisionSistemas'):
        content.append(Paragraph("3. REVISIÓN POR SISTEMAS", heading_style))
        rev = historia_data.get('revisionSistemas', {})
        sistemas_text = f"""
        Cardiovascular: {rev.get('cardiovascular', {}).get('estado', 'N/A')}<br/>
        Respiratorio: {rev.get('respiratorio', {}).get('estado', 'N/A')}<br/>
        Digestivo: {rev.get('digestivo', {}).get('estado', 'N/A')}<br/>
        Neurológico: {rev.get('neurologico', {}).get('estado', 'N/A')}<br/>
        Musculoesquelético: {rev.get('musculoesqueletico', {}).get('estado', 'N/A')}<br/>
        """
        content.append(Paragraph(sistemas_text, normal_style))
        content.append(Spacer(1, 0.15*inch))
    
    # PASO 4: Signos Vitales
    if historia_data.get('peso') or historia_data.get('frecuenciaCardiaca'):
        content.append(Paragraph("4. EXPLORACIÓN FÍSICA - SIGNOS VITALES", heading_style))
        signos_text = f"""
        Estatura: {historia_data.get('estatura', 'N/A')} cm<br/>
        Peso: {historia_data.get('peso', 'N/A')} kg<br/>
        Frecuencia Cardíaca: {historia_data.get('frecuenciaCardiaca', 'N/A')} lpm<br/>
        Presión Arterial: {historia_data.get('presionArterial', 'N/A')}<br/>
        Frecuencia Respiratoria: {historia_data.get('frecuenciaRespiratoria', 'N/A')} rpm<br/>
        Temperatura: {historia_data.get('temperatura', 'N/A')} °C<br/>
        Saturación O2: {historia_data.get('saturacionOxigeno', 'N/A')}%<br/>
        """
        content.append(Paragraph(signos_text, normal_style))
        content.append(Spacer(1, 0.15*inch))
    
    # PASO 5: Pruebas Complementarias
    if historia_data.get('ayudasDiagnosticas'):
        content.append(Paragraph("5. PRUEBAS COMPLEMENTARIAS", heading_style))
        for prueba in historia_data.get('ayudasDiagnosticas', []):
            content.append(Paragraph(
                f"<b>{prueba.get('nombrePrueba', '')}</b> ({prueba.get('categoria', '')})<br/>"
                f"Resultado: {prueba.get('resultado', 'N/A')}",
                normal_style
            ))
        content.append(Spacer(1, 0.15*inch))
    
    # PASO 6: Diagnóstico
    if historia_data.get('diagnosticos'):
        content.append(Paragraph("6. DIAGNÓSTICO", heading_style))
        
        if historia_data.get('analisisObjetivoDiagnostico'):
            content.append(Paragraph(
                f"<b>Análisis Objetivo:</b> {historia_data.get('analisisObjetivoDiagnostico', '')}",
                normal_style
            ))
        
        if historia_data.get('impresionDiagnostica'):
            content.append(Paragraph(
                f"<b>Impresión Diagnóstica:</b> {historia_data.get('impresionDiagnostica', '')}",
                normal_style
            ))
        
        content.append(Paragraph("<b>Diagnósticos Clínicos:</b>", normal_style))
        for diag in historia_data.get('diagnosticos', []):
            content.append(Paragraph(
                f"• {diag.get('nombre', '')} (CIE-11: {diag.get('codigo', '')}) - {diag.get('observaciones', '')}",
                normal_style
            ))
        content.append(Spacer(1, 0.15*inch))
    
    # PASO 7: Plan de Tratamiento
    if historia_data.get('indicacionesMedicas') or historia_data.get('remisionesEspecialistas'):
        content.append(Paragraph("7. PLAN DE TRATAMIENTO", heading_style))
        
        if historia_data.get('indicacionesMedicas'):
            content.append(Paragraph(
                f"<b>Indicaciones Médicas:</b><br/>{historia_data.get('indicacionesMedicas', '')}",
                normal_style
            ))
        
        if historia_data.get('recomendacionesEntrenamiento'):
            content.append(Paragraph(
                f"<b>Recomendaciones de Entrenamiento:</b><br/>{historia_data.get('recomendacionesEntrenamiento', '')}",
                normal_style
            ))
        
        if historia_data.get('planSeguimiento'):
            content.append(Paragraph(
                f"<b>Plan de Seguimiento:</b><br/>{historia_data.get('planSeguimiento', '')}",
                normal_style
            ))
        
        if historia_data.get('remisionesEspecialistas'):
            content.append(Paragraph("<b>Remisiones a Especialistas:</b>", normal_style))
            for rem in historia_data.get('remisionesEspecialistas', []):
                prioridad_badge = "🚑 URGENTE" if rem.get('prioridad') == 'Urgente' else "👥 Normal"
                content.append(Paragraph(
                    f"• {rem.get('especialista', '')} - {prioridad_badge}<br/>"
                    f"  Motivo: {rem.get('motivo', '')}<br/>"
                    f"  Fecha: {rem.get('fechaRemision', 'N/A')}",
                    normal_style
                ))
        
        content.append(Spacer(1, 0.15*inch))
    
    # Footer
    content.append(Spacer(1, 0.3*inch))
    footer_text = f"""
    <font size="8">
    <b>Documento generado automáticamente por Sistema INDER</b><br/>
    Fecha de generación: {datetime.now().strftime('%d/%m/%Y %H:%M:%S')}<br/>
    Este documento tiene valor legal y debe ser archivado según normativa vigente.
    </font>
    """
    content.append(Paragraph(footer_text, normal_style))
    
    # Construir PDF
    doc.build(content)
    pdf_buffer.seek(0)
    
    return pdf_buffer
