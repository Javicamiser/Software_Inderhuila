import { HistoriaClinicaData } from "../HistoriaClinica";
import { Download, Mail, MessageCircle, Printer, X, Plus, Search, ChevronDown, ChevronUp } from "lucide-react";
import { useState, useMemo } from "react";
import { toast } from 'sonner';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

type Interconsulta = {
  especialista: string;
  motivo: string;
};

type Remision = {
  especialista: string;
  motivo: string;
  prioridad: "Normal" | "Urgente";
  fechaRemision: string;
};

type Receta = {
  categoria: string;
  nombrePrueba: string;
  codigoCUPS: string;
  resultado: string;
  archivosAdjuntos: File[];
};

type PruebaAyuda = {
  id?: string;
  codigoCUPS: string;
  nombre: string;
};

type Props = {
  data: HistoriaClinicaData;
  updateData: (data: Partial<HistoriaClinicaData>) => void;
  onPrevious: () => void;
  onSave: () => void;
  onCancel: () => void;
  onPrint: () => void;
  historiaId?: string;
  deportista?: any;
  historia?: any;
};

const especialistas = [
  "Psicólogo/a Deportivo",
  "Médico Fisiatra",
  "Nutricionista Deportivo",
  "Fisioterapeuta",
  "Cardiólogo",
  "Médico Ortopedista"
];

// Base de datos de CUPS
const CUPS_DATABASE = [
  { codigo: "80101", nombre: "Hemograma completo" },
  { codigo: "80102", nombre: "Química sanguínea" },
  { codigo: "71010", nombre: "Radiografía de cadera" },
  { codigo: "71015", nombre: "Radiografía de rodilla" },
  { codigo: "71020", nombre: "Radiografía de tobillo" },
  { codigo: "76080", nombre: "Resonancia magnética de rodilla" },
  { codigo: "76085", nombre: "Resonancia magnética de hombro" },
  { codigo: "92030", nombre: "Electrocardiograma" },
  { codigo: "76010", nombre: "Ecografía abdominal" },
  { codigo: "92035", nombre: "Prueba de esfuerzo" },
  { codigo: "76050", nombre: "Ultrasonido de hombro" },
  { codigo: "71025", nombre: "Tomografía de tobillo" },
  { codigo: "80105", nombre: "Prueba de glucosa" },
  { codigo: "80110", nombre: "Análisis de lípidos" },
  { codigo: "76012", nombre: "Ecografía de cadera" },
];

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

export function PlanTratamiento({
  data,
  updateData,
  onPrevious,
  onSave,
  onCancel,
  onPrint,
  historiaId,
  deportista,
  historia,
}: Props) {
  // Estado para Interconsultas y Remisiones
  const [interconsultas, setInterconsultas] = useState<Interconsulta[]>(
    data.remisionesEspecialistas?.filter((r) => r.prioridad === "Normal") || []
  );
  const [remisiones, setRemisiones] = useState<Remision[]>(
    data.remisionesEspecialistas?.filter((r) => r.prioridad === "Urgente") || []
  );
  const [nuevaInterconsulta, setNuevaInterconsulta] = useState({ especialista: "", motivo: "" });
  const [nuevaRemision, setNuevaRemision] = useState({ 
    especialista: "", 
    motivo: "", 
    prioridad: "Urgente" as "Normal" | "Urgente", 
    fechaRemision: new Date().toISOString().split('T')[0] 
  });

  // Estado para Recetas
  const [recetas, setRecetas] = useState<Receta[]>(data.ayudasDiagnosticas || []);
  const [mostrarFormReceta, setMostrarFormReceta] = useState(false);
  const [nuevaReceta, setNuevaReceta] = useState<Receta>({
    categoria: "Medicamento",
    nombrePrueba: "",
    codigoCUPS: "",
    resultado: "",
    archivosAdjuntos: []
  });

  // Estado para Pruebas
  const [pruebas, setPruebas] = useState<PruebaAyuda[]>([]);
  const [mostrarFormPrueba, setMostrarFormPrueba] = useState(false);
  const [buscarPrueba, setBuscarPrueba] = useState("");
  const [mostrarSugerencias, setMostrarSugerencias] = useState(false);
  const [nuevaPrueba, setNuevaPrueba] = useState<PruebaAyuda>({ codigoCUPS: "", nombre: "" });

  // Estado para controlar secciones colapsadas
  const [seccionesAbiertas, setSeccionesAbiertas] = useState({
    recetas: false,
    interconsultas: false,
    remisiones: false,
    pruebas: false
  });

  // Descargas y envíos
  const [isDownloading, setIsDownloading] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [isSendingWhatsApp, setIsSendingWhatsApp] = useState(false);

  // Filtrar CUPS según búsqueda
  const cupsSugeridos = useMemo(() => {
    if (buscarPrueba.length < 2) return [];
    const search = buscarPrueba.toLowerCase();
    return CUPS_DATABASE.filter(cup => 
      cup.nombre.toLowerCase().includes(search) || 
      cup.codigo.includes(search)
    ).slice(0, 8);
  }, [buscarPrueba]);

  // ============================================================================
  // RECETAS
  // ============================================================================

  const agregarReceta = () => {
    if (!nuevaReceta.nombrePrueba.trim() || !nuevaReceta.codigoCUPS.trim()) {
      toast.error("Complete el nombre y código de la receta");
      return;
    }

    const recetaAgregada: Receta = {
      ...nuevaReceta,
      categoria: "Medicamento"
    };

    setRecetas([...recetas, recetaAgregada]);
    setNuevaReceta({ 
      categoria: "Medicamento",
      nombrePrueba: "",
      codigoCUPS: "",
      resultado: "",
      archivosAdjuntos: []
    });
    setMostrarFormReceta(false);
    updateData({ ayudasDiagnosticas: [...recetas, recetaAgregada] });
    toast.success("Receta agregada correctamente");
  };

  const eliminarReceta = (index: number) => {
    const nuevasRecetas = recetas.filter((_, i) => i !== index);
    setRecetas(nuevasRecetas);
    updateData({ ayudasDiagnosticas: nuevasRecetas });
    toast.success("Receta eliminada");
  };

  // ============================================================================
  // PRUEBAS
  // ============================================================================

  const agregarPrueba = () => {
    if (!nuevaPrueba.codigoCUPS.trim() || !nuevaPrueba.nombre.trim()) {
      toast.error("Seleccione o ingrese una prueba");
      return;
    }

    const pruebaAgregada: PruebaAyuda = {
      id: Date.now().toString(),
      ...nuevaPrueba
    };

    setPruebas([...pruebas, pruebaAgregada]);
    setNuevaPrueba({ codigoCUPS: "", nombre: "" });
    setBuscarPrueba("");
    setMostrarFormPrueba(false);
    toast.success("Prueba agregada correctamente");
  };

  const eliminarPrueba = (id: string | undefined) => {
    setPruebas(pruebas.filter(p => p.id !== id));
    toast.success("Prueba eliminada");
  };

  const seleccionarCUPS = (cups: typeof CUPS_DATABASE[0]) => {
    setNuevaPrueba({ codigoCUPS: cups.codigo, nombre: cups.nombre });
    setBuscarPrueba(cups.nombre);
    setMostrarSugerencias(false);
  };

  // ============================================================================
  // INTERCONSULTAS Y REMISIONES
  // ============================================================================

  const agregarInterconsulta = () => {
    if (!nuevaInterconsulta.especialista || !nuevaInterconsulta.motivo) {
      toast.error("Complete todos los campos de interconsulta");
      return;
    }
    const actualizado = [...interconsultas, nuevaInterconsulta];
    setInterconsultas(actualizado);
    setNuevaInterconsulta({ especialista: "", motivo: "" });
    syncRemisiones();
  };

  const eliminarInterconsulta = (index: number) => {
    const updated = interconsultas.filter((_, i) => i !== index);
    setInterconsultas(updated);
    syncRemisiones();
  };

  const agregarRemision = () => {
    if (!nuevaRemision.especialista || !nuevaRemision.motivo) {
      toast.error("Complete todos los campos de remisión");
      return;
    }
    const actualizado = [...remisiones, nuevaRemision];
    setRemisiones(actualizado);
    setNuevaRemision({ especialista: "", motivo: "", prioridad: "Urgente", fechaRemision: new Date().toISOString().split('T')[0] });
    syncRemisiones();
  };

  const eliminarRemision = (index: number) => {
    const updated = remisiones.filter((_, i) => i !== index);
    setRemisiones(updated);
    syncRemisiones();
  };

  const syncRemisiones = () => {
    const todas = [
      ...interconsultas.map((i) => ({ ...i, prioridad: "Normal" as const, fechaRemision: new Date().toISOString().split('T')[0] })),
      ...remisiones,
    ];
    updateData({ remisionesEspecialistas: todas });
  };

  // ============================================================================
  // DESCARGAR, EMAIL, WHATSAPP
  // ============================================================================

  const handleDescargarPDF = async () => {
    try {
      setIsDownloading(true);
      const response = await fetch(`${API_BASE_URL}/documentos/${historiaId}/historia-clinica-pdf`);
      
      if (!response.ok) {
        throw new Error('Error al descargar PDF');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `historia_clinica_${deportista?.numero_documento || historiaId}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      toast.success('Historia clínica descargada correctamente');
    } catch (error) {
      console.error('Error descargando PDF:', error);
      toast.error('Error al descargar el PDF');
    } finally {
      setIsDownloading(false);
    }
  };

  const abrirMailtoConEnlace = (email: string, dep: any) => {
    const subject = encodeURIComponent(`Historia Clínica - ${dep.nombres} ${dep.apellidos}`);
    const pdfUrl = `${API_BASE_URL}/documentos/${historiaId}/historia-clinica-pdf`;
    const body = encodeURIComponent(
      `Estimado(a) ${dep.nombres} ${dep.apellidos},\n\n` +
      `Puede descargar su historia clínica deportiva desde el siguiente enlace:\n\n` +
      `${pdfUrl}\n\n` +
      `Datos de la historia:\n` +
      `- Documento: ${dep.numero_documento}\n` +
      `- Fecha de apertura: ${historia?.fecha_apertura ? format(new Date(historia.fecha_apertura), 'd MMM yyyy', { locale: es }) : 'N/A'}\n` +
      `- ID Historia: ${historiaId}\n\n` +
      `Atentamente,\n` +
      `INDERHUILA - Instituto Departamental de Recreación y Deportes del Huila`
    );

    window.open(`mailto:${email}?subject=${subject}&body=${body}`, '_blank');
    toast.info('Abriendo cliente de correo...');
  };

  const handleEnviarEmail = async () => {
    const email = deportista?.email;
    
    if (!email) {
      toast.error('El deportista no tiene correo electrónico registrado');
      return;
    }

    try {
      setIsSendingEmail(true);
      toast.loading('Enviando correo con PDF adjunto...');
      
      const response = await fetch(
        `${API_BASE_URL}/documentos/${historiaId}/enviar-email?email_destino=${encodeURIComponent(email)}`,
        { method: 'POST' }
      );
      
      const responseData = await response.json();
      toast.dismiss();
      
      if (response.ok && responseData.success) {
        toast.success(`Correo enviado exitosamente a ${email}`);
      } else {
        if (response.status === 503) {
          toast.info('Abriendo cliente de correo...');
          abrirMailtoConEnlace(email, deportista);
        } else {
          toast.error(responseData.detail || 'Error al enviar el correo');
        }
      }
    } catch (error) {
      console.error('Error enviando email:', error);
      toast.dismiss();
      abrirMailtoConEnlace(deportista.email, deportista);
    } finally {
      setIsSendingEmail(false);
    }
  };

  const handleEnviarWhatsApp = async () => {
    let telefono = deportista?.telefono || deportista?.celular;
    
    if (!telefono) {
      toast.error('El deportista no tiene número de teléfono registrado');
      return;
    }

    telefono = telefono.replace(/\D/g, '');
    
    if (telefono.length === 10) {
      telefono = '57' + telefono;
    }

    try {
      setIsSendingWhatsApp(true);
      toast.loading('Generando enlace seguro...');
      
      const response = await fetch(
        `${API_BASE_URL}/descarga-segura/generar-token/${historiaId}`,
        { method: 'POST' }
      );
      
      if (!response.ok) {
        throw new Error('Error al generar enlace');
      }
      
      const responseData = await response.json();
      toast.dismiss();
      
      if (responseData.success) {
        const mensaje = encodeURIComponent(
          `*INDERHUILA - Historia Clínica Deportiva*\n\n` +
          `Hola ${deportista.nombres},\n\n` +
          `Tu historia clínica está lista para descargar.\n\n` +
          `Haz clic aquí para descargar:\n` +
          `${responseData.url}\n\n` +
          `Ingresa tu cédula: ${deportista.numero_documento}\n\n` +
          `El enlace expira en 2 horas.`
        );
        
        window.open(`https://wa.me/${telefono}?text=${mensaje}`, '_blank');
        toast.success('Se abrirá WhatsApp con el enlace');
      } else {
        throw new Error(responseData.mensaje || 'Error al generar enlace');
      }
      
    } catch (error) {
      console.error('Error preparando WhatsApp:', error);
      toast.dismiss();
      toast.error('Error al generar el enlace seguro');
    } finally {
      setIsSendingWhatsApp(false);
    }
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="space-y-8">
      {/* INDICACIONES MÉDICAS */}
      <div>
        <label className="block text-sm font-semibold text-gray-800 mb-2.5">
          Indicaciones Médicas <span className="text-red-500">*</span>
        </label>
        <textarea
          value={data.indicacionesMedicas}
          onChange={(e) => updateData({ indicacionesMedicas: e.target.value })}
          rows={5}
          placeholder="Medicamentos, terapias, restricciones, cuidados especiales..."
          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 resize-none font-medium"
        />
      </div>

      {/* RECETAS MÉDICAS */}
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 p-6 rounded-lg space-y-4">
        <button
          type="button"
          onClick={() => setSeccionesAbiertas({ ...seccionesAbiertas, recetas: !seccionesAbiertas.recetas })}
          className="w-full flex items-center justify-between"
        >
          <h3 className="font-semibold text-green-900 text-lg">Recetas Médicas (Opcional)</h3>
          {seccionesAbiertas.recetas ? (
            <ChevronUp className="w-5 h-5 text-green-600" />
          ) : (
            <ChevronDown className="w-5 h-5 text-green-600" />
          )}
        </button>

        {seccionesAbiertas.recetas && (
          <div className="space-y-4">
            {!mostrarFormReceta ? (
              <button
                type="button"
                onClick={() => setMostrarFormReceta(true)}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
              >
                <Plus className="w-5 h-5" />
                Agregar Receta
              </button>
            ) : (
              <div className="bg-white p-4 rounded-lg border-2 border-green-300 space-y-3">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Nombre del Medicamento <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={nuevaReceta.nombrePrueba}
                    onChange={(e) => setNuevaReceta({ ...nuevaReceta, nombrePrueba: e.target.value })}
                    placeholder="Nombre del medicamento"
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Código/Dosis <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={nuevaReceta.codigoCUPS}
                    onChange={(e) => setNuevaReceta({ ...nuevaReceta, codigoCUPS: e.target.value })}
                    placeholder="Ej: 500mg cada 8 horas"
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Indicaciones/Observaciones</label>
                  <textarea
                    value={nuevaReceta.resultado}
                    onChange={(e) => setNuevaReceta({ ...nuevaReceta, resultado: e.target.value })}
                    placeholder="Ej: Tomar con alimentos, no mezclar con alcohol, duración 10 días..."
                    rows={2}
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-green-500 resize-none"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={agregarReceta}
                    className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors font-semibold"
                  >
                    Guardar Receta
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMostrarFormReceta(false);
                      setNuevaReceta({ categoria: "Medicamento", nombrePrueba: "", codigoCUPS: "", resultado: "", archivosAdjuntos: [] });
                    }}
                    className="flex-1 bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600 transition-colors font-semibold"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}

            {recetas.length > 0 && (
              <div className="space-y-2 mt-4 pt-4 border-t-2 border-green-300">
                <p className="text-sm font-semibold text-green-800">Recetas agregadas:</p>
                {recetas.map((receta, idx) => (
                  <div key={idx} className="bg-white border-2 border-green-200 rounded-lg p-3">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="font-semibold text-gray-800">{receta.nombrePrueba}</p>
                        <p className="text-xs text-gray-600 mt-1">
                          <span className="font-semibold">Dosis:</span> {receta.codigoCUPS}
                        </p>
                        {receta.resultado && (
                          <p className="text-xs text-gray-600 mt-1 italic">{receta.resultado}</p>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => eliminarReceta(idx)}
                        className="ml-4 p-1.5 text-red-500 hover:bg-red-50 rounded transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* PRUEBAS SOLICITADAS */}
      <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200 p-6 rounded-lg space-y-4">
        <button
          type="button"
          onClick={() => setSeccionesAbiertas({ ...seccionesAbiertas, pruebas: !seccionesAbiertas.pruebas })}
          className="w-full flex items-center justify-between"
        >
          <h3 className="font-semibold text-blue-900 text-lg">Pruebas Solicitadas (Opcional)</h3>
          {seccionesAbiertas.pruebas ? (
            <ChevronUp className="w-5 h-5 text-blue-600" />
          ) : (
            <ChevronDown className="w-5 h-5 text-blue-600" />
          )}
        </button>

        {seccionesAbiertas.pruebas && (
          <div className="space-y-4">
            {!mostrarFormPrueba ? (
              <button
                type="button"
                onClick={() => setMostrarFormPrueba(true)}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
              >
                <Plus className="w-5 h-5" />
                Agregar Prueba
              </button>
            ) : (
              <div className="bg-white p-4 rounded-lg border-2 border-blue-300 space-y-3">
                <div className="relative">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Buscar Prueba por CUPS o Nombre</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={buscarPrueba}
                      onChange={(e) => {
                        setBuscarPrueba(e.target.value);
                        setMostrarSugerencias(true);
                      }}
                      onFocus={() => setMostrarSugerencias(true)}
                      placeholder="Ej: Hemograma, 80101..."
                      className="w-full pl-10 px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  {mostrarSugerencias && cupsSugeridos.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border-2 border-blue-300 rounded-lg shadow-lg max-h-64 overflow-y-auto">
                      {cupsSugeridos.map((cups) => (
                        <button
                          key={cups.codigo}
                          type="button"
                          onClick={() => seleccionarCUPS(cups)}
                          className="w-full text-left px-4 py-2 hover:bg-blue-100 border-b border-gray-200 last:border-b-0 transition-colors"
                        >
                          <p className="font-semibold text-gray-800">{cups.nombre}</p>
                          <p className="text-xs text-gray-600">CUPS: {cups.codigo}</p>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {nuevaPrueba.codigoCUPS && (
                  <div className="bg-blue-100 p-3 rounded-lg border-2 border-blue-300">
                    <p className="text-sm font-semibold text-blue-900">{nuevaPrueba.nombre}</p>
                    <p className="text-xs text-blue-700">Código CUPS: {nuevaPrueba.codigoCUPS}</p>
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={agregarPrueba}
                    disabled={!nuevaPrueba.codigoCUPS || !nuevaPrueba.nombre}
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition-colors font-semibold"
                  >
                    Agregar Prueba
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMostrarFormPrueba(false);
                      setNuevaPrueba({ codigoCUPS: "", nombre: "" });
                      setBuscarPrueba("");
                    }}
                    className="flex-1 bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600 transition-colors font-semibold"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}

            {pruebas.length > 0 && (
              <div className="space-y-2 mt-4 pt-4 border-t-2 border-blue-300">
                <p className="text-sm font-semibold text-blue-800">Pruebas agregadas:</p>
                {pruebas.map((prueba) => (
                  <div key={prueba.id} className="bg-white border-2 border-blue-200 rounded-lg p-3 flex justify-between items-start">
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800">{prueba.nombre}</p>
                      <p className="text-xs text-gray-600">CUPS: {prueba.codigoCUPS}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => eliminarPrueba(prueba.id)}
                      className="ml-4 p-1.5 text-red-500 hover:bg-red-50 rounded transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* RECOMENDACIONES */}
      <div>
        <label className="block text-sm font-semibold text-gray-800 mb-2.5">
          Recomendaciones de Entrenamiento <span className="text-red-500">*</span>
        </label>
        <textarea
          value={data.recomendacionesEntrenamiento}
          onChange={(e) => updateData({ recomendacionesEntrenamiento: e.target.value })}
          rows={5}
          placeholder="Intensidad de entrenamiento, ejercicios recomendados, ejercicios contraindicados, precauciones..."
          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 resize-none font-medium"
        />
      </div>

      {/* PLAN DE SEGUIMIENTO */}
      <div>
        <label className="block text-sm font-semibold text-gray-800 mb-2.5">
          Plan de Seguimiento <span className="text-red-500">*</span>
        </label>
        <textarea
          value={data.planSeguimiento}
          onChange={(e) => updateData({ planSeguimiento: e.target.value })}
          rows={5}
          placeholder="Fechas de próximas citas, controles periódicos, reevaluaciones, especialistas a consultar..."
          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 resize-none font-medium"
        />
      </div>

      {/* INTERCONSULTAS */}
      <div className="bg-gray-50 border-2 border-gray-300 p-6 rounded-lg space-y-4">
        <button
          type="button"
          onClick={() => setSeccionesAbiertas({ ...seccionesAbiertas, interconsultas: !seccionesAbiertas.interconsultas })}
          className="w-full flex items-center justify-between"
        >
          <h3 className="font-semibold text-gray-800 text-lg">Interconsultas (Opcional)</h3>
          {seccionesAbiertas.interconsultas ? (
            <ChevronUp className="w-5 h-5 text-gray-600" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-600" />
          )}
        </button>
        
        {seccionesAbiertas.interconsultas && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">Especialista</label>
              <select
                value={nuevaInterconsulta.especialista}
                onChange={(e) =>
                  setNuevaInterconsulta({ ...nuevaInterconsulta, especialista: e.target.value })
                }
                className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 font-medium"
              >
                <option value="">Seleccione un especialista...</option>
                {especialistas.map((esp) => (
                  <option key={esp} value={esp}>{esp}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">Motivo</label>
              <textarea
                value={nuevaInterconsulta.motivo}
                onChange={(e) =>
                  setNuevaInterconsulta({ ...nuevaInterconsulta, motivo: e.target.value })
                }
                placeholder="Describa el motivo..."
                rows={3}
                className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 resize-none font-medium"
              />
            </div>

            <button
              type="button"
              onClick={agregarInterconsulta}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
            >
              Agregar Interconsulta
            </button>

            {interconsultas.length > 0 && (
              <div className="space-y-2 mt-4 pt-4 border-t-2 border-gray-300">
                {interconsultas.map((inter, idx) => (
                  <div key={idx} className="bg-white border-2 border-gray-300 rounded-lg p-3 flex justify-between items-start">
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800 text-sm">{inter.especialista}</p>
                      <p className="text-xs text-gray-600 mt-1">{inter.motivo}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => eliminarInterconsulta(idx)}
                      className="ml-4 p-1.5 text-red-500 hover:bg-red-50 rounded transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* REMISIONES */}
      <div className="bg-red-50 border-2 border-red-300 p-6 rounded-lg space-y-4">
        <button
          type="button"
          onClick={() => setSeccionesAbiertas({ ...seccionesAbiertas, remisiones: !seccionesAbiertas.remisiones })}
          className="w-full flex items-center justify-between"
        >
          <h3 className="font-semibold text-red-900 text-lg">Remisiones Urgentes (Opcional)</h3>
          {seccionesAbiertas.remisiones ? (
            <ChevronUp className="w-5 h-5 text-red-600" />
          ) : (
            <ChevronDown className="w-5 h-5 text-red-600" />
          )}
        </button>
        
        {seccionesAbiertas.remisiones && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">Especialista</label>
              <select
                value={nuevaRemision.especialista}
                onChange={(e) =>
                  setNuevaRemision({ ...nuevaRemision, especialista: e.target.value })
                }
                className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 font-medium"
              >
                <option value="">Seleccione un especialista...</option>
                {especialistas.map((esp) => (
                  <option key={esp} value={esp}>{esp}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">Motivo</label>
              <textarea
                value={nuevaRemision.motivo}
                onChange={(e) =>
                  setNuevaRemision({ ...nuevaRemision, motivo: e.target.value })
                }
                placeholder="Describa el motivo..."
                rows={3}
                className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 resize-none font-medium"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">Fecha</label>
              <input
                type="date"
                value={nuevaRemision.fechaRemision}
                onChange={(e) =>
                  setNuevaRemision({ ...nuevaRemision, fechaRemision: e.target.value })
                }
                className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 font-medium"
              />
            </div>

            <button
              type="button"
              onClick={agregarRemision}
              className="w-full bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 transition-colors font-semibold"
            >
              Agregar Remisión
            </button>

            {remisiones.length > 0 && (
              <div className="space-y-2 mt-4 pt-4 border-t-2 border-red-300">
                {remisiones.map((rem, idx) => (
                  <div key={idx} className="bg-white border-2 border-red-300 rounded-lg p-3 flex justify-between items-start">
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800 text-sm">{rem.especialista}</p>
                      <p className="text-xs text-gray-600 mt-1">{rem.motivo}</p>
                      <div className="flex gap-2 mt-2 text-xs">
                        <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded font-semibold">
                          {rem.prioridad}
                        </span>
                        <span className="text-gray-500">
                          {new Date(rem.fechaRemision).toLocaleDateString("es-CO")}
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => eliminarRemision(idx)}
                      className="ml-4 p-1.5 text-red-500 hover:bg-red-50 rounded transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* BOTONES DE DISTRIBUCIÓN */}
      {historiaId && (
        <div className="flex flex-wrap gap-2 print:hidden">
          <button
            onClick={handleDescargarPDF}
            disabled={isDownloading}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:bg-red-400"
            title="Descargar PDF"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">{isDownloading ? 'Descargando...' : 'PDF'}</span>
          </button>
          
          <button
            onClick={handleEnviarEmail}
            disabled={isSendingEmail}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400"
            title="Enviar por Email"
          >
            <Mail className="w-4 h-4" />
            <span className="hidden sm:inline">{isSendingEmail ? 'Enviando...' : 'Email'}</span>
          </button>
          
          <button
            onClick={handleEnviarWhatsApp}
            disabled={isSendingWhatsApp}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-green-400"
            title="Enviar por WhatsApp"
          >
            <MessageCircle className="w-4 h-4" />
            <span className="hidden sm:inline">{isSendingWhatsApp ? 'Generando...' : 'WhatsApp'}</span>
          </button>
          
          <button
            onClick={onPrint}
            className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            title="Imprimir"
          >
            <Printer className="w-4 h-4" />
            <span className="hidden sm:inline">Imprimir</span>
          </button>
        </div>
      )}
    </div>
  );
}

export default PlanTratamiento;