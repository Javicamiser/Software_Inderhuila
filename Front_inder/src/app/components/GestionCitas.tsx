import { useState, useEffect } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { format, parse, startOfWeek, getDay, isWithinInterval, startOfDay, endOfDay, addDays } from "date-fns";
import { es } from "date-fns/locale";
import { Plus, X, Calendar as CalendarIcon, User, Clock, Stethoscope, Trash2, Badge } from "lucide-react";
import { toast } from "sonner";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "../../styles/calendar.css";
import { citasService } from "../services/apiClient";
import { useCatalogos } from "../hooks/useCatalogos";

// Configurar react-big-calendar con date-fns
const locales = {
  es: es,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

type Cita = {
  id: string;
  deportista_id: string;
  deportista?: {
    nombre: string;
    apellido: string;
  };
  fecha: string;
  hora: string;
  tipo_cita_id: string;
  tipo_cita?: {
    nombre: string;
  };
  estado_cita_id: string;
  estado_cita?: {
    nombre: string;
  };
  observaciones?: string;
  created_at?: string;
};

type FormData = {
  deportista_id: string;
  fecha: string;
  hora: string;
  tipo_cita_id: string;
  estado_cita_id: string;
  observaciones: string;
};

type Deportista = {
  id: string;
  nombres: string;
  apellidos: string;
  numero_documento: string;
};

export function GestionCitas() {
  const { tiposCita, estadosCita, loading: loadingCatalogos } = useCatalogos();
  const [citas, setCitas] = useState<Cita[]>([]);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingCitas, setIsLoadingCitas] = useState(true);
  const [isLoadingDeportistas, setIsLoadingDeportistas] = useState(false);
  const [deportistasBuscados, setDeportistasBuscados] = useState<Deportista[]>([]);
  const [nombreBusqueda, setNombreBusqueda] = useState("");
  const [deportistaSeleccionado, setDeportistaSeleccionado] = useState<Deportista | null>(null);
  const [formData, setFormData] = useState<FormData>({
    deportista_id: "",
    fecha: "",
    hora: "",
    tipo_cita_id: "",
    estado_cita_id: "",
    observaciones: "",
  });

  // Cargar citas al montar el componente
  useEffect(() => {
    console.log("🔧 GestionCitas mounted, inicializando listener...");
    cargarCitas();
    
    // Método 1: Escuchar evento custom
    const handleCitasActualizadas = (event: Event) => {
      console.log("📅 ✅ Evento 'citasActualizadas' recibido!", event);
      console.log("📅 Citas actualizadas, recargando lista...");
      cargarCitas();
    };
    
    // Método 2: Escuchar cambios en localStorage
    const handleStorageChange = (e: StorageEvent) => {
      console.log("💾 Storage event recibido:", e.key, "=", e.newValue);
      if (e.key === 'citasActualizadas_timestamp') {
        console.log("💾 ✅ Cambio detectado en citasActualizadas_timestamp, recargando citas...");
        cargarCitas();
      }
    };
    
    console.log("🔧 Agregando listeners...");
    window.addEventListener('citasActualizadas', handleCitasActualizadas as EventListener);
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      console.log("🔧 Removiendo listeners...");
      window.removeEventListener('citasActualizadas', handleCitasActualizadas as EventListener);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const cargarCitas = async () => {
    try {
      console.log("📅 Iniciando cargarCitas()...");
      setIsLoadingCitas(true);
      const response = await citasService.getAll(1, 100);
      console.log("📅 Respuesta de citasService.getAll():", response);
      // Respuesta puede ser un array o un objeto con estructura paginada
      const citasData = Array.isArray(response) ? response : response.items || [];
      console.log("📅 Citas procesadas:", citasData);
      console.log("📅 Primera cita con estado:", citasData[0]?.estado_cita);
      setCitas((citasData || []) as Cita[]);
      console.log("📅 ✅ setCitas llamado, estado actualizado");
    } catch (error) {
      console.error("Error al cargar citas:", error);
      toast.error("Error al cargar las citas");
    } finally {
      setIsLoadingCitas(false);
    }
  };

  const handleAbrirModal = () => {
    setModalAbierto(true);
  };

  const handleCerrarModal = () => {
    setModalAbierto(false);
    setFormData({
      deportista_id: "",
      fecha: "",
      hora: "",
      tipo_cita_id: "",
      estado_cita_id: "",
      observaciones: "",
    });
    setNombreBusqueda("");
    setDeportistaSeleccionado(null);
    setDeportistasBuscados([]);
  };

  const handleBuscarDeportista = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const valor = e.target.value;
    setNombreBusqueda(valor);

    if (valor.trim().length < 2) {
      setDeportistasBuscados([]);
      setFormData({ ...formData, deportista_id: "" });
      setDeportistaSeleccionado(null);
      return;
    }

    try {
      setIsLoadingDeportistas(true);
      const response = await fetch(
        `http://localhost:8000/api/v1/deportistas/search?q=${encodeURIComponent(valor)}`
      );
      if (response.ok) {
        const datos = await response.json();
        setDeportistasBuscados(datos);
      } else {
        setDeportistasBuscados([]);
      }
    } catch (error) {
      console.error("Error al buscar deportista:", error);
      setDeportistasBuscados([]);
    } finally {
      setIsLoadingDeportistas(false);
    }
  };

  const handleSeleccionarDeportista = (deportista: Deportista) => {
    setDeportistaSeleccionado(deportista);
    setFormData({ ...formData, deportista_id: deportista.id });
    setDeportistasBuscados([]);
    setNombreBusqueda("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.deportista_id || !formData.fecha || !formData.hora) {
      toast.error("Por favor completa todos los campos obligatorios");
      return;
    }

    setIsLoading(true);
    try {
      // Mapear los nombres de los tipos de cita a sus IDs
      const tipoCitaSeleccionada = tiposCita.find((t) => t.nombre === formData.tipo_cita_id);
      const estadoCitaSeleccionado = estadosCita.find((e) => e.nombre === formData.estado_cita_id);

      if (!tipoCitaSeleccionada || !estadoCitaSeleccionado) {
        toast.error("Error: Tipo de cita o estado no válido");
        return;
      }

      const datosEnvio = {
        deportista_id: formData.deportista_id,
        fecha: formData.fecha,
        hora: formData.hora,
        tipo_cita_id: tipoCitaSeleccionada.id,
        estado_cita_id: estadoCitaSeleccionado.id,
        observaciones: formData.observaciones,
      };

      const nuevaCita = await citasService.create(datosEnvio);

      setCitas([...citas, nuevaCita as Cita]);
      handleCerrarModal();
      toast.success("Cita agendada correctamente");
    } catch (error) {
      console.error("Error al agendar cita:", error);
      toast.error("Error al agendar la cita");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEliminar = async (citaId: string) => {
    if (!confirm("¿Está seguro que desea eliminar esta cita?")) {
      return;
    }

    try {
      await citasService.delete(citaId);
      setCitas(citas.filter((c) => c.id !== citaId));
      toast.success("Cita eliminada correctamente");
    } catch (error) {
      console.error("Error al eliminar cita:", error);
      toast.error("Error al eliminar la cita");
    }
  };

  // Obtener citas de la semana actual
  const hoy = new Date();
  const inicioSemana = startOfWeek(hoy, { weekStartsOn: 1 });
  const finSemana = addDays(inicioSemana, 6);

  const citasSemanaActual = citas.filter((cita) => {
    try {
      const fechaCita = new Date(`${cita.fecha}T${cita.hora}`);
      return isWithinInterval(fechaCita, {
        start: startOfDay(inicioSemana),
        end: endOfDay(finSemana),
      });
    } catch {
      return false;
    }
  });

  // Convertir citas para react-big-calendar
  const eventos = citas
    .map((cita) => {
      try {
        const fechaHora = new Date(`${cita.fecha}T${cita.hora}`);
        const nombreDeportista = cita.deportista
          ? `${cita.deportista.nombre} ${cita.deportista.apellido}`
          : "Deportista";

        return {
          id: cita.id,
          title: nombreDeportista,
          start: fechaHora,
          end: new Date(fechaHora.getTime() + 60 * 60 * 1000),
          resource: cita,
        };
      } catch {
        return null;
      }
    })
    .filter(Boolean) as any[];

  const eventStyleGetter = (event: any) => {
    const cita = event.resource as Cita;
    let backgroundColor = "#1F4788"; // azul por defecto

    if (cita.tipo_cita_id?.includes("primera")) backgroundColor = "#C84F3B";
    else if (cita.tipo_cita_id?.includes("novedad")) backgroundColor = "#B8C91A";

    return {
      style: {
        backgroundColor,
        borderRadius: "5px",
        opacity: 0.9,
        color: "white",
        border: "0px",
        display: "block",
      },
    };
  };

  const getEstadoColor = (estado?: string) => {
    if (!estado) return 'bg-gray-100 text-gray-700';
    const lower = estado.toLowerCase();
    if (lower === 'programada') return 'bg-yellow-100 text-yellow-700';
    if (lower === 'confirmada') return 'bg-green-100 text-green-700';
    if (lower === 'cancelada') return 'bg-red-100 text-red-700';
    if (lower === 'realizada') return 'bg-blue-100 text-blue-700';
    if (lower === 'no presentó') return 'bg-orange-100 text-orange-700';
    return 'bg-gray-100 text-gray-700';
  };

  if (isLoadingCitas) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando citas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-blue-600">Gestión de Citas</h1>
          <p className="text-gray-600 mt-1">Agenda y consulta las citas médicas de los deportistas</p>
        </div>
        <button
          onClick={handleAbrirModal}
          className="px-6 py-3 bg-primary text-white rounded-lg hover:opacity-90 transition-all flex items-center gap-2"
          style={{ backgroundColor: "#C84F3B" }}
        >
          <Plus className="w-5 h-5" />
          Agendar Cita
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendario */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
          <h2 className="mb-4 text-lg font-semibold text-gray-800">Calendario de Citas</h2>
          <div style={{ height: "600px" }}>
            <Calendar
              localizer={localizer}
              events={eventos}
              startAccessor="start"
              endAccessor="end"
              style={{ height: "100%" }}
              messages={{
                next: "Siguiente",
                previous: "Anterior",
                today: "Hoy",
                month: "Mes",
                week: "Semana",
                day: "Día",
                agenda: "Agenda",
                date: "Fecha",
                time: "Hora",
                event: "Evento",
                noEventsInRange: "No hay citas en este rango",
                showMore: (total: number) => `+ Ver más (${total})`,
              }}
              culture="es"
              eventPropGetter={eventStyleGetter}
            />
          </div>
        </div>

        {/* Lista de citas de la semana */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="mb-4 text-lg font-semibold text-gray-800">Citas de esta semana</h2>
          
          {console.log("🎨 Renderizando lista de citas. Total:", citas.length, "En semana:", citasSemanaActual.length)}
          {console.log("📋 Primera cita en semana:", citasSemanaActual[0]?.estado_cita?.nombre)}

          {citasSemanaActual.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <CalendarIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No hay citas agendadas</p>
              <p className="text-sm">para esta semana</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[580px] overflow-y-auto pr-2 scroll-smooth scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400">
              {citasSemanaActual
                .sort(
                  (a, b) =>
                    new Date(`${a.fecha}T${a.hora}`).getTime() -
                    new Date(`${b.fecha}T${b.hora}`).getTime()
                )
                .map((cita) => {
                  const nombreDeportista = cita.deportista
                    ? `${cita.deportista.nombre} ${cita.deportista.apellido}`
                    : "Deportista";
                  const fechaCita = new Date(`${cita.fecha}T${cita.hora}`);

                  return (
                    <div
                      key={cita.id}
                      className="border border-gray-200 rounded-lg p-4 hover:border-blue-400 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2 flex-1">
                          <User className="w-4 h-4 text-gray-500 flex-shrink-0" />
                          <span className="text-sm font-medium text-gray-900 truncate">
                            {nombreDeportista}
                          </span>
                        </div>
                        <button
                          onClick={() => handleEliminar(cita.id)}
                          className="p-1 hover:bg-red-50 rounded transition-colors text-gray-400 hover:text-red-500"
                          title="Eliminar cita"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="space-y-1 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <CalendarIcon className="w-4 h-4 flex-shrink-0" />
                          <span>
                            {format(fechaCita, "EEEE d 'de' MMMM", { locale: es })}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 flex-shrink-0" />
                          <span>{format(fechaCita, "HH:mm")} hrs</span>
                        </div>
                        {cita.tipo_cita?.nombre && (
                          <div className="flex items-center gap-2">
                            <Stethoscope className="w-4 h-4 flex-shrink-0" />
                            <span>{cita.tipo_cita.nombre}</span>
                          </div>
                        )}
                        {cita.estado_cita?.nombre && (
                          <div className="flex items-center gap-2">
                            <Badge className="w-4 h-4 flex-shrink-0" />
                            <span
                              className={`text-xs font-semibold px-2 py-1 rounded-full ${getEstadoColor(
                                cita.estado_cita.nombre
                              )}`}
                            >
                              {cita.estado_cita.nombre}
                            </span>
                          </div>
                        )}
                      </div>
                      {cita.observaciones && (
                        <p className="text-xs text-gray-500 mt-2 italic">
                          "{cita.observaciones}"
                        </p>
                      )}
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      </div>

      {/* Modal para agendar cita */}
      {modalAbierto && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Agendar Nueva Cita</h2>
              <button
                onClick={handleCerrarModal}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Seleccionar deportista por nombre */}
              <div>
                <label htmlFor="deportista" className="block mb-2 text-gray-700 font-medium">
                  Deportista <span className="text-red-500">*</span>
                </label>
                
                {!deportistaSeleccionado ? (
                  <div className="relative">
                    <input
                      type="text"
                      id="deportista"
                      value={nombreBusqueda}
                      onChange={handleBuscarDeportista}
                      placeholder="Escribe el nombre del deportista..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required={!formData.deportista_id}
                    />
                    
                    {/* Dropdown de resultados */}
                    {nombreBusqueda.length >= 2 && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50">
                        {isLoadingDeportistas ? (
                          <div className="p-3 text-center text-gray-500">Buscando...</div>
                        ) : deportistasBuscados.length > 0 ? (
                          <ul className="max-h-64 overflow-y-auto">
                            {deportistasBuscados.map((deportista) => (
                              <li key={deportista.id}>
                                <button
                                  type="button"
                                  onClick={() => handleSeleccionarDeportista(deportista)}
                                  className="w-full text-left px-4 py-2 hover:bg-blue-50 border-b border-gray-100 last:border-b-0 transition-colors"
                                >
                                  <div className="font-medium text-gray-900">
                                    {deportista.nombres} {deportista.apellidos}
                                  </div>
                                  <div className="text-xs text-gray-600">
                                    Doc: {deportista.numero_documento}
                                  </div>
                                </button>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <div className="p-3 text-center text-gray-500">
                            No se encontraron deportistas
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div>
                      <div className="font-medium text-gray-900">
                        {deportistaSeleccionado.nombres} {deportistaSeleccionado.apellidos}
                      </div>
                      <div className="text-sm text-gray-600">
                        Doc: {deportistaSeleccionado.numero_documento}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setDeportistaSeleccionado(null);
                        setFormData({ ...formData, deportista_id: "" });
                        setNombreBusqueda("");
                      }}
                      className="ml-auto p-1 hover:bg-blue-200 rounded transition-colors"
                    >
                      <X className="w-4 h-4 text-gray-600" />
                    </button>
                  </div>
                )}
              </div>

              {/* Tipo de cita */}
              <div>
                <label htmlFor="tipoCita" className="block mb-2 text-gray-700 font-medium">
                  Tipo de Cita <span className="text-red-500">*</span>
                </label>
                <select
                  id="tipoCita"
                  value={formData.tipo_cita_id}
                  onChange={(e) =>
                    setFormData({ ...formData, tipo_cita_id: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  disabled={loadingCatalogos}
                >
                  <option value="">Seleccionar tipo de cita...</option>
                  {tiposCita.map((tipo) => (
                    <option key={tipo.id} value={tipo.nombre}>
                      {tipo.nombre}
                    </option>
                  ))}
                </select>
              </div>

              {/* Fecha */}
              <div>
                <label htmlFor="fecha" className="block mb-2 text-gray-700 font-medium">
                  Fecha <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  id="fecha"
                  value={formData.fecha}
                  onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Hora */}
              <div>
                <label htmlFor="hora" className="block mb-2 text-gray-700 font-medium">
                  Hora <span className="text-red-500">*</span>
                </label>
                <input
                  type="time"
                  id="hora"
                  value={formData.hora}
                  onChange={(e) => setFormData({ ...formData, hora: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Estado de cita */}
              <div>
                <label htmlFor="estadoCita" className="block mb-2 text-gray-700 font-medium">
                  Estado de Cita
                </label>
                <select
                  id="estadoCita"
                  value={formData.estado_cita_id}
                  onChange={(e) =>
                    setFormData({ ...formData, estado_cita_id: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={loadingCatalogos}
                >
                  <option value="">Seleccionar estado...</option>
                  {estadosCita.map((estado) => (
                    <option key={estado.id} value={estado.nombre}>
                      {estado.nombre}
                    </option>
                  ))}
                </select>
              </div>

              {/* Observaciones */}
              <div>
                <label htmlFor="observaciones" className="block mb-2 text-gray-700 font-medium">
                  Observaciones
                </label>
                <textarea
                  id="observaciones"
                  value={formData.observaciones}
                  onChange={(e) =>
                    setFormData({ ...formData, observaciones: e.target.value })
                  }
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder="Notas adicionales sobre la cita..."
                />
              </div>

              {/* Botones */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCerrarModal}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:opacity-90 transition-all font-medium disabled:opacity-50"
                  style={{ backgroundColor: "#C84F3B" }}
                >
                  {isLoading ? "Agendando..." : "Agendar Cita"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
