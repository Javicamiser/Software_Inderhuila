// features/reportes/reportesService.ts
// Agregar este objeto a apiClient.ts y exportarlo desde index.ts

import { api } from '@/app/services/apiClient';
import type { DashboardData } from './types';

export const reportesService = {
  async getDashboard(): Promise<DashboardData> {
    const { data } = await api.get<DashboardData>('/reportes/dashboard');
    return data;
  },

  async getResumen() {
    const { data } = await api.get('/reportes/resumen');
    return data;
  },

  async getHistoriasPorMes() {
    const { data } = await api.get('/reportes/historias/por-mes');
    return data;
  },

  async getCitasPorMes() {
    const { data } = await api.get('/reportes/citas/por-mes');
    return data;
  },

  async getDeportistasPorDisciplina() {
    const { data } = await api.get('/reportes/deportistas/por-disciplina');
    return data;
  },

  async getTopDiagnosticos() {
    const { data } = await api.get('/reportes/diagnosticos/top');
    return data;
  },

  async getResumenEstadosCitas() {
    const { data } = await api.get('/reportes/citas/resumen-estados');
    return data;
  },

  async getMedicosCarga() {
    const { data } = await api.get('/reportes/medicos/carga-trabajo');
    return data;
  },
};