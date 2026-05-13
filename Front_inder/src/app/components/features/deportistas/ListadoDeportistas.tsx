// ============================================================
// LISTADO DEPORTISTAS
// Vistas: listado | registro | edición | detalle
// ============================================================
import { useState, useEffect } from 'react';
import { deportistasService, Deportista } from '@/app/services/apiClient';
import { useAuth } from '@/app/contexts/AuthContext';
import { toast } from 'sonner';
import { Plus, Edit2, Trash2, Eye, Search, ArrowLeft, Loader2 } from 'lucide-react';
import { RegistroDeportista } from './RegistroDeportista';
import { DetalleDeportista } from './DetalleDeportista';

const T = {
  primary:'#1F4788', primaryLight:'#EEF3FB',
  surface:'#ffffff', surfaceAlt:'#f8fafc',
  border:'#e2e8f0', borderLight:'#f1f5f9',
  textPrimary:'#0f172a', textSecondary:'#475569', textMuted:'#94a3b8',
  success:'#10b981', successBg:'#d1fae5', successText:'#065f46',
  danger:'#ef4444', dangerBg:'#fee2e2',
  radius:'12px', radiusSm:'8px',
};

import logoNatacion    from '@/assets/logo_natacion.svg';
import logoPesas       from '@/assets/logo_pesas.svg';
import logoLucha       from '@/assets/logo_lucha.svg';
import logoSubacuatico from '@/assets/logo_subacuatico.svg';

const DISCIPLINAS = [
  { nombre: 'Natación',    logo: logoNatacion    },
  { nombre: 'Pesas',       logo: logoPesas       },
  { nombre: 'Lucha',       logo: logoLucha       },
  { nombre: 'Subacuático', logo: logoSubacuatico },
];

const getLogo = (deporte?: string) => {
  if (!deporte) return null;
  const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  return DISCIPLINAS.find(d => norm(d.nombre) === norm(deporte))?.logo ?? null;
};

interface ListadoDeportistasProps { onNavigate?: (view: string) => void; }
type Vista = 'listado' | 'registro' | 'edicion' | 'detalle';

export function ListadoDeportistas({ onNavigate }: ListadoDeportistasProps) {
  const { puedeHacer } = useAuth();

  const [deportistas,  setDeportistas]  = useState<Deportista[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [searchQuery,  setSearchQuery]  = useState('');
  const [vista,        setVista]        = useState<Vista>('listado');
  const [seleccionado, setSeleccionado] = useState<Deportista | null>(null);
  const [form,         setForm]         = useState<any>({});
  const [saving,       setSaving]       = useState(false);
  const [confirmandoEliminar, setConfirmandoEliminar] = useState<{id:string;nombre:string}|null>(null);

  useEffect(() => { cargar(); }, []);

  const cargar = async () => {
    try {
      setLoading(true);
      const res = await deportistasService.getAll(1, 10000);
      setDeportistas(Array.isArray(res) ? res : (res as any)?.items ?? []);
    } catch { toast.error('Error cargando deportistas'); }
    finally { setLoading(false); }
  };

  const abrirEdicion = (dep: Deportista) => {
    setSeleccionado(dep);
    setForm({
      nombres:          dep.nombres,
      apellidos:        dep.apellidos,
      numero_documento: dep.numero_documento,
      fecha_nacimiento: dep.fecha_nacimiento || '',
      telefono:         dep.telefono || '',
      email:            dep.email || '',
      direccion:        dep.direccion || '',
      tipo_deporte:     dep.tipo_deporte || '',
    });
    setVista('edicion');
  };

  const guardarEdicion = async () => {
    if (!seleccionado) return;
    if (!form.nombres?.trim() || !form.apellidos?.trim()) {
      toast.error('Nombre y apellido son requeridos'); return;
    }
    try {
      setSaving(true);
      await deportistasService.update(seleccionado.id, {
        nombres:          form.nombres,
        apellidos:        form.apellidos,
        numero_documento: form.numero_documento,
        fecha_nacimiento: form.fecha_nacimiento || undefined,
        telefono:         form.telefono || undefined,
        email:            form.email || undefined,
        direccion:        form.direccion || undefined,
        tipo_deporte:     form.tipo_deporte || undefined,
      });
      toast.success('Deportista actualizado');
      setVista('listado');
      cargar();
    } catch (e:any) { toast.error(e?.response?.data?.detail ?? 'Error al guardar'); }
    finally { setSaving(false); }
  };

  const eliminar = async (id: string) => {
    try {
      await deportistasService.remove(id);
      setConfirmandoEliminar(null);
      toast.success('Deportista eliminado');
      cargar();
    } catch { toast.error('Error al eliminar'); }
  };

  const filtrados = deportistas.filter(d => {
    const q = searchQuery.toLowerCase();
    return d.nombres.toLowerCase().includes(q) ||
      d.apellidos.toLowerCase().includes(q) ||
      d.numero_documento.includes(q) ||
      d.email?.toLowerCase().includes(q) ||
      d.telefono?.includes(q);
  });

  // ── VISTAS SECUNDARIAS ────────────────────────────────────────

  if (vista === 'registro') return (
    <div>
      <button onClick={() => { setVista('listado'); cargar(); }}
        style={{ display:'flex', alignItems:'center', gap:8, marginBottom:20, padding:'8px 16px', background:T.surfaceAlt, border:`1px solid ${T.border}`, borderRadius:T.radiusSm, cursor:'pointer', fontSize:13, color:T.textSecondary }}>
        <ArrowLeft size={15}/> Volver al listado
      </button>
      <RegistroDeportista onCancel={() => { setVista('listado'); cargar(); }} />
    </div>
  );

  if (vista === 'detalle' && seleccionado) return (
    <DetalleDeportista deportistaId={seleccionado.id} onBack={() => setVista('listado')} />
  );

  if (vista === 'edicion' && seleccionado) return (
    <div style={{ display:'flex', flexDirection:'column', gap:20, maxWidth:700, margin:'0 auto' }}>
      <button onClick={() => setVista('listado')}
        style={{ display:'inline-flex', alignItems:'center', gap:8, background:'none', border:'none', cursor:'pointer', color:T.primary, fontSize:13, fontWeight:600, padding:0, width:'fit-content' }}>
        <ArrowLeft size={16}/> Volver al listado
      </button>

      <div style={{ background:T.surface, borderRadius:T.radius, border:`1px solid ${T.border}`, overflow:'hidden' }}>
        <div style={{ background:`linear-gradient(135deg,${T.primary} 0%,#3b82f6 100%)`, padding:'16px 24px', display:'flex', alignItems:'center', gap:14 }}>
          <div style={{ width:44, height:44, borderRadius:'50%', background:'rgba(255,255,255,0.2)', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontSize:18, fontWeight:800 }}>
            {seleccionado.nombres?.charAt(0)}{seleccionado.apellidos?.charAt(0)}
          </div>
          <div>
            <h2 style={{ margin:0, fontSize:16, fontWeight:700, color:'#fff' }}>Editar deportista</h2>
            <p style={{ margin:'2px 0 0', fontSize:12, color:'rgba(255,255,255,0.75)' }}>
              {seleccionado.nombres} {seleccionado.apellidos} · {seleccionado.numero_documento}
            </p>
          </div>
        </div>

        <div style={{ padding:'24px' }}>
          <p style={{ margin:'0 0 16px', fontSize:11, fontWeight:700, color:T.primary, textTransform:'uppercase', letterSpacing:'0.06em' }}>Datos personales</p>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:20 }}>
            {([
              { label:'Nombres *',        key:'nombres',          type:'text' },
              { label:'Apellidos *',       key:'apellidos',        type:'text' },
              { label:'Número documento',  key:'numero_documento', type:'text' },
              { label:'Fecha nacimiento',  key:'fecha_nacimiento', type:'date' },
            ] as any[]).map(({ label, key, type }) => (
              <div key={key}>
                <label style={{ fontSize:12, fontWeight:600, color:T.textSecondary, display:'block', marginBottom:5 }}>{label}</label>
                <input type={type} value={form[key] || ''} onChange={e => setForm((f:any) => ({ ...f, [key]: e.target.value }))}
                  style={{ width:'100%', padding:'9px 11px', border:`1px solid ${T.border}`, borderRadius:T.radiusSm, fontSize:13, boxSizing:'border-box', outline:'none' }}
                  onFocus={e => e.currentTarget.style.borderColor = T.primary}
                  onBlur={e => e.currentTarget.style.borderColor = T.border}
                />
              </div>
            ))}
          </div>

          <p style={{ margin:'0 0 16px', fontSize:11, fontWeight:700, color:T.primary, textTransform:'uppercase', letterSpacing:'0.06em', borderTop:`1px solid ${T.borderLight}`, paddingTop:20 }}>Contacto</p>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:20 }}>
            {([
              { label:'Teléfono', key:'telefono', type:'tel'   },
              { label:'Email',    key:'email',    type:'email' },
            ] as any[]).map(({ label, key, type }) => (
              <div key={key}>
                <label style={{ fontSize:12, fontWeight:600, color:T.textSecondary, display:'block', marginBottom:5 }}>{label}</label>
                <input type={type} value={form[key] || ''} onChange={e => setForm((f:any) => ({ ...f, [key]: e.target.value }))}
                  style={{ width:'100%', padding:'9px 11px', border:`1px solid ${T.border}`, borderRadius:T.radiusSm, fontSize:13, boxSizing:'border-box', outline:'none' }}
                  onFocus={e => e.currentTarget.style.borderColor = T.primary}
                  onBlur={e => e.currentTarget.style.borderColor = T.border}
                />
              </div>
            ))}
            <div style={{ gridColumn:'1/-1' }}>
              <label style={{ fontSize:12, fontWeight:600, color:T.textSecondary, display:'block', marginBottom:5 }}>Dirección</label>
              <input type="text" value={form.direccion || ''} onChange={e => setForm((f:any) => ({ ...f, direccion: e.target.value }))}
                style={{ width:'100%', padding:'9px 11px', border:`1px solid ${T.border}`, borderRadius:T.radiusSm, fontSize:13, boxSizing:'border-box', outline:'none' }}
                onFocus={e => e.currentTarget.style.borderColor = T.primary}
                onBlur={e => e.currentTarget.style.borderColor = T.border}
              />
            </div>
          </div>

          <p style={{ margin:'0 0 16px', fontSize:11, fontWeight:700, color:T.primary, textTransform:'uppercase', letterSpacing:'0.06em', borderTop:`1px solid ${T.borderLight}`, paddingTop:20 }}>Información deportiva</p>
          <div>
            <label style={{ fontSize:12, fontWeight:600, color:T.textSecondary, display:'block', marginBottom:5 }}>Disciplina / Deporte</label>
            <select value={form.tipo_deporte || ''} onChange={e => setForm((f:any) => ({ ...f, tipo_deporte: e.target.value }))}
              style={{ width:'100%', padding:'9px 11px', border:`1px solid ${T.border}`, borderRadius:T.radiusSm, fontSize:13, background:T.surface, outline:'none', cursor:'pointer' }}
              onFocus={e => e.currentTarget.style.borderColor = T.primary}
              onBlur={e => e.currentTarget.style.borderColor = T.border}
            >
              <option value="">Seleccionar disciplina...</option>
              {DISCIPLINAS.map(d => <option key={d.nombre} value={d.nombre}>{d.nombre}</option>)}
            </select>
          </div>
        </div>

        <div style={{ padding:'16px 24px', borderTop:`1px solid ${T.borderLight}`, display:'flex', justifyContent:'flex-end', gap:10, background:T.surfaceAlt }}>
          <button onClick={() => setVista('listado')}
            style={{ padding:'9px 20px', background:T.surface, border:`1px solid ${T.border}`, borderRadius:T.radiusSm, fontSize:13, cursor:'pointer', color:T.textSecondary }}>
            Cancelar
          </button>
          <button onClick={guardarEdicion} disabled={saving}
            style={{ display:'flex', alignItems:'center', gap:7, padding:'9px 24px', background:T.primary, color:'#fff', border:'none', borderRadius:T.radiusSm, fontSize:13, fontWeight:600, cursor:saving?'not-allowed':'pointer' }}>
            {saving && <Loader2 size={14} style={{ animation:'spin 0.8s linear infinite' }}/>}
            {saving ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </div>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  // ── LISTADO PRINCIPAL ─────────────────────────────────────────
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>

      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <div>
          <h2 style={{ margin:0, fontSize:22, fontWeight:700, color:T.textPrimary }}>Deportistas</h2>
          <p style={{ margin:'4px 0 0', fontSize:13, color:T.textMuted }}>Gestiona el registro de todos los deportistas</p>
        </div>
        {puedeHacer('deportistas','crear') && (
          <button onClick={() => setVista('registro')}
            style={{ display:'flex', alignItems:'center', gap:8, padding:'9px 18px', background:T.primary, color:'#fff', border:'none', borderRadius:T.radiusSm, cursor:'pointer', fontSize:13, fontWeight:600 }}>
            <Plus size={16}/> Nuevo Deportista
          </button>
        )}
      </div>

      <div style={{ position:'relative' }}>
        <Search size={15} style={{ position:'absolute', left:13, top:'50%', transform:'translateY(-50%)', color:T.textMuted }}/>
        <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
          placeholder="Buscar por nombre, documento, email o teléfono..."
          style={{ width:'100%', padding:'10px 12px 10px 38px', border:`1px solid ${T.border}`, borderRadius:T.radiusSm, fontSize:13, outline:'none', boxSizing:'border-box', background:T.surface }}
          onFocus={e => e.currentTarget.style.borderColor = T.primary}
          onBlur={e => e.currentTarget.style.borderColor = T.border}
        />
      </div>

      {loading ? (
        <div style={{ display:'flex', justifyContent:'center', alignItems:'center', padding:48, gap:12 }}>
          <Loader2 size={24} style={{ color:T.primary, animation:'spin 0.8s linear infinite' }}/>
          <span style={{ fontSize:13, color:T.textMuted }}>Cargando deportistas...</span>
        </div>
      ) : filtrados.length === 0 ? (
        <div style={{ textAlign:'center', padding:'48px 0', background:T.surface, borderRadius:T.radius, border:`1px solid ${T.border}` }}>
          <p style={{ margin:0, fontSize:14, color:T.textMuted }}>
            {searchQuery ? 'No hay coincidencias' : 'No hay deportistas registrados'}
          </p>
        </div>
      ) : (
        <div style={{ background:T.surface, borderRadius:T.radius, border:`1px solid ${T.border}`, overflow:'hidden' }}>
          <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <thead>
              <tr style={{ background:T.primary }}>
                {['Documento','Nombre','Teléfono','Email','Disciplina','Acciones'].map(h => (
                  <th key={h} style={{ padding:'12px 16px', textAlign: h==='Acciones'?'center':'left', fontSize:12, fontWeight:600, color:'#fff' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtrados.map((dep, i) => {
                const logo = getLogo(dep.tipo_deporte);
                return (
                  <tr key={dep.id}
                    style={{ borderBottom:`1px solid ${T.borderLight}`, background: i%2===0 ? T.surface : T.surfaceAlt, transition:'background 0.1s' }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = T.primaryLight}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = i%2===0 ? T.surface : T.surfaceAlt}
                  >
                    <td style={{ padding:'13px 16px', fontSize:13, color:T.textSecondary }}>{dep.numero_documento}</td>
                    <td style={{ padding:'13px 16px' }}>
                      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                        <div style={{ width:34, height:34, borderRadius:'50%', background:T.primary, display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontSize:12, fontWeight:700, flexShrink:0 }}>
                          {dep.nombres.charAt(0)}{dep.apellidos.charAt(0)}
                        </div>
                        <div>
                          <p style={{ margin:0, fontSize:13, fontWeight:600, color:T.textPrimary }}>{dep.nombres} {dep.apellidos}</p>
                          <span style={{ fontSize:11, padding:'1px 7px', borderRadius:10, background:T.successBg, color:T.successText, fontWeight:600 }}>
                            {(dep as any).estado || 'Activo'}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding:'13px 16px', fontSize:13, color:T.textSecondary }}>{dep.telefono || '—'}</td>
                    <td style={{ padding:'13px 16px', fontSize:13, color:T.textSecondary }}>{dep.email || '—'}</td>
                    <td style={{ padding:'13px 16px' }}>
                      {logo ? (
                        <div style={{ display:'flex', alignItems:'center', gap:7 }}>
                          <img src={logo} alt={dep.tipo_deporte} style={{ width:28, height:28 }}/>
                          <span style={{ fontSize:13, color:T.textSecondary }}>{dep.tipo_deporte}</span>
                        </div>
                      ) : (
                        <span style={{ fontSize:13, color:T.textMuted }}>—</span>
                      )}
                    </td>
                    <td style={{ padding:'13px 16px' }}>
                      <div style={{ display:'flex', gap:4, justifyContent:'center' }}>
                        <button onClick={() => { setSeleccionado(dep); setVista('detalle'); }} title="Ver detalle"
                          style={{ padding:7, borderRadius:T.radiusSm, border:'none', background:T.primaryLight, color:T.primary, cursor:'pointer' }}>
                          <Eye size={14}/>
                        </button>
                        {puedeHacer('deportistas','editar') && (
                          <button onClick={() => abrirEdicion(dep)} title="Editar"
                            style={{ padding:7, borderRadius:T.radiusSm, border:'none', background:'#fef3c7', color:'#92400e', cursor:'pointer' }}>
                            <Edit2 size={14}/>
                          </button>
                        )}
                        {puedeHacer('deportistas','eliminar') && (
                          <button onClick={() => setConfirmandoEliminar({id:dep.id, nombre:`${dep.nombres} ${dep.apellidos}`})} title="Eliminar"
                            style={{ padding:7, borderRadius:T.radiusSm, border:'none', background:T.dangerBg, color:T.danger, cursor:'pointer' }}>
                            <Trash2 size={14}/>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div style={{ padding:'10px 16px', background:T.surfaceAlt, borderTop:`1px solid ${T.borderLight}` }}>
            <p style={{ margin:0, fontSize:12, color:T.textMuted }}>
              Mostrando {filtrados.length} de {deportistas.length} deportista(s)
            </p>
          </div>
        </div>
      )}

      {/* MODAL CONFIRMAR ELIMINAR */}
      {confirmandoEliminar && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.45)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:300 }}
          onClick={() => setConfirmandoEliminar(null)}>
          <div style={{ background:'#fff', borderRadius:12, padding:28, maxWidth:400, width:'100%', margin:16, boxShadow:'0 20px 60px rgba(0,0,0,0.2)' }}
            onClick={e => e.stopPropagation()}>
            <h3 style={{ margin:'0 0 8px', fontSize:16, fontWeight:700, color:'#0f172a' }}>¿Eliminar deportista?</h3>
            <p style={{ margin:'0 0 20px', fontSize:13, color:'#475569' }}>
              Se eliminará a <strong>{confirmandoEliminar.nombre}</strong>. Esta acción no se puede deshacer.
            </p>
            <div style={{ display:'flex', gap:10 }}>
              <button onClick={() => setConfirmandoEliminar(null)}
                style={{ flex:1, padding:'10px', background:'#f8fafc', border:'1px solid #e2e8f0', borderRadius:8, cursor:'pointer', fontSize:13, fontWeight:600, color:'#475569' }}>
                Cancelar
              </button>
              <button onClick={() => eliminar(confirmandoEliminar.id)}
                style={{ flex:1, padding:'10px', background:'#ef4444', border:'none', borderRadius:8, cursor:'pointer', fontSize:13, fontWeight:600, color:'#fff' }}>
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ListadoDeportistas;