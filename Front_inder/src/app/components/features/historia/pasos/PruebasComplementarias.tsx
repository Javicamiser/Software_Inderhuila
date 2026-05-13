import { useState, useRef } from "react";
import { HistoriaClinicaData } from "../HistoriaClinica";
import { Upload, X, Plus, Trash2, FlaskConical, ScanLine, Activity, Dumbbell, AlertCircle, Search, File, Paperclip } from "lucide-react";
import { buscarProcedimientoPorCodigo, buscarCodigosPorNombre, formatearCodigoCUPS } from "./cupsDatabase";

const T = {
  primary:'#1F4788', primaryLight:'#EEF3FB',
  surface:'#ffffff', surfaceAlt:'#f8fafc',
  border:'#e2e8f0', borderLight:'#f1f5f9',
  textPrimary:'#0f172a', textSecondary:'#475569', textMuted:'#94a3b8',
  danger:'#ef4444', dangerBg:'#fee2e2',
  success:'#10b981', successBg:'#f0fdf4',
  radius:'12px', radiusSm:'8px',
};

// Colores suaves por categoría — paleta consistente
const CATEGORIA_COLORS: Record<string, { color:string; bg:string; border:string; Icon: any }> = {
  "Laboratorios":       { color:'#7c3aed', bg:'#f5f3ff', border:'#ddd6fe', Icon: FlaskConical },
  "Imágenes":           { color:'#1d4ed8', bg:'#eff6ff', border:'#bfdbfe', Icon: ScanLine     },
  "Pruebas Funcionales":{ color:'#065f46', bg:'#f0fdf4', border:'#a7f3d0', Icon: Activity     },
  "Pruebas Deportivas": { color:'#9a3412', bg:'#fff7ed', border:'#fed7aa', Icon: Dumbbell     },
  "Procedimientos":     { color:'#1e40af', bg:'#eff6ff', border:'#bfdbfe', Icon: Activity     },
};
const getCategoria = (cat: string) => CATEGORIA_COLORS[cat] ?? { color:T.textSecondary, bg:T.surfaceAlt, border:T.border, Icon: Activity };

type Props = {
  data: HistoriaClinicaData;
  updateData: (data: Partial<HistoriaClinicaData>) => void;
  onNext: () => void; onPrevious: () => void; onCancel?: () => void;
};

const inputStyle: React.CSSProperties = { width:'100%', padding:'9px 11px', border:`1px solid ${T.border}`, borderRadius:T.radiusSm, fontSize:13, outline:'none', boxSizing:'border-box', background:T.surface };
const textareaStyle: React.CSSProperties = { ...inputStyle, resize:'vertical', fontFamily:'inherit' };

const Campo = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div>
    <label style={{ display:'block', marginBottom:5, fontSize:12, fontWeight:600, color:T.textSecondary }}>{label}</label>
    {children}
  </div>
);

export function PruebasComplementarias({ data, updateData, onNext, onPrevious }: Props) {
  const [codigoCUPS,     setCodigoCUPS]     = useState("");
  const [nombreProc,     setNombreProc]     = useState("");
  const [categoriaProc,  setCategoriaProc]  = useState("");
  const [resultado,      setResultado]      = useState("");
  const [errCUPS,        setErrCUPS]        = useState("");
  const [sugerencias,    setSugerencias]    = useState<Array<{codigo:string;nombre:string;categoria:string}>>([]);
  const [showSug,        setShowSug]        = useState(false);
  const [archivos,       setArchivos]       = useState<File[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleCodigo = (v: string) => {
    const c = v.trim().replace(/\D/g,""); setCodigoCUPS(c); setErrCUPS("");
    if (c.length >= 3) {
      const p = buscarProcedimientoPorCodigo(c);
      if (p) { setNombreProc(p.nombre); setCategoriaProc(p.categoria); }
      else    { setErrCUPS("Código CUPS no encontrado"); setNombreProc(""); setCategoriaProc(""); }
    } else { setNombreProc(""); setCategoriaProc(""); }
  };

  const handleNombre = (v: string) => {
    setNombreProc(v); setErrCUPS("");
    if (v.trim().length >= 3) {
      const r = buscarCodigosPorNombre(v);
      if (r.length > 0) { setSugerencias(r); setShowSug(true); }
      else              { setCodigoCUPS(""); setCategoriaProc(""); setSugerencias([]); setShowSug(false); }
    } else { setSugerencias([]); setShowSug(false); }
  };

  const seleccionar = (codigo: string, nombre: string, categoria: string) => {
    setCodigoCUPS(codigo); setNombreProc(nombre); setCategoriaProc(categoria);
    setSugerencias([]); setShowSug(false); setErrCUPS("");
  };

  const agregar = () => {
    if (!nombreProc.trim()) { alert("Escriba el nombre del procedimiento"); return; }
    updateData({ ayudasDiagnosticas: [...data.ayudasDiagnosticas, {
      categoria: categoriaProc || "Sin categoría",
      nombrePrueba: nombreProc.trim(),
      codigoCUPS, resultado,
      archivosAdjuntos: archivos,
    }]});
    setCodigoCUPS(""); setNombreProc(""); setCategoriaProc(""); setResultado("");
    setErrCUPS(""); setSugerencias([]); setShowSug(false); setArchivos([]);
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:20 }}>

      {/* Info */}
      <div style={{ padding:'11px 15px', background:T.primaryLight, border:`1px solid ${T.border}`, borderLeft:`3px solid ${T.primary}`, borderRadius:T.radiusSm }}>
        <p style={{ margin:0, fontSize:13, color:T.textPrimary }}>
          <strong>Ayudas diagnósticas:</strong> Busque el procedimiento por código CUPS o por nombre. Campo opcional — complete solo si se requieren exámenes adicionales.
        </p>
      </div>

      {/* Formulario */}
      <div style={{ border:`1px solid ${T.border}`, borderRadius:T.radius, overflow:'hidden' }}>
        <div style={{ padding:'13px 18px', background:T.surfaceAlt, borderBottom:`1px solid ${T.borderLight}`, display:'flex', alignItems:'center', gap:8 }}>
          <Search size={15} style={{ color:T.primary }}/>
          <h3 style={{ margin:0, fontSize:14, fontWeight:700, color:T.textPrimary }}>Buscar Ayuda Diagnóstica</h3>
        </div>
        <div style={{ padding:'18px', display:'flex', flexDirection:'column', gap:14 }}>

          {/* Código CUPS */}
          <Campo label="Código CUPS">
            <div style={{ position:'relative' }}>
              <input value={codigoCUPS} onChange={e => handleCodigo(e.target.value)}
                placeholder="Ej: 902201, 890201, 990101..."
                style={{ ...inputStyle, borderColor: errCUPS ? T.danger : T.border }}/>
              <Search size={14} style={{ position:'absolute', right:10, top:'50%', transform:'translateY(-50%)', color:T.textMuted }}/>
            </div>
            {errCUPS && (
              <div style={{ display:'flex', alignItems:'center', gap:5, marginTop:5, fontSize:11, color:T.danger, background:T.dangerBg, padding:'5px 8px', borderRadius:T.radiusSm }}>
                <AlertCircle size={11}/> {errCUPS}
              </div>
            )}
            {codigoCUPS && nombreProc && !errCUPS && (
              <div style={{ marginTop:7, padding:'8px 12px', background:T.successBg, border:`1px solid #a7f3d0`, borderRadius:T.radiusSm }}>
                <p style={{ margin:0, fontSize:12, color:'#065f46' }}><strong>✓ Encontrado:</strong> {nombreProc}</p>
                <p style={{ margin:'2px 0 0', fontSize:11, color:'#065f46' }}><strong>Tipo:</strong> {categoriaProc}</p>
              </div>
            )}
          </Campo>

          {/* Divisor */}
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <div style={{ flex:1, borderTop:`1px solid ${T.border}` }}/>
            <span style={{ fontSize:12, color:T.textMuted, fontWeight:500 }}>O buscar por nombre</span>
            <div style={{ flex:1, borderTop:`1px solid ${T.border}` }}/>
          </div>

          {/* Nombre procedimiento */}
          <Campo label="Nombre del procedimiento">
            <div style={{ position:'relative' }}>
              <input value={nombreProc} onChange={e => handleNombre(e.target.value)}
                onBlur={() => setTimeout(() => setShowSug(false), 200)}
                onFocus={() => sugerencias.length > 0 && setShowSug(true)}
                placeholder="Ej: Hemograma, Ecografía, Radiografía..."
                style={inputStyle}/>
              <Search size={14} style={{ position:'absolute', right:10, top:'50%', transform:'translateY(-50%)', color:T.textMuted }}/>

              {showSug && sugerencias.length > 0 && (
                <div style={{ position:'absolute', zIndex:20, background:T.surface, border:`1px solid ${T.primary}`, borderRadius:T.radiusSm, boxShadow:'0 8px 24px rgba(0,0,0,0.12)', maxHeight:240, overflowY:'auto', marginTop:4, width:'100%' }}>
                  {sugerencias.map(s => {
                    const cat = getCategoria(s.categoria);
                    return (
                      <button key={s.codigo} type="button" onClick={() => seleccionar(s.codigo, s.nombre, s.categoria)}
                        style={{ width:'100%', padding:'9px 12px', background:'transparent', border:'none', borderBottom:`1px solid ${T.borderLight}`, cursor:'pointer', textAlign:'left', display:'flex', alignItems:'flex-start', gap:10 }}>
                        <cat.Icon size={14} style={{ color:cat.color, flexShrink:0, marginTop:2 }}/>
                        <div style={{ flex:1 }}>
                          <p style={{ margin:0, fontSize:12, fontWeight:600, color:T.textPrimary }}>{s.nombre}</p>
                          <div style={{ display:'flex', gap:6, marginTop:3 }}>
                            <span style={{ fontSize:10, fontWeight:600, color:cat.color, background:cat.bg, padding:'1px 6px', borderRadius:20 }}>{s.categoria}</span>
                            <span style={{ fontSize:10, fontFamily:'monospace', fontWeight:700, color:T.primary, background:T.primaryLight, padding:'1px 6px', borderRadius:20 }}>CUPS: {formatearCodigoCUPS(s.codigo)}</span>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
            <p style={{ margin:'4px 0 0', fontSize:11, color:T.textMuted }}>Escriba al menos 3 caracteres para buscar. También puede escribir un procedimiento personalizado.</p>
          </Campo>

          {/* Categoría detectada */}
          {categoriaProc && (
            <div style={{ padding:'8px 12px', background:T.primaryLight, border:`1px solid ${T.border}`, borderRadius:T.radiusSm }}>
              <p style={{ margin:0, fontSize:12, color:T.primary }}><strong>Tipo de prueba:</strong> {categoriaProc}</p>
            </div>
          )}

          {/* Resultado */}
          <Campo label="Resultado / Observaciones">
            <textarea value={resultado} rows={3} onChange={e => setResultado(e.target.value)}
              placeholder="Describa los resultados o hallazgos relevantes de la prueba..."
              style={textareaStyle}/>
          </Campo>

          {/* Archivos */}
          <Campo label="Adjuntar archivos (opcional)">
            <div style={{ border:`2px dashed ${T.border}`, borderRadius:T.radiusSm, padding:'20px 16px', textAlign:'center', cursor:'pointer', background:T.surfaceAlt }}
              onClick={() => fileRef.current?.click()}>
              <Upload size={24} style={{ color:T.textMuted, margin:'0 auto 8px' }}/>
              <p style={{ margin:0, fontSize:13, color:T.primary, fontWeight:600 }}>Seleccionar archivos</p>
              <p style={{ margin:'3px 0 0', fontSize:11, color:T.textMuted }}>Formatos: PDF, JPG, PNG, DICOM</p>
              <input ref={fileRef} type="file" multiple accept=".pdf,.jpg,.jpeg,.png,.dcm"
                onChange={e => e.target.files && setArchivos([...archivos, ...Array.from(e.target.files)])}
                style={{ display:'none' }}/>
            </div>
            {archivos.length > 0 && (
              <div style={{ marginTop:10, display:'flex', flexDirection:'column', gap:5 }}>
                {archivos.map((f, i) => (
                  <div key={i} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'6px 10px', background:T.primaryLight, border:`1px solid ${T.border}`, borderRadius:T.radiusSm }}>
                    <div style={{ display:'flex', alignItems:'center', gap:6, flex:1, minWidth:0 }}>
                      <File size={13} style={{ color:T.primary, flexShrink:0 }}/>
                      <span style={{ fontSize:12, color:T.textPrimary, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{f.name}</span>
                      <span style={{ fontSize:11, color:T.textMuted, flexShrink:0 }}>({(f.size/1024).toFixed(1)} KB)</span>
                    </div>
                    <button onClick={() => setArchivos(archivos.filter((_,j) => j!==i))} type="button"
                      style={{ padding:4, background:T.dangerBg, border:'none', borderRadius:T.radiusSm, cursor:'pointer', color:T.danger, flexShrink:0, marginLeft:6 }}>
                      <X size={12}/>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </Campo>

          {/* Botón agregar */}
          <button type="button" onClick={agregar}
            style={{ width:'100%', display:'flex', alignItems:'center', justifyContent:'center', gap:8, padding:'11px 16px', background:T.primary, color:'#fff', border:'none', borderRadius:T.radiusSm, cursor:'pointer', fontSize:13, fontWeight:600 }}>
            <Plus size={15}/> Agregar Ayuda Diagnóstica
          </button>
        </div>
      </div>

      {/* Lista */}
      {data.ayudasDiagnosticas.length > 0 && (
        <div>
          <p style={{ margin:'0 0 10px', fontSize:13, fontWeight:700, color:T.textPrimary }}>Ayudas Diagnósticas Registradas</p>
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {data.ayudasDiagnosticas.map((p, i) => {
              const cat = getCategoria(p.categoria);
              return (
                <div key={i} style={{ background:cat.bg, border:`1px solid ${cat.border}`, borderLeft:`3px solid ${cat.color}`, borderRadius:T.radiusSm, padding:'14px 16px' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                    <div style={{ display:'flex', alignItems:'flex-start', gap:10, flex:1 }}>
                      <cat.Icon size={16} style={{ color:cat.color, flexShrink:0, marginTop:2 }}/>
                      <div style={{ flex:1 }}>
                        <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:5 }}>
                          <span style={{ fontSize:11, fontWeight:600, color:cat.color, background:`${cat.color}15`, padding:'2px 8px', borderRadius:20 }}>{p.categoria}</span>
                          {p.codigoCUPS && <span style={{ fontSize:11, fontFamily:'monospace', fontWeight:700, color:T.primary, background:T.primaryLight, padding:'2px 8px', borderRadius:20 }}>CUPS: {formatearCodigoCUPS(p.codigoCUPS)}</span>}
                        </div>
                        <p style={{ margin:0, fontSize:13, fontWeight:600, color:T.textPrimary }}>{p.nombrePrueba}</p>
                        {p.resultado && (
                          <p style={{ margin:'6px 0 0', fontSize:12, color:T.textSecondary, background:'rgba(255,255,255,0.6)', padding:'6px 9px', borderRadius:T.radiusSm }}>
                            <strong>Resultado:</strong> {p.resultado}
                          </p>
                        )}
                        {p.archivosAdjuntos?.length > 0 && (
                          <div style={{ marginTop:8, paddingTop:8, borderTop:`1px solid ${cat.border}` }}>
                            <p style={{ margin:'0 0 5px', fontSize:11, fontWeight:600, color:T.textMuted, display:'flex', alignItems:'center', gap:4 }}>
                              <Paperclip size={11}/> {p.archivosAdjuntos.length} archivo(s) adjunto(s)
                            </p>
                            {p.archivosAdjuntos.map((a, j) => (
                              <div key={j} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'4px 8px', background:T.surface, border:`1px solid ${T.border}`, borderRadius:T.radiusSm, marginBottom:3 }}>
                                <div style={{ display:'flex', alignItems:'center', gap:5, flex:1, minWidth:0 }}>
                                  <File size={11} style={{ color:T.primary, flexShrink:0 }}/>
                                  <span style={{ fontSize:11, color:T.textPrimary, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{a.name}</span>
                                </div>
                                <button type="button" onClick={() => {
                                  const updated = data.ayudasDiagnosticas.map((pr, pi) => pi===i ? { ...pr, archivosAdjuntos: pr.archivosAdjuntos.filter((_,aj) => aj!==j) } : pr);
                                  updateData({ ayudasDiagnosticas: updated });
                                }} style={{ padding:3, background:T.dangerBg, border:'none', borderRadius:4, cursor:'pointer', color:T.danger, flexShrink:0, marginLeft:5 }}>
                                  <X size={11}/>
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <button type="button" onClick={() => updateData({ ayudasDiagnosticas: data.ayudasDiagnosticas.filter((_,j) => j!==i) })}
                      style={{ padding:6, background:T.dangerBg, border:'none', borderRadius:T.radiusSm, cursor:'pointer', color:T.danger, flexShrink:0, marginLeft:10 }}>
                      <Trash2 size={13}/>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {data.ayudasDiagnosticas.length === 0 && (
        <div style={{ textAlign:'center', padding:'32px 0', background:T.surfaceAlt, border:`1px dashed ${T.border}`, borderRadius:T.radius }}>
          <Activity size={32} style={{ color:T.textMuted, margin:'0 auto 10px', display:'block', opacity:0.4 }}/>
          <p style={{ margin:0, fontSize:13, color:T.textMuted, fontStyle:'italic' }}>No se han registrado ayudas diagnósticas</p>
          <p style={{ margin:'4px 0 0', fontSize:11, color:T.textMuted }}>Campo opcional — agregue solo si se solicitaron pruebas.</p>
        </div>
      )}

    </div>
  );
}