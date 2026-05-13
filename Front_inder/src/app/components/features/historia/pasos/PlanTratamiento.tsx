import { HistoriaClinicaData } from "../HistoriaClinica";
import { Download, Mail, MessageCircle, Printer, X, Plus, Search, ChevronDown, ChevronUp, Trash2 } from "lucide-react";
import { useState, useMemo } from "react";
import { toast } from 'sonner';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const T = {
  primary:'#1F4788', primaryLight:'#EEF3FB',
  surface:'#ffffff', surfaceAlt:'#f8fafc',
  border:'#e2e8f0', borderLight:'#f1f5f9',
  textPrimary:'#0f172a', textSecondary:'#475569', textMuted:'#94a3b8',
  danger:'#ef4444', dangerBg:'#fee2e2',
  success:'#10b981', successBg:'#f0fdf4',
  teal:'#0f766e', tealBg:'#f0fdfa',
  violet:'#6d28d9', violetBg:'#f5f3ff',
  amber:'#b45309', amberBg:'#fffbeb',
  radius:'12px', radiusSm:'8px',
};

// Colores por sección
const SEC = {
  recetas:        { color:T.success,  bg:T.successBg,  border:'#a7f3d0' },
  pruebas:        { color:T.primary,  bg:T.primaryLight, border:'#bfdbfe' },
  interconsultas: { color:'#374151',  bg:T.surfaceAlt,  border:T.border  },
  remisiones:     { color:T.danger,   bg:T.dangerBg,   border:'#fca5a5'  },
};

type Interconsulta = { especialista: string; motivo: string; };
type Remision      = { especialista: string; motivo: string; prioridad: "Normal"|"Urgente"; fechaRemision: string; };
type Receta        = { categoria:string; nombrePrueba:string; codigoCUPS:string; resultado:string; archivosAdjuntos:File[]; };
type PruebaAyuda   = { id?:string; codigoCUPS:string; nombre:string; };

const especialistas = ["Psicólogo/a Deportivo","Médico Fisiatra","Nutricionista Deportivo","Fisioterapeuta","Cardiólogo","Médico Ortopedista"];

const CUPS_DATABASE = [
  {codigo:"80101",nombre:"Hemograma completo"},{codigo:"80102",nombre:"Química sanguínea"},
  {codigo:"71010",nombre:"Radiografía de cadera"},{codigo:"71015",nombre:"Radiografía de rodilla"},
  {codigo:"71020",nombre:"Radiografía de tobillo"},{codigo:"76080",nombre:"Resonancia magnética de rodilla"},
  {codigo:"76085",nombre:"Resonancia magnética de hombro"},{codigo:"92030",nombre:"Electrocardiograma"},
  {codigo:"76010",nombre:"Ecografía abdominal"},{codigo:"92035",nombre:"Prueba de esfuerzo"},
  {codigo:"76050",nombre:"Ultrasonido de hombro"},{codigo:"71025",nombre:"Tomografía de tobillo"},
  {codigo:"80105",nombre:"Prueba de glucosa"},{codigo:"80110",nombre:"Análisis de lípidos"},
  {codigo:"76012",nombre:"Ecografía de cadera"},
];

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

const inputStyle: React.CSSProperties = { width:'100%', padding:'9px 11px', border:`1px solid ${T.border}`, borderRadius:T.radiusSm, fontSize:13, outline:'none', boxSizing:'border-box', background:T.surface };
const textareaStyle: React.CSSProperties = { ...inputStyle, resize:'vertical', fontFamily:'inherit' };

const Campo = ({ label, req, children }: { label:string; req?:boolean; children:React.ReactNode }) => (
  <div>
    <label style={{ display:'block', marginBottom:5, fontSize:12, fontWeight:600, color:T.textSecondary }}>
      {label}{req && <span style={{ color:T.danger }}> *</span>}
    </label>
    {children}
  </div>
);

const SeccionColapsable = ({ titulo, color, bg, border, abierta, onToggle, children, contador }: any) => (
  <div style={{ border:`1px solid ${border}`, borderRadius:T.radius, overflow:'hidden', background:bg }}>
    <button type="button" onClick={onToggle}
      style={{ width:'100%', display:'flex', justifyContent:'space-between', alignItems:'center', padding:'14px 18px', background:'transparent', border:'none', cursor:'pointer' }}>
      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
        <h3 style={{ margin:0, fontSize:14, fontWeight:700, color }}>{titulo}</h3>
        {contador > 0 && <span style={{ fontSize:11, fontWeight:700, background:`${color}20`, color, padding:'2px 8px', borderRadius:20 }}>{contador}</span>}
      </div>
      {abierta ? <ChevronUp size={16} style={{ color }}/> : <ChevronDown size={16} style={{ color }}/>}
    </button>
    {abierta && <div style={{ padding:'0 18px 18px' }}>{children}</div>}
  </div>
);

type Props = {
  data: HistoriaClinicaData; updateData: (data: Partial<HistoriaClinicaData>) => void;
  onPrevious: () => void; onSave?: () => void; onNext?: () => void;
  onCancel: () => void; onPrint: () => void;
  historiaId?: string; deportista?: any; historia?: any;
};

export function PlanTratamiento({ data, updateData, onPrevious, onSave, onCancel, onPrint, historiaId, deportista, historia }: Props) {
  const [interconsultas, setInterconsultas] = useState<Interconsulta[]>(data.remisionesEspecialistas?.filter(r => r.prioridad==="Normal") || []);
  const [remisiones,     setRemisiones]     = useState<Remision[]>(data.remisionesEspecialistas?.filter(r => r.prioridad==="Urgente") || []);
  const [nuevaI, setNuevaI] = useState({ especialista:"", motivo:"" });
  const [nuevaR, setNuevaR] = useState({ especialista:"", motivo:"", prioridad:"Urgente" as const, fechaRemision: new Date().toISOString().split('T')[0] });

  const [recetas,     setRecetas]     = useState<Receta[]>(data.ayudasDiagnosticas || []);
  const [showFormR,   setShowFormR]   = useState(false);
  const [nuevaReceta, setNuevaReceta] = useState<Receta>({ categoria:"Medicamento", nombrePrueba:"", codigoCUPS:"", resultado:"", archivosAdjuntos:[] });

  const [pruebas,    setPruebas]   = useState<PruebaAyuda[]>([]);
  const [showFormP,  setShowFormP] = useState(false);
  const [buscarP,    setBuscarP]   = useState("");
  const [showSugP,   setShowSugP]  = useState(false);
  const [nuevaP,     setNuevaP]    = useState<PruebaAyuda>({ codigoCUPS:"", nombre:"" });

  const [secs, setSecs] = useState({ recetas:false, pruebas:false, interconsultas:false, remisiones:false });
  const [downloading, setDownloading] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [sendingWA,  setSendingWA]  = useState(false);

  const cupsSug = useMemo(() => {
    if (buscarP.length < 2) return [];
    const s = buscarP.toLowerCase();
    return CUPS_DATABASE.filter(c => c.nombre.toLowerCase().includes(s) || c.codigo.includes(s)).slice(0,8);
  }, [buscarP]);

  const syncRemisiones = (ic: Interconsulta[], rm: Remision[]) => {
    updateData({ remisionesEspecialistas: [
      ...ic.map(i => ({ ...i, prioridad:"Normal" as const, fechaRemision: new Date().toISOString().split('T')[0] })),
      ...rm
    ]});
  };

  const agregarReceta = () => {
    if (!nuevaReceta.nombrePrueba.trim() || !nuevaReceta.codigoCUPS.trim()) { toast.error("Complete nombre y dosis"); return; }
    const u = [...recetas, nuevaReceta]; setRecetas(u); updateData({ ayudasDiagnosticas: u });
    setNuevaReceta({ categoria:"Medicamento", nombrePrueba:"", codigoCUPS:"", resultado:"", archivosAdjuntos:[] });
    setShowFormR(false); toast.success("Receta agregada");
  };

  const agregarPrueba = () => {
    if (!nuevaP.codigoCUPS || !nuevaP.nombre) { toast.error("Seleccione una prueba"); return; }
    setPruebas([...pruebas, { id:Date.now().toString(), ...nuevaP }]);
    setNuevaP({ codigoCUPS:"", nombre:"" }); setBuscarP(""); setShowFormP(false); toast.success("Prueba agregada");
  };

  const agregarI = () => {
    if (!nuevaI.especialista || !nuevaI.motivo) { toast.error("Complete todos los campos"); return; }
    const u = [...interconsultas, nuevaI]; setInterconsultas(u); setNuevaI({ especialista:"", motivo:"" }); syncRemisiones(u, remisiones);
  };

  const agregarR = () => {
    if (!nuevaR.especialista || !nuevaR.motivo) { toast.error("Complete todos los campos"); return; }
    const u = [...remisiones, nuevaR]; setRemisiones(u);
    setNuevaR({ especialista:"", motivo:"", prioridad:"Urgente", fechaRemision: new Date().toISOString().split('T')[0] });
    syncRemisiones(interconsultas, u);
  };

  const handleDescargarPDF = async () => {
    try {
      setDownloading(true);
      const res = await fetch(`${API_BASE_URL}/documentos/${historiaId}/historia-clinica-pdf`);
      if (!res.ok) throw new Error('Error al descargar PDF');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url;
      a.download = `historia_clinica_${deportista?.numero_documento || historiaId}.pdf`;
      document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
      toast.success('Historia descargada');
    } catch { toast.error('Error al descargar el PDF'); }
    finally { setDownloading(false); }
  };

  const abrirMailto = (email: string) => {
    const sub = encodeURIComponent(`Historia Clínica - ${deportista?.nombres} ${deportista?.apellidos}`);
    const bod = encodeURIComponent(`Estimado(a) ${deportista?.nombres},\n\nDescargue su historia clínica:\n${API_BASE_URL}/documentos/${historiaId}/historia-clinica-pdf\n\nINDERHUILA`);
    window.open(`mailto:${email}?subject=${sub}&body=${bod}`, '_blank');
  };

  const handleEmail = async () => {
    const email = deportista?.email; if (!email) { toast.error('Sin correo registrado'); return; }
    try {
      setSendingEmail(true);
      const res = await fetch(`${API_BASE_URL}/documentos/${historiaId}/enviar-email?email_destino=${encodeURIComponent(email)}`, { method:'POST' });
      const d = await res.json();
      if (res.ok && d.success) toast.success(`Enviado a ${email}`);
      else { abrirMailto(email); toast.info('Abriendo cliente de correo...'); }
    } catch { abrirMailto(deportista.email); }
    finally { setSendingEmail(false); }
  };

  const handleWA = async () => {
    let tel = deportista?.telefono || deportista?.celular;
    if (!tel) { toast.error('Sin teléfono registrado'); return; }
    tel = tel.replace(/\D/g,''); if (tel.length === 10) tel = '57' + tel;
    try {
      setSendingWA(true);
      const res = await fetch(`${API_BASE_URL}/descarga-segura/generar-token/${historiaId}`, { method:'POST' });
      const d = await res.json();
      if (d.success) {
        const msg = encodeURIComponent(`*INDERHUILA*\n\nHola ${deportista.nombres}, tu historia clínica está lista:\n${d.url}\n\nCédula: ${deportista.numero_documento}\nExpira en 2 horas.`);
        window.open(`https://wa.me/${tel}?text=${msg}`, '_blank');
        toast.success('Se abrirá WhatsApp');
      }
    } catch { toast.error('Error al generar enlace'); }
    finally { setSendingWA(false); }
  };

  const BtnAgregar = ({ label, color, onClick }: { label:string; color:string; onClick:()=>void }) => (
    <button type="button" onClick={onClick}
      style={{ width:'100%', display:'flex', alignItems:'center', justifyContent:'center', gap:8, padding:'10px 16px', background:color, color:'#fff', border:'none', borderRadius:T.radiusSm, cursor:'pointer', fontSize:13, fontWeight:600 }}>
      <Plus size={14}/> {label}
    </button>
  );

  const ItemLista = ({ children, color, onDelete }: { children:React.ReactNode; color:string; onDelete:()=>void }) => (
    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', padding:'10px 12px', background:T.surface, border:`1px solid ${T.borderLight}`, borderLeft:`3px solid ${color}`, borderRadius:T.radiusSm, marginBottom:6 }}>
      <div style={{ flex:1 }}>{children}</div>
      <button type="button" onClick={onDelete}
        style={{ padding:5, background:T.dangerBg, border:'none', borderRadius:T.radiusSm, cursor:'pointer', color:T.danger, flexShrink:0, marginLeft:8 }}>
        <X size={12}/>
      </button>
    </div>
  );

  const selectStyle: React.CSSProperties = { ...inputStyle, cursor:'pointer' };

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:18 }}>

      {/* Indicaciones Médicas */}
      <div style={{ border:`1px solid ${T.border}`, borderRadius:T.radius, overflow:'hidden' }}>
        <div style={{ padding:'12px 16px', background:T.surfaceAlt, borderBottom:`1px solid ${T.borderLight}` }}>
          <h3 style={{ margin:0, fontSize:14, fontWeight:700, color:T.textPrimary }}>Indicaciones Médicas <span style={{ color:T.danger }}>*</span></h3>
        </div>
        <div style={{ padding:'16px' }}>
          <textarea value={data.indicacionesMedicas} rows={5}
            onChange={e => updateData({ indicacionesMedicas: e.target.value })}
            placeholder="Medicamentos, terapias, restricciones, cuidados especiales..."
            style={textareaStyle}/>
        </div>
      </div>

      {/* Recetas Médicas */}
      <SeccionColapsable titulo="Recetas Médicas" color={SEC.recetas.color} bg={SEC.recetas.bg} border={SEC.recetas.border}
        abierta={secs.recetas} onToggle={() => setSecs(s => ({ ...s, recetas:!s.recetas }))} contador={recetas.length}>
        {!showFormR ? (
          <BtnAgregar label="Agregar Receta" color={SEC.recetas.color} onClick={() => setShowFormR(true)}/>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:12, padding:14, background:T.surface, border:`1px solid ${T.border}`, borderRadius:T.radiusSm }}>
            <Campo label="Nombre del Medicamento" req><input value={nuevaReceta.nombrePrueba} onChange={e => setNuevaReceta(p => ({ ...p, nombrePrueba:e.target.value }))} placeholder="Nombre del medicamento" style={inputStyle}/></Campo>
            <Campo label="Código / Dosis" req><input value={nuevaReceta.codigoCUPS} onChange={e => setNuevaReceta(p => ({ ...p, codigoCUPS:e.target.value }))} placeholder="Ej: 500mg cada 8 horas" style={inputStyle}/></Campo>
            <Campo label="Indicaciones"><textarea value={nuevaReceta.resultado} rows={2} onChange={e => setNuevaReceta(p => ({ ...p, resultado:e.target.value }))} placeholder="Tomar con alimentos, duración, precauciones..." style={textareaStyle}/></Campo>
            <div style={{ display:'flex', gap:8 }}>
              <button type="button" onClick={agregarReceta} style={{ flex:1, padding:'9px', background:SEC.recetas.color, color:'#fff', border:'none', borderRadius:T.radiusSm, cursor:'pointer', fontSize:13, fontWeight:600 }}>Guardar</button>
              <button type="button" onClick={() => { setShowFormR(false); setNuevaReceta({ categoria:"Medicamento", nombrePrueba:"", codigoCUPS:"", resultado:"", archivosAdjuntos:[] }); }} style={{ flex:1, padding:'9px', background:T.surfaceAlt, border:`1px solid ${T.border}`, borderRadius:T.radiusSm, cursor:'pointer', fontSize:13 }}>Cancelar</button>
            </div>
          </div>
        )}
        {recetas.map((r, i) => (
          <ItemLista key={i} color={SEC.recetas.color} onDelete={() => { const u = recetas.filter((_,j) => j!==i); setRecetas(u); updateData({ ayudasDiagnosticas: u }); }}>
            <p style={{ margin:0, fontSize:13, fontWeight:600, color:T.textPrimary }}>{r.nombrePrueba}</p>
            <p style={{ margin:'2px 0 0', fontSize:12, color:T.textSecondary }}><strong>Dosis:</strong> {r.codigoCUPS}</p>
            {r.resultado && <p style={{ margin:'2px 0 0', fontSize:11, color:T.textMuted, fontStyle:'italic' }}>{r.resultado}</p>}
          </ItemLista>
        ))}
      </SeccionColapsable>

      {/* Pruebas Solicitadas */}
      <SeccionColapsable titulo="Pruebas Solicitadas" color={SEC.pruebas.color} bg={SEC.pruebas.bg} border={SEC.pruebas.border}
        abierta={secs.pruebas} onToggle={() => setSecs(s => ({ ...s, pruebas:!s.pruebas }))} contador={pruebas.length}>
        {!showFormP ? (
          <BtnAgregar label="Agregar Prueba" color={SEC.pruebas.color} onClick={() => setShowFormP(true)}/>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:12, padding:14, background:T.surface, border:`1px solid ${T.border}`, borderRadius:T.radiusSm }}>
            <Campo label="Buscar por CUPS o nombre">
              <div style={{ position:'relative' }}>
                <Search size={13} style={{ position:'absolute', left:10, top:'50%', transform:'translateY(-50%)', color:T.textMuted }}/>
                <input value={buscarP} onChange={e => { setBuscarP(e.target.value); setShowSugP(true); }} onFocus={() => setShowSugP(true)}
                  placeholder="Ej: Hemograma, 80101..." style={{ ...inputStyle, paddingLeft:28 }}/>
                {showSugP && cupsSug.length > 0 && (
                  <div style={{ position:'absolute', zIndex:20, background:T.surface, border:`1px solid ${T.primary}`, borderRadius:T.radiusSm, boxShadow:'0 8px 24px rgba(0,0,0,0.12)', maxHeight:220, overflowY:'auto', marginTop:4, width:'100%' }}>
                    {cupsSug.map(c => (
                      <button key={c.codigo} type="button" onClick={() => { setNuevaP({ codigoCUPS:c.codigo, nombre:c.nombre }); setBuscarP(c.nombre); setShowSugP(false); }}
                        style={{ width:'100%', padding:'8px 12px', background:'transparent', border:'none', borderBottom:`1px solid ${T.borderLight}`, cursor:'pointer', textAlign:'left' }}>
                        <p style={{ margin:0, fontSize:12, fontWeight:600, color:T.textPrimary }}>{c.nombre}</p>
                        <p style={{ margin:'1px 0 0', fontSize:11, color:T.textMuted }}>CUPS: {c.codigo}</p>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </Campo>
            {nuevaP.codigoCUPS && (
              <div style={{ padding:'8px 12px', background:T.primaryLight, border:`1px solid ${T.border}`, borderRadius:T.radiusSm }}>
                <p style={{ margin:0, fontSize:13, fontWeight:600, color:T.primary }}>{nuevaP.nombre}</p>
                <p style={{ margin:'2px 0 0', fontSize:11, color:T.textMuted }}>CUPS: {nuevaP.codigoCUPS}</p>
              </div>
            )}
            <div style={{ display:'flex', gap:8 }}>
              <button type="button" onClick={agregarPrueba} disabled={!nuevaP.codigoCUPS}
                style={{ flex:1, padding:'9px', background: nuevaP.codigoCUPS ? SEC.pruebas.color : '#94a3b8', color:'#fff', border:'none', borderRadius:T.radiusSm, cursor: nuevaP.codigoCUPS ? 'pointer' : 'not-allowed', fontSize:13, fontWeight:600 }}>
                Agregar Prueba
              </button>
              <button type="button" onClick={() => { setShowFormP(false); setNuevaP({ codigoCUPS:"", nombre:"" }); setBuscarP(""); }}
                style={{ flex:1, padding:'9px', background:T.surfaceAlt, border:`1px solid ${T.border}`, borderRadius:T.radiusSm, cursor:'pointer', fontSize:13 }}>Cancelar</button>
            </div>
          </div>
        )}
        {pruebas.map(p => (
          <ItemLista key={p.id} color={SEC.pruebas.color} onDelete={() => setPruebas(pruebas.filter(x => x.id!==p.id))}>
            <p style={{ margin:0, fontSize:13, fontWeight:600, color:T.textPrimary }}>{p.nombre}</p>
            <p style={{ margin:'2px 0 0', fontSize:11, color:T.textMuted }}>CUPS: {p.codigoCUPS}</p>
          </ItemLista>
        ))}
      </SeccionColapsable>

      {/* Recomendaciones Entrenamiento */}
      <div style={{ border:`1px solid ${T.border}`, borderRadius:T.radius, overflow:'hidden' }}>
        <div style={{ padding:'12px 16px', background:T.surfaceAlt, borderBottom:`1px solid ${T.borderLight}` }}>
          <h3 style={{ margin:0, fontSize:14, fontWeight:700, color:T.textPrimary }}>Recomendaciones de Entrenamiento <span style={{ color:T.danger }}>*</span></h3>
        </div>
        <div style={{ padding:'16px' }}>
          <textarea value={data.recomendacionesEntrenamiento} rows={5}
            onChange={e => updateData({ recomendacionesEntrenamiento: e.target.value })}
            placeholder="Intensidad, ejercicios recomendados, contraindicaciones, precauciones..." style={textareaStyle}/>
        </div>
      </div>

      {/* Plan de Seguimiento */}
      <div style={{ border:`1px solid ${T.border}`, borderRadius:T.radius, overflow:'hidden' }}>
        <div style={{ padding:'12px 16px', background:T.surfaceAlt, borderBottom:`1px solid ${T.borderLight}` }}>
          <h3 style={{ margin:0, fontSize:14, fontWeight:700, color:T.textPrimary }}>Plan de Seguimiento <span style={{ color:T.danger }}>*</span></h3>
        </div>
        <div style={{ padding:'16px' }}>
          <textarea value={data.planSeguimiento} rows={5}
            onChange={e => updateData({ planSeguimiento: e.target.value })}
            placeholder="Próximas citas, controles periódicos, reevaluaciones, especialistas..." style={textareaStyle}/>
        </div>
      </div>

      {/* Interconsultas */}
      <SeccionColapsable titulo="Interconsultas" color={SEC.interconsultas.color} bg={SEC.interconsultas.bg} border={SEC.interconsultas.border}
        abierta={secs.interconsultas} onToggle={() => setSecs(s => ({ ...s, interconsultas:!s.interconsultas }))} contador={interconsultas.length}>
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          <Campo label="Especialista"><select value={nuevaI.especialista} onChange={e => setNuevaI(p => ({ ...p, especialista:e.target.value }))} style={selectStyle}><option value="">Seleccione...</option>{especialistas.map(e => <option key={e} value={e}>{e}</option>)}</select></Campo>
          <Campo label="Motivo"><textarea value={nuevaI.motivo} rows={2} onChange={e => setNuevaI(p => ({ ...p, motivo:e.target.value }))} placeholder="Describa el motivo..." style={textareaStyle}/></Campo>
          <BtnAgregar label="Agregar Interconsulta" color={T.primary} onClick={agregarI}/>
        </div>
        {interconsultas.map((ic, i) => (
          <ItemLista key={i} color={T.primary} onDelete={() => { const u = interconsultas.filter((_,j) => j!==i); setInterconsultas(u); syncRemisiones(u, remisiones); }}>
            <p style={{ margin:0, fontSize:13, fontWeight:600, color:T.textPrimary }}>{ic.especialista}</p>
            <p style={{ margin:'2px 0 0', fontSize:12, color:T.textSecondary }}>{ic.motivo}</p>
          </ItemLista>
        ))}
      </SeccionColapsable>

      {/* Remisiones */}
      <SeccionColapsable titulo="Remisiones Urgentes" color={SEC.remisiones.color} bg={SEC.remisiones.bg} border={SEC.remisiones.border}
        abierta={secs.remisiones} onToggle={() => setSecs(s => ({ ...s, remisiones:!s.remisiones }))} contador={remisiones.length}>
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          <Campo label="Especialista"><select value={nuevaR.especialista} onChange={e => setNuevaR(p => ({ ...p, especialista:e.target.value }))} style={selectStyle}><option value="">Seleccione...</option>{especialistas.map(e => <option key={e} value={e}>{e}</option>)}</select></Campo>
          <Campo label="Motivo"><textarea value={nuevaR.motivo} rows={2} onChange={e => setNuevaR(p => ({ ...p, motivo:e.target.value }))} placeholder="Describa el motivo de urgencia..." style={textareaStyle}/></Campo>
          <Campo label="Fecha"><input type="date" value={nuevaR.fechaRemision} onChange={e => setNuevaR(p => ({ ...p, fechaRemision:e.target.value }))} style={inputStyle}/></Campo>
          <BtnAgregar label="Agregar Remisión" color={SEC.remisiones.color} onClick={agregarR}/>
        </div>
        {remisiones.map((r, i) => (
          <ItemLista key={i} color={SEC.remisiones.color} onDelete={() => { const u = remisiones.filter((_,j) => j!==i); setRemisiones(u); syncRemisiones(interconsultas, u); }}>
            <p style={{ margin:0, fontSize:13, fontWeight:600, color:T.textPrimary }}>{r.especialista}</p>
            <p style={{ margin:'2px 0 0', fontSize:12, color:T.textSecondary }}>{r.motivo}</p>
            <div style={{ display:'flex', gap:6, marginTop:4 }}>
              <span style={{ fontSize:10, fontWeight:700, background:T.dangerBg, color:T.danger, padding:'1px 7px', borderRadius:20 }}>{r.prioridad}</span>
              <span style={{ fontSize:10, color:T.textMuted }}>{new Date(r.fechaRemision).toLocaleDateString('es-CO')}</span>
            </div>
          </ItemLista>
        ))}
      </SeccionColapsable>

      {/* Botones distribución */}
      {historiaId && (
        <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
          {[
            { label: downloading ? 'Descargando...' : 'PDF', Icon: Download, color:'#dc2626', onClick: handleDescargarPDF, disabled: downloading },
            { label: sendingEmail ? 'Enviando...' : 'Email', Icon: Mail, color:T.primary, onClick: handleEmail, disabled: sendingEmail },
            { label: sendingWA ? 'Generando...' : 'WhatsApp', Icon: MessageCircle, color:T.success, onClick: handleWA, disabled: sendingWA },
            { label: 'Imprimir', Icon: Printer, color:'#374151', onClick: onPrint, disabled: false },
          ].map(({ label, Icon, color, onClick, disabled }) => (
            <button key={label} type="button" onClick={onClick} disabled={disabled}
              style={{ display:'flex', alignItems:'center', gap:6, padding:'9px 14px', background: disabled ? '#94a3b8' : color, color:'#fff', border:'none', borderRadius:T.radiusSm, cursor: disabled ? 'not-allowed' : 'pointer', fontSize:13, fontWeight:600 }}>
              <Icon size={14}/> {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default PlanTratamiento;