import { useState } from 'react';
import { respuestaGruposService } from '../services/apiClient';

export const useGrupoRespuesta = () => {
  const [grupoId, setGrupoId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const crearGrupo = async (
    historiaClinicaId: string,
    formularioId?: string // ← Hacer opcional
  ) => {
    try {
      setIsCreating(true);
      setError(null);

      const grupo = await respuestaGruposService.create({
        historia_clinica_id: historiaClinicaId,
        formulario_id: formularioId || '', // ← Proporcionar valor por defecto
      });

      // ✅ Validar que grupo.id existe
      if (!grupo.id) {
        throw new Error('No se pudo crear el grupo de respuestas');
      }

      setGrupoId(grupo.id);
      return grupo;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al crear grupo';
      setError(message);
      console.error('Error crear grupo:', err);
      throw err;
    } finally {
      setIsCreating(false);
    }
  };

  const limpiar = () => {
    setGrupoId(null);
    setError(null);
  };

  return {
    grupoId,
    isCreating,
    error,
    crearGrupo,
    limpiar,
  };
};

export default useGrupoRespuesta;