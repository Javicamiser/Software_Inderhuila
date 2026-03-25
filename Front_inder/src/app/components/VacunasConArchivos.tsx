import React, { useState, useEffect, JSX } from 'react';
import { Plus, X, FileUp, Trash2, Calendar, Download, File, AlertCircle, Loader, FileText } from 'lucide-react';
import { toast } from 'sonner';

// ============================================================================
// TIPOS
// ============================================================================

export type VacunaConArchivo = {
  id?: string;
  nombre_vacuna: string;
  fecha_administracion?: string;
  observaciones?: string;
  archivo?: File;
  nombre_archivo?: string;
  ruta_archivo?: string;
  tipo_archivo?: string;
  es_nueva?: boolean;
};

const VACUNAS_PREDEFINIDAS = [
  'Tétanos',
  'Hepatitis',
  'Influenza',
  'COVID-19',
  'Fiebre Amarilla',
  'Sarampión',
  'Poliomielitis',
  'Difteria',
];

// ============================================================================
// COMPONENTE
// ============================================================================

type Props = {
  deportista_id?: string;
  vacunas: VacunaConArchivo[];
  onChangeVacunas: (vacunas: VacunaConArchivo[]) => void;
  readonly?: boolean;
};

export const VacunasConArchivos: React.FC<Props> = ({
  deportista_id,
  vacunas,
  onChangeVacunas,
  readonly = false,
}): JSX.Element => {
  const [nuevaVacuna, setNuevaVacuna] = useState<VacunaConArchivo>({
    nombre_vacuna: '',
    fecha_administracion: '',
    observaciones: '',
  });
  const [archivo, setArchivo] = useState<File | null>(null);
  const [mostrarOtra, setMostrarOtra] = useState(false);
  const [isLoadingVacunas, setIsLoadingVacunas] = useState(false);
  const [vacunasDelServidor, setVacunasDelServidor] = useState<VacunaConArchivo[]>([]);

  // Cargar vacunas del servidor si deportista_id existe
  useEffect(() => {
    if (deportista_id && !readonly) {
      cargarVacunasDelServidor();
    }
  }, [deportista_id, readonly]);

  const cargarVacunasDelServidor = async () => {
    try {
      setIsLoadingVacunas(true);
      const response = await fetch(
        `http://localhost:8000/api/v1/deportistas/${deportista_id}/vacunas`
      );

      if (!response.ok) {
        console.warn('No se encontraron vacunas previas');
        return;
      }

      const data = await response.json();
      const vacunasConServidorFlag = (data || []).map((v: VacunaConArchivo) => ({
        ...v,
        es_nueva: false,
      }));
      setVacunasDelServidor(vacunasConServidorFlag);
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.warn('Error cargando vacunas:', error.message);
      }
    } finally {
      setIsLoadingVacunas(false);
    }
  };

  const handleAgregarVacuna = () => {
    if (!nuevaVacuna.nombre_vacuna.trim()) {
      toast.error('Seleccione o especifique una vacuna');
      return;
    }

    const vacunaParaAgregar: VacunaConArchivo = {
      ...nuevaVacuna,
      id: Date.now().toString(),
      archivo: archivo || undefined,
      es_nueva: true,
    };

    onChangeVacunas([...vacunas, vacunaParaAgregar]);

    setNuevaVacuna({
      nombre_vacuna: '',
      fecha_administracion: '',
      observaciones: '',
    });
    setArchivo(null);
    setMostrarOtra(false);
    toast.success('Vacuna agregada correctamente');
  };

  const handleEliminarVacuna = (indice: number) => {
    onChangeVacunas(vacunas.filter((_, i) => i !== indice));
    toast.success('Vacuna eliminada');
  };

  const handleArchivoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      const file = files[0];

      // SOLO aceptar PDF
      if (file.type !== 'application/pdf') {
        toast.error('Solo se permiten archivos PDF');
        return;
      }

      // Validar tamaño (máx 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('El archivo no debe exceder 10MB');
        return;
      }

      setArchivo(file);
      toast.success(`Archivo cargado: ${file.name}`);
    }
  };

  // Combinar vacunas: primero las del servidor, luego las nuevas del formulario
  const todasLasVacunas = [...vacunasDelServidor, ...vacunas.filter((v) => v.es_nueva)];

  if (readonly) {
    return (
      <div className="space-y-4">
        {todasLasVacunas.length === 0 ? (
          <p className="text-sm text-gray-500 italic text-center py-4">
            No hay vacunas registradas
          </p>
        ) : (
          <div className="space-y-3">
            {todasLasVacunas.map((vacuna, idx) => (
              <div
                key={vacuna.id || idx}
                className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border-2 border-green-200"
              >
                <div className="flex items-start gap-4">
                  <div className="bg-green-600 p-2 rounded-lg text-white">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-green-900">{vacuna.nombre_vacuna}</h4>
                    <div className="flex flex-wrap gap-2 mt-2 text-sm">
                      {vacuna.fecha_administracion && (
                        <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs">
                          {new Date(vacuna.fecha_administracion).toLocaleDateString('es-ES')}
                        </span>
                      )}
                      {vacuna.observaciones && (
                        <span className="text-green-700">{vacuna.observaciones}</span>
                      )}
                    </div>

                    {/* Mostrar archivos */}
                    {(vacuna.nombre_archivo || vacuna.archivo) && (
                      <div className="mt-3 bg-white p-3 rounded border border-green-200">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-blue-600" />
                          <span className="text-sm font-semibold text-gray-800">
                            {vacuna.nombre_archivo || vacuna.archivo?.name}
                          </span>
                          {vacuna.ruta_archivo && (
                            <a
                              href={vacuna.ruta_archivo}
                              download
                              target="_blank"
                              rel="noopener noreferrer"
                              className="ml-auto text-blue-600 hover:text-blue-700 hover:bg-blue-100 p-2 rounded transition"
                              title="Descargar PDF"
                            >
                              <Download className="w-4 h-4" />
                            </a>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // MODO EDICIÓN
  return (
    <div className="space-y-6">
      {/* Cargar vacunas existentes */}
      {isLoadingVacunas && (
        <div className="flex items-center justify-center gap-2 text-gray-600">
          <Loader className="w-4 h-4 animate-spin" />
          <span className="text-sm">Cargando vacunas previas...</span>
        </div>
      )}

      {/* Formulario para agregar nueva vacuna */}
      {!readonly && (
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-5 rounded-xl border-2 border-green-200 space-y-4">
          <h4 className="font-semibold text-green-900 flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Agregar Nueva Vacuna
          </h4>

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
                    }
                  }}
                  className="w-full px-3 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 bg-white"
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
                    placeholder="Nombre de la vacuna"
                    className="w-full px-3 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setMostrarOtra(false);
                      setNuevaVacuna({ ...nuevaVacuna, nombre_vacuna: '' });
                    }}
                    className="text-xs text-green-600 hover:text-green-700 hover:underline"
                  >
                    Volver a lista predefinida
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
                    setNuevaVacuna({
                      ...nuevaVacuna,
                      fecha_administracion: e.target.value,
                    })
                  }
                  max={new Date().toISOString().split('T')[0]}
                  className="w-full pl-10 pr-3 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200"
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
              placeholder="Ej: Lote, lugar de administración, próxima dosis, reacciones, etc."
              rows={2}
              className="w-full px-3 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 resize-none"
            />
          </div>

          {/* Cargar archivo PDF */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Adjuntar certificado PDF (máx 10MB)
            </label>
            <div className="relative">
              <input
                type="file"
                onChange={handleArchivoChange}
                accept=".pdf"
                className="hidden"
                id={`archivo-vacuna-${Date.now()}`}
              />
              <label
                htmlFor={`archivo-vacuna-${Date.now()}`}
                className="flex items-center justify-center gap-2 px-4 py-4 border-2 border-dashed border-green-300 rounded-lg cursor-pointer hover:border-green-500 hover:bg-green-100 transition-colors bg-white"
              >
                <FileUp className="w-5 h-5 text-green-600" />
                <span className="text-sm text-gray-700">
                  {archivo
                    ? `Archivo: ${archivo.name}`
                    : 'Haz clic para cargar certificado PDF'}
                </span>
              </label>
              {archivo && (
                <button
                  type="button"
                  onClick={() => setArchivo(null)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500 hover:bg-red-50 p-1 rounded"
                  title="Quitar archivo"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Botón agregar */}
          <button
            type="button"
            onClick={handleAgregarVacuna}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 px-4 rounded-lg hover:shadow-lg transition-all font-semibold"
          >
            <Plus className="w-5 h-5" />
            Agregar Vacuna
          </button>
        </div>
      )}

      {/* Lista de TODAS las vacunas */}
      {todasLasVacunas.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-gray-800 flex items-center gap-2">
              <span className="bg-green-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">
                {todasLasVacunas.length}
              </span>
              Vacunas registradas
            </h4>
          </div>

          <div className="space-y-2">
            {todasLasVacunas.map((vacuna, idx) => (
              <div
                key={vacuna.id || idx}
                className={`p-4 rounded-lg border-2 flex items-start justify-between gap-3 transition-all ${
                  vacuna.es_nueva
                    ? 'bg-amber-50 border-amber-200 hover:border-amber-300'
                    : 'bg-green-50 border-green-200 hover:border-green-300'
                }`}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-semibold text-gray-900">
                      {vacuna.nombre_vacuna}
                    </span>
                    {vacuna.es_nueva && (
                      <span className="text-xs bg-amber-200 text-amber-800 px-2 py-1 rounded font-semibold">
                        NUEVA
                      </span>
                    )}
                    {vacuna.fecha_administracion && (
                      <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                        {new Date(vacuna.fecha_administracion).toLocaleDateString('es-ES')}
                      </span>
                    )}
                  </div>

                  {vacuna.observaciones && (
                    <p className="text-sm text-gray-600 mb-2">{vacuna.observaciones}</p>
                  )}

                  {/* Mostrar archivos */}
                  {(vacuna.nombre_archivo || vacuna.archivo) && (
                    <div className="mt-3 bg-white p-3 rounded border border-gray-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs">
                          <FileText className="w-4 h-4 text-blue-600" />
                          <div>
                            <p className="font-semibold text-gray-800">
                              {vacuna.nombre_archivo || vacuna.archivo?.name}
                            </p>
                            <p className="text-gray-500">PDF</p>
                          </div>
                        </div>
                        {vacuna.ruta_archivo && !vacuna.archivo && (
                          <a
                            href={vacuna.ruta_archivo}
                            download
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-100 p-2 rounded transition"
                            title="Descargar PDF"
                          >
                            <Download className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Botón eliminar (solo para nuevas) */}
                {!readonly && vacuna.es_nueva && (
                  <button
                    type="button"
                    onClick={() =>
                      handleEliminarVacuna(vacunas.findIndex((v) => v.id === vacuna.id))
                    }
                    className="p-2 text-red-500 hover:bg-red-50 rounded transition-colors flex-shrink-0"
                    title="Eliminar"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {todasLasVacunas.length === 0 && (
        <div className="bg-gray-50 p-6 rounded-lg border-2 border-dashed border-gray-300 text-center">
          <p className="text-sm text-gray-500">
            No hay vacunas registradas. Agregue una nueva vacuna para continuar.
          </p>
        </div>
      )}
    </div>
  );
};

export default VacunasConArchivos;