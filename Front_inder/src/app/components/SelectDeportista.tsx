import { useState, useCallback, useEffect } from 'react';
import { Search, ArrowLeft, User, Calendar, FileText } from 'lucide-react';
import { deportistasService, Deportista } from '../../app/services/apiClient';
import { DeportistasConCitasHoy } from './DeportistasConCitasHoy';

// ============================================================================
// TIPOS
// ============================================================================

interface SelectDeportistaProps {
  onSelect: (deportista: Deportista) => void;
  onBack?: () => void;
  onError?: (error: string) => void;
}

// ============================================================================
// COMPONENTE
// ============================================================================

export const SelectDeportista: React.FC<SelectDeportistaProps> = ({
  onSelect,
  onBack,
  onError,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [deportistas, setDeportistas] = useState<Deportista[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  // Buscar deportistas
  const handleSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setDeportistas([]);
      setHasSearched(false);
      setErrorMessage('');
      return;
    }

    try {
      setIsLoading(true);
      setHasSearched(true);
      setErrorMessage('');

      const results = await deportistasService.search(query);
      setDeportistas(results);

      if (results.length === 0) {
        setErrorMessage('No se encontraron deportistas');
      }
    } catch (error) {
      const msg =
        error instanceof Error ? error.message : 'Error al buscar deportistas';
      setErrorMessage(msg);
      console.error('Error searching deportistas:', error);

      if (onError) {
        onError(msg);
      }
    } finally {
      setIsLoading(false);
    }
  }, [onError]);

  // Debounce en la búsqueda
  useEffect(() => {
    const timer = setTimeout(() => {
      handleSearch(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, handleSearch]);

  // Calcular edad
  const calcularEdad = (fechaNacimiento: string | undefined) => {
    if (!fechaNacimiento) return 'N/A';
    const hoy = new Date();
    const nacimiento = new Date(fechaNacimiento);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();

    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }

    return edad;
  };

  // Obtener la fecha de hoy
  const today = new Date();
  const dateOptions: Intl.DateTimeFormatOptions = { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  };
  const fechaHoy = today.toLocaleDateString('es-CO', dateOptions);

  return (
    <div className="max-w-6xl mx-auto p-6 py-8">
      <div className="bg-white rounded-lg shadow-md p-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          {onBack && (
            <button
              onClick={onBack}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Volver"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
          )}
          <div>
            <h1 className="text-blue-600 text-3xl font-bold">Seleccionar Deportista</h1>
            <p className="text-gray-600 mt-1">
              Selecciona un deportista para iniciar su historia clínica
            </p>
          </div>
        </div>

        {/* Banner fecha del día */}
        <div className="mb-6 bg-gradient-to-r from-blue-50 to-[#C84F3B]/10 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            <div>
              <p className="text-sm font-medium text-gray-800">Citas de hoy</p>
              <p className="text-xs text-gray-600 capitalize">{fechaHoy}</p>
            </div>
          </div>
        </div>

        {/* Deportistas con citas hoy */}
        <DeportistasConCitasHoy onSelectDeportista={onSelect} />

        {/* Buscador */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar por nombre, documento o deporte..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {isLoading && (
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
              </div>
            )}
          </div>
        </div>

        {/* Mensajes de error */}
        {errorMessage && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">{errorMessage}</p>
          </div>
        )}

        {/* Lista de deportistas */}
        {hasSearched && deportistas.length > 0 ? (
          <>
            <p className="text-sm text-gray-600 mb-4">
              Se encontraron <strong>{deportistas.length}</strong> deportista(s)
            </p>
            <div className="grid gap-4">
              {deportistas.map((deportista) => (
                <div
                  key={deportista.id}
                  className="border border-gray-200 rounded-lg p-4 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer group"
                  onClick={() => onSelect(deportista)}
                >
                  <div className="flex items-center gap-4">
                    {/* Foto */}
                    <div className="flex-shrink-0">
                      <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center border-2 border-gray-200">
                        <User className="w-8 h-8 text-gray-400" />
                      </div>
                    </div>

                    {/* Información */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-gray-900 font-semibold truncate group-hover:text-blue-600 transition-colors">
                        {deportista.nombres} {deportista.apellidos}
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-1 mt-2 text-gray-600 text-sm">
                        <div className="flex items-center gap-1">
                          <span className="text-gray-500">Doc:</span>
                          <span>{deportista.numero_documento}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-gray-500">Edad:</span>
                          <span>{calcularEdad(deportista.fecha_nacimiento)} años</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-gray-500">Teléfono:</span>
                          <span>{deportista.telefono || 'N/A'}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-gray-500">Email:</span>
                          <span className="truncate">{deportista.email || 'N/A'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Botón de acción */}
                    <div className="flex-shrink-0">
                      <button
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelect(deportista);
                        }}
                      >
                        <FileText className="w-4 h-4" />
                        <span>Iniciar Historia</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : hasSearched && deportistas.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <User className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p>No se encontraron deportistas</p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="mt-2 text-blue-600 hover:underline"
              >
                Limpiar búsqueda
              </button>
            )}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">Escribe para buscar un deportista</p>
          </div>
        )}

        {/* Footer con información */}
        {hasSearched && deportistas.length > 0 && (
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-gray-600 text-center">
              Total de deportistas: <span className="font-semibold text-gray-900">{deportistas.length}</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SelectDeportista;
