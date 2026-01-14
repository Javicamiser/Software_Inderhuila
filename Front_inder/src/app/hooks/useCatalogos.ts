import { useState, useEffect } from 'react';
import { catalogosService, CatalogoItem } from '../services/apiClient';

// ============================================================================
// TIPOS
// ============================================================================

export interface CatalogosContexto {
  tiposDocumento: CatalogoItem[];
  sexos: CatalogoItem[];
  estados: CatalogoItem[];
  tiposCita: CatalogoItem[];
  estadosCita: CatalogoItem[];
  isLoading: boolean;
  error: string | null;
}

// ============================================================================
// HOOK: useCatalogos
// ============================================================================

/**
 * Hook para cargar todos los catálogos al iniciar la aplicación
 * 
 * Uso:
 * const { tiposDocumento, sexos, estados, isLoading } = useCatalogos();
 * 
 * if (isLoading) return <Loading />;
 * 
 * <Select name="tipo_documento_id" options={tiposDocumento} />
 * <Select name="sexo_id" options={sexos} />
 * <Select name="estado_id" options={estados} />
 */
export function useCatalogos(): CatalogosContexto {
  const [tiposDocumento, setTiposDocumento] = useState<CatalogoItem[]>([]);
  const [sexos, setSexos] = useState<CatalogoItem[]>([]);
  const [estados, setEstados] = useState<CatalogoItem[]>([]);
  const [tiposCita, setTiposCita] = useState<CatalogoItem[]>([]);
  const [estadosCita, setEstadosCita] = useState<CatalogoItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const cargarCatalogos = async () => {
      try {
        setIsLoading(true);
        console.log('🔄 Cargando catálogos...');
        
        const catalogos = await catalogosService.getAllCatalogos();
        console.log('📦 Respuesta del servicio:', catalogos);
        
        // Validar y establecer cada catálogo
        const tiposDoc = Array.isArray(catalogos.tiposDocumento) ? catalogos.tiposDocumento : [];
        const sex = Array.isArray(catalogos.sexos) ? catalogos.sexos : [];
        const est = Array.isArray(catalogos.estados) ? catalogos.estados : [];
        const tiposCit = Array.isArray(catalogos.tiposCita) ? catalogos.tiposCita : [];
        const estadosCit = Array.isArray(catalogos.estadosCita) ? catalogos.estadosCita : [];
        
        console.log('✅ Catálogos validados:', {
          tiposDocumento: tiposDoc.length,
          sexos: sex.length,
          estados: est.length,
          tiposCita: tiposCit.length,
          estadosCita: estadosCit.length,
        });
        
        setTiposDocumento(tiposDoc);
        setSexos(sex);
        setEstados(est);
        setTiposCita(tiposCit);
        setEstadosCita(estadosCit);
        setError(null);
      } catch (err: any) {
        console.error('❌ Error cargando catálogos:', err);
        const mensajeError = err.message || 'Error al cargar los catálogos';
        setError(mensajeError);
        
        // Establecer valores por defecto para evitar crashes
        setTiposDocumento([]);
        setSexos([]);
        setEstados([]);
        setTiposCita([]);
        setEstadosCita([]);
      } finally {
        setIsLoading(false);
      }
    };

    cargarCatalogos();
  }, []);

  return {
    tiposDocumento,
    sexos,
    estados,
    tiposCita,
    estadosCita,
    isLoading,
    error,
  };
}

export default useCatalogos;