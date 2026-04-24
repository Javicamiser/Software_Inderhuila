// ============================================================
// GESTIÓN DE USUARIOS — solo admin
// ============================================================
import { useState, useEffect } from 'react';
import { api } from '@/app/services/apiClient';
import { useAuth } from '@/app/contexts/AuthContext';
import { Plus, Edit2, Trash2, UserCheck, UserX, Loader2, X } from 'lucide-react';
import { toast } from 'sonner';

interface Rol { id: string; nombre: string; descripcion?: string; }
interface Usuario {
  id: string; username: string; nombre_completo: string;
  email?: string; activo: boolean;
  rol: { id: string; nombre: string; };
}

export function GestionUsuarios() {
  const { usuario: yo } = useAuth();
  const [usuarios,  setUsuarios]  = useState<Usuario[]>([]);
  const [roles,     setRoles]     = useState<Rol[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [modal,     setModal]     = useState(false);
  const [editando,  setEditando]  = useState<Usuario | null>(null);
  const [form, setForm] = useState({ username: '', nombre_completo: '', email: '', password: '', rol_id: '' });
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

  const abrirCrear = () => {
    setEditando(null);
    setForm({ username: '', nombre_completo: '', email: '', password: '', rol_id: roles[0]?.id ?? '' });
    setModal(true);
  };

  const abrirEditar = (u: Usuario) => {
    setEditando(u);
    setForm({ username: u.username, nombre_completo: u.nombre_completo, email: u.email ?? '', password: '', rol_id: u.rol.id });
    setModal(true);
  };

  const guardar = async () => {
    if (!form.username || !form.nombre_completo || !form.rol_id) { toast.error('Completa los campos requeridos'); return; }
    if (!editando && !form.password) { toast.error('La contraseña es requerida'); return; }
    try {
      setSaving(true);
      const body: any = { username: form.username, nombre_completo: form.nombre_completo, email: form.email || undefined, rol_id: form.rol_id };
      if (form.password) body.password = form.password;
      if (editando) {
        await api.put(`/usuarios/${editando.id}`, body);
        toast.success('Usuario actualizado');
      } else {
        await api.post('/usuarios', body);
        toast.success('Usuario creado');
      }
      setModal(false);
      cargar();
    } catch (err: any) {
      toast.error(err?.response?.data?.detail ?? 'Error al guardar');
    } finally { setSaving(false); }
  };

  const toggleActivo = async (u: Usuario) => {
    try {
      await api.put(`/usuarios/${u.id}`, { activo: !u.activo });
      toast.success(u.activo ? 'Usuario desactivado' : 'Usuario activado');
      cargar();
    } catch { toast.error('Error'); }
  };

  const eliminar = async (u: Usuario) => {
    if (!confirm(`¿Eliminar a ${u.nombre_completo}? Esta acción no se puede deshacer.`)) return;
    try {
      await api.delete(`/usuarios/${u.id}`);
      toast.success('Usuario eliminado');
      cargar();
    } catch (err: any) { toast.error(err?.response?.data?.detail ?? 'Error'); }
  };

  const rolColor: Record<string, string> = { admin: '#1F4788', medico: '#0f766e' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: '#0f172a' }}>Usuarios</h2>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: '#64748b' }}>Gestiona los usuarios y sus roles</p>
        </div>
        <button onClick={abrirCrear} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 18px', background: '#1F4788', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
          <Plus size={16} /> Nuevo usuario
        </button>
      </div>

      {/* Tabla */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}>
          <Loader2 size={28} style={{ color: '#1F4788', animation: 'spin 0.8s linear infinite' }} />
        </div>
      ) : (
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                {['Usuario', 'Nombre completo', 'Email', 'Rol', 'Estado', 'Acciones'].map(h => (
                  <th key={h} style={{ padding: '11px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#475569', borderBottom: '1px solid #e2e8f0' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {usuarios.map(u => (
                <tr key={u.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 600, color: '#0f172a' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 32, height: 32, borderRadius: '50%', background: rolColor[u.rol.nombre] ?? '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
                        {u.nombre_completo.charAt(0)}
                      </div>
                      {u.username}
                      {u.id === yo?.id && <span style={{ fontSize: 10, padding: '1px 6px', background: '#EEF3FB', color: '#1F4788', borderRadius: 10 }}>Tú</span>}
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: 13, color: '#334155' }}>{u.nombre_completo}</td>
                  <td style={{ padding: '12px 16px', fontSize: 13, color: '#64748b' }}>{u.email ?? '—'}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 20, background: `${rolColor[u.rol.nombre] ?? '#64748b'}15`, color: rolColor[u.rol.nombre] ?? '#64748b', fontWeight: 600 }}>
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
                      <button onClick={() => abrirEditar(u)} title="Editar" style={{ padding: 7, borderRadius: 7, border: 'none', background: '#EEF3FB', color: '#1F4788', cursor: 'pointer' }}><Edit2 size={14} /></button>
                      {u.id !== yo?.id && (
                        <>
                          <button onClick={() => toggleActivo(u)} title={u.activo ? 'Desactivar' : 'Activar'} style={{ padding: 7, borderRadius: 7, border: 'none', background: u.activo ? '#fef3c7' : '#d1fae5', color: u.activo ? '#92400e' : '#065f46', cursor: 'pointer' }}>
                            {u.activo ? <UserX size={14} /> : <UserCheck size={14} />}
                          </button>
                          <button onClick={() => eliminar(u)} title="Eliminar" style={{ padding: 7, borderRadius: 7, border: 'none', background: '#fee2e2', color: '#991b1b', cursor: 'pointer' }}><Trash2 size={14} /></button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {usuarios.length === 0 && (
            <div style={{ textAlign: 'center', padding: '32px 0', color: '#94a3b8', fontSize: 13 }}>No hay usuarios registrados</div>
          )}
        </div>
      )}

      {/* Modal crear/editar */}
      {modal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: 16 }}>
          <div style={{ background: '#fff', borderRadius: 14, width: '100%', maxWidth: 440, boxShadow: '0 20px 60px rgba(0,0,0,0.2)', overflow: 'hidden' }}>
            <div style={{ padding: '18px 20px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: '#0f172a' }}>{editando ? 'Editar usuario' : 'Nuevo usuario'}</h3>
              <button onClick={() => setModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}><X size={18} /></button>
            </div>
            <div style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { label: 'Nombre de usuario *', key: 'username', type: 'text', disabled: !!editando },
                { label: 'Nombre completo *', key: 'nombre_completo', type: 'text' },
                { label: 'Email', key: 'email', type: 'email' },
                { label: editando ? 'Nueva contraseña (dejar vacío para no cambiar)' : 'Contraseña *', key: 'password', type: 'password' },
              ].map(({ label, key, type, disabled }) => (
                <div key={key}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 5 }}>{label}</label>
                  <input
                    type={type} value={(form as any)[key]}
                    onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                    disabled={disabled}
                    style={{ width: '100%', padding: '9px 11px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 13, boxSizing: 'border-box', background: disabled ? '#f8fafc' : '#fff', color: '#0f172a', outline: 'none' }}
                  />
                </div>
              ))}
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 5 }}>Rol *</label>
                <select value={form.rol_id} onChange={e => setForm(f => ({ ...f, rol_id: e.target.value }))}
                  style={{ width: '100%', padding: '9px 11px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 13, boxSizing: 'border-box', background: '#fff', outline: 'none' }}>
                  {roles.map(r => <option key={r.id} value={r.id}>{r.nombre}</option>)}
                </select>
              </div>
            </div>
            <div style={{ padding: '14px 20px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button onClick={() => setModal(false)} style={{ padding: '8px 16px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 13, cursor: 'pointer', color: '#475569' }}>Cancelar</button>
              <button onClick={guardar} disabled={saving} style={{ padding: '8px 18px', background: '#1F4788', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                {saving && <Loader2 size={14} style={{ animation: 'spin 0.8s linear infinite' }} />}
                {saving ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )}
    </div>
  );
}

export default GestionUsuarios;