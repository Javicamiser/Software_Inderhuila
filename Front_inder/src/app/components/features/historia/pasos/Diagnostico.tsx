import { HistoriaClinicaData } from "../HistoriaClinica";
import { X, AlertCircle, BarChart2, Lightbulb, ClipboardList, Plus } from "lucide-react";
import { useState, useRef } from "react";
import { buscarEnfermedadPorCodigo, buscarCodigosPorNombre } from './cie11Service';

const T = {
  primary:'#1F4788', primaryLight:'#EEF3FB',
  surface:'#ffffff', surfaceAlt:'#f8fafc',
  border:'#e2e8f0', borderLight:'#f1f5f9',
  textPrimary:'#0f172a', textSecondary:'#475569', textMuted:'#94a3b8',
  danger:'#ef4444', dangerBg:'#fee2e2',
  amber:'#b45309',  violet:'#7c3aed',
  radius:'12px', radiusSm:'8px',
};

type Diagnostico = { codigo: string; nombre: string; observaciones: string; };
type Props = {
  data: HistoriaClinicaData; updateData: (data: Partial<HistoriaClinicaData>) => void;
  onNext: () => void; onPrevious: () => void; onCancel?: () => void;
};

const inputStyle: React.CSSProperties = {
  width:'100%', padding:'9px 11px', border:`1px solid ${T.border}`,
  borderRadius:T.radiusSm, fontSize:13, outline:'none',
  boxSizing:'border-box', background:T.surface,
};
const textareaStyle: React.CSSProperties = { ...inputStyle, resize:'vertical', fontFamily:'inherit' };

const Campo = ({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) => (
  <div>
    <label style={{ display:'block', marginBottom:5, fontSize:12, fontWeight:600, color:T.textSecondary }}>{label}</label>
    {children}
    {hint && <p style={{ margin:'4px 0 0', fontSize:11, color:T.textMuted }}>{hint}</p>}
  </div>
);

const SeccionBox = ({ icon, iconColor, label, children }: {
  icon: React.ReactNode; iconColor: string; label: string; children: React.ReactNode;
}) => (
  <div style={{ border:`1px solid ${T.border}`, borderRadius:T.radius, overflow:'hidden' }}>
    <div style={{ display:'flex', alignItems:'center', gap:8, padding:'12px 16px', background:T.surfaceAlt, borderBottom:`1px solid ${T.borderLight}` }}>
      <span style={{ color:iconColor }}>{icon}</span>
      <h3 style={{ margin:0, fontSize:14, fontWeight:700, color:T.textPrimary }}>{label}</h3>
    </div>
    <div style={{ padding:'16px' }}>{children}</div>
  </div>
);

export function Diagnostico({ data, updateData, onNext, onPrevious, onCancel }: Props) {
  const [diagnosticos, setDiagnosticos] = useState<Diagnostico[]>(data.diagnosticos || []);
  const [nuevo, setNuevo] = useState({ codigo:'', nombre:'', observaciones:'' });
  const [sugerencias, setSugerencias] = useState<{codigo:string;nombre:string}[]>([]);
  const [showSug, setShowSug] = useState(false);
  const [errCodigo, setErrCodigo] = useState('');
  const deb = useRef<ReturnType<typeof setTimeout>|null>(null);

  const eliminar = (idx: number) => {
    const u = diagnosticos.filter((_,i) => i !== idx);
    setDiagnosticos(u);
    updateData({ diagnosticos: u });
  };

  const handleCodigo = async (v: string) => {
    const u = v.toUpperCase();
    setNuevo(p => ({ ...p, codigo: u }));
    setErrCodigo('');
    if (u.trim()) {
      const e = await buscarEnfermedadPorCodigo(u);
      if (e) setNuevo(p => ({ ...p, nombre: e?.nombre ?? '' }));
      else   { setErrCodigo('Código CIE-11 no encontrado'); setNuevo(p => ({ ...p, nombre: '' })); }
    } else {
      setNuevo(p => ({ ...p, nombre: '' }));
    }
  };

  const handleNombre = (v: string) => {
    setNuevo(p => ({ ...p, nombre: v }));
    setErrCodigo('');
    if (deb.current) clearTimeout(deb.current);
    if (v.trim().length >= 3) {
      deb.current = setTimeout(async () => {
        const r = await buscarCodigosPorNombre(v);
        if (r.length > 0) {
          setSugerencias(r.map((x: any) => ({ codigo: x.codigo, nombre: x.nombre })));
          setShowSug(true);
        } else {
          setSugerencias([]);
          setShowSug(false);
        }
      }, 400);
    } else {
      setSugerencias([]);
      setShowSug(false);
    }
  };

  const seleccionar = (item: {codigo:string; nombre:string}) => {
    setNuevo(p => ({ ...p, codigo: item.codigo, nombre: item.nombre }));
    setSugerencias([]);
    setShowSug(false);
    setErrCodigo('');
  };

  const agregar = () => {
    if (!nuevo.codigo.trim()) { alert('Ingrese un código CIE-11'); return; }
    if (!nuevo.nombre.trim()) { alert('Verifique la enfermedad buscando el código'); return; }
    const u = [...diagnosticos, nuevo];
    setDiagnosticos(u);
    updateData({ diagnosticos: u });
    setNuevo({ codigo:'', nombre:'', observaciones:'' });
    setSugerencias([]);
    setShowSug(false);
  };

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:18 }}>

      {/* Recomendaciones */}
      <div style={{ padding:'12px 16px', background:T.surfaceAlt, border:`1px solid ${T.border}`, borderLeft:`3px solid ${T.textMuted}`, borderRadius:T.radiusSm }}>
        <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:6 }}>
          <AlertCircle size={13} style={{ color:T.textMuted }}/>
          <span style={{ fontSize:13, fontWeight:600, color:T.textSecondary }}>Recomendaciones para el diagnóstico:</span>
        </div>
        <ul style={{ margin:0, paddingLeft:20, display:'flex', flexDirection:'column', gap:3 }}>
          {[
            'Sea claro y específico en sus observaciones',
            'Indique código diagnóstico CIE-11 para cada diagnóstico',
            'Mencione limitaciones o contraindicaciones para la práctica deportiva',
            'Indique nivel de urgencia si requiere atención especializada',
          ].map(t => (
            <li key={t} style={{ fontSize:12, color:T.textSecondary }}>{t}</li>
          ))}
        </ul>
      </div>

      {/* Análisis Objetivo */}
      <SeccionBox icon={<BarChart2 size={15}/>} iconColor={T.violet} label="Análisis Objetivo">
        <textarea value={data.analisisObjetivoDiagnostico || ''} rows={4}
          onChange={e => updateData({ analisisObjetivoDiagnostico: e.target.value })}
          placeholder="Resumen de hallazgos objetivos: signos vitales, pruebas complementarias, evaluación física..."
          style={textareaStyle}/>
        <p style={{ margin:'5px 0 0', fontSize:11, color:T.textMuted }}>
          Describa los hallazgos objetivos y medibles encontrados durante la evaluación
        </p>
      </SeccionBox>

      {/* Impresión Diagnóstica */}
      <SeccionBox icon={<Lightbulb size={15}/>} iconColor={T.amber} label="Impresión Diagnóstica">
        <textarea value={data.impresionDiagnostica || ''} rows={4}
          onChange={e => updateData({ impresionDiagnostica: e.target.value })}
          placeholder="Interpretación clínica basada en los hallazgos, hipótesis diagnóstica preliminar..."
          style={textareaStyle}/>
        <p style={{ margin:'5px 0 0', fontSize:11, color:T.textMuted }}>
          Escriba la impresión diagnóstica preliminar basada en la evaluación realizada
        </p>
      </SeccionBox>

      {/* Diagnóstico CIE-11 */}
      <SeccionBox icon={<ClipboardList size={15}/>} iconColor={T.primary} label="Diagnóstico Clínico (CIE-11)">
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>

          {/* Código */}
          <Campo label="Código CIE-11" hint="Buscar por nombre abajo si no conoce el código">
            <div style={{ position:'relative' }}>
              <input value={nuevo.codigo} onChange={e => handleCodigo(e.target.value)}
                placeholder="Ej: I51, BA00..."
                style={{ ...inputStyle, textTransform:'uppercase', fontFamily:'monospace', borderColor: errCodigo ? T.danger : T.border }}/>
              {errCodigo && (
                <div style={{ display:'flex', alignItems:'center', gap:5, marginTop:5, fontSize:11, color:T.danger, background:T.dangerBg, padding:'5px 8px', borderRadius:T.radiusSm }}>
                  <AlertCircle size={11}/> {errCodigo}
                </div>
              )}
            </div>
          </Campo>

          {/* Nombre */}
          <Campo label="Nombre de la enfermedad / diagnóstico" hint="Escriba al menos 3 caracteres para buscar">
            <div style={{ position:'relative' }}>
              <input value={nuevo.nombre} onChange={e => handleNombre(e.target.value)}
                onFocus={() => sugerencias.length > 0 && setShowSug(true)}
                placeholder="Ej: Hipertensión, Asma, Diabetes..."
                style={inputStyle}/>
              {showSug && sugerencias.length > 0 && (
                <div style={{ position:'absolute', zIndex:20, background:T.surface, border:`1px solid ${T.primary}`, borderRadius:T.radiusSm, boxShadow:'0 8px 24px rgba(0,0,0,0.12)', maxHeight:240, overflowY:'auto', marginTop:4, width:'100%' }}>
                  {sugerencias.map(s => (
                    <button key={s.codigo} type="button" onClick={() => seleccionar(s)}
                      style={{ width:'100%', padding:'8px 12px', background:'transparent', border:'none', borderBottom:`1px solid ${T.borderLight}`, cursor:'pointer', textAlign:'left', display:'flex', alignItems:'center', gap:8 }}>
                      <span style={{ fontSize:11, fontWeight:700, fontFamily:'monospace', background:T.primaryLight, color:T.primary, padding:'2px 7px', borderRadius:20, flexShrink:0 }}>{s.codigo}</span>
                      <span style={{ fontSize:12, color:T.textPrimary }}>{s.nombre}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </Campo>

          {/* Observaciones */}
          <Campo label="Observaciones adicionales">
            <textarea value={nuevo.observaciones} rows={3}
              onChange={e => setNuevo(p => ({ ...p, observaciones: e.target.value }))}
              placeholder="Comorbilidades, especificidad deportiva, pronósticos..."
              style={textareaStyle}/>
          </Campo>

          <button type="button" onClick={agregar}
            style={{ width:'100%', display:'flex', alignItems:'center', justifyContent:'center', gap:8, padding:'11px 16px', background:T.primary, color:'#fff', border:'none', borderRadius:T.radiusSm, cursor:'pointer', fontSize:13, fontWeight:600 }}>
            <Plus size={14}/> Agregar Diagnóstico
          </button>
        </div>
      </SeccionBox>

      {/* Lista de diagnósticos */}
      {diagnosticos.length > 0 ? (
        <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
          {diagnosticos.map((d, i) => (
            <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', padding:'12px 14px', background:T.surface, border:`1px solid ${T.border}`, borderLeft:`3px solid ${T.primary}`, borderRadius:T.radiusSm }}>
              <div style={{ flex:1 }}>
                <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>
                  <span style={{ fontSize:11, fontWeight:700, fontFamily:'monospace', background:T.primaryLight, color:T.primary, padding:'2px 8px', borderRadius:20 }}>{d.codigo}</span>
                  <span style={{ fontSize:13, fontWeight:600, color:T.textPrimary }}>{d.nombre}</span>
                </div>
                {d.observaciones && (
                  <p style={{ margin:'5px 0 0', fontSize:12, color:T.textSecondary }}>{d.observaciones}</p>
                )}
              </div>
              <button type="button" onClick={() => eliminar(i)}
                style={{ padding:6, background:T.dangerBg, border:'none', borderRadius:T.radiusSm, cursor:'pointer', color:T.danger, flexShrink:0, marginLeft:10 }}>
                <X size={13}/>
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ textAlign:'center', padding:'28px 0', background:T.surfaceAlt, border:`1px dashed ${T.border}`, borderRadius:T.radius }}>
          <p style={{ margin:0, fontSize:13, color:T.textMuted, fontStyle:'italic' }}>No se han registrado diagnósticos clínicos</p>
        </div>
      )}
    </div>
  );
}