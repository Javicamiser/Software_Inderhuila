// ============================================================
// CATALOGOS CONTEXT
// Carga todos los catálogos una sola vez al iniciar la app.
// Cualquier componente puede usarlos sin hacer fetch propio.
// ============================================================
import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { catalogosService } from '../services/apiClient';
import type { CatalogoItem } from '../../types';

interface CatalogosContextValue {
  tiposDocumento: CatalogoItem[];
  sexos:          CatalogoItem[];
  estados:        CatalogoItem[];
  tiposCita:      CatalogoItem[];
  estadosCita:    CatalogoItem[];
  loading:        boolean;
  error:          string | null;
}

const CatalogosContext = createContext<CatalogosContextValue>({
  tiposDocumento: [],
  sexos:          [],
  estados:        [],
  tiposCita:      [],
  estadosCita:    [],
  loading:        true,
  error:          null,
});

export function CatalogosProvider({ children }: { children: ReactNode }) {
  const [catalogos, setCatalogos] = useState<Omit<CatalogosContextValue, 'loading' | 'error'>>({
    tiposDocumento: [],
    sexos:          [],
    estados:        [],
    tiposCita:      [],
    estadosCita:    [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  useEffect(() => {
    catalogosService.getAllCatalogos()
      .then(data => {
        setCatalogos(data);
        setError(null);
      })
      .catch(() => setError('Error cargando catálogos'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <CatalogosContext.Provider value={{ ...catalogos, loading, error }}>
      {children}
    </CatalogosContext.Provider>
  );
}

export function useCatalogosContext() {
  return useContext(CatalogosContext);
}

export default CatalogosContext;