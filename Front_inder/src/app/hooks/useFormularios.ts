import { useState, useEffect } from 'react';
import { formulariosService, Formulario } from '../services/apiClient';

// ============================================================================
// HOOK: useFormularios
// ============================================================================

/**
 * Hook para obtener formularios
 * 
 * Uso:
 * const { formularios, loading } = useFormularios('historia_clinica');
 * const { formularios: todos } = useFormularios();
 */
export function useFormularios(modulo?: string) {
  const [formularios, setFormularios] = useState<Formulario[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const cargar = async () => {
      try {
        setLoading(true);
        const data = modulo
          ? await formulariosService.getByModulo(modulo)
          : await formulariosService.getAll();
        setFormularios(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching formularios:', err);
        setError('Error al obtener formularios');
      } finally {
        setLoading(false);
      }
    };

    cargar();
  }, [modulo]);

  return { formularios, loading, error };
}

export default useFormularios;