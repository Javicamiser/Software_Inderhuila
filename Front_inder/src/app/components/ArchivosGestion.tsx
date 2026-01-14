import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import {
  Upload,
  Download,
  Trash2,
  File,
  FileText,
  Image,
  Folder,
  Search,
  Eye,
  X,
} from 'lucide-react';

interface ArchivosGestionProps {
  deportistaId?: string;
}

interface Archivo {
  id: string;
  nombre: string;
  tipo: string;
  tamaño: number;
  fecha: string;
  descripcion?: string;
}

const TIPOS_PERMITIDOS = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
];

const TAMAÑO_MAX = 10 * 1024 * 1024; // 10 MB

export function ArchivosGestion({ deportistaId }: ArchivosGestionProps) {
  const [archivos, setArchivos] = useState<Archivo[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('todos');
  const [archivoSeleccionado, setArchivoSeleccionado] = useState<Archivo | null>(null);
  const [modalVistaPrevia, setModalVistaPrevia] = useState(false);

  useEffect(() => {
    cargarArchivos();
  }, [deportistaId]);

  const cargarArchivos = async () => {
    try {
      // Aquí irían los archivos del backend
      // const response = await archivosService.listar(deportistaId);
      // setArchivos(response);

      // Mock data por ahora
      setArchivos([
        {
          id: '1',
          nombre: 'Evaluacion_Fisica_2025.pdf',
          tipo: 'application/pdf',
          tamaño: 1024 * 512,
          fecha: '2025-12-20',
          descripcion: 'Evaluación física inicial',
        },
        {
          id: '2',
          nombre: 'Rayos_X_Rodilla.jpg',
          tipo: 'image/jpeg',
          tamaño: 1024 * 2048,
          fecha: '2025-12-19',
          descripcion: 'Rayos X de rodilla derecha',
        },
        {
          id: '3',
          nombre: 'Laboratorio_Resultados.pdf',
          tipo: 'application/pdf',
          tamaño: 1024 * 256,
          fecha: '2025-12-18',
          descripcion: 'Análisis de laboratorio',
        },
      ]);
    } catch (error) {
      console.error('Error cargando archivos:', error);
      toast.error('Error al cargar archivos');
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    handleArchivos(files);
  };

  const handleArchivos = async (files: File[]) => {
    for (const file of files) {
      // Validar tipo
      if (!TIPOS_PERMITIDOS.includes(file.type)) {
        toast.error(`Tipo de archivo no permitido: ${file.name}`);
        continue;
      }

      // Validar tamaño
      if (file.size > TAMAÑO_MAX) {
        toast.error(`Archivo muy grande: ${file.name} (máx 10MB)`);
        continue;
      }

      try {
        // Aquí iría la llamada al backend
        // const response = await archivosService.subir(file, deportistaId);

        // Simulación
        const nuevoArchivo: Archivo = {
          id: Date.now().toString(),
          nombre: file.name,
          tipo: file.type,
          tamaño: file.size,
          fecha: new Date().toISOString().split('T')[0],
          descripcion: '',
        };

        setArchivos([...archivos, nuevoArchivo]);
        toast.success(`Archivo ${file.name} subido correctamente`);
      } catch (error) {
        console.error('Error subiendo archivo:', error);
        toast.error(`Error al subir ${file.name}`);
      }
    }
  };

  const handleClick = () => {
    const input = document.getElementById('file-input') as HTMLInputElement;
    input?.click();
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleArchivos(Array.from(e.target.files));
    }
  };

  const handleDescargar = (archivo: Archivo) => {
    // Simular descarga
    toast.success(`Descargando ${archivo.nombre}...`);
  };

  const handleEliminar = (archivoId: string) => {
    if (confirm('¿Está seguro que desea eliminar este archivo?')) {
      setArchivos(archivos.filter((a) => a.id !== archivoId));
      toast.success('Archivo eliminado correctamente');
    }
  };

  const handleVerPrevia = (archivo: Archivo) => {
    setArchivoSeleccionado(archivo);
    setModalVistaPrevia(true);
  };

  const formatoTamaño = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const getIcono = (tipo: string) => {
    if (tipo.includes('pdf')) return <FileText className="w-5 h-5 text-red-600" />;
    if (tipo.includes('image')) return <Image className="w-5 h-5 text-blue-600" />;
    if (tipo.includes('word')) return <File className="w-5 h-5 text-blue-600" />;
    if (tipo.includes('sheet') || tipo.includes('excel')) return <File className="w-5 h-5 text-green-600" />;
    return <File className="w-5 h-5 text-gray-600" />;
  };

  // Filtrar archivos
  const archivosFiltrados = archivos.filter((archivo) => {
    const coincideBusqueda = archivo.nombre.toLowerCase().includes(searchQuery.toLowerCase());
    const coincideTipo =
      filtroTipo === 'todos' || archivo.tipo.includes(filtroTipo.split('/')[0]);
    return coincideBusqueda && coincideTipo;
  });

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-blue-600">Gestión de Archivos Médicos</h1>
          <p className="text-gray-600 mt-1">Carga, visualiza y descarga documentos médicos</p>
        </div>

        {/* Área de Carga */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-lg p-12 text-center mb-8 transition-colors cursor-pointer ${
            isDragging
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 bg-white hover:bg-gray-50'
          }`}
          onClick={handleClick}
        >
          <input
            id="file-input"
            type="file"
            multiple
            hidden
            onChange={handleFileInput}
            accept=".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx,.xls,.xlsx"
          />

          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Arrastra archivos aquí</h3>
          <p className="text-gray-600 mb-4">
            o haz clic para seleccionar (máximo 10MB por archivo)
          </p>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleClick();
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Seleccionar Archivos
          </button>

          <p className="text-xs text-gray-500 mt-4">
            Formatos permitidos: PDF, JPG, PNG, WEBP, DOC, DOCX, XLS, XLSX
          </p>
        </div>

        {/* Filtros y Búsqueda */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar archivos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <select
            value={filtroTipo}
            onChange={(e) => setFiltroTipo(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="todos">Todos los tipos</option>
            <option value="application/pdf">PDF</option>
            <option value="image">Imágenes</option>
            <option value="word">Documentos Word</option>
            <option value="sheet">Hojas de cálculo</option>
          </select>
        </div>

        {/* Lista de Archivos */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {archivosFiltrados.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Folder className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No hay archivos para mostrar</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50 border-b-2 border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Nombre
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Tipo
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Tamaño
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Fecha
                    </th>
                    <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {archivosFiltrados.map((archivo) => (
                    <tr key={archivo.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="px-6 py-4 flex items-center gap-3">
                        {getIcono(archivo.tipo)}
                        <div>
                          <p className="text-sm font-medium text-gray-900">{archivo.nombre}</p>
                          {archivo.descripcion && (
                            <p className="text-xs text-gray-500">{archivo.descripcion}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {archivo.tipo.split('/')[1]?.toUpperCase() || 'Desconocido'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {formatoTamaño(archivo.tamaño)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(archivo.fecha).toLocaleDateString('es-ES')}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleVerPrevia(archivo)}
                            className="p-2 hover:bg-blue-100 text-blue-600 rounded transition"
                            title="Ver vista previa"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDescargar(archivo)}
                            className="p-2 hover:bg-green-100 text-green-600 rounded transition"
                            title="Descargar archivo"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEliminar(archivo.id)}
                            className="p-2 hover:bg-red-100 text-red-600 rounded transition"
                            title="Eliminar archivo"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Resumen */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 text-sm text-gray-600">
            Total: {archivosFiltrados.length} archivo(s) |
            Tamaño total:{' '}
            {formatoTamaño(
              archivosFiltrados.reduce((sum, a) => sum + a.tamaño, 0)
            )}
          </div>
        </div>
      </div>

      {/* Modal de Vista Previa */}
      {modalVistaPrevia && archivoSeleccionado && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                {archivoSeleccionado.nombre}
              </h2>
              <button
                onClick={() => setModalVistaPrevia(false)}
                className="p-1 hover:bg-gray-100 rounded transition"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="flex-1 overflow-auto p-6 bg-gray-50">
              {archivoSeleccionado.tipo.includes('image') ? (
                <img
                  src={`/api/archivos/${archivoSeleccionado.id}`}
                  alt={archivoSeleccionado.nombre}
                  className="max-w-full h-auto"
                />
              ) : archivoSeleccionado.tipo === 'application/pdf' ? (
                <iframe
                  src={`/api/archivos/${archivoSeleccionado.id}`}
                  className="w-full h-full"
                  title={archivoSeleccionado.nombre}
                />
              ) : (
                <div className="flex items-center justify-center h-64">
                  <p className="text-gray-600">
                    Este tipo de archivo no puede previsualizarse en línea
                  </p>
                </div>
              )}
            </div>

            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => handleDescargar(archivoSeleccionado)}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
              >
                <Download className="w-4 h-4" />
                Descargar
              </button>
              <button
                onClick={() => setModalVistaPrevia(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
