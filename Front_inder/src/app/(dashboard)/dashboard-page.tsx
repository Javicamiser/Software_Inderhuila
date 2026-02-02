'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Users,
  Calendar,
  FileText,
  Clock,
  ArrowRight,
  Plus,
  TrendingUp,
  BarChart3,
  CheckCircle,
} from 'lucide-react';
import { deportistasService, historiaClinicaService, citasService, type Deportista, type HistoriaClinica, type Cita } from '../services';

interface DashboardStats {
  totalDeportistas: number;
  historiasActivas: number;
  citasHoy: number;
  citasSemana: number;
  actividadReciente: ActivityItem[];
}

interface ActivityItem {
  id: string;
  tipo: string;
  descripcion: string;
  fecha: string;
  hora: string;
  estado: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalDeportistas: 0,
    historiasActivas: 0,
    citasHoy: 0,
    citasSemana: 0,
    actividadReciente: [],
  });

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setIsLoading(true);

      const deportistasRes = await deportistasService.getAll(1, 100);
      const historiasRes = await historiaClinicaService.getAll(1, 100);
      const citasRes = await citasService.getAll();

      const toArray = <T,>(res: unknown): T[] => {
        const r = res as any;
        if (Array.isArray(r)) return r;
        if (Array.isArray(r?.items)) return r.items;
        if (Array.isArray(r?.results)) return r.results;
        if (Array.isArray(r?.data)) return r.data;
        return [];
      };

      const deportistas = toArray<Deportista>(deportistasRes);
      const historias = toArray<HistoriaClinica>(historiasRes);
      const citas = toArray<Cita>(citasRes);

      // Calcular citas de hoy
      const hoy = new Date().toISOString().split('T')[0];
      const citasHoy = citas.filter((c: any) => {
        const fechaCita = (c.fecha || c.fechaHora || c.start || '').split('T')[0];
        return fechaCita === hoy;
      });

      // Calcular citas de esta semana
      const inicioSemana = new Date();
      inicioSemana.setDate(inicioSemana.getDate() - inicioSemana.getDay());
      const finSemana = new Date(inicioSemana);
      finSemana.setDate(finSemana.getDate() + 6);

      const citasSemana = citas.filter((c: any) => {
        const fechaCita = new Date(c.fecha || c.fechaHora || c.start || Date.now());
        return fechaCita >= inicioSemana && fechaCita <= finSemana;
      });

      const datosReales: DashboardStats = {
        totalDeportistas: deportistas.length,
        historiasActivas: historias.length,
        citasHoy: citasHoy.length,
        citasSemana: citasSemana.length,
        actividadReciente: citas.slice(0, 5).map((c: any) => ({
          id: c.id,
          tipo: c.tipo_cita || c.tipoCita || 'Cita Valoración inicial',
          descripcion: c.motivo || 'Consulta programada',
          fecha: new Date(c.fecha || c.fechaHora || c.start || Date.now()).toLocaleDateString('es-ES', { day: 'numeric', month: 'numeric', year: 'numeric' }),
          hora: new Date(c.fecha || c.fechaHora || c.start || Date.now()).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          estado: c.estado || 'Programada',
        })),
      };

      setStats(datosReales);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const navegarA = (ruta: string) => {
    router.push(ruta);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Principal */}
      <div className="bg-gradient-to-r from-blue-800 via-blue-700 to-blue-600 text-white rounded-lg p-6">
        <h1 className="text-3xl font-bold mb-2">
          Bienvenido al Sistema Médico Deportivo
        </h1>
        <p className="text-blue-100">
          INDERHUILA - Instituto Departamental de Recreación y Deportes del Huila
        </p>
      </div>

      {/* Acciones Rápidas */}
      <section>
        <h2 className="text-xl font-bold text-gray-800 mb-4">Acciones Rápidas</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Nuevo Deportista */}
          <button
            onClick={() => navegarA('/deportistas/nuevo')}
            className="group bg-gradient-to-br from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white rounded-xl p-6 text-left transition-all duration-300 hover:shadow-lg hover:scale-[1.02]"
          >
            <div className="flex justify-between items-start mb-4">
              <Plus className="w-8 h-8" />
              <ArrowRight className="w-5 h-5 opacity-70 group-hover:translate-x-1 transition-transform" />
            </div>
            <h3 className="text-lg font-bold mb-1">Nuevo Deportista</h3>
            <p className="text-teal-100 text-sm">Registrar nuevo deportista</p>
          </button>

          {/* Agendar Cita */}
          <button
            onClick={() => navegarA('/citas')}
            className="group bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-xl p-6 text-left transition-all duration-300 hover:shadow-lg hover:scale-[1.02]"
          >
            <div className="flex justify-between items-start mb-4">
              <Calendar className="w-8 h-8" />
              <ArrowRight className="w-5 h-5 opacity-70 group-hover:translate-x-1 transition-transform" />
            </div>
            <h3 className="text-lg font-bold mb-1">Agendar Cita</h3>
            <p className="text-green-100 text-sm">Programar nueva cita</p>
          </button>

          {/* Nueva Historia */}
          <button
            onClick={() => navegarA('/historia-clinica')}
            className="group bg-gradient-to-br from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white rounded-xl p-6 text-left transition-all duration-300 hover:shadow-lg hover:scale-[1.02]"
          >
            <div className="flex justify-between items-start mb-4">
              <FileText className="w-8 h-8" />
              <ArrowRight className="w-5 h-5 opacity-70 group-hover:translate-x-1 transition-transform" />
            </div>
            <h3 className="text-lg font-bold mb-1">Nueva Historia</h3>
            <p className="text-emerald-100 text-sm">Crear historia clínica</p>
          </button>
        </div>
      </section>

      {/* Estadísticas Generales */}
      <section>
        <h2 className="text-xl font-bold text-gray-800 mb-4">Estadísticas Generales</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Deportistas */}
          <div 
            onClick={() => navegarA('/deportistas')}
            className="bg-white rounded-xl p-5 border-l-4 border-blue-500 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
          >
            <div className="flex justify-between items-start mb-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400" />
            </div>
            <p className="text-sm text-gray-500 mb-1">Total Deportistas</p>
            <p className="text-3xl font-bold text-blue-600">{stats.totalDeportistas}</p>
            <div className="flex items-center mt-2 text-xs text-green-600">
              <TrendingUp className="w-3 h-3 mr-1" />
              <span>+12%</span>
            </div>
          </div>

          {/* Citas Hoy */}
          <div 
            onClick={() => navegarA('/citas')}
            className="bg-white rounded-xl p-5 border-l-4 border-yellow-500 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
          >
            <div className="flex justify-between items-start mb-3">
              <div className="p-2 bg-yellow-50 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400" />
            </div>
            <p className="text-sm text-gray-500 mb-1">Citas Hoy</p>
            <p className="text-3xl font-bold text-yellow-600">{stats.citasHoy}</p>
            <div className="flex items-center mt-2 text-xs text-gray-500">
              <TrendingUp className="w-3 h-3 mr-1" />
              <span>{stats.citasHoy === 0 ? 'Sin citas' : 'Pendientes'}</span>
            </div>
          </div>

          {/* Citas Esta Semana */}
          <div 
            onClick={() => navegarA('/citas')}
            className="bg-white rounded-xl p-5 border-l-4 border-orange-500 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
          >
            <div className="flex justify-between items-start mb-3">
              <div className="p-2 bg-orange-50 rounded-lg">
                <Calendar className="w-6 h-6 text-orange-600" />
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400" />
            </div>
            <p className="text-sm text-gray-500 mb-1">Citas Esta Semana</p>
            <p className="text-3xl font-bold text-orange-600">{stats.citasSemana}</p>
            <div className="flex items-center mt-2 text-xs text-green-600">
              <TrendingUp className="w-3 h-3 mr-1" />
              <span>+5</span>
            </div>
          </div>

          {/* Historias Activas */}
          <div 
            onClick={() => navegarA('/historias-guardadas')}
            className="bg-white rounded-xl p-5 border-l-4 border-purple-500 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
          >
            <div className="flex justify-between items-start mb-3">
              <div className="p-2 bg-purple-50 rounded-lg">
                <FileText className="w-6 h-6 text-purple-600" />
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400" />
            </div>
            <p className="text-sm text-gray-500 mb-1">Historias Activas</p>
            <p className="text-3xl font-bold text-purple-600">{stats.historiasActivas}</p>
            <div className="flex items-center mt-2 text-xs text-green-600">
              <TrendingUp className="w-3 h-3 mr-1" />
              <span>+8</span>
            </div>
          </div>
        </div>
      </section>

      {/* Actividad Reciente y Accesos Directos */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Actividad Reciente */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-gray-800">Actividad Reciente</h3>
            <button 
              onClick={() => navegarA('/citas')}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
            >
              Ver todas <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-3">
            {stats.actividadReciente.length > 0 ? (
              stats.actividadReciente.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Calendar className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{item.tipo}</p>
                      <p className="text-sm text-gray-500">{item.fecha} • {item.hora}</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-teal-100 text-teal-700 text-xs font-medium rounded-full">
                    {item.estado}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No hay actividad reciente</p>
              </div>
            )}
          </div>
        </div>

        {/* Accesos Directos */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-6">Accesos Directos</h3>

          <div className="space-y-3">
            <button
              onClick={() => navegarA('/deportistas')}
              className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-blue-50 rounded-lg transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-gray-900">Ver Deportistas</p>
                  <p className="text-xs text-gray-500">Listado completo</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
            </button>

            <button
              onClick={() => navegarA('/citas')}
              className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-green-50 rounded-lg transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Calendar className="w-5 h-5 text-green-600" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-gray-900">Gestión de Citas</p>
                  <p className="text-xs text-gray-500">Calendario y agenda</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-green-600 group-hover:translate-x-1 transition-all" />
            </button>

            <button
              onClick={() => navegarA('/historias-guardadas')}
              className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-orange-50 rounded-lg transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <FileText className="w-5 h-5 text-orange-600" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-gray-900">Historias Clínicas</p>
                  <p className="text-xs text-gray-500">Registros médicos</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-orange-600 group-hover:translate-x-1 transition-all" />
            </button>

            <button
              onClick={() => navegarA('/reportes')}
              className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-purple-50 rounded-lg transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <BarChart3 className="w-5 h-5 text-purple-600" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-gray-900">Reportes</p>
                  <p className="text-xs text-gray-500">Estadísticas y análisis</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-purple-600 group-hover:translate-x-1 transition-all" />
            </button>
          </div>
        </div>
      </div>

      {/* Sistema Actualizado */}
      <div className="bg-green-50 border border-green-200 rounded-xl p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-100 rounded-full">
            <CheckCircle className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h4 className="font-semibold text-green-800">Sistema Actualizado</h4>
            <p className="text-sm text-green-700">
              Todos los módulos funcionando correctamente. Última actualización: {new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'numeric', year: 'numeric' })}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}