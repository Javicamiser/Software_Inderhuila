import { useState, useEffect } from "react";
import { HistoriaClinicaData } from "../HistoriaClinica";
import { ChevronLeft, ChevronRight, Heart, Thermometer, Wind, Droplets, Activity, Ruler, Weight, AlertTriangle, FileText, Plus, X } from "lucide-react";

const T = {
  primary:'#1F4788', primaryLight:'#EEF3FB',
  surface:'#ffffff', surfaceAlt:'#f8fafc',
  border:'#e2e8f0', borderLight:'#f1f5f9',
  textPrimary:'#0f172a', textSecondary:'#475569', textMuted:'#94a3b8',
  danger:'#ef4444', dangerBg:'#fef2f2',
  success:'#10b981', successBg:'#f0fdf4',
  radius:'12px', radiusSm:'8px',
};

type Props = {
  data: HistoriaClinicaData;
  updateData: (data: Partial<HistoriaClinicaData>) => void;
  onNext: () => void;
  onPrevious: () => void;
  onCancel?: () => void;
};

type AlertLevel = "normal" | "warning" | "danger" | "critical";
type AlertInfo = { level: AlertLevel; message: string; };

// ── Helpers de localStorage por usuario ──────────────────────
const _templatesKey = () => {
  try {
    const u = localStorage.getItem('auth_usuario');
    const id = u ? (JSON.parse(u)?.id ?? 'default') : 'default';
    return `plantillas_exp_${id}`;
  } catch { return 'plantillas_exp_default'; }
};
const _loadTemplates = () => {
  try {
    const s = localStorage.getItem(_templatesKey());
    return s ? JSON.parse(s) : {};
  } catch { return {}; }
};
const _saveTemplates = (templates: any) => {
  try { localStorage.setItem(_templatesKey(), JSON.stringify(templates)); } catch {}
};

// ── SistemaExploracion ────────────────────────────────────────
const SistemaExploracion = ({
  nombre, nombreClave, estado, observaciones,
  data, updateData, showTemplates, toggleTemplates,
  plantillasPredefinidas, aplicarPlantilla,
  customTemplates, showAddTemplate, toggleAddTemplate,
  newTemplate, setNewTemplate, guardarNuevaPlantilla, eliminarPlantillaPersonalizada
}: {
  nombre: string; nombreClave: string;
  estado: "normal" | "anormal" | ""; observaciones: string;
  data: HistoriaClinicaData; updateData: (data: Partial<HistoriaClinicaData>) => void;
  showTemplates: {[key: string]: boolean}; toggleTemplates: (s: string) => void;
  plantillasPredefinidas: {[key: string]: string[]}; aplicarPlantilla: (s: string, t: string) => void;
  customTemplates: {[key: string]: string[]};
  showAddTemplate: {[key: string]: boolean}; toggleAddTemplate: (s: string) => void;
  newTemplate: {[key: string]: string};
  setNewTemplate: React.Dispatch<React.SetStateAction<{[key: string]: string}>>;
  guardarNuevaPlantilla: (s: string) => void;
  eliminarPlantillaPersonalizada: (s: string, i: number) => void;
}) => (
  <div style={{ border:`1px solid ${T.border}`, borderRadius:T.radiusSm, padding:16 }}>
    <label style={{ display:'block', marginBottom:12, fontWeight:600, fontSize:14, color:T.textPrimary }}>{nombre}</label>
    <div style={{ display:'flex', gap:24, marginBottom:12 }}>
      {(['normal','anormal'] as const).map(op => (
        <label key={op} style={{ display:'flex', alignItems:'center', gap:6, cursor:'pointer', fontSize:13 }}>
          <input type="radio" name={`exp-${nombreClave}`} checked={estado === op}
            onChange={() => {
              const e = { ...data.exploracionSistemas };
              (e as any)[nombreClave] = { estado: op, observaciones: "" };
              updateData({ exploracionSistemas: e });
            }}
            style={{ accentColor: T.primary, width:14, height:14 }}
          />
          <span style={{ color:T.textSecondary, textTransform:'capitalize' }}>{op}</span>
        </label>
      ))}
    </div>

    {(estado === "normal" || estado === "anormal") && (
      <>
        <textarea value={observaciones} rows={3}
          onChange={e => {
            const ex = { ...data.exploracionSistemas };
            (ex as any)[nombreClave].observaciones = e.target.value;
            updateData({ exploracionSistemas: ex });
          }}
          placeholder={estado === "normal" ? "Describa los hallazgos normales..." : "Describa los hallazgos anormales..."}
          style={{ width:'100%', padding:'8px 10px', border:`1px solid ${estado==='normal'?T.success:T.border}`, borderRadius:T.radiusSm, fontSize:13, resize:'vertical', outline:'none', fontFamily:'inherit', boxSizing:'border-box', background: estado==='normal'?T.successBg:T.surface }}
        />

        {/* Solo mostrar plantillas cuando es normal */}
        {estado === "normal" && (
          <div style={{ marginTop:8 }}>
            <button type="button" onClick={() => toggleTemplates(nombreClave)}
              style={{ display:'flex', alignItems:'center', gap:5, fontSize:12, color:T.primary, background:'none', border:'none', cursor:'pointer', fontWeight:600, padding:0 }}>
              <FileText size={13}/>
              {showTemplates[nombreClave] ? "Ocultar plantillas" : "Mostrar plantillas"}
            </button>

            {showTemplates[nombreClave] && (
              <div style={{ marginTop:10, display:'flex', flexDirection:'column', gap:6 }}>
                <p style={{ fontSize:11, fontWeight:700, color:T.textMuted, textTransform:'uppercase', letterSpacing:'0.05em' }}>Predefinidas</p>
                {(plantillasPredefinidas[nombreClave] || []).map((p, i) => (
                  <button key={i} type="button" onClick={() => aplicarPlantilla(nombreClave, p)}
                    style={{ textAlign:'left', padding:'8px 10px', background:T.primaryLight, border:`1px solid ${T.border}`, borderRadius:T.radiusSm, fontSize:12, color:T.textPrimary, cursor:'pointer' }}>
                    {p}
                  </button>
                ))}

                {(customTemplates[nombreClave] || []).length > 0 && (
                  <>
                    <p style={{ fontSize:11, fontWeight:700, color:T.textMuted, textTransform:'uppercase', letterSpacing:'0.05em', marginTop:4 }}>Personalizadas</p>
                    {(customTemplates[nombreClave] || []).map((p, i) => (
                      <div key={i} style={{ display:'flex', gap:4 }}>
                        <button type="button" onClick={() => aplicarPlantilla(nombreClave, p)}
                          style={{ flex:1, textAlign:'left', padding:'8px 10px', background:'#f5f3ff', border:'1px solid #e0e7ff', borderRadius:T.radiusSm, fontSize:12, color:T.textPrimary, cursor:'pointer' }}>
                          {p}
                        </button>
                        <button type="button" onClick={() => eliminarPlantillaPersonalizada(nombreClave, i)}
                          style={{ padding:7, background:T.dangerBg, border:'none', borderRadius:T.radiusSm, cursor:'pointer', color:T.danger }}>
                          <X size={12}/>
                        </button>
                      </div>
                    ))}
                  </>
                )}

                {!showAddTemplate[nombreClave] ? (
                  <button type="button" onClick={() => toggleAddTemplate(nombreClave)}
                    style={{ display:'flex', alignItems:'center', gap:5, fontSize:12, color:T.success, background:'none', border:'none', cursor:'pointer', fontWeight:600, padding:0, marginTop:4 }}>
                    <Plus size={13}/> Agregar plantilla
                  </button>
                ) : (
                  <div style={{ padding:12, background:T.surfaceAlt, border:`1px solid ${T.border}`, borderRadius:T.radiusSm, marginTop:4 }}>
                    <textarea value={newTemplate[nombreClave]} rows={2}
                      onChange={e => setNewTemplate(prev => ({ ...prev, [nombreClave]: e.target.value }))}
                      placeholder="Escribe la nueva plantilla..."
                      style={{ width:'100%', padding:'7px 9px', border:`1px solid ${T.border}`, borderRadius:T.radiusSm, fontSize:12, resize:'vertical', outline:'none', fontFamily:'inherit', boxSizing:'border-box' }}
                    />
                    <div style={{ display:'flex', gap:8, marginTop:8 }}>
                      <button type="button" onClick={() => guardarNuevaPlantilla(nombreClave)}
                        style={{ padding:'6px 14px', background:T.primary, color:'#fff', border:'none', borderRadius:T.radiusSm, fontSize:12, fontWeight:600, cursor:'pointer' }}>
                        Guardar
                      </button>
                      <button type="button" onClick={() => { toggleAddTemplate(nombreClave); setNewTemplate(prev => ({ ...prev, [nombreClave]: "" })); }}
                        style={{ padding:'6px 14px', background:T.surfaceAlt, border:`1px solid ${T.border}`, borderRadius:T.radiusSm, fontSize:12, cursor:'pointer' }}>
                        Cancelar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </>
    )}
  </div>
);

// ── Componente principal ──────────────────────────────────────
export function ExploracionFisica({ data, updateData, onNext, onPrevious, onCancel }: Props) {
  const [imc, setImc] = useState<string>("");

  const _defaultBools = {
    cardiovascular: false, respiratorio: false, digestivo: false,
    neurologico: false, musculoesqueletico: false, genitourinario: false,
    endocrino: false, pielFaneras: false,
  };
  const _defaultStrings = {
    cardiovascular: "", respiratorio: "", digestivo: "",
    neurologico: "", musculoesqueletico: "", genitourinario: "",
    endocrino: "", pielFaneras: "",
  };

  const [showTemplates,    setShowTemplates]    = useState<{[k:string]:boolean}>(_defaultBools);
  const [showAddTemplate,  setShowAddTemplate]  = useState<{[k:string]:boolean}>(_defaultBools);
  const [newTemplate,      setNewTemplate]      = useState<{[k:string]:string}>(_defaultStrings);
  const [customTemplates,  setCustomTemplates]  = useState<{[k:string]:string[]}>(() => ({
    cardiovascular: [], respiratorio: [], digestivo: [], neurologico: [],
    musculoesqueletico: [], genitourinario: [], endocrino: [], pielFaneras: [],
    ..._loadTemplates()
  }));

  const plantillasPredefinidas: {[k:string]:string[]} = {
    cardiovascular: [
      "Ruidos cardíacos rítmicos, sin soplos ni agregados. Pulsos periféricos simétricos y de buena amplitud.",
      "Ruidos cardíacos normales. Frecuencia y ritmo regular. Sin soplos audibles.",
      "Auscultación cardíaca sin alteraciones. Pulsos presentes y simétricos en las cuatro extremidades.",
    ],
    respiratorio: [
      "Murmullo vesicular conservado bilateral. Sin ruidos agregados. Expansión torácica simétrica.",
      "Tórax simétrico con buena expansibilidad. Murmullo vesicular audible en ambos campos pulmonares.",
      "Auscultación pulmonar sin estertores, sibilancias ni roncus. Ventilación bilateral adecuada.",
    ],
    digestivo: [
      "Abdomen blando, depresible, no doloroso. Ruidos hidroaéreos presentes. Sin visceromegalias.",
      "Abdomen plano, blando, depresible, no doloroso a la palpación superficial ni profunda.",
      "Ruidos intestinales normales. Sin masas palpables. No se evidencia hepatomegalia ni esplenomegalia.",
    ],
    neurologico: [
      "Consciente, alerta y orientado. Fuerza muscular conservada. Sensibilidad y reflejos normales.",
      "Paciente consciente y orientado en tiempo, espacio y persona. Funciones mentales superiores conservadas.",
      "Pares craneales sin alteraciones. Fuerza muscular 5/5 en las cuatro extremidades.",
    ],
    musculoesqueletico: [
      "Rangos de movilidad articular conservados. Sin signos de inflamación ni deformidades.",
      "Articulaciones sin deformidades, edema ni limitación funcional. Movilidad activa y pasiva conservada.",
      "Tono y trofismo muscular adecuados. Sin atrofias. Marcha sin alteraciones.",
    ],
    genitourinario: [
      "Sin alteraciones. Sin dolor a la palpación en región lumbar ni hipogastrio.",
      "No se evidencian alteraciones. Puño percusión lumbar negativa bilateral.",
    ],
    endocrino: [
      "Tiroides no palpable. Sin signos de alteraciones endocrinas.",
      "Glándula tiroides de tamaño y consistencia normales. Sin nódulos palpables.",
    ],
    pielFaneras: [
      "Piel de coloración y temperatura normales. Hidratada. Sin lesiones dérmicas.",
      "Piel íntegra, sin lesiones, cicatrices ni manchas. Buena turgencia e hidratación.",
    ],
  };

  const toggleTemplates = (s: string) => {
    setShowTemplates(prev => ({ ...prev, [s]: !prev[s] }));
    if (showAddTemplate[s]) setShowAddTemplate(prev => ({ ...prev, [s]: false }));
  };

  const aplicarPlantilla = (s: string, texto: string) => {
    const e = { ...data.exploracionSistemas };
    (e as any)[s].observaciones = texto;
    updateData({ exploracionSistemas: e });
    setShowTemplates(prev => ({ ...prev, [s]: false }));
  };

  const toggleAddTemplate = (s: string) => setShowAddTemplate(prev => ({ ...prev, [s]: !prev[s] }));

  const guardarNuevaPlantilla = (s: string) => {
    const texto = newTemplate[s].trim();
    if (!texto) return;
    setCustomTemplates(prev => {
      const updated = { ...prev, [s]: [...(prev[s] || []), texto] };
      _saveTemplates(updated);
      return updated;
    });
    setNewTemplate(prev => ({ ...prev, [s]: "" }));
    setShowAddTemplate(prev => ({ ...prev, [s]: false }));
  };

  const eliminarPlantillaPersonalizada = (s: string, idx: number) => {
    setCustomTemplates(prev => {
      const updated = { ...prev, [s]: prev[s].filter((_, i) => i !== idx) };
      _saveTemplates(updated);
      return updated;
    });
  };

  useEffect(() => {
    const peso = parseFloat(data.peso);
    const em = parseFloat(data.estatura) / 100;
    if (peso > 0 && em > 0) setImc((peso / (em * em)).toFixed(2));
    else setImc("");
  }, [data.peso, data.estatura]);

  const getImcCategoria = (v: number) => {
    if (v < 18.5) return { texto: "Bajo peso",  color: "#f59e0b" };
    if (v < 25)   return { texto: "Normal",      color: T.success  };
    if (v < 30)   return { texto: "Sobrepeso",   color: "#f97316" };
    return              { texto: "Obesidad",     color: T.danger   };
  };

  const evaluarFC = (fc: string): AlertInfo | null => {
    const v = parseFloat(fc); if (isNaN(v) || !fc) return null;
    if (v < 40)  return { level:"warning",  message:"Bradicardia (puede ser normal en deportistas de alto rendimiento)" };
    if (v > 120) return { level:"critical", message:"Taquicardia severa" };
    if (v > 100) return { level:"danger",   message:"Taquicardia" };
    return              { level:"normal",   message:"Frecuencia cardíaca normal" };
  };

  const evaluarTA = (ta: string): AlertInfo | null => {
    if (!ta || !ta.includes('/')) return null;
    const [s, d] = ta.split('/').map(parseFloat);
    if (isNaN(s) || isNaN(d)) return null;
    if (s > 180 || d > 120)  return { level:"critical", message:"Crisis de hipertensión - Requiere atención inmediata" };
    if (s >= 140 || d >= 90) return { level:"danger",   message:"Hipertensión Nivel 2" };
    if (s >= 130 || d > 80)  return { level:"danger",   message:"Hipertensión Nivel 1" };
    if (s >= 120 && d <= 80) return { level:"warning",  message:"Presión arterial elevada" };
    if (s < 80  || d < 60)   return { level:"warning",  message:"Hipotensión" };
    return                          { level:"normal",   message:"Presión arterial normal" };
  };

  const evaluarFR = (fr: string): AlertInfo | null => {
    const v = parseFloat(fr); if (isNaN(v) || !fr) return null;
    if (v > 30) return { level:"critical", message:"Taquipnea severa" };
    if (v > 20) return { level:"danger",   message:"Taquipnea" };
    if (v < 12) return { level:"warning",  message:"Bradipnea" };
    return             { level:"normal",   message:"Frecuencia respiratoria normal" };
  };

  const evaluarTemp = (t: string): AlertInfo | null => {
    const v = parseFloat(t); if (isNaN(v) || !t) return null;
    if (v > 39)           return { level:"critical", message:"Fiebre alta" };
    if (v > 38)           return { level:"danger",   message:"Fiebre" };
    if (v >= 37.5)        return { level:"warning",  message:"Febrícula" };
    if (v < 36)           return { level:"warning",  message:"Hipotermia" };
    return                       { level:"normal",   message:"Temperatura normal" };
  };

  const evaluarSat = (s: string): AlertInfo | null => {
    const v = parseFloat(s); if (isNaN(v) || !s) return null;
    if (v < 90) return { level:"critical", message:"Saturación crítica - Requiere atención inmediata" };
    if (v < 95) return { level:"danger",   message:"Saturación baja" };
    if (v < 97) return { level:"warning",  message:"Saturación levemente baja" };
    return             { level:"normal",   message:"Saturación normal" };
  };

  const AlertaBanner = ({ alert }: { alert: AlertInfo }) => {
    const map = {
      normal:   { bg:'#f0fdf4', border:'#86efac', text:'#166534' },
      warning:  { bg:'#fffbeb', border:'#fde68a', text:'#92400e' },
      danger:   { bg:'#fff7ed', border:'#fdba74', text:'#9a3412' },
      critical: { bg:'#fef2f2', border:'#fca5a5', text:'#991b1b' },
    }[alert.level];
    return (
      <div style={{ display:'flex', alignItems:'center', gap:7, marginTop:7, padding:'7px 10px', borderRadius:T.radiusSm, background:map.bg, border:`1px solid ${map.border}` }}>
        <AlertTriangle size={14} style={{ color:map.text, flexShrink:0 }}/>
        <span style={{ fontSize:12, fontWeight:500, color:map.text }}>{alert.message}</span>
      </div>
    );
  };

  const categoria = imc ? getImcCategoria(parseFloat(imc)) : null;

  const handleNext = () => {
    if (!data.estatura || parseFloat(data.estatura) <= 0) { alert("Ingrese la estatura"); return; }
    if (!data.peso || parseFloat(data.peso) <= 0)         { alert("Ingrese el peso"); return; }
    if (!data.presionArterial.trim())                     { alert("Ingrese la presión arterial"); return; }
    if (!data.frecuenciaCardiaca || parseFloat(data.frecuenciaCardiaca) <= 0) { alert("Ingrese la frecuencia cardíaca"); return; }
    if (!data.frecuenciaRespiratoria || parseFloat(data.frecuenciaRespiratoria) <= 0) { alert("Ingrese la frecuencia respiratoria"); return; }
    if (!data.temperatura || parseFloat(data.temperatura) <= 0) { alert("Ingrese la temperatura"); return; }
    onNext();
  };

  const seccionHeader = (label: string, color: string) => (
    <div style={{ padding:'12px 16px', borderRadius:T.radiusSm, background:`${color}15`, borderLeft:`3px solid ${color}`, display:'flex', alignItems:'center', gap:8 }}>
      <Activity size={15} style={{ color }}/>
      <span style={{ fontWeight:600, fontSize:14, color }}>{label}</span>
    </div>
  );

  const sistemas = [
    { nombre:"Sistema Cardiovascular",   clave:"cardiovascular"     },
    { nombre:"Sistema Respiratorio",     clave:"respiratorio"       },
    { nombre:"Sistema Digestivo",        clave:"digestivo"          },
    { nombre:"Sistema Neurológico",      clave:"neurologico"        },
    { nombre:"Sistema Musculoesquelético", clave:"musculoesqueletico" },
    { nombre:"Sistema Genitourinario",   clave:"genitourinario"     },
    { nombre:"Sistema Endocrino",        clave:"endocrino"          },
    { nombre:"Piel y Faneras",           clave:"pielFaneras"        },
  ];

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:20 }}>

      {/* Antropometría */}
      {seccionHeader("Medidas Antropométricas", "#7c3aed")}

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
        {[
          { label:"Talla (cm)", key:"estatura", placeholder:"Ej: 175", icon:<Ruler size={15} style={{ color:T.textMuted }}/> },
          { label:"Peso (kg)",  key:"peso",     placeholder:"Ej: 70",  icon:<Weight size={15} style={{ color:T.textMuted }}/> },
        ].map(({ label, key, placeholder, icon }) => (
          <div key={key}>
            <label style={{ display:'block', marginBottom:6, fontSize:13, fontWeight:600, color:T.textSecondary }}>
              {label} <span style={{ color:T.danger }}>*</span>
            </label>
            <div style={{ position:'relative' }}>
              <div style={{ position:'absolute', left:10, top:'50%', transform:'translateY(-50%)' }}>{icon}</div>
              <input type="number" placeholder={placeholder}
                value={(data as any)[key]}
                onChange={e => updateData({ [key]: e.target.value } as any)}
                style={{ width:'100%', padding:'9px 11px 9px 32px', border:`1px solid ${T.border}`, borderRadius:T.radiusSm, fontSize:13, outline:'none', boxSizing:'border-box' }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* IMC */}
      <div style={{ padding:'14px 16px', background:T.primaryLight, borderRadius:T.radiusSm, border:`1px solid ${T.border}`, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <div>
          <p style={{ margin:'0 0 2px', fontSize:12, color:T.textMuted, fontWeight:500 }}>Índice de Masa Corporal (IMC)</p>
          <p style={{ margin:0, fontSize:26, fontWeight:700, color:T.primary }}>
            {imc || '—'}
            {imc && <span style={{ fontSize:12, fontWeight:400, color:T.textMuted, marginLeft:4 }}>kg/m²</span>}
          </p>
          {categoria && <p style={{ margin:'3px 0 0', fontSize:12, fontWeight:600, color:categoria.color }}>{categoria.texto}</p>}
        </div>
        <div style={{ textAlign:'right', fontSize:11, color:T.textMuted }}>
          <p style={{ margin:0, fontWeight:500 }}>Cálculo automático</p>
          <p style={{ margin:0 }}>IMC = Peso / Talla²</p>
        </div>
      </div>

      {/* Signos Vitales */}
      {seccionHeader("Signos Vitales", T.danger)}

      {/* Presión Arterial */}
      <div>
        <label style={{ display:'block', marginBottom:6, fontSize:13, fontWeight:600, color:T.textSecondary }}>
          Presión Arterial (TA) <span style={{ color:T.danger }}>*</span>
        </label>
        <div style={{ position:'relative' }}>
          <div style={{ position:'absolute', left:10, top:'50%', transform:'translateY(-50%)' }}>
            <Heart size={15} style={{ color:T.textMuted }}/>
          </div>
          <select value={data.presionArterial} onChange={e => updateData({ presionArterial: e.target.value })}
            style={{ width:'100%', padding:'9px 11px 9px 32px', border:`1px solid ${T.border}`, borderRadius:T.radiusSm, fontSize:13, outline:'none', background:T.surface, cursor:'pointer' }}>
            <option value="">Seleccione TA...</option>
            {["80/50","85/55","90/60","95/65","100/65","100/70","105/70","110/70","110/75","115/75","120/70","120/75","120/80","125/80","130/80","130/85","135/85","135/90","140/85","140/90","145/90","150/90","150/95","160/95","160/100","170/100","170/105","180/110","190/110","200/120"].map(v => (
              <option key={v} value={v}>{v} mmHg</option>
            ))}
          </select>
        </div>
        <p style={{ margin:'4px 0 0', fontSize:11, color:T.textMuted }}>Formato: Sistólica/Diastólica (mmHg)</p>
        {evaluarTA(data.presionArterial) && <AlertaBanner alert={evaluarTA(data.presionArterial)!}/>}
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
        {[
          { label:"Frecuencia Cardíaca (FC)", key:"frecuenciaCardiaca",    placeholder:"Ej: 70",   hint:"Latidos por minuto (lpm)",          icon:<Heart size={15}/>,      evalFn: evaluarFC,   req:true },
          { label:"Frecuencia Respiratoria (FR)", key:"frecuenciaRespiratoria", placeholder:"Ej: 16", hint:"Respiraciones por minuto (rpm)",  icon:<Wind size={15}/>,       evalFn: evaluarFR,   req:true },
          { label:"Temperatura (T°)",         key:"temperatura",           placeholder:"Ej: 36.5", hint:"Grados Celsius (°C)",               icon:<Thermometer size={15}/>, evalFn: evaluarTemp, req:true },
          { label:"Saturación de Oxígeno (SpO₂)", key:"saturacionOxigeno", placeholder:"Ej: 98",  hint:"Porcentaje (%)",                    icon:<Droplets size={15}/>,   evalFn: evaluarSat,  req:false },
        ].map(({ label, key, placeholder, hint, icon, evalFn, req }) => (
          <div key={key}>
            <label style={{ display:'block', marginBottom:6, fontSize:13, fontWeight:600, color:T.textSecondary }}>
              {label} {req && <span style={{ color:T.danger }}>*</span>}
            </label>
            <div style={{ position:'relative' }}>
              <div style={{ position:'absolute', left:10, top:'50%', transform:'translateY(-50%)', color:T.textMuted }}>{icon}</div>
              <input type="number" placeholder={placeholder}
                value={(data as any)[key]}
                onChange={e => updateData({ [key]: e.target.value } as any)}
                step={key === 'temperatura' ? '0.1' : '1'}
                style={{ width:'100%', padding:'9px 11px 9px 32px', border:`1px solid ${T.border}`, borderRadius:T.radiusSm, fontSize:13, outline:'none', boxSizing:'border-box' }}
              />
            </div>
            <p style={{ margin:'4px 0 0', fontSize:11, color:T.textMuted }}>{hint}</p>
            {evalFn((data as any)[key]) && <AlertaBanner alert={evalFn((data as any)[key])!}/>}
          </div>
        ))}
      </div>

      {/* Exploración por sistemas */}
      {seccionHeader("Exploración Física por Sistemas", T.success)}

      <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
        {sistemas.map(({ nombre, clave }) => (
          <SistemaExploracion key={clave}
            nombre={nombre} nombreClave={clave}
            estado={(data.exploracionSistemas as any)[clave]?.estado ?? ""}
            observaciones={(data.exploracionSistemas as any)[clave]?.observaciones ?? ""}
            data={data} updateData={updateData}
            showTemplates={showTemplates} toggleTemplates={toggleTemplates}
            plantillasPredefinidas={plantillasPredefinidas} aplicarPlantilla={aplicarPlantilla}
            customTemplates={customTemplates}
            showAddTemplate={showAddTemplate} toggleAddTemplate={toggleAddTemplate}
            newTemplate={newTemplate} setNewTemplate={setNewTemplate}
            guardarNuevaPlantilla={guardarNuevaPlantilla}
            eliminarPlantillaPersonalizada={eliminarPlantillaPersonalizada}
          />
        ))}
      </div>
    </div>
  );
}