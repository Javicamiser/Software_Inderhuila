import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import {
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';
import {
  Download,
  Users,
  Calendar,
  CheckCircle2,
} from 'lucide-react';
import { deportistasService, citasService } from '../services/apiClient';

interface ReporteData {
  totalDeportistas: number;
  totalCitas: number;
  totalHistorias: number;
  citasCompletadas: number;
  citasProgramadas: number;
  citasCanceladas: number;
}

interface ChartData {
  name: string;
  value: number;
  [key: string]: string | number;
}

const COLORES = ['#C84F3B', '#1F4788', '#B8C91A', '#6B7280', '#8B5CF6', '#EC4899'];

export function Reportes() {
  const [reporteData, setReporteData] = useState<ReporteData>({
    totalDeportistas: 0,
    totalCitas: 0,
    totalHistorias: 0,
    citasCompletadas: 0,
    citasProgramadas: 0,
    citasCanceladas: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [citasPorMes, setCitasPorMes] = useState<ChartData[]>([]);
  const [deportistasPorDeporte, setDeportistasPorDeporte] = useState<ChartData[]>([]);

  useEffect(() => {
    cargarReportes();
  }, []);

  const cargarReportes = async () => {
    try {
      setIsLoading(true);

      // Cargar deportistas
      const deportistasResponse = await deportistasService.getAll(1, 1000);
      const deportistas = Array.isArray(deportistasResponse)
        ? deportistasResponse
        : deportistasResponse.items || [];

      // Cargar citas
      const citasResponse = await citasService.getAll(1, 1000);
      const citas = Array.isArray(citasResponse) ? citasResponse : citasResponse.items || [];

      // Calcular estadísticas
      const totalDeportistas = deportistas.length;
      const totalCitas = citas.length;

      // Agrupar citas por estado
      const citasCompletadas = citas.filter(
        (c: any) => c.estado_cita_id?.includes('realizada') || c.estado?.nombre?.includes('Realizada')
      ).length;
      const citasProgramadas = citas.filter(
        (c: any) => c.estado_cita_id?.includes('programada') || c.estado?.nombre?.includes('Programada')
      ).length;
      const citasCanceladas = citas.filter(
        (c: any) => c.estado_cita_id?.includes('cancelada') || c.estado?.nombre?.includes('Cancelada')
      ).length;

      // Agrupar por deporte (simulado)
      const deporteMap = new Map<string, number>();
      deportistas.forEach((d: any) => {
        const deporte = d.tipo_deporte || d.deporte || 'Sin asignar';
        deporteMap.set(deporte, (deporteMap.get(deporte) || 0) + 1);
      });

      const deportistasPorDeporteData = Array.from(deporteMap, ([name, value]) => ({
        name,
        value,
      }));

      // Agrupar citas por mes
      const mesMap = new Map<string, number>();
      const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

      citas.forEach((c: any) => {
        try {
          const fecha = new Date(`${c.fecha}T${c.hora}`);
          const mes = meses[fecha.getMonth()];
          mesMap.set(mes, (mesMap.get(mes) || 0) + 1);
        } catch {
          // Ignorar citas con fecha inválida
        }
      });

      const citasPorMesData = meses.map((mes) => ({
        name: mes,
        value: mesMap.get(mes) || 0,
      }));

      setReporteData({
        totalDeportistas,
        totalCitas,
        totalHistorias: deportistas.length, // Asumiendo que cada deportista tiene historia
        citasCompletadas,
        citasProgramadas,
        citasCanceladas,
      });

      setCitasPorMes(citasPorMesData);
      setDeportistasPorDeporte(deportistasPorDeporteData);
    } catch (error) {
      console.error('Error cargando reportes:', error);
      toast.error('Error al cargar los reportes');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportar = () => {
    const contenido = `
REPORTE DE ESTADÍSTICAS - INDER
================================
Fecha de generación: ${new Date().toLocaleDateString('es-ES')}

RESUMEN GENERAL
===============
Total de Deportistas: ${reporteData.totalDeportistas}
Total de Citas: ${reporteData.totalCitas}
Total de Historias Clínicas: ${reporteData.totalHistorias}

ESTADO DE CITAS
===============
Citas Completadas: ${reporteData.citasCompletadas}
Citas Programadas: ${reporteData.citasProgramadas}
Citas Canceladas: ${reporteData.citasCanceladas}

PORCENTAJES
===========
Tasa de Completitud: ${reporteData.totalCitas > 0 ? ((reporteData.citasCompletadas / reporteData.totalCitas) * 100).toFixed(1) : 0}%
Tasa de Cancelación: ${reporteData.totalCitas > 0 ? ((reporteData.citasCanceladas / reporteData.totalCitas) * 100).toFixed(1) : 0}%
    `;

    const blob = new Blob([contenido], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `reporte_inder_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    toast.success('Reporte exportado correctamente');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Generando reportes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-blue-600">Reportes y Análisis</h1>
            <p className="text-gray-600 mt-1">Estadísticas y métricas del sistema INDER</p>
          </div>
          <button
            onClick={handleExportar}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
          >
            <Download className="w-5 h-5" />
            Exportar Reporte
          </button>
        </div>

        {/* Tarjetas de Resumen */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Deportistas */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total de Deportistas</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {reporteData.totalDeportistas}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users className="w-8 h-8 text-blue-600" />
              </div>
            </div>
          </div>

          {/* Citas */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total de Citas</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {reporteData.totalCitas}
                </p>
              </div>
              <div className="p-3 bg-red-100 rounded-lg">
                <Calendar className="w-8 h-8 text-red-600" />
              </div>
            </div>
          </div>

          {/* Historias */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Historias Clínicas</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {reporteData.totalHistorias}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Estado de Citas */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Citas Completadas</h3>
            <p className="text-4xl font-bold text-green-600">{reporteData.citasCompletadas}</p>
            <p className="text-sm text-gray-600 mt-2">
              {reporteData.totalCitas > 0
                ? ((reporteData.citasCompletadas / reporteData.totalCitas) * 100).toFixed(1)
                : 0}
              % del total
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Citas Programadas</h3>
            <p className="text-4xl font-bold text-blue-600">{reporteData.citasProgramadas}</p>
            <p className="text-sm text-gray-600 mt-2">
              {reporteData.totalCitas > 0
                ? ((reporteData.citasProgramadas / reporteData.totalCitas) * 100).toFixed(1)
                : 0}
              % del total
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Citas Canceladas</h3>
            <p className="text-4xl font-bold text-red-600">{reporteData.citasCanceladas}</p>
            <p className="text-sm text-gray-600 mt-2">
              {reporteData.totalCitas > 0
                ? ((reporteData.citasCanceladas / reporteData.totalCitas) * 100).toFixed(1)
                : 0}
              % del total
            </p>
          </div>
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Citas por Mes */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Citas por Mes</h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={citasPorMes}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#C84F3B" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#C84F3B" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#C84F3B"
                  fillOpacity={1}
                  fill="url(#colorValue)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Deportistas por Deporte */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Deportistas por Deporte</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={deportistasPorDeporte}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {deportistasPorDeporte.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORES[index % COLORES.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Tabla de Resumen Detallado */}
        <div className="bg-white rounded-lg shadow p-6 mt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumen Detallado</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Métrica
                  </th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">
                    Valor
                  </th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">
                    Porcentaje
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-6 py-3 text-sm text-gray-600">Deportistas Activos</td>
                  <td className="px-6 py-3 text-right text-sm font-semibold text-gray-900">
                    {reporteData.totalDeportistas}
                  </td>
                  <td className="px-6 py-3 text-right text-sm text-gray-600">100%</td>
                </tr>
                <tr className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-6 py-3 text-sm text-gray-600">Historias Registradas</td>
                  <td className="px-6 py-3 text-right text-sm font-semibold text-gray-900">
                    {reporteData.totalHistorias}
                  </td>
                  <td className="px-6 py-3 text-right text-sm text-gray-600">
                    {reporteData.totalDeportistas > 0
                      ? ((reporteData.totalHistorias / reporteData.totalDeportistas) * 100).toFixed(1)
                      : 0}
                    %
                  </td>
                </tr>
                <tr className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-6 py-3 text-sm text-gray-600">Citas Completadas</td>
                  <td className="px-6 py-3 text-right text-sm font-semibold text-green-600">
                    {reporteData.citasCompletadas}
                  </td>
                  <td className="px-6 py-3 text-right text-sm text-green-600 font-semibold">
                    {reporteData.totalCitas > 0
                      ? ((reporteData.citasCompletadas / reporteData.totalCitas) * 100).toFixed(1)
                      : 0}
                    %
                  </td>
                </tr>
                <tr className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-6 py-3 text-sm text-gray-600">Citas Programadas</td>
                  <td className="px-6 py-3 text-right text-sm font-semibold text-blue-600">
                    {reporteData.citasProgramadas}
                  </td>
                  <td className="px-6 py-3 text-right text-sm text-blue-600 font-semibold">
                    {reporteData.totalCitas > 0
                      ? ((reporteData.citasProgramadas / reporteData.totalCitas) * 100).toFixed(1)
                      : 0}
                    %
                  </td>
                </tr>
                <tr className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-6 py-3 text-sm text-gray-600">Citas Canceladas</td>
                  <td className="px-6 py-3 text-right text-sm font-semibold text-red-600">
                    {reporteData.citasCanceladas}
                  </td>
                  <td className="px-6 py-3 text-right text-sm text-red-600 font-semibold">
                    {reporteData.totalCitas > 0
                      ? ((reporteData.citasCanceladas / reporteData.totalCitas) * 100).toFixed(1)
                      : 0}
                    %
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
