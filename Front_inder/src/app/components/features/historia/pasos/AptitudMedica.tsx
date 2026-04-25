// ============================================================
// PASO: APTITUD MÉDICA — paso final de la historia clínica
// Los botones de navegación los maneja HistoriaClinica.tsx
// ============================================================
import { AlertTriangle } from 'lucide-react';

interface AptitudMedicaProps {
  data: any;
  updateData: (updates: any) => void;
  onSave?: () => void;
  onPrevious?: () => void;
  onCancel?: () => void;
}

const TIPOS_APTITUD = [
  'Aptitud para deporte de competencia',
  'Aptitud para actividad física recreativa',
  'Aptitud para entrenamiento de alta intensidad',
  'Aptitud condicional — requiere seguimiento',
  'No apto temporalmente — lesión en recuperación',
  'No apto — condición médica contraindicante',
];

export function AptitudMedica({ data, updateData }: AptitudMedicaProps) {
  const aptitud = data.aptitudMedica || { resultado: '', tipo_aptitud: '', observaciones: '', restricciones: '' };

  const update = (field: string, value: string) => {
    updateData({ aptitudMedica: { ...aptitud, [field]: value } });
  };

  const esApto   = aptitud.resultado === 'apto';
  const esNoApto = aptitud.resultado === 'no_apto';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* Título */}
      <div>
        <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#0f172a' }}>Aptitud Médica</h3>
        <p style={{ margin: '4px 0 0', fontSize: 13, color: '#64748b' }}>
          Declara si el deportista es apto o no apto para la actividad deportiva
        </p>
      </div>

      {/* Selector APTO / NO APTO */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* APTO */}
        <button
          onClick={() => update('resultado', 'apto')}
          style={{
            padding: '24px 16px', borderRadius: 14,
            border: `2px solid ${esApto ? '#10b981' : '#e2e8f0'}`,
            background: esApto ? '#d1fae5' : '#f8fafc',
            cursor: 'pointer',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
            transition: 'all 0.15s',
          }}
        >
          <div style={{
            width: 56, height: 56, borderRadius: '50%',
            background: esApto ? '#10b981' : '#e2e8f0',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: esApto ? '#fff' : '#94a3b8', fontSize: 28, fontWeight: 900,
          }}>✓</div>
          <span style={{ fontSize: 18, fontWeight: 800, color: esApto ? '#065f46' : '#94a3b8', letterSpacing: '0.05em' }}>
            APTO
          </span>
          <span style={{ fontSize: 12, color: esApto ? '#065f46' : '#94a3b8', textAlign: 'center' }}>
            Puede practicar actividad física
          </span>
        </button>

        {/* NO APTO */}
        <button
          onClick={() => update('resultado', 'no_apto')}
          style={{
            padding: '24px 16px', borderRadius: 14,
            border: `2px solid ${esNoApto ? '#ef4444' : '#e2e8f0'}`,
            background: esNoApto ? '#fee2e2' : '#f8fafc',
            cursor: 'pointer',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
            transition: 'all 0.15s',
          }}
        >
          <div style={{
            width: 56, height: 56, borderRadius: '50%',
            background: esNoApto ? '#ef4444' : '#e2e8f0',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: esNoApto ? '#fff' : '#94a3b8', fontSize: 28, fontWeight: 900,
          }}>✗</div>
          <span style={{ fontSize: 18, fontWeight: 800, color: esNoApto ? '#991b1b' : '#94a3b8', letterSpacing: '0.05em' }}>
            NO APTO
          </span>
          <span style={{ fontSize: 12, color: esNoApto ? '#991b1b' : '#94a3b8', textAlign: 'center' }}>
            No puede practicar actividad física
          </span>
        </button>
      </div>

      {/* Campos adicionales */}
      {aptitud.resultado && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, padding: 20, background: '#f8fafc', borderRadius: 12, border: '1px solid #e2e8f0' }}>
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 8 }}>
              Tipo de aptitud
            </label>
            <select
              value={aptitud.tipo_aptitud}
              onChange={e => update('tipo_aptitud', e.target.value)}
              style={{ width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 13, background: '#fff', outline: 'none' }}
            >
              <option value="">Seleccionar tipo...</option>
              {TIPOS_APTITUD.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 8 }}>
              Observaciones médicas
            </label>
            <textarea
              value={aptitud.observaciones}
              onChange={e => update('observaciones', e.target.value)}
              placeholder="Observaciones sobre el estado de salud del deportista..."
              rows={3}
              style={{ width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 13, resize: 'vertical', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }}
            />
          </div>

          {esNoApto && (
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 8 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <AlertTriangle size={14} style={{ color: '#f59e0b' }} />
                  Restricciones específicas
                </span>
              </label>
              <textarea
                value={aptitud.restricciones}
                onChange={e => update('restricciones', e.target.value)}
                placeholder="Actividades no permitidas, condiciones, tiempo estimado de recuperación..."
                rows={3}
                style={{ width: '100%', padding: '10px 12px', border: '1px solid #fde68a', borderRadius: 8, fontSize: 13, resize: 'vertical', outline: 'none', fontFamily: 'inherit', background: '#fffbeb', boxSizing: 'border-box' }}
              />
            </div>
          )}
        </div>
      )}

      {/* Aviso si no eligió resultado */}
      {!aptitud.resultado && (
        <div style={{ padding: '12px 16px', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 10 }}>
          <AlertTriangle size={16} style={{ color: '#f59e0b', flexShrink: 0 }} />
          <p style={{ margin: 0, fontSize: 13, color: '#92400e' }}>
            Puedes guardar sin declarar aptitud. Podrás actualizarla más adelante desde la vista de historia.
          </p>
        </div>
      )}
    </div>
  );
}

export default AptitudMedica;