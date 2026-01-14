import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { User, Phone, Trophy, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { useCatalogos } from "../hooks/useCatalogos";
import VacunasHistoriaClinica from './VacunasHistoriaClinica';

// ============================================================================
// TIPOS
// ============================================================================

type FormDataPersonales = {
  nombreCompleto: string;
  fechaNacimiento: string;
  genero: string;
  otroGenero?: string;
  tipoDocumento: string;
  numeroDocumento: string;
  nacionalidad: string;
  departamento?: string;
  ciudad?: string;
  estrato?: string;
  etnia?: string;
  telefono: string;
  correoElectronico: string;
  direccion: string;
  disciplina: string;
};

// ============================================================================
// CONSTANTES
// ============================================================================

const PAISES = [
  "Colombia", "Argentina", "Bolivia", "Brasil", "Chile", "Costa Rica", "Cuba",
  "Ecuador", "El Salvador", "Guatemala", "Honduras", "México", "Nicaragua",
  "Panamá", "Paraguay", "Perú", "República Dominicana", "Uruguay", "Venezuela",
  "España", "Estados Unidos", "Otro"
];

const DEPARTAMENTOS = [
  "Amazonas", "Antioquia", "Arauca", "Atlántico", "Bolívar", "Boyacá", "Caldas",
  "Caquetá", "Casanare", "Cauca", "Cesar", "Chocó", "Córdoba", "Cundinamarca",
  "Guainía", "Guaviare", "Huila", "La Guajira", "Magdalena", "Meta", "Nariño",
  "Norte de Santander", "Putumayo", "Quindío", "Risaralda", "San Andrés y Providencia",
  "Santander", "Sucre", "Tolima", "Valle del Cauca", "Vaupés", "Vichada"
];

const CIUDADES_POR_DEPARTAMENTO: Record<string, string[]> = {
  "Huila": ["Neiva", "Pitalito", "Garzón", "La Plata", "Campoalegre"],
  "Bogotá D.C.": ["Bogotá"],
  "Antioquia": ["Medellín", "Bello", "Itagüí", "Envigado"],
  "Valle del Cauca": ["Cali", "Palmira", "Buenaventura"],
};

const DISCIPLINAS = [
  "Pesas",
  "Natación",
  "Subacuático",
  "Lucha"
];

const MAPEO_CATALOGOS = {
  tipoDocumento: {
    cedula_ciudadania: "Cédula de ciudadanía",
    cedula_extranjeria: "Cédula de extranjerÍa",
    pasaporte: "Pasaporte",
    nit: "NIT",
    tarjeta_identidad: "Tarjeta de identidad",
    pep: "Permiso Especial de Permanencia",
  },
  genero: {
    masculino: "Masculino",
    femenino: "Femenino",
    otro: "Otro",
  },
  estado: {
    activo: "Activo",
    inactivo: "Inactivo",
  },
};

type Props = {
  onSubmit?: (data: any) => Promise<void>;
  onCancel?: () => void;
};

// ============================================================================
// COMPONENTE
// ============================================================================

export function RegistroDeportista({ onSubmit: propOnSubmit, onCancel: propOnCancel }: Props = {}) {
  const [paso, setPaso] = useState<1 | 2>(1);
  const [edad, setEdad] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [deportistaId, setDeportistaId] = useState<string>("");
  
  const { tiposDocumento, sexos, estados } = useCatalogos();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
  } = useForm<FormDataPersonales>({
    defaultValues: {
      genero: "",
      tipoDocumento: "",
      nacionalidad: "",
      disciplina: "",
      departamento: "",
      ciudad: "",
      estrato: "",
      etnia: "",
    },
  });

  const fechaNacimiento = watch("fechaNacimiento");
  const nacionalidad = watch("nacionalidad");
  const departamento = watch("departamento");
  const genero = watch("genero");

  useEffect(() => {
    if (fechaNacimiento) {
      const hoy = new Date();
      const nacimiento = new Date(fechaNacimiento);
      let edadCalculada = hoy.getFullYear() - nacimiento.getFullYear();
      const mes = hoy.getMonth() - nacimiento.getMonth();
      
      if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
        edadCalculada--;
      }
      
      setEdad(edadCalculada >= 0 ? edadCalculada : null);
    } else {
      setEdad(null);
    }
  }, [fechaNacimiento]);

  // =========================================================================
  // PASO 1: DATOS PERSONALES
  // =========================================================================

  const onSubmitPaso1 = async (data: FormDataPersonales) => {
    try {
      setIsLoading(true);
      
      console.log("🔍 Buscando IDs de catálogos...");
      
      const nombreTipoDoc = MAPEO_CATALOGOS.tipoDocumento[data.tipoDocumento as keyof typeof MAPEO_CATALOGOS.tipoDocumento];
      const nombreGenero = MAPEO_CATALOGOS.genero[data.genero as keyof typeof MAPEO_CATALOGOS.genero];
      const nombreEstado = MAPEO_CATALOGOS.estado["activo" as keyof typeof MAPEO_CATALOGOS.estado];
      
      const tipoDocId = tiposDocumento.find((c) => c.nombre === nombreTipoDoc)?.id;
      const sexoId = sexos.find((c) => c.nombre === nombreGenero)?.id;
      const estadoId = estados.find((c) => c.nombre === nombreEstado)?.id;
      
      console.log("📋 IDs encontrados:", { tipoDocId, sexoId, estadoId });
      
      if (!tipoDocId || !sexoId || !estadoId) {
        toast.error("⚠️ No se encontraron todos los catálogos necesarios");
        console.error("Catálogos no encontrados:", { tipoDocId, sexoId, estadoId });
        setIsLoading(false);
        return;
      }
      
      const partes = data.nombreCompleto.trim().split(" ");
      const nombres = partes.slice(0, -1).join(" ") || partes[0];
      const apellidos = partes[partes.length - 1] || "";
      
      const datosAEnviar = {
        tipo_documento_id: tipoDocId,
        numero_documento: data.numeroDocumento,
        nombres: nombres,
        apellidos: apellidos,
        fecha_nacimiento: data.fechaNacimiento,
        sexo_id: sexoId,
        telefono: data.telefono,
        email: data.correoElectronico,
        direccion: data.direccion,
        estado_id: estadoId,
        tipo_deporte: data.disciplina,
      };
      
      console.log("📤 Enviando al servidor:", JSON.stringify(datosAEnviar, null, 2));
      
      const response = await fetch('http://localhost:8000/api/v1/deportistas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(datosAEnviar),
      });
      
      console.log("📊 Status HTTP:", response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error("❌ Error del servidor:", errorData);
        const mensajeError = errorData.detail || errorData.message || `Error ${response.status}`;
        throw new Error(mensajeError);
      }

      const responseData = await response.json();
      console.log("✅ Respuesta del servidor:", responseData);
      
      const id = responseData.id ? String(responseData.id) : null;
      
      if (!id) {
        throw new Error("No se recibió el ID del deportista");
      }
      
      console.log("🆔 ID del deportista:", id);
      setDeportistaId(id);
      toast.success("✅ Datos personales registrados correctamente");
      setPaso(2);
    } catch (error: any) {
      console.error("❌ Error en onSubmitPaso1:", error.message);
      toast.error(`❌ Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const esColombia = nacionalidad === "Colombia";
  const ciudadesDisponibles = departamento ? CIUDADES_POR_DEPARTAMENTO[departamento] || [] : [];

  const handleCancel = async () => {
    try {
      // Si se canceló después de crear el deportista, eliminar ese registro
      if (deportistaId) {
        console.log("🗑️ Eliminando deportista:", deportistaId);
        await fetch(`http://localhost:8000/api/v1/deportistas/${deportistaId}`, {
          method: 'DELETE',
        });
      }
      
      // Limpiar datos y volver a paso 1
      setDeportistaId("");
      setPaso(1);
      reset();
      
      // Llamar callback si existe
      if (propOnCancel) {
        propOnCancel();
      }
    } catch (error) {
      console.error("❌ Error al cancelar registro:", error);
      toast.error("Error al cancelar el registro");
    }
  };

  // =========================================================================
  // RENDER
  // =========================================================================

  return (
    <div className="max-w-4xl mx-auto p-6 py-8">
      <div className="bg-white rounded-lg shadow-md p-8">
        {/* Indicador de pasos */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4 flex-1">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${paso >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'}`}>
              1
            </div>
            <span className={`flex-1 h-1 ${paso >= 2 ? 'bg-blue-600' : 'bg-gray-300'}`}></span>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${paso >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'}`}>
              2
            </div>
          </div>
        </div>

        {/* PASO 1: Datos Personales */}
        {paso === 1 && (
          <form onSubmit={handleSubmit(onSubmitPaso1)} className="space-y-8">
            <h1 className="text-center mb-8 text-blue-600 text-3xl font-bold">Paso 1: Datos Personales</h1>

            <div className="space-y-5">
              <h2 className="flex items-center gap-2 pb-2 border-b-2 border-blue-500">
                <User className="w-5 h-5 text-blue-600" />
                Información General
              </h2>

              <div>
                <label className="block mb-2">Nombre completo <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  className={`w-full px-4 py-2 border rounded-md ${errors.nombreCompleto ? "border-red-500" : "border-gray-300"}`}
                  placeholder="Ingrese el nombre completo"
                  {...register("nombreCompleto", { required: "Requerido" })}
                />
                {errors.nombreCompleto && <p className="text-red-500 mt-1">{errors.nombreCompleto.message}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-2">Fecha de nacimiento <span className="text-red-500">*</span></label>
                  <input
                    type="date"
                    className={`w-full px-4 py-2 border rounded-md ${errors.fechaNacimiento ? "border-red-500" : "border-gray-300"}`}
                    max={new Date().toISOString().split("T")[0]}
                    {...register("fechaNacimiento", { required: "Requerido" })}
                  />
                  {errors.fechaNacimiento && <p className="text-red-500 mt-1">{errors.fechaNacimiento.message}</p>}
                </div>
                <div>
                  <label className="block mb-2">Edad</label>
                  <div className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-50">
                    {edad !== null ? `${edad} años` : "-"}
                  </div>
                </div>
              </div>

              <div>
                <label className="block mb-2">Género <span className="text-red-500">*</span></label>
                <select
                  className={`w-full px-4 py-2 border rounded-md ${errors.genero ? "border-red-500" : "border-gray-300"}`}
                  {...register("genero", { required: "Requerido" })}
                >
                  <option value="">Seleccione...</option>
                  <option value="masculino">Masculino</option>
                  <option value="femenino">Femenino</option>
                  <option value="otro">Otro</option>
                </select>
              </div>
            </div>

            <div className="space-y-5">
              <h2 className="flex items-center gap-2 pb-2 border-b-2 border-blue-500">
                <Trophy className="w-5 h-5 text-blue-600" />
                Documento e Información Deportiva
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-2">Tipo de documento <span className="text-red-500">*</span></label>
                  <select className="w-full px-4 py-2 border rounded-md" {...register("tipoDocumento", { required: "Requerido" })}>
                    <option value="">Seleccione...</option>
                    <option value="cedula_ciudadania">Cédula de ciudadanía</option>
                    <option value="pasaporte">Pasaporte</option>
                    <option value="nit">NIT</option>
                  </select>
                </div>
                <div>
                  <label className="block mb-2">Número de documento <span className="text-red-500">*</span></label>
                  <input type="text" className="w-full px-4 py-2 border rounded-md" {...register("numeroDocumento", { required: "Requerido" })} />
                </div>
              </div>

              <div>
                <label className="block mb-2">Disciplina <span className="text-red-500">*</span></label>
                <select className="w-full px-4 py-2 border rounded-md" {...register("disciplina", { required: "Requerido" })}>
                  <option value="">Seleccione...</option>
                  {DISCIPLINAS.map(disciplina => (
                    <option key={disciplina} value={disciplina}>{disciplina}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-5">
              <h2 className="flex items-center gap-2 pb-2 border-b-2 border-blue-500">
                <Phone className="w-5 h-5 text-blue-600" />
                Contacto y Ubicación
              </h2>

              <div>
                <label className="block mb-2">Teléfono <span className="text-red-500">*</span></label>
                <input type="tel" className="w-full px-4 py-2 border rounded-md" {...register("telefono", { required: "Requerido" })} />
              </div>

              <div>
                <label className="block mb-2">Email <span className="text-red-500">*</span></label>
                <input type="email" className="w-full px-4 py-2 border rounded-md" {...register("correoElectronico", { required: "Requerido" })} />
              </div>

              <div>
                <label className="block mb-2">Dirección <span className="text-red-500">*</span></label>
                <input type="text" className="w-full px-4 py-2 border rounded-md" {...register("direccion", { required: "Requerido" })} />
              </div>

              <div>
                <label className="block mb-2">Nacionalidad <span className="text-red-500">*</span></label>
                <select className="w-full px-4 py-2 border rounded-md" {...register("nacionalidad", { required: "Requerido" })}>
                  <option value="">Seleccione...</option>
                  {PAISES.map(pais => <option key={pais} value={pais}>{pais}</option>)}
                </select>
              </div>

              {esColombia && (
                <>
                  <div>
                    <label className="block mb-2">Departamento</label>
                    <select className="w-full px-4 py-2 border rounded-md" {...register("departamento")}>
                      <option value="">Seleccione...</option>
                      {DEPARTAMENTOS.map(dept => <option key={dept} value={dept}>{dept}</option>)}
                    </select>
                  </div>
                  {departamento && (
                    <div>
                      <label className="block mb-2">Ciudad</label>
                      <select className="w-full px-4 py-2 border rounded-md" {...register("ciudad")}>
                        <option value="">Seleccione...</option>
                        {ciudadesDisponibles.map(ciudad => <option key={ciudad} value={ciudad}>{ciudad}</option>)}
                      </select>
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="flex gap-3 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={handleCancel}
                className="flex-1 flex items-center justify-center gap-2 bg-red-600 text-white py-3 px-6 rounded-md hover:bg-red-700 font-medium"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 disabled:opacity-50 font-medium"
              >
                Siguiente
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </form>
        )}

        {/* PASO 2: Vacunas */}
        {paso === 2 && (
          <div className="space-y-8">
            <h1 className="text-center mb-8 text-blue-600 text-3xl font-bold">Paso 2: Registro de Vacunas</h1>
            
            <p className="text-gray-600 text-center mb-6">
              Complete el registro de vacunas del deportista. Puede cargar certificados en PDF, JPG o PNG.
            </p>

            {deportistaId && deportistaId !== "" ? (
              <VacunasHistoriaClinica
                deportista_id={deportistaId}
                readonly={false}
              />
            ) : (
              <div className="text-center py-8 bg-yellow-50 rounded-lg border border-yellow-200">
                <p className="text-yellow-800 font-medium">⚠️ Cargando información del deportista...</p>
              </div>
            )}

            <div className="flex gap-3 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={handleCancel}
                className="flex-1 flex items-center justify-center gap-2 bg-red-600 text-white py-3 px-6 rounded-md hover:bg-red-700 font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={() => setPaso(1)}
                className="flex-1 flex items-center justify-center gap-2 bg-gray-300 text-gray-700 py-3 px-6 rounded-md hover:bg-gray-400 font-medium"
              >
                <ChevronLeft className="w-5 h-5" />
                Anterior
              </button>
              <button
                onClick={async () => {
                  if (propOnSubmit) {
                    await propOnSubmit({ deportistaId });
                  } else {
                    toast.success("¡Registro completado!");
                  }
                }}
                className="flex-1 bg-green-600 text-white py-3 px-6 rounded-md hover:bg-green-700 font-medium"
              >
                Finalizar Registro
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default RegistroDeportista;