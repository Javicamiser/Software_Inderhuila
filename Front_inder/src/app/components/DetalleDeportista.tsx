import { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Eye } from 'lucide-react';
import { deportistasService, historiaClinicaService } from '../services/apiClient';
import { toast } from 'sonner';

interface Props {
  deportistaId: string;
  onBack?: () => void;
}

export function DetalleDeportista({ deportistaId, onBack }: Props) {
  const [deportista, setDeportista] = useState<any>(null);
  const [historias, setHistorias] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    cargarDatos();
  }, [deportistaId]);

  const cargarDatos = async () => {
    try {
      setIsLoading(true);
      const depo = await deportistasService.getById(deportistaId);
      const hists = await historiaClinicaService.getByDeportistaId(deportistaId);
      setDeportista(depo);
      setHistorias(Array.isArray(hists) ? hists : []);
    } catch (error) {
      toast.error('Error cargando datos');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!deportista) {
    return (
      <div className="p-6 text-center">
        <p className="text-red-600">Deportista no encontrado</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* ENCABEZADO */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={onBack || (() => window.history.back())}
            className="bg-gray-200 text-gray-700 p-2 rounded hover:bg-gray-300 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-4xl font-bold text-gray-900">
              {deportista.nombres} {deportista.apellidos}
            </h1>
            <p className="text-gray-600 mt-1">Documento: {deportista.numero_documento}</p>
          </div>
        </div>

        {/* DATOS PERSONALES */}
        <div className="bg-white rounded-lg shadow p-8 mb-6">
          <h2 className="text-2xl font-bold mb-6 text-gray-900">Datos Personales</h2>
          
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-600 font-semibold uppercase">Tipo Documento</p>
              <p className="text-lg text-gray-900 mt-1">{deportista.tipo_documento || '-'}</p>
            </div>

            <div>
              <p className="text-sm text-gray-600 font-semibold uppercase">Número Documento</p>
              <p className="text-lg text-gray-900 mt-1">{deportista.numero_documento}</p>
            </div>

            <div>
              <p className="text-sm text-gray-600 font-semibold uppercase">Fecha Nacimiento</p>
              <p className="text-lg text-gray-900 mt-1">{deportista.fecha_nacimiento || '-'}</p>
            </div>

            <div>
              <p className="text-sm text-gray-600 font-semibold uppercase">Sexo</p>
              <p className="text-lg text-gray-900 mt-1">{deportista.sexo || '-'}</p>
            </div>

            <div>
              <p className="text-sm text-gray-600 font-semibold uppercase">Teléfono</p>
              <p className="text-lg text-gray-900 mt-1">{deportista.telefono || '-'}</p>
            </div>

            <div>
              <p className="text-sm text-gray-600 font-semibold uppercase">Email</p>
              <p className="text-lg text-gray-900 mt-1">{deportista.email || '-'}</p>
            </div>

            <div className="col-span-2">
              <p className="text-sm text-gray-600 font-semibold uppercase">Dirección</p>
              <p className="text-lg text-gray-900 mt-1">{deportista.direccion || '-'}</p>
            </div>

            <div>
              <p className="text-sm text-gray-600 font-semibold uppercase">Estado</p>
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold mt-1 ${
                deportista.estado === 'activo'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {deportista.estado || 'Sin estado'}
              </span>
            </div>
          </div>
        </div>

        {/* HISTORIAS CLÍNICAS */}
        <div className="bg-white rounded-lg shadow p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Historias Clínicas</h2>
            <button
              onClick={() => window.location.href = `/historia/nueva?deportista=${deportistaId}`}
              className="bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Nueva Historia
            </button>
          </div>

          {historias.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No hay historias clínicas registradas
            </p>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-100 border-b-2 border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    Fecha Apertura
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {historias.map((historia, idx) => (
                  <tr
                    key={historia.id}
                    className={`border-b ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                  >
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {new Date(historia.fecha_apertura).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                        {historia.estado || 'Abierta'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => window.location.href = `/historia/${historia.id}`}
                        className="text-blue-600 hover:bg-blue-100 p-2 rounded transition-colors inline-flex"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}