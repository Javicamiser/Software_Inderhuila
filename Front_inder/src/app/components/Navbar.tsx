'use client';

import { useState, Dispatch, SetStateAction } from 'react';
import {
  Menu,
  X,
  Users,
  Calendar,
  FileText,
  BarChart3,
  LogOut,
  Settings,
  Bell,
  ChevronDown,
  Home,
  Activity,
} from 'lucide-react';
import logo from '../../assets/logo-inderhuila.png';

interface NavbarProps {
  onNavigate: Dispatch<SetStateAction<string>>;
  currentView: string;
}

export default function Navbar({ onNavigate, currentView }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  const user = typeof window !== 'undefined' 
    ? JSON.parse(localStorage.getItem('user') || '{}')
    : {};

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    // Navegación simple en Vite/React:
    window.location.href = '/login';
  };

  const menuItems = [
    { label: 'Dashboard', view: 'inicio', icon: Home },
    { label: 'Deportistas', view: 'deportistas', icon: Users },
    { label: 'Historia Clínica', view: 'historia', icon: FileText },
    { label: 'Historias Guardadas', view: 'historias-clinicas', icon: FileText },
    { label: 'Citas', view: 'consultas', icon: Calendar },
    { label: 'Archivos', view: 'archivos', icon: Activity },
    { label: 'Reportes', view: 'reportes', icon: BarChart3 },
  ];

  const isActive = (view: string) => currentView === view;

  const notifications = [
    { id: 1, title: 'Nueva cita', description: 'Juan Pérez tiene cita hoy a las 14:30', time: 'Hace 2 horas', read: false },
    { id: 2, title: 'Archivo subido', description: 'María García subió su evaluación física', time: 'Hace 4 horas', read: false },
    { id: 3, title: 'Historia completada', description: 'Carlos López completó su historia clínica', time: 'Ayer', read: true },
  ];

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <img src={logo} alt="Inderhuila Logo" className="h-10 w-auto" />
          </div>

          {/* Menu Desktop */}
          <div className="hidden lg:flex items-center gap-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.view);

              return (
                <button
                  key={item.view}
                  onClick={() => onNavigate(item.view)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                    active
                      ? 'bg-blue-100 text-blue-600 font-semibold'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm">{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Acciones derechas */}
          <div className="flex items-center gap-4">
            {/* Notificaciones */}
            <div className="relative hidden sm:block">
              <button
                onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                className="relative p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 flex items-center justify-center w-5 h-5 bg-red-600 text-white text-xs rounded-full font-bold">
                    {unreadCount}
                  </span>
                )}
              </button>

              {isNotificationOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden">
                  <div className="p-4 border-b border-gray-200 bg-gray-50">
                    <h3 className="font-semibold text-gray-900">
                      Notificaciones
                    </h3>
                  </div>

                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-gray-500">
                        No hay notificaciones
                      </div>
                    ) : (
                      notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition ${
                            !notification.read ? 'bg-blue-50' : ''
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <p className="text-sm font-semibold text-gray-900">
                                {notification.title}
                              </p>
                              <p className="text-xs text-gray-600 mt-1">
                                {notification.description}
                              </p>
                            </div>
                            {!notification.read && (
                              <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-1"></div>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 mt-2">
                            {notification.time}
                          </p>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="p-3 border-t border-gray-200 text-center">
                    <button className="text-sm text-blue-600 hover:text-blue-700 font-semibold">
                      Ver todas las notificaciones
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition"
              >
                <div className="flex items-center justify-center w-8 h-8 bg-blue-600 rounded-full text-white font-semibold text-sm">
                  {user.nombre
                    ? user.nombre.charAt(0).toUpperCase()
                    : 'U'}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-semibold text-gray-900">
                    {user.nombre || 'Usuario'}
                  </p>
                  <p className="text-xs text-gray-500">Administrador</p>
                </div>
                <ChevronDown className="w-4 h-4 text-gray-600" />
              </button>

              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden">
                  <div className="p-4 border-b border-gray-200">
                    <p className="text-sm font-semibold text-gray-900">
                      {user.nombre || 'Usuario'}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {user.email || 'usuario@inderdb.com'}
                    </p>
                  </div>

                  <div className="p-2">
                    <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition">
                      <Settings className="w-4 h-4" />
                      Configuración
                    </button>

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition mt-1 font-semibold"
                    >
                      <LogOut className="w-4 h-4" />
                      Cerrar Sesión
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Menu Burger Mobile */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="lg:hidden p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
            >
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Menu Mobile */}
      {isOpen && (
        <div className="lg:hidden border-t border-gray-200 bg-white">
          <div className="px-4 py-4 space-y-2 max-h-96 overflow-y-auto">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.view);

              return (
                <button
                  key={item.view}
                  onClick={() => {
                    onNavigate(item.view);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center gap-2 px-4 py-3 rounded-lg transition-all text-left ${
                    active
                      ? 'bg-blue-100 text-blue-600 font-semibold'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </button>
              );
            })}

            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition mt-4 font-semibold border-t border-gray-200 pt-4"
            >
              <LogOut className="w-5 h-5" />
              Cerrar Sesión
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
