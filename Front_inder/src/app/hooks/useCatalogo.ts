import { useState, useEffect } from 'react';
import { catalogosService, CatalogoItem } from '../services/apiClient';

// ============================================================================
// HOOK: useCatalogo
// ============================================================================

/**
 * Hook para cargar un catálogo específico
 * 
 * Uso:
 * const { items, loading } = useCatalogo('sexos');
 * const { items: tipos } = useCatalogo('tipos_documento');
 */
export function useCatalogo(nombreCatalogo: string) {
  const [items, setItems] = useState<CatalogoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const cargar = async () => {
      try {
        setLoading(true);
        const data = await catalogosService.getItems(nombreCatalogo);
        setItems(data);
        setError(null);
      } catch (err) {
        console.error(`Error cargando catálogo ${nombreCatalogo}:`, err);
        setError(`Error al cargar ${nombreCatalogo}`);
      } finally {
        setLoading(false);
      }
    };

    cargar();
  }, [nombreCatalogo]);

  return { items, loading, error };
}

export default useCatalogo;