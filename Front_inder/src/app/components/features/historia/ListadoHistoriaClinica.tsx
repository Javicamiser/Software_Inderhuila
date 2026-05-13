import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SelectDeportista } from '@/app/components/features/deportistas/SelectDeportista';
import { HistoriaClinica } from '@/app/components/features/historia/HistoriaClinica';
import type { Deportista } from '@/app/services/apiClient';
import { deportistasService, historiaClinicaService } from '@/app/services/apiClient';
import { toast } from 'sonner';
import { Plus, ChevronDown, ChevronUp, Search, Loader, Eye, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface HistoriaDeportista {
  id: string;
  fecha_apertura: string;
  created_at: string;
  tipo_cita?: string;
  motivo_consulta?: Array<{ motivo_consulta?: string; tipo_consulta?: string; factor_desencadenante?: string }> | null;
}

interface DeportistaConHistorias {
  id: string;
  nombres: string;
  apellidos: string;
  numero_documento: string;
  historias: HistoriaDeportista[];
  expandido: boolean;
}

export function ListadoHistoriaClinica() {
  const navigate = useNavigate();
  const [deportistas, setDeportistas] = useState<DeportistaConHistorias[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [confirmandoEliminar, setConfirmandoEliminar] = useState<{id:string;nombre:string} | null>(null);
  const [vista, setVista] = useState<'listado' | 'seleccion' | 'formulario'>('listado');
  const [deportistaSeleccionado, setDeportistaSeleccionado] = useState<Deportista | null>(null);
  const [citaSeleccionada, setCitaSeleccionada] = useState<{tipo_cita?: {nombre:string};id?:string} | undefined>(undefined);

  useEffect(() => { cargarDatos(); }, []);

  const cargarDatos = async () => {
    try {
      setIsLoading(true);
      const [depRes, histRes] = await Promise.all([
        deportistasService.getAll(1, 10000),
        historiaClinicaService.getAll(1, 10000),
      ]);

      const deps: any[] = Array.isArray(depRes) ? depRes : (depRes as any)?.items ?? [];
      const hists: any[] = Array.isArray(histRes) ? histRes : (histRes as any)?.items ?? [];

      const lista: DeportistaConHistorias[] = deps
        .map(d => ({
          ...d,
          historias: hists
            .filter(h => h.deportista_id === d.id)
            .sort((a, b) => new Date(b.fecha_apertura + 'T00:00:00').getTime() - new Date(a.fecha_apertura + 'T00:00:00').getTime()),
          expandido: false,
        }))
        .filter(d => d.historias.length > 0);

      setDeportistas(lista);
    } catch {
      toast.error('Error cargando datos');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleExpandido = (id: string) =>
    setDeportistas(prev => prev.map(d => d.id === id ? { ...d, expandido: !d.expandido } : d));

  const handleEliminar = async (historiaId: string) => {
    try {
      setIsLoading(true);
      await historiaClinicaService.delete(historiaId);
      setConfirmandoEliminar(null);
      toast.success('Historia eliminada');
      // Recargar sin colapsar - actualizar solo las historias del deportista afectado
      const histRes = await historiaClinicaService.getAll(1, 10000);
      const hists: any[] = Array.isArray(histRes) ? histRes : (histRes as any)?.items ?? [];
      setDeportistas(prev => prev.map(d => ({
        ...d,
        historias: hists
          .filter((h: any) => h.deportista_id === d.id)
          .sort((a: any, b: any) => new Date(b.fecha_apertura + 'T00:00:00').getTime() - new Date(a.fecha_apertura + 'T00:00:00').getTime()),
      })).filter(d => d.historias.length > 0));
    } catch {
      toast.error('Error al eliminar');
    } finally {
      setIsLoading(false);
    }
  };

  const filtrados = deportistas.filter(d => {
    const q = searchQuery.toLowerCase();
    return d.nombres.toLowerCase().includes(q) || d.apellidos.toLowerCase().includes(q) || d.numero_documento.includes(q);
  });

  if (isLoading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', flexDirection: 'column', gap: 12 }}>
      <Loader size={28} style={{ color: '#1F4788', animation: 'spin 0.8s linear infinite' }} />
      <p style={{ color: '#64748b', fontSize: 13 }}>Cargando historias...</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  if (vista === 'seleccion') {
    return (
      <div>
        <button
          onClick={() => setVista('listado')}
          style={{ display:'flex', alignItems:'center', gap:8, marginBottom:20, padding:'8px 16px', background:'#f8fafc', border:'1px solid #e2e8f0', borderRadius:8, cursor:'pointer', fontSize:13, color:'#475569' }}
        >
          <span style={{fontSize:16}}>←</span> Volver
        </button>
        <SelectDeportista
          onSelect={(dep, cita) => {
            setDeportistaSeleccionado(dep);
            setCitaSeleccionada(cita);
            setVista('formulario');
          }}
        />
      </div>
    );
  }

  if (vista === 'formulario' && deportistaSeleccionado) {
    return (
      <div>
        <button
          onClick={() => setVista('seleccion')}
          style={{ display:'flex', alignItems:'center', gap:8, marginBottom:20, padding:'8px 16px', background:'#f8fafc', border:'1px solid #e2e8f0', borderRadius:8, cursor:'pointer', fontSize:13, color:'#475569' }}
        >
          <span style={{fontSize:16}}>←</span> Cambiar deportista
        </button>
        <HistoriaClinica
          deportista={deportistaSeleccionado}
          tipoCitaInicial={citaSeleccionada?.tipo_cita?.nombre}
          onBack={() => setVista('listado')}
          onSuccess={() => { setVista('listado'); cargarDatos(); }}
        />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#0f172a' }}>Historias Clínicas</h2>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: '#64748b' }}>
            Gestiona el registro de todas las historias clínicas
          </p>
        </div>
        <button
          onClick={() => setVista('seleccion')}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '9px 18px', background: '#1F4788', color: '#fff',
            border: 'none', borderRadius: 8, cursor: 'pointer',
            fontSize: 13, fontWeight: 600,
          }}
        >
          <Plus size={16} /> Nueva Historia
        </button>
      </div>

      {/* Búsqueda */}
      <div style={{ position: 'relative' }}>
        <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
        <input
          type="text"
          placeholder="Buscar por nombre, apellido o documento..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          style={{
            width: '100%', padding: '9px 12px 9px 36px',
            border: '1px solid #e2e8f0', borderRadius: 8,
            fontSize: 13, color: '#0f172a', background: '#fff',
            outline: 'none', boxSizing: 'border-box',
          }}
        />
      </div>

      {/* Listado */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {filtrados.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 0', color: '#94a3b8', background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0' }}>
            <p style={{ margin: 0, fontSize: 14 }}>
              {searchQuery ? 'No hay coincidencias' : 'No hay historias clínicas registradas'}
            </p>
          </div>
        ) : filtrados.map(depo => (
          <div key={depo.id} style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', overflow: 'hidden' }}>

            {/* Fila deportista */}
            <button
              onClick={() => toggleExpandido(depo.id)}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                width: '100%', padding: '14px 20px',
                background: depo.expandido ? '#EEF3FB' : '#fff',
                border: 'none', cursor: 'pointer', transition: 'background 0.15s',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{
                  width: 42, height: 42, borderRadius: '50%', background: '#1F4788',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', fontSize: 14, fontWeight: 700, flexShrink: 0,
                }}>
                  {depo.nombres.charAt(0)}{depo.apellidos.charAt(0)}
                </div>
                <div style={{ textAlign: 'left' }}>
                  <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: '#0f172a' }}>
                    {depo.nombres} {depo.apellidos}
                  </p>
                  <p style={{ margin: '2px 0 0', fontSize: 12, color: '#64748b' }}>
                    Doc: {depo.numero_documento} · {depo.historias.length} historia(s)
                  </p>
                </div>
              </div>
              {depo.expandido
                ? <ChevronUp size={18} style={{ color: '#64748b', flexShrink: 0 }} />
                : <ChevronDown size={18} style={{ color: '#64748b', flexShrink: 0 }} />
              }
            </button>

            {/* Tabla historias */}
            {depo.expandido && (
              <div style={{ borderTop: '1px solid #e2e8f0', overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#EEF3FB' }}>
                      {['Tipo', 'Fecha Apertura', 'Fecha Creación', 'Acciones'].map(h => (
                        <th key={h} style={{ padding: '10px 20px', textAlign: h === 'Acciones' ? 'center' : 'left', fontSize: 12, fontWeight: 600, color: '#475569' }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {depo.historias.map((hist, idx) => (
                      <tr key={hist.id} style={{ background: idx % 2 === 0 ? '#fff' : '#f8fafc', borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '12px 20px' }}>
                          <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20, background: '#EEF3FB', color: '#1F4788' }}>
                            {(() => {
              const m = Array.isArray(hist.motivo_consulta) ? hist.motivo_consulta[0] : hist.motivo_consulta;
              const fd = m?.factor_desencadenante ?? '';
              const tc = fd.startsWith('TIPO_CONSULTA:') ? fd.replace('TIPO_CONSULTA:', '') : (m?.tipo_consulta ?? '');
              return tc || hist.tipo_cita || 'Consulta';
            })()}
                          </span>
                        </td>
                        <td style={{ padding: '12px 20px', fontSize: 13, color: '#475569' }}>
                          {hist.fecha_apertura ? format(new Date(hist.fecha_apertura + 'T00:00:00'), 'd MMM yyyy', { locale: es }) : '-'}
                        </td>
                        <td style={{ padding: '12px 20px', fontSize: 13, color: '#475569' }}>
                          {hist.created_at ? format(new Date(hist.created_at.endsWith('Z') ? hist.created_at : hist.created_at + 'Z'), 'd MMM yyyy HH:mm', { locale: es }) : '-'}
                        </td>
                        <td style={{ padding: '12px 20px', textAlign: 'center' }}>
                          <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                            <button
                              onClick={() => navigate(`/historia/${hist.id}`)}
                              title="Ver historia"
                              style={{ padding: 7, borderRadius: 8, border: 'none', background: '#EEF3FB', color: '#1F4788', cursor: 'pointer' }}
                            >
                              <Eye size={15} />
                            </button>
                            <button onClick={() => setConfirmandoEliminar({id:hist.id, nombre:`${depo.nombres} ${depo.apellidos}`})}
                                title="Eliminar historia"
                                style={{ padding: 7, borderRadius: 8, border: 'none', background: '#fef2f2', color: '#ef4444', cursor: 'pointer' }}>
                                <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ))}
      </div>

      {filtrados.length > 0 && (
        <p style={{ margin: 0, fontSize: 12, color: '#94a3b8' }}>
          Mostrando {filtrados.length} deportista(s) con historias clínicas
        </p>
      )}
      {/* MODAL CONFIRMAR ELIMINAR */}
      {confirmandoEliminar && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.4)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:200 }}
          onClick={() => setConfirmandoEliminar(null)}>
          <div style={{ background:'#fff', borderRadius:12, padding:28, maxWidth:400, width:'100%', margin:16, boxShadow:'0 20px 60px rgba(0,0,0,0.2)' }}
            onClick={e => e.stopPropagation()}>
            <h3 style={{ margin:'0 0 8px', fontSize:16, fontWeight:700, color:'#0f172a' }}>¿Eliminar historia clínica?</h3>
            <p style={{ margin:'0 0 20px', fontSize:13, color:'#475569' }}>
              Historia de <strong>{confirmandoEliminar.nombre}</strong>. Esta acción no se puede deshacer.
            </p>
            <div style={{ display:'flex', gap:10 }}>
              <button onClick={() => setConfirmandoEliminar(null)}
                style={{ flex:1, padding:'10px', background:'#f8fafc', border:'1px solid #e2e8f0', borderRadius:8, cursor:'pointer', fontSize:13, fontWeight:600, color:'#475569' }}>
                Cancelar
              </button>
              <button onClick={() => handleEliminar(confirmandoEliminar.id)}
                style={{ flex:1, padding:'10px', background:'#ef4444', border:'none', borderRadius:8, cursor:'pointer', fontSize:13, fontWeight:600, color:'#fff' }}>
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ListadoHistoriaClinica;