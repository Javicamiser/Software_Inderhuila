import React, { createContext, useContext, useState, useEffect } from 'react';
import { catalogosService, CatalogoItem } from '../services/apiClient';

export interface Catalogos {
  tiposDocumento: CatalogoItem[];
  sexos: CatalogoItem[];
  estados: CatalogoItem[];
  tiposCita: CatalogoItem[];
  estadosCita: CatalogoItem[];
}

interface CatalogosContextType {
  catalogos: Catalogos;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

const CatalogosContext = createContext<CatalogosContextType | undefined>(undefined);

export const CatalogosProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [catalogos, setCatalogos] = useState<Catalogos>({
    tiposDocumento: [],
    sexos: [],
    estados: [],
    tiposCita: [],
    estadosCita: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await catalogosService.getAllCatalogos();
      setCatalogos(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error loading catalogos';
      setError(message);
      console.error('Error loading catalogos:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refetch();
  }, []);

  return (
    <CatalogosContext.Provider value={{ catalogos, isLoading, error, refetch }}>
      {children}
    </CatalogosContext.Provider>
  );
};

export const useCatalogos = () => {
  const context = useContext(CatalogosContext);
  if (!context) {
    throw new Error('useCatalogos must be used within CatalogosProvider');
  }
  return context;
};