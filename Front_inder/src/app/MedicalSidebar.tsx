import React from 'react';
import {
  LayoutDashboard,
  Users,
  FileText,
  Calendar,
  BarChart3,
  LogOut
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

  var sidebarClass = 'medical-sidebar';
  if (isOpen) {
    sidebarClass = sidebarClass + ' open';
  } else {
    sidebarClass = sidebarClass + ' closed';
  }

  return (
    <aside className={sidebarClass}>
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <img
            src="/src/assets/logo-inderhuila.png"
            alt="INDERHUILA"
            style={{ width: '60px', height: '60px', objectFit: 'contain' }}
          />
        </div>
        <div className="sidebar-title">
          <div className="org">INDERHUILA</div>
          <div className="name">Historia Clinica</div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.view;
          var itemClass = 'nav-item';
          if (isActive) {
            itemClass = itemClass + ' active';
          }
          return (
            <button
              key={item.view}
              onClick={() => onNavigate(item.view)}
              className={itemClass}
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <div className="user-avatar">U</div>
        <div className="user-info">
          <strong>Usuario</strong>
          <span>Admin</span>
        </div>
      </div>
      <button onClick={handleLogout} className="logout-btn">
        <LogOut size={18} />
        <span>Cerrar Sesion</span>
      </button>
    </aside>
  );
}