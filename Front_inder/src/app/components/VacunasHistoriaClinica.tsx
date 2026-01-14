import React, { useState, useEffect } from 'react';
import { Plus, X, FileUp, Trash2, Calendar, AlertCircle, Download, Loader } from 'lucide-react';
import { toast } from 'sonner';

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
  deportista_id: string;
  readonly?: boolean;
};

export const VacunasHistoriaClinica = ({
  deportista_id,
  readonly = false,
}: Props) => {
  const [vacunas, setVacunas] = useState<VacunaItem[]>([]);
  const [nuevaVacuna, setNuevaVacuna] = useState<VacunaItem>({
    nombre_vacuna: '',
    fecha_administracion: '',
    observaciones: '',
  });
  const [archivo, setArchivo] = useState<File | null>(null);
  const [mostrarOtra, setMostrarOtra] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingVacunas, setIsLoadingVacunas] = useState(true);
  const [mensaje, setMensaje] = useState('');

  // Cargar vacunas al montar
  useEffect(() => {
    cargarVacunas();
  }, [deportista_id]);

  const cargarVacunas = async () => {
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
      setVacunas(data || []);
    } catch (error: any) {
      console.warn('Error cargando vacunas:', error.message);
    } finally {
      setIsLoadingVacunas(false);
    }
  };

  const handleAgregarVacuna = async () => {
    // Validar
    if (!nuevaVacuna.nombre_vacuna.trim()) {
      alert('Seleccione o especifique una vacuna');
      return;
    }

    try {
      setIsLoading(true);

      // Crear vacuna en base de datos
      const payload = {
        nombre_vacuna: nuevaVacuna.nombre_vacuna,
        fecha_administracion: nuevaVacuna.fecha_administracion || null,
        observaciones: nuevaVacuna.observaciones || null,
      };

      console.log('📤 Enviando vacuna:', payload);

      const response = await fetch(
        `http://localhost:8000/api/v1/deportistas/${deportista_id}/vacunas`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Error al crear vacuna');
      }

      const vacunaCreada = await response.json();
      console.log('✅ Vacuna creada:', vacunaCreada);

      // Si hay archivo, cargarlo
      if (archivo) {
        const formData = new FormData();
        formData.append('archivo', archivo);

        const uploadResponse = await fetch(
          `http://localhost:8000/api/v1/deportistas/${deportista_id}/vacunas/${vacunaCreada.id}/archivo`,
          {
            method: 'POST',
            body: formData,
          }
        );

        if (!uploadResponse.ok) {
          const uploadError = await uploadResponse.json();
          console.warn('⚠️ Archivo no cargado:', uploadError);
          toast.warning('Vacuna creada pero el archivo no se cargó');
        } else {
          console.log('✅ Archivo cargado correctamente');
          toast.success('Vacuna y archivo cargados correctamente');
        }
      } else {
        toast.success('Vacuna agregada correctamente');
      }

      // Agregar a la lista local
      const vacunaParaAgregar: VacunaItem = {
        id: vacunaCreada.id,
        nombre_vacuna: vacunaCreada.nombre_vacuna,
        fecha_administracion: vacunaCreada.fecha_administracion,
        observaciones: vacunaCreada.observaciones,
        nombre_archivo: vacunaCreada.nombre_archivo,
      };

      setVacunas([...vacunas, vacunaParaAgregar]);
      setMensaje('✅ Vacuna agregada correctamente');
      setTimeout(() => setMensaje(''), 3000);

      // Limpiar formulario
      setNuevaVacuna({
        nombre_vacuna: '',
        fecha_administracion: '',
        observaciones: '',
      });
      setArchivo(null);
      setMostrarOtra(false);
    } catch (error: any) {
      console.error('❌ Error:', error);
      toast.error(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEliminarVacuna = async (vacunaId: string | undefined) => {
    if (!vacunaId) return;

    try {
      setIsLoading(true);

      const response = await fetch(
        `http://localhost:8000/api/v1/deportistas/${deportista_id}/vacunas/${vacunaId}`,
        {
          method: 'DELETE',
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Error al eliminar vacuna');
      }

      setVacunas(vacunas.filter(v => v.id !== vacunaId));
      toast.success('Vacuna eliminada correctamente');
    } catch (error: any) {
      console.error('❌ Error:', error);
      toast.error(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleArchivoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      const file = files[0];
      const tiposPermitidos = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
      if (!tiposPermitidos.includes(file.type)) {
        alert('Solo se permiten archivos PDF, JPG o PNG');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert('El archivo no debe exceder 5MB');
        return;
      }
      setArchivo(file);
    }
  };

  const handleDescargarArchivo = async (vacunaId: string | undefined, nombreArchivo: string | undefined) => {
    if (!vacunaId || !nombreArchivo) return;

    try {
      const response = await fetch(
        `http://localhost:8000/api/v1/deportistas/${deportista_id}/vacunas/${vacunaId}/archivo`
      );
      if (!response.ok) {
        throw new Error('Error al descargar archivo');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = nombreArchivo;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error: any) {
      toast.error(`Error: ${error.message}`);
    }
  };

  if (isLoadingVacunas) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader className="w-6 h-6 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Cargando vacunas...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Mensaje de estado */}
      {mensaje && (
        <div className="bg-green-50 border border-green-200 text-green-800 p-4 rounded-lg">
          {mensaje}
        </div>
      )}

      {/* Formulario para agregar vacuna */}
      {!readonly && (
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
                  disabled={isLoading}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
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
                    disabled={isLoading}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setMostrarOtra(false);
                      setNuevaVacuna({ ...nuevaVacuna, nombre_vacuna: '' });
                    }}
                    className="text-sm text-blue-600 hover:text-blue-700"
                    disabled={isLoading}
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
                  disabled={isLoading}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
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
              disabled={isLoading}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none disabled:opacity-50"
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
                disabled={isLoading}
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
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Plus className="w-5 h-5" />
                Agregar Vacuna
              </>
            )}
          </button>
        </div>
      )}

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
                    {vacuna.nombre_archivo && (
                      <div className="flex items-center gap-2">
                        <FileUp className="w-3 h-3 text-blue-600" />
                        <button
                          onClick={() => handleDescargarArchivo(vacuna.id, vacuna.nombre_archivo)}
                          className="text-xs text-blue-600 hover:text-blue-700 underline flex items-center gap-1"
                        >
                          <Download className="w-3 h-3" />
                          {vacuna.nombre_archivo}
                        </button>
                      </div>
                    )}
                  </div>
                  {!readonly && (
                    <button
                      type="button"
                      onClick={() => handleEliminarVacuna(vacuna.id)}
                      disabled={isLoading}
                      className="p-1.5 text-red-500 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                      title="Eliminar"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {vacunas.length === 0 && !isLoadingVacunas && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-yellow-800 font-medium">ℹ️ Sin vacunas registradas</p>
              <p className="text-sm text-yellow-700 mt-1">
                Agregue las vacunas del deportista usando el formulario anterior.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VacunasHistoriaClinica;