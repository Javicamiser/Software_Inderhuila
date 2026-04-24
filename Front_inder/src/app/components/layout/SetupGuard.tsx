// ============================================================
// SETUP GUARD
// En /login: si no hay usuarios redirige a /setup
//            si ya hay sesión redirige a /dashboard
// ============================================================
import { useState, useEffect, type ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { api } from '@/app/services/apiClient';
import { useAuth } from '@/app/contexts/AuthContext';

export default function SetupGuard({ children }: { children: ReactNode }) {
  const { usuario } = useAuth();
  const [setupRequerido, setSetupRequerido] = useState<boolean | null>(null);

  useEffect(() => {
    api.get('/auth/setup-requerido')
      .then(r => setSetupRequerido(r.data.setup_requerido))
      .catch(() => setSetupRequerido(false));
  }, []);

  // Si ya está logueado, ir al dashboard
  if (usuario) return <Navigate to="/dashboard" replace />;

  // Esperando respuesta del backend
  if (setupRequerido === null) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <div style={{ width: 28, height: 28, border: '2px solid #1F4788', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  // Si no hay usuarios, redirigir a setup
  if (setupRequerido) return <Navigate to="/setup" replace />;

  return <>{children}</>;
}