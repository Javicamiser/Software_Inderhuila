// ============================================================
// PROTECTED ROUTE — redirige a login si no hay sesión
// ============================================================
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/app/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiereAdmin?: boolean;
}

export function ProtectedRoute({ children, requiereAdmin = false }: ProtectedRouteProps) {
  const { usuario, loading, isAdmin } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div style={{ width: 32, height: 32, border: '2px solid #1F4788', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!usuario) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiereAdmin && !isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

export default ProtectedRoute;