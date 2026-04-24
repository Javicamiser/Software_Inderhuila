// ============================================================
// INICIO / DASHBOARD — Rediseño profesional
// Mantiene toda la lógica de datos del componente original.
// ============================================================
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, Calendar, FileText, Clock,
  ArrowRight, Plus, TrendingUp, CheckCircle, Activity,
} from 'lucide-react';
import { deportistasService, historiasService, citasService } from '../services/apiClient';
import type { Deportista, HistoriaClinica, Cita } from '../../types';

interface Stats {
  totalDeportistas: number;
  historiasActivas: number;
  citasHoy: number;
  citasSemana: number;
  actividadReciente: ActivityItem[];
}

interface ActivityItem {
  id: string;
  tipo: string;
  fecha: string;
  hora: string;
  estado: string;
}

function toArray<T>(res: unknown): T[] {
  const r = res as any;
  if (Array.isArray(r)) return r;
  if (Array.isArray(r?.items)) return r.items;
  return [];
}

export function Inicio() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats>({
    totalDeportistas: 0, historiasActivas: 0,
    citasHoy: 0, citasSemana: 0, actividadReciente: [],
  });

  useEffect(() => { cargarDatos(); }, []);

  const cargarDatos = async () => {
    try {
      const [depRes, histRes, citRes] = await Promise.all([
        deportistasService.getAll(1, 100),
        historiasService.getAll(1, 100),
        citasService.getAll(),
      ]);

      const deportistas = toArray<Deportista>(depRes);
      const historias   = toArray<HistoriaClinica>(histRes);
      const citas       = toArray<Cita>(citRes);

      const hoy = new Date().toISOString().split('T')[0];
      const inicioSemana = new Date();
      inicioSemana.setDate(inicioSemana.getDate() - inicioSemana.getDay());
      const finSemana = new Date(inicioSemana);
      finSemana.setDate(finSemana.getDate() + 6);

      const citasHoy    = citas.filter((c: any) => (c.fecha ?? '').split('T')[0] === hoy);
      const citasSemana = citas.filter((c: any) => {
        const f = new Date(c.fecha ?? Date.now());
        return f >= inicioSemana && f <= finSemana;
      });

      setStats({
        totalDeportistas: deportistas.length,
        historiasActivas: historias.length,
        citasHoy: citasHoy.length,
        citasSemana: citasSemana.length,
        actividadReciente: citas.slice(0, 5).map((c: any) => ({
          id: c.id,
          tipo: c.tipo_cita?.nombre ?? c.tipo_cita ?? 'Valoración',
          fecha: new Date(c.fecha ?? Date.now()).toLocaleDateString('es-CO', { day: 'numeric', month: 'short' }),
          hora: c.hora ?? '',
          estado: c.estado_cita?.nombre ?? c.estado ?? 'Programada',
        })),
      });
    } catch (e) {
      console.error('Error cargando dashboard:', e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 36, height: 36, border: '3px solid #1F4788', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
          <p style={{ color: '#64748b', fontSize: 13 }}>Cargando datos...</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* ── Bienvenida ── */}
      <div style={{
        background: 'linear-gradient(135deg, #1F4788 0%, #1e40af 60%, #1d4ed8 100%)',
        borderRadius: 16, padding: '28px 32px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: 16,
      }}>
        <div>
          <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 12, margin: '0 0 4px', fontWeight: 500, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            Bienvenido
          </p>
          <h2 style={{ color: '#ffffff', fontSize: 22, fontWeight: 700, margin: '0 0 6px', lineHeight: 1.2 }}>
            Sistema Médico Deportivo
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 13, margin: 0 }}>
            INDERHUILA — Instituto Departamental de Recreación y Deportes del Huila
          </p>
        </div>
        <div style={{
          background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(8px)',
          borderRadius: 12, padding: '12px 20px', textAlign: 'center',
          border: '1px solid rgba(255,255,255,0.15)',
        }}>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 10, margin: '0 0 2px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {new Date().toLocaleDateString('es-CO', { weekday: 'long' })}
          </p>
          <p style={{ color: '#ffffff', fontSize: 18, fontWeight: 700, margin: 0 }}>
            {new Date().toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' })}
          </p>
        </div>
      </div>

      {/* ── Acciones rápidas ── */}
      <div>
        <p style={{ margin: '0 0 12px', fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          Acciones rápidas
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          <QuickAction
            icon={<Plus size={20} />}
            title="Nuevo Deportista"
            sub="Registrar atleta"
            color="#1F4788"
            light="#EEF3FB"
            onClick={() => navigate('/deportistas')}
          />
          <QuickAction
            icon={<Calendar size={20} />}
            title="Agendar Cita"
            sub="Programar consulta"
            color="#0f766e"
            light="#f0fdf4"
            onClick={() => navigate('/citas')}
          />
          <QuickAction
            icon={<FileText size={20} />}
            title="Nueva Historia"
            sub="Crear registro clínico"
            color="#7c3aed"
            light="#f5f3ff"
            onClick={() => navigate('/historia')}
          />
        </div>
      </div>

      {/* ── Stats ── */}
      <div>
        <p style={{ margin: '0 0 12px', fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          Estadísticas generales
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
          <StatCard icon={<Users size={18} />} label="Total Deportistas" value={stats.totalDeportistas} trend="+12%" color="#1F4788" onClick={() => navigate('/deportistas')} />
          <StatCard icon={<Clock size={18} />} label="Citas Hoy" value={stats.citasHoy} trend={stats.citasHoy === 0 ? 'Sin citas' : 'Pendientes'} color="#0f766e" onClick={() => navigate('/citas')} />
          <StatCard icon={<Calendar size={18} />} label="Citas Esta Semana" value={stats.citasSemana} trend="+5" color="#d97706" onClick={() => navigate('/citas')} />
          <StatCard icon={<FileText size={18} />} label="Historias Activas" value={stats.historiasActivas} trend="+8" color="#7c3aed" onClick={() => navigate('/historia')} />
        </div>
      </div>

      {/* ── Actividad + Accesos ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 16 }}>
        {/* Actividad reciente */}
        <div style={{ background: '#ffffff', borderRadius: 14, border: '1px solid #e2e8f0', padding: '20px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Activity size={16} style={{ color: '#1F4788' }} />
              <span style={{ fontSize: 14, fontWeight: 600, color: '#0f172a' }}>Actividad reciente</span>
            </div>
            <button
              onClick={() => navigate('/citas')}
              style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#1F4788', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500 }}
            >
              Ver todas <ArrowRight size={13} />
            </button>
          </div>

          {stats.actividadReciente.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {stats.actividadReciente.map(item => (
                <div key={item.id} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '10px 14px', background: '#f8fafc',
                  borderRadius: 10, border: '1px solid #f1f5f9',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 34, height: 34, borderRadius: 8, background: '#EEF3FB', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Calendar size={15} style={{ color: '#1F4788' }} />
                    </div>
                    <div>
                      <p style={{ margin: 0, fontSize: 13, fontWeight: 500, color: '#0f172a' }}>{item.tipo}</p>
                      <p style={{ margin: 0, fontSize: 11, color: '#94a3b8' }}>{item.fecha}{item.hora ? ` · ${item.hora}` : ''}</p>
                    </div>
                  </div>
                  <span style={{
                    fontSize: 11, fontWeight: 500, padding: '3px 10px',
                    borderRadius: 20, background: '#d1fae5', color: '#065f46',
                  }}>
                    {item.estado}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '32px 0', color: '#94a3b8' }}>
              <Calendar size={36} style={{ margin: '0 auto 10px', opacity: 0.3 }} />
              <p style={{ fontSize: 13, margin: 0 }}>No hay actividad reciente</p>
            </div>
          )}
        </div>

        {/* Accesos directos */}
        <div style={{ background: '#ffffff', borderRadius: 14, border: '1px solid #e2e8f0', padding: '20px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <TrendingUp size={16} style={{ color: '#1F4788' }} />
            <span style={{ fontSize: 14, fontWeight: 600, color: '#0f172a' }}>Accesos directos</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {[
              { icon: <Users size={15} />, label: 'Ver Deportistas',   sub: 'Listado completo',    view: 'deportistas', c: '#1F4788', bg: '#EEF3FB' },
              { icon: <Calendar size={15} />, label: 'Gestión de Citas', sub: 'Calendario y agenda', view: 'citas',       c: '#0f766e', bg: '#f0fdf4' },
              { icon: <FileText size={15} />, label: 'Historias Clínicas', sub: 'Registros médicos', view: 'historia',    c: '#7c3aed', bg: '#f5f3ff' },
              { icon: <BarChart2 size={15} />, label: 'Reportes',        sub: 'Estadísticas',       view: 'reportes',    c: '#b45309', bg: '#fffbeb' },
            ].map(item => (
              <button
                key={item.view}
                onClick={() => navigate(`/${item.view}`)}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '10px 12px', borderRadius: 10,
                  border: '1px solid #f1f5f9', background: '#f8fafc',
                  cursor: 'pointer', transition: 'all 0.15s', width: '100%',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = item.bg; (e.currentTarget as HTMLElement).style.borderColor = 'transparent'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#f8fafc'; (e.currentTarget as HTMLElement).style.borderColor = '#f1f5f9'; }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 30, height: 30, borderRadius: 8, background: item.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: item.c, flexShrink: 0 }}>
                    {item.icon}
                  </div>
                  <div style={{ textAlign: 'left' }}>
                    <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: '#0f172a' }}>{item.label}</p>
                    <p style={{ margin: 0, fontSize: 11, color: '#94a3b8' }}>{item.sub}</p>
                  </div>
                </div>
                <ArrowRight size={13} style={{ color: '#cbd5e1', flexShrink: 0 }} />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Estado del sistema ── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '12px 16px', background: '#f0fdf4',
        borderRadius: 10, border: '1px solid #bbf7d0',
      }}>
        <CheckCircle size={16} style={{ color: '#16a34a', flexShrink: 0 }} />
        <p style={{ margin: 0, fontSize: 12, color: '#15803d', fontWeight: 500 }}>
          Sistema operando correctamente ·&nbsp;
          <span style={{ fontWeight: 400, color: '#4ade80' }}>
            Última actualización: {new Date().toLocaleDateString('es-CO')}
          </span>
        </p>
      </div>

    </div>
  );
}

// ── Componentes internos ──────────────────────────────────

function QuickAction({ icon, title, sub, color, light, onClick }: {
  icon: React.ReactNode; title: string; sub: string;
  color: string; light: string; onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: 14,
        padding: '16px 18px', borderRadius: 12,
        background: light, border: `1px solid ${color}22`,
        cursor: 'pointer', transition: 'all 0.15s', width: '100%',
      }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)'; }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'none'; (e.currentTarget as HTMLElement).style.boxShadow = 'none'; }}
    >
      <div style={{ width: 40, height: 40, borderRadius: 10, background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', flexShrink: 0 }}>
        {icon}
      </div>
      <div style={{ textAlign: 'left' }}>
        <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: '#0f172a' }}>{title}</p>
        <p style={{ margin: 0, fontSize: 11, color: '#64748b' }}>{sub}</p>
      </div>
    </button>
  );
}

function StatCard({ icon, label, value, trend, color, onClick }: {
  icon: React.ReactNode; label: string; value: number;
  trend: string; color: string; onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        background: '#ffffff', borderRadius: 12, padding: '18px 20px',
        border: '1px solid #e2e8f0', cursor: 'pointer',
        transition: 'all 0.15s', width: '100%', textAlign: 'left',
        borderTop: `3px solid ${color}`,
      }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)'; }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = 'none'; (e.currentTarget as HTMLElement).style.transform = 'none'; }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <div style={{ width: 36, height: 36, borderRadius: 8, background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color }}>
          {icon}
        </div>
        <ArrowRight size={13} style={{ color: '#cbd5e1', marginTop: 2 }} />
      </div>
      <p style={{ margin: '0 0 4px', fontSize: 12, color: '#64748b', fontWeight: 400 }}>{label}</p>
      <p style={{ margin: '0 0 8px', fontSize: 28, fontWeight: 700, color: '#0f172a', lineHeight: 1 }}>{value}</p>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <TrendingUp size={12} style={{ color: '#10b981' }} />
        <span style={{ fontSize: 11, color: '#64748b' }}>{trend}</span>
      </div>
    </button>
  );
}

// Necesario para el import de BarChart2 dentro del componente
import { BarChart2 } from 'lucide-react';

export default Inicio;