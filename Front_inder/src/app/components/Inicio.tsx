// ============================================================
// INICIO / DASHBOARD — Acciones rápidas y stats por permisos
// ============================================================
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, Calendar, FileText, Clock,
  ArrowRight, Plus, TrendingUp, Activity, CheckCircle,
} from 'lucide-react';
import { useAuth } from '@/app/contexts/AuthContext';
import { deportistasService, historiaClinicaService, citasService } from '../services/apiClient';
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
  const { puedeHacer } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats>({
    totalDeportistas: 0, historiasActivas: 0,
    citasHoy: 0, citasSemana: 0, actividadReciente: [],
  });

  useEffect(() => { cargarDatos(); }, []);

  const cargarDatos = async () => {
    try {
      // Solo pedir datos de los módulos a los que el usuario tiene acceso
      const [depRes, histRes, citRes] = await Promise.all([
        puedeHacer('deportistas', 'ver') ? deportistasService.getAll(1, 100) : Promise.resolve([]),
        puedeHacer('historia', 'ver')    ? historiaClinicaService.getAll(1, 100) : Promise.resolve([]),
        puedeHacer('citas', 'ver')       ? citasService.getAll() : Promise.resolve([]),
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
          tipo: c.tipo_cita?.nombre ?? c.tipo_cita ?? 'Cita',
          fecha: c.fecha ? new Date(c.fecha).toLocaleDateString('es-CO') : '-',
          hora: c.hora ?? '',
          estado: c.estado ?? 'pendiente',
        })),
      });
    } catch (e) {
      console.error('Error cargando dashboard:', e);
    } finally {
      setLoading(false);
    }
  };

  // ── Acciones rápidas: solo las que el usuario puede crear ──
  const accionesRapidas = [
    {
      modulo: 'deportistas', accion: 'crear',
      icon: <Plus size={20} />,
      title: 'Nuevo Deportista', sub: 'Registrar atleta',
      color: '#1F4788', light: '#EEF3FB',
      ruta: '/deportistas',
    },
    {
      modulo: 'citas', accion: 'crear',
      icon: <Calendar size={20} />,
      title: 'Agendar Cita', sub: 'Programar consulta',
      color: '#0f766e', light: '#f0fdf4',
      ruta: '/citas',
    },
    {
      modulo: 'historia', accion: 'crear',
      icon: <FileText size={20} />,
      title: 'Nueva Historia', sub: 'Crear registro clínico',
      color: '#7c3aed', light: '#f5f3ff',
      ruta: '/historia',
    },
  ].filter(a => puedeHacer(a.modulo, a.accion));

  // ── Stats: solo las de módulos con permiso 'ver' ──
  const statsVisibles = [
    {
      modulo: 'deportistas',
      icon: <Users size={18} />,
      label: 'Total Deportistas',
      value: stats.totalDeportistas,
      trend: '+12%', color: '#1F4788',
      ruta: '/deportistas',
    },
    {
      modulo: 'citas',
      icon: <Clock size={18} />,
      label: 'Citas Hoy',
      value: stats.citasHoy,
      trend: stats.citasHoy === 0 ? 'Sin citas' : 'Pendientes',
      color: '#0f766e',
      ruta: '/citas',
    },
    {
      modulo: 'citas',
      icon: <Calendar size={18} />,
      label: 'Citas Esta Semana',
      value: stats.citasSemana,
      trend: '+5', color: '#d97706',
      ruta: '/citas',
    },
    {
      modulo: 'historia',
      icon: <FileText size={18} />,
      label: 'Historias Activas',
      value: stats.historiasActivas,
      trend: '+8', color: '#7c3aed',
      ruta: '/historia',
    },
  ].filter(s => puedeHacer(s.modulo, 'ver'));

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 60 }}>
        <div style={{ width: 28, height: 28, border: '2px solid #1F4788', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* ── Hero banner ── */}
      <div style={{
        background: 'linear-gradient(135deg, #1F4788 0%, #1e3a6e 100%)',
        borderRadius: 16, padding: '24px 28px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
      }}>
        <div>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12, margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Bienvenido al sistema
          </p>
          <h2 style={{ color: '#ffffff', fontSize: 22, fontWeight: 700, margin: '0 0 6px', lineHeight: 1.2 }}>
            Sistema Médico Deportivo
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 13, margin: 0 }}>
            INDERHUILA — Instituto Departamental de Recreación y Deportes del Huila
          </p>
        </div>
        <div style={{
          background: 'rgba(255,255,255,0.1)',
          borderRadius: 12, padding: '12px 20px', textAlign: 'center',
          border: '1px solid rgba(255,255,255,0.15)', flexShrink: 0,
        }}>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 10, margin: '0 0 2px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {new Date().toLocaleDateString('es-CO', { weekday: 'long' })}
          </p>
          <p style={{ color: '#ffffff', fontSize: 18, fontWeight: 700, margin: 0 }}>
            {new Date().toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' })}
          </p>
        </div>
      </div>

      {/* ── Acciones rápidas — solo si tiene al menos una ── */}
      {accionesRapidas.length > 0 && (
        <div>
          <p style={{ margin: '0 0 12px', fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Acciones rápidas
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${accionesRapidas.length}, 1fr)`, gap: 12 }}>
            {accionesRapidas.map(a => (
              <QuickAction
                key={a.ruta + a.accion}
                icon={a.icon}
                title={a.title}
                sub={a.sub}
                color={a.color}
                light={a.light}
                onClick={() => navigate(a.ruta)}
              />
            ))}
          </div>
        </div>
      )}

      {/* ── Stats — solo módulos visibles ── */}
      {statsVisibles.length > 0 && (
        <div>
          <p style={{ margin: '0 0 12px', fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Estadísticas generales
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(statsVisibles.length, 4)}, 1fr)`, gap: 12 }}>
            {statsVisibles.map(s => (
              <StatCard
                key={s.label}
                icon={s.icon}
                label={s.label}
                value={s.value}
                trend={s.trend}
                color={s.color}
                onClick={() => navigate(s.ruta)}
              />
            ))}
          </div>
        </div>
      )}

      {/* ── Actividad reciente — solo si tiene permiso en citas ── */}
      {puedeHacer('citas', 'ver') && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 16 }}>
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
                        <p style={{ margin: 0, fontSize: 11, color: '#94a3b8' }}>
                          {item.fecha}{item.hora ? ` · ${item.hora}` : ''}
                        </p>
                      </div>
                    </div>
                    <StatusBadge estado={item.estado} />
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '24px 0', color: '#94a3b8' }}>
                <Calendar size={28} style={{ marginBottom: 8, opacity: 0.4 }} />
                <p style={{ margin: 0, fontSize: 13 }}>Sin actividad reciente</p>
              </div>
            )}
          </div>

          {/* Panel accesos rápidos de módulos */}
          <div style={{ background: '#ffffff', borderRadius: 14, border: '1px solid #e2e8f0', padding: '20px 24px' }}>
            <p style={{ margin: '0 0 14px', fontSize: 14, fontWeight: 600, color: '#0f172a' }}>Accesos rápidos</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { modulo: 'deportistas', label: 'Deportistas', icon: <Users size={15} />, color: '#1F4788', bg: '#EEF3FB', ruta: '/deportistas' },
                { modulo: 'historia',    label: 'Historia Clínica', icon: <FileText size={15} />, color: '#7c3aed', bg: '#f5f3ff', ruta: '/historia' },
                { modulo: 'citas',       label: 'Citas',       icon: <Calendar size={15} />, color: '#0f766e', bg: '#f0fdf4', ruta: '/citas' },
                { modulo: 'reportes',    label: 'Reportes',    icon: <TrendingUp size={15} />, color: '#d97706', bg: '#fefce8', ruta: '/reportes' },
              ].filter(item => puedeHacer(item.modulo, 'ver')).map(item => (
                <button
                  key={item.ruta}
                  onClick={() => navigate(item.ruta)}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '10px 14px', borderRadius: 10,
                    background: '#f8fafc', border: '1px solid #f1f5f9',
                    cursor: 'pointer', transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = item.bg; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#f8fafc'; }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 30, height: 30, borderRadius: 8, background: item.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: item.color }}>
                      {item.icon}
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 500, color: '#0f172a' }}>{item.label}</span>
                  </div>
                  <ArrowRight size={13} style={{ color: '#94a3b8' }} />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Banner estado sistema */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '10px 16px', borderRadius: 10,
        background: '#f0fdf4', border: '1px solid #bbf7d0',
      }}>
        <CheckCircle size={15} style={{ color: '#16a34a', flexShrink: 0 }} />
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

// ── Componentes internos ─────────────────────────────────────

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
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)';
        (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.transform = 'none';
        (e.currentTarget as HTMLElement).style.boxShadow = 'none';
      }}
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
        background: '#ffffff', borderRadius: 14, border: '1px solid #e2e8f0',
        padding: '18px 20px', textAlign: 'left', cursor: 'pointer',
        transition: 'all 0.15s', width: '100%',
      }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = color; }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = '#e2e8f0'; }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', color }}>
          {icon}
        </div>
        <span style={{ fontSize: 11, color: '#16a34a', background: '#f0fdf4', padding: '2px 8px', borderRadius: 20, fontWeight: 500 }}>
          {trend}
        </span>
      </div>
      <p style={{ margin: '0 0 2px', fontSize: 22, fontWeight: 700, color: '#0f172a' }}>{value}</p>
      <p style={{ margin: 0, fontSize: 12, color: '#64748b' }}>{label}</p>
    </button>
  );
}

function StatusBadge({ estado }: { estado: string }) {
  const map: Record<string, { label: string; bg: string; color: string }> = {
    completada:  { label: 'Completada',  bg: '#f0fdf4', color: '#16a34a' },
    pendiente:   { label: 'Pendiente',   bg: '#fefce8', color: '#ca8a04' },
    cancelada:   { label: 'Cancelada',   bg: '#fef2f2', color: '#dc2626' },
    programada:  { label: 'Programada',  bg: '#eff6ff', color: '#2563eb' },
  };
  const s = map[estado?.toLowerCase()] ?? { label: estado, bg: '#f1f5f9', color: '#475569' };
  return (
    <span style={{ fontSize: 11, fontWeight: 500, padding: '3px 10px', borderRadius: 20, background: s.bg, color: s.color, whiteSpace: 'nowrap' }}>
      {s.label}
    </span>
  );
}

export default Inicio;