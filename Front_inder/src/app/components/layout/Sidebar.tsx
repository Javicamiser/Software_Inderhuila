// ============================================================
// SIDEBAR — Diseño profesional
// ============================================================
import { ChevronRight, LayoutDashboard, Users, FileText, Calendar, FolderOpen, BarChart2, Settings, UserCog } from 'lucide-react';
import { useAuth } from '@/app/contexts/AuthContext';
import logoInderhuila from '../../../assets/logo-inderhuila.png';

interface SidebarProps {
  isOpen: boolean;
  currentView: string;
  onNavigate: (view: string) => void;
}

const MENU_BASE = [
  { view: 'dashboard',   label: 'Dashboard',       icon: LayoutDashboard },
  { view: 'deportistas', label: 'Deportistas',      icon: Users           },
  { view: 'historia',    label: 'Historia Clínica', icon: FileText        },
  { view: 'citas',       label: 'Citas',            icon: Calendar        },
  { view: 'archivos',    label: 'Archivos',         icon: FolderOpen      },
  { view: 'reportes',    label: 'Reportes',         icon: BarChart2       },
];

function NavItem({ icon, label, active, isOpen, onClick }: {
  icon: React.ReactNode; label: string; active: boolean; isOpen: boolean; onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      title={!isOpen ? label : undefined}
      style={{
        display: 'flex', alignItems: 'center', gap: 10,
        width: '100%', padding: isOpen ? '9px 10px' : '10px 0',
        justifyContent: isOpen ? 'flex-start' : 'center',
        background: active ? 'rgba(59,130,246,0.15)' : 'transparent',
        border: 'none', borderRadius: 8, cursor: 'pointer',
        color: active ? '#60a5fa' : '#94a3b8',
        transition: 'all 0.15s', marginBottom: 2, position: 'relative',
      }}
      onMouseEnter={e => {
        if (!active) { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)'; (e.currentTarget as HTMLElement).style.color = '#e2e8f0'; }
      }}
      onMouseLeave={e => {
        if (!active) { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = '#94a3b8'; }
      }}
    >
      {active && isOpen && (
        <span style={{ position: 'absolute', left: 0, top: '25%', bottom: '25%', width: 3, background: '#3b82f6', borderRadius: '0 3px 3px 0' }} />
      )}
      <span style={{ flexShrink: 0, display: 'flex' }}>{icon}</span>
      {isOpen && (
        <>
          <span style={{ fontSize: 13, fontWeight: active ? 600 : 400, whiteSpace: 'nowrap', flex: 1, textAlign: 'left' }}>{label}</span>
          {active && <ChevronRight size={13} style={{ opacity: 0.5 }} />}
        </>
      )}
    </button>
  );
}

export function Sidebar({ isOpen, currentView, onNavigate }: SidebarProps) {
  const { isAdmin } = useAuth();
  const MENU = isAdmin
    ? [...MENU_BASE, { view: 'usuarios', label: 'Usuarios', icon: UserCog }]
    : MENU_BASE;
  const w = isOpen ? '220px' : '60px';
  return (
    <aside style={{
      width: w, minWidth: w, background: '#0f172a',
      display: 'flex', flexDirection: 'column', height: '100vh',
      overflow: 'hidden', transition: 'width 0.22s ease, min-width 0.22s ease',
      borderRight: '1px solid rgba(255,255,255,0.05)',
    }}>
      {/* Logo */}
      <div style={{
        height: '60px', display: 'flex', alignItems: 'center',
        padding: isOpen ? '0 16px' : '0', justifyContent: isOpen ? 'flex-start' : 'center',
        gap: 10, flexShrink: 0, borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}>
        <img src={logoInderhuila} alt="INDERHUILA" style={{ width: 30, height: 30, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }} />
        {isOpen && (
          <div style={{ overflow: 'hidden', lineHeight: 1.25 }}>
            <p style={{ color: '#f1f5f9', fontSize: 13, fontWeight: 700, margin: 0, whiteSpace: 'nowrap', letterSpacing: '0.01em' }}>INDERHUILA</p>
            <p style={{ color: '#475569', fontSize: 10, margin: 0, whiteSpace: 'nowrap' }}>Sistema Médico</p>
          </div>
        )}
      </div>

      {/* Label */}
      {isOpen && (
        <p style={{ color: '#334155', fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', padding: '16px 16px 6px', margin: 0 }}>
          Menú principal
        </p>
      )}

      {/* Nav */}
      <nav style={{ flex: 1, overflowY: 'auto', padding: isOpen ? '0 8px' : '8px 0', overflowX: 'hidden' }}>
        {MENU.map(({ view, label, icon: Icon }) => (
          <NavItem
            key={view}
            icon={<Icon size={16} />}
            label={label}
            active={currentView === view || (view === 'dashboard' && !currentView)}
            isOpen={isOpen}
            onClick={() => onNavigate(view)}
          />
        ))}
      </nav>

      {/* Footer */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: isOpen ? '8px' : '8px 0' }}>
        <NavItem
          icon={<Settings size={16} />}
          label="Configuración"
          active={currentView === 'configuracion'}
          isOpen={isOpen}
          onClick={() => onNavigate('configuracion')}
        />
      </div>
    </aside>
  );
}

export default Sidebar;