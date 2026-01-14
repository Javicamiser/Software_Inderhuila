import { useState, useEffect, useCallback } from 'react';

// ============================================================================
// TIPOS
// ============================================================================

type AsyncStatus = 'idle' | 'pending' | 'success' | 'error';

// ============================================================================
// HOOK: useAsync
// ============================================================================

/**
 * Hook genérico para operaciones asincrónicas
 * 
 * Uso:
 * const { data, loading, error, execute } = useAsync(
 *   () => deportistasService.search('Juan'),
 *   false
 * );
 * 
 * // Ejecutar cuando lo necesites
 * await execute();
 */
export function useAsync<T>(
  asyncFunction: () => Promise<T>,
  immediate = true
) {
  const [status, setStatus] = useState<AsyncStatus>('idle');
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const execute = useCallback(async () => {
    setStatus('pending');
    setData(null);
    setError(null);

    try {
      const response = await asyncFunction();
      setData(response);
      setStatus('success');
      return response;
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      setStatus('error');
    }
  }, [asyncFunction]);

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [execute, immediate]);

  return {
    status,
    data,
    error,
    execute,
    loading: status === 'pending',
  };
}

export default useAsync;