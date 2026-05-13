// ============================================================
// VISTA HISTORIA CLÍNICA
// WAP Enterprise SAS — Sistema Médico INDERHUILA
// ============================================================
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'sonner';
import {
  ArrowLeft, Download, Mail, MessageCircle, Printer,
  FileText, CheckSquare, Square, X, Loader2,
  User, Activity, Stethoscope, FlaskConical,
  ClipboardList, ShieldCheck, ChevronRight,
  Pill, Users,
} from 'lucide-react';
import { api, historiaClinicaService } from '@/app/services/apiClient';

// ── TOKENS ───────────────────────────────────────────────────
const T = {
  primary:      '#1F4788',
  primaryLight: '#EEF3FB',
  primaryMid:   '#3b82f6',
  bg:           '#F5F7FA',
  surface:      '#ffffff',
  surfaceAlt:   '#f8fafc',
  border:       '#e2e8f0',
  borderLight:  '#f1f5f9',
  textPrimary:  '#0f172a',
  textSecondary:'#475569',
  textMuted:    '#94a3b8',
  success:      '#10b981',
  successBg:    '#d1fae5',
  successText:  '#065f46',
  danger:       '#ef4444',
  dangerBg:     '#fee2e2',
  dangerText:   '#991b1b',
  warning:      '#f59e0b',
  warningBg:    '#fffbeb',
  warningText:  '#92400e',
  radius:       '12px',
  radiusSm:     '8px',
  shadow:       '0 1px 3px rgba(0,0,0,0.06)',
  shadowMd:     '0 4px 16px rgba(31,71,136,0.08)',
};

// ── UTILS ────────────────────────────────────────────────────
const fmtFecha = (d?: string | null) =>
  d ? format(new Date(d.includes('T') ? d : d + 'T12:00:00'), 'd MMM yyyy', { locale: es }) : '—';
const fmtFechaHora = (d?: string | null) =>
  d ? format(new Date(d), 'd MMM yyyy HH:mm', { locale: es }) : '—';

// Normaliza los datos sin importar si vienen del endpoint /datos-completos
// o del fallback historiaClinicaService.getById
function normalizar(raw: any): any {
  if (!raw) return null;
  if (raw.deportista && typeof raw.deportista === 'object') return raw;
  return {
    ...raw,
    deportista: {
      nombres:          raw.nombres          || raw.deportista_nombres || '',
      apellidos:        raw.apellidos        || raw.deportista_apellidos || '',
      numero_documento: raw.numero_documento || raw.deportista_documento || '',
      fecha_nacimiento: raw.fecha_nacimiento || null,
      telefono:         raw.telefono         || null,
      email:            raw.email            || null,
      deporte:          raw.tipo_deporte     || raw.deporte || raw.disciplina || null,
    },
    antecedentes_personales:     raw.antecedentes_personales     || [],
    antecedentes_familiares:     raw.antecedentes_familiares     || [],
    lesiones_deportivas:         raw.lesiones_deportivas         || [],
    cirugias_previas:            raw.cirugias_previas            || [],
    alergias:                    raw.alergias                    || [],
    medicaciones:                raw.medicaciones                || [],
    vacunas_administradas:       raw.vacunas_administradas       || [],
    revision_sistemas:           raw.revision_sistemas           || [],
    signos_vitales:              raw.signos_vitales              || [],
    pruebas_complementarias:     raw.pruebas_complementarias     || [],
    diagnosticos:                raw.diagnosticos                || [],
    plan_tratamiento:            raw.plan_tratamiento
                                    ? (Array.isArray(raw.plan_tratamiento) ? raw.plan_tratamiento : [raw.plan_tratamiento])
                                    : [],
    remisiones_especialistas:    raw.remisiones_especialistas    || [],
    motivo_consulta_enfermedad:  raw.motivo_consulta_enfermedad  || null,
    exploracion_fisica_sistemas: raw.exploracion_fisica_sistemas || null,
    aptitud_medica:              raw.aptitud_medica              || null,
  };
}

// ── TIPOS DE DOCUMENTO ───────────────────────────────────────
const TIPOS_DOC = [
  {
    id: 'historia_clinica',
    nombre: 'Historia Clínica Completa',
    desc: 'Todos los datos de la consulta con secciones seleccionables',
    icon: FileText,
    color: '#1F4788', bg: '#EEF3FB',
    endpoint: 'historia-clinica-pdf',
    tieneSecciones: true,
  },
  {
    id: 'epicrisis',
    nombre: 'Epicrisis',
    desc: 'Resumen de egreso: diagnóstico final, plan al alta y próxima cita',
    icon: ClipboardList,
    color: '#0f766e', bg: '#f0fdf4',
    endpoint: 'epicrisis-pdf',
    tieneSecciones: false,
  },
  {
    id: 'receta',
    nombre: 'Receta Médica',
    desc: 'Prescripción de medicamentos con dosis y frecuencia',
    icon: Pill,
    color: '#7c3aed', bg: '#f5f3ff',
    endpoint: 'receta-pdf',
    tieneSecciones: false,
  },
  {
    id: 'interconsulta',
    nombre: 'Interconsulta / Remisión',
    desc: 'Solicitud formal de valoración por especialista',
    icon: Users,
    color: '#d97706', bg: '#fefce8',
    endpoint: 'interconsulta-pdf',
    tieneSecciones: false,
  },
] as const;

type TipoDoc = typeof TIPOS_DOC[number];

const SECCIONES = [
  { id: 'motivo_consulta',          numero: 1, nombre: 'Motivo de Consulta'          },
  { id: 'antecedentes',             numero: 2, nombre: 'Antecedentes Médicos'        },
  { id: 'revision_sistemas',        numero: 3, nombre: 'Revisión por Sistemas'       },
  { id: 'signos_vitales',           numero: 4, nombre: 'Signos Vitales'              },
  { id: 'exploracion_fisica',       numero: 5, nombre: 'Exploración Física'          },
  { id: 'pruebas_complementarias',  numero: 6, nombre: 'Pruebas Complementarias'     },
  { id: 'diagnosticos',             numero: 7, nombre: 'Diagnósticos'                },
  { id: 'plan_tratamiento',         numero: 8, nombre: 'Plan de Tratamiento'         },
  { id: 'aptitud',                  numero: 9, nombre: 'Aptitud Médica'              },
];

type Accion = 'pdf' | 'email' | 'whatsapp' | 'imprimir' | null;

// ── ÁTOMOS ───────────────────────────────────────────────────
function Badge({ label, color = T.primary }: { label: string; color?: string }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20, background: `${color}18`, color }}>
      {label}
    </span>
  );
}
function InfoField({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <p style={{ margin: '0 0 3px', fontSize: 11, fontWeight: 600, color: T.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</p>
      <p style={{ margin: 0, fontSize: 14, color: T.textPrimary, fontWeight: 500 }}>{value || '—'}</p>
    </div>
  );
}
function SectionCard({ numero, titulo, icon, children, accent = T.primary }: {
  numero?: number; titulo: string; icon?: React.ReactNode; children: React.ReactNode; accent?: string;
}) {
  return (
    <div style={{ background: T.surface, borderRadius: T.radius, border: `1px solid ${T.border}`, overflow: 'hidden', boxShadow: T.shadow }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 20px', borderBottom: `1px solid ${T.borderLight}`, background: T.surfaceAlt }}>
        {icon && <div style={{ width: 32, height: 32, borderRadius: T.radiusSm, background: `${accent}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: accent }}>{icon}</div>}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
          {numero && <span style={{ fontSize: 11, fontWeight: 700, color: T.textMuted }}>{numero}.</span>}
          <h2 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: T.textPrimary }}>{titulo}</h2>
        </div>
      </div>
      <div style={{ padding: '16px 20px' }}>{children}</div>
    </div>
  );
}
function Empty({ texto }: { texto: string }) {
  return <p style={{ margin: 0, fontSize: 13, color: T.textMuted, fontStyle: 'italic' }}>{texto}</p>;
}
function DataRow({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '10px 0', borderBottom: `1px solid ${T.borderLight}`, gap: 16 }}>
      <span style={{ fontSize: 13, color: T.textSecondary, fontWeight: 500, flexShrink: 0 }}>{label}</span>
      <span style={{ fontSize: 13, color: T.textPrimary, textAlign: 'right' }}>{value}</span>
    </div>
  );
}
function Item({ children, accent = T.primary }: { children: React.ReactNode; accent?: string }) {
  return (
    <div style={{ padding: '12px 14px', borderRadius: T.radiusSm, background: T.surfaceAlt, border: `1px solid ${T.borderLight}`, borderLeft: `3px solid ${accent}`, marginBottom: 8 }}>{children}</div>
  );
}
function SubTitle({ titulo }: { titulo: string }) {
  return <p style={{ margin: '0 0 8px', fontSize: 11, fontWeight: 700, color: T.primary, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{titulo}</p>;
}

// ── SECCIONES ────────────────────────────────────────────────
function S1_MotivoConsulta({ motivo }: { motivo: any }) {
  return (
    <SectionCard numero={1} titulo="Motivo de Consulta y Enfermedad Actual" icon={<FileText size={16} />}>
      {!motivo ? <Empty texto="No registrado" /> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {motivo.motivo_consulta && <div><SubTitle titulo="Motivo de consulta" /><p style={{ margin: 0, fontSize: 14, color: T.textPrimary, lineHeight: 1.6 }}>{motivo.motivo_consulta}</p></div>}
          {motivo.enfermedad_actual && <div><SubTitle titulo="Enfermedad actual / Anamnesis" /><p style={{ margin: 0, fontSize: 14, color: T.textPrimary, lineHeight: 1.6 }}>{motivo.enfermedad_actual}</p></div>}
          {motivo.sintomas_principales && !motivo.enfermedad_actual && <div><SubTitle titulo="Síntomas" /><p style={{ margin: 0, fontSize: 14, color: T.textPrimary, lineHeight: 1.6 }}>{motivo.sintomas_principales}</p></div>}
          {motivo.evolucion && <div><SubTitle titulo="Evolución" /><p style={{ margin: 0, fontSize: 14, color: T.textPrimary, lineHeight: 1.6 }}>{motivo.evolucion}</p></div>}
        </div>
      )}
    </SectionCard>
  );
}

function S2_Antecedentes({ ap, af, les, cir, alg, med, vac }: any) {
  const total = ap.length + af.length + les.length + cir.length + alg.length + med.length + vac.length;
  return (
    <SectionCard numero={2} titulo="Antecedentes Médicos" icon={<User size={16} />}>
      {total === 0 ? <Empty texto="Sin antecedentes registrados" /> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {ap.length > 0 && <div><SubTitle titulo="Personales" />{ap.map((a: any, i: number) => (
            <Item key={i}><p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: T.textPrimary }}>{a.nombre_enfermedad}</p>{a.codigo_cie11 && <p style={{ margin: '2px 0 0', fontSize: 11, color: T.textMuted }}>CIE-11: {a.codigo_cie11}</p>}{a.observaciones && <p style={{ margin: '4px 0 0', fontSize: 13, color: T.textSecondary }}>{a.observaciones}</p>}</Item>
          ))}</div>}
          {af.length > 0 && <div><SubTitle titulo="Familiares" />{af.map((f: any, i: number) => (
            <Item key={i}><div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}><p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: T.textPrimary }}>{f.nombre_enfermedad}</p>{f.tipo_familiar && <Badge label={f.tipo_familiar} />}</div>{f.codigo_cie11 && <p style={{ margin: '2px 0 0', fontSize: 11, color: T.textMuted }}>CIE-11: {f.codigo_cie11}</p>}</Item>
          ))}</div>}
          {alg.length > 0 && <div><SubTitle titulo="Alergias" />{alg.map((a: any, i: number) => (
            <Item key={i} accent={T.danger}><div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}><p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: T.textPrimary }}>{a.tipo_alergia || a.alergeno}</p>{a.severidad && <Badge label={a.severidad} color={T.danger} />}</div>{a.reaccion && <p style={{ margin: '4px 0 0', fontSize: 13, color: T.textSecondary }}>Reacción: {a.reaccion}</p>}{a.descripcion && <p style={{ margin: '4px 0 0', fontSize: 13, color: T.textSecondary }}>{a.descripcion}</p>}</Item>
          ))}</div>}
          {med.length > 0 && <div><SubTitle titulo="Medicaciones actuales" />{med.map((m: any, i: number) => (
            <Item key={i}><p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: T.textPrimary }}>{m.nombre_medicacion || m.nombre_medicamento || m.medicamento}</p>{(m.dosis || m.frecuencia) && <p style={{ margin: '2px 0 0', fontSize: 12, color: T.textSecondary }}>{[m.dosis, m.frecuencia].filter(Boolean).join(' · ')}</p>}</Item>
          ))}</div>}
          {les.length > 0 && <div><SubTitle titulo="Lesiones deportivas" />{les.map((l: any, i: number) => (
            <Item key={i}><p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: T.textPrimary }}>{l.descripcion || l.tipo_lesion}</p>{(l.fecha_ultima_lesion || l.fecha_lesion) && <p style={{ margin: '2px 0 0', fontSize: 12, color: T.textMuted }}>Última: {fmtFecha(l.fecha_ultima_lesion || l.fecha_lesion)}</p>}{l.observaciones && <p style={{ margin: '4px 0 0', fontSize: 13, color: T.textSecondary }}>{l.observaciones}</p>}</Item>
          ))}</div>}
          {cir.length > 0 && <div><SubTitle titulo="Cirugías previas" />{cir.map((c: any, i: number) => (
            <Item key={i}><p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: T.textPrimary }}>{c.tipo_cirugia}</p>{c.fecha_cirugia && <p style={{ margin: '2px 0 0', fontSize: 12, color: T.textMuted }}>{fmtFecha(c.fecha_cirugia)}</p>}</Item>
          ))}</div>}
          {vac.length > 0 && <div><SubTitle titulo="Vacunas" />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(180px,1fr))', gap: 8 }}>
              {vac.map((v: any, i: number) => (
                <div key={i} style={{ padding: '10px 12px', background: T.surfaceAlt, borderRadius: T.radiusSm, border: `1px solid ${T.border}` }}>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: T.textPrimary }}>{v.nombre_vacuna}</p>
                  {v.fecha_administracion && <p style={{ margin: '2px 0 0', fontSize: 11, color: T.textMuted }}>{fmtFecha(v.fecha_administracion)}</p>}
                </div>
              ))}
            </div>
          </div>}
        </div>
      )}
    </SectionCard>
  );
}

function S3_RevisionSistemas({ revision }: { revision: any[] }) {
  const hallazgos = revision.filter((r: any) => r.estado && r.estado.toLowerCase() !== 'normal');
  const normales  = revision.filter((r: any) => r.estado && r.estado.toLowerCase() === 'normal');
  return (
    <SectionCard numero={3} titulo="Revisión por Sistemas" icon={<Activity size={16} />}>
      {revision.length === 0 ? <Empty texto="Sin revisión por sistemas" /> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {hallazgos.length > 0 && <div><SubTitle titulo="Con hallazgos" />{hallazgos.map((r: any, i: number) => (
            <Item key={i} accent={T.warning}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: T.textPrimary, textTransform: 'capitalize' }}>{String(r.sistema_nombre || r.sistema || '').replace(/_/g, ' ')}</p>
                <Badge label={r.estado} color={T.warning} />
              </div>
              {r.observaciones && <p style={{ margin: '4px 0 0', fontSize: 13, color: T.textSecondary }}>{r.observaciones}</p>}
            </Item>
          ))}</div>}
          {normales.length > 0 && <div><SubTitle titulo="Sin alteraciones" />
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {normales.map((r: any, i: number) => <Badge key={i} label={String(r.sistema_nombre || r.sistema || '').replace(/_/g, ' ')} color={T.success} />)}
            </div>
          </div>}
        </div>
      )}
    </SectionCard>
  );
}

function S4_SignosVitales({ signos }: { signos: any[] }) {
  const s = signos[0] || {};
  const metricas = [
    { label: 'Frec. cardíaca',    valor: s.frecuencia_cardiaca_lpm    || s.frecuencia_cardiaca,    unidad: 'lpm'   },
    { label: 'Frec. respiratoria',valor: s.frecuencia_respiratoria_rpm || s.frecuencia_respiratoria,unidad: 'rpm'  },
    { label: 'Presión arterial',  valor: s.presion_arterial_sistolica ? `${s.presion_arterial_sistolica}/${s.presion_arterial_diastolica}` : s.presion_arterial, unidad: 'mmHg' },
    { label: 'Temperatura',       valor: s.temperatura_celsius         || s.temperatura,            unidad: '°C'   },
    { label: 'Sat. O₂',           valor: s.saturacion_oxigeno_percent  || s.saturacion_oxigeno,     unidad: '%'    },
    { label: 'Peso',              valor: s.peso_kg                     || s.peso,                   unidad: 'kg'   },
    { label: 'Estatura',          valor: s.estatura_cm                 || s.estatura,               unidad: 'cm'   },
    { label: 'IMC',               valor: s.imc,                                                     unidad: 'kg/m²'},
  ].filter(m => m.valor);
  return (
    <SectionCard numero={4} titulo="Signos Vitales y Antropometría" icon={<Activity size={16} />}>
      {metricas.length === 0 ? <Empty texto="Sin signos vitales registrados" /> : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(150px,1fr))', gap: 10 }}>
          {metricas.map((m, i) => (
            <div key={i} style={{ padding: '12px 14px', borderRadius: T.radiusSm, background: T.surfaceAlt, border: `1px solid ${T.border}`, textAlign: 'center' }}>
              <p style={{ margin: '0 0 4px', fontSize: 11, color: T.textMuted, fontWeight: 500 }}>{m.label}</p>
              <p style={{ margin: 0, fontSize: 20, fontWeight: 700, color: T.primary }}>
                {m.valor}<span style={{ fontSize: 11, fontWeight: 400, color: T.textMuted, marginLeft: 3 }}>{m.unidad}</span>
              </p>
            </div>
          ))}
        </div>
      )}
    </SectionCard>
  );
}

function S5_Exploracion({ exploracion }: { exploracion: any }) {
  if (!exploracion) return (
    <SectionCard numero={5} titulo="Exploración Física por Sistemas" icon={<Stethoscope size={16} />}>
      <Empty texto="Sin exploración física registrada" />
    </SectionCard>
  );
  const sistemas: [string, string | null][] = [
    ['Cardiovascular',    exploracion.sistema_cardiovascular    || exploracion.cardiovascular],
    ['Respiratorio',      exploracion.sistema_respiratorio      || exploracion.respiratorio],
    ['Digestivo',         exploracion.sistema_digestivo         || exploracion.digestivo],
    ['Neurológico',       exploracion.sistema_neurologico       || exploracion.neurologico],
    ['Musculoesquelético',exploracion.sistema_musculoesqueletico || exploracion.musculoesqueletico],
    ['Genitourinario',    exploracion.sistema_genitourinario    || exploracion.genitourinario],
    ['Piel y Faneras',    exploracion.sistema_integumentario    || exploracion.piel_faneras],
    ['Endocrino',         exploracion.sistema_endocrino         || exploracion.endocrino],
    ['Cabeza y Cuello',   exploracion.cabeza_cuello],
    ['Extremidades',      exploracion.extremidades],
  ].filter(([, v]) => v) as [string, string][];
  return (
    <SectionCard numero={5} titulo="Exploración Física por Sistemas" icon={<Stethoscope size={16} />}>
      {sistemas.length === 0 ? <Empty texto="Sin hallazgos registrados" /> : (
        <div>
          {sistemas.map(([n, v], i) => <DataRow key={i} label={n} value={v} />)}
          {exploracion.observaciones_generales && (
            <div style={{ marginTop: 12, padding: '12px 14px', background: T.primaryLight, borderRadius: T.radiusSm }}>
              <p style={{ margin: '0 0 4px', fontSize: 11, fontWeight: 600, color: T.primary }}>Observaciones generales</p>
              <p style={{ margin: 0, fontSize: 13, color: T.textPrimary }}>{exploracion.observaciones_generales}</p>
            </div>
          )}
        </div>
      )}
    </SectionCard>
  );
}

function S6_Pruebas({ pruebas }: { pruebas: any[] }) {
  if (pruebas.length === 0) return null;
  return (
    <SectionCard numero={6} titulo="Pruebas Complementarias / Ayudas Diagnósticas" icon={<FlaskConical size={16} />}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {pruebas.map((p: any, i: number) => (
          <div key={i} style={{ padding: '12px 14px', borderRadius: T.radiusSm, background: T.surfaceAlt, border: `1px solid ${T.border}` }}>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: T.textPrimary }}>{p.nombre_prueba}</p>
            {p.categoria && <p style={{ margin: '2px 0 0', fontSize: 11, color: T.textMuted }}>{p.categoria}{p.codigo_cups ? ` · CUPS: ${p.codigo_cups}` : ''}</p>}
            {p.resultado && <p style={{ margin: '6px 0 0', fontSize: 13, color: T.textSecondary }}>Resultado: {p.resultado}</p>}
          </div>
        ))}
      </div>
    </SectionCard>
  );
}

function S7_Diagnosticos({ diagnosticos }: { diagnosticos: any[] }) {
  const VIOLET = '#6366f1';
  return (
    <SectionCard numero={7} titulo="Diagnósticos" icon={<ClipboardList size={16} />} accent={VIOLET}>
      {diagnosticos.length === 0 ? <Empty texto="Sin diagnósticos registrados" /> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {diagnosticos.map((d: any, i: number) => (
            <div key={i} style={{ padding: '12px 14px', borderRadius: T.radiusSm, background: '#f5f3ff', border: '1px solid #e0e7ff', borderLeft: `3px solid ${VIOLET}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: T.textPrimary }}>{d.nombre_enfermedad || d.nombre_diagnostico}</p>
                {d.codigo_cie11 && <Badge label={`CIE-11: ${d.codigo_cie11}`} color={VIOLET} />}
              </div>
              {d.tipo_diagnostico && <p style={{ margin: '4px 0 0', fontSize: 12, color: VIOLET }}>{d.tipo_diagnostico}</p>}
              {d.observaciones && <p style={{ margin: '6px 0 0', fontSize: 13, color: T.textSecondary }}>{d.observaciones}</p>}
              {d.impresion_diagnostica && <p style={{ margin: '6px 0 0', fontSize: 13, color: T.textSecondary, fontStyle: 'italic' }}>Impresión: {d.impresion_diagnostica}</p>}
            </div>
          ))}
        </div>
      )}
    </SectionCard>
  );
}

function S8_PlanTratamiento({ planes, remisiones }: { planes: any[]; remisiones: any[] }) {
  const TEAL = '#0f766e';
  const p = planes[0] || {};
  const tienePlan = p.indicaciones_medicas || p.recomendaciones_entrenamiento || p.plan_seguimiento || p.tratamiento_farmacologico || p.recomendaciones;
  return (
    <SectionCard numero={8} titulo="Plan de Tratamiento" icon={<ClipboardList size={16} />} accent={TEAL}>
      {!tienePlan && remisiones.length === 0 ? <Empty texto="Sin plan de tratamiento registrado" /> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {p.indicaciones_medicas && <div style={{ padding: '12px 14px', background: '#f0fdfa', borderRadius: T.radiusSm, border: '1px solid #ccfbf1' }}><SubTitle titulo="Indicaciones médicas" /><p style={{ margin: 0, fontSize: 13, color: T.textPrimary, lineHeight: 1.6 }}>{p.indicaciones_medicas}</p></div>}
          {p.tratamiento_farmacologico && <div style={{ padding: '12px 14px', background: T.surfaceAlt, borderRadius: T.radiusSm, border: `1px solid ${T.border}` }}><SubTitle titulo="Tratamiento farmacológico" /><p style={{ margin: 0, fontSize: 13, color: T.textPrimary, lineHeight: 1.6 }}>{p.tratamiento_farmacologico}</p></div>}
          {p.recomendaciones_entrenamiento && <div style={{ padding: '12px 14px', background: T.surfaceAlt, borderRadius: T.radiusSm, border: `1px solid ${T.border}` }}><SubTitle titulo="Recomendaciones de entrenamiento" /><p style={{ margin: 0, fontSize: 13, color: T.textPrimary, lineHeight: 1.6 }}>{p.recomendaciones_entrenamiento}</p></div>}
          {p.plan_seguimiento && <div style={{ padding: '12px 14px', background: T.surfaceAlt, borderRadius: T.radiusSm, border: `1px solid ${T.border}` }}><SubTitle titulo="Plan de seguimiento" /><p style={{ margin: 0, fontSize: 13, color: T.textPrimary, lineHeight: 1.6 }}>{p.plan_seguimiento}</p></div>}
          {p.recomendaciones && <div style={{ padding: '12px 14px', background: T.surfaceAlt, borderRadius: T.radiusSm, border: `1px solid ${T.border}` }}><SubTitle titulo="Recomendaciones" /><p style={{ margin: 0, fontSize: 13, color: T.textPrimary, lineHeight: 1.6 }}>{p.recomendaciones}</p></div>}
          {remisiones.length > 0 && <div><SubTitle titulo="Remisiones a especialistas" />{remisiones.map((r: any, i: number) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '10px 14px', borderRadius: T.radiusSm, background: T.surfaceAlt, border: `1px solid ${T.border}`, marginBottom: 8, gap: 12 }}>
              <div><p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: T.textPrimary }}>{r.especialista}</p>{r.motivo && <p style={{ margin: '2px 0 0', fontSize: 13, color: T.textSecondary }}>{r.motivo}</p>}{r.fecha_remision && <p style={{ margin: '4px 0 0', fontSize: 11, color: T.textMuted }}>{fmtFecha(r.fecha_remision)}</p>}</div>
              {r.prioridad && <Badge label={r.prioridad} color={r.prioridad === 'Urgente' ? T.danger : r.prioridad === 'prioritaria' ? T.warning : T.primary} />}
            </div>
          ))}</div>}
        </div>
      )}
    </SectionCard>
  );
}

function S9_Aptitud({ aptitud }: { aptitud: any }) {
  const esApto = aptitud?.resultado === 'apto';
  return (
    <SectionCard numero={9} titulo="Aptitud Médica" icon={<ShieldCheck size={16} />} accent={aptitud?.resultado ? (esApto ? T.success : T.danger) : T.primary}>
      {!aptitud?.resultado ? <Empty texto="No se ha registrado declaración de aptitud médica" /> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 18, padding: '20px 24px', borderRadius: T.radius, background: esApto ? T.successBg : T.dangerBg, border: `2px solid ${esApto ? T.success : T.danger}` }}>
            <div style={{ width: 60, height: 60, borderRadius: '50%', background: esApto ? T.success : T.danger, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 28, fontWeight: 900, flexShrink: 0 }}>
              {esApto ? '✓' : '✗'}
            </div>
            <div>
              <p style={{ margin: 0, fontSize: 24, fontWeight: 900, color: esApto ? T.successText : T.dangerText, letterSpacing: '0.05em' }}>{esApto ? 'APTO' : 'NO APTO'}</p>
              {aptitud.tipo_aptitud && <p style={{ margin: '4px 0 0', fontSize: 13, color: esApto ? T.successText : T.dangerText }}>{aptitud.tipo_aptitud}</p>}
            </div>
          </div>
          {aptitud.observaciones && <div style={{ padding: '12px 14px', background: T.surfaceAlt, borderRadius: T.radiusSm, border: `1px solid ${T.border}` }}><SubTitle titulo="Observaciones" /><p style={{ margin: 0, fontSize: 13, color: T.textPrimary, lineHeight: 1.6 }}>{aptitud.observaciones}</p></div>}
          {aptitud.restricciones && <div style={{ padding: '12px 14px', background: T.warningBg, borderRadius: T.radiusSm, border: '1px solid #fde68a' }}><SubTitle titulo="Restricciones" /><p style={{ margin: 0, fontSize: 13, color: T.warningText, lineHeight: 1.6 }}>{aptitud.restricciones}</p></div>}
        </div>
      )}
    </SectionCard>
  );
}

// ── MODAL ────────────────────────────────────────────────────
function Modal({ onClose, children }: { onClose: () => void; children: React.ReactNode }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(15,23,42,0.55)' }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

// ── COMPONENTE PRINCIPAL ──────────────────────────────────────
interface Props { historiaId: string; onNavigate?: (view: string) => void; }

export function VistaHistoriaClinica({ historiaId, onNavigate }: Props) {
  const navigate = useNavigate();

  const [historia,  setHistoria]  = useState<any>(null);
  const [loading,   setLoading]   = useState(true);
  const [busy,      setBusy]      = useState(false);

  const [modal,     setModal]     = useState(false);
  const [accion,    setAccion]    = useState<Accion>(null);
  const [paso,      setPaso]      = useState<1 | 2>(1);
  const [tipoDoc,   setTipoDoc]   = useState<TipoDoc | null>(null);
  const [secciones, setSecciones] = useState<string[]>(SECCIONES.map(s => s.id));

  useEffect(() => { cargar(); }, [historiaId]);

  // ── Carga inicial — usa api (axios) para enviar el token automáticamente
  const cargar = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/documentos/${historiaId}/datos-completos`);
      setHistoria(normalizar(res.data));
    } catch {
      try { setHistoria(normalizar(await historiaClinicaService.getById(historiaId))); }
      catch { toast.error('Error cargando historia clínica'); }
    } finally { setLoading(false); }
  };

  const volver = () => onNavigate ? onNavigate('historia') : navigate('/historia');

  // ── Modal helpers ──────────────────────────────────────────
  const abrirModal = (a: Accion) => {
    setAccion(a);
    setPaso(1);
    setTipoDoc(null);
    setSecciones(SECCIONES.map(s => s.id));
    setModal(true);
  };

  const elegirTipo = (t: TipoDoc) => {
    setTipoDoc(t);
    if (t.tieneSecciones) { setPaso(2); }
    else { setModal(false); ejecutar(t, []); }
  };

  const confirmarSecciones = () => {
    if (secciones.length === 0) { toast.error('Selecciona al menos una sección'); return; }
    setModal(false);
    ejecutar(tipoDoc!, secciones);
  };

  // Construye el path relativo para axios (sin el base URL)
  const buildPath = (t: TipoDoc, secs: string[], inline = false) => {
    const path = `/documentos/${historiaId}/${t.endpoint}`;
    const p    = new URLSearchParams();
    if (inline) p.set('inline', 'true');
    if (t.tieneSecciones && secs.length < SECCIONES.length) p.set('secciones', secs.join(','));
    const qs = p.toString();
    return qs ? `${path}?${qs}` : path;
  };

  // Descarga un blob via axios y lo ofrece como descarga o abre en pestaña
  const descargarBlob = async (path: string, filename: string, abrir = false) => {
    const res  = await api.get(path, { responseType: 'blob' });
    const blob = new Blob([res.data], { type: 'application/pdf' });
    const url  = URL.createObjectURL(blob);
    if (abrir) {
      window.open(url, '_blank');
    } else {
      const a    = document.createElement('a');
      a.href     = url;
      a.download = filename;
      a.click();
    }
    setTimeout(() => URL.revokeObjectURL(url), 10_000);
  };

  // ── Ejecutar acción — todo via axios, token automático ─────
  const ejecutar = async (t: TipoDoc, secs: string[]) => {
    const dep    = historia?.deportista || {};
    const docNum = dep.numero_documento || historiaId.slice(0, 8);
    const nombre = `${t.id}_${docNum}.pdf`;

    switch (accion) {

      case 'pdf':
        try {
          setBusy(true);
          await descargarBlob(buildPath(t, secs), nombre);
          toast.success('Documento descargado');
        } catch { toast.error('Error al descargar'); }
        finally { setBusy(false); }
        break;

      case 'imprimir':
        try {
          setBusy(true);
          await descargarBlob(buildPath(t, secs, true), nombre, true);
        } catch { toast.error('Error al abrir el documento'); }
        finally { setBusy(false); }
        break;

      case 'email': {
        const email = dep.email;
        if (!email) { toast.error('El deportista no tiene correo registrado'); return; }
        if (t.id === 'historia_clinica') {
          try {
            setBusy(true);
            const params = new URLSearchParams({ email_destino: email });
            if (secs.length < SECCIONES.length) params.set('secciones', secs.join(','));
            const res = await api.post(`/documentos/${historiaId}/enviar-email?${params}`);
            if (res.data?.success) toast.success(`Correo enviado a ${email}`);
            else abrirMailto(t, secs, dep);
          } catch { abrirMailto(t, secs, dep); }
          finally { setBusy(false); }
        } else {
          // Para epicrisis, receta e interconsulta: descarga y abre el mailto
          abrirMailto(t, secs, dep);
        }
        break;
      }

      case 'whatsapp': {
        // Descarga el PDF localmente y abre WhatsApp con mensaje
        try {
          setBusy(true);
          const res  = await api.get(buildPath(t, secs), { responseType: 'blob' });
          const blob = new Blob([res.data], { type: 'application/pdf' });
          const url  = URL.createObjectURL(blob);
          const nom  = `${dep.nombres || ''} ${dep.apellidos || ''}`.trim();
          // Abre el PDF en nueva pestaña para que el usuario lo comparta
          window.open(url, '_blank');
          window.open(
            `https://wa.me/?text=${encodeURIComponent(`Documento: *${t.nombre}* — ${nom}`)}`,
            '_blank'
          );
          setTimeout(() => URL.revokeObjectURL(url), 10_000);
        } catch { toast.error('Error al generar el documento'); }
        finally { setBusy(false); }
        break;
      }
    }
  };

  const abrirMailto = (t: TipoDoc, secs: string[], dep: any) => {
    // Construye la URL completa para incluir en el email
    const API = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
    const base = `${API}${buildPath(t, secs)}`;
    const sub  = encodeURIComponent(`${t.nombre} — ${dep.nombres} ${dep.apellidos}`);
    const bod  = encodeURIComponent(
      `Estimado(a) ${dep.nombres},\n\nAdjunto el documento "${t.nombre}".\n\nINDERHUILA`
    );
    window.open(`mailto:${dep.email}?subject=${sub}&body=${bod}`);
  };

  // ── Render ─────────────────────────────────────────────────
  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', flexDirection: 'column', gap: 12 }}>
      <Loader2 size={28} style={{ color: T.primary, animation: 'spin 0.8s linear infinite' }} />
      <p style={{ margin: 0, fontSize: 13, color: T.textMuted }}>Cargando historia clínica...</p>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  if (!historia) return (
    <div style={{ padding: 24 }}>
      <button onClick={volver} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', cursor: 'pointer', color: T.primary, fontSize: 13, fontWeight: 600, padding: 0 }}>
        <ArrowLeft size={16} /> Volver
      </button>
      <div style={{ marginTop: 16, padding: 16, background: T.dangerBg, borderRadius: T.radiusSm, color: T.dangerText, fontSize: 13 }}>Historia clínica no encontrada</div>
    </div>
  );

  const dep = historia.deportista || {};
  const mot = historia.motivo_consulta_enfermedad || null;
  const exp = historia.exploracion_fisica_sistemas || null;
  const apt = historia.aptitud_medica || null;

  const BTNS: { a: Accion; label: string; icon: React.ReactNode; color: string }[] = [
    { a: 'pdf',      label: 'PDF',      icon: <Download size={14} />,      color: '#dc2626' },
    { a: 'email',    label: 'Email',    icon: <Mail size={14} />,          color: '#2563eb' },
    { a: 'whatsapp', label: 'WhatsApp', icon: <MessageCircle size={14} />, color: '#16a34a' },
    { a: 'imprimir', label: 'Imprimir', icon: <Printer size={14} />,       color: '#475569' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 900, margin: '0 auto' }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} @media print{.np{display:none!important}}`}</style>

      <button onClick={volver} className="np" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', cursor: 'pointer', color: T.primary, fontSize: 13, fontWeight: 600, padding: 0, width: 'fit-content' }}>
        <ArrowLeft size={16} /> Volver al listado
      </button>

      {/* HEADER */}
      <div style={{ background: T.surface, borderRadius: T.radius, border: `1px solid ${T.border}`, boxShadow: T.shadowMd, overflow: 'hidden' }}>
        <div style={{ background: `linear-gradient(135deg,${T.primary} 0%,${T.primaryMid} 100%)`, padding: '20px 24px' }}>
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: '#fff' }}>Historia Clínica — {dep.nombres} {dep.apellidos}</h1>
          <p style={{ margin: '4px 0 0', fontSize: 12, color: 'rgba(255,255,255,0.75)' }}>INDERHUILA — Instituto Departamental de Recreación y Deportes del Huila</p>
        </div>
        <div style={{ padding: '16px 24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(180px,1fr))', gap: 16 }}>
            <InfoField label="Documento"       value={dep.numero_documento} />
            <InfoField label="Fecha nacimiento" value={fmtFecha(dep.fecha_nacimiento)} />
            <InfoField label="Teléfono"         value={dep.telefono} />
            <InfoField label="Email"            value={dep.email} />
            <InfoField label="Fecha apertura"   value={fmtFecha(historia.fecha_apertura)} />
            <InfoField label="Deporte"          value={dep.deporte || dep.tipo_deporte} />
          </div>
        </div>
        <div className="np" style={{ padding: '12px 24px', borderTop: `1px solid ${T.borderLight}`, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {BTNS.map(({ a, label, icon, color }) => (
            <button key={a} onClick={() => abrirModal(a)} disabled={busy}
              style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '8px 16px', borderRadius: T.radiusSm, border: 'none', background: color, color: '#fff', fontSize: 13, fontWeight: 600, cursor: busy ? 'not-allowed' : 'pointer', opacity: busy ? 0.7 : 1 }}>
              {icon} {label}
            </button>
          ))}
        </div>
      </div>

      {/* SECCIONES */}
      <S1_MotivoConsulta motivo={mot} />
      <S2_Antecedentes
        ap={historia.antecedentes_personales || []}
        af={historia.antecedentes_familiares || []}
        les={historia.lesiones_deportivas || []}
        cir={historia.cirugias_previas || []}
        alg={historia.alergias || []}
        med={historia.medicaciones || []}
        vac={historia.vacunas_administradas || []}
      />
      <S3_RevisionSistemas revision={historia.revision_sistemas || []} />
      <S4_SignosVitales signos={historia.signos_vitales || []} />
      <S5_Exploracion exploracion={exp} />
      <S6_Pruebas pruebas={historia.pruebas_complementarias || []} />
      <S7_Diagnosticos diagnosticos={historia.diagnosticos || []} />
      <S8_PlanTratamiento
        planes={Array.isArray(historia.plan_tratamiento) ? historia.plan_tratamiento : historia.plan_tratamiento ? [historia.plan_tratamiento] : []}
        remisiones={historia.remisiones_especialistas || []}
      />
      <S9_Aptitud aptitud={apt} />

      {/* ── MODAL ── */}
      {modal && (
        <Modal onClose={() => setModal(false)}>
          {/* Header */}
          <div style={{ background: T.primary, padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#fff' }}>
                {paso === 1 ? 'Tipo de documento' : 'Seleccionar secciones'}
              </h3>
              <p style={{ margin: '3px 0 0', fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>
                {paso === 1
                  ? { pdf: 'Elige qué documento descargar', email: 'Elige qué documento enviar', whatsapp: 'Elige qué compartir', imprimir: 'Elige qué imprimir' }[accion!]
                  : 'Elige qué incluir en la historia clínica'}
              </p>
            </div>
            <button onClick={() => setModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.8)', display: 'flex' }}>
              <X size={18} />
            </button>
          </div>

          {/* Paso 1 — tipos de documento */}
          {paso === 1 && (
            <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {TIPOS_DOC.map(t => {
                const Ic = t.icon;
                return (
                  <button key={t.id} onClick={() => elegirTipo(t)}
                    style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', borderRadius: T.radiusSm, border: `1.5px solid ${T.border}`, background: T.surface, cursor: 'pointer', textAlign: 'left', width: '100%', transition: 'all 0.12s' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = t.bg; (e.currentTarget as HTMLElement).style.borderColor = t.color + '55'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = T.surface; (e.currentTarget as HTMLElement).style.borderColor = T.border; }}
                  >
                    <div style={{ width: 42, height: 42, borderRadius: T.radiusSm, background: t.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: t.color }}>
                      <Ic size={20} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: t.color }}>{t.nombre}</p>
                      <p style={{ margin: '2px 0 0', fontSize: 11, color: T.textMuted }}>{t.desc}</p>
                    </div>
                    <ChevronRight size={15} style={{ color: T.textMuted, flexShrink: 0 }} />
                  </button>
                );
              })}
            </div>
          )}

          {/* Paso 2 — secciones (solo historia clínica) */}
          {paso === 2 && (
            <>
              <div style={{ padding: '10px 20px 0', display: 'flex', gap: 12 }}>
                <button onClick={() => setSecciones(SECCIONES.map(s => s.id))} style={{ fontSize: 11, color: T.primary, background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>Todas</button>
                <button onClick={() => setSecciones([])} style={{ fontSize: 11, color: T.textMuted, background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>Ninguna</button>
              </div>
              <div style={{ padding: '8px 20px', display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 320, overflowY: 'auto' }}>
                {SECCIONES.map(s => {
                  const sel = secciones.includes(s.id);
                  return (
                    <button key={s.id} onClick={() => setSecciones(prev => prev.includes(s.id) ? prev.filter(x => x !== s.id) : [...prev, s.id])}
                      style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: T.radiusSm, border: `1px solid ${sel ? T.primary : T.border}`, background: sel ? T.primaryLight : T.surface, cursor: 'pointer', textAlign: 'left', width: '100%' }}>
                      {sel
                        ? <CheckSquare size={16} style={{ color: T.primary, flexShrink: 0 }} />
                        : <Square size={16} style={{ color: T.textMuted, flexShrink: 0 }} />}
                      <span style={{ fontSize: 13, color: sel ? T.primary : T.textSecondary, fontWeight: sel ? 600 : 400 }}>{s.numero}. {s.nombre}</span>
                    </button>
                  );
                })}
              </div>
              <div style={{ padding: '12px 20px', borderTop: `1px solid ${T.borderLight}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <button onClick={() => setPaso(1)} style={{ fontSize: 13, color: T.textSecondary, background: 'none', border: 'none', cursor: 'pointer' }}>← Volver</button>
                <button onClick={confirmarSecciones} disabled={secciones.length === 0}
                  style={{ padding: '8px 20px', background: T.primary, color: '#fff', border: 'none', borderRadius: T.radiusSm, fontSize: 13, fontWeight: 600, cursor: secciones.length === 0 ? 'not-allowed' : 'pointer', opacity: secciones.length === 0 ? 0.5 : 1 }}>
                  Continuar ({secciones.length})
                </button>
              </div>
            </>
          )}
        </Modal>
      )}
    </div>
  );
}

export default VistaHistoriaClinica;