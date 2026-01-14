import { useState, useEffect } from 'react';
import { deportistasService, Deportista } from '../services/apiClient';
import { toast } from 'sonner';
import { Plus, Edit2, Trash2, Eye, Search, X } from 'lucide-react';

interface ListadoDeportistasProps {
  onNavigate?: (view: string) => void;
}

const PAISES = [
  "Colombia",
  "Argentina",
  "Bolivia",
  "Brasil",
  "Chile",
  "Costa Rica",
  "Cuba",
  "Ecuador",
  "El Salvador",
  "Guatemala",
  "Honduras",
  "México",
  "Nicaragua",
  "Panamá",
  "Paraguay",
  "Perú",
  "República Dominicana",
  "Uruguay",
  "Venezuela",
  "España",
  "Estados Unidos",
  "Otro"
];

const DEPARTAMENTOS = [
  "Amazonas",
  "Antioquia",
  "Arauca",
  "Atlántico",
  "Bolívar",
  "Boyacá",
  "Caldas",
  "Caquetá",
  "Casanare",
  "Cauca",
  "Cesar",
  "Chocó",
  "Córdoba",
  "Cundinamarca",
  "Guainía",
  "Guaviare",
  "Huila",
  "La Guajira",
  "Magdalena",
  "Meta",
  "Nariño",
  "Norte de Santander",
  "Putumayo",
  "Quindío",
  "Risaralda",
  "San Andrés y Providencia",
  "Santander",
  "Sucre",
  "Tolima",
  "Valle del Cauca",
  "Vaupés",
  "Vichada"
];

const CIUDADES_POR_DEPARTAMENTO: Record<string, string[]> = {
  "Huila": ["Neiva", "Pitalito", "Garzón", "La Plata", "Campoalegre", "Aipe", "Algeciras", "Baraya", "Gigante", "Hobo", "Isnos", "Palermo", "Rivera", "Saladoblanco", "San Agustín", "Tarqui", "Tello", "Teruel", "Tesalia", "Timaná", "Villavieja", "Yaguará"],
  "Bogotá D.C.": ["Bogotá"],
  "Antioquia": ["Medellín", "Bello", "Itagüí", "Envigado", "Apartadó", "Turbo", "Rionegro", "Sabaneta"],
  "Valle del Cauca": ["Cali", "Palmira", "Buenaventura", "Tuluá", "Cartago", "Buga", "Jamundí"],
  "Atlántico": ["Barranquilla", "Soledad", "Malambo", "Sabanalarga", "Puerto Colombia"],
  "Cundinamarca": ["Soacha", "Facatativá", "Zipaquirá", "Chía", "Fusagasugá", "Girardot", "Madrid"],
  "Santander": ["Bucaramanga", "Floridablanca", "Girón", "Piedecuesta", "Barrancabermeja"],
  "Bolívar": ["Cartagena", "Magangué", "Turbaco", "Arjona"],
  "Norte de Santander": ["Cúcuta", "Ocaña", "Pamplona", "Villa del Rosario"],
  "Tolima": ["Ibagué", "Espinal", "Melgar", "Honda", "Líbano"],
  "Caldas": ["Manizales", "Villamaría", "Chinchiná", "La Dorada"],
  "Risaralda": ["Pereira", "Dosquebradas", "Santa Rosa de Cabal", "La Virginia"],
  "Quindío": ["Armenia", "Calarcá", "Montenegro", "La Tebaida"],
  "Cauca": ["Popayán", "Santander de Quilichao", "Puerto Tejada"],
  "Nariño": ["Pasto", "Ipiales", "Tumaco", "Túquerres"],
  "Magdalena": ["Santa Marta", "Ciénaga", "Fundación", "El Banco"],
  "Cesar": ["Valledupar", "Aguachica", "Bosconia", "Chimichagua"],
  "Córdoba": ["Montería", "Cereté", "Lorica", "Sahagún"],
  "Sucre": ["Sincelejo", "Corozal", "Sampués"],
  "Meta": ["Villavicencio", "Acacías", "Granada", "Puerto López"],
  "Boyacá": ["Tunja", "Duitama", "Sogamoso", "Chiquinquirá", "Paipa"],
  "La Guajira": ["Riohacha", "Maicao", "Uribia"],
  "Caquetá": ["Florencia", "San Vicente del Caguán"],
  "Casanare": ["Yopal", "Aguazul", "Villanueva"],
  "Arauca": ["Arauca", "Tame"],
  "Putumayo": ["Mocoa", "Puerto Asís"],
  "San Andrés y Providencia": ["San Andrés"],
  "Amazonas": ["Leticia"],
  "Guainía": ["Inírida"],
  "Guaviare": ["San José del Guaviare"],
  "Vaupés": ["Mitú"],
  "Vichada": ["Puerto Carreño"],
  "Chocó": ["Quibdó", "Istmina"]
};

const ETNIAS = [
  "Mestizo",
  "Indígena",
  "Afrodescendiente",
  "Raizal",
  "Palenquero",
  "ROM (Gitano)",
  "Blanco",
  "Otro",
  "Prefiero no decirlo"
];

export function ListadoDeportistas({ onNavigate }: ListadoDeportistasProps) {
  const [deportistas, setDeportistas] = useState<Deportista[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Estados para los modales
  const [modalVer, setModalVer] = useState(false);
  const [modalEditar, setModalEditar] = useState(false);
  const [deportistaSeleccionado, setDeportistaSeleccionado] = useState<Deportista | null>(null);
  const [formEditando, setFormEditando] = useState<any>({});
  const [edadEditar, setEdadEditar] = useState<number | null>(null);

  useEffect(() => {
    cargarDeportistas();
  }, [page]);

  const cargarDeportistas = async () => {
    try {
      setIsLoading(true);
      const response = await deportistasService.getAll(page, 10);
      
      // Manejo de respuesta con paginación
      if (Array.isArray(response)) {
        setDeportistas(response);
      } else if (response.items) {
        setDeportistas(response.items);
        setTotalPages(response.total_pages || 1);
      }
    } catch (error) {
      toast.error('Error cargando deportistas');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEliminar = async (id: string, nombre: string) => {
    if (!window.confirm(`¿Eliminar a ${nombre}? Esta acción no se puede deshacer.`)) {
      return;
    }

    try {
      setIsLoading(true);
      await deportistasService.delete(id);
      toast.success('Deportista eliminado correctamente');
      cargarDeportistas();
    } catch (error) {
      toast.error('Error al eliminar deportista');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerDetalles = (deportista: Deportista) => {
    setDeportistaSeleccionado(deportista);
    setModalVer(true);
  };

  const handleAbrirEditar = (deportista: Deportista) => {
    setDeportistaSeleccionado(deportista);
    // Separar nombre y apellido
    const nombreCompleto = `${deportista.nombres} ${deportista.apellidos}`;
    
    setFormEditando({
      nombreCompleto: nombreCompleto,
      fechaNacimiento: deportista.fecha_nacimiento || '',
      genero: '', // Se rellenará basado en sexo_id
      tipoDocumento: '', // Se rellenará basado en tipo_documento_id
      numeroDocumento: deportista.numero_documento,
      nacionalidad: '',
      departamento: '',
      ciudad: '',
      estrato: '',
      etnia: '',
      telefono: deportista.telefono || '',
      correoElectronico: deportista.email || '',
      direccion: deportista.direccion || '',
      disciplina: deportista.tipo_deporte || '',
    });
    
    // Calcular edad
    if (deportista.fecha_nacimiento) {
      const hoy = new Date();
      const nacimiento = new Date(deportista.fecha_nacimiento);
      let edadCalculada = hoy.getFullYear() - nacimiento.getFullYear();
      const mes = hoy.getMonth() - nacimiento.getMonth();
      if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
        edadCalculada--;
      }
      setEdadEditar(edadCalculada >= 0 ? edadCalculada : null);
    }
    
    setModalEditar(true);
  };

  const handleGuardarEdicion = async () => {
    if (!deportistaSeleccionado) return;

    try {
      setIsLoading(true);
      
      // Separar nombre completo en nombres y apellidos
      const partes = formEditando.nombreCompleto.trim().split(" ");
      const nombres = partes.slice(0, -1).join(" ") || partes[0];
      const apellidos = partes[partes.length - 1] || "";
      
      // Preparar datos para actualizar
      const datosActualizar = {
        nombres: nombres,
        apellidos: apellidos,
        numero_documento: formEditando.numeroDocumento,
        fecha_nacimiento: formEditando.fechaNacimiento,
        telefono: formEditando.telefono,
        email: formEditando.correoElectronico,
        direccion: formEditando.direccion,
        tipo_deporte: formEditando.disciplina,
      };
      
      await deportistasService.update(deportistaSeleccionado.id, datosActualizar);
      toast.success('Deportista actualizado correctamente');
      setModalEditar(false);
      cargarDeportistas();
    } catch (error) {
      toast.error('Error al actualizar deportista');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Calcular edad automáticamente en el modal de edición
  useEffect(() => {
    if (formEditando.fechaNacimiento) {
      const hoy = new Date();
      const nacimiento = new Date(formEditando.fechaNacimiento);
      let edadCalculada = hoy.getFullYear() - nacimiento.getFullYear();
      const mes = hoy.getMonth() - nacimiento.getMonth();
      if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
        edadCalculada--;
      }
      setEdadEditar(edadCalculada >= 0 ? edadCalculada : null);
    }
  }, [formEditando.fechaNacimiento]);

  const deportistasFiltrados = deportistas.filter((depo) => {
    const query = searchQuery.toLowerCase();
    return (
      depo.nombres.toLowerCase().includes(query) ||
      depo.apellidos.toLowerCase().includes(query) ||
      depo.numero_documento.includes(query) ||
      depo.email?.toLowerCase().includes(query) ||
      depo.telefono?.includes(query)
    );
  });

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* ENCABEZADO */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Deportistas</h1>
            <p className="text-gray-600">Gestiona el registro de todos los deportistas</p>
          </div>
          <button
            onClick={() => onNavigate?.('registro')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors shadow-md"
          >
            <Plus className="w-5 h-5" />
            Nuevo Deportista
          </button>
        </div>

        {/* BÚSQUEDA */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar por nombre, documento, email o teléfono..."
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
              <span className="ml-4 text-gray-600">Cargando deportistas...</span>
            </div>
          ) : deportistasFiltrados.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p>No hay deportistas que coincidan con tu búsqueda</p>
            </div>
          ) : (
            <>
              <table className="w-full">
                <thead className="bg-gray-100 border-b-2 border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Documento</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Nombre</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Teléfono</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Email</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Estado</th>
                    <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {deportistasFiltrados.map((depo, idx) => (
                    <tr 
                      key={depo.id} 
                      className={`border-b ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50 transition-colors`}
                    >
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{depo.numero_documento}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {depo.nombres} {depo.apellidos}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{depo.telefono || '-'}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{depo.email || '-'}</td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          'bg-blue-100 text-blue-800'
                        }`}>
                          N/A
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex gap-2 justify-center">
                          <button
                            onClick={() => handleVerDetalles(depo)}
                            className="text-blue-600 hover:bg-blue-100 p-2 rounded transition-colors"
                            title="Ver detalles"
                          >
                            <Eye className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleAbrirEditar(depo)}
                            className="text-green-600 hover:bg-green-100 p-2 rounded transition-colors"
                            title="Editar"
                          >
                            <Edit2 className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleEliminar(depo.id, `${depo.nombres} ${depo.apellidos}`)}
                            className="text-red-600 hover:bg-red-100 p-2 rounded transition-colors"
                            title="Eliminar"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
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

        {/* MODAL VER DETALLES */}
        {modalVer && deportistaSeleccionado && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Detalles del Deportista</h2>
                <button
                  onClick={() => setModalVer(false)}
                  className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-semibold text-gray-700">Nombre</label>
                    <p className="text-gray-900">{deportistaSeleccionado.nombres}</p>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700">Apellido</label>
                    <p className="text-gray-900">{deportistaSeleccionado.apellidos}</p>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700">Documento</label>
                    <p className="text-gray-900">{deportistaSeleccionado.numero_documento}</p>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700">Email</label>
                    <p className="text-gray-900">{deportistaSeleccionado.email || '-'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700">Teléfono</label>
                    <p className="text-gray-900">{deportistaSeleccionado.telefono || '-'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700">Dirección</label>
                    <p className="text-gray-900">{deportistaSeleccionado.direccion || '-'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700">Fecha Nacimiento</label>
                    <p className="text-gray-900">{deportistaSeleccionado.fecha_nacimiento || '-'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700">Edad</label>
                    <p className="text-gray-900">{deportistaSeleccionado.edad || '-'}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
                <button
                  onClick={() => setModalVer(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL EDITAR */}
        {modalEditar && deportistaSeleccionado && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Editar Deportista</h2>
                <button
                  onClick={() => setModalEditar(false)}
                  className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* DATOS PERSONALES */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Datos Personales</h3>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Nombre Completo</label>
                    <input
                      type="text"
                      value={formEditando.nombreCompleto || ''}
                      onChange={(e) => setFormEditando({ ...formEditando, nombreCompleto: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Fecha Nacimiento</label>
                      <input
                        type="date"
                        value={formEditando.fechaNacimiento || ''}
                        onChange={(e) => setFormEditando({ ...formEditando, fechaNacimiento: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Edad</label>
                      <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50">
                        {edadEditar !== null ? `${edadEditar} años` : '-'}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Tipo Documento</label>
                      <select
                        value={formEditando.tipoDocumento || ''}
                        onChange={(e) => setFormEditando({ ...formEditando, tipoDocumento: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Seleccionar...</option>
                        <option value="cedula_ciudadania">Cédula de ciudadanía</option>
                        <option value="cedula_extranjeria">Cédula de extranjería</option>
                        <option value="pasaporte">Pasaporte</option>
                        <option value="nit">NIT</option>
                        <option value="tarjeta_identidad">Tarjeta de identidad</option>
                        <option value="pep">Permiso Especial de Permanencia</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Número Documento</label>
                      <input
                        type="text"
                        value={formEditando.numeroDocumento || ''}
                        onChange={(e) => setFormEditando({ ...formEditando, numeroDocumento: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Género</label>
                    <select
                      value={formEditando.genero || ''}
                      onChange={(e) => setFormEditando({ ...formEditando, genero: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Seleccionar...</option>
                      <option value="masculino">Masculino</option>
                      <option value="femenino">Femenino</option>
                      <option value="otro">Otro</option>
                    </select>
                  </div>
                </div>

                {/* DATOS DE UBICACIÓN */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Ubicación</h3>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Nacionalidad</label>
                    <select
                      value={formEditando.nacionalidad || ''}
                      onChange={(e) => {
                        setFormEditando({ ...formEditando, nacionalidad: e.target.value, departamento: '', ciudad: '' });
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Seleccionar...</option>
                      {PAISES.map(pais => (
                        <option key={pais} value={pais}>{pais}</option>
                      ))}
                    </select>
                  </div>

                  {formEditando.nacionalidad === 'Colombia' && (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Departamento</label>
                          <select
                            value={formEditando.departamento || ''}
                            onChange={(e) => {
                              setFormEditando({ ...formEditando, departamento: e.target.value, ciudad: '' });
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="">Seleccionar...</option>
                            {DEPARTAMENTOS.map(dept => (
                              <option key={dept} value={dept}>{dept}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Ciudad</label>
                          <select
                            value={formEditando.ciudad || ''}
                            onChange={(e) => setFormEditando({ ...formEditando, ciudad: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            disabled={!formEditando.departamento}
                          >
                            <option value="">Seleccionar...</option>
                            {(CIUDADES_POR_DEPARTAMENTO[formEditando.departamento] || []).map(ciudad => (
                              <option key={ciudad} value={ciudad}>{ciudad}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Estrato</label>
                          <select
                            value={formEditando.estrato || ''}
                            onChange={(e) => setFormEditando({ ...formEditando, estrato: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="">Seleccionar...</option>
                            <option value="1">Estrato 1</option>
                            <option value="2">Estrato 2</option>
                            <option value="3">Estrato 3</option>
                            <option value="4">Estrato 4</option>
                            <option value="5">Estrato 5</option>
                            <option value="6">Estrato 6</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Etnia</label>
                          <select
                            value={formEditando.etnia || ''}
                            onChange={(e) => setFormEditando({ ...formEditando, etnia: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="">Seleccionar...</option>
                            {ETNIAS.map(etnia => (
                              <option key={etnia} value={etnia}>{etnia}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </>
                  )}

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Dirección</label>
                    <input
                      type="text"
                      value={formEditando.direccion || ''}
                      onChange={(e) => setFormEditando({ ...formEditando, direccion: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* DATOS DE CONTACTO */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Contacto</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Teléfono</label>
                      <input
                        type="tel"
                        value={formEditando.telefono || ''}
                        onChange={(e) => setFormEditando({ ...formEditando, telefono: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                      <input
                        type="email"
                        value={formEditando.correoElectronico || ''}
                        onChange={(e) => setFormEditando({ ...formEditando, correoElectronico: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>

                {/* DATOS DEPORTIVOS */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Información Deportiva</h3>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Disciplina/Deporte <span className="text-red-500">*</span></label>
                    <select
                      value={formEditando.disciplina || ''}
                      onChange={(e) => setFormEditando({ ...formEditando, disciplina: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Seleccionar...</option>
                      <option value="pesas">Pesas</option>
                      <option value="natacion">Natación</option>
                      <option value="subacuatica">Subacuática</option>
                      <option value="lucha">Lucha</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
                <button
                  onClick={() => setModalEditar(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleGuardarEdicion}
                  disabled={isLoading}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  {isLoading ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}