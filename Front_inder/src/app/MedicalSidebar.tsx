import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  Calendar, 
  BarChart3,
  LogOut,
  Stethoscope,
  X
} from 'lucide-react';
import '../styles/medical-sidebar.css';

interface MedicalSidebarProps {
  isOpen: boolean;
  onNavigate: (view: string) => void;
  currentView: string;
}

export default function MedicalSidebar({
  isOpen,
  onNavigate,
  currentView,
}: MedicalSidebarProps) {
  const navItems = [
    { label: 'Dashboard', view: 'inicio', icon: LayoutDashboard },
    { label: 'Deportistas', view: 'deportistas', icon: Users },
    { label: 'Historias', view: 'historias-clinicas', icon: FileText },
    { label: 'Citas', view: 'consultas', icon: Calendar },
    { label: 'Reportes', view: 'reportes', icon: BarChart3 },
  ];

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  return (
    <>

      <aside className={`medical-sidebar ${isOpen ? 'open' : 'closed'}`}>
        {/* Header */}
        <div className="sidebar-header">
            <div className="sidebar-logo">
                <img src="/src/assets/logo-inderhuila.png" alt="INDERHUILA" style={{width: '60px', height: '60px', objectFit: 'contain'}} />
            </div>
          <div className="sidebar-title">
            <div className="org">INDERHUILA</div>
            <div className="name">Historia Clínica</div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.view;

            return (
              <button
                key={item.view}
                onClick={() => onNavigate(item.view)}
                className={`nav-item ${isActive ? 'active' : ''}`}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="sidebar-footer">
          <div className="user-avatar">U</div>
          <div className="user-info">
            <strong>Usuario</strong>
            <span>Admin</span>
          </div>
        </div>

        <button onClick={handleLogout} className="logout-btn">
          <LogOut size={18} />
          <span>Cerrar Sesión</span>
        </button>
      </aside>
    </>
  );
}