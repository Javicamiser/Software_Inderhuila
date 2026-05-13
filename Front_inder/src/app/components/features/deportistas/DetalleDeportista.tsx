// ============================================================
// DETALLE DEPORTISTA
// Tabs: Datos personales | Vacunas (CRUD + certificados) | Historias
// ============================================================
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { deportistasService, vacunasService, historiaClinicaService, catalogosService } from '@/app/services/apiClient';
import { useCatalogosContext } from '@/app/contexts/CatalogosContext';
import { toast } from 'sonner';
import { ArrowLeft, Plus, Edit2, Trash2, Upload, Download, FileText, Syringe, User, X, Loader2, ExternalLink, Eye } from 'lucide-react';
const T = {
  primary:'#1F4788', primaryLight:'#EEF3FB',
  surface:'#ffffff', surfaceAlt:'#f8fafc',
  border:'#e2e8f0', borderLight:'#f1f5f9',
  textPrimary:'#0f172a', textSecondary:'#475569', textMuted:'#94a3b8',
  success:'#10b981', successBg:'#d1fae5',
  danger:'#ef4444', dangerBg:'#fee2e2',
  radius:'12px', radiusSm:'8px',
};

const fmtFecha = (d?: string | null) =>
  d ? new Date(d + 'T12:00:00').toLocaleDateString('es-CO', { day:'numeric', month:'short', year:'numeric' }) : '—';


const VACUNAS_DEPORTISTAS = [
  'Tétanos / Toxoide tetánico',
  'Hepatitis B',
  'Hepatitis A',
  'Influenza (gripa)',
  'COVID-19',
  'Fiebre Amarilla',
  'Sarampión / MMR',
  'Meningococo',
  'Neumococo',
  'Varicela',
  'Poliomielitis',
  'Difteria',
  'VPH (Virus del Papiloma Humano)',
  'Rabia (profiláctica)',
];

interface Props { deportistaId: string; onBack?: () => void; }

export function DetalleDeportista({ deportistaId, onBack }: Props) {
  const navigate = useNavigate();
  const { tiposDocumento, sexos } = useCatalogosContext();
  const [deportista, setDeportista] = useState<any>(null);
  const [historias,  setHistorias]  = useState<any[]>([]);
  const [vacunas,    setVacunas]    = useState<any[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [tab,        setTab]        = useState<'datos'|'vacunas'|'historias'>('datos');
  const [modal,      setModal]      = useState(false);
  const [editV,      setEditV]      = useState<any>(null);
  const [form,       setForm]       = useState({ nombre_vacuna:'', fecha_administracion:'', observaciones:'', archivo: null as File|null });
  const [saving,     setSaving]     = useState(false);
  const [preview,    setPreview]    = useState<{url:string; tipo:string; nombre:string} | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => { cargar(); }, [deportistaId]);

  const cargar = async () => {
    try {
      setLoading(true);
      const [dep, hists, vacs] = await Promise.all([
        deportistasService.getById(deportistaId),
        historiaClinicaService.getAll(1, 1000).then((res: any) => {
        const items = Array.isArray(res) ? res : (res?.items ?? []);
        return items.filter((h: any) => h.deportista_id === deportistaId);
      }).catch(() => []),
        vacunasService.getAll(deportistaId).catch(() => []),
      ]);
      setDeportista(dep);
      setHistorias(Array.isArray(hists) ? hists : []);
      setVacunas(Array.isArray(vacs) ? vacs : []);
    } catch { toast.error('Error cargando datos'); }
    finally { setLoading(false); }
  };

  const abrirCrear = () => { setEditV(null); setForm({ nombre_vacuna:'', fecha_administracion:'', observaciones:'', archivo:null }); setModal(true); };
  const abrirEditar = (v: any) => { setEditV(v); setForm({ nombre_vacuna:v.nombre_vacuna||'', fecha_administracion:v.fecha_administracion?.split('T')[0]||'', observaciones:v.observaciones||'', archivo:null }); setModal(true); };

  const guardar = async () => {
    if (!form.nombre_vacuna.trim()) { toast.error('El nombre es requerido'); return; }
    try {
      setSaving(true);
      const body = { nombre_vacuna:form.nombre_vacuna, fecha_administracion:form.fecha_administracion||undefined, observaciones:form.observaciones||undefined };
      let id = editV?.id;
      if (editV) { await vacunasService.update(deportistaId, id, body); toast.success('Vacuna actualizada'); }
      else { const n = await vacunasService.create(deportistaId, body); id = n.id; toast.success('Vacuna registrada'); }
      if (form.archivo && id) { await vacunasService.uploadArchivo(deportistaId, id, form.archivo); toast.success('Certificado adjuntado'); }
      setModal(false); cargar();
    } catch (e:any) { toast.error(e?.response?.data?.detail ?? 'Error al guardar'); }
    finally { setSaving(false); }
  };

  const eliminar = async (v: any) => {
    if (!confirm(`¿Eliminar "${v.nombre_vacuna}"?`)) return;
    try { await vacunasService.remove(deportistaId, v.id); toast.success('Eliminada'); cargar(); }
    catch { toast.error('Error al eliminar'); }
  };

  const verCertificado = async (v: any) => {
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`/api/v1/deportistas/${deportistaId}/vacunas/${v.id}/archivo`, {
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) }
      });
      if (!res.ok) { toast.error('Sin certificado adjunto'); return; }
      const contentType = res.headers.get('content-type') || 'application/octet-stream';
      const blob = new Blob([await res.arrayBuffer()], { type: contentType });
      const url = URL.createObjectURL(blob);
      setPreview({ url, tipo: contentType, nombre: v.nombre_archivo || v.nombre_vacuna });
    } catch { toast.error('Error al cargar certificado'); }
  };

  const descargar = async (v: any) => {
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`/api/v1/deportistas/${deportistaId}/vacunas/${v.id}/archivo`, {
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) }
      });
      if (!res.ok) { toast.error('Sin certificado adjunto'); return; }
      const contentType = res.headers.get('content-type') || 'application/octet-stream';
      const blob = new Blob([await res.arrayBuffer()], { type: contentType });
      const url = URL.createObjectURL(blob);
      // Abrir PDFs en nueva pestaña, descargar imágenes
      if (contentType.includes('pdf')) {
        window.open(url, '_blank');
      } else {
        const a = document.createElement('a');
        a.href = url;
        a.download = v.nombre_archivo || `certificado_${v.nombre_vacuna.replace(/\s/g,'_')}`;
        a.click();
      }
      setTimeout(() => URL.revokeObjectURL(url), 3000);
    } catch { toast.error('Error al descargar'); }
  };

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'60vh', flexDirection:'column', gap:12 }}>
      <Loader2 size={28} style={{ color:T.primary, animation:'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
  if (!deportista) return <div style={{ padding:24, color:T.danger }}>Deportista no encontrado</div>;

  const tabBtn = (active: boolean) => ({
    display:'flex' as const, alignItems:'center' as const, gap:7,
    padding:'9px 18px', borderRadius:T.radiusSm, border:'none',
    background:active?T.primary:'transparent', color:active?'#fff':T.textSecondary,
    cursor:'pointer' as const, fontSize:13, fontWeight:active?600:400, transition:'all 0.15s',
  });

  const tipoDoc = tiposDocumento?.find((t:any) => t.id === deportista.tipo_documento_id)?.nombre;
  const sexo    = sexos?.find((s:any) => s.id === deportista.sexo_id)?.nombre;

  const CAMPOS = [
    {label:'Tipo documento',   value: tipoDoc || deportista.tipo_documento_id?.slice?.(0,8)},
    {label:'Número documento', value: deportista.numero_documento},
    {label:'Fecha nacimiento', value: fmtFecha(deportista.fecha_nacimiento)},
    {label:'Sexo',             value: sexo},
    {label:'Teléfono',         value: deportista.telefono},
    {label:'Email',            value: deportista.email},
    {label:'Dirección',        value: deportista.direccion},
    {label:'Deporte',          value: deportista.tipo_deporte},
  ];

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:20, maxWidth:900, margin:'0 auto' }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>

      <button onClick={onBack||(() => navigate(-1))} style={{ display:'inline-flex', alignItems:'center', gap:8, background:'none', border:'none', cursor:'pointer', color:T.primary, fontSize:13, fontWeight:600, padding:0, width:'fit-content' }}>
        <ArrowLeft size={16}/> Volver
      </button>

      {/* Header */}
      <div style={{ background:T.surface, borderRadius:T.radius, border:`1px solid ${T.border}`, overflow:'hidden' }}>
        <div style={{ background:`linear-gradient(135deg,${T.primary} 0%,#3b82f6 100%)`, padding:'20px 24px', display:'flex', alignItems:'center', gap:16 }}>
          <div style={{ width:56, height:56, borderRadius:'50%', background:'rgba(255,255,255,0.2)', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontSize:22, fontWeight:800, flexShrink:0 }}>
            {deportista.nombres?.charAt(0)}{deportista.apellidos?.charAt(0)}
          </div>
          <div style={{ flex:1 }}>
            <h1 style={{ margin:0, fontSize:20, fontWeight:800, color:'#fff' }}>{deportista.nombres} {deportista.apellidos}</h1>
            <p style={{ margin:'4px 0 0', fontSize:12, color:'rgba(255,255,255,0.75)' }}>{deportista.tipo_documento} {deportista.numero_documento} · {deportista.tipo_deporte||'Sin deporte'}</p>
          </div>
          <span style={{ fontSize:12, fontWeight:600, padding:'4px 12px', borderRadius:20, background:'rgba(255,255,255,0.15)', color:'#fff' }}>
            {deportista.estado||'Activo'}
          </span>
        </div>
        <div style={{ padding:'8px 16px', borderBottom:`1px solid ${T.borderLight}`, display:'flex', gap:4, background:T.surfaceAlt }}>
          <button style={tabBtn(tab==='datos')}     onClick={() => setTab('datos')}><User size={14}/>Datos</button>
          <button style={tabBtn(tab==='vacunas')}   onClick={() => setTab('vacunas')}><Syringe size={14}/>Vacunas ({vacunas.length})</button>
          <button style={tabBtn(tab==='historias')} onClick={() => setTab('historias')}><FileText size={14}/>Historias ({historias.length})</button>
        </div>
      </div>

      {/* TAB DATOS */}
      {tab==='datos' && (
        <div style={{ background:T.surface, borderRadius:T.radius, border:`1px solid ${T.border}`, padding:'20px 24px' }}>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))', gap:20 }}>
            {CAMPOS.map(({label,value}) => (
              <div key={label}>
                <p style={{ margin:'0 0 3px', fontSize:11, fontWeight:600, color:T.textMuted, textTransform:'uppercase', letterSpacing:'0.05em' }}>{label}</p>
                <p style={{ margin:0, fontSize:14, color:T.textPrimary, fontWeight:500 }}>{value||'—'}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB VACUNAS */}
      {tab==='vacunas' && (
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <p style={{ margin:0, fontSize:13, color:T.textSecondary }}>{vacunas.length} vacuna(s) registrada(s)</p>
            <button onClick={abrirCrear} style={{ display:'flex', alignItems:'center', gap:7, padding:'8px 16px', background:T.primary, color:'#fff', border:'none', borderRadius:T.radiusSm, cursor:'pointer', fontSize:13, fontWeight:600 }}>
              <Plus size={14}/> Agregar vacuna
            </button>
          </div>
          {vacunas.length===0 ? (
            <div style={{ textAlign:'center', padding:'40px 0', background:T.surface, borderRadius:T.radius, border:`1px dashed ${T.border}` }}>
              <Syringe size={32} style={{ color:T.textMuted, margin:'0 auto 12px', display:'block', opacity:0.4 }}/>
              <p style={{ margin:0, fontSize:14, color:T.textMuted }}>No hay vacunas registradas</p>
            </div>
          ) : (
            <div style={{ background:T.surface, borderRadius:T.radius, border:`1px solid ${T.border}`, overflow:'hidden' }}>
              <table style={{ width:'100%', borderCollapse:'collapse' }}>
                <thead><tr style={{ background:T.surfaceAlt }}>
                  {['Vacuna','Fecha','Observaciones','Certificado','Acciones'].map(h => (
                    <th key={h} style={{ padding:'11px 16px', textAlign:'left', fontSize:12, fontWeight:600, color:T.textSecondary, borderBottom:`1px solid ${T.border}` }}>{h}</th>
                  ))}
                </tr></thead>
                <tbody>
                  {vacunas.map((v:any,i:number) => (
                    <tr key={v.id} style={{ borderBottom:`1px solid ${T.borderLight}`, background:i%2===0?T.surface:T.surfaceAlt }}>
                      <td style={{ padding:'12px 16px', fontSize:13, fontWeight:600, color:T.textPrimary }}>{v.nombre_vacuna}</td>
                      <td style={{ padding:'12px 16px', fontSize:13, color:T.textSecondary }}>{fmtFecha(v.fecha_administracion)}</td>
                      <td style={{ padding:'12px 16px', fontSize:13, color:T.textSecondary, maxWidth:200 }}>
                        <span style={{ display:'-webkit-box', WebkitLineClamp:2 as any, WebkitBoxOrient:'vertical' as any, overflow:'hidden' }}>{v.observaciones||'—'}</span>
                      </td>
                      <td style={{ padding:'12px 16px' }}>
                        {v.nombre_archivo ? (
                          <div style={{ display:'flex', gap:4 }}>
                            <button onClick={() => verCertificado(v)} style={{ display:'flex', alignItems:'center', gap:5, padding:'5px 10px', background:T.primaryLight, color:T.primary, border:'none', borderRadius:T.radiusSm, cursor:'pointer', fontSize:12, fontWeight:600 }}>
                              <Eye size={13}/> Ver
                            </button>
                            <button onClick={() => descargar(v)} style={{ display:'flex', alignItems:'center', gap:5, padding:'5px 10px', background:T.surfaceAlt, color:T.textSecondary, border:`1px solid ${T.border}`, borderRadius:T.radiusSm, cursor:'pointer', fontSize:12 }}>
                              <Download size={13}/>
                            </button>
                          </div>
                        ) : (
                          <span style={{ fontSize:12, color:T.textMuted, fontStyle:'italic' }}>Sin certificado</span>
                        )}
                      </td>
                      <td style={{ padding:'12px 16px' }}>
                        <div style={{ display:'flex', gap:4 }}>
                          <button onClick={() => abrirEditar(v)} style={{ padding:7, borderRadius:T.radiusSm, border:'none', background:T.primaryLight, color:T.primary, cursor:'pointer' }}><Edit2 size={13}/></button>
                          <button onClick={() => eliminar(v)}    style={{ padding:7, borderRadius:T.radiusSm, border:'none', background:T.dangerBg,    color:T.danger,  cursor:'pointer' }}><Trash2 size={13}/></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB HISTORIAS */}
      {tab==='historias' && (
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <p style={{ margin:0, fontSize:13, color:T.textSecondary }}>{historias.length} historia(s) clínica(s)</p>
            <button onClick={() => navigate('/historia')} style={{ display:'flex', alignItems:'center', gap:7, padding:'8px 16px', background:T.primary, color:'#fff', border:'none', borderRadius:T.radiusSm, cursor:'pointer', fontSize:13, fontWeight:600 }}>
              <Plus size={14}/> Nueva historia
            </button>
          </div>
          {historias.length===0 ? (
            <div style={{ textAlign:'center', padding:'40px 0', background:T.surface, borderRadius:T.radius, border:`1px dashed ${T.border}` }}>
              <FileText size={32} style={{ color:T.textMuted, margin:'0 auto 12px', display:'block', opacity:0.4 }}/>
              <p style={{ margin:0, fontSize:14, color:T.textMuted }}>No hay historias clínicas registradas</p>
            </div>
          ) : (
            <div style={{ background:T.surface, borderRadius:T.radius, border:`1px solid ${T.border}`, overflow:'hidden' }}>
              <table style={{ width:'100%', borderCollapse:'collapse' }}>
                <thead><tr style={{ background:T.surfaceAlt }}>
                  {['Fecha apertura','Tipo','Estado','Ver'].map(h => (
                    <th key={h} style={{ padding:'11px 16px', textAlign:'left', fontSize:12, fontWeight:600, color:T.textSecondary, borderBottom:`1px solid ${T.border}` }}>{h}</th>
                  ))}
                </tr></thead>
                <tbody>
                  {historias.map((h:any,i:number) => (
                    <tr key={h.id} style={{ borderBottom:`1px solid ${T.borderLight}`, background:i%2===0?T.surface:T.surfaceAlt }}>
                      <td style={{ padding:'12px 16px', fontSize:13, color:T.textPrimary }}>{fmtFecha(h.fecha_apertura)}</td>
                      <td style={{ padding:'12px 16px' }}><span style={{ fontSize:11, padding:'3px 9px', borderRadius:20, background:T.primaryLight, color:T.primary, fontWeight:600 }}>{h.tipo_cita||'Control'}</span></td>
                      <td style={{ padding:'12px 16px' }}><span style={{ fontSize:11, padding:'3px 9px', borderRadius:20, background:T.successBg, color:T.success, fontWeight:600 }}>{h.estado||'Abierta'}</span></td>
                      <td style={{ padding:'12px 16px' }}>
                        <button onClick={() => navigate(`/historia/${h.id}`)} style={{ display:'flex', alignItems:'center', gap:6, padding:'5px 10px', background:T.primaryLight, color:T.primary, border:'none', borderRadius:T.radiusSm, cursor:'pointer', fontSize:12, fontWeight:600 }}>
                          <ExternalLink size={13}/> Ver
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* MODAL VACUNA */}
      {modal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.45)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:200, padding:16 }}>
          <div style={{ background:T.surface, borderRadius:T.radius, width:'100%', maxWidth:460, boxShadow:'0 20px 60px rgba(0,0,0,0.2)', overflow:'hidden' }}>
            <div style={{ padding:'16px 20px', borderBottom:`1px solid ${T.borderLight}`, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <h3 style={{ margin:0, fontSize:15, fontWeight:700, color:T.textPrimary }}>{editV?'Editar vacuna':'Registrar vacuna'}</h3>
              <button onClick={() => setModal(false)} style={{ background:'none', border:'none', cursor:'pointer', color:T.textMuted }}><X size={18}/></button>
            </div>
            <div style={{ padding:'18px 20px', display:'flex', flexDirection:'column', gap:14 }}>
              <div>
                <label style={{ fontSize:12, fontWeight:600, color:T.textSecondary, display:'block', marginBottom:6 }}>Nombre de la vacuna *</label>
                {form.nombre_vacuna === '__otra__' || (form.nombre_vacuna && !VACUNAS_DEPORTISTAS.includes(form.nombre_vacuna)) ? (
                  <div style={{ display:'flex', gap:8 }}>
                    <input type="text"
                      value={form.nombre_vacuna === '__otra__' ? '' : form.nombre_vacuna}
                      onChange={e => setForm(f => ({...f, nombre_vacuna: e.target.value}))}
                      placeholder="Escribe el nombre de la vacuna..."
                      autoFocus
                      style={{ flex:1, padding:'9px 11px', border:`1px solid ${T.border}`, borderRadius:T.radiusSm, fontSize:13, boxSizing:'border-box', outline:'none' }}/>
                    <button onClick={() => setForm(f => ({...f, nombre_vacuna:''}))}
                      style={{ padding:'9px 12px', background:T.surfaceAlt, border:`1px solid ${T.border}`, borderRadius:T.radiusSm, cursor:'pointer', fontSize:12, color:T.textSecondary, whiteSpace:'nowrap' }}>
                      ← Lista
                    </button>
                  </div>
                ) : (
                  <select value={form.nombre_vacuna} onChange={e => setForm(f => ({...f, nombre_vacuna: e.target.value}))}
                    style={{ width:'100%', padding:'9px 11px', border:`1px solid ${T.border}`, borderRadius:T.radiusSm, fontSize:13, background:T.surface, outline:'none', cursor:'pointer' }}>
                    <option value="">Seleccionar vacuna...</option>
                    {VACUNAS_DEPORTISTAS.map(v => <option key={v} value={v}>{v}</option>)}
                    <option value="__otra__">Otra (escribir)</option>
                  </select>
                )}
              </div>
              <div>
                <label style={{ fontSize:12, fontWeight:600, color:T.textSecondary, display:'block', marginBottom:6 }}>Fecha de administración</label>
                <input type="date" value={form.fecha_administracion} onChange={e => setForm(f => ({...f, fecha_administracion:e.target.value}))}
                  style={{ width:'100%', padding:'9px 11px', border:`1px solid ${T.border}`, borderRadius:T.radiusSm, fontSize:13, boxSizing:'border-box', outline:'none' }}/>
              </div>
              <div>
                <label style={{ fontSize:12, fontWeight:600, color:T.textSecondary, display:'block', marginBottom:6 }}>Observaciones</label>
                <textarea value={form.observaciones} onChange={e => setForm(f => ({...f, observaciones:e.target.value}))}
                  placeholder="Dosis, lote, institución, reacciones..." rows={3}
                  style={{ width:'100%', padding:'9px 11px', border:`1px solid ${T.border}`, borderRadius:T.radiusSm, fontSize:13, boxSizing:'border-box', outline:'none', resize:'vertical', fontFamily:'inherit' }}/>
              </div>
              <div>
                <label style={{ fontSize:12, fontWeight:600, color:T.textSecondary, display:'block', marginBottom:6 }}>
                  Certificado {editV?'(vacío = mantener actual)':''}
                </label>
                <input ref={fileRef} type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={e => setForm(f => ({...f, archivo:e.target.files?.[0]||null}))} style={{ display:'none' }}/>
                <button onClick={() => fileRef.current?.click()}
                  style={{ display:'flex', alignItems:'center', gap:8, padding:'9px 14px', border:`1px dashed ${T.border}`, borderRadius:T.radiusSm, background:T.surfaceAlt, cursor:'pointer', fontSize:13, color:T.textSecondary, width:'100%' }}>
                  <Upload size={15} style={{ color:T.primary }}/>
                  {form.archivo ? form.archivo.name : 'Seleccionar archivo (PDF, JPG, PNG)'}
                </button>
              </div>
            </div>
            <div style={{ padding:'14px 20px', borderTop:`1px solid ${T.borderLight}`, display:'flex', justifyContent:'flex-end', gap:10 }}>
              <button onClick={() => setModal(false)} style={{ padding:'8px 16px', background:T.surfaceAlt, border:`1px solid ${T.border}`, borderRadius:T.radiusSm, fontSize:13, cursor:'pointer' }}>Cancelar</button>
              <button onClick={guardar} disabled={saving} style={{ display:'flex', alignItems:'center', gap:6, padding:'8px 18px', background:T.primary, color:'#fff', border:'none', borderRadius:T.radiusSm, fontSize:13, fontWeight:600, cursor:saving?'not-allowed':'pointer' }}>
                {saving && <Loader2 size={14} style={{ animation:'spin 0.8s linear infinite' }}/>}
                {saving?'Guardando...':'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* MODAL VISTA PREVIA CERTIFICADO */}
      {preview && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:300, padding:16 }}
          onClick={() => { URL.revokeObjectURL(preview.url); setPreview(null); }}>
          <div style={{ background:T.surface, borderRadius:T.radius, width:'100%', maxWidth:700, maxHeight:'90vh', overflow:'hidden', display:'flex', flexDirection:'column', boxShadow:'0 24px 64px rgba(0,0,0,0.3)' }}
            onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div style={{ padding:'14px 20px', borderBottom:`1px solid ${T.borderLight}`, display:'flex', justifyContent:'space-between', alignItems:'center', flexShrink:0 }}>
              <div>
                <p style={{ margin:0, fontSize:14, fontWeight:600, color:T.textPrimary }}>{preview.nombre}</p>
                <p style={{ margin:'2px 0 0', fontSize:11, color:T.textMuted }}>{preview.tipo}</p>
              </div>
              <div style={{ display:'flex', gap:8 }}>
                <a href={preview.url} download={preview.nombre}
                  style={{ display:'flex', alignItems:'center', gap:6, padding:'6px 12px', background:T.primaryLight, color:T.primary, borderRadius:T.radiusSm, textDecoration:'none', fontSize:12, fontWeight:600 }}>
                  <Download size={13}/> Descargar
                </a>
                <button onClick={() => { URL.revokeObjectURL(preview.url); setPreview(null); }}
                  style={{ padding:6, background:'none', border:'none', cursor:'pointer', color:T.textMuted }}>
                  <X size={18}/>
                </button>
              </div>
            </div>
            {/* Contenido */}
            <div style={{ flex:1, overflow:'auto', display:'flex', alignItems:'center', justifyContent:'center', padding:16, background:'#f1f5f9', minHeight:300 }}>
              {preview.tipo.includes('image') ? (
                <img src={preview.url} alt={preview.nombre}
                  style={{ maxWidth:'100%', maxHeight:'70vh', borderRadius:T.radiusSm, boxShadow:'0 2px 12px rgba(0,0,0,0.15)' }}/>
              ) : preview.tipo.includes('pdf') ? (
                <iframe src={preview.url} style={{ width:'100%', height:'70vh', border:'none', borderRadius:T.radiusSm }}/>
              ) : (
                <div style={{ textAlign:'center', color:T.textMuted }}>
                  <p style={{ fontSize:14 }}>No se puede previsualizar este tipo de archivo</p>
                  <a href={preview.url} download={preview.nombre} style={{ color:T.primary, fontSize:13 }}>Descargar</a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DetalleDeportista;