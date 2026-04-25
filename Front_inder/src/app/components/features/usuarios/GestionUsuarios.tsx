// ============================================================
// GESTIÓN USUARIOS Y ROLES — solo admin
// ============================================================
import { useState, useEffect } from 'react';
import { api } from '@/app/services/apiClient';
import { useAuth } from '@/app/contexts/AuthContext';
import { Plus, Edit2, Trash2, UserCheck, UserX, Loader2, X, Shield, Users, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'sonner';

interface Permiso { id?: string; modulo: string; accion: string; }
interface Rol { id: string; nombre: string; descripcion?: string; activo: boolean; permisos: Permiso[]; }
interface Usuario {
  id: string; username: string; nombre_completo: string;
  email?: string; activo: boolean; rol: { id: string; nombre: string; };
}

const MODULOS = ['deportistas', 'historia', 'citas', 'archivos', 'reportes', 'usuarios', 'configuracion'];
const ACCIONES = ['ver', 'crear', 'editar', 'eliminar'];

export function GestionUsuarios() {
  const { usuario: yo } = useAuth();
  const [tab, setTab]           = useState<'usuarios' | 'roles'>('usuarios');
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [roles, setRoles]       = useState<Rol[]>([]);
  const [loading, setLoading]   = useState(true);

  // Modal usuario
  const [modalUsuario, setModalUsuario] = useState(false);
  const [editandoUsuario, setEditandoUsuario] = useState<Usuario | null>(null);
  const [formUsuario, setFormUsuario] = useState({ username: '', nombre_completo: '', email: '', password: '', rol_id: '' });

  // Modal rol
  const [modalRol, setModalRol] = useState(false);
  const [formRol, setFormRol]   = useState({ nombre: '', descripcion: '' });
  const [permisosRol, setPermisosRol] = useState<Record<string, string[]>>({});

  // Rol expandido
  const [rolExpandido, setRolExpandido] = useState<string | null>(null);

  const [saving, setSaving] = useState(false);

  useEffect(() => { cargar(); }, []);

  const cargar = async () => {
    try {
      setLoading(true);
      const [usrs, rls] = await Promise.all([
        api.get('/usuarios').then(r => r.data),
        api.get('/roles').then(r => r.data),
      ]);
      setUsuarios(usrs);
      setRoles(rls);
    } catch { toast.error('Error cargando datos'); }
    finally { setLoading(false); }
  };

  // ── Usuarios ────────────────────────────────────────────────
  const abrirCrearUsuario = () => {
    setEditandoUsuario(null);
    setFormUsuario({ username: '', nombre_completo: '', email: '', password: '', rol_id: roles[0]?.id ?? '' });
    setModalUsuario(true);
  };

  const abrirEditarUsuario = (u: Usuario) => {
    setEditandoUsuario(u);
    setFormUsuario({ username: u.username, nombre_completo: u.nombre_completo, email: u.email ?? '', password: '', rol_id: u.rol.id });
    setModalUsuario(true);
  };

  const guardarUsuario = async () => {
    if (!formUsuario.username || !formUsuario.nombre_completo || !formUsuario.rol_id) { toast.error('Completa los campos requeridos'); return; }
    if (!editandoUsuario && !formUsuario.password) { toast.error('La contraseña es requerida'); return; }
    try {
      setSaving(true);
      const body: any = { username: formUsuario.username, nombre_completo: formUsuario.nombre_completo, email: formUsuario.email || undefined, rol_id: formUsuario.rol_id };
      if (formUsuario.password) body.password = formUsuario.password;
      if (editandoUsuario) { await api.put(`/usuarios/${editandoUsuario.id}`, body); toast.success('Usuario actualizado'); }
      else { await api.post('/usuarios', body); toast.success('Usuario creado'); }
      setModalUsuario(false);
      cargar();
    } catch (err: any) { toast.error(err?.response?.data?.detail ?? 'Error al guardar'); }
    finally { setSaving(false); }
  };

  const toggleActivo = async (u: Usuario) => {
    try {
      await api.put(`/usuarios/${u.id}`, { activo: !u.activo });
      toast.success(u.activo ? 'Usuario desactivado' : 'Usuario activado');
      cargar();
    } catch { toast.error('Error'); }
  };

  const eliminarUsuario = async (u: Usuario) => {
    if (!confirm(`¿Eliminar a ${u.nombre_completo}?`)) return;
    try { await api.delete(`/usuarios/${u.id}`); toast.success('Eliminado'); cargar(); }
    catch (err: any) { toast.error(err?.response?.data?.detail ?? 'Error'); }
  };

  // ── Roles ────────────────────────────────────────────────────
  const abrirCrearRol = () => {
    setFormRol({ nombre: '', descripcion: '' });
    setPermisosRol({});
    setModalRol(true);
  };

  const togglePermiso = (modulo: string, accion: string) => {
    setPermisosRol(prev => {
      const acciones = prev[modulo] ?? [];
      const existe = acciones.includes(accion);
      return { ...prev, [modulo]: existe ? acciones.filter(a => a !== accion) : [...acciones, accion] };
    });
  };

  const toggleModuloCompleto = (modulo: string) => {
    const acciones = permisosRol[modulo] ?? [];
    setPermisosRol(prev => ({
      ...prev,
      [modulo]: acciones.length === ACCIONES.length ? [] : [...ACCIONES],
    }));
  };

  const guardarRol = async () => {
    if (!formRol.nombre) { toast.error('El nombre es requerido'); return; }
    const permisos = Object.entries(permisosRol).flatMap(([modulo, acciones]) =>
      acciones.map(accion => ({ modulo, accion }))
    );
    try {
      setSaving(true);
      await api.post('/roles', { nombre: formRol.nombre, descripcion: formRol.descripcion, permisos });
      toast.success('Rol creado');
      setModalRol(false);
      cargar();
    } catch (err: any) { toast.error(err?.response?.data?.detail ?? 'Error al crear rol'); }
    finally { setSaving(false); }
  };

  const rolColor: Record<string, string> = { admin: '#1F4788', medico: '#0f766e' };
  const getRolColor = (nombre: string) => rolColor[nombre] ?? '#6366f1';

  // ── Estilos reutilizables ─────────────────────────────────────
  const tabStyle = (active: boolean) => ({
    display: 'flex', alignItems: 'center', gap: 7,
    padding: '8px 18px', borderRadius: 8, border: 'none',
    background: active ? '#1F4788' : 'transparent',
    color: active ? '#fff' : '#64748b',
    cursor: 'pointer', fontSize: 13, fontWeight: active ? 600 : 400,
    transition: 'all 0.15s',
  });

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}>
      <Loader2 size={28} style={{ color: '#1F4788', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: '#0f172a' }}>
            {tab === 'usuarios' ? 'Usuarios' : 'Roles y Permisos'}
          </h2>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: '#64748b' }}>
            {tab === 'usuarios' ? 'Gestiona los usuarios del sistema' : 'Define roles y sus permisos por módulo'}
          </p>
        </div>
        <button
          onClick={tab === 'usuarios' ? abrirCrearUsuario : abrirCrearRol}
          style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 18px', background: '#1F4788', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}
        >
          <Plus size={15} /> {tab === 'usuarios' ? 'Nuevo usuario' : 'Nuevo rol'}
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, background: '#f8fafc', padding: 4, borderRadius: 10, width: 'fit-content', border: '1px solid #e2e8f0' }}>
        <button style={tabStyle(tab === 'usuarios')} onClick={() => setTab('usuarios')}>
          <Users size={14} /> Usuarios ({usuarios.length})
        </button>
        <button style={tabStyle(tab === 'roles')} onClick={() => setTab('roles')}>
          <Shield size={14} /> Roles ({roles.length})
        </button>
      </div>

      {/* ── TAB USUARIOS ── */}
      {tab === 'usuarios' && (
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                {['Usuario', 'Nombre', 'Email', 'Rol', 'Estado', 'Acciones'].map(h => (
                  <th key={h} style={{ padding: '11px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#475569', borderBottom: '1px solid #e2e8f0' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {usuarios.map(u => (
                <tr key={u.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 32, height: 32, borderRadius: '50%', background: getRolColor(u.rol.nombre), display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 12, fontWeight: 700 }}>
                        {u.nombre_completo.charAt(0)}
                      </div>
                      <span style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>{u.username}</span>
                      {u.id === yo?.id && <span style={{ fontSize: 10, padding: '1px 6px', background: '#EEF3FB', color: '#1F4788', borderRadius: 10 }}>Tú</span>}
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: 13, color: '#334155' }}>{u.nombre_completo}</td>
                  <td style={{ padding: '12px 16px', fontSize: 13, color: '#64748b' }}>{u.email ?? '—'}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 20, background: `${getRolColor(u.rol.nombre)}15`, color: getRolColor(u.rol.nombre), fontWeight: 600 }}>
                      {u.rol.nombre}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 20, background: u.activo ? '#d1fae5' : '#fee2e2', color: u.activo ? '#065f46' : '#991b1b', fontWeight: 600 }}>
                      {u.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button onClick={() => abrirEditarUsuario(u)} style={{ padding: 7, borderRadius: 7, border: 'none', background: '#EEF3FB', color: '#1F4788', cursor: 'pointer' }}><Edit2 size={13} /></button>
                      {u.id !== yo?.id && <>
                        <button onClick={() => toggleActivo(u)} style={{ padding: 7, borderRadius: 7, border: 'none', background: u.activo ? '#fef3c7' : '#d1fae5', color: u.activo ? '#92400e' : '#065f46', cursor: 'pointer' }}>
                          {u.activo ? <UserX size={13} /> : <UserCheck size={13} />}
                        </button>
                        <button onClick={() => eliminarUsuario(u)} style={{ padding: 7, borderRadius: 7, border: 'none', background: '#fee2e2', color: '#991b1b', cursor: 'pointer' }}><Trash2 size={13} /></button>
                      </>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {usuarios.length === 0 && <div style={{ textAlign: 'center', padding: 32, color: '#94a3b8', fontSize: 13 }}>No hay usuarios</div>}
        </div>
      )}

      {/* ── TAB ROLES ── */}
      {tab === 'roles' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {roles.map(rol => (
            <div key={rol.id} style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
              <button
                onClick={() => setRolExpandido(r => r === rol.id ? null : rol.id)}
                style={{ display: 'flex', alignItems: 'center', gap: 14, width: '100%', padding: '14px 18px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}
              >
                <div style={{ width: 36, height: 36, borderRadius: 8, background: `${getRolColor(rol.nombre)}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Shield size={16} style={{ color: getRolColor(rol.nombre) }} />
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: '#0f172a', textTransform: 'capitalize' }}>{rol.nombre}</p>
                  <p style={{ margin: '2px 0 0', fontSize: 12, color: '#64748b' }}>
                    {rol.descripcion ?? ''} · {rol.permisos.length} permisos
                  </p>
                </div>
                <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 20, background: `${getRolColor(rol.nombre)}15`, color: getRolColor(rol.nombre), fontWeight: 600 }}>
                  {usuarios.filter(u => u.rol.id === rol.id).length} usuario(s)
                </span>
                {rolExpandido === rol.id ? <ChevronUp size={16} style={{ color: '#94a3b8' }} /> : <ChevronDown size={16} style={{ color: '#94a3b8' }} />}
              </button>

              {rolExpandido === rol.id && (
                <div style={{ borderTop: '1px solid #f1f5f9', padding: '14px 18px' }}>
                  <p style={{ margin: '0 0 12px', fontSize: 12, fontWeight: 600, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Permisos asignados</p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 8 }}>
                    {MODULOS.map(modulo => {
                      const accionesRol = rol.permisos.filter(p => p.modulo === modulo).map(p => p.accion);
                      if (accionesRol.length === 0) return null;
                      return (
                        <div key={modulo} style={{ padding: '10px 12px', background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                          <p style={{ margin: '0 0 6px', fontSize: 12, fontWeight: 600, color: '#334155', textTransform: 'capitalize' }}>{modulo}</p>
                          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                            {accionesRol.map(a => (
                              <span key={a} style={{ fontSize: 10, padding: '2px 7px', borderRadius: 10, background: '#EEF3FB', color: '#1F4788', fontWeight: 600 }}>{a}</span>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ── MODAL USUARIO ── */}
      {modalUsuario && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: 16 }}>
          <div style={{ background: '#fff', borderRadius: 14, width: '100%', maxWidth: 440, boxShadow: '0 20px 60px rgba(0,0,0,0.2)', overflow: 'hidden' }}>
            <div style={{ padding: '18px 20px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600 }}>{editandoUsuario ? 'Editar usuario' : 'Nuevo usuario'}</h3>
              <button onClick={() => setModalUsuario(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}><X size={18} /></button>
            </div>
            <div style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { label: 'Usuario *', key: 'username', type: 'text', disabled: !!editandoUsuario },
                { label: 'Nombre completo *', key: 'nombre_completo', type: 'text' },
                { label: 'Email', key: 'email', type: 'email' },
                { label: editandoUsuario ? 'Nueva contraseña (vacío = sin cambio)' : 'Contraseña *', key: 'password', type: 'password' },
              ].map(({ label, key, type, disabled }) => (
                <div key={key}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 5 }}>{label}</label>
                  <input type={type} value={(formUsuario as any)[key]}
                    onChange={e => setFormUsuario(f => ({ ...f, [key]: e.target.value }))}
                    disabled={disabled}
                    style={{ width: '100%', padding: '9px 11px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 13, boxSizing: 'border-box', background: disabled ? '#f8fafc' : '#fff', outline: 'none' }}
                  />
                </div>
              ))}
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 5 }}>Rol *</label>
                <select value={formUsuario.rol_id} onChange={e => setFormUsuario(f => ({ ...f, rol_id: e.target.value }))}
                  style={{ width: '100%', padding: '9px 11px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 13, background: '#fff', outline: 'none', boxSizing: 'border-box' }}>
                  {roles.map(r => <option key={r.id} value={r.id}>{r.nombre}</option>)}
                </select>
              </div>
            </div>
            <div style={{ padding: '14px 20px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button onClick={() => setModalUsuario(false)} style={{ padding: '8px 16px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 13, cursor: 'pointer' }}>Cancelar</button>
              <button onClick={guardarUsuario} disabled={saving} style={{ padding: '8px 18px', background: '#1F4788', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                {saving && <Loader2 size={14} style={{ animation: 'spin 0.8s linear infinite' }} />}
                {saving ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL ROL ── */}
      {modalRol && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: 16 }}>
          <div style={{ background: '#fff', borderRadius: 14, width: '100%', maxWidth: 560, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
            <div style={{ padding: '18px 20px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, background: '#fff', zIndex: 1 }}>
              <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600 }}>Nuevo rol</h3>
              <button onClick={() => setModalRol(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}><X size={18} /></button>
            </div>
            <div style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 5 }}>Nombre del rol *</label>
                  <input value={formRol.nombre} onChange={e => setFormRol(f => ({ ...f, nombre: e.target.value }))}
                    placeholder="ej: fisioterapeuta"
                    style={{ width: '100%', padding: '9px 11px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 13, boxSizing: 'border-box', outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 5 }}>Descripción</label>
                  <input value={formRol.descripcion} onChange={e => setFormRol(f => ({ ...f, descripcion: e.target.value }))}
                    placeholder="Descripción opcional"
                    style={{ width: '100%', padding: '9px 11px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 13, boxSizing: 'border-box', outline: 'none' }}
                  />
                </div>
              </div>

              {/* Matriz de permisos */}
              <div>
                <p style={{ margin: '0 0 10px', fontSize: 12, fontWeight: 600, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Permisos por módulo</p>
                <div style={{ border: '1px solid #e2e8f0', borderRadius: 10, overflow: 'hidden' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: '#f8fafc' }}>
                        <th style={{ padding: '9px 14px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#475569', borderBottom: '1px solid #e2e8f0' }}>Módulo</th>
                        {ACCIONES.map(a => (
                          <th key={a} style={{ padding: '9px 10px', textAlign: 'center', fontSize: 12, fontWeight: 600, color: '#475569', borderBottom: '1px solid #e2e8f0', textTransform: 'capitalize' }}>{a}</th>
                        ))}
                        <th style={{ padding: '9px 10px', textAlign: 'center', fontSize: 12, fontWeight: 600, color: '#475569', borderBottom: '1px solid #e2e8f0' }}>Todo</th>
                      </tr>
                    </thead>
                    <tbody>
                      {MODULOS.map((modulo, idx) => {
                        const accionesSeleccionadas = permisosRol[modulo] ?? [];
                        const todoSeleccionado = accionesSeleccionadas.length === ACCIONES.length;
                        return (
                          <tr key={modulo} style={{ background: idx % 2 === 0 ? '#fff' : '#f8fafc', borderBottom: '1px solid #f1f5f9' }}>
                            <td style={{ padding: '10px 14px', fontSize: 13, fontWeight: 500, color: '#334155', textTransform: 'capitalize' }}>{modulo}</td>
                            {ACCIONES.map(accion => (
                              <td key={accion} style={{ padding: '10px', textAlign: 'center' }}>
                                <input type="checkbox"
                                  checked={accionesSeleccionadas.includes(accion)}
                                  onChange={() => togglePermiso(modulo, accion)}
                                  style={{ width: 15, height: 15, cursor: 'pointer', accentColor: '#1F4788' }}
                                />
                              </td>
                            ))}
                            <td style={{ padding: '10px', textAlign: 'center' }}>
                              <input type="checkbox"
                                checked={todoSeleccionado}
                                onChange={() => toggleModuloCompleto(modulo)}
                                style={{ width: 15, height: 15, cursor: 'pointer', accentColor: '#1F4788' }}
                              />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            <div style={{ padding: '14px 20px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'flex-end', gap: 10, position: 'sticky', bottom: 0, background: '#fff' }}>
              <button onClick={() => setModalRol(false)} style={{ padding: '8px 16px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 13, cursor: 'pointer' }}>Cancelar</button>
              <button onClick={guardarRol} disabled={saving} style={{ padding: '8px 18px', background: '#1F4788', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                {saving && <Loader2 size={14} style={{ animation: 'spin 0.8s linear infinite' }} />}
                {saving ? 'Guardando...' : 'Crear rol'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default GestionUsuarios;