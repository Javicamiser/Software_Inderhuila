// ============================================================
// DASHBOARD LAYOUT
// ============================================================
import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

export function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate  = useNavigate();
  const location  = useLocation();

  const currentView = location.pathname.replace('/', '') || 'dashboard';

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: '#F5F7FA' }}>
      <Sidebar
        isOpen={sidebarOpen}
        currentView={currentView}
        onNavigate={(view: string) => navigate(`/${view}`)}
      />

      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden', minWidth: 0 }}>
        <Topbar
          onToggleSidebar={() => setSidebarOpen(o => !o)}
          sidebarOpen={sidebarOpen}
        />

        {/* Contenido principal */}
        <main style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
          <Outlet />
        </main>

        {/* Footer WAP Enterprise */}
        <footer style={{
          flexShrink: 0,
          borderTop: '1px solid #e2e8f0',
          background: '#ffffff',
          padding: '8px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <img
              src="/src/assets/logo_wap.jpeg"
              alt="WAP Enterprise"
              style={{ height: 22, width: 'auto', borderRadius: 4, opacity: 0.85 }}
            />
            <span style={{ fontSize: 11, color: '#94a3b8', fontWeight: 500 }}>
              Desarrollado por <span style={{ color: '#475569', fontWeight: 600 }}>WAP Enterprise SAS</span>
            </span>
          </div>
          <span style={{ fontSize: 11, color: '#94a3b8' }}>
            © {new Date().getFullYear()} WAP Enterprise SAS — Todos los derechos reservados
          </span>
        </footer>
      </div>
    </div>
  );
}

export default DashboardLayout;