// ============================================================
// PÁGINA DE PRIMER USO — crea el primer admin
// Aparece solo cuando no hay usuarios en el sistema
// ============================================================
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '@/app/services/apiClient';
import { useAuth } from '@/app/contexts/AuthContext';
import { Loader2, Eye, EyeOff, CheckCircle } from 'lucide-react';
import logoInderhuila from '@/assets/logo-inderhuila.png';
import logoWap from '@/assets/logo_wap.jpeg';

export default function SetupPage() {
  const navigate   = useNavigate();
  const { login }  = useAuth();

  const [form, setForm] = useState({
    username: '', nombre_completo: '', email: '', password: '', confirmar: '',
  });
  const [showPass, setShowPass] = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.username || !form.nombre_completo || !form.password) {
      setError('Completa los campos obligatorios'); return;
    }
    if (form.password !== form.confirmar) {
      setError('Las contraseñas no coinciden'); return;
    }
    if (form.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres'); return;
    }
    try {
      setLoading(true);
      setError('');
      await api.post('/auth/setup', {
        username: form.username,
        nombre_completo: form.nombre_completo,
        email: form.email || undefined,
        password: form.password,
      });
      // Login automático después del setup
      await login(form.username, form.password);
      navigate('/dashboard', { replace: true });
    } catch (err: any) {
      setError(err?.response?.data?.detail ?? 'Error al configurar el sistema');
    } finally {
      setLoading(false);
    }
  };

  const Field = ({ label, name, type = 'text', placeholder, required = false }: {
    label: string; name: keyof typeof form; type?: string; placeholder?: string; required?: boolean;
  }) => (
    <div style={{ marginBottom: 14 }}>
      <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 6 }}>
        {label} {required && <span style={{ color: '#ef4444' }}>*</span>}
      </label>
      <div style={{ position: 'relative' }}>
        <input
          type={name === 'password' || name === 'confirmar' ? (showPass ? 'text' : 'password') : type}
          value={form[name]}
          onChange={set(name)}
          placeholder={placeholder}
          style={{
            width: '100%', padding: '10px 12px',
            border: '1px solid #e2e8f0', borderRadius: 8,
            fontSize: 14, color: '#0f172a', outline: 'none',
            boxSizing: 'border-box', background: '#f8fafc',
          }}
          onFocus={e => { e.currentTarget.style.borderColor = '#1F4788'; e.currentTarget.style.background = '#fff'; }}
          onBlur={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.background = '#f8fafc'; }}
        />
        {(name === 'password' || name === 'confirmar') && (
          <button type="button" onClick={() => setShowPass(s => !s)}
            style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
            {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#F0F4FA', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ width: '100%', maxWidth: 460, background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', boxShadow: '0 8px 32px rgba(31,71,136,0.10)', overflow: 'hidden' }}>

        {/* Header */}
        <div style={{ background: 'linear-gradient(135deg, #1F4788 0%, #1e40af 100%)', padding: '28px 32px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
          <img src={logoInderhuila} alt="INDERHUILA" style={{ width: 56, height: 56, borderRadius: 10, objectFit: 'cover', border: '2px solid rgba(255,255,255,0.3)' }} />
          <div style={{ textAlign: 'center' }}>
            <h1 style={{ color: '#fff', fontSize: 17, fontWeight: 700, margin: 0 }}>Configuración inicial</h1>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, margin: '3px 0 0' }}>
              Crea el primer administrador del sistema
            </p>
          </div>
        </div>

        {/* Info */}
        <div style={{ margin: '20px 32px 0', padding: '10px 14px', background: '#EEF3FB', borderRadius: 8, display: 'flex', alignItems: 'flex-start', gap: 10 }}>
          <CheckCircle size={16} style={{ color: '#1F4788', flexShrink: 0, marginTop: 1 }} />
          <p style={{ fontSize: 12, color: '#1F4788', margin: 0, lineHeight: 1.5 }}>
            Esta pantalla aparece solo una vez. El usuario que crees aquí tendrá acceso completo para gestionar el sistema.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ padding: '20px 32px 24px' }}>
          <Field label="Nombre de usuario" name="username" placeholder="ej: jmedina" required />
          <Field label="Nombre completo" name="nombre_completo" placeholder="ej: Juan Medina" required />
          <Field label="Email" name="email" type="email" placeholder="opcional" />
          <Field label="Contraseña" name="password" placeholder="Mínimo 6 caracteres" required />
          <Field label="Confirmar contraseña" name="confirmar" placeholder="Repite la contraseña" required />

          {error && (
            <div style={{ marginBottom: 14, padding: '10px 12px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, fontSize: 13, color: '#dc2626' }}>
              {error}
            </div>
          )}

          <button type="submit" disabled={loading} style={{
            width: '100%', padding: 11,
            background: loading ? '#93afd4' : '#1F4788',
            color: '#fff', border: 'none', borderRadius: 8,
            fontSize: 14, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}>
            {loading && <Loader2 size={16} style={{ animation: 'spin 0.8s linear infinite' }} />}
            {loading ? 'Configurando...' : 'Crear administrador y entrar'}
          </button>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </form>

        {/* Footer */}
        <div style={{ borderTop: '1px solid #f1f5f9', padding: '12px 32px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <img src={logoWap} alt="WAP" style={{ height: 18, opacity: 0.7, borderRadius: 3 }} />
          <span style={{ fontSize: 11, color: '#94a3b8' }}>Desarrollado por <span style={{ color: '#64748b', fontWeight: 600 }}>WAP Enterprise SAS</span></span>
        </div>
      </div>
    </div>
  );
}