import { useState, useEffect, useCallback } from 'react';
import {
  historiaClinicaService,
  respuestaGruposService,
  formularioRespuestasService,
  HistoriaClinica,
  RespuestaGrupo,
  FormularioRespuesta,
} from '../services/apiClient';

// ============================================================================
// HOOK: useHistoriaClinica
// ============================================================================

/**
 * Hook para manejar historia clínica
 * 
 * Cambios:
 * - Usa respuestaGruposService + formularioRespuestasService
 * - No usa respuesta_formulario directamente
 * 
 * Uso:
 * const {
 *   historia,
 *   grupos,
 *   respuestas,
 *   crearHistoria,
 *   crearGrupo,
 *   guardarRespuestas,
 * } = useHistoriaClinica(historiaId);
 */
export function useHistoriaClinica(historiaId?: string) {
  const [historia, setHistoria] = useState<HistoriaClinica | null>(null);
  const [grupos, setGrupos] = useState<RespuestaGrupo[]>([]);
  const [respuestas, setRespuestas] = useState<FormularioRespuesta[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar historia completa
  const fetchHistoria = useCallback(async (id: string) => {
    try {
      setLoading(true);
      const data = await historiaClinicaService.getById(id);
      setHistoria(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching historia:', err);
      setError('Error al obtener historia clínica');
    } finally {
      setLoading(false);
    }
  }, []);

  // Cargar grupos de respuestas
  const fetchGrupos = useCallback(async (id: string) => {
    try {
      setLoading(true);
      const data = await respuestaGruposService.getByHistoriaId(id);
      setGrupos(data);
    } catch (err) {
      console.error('Error fetching grupos:', err);
      setError('Error al obtener grupos de respuestas');
    } finally {
      setLoading(false);
    }
  }, []);

  // Cargar respuestas de la historia
  const fetchRespuestas = useCallback(async (id: string) => {
    try {
      setLoading(true);
      const data = await formularioRespuestasService.getByHistoriaId(id);
      setRespuestas(data);
    } catch (err) {
      console.error('Error fetching respuestas:', err);
      setError('Error al obtener respuestas');
    } finally {
      setLoading(false);
    }
  }, []);

  // Crear nueva historia
  const crearHistoria = useCallback(async (data: HistoriaClinica) => {
    try {
      setLoading(true);
      const nueva = await historiaClinicaService.create(data);
      setHistoria(nueva);
      setError(null);
      return nueva;
    } catch (err) {
      console.error('Error creating historia:', err);
      setError('Error al crear historia clínica');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Crear grupo de respuestas
  const crearGrupo = useCallback(
    async (data: RespuestaGrupo) => {
      try {
        setLoading(true);
        const nuevoGrupo = await respuestaGruposService.create(data);
        setGrupos([...grupos, nuevoGrupo]);
        setError(null);
        return nuevoGrupo;
      } catch (err) {
        console.error('Error creating grupo:', err);
        setError('Error al crear grupo de respuestas');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [grupos]
  );

  // Guardar respuestas (una o varias)
  const guardarRespuestas = useCallback(
    async (data: FormularioRespuesta | FormularioRespuesta[]) => {
      try {
        setLoading(true);
        const esArray = Array.isArray(data);

        let nuevasRespuestas: FormularioRespuesta[];
        if (esArray) {
          nuevasRespuestas = await formularioRespuestasService.createBulk(
            data as FormularioRespuesta[]
          );
        } else {
          const respuesta = await formularioRespuestasService.create(
            data as FormularioRespuesta
          );
          nuevasRespuestas = [respuesta];
        }

        setRespuestas([...respuestas, ...nuevasRespuestas]);
        setError(null);
        return nuevasRespuestas;
      } catch (err) {
        console.error('Error saving respuestas:', err);
        setError('Error al guardar respuestas');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [respuestas]
  );

  // Cargar todo al iniciar
  useEffect(() => {
    if (historiaId) {
      fetchHistoria(historiaId);
      fetchGrupos(historiaId);
      fetchRespuestas(historiaId);
    }
  }, [historiaId, fetchHistoria, fetchGrupos, fetchRespuestas]);

  return {
    historia,
    grupos,
    respuestas,
    loading,
    error,
    fetchHistoria,
    fetchGrupos,
    fetchRespuestas,
    crearHistoria,
    crearGrupo,
    guardarRespuestas,
  };
}

export default useHistoriaClinica;