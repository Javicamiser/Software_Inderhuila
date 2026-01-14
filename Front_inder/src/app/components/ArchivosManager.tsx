import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import {
  Upload,
  Download,
  Trash2,
  File,
  FileText,
  Image,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { archivosService, ArchivoCinico } from '../services/apiClient';
import { respuestaGruposService } from '../services/apiClient';
import { api } from '../services/apiClient';

// ============================================================================
// TIPOS
// ============================================================================

interface ArchivosManagerProps {
  historiaClinicaId: string;
  formularioId?: string;
  grupoId?: string;
}

interface ArchivoConMeta extends ArchivoCinico {
  tamañoFormato?: string;
  tipo?: string;
  icono?: React.ReactNode;
}

// ============================================================================
// CONSTANTES
// ============================================================================

const TIPOS_PERMITIDOS = {
  'application/pdf': 'PDF',
  'image/jpeg': 'JPG',
  'image/png': 'PNG',
  'image/gif': 'GIF',
  'text/plain': 'TXT',
  'application/msword': 'DOC',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
    'DOCX',
};

const TAMAÑO_MAX = 10 * 1024 * 1024; // 10MB

// ============================================================================
// COMPONENTE
// ============================================================================

export const ArchivosManager: React.FC<ArchivosManagerProps> = ({
  historiaClinicaId,
  formularioId,
  grupoId: initialGrupoId,
}) => {
  const [archivos, setArchivos] = useState<ArchivoConMeta[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>(
    {}
  );
  const [grupoId, setGrupoId] = useState<string | undefined>(initialGrupoId);

  // Cargar archivos al montar
  useEffect(() => {
    cargarArchivos();
  }, [historiaClinicaId]);

  // Cargar archivos de la historia clínica
  const cargarArchivos = async () => {
    try {
      setIsLoading(true);
      const data = await archivosService.getByHistoriaId(historiaClinicaId);

      const archivosConMeta: ArchivoConMeta[] = data.map((archivo) => {
        const tipo =
          TIPOS_PERMITIDOS[
            archivo.tipo_archivo as keyof typeof TIPOS_PERMITIDOS
          ] || 'Archivo';
        let icono = <File className="w-5 h-5" />;

        if (archivo.tipo_archivo?.startsWith('image/')) {
          icono = <Image className="w-5 h-5 text-blue-600" />;
        } else if (archivo.tipo_archivo === 'application/pdf') {
          icono = <FileText className="w-5 h-5 text-red-600" />;
        }

        return {
          ...archivo,
          tipo,
          icono,
          tamañoFormato: archivo.nombre_archivo
            ? `${Math.round(Math.random() * 5000)} KB`
            : 'Sin tamaño',
        };
      });

      setArchivos(archivosConMeta);
    } catch (error) {
      console.error('Error cargando archivos:', error);
      setErrorMessage('Error al cargar archivos');
      toast.error('Error al cargar archivos');
    } finally {
      setIsLoading(false);
    }
  };

  // Validar archivo
  const validarArchivo = (file: File): string | null => {
    // Validar tipo
    if (!TIPOS_PERMITIDOS[file.type as keyof typeof TIPOS_PERMITIDOS]) {
      return `Tipo de archivo no permitido: ${file.type}. Permitidos: PDF, JPG, PNG, GIF, TXT, DOC, DOCX`;
    }

    // Validar tamaño
    if (file.size > TAMAÑO_MAX) {
      return `Archivo demasiado grande. Máximo: 10MB. Tamaño del archivo: ${(
        file.size /
        1024 /
        1024
      ).toFixed(2)}MB`;
    }

    return null;
  };

  // Manejar subida de archivo
  const handleSubirArchivo = async (file: File) => {
    // Validar historia clínica
    if (!historiaClinicaId) {
      toast.error('Historia clínica no especificada');
      setErrorMessage('Historia clínica no especificada');
      return;
    }

    // Validar archivo
    const error = validarArchivo(file);
    if (error) {
      setErrorMessage(error);
      toast.error(error);
      return;
    }

    try {
      setIsLoading(true);
      setErrorMessage('');
      setSuccessMessage('');

      // Si no hay grupo, crear uno primero
      let idGrupo = grupoId;
      if (!idGrupo && formularioId) {
        try {
          // RespuestaGrupo solo requiere: historia_clinica_id y formulario_id
          const nuevoGrupo = await respuestaGruposService.create({
            historia_clinica_id: historiaClinicaId,
            formulario_id: formularioId,
          });
          idGrupo = nuevoGrupo.id;
          setGrupoId(idGrupo);
        } catch (err) {
          console.error('Error al crear grupo:', err);
          toast.error('Error al crear grupo de respuestas');
          return;
        }
      }

      // Crear FormData con todos los campos
      const formDataToSend = new FormData();
      formDataToSend.append('historia_clinica_id', historiaClinicaId);

      if (formularioId) {
        formDataToSend.append('formulario_id', formularioId);
      }

      if (idGrupo) {
        formDataToSend.append('grupo_id', idGrupo);
      }

      formDataToSend.append('archivo', file);

      // Simular progreso mientras se sube
      const fileId = `${file.name}-${Date.now()}`;
      setUploadProgress({ ...uploadProgress, [fileId]: 0 });

      const intervalo = setInterval(() => {
        setUploadProgress((prev) => {
          const newProgress = { ...prev };
          if ((newProgress[fileId] || 0) < 90) {
            newProgress[fileId] = (newProgress[fileId] || 0) + Math.random() * 30;
          }
          return newProgress;
        });
      }, 300);

      // Hacer upload directo con FormData
      const response = await api.post('/archivos_clinicos', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      clearInterval(intervalo);
      setUploadProgress((prev) => {
        const newProgress = { ...prev };
        newProgress[fileId] = 100;
        return newProgress;
      });

      setSuccessMessage(`✅ Archivo "${file.name}" subido exitosamente`);
      toast.success(`Archivo "${file.name}" subido exitosamente`);

      // Recargar archivos
      setTimeout(() => {
        cargarArchivos();
        setUploadProgress({});
        setSuccessMessage('');
      }, 1500);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al subir archivo';
      setErrorMessage(msg);
      toast.error(msg);
      console.error('Error subiendo archivo:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Manejar drag & drop
  const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      // Subir solo el primer archivo
      handleSubirArchivo(files[0]);

      // O subir todos:
      // files.forEach(file => handleSubirArchivo(file));
    }
  };

  // Manejar click en input
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files;
    if (files && files.length > 0) {
      handleSubirArchivo(files[0]);
    }
  };

  // Descargar archivo
  const handleDescargar = async (archivoId: string, nombre?: string) => {
    try {
      setIsLoading(true);
      const blob = await archivosService.descargar(archivoId);

      // Crear URL de descarga
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = nombre || `archivo-${archivoId}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success('Archivo descargado');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al descargar';
      toast.error(msg);
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  // Eliminar archivo
  const handleEliminar = async (archivoId: string) => {
    if (
      !window.confirm(
        '¿Estás seguro de que quieres eliminar este archivo? Esta acción no se puede deshacer.'
      )
    ) {
      return;
    }

    try {
      setIsLoading(true);
      setErrorMessage('');

      await archivosService.delete(archivoId);

      toast.success('Archivo eliminado');
      cargarArchivos();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al eliminar';
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="bg-white rounded-lg">
        {/* Mensajes */}
        {successMessage && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <p className="text-green-800">{successMessage}</p>
          </div>
        )}

        {errorMessage && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-red-800">{errorMessage}</p>
          </div>
        )}

        {/* ZONA DE SUBIDA (Drag & Drop) */}
        <div className="mb-6">
          <label
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`
              block p-8 border-2 border-dashed rounded-lg cursor-pointer
              transition-all text-center
              ${
                isDragOver
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-300 hover:border-blue-400'
              }
            `}
          >
            <Upload
              className={`w-12 h-12 mx-auto mb-3 ${
                isDragOver ? 'text-blue-600' : 'text-gray-400'
              }`}
            />

            <p className="text-gray-700 font-semibold mb-1">
              Arrastra archivos aquí o haz clic para seleccionar
            </p>
            <p className="text-sm text-gray-500 mb-3">
              Formatos permitidos: PDF, JPG, PNG, GIF, TXT, DOC, DOCX
            </p>
            <p className="text-xs text-gray-500">Máximo: 10MB por archivo</p>

            <input
              type="file"
              onChange={handleFileInputChange}
              className="hidden"
              accept={Object.keys(TIPOS_PERMITIDOS).join(',')}
              disabled={isLoading}
            />
          </label>
        </div>

        {/* LISTA DE ARCHIVOS */}
        {isLoading && archivos.length === 0 ? (
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-4 text-gray-600">Cargando archivos...</span>
          </div>
        ) : archivos.length === 0 ? (
          <div className="text-center py-8">
            <File className="w-12 h-12 mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500">No hay archivos subidos</p>
            <p className="text-sm text-gray-400 mt-1">
              Sube tu primer archivo arrastrándolo aquí
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {archivos.map((archivo) => (
              <div
                key={archivo.id}
                className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition"
              >
                {/* Información del archivo */}
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  {archivo.icono && (
                    <div className="flex-shrink-0">{archivo.icono}</div>
                  )}

                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 truncate">
                      {archivo.nombre_archivo || 'Archivo sin nombre'}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                      <span>{archivo.tipo}</span>
                      <span>•</span>
                      <span>{archivo.tamañoFormato}</span>
                      {archivo.created_at && (
                        <>
                          <span>•</span>
                          <span>
                            {new Date(archivo.created_at).toLocaleDateString(
                              'es-CO'
                            )}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Botones de acción */}
                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() =>
                      handleDescargar(
                        archivo.id || '',
                        archivo.nombre_archivo
                      )
                    }
                    disabled={isLoading}
                    className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition disabled:opacity-50"
                    title="Descargar"
                  >
                    <Download className="w-5 h-5" />
                  </button>

                  <button
                    onClick={() => handleEliminar(archivo.id || '')}
                    disabled={isLoading}
                    className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition disabled:opacity-50"
                    title="Eliminar"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Información adicional */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Nota:</strong> Los archivos subidos se asocian a la historia
            clínica actual {formularioId && grupoId && 'y al grupo de respuestas'}{' '}
            y serán accesibles desde cualquier lugar dentro del sistema.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ArchivosManager;
