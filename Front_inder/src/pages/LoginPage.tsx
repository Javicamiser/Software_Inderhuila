// ============================================================
// PÁGINA DE LOGIN
// ============================================================
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/app/contexts/AuthContext';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import logoInderhuila from '@/assets/logo-inderhuila.png';
import logoWap from '@/assets/logo_wap.jpeg';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate  = useNavigate();

  const [username,  setUsername]  = useState('');
  const [password,  setPassword]  = useState('');
  const [showPass,  setShowPass]  = useState(false);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('Completa todos los campos');
      return;
    }
    try {
      setLoading(true);
      setError('');
      await login(username.trim(), password);
      navigate('/dashboard', { replace: true });
    } catch (err: any) {
      const msg = err?.response?.data?.detail ?? 'Error al iniciar sesión';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', background: '#F0F4FA', padding: 16,
    }}>
      <div style={{
        width: '100%', maxWidth: 420,
        background: '#fff', borderRadius: 16,
        border: '1px solid #e2e8f0',
        boxShadow: '0 8px 32px rgba(31,71,136,0.10)',
        overflow: 'hidden',
      }}>
        {/* Header azul */}
        <div style={{
          background: 'linear-gradient(135deg, #1F4788 0%, #1e40af 100%)',
          padding: '32px 32px 24px',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
        }}>
          <img src={logoInderhuila} alt="INDERHUILA"
            style={{ width: 64, height: 64, borderRadius: 12, objectFit: 'cover', border: '2px solid rgba(255,255,255,0.3)' }}
          />
          <div style={{ textAlign: 'center' }}>
            <h1 style={{ color: '#fff', fontSize: 18, fontWeight: 700, margin: 0 }}>
              INDERHUILA
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, margin: '4px 0 0' }}>
              Sistema Médico Deportivo
            </p>
          </div>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} style={{ padding: '28px 32px 24px' }}>
          <p style={{ fontSize: 15, fontWeight: 600, color: '#0f172a', margin: '0 0 20px' }}>
            Iniciar sesión
          </p>

          {/* Usuario */}
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 6 }}>
              Usuario
            </label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="Nombre de usuario"
              autoFocus
              autoComplete="username"
              style={{
                width: '100%', padding: '10px 12px',
                border: `1px solid ${error ? '#ef4444' : '#e2e8f0'}`,
                borderRadius: 8, fontSize: 14, color: '#0f172a',
                outline: 'none', boxSizing: 'border-box',
                background: '#f8fafc',
              }}
              onFocus={e => { e.currentTarget.style.borderColor = '#1F4788'; e.currentTarget.style.background = '#fff'; }}
              onBlur={e => { e.currentTarget.style.borderColor = error ? '#ef4444' : '#e2e8f0'; e.currentTarget.style.background = '#f8fafc'; }}
            />
          </div>

          {/* Contraseña */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 6 }}>
              Contraseña
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                style={{
                  width: '100%', padding: '10px 40px 10px 12px',
                  border: `1px solid ${error ? '#ef4444' : '#e2e8f0'}`,
                  borderRadius: 8, fontSize: 14, color: '#0f172a',
                  outline: 'none', boxSizing: 'border-box',
                  background: '#f8fafc',
                }}
                onFocus={e => { e.currentTarget.style.borderColor = '#1F4788'; e.currentTarget.style.background = '#fff'; }}
                onBlur={e => { e.currentTarget.style.borderColor = error ? '#ef4444' : '#e2e8f0'; e.currentTarget.style.background = '#f8fafc'; }}
              />
              <button
                type="button"
                onClick={() => setShowPass(s => !s)}
                style={{
                  position: 'absolute', right: 10, top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: '#94a3b8', padding: 4,
                }}
              >
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div style={{
              marginBottom: 14, padding: '10px 12px',
              background: '#fef2f2', border: '1px solid #fecaca',
              borderRadius: 8, fontSize: 13, color: '#dc2626',
            }}>
              {error}
            </div>
          )}

          {/* Botón */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%', padding: '11px',
              background: loading ? '#93afd4' : '#1F4788',
              color: '#fff', border: 'none', borderRadius: 8,
              fontSize: 14, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              transition: 'background 0.15s',
            }}
          >
            {loading && <Loader2 size={16} style={{ animation: 'spin 0.8s linear infinite' }} />}
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>

          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </form>

        {/* Footer WAP */}
        <div style={{
          borderTop: '1px solid #f1f5f9',
          padding: '12px 32px',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        }}>
          <img src={logoWap} alt="WAP Enterprise"
            style={{ height: 18, width: 'auto', borderRadius: 3, opacity: 0.7 }}
          />
          <span style={{ fontSize: 11, color: '#94a3b8' }}>
            Desarrollado por <span style={{ color: '#64748b', fontWeight: 600 }}>WAP Enterprise SAS</span>
          </span>
        </div>
      </div>
    </div>
  );
}