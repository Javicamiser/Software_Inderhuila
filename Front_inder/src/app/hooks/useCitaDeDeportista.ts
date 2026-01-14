import { useState, useEffect } from 'react';
import { citasService } from '../services/apiClient';

export interface CitaHoy {
  id: string;
  hora: string;
  fecha: string;
  deporte: string;
  estado: string;
}

export function useCitaDeDeportista(deportistaId: string) {
  const [cita, setCita] = useState<CitaHoy | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!deportistaId) {
      setCita(null);
      return;
    }

    const fetchCita = async () => {
      setLoading(true);
      setError(null);
      try {
        // Obtener todas las citas del deportista
        const response = await citasService.getByDeportistaId(deportistaId);
        
        // Filtrar citas de hoy
        const hoy = new Date().toISOString().split('T')[0];
        const citaHoy = response.find((c: any) => {
          return c.fecha === hoy;
        });

        if (citaHoy) {
          setCita({
            id: citaHoy.id || '',
            hora: citaHoy.hora || 'Sin hora',
            fecha: citaHoy.fecha,
            deporte: citaHoy.tipo_cita?.nombre || 'No especificado',
            estado: citaHoy.estado_cita?.nombre || 'Pendiente',
          });
        } else {
          setCita(null);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al obtener cita');
        setCita(null);
      } finally {
        setLoading(false);
      }
    };

    fetchCita();
  }, [deportistaId]);

  return { cita, loading, error };
}
