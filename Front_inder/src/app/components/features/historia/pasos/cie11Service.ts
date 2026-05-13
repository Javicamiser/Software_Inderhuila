// ============================================================
// SERVICIO CIE-11
// Usa el backend que consulta la API oficial de la OMS
// Mantiene las mismas funciones para no romper los componentes
// ============================================================
import { api } from '@/app/services/apiClient';

export interface Cie11Result {
  codigo: string;
  nombre: string;
  descripcion?: string;
}

// Caché en memoria para evitar peticiones duplicadas
const cache = new Map<string, Cie11Result[]>();

async function buscar(q: string): Promise<Cie11Result[]> {
  if (q.length < 2) return [];
  const key = q.toLowerCase().trim();
  if (cache.has(key)) return cache.get(key)!;

  try {
    const { data } = await api.get('/cie11/buscar', { params: { q } });
    const results = Array.isArray(data) ? data : [];
    cache.set(key, results);
    return results;
  } catch {
    return [];
  }
}

// ── Funciones compatibles con los componentes existentes ─────

export async function buscarCodigosPorNombre(nombre: string): Promise<Cie11Result[]> {
  return buscar(nombre);
}

export async function buscarEnfermedadPorCodigo(codigo: string): Promise<Cie11Result | null> {
  const results = await buscar(codigo);
  return results.find(r => r.codigo.toLowerCase() === codigo.toLowerCase()) || results[0] || null;
}

export async function buscarPorCodigoParcial(parcial: string): Promise<Cie11Result[]> {
  return buscar(parcial);
}

// Exportación default para compatibilidad
export const cie11Service = { buscar, buscarCodigosPorNombre, buscarEnfermedadPorCodigo, buscarPorCodigoParcial };
export default cie11Service;