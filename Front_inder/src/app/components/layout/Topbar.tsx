import { Menu, Bell, ChevronDown, LogOut, Settings, User } from 'lucide-react';
import { useAuth } from '@/app/contexts/AuthContext';
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

interface TopbarProps {
  onToggleSidebar: () => void;
  sidebarOpen?: boolean;
}

const PAGE_TITLES: Record<string, { title: string; subtitle: string }> = {
  dashboard:   { title: 'Dashboard',       subtitle: 'Resumen general del sistema'   },
  deportistas: { title: 'Deportistas',      subtitle: 'Gestión de atletas registrados'},
  historia:    { title: 'Historia Clínica', subtitle: 'Registros médicos deportivos'  },
  citas:       { title: 'Citas',            subtitle: 'Agenda y programación'         },
  archivos:    { title: 'Archivos',         subtitle: 'Documentos y adjuntos'         },
  reportes:    { title: 'Reportes',         subtitle: 'Estadísticas y análisis'       },
  usuarios:    { title: 'Usuarios',         subtitle: 'Gestión de usuarios y roles'   },
  configuracion:{ title: 'Configuración',   subtitle: 'Ajustes del sistema'           },
};

export function Topbar({ onToggleSidebar }: TopbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { usuario, logout }     = useAuth();
  const navigate                = useNavigate();
  const location                = useLocation();

  const view = location.pathname.replace('/', '') || 'dashboard';
  const page = PAGE_TITLES[view] ?? PAGE_TITLES['dashboard'];

  const inicial = (usuario?.nombre_completo ?? 'U').charAt(0).toUpperCase();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <header style={{
      height: '60px', background: '#ffffff',
      borderBottom: '1px solid #e2e8f0',
      display: 'flex', alignItems: 'center',
      padding: '0 20px', gap: 14,
      position: 'sticky', top: 0, zIndex: 40, flexShrink: 0,
    }}>
      {/* Toggle sidebar */}
      <button onClick={onToggleSidebar} style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        width: 34, height: 34, borderRadius: 8,
        border: '1px solid #e2e8f0', background: 'transparent',
        cursor: 'pointer', color: '#64748b', flexShrink: 0,
      }}>
        <Menu size={16} />
      </button>

      {/* Título de la página */}
      <div style={{ flex: 1 }}>
        <h1 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: '#0f172a', lineHeight: 1.2 }}>
          {page.title}
        </h1>
        <p style={{ margin: 0, fontSize: 11, color: '#94a3b8', lineHeight: 1.2 }}>
          {page.subtitle}
        </p>
      </div>

      {/* Fecha */}
      <div style={{ padding: '5px 10px', background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0' }}>
        <span style={{ fontSize: 12, color: '#64748b', whiteSpace: 'nowrap' }}>
          {new Date().toLocaleDateString('es-CO', { weekday: 'short', day: 'numeric', month: 'short' })}
        </span>
      </div>

      {/* Notificaciones */}
      <button style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        width: 34, height: 34, borderRadius: 8,
        border: '1px solid #e2e8f0', background: 'transparent',
        cursor: 'pointer', color: '#64748b',
      }}>
        <Bell size={16} />
      </button>

      {/* Menú usuario */}
      <div style={{ position: 'relative' }}>
        <button
          onClick={() => setMenuOpen(o => !o)}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '5px 10px 5px 6px', borderRadius: 8,
            border: '1px solid #e2e8f0', background: 'transparent', cursor: 'pointer',
          }}
        >
          <div style={{
            width: 28, height: 28, borderRadius: '50%',
            background: 'linear-gradient(135deg, #1F4788, #3b82f6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontSize: 12, fontWeight: 700, flexShrink: 0,
          }}>
            {inicial}
          </div>
          <div style={{ textAlign: 'left', lineHeight: 1.25 }}>
            <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: '#0f172a' }}>
              {usuario?.nombre_completo ?? 'Usuario'}
            </p>
            <p style={{ margin: 0, fontSize: 10, color: '#94a3b8', textTransform: 'capitalize' }}>
              {usuario?.rol?.nombre ?? ''}
            </p>
          </div>
          <ChevronDown size={13} style={{ color: '#94a3b8', flexShrink: 0 }} />
        </button>

        {menuOpen && (
          <>
            <div style={{ position: 'fixed', inset: 0, zIndex: 90 }} onClick={() => setMenuOpen(false)} />
            <div style={{
              position: 'absolute', right: 0, top: 'calc(100% + 8px)',
              background: '#ffffff', border: '1px solid #e2e8f0',
              borderRadius: 12, boxShadow: '0 10px 40px rgba(0,0,0,0.12)',
              minWidth: 190, zIndex: 100, overflow: 'hidden',
            }}>
              <div style={{ padding: '12px 14px', borderBottom: '1px solid #f1f5f9' }}>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: '#0f172a' }}>
                  {usuario?.nombre_completo}
                </p>
                <p style={{ margin: '2px 0 0', fontSize: 11, color: '#94a3b8' }}>
                  {usuario?.email ?? usuario?.username}
                </p>
              </div>
              <div style={{ padding: 6 }}>
                <DropItem icon={<User size={14} />} label="Mi perfil" onClick={() => setMenuOpen(false)} />
                <DropItem icon={<Settings size={14} />} label="Configuración"
                  onClick={() => { setMenuOpen(false); navigate('/configuracion'); }} />
                <div style={{ margin: '4px 0', borderTop: '1px solid #f1f5f9' }} />
                <DropItem icon={<LogOut size={14} />} label="Cerrar sesión" danger onClick={handleLogout} />
              </div>
            </div>
          </>
        )}
      </div>
    </header>
  );
}

function DropItem({ icon, label, onClick, danger = false }: {
  icon: React.ReactNode; label: string; onClick: () => void; danger?: boolean;
}) {
  return (
    <button onClick={onClick} style={{
      display: 'flex', alignItems: 'center', gap: 8, width: '100%',
      padding: '8px 10px', borderRadius: 8, border: 'none',
      background: 'transparent', cursor: 'pointer', textAlign: 'left',
      fontSize: 13, color: danger ? '#ef4444' : '#475569',
    }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = danger ? '#fef2f2' : '#f8fafc'; }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
    >
      {icon}{label}
    </button>
  );
}

export default Topbar;