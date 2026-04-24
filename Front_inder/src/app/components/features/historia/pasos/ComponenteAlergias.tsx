import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Plus, X } from 'lucide-react';

// ============================================================================
// TIPOS Y DATOS
// ============================================================================

type TipoAlergia = 'Respiratorias' | 'Digestivas' | 'Dermatológicas' | 'Medicamentosas' | 'Otra';

type SubAlergias = {
  [key in TipoAlergia]: string[];
};

const CATEGORIAS_ALERGIAS: SubAlergias = {
  Respiratorias: ['Asma', 'Rinitis', 'Otro'],
  Digestivas: ['Gluten', 'Nueces', 'Lácteos', 'Otro'],
  Dermatológicas: ['Eccema', 'Urticaria', 'Otro'],
  Medicamentosas: [
    'AINEs',
    'Paracetamol',
    'Antibióticos (especifique cuál)',
    'Otro',
  ],
  Otra: ['Especifique'],
};

type AlergiaSeleccionada = {
  tipo: TipoAlergia;
  subtipos: string[];
  detalles: string;
};

// ============================================================================
// COMPONENTE
// ============================================================================

type Props = {
  tieneAlergias: boolean;
  alergias: AlergiaSeleccionada[];
  onChangeTieneAlergias: (value: boolean) => void;
  onChangeAlergias: (alergias: AlergiaSeleccionada[]) => void;
};

export const ComponenteAlergias = ({
  tieneAlergias,
  alergias,
  onChangeTieneAlergias,
  onChangeAlergias,
}: Props) => {
  const [expandedTipo, setExpandedTipo] = useState<TipoAlergia | null>(null);

  const toggleTipo = (tipo: TipoAlergia) => {
    setExpandedTipo(expandedTipo === tipo ? null : tipo);
  };

  const toggleSubtipo = (tipo: TipoAlergia, subtipo: string) => {
    const alergia = alergias.find((a) => a.tipo === tipo);

    if (alergia) {
      // Si ya existe esta categoría, actualizar
      const actualizadas = alergias.map((a) => {
        if (a.tipo === tipo) {
          const subtiposActualizados = a.subtipos.includes(subtipo)
            ? a.subtipos.filter((s) => s !== subtipo)
            : [...a.subtipos, subtipo];
          return { ...a, subtipos: subtiposActualizados };
        }
        return a;
      });
      // Eliminar si no tiene subtipos seleccionados
      onChangeAlergias(actualizadas.filter((a) => a.subtipos.length > 0));
    } else {
      // Crear nueva alergia
      const nuevaAlergia: AlergiaSeleccionada = {
        tipo,
        subtipos: [subtipo],
        detalles: '',
      };
      onChangeAlergias([...alergias, nuevaAlergia]);
    }
  };

  const actualizarDetalles = (tipo: TipoAlergia, detalles: string) => {
    const actualizadas = alergias.map((a) =>
      a.tipo === tipo ? { ...a, detalles } : a
    );
    onChangeAlergias(actualizadas);
  };

  const eliminarAlergia = (tipo: TipoAlergia) => {
    onChangeAlergias(alergias.filter((a) => a.tipo !== tipo));
    setExpandedTipo(null);
  };

  const necesitaDetalles = (subtipos: string[]) => {
    return subtipos.some((s) => 
      s.includes('Otro') || s.includes('Especifique') || s.toLowerCase().includes('especifique')
    );
  };

  if (!tieneAlergias) {
    return null;
  }

  return (
    <div className="space-y-6 mt-4">
      {/* Listado de categorías */}
      {(Object.keys(CATEGORIAS_ALERGIAS) as TipoAlergia[]).map((tipo) => {
        const alergia = alergias.find((a) => a.tipo === tipo);
        const isExpanded = expandedTipo === tipo;
        const tieneSeleccionados = alergia && alergia.subtipos.length > 0;

        return (
          <div key={tipo} className="border border-gray-200 rounded-lg overflow-hidden">
            {/* Header de la categoría */}
            <button
              type="button"
              onClick={() => toggleTipo(tipo)}
              className={`w-full flex items-center justify-between px-4 py-3 font-semibold transition-colors ${
                tieneSeleccionados
                  ? 'bg-blue-50 text-blue-900 border-b border-blue-200'
                  : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border-b border-gray-200'
              }`}
            >
              <div className="flex items-center gap-3">
                {isExpanded ? (
                  <ChevronDown className="w-5 h-5" />
                ) : (
                  <ChevronRight className="w-5 h-5" />
                )}
                <span>{tipo}</span>
                {tieneSeleccionados && (
                  <span className="text-xs bg-blue-200 text-blue-900 px-2 py-1 rounded-full">
                    {alergia.subtipos.length} seleccionada{alergia.subtipos.length !== 1 ? 's' : ''}
                  </span>
                )}
              </div>
              {tieneSeleccionados && (
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    eliminarAlergia(tipo);
                  }}
                  className="text-red-500 hover:text-red-700 cursor-pointer p-1 hover:bg-red-50 rounded transition-colors"
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.stopPropagation();
                      eliminarAlergia(tipo);
                    }
                  }}
                >
                  <X className="w-4 h-4" />
                </div>
              )}
            </button>

            {/* Contenido expandido */}
            {isExpanded && (
              <div className="p-4 space-y-4 bg-white">
                {/* Subtipos */}
                <div className="space-y-3">
                  <p className="text-sm font-medium text-gray-600">Seleccione los tipos:</p>
                  {CATEGORIAS_ALERGIAS[tipo].map((subtipo) => {
                    const isSelected =
                      alergia && alergia.subtipos.includes(subtipo);
                    return (
                      <label
                        key={subtipo}
                        className="flex items-center gap-3 p-2 rounded hover:bg-gray-50 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={isSelected || false}
                          onChange={() => toggleSubtipo(tipo, subtipo)}
                          className="w-4 h-4 text-blue-600 rounded"
                        />
                        <span className="text-sm text-gray-700">{subtipo}</span>
                      </label>
                    );
                  })}
                </div>

                {/* Campo de detalles SOLO si necesita especificación */}
                {tieneSeleccionados && necesitaDetalles(alergia!.subtipos) && (
                  <div className="pt-3 border-t border-gray-200">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Especifique cuál <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={alergia?.detalles || ''}
                      onChange={(e) =>
                        actualizarDetalles(tipo, e.target.value)
                      }
                      placeholder={`Especifique cuál es la alergia o sustancia...`}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={2}
                    />
                    {!alergia?.detalles && (
                      <p className="text-xs text-red-500 mt-1">
                        Este campo es requerido cuando selecciona opciones que requieren especificación
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}

      {/* Resumen */}
      {alergias.length > 0 && (
        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h4 className="font-semibold text-yellow-900 mb-2">
            ⚠️ Alergias registradas:
          </h4>
          <ul className="space-y-1 text-sm text-yellow-800">
            {alergias.map((a) => (
              <li key={a.tipo}>
                <strong>{a.tipo}:</strong> {a.subtipos.join(', ')}
                {a.detalles && ` - ${a.detalles}`}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ComponenteAlergias;