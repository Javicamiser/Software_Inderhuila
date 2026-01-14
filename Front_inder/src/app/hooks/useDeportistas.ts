import { useState, useEffect, useCallback } from 'react';
import { deportistasService, Deportista } from '../services/apiClient';

// ============================================================================
// TIPOS
// ============================================================================

interface UseDeportistasOptions {
  page?: number;
  pageSize?: number;
}

// ============================================================================
// HOOK: useDeportistas
// ============================================================================

/**
 * Hook para obtener lista de deportistas con paginación y búsqueda
 * 
 * Uso:
 * const { deportistas, loading, fetchDeportistas, searchDeportistas } = useDeportistas();
 */
export function useDeportistas(options?: UseDeportistasOptions) {
  const [deportistas, setDeportistas] = useState<Deportista[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(options?.page || 1);
  const [pageSize] = useState(options?.pageSize || 10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDeportistas = useCallback(async (pageNum: number) => {
    try {
      setLoading(true);
      const response = await deportistasService.getAll(pageNum, pageSize);
      setDeportistas(response.items);
      setTotal(response.total);
      setPage(pageNum);
      setError(null);
    } catch (err) {
      console.error('Error fetching deportistas:', err);
      setError('Error al obtener deportistas');
    } finally {
      setLoading(false);
    }
  }, [pageSize]);

  const searchDeportistas = useCallback(async (query: string) => {
    try {
      setLoading(true);
      const results = await deportistasService.search(query);
      setDeportistas(results);
      setError(null);
    } catch (err) {
      console.error('Error searching deportistas:', err);
      setError('Error al buscar deportistas');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDeportistas(page);
  }, [page, fetchDeportistas]);

  return {
    deportistas,
    total,
    page,
    pageSize,
    loading,
    error,
    fetchDeportistas,
    searchDeportistas,
  };
}

export default useDeportistas;