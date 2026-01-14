import { useState, useEffect } from 'react';
import { historiaClinicaService } from '../services/apiClient';
import { toast } from 'sonner';
import { Plus, Trash2, Eye, Search } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface ListadoHistoriaClinicaProps {
  onNavigate?: (view: string) => void;
}

export function ListadoHistoriaClinica({ onNavigate }: ListadoHistoriaClinicaProps) {
  const [historias, setHistorias] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    cargarHistorias();
  }, [page]);

  const cargarHistorias = async () => {
    try {
      setIsLoading(true);
      const response = await historiaClinicaService.getAll(page, 10);
      
      // Manejo de respuesta con paginación
      if (Array.isArray(response)) {
        setHistorias(response);
      } else if (response.items) {
        setHistorias(response.items);
        setTotalPages(response.total_pages || 1);
      }
    } catch (error) {
      toast.error('Error cargando historias clínicas');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEliminar = async (id: string, deportista: any) => {
    if (!window.confirm(`¿Eliminar la historia clínica de ${deportista?.nombres || 'este deportista'}? Esta acción no se puede deshacer.`)) {
      return;
    }

    try {
      setIsLoading(true);
      await historiaClinicaService.delete(id);
      toast.success('Historia clínica eliminada correctamente');
      cargarHistorias();
    } catch (error) {
      toast.error('Error al eliminar historia clínica');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const historiasFiltradas = historias.filter((historia) => {
    const query = searchQuery.toLowerCase();
    const deportista = historia.deportista;
    return (
      !deportista ||
      deportista.nombres?.toLowerCase().includes(query) ||
      deportista.apellidos?.toLowerCase().includes(query) ||
      deportista.numero_documento?.includes(query)
    );
  });

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* ENCABEZADO */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Historias Clínicas</h1>
            <p className="text-gray-600">Gestiona el registro de todas las historias clínicas</p>
          </div>
          <button
            onClick={() => onNavigate?.('historia')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors shadow-md"
          >
            <Plus className="w-5 h-5" />
            Nueva Historia
          </button>
        </div>

        {/* BÚSQUEDA */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar por nombre, apellido o documento..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* TABLA */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <span className="ml-4 text-gray-600">Cargando historias clínicas...</span>
            </div>
          ) : historiasFiltradas.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p>No hay historias clínicas que coincidan con tu búsqueda</p>
            </div>
          ) : (
            <>
              <table className="w-full">
                <thead className="bg-gray-100 border-b-2 border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Deportista</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Documento</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Fecha Apertura</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Fecha Creación</th>
                    <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {historiasFiltradas.map((historia, idx) => {
                    const deportista = historia.deportista;
                    const nombreDeportista = deportista
                      ? `${deportista.nombres} ${deportista.apellidos}`
                      : 'Deportista no encontrado';

                    return (
                      <tr 
                        key={historia.id} 
                        className={`border-b ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50 transition-colors`}
                      >
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{nombreDeportista}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {deportista?.numero_documento || '-'}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {historia.fecha_apertura ? format(new Date(historia.fecha_apertura), 'd MMMM yyyy', { locale: es }) : '-'}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {historia.created_at ? format(new Date(historia.created_at), 'd MMMM yyyy HH:mm', { locale: es }) : '-'}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex gap-2 justify-center">
                            <button
                              onClick={() => onNavigate?.(`historia-vista-${historia.id}`)}
                              className="text-blue-600 hover:bg-blue-100 p-2 rounded transition-colors"
                              title="Ver detalles"
                            >
                              <Eye className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleEliminar(historia.id, deportista)}
                              className="text-red-600 hover:bg-red-100 p-2 rounded transition-colors"
                              title="Eliminar"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* PAGINACIÓN */}
              {totalPages > 1 && (
                <div className="flex justify-between items-center px-6 py-4 bg-gray-50 border-t">
                  <button
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded disabled:opacity-50"
                  >
                    Anterior
                  </button>
                  <span className="text-gray-600">
                    Página {page} de {totalPages}
                  </span>
                  <button
                    onClick={() => setPage(Math.min(totalPages, page + 1))}
                    disabled={page === totalPages}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded disabled:opacity-50"
                  >
                    Siguiente
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
