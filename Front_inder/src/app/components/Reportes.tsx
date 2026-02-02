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
  BarChart,
  Bar,
  Legend,
  LineChart,
  Line,
} from 'recharts';
import {
  Download,
  Users,
  Calendar,
  CheckCircle2,
  TrendingUp,
  Activity,
  Filter,
  RefreshCw,
  FileText,
  Share2,
  BarChart3,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon,
  Clock,
  X,
  Check,
  AlertCircle,
  Zap,
  Target,
  Award,
} from 'lucide-react';
import { deportistasService, citasService } from '../services/apiClient';

interface ReporteData {
  totalDeportistas: number;
  totalCitas: number;
  totalHistorias: number;
  citasCompletadas: number;
  citasProgramadas: number;
  citasCanceladas: number;
  tasaCompletitud: number;
  tasaCancelacion: number;
}

interface ChartData {
  name: string;
  value: number;
  [key: string]: string | number;
}

const COLORES = ['#0369A1', '#06B6D4', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6'];

export function Reportes() {
  const [reporteData, setReporteData] = useState<ReporteData>({
    totalDeportistas: 0,
    totalCitas: 0,
    totalHistorias: 0,
    citasCompletadas: 0,
    citasProgramadas: 0,
    citasCanceladas: 0,
    tasaCompletitud: 0,
    tasaCancelacion: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [citasPorMes, setCitasPorMes] = useState<ChartData[]>([]);
  const [deportistasPorDeporte, setDeportistasPorDeporte] = useState<ChartData[]>([]);
  const [estadoCitasData, setEstadoCitasData] = useState<ChartData[]>([]);
  const [filtroMes, setFiltroMes] = useState<number>(new Date().getMonth());
  const [filtroAno, setFiltroAno] = useState<number>(new Date().getFullYear());

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

      const tasaCompletitud = totalCitas > 0 ? (citasCompletadas / totalCitas) * 100 : 0;
      const tasaCancelacion = totalCitas > 0 ? (citasCanceladas / totalCitas) * 100 : 0;

      // Datos de estado de citas para gráfico de barras
      setEstadoCitasData([
        { name: 'Completadas', value: citasCompletadas },
        { name: 'Programadas', value: citasProgramadas },
        { name: 'Canceladas', value: citasCanceladas },
      ]);

      // Agrupar por deporte
      const deporteMap = new Map<string, number>();
      deportistas.forEach((d: any) => {
        const deporte = d.tipo_deporte || d.deporte || 'Sin asignar';
        deporteMap.set(deporte, (deporteMap.get(deporte) || 0) + 1);
      });

      const deportistasPorDeporteData = Array.from(deporteMap, ([name, value]) => ({
        name,
        value,
      })).sort((a, b) => b.value - a.value);

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
        totalHistorias: deportistas.length,
        citasCompletadas,
        citasProgramadas,
        citasCanceladas,
        tasaCompletitud: parseFloat(tasaCompletitud.toFixed(1)),
        tasaCancelacion: parseFloat(tasaCancelacion.toFixed(1)),
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

  const handleExportarPDF = () => {
    const contenido = `
╔════════════════════════════════════════════════════════════════╗
║         REPORTE COMPLETO DE ESTADÍSTICAS - INDER               ║
╚════════════════════════════════════════════════════════════════╝

Fecha de generación: ${new Date().toLocaleDateString('es-ES')}
Hora: ${new Date().toLocaleTimeString('es-ES')}

═══════════════════════════════════════════════════════════════════
RESUMEN EJECUTIVO
═══════════════════════════════════════════════════════════════════

Total de Deportistas:           ${reporteData.totalDeportistas}
Total de Citas:                 ${reporteData.totalCitas}
Total de Historias Clínicas:    ${reporteData.totalHistorias}

═══════════════════════════════════════════════════════════════════
ESTADO DE CITAS
═══════════════════════════════════════════════════════════════════

Citas Completadas:              ${reporteData.citasCompletadas}  (${reporteData.tasaCompletitud}%)
Citas Programadas:              ${reporteData.citasProgramadas}
Citas Canceladas:               ${reporteData.citasCanceladas}  (${reporteData.tasaCancelacion}%)

═══════════════════════════════════════════════════════════════════
INDICADORES CLAVE
═══════════════════════════════════════════════════════════════════

Tasa de Completitud:            ${reporteData.tasaCompletitud}%
Tasa de Cancelación:            ${reporteData.tasaCancelacion}%
Ratio Deportistas/Citas:        ${(reporteData.totalCitas / (reporteData.totalDeportistas || 1)).toFixed(2)}

═══════════════════════════════════════════════════════════════════

Reporte generado automáticamente por el sistema INDER
    `;

    const blob = new Blob([contenido], { type: 'text/plain;charset=utf-8' });
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

  const handleExportarCSV = () => {
    let csv = 'Métrica,Valor,Porcentaje\n';
    csv += `Deportistas Activos,${reporteData.totalDeportistas},100%\n`;
    csv += `Historias Registradas,${reporteData.totalHistorias},${((reporteData.totalHistorias / (reporteData.totalDeportistas || 1)) * 100).toFixed(1)}%\n`;
    csv += `Citas Completadas,${reporteData.citasCompletadas},${reporteData.tasaCompletitud}%\n`;
    csv += `Citas Programadas,${reporteData.citasProgramadas},${(((reporteData.citasProgramadas) / (reporteData.totalCitas || 1)) * 100).toFixed(1)}%\n`;
    csv += `Citas Canceladas,${reporteData.citasCanceladas},${reporteData.tasaCancelacion}%\n`;

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `reporte_inder_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    toast.success('Reporte CSV exportado correctamente');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-blue-50 to-cyan-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-700 font-semibold text-lg">Generando reportes...</p>
          <p className="text-gray-500 text-sm mt-2">Por favor espera mientras se cargan los datos</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-cyan-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Mejorado */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-4xl font-bold text-gray-900">Reportes y Análisis</h1>
              </div>
              <p className="text-gray-600 ml-16">Estadísticas en tiempo real del sistema INDER</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={cargarReportes}
                className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-gray-200 text-gray-700 rounded-lg hover:border-blue-500 hover:text-blue-600 transition font-semibold"
                title="Actualizar datos"
              >
                <RefreshCw className="w-5 h-5" />
                Actualizar
              </button>
              <button
                onClick={handleExportarCSV}
                className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition font-semibold"
              >
                <FileText className="w-5 h-5" />
                CSV
              </button>
              <button
                onClick={handleExportarPDF}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:shadow-lg transition font-semibold"
              >
                <Download className="w-5 h-5" />
                Exportar
              </button>
            </div>
          </div>
        </div>

        {/* KPI Cards Mejoradas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Deportistas */}
          <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition p-6 border-l-4 border-blue-600">
            <div className="flex items-center justify-between mb-4">
              <p className="text-gray-600 text-sm font-semibold">Total de Deportistas</p>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <p className="text-4xl font-bold text-gray-900">{reporteData.totalDeportistas}</p>
            <p className="text-xs text-gray-500 mt-2">Atletas registrados en el sistema</p>
          </div>

          {/* Citas */}
          <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition p-6 border-l-4 border-cyan-600">
            <div className="flex items-center justify-between mb-4">
              <p className="text-gray-600 text-sm font-semibold">Total de Citas</p>
              <div className="p-3 bg-cyan-100 rounded-lg">
                <Calendar className="w-6 h-6 text-cyan-600" />
              </div>
            </div>
            <p className="text-4xl font-bold text-gray-900">{reporteData.totalCitas}</p>
            <p className="text-xs text-gray-500 mt-2">Citas agendadas</p>
          </div>

          {/* Historias */}
          <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition p-6 border-l-4 border-green-600">
            <div className="flex items-center justify-between mb-4">
              <p className="text-gray-600 text-sm font-semibold">Historias Clínicas</p>
              <div className="p-3 bg-green-100 rounded-lg">
                <Activity className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <p className="text-4xl font-bold text-gray-900">{reporteData.totalHistorias}</p>
            <p className="text-xs text-gray-500 mt-2">Registros médicos completados</p>
          </div>

          {/* Tasa de Completitud */}
          <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition p-6 border-l-4 border-emerald-600">
            <div className="flex items-center justify-between mb-4">
              <p className="text-gray-600 text-sm font-semibold">Tasa Completitud</p>
              <div className="p-3 bg-emerald-100 rounded-lg">
                <CheckCircle2 className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
            <p className="text-4xl font-bold text-emerald-600">{reporteData.tasaCompletitud}%</p>
            <p className="text-xs text-gray-500 mt-2">Citas completadas exitosamente</p>
          </div>
        </div>

        {/* Estado de Citas - Cards Detalladas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Completadas */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl shadow-lg p-6 border border-green-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Citas Completadas</h3>
              <span className="px-3 py-1 bg-green-200 text-green-800 rounded-full text-xs font-bold">
                {reporteData.tasaCompletitud}%
              </span>
            </div>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <Check className="w-8 h-8 text-green-600" />
              </div>
              <p className="text-5xl font-bold text-green-600">{reporteData.citasCompletadas}</p>
            </div>
            <div className="w-full bg-green-200 rounded-full h-2 mt-4 mb-3">
              <div
                className="bg-green-600 h-2 rounded-full transition-all"
                style={{ width: `${reporteData.tasaCompletitud}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-600">Procedimientos realizados con éxito</p>
          </div>

          {/* Programadas */}
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl shadow-lg p-6 border border-blue-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Citas Programadas</h3>
              <span className="px-3 py-1 bg-blue-200 text-blue-800 rounded-full text-xs font-bold">
                {((reporteData.citasProgramadas / (reporteData.totalCitas || 1)) * 100).toFixed(1)}%
              </span>
            </div>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Clock className="w-8 h-8 text-blue-600" />
              </div>
              <p className="text-5xl font-bold text-blue-600">{reporteData.citasProgramadas}</p>
            </div>
            <div className="w-full bg-blue-200 rounded-full h-2 mt-4 mb-3">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all"
                style={{ width: `${(reporteData.citasProgramadas / (reporteData.totalCitas || 1)) * 100}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-600">Pendientes de realizarse</p>
          </div>

          {/* Canceladas */}
          <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-xl shadow-lg p-6 border border-red-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Citas Canceladas</h3>
              <span className="px-3 py-1 bg-red-200 text-red-800 rounded-full text-xs font-bold">
                {reporteData.tasaCancelacion}%
              </span>
            </div>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-red-100 rounded-lg">
                <X className="w-8 h-8 text-red-600" />
              </div>
              <p className="text-5xl font-bold text-red-600">{reporteData.citasCanceladas}</p>
            </div>
            <div className="w-full bg-red-200 rounded-full h-2 mt-4 mb-3">
              <div
                className="bg-red-600 h-2 rounded-full transition-all"
                style={{ width: `${reporteData.tasaCancelacion}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-600">Citas no realizadas</p>
          </div>
        </div>

        {/* Gráficos Principales */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Gráfico de Barras - Estado de Citas */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-2 mb-6">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-bold text-gray-900">Estado de Citas (Comparativo)</h3>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={estadoCitasData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                  }}
                />
                <Bar dataKey="value" fill="#0369A1" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Gráfico de Pastel - Deportistas por Deporte */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-2 mb-6">
              <PieChartIcon className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-bold text-gray-900">Distribución por Disciplina</h3>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={deportistasPorDeporte}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={90}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {deportistasPorDeporte.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORES[index % COLORES.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráfico de Línea - Citas por Mes */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-center gap-2 mb-6">
            <LineChartIcon className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-bold text-gray-900">Citas por Mes (Tendencia)</h3>
          </div>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={citasPorMes}>
              <defs>
                <linearGradient id="colorCitas" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0369A1" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#0369A1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#0369A1"
                strokeWidth={3}
                dot={{ fill: '#0369A1', r: 6 }}
                activeDot={{ r: 8 }}
                name="Citas"
                isAnimationActive={true}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Tabla Detallada Mejorada */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900">Resumen Detallado</h3>
            <button
              onClick={cargarReportes}
              className="text-blue-600 hover:text-blue-700 text-sm font-semibold flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Actualizar
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white">
                  <th className="px-6 py-4 text-left text-sm font-semibold">Métrica</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold">Valor</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold">Porcentaje</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr className="hover:bg-blue-50 transition">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">Deportistas Activos</td>
                  <td className="px-6 py-4 text-right text-sm font-bold text-gray-900">
                    {reporteData.totalDeportistas}
                  </td>
                  <td className="px-6 py-4 text-right text-sm text-gray-600">100%</td>
                  <td className="px-6 py-4 text-center">
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-bold flex items-center gap-1 justify-center">
                      <Check className="w-3 h-3" />
                      Activo
                    </span>
                  </td>
                </tr>
                <tr className="hover:bg-green-50 transition">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">Historias Registradas</td>
                  <td className="px-6 py-4 text-right text-sm font-bold text-gray-900">
                    {reporteData.totalHistorias}
                  </td>
                  <td className="px-6 py-4 text-right text-sm text-gray-600">
                    {reporteData.totalDeportistas > 0
                      ? ((reporteData.totalHistorias / reporteData.totalDeportistas) * 100).toFixed(1)
                      : 0}
                    %
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-bold flex items-center gap-1 justify-center">
                      <Check className="w-3 h-3" />
                      Completo
                    </span>
                  </td>
                </tr>
                <tr className="hover:bg-green-50 transition">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">Citas Completadas</td>
                  <td className="px-6 py-4 text-right text-sm font-bold text-green-600">
                    {reporteData.citasCompletadas}
                  </td>
                  <td className="px-6 py-4 text-right text-sm text-green-600 font-bold">
                    {reporteData.tasaCompletitud}%
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-bold flex items-center gap-1 justify-center">
                      <Check className="w-3 h-3" />
                      Éxito
                    </span>
                  </td>
                </tr>
                <tr className="hover:bg-blue-50 transition">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">Citas Programadas</td>
                  <td className="px-6 py-4 text-right text-sm font-bold text-blue-600">
                    {reporteData.citasProgramadas}
                  </td>
                  <td className="px-6 py-4 text-right text-sm text-blue-600 font-bold">
                    {reporteData.totalCitas > 0
                      ? ((reporteData.citasProgramadas / reporteData.totalCitas) * 100).toFixed(1)
                      : 0}
                    %
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-bold flex items-center gap-1 justify-center">
                      <Clock className="w-3 h-3" />
                      Pendiente
                    </span>
                  </td>
                </tr>
                <tr className="hover:bg-red-50 transition">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">Citas Canceladas</td>
                  <td className="px-6 py-4 text-right text-sm font-bold text-red-600">
                    {reporteData.citasCanceladas}
                  </td>
                  <td className="px-6 py-4 text-right text-sm text-red-600 font-bold">
                    {reporteData.tasaCancelacion}%
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-bold flex items-center gap-1 justify-center">
                      <X className="w-3 h-3" />
                      Cancelado
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-gray-500 text-sm">
          <p>Reportes generados automáticamente por el sistema INDER</p>
          <p>Última actualización: {new Date().toLocaleDateString('es-ES')} a las {new Date().toLocaleTimeString('es-ES')}</p>
        </div>
      </div>
    </div>
  );
}

export default Reportes;