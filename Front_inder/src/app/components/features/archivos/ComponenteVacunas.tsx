import React, { useState } from 'react';
import { Plus, X, FileUp, Trash2, Calendar } from 'lucide-react';

// ============================================================================
// TIPOS
// ============================================================================

type VacunaItem = {
  id?: string;
  nombre_vacuna: string;
  fecha_administracion?: string;
  nombre_archivo?: string;
  observaciones?: string;
  archivo?: File;
};

const VACUNAS_PREDEFINIDAS = [
  'Tétanos',
  'Hepatitis',
  'Influenza',
  'COVID-19',
  'Fiebre Amarilla',
];

// ============================================================================
// COMPONENTE
// ============================================================================

type Props = {
  vacunas: VacunaItem[];
  onChangeVacunas: (vacunas: VacunaItem[]) => void;
  esHistoriaClinica?: boolean;
};

export const ComponenteVacunas = ({
  vacunas,
  onChangeVacunas,
  esHistoriaClinica = false,
}: Props) => {
  const [nuevaVacuna, setNuevaVacuna] = useState<VacunaItem>({
    nombre_vacuna: '',
    fecha_administracion: '',
    observaciones: '',
  });
  const [archivo, setArchivo] = useState<File | null>(null);
  const [mostrarOtra, setMostrarOtra] = useState(false);

  const handleAgregarVacuna = () => {
    // Validar
    if (!nuevaVacuna.nombre_vacuna.trim()) {
      alert('Seleccione o especifique una vacuna');
      return;
    }

    // Crear nueva vacuna
    const vacunaParaAgregar: VacunaItem = {
      ...nuevaVacuna,
      id: Date.now().toString(), // ID temporal
      archivo: archivo || undefined,
    };

    onChangeVacunas([...vacunas, vacunaParaAgregar]);

    // Limpiar
    setNuevaVacuna({
      nombre_vacuna: '',
      fecha_administracion: '',
      observaciones: '',
    });
    setArchivo(null);
    setMostrarOtra(false);
  };

  const handleEliminarVacuna = (indice: number) => {
    onChangeVacunas(vacunas.filter((_, i) => i !== indice));
  };

  const handleArchivoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      const file = files[0];
      // Validar tipo de archivo
      const tiposPermitidos = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
      if (!tiposPermitidos.includes(file.type)) {
        alert('Solo se permiten archivos PDF, JPG o PNG');
        return;
      }
      // Validar tamaño (máx 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('El archivo no debe exceder 5MB');
        return;
      }
      setArchivo(file);
    }
  };

  return (
    <div className="space-y-4">
      {/* Formulario para agregar vacuna */}
      <div className="bg-white p-4 rounded-lg border border-gray-200 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Seleccionar vacuna */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Vacuna <span className="text-red-500">*</span>
            </label>
            {!mostrarOtra ? (
              <select
                value={nuevaVacuna.nombre_vacuna}
                onChange={(e) => {
                  if (e.target.value === 'Otra') {
                    setMostrarOtra(true);
                    setNuevaVacuna({ ...nuevaVacuna, nombre_vacuna: '' });
                  } else {
                    setNuevaVacuna({ ...nuevaVacuna, nombre_vacuna: e.target.value });
                    setMostrarOtra(false);
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Seleccione una vacuna</option>
                {VACUNAS_PREDEFINIDAS.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
                <option value="Otra">Otra (especifique)</option>
              </select>
            ) : (
              <div className="space-y-2">
                <input
                  type="text"
                  value={nuevaVacuna.nombre_vacuna}
                  onChange={(e) =>
                    setNuevaVacuna({ ...nuevaVacuna, nombre_vacuna: e.target.value })
                  }
                  placeholder="Especifique el nombre de la vacuna"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={() => {
                    setMostrarOtra(false);
                    setNuevaVacuna({ ...nuevaVacuna, nombre_vacuna: '' });
                  }}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  ← Volver a lista
                </button>
              </div>
            )}
          </div>

          {/* Fecha de administración */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fecha de administración
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <input
                type="date"
                value={nuevaVacuna.fecha_administracion || ''}
                onChange={(e) =>
                  setNuevaVacuna({ ...nuevaVacuna, fecha_administracion: e.target.value })
                }
                max={new Date().toISOString().split('T')[0]}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Observaciones */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Observaciones (opcional)
          </label>
          <textarea
            value={nuevaVacuna.observaciones || ''}
            onChange={(e) =>
              setNuevaVacuna({ ...nuevaVacuna, observaciones: e.target.value })
            }
            placeholder="Ej: Lote, lugar de administración, próxima dosis, etc."
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>

        {/* Cargar archivo */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Adjuntar archivo (PDF, JPG, PNG - máx 5MB)
          </label>
          <div className="relative">
            <input
              type="file"
              onChange={handleArchivoChange}
              accept=".pdf,.jpg,.jpeg,.png"
              className="hidden"
              id="archivo-vacuna"
            />
            <label
              htmlFor="archivo-vacuna"
              className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors"
            >
              <FileUp className="w-5 h-5 text-gray-400" />
              <span className="text-sm text-gray-600">
                {archivo ? archivo.name : 'Haz clic para cargar archivo'}
              </span>
            </label>
          </div>
        </div>

        {/* Botón agregar */}
        <button
          type="button"
          onClick={handleAgregarVacuna}
          className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Agregar Vacuna
        </button>
      </div>

      {/* Lista de vacunas agregadas */}
      {vacunas.length > 0 && (
        <div className="space-y-3">
          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-sm font-medium text-blue-900 mb-3">
              📋 Vacunas registradas ({vacunas.length}):
            </p>
            <div className="space-y-2">
              {vacunas.map((vacuna, indice) => (
                <div
                  key={vacuna.id || indice}
                  className="bg-white p-3 rounded border border-blue-200 flex items-start justify-between gap-3"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-gray-900">
                        {vacuna.nombre_vacuna}
                      </span>
                      {vacuna.fecha_administracion && (
                        <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                          {new Date(vacuna.fecha_administracion).toLocaleDateString('es-ES')}
                        </span>
                      )}
                    </div>
                    {vacuna.observaciones && (
                      <p className="text-sm text-gray-600 mb-2">{vacuna.observaciones}</p>
                    )}
                    {(vacuna.nombre_archivo || vacuna.archivo) && (
                      <p className="text-xs text-blue-600 flex items-center gap-1">
                        <FileUp className="w-3 h-3" />
                        {vacuna.nombre_archivo || vacuna.archivo?.name}
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleEliminarVacuna(indice)}
                    className="p-1.5 text-red-500 hover:bg-red-50 rounded transition-colors"
                    title="Eliminar"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {vacunas.length === 0 && (
        <p className="text-sm text-gray-500 italic text-center py-4">
          No hay vacunas registradas
        </p>
      )}
    </div>
  );
};

export default ComponenteVacunas;