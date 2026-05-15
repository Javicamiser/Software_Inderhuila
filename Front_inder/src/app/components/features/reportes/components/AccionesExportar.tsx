// features/reportes/components/AccionesExportar.tsx

import { useState } from 'react';
import { Download, FileSpreadsheet, Printer, RefreshCw } from 'lucide-react';
import * as XLSX from 'xlsx';
import type { DashboardData } from '../types';

interface Props {
  data: DashboardData;
  onRecargar: () => void;
  cargando: boolean;
}

export function AccionesExportar({ data, onRecargar, cargando }: Props) {
  const [exportando, setExportando] = useState(false);

  const exportarExcel = () => {
    setExportando(true);
    try {
      const wb = XLSX.utils.book_new();

      // Hoja 1: KPIs
      const kpis = [
        ['Métrica', 'Valor'],
        ['Total deportistas',          data.resumen.total_deportistas],
        ['Total historias clínicas',   data.resumen.total_historias],
        ['Total citas',                data.resumen.total_citas],
        ['Citas realizadas',           data.resumen.citas_realizadas],
        ['Citas programadas',          data.resumen.citas_programadas],
        ['Citas canceladas',           data.resumen.citas_canceladas],
        ['Deportistas sin historia',   data.resumen.deportistas_sin_historia],
        ['Deportistas no aptos',       data.resumen.deportistas_no_aptos],
      ];
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(kpis), 'Resumen');

      // Hoja 2: Citas por mes
      if (data.citas_por_mes.length) {
        const rows = [['Mes', 'Cantidad'], ...data.citas_por_mes.map(r => [r.mes, r.cantidad])];
        XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(rows), 'Citas por mes');
      }

      // Hoja 3: Disciplinas
      if (data.deportistas_por_disciplina.length) {
        const rows = [['Disciplina', 'Cantidad'], ...data.deportistas_por_disciplina.map(r => [r.disciplina, r.cantidad])];
        XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(rows), 'Disciplinas');
      }

      // Hoja 4: Top diagnósticos
      if (data.top_diagnosticos.length) {
        const rows = [['Código', 'Diagnóstico', 'Cantidad'], ...data.top_diagnosticos.map(r => [r.codigo, r.nombre, r.cantidad])];
        XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(rows), 'Diagnósticos');
      }

      // Hoja 5: Médicos
      if (data.medicos_carga.length) {
        const rows = [['Médico', 'Historias', 'Citas'], ...data.medicos_carga.map(r => [r.medico, r.historias, r.citas])];
        XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(rows), 'Médicos');
      }

      const fecha = new Date().toISOString().split('T')[0];
      XLSX.writeFile(wb, `reportes_inderhuila_${fecha}.xlsx`);
    } finally {
      setExportando(false);
    }
  };

  const imprimirPDF = () => window.print();

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={onRecargar}
        disabled={cargando}
        title="Recargar"
        className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition disabled:opacity-50"
      >
        <RefreshCw className={`w-4 h-4 text-gray-500 ${cargando ? 'animate-spin' : ''}`} />
      </button>

      <button
        onClick={imprimirPDF}
        className="flex items-center gap-1.5 px-3 py-2 text-sm rounded-lg border border-gray-200 hover:bg-gray-50 transition text-gray-600"
      >
        <Printer className="w-4 h-4" />
        Imprimir
      </button>

      <button
        onClick={exportarExcel}
        disabled={exportando}
        className="flex items-center gap-1.5 px-3 py-2 text-sm rounded-lg bg-green-600 hover:bg-green-700 text-white transition disabled:opacity-60"
      >
        <FileSpreadsheet className="w-4 h-4" />
        {exportando ? 'Exportando…' : 'Excel'}
      </button>
    </div>
  );
}
