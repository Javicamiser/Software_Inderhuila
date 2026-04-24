import { useState, useEffect, useCallback } from 'react';
import { Search, Calendar, FileText, Plus, Clock } from 'lucide-react';
import { deportistasService, citasService, historiaClinicaService } from '@/app/services/apiClient';
import type { Deportista } from '@/app/services/apiClient';

interface SelectDeportistaProps {
  onSelect: (deportista: Deportista) => void;
  onBack?: () => void;
}

interface DeportistaEnriquecido extends Deportista {
  tieneHistoria: boolean;
  historiaId?: string;
  tieneCitaHoy?: boolean;
}

export const SelectDeportista: React.FC<SelectDeportistaProps> = ({ onSelect, onBack }) => {
  const [citasHoy, setCitasHoy]         = useState<DeportistaEnriquecido[]>([]);
  const [resultados, setResultados]     = useState<DeportistaEnriquecido[]>([]);
  const [query, setQuery]               = useState('');
  const [loadingCitas, setLoadingCitas] = useState(true);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [buscando, setBuscando]         = useState(false);

  const fechaHoy = new Date().toLocaleDateString('es-CO', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  });

  const enriquecer = useCallback(async (dep: Deportista): Promise<DeportistaEnriquecido> => {
    try {
      const res = await historiaClinicaService.getAll(1, 1000);
      const arr: any[] = Array.isArray(res) ? res : (res as any)?.items ?? [];
      const h = arr.find((x: any) => x.deportista_id === dep.id);
      return { ...dep, tieneHistoria: !!h, historiaId: h?.id };
    } catch {
      return { ...dep, tieneHistoria: false };
    }
  }, []);

  // Cargar deportistas con cita hoy
  useEffect(() => {
    const cargar = async () => {
      try {
        setLoadingCitas(true);
        const ahora = new Date();
        const hoy = `${ahora.getFullYear()}-${String(ahora.getMonth()+1).padStart(2,'0')}-${String(ahora.getDate()).padStart(2,'0')}`;
        const citas = await citasService.getAll();
        const arr: any[] = Array.isArray(citas) ? citas : (citas as any)?.items ?? [];
        const deHoy = arr.filter((c: any) => (c.fecha ?? '').split('T')[0] === hoy);
        const ids = [...new Set(deHoy.map((c: any) => c.deportista_id).filter(Boolean))] as string[];

        const deps = await Promise.all(
          ids.map(async (id) => {
            try {
              const dep = await deportistasService.getById(id);
              const enr = await enriquecer(dep);
              return { ...enr, tieneCitaHoy: true };
            } catch { return null; }
          })
        );
        setCitasHoy(deps.filter(Boolean) as DeportistaEnriquecido[]);
      } catch (e) {
        console.error('Error citas hoy:', e);
      } finally {
        setLoadingCitas(false);
      }
    };
    cargar();
  }, [enriquecer]);

  // Buscar deportistas
  useEffect(() => {
    if (!query.trim() || query.trim().length < 3) { setResultados([]); setBuscando(false); return; }
    setBuscando(true);
    const timer = setTimeout(async () => {
      try {
        setLoadingSearch(true);
        const res = await deportistasService.search(query);
        const enriquecidos = await Promise.all(res.map(enriquecer));
        setResultados(enriquecidos);
      } catch { setResultados([]); }
      finally { setLoadingSearch(false); }
    }, 350);
    return () => clearTimeout(timer);
  }, [query, enriquecer]);

  const DeportistaCard = ({ dep }: { dep: DeportistaEnriquecido }) => (
    <button
      onClick={() => onSelect(dep)}
      style={{
        display: 'flex', alignItems: 'center', gap: 14,
        padding: '12px 16px', background: '#fff',
        border: '1px solid #e2e8f0', borderRadius: 12,
        cursor: 'pointer', textAlign: 'left', width: '100%',
        transition: 'all 0.15s',
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.background = '#EEF3FB';
        (e.currentTarget as HTMLElement).style.borderColor = '#bfdbfe';
        (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)';
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.background = '#fff';
        (e.currentTarget as HTMLElement).style.borderColor = '#e2e8f0';
        (e.currentTarget as HTMLElement).style.transform = 'none';
      }}
    >
      <div style={{
        width: 42, height: 42, borderRadius: '50%',
        background: dep.tieneCitaHoy ? '#1F4788' : '#64748b',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#fff', fontSize: 14, fontWeight: 700, flexShrink: 0,
      }}>
        {dep.nombres?.charAt(0)}{dep.apellidos?.charAt(0)}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: '#0f172a' }}>
          {dep.nombres} {dep.apellidos}
        </p>
        <p style={{ margin: '2px 0 0', fontSize: 12, color: '#64748b' }}>
          Doc: {dep.numero_documento}
          {dep.tipo_deporte ? ` · ${dep.tipo_deporte}` : ''}
        </p>
      </div>

      <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
        {dep.tieneCitaHoy && (
          <span style={{ fontSize: 11, padding: '3px 9px', background: '#dbeafe', color: '#1e40af', borderRadius: 20, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
            <Clock size={11} /> Cita hoy
          </span>
        )}
        {dep.tieneHistoria ? (
          <span style={{ fontSize: 11, padding: '3px 9px', background: '#d1fae5', color: '#065f46', borderRadius: 20, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
            <FileText size={11} /> Con historia
          </span>
        ) : (
          <span style={{ fontSize: 11, padding: '3px 9px', background: '#fef3c7', color: '#92400e', borderRadius: 20, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
            <Plus size={11} /> Nueva
          </span>
        )}
      </div>
    </button>
  );

  return (
    <div style={{ maxWidth: 680, margin: '0 auto' }}>

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ margin: '0 0 4px', fontSize: 20, fontWeight: 700, color: '#0f172a' }}>
          Nueva historia clínica
        </h2>
        <p style={{ margin: 0, fontSize: 13, color: '#64748b' }}>
          Selecciona el deportista para crear o continuar su historia
        </p>
      </div>

      {/* Buscador */}
      <div style={{ position: 'relative', marginBottom: 24 }}>
        <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Buscar por nombre, documento o deporte..."
          autoFocus
          style={{
            width: '100%', padding: '11px 14px 11px 40px',
            border: '1px solid #e2e8f0', borderRadius: 10,
            fontSize: 14, color: '#0f172a', background: '#fff',
            outline: 'none', boxSizing: 'border-box',
            boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
          }}
          onFocus={e => { e.currentTarget.style.borderColor = '#1F4788'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(31,71,136,0.1)'; }}
          onBlur={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.06)'; }}
        />
        {loadingSearch && (
          <div style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, border: '2px solid #1F4788', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
        )}
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {/* Resultados búsqueda */}
      {buscando && (
        <div>
          <p style={{ fontSize: 12, fontWeight: 600, color: '#64748b', margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {loadingSearch ? 'Buscando...' : `${resultados.length} resultado(s)`}
          </p>
          {!loadingSearch && resultados.length === 0 && (
            <div style={{ textAlign: 'center', padding: '32px 0', color: '#94a3b8', background: '#f8fafc', borderRadius: 12, border: '1px dashed #e2e8f0' }}>
              <p style={{ margin: 0, fontSize: 13 }}>No se encontraron deportistas</p>
            </div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {resultados.map(dep => <DeportistaCard key={dep.id} dep={dep} />)}
          </div>
        </div>
      )}

      {/* Citas de hoy — solo si no está buscando */}
      {!buscando && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <Calendar size={15} style={{ color: '#1F4788' }} />
            <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Citas de hoy
            </p>
            <span style={{ fontSize: 11, color: '#94a3b8', marginLeft: 4, textTransform: 'none', fontWeight: 400 }}>
              {new Date().toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' })}
            </span>
          </div>

          {loadingCitas ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '16px 0', color: '#94a3b8' }}>
              <div style={{ width: 16, height: 16, border: '2px solid #1F4788', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
              <span style={{ fontSize: 13 }}>Cargando citas del día...</span>
            </div>
          ) : citasHoy.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '28px 0', color: '#94a3b8', background: '#f8fafc', borderRadius: 12, border: '1px dashed #e2e8f0' }}>
              <Calendar size={28} style={{ margin: '0 auto 8px', opacity: 0.3 }} />
              <p style={{ margin: 0, fontSize: 13 }}>No hay citas programadas para hoy</p>
              <p style={{ margin: '4px 0 0', fontSize: 12, color: '#cbd5e1' }}>Usa el buscador para encontrar un deportista</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {citasHoy.map(dep => <DeportistaCard key={dep.id} dep={dep} />)}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SelectDeportista;