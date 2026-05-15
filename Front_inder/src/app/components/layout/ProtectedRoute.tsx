// ============================================================
// PROTECTED ROUTE — redirige a login si no hay sesión,
// a /dashboard si no tiene permiso de módulo o no es admin.
// ============================================================
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/app/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiereAdmin?: boolean;
  modulo?:  string;   // módulo a verificar con puedeHacer
  accion?:  string;   // acción a verificar (default: 'ver')
}

export function ProtectedRoute({
  children,
  requiereAdmin = false,
  modulo,
  accion = 'ver',
}: ProtectedRouteProps) {
  const { usuario, loading, isAdmin, puedeHacer } = useAuth();
  const location = useLocation();

  // Spinner mientras carga la sesión
  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div style={{ width: 32, height: 32, border: '2px solid #1F4788', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // Sin sesión → login
  if (!usuario) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Requiere admin y no lo es → dashboard
  if (requiereAdmin && !isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  // Requiere permiso de módulo y no lo tiene → dashboard
  if (modulo && !puedeHacer(modulo, accion)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

export default ProtectedRoute;