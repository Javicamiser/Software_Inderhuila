/**
 * Hook para gestionar Historia Clínica con endpoints normalizados
 * Reemplaza la lógica anterior de JSON por datos normalizados
 */

import { useState, useCallback } from 'react';

interface AntecedentesPersonales {
  codigo_cie11: string;
  nombre_enfermedad: string;
  observaciones?: string;
}

interface AntecedentesFamiliares {
  relacion: string;
  codigo_cie11: string;
  nombre_enfermedad: string;
}

interface LesioneDeportivas {
  tipo_lesion: string;
  fecha_lesion: string;
  tratamiento: string;
  observaciones?: string;
}

interface CirugiasPrivas {
  tipo_cirugia: string;
  fecha_cirugia: string;
  observaciones?: string;
}

interface Alergias {
  tipo_alergia: string;
  descripcion: string;
  reaccion?: string;
}

interface Medicaciones {
  nombre_medicamento: string;
  dosis: string;
  frecuencia: string;
  duracion: string;
  indicacion?: string;
}

interface VacunasAdministradas {
  nombre_vacuna: string;
  fecha_administracion: string;
  proxima_dosis?: string;
}

interface RevisionSistemas {
  sistema: string;
  hallazgos: string;
  observaciones?: string;
}

interface SignosVitales {
  presion_arterial: string;
  frecuencia_cardiaca: number;
  frecuencia_respiratoria: number;
  temperatura: number;
  peso: number;
  altura: number;
  imc: number;
  saturacion_oxigeno: number;
}

interface PruebasComplementarias {
  tipo_prueba: string;
  resultado: string;
  fecha_prueba: string;
  interpretacion?: string;
  observaciones?: string;
}

interface Diagnosticos {
  codigo_cie11: string;
  nombre_diagnostico: string;
  tipo_diagnostico?: string;
  observaciones?: string;
}

interface PlanTratamiento {
  recomendaciones: string;
  medicamentos_prescritos?: string;
  procedimientos?: string;
  rehabilitacion?: string;
  fecha_seguimiento?: string;
  observaciones?: string;
}

interface RemisionesEspecialistas {
  especialidad: string;
  razon_remision: string;
  prioridad?: string;
  fecha_remision?: string;
  institucion?: string;
  observaciones?: string;
}

interface HistoriaClinicaData {
  deportista_id: string;
  fecha_apertura: string;
  estado_id: string;
  antecedentes_personales?: AntecedentesPersonales[];
  antecedentes_familiares?: AntecedentesFamiliares[];
  lesiones_deportivas?: LesioneDeportivas[];
  cirugias_previas?: CirugiasPrivas[];
  alergias?: Alergias[];
  medicaciones?: Medicaciones[];
  vacunas_administradas?: VacunasAdministradas[];
  revision_sistemas?: RevisionSistemas[];
  signos_vitales?: SignosVitales;
  pruebas_complementarias?: PruebasComplementarias[];
  diagnosticos?: Diagnosticos[];
  plan_tratamiento?: PlanTratamiento;
  remisiones_especialistas?: RemisionesEspecialistas[];
}

interface UseHistoriaClinicaReturn {
  loading: boolean;
  error: string | null;
  crearHistoriaCompleta: (data: HistoriaClinicaData) => Promise<any>;
  obtenerHistoriaCompleta: (historiaId: string) => Promise<any>;
  obtenerAlergias: (historiaId: string) => Promise<any>;
  obtenerMedicaciones: (historiaId: string) => Promise<any>;
  obtenerDiagnosticos: (historiaId: string) => Promise<any>;
  obtenerRemisiones: (historiaId: string) => Promise<any>;
}

const API_BASE = 'http://localhost:8000/api/v1';

export const useHistoriaClinica = (): UseHistoriaClinicaReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const crearHistoriaCompleta = useCallback(
    async (data: HistoriaClinicaData) => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `${API_BASE}/historias-clinicas/completa`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || 'Error al crear historia clínica');
        }

        const result = await response.json();
        return result;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const obtenerHistoriaCompleta = useCallback(
    async (historiaId: string) => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `${API_BASE}/historias-clinicas/${historiaId}/completa`
        );

        if (!response.ok) {
          throw new Error('Error al obtener historia clínica');
        }

        return await response.json();
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const obtenerAlergias = useCallback(
    async (historiaId: string) => {
      try {
        const response = await fetch(
          `${API_BASE}/antecedentes/alergias/historia/${historiaId}`
        );

        if (!response.ok) {
          throw new Error('Error al obtener alergias');
        }

        return await response.json();
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
        setError(errorMessage);
        throw err;
      }
    },
    []
  );

  const obtenerMedicaciones = useCallback(
    async (historiaId: string) => {
      try {
        const response = await fetch(
          `${API_BASE}/antecedentes/medicaciones/historia/${historiaId}`
        );

        if (!response.ok) {
          throw new Error('Error al obtener medicaciones');
        }

        return await response.json();
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
        setError(errorMessage);
        throw err;
      }
    },
    []
  );

  const obtenerDiagnosticos = useCallback(
    async (historiaId: string) => {
      try {
        const response = await fetch(
          `${API_BASE}/antecedentes/diagnosticos/historia/${historiaId}`
        );

        if (!response.ok) {
          throw new Error('Error al obtener diagnósticos');
        }

        return await response.json();
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
        setError(errorMessage);
        throw err;
      }
    },
    []
  );

  const obtenerRemisiones = useCallback(
    async (historiaId: string) => {
      try {
        const response = await fetch(
          `${API_BASE}/antecedentes/remisiones/historia/${historiaId}`
        );

        if (!response.ok) {
          throw new Error('Error al obtener remisiones');
        }

        return await response.json();
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
        setError(errorMessage);
        throw err;
      }
    },
    []
  );

  return {
    loading,
    error,
    crearHistoriaCompleta,
    obtenerHistoriaCompleta,
    obtenerAlergias,
    obtenerMedicaciones,
    obtenerDiagnosticos,
    obtenerRemisiones,
  };
};
