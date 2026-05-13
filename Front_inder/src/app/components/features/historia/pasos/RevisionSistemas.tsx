import { HistoriaClinicaData } from "../HistoriaClinica";
import { Heart, Wind, Utensils, Brain, Bone, Droplet, Activity, User2 } from "lucide-react";

const T = {
  primary:'#1F4788', surface:'#ffffff', surfaceAlt:'#f8fafc',
  border:'#e2e8f0', borderLight:'#f1f5f9',
  textPrimary:'#0f172a', textSecondary:'#475569', textMuted:'#94a3b8',
  danger:'#ef4444', success:'#10b981', successBg:'#f0fdf4',
  radius:'12px', radiusSm:'8px',
};

// Cada sistema tiene su color suave diferenciado
const SISTEMAS = [
  { id:"cardiovascular",    nombre:"Cardiovascular",       Icon:Heart,    color:'#dc2626', bg:'#fff1f2', border:'#fecaca' },
  { id:"respiratorio",      nombre:"Respiratorio",         Icon:Wind,     color:'#1d4ed8', bg:'#eff6ff', border:'#bfdbfe' },
  { id:"digestivo",         nombre:"Digestivo",            Icon:Utensils, color:'#b45309', bg:'#fffbeb', border:'#fde68a' },
  { id:"neurologico",       nombre:"Neurológico",          Icon:Brain,    color:'#7c3aed', bg:'#f5f3ff', border:'#ddd6fe' },
  { id:"musculoesqueletico",nombre:"Musculoesquelético",   Icon:Bone,     color:'#374151', bg:'#f9fafb', border:'#d1d5db' },
  { id:"genitourinario",    nombre:"Genitourinario",       Icon:Droplet,  color:'#0e7490', bg:'#ecfeff', border:'#a5f3fc' },
  { id:"endocrino",         nombre:"Endocrino",            Icon:Activity, color:'#065f46', bg:'#f0fdf4', border:'#a7f3d0' },
  { id:"pielFaneras",       nombre:"Piel y Faneras",       Icon:User2,    color:'#9a3412', bg:'#fff7ed', border:'#fed7aa' },
] as const;

type SistemaId = typeof SISTEMAS[number]['id'];

type Props = {
  data: HistoriaClinicaData;
  updateData: (data: Partial<HistoriaClinicaData>) => void;
  onNext: () => void; onPrevious: () => void; onCancel?: () => void;
};

export function RevisionSistemas({ data, updateData, onNext, onPrevious, onCancel }: Props) {
  const handleEstado = (id: SistemaId, estado: "normal" | "anormal") => {
    const r = { ...data.revisionSistemas };
    r[id] = { ...r[id], estado, observaciones: estado === "normal" ? "" : r[id].observaciones };
    updateData({ revisionSistemas: r });
  };

  const handleObs = (id: SistemaId, observaciones: string) => {
    const r = { ...data.revisionSistemas };
    r[id] = { ...r[id], observaciones };
    updateData({ revisionSistemas: r });
  };

  const evaluados = SISTEMAS.filter(s => data.revisionSistemas[s.id]?.estado).length;

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:16 }}>

      {/* Instrucciones */}
      <div style={{ padding:'12px 16px', background:'#f0f9ff', border:'1px solid #bae6fd', borderRadius:T.radiusSm, borderLeft:`3px solid ${T.primary}` }}>
        <p style={{ margin:0, fontSize:13, color:'#0c4a6e' }}>
          <strong>Instrucciones:</strong> Revise cada sistema y marque si está <strong>Normal</strong> o <strong>Anormal</strong>. Si marca como anormal, agregue observaciones detalladas.
        </p>
      </div>

      {/* Sistemas */}
      {SISTEMAS.map(({ id, nombre, Icon, color, bg, border }) => {
        const estado = data.revisionSistemas[id]?.estado ?? "";
        const obs = data.revisionSistemas[id]?.observaciones ?? "";
        return (
          <div key={id} style={{ background:bg, border:`1px solid ${border}`, borderLeft:`4px solid ${color}`, borderRadius:T.radiusSm, padding:'14px 18px' }}>
            <div style={{ display:'flex', alignItems:'flex-start', gap:16 }}>
              {/* Ícono + nombre */}
              <div style={{ display:'flex', alignItems:'center', gap:8, minWidth:200, flexShrink:0, paddingTop:2 }}>
                <Icon size={18} style={{ color }}/>
                <span style={{ fontSize:13, fontWeight:700, color }}>{nombre}</span>
              </div>

              {/* Radios + observaciones */}
              <div style={{ flex:1 }}>
                <div style={{ display:'flex', gap:20, marginBottom: estado === 'anormal' ? 10 : 0 }}>
                  {(['normal','anormal'] as const).map(op => (
                    <label key={op} style={{ display:'flex', alignItems:'center', gap:6, cursor:'pointer', fontSize:13 }}>
                      <input type="radio" name={`rev-${id}`} checked={estado === op}
                        onChange={() => handleEstado(id, op)}
                        style={{ accentColor: op === 'normal' ? T.success : T.danger, width:14, height:14 }}/>
                      <span style={{ color: op === 'normal' ? '#065f46' : '#991b1b', fontWeight:500, textTransform:'capitalize' }}>{op}</span>
                    </label>
                  ))}
                </div>

                {estado === 'normal' && (
                  <p style={{ margin:0, fontSize:11, color:T.success }}>✓ Sin hallazgos patológicos</p>
                )}

                {estado === 'anormal' && (
                  <div>
                    <label style={{ display:'block', marginBottom:5, fontSize:12, fontWeight:600, color:'#991b1b' }}>
                      Observaciones <span style={{ color:T.danger }}>*</span>
                    </label>
                    <textarea value={obs} rows={2}
                      onChange={e => handleObs(id, e.target.value)}
                      placeholder={`Describa los hallazgos anormales del sistema ${nombre.toLowerCase()}...`}
                      style={{ width:'100%', padding:'8px 10px', border:'1px solid #fca5a5', borderRadius:T.radiusSm, fontSize:13, resize:'vertical', outline:'none', fontFamily:'inherit', background:T.surface, boxSizing:'border-box' }}/>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}

      {/* Contador */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'11px 16px', background:T.surfaceAlt, border:`1px solid ${T.border}`, borderRadius:T.radiusSm }}>
        <span style={{ fontSize:13, color:T.textSecondary }}>
          Sistemas evaluados: <strong style={{ color:T.textPrimary }}>{evaluados} / {SISTEMAS.length}</strong>
        </span>
        {evaluados === SISTEMAS.length && (
          <span style={{ fontSize:13, color:T.success, fontWeight:600 }}>✓ Revisión completa</span>
        )}
      </div>
    </div>
  );
}