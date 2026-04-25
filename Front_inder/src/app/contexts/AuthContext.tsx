// ============================================================
// AUTH CONTEXT — estado global de sesión
// ============================================================
import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { api, setAuthToken } from '@/app/services/apiClient';

export interface UsuarioAuth {
  id: string;
  username: string;
  nombre_completo: string;
  email?: string;
  activo: boolean;
  rol: {
    id: string;
    nombre: string;
    permisos: { modulo: string; accion: string }[];
  };
}

interface AuthContextValue {
  usuario:    UsuarioAuth | null;
  token:      string | null;
  loading:    boolean;
  login:      (username: string, password: string) => Promise<void>;
  logout:     () => void;
  isAdmin:    boolean;
  puedeHacer: (modulo: string, accion: string) => boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<UsuarioAuth | null>(null);
  const [token, setToken]     = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Al montar, restaurar sesión del localStorage
  useEffect(() => {
    const savedToken   = localStorage.getItem('auth_token');
    const savedUsuario = localStorage.getItem('auth_usuario');
    if (savedToken && savedUsuario) {
      try {
        setAuthToken(savedToken);
        setToken(savedToken);
        setUsuario(JSON.parse(savedUsuario));
      } catch { logout(); }
    }
    setLoading(false);
  }, []);

  const login = async (username: string, password: string) => {
    const { data } = await api.post('/auth/login', { username, password });
    const { access_token, usuario: usr } = data;
    setAuthToken(access_token);
    setToken(access_token);
    setUsuario(usr);
    localStorage.setItem('auth_usuario', JSON.stringify(usr));
  };

  const logout = () => {
    setAuthToken(null);
    setToken(null);
    setUsuario(null);
    localStorage.removeItem('auth_usuario');
  };

  const isAdmin = usuario?.rol?.nombre === 'admin';

  const puedeHacer = (modulo: string, accion: string) => {
    if (!usuario) return false;
    if (isAdmin) return true; // admin puede todo
    return usuario.rol.permisos.some(p => p.modulo === modulo && p.accion === accion);
  };

  return (
    <AuthContext.Provider value={{ usuario, token, loading, login, logout, isAdmin, puedeHacer }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
}

export default AuthContext;