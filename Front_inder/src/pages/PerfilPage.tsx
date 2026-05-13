import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import { api } from '@/app/services/apiClient';
import { toast } from 'sonner';
import { User, PenLine, Upload, Trash2, Check, X, Camera } from 'lucide-react';

const T = {
  primary:'#1F4788', primaryLight:'#EEF3FB',
  surface:'#ffffff', surfaceAlt:'#f8fafc',
  border:'#e2e8f0', borderLight:'#f1f5f9',
  textPrimary:'#0f172a', textSecondary:'#475569', textMuted:'#94a3b8',
  danger:'#ef4444', dangerBg:'#fee2e2',
  radius:'12px', radiusSm:'8px',
};

const inputStyle: React.CSSProperties = {
  width:'100%', padding:'9px 11px', border:`1px solid ${T.border}`,
  borderRadius:T.radiusSm, fontSize:13, outline:'none',
  boxSizing:'border-box', background:T.surface,
};

export function PerfilPage() {
  const { usuario } = useAuth();
  const [perfil, setPerfil] = useState<any>(null);
  const [editando, setEditando] = useState(false);
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [saving, setSaving] = useState(false);
  const [firmaPreview, setFirmaPreview] = useState<string | null>(null);
  const [savingFirma, setSavingFirma] = useState(false);
  const [dibujando, setDibujando] = useState(false);
  const [modoFirma, setModoFirma] = useState<'subir' | 'dibujar'>('subir');
  const [isDrawing, setIsDrawing] = useState(false);
  const firmaRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => { cargarPerfil(); }, []);

  const cargarPerfil = async () => {
    try {
      const { data } = await api.get('/perfil/me');
      setPerfil(data);
      setNombre(data.nombre_completo);
      setEmail(data.email || '');
      if (data.firma_imagen) setFirmaPreview(data.firma_imagen);
    } catch { toast.error('Error al cargar perfil'); }
  };

  const guardarPerfil = async () => {
    setSaving(true);
    try {
      await api.put('/perfil/me', { nombre_completo: nombre, email });
      toast.success('Perfil actualizado');
      setEditando(false);
      cargarPerfil();
    } catch { toast.error('Error al guardar'); }
    finally { setSaving(false); }
  };

  const handleFirmaArchivo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { toast.error('Solo imágenes'); return; }
    if (file.size > 500_000) { toast.error('Máx 500KB'); return; }
    const reader = new FileReader();
    reader.onload = () => setFirmaPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const guardarFirma = async (firmaBase64?: string) => {
    const firma = firmaBase64 || firmaPreview;
    if (!firma) return;
    setSavingFirma(true);
    try {
      await api.put('/perfil/me/firma', { firma_imagen: firma });
      toast.success('Firma guardada');
      setFirmaPreview(firma);
      setDibujando(false);
    } catch { toast.error('Error al guardar firma'); }
    finally { setSavingFirma(false); }
  };

  const eliminarFirma = async () => {
    try {
      await api.delete('/perfil/me/firma');
      setFirmaPreview(null);
      toast.success('Firma eliminada');
    } catch { toast.error('Error'); }
  };

  const startDraw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    const rect = canvas.getBoundingClientRect();
    ctx.strokeStyle = T.primary; ctx.lineWidth = 2; ctx.lineCap = 'round';
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
  };

  const limpiarCanvas = () => {
    const c = canvasRef.current; if (!c) return;
    c.getContext('2d')!.clearRect(0, 0, c.width, c.height);
  };

  const guardarDesdeCanvas = () => {
    const c = canvasRef.current; if (!c) return;
    guardarFirma(c.toDataURL('image/png'));
  };

  if (!perfil) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'60vh' }}>
      <p style={{ color:T.textMuted }}>Cargando...</p>
    </div>
  );

  return (
    <div style={{ maxWidth:680, margin:'0 auto', padding:'24px', display:'flex', flexDirection:'column', gap:20 }}>
      <div>
        <h1 style={{ margin:0, fontSize:22, fontWeight:700, color:T.primary }}>Mi Perfil</h1>
        <p style={{ margin:'4px 0 0', fontSize:13, color:T.textMuted }}>Gestiona tu información personal y firma digital</p>
      </div>

      {/* Datos personales */}
      <div style={{ border:`1px solid ${T.border}`, borderRadius:T.radius, overflow:'hidden' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'14px 20px', background:T.surfaceAlt, borderBottom:`1px solid ${T.borderLight}` }}>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <User size={15} style={{ color:T.primary }}/>
            <h3 style={{ margin:0, fontSize:14, fontWeight:700, color:T.textPrimary }}>Información Personal</h3>
          </div>
          {!editando ? (
            <button onClick={() => setEditando(true)} style={{ display:'flex', alignItems:'center', gap:6, padding:'6px 12px', background:T.primaryLight, border:'none', borderRadius:T.radiusSm, cursor:'pointer', fontSize:12, fontWeight:600, color:T.primary }}>
              <PenLine size={12}/> Editar
            </button>
          ) : (
            <div style={{ display:'flex', gap:8 }}>
              <button onClick={guardarPerfil} disabled={saving} style={{ display:'flex', alignItems:'center', gap:5, padding:'6px 12px', background:T.primary, border:'none', borderRadius:T.radiusSm, cursor:'pointer', fontSize:12, fontWeight:600, color:'#fff' }}>
                <Check size={12}/> {saving ? 'Guardando...' : 'Guardar'}
              </button>
              <button onClick={() => setEditando(false)} style={{ padding:'6px 10px', background:T.surfaceAlt, border:`1px solid ${T.border}`, borderRadius:T.radiusSm, cursor:'pointer' }}>
                <X size={12}/>
              </button>
            </div>
          )}
        </div>
        <div style={{ padding:'20px', display:'flex', flexDirection:'column', gap:14 }}>
          <div style={{ display:'flex', alignItems:'center', gap:16 }}>
            <div style={{ width:52, height:52, borderRadius:'50%', background:T.primary, display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontSize:20, fontWeight:700, flexShrink:0 }}>
              {perfil.nombre_completo?.charAt(0).toUpperCase()}
            </div>
            <div>
              <p style={{ margin:0, fontSize:15, fontWeight:700, color:T.textPrimary }}>{perfil.nombre_completo}</p>
              <p style={{ margin:'2px 0 0', fontSize:12, color:T.textMuted }}>@{perfil.username} · {perfil.rol}</p>
            </div>
          </div>
          {[
            { label:'Nombre completo', key:'nombre', value:nombre, setter:setNombre },
            { label:'Correo electrónico', key:'email', value:email, setter:setEmail, placeholder:'correo@ejemplo.com' },
          ].map(({ label, key, value, setter, placeholder }) => (
            <div key={key}>
              <label style={{ display:'block', marginBottom:5, fontSize:12, fontWeight:600, color:T.textSecondary }}>{label}</label>
              {editando ? (
                <input value={value} onChange={e => setter(e.target.value)} placeholder={placeholder} style={inputStyle}/>
              ) : (
                <p style={{ margin:0, fontSize:13, color: value ? T.textPrimary : T.textMuted, padding:'9px 11px', background:T.surfaceAlt, borderRadius:T.radiusSm }}>
                  {value || 'No registrado'}
                </p>
              )}
            </div>
          ))}
          <div>
            <label style={{ display:'block', marginBottom:5, fontSize:12, fontWeight:600, color:T.textSecondary }}>Usuario</label>
            <p style={{ margin:0, fontSize:13, color:T.textMuted, padding:'9px 11px', background:T.surfaceAlt, borderRadius:T.radiusSm, fontFamily:'monospace' }}>{perfil.username}</p>
          </div>
        </div>
      </div>

      {/* Firma digital */}
      <div style={{ border:`1px solid ${T.border}`, borderRadius:T.radius, overflow:'hidden' }}>
        <div style={{ padding:'14px 20px', background:T.surfaceAlt, borderBottom:`1px solid ${T.borderLight}` }}>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <PenLine size={15} style={{ color:T.primary }}/>
            <div>
              <h3 style={{ margin:0, fontSize:14, fontWeight:700, color:T.textPrimary }}>Firma Digital</h3>
              <p style={{ margin:'2px 0 0', fontSize:11, color:T.textMuted }}>Aparecerá automáticamente en todos los documentos PDF que generes</p>
            </div>
          </div>
        </div>
        <div style={{ padding:'20px' }}>
          {/* Vista previa firma */}
          {firmaPreview && !dibujando && (
            <div style={{ marginBottom:16, padding:16, background:T.surfaceAlt, borderRadius:T.radiusSm, border:`1px solid ${T.border}`, textAlign:'center' }}>
              <p style={{ margin:'0 0 10px', fontSize:11, fontWeight:600, color:T.textSecondary, textTransform:'uppercase' }}>Firma actual</p>
              <img src={firmaPreview} alt="Firma" style={{ maxHeight:80, maxWidth:'100%', objectFit:'contain' }}/>
            </div>
          )}

          {!dibujando && (
            <>
              <div style={{ display:'flex', gap:8, marginBottom:16 }}>
                {(['subir','dibujar'] as const).map(modo => (
                  <button key={modo} onClick={() => { setModoFirma(modo); if (modo === 'dibujar') setDibujando(true); }}
                    style={{ flex:1, padding:'9px', background: modoFirma===modo ? T.primary : T.surfaceAlt, color: modoFirma===modo ? '#fff' : T.textSecondary, border:`1px solid ${modoFirma===modo ? T.primary : T.border}`, borderRadius:T.radiusSm, cursor:'pointer', fontSize:12, fontWeight:600 }}>
                    {modo === 'subir' ? <><Upload size={12} style={{marginRight:5}}/> Subir imagen</> : <><Camera size={12} style={{marginRight:5}}/> Dibujar firma</>}
                  </button>
                ))}
              </div>
              {modoFirma === 'subir' && (
                <>
                  <div onClick={() => firmaRef.current?.click()}
                    style={{ padding:'24px', border:`2px dashed ${T.border}`, borderRadius:T.radiusSm, textAlign:'center', cursor:'pointer', background:T.surfaceAlt }}>
                    <Upload size={20} style={{ color:T.textMuted, margin:'0 auto 8px', display:'block' }}/>
                    <p style={{ margin:0, fontSize:13, color:T.primary, fontWeight:600 }}>Seleccionar imagen de firma</p>
                    <p style={{ margin:'4px 0 0', fontSize:11, color:T.textMuted }}>PNG o JPG con fondo blanco o transparente · Máx 500KB</p>
                  </div>
                  <input ref={firmaRef} type="file" accept="image/*" onChange={handleFirmaArchivo} style={{ display:'none' }}/>
                  {firmaPreview && (
                    <div style={{ display:'flex', gap:8, marginTop:12 }}>
                      <button onClick={() => guardarFirma()} disabled={savingFirma}
                        style={{ flex:1, padding:'10px', background:T.primary, color:'#fff', border:'none', borderRadius:T.radiusSm, cursor:'pointer', fontSize:13, fontWeight:600 }}>
                        {savingFirma ? 'Guardando...' : 'Guardar firma'}
                      </button>
                      <button onClick={eliminarFirma} style={{ padding:'10px 14px', background:T.dangerBg, border:'none', borderRadius:T.radiusSm, cursor:'pointer', color:T.danger }}>
                        <Trash2 size={14}/>
                      </button>
                    </div>
                  )}
                </>
              )}
            </>
          )}

          {/* Canvas */}
          {dibujando && (
            <div>
              <p style={{ margin:'0 0 10px', fontSize:12, color:T.textSecondary }}>Dibuja tu firma con el mouse:</p>
              <canvas ref={canvasRef} width={600} height={150}
                onMouseDown={startDraw} onMouseMove={draw} onMouseUp={() => setIsDrawing(false)} onMouseLeave={() => setIsDrawing(false)}
                style={{ border:`1px solid ${T.border}`, borderRadius:T.radiusSm, cursor:'crosshair', width:'100%', background:'#fff' }}/>
              <div style={{ display:'flex', gap:8, marginTop:12 }}>
                <button onClick={guardarDesdeCanvas} disabled={savingFirma}
                  style={{ flex:1, padding:'10px', background:T.primary, color:'#fff', border:'none', borderRadius:T.radiusSm, cursor:'pointer', fontSize:13, fontWeight:600 }}>
                  {savingFirma ? 'Guardando...' : 'Guardar firma'}
                </button>
                <button onClick={limpiarCanvas} style={{ padding:'10px 14px', background:T.surfaceAlt, border:`1px solid ${T.border}`, borderRadius:T.radiusSm, cursor:'pointer', fontSize:12, color:T.textSecondary }}>
                  Limpiar
                </button>
                <button onClick={() => setDibujando(false)} style={{ padding:'10px 14px', background:T.dangerBg, border:'none', borderRadius:T.radiusSm, cursor:'pointer', color:T.danger }}>
                  <X size={14}/>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PerfilPage;