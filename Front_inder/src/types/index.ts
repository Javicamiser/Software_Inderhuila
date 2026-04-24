// ============================================================
// TIPOS GLOBALES - UN SOLO LUGAR PARA TODAS LAS INTERFACES
// ============================================================

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
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
  estado_id: string;
  foto?: string | null;
  created_at?: string;
  updated_at?: string;
}

export type DeportistaCreate = Omit<Deportista, 'id' | 'created_at' | 'updated_at' | 'edad'>;

export interface Vacuna {
  id: string;
  deportista_id: string;
  nombre_vacuna: string;
  fecha_administracion?: string;
  nombre_archivo?: string;
  observaciones?: string;
  created_at: string;
}

export interface VacunaCreate {
  nombre_vacuna: string;
  fecha_administracion?: string;
  observaciones?: string;
}

export interface HistoriaClinica {
  id?: string;
  deportista_id: string;
  fecha_apertura: string;
  estado_id: string;
  created_at?: string;
  deportista?: Deportista;
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

export interface ConfiguracionInstitucion {
  id?: string;
  nombre: string;
  logo_url?: string;
  color_primario?: string;
  telefono?: string;
  email?: string;
  direccion?: string;
  ciudad?: string;
  nit?: string;
}

export interface Usuario {
  id: string;
  nombre: string;
  email: string;
  rol: 'admin' | 'medico' | 'recepcionista';
  activo: boolean;
  created_at?: string;
}

export interface AuthTokens {
  access_token: string;
  token_type: string;
}