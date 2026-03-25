import { useState, useEffect } from 'react';
import { deportistasService, historiaClinicaService } from '../services/apiClient';
import { toast } from 'sonner';
import { Plus, ChevronDown, ChevronUp, Search, Loader, Eye, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface HistoriaDeportista {
  id: string;
  fecha_apertura: string;
  created_at: string;
  tipo_cita?: string;
}

interface DeportistaConHistorias {
  id: string;
  nombres: string;
  apellidos: string;
  numero_documento: string;
  email?: string;
  telefono?: string;
  tipo_deporte?: string;
  historias: HistoriaDeportista[];
  expandido: boolean;
}

interface ListadoHistoriaClinicaProps {
  onNavigate?: (view: string) => void;
}

export function ListadoHistoriaClinica({ onNavigate }: ListadoHistoriaClinicaProps) {
  const [deportistas, setDeportistas] = useState<DeportistaConHistorias[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setIsLoading(true);
      
      // Cargar deportistas
      const respDeportistas = await deportistasService.getAll(1, 10000);
      let deportistasArray: any[] = [];
      
      if (Array.isArray(respDeportistas)) {
        deportistasArray = respDeportistas;
      } else if (respDeportistas && typeof respDeportistas === 'object') {
        if ('items' in respDeportistas && Array.isArray((respDeportistas as any).items)) {
          deportistasArray = (respDeportistas as any).items;
        }
      }

      // Cargar historias clínicas
      const respHistorias = await historiaClinicaService.getAll(1, 10000);
      let historiasArray: any[] = [];
      
      if (Array.isArray(respHistorias)) {
        historiasArray = respHistorias;
      } else if (respHistorias && typeof respHistorias === 'object') {
        if ('items' in respHistorias && Array.isArray((respHistorias as any).items)) {
          historiasArray = (respHistorias as any).items;
        }
      }

      // Agrupar historias por deportista
      const deportistasConHistorias: DeportistaConHistorias[] = deportistasArray.map(depo => {
        const historiasDepo = historiasArray.filter(hist => hist.deportista_id === depo.id);
        return {
          ...depo,
          historias: historiasDepo.sort((a, b) => 
            new Date(b.fecha_apertura).getTime() - new Date(a.fecha_apertura).getTime()
          ),
          expandido: false
        };
      }).filter(depo => depo.historias.length > 0);

      setDeportistas(deportistasConHistorias);
    } catch (error) {
      toast.error('Error cargando datos');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleExpandido = (id: string) => {
    setDeportistas(deportistas.map(depo => 
      depo.id === id ? { ...depo, expandido: !depo.expandido } : depo
    ));
  };

  const handleEliminarHistoria = async (historiaId: string, deportistaNombre: string) => {
    if (!window.confirm(`¿Eliminar esta historia clínica de ${deportistaNombre}? Esta acción no se puede deshacer.`)) {
      return;
    }

    try {
      setIsLoading(true);
      await historiaClinicaService.delete(historiaId);
      toast.success('Historia clínica eliminada correctamente');
      cargarDatos();
    } catch (error) {
      toast.error('Error al eliminar historia clínica');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const deportistasFiltrados = deportistas.filter((depo) => {
    const query = searchQuery.toLowerCase();
    return (
      depo.nombres.toLowerCase().includes(query) ||
      depo.apellidos.toLowerCase().includes(query) ||
      depo.numero_documento.includes(query)
    );
  });

  const getTipoHistoria = (historia: any): string => {
    return historia.tipo_cita || 'Control';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader className="w-8 h-8 text-blue-600 animate-spin" />
          <p className="text-gray-600">Cargando datos...</p>
        </div>
      </div>
    );
  }

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
            style={{ backgroundColor: '#0369A1' }}
            className="text-white px-6 py-3 rounded-lg flex items-center gap-2 hover:opacity-90 transition-colors shadow-md"
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
              style={{
                borderColor: searchQuery ? '#0369A1' : undefined,
                boxShadow: searchQuery ? '0 0 0 2px rgba(3, 105, 161, 0.1)' : undefined
              }}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none"
            />
          </div>
        </div>

        {/* LISTADO DE DEPORTISTAS */}
        <div className="space-y-4">
          {deportistasFiltrados.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <p className="text-gray-600">
                {searchQuery ? 'No hay deportistas que coincidan con tu búsqueda' : 'No hay historias clínicas registradas'}
              </p>
            </div>
          ) : (
            deportistasFiltrados.map((depo) => (
              <div key={depo.id} className="bg-white rounded-lg shadow overflow-hidden">
                {/* ENCABEZADO DEL DEPORTISTA */}
                <button
                  onClick={() => toggleExpandido(depo.id)}
                  className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                  style={{ backgroundColor: depo.expandido ? '#F0F9FF' : 'white' }}
                >
                  <div className="flex items-center gap-4 flex-1 text-left">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold"
                      style={{ backgroundColor: '#0369A1' }}
                    >
                      {depo.nombres.charAt(0)}{depo.apellidos.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {depo.nombres} {depo.apellidos}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Doc: {depo.numero_documento} • {depo.historias.length} historia(s)
                      </p>
                    </div>
                  </div>
                  {depo.expandido ? (
                    <ChevronUp className="w-5 h-5 text-gray-600" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-600" />
                  )}
                </button>

                {/* HISTORIAS DEL DEPORTISTA */}
                {depo.expandido && (
                  <div className="border-t border-gray-200">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead style={{ backgroundColor: '#E0F2FE' }}>
                          <tr>
                            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Tipo</th>
                            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Fecha Apertura</th>
                            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Fecha Creación</th>
                            <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900">Acciones</th>
                          </tr>
                        </thead>
                        <tbody>
                          {depo.historias.map((historia, idx) => (
                            <tr
                              key={historia.id}
                              className={`border-b ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50 transition-colors`}
                            >
                              <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold" 
                                  style={{
                                    backgroundColor: 'rgba(3, 105, 161, 0.1)',
                                    color: '#0369A1'
                                  }}
                                >
                                  {getTipoHistoria(historia)}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-600">
                                {historia.fecha_apertura ? format(new Date(historia.fecha_apertura), 'd MMM yyyy', { locale: es }) : '-'}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-600">
                                {historia.created_at ? format(new Date(historia.created_at), 'd MMM yyyy HH:mm', { locale: es }) : '-'}
                              </td>
                              <td className="px-6 py-4 text-center">
                                <div className="flex gap-2 justify-center">
                                  <button
                                    onClick={() => onNavigate?.(`historia-vista-${historia.id}`)}
                                    style={{ color: '#0369A1' }}
                                    className="hover:bg-blue-100 p-2 rounded transition-colors"
                                    title="Ver historia"
                                  >
                                    <Eye className="w-5 h-5" />
                                  </button>
                                  <button
                                    onClick={() => handleEliminarHistoria(historia.id, `${depo.nombres} ${depo.apellidos}`)}
                                    className="text-red-600 hover:bg-red-100 p-2 rounded transition-colors"
                                    title="Eliminar historia"
                                  >
                                    <Trash2 className="w-5 h-5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* INFORMACIÓN DE RESULTADOS */}
        {deportistasFiltrados.length > 0 && (
          <div className="mt-6 bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">
              Mostrando <strong>{deportistasFiltrados.length}</strong> deportista(s) con historias clínicas
            </p>
          </div>
        )}
      </div>
    </div>
  );
}