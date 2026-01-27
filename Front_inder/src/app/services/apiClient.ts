/**
 * API CLIENT ACTUALIZADO PARA INDERDB
 */

import axios, { AxiosInstance } from 'axios';

// ============================================================================
// CONFIGURACIÓN
// ============================================================================

// URL del backend con ngrok para acceso externo
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://aposporic-maple-nonfrenetically.ngrok-free.dev/api/v1';
const API_TIMEOUT = parseInt(import.meta.env.VITE_API_TIMEOUT || '30000');

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
    'ngrok-skip-browser-warning': 'true',  // Evitar página de advertencia de ngrok
  },
});

// Interceptors
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  // Agregar header para evitar advertencia de ngrok en cada request
  config.headers['ngrok-skip-browser-warning'] = 'true';
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

  async getEstadosHistoriaClinica() {
    return this.getItems('estado_historia_clinica');
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
// FUNCIÓN DE TRANSFORMACIÓN DE DATOS PARA HISTORIA CLÍNICA
// ============================================================================

function transformarDatosHistoriaClinica(dataFrontend: any): any {
  const hoy = new Date().toISOString().split('T')[0];
  
  // Transformar antecedentes personales
  const antecedentesPersonales = (dataFrontend.antecedentesPersonales || []).map((item: any) => ({
    codigo_cie11: item.codigoCIE11 || item.codigo_cie11 || '',
    nombre_enfermedad: item.nombreEnfermedad || item.nombre_enfermedad || '',
    observaciones: item.observaciones || null,
  }));

  // Transformar antecedentes familiares
  const antecedentesFamiliares = (dataFrontend.antecedentesFamiliares || []).map((item: any) => ({
    tipo_familiar: item.familiar || item.tipo_familiar || '',
    codigo_cie11: item.codigoCIE11 || item.codigo_cie11 || '',
    nombre_enfermedad: item.nombreEnfermedad || item.nombre_enfermedad || '',
  }));

  // Transformar diagnósticos
  const diagnosticos = (dataFrontend.diagnosticos || []).map((item: any) => ({
    codigo_cie11: item.codigo || item.codigoCIE11 || item.codigo_cie11 || '',
    nombre_diagnostico: item.nombre || item.nombreDiagnostico || item.nombre_diagnostico || '',
    tipo_diagnostico: item.tipo || item.tipoDiagnostico || 'principal',
    observaciones: item.observaciones || null,
  }));

  // Transformar signos vitales
  let signosVitales = null;
  if (dataFrontend.peso || dataFrontend.estatura || dataFrontend.frecuenciaCardiaca) {
    const peso = parseFloat(dataFrontend.peso) || 0;
    const estatura = parseFloat(dataFrontend.estatura) || 0;
    const imc = estatura > 0 ? (peso / ((estatura / 100) ** 2)) : 0;
    
    signosVitales = {
      presion_arterial: dataFrontend.presionArterial || dataFrontend.presion_arterial || '120/80',
      frecuencia_cardiaca: parseInt(dataFrontend.frecuenciaCardiaca || dataFrontend.frecuencia_cardiaca) || 70,
      frecuencia_respiratoria: parseInt(dataFrontend.frecuenciaRespiratoria || dataFrontend.frecuencia_respiratoria) || 16,
      temperatura: parseFloat(dataFrontend.temperatura) || 36.5,
      peso: peso,
      altura: estatura,
      imc: parseFloat(imc.toFixed(2)),
      saturacion_oxigeno: parseInt(dataFrontend.saturacionOxigeno || dataFrontend.saturacion_oxigeno) || 98,
    };
  }

  // Transformar remisiones a especialistas
  const remisionesEspecialistas = (dataFrontend.remisionesEspecialistas || []).map((item: any) => ({
    especialidad: item.especialista || item.especialidad || '',
    motivo: item.motivo || item.razon_remision || '',
    prioridad: item.prioridad || 'Normal',
    fecha_remision: item.fechaRemision || item.fecha_remision || hoy,
    institucion: item.institucion || null,
    observaciones: item.observaciones || null,
  }));

  // Transformar plan de tratamiento
  let planTratamiento = null;
  if (dataFrontend.indicacionesMedicas || dataFrontend.recomendacionesEntrenamiento || dataFrontend.planSeguimiento) {
    planTratamiento = {
      recomendaciones: [
        dataFrontend.indicacionesMedicas || '',
        dataFrontend.recomendacionesEntrenamiento || '',
      ].filter(Boolean).join('\n\n') || 'Sin recomendaciones',
      medicamentos_prescritos: dataFrontend.medicacionActual || null,
      procedimientos: null,
      rehabilitacion: dataFrontend.recomendacionesEntrenamiento || null,
      fecha_seguimiento: null,
      observaciones: dataFrontend.planSeguimiento || null,
    };
  }

  // Transformar motivo de consulta
  let motivoConsultaEnfermedad = null;
  if (dataFrontend.motivoConsulta || dataFrontend.enfermedadActual) {
    motivoConsultaEnfermedad = {
      motivo_consulta: dataFrontend.motivoConsulta || 'Consulta médica deportiva',
      sintomas_principales: dataFrontend.enfermedadActual || null,
      duracion_sintomas: null,
      inicio_enfermedad: null,
      evolucion: null,
      factor_desencadenante: null,
      medicamentos_previos: dataFrontend.medicacionActual || null,
    };
  }

  // Transformar exploración física por sistemas
  let exploracionFisicaSistemas = null;
  if (dataFrontend.exploracionSistemas) {
    const exp = dataFrontend.exploracionSistemas;
    exploracionFisicaSistemas = {
      sistema_cardiovascular: exp.cardiovascular?.observaciones || (exp.cardiovascular?.estado === 'anormal' ? 'Anormal' : 'Normal'),
      sistema_respiratorio: exp.respiratorio?.observaciones || (exp.respiratorio?.estado === 'anormal' ? 'Anormal' : 'Normal'),
      sistema_digestivo: exp.digestivo?.observaciones || (exp.digestivo?.estado === 'anormal' ? 'Anormal' : 'Normal'),
      sistema_neurologico: exp.neurologico?.observaciones || (exp.neurologico?.estado === 'anormal' ? 'Anormal' : 'Normal'),
      sistema_genitourinario: exp.genitourinario?.observaciones || (exp.genitourinario?.estado === 'anormal' ? 'Anormal' : 'Normal'),
      sistema_musculoesqueletico: exp.musculoesqueletico?.observaciones || (exp.musculoesqueletico?.estado === 'anormal' ? 'Anormal' : 'Normal'),
      sistema_integumentario: exp.pielFaneras?.observaciones || (exp.pielFaneras?.estado === 'anormal' ? 'Anormal' : 'Normal'),
      sistema_endocrino: exp.endocrino?.observaciones || (exp.endocrino?.estado === 'anormal' ? 'Anormal' : 'Normal'),
      cabeza_cuello: null,
      extremidades: null,
      observaciones_generales: dataFrontend.analisisObjetivoDiagnostico || null,
    };
  }

  // Transformar revisión por sistemas
  const revisionSistemas: any[] = [];
  if (dataFrontend.revisionSistemas) {
    const rev = dataFrontend.revisionSistemas;
    const sistemas = [
      { key: 'cardiovascular', nombre: 'Cardiovascular' },
      { key: 'respiratorio', nombre: 'Respiratorio' },
      { key: 'digestivo', nombre: 'Digestivo' },
      { key: 'neurologico', nombre: 'Neurológico' },
      { key: 'musculoesqueletico', nombre: 'Musculoesquelético' },
      { key: 'genitourinario', nombre: 'Genitourinario' },
      { key: 'endocrino', nombre: 'Endocrino' },
      { key: 'pielFaneras', nombre: 'Piel y Faneras' },
    ];
    
    sistemas.forEach(({ key, nombre }) => {
      if (rev[key] && (rev[key].estado === 'anormal' || rev[key].observaciones)) {
        revisionSistemas.push({
          sistema: nombre,
          hallazgos: rev[key].estado === 'anormal' ? 'Anormal' : 'Normal',
          observaciones: rev[key].observaciones || null,
        });
      }
    });
  }

  // Construir objeto final para el backend
  const datosBackend: any = {
    deportista_id: dataFrontend.deportista_id,
    fecha_apertura: hoy,
    estado_id: dataFrontend.estado_id || '6203e531-aa6c-4490-a068-374c955bb197',
  };

  // Solo agregar campos si tienen datos
  if (antecedentesPersonales.length > 0) {
    datosBackend.antecedentes_personales = antecedentesPersonales;
  }
  if (antecedentesFamiliares.length > 0) {
    datosBackend.antecedentes_familiares = antecedentesFamiliares;
  }
  if (diagnosticos.length > 0) {
    datosBackend.diagnosticos = diagnosticos;
  }
  if (signosVitales) {
    datosBackend.signos_vitales = signosVitales;
  }
  if (remisionesEspecialistas.length > 0) {
    datosBackend.remisiones_especialistas = remisionesEspecialistas;
  }
  if (planTratamiento) {
    datosBackend.plan_tratamiento = planTratamiento;
  }
  if (motivoConsultaEnfermedad) {
    datosBackend.motivo_consulta_enfermedad = motivoConsultaEnfermedad;
  }
  if (exploracionFisicaSistemas) {
    datosBackend.exploracion_fisica_sistemas = exploracionFisicaSistemas;
  }
  if (revisionSistemas.length > 0) {
    datosBackend.revision_sistemas = revisionSistemas;
  }

  console.log('📤 Datos transformados para backend:', JSON.stringify(datosBackend, null, 2));
  return datosBackend;
}

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
    // Transformar datos del formato del frontend al formato del backend
    const datosTransformados = transformarDatosHistoriaClinica(data);
    
    const response = await api.post<any>(
      '/historias_clinicas/completa',
      datosTransformados
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

  // Generar link seguro para compartir por WhatsApp
  async generarLinkSeguro(historiaId: string) {
    const response = await api.post(`/descarga-segura/generar/${historiaId}`);
    return response.data;
  },

  // Verificar token de descarga
  async verificarToken(token: string, numeroCedula: string) {
    const response = await api.post(`/descarga-segura/verificar/${token}`, {
      numero_cedula: numeroCedula
    });
    return response.data;
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