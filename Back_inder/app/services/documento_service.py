"""
Servicio para generar documentos médicos en PDF
INDERHUILA - Instituto Departamental de Recreación y Deportes del Huila
WAP Enterprise SAS
"""
from io import BytesIO
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    Image, HRFlowable, KeepTogether
)
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_JUSTIFY
from datetime import datetime
import base64 as _b64
_LOGO_B64 = "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"

# =============================================================================
# PALETA
# =============================================================================
C_AZUL      = colors.HexColor('#1F4788')
C_AZUL_CLR  = colors.HexColor('#EEF3FB')
C_AZUL_BRD  = colors.HexColor('#BFDBFE')
C_GRIS_TXT  = colors.HexColor('#374151')
C_GRIS_BG   = colors.HexColor('#F9FAFB')
C_GRIS_BRD  = colors.HexColor('#E5E7EB')
C_GRIS_LBL  = colors.HexColor('#6B7280')
C_VERDE_BG  = colors.HexColor('#F0FDF4')
C_VERDE_BRD = colors.HexColor('#86EFAC')
C_AMBAR_BG  = colors.HexColor('#FEFCE8')
C_ROJO_BG   = colors.HexColor('#FEF2F2')
C_BLANCO    = colors.white


# =============================================================================
# ESTILOS
# =============================================================================
def _estilos():
    base = getSampleStyleSheet()
    def S(name, **kw):
        return ParagraphStyle(name, parent=base['Normal'], **kw)
    return {
        'titulo':   S('Titulo',   fontSize=17, textColor=C_BLANCO, alignment=TA_CENTER,
                       fontName='Helvetica-Bold', spaceAfter=2, leading=20),
        'subtitulo':S('Subtitulo',fontSize=9,  textColor=colors.HexColor('#BFDBFE'),
                       alignment=TA_CENTER, spaceAfter=0, leading=13),
        'seccion':  S('Seccion',  fontSize=10, textColor=C_BLANCO,
                       fontName='Helvetica-Bold', spaceAfter=0, leading=14),
        'label':    S('Label',    fontSize=7.5,textColor=C_GRIS_LBL, spaceAfter=1, leading=10),
        'valor':    S('Valor',    fontSize=9,  textColor=C_GRIS_TXT,
                       fontName='Helvetica-Bold', spaceAfter=2, leading=12),
        'normal':   S('Normal2',  fontSize=9,  textColor=C_GRIS_TXT,
                       alignment=TA_JUSTIFY, spaceAfter=3, leading=13),
        'small':    S('Small',    fontSize=8,  textColor=C_GRIS_TXT, spaceAfter=2, leading=11),
        'fc':       S('FirmaC',   fontSize=8,  textColor=C_GRIS_LBL, alignment=TA_CENTER, leading=11),
        'fn':       S('FirmaN',   fontSize=9,  textColor=C_GRIS_TXT,
                       fontName='Helvetica-Bold', alignment=TA_CENTER, leading=12),
        'nota':     S('Nota',     fontSize=7,  textColor=C_GRIS_LBL, alignment=TA_CENTER, leading=10),
    }


# =============================================================================
# HELPERS
# =============================================================================
def _v(v, fb='—'):
    """Valor seguro con fallback."""
    if v is None or str(v).strip() in ('', 'None', 'N/A'):
        return fb
    return str(v).strip()


def _hdr(texto, s, W):
    """Encabezado azul de sección."""
    t = Table([[Paragraph(f'  {texto}', s['seccion'])]], colWidths=[W])
    t.setStyle(TableStyle([
        ('BACKGROUND',    (0,0),(-1,-1), C_AZUL),
        ('TOPPADDING',    (0,0),(-1,-1), 7),
        ('BOTTOMPADDING', (0,0),(-1,-1), 7),
        ('LEFTPADDING',   (0,0),(-1,-1), 8),
        ('RIGHTPADDING',  (0,0),(-1,-1), 8),
    ]))
    return t


def _img_b64(b64_str, max_w=1.6*inch, max_h=0.75*inch):
    """Convierte base64 a Image de ReportLab."""
    try:
        data = b64_str
        if ',' in data:
            data = data.split(',', 1)[1]
        raw = _b64.b64decode(data)
        buf = BytesIO(raw)
        img = Image(buf)
        ratio = min(max_w / img.imageWidth, max_h / img.imageHeight)
        img.drawWidth  = img.imageWidth  * ratio
        img.drawHeight = img.imageHeight * ratio
        return img
    except Exception:
        return None


def _lista(items, campo, s, extras=None, fb='Sin registros'):
    """Lista de bullets para antecedentes."""
    out = []
    if not items:
        out.append(Paragraph(f'  {fb}', s['small']))
        return out
    for item in items:
        txt = _v(item.get(campo, ''), fb)
        extra = ''
        if extras:
            for cf, pre in extras:
                v = item.get(cf)
                if v and str(v).strip() and str(v).strip() != txt:
                    extra += f' — {pre}{_v(v)}'
        out.append(Paragraph(f'  • {txt}{extra}', s['small']))
    return out


def _t2col(celda_izq, celda_der, W):
    """Tabla de dos columnas iguales."""
    col = W / 2 - 0.05*inch
    t = Table([[celda_izq, celda_der]], colWidths=[col, col])
    t.setStyle(TableStyle([
        ('VALIGN',        (0,0),(-1,-1), 'TOP'),
        ('TOPPADDING',    (0,0),(-1,-1), 5),
        ('BOTTOMPADDING', (0,0),(-1,-1), 5),
        ('LEFTPADDING',   (0,0),(-1,-1), 7),
        ('RIGHTPADDING',  (0,0),(-1,-1), 7),
        ('BACKGROUND',    (0,0),(0,-1),  C_AZUL_CLR),
        ('BACKGROUND',    (1,0),(1,-1),  C_GRIS_BG),
        ('GRID',          (0,0),(-1,-1), 0.4, C_GRIS_BRD),
    ]))
    return t


# =============================================================================
# FUNCIÓN PRINCIPAL
# =============================================================================
def generar_documento_historia_clinica(
    historia_data: dict,
    deportista_data: dict,
    firma_imagen: str = None,
    nombre_medico: str = None,
    medico_data: dict = None,
):
    """
    Genera PDF profesional de historia clínica deportiva.
    Acepta firma_imagen/nombre_medico (formato original) o medico_data (formato nuevo).
    """
    # Normalizar datos del médico — compatibilidad con ambos formatos
    if medico_data:
        nombre_medico = medico_data.get('nombre_completo') or nombre_medico
        firma_imagen  = medico_data.get('firma_base64')    or firma_imagen
        reg_medico    = _v(medico_data.get('registro_medico') or medico_data.get('numero_registro'))
    else:
        reg_medico = '—'

    pdf_buffer = BytesIO()
    W = 7.3*inch

    doc = SimpleDocTemplate(
        pdf_buffer, pagesize=letter,
        topMargin=0.45*inch, bottomMargin=0.5*inch,
        leftMargin=0.6*inch, rightMargin=0.6*inch,
    )
    s   = _estilos()
    out = []

    # =========================================================================
    # BANNER
    # =========================================================================

    fecha_doc = datetime.now().strftime('%d/%m/%Y  %H:%M')
    out.append(_banner(
        'HISTORIA CLÍNICA DEPORTIVA',
        'INDERHUILA — Instituto Departamental de Recreación y Deportes del Huila',
        fecha_doc, s, W
    ))
    out.append(Spacer(1, 0.14*inch))

    # =========================================================================
    # DATOS DEL DEPORTISTA
    # =========================================================================
    nombres  = f"{_v(deportista_data.get('nombres'))} {_v(deportista_data.get('apellidos'))}"
    doc_num  = _v(deportista_data.get('numero_documento'))
    fnac     = _v(deportista_data.get('fecha_nacimiento'))
    tel      = _v(deportista_data.get('telefono'))
    email    = _v(deportista_data.get('email'))
    deporte  = _v(deportista_data.get('deporte') or deportista_data.get('tipo_deporte'))
    eps      = _v(deportista_data.get('eps'))
    gsang    = _v(deportista_data.get('grupo_sanguineo'))

    edad_txt = '—'
    try:
        fn = datetime.strptime(fnac[:10], '%Y-%m-%d')
        edad_txt = f"{(datetime.now()-fn).days//365} años"
    except Exception:
        pass

    dep_rows = [
        [Paragraph('Nombre completo',  s['label']), Paragraph(nombres,           s['valor']),
         Paragraph('N° Documento',     s['label']), Paragraph(doc_num,           s['valor']),
         Paragraph('Fecha nacimiento', s['label']), Paragraph(fnac[:10] if fnac!='—' else '—', s['valor'])],
        [Paragraph('Edad',             s['label']), Paragraph(edad_txt,          s['valor']),
         Paragraph('Teléfono',         s['label']), Paragraph(tel,               s['valor']),
         Paragraph('Correo',           s['label']), Paragraph(email,             s['valor'])],
        [Paragraph('Disciplina',       s['label']), Paragraph(deporte,           s['valor']),
         Paragraph('Grupo sanguíneo',  s['label']), Paragraph(gsang,             s['valor']),
         Paragraph('EPS',              s['label']), Paragraph(eps,               s['valor'])],
    ]
    dep_t = Table(dep_rows, colWidths=[1.3*inch,1.5*inch,1.1*inch,1.5*inch,1.1*inch,1.4*inch])
    dep_t.setStyle(TableStyle([
        ('BACKGROUND',    (0,0),(-1,-1), C_AZUL_CLR),
        ('GRID',          (0,0),(-1,-1), 0.4, C_AZUL_BRD),
        ('TOPPADDING',    (0,0),(-1,-1), 5),
        ('BOTTOMPADDING', (0,0),(-1,-1), 5),
        ('LEFTPADDING',   (0,0),(-1,-1), 8),
        ('RIGHTPADDING',  (0,0),(-1,-1), 8),
        ('VALIGN',        (0,0),(-1,-1), 'TOP'),
    ]))
    out.append(KeepTogether([_hdr('DATOS DEL DEPORTISTA', s, W), Spacer(1,0.07*inch), dep_t, Spacer(1,0.12*inch)]))

    # =========================================================================
    # MOTIVO DE CONSULTA
    # =========================================================================
    mc = historia_data.get('motivo_consulta_enfermedad') or {}
    if isinstance(mc, list):
        mc = mc[0] if mc else {}

    motivo   = _v(mc.get('motivo_consulta')       or historia_data.get('motivo_consulta'))
    enf      = _v(mc.get('enfermedad_actual')      or mc.get('sintomas_principales') or historia_data.get('enfermedad_actual'))
    tcita    = _v(mc.get('tipo_cita')              or historia_data.get('tipo_cita'))
    duracion = _v(mc.get('duracion_sintomas'))
    evol     = _v(mc.get('evolucion'))
    factor   = _v(mc.get('factor_desencadenante'))
    meds_p   = _v(mc.get('medicamentos_previos'))

    mc_rows = [
        [Paragraph('Tipo de cita',        s['label']), Paragraph(tcita,   s['normal']),
         Paragraph('Duración síntomas',   s['label']), Paragraph(duracion, s['normal'])],
        [Paragraph('Motivo de consulta',  s['label']), Paragraph(motivo,   s['normal']),
         Paragraph('Evolución',           s['label']), Paragraph(evol,     s['normal'])],
        [Paragraph('Enfermedad actual',   s['label']), Paragraph(enf,      s['normal']),
         Paragraph('Factor desencadenante',s['label']),Paragraph(factor,   s['normal'])],
    ]
    if meds_p != '—':
        mc_rows.append([
            Paragraph('Medicamentos previos', s['label']), Paragraph(meds_p, s['normal']),
            Paragraph('', s['label']), Paragraph('', s['normal']),
        ])
    mc_t = Table(mc_rows, colWidths=[1.3*inch,2.35*inch,1.3*inch,2.35*inch])
    mc_t.setStyle(TableStyle([
        ('BACKGROUND',    (0,0),(0,-1), C_AZUL_CLR),
        ('BACKGROUND',    (2,0),(2,-1), C_AZUL_CLR),
        ('BACKGROUND',    (1,0),(1,-1), C_GRIS_BG),
        ('BACKGROUND',    (3,0),(3,-1), C_GRIS_BG),
        ('GRID',          (0,0),(-1,-1), 0.4, C_GRIS_BRD),
        ('TOPPADDING',    (0,0),(-1,-1), 5),
        ('BOTTOMPADDING', (0,0),(-1,-1), 5),
        ('LEFTPADDING',   (0,0),(-1,-1), 8),
        ('RIGHTPADDING',  (0,0),(-1,-1), 8),
        ('VALIGN',        (0,0),(-1,-1), 'TOP'),
    ]))
    out.append(KeepTogether([_hdr('MOTIVO DE CONSULTA', s, W), Spacer(1,0.07*inch), mc_t, Spacer(1,0.12*inch)]))

    # =========================================================================
    # ANTECEDENTES
    # =========================================================================
    ants_p   = historia_data.get('antecedentes_personales', [])
    ants_f   = historia_data.get('antecedentes_familiares', [])
    lesiones = historia_data.get('lesiones_deportivas', [])
    cirugias = historia_data.get('cirugias_previas', [])
    alergias = historia_data.get('alergias', [])
    meds     = historia_data.get('medicaciones', [])
    vacunas  = historia_data.get('vacunas_administradas', [])

    blq = [_hdr('ANTECEDENTES', s, W), Spacer(1,0.07*inch)]

    # Fila 1: personales | familiares
    blq.append(_t2col(
        [Paragraph('<b>Personales</b>', s['small'])] + _lista(
            ants_p, 'nombre_enfermedad', s,
            extras=[('codigo_cie11','CIE-11: '),('observaciones','')],
            fb='Sin antecedentes personales'),
        [Paragraph('<b>Familiares</b>', s['small'])] + _lista(
            ants_f, 'nombre_enfermedad', s,
            extras=[('tipo_familiar','Parentesco: '),('codigo_cie11','CIE-11: ')],
            fb='Sin antecedentes familiares'),
        W))
    blq.append(Spacer(1,0.05*inch))

    # Fila 2: lesiones | cirugías
    blq.append(_t2col(
        [Paragraph('<b>Lesiones deportivas</b>', s['small'])] + _lista(
            lesiones,
            'descripcion', s,
            extras=[('tipo_lesion',''),('fecha_ultima_lesion','Fecha: '),('observaciones','')],
            fb='Sin lesiones registradas'),
        [Paragraph('<b>Cirugías previas</b>', s['small'])] + _lista(
            cirugias, 'tipo_cirugia', s,
            extras=[('fecha_cirugia','Fecha: '),('observaciones','')],
            fb='Sin cirugías registradas'),
        W))
    blq.append(Spacer(1,0.05*inch))

    # Fila 3: alergias | medicación
    blq.append(_t2col(
        [Paragraph('<b>Alergias</b>', s['small'])] + _lista(
            alergias, 'tipo_alergia', s,
            extras=[('descripcion',''),('reaccion','Reacción: ')],
            fb='Sin alergias registradas'),
        [Paragraph('<b>Medicación actual</b>', s['small'])] + _lista(
            meds,
            'nombre_medicacion', s,
            extras=[('nombre_medicamento',''),('dosis','Dosis: '),('frecuencia','Freq: ')],
            fb='Sin medicación actual'),
        W))

    if vacunas:
        blq.append(Spacer(1,0.05*inch))
        vac_txt = ', '.join([_v(v.get('nombre_vacuna') or v.get('vacuna','')) for v in vacunas])
        blq.append(Paragraph(f'  <b>Vacunas:</b> {vac_txt}', s['small']))

    blq.append(Spacer(1,0.12*inch))
    out.append(KeepTogether(blq))

    # =========================================================================
    # REVISIÓN POR SISTEMAS
    # =========================================================================
    rev_raw = historia_data.get('revision_sistemas', [])
    if isinstance(rev_raw, dict):
        rev_raw = [rev_raw]

    filas_rev = []
    if rev_raw:
        primer = rev_raw[0] if rev_raw else {}
        if 'sistema_nombre' in primer:
            # Formato lista objetos con sistema_nombre/estado/observaciones
            for r in rev_raw:
                nom = _v(r.get('sistema_nombre'))
                est = _v(r.get('estado'))
                obs = _v(r.get('observaciones'), '')
                txt = est + (f' — {obs}' if obs else '')
                filas_rev.append([Paragraph(nom, s['label']), Paragraph(txt, s['small'])])
        else:
            # Formato dict plano (sistema_cardiovascular, etc.)
            MAPS = [
                ('cardiovascular','Cardiovascular'),('respiratorio','Respiratorio'),
                ('digestivo','Digestivo'),('neurologico','Neurológico'),
                ('genitourinario','Genitourinario'),('musculoesqueletico','Musculoesquelético'),
                ('piel_faneras','Piel y Faneras'),('endocrino','Endocrino'),('otros','Otros'),
            ]
            for key, lbl in MAPS:
                v = primer.get(key) or primer.get(f'sistema_{key}')
                if v and str(v).strip():
                    filas_rev.append([Paragraph(lbl, s['label']), Paragraph(_v(v), s['small'])])

    if filas_rev:
        rev_t = Table(filas_rev, colWidths=[1.4*inch,5.9*inch])
        rev_t.setStyle(TableStyle([
            ('BACKGROUND',    (0,0),(0,-1), C_AZUL_CLR),
            ('BACKGROUND',    (1,0),(1,-1), C_GRIS_BG),
            ('GRID',          (0,0),(-1,-1), 0.4, C_GRIS_BRD),
            ('TOPPADDING',    (0,0),(-1,-1), 4),
            ('BOTTOMPADDING', (0,0),(-1,-1), 4),
            ('LEFTPADDING',   (0,0),(-1,-1), 8),
            ('RIGHTPADDING',  (0,0),(-1,-1), 8),
            ('VALIGN',        (0,0),(-1,-1), 'TOP'),
        ]))
        out.append(KeepTogether([_hdr('REVISIÓN POR SISTEMAS', s, W), Spacer(1,0.07*inch), rev_t, Spacer(1,0.12*inch)]))

    # =========================================================================
    # SIGNOS VITALES
    # =========================================================================
    sv_raw = historia_data.get('signos_vitales', [])
    sv = (sv_raw[0] if isinstance(sv_raw, list) and sv_raw
          else sv_raw if isinstance(sv_raw, dict) else {})

    if sv:
        def svv(k): return _v(sv.get(k))
        sv_data = [
            [Paragraph('Estatura',         s['label']), Paragraph(f"{svv('estatura_cm')} cm",  s['valor']),
             Paragraph('Peso',             s['label']), Paragraph(f"{svv('peso_kg')} kg",      s['valor']),
             Paragraph('IMC',              s['label']), Paragraph(svv('imc'),                  s['valor']),
             Paragraph('Temperatura',      s['label']), Paragraph(f"{svv('temperatura_celsius')} °C", s['valor'])],
            [Paragraph('Presión arterial', s['label']),
             Paragraph(f"{svv('presion_arterial_sistolica')}/{svv('presion_arterial_diastolica')} mmHg", s['valor']),
             Paragraph('Frec. cardíaca',   s['label']), Paragraph(f"{svv('frecuencia_cardiaca_lpm')} lpm",     s['valor']),
             Paragraph('Frec. resp.',      s['label']), Paragraph(f"{svv('frecuencia_respiratoria_rpm')} rpm", s['valor']),
             Paragraph('Sat. O₂',          s['label']), Paragraph(f"{svv('saturacion_oxigeno_percent')} %",    s['valor'])],
        ]
        sv_t = Table(sv_data, colWidths=[1.15*inch,0.8*inch,0.7*inch,0.8*inch,0.55*inch,0.65*inch,0.8*inch,0.8*inch])
        sv_t.setStyle(TableStyle([
            ('BACKGROUND',    (0,0),(-1,-1), C_VERDE_BG),
            ('GRID',          (0,0),(-1,-1), 0.4, C_VERDE_BRD),
            ('TOPPADDING',    (0,0),(-1,-1), 5),
            ('BOTTOMPADDING', (0,0),(-1,-1), 5),
            ('LEFTPADDING',   (0,0),(-1,-1), 6),
            ('RIGHTPADDING',  (0,0),(-1,-1), 6),
            ('VALIGN',        (0,0),(-1,-1), 'MIDDLE'),
        ]))
        out.append(KeepTogether([_hdr('SIGNOS VITALES', s, W), Spacer(1,0.07*inch), sv_t, Spacer(1,0.12*inch)]))

    # =========================================================================
    # EXPLORACIÓN FÍSICA POR SISTEMAS
    # =========================================================================
    exp_raw = historia_data.get('exploracion_fisica_sistemas')
    if isinstance(exp_raw, list):
        exp_raw = exp_raw[0] if exp_raw else None

    if exp_raw and isinstance(exp_raw, dict):
        SIST_EXP = [
            ('sistema_cardiovascular',     'Cardiovascular'),
            ('sistema_respiratorio',       'Respiratorio'),
            ('sistema_digestivo',          'Digestivo'),
            ('sistema_neurologico',        'Neurológico'),
            ('sistema_genitourinario',     'Genitourinario'),
            ('sistema_musculoesqueletico', 'Musculoesquelético'),
            ('sistema_integumentario',     'Piel / Faneras'),
            ('sistema_endocrino',          'Endocrino'),
            ('cabeza_cuello',              'Cabeza y cuello'),
            ('extremidades',               'Extremidades'),
            ('observaciones_generales',    'Observaciones generales'),
        ]
        filas_exp = [
            [Paragraph(lbl, s['label']), Paragraph(_v(exp_raw.get(key)), s['small'])]
            for key, lbl in SIST_EXP
            if exp_raw.get(key) and str(exp_raw.get(key)).strip()
        ]
        if filas_exp:
            exp_t = Table(filas_exp, colWidths=[1.4*inch,5.9*inch])
            exp_t.setStyle(TableStyle([
                ('BACKGROUND',    (0,0),(0,-1), C_AZUL_CLR),
                ('BACKGROUND',    (1,0),(1,-1), C_GRIS_BG),
                ('GRID',          (0,0),(-1,-1), 0.4, C_GRIS_BRD),
                ('TOPPADDING',    (0,0),(-1,-1), 4),
                ('BOTTOMPADDING', (0,0),(-1,-1), 4),
                ('LEFTPADDING',   (0,0),(-1,-1), 8),
                ('RIGHTPADDING',  (0,0),(-1,-1), 8),
                ('VALIGN',        (0,0),(-1,-1), 'TOP'),
            ]))
            out.append(KeepTogether([_hdr('EXPLORACIÓN FÍSICA POR SISTEMAS', s, W), Spacer(1,0.07*inch), exp_t, Spacer(1,0.12*inch)]))

    # =========================================================================
    # DIAGNÓSTICOS
    # =========================================================================
    diagnosticos = historia_data.get('diagnosticos', [])
    if diagnosticos:
        hdr_row = [
            Paragraph('<b>CIE-11</b>',       s['label']),
            Paragraph('<b>Diagnóstico</b>',   s['label']),
            Paragraph('<b>Tipo</b>',          s['label']),
            Paragraph('<b>Observaciones</b>', s['label']),
        ]
        rows = [hdr_row]
        cmds = [
            ('BACKGROUND',    (0,0),(-1,0), C_AZUL_CLR),
            ('GRID',          (0,0),(-1,-1), 0.4, C_GRIS_BRD),
            ('TOPPADDING',    (0,0),(-1,-1), 4),
            ('BOTTOMPADDING', (0,0),(-1,-1), 4),
            ('LEFTPADDING',   (0,0),(-1,-1), 7),
            ('RIGHTPADDING',  (0,0),(-1,-1), 7),
            ('VALIGN',        (0,0),(-1,-1), 'TOP'),
        ]
        for i, d in enumerate(diagnosticos, 1):
            tipo = _v(d.get('tipo_diagnostico',''),'')
            bg   = C_VERDE_BG if tipo.lower() in ('definitivo','principal') else C_AMBAR_BG
            rows.append([
                Paragraph(_v(d.get('codigo_cie11',''),''), s['small']),
                Paragraph(_v(d.get('nombre_enfermedad') or d.get('nombre_diagnostico','')), s['small']),
                Paragraph(tipo,                                                              s['small']),
                Paragraph(_v(d.get('observaciones') or d.get('impresion_diagnostica',''),''), s['small']),
            ])
            cmds.append(('BACKGROUND',(0,i),(-1,i), bg))
        diag_t = Table(rows, colWidths=[0.9*inch,2.9*inch,1.0*inch,2.5*inch])
        diag_t.setStyle(TableStyle(cmds))
        out.append(KeepTogether([_hdr('DIAGNÓSTICOS', s, W), Spacer(1,0.07*inch), diag_t, Spacer(1,0.12*inch)]))

    # =========================================================================
    # PRUEBAS COMPLEMENTARIAS
    # =========================================================================
    pruebas = historia_data.get('pruebas_complementarias', [])
    if pruebas:
        pb_rows = [[
            Paragraph('<b>Tipo / Categoría</b>',     s['label']),
            Paragraph('<b>Nombre / Descripción</b>', s['label']),
            Paragraph('<b>Resultado</b>',            s['label']),
            Paragraph('<b>CUPS</b>',                 s['label']),
        ]]
        for p in pruebas:
            pb_rows.append([
                Paragraph(_v(p.get('categoria') or p.get('tipo_prueba',''),'—'), s['small']),
                Paragraph(_v(p.get('nombre_prueba') or p.get('descripcion',''),'—'), s['small']),
                Paragraph(_v(p.get('resultado',''),'—'),   s['small']),
                Paragraph(_v(p.get('codigo_cups',''),'—'), s['small']),
            ])
        pb_t = Table(pb_rows, colWidths=[1.3*inch,2.8*inch,2.2*inch,1.0*inch])
        pb_t.setStyle(TableStyle([
            ('BACKGROUND',    (0,0),(-1,0), C_AZUL_CLR),
            ('BACKGROUND',    (0,1),(-1,-1), C_GRIS_BG),
            ('GRID',          (0,0),(-1,-1), 0.4, C_GRIS_BRD),
            ('TOPPADDING',    (0,0),(-1,-1), 4),
            ('BOTTOMPADDING', (0,0),(-1,-1), 4),
            ('LEFTPADDING',   (0,0),(-1,-1), 7),
            ('RIGHTPADDING',  (0,0),(-1,-1), 7),
            ('VALIGN',        (0,0),(-1,-1), 'TOP'),
        ]))
        out.append(KeepTogether([_hdr('PRUEBAS COMPLEMENTARIAS', s, W), Spacer(1,0.07*inch), pb_t, Spacer(1,0.12*inch)]))

    # =========================================================================
    # PLAN DE TRATAMIENTO
    # =========================================================================
    planes = historia_data.get('plan_tratamiento', [])
    if isinstance(planes, dict):
        planes = [planes]
    if planes:
        CAMPOS_PLAN = [
            ('indicaciones_medicas',         'Indicaciones médicas'),
            ('tratamiento_farmacologico',     'Tratamiento farmacológico'),
            ('tratamiento_no_farmacologico',  'Tratamiento no farmacológico'),
            ('recomendaciones_entrenamiento', 'Recomendaciones de entrenamiento'),
            ('recomendaciones',               'Recomendaciones'),
            ('plan_seguimiento',              'Plan de seguimiento'),
            ('interconsultas',                'Interconsultas'),
            ('proxima_cita',                  'Próxima cita'),
        ]
        blq_plan = [_hdr('PLAN DE TRATAMIENTO', s, W), Spacer(1,0.07*inch)]
        for plan in planes:
            for key, lbl in CAMPOS_PLAN:
                v = plan.get(key)
                if v and str(v).strip():
                    blq_plan.append(Paragraph(f'<b>{lbl}:</b> {_v(v)}', s['small']))
                    blq_plan.append(Spacer(1,0.04*inch))
        blq_plan.append(Spacer(1,0.08*inch))
        out.append(KeepTogether(blq_plan))

    # =========================================================================
    # REMISIONES
    # =========================================================================
    remisiones = historia_data.get('remisiones_especialistas', [])
    if remisiones:
        rem_rows = [[
            Paragraph('<b>Especialista</b>', s['label']),
            Paragraph('<b>Motivo</b>',       s['label']),
            Paragraph('<b>Prioridad</b>',    s['label']),
            Paragraph('<b>Fecha</b>',        s['label']),
        ]]
        rem_cmds = [
            ('BACKGROUND',    (0,0),(-1,0), C_AZUL_CLR),
            ('GRID',          (0,0),(-1,-1), 0.4, C_GRIS_BRD),
            ('TOPPADDING',    (0,0),(-1,-1), 4),
            ('BOTTOMPADDING', (0,0),(-1,-1), 4),
            ('LEFTPADDING',   (0,0),(-1,-1), 7),
            ('RIGHTPADDING',  (0,0),(-1,-1), 7),
            ('VALIGN',        (0,0),(-1,-1), 'TOP'),
        ]
        for i, r in enumerate(remisiones, 1):
            prio = _v(r.get('prioridad',''))
            bg   = C_ROJO_BG if prio.lower() == 'urgente' else C_GRIS_BG
            rem_rows.append([
                Paragraph(_v(r.get('especialista') or r.get('especialidad','')), s['small']),
                Paragraph(_v(r.get('motivo','')),                                s['small']),
                Paragraph(prio,                                                  s['small']),
                Paragraph(_v(r.get('fecha_remision') or r.get('fecha','')),      s['small']),
            ])
            rem_cmds.append(('BACKGROUND',(0,i),(-1,i), bg))
        rem_t = Table(rem_rows, colWidths=[1.5*inch,3.2*inch,1.0*inch,1.0*inch])
        rem_t.setStyle(TableStyle(rem_cmds))
        out.append(KeepTogether([_hdr('REMISIONES A ESPECIALISTAS', s, W), Spacer(1,0.07*inch), rem_t, Spacer(1,0.12*inch)]))

    # =========================================================================
    # FIRMA DEL MÉDICO
    # =========================================================================
    out.append(HRFlowable(width=W, thickness=0.5, color=C_GRIS_BRD))
    out.append(Spacer(1,0.12*inch))

    firma_img_obj = _img_b64(firma_imagen) if firma_imagen else None

    cel_izq = []
    if firma_img_obj:
        cel_izq.append(firma_img_obj)
    else:
        ln = Table([['']], colWidths=[2.0*inch], rowHeights=[0.6*inch])
        ln.setStyle(TableStyle([('LINEBELOW',(0,0),(0,0),0.8,colors.black)]))
        cel_izq.append(ln)
    cel_izq.append(Paragraph(_v(nombre_medico,'Médico Deportólogo'), s['fn']))
    cel_izq.append(Paragraph(f'Reg. Médico: {reg_medico}', s['fc']))
    cel_izq.append(Paragraph('Médico Deportólogo — INDERHUILA', s['fc']))

    cel_der = [
        Spacer(1,0.18*inch),
        Paragraph(f"Fecha: {datetime.now().strftime('%d/%m/%Y')}", s['fc']),
        Spacer(1,0.06*inch),
        Table([['']], colWidths=[1.8*inch], rowHeights=[0.55*inch]),
        Paragraph('Sello institucional', s['fc']),
    ]

    firma_t = Table([[cel_izq, cel_der]], colWidths=[W/2, W/2])
    firma_t.setStyle(TableStyle([
        ('VALIGN',        (0,0),(-1,-1), 'TOP'),
        ('ALIGN',         (0,0),(0,-1),  'CENTER'),
        ('ALIGN',         (1,0),(1,-1),  'CENTER'),
        ('TOPPADDING',    (0,0),(-1,-1), 6),
        ('BOTTOMPADDING', (0,0),(-1,-1), 6),
    ]))
    out.append(firma_t)
    out.append(Spacer(1,0.1*inch))

    # =========================================================================
    # NOTA LEGAL
    # =========================================================================
    out.append(HRFlowable(width=W, thickness=0.5, color=C_GRIS_BRD))
    out.append(Spacer(1,0.06*inch))
    out.append(Paragraph(
        'Este documento es de carácter confidencial y de uso exclusivo del personal médico autorizado. '
        'INDERHUILA — Instituto Departamental de Recreación y Deportes del Huila. '
        f'Generado el {datetime.now().strftime("%d/%m/%Y a las %H:%M:%S")}. '
        'Desarrollado por WAP Enterprise SAS.',
        s['nota']
    ))

    doc.build(out)
    pdf_buffer.seek(0)
    return pdf_buffer


# =============================================================================
# TEXTO WHATSAPP
# =============================================================================
def generar_texto_whatsapp(historia_data: dict, deportista_data: dict) -> str:
    texto = [
        '🏥 *HISTORIA CLÍNICA DEPORTIVA*', '_INDERHUILA_', '',
        '👤 *DATOS DEL DEPORTISTA*',
        f"• Nombre: {deportista_data.get('nombres','')} {deportista_data.get('apellidos','')}",
        f"• Documento: {deportista_data.get('numero_documento','N/A')}",
        f"• Fecha: {historia_data.get('fecha_apertura','N/A')}", '',
    ]
    mc = historia_data.get('motivo_consulta_enfermedad') or {}
    if isinstance(mc, list): mc = mc[0] if mc else {}
    if mc.get('motivo_consulta'):
        texto += ['📋 *MOTIVO DE CONSULTA*', mc.get('motivo_consulta',''), '']

    sv_raw = historia_data.get('signos_vitales', [])
    sv = sv_raw[0] if isinstance(sv_raw, list) and sv_raw else (sv_raw if isinstance(sv_raw, dict) else {})
    if sv:
        texto.append('💓 *SIGNOS VITALES*')
        if sv.get('peso_kg'):     texto.append(f"• Peso: {sv['peso_kg']} kg")
        if sv.get('estatura_cm'): texto.append(f"• Estatura: {sv['estatura_cm']} cm")
        if sv.get('imc'):         texto.append(f"• IMC: {sv['imc']}")
        if sv.get('presion_arterial_sistolica'):
            texto.append(f"• TA: {sv['presion_arterial_sistolica']}/{sv.get('presion_arterial_diastolica','')} mmHg")
        if sv.get('frecuencia_cardiaca_lpm'):
            texto.append(f"• FC: {sv['frecuencia_cardiaca_lpm']} lpm")
        texto.append('')

    if historia_data.get('diagnosticos'):
        texto.append('🔬 *DIAGNÓSTICOS*')
        for d in historia_data['diagnosticos']:
            nom = d.get('nombre_enfermedad','')
            cod = d.get('codigo_cie11','')
            texto.append(f"• {nom} ({cod})" if cod else f"• {nom}")
        texto.append('')

    planes = historia_data.get('plan_tratamiento', [])
    if planes:
        texto.append('💊 *PLAN DE TRATAMIENTO*')
        for p in (planes if isinstance(planes, list) else [planes]):
            ind = p.get('indicaciones_medicas','')
            if ind: texto.append(f"{ind[:200]}...")
        texto.append('')

    if historia_data.get('remisiones_especialistas'):
        texto.append('👨‍⚕️ *REMISIONES*')
        for r in historia_data['remisiones_especialistas']:
            ico = '🚨' if r.get('prioridad') == 'Urgente' else '📌'
            texto.append(f"{ico} {r.get('especialista','')} — {r.get('motivo','')}")
        texto.append('')

    texto.append('_Para más información, comuníquese con INDERHUILA_')
    return '\n'.join(texto)

def generar_epicrisis(historia_data: dict, deportista_data: dict,
                      firma_imagen: str = None, nombre_medico: str = None,
                      medico_data: dict = None) -> BytesIO:
    """
    Resumen de egreso / epicrisis: motivo, evolución, diagnóstico final,
    plan al alta y próxima cita.
    """
    if medico_data:
        nombre_medico = medico_data.get('nombre_completo') or nombre_medico
        firma_imagen  = medico_data.get('firma_base64')    or firma_imagen
        reg_medico    = _v(medico_data.get('registro_medico'))
    else:
        reg_medico = '—'
 
    pdf_buffer = BytesIO()
    W = 7.3 * inch
    doc = SimpleDocTemplate(pdf_buffer, pagesize=letter,
                            topMargin=0.45*inch, bottomMargin=0.5*inch,
                            leftMargin=0.6*inch, rightMargin=0.6*inch)
    s   = _estilos()
    out = []
 
    # Banner
    fecha_doc = datetime.now().strftime('%d/%m/%Y  %H:%M')
    out.append(_banner('EPICRISIS', 'Resumen de Consulta / Egreso Médico', fecha_doc, s, W))
    out.append(Spacer(1, 0.14*inch))
 
    # Datos deportista
    out.append(KeepTogether([
        _hdr('DATOS DEL PACIENTE', s, W), Spacer(1, 0.07*inch),
        _tabla_deportista(deportista_data, s),
        Spacer(1, 0.12*inch),
    ]))
 
    # Motivo de consulta / ingreso
    mc = historia_data.get('motivo_consulta_enfermedad') or {}
    if isinstance(mc, list): mc = mc[0] if mc else {}
    motivo = _v(mc.get('motivo_consulta') or historia_data.get('motivo_consulta'))
    enf    = _v(mc.get('enfermedad_actual') or mc.get('sintomas_principales'))
    evol   = _v(mc.get('evolucion'))
 
    epi_rows = [
        [Paragraph('Motivo de consulta', s['label']),  Paragraph(motivo, s['normal']),
         Paragraph('Evolución', s['label']),           Paragraph(evol,   s['normal'])],
        [Paragraph('Enfermedad / síntomas', s['label']),Paragraph(enf,   s['normal']),
         Paragraph('Fecha apertura', s['label']),
         Paragraph(_v(historia_data.get('fecha_apertura')), s['normal'])],
    ]
    epi_t = Table(epi_rows, colWidths=[1.3*inch, 2.35*inch, 1.3*inch, 2.35*inch])
    epi_t.setStyle(TableStyle([
        ('BACKGROUND', (0,0),(0,-1), C_AZUL_CLR), ('BACKGROUND', (2,0),(2,-1), C_AZUL_CLR),
        ('BACKGROUND', (1,0),(1,-1), C_GRIS_BG),  ('BACKGROUND', (3,0),(3,-1), C_GRIS_BG),
        ('GRID',       (0,0),(-1,-1), 0.4, C_GRIS_BRD),
        ('TOPPADDING', (0,0),(-1,-1), 5), ('BOTTOMPADDING', (0,0),(-1,-1), 5),
        ('LEFTPADDING',(0,0),(-1,-1), 8), ('RIGHTPADDING',  (0,0),(-1,-1), 8),
        ('VALIGN',     (0,0),(-1,-1), 'TOP'),
    ]))
    out.append(KeepTogether([_hdr('MOTIVO DE CONSULTA / INGRESO', s, W), Spacer(1,0.07*inch), epi_t, Spacer(1,0.12*inch)]))
 
    # Signos vitales compactos
    sv_raw = historia_data.get('signos_vitales', [])
    sv = sv_raw[0] if isinstance(sv_raw, list) and sv_raw else (sv_raw if isinstance(sv_raw, dict) else {})
    if sv:
        def svv(k): return _v(sv.get(k))
        sv_rows = [[
            Paragraph('Peso', s['label']),   Paragraph(f"{svv('peso_kg')} kg",  s['valor']),
            Paragraph('Talla', s['label']),  Paragraph(f"{svv('estatura_cm')} cm", s['valor']),
            Paragraph('IMC', s['label']),    Paragraph(svv('imc'), s['valor']),
            Paragraph('TA', s['label']),
            Paragraph(f"{svv('presion_arterial_sistolica')}/{svv('presion_arterial_diastolica')} mmHg", s['valor']),
            Paragraph('FC', s['label']),     Paragraph(f"{svv('frecuencia_cardiaca_lpm')} lpm", s['valor']),
        ]]
        sv_t = Table(sv_rows, colWidths=[0.7*inch,0.85*inch,0.7*inch,0.85*inch,0.5*inch,0.7*inch,0.5*inch,1.25*inch,0.6*inch,0.7*inch])
        sv_t.setStyle(TableStyle([
            ('BACKGROUND', (0,0),(-1,-1), C_VERDE_BG),
            ('GRID', (0,0),(-1,-1), 0.4, C_VERDE_BRD),
            ('TOPPADDING',(0,0),(-1,-1),5), ('BOTTOMPADDING',(0,0),(-1,-1),5),
            ('LEFTPADDING',(0,0),(-1,-1),6),('RIGHTPADDING',(0,0),(-1,-1),6),
            ('VALIGN',(0,0),(-1,-1),'MIDDLE'),
        ]))
        out.append(KeepTogether([_hdr('SIGNOS VITALES', s, W), Spacer(1,0.07*inch), sv_t, Spacer(1,0.12*inch)]))
 
    # Diagnóstico final
    diagnosticos = historia_data.get('diagnosticos', [])
    if diagnosticos:
        diag_rows = [[
            Paragraph('<b>CIE-11</b>', s['label']),
            Paragraph('<b>Diagnóstico</b>', s['label']),
            Paragraph('<b>Tipo</b>', s['label']),
        ]]
        cmds = [
            ('BACKGROUND',(0,0),(-1,0), C_AZUL_CLR),
            ('GRID',(0,0),(-1,-1),0.4,C_GRIS_BRD),
            ('TOPPADDING',(0,0),(-1,-1),4),('BOTTOMPADDING',(0,0),(-1,-1),4),
            ('LEFTPADDING',(0,0),(-1,-1),7),('RIGHTPADDING',(0,0),(-1,-1),7),
            ('VALIGN',(0,0),(-1,-1),'TOP'),
        ]
        for i, d in enumerate(diagnosticos, 1):
            tipo = _v(d.get('tipo_diagnostico',''),'')
            bg   = C_VERDE_BG if tipo.lower() in ('definitivo','principal') else C_AMBAR_BG
            diag_rows.append([
                Paragraph(_v(d.get('codigo_cie11',''),''), s['small']),
                Paragraph(_v(d.get('nombre_enfermedad') or d.get('nombre_diagnostico','')), s['small']),
                Paragraph(tipo, s['small']),
            ])
            cmds.append(('BACKGROUND',(0,i),(-1,i),bg))
        diag_t = Table(diag_rows, colWidths=[1.0*inch, 4.8*inch, 1.5*inch])
        diag_t.setStyle(TableStyle(cmds))
        out.append(KeepTogether([_hdr('DIAGNÓSTICO FINAL', s, W), Spacer(1,0.07*inch), diag_t, Spacer(1,0.12*inch)]))
 
    # Plan al alta
    planes = historia_data.get('plan_tratamiento', [])
    if isinstance(planes, dict): planes = [planes]
    if planes:
        CAMPOS = [
            ('indicaciones_medicas',         'Indicaciones al alta'),
            ('tratamiento_farmacologico',     'Tratamiento farmacológico'),
            ('tratamiento_no_farmacologico',  'Tratamiento no farmacológico'),
            ('recomendaciones_entrenamiento', 'Recomendaciones de entrenamiento'),
            ('recomendaciones',               'Recomendaciones generales'),
            ('plan_seguimiento',              'Plan de seguimiento'),
            ('proxima_cita',                  'Próxima cita'),
        ]
        blq = [_hdr('PLAN AL ALTA / RECOMENDACIONES', s, W), Spacer(1,0.07*inch)]
        for plan in planes:
            for key, lbl in CAMPOS:
                v = plan.get(key)
                if v and str(v).strip():
                    blq.append(Paragraph(f'<b>{lbl}:</b> {_v(v)}', s['small']))
                    blq.append(Spacer(1, 0.04*inch))
        blq.append(Spacer(1, 0.08*inch))
        out.append(KeepTogether(blq))
 
    # Remisiones
    remisiones = historia_data.get('remisiones_especialistas', [])
    if remisiones:
        rem_rows = [[
            Paragraph('<b>Especialista</b>', s['label']),
            Paragraph('<b>Motivo</b>',       s['label']),
            Paragraph('<b>Prioridad</b>',    s['label']),
        ]]
        for r in remisiones:
            prio = _v(r.get('prioridad',''))
            rem_rows.append([
                Paragraph(_v(r.get('especialista') or r.get('especialidad','')), s['small']),
                Paragraph(_v(r.get('motivo','')), s['small']),
                Paragraph(prio, s['small']),
            ])
        rem_t = Table(rem_rows, colWidths=[2.0*inch, 4.3*inch, 1.0*inch])
        rem_t.setStyle(TableStyle([
            ('BACKGROUND',(0,0),(-1,0), C_AZUL_CLR),
            ('BACKGROUND',(0,1),(-1,-1), C_GRIS_BG),
            ('GRID',(0,0),(-1,-1),0.4,C_GRIS_BRD),
            ('TOPPADDING',(0,0),(-1,-1),4),('BOTTOMPADDING',(0,0),(-1,-1),4),
            ('LEFTPADDING',(0,0),(-1,-1),7),('RIGHTPADDING',(0,0),(-1,-1),7),
            ('VALIGN',(0,0),(-1,-1),'TOP'),
        ]))
        out.append(KeepTogether([_hdr('REMISIONES', s, W), Spacer(1,0.07*inch), rem_t, Spacer(1,0.12*inch)]))
 
    out.extend(_bloque_firma(nombre_medico, reg_medico, firma_imagen, s, W))
    out.extend(_pie_pagina('Epicrisis', s, W))
    doc.build(out)
    pdf_buffer.seek(0)
    return pdf_buffer
 
 
# =============================================================================
# RECETA MÉDICA
# =============================================================================
def generar_receta_medica(historia_data: dict, deportista_data: dict,
                          firma_imagen: str = None, nombre_medico: str = None,
                          medico_data: dict = None) -> BytesIO:
    """
    Receta médica formal: medicamentos prescritos con dosis y frecuencia.
    """
    if medico_data:
        nombre_medico = medico_data.get('nombre_completo') or nombre_medico
        firma_imagen  = medico_data.get('firma_base64')    or firma_imagen
        reg_medico    = _v(medico_data.get('registro_medico'))
    else:
        reg_medico = '—'
 
    pdf_buffer = BytesIO()
    W = 7.3 * inch
    doc = SimpleDocTemplate(pdf_buffer, pagesize=letter,
                            topMargin=0.45*inch, bottomMargin=0.5*inch,
                            leftMargin=0.6*inch, rightMargin=0.6*inch)
    s   = _estilos()
    out = []
 
    fecha_doc = datetime.now().strftime('%d/%m/%Y  %H:%M')
    out.append(_banner('RECETA MÉDICA', 'Prescripción Farmacológica', fecha_doc, s, W))
    out.append(Spacer(1, 0.14*inch))
 
    # Datos paciente compactos
    nombres  = f"{_v(deportista_data.get('nombres'))} {_v(deportista_data.get('apellidos'))}"
    doc_num  = _v(deportista_data.get('numero_documento'))
    edad_txt = '—'
    fnac     = _v(deportista_data.get('fecha_nacimiento'))
    try:
        fn = datetime.strptime(fnac[:10], '%Y-%m-%d')
        edad_txt = f"{(datetime.now()-fn).days//365} años"
    except Exception:
        pass
 
    pac_rows = [
        [Paragraph('Paciente',   s['label']), Paragraph(nombres,  s['valor']),
         Paragraph('Documento',  s['label']), Paragraph(doc_num,  s['valor']),
         Paragraph('Edad',       s['label']), Paragraph(edad_txt, s['valor'])],
    ]
    pac_t = Table(pac_rows, colWidths=[1.0*inch,2.2*inch,1.0*inch,1.3*inch,0.7*inch,1.1*inch])
    pac_t.setStyle(TableStyle([
        ('BACKGROUND',(0,0),(-1,-1), C_AZUL_CLR),
        ('GRID',(0,0),(-1,-1),0.4,C_AZUL_BRD),
        ('TOPPADDING',(0,0),(-1,-1),5),('BOTTOMPADDING',(0,0),(-1,-1),5),
        ('LEFTPADDING',(0,0),(-1,-1),8),('RIGHTPADDING',(0,0),(-1,-1),8),
        ('VALIGN',(0,0),(-1,-1),'MIDDLE'),
    ]))
    out.append(KeepTogether([_hdr('DATOS DEL PACIENTE', s, W), Spacer(1,0.07*inch), pac_t, Spacer(1,0.12*inch)]))
 
    # Diagnóstico (contexto de la receta)
    diagnosticos = historia_data.get('diagnosticos', [])
    if diagnosticos:
        diag_txt = ' / '.join([
            _v(d.get('nombre_enfermedad') or d.get('nombre_diagnostico',''))
            for d in diagnosticos
        ])
        out.append(KeepTogether([
            _hdr('DIAGNÓSTICO', s, W), Spacer(1,0.07*inch),
            Paragraph(f'  {diag_txt}', s['normal']),
            Spacer(1,0.12*inch),
        ]))
 
    # Medicamentos prescritos
    medicaciones = historia_data.get('medicaciones', [])
    planes       = historia_data.get('plan_tratamiento', [])
    if isinstance(planes, dict): planes = [planes]
 
    # Recopilar medicamentos del plan de tratamiento también
    med_plan_txt = ''
    for plan in planes:
        v = plan.get('tratamiento_farmacologico')
        if v and str(v).strip():
            med_plan_txt += str(v).strip() + '\n'
 
    blq_rx = [_hdr('MEDICAMENTOS PRESCRITOS', s, W), Spacer(1, 0.07*inch)]
 
    if medicaciones:
        rx_rows = [[
            Paragraph('<b>N°</b>',          s['label']),
            Paragraph('<b>Medicamento</b>', s['label']),
            Paragraph('<b>Dosis</b>',       s['label']),
            Paragraph('<b>Frecuencia</b>',  s['label']),
            Paragraph('<b>Indicaciones</b>',s['label']),
        ]]
        for i, m in enumerate(medicaciones, 1):
            nombre_m = _v(m.get('nombre_medicacion') or m.get('nombre_medicamento',''))
            rx_rows.append([
                Paragraph(str(i), s['small']),
                Paragraph(nombre_m, s['small']),
                Paragraph(_v(m.get('dosis',''),'—'), s['small']),
                Paragraph(_v(m.get('frecuencia',''),'—'), s['small']),
                Paragraph(_v(m.get('observaciones',''),'—'), s['small']),
            ])
        rx_t = Table(rx_rows, colWidths=[0.4*inch, 2.0*inch, 1.2*inch, 1.5*inch, 2.2*inch])
        rx_t.setStyle(TableStyle([
            ('BACKGROUND',(0,0),(-1,0), C_AZUL_CLR),
            ('BACKGROUND',(0,1),(-1,-1), C_GRIS_BG),
            ('ROWBACKGROUNDS',(0,1),(-1,-1),[C_GRIS_BG, C_BLANCO]),
            ('GRID',(0,0),(-1,-1),0.4,C_GRIS_BRD),
            ('TOPPADDING',(0,0),(-1,-1),5),('BOTTOMPADDING',(0,0),(-1,-1),5),
            ('LEFTPADDING',(0,0),(-1,-1),7),('RIGHTPADDING',(0,0),(-1,-1),7),
            ('VALIGN',(0,0),(-1,-1),'TOP'),
        ]))
        blq_rx.append(rx_t)
    else:
        blq_rx.append(Paragraph('  Sin medicamentos registrados en la historia.', s['small']))
 
    # Si hay texto de tratamiento farmacológico en el plan, agregarlo
    if med_plan_txt.strip():
        blq_rx.append(Spacer(1, 0.08*inch))
        blq_rx.append(Paragraph('<b>Indicaciones adicionales:</b>', s['small']))
        blq_rx.append(Spacer(1, 0.04*inch))
        for linea in med_plan_txt.strip().split('\n'):
            if linea.strip():
                blq_rx.append(Paragraph(f'  {linea.strip()}', s['small']))
 
    blq_rx.append(Spacer(1, 0.12*inch))
    out.append(KeepTogether(blq_rx))
 
    # Recomendaciones generales
    for plan in planes:
        rec = plan.get('recomendaciones') or plan.get('indicaciones_medicas')
        if rec and str(rec).strip():
            out.append(KeepTogether([
                _hdr('RECOMENDACIONES', s, W), Spacer(1,0.07*inch),
                Paragraph(f'  {_v(rec)}', s['normal']),
                Spacer(1,0.12*inch),
            ]))
            break
 
    # Nota Rx
    nota_rx = ParagraphStyle('NotaRx', parent=getSampleStyleSheet()['Normal'],
                              fontSize=7.5, textColor=C_GRIS_LBL,
                              alignment=TA_JUSTIFY, leading=11)
    out.append(Paragraph(
        'Esta receta tiene validez de 30 días a partir de la fecha de emisión. '
        'Medicamentos de control especial requieren receta retenida.',
        nota_rx
    ))
    out.append(Spacer(1, 0.1*inch))
 
    out.extend(_bloque_firma(nombre_medico, reg_medico, firma_imagen, s, W))
    out.extend(_pie_pagina('Receta Médica', s, W))
    doc.build(out)
    pdf_buffer.seek(0)
    return pdf_buffer
 
 
# =============================================================================
# INTERCONSULTA / REMISIÓN FORMAL
# =============================================================================
def generar_interconsulta(historia_data: dict, deportista_data: dict,
                          firma_imagen: str = None, nombre_medico: str = None,
                          medico_data: dict = None,
                          remision_idx: int = 0) -> BytesIO:
    """
    Documento formal de interconsulta / remisión a especialista.
    remision_idx: índice de la remisión a usar (0 = primera).
    """
    if medico_data:
        nombre_medico = medico_data.get('nombre_completo') or nombre_medico
        firma_imagen  = medico_data.get('firma_base64')    or firma_imagen
        reg_medico    = _v(medico_data.get('registro_medico'))
    else:
        reg_medico = '—'
 
    pdf_buffer = BytesIO()
    W = 7.3 * inch
    doc = SimpleDocTemplate(pdf_buffer, pagesize=letter,
                            topMargin=0.45*inch, bottomMargin=0.5*inch,
                            leftMargin=0.6*inch, rightMargin=0.6*inch)
    s   = _estilos()
    out = []
 
    fecha_doc = datetime.now().strftime('%d/%m/%Y  %H:%M')
    out.append(_banner('INTERCONSULTA / REMISIÓN', 'Solicitud de Valoración por Especialista', fecha_doc, s, W))
    out.append(Spacer(1, 0.14*inch))
 
    # Datos paciente
    out.append(KeepTogether([
        _hdr('DATOS DEL PACIENTE', s, W), Spacer(1,0.07*inch),
        _tabla_deportista(deportista_data, s),
        Spacer(1,0.12*inch),
    ]))
 
    # Remisión específica
    remisiones = historia_data.get('remisiones_especialistas', [])
    rem = remisiones[remision_idx] if remisiones and remision_idx < len(remisiones) else {}
 
    especialista = _v(rem.get('especialista') or rem.get('especialidad'))
    motivo_rem   = _v(rem.get('motivo'))
    prioridad    = _v(rem.get('prioridad','Normal'))
    fecha_rem    = _v(rem.get('fecha_remision') or rem.get('fecha'))
 
    prio_bg = C_ROJO_BG if prioridad.lower() == 'urgente' else C_VERDE_BG
    rem_rows = [
        [Paragraph('Especialista solicitado', s['label']), Paragraph(especialista,  s['valor']),
         Paragraph('Prioridad',               s['label']), Paragraph(prioridad,     s['valor'])],
        [Paragraph('Motivo de remisión',       s['label']), Paragraph(motivo_rem,   s['normal']),
         Paragraph('Fecha solicitada',         s['label']), Paragraph(fecha_rem,    s['valor'])],
    ]
    rem_t = Table(rem_rows, colWidths=[1.6*inch,2.1*inch,1.3*inch,2.3*inch])
    rem_t.setStyle(TableStyle([
        ('BACKGROUND',(0,0),(0,-1), C_AZUL_CLR), ('BACKGROUND',(2,0),(2,-1), C_AZUL_CLR),
        ('BACKGROUND',(1,0),(1,-1), prio_bg),     ('BACKGROUND',(3,0),(3,-1), prio_bg),
        ('GRID',(0,0),(-1,-1),0.4,C_GRIS_BRD),
        ('TOPPADDING',(0,0),(-1,-1),6),('BOTTOMPADDING',(0,0),(-1,-1),6),
        ('LEFTPADDING',(0,0),(-1,-1),8),('RIGHTPADDING',(0,0),(-1,-1),8),
        ('VALIGN',(0,0),(-1,-1),'TOP'),
    ]))
    out.append(KeepTogether([_hdr('DATOS DE LA REMISIÓN', s, W), Spacer(1,0.07*inch), rem_t, Spacer(1,0.12*inch)]))
 
    # Antecedentes relevantes (resumen)
    mc = historia_data.get('motivo_consulta_enfermedad') or {}
    if isinstance(mc, list): mc = mc[0] if mc else {}
    motivo_c = _v(mc.get('motivo_consulta') or historia_data.get('motivo_consulta'))
    enf_c    = _v(mc.get('enfermedad_actual') or mc.get('sintomas_principales'))
    evol_c   = _v(mc.get('evolucion'))
 
    res_rows = [
        [Paragraph('Motivo de consulta original', s['label']), Paragraph(motivo_c, s['normal']),
         Paragraph('Evolución', s['label']), Paragraph(evol_c, s['normal'])],
        [Paragraph('Enfermedad actual / síntomas', s['label']), Paragraph(enf_c, s['normal']),
         Paragraph('', s['label']), Paragraph('', s['normal'])],
    ]
    res_t = Table(res_rows, colWidths=[1.8*inch, 1.85*inch, 1.3*inch, 2.35*inch])
    res_t.setStyle(TableStyle([
        ('BACKGROUND',(0,0),(0,-1), C_AZUL_CLR),('BACKGROUND',(2,0),(2,-1), C_AZUL_CLR),
        ('BACKGROUND',(1,0),(1,-1), C_GRIS_BG), ('BACKGROUND',(3,0),(3,-1), C_GRIS_BG),
        ('GRID',(0,0),(-1,-1),0.4,C_GRIS_BRD),
        ('TOPPADDING',(0,0),(-1,-1),5),('BOTTOMPADDING',(0,0),(-1,-1),5),
        ('LEFTPADDING',(0,0),(-1,-1),8),('RIGHTPADDING',(0,0),(-1,-1),8),
        ('VALIGN',(0,0),(-1,-1),'TOP'),
    ]))
    out.append(KeepTogether([_hdr('RESUMEN CLÍNICO', s, W), Spacer(1,0.07*inch), res_t, Spacer(1,0.12*inch)]))
 
    # Diagnósticos actuales
    diagnosticos = historia_data.get('diagnosticos', [])
    if diagnosticos:
        diag_txt = '\n'.join([
            f"  • {_v(d.get('nombre_enfermedad') or d.get('nombre_diagnostico',''))} "
            f"{'['+d['codigo_cie11']+']' if d.get('codigo_cie11') else ''}"
            for d in diagnosticos
        ])
        out.append(KeepTogether([
            _hdr('DIAGNÓSTICOS ACTUALES', s, W), Spacer(1,0.07*inch),
            Paragraph(diag_txt, s['small']),
            Spacer(1,0.12*inch),
        ]))
 
    # Signos vitales compactos
    sv_raw = historia_data.get('signos_vitales', [])
    sv = sv_raw[0] if isinstance(sv_raw, list) and sv_raw else (sv_raw if isinstance(sv_raw, dict) else {})
    if sv:
        def svv(k): return _v(sv.get(k))
        sv_txt = (
            f"Peso: {svv('peso_kg')} kg  |  Talla: {svv('estatura_cm')} cm  |  "
            f"IMC: {svv('imc')}  |  "
            f"TA: {svv('presion_arterial_sistolica')}/{svv('presion_arterial_diastolica')} mmHg  |  "
            f"FC: {svv('frecuencia_cardiaca_lpm')} lpm"
        )
        out.append(KeepTogether([
            _hdr('SIGNOS VITALES', s, W), Spacer(1,0.07*inch),
            Paragraph(f'  {sv_txt}', s['small']),
            Spacer(1,0.12*inch),
        ]))
 
    # Tratamiento actual
    medicaciones = historia_data.get('medicaciones', [])
    if medicaciones:
        med_txt = ',  '.join([
            f"{_v(m.get('nombre_medicacion') or m.get('nombre_medicamento',''))} "
            f"{_v(m.get('dosis',''),'')}"
            for m in medicaciones
        ])
        out.append(KeepTogether([
            _hdr('TRATAMIENTO ACTUAL', s, W), Spacer(1,0.07*inch),
            Paragraph(f'  {med_txt}', s['small']),
            Spacer(1,0.12*inch),
        ]))
 
    # Alergias (importante para el especialista)
    alergias = historia_data.get('alergias', [])
    if alergias:
        al_txt = ',  '.join([_v(a.get('tipo_alergia','')) for a in alergias])
        out.append(Paragraph(f'<b>Alergias conocidas:</b> {al_txt}', s['small']))
        out.append(Spacer(1, 0.12*inch))
 
    out.extend(_bloque_firma(nombre_medico, reg_medico, firma_imagen, s, W))
    out.extend(_pie_pagina('Interconsulta', s, W))
    doc.build(out)
    pdf_buffer.seek(0)
    return pdf_buffer
 
 
# =============================================================================
# HELPERS COMPARTIDOS (agregar también antes de las funciones anteriores)
# =============================================================================
def _logo_inderhuila(ancho=0.6*inch, alto=0.6*inch):
    return _img_b64(_LOGO_B64, max_w=ancho, max_h=alto)

def _banner(titulo: str, subtitulo: str, fecha: str, s, W):
    logo = _logo_inderhuila()
    logo_w  = 0.8 * inch
    texto_w = W - logo_w * 2

    texto_t = Table(
        [
            [Paragraph(titulo,    s['titulo'])],
            [Paragraph(subtitulo, s['subtitulo'])],
            [Paragraph(f'Fecha de emisión: {fecha}', s['subtitulo'])],
        ],
        colWidths=[texto_w]
    )
    texto_t.setStyle(TableStyle([
        ('BACKGROUND',    (0,0),(-1,-1), C_AZUL),
        ('ALIGN',         (0,0),(-1,-1), 'CENTER'),
        ('VALIGN',        (0,0),(-1,-1), 'MIDDLE'),
        ('TOPPADDING',    (0,0),(0,0),   12),
        ('BOTTOMPADDING', (0,2),(0,2),   12),
        ('TOPPADDING',    (0,1),(0,2),   2),
        ('BOTTOMPADDING', (0,0),(0,1),   2),
        ('LEFTPADDING',   (0,0),(-1,-1), 0),
        ('RIGHTPADDING',  (0,0),(-1,-1), 0),
    ]))

    if logo:
        banner = Table(
            [[logo, texto_t, '']],
            colWidths=[logo_w, texto_w, logo_w]
        )
        banner.setStyle(TableStyle([
            ('BACKGROUND',    (0,0),(-1,-1), C_AZUL),
            ('ALIGN',         (0,0),(0,-1),  'CENTER'),
            ('VALIGN',        (0,0),(-1,-1), 'MIDDLE'),
            ('LEFTPADDING',   (0,0),(-1,-1), 8),
            ('RIGHTPADDING',  (0,0),(-1,-1), 8),
            ('TOPPADDING',    (0,0),(-1,-1), 0),
            ('BOTTOMPADDING', (0,0),(-1,-1), 0),
        ]))
    else:
        banner = Table(
            [[texto_t]],
            colWidths=[W]
        )
        banner.setStyle(TableStyle([
            ('BACKGROUND', (0,0),(-1,-1), C_AZUL),
            ('LEFTPADDING', (0,0),(-1,-1), 16),
            ('RIGHTPADDING',(0,0),(-1,-1), 16),
        ]))

    return banner
 
def _tabla_deportista(deportista_data: dict, s):
    nombres  = f"{_v(deportista_data.get('nombres'))} {_v(deportista_data.get('apellidos'))}"
    doc_num  = _v(deportista_data.get('numero_documento'))
    fnac     = _v(deportista_data.get('fecha_nacimiento'))
    tel      = _v(deportista_data.get('telefono'))
    email    = _v(deportista_data.get('email'))
    deporte  = _v(deportista_data.get('deporte') or deportista_data.get('tipo_deporte'))
    eps      = _v(deportista_data.get('eps'))
    gsang    = _v(deportista_data.get('grupo_sanguineo'))
    edad_txt = '—'
    try:
        fn = datetime.strptime(fnac[:10], '%Y-%m-%d')
        edad_txt = f"{(datetime.now()-fn).days//365} años"
    except Exception:
        pass
 
    rows = [
        [Paragraph('Nombre completo',  s['label']), Paragraph(nombres,           s['valor']),
         Paragraph('N° Documento',     s['label']), Paragraph(doc_num,           s['valor']),
         Paragraph('Edad',             s['label']), Paragraph(edad_txt,          s['valor'])],
        [Paragraph('Disciplina',       s['label']), Paragraph(deporte,           s['valor']),
         Paragraph('Grupo sanguíneo',  s['label']), Paragraph(gsang,             s['valor']),
         Paragraph('EPS',              s['label']), Paragraph(eps,               s['valor'])],
        [Paragraph('Teléfono',         s['label']), Paragraph(tel,               s['valor']),
         Paragraph('Correo',           s['label']), Paragraph(email,             s['valor']),
         Paragraph('',                 s['label']), Paragraph('',                s['valor'])],
    ]
    t = Table(rows, colWidths=[1.3*inch,1.5*inch,1.1*inch,1.5*inch,1.1*inch,1.4*inch])
    t.setStyle(TableStyle([
        ('BACKGROUND',    (0,0),(-1,-1), C_AZUL_CLR),
        ('GRID',          (0,0),(-1,-1), 0.4, C_AZUL_BRD),
        ('TOPPADDING',    (0,0),(-1,-1), 5),
        ('BOTTOMPADDING', (0,0),(-1,-1), 5),
        ('LEFTPADDING',   (0,0),(-1,-1), 8),
        ('RIGHTPADDING',  (0,0),(-1,-1), 8),
        ('VALIGN',        (0,0),(-1,-1), 'TOP'),
    ]))
    return t
 
 
def _bloque_firma(nombre_medico, reg_medico, firma_imagen, s, W):
    """Bloque de firma reutilizable."""
    firma_img_obj = _img_b64(firma_imagen) if firma_imagen else None
    cel_izq = []
    if firma_img_obj:
        cel_izq.append(firma_img_obj)
    else:
        ln = Table([['']], colWidths=[2.0*inch], rowHeights=[0.6*inch])
        ln.setStyle(TableStyle([('LINEBELOW',(0,0),(0,0),0.8,colors.black)]))
        cel_izq.append(ln)
    cel_izq.append(Paragraph(_v(nombre_medico,'Médico Deportólogo'), s['fn']))
    cel_izq.append(Paragraph(f'Reg. Médico: {reg_medico}', s['fc']))
    cel_izq.append(Paragraph('Médico Deportólogo — INDERHUILA', s['fc']))
 
    cel_der = [
        Spacer(1,0.18*inch),
        Paragraph(f"Fecha: {datetime.now().strftime('%d/%m/%Y')}", s['fc']),
        Spacer(1,0.06*inch),
        Table([['']], colWidths=[1.8*inch], rowHeights=[0.55*inch]),
        Paragraph('Sello institucional', s['fc']),
    ]
    firma_t = Table([[cel_izq, cel_der]], colWidths=[W/2, W/2])
    firma_t.setStyle(TableStyle([
        ('VALIGN',(0,0),(-1,-1),'TOP'),
        ('ALIGN',(0,0),(0,-1),'CENTER'),
        ('ALIGN',(1,0),(1,-1),'CENTER'),
        ('TOPPADDING',(0,0),(-1,-1),6),
        ('BOTTOMPADDING',(0,0),(-1,-1),6),
    ]))
    return [HRFlowable(width=W, thickness=0.5, color=C_GRIS_BRD),
            Spacer(1,0.12*inch), firma_t, Spacer(1,0.1*inch)]
 
 
def _pie_pagina(tipo_doc: str, s, W):
    """Pie de página con nota legal."""
    return [
        HRFlowable(width=W, thickness=0.5, color=C_GRIS_BRD),
        Spacer(1,0.06*inch),
        Paragraph(
            f'{tipo_doc} — Documento confidencial de uso exclusivo del personal médico autorizado. '
            'INDERHUILA — Instituto Departamental de Recreación y Deportes del Huila. '
            f'Generado el {datetime.now().strftime("%d/%m/%Y a las %H:%M:%S")}. '
            'Desarrollado por WAP Enterprise SAS.',
            s['nota']
        ),
    ]