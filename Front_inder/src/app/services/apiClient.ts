/**
 * API CLIENT ACTUALIZADO PARA INDERDB
 * INCLUYE: Catálogos, Deportistas, Historia Clínica, Vacunas, Citas, Archivos, Documentos
 * 
 * CAMBIOS PRINCIPALES:
 * 1. Nuevos servicios para catálogos (tipos_documento, sexos, estados)
 * 2. Servicios para vacunas con carga de archivos
 * 3. Servicios para historia clínica completa (7 pasos)
 * 4. Servicios de citas y archivos clínicos
 */

import axios, { AxiosInstance } from 'axios';

// ============================================================================
// CONFIGURACIÓN
// ============================================================================

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
const API_TIMEOUT = parseInt(import.meta.env.VITE_API_TIMEOUT || '10000');

console.log(`🚀 API Client inicializado con URL: ${API_BASE_URL}`);

// ============================================================================
// TIPOS DE RESPUESTA
// ============================================================================

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

// ============================================================================
// TIPOS PRINCIPALES
// ============================================================================

export interface Catalogo {
  id: string;
  nombre: string;
  descripcion?: string;
}

export interface CatalogoItem {
  id: string;
  catalogo_id: string;
  codigo?: string;
  nombre: string;
  activo: boolean;
}

export interface Deportista {
  id: string;
  tipo_documento_id: string;
  numero_documento: string;
  nombres: string;
  apellidos: string;
  fecha_nacimiento?: string;
  edad?: number;
  sexo_id?: string;
  email?: string;
  telefono?: string;
  direccion?: string;
  tipo_deporte?: string;
  deporte_id?: string;
  categoria?: string;
  estado_id: string;
  foto?: string | null;
  created_at?: string;
  updated_at?: string;
  tipoDocumento?: string;
  numeroDocumento?: string;
  tipoDeporte?: string;
}

export type DeportistaCreate = {
  tipo_documento_id: string;
  numero_documento: string;
  nombres: string;
  apellidos: string;
  fecha_nacimiento: string;
  sexo_id: string;
  telefono?: string | null;
  email?: string | null;
  direccion?: string | null;
  tipo_deporte?: string | null;
  estado_id: string;
};

export interface Vacuna {
  id: string;
  deportista_id: string;
  nombre_vacuna: string;
  fecha_administracion?: string;
  nombre_archivo?: string;
  tipo_archivo?: string;
  ruta_archivo?: string;
  observaciones?: string;
  created_at: string;
  updated_at: string;
}

export interface VacunaCreate {
  nombre_vacuna: string;
  fecha_administracion?: string;
  observaciones?: string;
}

export interface Formulario {
  id?: string;
  nombre: string;
  modulo: string;
  activo: boolean;
  campos?: FormularioCampo[];
}

export interface FormularioCampo {
  id?: string;
  formulario_id: string;
  etiqueta: string;
  tipo_campo: string;
  requerido: boolean;
  orden?: number;
  catalogo_id?: string;
  catalogo?: Catalogo;
}

export interface HistoriaClinica {
  id?: string;
  deportista_id: string;
  fecha_apertura: string;
  estado_id: string;
  created_at?: string;
  deportista?: Deportista;
  estado?: CatalogoItem;
  grupos?: RespuestaGrupo[];
  respuestas?: FormularioRespuesta[];
  archivos?: ArchivoCinico[];
}

export interface Cita {
  id?: string;
  deportista_id: string;
  fecha: string;
  hora: string;
  tipo_cita_id: string;
  estado_cita_id: string;
  observaciones?: string;
  created_at?: string;
  deportista?: Deportista;
  tipo_cita?: CatalogoItem;
  estado_cita?: CatalogoItem;
}

export interface RespuestaGrupo {
  id?: string;
  historia_clinica_id: string;
  formulario_id: string;
  created_at?: string;
  formulario?: Formulario;
  respuestas?: FormularioRespuesta[];
}

export interface FormularioRespuesta {
  id?: string;
  formulario_id: string;
  historia_clinica_id: string;
  campo_id: string;
  valor?: string;
  created_at?: string;
  grupo_id?: string;
  campo?: FormularioCampo;
}

export interface ArchivoCinico {
  id?: string;
  historia_clinica_id: string;
  formulario_id?: string;
  grupo_id?: string;
  nombre_archivo?: string;
  ruta_archivo: string;
  tipo_archivo?: string;
  created_at?: string;
}

export interface PlantillaClinica {
  id?: string;
  sistema: string;
  contenido: string;
  activo: boolean;
}

// ============================================================================
// AXIOS INSTANCE
// ============================================================================

export const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptors
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => {
    console.log(`✅ ${response.config.method?.toUpperCase()} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('❌ Error:', error.response?.status, error.response?.data?.error);
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ============================================================================
// SERVICIOS: CATÁLOGOS
// ============================================================================

export const catalogosService = {
  async getAll() {
    const response = await api.get<Catalogo[]>('/catalogos');
    return response.data;
  },

  async getCatalogo(nombre: string) {
    const response = await api.get<Catalogo>(`/catalogos/${nombre}`);
    return response.data;
  },

  async getItems(nombreCatalogo: string) {
    const response = await api.get<CatalogoItem[]>(
      `/catalogos/${nombreCatalogo}/items`
    );
    return response.data;
  },

  async getTiposDocumento() {
    return this.getItems('tipo_documento');
  },

  async getSexos() {
    return this.getItems('sexo');
  },

  async getEstadosDeportista() {
    return this.getItems('estado_deportista');
  },

  async getTiposCita() {
    return this.getItems('tipo_cita');
  },

  async getEstadosCita() {
    return this.getItems('estado_cita');
  },

  async getAllCatalogos() {
    return Promise.all([
      this.getTiposDocumento(),
      this.getSexos(),
      this.getEstadosDeportista(),
      this.getTiposCita(),
      this.getEstadosCita(),
    ]).then(([tiposDoc, sexos, estados, tiposCita, estadosCita]) => ({
      tiposDocumento: tiposDoc,
      sexos,
      estados,
      tiposCita,
      estadosCita,
    }));
  },
};

// ============================================================================
// SERVICIOS: DEPORTISTAS
// ============================================================================

export const deportistasService = {
  async getAll(page: number = 1, page_size: number = 10) {
    const response = await api.get<PaginatedResponse<Deportista>>(
      '/deportistas',
      {
        params: { page, page_size },
      }
    );
    return response.data;
  },

  async getById(id: string) {
    const response = await api.get<Deportista>(`/deportistas/${id}`);
    return response.data;
  },

  async search(query: string) {
    const response = await api.get<Deportista[]>('/deportistas/search', {
      params: { q: query },
    });
    return response.data;
  },

  async create(data: DeportistaCreate) {
    const response = await api.post<Deportista>('/deportistas', data);
    return response.data;
  },

  async update(id: string, data: Partial<Deportista>) {
    const response = await api.put<Deportista>(`/deportistas/${id}`, data);
    return response.data;
  },

  async delete(id: string) {
    await api.delete(`/deportistas/${id}`);
  },

  // ==================== VACUNAS ====================
  async getVacunas(deportistaId: string) {
    const response = await api.get<Vacuna[]>(`/deportistas/${deportistaId}/vacunas`);
    return response.data;
  },

  async crearVacuna(deportistaId: string, data: VacunaCreate) {
    const response = await api.post<Vacuna>(
      `/deportistas/${deportistaId}/vacunas`,
      data
    );
    return response.data;
  },

  async cargarArchivo(deportistaId: string, vacunaId: string, archivo: File) {
    const formData = new FormData();
    formData.append('archivo', archivo);

    const response = await api.post(
      `/deportistas/${deportistaId}/vacunas/${vacunaId}/archivo`,
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
      }
    );
    return response.data;
  },

  async descargarArchivo(deportistaId: string, vacunaId: string) {
    const response = await api.get(
      `/deportistas/${deportistaId}/vacunas/${vacunaId}/archivo`,
      {
        responseType: 'blob',
      }
    );
    return response.data;
  },

  async actualizarVacuna(deportistaId: string, vacunaId: string, data: Partial<VacunaCreate>) {
    const response = await api.put(
      `/deportistas/${deportistaId}/vacunas/${vacunaId}`,
      data
    );
    return response.data;
  },

  async eliminarVacuna(deportistaId: string, vacunaId: string) {
    await api.delete(
      `/deportistas/${deportistaId}/vacunas/${vacunaId}`
    );
  },
};

// ============================================================================
// SERVICIOS: HISTORIAS CLÍNICAS
// ============================================================================

export const historiaClinicaService = {
  async getAll(page: number = 1, page_size: number = 10) {
    const response = await api.get<PaginatedResponse<HistoriaClinica>>(
      '/historias_clinicas',
      {
        params: { page, page_size },
      }
    );
    return response.data;
  },

  async getById(id: string) {
    const response = await api.get<HistoriaClinica>(`/historias_clinicas/${id}`);
    return response.data;
  },

  async getByDeportistaId(deportistaId: string) {
    const response = await api.get<HistoriaClinica[]>(
      `/deportistas/${deportistaId}/historias_clinicas`
    );
    return response.data;
  },

  async create(data: HistoriaClinica) {
    const response = await api.post<HistoriaClinica>(
      '/historias_clinicas',
      data
    );
    return response.data;
  },

  async update(id: string, data: Partial<HistoriaClinica>) {
    const response = await api.put<HistoriaClinica>(
      `/historias_clinicas/${id}`,
      data
    );
    return response.data;
  },

  async delete(id: string) {
    await api.delete(`/historias_clinicas/${id}`);
  },

  async crearCompleta(data: any) {
    const response = await api.post<any>(
      '/historias_clinicas/completa',
      data
    );
    return response.data;
  },

  async obtenerCompleta(historiaId: string) {
    const response = await api.get<any>(
      `/historias_clinicas/${historiaId}/completa`
    );
    return response.data;
  },

  async obtenerDatosCompletos(historiaId: string) {
    const response = await api.get<any>(
      `/historias_clinicas/${historiaId}/datos-completos`
    );
    return response.data;
  },
};

// ============================================================================
// SERVICIOS: RESPUESTA GRUPOS
// ============================================================================

export const respuestaGruposService = {
  async getAll(page: number = 1, page_size: number = 10) {
    const response = await api.get<PaginatedResponse<RespuestaGrupo>>(
      '/respuesta_grupos',
      {
        params: { page, page_size },
      }
    );
    return response.data;
  },

  async getById(id: string) {
    const response = await api.get<RespuestaGrupo>(`/respuesta_grupos/${id}`);
    return response.data;
  },

  async getByHistoriaId(historiaId: string) {
    const response = await api.get<RespuestaGrupo[]>(
      `/historias_clinicas/${historiaId}/respuesta_grupos`
    );
    return response.data;
  },

  async create(data: RespuestaGrupo) {
    const response = await api.post<RespuestaGrupo>('/respuesta_grupos', data);
    return response.data;
  },

  async delete(id: string) {
    await api.delete(`/respuesta_grupos/${id}`);
  },
};

// ============================================================================
// SERVICIOS: FORMULARIO RESPUESTAS
// ============================================================================

export const formularioRespuestasService = {
  async getAll(page: number = 1, page_size: number = 10) {
    const response = await api.get<PaginatedResponse<FormularioRespuesta>>(
      '/formulario_respuestas',
      {
        params: { page, page_size },
      }
    );
    return response.data;
  },

  async getById(id: string) {
    const response = await api.get<FormularioRespuesta>(
      `/formulario_respuestas/${id}`
    );
    return response.data;
  },

  async create(data: FormularioRespuesta) {
    const response = await api.post<FormularioRespuesta>(
      '/formulario_respuestas',
      data
    );
    return response.data;
  },

  async update(id: string, data: Partial<FormularioRespuesta>) {
    const response = await api.put<FormularioRespuesta>(
      `/formulario_respuestas/${id}`,
      data
    );
    return response.data;
  },

  async delete(id: string) {
    await api.delete(`/formulario_respuestas/${id}`);
  },
};

// ============================================================================
// SERVICIOS: CITAS
// ============================================================================

export const citasService = {
  async getDeportistasConCitasHoy() {
    const response = await api.get<Deportista[]>(
      '/citas/deportistas-con-citas-hoy'
    );
    return response.data;
  },

  async getAll(page: number = 1, page_size: number = 10) {
    const response = await api.get<PaginatedResponse<Cita>>('/citas', {
      params: { page, page_size },
    });
    return response.data;
  },

  async getById(id: string) {
    const response = await api.get<Cita>(`/citas/${id}`);
    return response.data;
  },

  async getByDeportistaId(deportistaId: string) {
    const response = await api.get<Cita[]>(
      `/deportistas/${deportistaId}/citas`
    );
    return response.data;
  },

  async getProximas(deportistaId: string) {
    const response = await api.get<Cita[]>(
      `/deportistas/${deportistaId}/citas/proximas`
    );
    return response.data;
  },

  async create(data: Cita) {
    const response = await api.post<Cita>('/citas', data);
    return response.data;
  },

  async update(id: string, data: Partial<Cita>) {
    const response = await api.put<Cita>(`/citas/${id}`, data);
    return response.data;
  },

  async delete(id: string) {
    await api.delete(`/citas/${id}`);
  },
};

// ============================================================================
// SERVICIOS: ARCHIVOS CLÍNICOS
// ============================================================================

export const archivosService = {
  async getByHistoriaId(historiaId: string) {
    const response = await api.get<ArchivoCinico[]>(
      `/historias_clinicas/${historiaId}/archivos_clinicos`
    );
    return response.data;
  },

  async upload(data: {
    historia_clinica_id: string;
    formulario_id?: string;
    grupo_id?: string;
    archivo: File;
  }) {
    const formData = new FormData();
    formData.append('historia_clinica_id', data.historia_clinica_id);
    if (data.formulario_id) {
      formData.append('formulario_id', data.formulario_id);
    }
    if (data.grupo_id) {
      formData.append('grupo_id', data.grupo_id);
    }
    formData.append('archivo', data.archivo);

    const response = await api.post<ArchivoCinico>(
      '/archivos_clinicos',
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
      }
    );
    return response.data;
  },

  async descargar(id: string) {
    const response = await api.get(`/archivos_clinicos/${id}/descargar`, {
      responseType: 'blob',
    });
    return response.data;
  },

  async delete(id: string) {
    await api.delete(`/archivos_clinicos/${id}`);
  },
};

// ============================================================================
// SERVICIOS: FORMULARIOS
// ============================================================================

export const formulariosService = {
  async getAll() {
    const response = await api.get<Formulario[]>('/formularios');
    return response.data;
  },

  async getById(id: string) {
    const response = await api.get<Formulario>(`/formularios/${id}`);
    return response.data;
  },

  async getByModulo(modulo: string) {
    const response = await api.get<Formulario[]>('/formularios', {
      params: { modulo },
    });
    return response.data;
  },
};

// ============================================================================
// SERVICIOS: PLANTILLAS
// ============================================================================

export const plantillasService = {
  async getBySystem(sistema: string) {
    const response = await api.get<PlantillaClinica>(
      `/plantillas_clinicas/${sistema}`
    );
    return response.data;
  },

  async getAll() {
    const response = await api.get<PlantillaClinica[]>(
      '/plantillas_clinicas'
    );
    return response.data;
  },
};

// ============================================================================
// SERVICIOS: DOCUMENTOS
// ============================================================================

export const documentosService = {
  async descargarHistoriaClinicaPdf(historiaId: string) {
    try {
      const response = await api.get(
        `/documentos/${historiaId}/historia-clinica-pdf`,
        {
          responseType: 'blob'
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `historia_clinica_${historiaId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);

      return true;
    } catch (error) {
      console.error('Error descargando PDF:', error);
      throw error;
    }
  },
};

// ============================================================================
// HEALTH CHECK
// ============================================================================

export async function healthCheck(): Promise<boolean> {
  try {
    const response = await api.get('/health');
    return response.status === 200;
  } catch {
    return false;
  }
}

// ============================================================================
// EXPORT DEFAULT
// ============================================================================

export default {
  api,
  catalogosService,
  deportistasService,
  historiaClinicaService,
  respuestaGruposService,
  formularioRespuestasService,
  citasService,
  archivosService,
  formulariosService,
  plantillasService,
  documentosService,
  healthCheck,
};