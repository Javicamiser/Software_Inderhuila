/**
 * CUSTOM HOOKS ACTUALIZADOS PARA INDERDB
 * 
 * NUEVOS HOOKS:
 * - useCatalogos(): Carga todos los catálogos al iniciar
 * - useCatalogo(nombre): Carga un catálogo específico
 * - useDeportistasConCatalogos(): Lista deportistas con labels de catálogos
 */

import { useState, useEffect, useCallback } from 'react';
import { useForm, UseFormProps, FieldValues, SubmitHandler } from 'react-hook-form';
import {
  catalogosService,
  deportistasService,
  historiaClinicaService,
  respuestaGruposService,
  formularioRespuestasService,
  citasService,
  formulariosService,
  CatalogoItem,
  Deportista,
  HistoriaClinica,
  RespuestaGrupo,
  FormularioRespuesta,
  Cita,
  Formulario,
} from '../services/apiClient';

// ============================================================================
// TIPOS PARA CATÁLOGOS
// ============================================================================

export interface CatalogosContexto {
  tiposDocumento: CatalogoItem[];
  sexos: CatalogoItem[];
  estados: CatalogoItem[];
  tiposCita: CatalogoItem[];
  estadosCita: CatalogoItem[];
  loading: boolean;
  error: string | null;
}

// ============================================================================
// HOOK: useCatalogos ← NUEVO
// ============================================================================

/**
 * Hook para cargar todos los catálogos al iniciar la aplicación
 * 
 * Uso:
 * const { tiposDocumento, sexos, estados, loading } = useCatalogos();
 * 
 * if (loading) return <Loading />;
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const cargarCatalogos = async () => {
      try {
        setLoading(true);
        const catalogos = await catalogosService.getAllCatalogos();
        
        setTiposDocumento(catalogos.tiposDocumento || []);
        setSexos(catalogos.sexos || []);
        setEstados(catalogos.estados || []);
        setTiposCita(catalogos.tiposCita || []);
        setEstadosCita(catalogos.estadosCita || []);
        setError(null);
      } catch (err) {
        console.error('Error cargando catálogos:', err);
        setError('Error al cargar los catálogos');
      } finally {
        setLoading(false);
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
    loading,
    error,
  };
}

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

// ============================================================================
// HOOK: useDeportistas (ORIGINAL, SIGUE IGUAL)
// ============================================================================

interface UseDeportistasOptions {
  page?: number;
  pageSize?: number;
}

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

// ============================================================================
// HOOK: useHistoriaClinica (ACTUALIZADO)
// ============================================================================

/**
 * Hook para manejar historia clínica
 * 
 * CAMBIOS:
 * - Ahora usa respuestaGruposService + formularioRespuestasService
 * - No usa respuesta_formulario directamente
 */
export function useHistoriaClinica(historiaId?: string) {
  const [historia, setHistoria] = useState<HistoriaClinica | null>(null);
  const [grupos, setGrupos] = useState<RespuestaGrupo[]>([]);
  const [respuestas, setRespuestas] = useState<FormularioRespuesta[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar historia completa
  const fetchHistoria = useCallback(async (id: string) => {
    try {
      setLoading(true);
      const data = await historiaClinicaService.getById(id);
      setHistoria(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching historia:', err);
      setError('Error al obtener historia clínica');
    } finally {
      setLoading(false);
    }
  }, []);

  // Cargar grupos de respuestas
  const fetchGrupos = useCallback(async (id: string) => {
    try {
      setLoading(true);
      const data = await respuestaGruposService.getByHistoriaId(id);
      setGrupos(data);
    } catch (err) {
      console.error('Error fetching grupos:', err);
      setError('Error al obtener grupos de respuestas');
    } finally {
      setLoading(false);
    }
  }, []);

  // Cargar respuestas de la historia
  const fetchRespuestas = useCallback(async (id: string) => {
    try {
      setLoading(true);
      const data = await formularioRespuestasService.getByHistoriaId(id);
      setRespuestas(data);
    } catch (err) {
      console.error('Error fetching respuestas:', err);
      setError('Error al obtener respuestas');
    } finally {
      setLoading(false);
    }
  }, []);

  // Crear nueva historia
  const crearHistoria = useCallback(async (data: HistoriaClinica) => {
    try {
      setLoading(true);
      const nueva = await historiaClinicaService.create(data);
      setHistoria(nueva);
      setError(null);
      return nueva;
    } catch (err) {
      console.error('Error creating historia:', err);
      setError('Error al crear historia clínica');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Crear grupo de respuestas
  const crearGrupo = useCallback(
    async (data: RespuestaGrupo) => {
      try {
        setLoading(true);
        const nuevoGrupo = await respuestaGruposService.create(data);
        setGrupos([...grupos, nuevoGrupo]);
        setError(null);
        return nuevoGrupo;
      } catch (err) {
        console.error('Error creating grupo:', err);
        setError('Error al crear grupo de respuestas');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [grupos]
  );

  // Guardar respuestas (una o varias)
  const guardarRespuestas = useCallback(
    async (data: FormularioRespuesta | FormularioRespuesta[]) => {
      try {
        setLoading(true);
        const esArray = Array.isArray(data);
        
        let nuevasRespuestas: FormularioRespuesta[];
        if (esArray) {
          nuevasRespuestas = await formularioRespuestasService.createBulk(
            data as FormularioRespuesta[]
          );
        } else {
          const respuesta = await formularioRespuestasService.create(
            data as FormularioRespuesta
          );
          nuevasRespuestas = [respuesta];
        }

        setRespuestas([...respuestas, ...nuevasRespuestas]);
        setError(null);
        return nuevasRespuestas;
      } catch (err) {
        console.error('Error saving respuestas:', err);
        setError('Error al guardar respuestas');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [respuestas]
  );

  // Cargar todo al iniciar
  useEffect(() => {
    if (historiaId) {
      fetchHistoria(historiaId);
      fetchGrupos(historiaId);
      fetchRespuestas(historiaId);
    }
  }, [historiaId, fetchHistoria, fetchGrupos, fetchRespuestas]);

  return {
    historia,
    grupos,
    respuestas,
    loading,
    error,
    fetchHistoria,
    fetchGrupos,
    fetchRespuestas,
    crearHistoria,
    crearGrupo,
    guardarRespuestas,
  };
}

// ============================================================================
// HOOK: useCitas (ACTUALIZADO)
// ============================================================================

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

// ============================================================================
// HOOK: useFormularios
// ============================================================================

/**
 * Hook para obtener formularios
 * 
 * Uso:
 * const { formularios, loading } = useFormularios('historia_clinica');
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

// ============================================================================
// HOOK: useFormularioWithValidation (MEJORADO)
// ============================================================================

/**
 * Hook que combina react-hook-form con validaciones personalizadas
 * 
 * Uso mejorado:
 * const form = useFormularioWithValidation<DeportistaForm>(
 *   {
 *     defaultValues: {
 *       tipo_documento_id: '',
 *       numero_documento: '',
 *       ...
 *     },
 *     mode: 'onChange',
 *   },
 *   {
 *     numero_documento: {
 *       validate: (value) => /^\d{6,20}$/.test(value) || 'Documento inválido',
 *     },
 *   }
 * );
 */
export function useFormularioWithValidation<T extends FieldValues>(
  options?: UseFormProps<T>,
  customValidations?: Record<string, any>
) {
  const form = useForm<T>(options);

  return {
    ...form,
    customValidations,
    onSubmit: (callback: SubmitHandler<T>) =>
      form.handleSubmit(async (data) => {
        // Validaciones personalizadas
        const errors: Record<string, string> = {};

        if (customValidations) {
          for (const [field, rules] of Object.entries(customValidations)) {
            if (rules.validate) {
              const error = await rules.validate((data as any)[field]);
              if (error !== true) {
                errors[field] = error;
              }
            }
          }
        }

        if (Object.keys(errors).length > 0) {
          Object.entries(errors).forEach(([field, message]) => {
            form.setError(field as any, { message });
          });
          return;
        }

        // Si todas las validaciones pasaron, ejecutar callback
        await callback(data);
      }),
  };
}

// ============================================================================
// HOOK: useAsync (UTILIDAD)
// ============================================================================

/**
 * Hook genérico para operaciones asincrónicas
 * 
 * Uso:
 * const { data, loading, error, execute } = useAsync(
 *   () => deportistasService.search('Juan'),
 *   false
 * );
 */
export function useAsync<T>(
  asyncFunction: () => Promise<T>,
  immediate = true
) {
  const [status, setStatus] = useState<'idle' | 'pending' | 'success' | 'error'>(
    'idle'
  );
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

  return { status, data, error, execute };
}

// ============================================================================
// EXPORT DEFAULT
// ============================================================================

export default {
  useCatalogos,
  useCatalogo,
  useDeportistas,
  useHistoriaClinica,
  useCitas,
  useFormularios,
  useFormularioWithValidation,
  useAsync,
};