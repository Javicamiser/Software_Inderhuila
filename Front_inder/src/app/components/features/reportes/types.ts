// features/reportes/types.ts

export interface DashboardData {
  resumen: ResumenKPIs;
  historias_por_mes: HistoriaPorMes[];
  citas_por_mes: CitaPorMes[];
  deportistas_por_disciplina: DisciplinaCount[];
  top_diagnosticos: DiagnosticoTop[];
  citas_resumen_estados: EstadoCita[];
  medicos_carga: MedicoCarga[];
}

export interface ResumenKPIs {
  total_deportistas: number;
  total_historias: number;
  total_citas: number;
  citas_realizadas: number;
  citas_programadas: number;
  citas_canceladas: number;
  deportistas_sin_historia: number;
  deportistas_no_aptos: number;
}

export interface HistoriaPorMes {
  mes: string;
  cantidad: number;
}

export interface CitaPorMes {
  mes: string;
  cantidad: number;
}

export interface DisciplinaCount {
  disciplina: string;
  cantidad: number;
}

export interface DiagnosticoTop {
  codigo?: string;
  nombre?: string;
  descripcion?: string;
  diagnostico?: string;
  cantidad: number;
  [key: string]: string | number | undefined;
}

export interface EstadoCita {
  estado: string;
  cantidad: number;
}

export interface MedicoCarga {
  medico: string;
  historias: number;
  citas: number;
}

export interface ChartPoint {
  name: string;
  value: number;
  [key: string]: string | number;
}