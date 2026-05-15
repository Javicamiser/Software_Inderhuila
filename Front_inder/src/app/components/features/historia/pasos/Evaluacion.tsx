import { HistoriaClinicaData } from "../HistoriaClinica";
import { useCatalogos } from "@/app/hooks/useCatalogos";

const T = {
  primary:'#1F4788', primaryLight:'#EEF3FB',
  surface:'#ffffff', surfaceAlt:'#f8fafc',
  border:'#e2e8f0', borderLight:'#f1f5f9',
  textPrimary:'#0f172a', textSecondary:'#475569', textMuted:'#94a3b8',
  danger:'#ef4444',
  radius:'12px', radiusSm:'8px',
};

// ── Campo definido FUERA del componente ──────────────────────
// Si está dentro, React lo recrea en cada render y desmonta
// los inputs, perdiendo el foco con cada keystroke.
function Campo({ label, hint, children }: {
  label: string; hint: string; children: React.ReactNode;
}) {
  return (
    <div style={{ border:`1px solid ${T.border}`, borderRadius:T.radius, overflow:'hidden' }}>
      <div style={{ padding:'12px 16px', background:T.surfaceAlt, borderBottom:`1px solid ${T.borderLight}` }}>
        <label style={{ margin:0, fontSize:13, fontWeight:600, color:T.textPrimary }}>
          {label} <span style={{ color:T.danger }}>*</span>
        </label>
      </div>
      <div style={{ padding:'14px 16px' }}>
        {children}
        <p style={{ margin:'7px 0 0', fontSize:11, color:T.textMuted }}>{hint}</p>
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width:'100%', padding:'10px 12px', border:`1px solid ${T.border}`,
  borderRadius:T.radiusSm, fontSize:13, outline:'none',
  resize:'vertical', fontFamily:'inherit', boxSizing:'border-box',
  background:T.surface, lineHeight:1.6,
};

// ─────────────────────────────────────────────────────────────

type Props = {
  data: HistoriaClinicaData;
  updateData: (data: Partial<HistoriaClinicaData>) => void;
  onNext: () => void;
  onCancel: () => void;
};

export function Evaluacion({ data, updateData, onNext, onCancel }: Props) {
  const { tiposCita } = useCatalogos();

  const handleNext = () => {
    if (!data.tipoCita?.trim())        { alert("Por favor seleccione el tipo de consulta"); return; }
    if (!data.motivoConsulta?.trim())  { alert("Por favor ingrese el motivo de consulta"); return; }
    if (!data.enfermedadActual?.trim()){ alert("Por favor ingrese la enfermedad actual"); return; }
    onNext();
  };

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:16 }}>

      {/* Tipo de consulta */}
      <div style={{ border:`1px solid ${T.border}`, borderRadius:T.radius, overflow:'hidden' }}>
        <div style={{ padding:'12px 16px', background:T.surfaceAlt, borderBottom:`1px solid ${T.borderLight}` }}>
          <label style={{ margin:0, fontSize:13, fontWeight:600, color:T.textPrimary }}>
            Tipo de consulta <span style={{ color:T.danger }}>*</span>
          </label>
        </div>
        <div style={{ padding:'14px 16px' }}>
          <select
            value={data.tipoCita || ''}
            onChange={e => updateData({ tipoCita: e.target.value })}
            style={{ width:'100%', padding:'9px 11px', border:`1px solid ${T.border}`, borderRadius:T.radiusSm, fontSize:13, outline:'none', background:T.surface, cursor:'pointer' }}>
            <option value="">Seleccionar tipo de consulta...</option>
            {tiposCita.map(t => <option key={t.id} value={t.nombre}>{t.nombre}</option>)}
          </select>
        </div>
      </div>

      {/* Motivo de consulta */}
      <Campo
        label="Motivo de consulta"
        hint="Ej: Dolor en rodilla derecha, control de lesión previa, evaluación precompetitiva, etc.">
        <textarea
          value={data.motivoConsulta}
          rows={4}
          onChange={e => updateData({ motivoConsulta: e.target.value })}
          placeholder="Describa el motivo principal por el cual el deportista acude a consulta..."
          style={inputStyle}
          onFocus={e => e.currentTarget.style.borderColor = T.primary}
          onBlur={e  => e.currentTarget.style.borderColor = T.border}
        />
      </Campo>

      {/* Enfermedad actual */}
      <Campo
        label="Enfermedad actual / Anamnesis"
        hint="Incluya: tiempo de evolución, intensidad de síntomas, relación con la actividad deportiva, etc.">
        <textarea
          value={data.enfermedadActual}
          rows={6}
          onChange={e => updateData({ enfermedadActual: e.target.value })}
          placeholder="Describa detalladamente la historia de la enfermedad o condición actual: inicio de síntomas, evolución, características, factores que mejoran o empeoran, tratamientos previos..."
          style={inputStyle}
          onFocus={e => e.currentTarget.style.borderColor = T.primary}
          onBlur={e  => e.currentTarget.style.borderColor = T.border}
        />
      </Campo>

    </div>
  );
}