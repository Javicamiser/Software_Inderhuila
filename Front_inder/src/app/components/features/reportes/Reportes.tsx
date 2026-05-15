// features/reportes/Reportes.tsx

import { Users, Calendar, FileText, AlertTriangle, UserX } from 'lucide-react';
import { useReportes, labelMes } from './useReportes';
import { KpiCard } from './components/KpiCard';
import { GraficaCitasMes } from './components/GraficaCitasMes';
import { GraficaDisciplinas } from './components/GraficaDisciplinas';
import { GraficaDiagnosticos } from './components/GraficaDiagnosticos';
import { TablaMedicos } from './components/TablaMedicos';
import { TablaNoAptos } from './components/TablaNoAptos';
import { AccionesExportar } from './components/AccionesExportar';

export function Reportes() {
  const { data, cargando, error, recargar } = useReportes();
  const { resumen } = data;

  const citasMesChart = data.citas_por_mes.map((r) => ({
    name: labelMes(r.mes),
    value: r.cantidad,
  }));

  const disciplinasChart = data.deportistas_por_disciplina.map((r) => ({
    name: r.disciplina || 'Sin disciplina',
    value: r.cantidad,
  }));

  const tasaAsistencia =
    resumen.total_citas > 0
      ? ((resumen.citas_realizadas / resumen.total_citas) * 100).toFixed(1)
      : '0';

  if (cargando) {
    return (
      <div className="flex flex-col items-center justify-center h-72 gap-3">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
        <p className="text-sm text-gray-500">Cargando reportes…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-72 gap-4">
        <AlertTriangle className="w-10 h-10 text-red-400" />
        <p className="text-sm text-gray-600">{error}</p>
        <button
          onClick={recargar}
          className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 print:p-4 print:bg-white">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Reportes y Análisis</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Estadísticas del sistema · Actualizado {new Date().toLocaleDateString('es-CO', { day: '2-digit', month: 'long', year: 'numeric' })}
            </p>
          </div>
          <AccionesExportar data={data} onRecargar={recargar} cargando={cargando} />
        </div>

        {/* KPIs fila 1 */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard
            label="Deportistas"
            value={resumen.total_deportistas}
            sub={`${resumen.deportistas_sin_historia} sin historia`}
            icon={Users}
            color="blue"
          />
          <KpiCard
            label="Historias clínicas"
            value={resumen.total_historias}
            icon={FileText}
            color="green"
          />
          <KpiCard
            label="Total citas"
            value={resumen.total_citas}
            sub={`${tasaAsistencia}% asistencia`}
            icon={Calendar}
            color="purple"
          />
          <KpiCard
            label="No aptos"
            value={resumen.deportistas_no_aptos}
            icon={UserX}
            color="red"
          />
        </div>

        {/* KPIs estados citas */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 text-center">
            <p className="text-xs text-gray-500 mb-1">Realizadas</p>
            <p className="text-2xl font-bold text-green-600">{resumen.citas_realizadas}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 text-center">
            <p className="text-xs text-gray-500 mb-1">Programadas</p>
            <p className="text-2xl font-bold text-blue-600">{resumen.citas_programadas}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 text-center">
            <p className="text-xs text-gray-500 mb-1">Canceladas</p>
            <p className="text-2xl font-bold text-red-600">{resumen.citas_canceladas}</p>
          </div>
        </div>

        {/* Gráficas fila 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <GraficaCitasMes data={citasMesChart} />
          <GraficaDisciplinas data={disciplinasChart} />
        </div>

        {/* Gráficas fila 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <GraficaDiagnosticos data={data.top_diagnosticos} />
          <TablaMedicos data={data.medicos_carga} />
        </div>

        {/* No aptos — solo aparece si hay datos */}
        <TablaNoAptos count={resumen.deportistas_no_aptos} />

      </div>
    </div>
  );
}

export default Reportes;