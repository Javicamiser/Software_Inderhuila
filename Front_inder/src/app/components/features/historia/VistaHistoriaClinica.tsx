// ============================================================
// VISTA HISTORIA CLÍNICA
// Diseño: WAP Enterprise SAS — Sistema Médico INDERHUILA
//
// ESTRUCTURA PARA ESCALAR:
//   1. TOKENS  — colores, radios, sombras. Editar aquí = cambia todo.
//   2. ÁTOMOS  — Badge, InfoField, SectionCard, etc. Reutilizables.
//   3. SECCIONES — cada sección es una función independiente.
//   4. COMPONENTE PRINCIPAL — orquesta todo.
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
  ClipboardList, ShieldCheck,
} from 'lucide-react';
import { historiaClinicaService } from '@/app/services/apiClient';

// ── 1. TOKENS ────────────────────────────────────────────────
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

// ── Utilidades ────────────────────────────────────────────────
const fmtFecha = (d?: string | null) =>
  d ? format(new Date(d + 'T12:00:00'), 'd MMM yyyy', { locale: es }) : '—';
const fmtFechaHora = (d?: string | null) =>
  d ? format(new Date(d), 'd MMM yyyy HH:mm', { locale: es }) : '—';

// ── 2. ÁTOMOS ────────────────────────────────────────────────
function Badge({ label, color = T.primary }: { label: string; color?: string }) {
  return (
    <span style={{ display:'inline-flex', alignItems:'center', fontSize:11, fontWeight:600, padding:'3px 10px', borderRadius:20, background:`${color}18`, color }}>{label}</span>
  );
}

function InfoField({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <p style={{ margin:'0 0 3px', fontSize:11, fontWeight:600, color:T.textMuted, textTransform:'uppercase', letterSpacing:'0.05em' }}>{label}</p>
      <p style={{ margin:0, fontSize:14, color:T.textPrimary, fontWeight:500 }}>{value || '—'}</p>
    </div>
  );
}

function SectionCard({ numero, titulo, icon, children, accent = T.primary }:
  { numero?: number; titulo: string; icon?: React.ReactNode; children: React.ReactNode; accent?: string }) {
  return (
    <div style={{ background:T.surface, borderRadius:T.radius, border:`1px solid ${T.border}`, overflow:'hidden', boxShadow:T.shadow }}>
      <div style={{ display:'flex', alignItems:'center', gap:12, padding:'14px 20px', borderBottom:`1px solid ${T.borderLight}`, background:T.surfaceAlt }}>
        {icon && (
          <div style={{ width:32, height:32, borderRadius:T.radiusSm, background:`${accent}15`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, color:accent }}>{icon}</div>
        )}
        <div style={{ display:'flex', alignItems:'baseline', gap:8 }}>
          {numero && <span style={{ fontSize:11, fontWeight:700, color:T.textMuted }}>{numero}.</span>}
          <h2 style={{ margin:0, fontSize:14, fontWeight:700, color:T.textPrimary }}>{titulo}</h2>
        </div>
      </div>
      <div style={{ padding:'16px 20px' }}>{children}</div>
    </div>
  );
}

function Empty({ texto }: { texto: string }) {
  return <p style={{ margin:0, fontSize:13, color:T.textMuted, fontStyle:'italic' }}>{texto}</p>;
}

function DataRow({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', padding:'10px 0', borderBottom:`1px solid ${T.borderLight}`, gap:16 }}>
      <span style={{ fontSize:13, color:T.textSecondary, fontWeight:500, flexShrink:0 }}>{label}</span>
      <span style={{ fontSize:13, color:T.textPrimary, textAlign:'right' }}>{value}</span>
    </div>
  );
}

function Item({ children, accent = T.primary }: { children: React.ReactNode; accent?: string }) {
  return (
    <div style={{ padding:'12px 14px', borderRadius:T.radiusSm, background:T.surfaceAlt, border:`1px solid ${T.borderLight}`, borderLeft:`3px solid ${accent}`, marginBottom:8 }}>{children}</div>
  );
}

function SubTitle({ titulo }: { titulo: string }) {
  return <p style={{ margin:'0 0 8px', fontSize:11, fontWeight:700, color:T.primary, textTransform:'uppercase', letterSpacing:'0.06em' }}>{titulo}</p>;
}

// ── 3. SECCIONES ─────────────────────────────────────────────

function S1_MotivoConsulta({ motivo }: { motivo: any }) {
  return (
    <SectionCard numero={1} titulo="Motivo de Consulta y Enfermedad Actual" icon={<FileText size={16} />}>
      {!motivo ? <Empty texto="No registrado" /> : (
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
          {motivo.motivo_consulta && (
            <div>
              <SubTitle titulo="Motivo de consulta" />
              <p style={{ margin:0, fontSize:14, color:T.textPrimary, lineHeight:1.6 }}>{motivo.motivo_consulta}</p>
            </div>
          )}
          {motivo.enfermedad_actual && (
            <div>
              <SubTitle titulo="Enfermedad actual / Anamnesis" />
              <p style={{ margin:0, fontSize:14, color:T.textPrimary, lineHeight:1.6 }}>{motivo.enfermedad_actual}</p>
            </div>
          )}
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
        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
          {ap.length > 0 && <div><SubTitle titulo="Personales" />{ap.map((a: any, i: number) => (
            <Item key={i}><p style={{ margin:0, fontSize:13, fontWeight:600, color:T.textPrimary }}>{a.nombre_enfermedad}</p>{a.codigo_cie11 && <p style={{ margin:'2px 0 0', fontSize:11, color:T.textMuted }}>CIE-11: {a.codigo_cie11}</p>}{a.observaciones && <p style={{ margin:'4px 0 0', fontSize:13, color:T.textSecondary }}>{a.observaciones}</p>}</Item>
          ))}</div>}
          {af.length > 0 && <div><SubTitle titulo="Familiares" />{af.map((f: any, i: number) => (
            <Item key={i}><div style={{ display:'flex', justifyContent:'space-between', gap:8 }}><p style={{ margin:0, fontSize:13, fontWeight:600, color:T.textPrimary }}>{f.nombre_enfermedad}</p>{f.tipo_familiar && <Badge label={f.tipo_familiar} />}</div>{f.codigo_cie11 && <p style={{ margin:'2px 0 0', fontSize:11, color:T.textMuted }}>CIE-11: {f.codigo_cie11}</p>}</Item>
          ))}</div>}
          {alg.length > 0 && <div><SubTitle titulo="Alergias" />{alg.map((a: any, i: number) => (
            <Item key={i} accent={T.danger}><div style={{ display:'flex', justifyContent:'space-between', gap:8 }}><p style={{ margin:0, fontSize:13, fontWeight:600, color:T.textPrimary }}>{a.alergeno}</p>{a.severidad && <Badge label={a.severidad} color={T.danger} />}</div>{a.reaccion && <p style={{ margin:'4px 0 0', fontSize:13, color:T.textSecondary }}>Reacción: {a.reaccion}</p>}</Item>
          ))}</div>}
          {med.length > 0 && <div><SubTitle titulo="Medicaciones actuales" />{med.map((m: any, i: number) => (
            <Item key={i}><p style={{ margin:0, fontSize:13, fontWeight:600, color:T.textPrimary }}>{m.medicamento}</p>{(m.dosis||m.frecuencia) && <p style={{ margin:'2px 0 0', fontSize:12, color:T.textSecondary }}>{[m.dosis,m.frecuencia].filter(Boolean).join(' · ')}</p>}</Item>
          ))}</div>}
          {les.length > 0 && <div><SubTitle titulo="Lesiones deportivas" />{les.map((l: any, i: number) => (
            <Item key={i}><p style={{ margin:0, fontSize:13, fontWeight:600, color:T.textPrimary }}>{l.tipo_lesion}</p>{l.fecha_ultima_lesion && <p style={{ margin:'2px 0 0', fontSize:12, color:T.textMuted }}>Última: {fmtFecha(l.fecha_ultima_lesion)}</p>}{l.tratamiento && <p style={{ margin:'4px 0 0', fontSize:13, color:T.textSecondary }}>{l.tratamiento}</p>}</Item>
          ))}</div>}
          {cir.length > 0 && <div><SubTitle titulo="Cirugías previas" />{cir.map((c: any, i: number) => (
            <Item key={i}><p style={{ margin:0, fontSize:13, fontWeight:600, color:T.textPrimary }}>{c.tipo_cirugia}</p>{c.fecha_cirugia && <p style={{ margin:'2px 0 0', fontSize:12, color:T.textMuted }}>{fmtFecha(c.fecha_cirugia)}</p>}</Item>
          ))}</div>}
          {vac.length > 0 && <div><SubTitle titulo="Vacunas" />
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(180px,1fr))', gap:8 }}>
              {vac.map((v: any, i: number) => (
                <div key={i} style={{ padding:'10px 12px', background:T.surfaceAlt, borderRadius:T.radiusSm, border:`1px solid ${T.border}` }}>
                  <p style={{ margin:0, fontSize:13, fontWeight:600, color:T.textPrimary }}>{v.nombre_vacuna}</p>
                  {v.fecha_administracion && <p style={{ margin:'2px 0 0', fontSize:11, color:T.textMuted }}>{fmtFecha(v.fecha_administracion)}</p>}
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
  const hallazgos = revision.filter((r: any) => r.estado && r.estado !== 'normal');
  const normales  = revision.filter((r: any) => r.estado === 'normal');
  return (
    <SectionCard numero={3} titulo="Revisión por Sistemas" icon={<Activity size={16} />}>
      {revision.length === 0 ? <Empty texto="Sin revisión por sistemas" /> : (
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
          {hallazgos.length > 0 && <div>
            <SubTitle titulo="Con hallazgos" />
            {hallazgos.map((r: any, i: number) => (
              <Item key={i} accent={T.warning}>
                <div style={{ display:'flex', justifyContent:'space-between', gap:8 }}>
                  <p style={{ margin:0, fontSize:13, fontWeight:600, color:T.textPrimary, textTransform:'capitalize' }}>{String(r.sistema||'').replace(/_/g,' ')}</p>
                  <Badge label={r.estado} color={T.warning} />
                </div>
                {r.observaciones && <p style={{ margin:'4px 0 0', fontSize:13, color:T.textSecondary }}>{r.observaciones}</p>}
              </Item>
            ))}
          </div>}
          {normales.length > 0 && <div>
            <SubTitle titulo="Sin alteraciones" />
            <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
              {normales.map((r: any, i: number) => <Badge key={i} label={String(r.sistema||'').replace(/_/g,' ')} color={T.success} />)}
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
    { label:'Frec. cardíaca',   valor:s.frecuencia_cardiaca,    unidad:'bpm'   },
    { label:'Frec. respiratoria',valor:s.frecuencia_respiratoria,unidad:'rpm'  },
    { label:'Presión arterial', valor:s.presion_arterial,       unidad:'mmHg'  },
    { label:'Temperatura',      valor:s.temperatura,            unidad:'°C'    },
    { label:'Sat. O₂',         valor:s.saturacion_oxigeno,     unidad:'%'     },
    { label:'Peso',             valor:s.peso,                   unidad:'kg'    },
    { label:'Estatura',         valor:s.estatura,               unidad:'cm'    },
    { label:'IMC',              valor:s.imc,                    unidad:'kg/m²' },
  ].filter(m => m.valor);
  return (
    <SectionCard numero={4} titulo="Signos Vitales y Antropometría" icon={<Activity size={16} />}>
      {metricas.length === 0 ? <Empty texto="Sin signos vitales registrados" /> : (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(150px,1fr))', gap:10 }}>
          {metricas.map((m,i) => (
            <div key={i} style={{ padding:'12px 14px', borderRadius:T.radiusSm, background:T.surfaceAlt, border:`1px solid ${T.border}`, textAlign:'center' }}>
              <p style={{ margin:'0 0 4px', fontSize:11, color:T.textMuted, fontWeight:500 }}>{m.label}</p>
              <p style={{ margin:0, fontSize:20, fontWeight:700, color:T.primary }}>
                {m.valor}<span style={{ fontSize:11, fontWeight:400, color:T.textMuted, marginLeft:3 }}>{m.unidad}</span>
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
  const sistemas = [
    ['Cardiovascular', exploracion.cardiovascular],
    ['Respiratorio', exploracion.respiratorio],
    ['Digestivo', exploracion.digestivo],
    ['Neurológico', exploracion.neurologico],
    ['Musculoesquelético', exploracion.musculoesqueletico],
    ['Genitourinario', exploracion.genitourinario],
    ['Piel y Faneras', exploracion.piel_faneras],
    ['Endocrino', exploracion.endocrino],
    ['Cabeza y Cuello', exploracion.cabeza_cuello],
    ['Extremidades', exploracion.extremidades],
  ].filter(([,v]) => v);
  return (
    <SectionCard numero={5} titulo="Exploración Física por Sistemas" icon={<Stethoscope size={16} />}>
      {sistemas.length === 0 ? <Empty texto="Sin hallazgos registrados" /> : (
        <div>
          {sistemas.map(([n,v],i) => <DataRow key={i} label={n as string} value={v as string} />)}
          {exploracion.observaciones_generales && (
            <div style={{ marginTop:12, padding:'12px 14px', background:T.primaryLight, borderRadius:T.radiusSm }}>
              <p style={{ margin:'0 0 4px', fontSize:11, fontWeight:600, color:T.primary }}>Observaciones generales</p>
              <p style={{ margin:0, fontSize:13, color:T.textPrimary }}>{exploracion.observaciones_generales}</p>
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
      <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
        {pruebas.map((p:any,i:number) => (
          <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', padding:'12px 14px', borderRadius:T.radiusSm, background:T.surfaceAlt, border:`1px solid ${T.border}`, gap:12 }}>
            <div style={{ flex:1 }}>
              <p style={{ margin:0, fontSize:13, fontWeight:600, color:T.textPrimary }}>{p.nombre_prueba}</p>
              {p.categoria && <p style={{ margin:'2px 0 0', fontSize:11, color:T.textMuted }}>{p.categoria}{p.codigo_cups?` · CUPS: ${p.codigo_cups}`:''}</p>}
              {p.resultado && <p style={{ margin:'6px 0 0', fontSize:13, color:T.textSecondary }}>Resultado: {p.resultado}</p>}
            </div>
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
        <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
          {diagnosticos.map((d:any,i:number) => (
            <div key={i} style={{ padding:'12px 14px', borderRadius:T.radiusSm, background:'#f5f3ff', border:'1px solid #e0e7ff', borderLeft:`3px solid ${VIOLET}` }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:8 }}>
                <p style={{ margin:0, fontSize:13, fontWeight:600, color:T.textPrimary }}>{d.nombre_enfermedad}</p>
                {d.codigo_cie11 && <Badge label={`CIE-11: ${d.codigo_cie11}`} color={VIOLET} />}
              </div>
              {d.tipo_diagnostico && <p style={{ margin:'4px 0 0', fontSize:12, color:VIOLET }}>{d.tipo_diagnostico}</p>}
              {d.observaciones && <p style={{ margin:'6px 0 0', fontSize:13, color:T.textSecondary }}>{d.observaciones}</p>}
              {d.impresion_diagnostica && <p style={{ margin:'6px 0 0', fontSize:13, color:T.textSecondary, fontStyle:'italic' }}>Impresión: {d.impresion_diagnostica}</p>}
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
  const tienePlan = p.indicaciones_medicas || p.recomendaciones_entrenamiento || p.plan_seguimiento;
  return (
    <SectionCard numero={8} titulo="Plan de Tratamiento" icon={<ClipboardList size={16} />} accent={TEAL}>
      {!tienePlan && remisiones.length === 0 ? <Empty texto="Sin plan de tratamiento registrado" /> : (
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
          {p.indicaciones_medicas && (
            <div style={{ padding:'12px 14px', background:'#f0fdfa', borderRadius:T.radiusSm, border:'1px solid #ccfbf1' }}>
              <SubTitle titulo="Indicaciones médicas" />
              <p style={{ margin:0, fontSize:13, color:T.textPrimary, lineHeight:1.6 }}>{p.indicaciones_medicas}</p>
            </div>
          )}
          {p.recomendaciones_entrenamiento && (
            <div style={{ padding:'12px 14px', background:T.surfaceAlt, borderRadius:T.radiusSm, border:`1px solid ${T.border}` }}>
              <SubTitle titulo="Recomendaciones de entrenamiento" />
              <p style={{ margin:0, fontSize:13, color:T.textPrimary, lineHeight:1.6 }}>{p.recomendaciones_entrenamiento}</p>
            </div>
          )}
          {p.plan_seguimiento && (
            <div style={{ padding:'12px 14px', background:T.surfaceAlt, borderRadius:T.radiusSm, border:`1px solid ${T.border}` }}>
              <SubTitle titulo="Plan de seguimiento" />
              <p style={{ margin:0, fontSize:13, color:T.textPrimary, lineHeight:1.6 }}>{p.plan_seguimiento}</p>
            </div>
          )}
          {remisiones.length > 0 && (
            <div>
              <SubTitle titulo="Remisiones a especialistas" />
              {remisiones.map((r:any,i:number) => (
                <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', padding:'10px 14px', borderRadius:T.radiusSm, background:T.surfaceAlt, border:`1px solid ${T.border}`, marginBottom:8, gap:12 }}>
                  <div>
                    <p style={{ margin:0, fontSize:13, fontWeight:600, color:T.textPrimary }}>{r.especialista}</p>
                    {r.motivo && <p style={{ margin:'2px 0 0', fontSize:13, color:T.textSecondary }}>{r.motivo}</p>}
                    {r.fecha_remision && <p style={{ margin:'4px 0 0', fontSize:11, color:T.textMuted }}>{fmtFecha(r.fecha_remision)}</p>}
                  </div>
                  {r.prioridad && <Badge label={r.prioridad} color={r.prioridad==='urgente'?T.danger:r.prioridad==='prioritaria'?T.warning:T.primary} />}
                </div>
              ))}
            </div>
          )}
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
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
          <div style={{ display:'flex', alignItems:'center', gap:18, padding:'20px 24px', borderRadius:T.radius, background:esApto?T.successBg:T.dangerBg, border:`2px solid ${esApto?T.success:T.danger}` }}>
            <div style={{ width:60, height:60, borderRadius:'50%', background:esApto?T.success:T.danger, display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontSize:28, fontWeight:900, flexShrink:0 }}>
              {esApto ? '✓' : '✗'}
            </div>
            <div>
              <p style={{ margin:0, fontSize:24, fontWeight:900, color:esApto?T.successText:T.dangerText, letterSpacing:'0.05em' }}>
                {esApto ? 'APTO' : 'NO APTO'}
              </p>
              {aptitud.tipo_aptitud && <p style={{ margin:'4px 0 0', fontSize:13, color:esApto?T.successText:T.dangerText }}>{aptitud.tipo_aptitud}</p>}
            </div>
          </div>
          {aptitud.observaciones && (
            <div style={{ padding:'12px 14px', background:T.surfaceAlt, borderRadius:T.radiusSm, border:`1px solid ${T.border}` }}>
              <SubTitle titulo="Observaciones" />
              <p style={{ margin:0, fontSize:13, color:T.textPrimary, lineHeight:1.6 }}>{aptitud.observaciones}</p>
            </div>
          )}
          {aptitud.restricciones && (
            <div style={{ padding:'12px 14px', background:T.warningBg, borderRadius:T.radiusSm, border:'1px solid #fde68a' }}>
              <SubTitle titulo="Restricciones" />
              <p style={{ margin:0, fontSize:13, color:T.warningText, lineHeight:1.6 }}>{aptitud.restricciones}</p>
            </div>
          )}
        </div>
      )}
    </SectionCard>
  );
}

// ── 4. COMPONENTE PRINCIPAL ───────────────────────────────────
const SECCIONES = [
  { id:'motivo_consulta',         numero:1, nombre:'Motivo de Consulta'         },
  { id:'antecedentes',            numero:2, nombre:'Antecedentes Médicos'       },
  { id:'revision_sistemas',       numero:3, nombre:'Revisión por Sistemas'      },
  { id:'signos_vitales',          numero:4, nombre:'Signos Vitales'             },
  { id:'exploracion_fisica',      numero:5, nombre:'Exploración Física'         },
  { id:'pruebas_complementarias', numero:6, nombre:'Pruebas Complementarias'    },
  { id:'diagnosticos',            numero:7, nombre:'Diagnósticos'               },
  { id:'plan_tratamiento',        numero:8, nombre:'Plan de Tratamiento'        },
  { id:'aptitud',                 numero:9, nombre:'Aptitud Médica'             },
];

type Accion = 'pdf' | 'email' | 'whatsapp' | 'imprimir' | null;

interface Props { historiaId: string; onNavigate?: (view: string) => void; }

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

export function VistaHistoriaClinica({ historiaId, onNavigate }: Props) {
  const navigate = useNavigate();
  const [historia,       setHistoria]       = useState<any>(null);
  const [loading,        setLoading]        = useState(true);
  const [downloading,    setDownloading]    = useState(false);
  const [sendingEmail,   setSendingEmail]   = useState(false);
  const [sendingWA,      setSendingWA]      = useState(false);
  const [modal,          setModal]          = useState(false);
  const [secciones,      setSecciones]      = useState<string[]>(SECCIONES.map(s => s.id));
  const [accion,         setAccion]         = useState<Accion>(null);

  useEffect(() => { cargar(); }, [historiaId]);

  const headers = () => {
    const token = localStorage.getItem('auth_token');
    return { 'ngrok-skip-browser-warning': 'true', ...(token ? { Authorization: `Bearer ${token}` } : {}) };
  };

  const cargar = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API}/documentos/${historiaId}/datos-completos`, { headers: headers() });
      if (!res.ok) throw new Error();
      setHistoria(await res.json());
    } catch {
      try { setHistoria(await historiaClinicaService.getById(historiaId)); }
      catch { toast.error('Error cargando historia clínica'); }
    } finally { setLoading(false); }
  };

  const seccionesParam = () => secciones.length === SECCIONES.length ? '' : `secciones=${secciones.join(',')}`;

  const ejecutarPDF = async () => {
    try {
      setDownloading(true);
      const p = seccionesParam();
      const res = await fetch(`${API}/documentos/${historiaId}/pdf${p ? `?${p}` : ''}`, { headers: headers() });
      if (!res.ok) throw new Error();
      const a = document.createElement('a');
      a.href = URL.createObjectURL(await res.blob());
      a.download = `historia_${historiaId}.pdf`;
      a.click();
      URL.revokeObjectURL(a.href);
    } catch { toast.error('Error al descargar PDF'); }
    finally { setDownloading(false); }
  };

  const ejecutarEmail = async () => {
    const email = historia?.deportista?.email;
    if (!email) { toast.error('El deportista no tiene correo registrado'); return; }
    try {
      setSendingEmail(true);
      const p = seccionesParam();
      const res = await fetch(`${API}/documentos/${historiaId}/enviar-email?email_destino=${encodeURIComponent(email)}${p ? `&${p}` : ''}`, { method: 'POST', headers: headers() });
      if (!res.ok) throw new Error();
      toast.success('Correo enviado');
    } catch { toast.error('Error al enviar correo'); }
    finally { setSendingEmail(false); }
  };

  const ejecutarWA = async () => {
    try {
      setSendingWA(true);
      const p = seccionesParam();
      const res = await fetch(`${API}/documentos/${historiaId}/generar-pdf${p ? `?${p}` : ''}`, { headers: headers() });
      if (!res.ok) throw new Error();
      const data = await res.json();
      if (data.url_descarga) window.open(data.url_descarga, '_blank');
    } catch { toast.error('Error al generar enlace'); }
    finally { setSendingWA(false); }
  };

  const abrirModal = (a: Accion) => { setAccion(a); setModal(true); };

  const confirmar = () => {
    setModal(false);
    if (accion === 'pdf') ejecutarPDF();
    else if (accion === 'email') ejecutarEmail();
    else if (accion === 'whatsapp') ejecutarWA();
    else if (accion === 'imprimir') window.print();
    setAccion(null);
  };

  const volver = () => onNavigate ? onNavigate('historia') : navigate('/historia');

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'60vh', flexDirection:'column', gap:12 }}>
      <Loader2 size={28} style={{ color:T.primary, animation:'spin 0.8s linear infinite' }} />
      <p style={{ margin:0, fontSize:13, color:T.textMuted }}>Cargando historia clínica...</p>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  if (!historia) return (
    <div style={{ padding:24 }}>
      <button onClick={volver} style={{ display:'flex', alignItems:'center', gap:8, background:'none', border:'none', cursor:'pointer', color:T.primary, fontSize:13, fontWeight:600, padding:0 }}>
        <ArrowLeft size={16} /> Volver
      </button>
      <div style={{ marginTop:16, padding:16, background:T.dangerBg, borderRadius:T.radiusSm, color:T.dangerText, fontSize:13 }}>
        Historia clínica no encontrada
      </div>
    </div>
  );

  const dep = historia.deportista || {};
  const ap  = historia.antecedentes_personales     || [];
  const af  = historia.antecedentes_familiares     || [];
  const les = historia.lesiones_deportivas         || [];
  const cir = historia.cirugias_previas            || [];
  const alg = historia.alergias                   || [];
  const med = historia.medicaciones               || [];
  const vac = historia.vacunas_administradas      || [];
  const rev = historia.revision_sistemas          || [];
  const sig = historia.signos_vitales             || [];
  const pru = historia.pruebas_complementarias    || [];
  const dx  = historia.diagnosticos              || [];
  const pla = Array.isArray(historia.plan_tratamiento) ? historia.plan_tratamiento : (historia.plan_tratamiento ? [historia.plan_tratamiento] : []);
  const rem = historia.remisiones_especialistas   || [];
  const apt = historia.aptitud_medica             || null;
  const mot = historia.motivo_consulta_enfermedad || null;
  const exp = historia.exploracion_fisica_sistemas || null;

  const BTNS = [
    { a:'pdf'      as Accion, label:'PDF',      icon:<Download size={14} />,      color:'#dc2626', loading:downloading  },
    { a:'email'    as Accion, label:'Email',    icon:<Mail size={14} />,          color:'#2563eb', loading:sendingEmail },
    { a:'whatsapp' as Accion, label:'WhatsApp', icon:<MessageCircle size={14} />, color:'#16a34a', loading:sendingWA    },
    { a:'imprimir' as Accion, label:'Imprimir', icon:<Printer size={14} />,       color:'#475569', loading:false        },
  ];

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:20, maxWidth:900, margin:'0 auto' }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} @media print{.np{display:none!important}}`}</style>

      {/* Volver */}
      <button onClick={volver} className="np" style={{ display:'inline-flex', alignItems:'center', gap:8, background:'none', border:'none', cursor:'pointer', color:T.primary, fontSize:13, fontWeight:600, padding:0, width:'fit-content' }}>
        <ArrowLeft size={16} /> Volver al listado
      </button>

      {/* HEADER */}
      <div style={{ background:T.surface, borderRadius:T.radius, border:`1px solid ${T.border}`, boxShadow:T.shadowMd, overflow:'hidden' }}>
        <div style={{ background:`linear-gradient(135deg,${T.primary} 0%,${T.primaryMid} 100%)`, padding:'20px 24px' }}>
          <h1 style={{ margin:0, fontSize:20, fontWeight:800, color:'#fff' }}>
            Historia Clínica — {dep.nombres} {dep.apellidos}
          </h1>
          <p style={{ margin:'4px 0 0', fontSize:12, color:'rgba(255,255,255,0.75)' }}>
            INDERHUILA — Instituto Departamental de Recreación y Deportes del Huila
          </p>
        </div>
        <div style={{ padding:'16px 24px' }}>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(180px,1fr))', gap:16 }}>
            <InfoField label="Documento"       value={dep.numero_documento} />
            <InfoField label="Fecha nacimiento" value={fmtFecha(dep.fecha_nacimiento)} />
            <InfoField label="Teléfono"         value={dep.telefono} />
            <InfoField label="Email"            value={dep.email} />
            <InfoField label="Fecha apertura"  value={fmtFecha(historia.fecha_apertura)} />
            <InfoField label="Fecha creación"  value={fmtFechaHora(historia.created_at)} />
            <InfoField label="Deporte"         value={dep.tipo_deporte} />
            <InfoField label="ID Historia"     value={historia.id ? `${historia.id.slice(0,8)}...` : undefined} />
          </div>
        </div>
        <div className="np" style={{ padding:'12px 24px', borderTop:`1px solid ${T.borderLight}`, display:'flex', gap:8, flexWrap:'wrap' }}>
          {BTNS.map(({ a, label, icon, color, loading }) => (
            <button key={a} onClick={() => abrirModal(a)} disabled={loading}
              style={{ display:'flex', alignItems:'center', gap:7, padding:'8px 16px', borderRadius:T.radiusSm, border:'none', background:color, color:'#fff', fontSize:13, fontWeight:600, cursor:loading?'not-allowed':'pointer', opacity:loading?.7:1 }}>
              {icon} {loading ? '...' : label}
            </button>
          ))}
        </div>
      </div>

      {/* SECCIONES */}
      <S1_MotivoConsulta motivo={mot} />
      <S2_Antecedentes ap={ap} af={af} les={les} cir={cir} alg={alg} med={med} vac={vac} />
      <S3_RevisionSistemas revision={rev} />
      <S4_SignosVitales signos={sig} />
      <S5_Exploracion exploracion={exp} />
      <S6_Pruebas pruebas={pru} />
      <S7_Diagnosticos diagnosticos={dx} />
      <S8_PlanTratamiento planes={pla} remisiones={rem} />
      <S9_Aptitud aptitud={apt} />

      {/* MODAL SELECCIÓN SECCIONES */}
      {modal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.45)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:200, padding:16 }}>
          <div style={{ background:T.surface, borderRadius:T.radius, width:'100%', maxWidth:440, boxShadow:'0 20px 60px rgba(0,0,0,0.2)', overflow:'hidden' }}>
            <div style={{ padding:'16px 20px', borderBottom:`1px solid ${T.borderLight}`, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <div>
                <h3 style={{ margin:0, fontSize:15, fontWeight:700, color:T.textPrimary }}>Seleccionar secciones</h3>
                <p style={{ margin:'3px 0 0', fontSize:12, color:T.textMuted }}>Elige qué incluir en el documento</p>
              </div>
              <button onClick={() => setModal(false)} style={{ background:'none', border:'none', cursor:'pointer', color:T.textMuted }}><X size={18} /></button>
            </div>
            <div style={{ padding:'14px 20px', display:'flex', flexDirection:'column', gap:6, maxHeight:340, overflowY:'auto' }}>
              {SECCIONES.map(s => {
                const sel = secciones.includes(s.id);
                return (
                  <button key={s.id} onClick={() => setSecciones(prev => prev.includes(s.id) ? prev.filter(x => x !== s.id) : [...prev, s.id])}
                    style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 14px', borderRadius:T.radiusSm, border:`1px solid ${sel?T.primary:T.border}`, background:sel?T.primaryLight:T.surface, cursor:'pointer', textAlign:'left', width:'100%' }}>
                    {sel
                      ? <CheckSquare size={16} style={{ color:T.primary, flexShrink:0 }} />
                      : <Square size={16} style={{ color:T.textMuted, flexShrink:0 }} />}
                    <span style={{ fontSize:13, color:sel?T.primary:T.textSecondary, fontWeight:sel?600:400 }}>{s.numero}. {s.nombre}</span>
                  </button>
                );
              })}
            </div>
            <div style={{ padding:'14px 20px', borderTop:`1px solid ${T.borderLight}`, display:'flex', justifyContent:'flex-end', gap:10 }}>
              <button onClick={() => setModal(false)} style={{ padding:'8px 16px', background:T.surfaceAlt, border:`1px solid ${T.border}`, borderRadius:T.radiusSm, fontSize:13, cursor:'pointer' }}>Cancelar</button>
              <button onClick={confirmar} disabled={secciones.length === 0}
                style={{ padding:'8px 20px', background:T.primary, color:'#fff', border:'none', borderRadius:T.radiusSm, fontSize:13, fontWeight:600, cursor:'pointer' }}>
                Continuar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default VistaHistoriaClinica;