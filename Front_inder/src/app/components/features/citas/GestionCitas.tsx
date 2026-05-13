// ============================================================
// GESTIÓN DE CITAS — WAP Enterprise SAS / INDERHUILA
// ============================================================
import { useState, useEffect, useCallback } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { toast } from 'sonner';
import { Plus, X } from 'lucide-react';
import { api, deportistasService } from '@/app/services/apiClient';
import { useCatalogos } from '@/app/hooks/customHooks';

const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales: { es } });

const T = {
  primary:      '#1F4788',
  primaryLight: '#EEF3FB',
  surface:      '#ffffff',
  surfaceAlt:   '#f8fafc',
  border:       '#e2e8f0',
  borderLight:  '#f1f5f9',
  textPrimary:  '#0f172a',
  textSecondary:'#475569',
  textMuted:    '#94a3b8',
  radius:       '12px',
  radiusSm:     '8px',
  shadow:       '0 1px 3px rgba(0,0,0,0.06)',
  shadowMd:     '0 4px 16px rgba(31,71,136,0.08)',
};

interface Medico { id: string; nombre_completo: string; rol: string | null; email: string | null; }
interface Slot { hora: string; libre: boolean; cita?: { id: string; deportista: string; tipo: string; estado: string } | null; }
interface Cita {
  id: string; deportista_id: string; medico_id: string | null;
  fecha: string; hora: string; tipo_cita_id: string; estado_cita_id: string;
  observaciones?: string;
  tipo_cita?: { nombre: string }; estado_cita?: { nombre: string };
  deportista?: { id: string; nombres: string; apellidos: string; numero_documento: string };
  medico?: { id: string; nombre_completo: string } | null;
}
interface Deportista { id: string; nombres: string; apellidos: string; numero_documento: string; }

const colorEstado = (e?: string) => {
  if (!e) return { bg: '#F1F5F9', text: '#475569' };
  const l = e.toLowerCase();
  if (l.includes('program'))  return { bg: '#FEF9C3', text: '#854D0E' };
  if (l.includes('confirm'))  return { bg: '#D1FAE5', text: '#065F46' };
  if (l.includes('atenid') || l.includes('realiz')) return { bg: '#DBEAFE', text: '#1E40AF' };
  if (l.includes('cancel'))   return { bg: '#FEE2E2', text: '#991B1B' };
  if (l.includes('present'))  return { bg: '#FFEDD5', text: '#9A3412' };
  return { bg: '#F1F5F9', text: '#475569' };
};

export function GestionCitas() {
  const { tiposCita, estadosCita } = useCatalogos();
  const [citas,        setCitas]        = useState<Cita[]>([]);
  const [medicos,      setMedicos]      = useState<Medico[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [guardando,    setGuardando]    = useState(false);
  const [busqueda,     setBusqueda]     = useState('');
  const [resultados,   setResultados]   = useState<Deportista[]>([]);
  const [buscando,     setBuscando]     = useState(false);
  const [deportistaSeleccionado, setDeportistaSeleccionado] = useState<Deportista | null>(null);
  const [slots,         setSlots]         = useState<Slot[]>([]);
  const [cargandoSlots, setCargandoSlots] = useState(false);
  const [formData, setFormData] = useState({
    medico_id: '', fecha: '', hora: '', tipo_cita_id: '', estado_cita_id: '', observaciones: '',
  });

  const cargarCitas = useCallback(async () => {
    try {
      setLoading(true);
      const res  = await api.get('/citas/');
      const data = res.data;
      setCitas(Array.isArray(data) ? data : data.items || []);
    } catch { toast.error('Error cargando citas'); }
    finally { setLoading(false); }
  }, []);

  const cargarMedicos = useCallback(async () => {
    try {
      const res = await api.get('/citas/medicos');
      setMedicos(res.data || []);
    } catch { console.warn('No se pudieron cargar los médicos'); }
  }, []);

  useEffect(() => { cargarCitas(); cargarMedicos(); }, [cargarCitas, cargarMedicos]);

  // Usa deportistasService.search — axios con token automático
  useEffect(() => {
    if (busqueda.length < 2) { setResultados([]); return; }
    const t = setTimeout(async () => {
      try {
        setBuscando(true);
        const data = await deportistasService.search(busqueda);
        setResultados(Array.isArray(data) ? data : []);
      } catch { setResultados([]); }
      finally { setBuscando(false); }
    }, 300);
    return () => clearTimeout(t);
  }, [busqueda]);

  useEffect(() => {
    if (!formData.medico_id || !formData.fecha) { setSlots([]); return; }
    const cargar = async () => {
      try {
        setCargandoSlots(true);
        const res = await api.get('/citas/agenda', { params: { medico_id: formData.medico_id, fecha: formData.fecha } });
        setSlots(res.data.slots || []);
      } catch { setSlots([]); }
      finally { setCargandoSlots(false); }
    };
    cargar();
  }, [formData.medico_id, formData.fecha]);

  const abrirModal = () => {
    setFormData({ medico_id: '', fecha: format(new Date(), 'yyyy-MM-dd'), hora: '', tipo_cita_id: tiposCita?.[0]?.id || '', estado_cita_id: estadosCita?.[0]?.id || '', observaciones: '' });
    setDeportistaSeleccionado(null); setBusqueda(''); setResultados([]); setSlots([]);
    setModalAbierto(true);
  };

  const guardar = async () => {
    if (!deportistaSeleccionado) { toast.error('Selecciona un deportista'); return; }
    if (!formData.fecha)          { toast.error('Selecciona una fecha'); return; }
    if (!formData.hora)           { toast.error('Selecciona una hora'); return; }
    if (!formData.tipo_cita_id)   { toast.error('Selecciona el tipo de cita'); return; }
    if (!formData.estado_cita_id) { toast.error('Selecciona el estado'); return; }
    try {
      setGuardando(true);
      await api.post('/citas/', {
        deportista_id: deportistaSeleccionado.id, medico_id: formData.medico_id || null,
        fecha: formData.fecha, hora: formData.hora, tipo_cita_id: formData.tipo_cita_id,
        estado_cita_id: formData.estado_cita_id, observaciones: formData.observaciones || null,
      });
      toast.success('Cita agendada correctamente');
      setModalAbierto(false); cargarCitas();
    } catch (e: any) { toast.error(e?.response?.data?.detail || 'Error al guardar la cita'); }
    finally { setGuardando(false); }
  };

  const eventos = citas.map(c => {
    const [h, m] = c.hora.split(':').map(Number);
    const start  = new Date(c.fecha + 'T00:00:00'); start.setHours(h, m);
    const end    = new Date(start); end.setMinutes(end.getMinutes() + 30);
    return { id: c.id, title: `${c.deportista?.nombres || ''} ${c.deportista?.apellidos || ''}`, start, end, resource: c };
  });

  const eventStyle = (ev: any) => {
    const { bg, text } = colorEstado(ev.resource?.estado_cita?.nombre);
    return { style: { backgroundColor: bg, color: text, borderRadius: 6, border: 'none', fontSize: 12, padding: '2px 6px' } };
  };

  const hoy = new Date();
  const inicioSemana = startOfWeek(hoy, { weekStartsOn: 1 });
  const finSemana = new Date(inicioSemana); finSemana.setDate(finSemana.getDate() + 6);
  const citasSemana = citas
    .filter(c => { const f = new Date(c.fecha + 'T12:00:00'); return f >= inicioSemana && f <= finSemana; })
    .sort((a, b) => (a.fecha + a.hora).localeCompare(b.fecha + b.hora));

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', flexDirection: 'column', gap: 12 }}>
      <div style={{ width: 28, height: 28, borderRadius: '50%', border: `3px solid ${T.primaryLight}`, borderTopColor: T.primary, animation: 'spin 0.8s linear infinite' }} />
      <p style={{ fontSize: 13, color: T.textMuted, margin: 0 }}>Cargando citas...</p>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  const labelStyle: React.CSSProperties = { display: 'block', fontSize: 12, fontWeight: 600, color: T.textSecondary, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' };
  const inputStyle: React.CSSProperties = { width: '100%', padding: '10px 14px', border: `1px solid ${T.border}`, borderRadius: T.radiusSm, fontSize: 14, outline: 'none', boxSizing: 'border-box' };
  const selectStyle: React.CSSProperties = { ...inputStyle, background: T.surface };

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 0 40px' }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} .rbc-event{border-radius:6px!important;}`}</style>

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: T.primary }}>Gestión de Citas</h1>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: T.textMuted }}>Agenda y consulta las citas médicas de los deportistas</p>
        </div>
        <button onClick={abrirModal} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', background: T.primary, color: '#fff', border: 'none', borderRadius: T.radiusSm, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
          <Plus size={16} /> Agendar Cita
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20, alignItems: 'start' }}>
        <div style={{ background: T.surface, borderRadius: T.radius, border: `1px solid ${T.border}`, padding: 20, boxShadow: T.shadow }}>
          <Calendar localizer={localizer} events={eventos} startAccessor="start" endAccessor="end" style={{ height: 560 }} culture="es" eventPropGetter={eventStyle}
            messages={{ next: 'Sig.', previous: 'Ant.', today: 'Hoy', month: 'Mes', week: 'Semana', day: 'Día', agenda: 'Agenda', date: 'Fecha', time: 'Hora', event: 'Cita', noEventsInRange: 'Sin citas', showMore: (n: number) => `+${n} más` }} />
        </div>

        <div style={{ background: T.surface, borderRadius: T.radius, border: `1px solid ${T.border}`, boxShadow: T.shadow, overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: `1px solid ${T.borderLight}`, background: T.surfaceAlt }}>
            <h2 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: T.textPrimary }}>Citas esta semana</h2>
            <p style={{ margin: '2px 0 0', fontSize: 11, color: T.textMuted }}>{citasSemana.length} cita{citasSemana.length !== 1 ? 's' : ''}</p>
          </div>
          <div style={{ maxHeight: 540, overflowY: 'auto' }}>
            {citasSemana.length === 0 ? (
              <p style={{ padding: 20, fontSize: 13, color: T.textMuted, fontStyle: 'italic', margin: 0 }}>Sin citas esta semana</p>
            ) : citasSemana.map(c => {
              const { bg, text } = colorEstado(c.estado_cita?.nombre);
              const esHoy = isSameDay(new Date(c.fecha + 'T12:00:00'), hoy);
              return (
                <div key={c.id} style={{ padding: '12px 20px', borderBottom: `1px solid ${T.borderLight}`, background: esHoy ? T.primaryLight : T.surface }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: T.textPrimary, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {c.deportista?.nombres} {c.deportista?.apellidos}
                      </p>
                      <p style={{ margin: '2px 0 0', fontSize: 11, color: T.textMuted }}>
                        {format(new Date(c.fecha + 'T12:00:00'), 'EEE d MMM', { locale: es })} · {c.hora.slice(0, 5)}
                      </p>
                      {c.medico && <p style={{ margin: '2px 0 0', fontSize: 11, color: T.textSecondary }}>Dr. {c.medico.nombre_completo}</p>}
                    </div>
                    <span style={{ fontSize: 10, fontWeight: 600, padding: '3px 8px', borderRadius: 12, background: bg, color: text, whiteSpace: 'nowrap', flexShrink: 0 }}>
                      {c.estado_cita?.nombre || '—'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {modalAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(15,23,42,0.55)' }} onClick={() => setModalAbierto(false)}>
          <div style={{ background: T.surface, borderRadius: T.radius, width: '100%', maxWidth: 640, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }} onClick={e => e.stopPropagation()}>

            <div style={{ background: T.primary, padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#fff' }}>Nueva Cita</h3>
                <p style={{ margin: '3px 0 0', fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>Completa los datos para agendar</p>
              </div>
              <button onClick={() => setModalAbierto(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.8)', display: 'flex' }}><X size={18} /></button>
            </div>

            <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>

              {/* Deportista */}
              <div>
                <label style={labelStyle}>Deportista *</label>
                {deportistaSeleccionado ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: T.primaryLight, borderRadius: T.radiusSm, border: '1px solid #BFDBFE' }}>
                    <div>
                      <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: T.primary }}>{deportistaSeleccionado.nombres} {deportistaSeleccionado.apellidos}</p>
                      <p style={{ margin: '2px 0 0', fontSize: 12, color: T.textMuted }}>Doc: {deportistaSeleccionado.numero_documento}</p>
                    </div>
                    <button onClick={() => { setDeportistaSeleccionado(null); setBusqueda(''); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.textMuted }}><X size={16} /></button>
                  </div>
                ) : (
                  <div style={{ position: 'relative' }}>
                    <input value={busqueda} onChange={e => setBusqueda(e.target.value)} placeholder="Buscar por nombre o documento..." style={inputStyle} />
                    {resultados.length > 0 && (
                      <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: T.surface, border: `1px solid ${T.border}`, borderRadius: T.radiusSm, boxShadow: T.shadowMd, zIndex: 10, maxHeight: 200, overflowY: 'auto' }}>
                        {resultados.map(d => (
                          <button key={d.id}
                            onMouseDown={e => e.preventDefault()}
                            onClick={() => { setDeportistaSeleccionado(d); setBusqueda(''); setResultados([]); }}
                            style={{ display: 'block', width: '100%', padding: '10px 14px', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', borderBottom: `1px solid ${T.borderLight}` }}>
                            <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: T.textPrimary }}>{d.nombres} {d.apellidos}</p>
                            <p style={{ margin: '2px 0 0', fontSize: 11, color: T.textMuted }}>Doc: {d.numero_documento}</p>
                          </button>
                        ))}
                      </div>
                    )}
                    {buscando && <p style={{ fontSize: 12, color: T.textMuted, marginTop: 4 }}>Buscando...</p>}
                  </div>
                )}
              </div>

              {/* Médico */}
              <div>
                <label style={labelStyle}>Médico / Profesional</label>
                <select value={formData.medico_id} onChange={e => setFormData(f => ({ ...f, medico_id: e.target.value, hora: '' }))} style={selectStyle}>
                  <option value="">— Sin asignar —</option>
                  {medicos.map(m => <option key={m.id} value={m.id}>{m.nombre_completo}{m.rol ? ` (${m.rol})` : ''}</option>)}
                </select>
              </div>

              {/* Fecha y hora */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={labelStyle}>Fecha *</label>
                  <input type="date" value={formData.fecha} onChange={e => setFormData(f => ({ ...f, fecha: e.target.value, hora: '' }))} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Hora *</label>
                  <input type="time" value={formData.hora} onChange={e => setFormData(f => ({ ...f, hora: e.target.value }))} style={inputStyle} />
                </div>
              </div>

              {/* Disponibilidad */}
              {(formData.medico_id && formData.fecha) && (
                <div>
                  <label style={labelStyle}>Disponibilidad del médico</label>
                  {cargandoSlots ? (
                    <p style={{ fontSize: 12, color: T.textMuted, margin: 0 }}>Cargando agenda...</p>
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(76px, 1fr))', gap: 6 }}>
                      {slots.map(slot => (
                        <button key={slot.hora} disabled={!slot.libre}
                          onMouseDown={e => e.preventDefault()}
                          onClick={() => slot.libre && setFormData(f => ({ ...f, hora: slot.hora }))}
                          title={!slot.libre && slot.cita ? `${slot.cita.deportista} — ${slot.cita.tipo}` : slot.hora}
                          style={{ padding: '8px 4px', borderRadius: T.radiusSm, textAlign: 'center', fontSize: 12, fontWeight: formData.hora === slot.hora ? 700 : 500, cursor: slot.libre ? 'pointer' : 'not-allowed',
                            border: `1.5px solid ${formData.hora === slot.hora ? T.primary : slot.libre ? T.border : '#FCA5A5'}`,
                            background: formData.hora === slot.hora ? T.primaryLight : slot.libre ? T.surface : '#FEF2F2',
                            color: formData.hora === slot.hora ? T.primary : slot.libre ? T.textSecondary : '#DC2626' }}>
                          {slot.hora}
                          <div style={{ fontSize: 9, marginTop: 2, opacity: 0.75 }}>{slot.libre ? '✓ libre' : '✗ ocup.'}</div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Tipo y estado */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={labelStyle}>Tipo de cita *</label>
                  <select value={formData.tipo_cita_id} onChange={e => setFormData(f => ({ ...f, tipo_cita_id: e.target.value }))} style={selectStyle}>
                    <option value="">Seleccionar...</option>
                    {tiposCita?.map((t: any) => <option key={t.id} value={t.id}>{t.nombre}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Estado *</label>
                  <select value={formData.estado_cita_id} onChange={e => setFormData(f => ({ ...f, estado_cita_id: e.target.value }))} style={selectStyle}>
                    <option value="">Seleccionar...</option>
                    {estadosCita?.map((e: any) => <option key={e.id} value={e.id}>{e.nombre}</option>)}
                  </select>
                </div>
              </div>

              {/* Observaciones */}
              <div>
                <label style={labelStyle}>Observaciones</label>
                <textarea value={formData.observaciones} onChange={e => setFormData(f => ({ ...f, observaciones: e.target.value }))}
                  rows={3} placeholder="Notas adicionales..."
                  style={{ ...inputStyle, resize: 'vertical' }} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, paddingTop: 8, borderTop: `1px solid ${T.borderLight}` }}>
                <button onClick={() => setModalAbierto(false)} style={{ padding: '10px 20px', background: T.surfaceAlt, border: `1px solid ${T.border}`, borderRadius: T.radiusSm, fontSize: 14, cursor: 'pointer', color: T.textSecondary }}>Cancelar</button>
                <button onClick={guardar} disabled={guardando} style={{ padding: '10px 24px', background: T.primary, color: '#fff', border: 'none', borderRadius: T.radiusSm, fontSize: 14, fontWeight: 600, cursor: guardando ? 'not-allowed' : 'pointer', opacity: guardando ? 0.7 : 1 }}>
                  {guardando ? 'Guardando...' : 'Agendar Cita'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default GestionCitas;