// ============================================================
// SERVICES INDEX — aliases de compatibilidad
// ============================================================
export {
  api,
  catalogosService,
  deportistasService,
  vacunasService,
  historiasService,
  citasService,
  institucionService, 
  reportesService
} from './apiClient';

export { historiasService as historiaClinicaService } from './apiClient';
export { deportistasService as deportistasVacunasService } from './apiClient';

import { api } from './apiClient';

export const documentosService = {
  async generarPDF(historiaId: string) {
    const { data } = await api.get(`/documentos/historia/${historiaId}/pdf`, { responseType: 'blob' });
    return data;
  },
  async enviarEmail(historiaId: string, email: string) {
    const { data } = await api.post(`/documentos/historia/${historiaId}/email`, { email });
    return data;
  },
  async generarToken(historiaId: string) {
    const { data } = await api.post(`/descarga-segura/generar/${historiaId}`);
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

export const formulariosService = {
  async getAll() {
    const { data } = await api.get('/formularios');
    return data;
  },
  async getByModulo(modulo: string) {
    const { data } = await api.get(`/formularios?modulo=${modulo}`);
    return data;
  },
};

export type {
  CatalogoItem, Deportista, DeportistaCreate,
  Vacuna, VacunaCreate, HistoriaClinica, Cita,
  ConfiguracionInstitucion, Usuario, PaginatedResponse,
} from '../../types';