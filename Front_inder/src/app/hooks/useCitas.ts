import { useState, useEffect, useCallback } from 'react';
import { citasService, Cita } from '../services/apiClient';

// ============================================================================
// HOOK: useCitas
// ============================================================================

/**
 * Hook para manejar citas de un deportista
 * 
 * Uso:
 * const {
 *   citas,
 *   proximasCitas,
 *   loading,
 *   crearCita,
 *   actualizarCita,
 * } = useCitas(deportistaId);
 */
export function useCitas(deportistaId?: string) {
  const [citas, setCitas] = useState<Cita[]>([]);
  const [proximasCitas, setProximasCitas] = useState<Cita[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Obtener todas las citas del deportista
  const fetchCitas = useCallback(async (id: string) => {
    try {
      setLoading(true);
      const data = await citasService.getByDeportistaId(id);
      setCitas(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching citas:', err);
      setError('Error al obtener citas');
    } finally {
      setLoading(false);
    }
  }, []);

  // Obtener próximas citas
  const fetchProximasCitas = useCallback(async (id: string) => {
    try {
      setLoading(true);
      const data = await citasService.getProximas(id);
      setProximasCitas(data);
    } catch (err) {
      console.error('Error fetching proximas citas:', err);
      setError('Error al obtener próximas citas');
    } finally {
      setLoading(false);
    }
  }, []);

  // Crear cita
  const crearCita = useCallback(
    async (data: Cita) => {
      try {
        setLoading(true);
        const nueva = await citasService.create(data);
        setCitas([...citas, nueva]);
        setError(null);
        return nueva;
      } catch (err) {
        console.error('Error creating cita:', err);
        setError('Error al crear cita');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [citas]
  );

  // Actualizar cita
  const actualizarCita = useCallback(
    async (id: string, data: Partial<Cita>) => {
      try {
        setLoading(true);
        const actualizada = await citasService.update(id, data);
        setCitas(citas.map((c) => (c.id === id ? actualizada : c)));
        setError(null);
        return actualizada;
      } catch (err) {
        console.error('Error updating cita:', err);
        setError('Error al actualizar cita');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [citas]
  );

  // Cargar citas al montar o cuando cambie deportistaId
  useEffect(() => {
    if (deportistaId) {
      fetchCitas(deportistaId);
      fetchProximasCitas(deportistaId);
    }
  }, [deportistaId, fetchCitas, fetchProximasCitas]);

  return {
    citas,
    proximasCitas,
    loading,
    error,
    fetchCitas,
    fetchProximasCitas,
    crearCita,
    actualizarCita,
  };
}

export default useCitas;