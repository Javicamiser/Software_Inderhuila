// ============================================================
// API CLIENT — único punto de entrada al backend
// Todos los servicios viven aquí. Ningún componente hace
// fetch/axios directo ni importa desde otro archivo de servicios.
// ============================================================
import axios, { type AxiosInstance } from 'axios';
import type {
  PaginatedResponse, CatalogoItem, Deportista, DeportistaCreate,
  Vacuna, VacunaCreate, HistoriaClinica, Cita, ConfiguracionInstitucion,
} from '../../types';

const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api/v1';
const API_TIMEOUT  = Number(import.meta.env.VITE_API_TIMEOUT ?? 10000);

// ── Instancia Axios ──────────────────────────────────────────
export const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ── Catálogos ────────────────────────────────────────────────
export const catalogosService = {
  async getItems(nombre: string) {
    const { data } = await api.get<CatalogoItem[]>(`/catalogos/${nombre}/items`);
    return data;
  },
  async getAllCatalogos() {
    const [tiposDocumento, sexos, estados, tiposCita, estadosCita] = await Promise.all([
      this.getItems('tipo_documento'),
      this.getItems('sexo'),
      this.getItems('estado_deportista'),
      this.getItems('tipo_cita'),
      this.getItems('estado_cita'),
    ]);
    return { tiposDocumento, sexos, estados, tiposCita, estadosCita };
  },
};

// ── Deportistas ──────────────────────────────────────────────
export const deportistasService = {
  async getAll(page = 1, page_size = 10) {
    const { data } = await api.get<PaginatedResponse<Deportista>>('/deportistas', { params: { page, page_size } });
    return data;
  },
  async getById(id: string) {
    const { data } = await api.get<Deportista>(`/deportistas/${id}`);
    return data;
  },
  async search(q: string) {
    const { data } = await api.get<Deportista[]>('/deportistas/search', { params: { q } });
    return data;
  },
  async create(body: DeportistaCreate) {
    const { data } = await api.post<Deportista>('/deportistas', body);
    return data;
  },
  async update(id: string, body: Partial<Deportista>) {
    const { data } = await api.put<Deportista>(`/deportistas/${id}`, body);
    return data;
  },
  async remove(id: string) {
    await api.delete(`/deportistas/${id}`);
  },
};

// ── Vacunas ──────────────────────────────────────────────────
export const vacunasService = {
  async getAll(deportistaId: string) {
    const { data } = await api.get<Vacuna[]>(`/deportistas/${deportistaId}/vacunas`);
    return data;
  },
  async create(deportistaId: string, body: VacunaCreate) {
    const { data } = await api.post<Vacuna>(`/deportistas/${deportistaId}/vacunas`, body);
    return data;
  },
  async getArchivo(deportistaId: string, vacunaId: string) {
    const { data } = await api.get(`/deportistas/${deportistaId}/vacunas/${vacunaId}/archivo`, { responseType: 'blob' });
    return data;
  },
  async uploadArchivo(deportistaId: string, vacunaId: string, file: File) {
    const form = new FormData();
    form.append('archivo', file);
    const { data } = await api.post(`/deportistas/${deportistaId}/vacunas/${vacunaId}/archivo`, form, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return data;
  },
  async update(deportistaId: string, vacunaId: string, body: Partial<VacunaCreate>) {
    const { data } = await api.put(`/deportistas/${deportistaId}/vacunas/${vacunaId}`, body);
    return data;
  },
  async remove(deportistaId: string, vacunaId: string) {
    await api.delete(`/deportistas/${deportistaId}/vacunas/${vacunaId}`);
  },
  async subirArchivo(deportistaId: string, vacunaId: string, archivo: File) {
    const form = new FormData();
    form.append('archivo', archivo);
    const { data } = await api.post(
      `/deportistas/${deportistaId}/vacunas/${vacunaId}/archivo`,
      form,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return data;
  },
  async descargarArchivo(deportistaId: string, vacunaId: string) {
    const { data } = await api.get(`/deportistas/${deportistaId}/vacunas/${vacunaId}/archivo`, { responseType: 'blob' });
    return data;
  },
};

// ── Historias clínicas ───────────────────────────────────────
export const historiasService = {
  async getAll(page = 1, page_size = 10) {
    const { data } = await api.get<PaginatedResponse<HistoriaClinica>>('/historias_clinicas', { params: { page, page_size } });
    return data;
  },
  async getById(id: string) {
    const { data } = await api.get<HistoriaClinica>(`/historias_clinicas/${id}`);
    return data;
  },
  async getCompleta(id: string) {
    const { data } = await api.get(`/historias_clinicas/${id}/completa`);
    return data;
  },
  async delete(id: string) {
    await api.delete(`/historias_clinicas/${id}`);
  },
  async crear(body: unknown) {
    const { data } = await api.post('/historias_clinicas/completa', body);
    return data;
  },
  async crearCompleta(body: unknown) {
    const { data } = await api.post('/historias_clinicas/completa', body);
    return data;
  },
   async getByDeportista(deportistaId: string) {
    const { data } = await api.get('/historias_clinicas', { params: { page: 1, page_size: 1000 } });
    const items = Array.isArray(data) ? data : (data?.items ?? []);
    return items.filter((h: any) => h.deportista_id === deportistaId);
  },
};

// Alias usado por componentes existentes
export const historiaClinicaService = historiasService;

// ── Citas ────────────────────────────────────────────────────
export const citasService = {
  async getAll() {
    const { data } = await api.get<Cita[]>('/citas');
    return data;
  },
  async getByDeportista(deportistaId: string) {
    const { data } = await api.get<Cita[]>(`/citas/deportista/${deportistaId}`);
    return data;
  },
  async create(body: Omit<Cita, 'id' | 'created_at'>) {
    const { data } = await api.post<Cita>('/citas', body);
    return data;
  },
  async update(id: string, body: Partial<Cita>) {
    const { data } = await api.put<Cita>(`/citas/${id}`, body);
    return data;
  },
  async remove(id: string) {
    await api.delete(`/citas/${id}`);
  },
};

// ── Archivos ─────────────────────────────────────────────────
export const archivosService = {
  async getByHistoria(historiaId: string) {
    const { data } = await api.get(`/archivos/historia/${historiaId}`);
    return data;
  },
  async getAll(params?: { deportista_id?: string; historia_clinica_id?: string }) {
    const { data } = await api.get('/archivos', { params });
    return data;
  },
  async subir(historiaId: string, archivo: File, descripcion?: string) {
    const form = new FormData();
    form.append('archivo', archivo);
    if (descripcion) form.append('descripcion', descripcion);
    const { data } = await api.post(`/archivos/historia/${historiaId}`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },
  async descargar(archivoId: string) {
    const { data } = await api.get(`/archivos/${archivoId}/descargar`, { responseType: 'blob' });
    return data;
  },
  async remove(archivoId: string) {
    await api.delete(`/archivos/${archivoId}`);
  },
};

// Alias para compatibilidad
export { archivosService as ArchivoCinico };

// ── Documentos / PDF ─────────────────────────────────────────
export const documentosService = {
  async generarPDF(historiaId: string) {
    const { data } = await api.get(`/documentos/historia/${historiaId}/pdf`, { responseType: 'blob' });
    return data;
  },
  async descargarHistoriaClinicaPdf(historiaId: string) {
    const response = await api.get(`/documentos/${historiaId}/historia-clinica-pdf`, { responseType: 'blob' });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const a = document.createElement('a');
    a.href = url;
    a.download = `historia_clinica_${historiaId}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  },
  async enviarEmail(historiaId: string, email: string) {
    const { data } = await api.post(`/documentos/historia/${historiaId}/email`, { email });
    return data;
  },
  async generarToken(historiaId: string) {
    const { data } = await api.post(`/descarga-segura/generar/${historiaId}`);
    return data;
  },
  async descargarConToken(token: string, cedula: string) {
    const { data } = await api.get(`/descarga-segura/descargar-pdf/${token}`, {
      params: { cedula },
      responseType: 'blob',
    });
    return data;
  },
};

// ── Formularios / respuestas ─────────────────────────────────
export const formulariosService = {
  async getAll() {
    const { data } = await api.get('/formularios');
    return data;
  },
  async getByModulo(modulo: string) {
    const { data } = await api.get('/formularios', { params: { modulo } });
    return data;
  },
};

export const respuestaGruposService = {
  async getByHistoriaId(id: string) {
    const { data } = await api.get(`/historias_clinicas/${id}/grupos`);
    return data;
  },
  async create(body: unknown) {
    const { data } = await api.post('/grupos_respuesta', body);
    return data;
  },
};

export const formularioRespuestasService = {
  async getByHistoriaId(id: string) {
    const { data } = await api.get(`/historias_clinicas/${id}/respuestas`);
    return data;
  },
  async create(body: unknown) {
    const { data } = await api.post('/respuestas_formulario', body);
    return data;
  },
  async createBulk(body: unknown[]) {
    const { data } = await api.post('/respuestas_formulario/bulk', body);
    return data;
  },
};

// ── Configuración institución ────────────────────────────────
export const institucionService = {
  async get() {
    const { data } = await api.get<ConfiguracionInstitucion>('/configuracion');
    return data;
  },
  async update(body: Partial<ConfiguracionInstitucion>) {
    const { data } = await api.put<ConfiguracionInstitucion>('/configuracion', body);
    return data;
  },
};

// ── Re-exportar tipos para imports directos ──────────────────
export type {
  CatalogoItem, Deportista, DeportistaCreate,
  Vacuna, VacunaCreate, HistoriaClinica, Cita,
  ConfiguracionInstitucion, PaginatedResponse,
} from '../../types';

// Alias de tipo para compatibilidad
export type { HistoriaClinica as HistoriaClinicaType } from '../../types';
export type Formulario = { id?: string; nombre: string; modulo: string; activo: boolean };
export type RespuestaGrupo = { id?: string; historia_clinica_id: string; formulario_id: string };
export type FormularioRespuesta = { id?: string; formulario_id: string; historia_clinica_id: string; campo_id: string; valor?: string; grupo_id?: string };
export type ArchivoCinicoType = { id?: string; historia_clinica_id: string; nombre_archivo?: string; ruta_archivo: string; tipo_archivo?: string };