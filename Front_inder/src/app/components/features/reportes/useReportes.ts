// features/reportes/useReportes.ts

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { api } from '@/app/services/apiClient';
import type { DashboardData } from './types';

const MESES_CORTOS: Record<string, string> = {
  Jan: 'Ene', Feb: 'Feb', Mar: 'Mar', Apr: 'Abr',
  May: 'May', Jun: 'Jun', Jul: 'Jul', Aug: 'Ago',
  Sep: 'Sep', Oct: 'Oct', Nov: 'Nov', Dec: 'Dic',
};

export function labelMes(raw: string): string {
  // Backend devuelve "Nov 2025", "Dec 2025", etc.
  if (!raw) return '';
  const [abr, año] = raw.split(' ');
  const mes = MESES_CORTOS[abr] ?? abr;
  return año ? `${mes} ${año}` : mes;
}

const VACIO: DashboardData = {
  resumen: {
    total_deportistas: 0,
    total_historias: 0,
    total_citas: 0,
    citas_realizadas: 0,
    citas_programadas: 0,
    citas_canceladas: 0,
    deportistas_sin_historia: 0,
    deportistas_no_aptos: 0,
  },
  historias_por_mes: [],
  citas_por_mes: [],
  deportistas_por_disciplina: [],
  top_diagnosticos: [],
  citas_resumen_estados: [],
  medicos_carga: [],
};

async function cargarTodo(): Promise<DashboardData> {
  const safe = async (fn: () => Promise<any>, fallback: any = null) => {
    try { return await fn(); } catch (e) { console.warn('[Reportes] error en endpoint:', e); return fallback; }
  };

  // Una sola llamada al dashboard completo
  const dash = await safe(() => api.get('/reportes/dashboard').then(r => r.data), null);

  if (dash) {
    console.log('[Reportes] dashboard raw:', dash);

    // /reportes/dashboard devuelve:
    // { kpis, historias_por_mes, deportistas_disciplina, citas_estados, citas_por_mes, top_diagnosticos, carga_medicos, sin_historia }

    const kpis = dash.kpis ?? {};

    // citas_estados.items = [{ estado, total, porcentaje }]
    const estadosItems: any[] = dash.citas_estados?.items ?? [];
    const encontrar = (palabras: string[]) =>
      estadosItems.filter(e => palabras.some(p => e.estado?.toLowerCase().includes(p)))
                  .reduce((s: number, e: any) => s + (e.total ?? 0), 0);

    const citas_realizadas  = encontrar(['atendida', 'realizada', 'completada']);
    const citas_canceladas  = encontrar(['cancelada', 'cancelado']);
    const citas_programadas = encontrar(['programada', 'pendiente', 'agendada', 'activa']);
    const total_citas       = estadosItems.reduce((s: number, e: any) => s + (e.total ?? 0), 0)
                              || kpis.citas_sin_realizar || 0;

    // historias_por_mes = [{ mes: "Nov 2025", total, año, mes_num }]
    const historias_por_mes = (dash.historias_por_mes ?? []).map((r: any) => ({
      mes:      r.mes ?? '',
      cantidad: r.total ?? 0,
    }));

    // citas_por_mes = [{ mes: "Nov 2025", total, atendida: N, cancelada: N, ... }]
    const citas_por_mes = (dash.citas_por_mes ?? []).map((r: any) => ({
      mes:      r.mes ?? '',
      cantidad: r.total ?? 0,
    }));

    // deportistas_disciplina = [{ disciplina, total }]
    const deportistas_por_disciplina = (dash.deportistas_disciplina ?? []).map((r: any) => ({
      disciplina: r.disciplina ?? '—',
      cantidad:   r.total ?? 0,
    }));

    // top_diagnosticos = [{ diagnostico, codigo_cie11, total }]
    const top_diagnosticos = (dash.top_diagnosticos ?? []).map((r: any) => ({
      codigo:   r.codigo_cie11 ?? '—',
      nombre:   r.diagnostico ?? '—',
      cantidad: r.total ?? 0,
    }));

    // carga_medicos.items = [{ medico, historias, citas_atendidas }]
    const medicos_carga = (dash.carga_medicos?.items ?? []).map((r: any) => ({
      medico:   r.medico ?? '—',
      historias: r.historias ?? 0,
      citas:    r.citas_atendidas ?? 0,
    }));

    return {
      resumen: {
        total_deportistas:        kpis.total_deportistas       ?? 0,
        total_historias:          kpis.historias_mes_actual    ?? 0,
        total_citas,
        citas_realizadas,
        citas_programadas,
        citas_canceladas,
        deportistas_sin_historia: kpis.deportistas_sin_historia ?? 0,
        deportistas_no_aptos:     kpis.deportistas_no_aptos    ?? 0,
      },
      historias_por_mes,
      citas_por_mes,
      deportistas_por_disciplina,
      top_diagnosticos,
      citas_resumen_estados: estadosItems.map((e: any) => ({
        estado:   e.estado,
        cantidad: e.total,
      })),
      medicos_carga,
    };
  }

  // Fallback: endpoints individuales si /dashboard falla
  const [resumenRaw, citasPorMes, disciplinas, diagnosticos, medicos] = await Promise.all([
    safe(() => api.get('/reportes/resumen').then(r => r.data), {}),
    safe(() => api.get('/reportes/citas/por-mes').then(r => r.data), []),
    safe(() => api.get('/reportes/deportistas/por-disciplina').then(r => r.data), []),
    safe(() => api.get('/reportes/diagnosticos/top').then(r => r.data), []),
    safe(() => api.get('/reportes/medicos/carga-trabajo').then(r => r.data), { items: [] }),
  ]);

  return {
    ...VACIO,
    resumen: {
      total_deportistas:        resumenRaw.total_deportistas        ?? 0,
      total_historias:          resumenRaw.historias_mes_actual     ?? 0,
      total_citas:              resumenRaw.citas_sin_realizar        ?? 0,
      citas_realizadas:         0,
      citas_programadas:        resumenRaw.citas_pendientes_hoy     ?? 0,
      citas_canceladas:         0,
      deportistas_sin_historia: resumenRaw.deportistas_sin_historia ?? 0,
      deportistas_no_aptos:     resumenRaw.deportistas_no_aptos     ?? 0,
    },
    citas_por_mes: (Array.isArray(citasPorMes) ? citasPorMes : []).map((r: any) => ({
      mes: r.mes ?? '', cantidad: r.total ?? 0,
    })),
    deportistas_por_disciplina: (Array.isArray(disciplinas) ? disciplinas : []).map((r: any) => ({
      disciplina: r.disciplina ?? '—', cantidad: r.total ?? 0,
    })),
    top_diagnosticos: (Array.isArray(diagnosticos) ? diagnosticos : []).map((r: any) => ({
      codigo: r.codigo_cie11 ?? '—', nombre: r.diagnostico ?? '—', cantidad: r.total ?? 0,
    })),
    medicos_carga: (medicos?.items ?? []).map((r: any) => ({
      medico: r.medico ?? '—', historias: r.historias ?? 0, citas: r.citas_atendidas ?? 0,
    })),
  };
}

export function useReportes() {
  const [data, setData] = useState<DashboardData>(VACIO);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    try {
      setCargando(true);
      setError(null);
      setData(await cargarTodo());
    } catch (err) {
      console.error('Error cargando reportes:', err);
      setError('No se pudieron cargar los reportes');
      toast.error('Error al cargar los reportes');
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  return { data, cargando, error, recargar: cargar };
}