import { useState, useEffect } from 'react';
import { historiaClinicaService, documentosService } from '@/app/services/apiClient';
import { toast } from 'sonner';
import { ArrowLeft, Loader, Download, Mail, MessageCircle, Printer, X, CheckSquare, Square } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

// URL base de la API
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

interface VistaHistoriaClinicaProps {
  historiaId: string;
  onNavigate?: (view: string) => void;
}

// Definicion de las 9 secciones disponibles
const SECCIONES_DISPONIBLES = [
  { id: 'motivo_consulta', numero: 1, nombre: 'Motivo de Consulta y Enfermedad Actual' },
  { id: 'antecedentes', numero: 2, nombre: 'Antecedentes Medicos' },
  { id: 'revision_sistemas', numero: 3, nombre: 'Revision por Sistemas' },
  { id: 'signos_vitales', numero: 4, nombre: 'Signos Vitales' },
  { id: 'exploracion_fisica', numero: 5, nombre: 'Exploracion Fisica por Sistemas' },
  { id: 'pruebas_complementarias', numero: 6, nombre: 'Pruebas Complementarias' },
  { id: 'diagnosticos', numero: 7, nombre: 'Diagnosticos' },
  { id: 'plan_tratamiento', numero: 8, nombre: 'Plan de Tratamiento' },
  { id: 'remisiones', numero: 9, nombre: 'Remisiones a Especialistas' },
];

type AccionTipo = 'pdf' | 'email' | 'whatsapp' | 'imprimir' | null;

export function VistaHistoriaClinica({ historiaId, onNavigate }: VistaHistoriaClinicaProps) {
  const [historia, setHistoria] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [isSendingWhatsApp, setIsSendingWhatsApp] = useState(false);

  // Estado del modal de seleccion de secciones
  const [mostrarModalSecciones, setMostrarModalSecciones] = useState(false);
  const [seccionesSeleccionadas, setSeccionesSeleccionadas] = useState<string[]>(
    SECCIONES_DISPONIBLES.map(s => s.id)
  );
  const [accionPendiente, setAccionPendiente] = useState<AccionTipo>(null);

  useEffect(() => {
    cargarHistoria();
  }, [historiaId]);

  const cargarHistoria = async () => {
    try {
      setIsLoading(true);
      var response = await fetch(API_BASE_URL + "/documentos/" + historiaId + "/datos-completos", {
        headers: {
          "ngrok-skip-browser-warning": "true"
        }
      });

      if (!response.ok) {
        throw new Error("Error al cargar historia clinica");
      }

      var data = await response.json();
      setHistoria(data);
    } catch (error) {
      console.error("Error cargando historia:", error);
      try {
        var response2 = await historiaClinicaService.getById(historiaId);
        setHistoria(response2);
      } catch (fallbackError) {
        toast.error("Error cargando historia clinica");
        console.error(fallbackError);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // =========================================================================
  // MODAL: Abrir con la accion seleccionada
  // =========================================================================
  const abrirSelectorSecciones = (accion: AccionTipo) => {
    setAccionPendiente(accion);
    setSeccionesSeleccionadas(SECCIONES_DISPONIBLES.map(s => s.id));
    setMostrarModalSecciones(true);
  };

  const toggleSeccion = (id: string) => {
    setSeccionesSeleccionadas(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const seleccionarTodas = () => {
    setSeccionesSeleccionadas(SECCIONES_DISPONIBLES.map(s => s.id));
  };

  const deseleccionarTodas = () => {
    setSeccionesSeleccionadas([]);
  };

  const confirmarAccion = () => {
    if (seccionesSeleccionadas.length === 0) {
      toast.error("Debe seleccionar al menos una seccion");
      return;
    }
    setMostrarModalSecciones(false);

    switch (accionPendiente) {
      case 'pdf':
        ejecutarDescargarPDF();
        break;
      case 'email':
        ejecutarEnviarEmail();
        break;
      case 'whatsapp':
        ejecutarEnviarWhatsApp();
        break;
      case 'imprimir':
        ejecutarImprimir();
        break;
    }
    setAccionPendiente(null);
  };

  // Construir query string con secciones seleccionadas
  const buildSeccionesParam = () => {
    if (seccionesSeleccionadas.length === SECCIONES_DISPONIBLES.length) {
      return "";
    }
    return "secciones=" + seccionesSeleccionadas.join(",");
  };

  // =========================================================================
  // ACCIONES (se ejecutan DESPUES de confirmar secciones)
  // =========================================================================

  const ejecutarDescargarPDF = async () => {
    try {
      setIsDownloading(true);
      var seccionesParam = buildSeccionesParam();
      var url = API_BASE_URL + "/documentos/" + historiaId + "/historia-clinica-pdf";
      if (seccionesParam) {
        url = url + "?" + seccionesParam;
      }

      var response = await fetch(url, {
        headers: {
          "ngrok-skip-browser-warning": "true"
        }
      });

      if (!response.ok) {
        throw new Error("Error al descargar PDF");
      }

      var blob = await response.blob();
      var blobUrl = window.URL.createObjectURL(blob);
      var a = document.createElement("a");
      a.href = blobUrl;
      a.download = "historia_clinica_" + (historia?.deportista?.numero_documento || historiaId) + ".pdf";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(blobUrl);

      toast.success("Historia clinica descargada correctamente");
    } catch (error) {
      console.error("Error descargando PDF:", error);
      toast.error("Error al descargar el PDF");
    } finally {
      setIsDownloading(false);
    }
  };

  const ejecutarEnviarEmail = async () => {
    var deportista = historia?.deportista || {};
    var email = deportista.email;

    if (!email) {
      toast.error("El deportista no tiene correo electronico registrado");
      return;
    }

    try {
      setIsSendingEmail(true);
      toast.loading("Enviando correo con PDF adjunto...");

      var seccionesParam = buildSeccionesParam();
      var urlEmail = API_BASE_URL + "/documentos/" + historiaId + "/enviar-email?email_destino=" + encodeURIComponent(email);
      if (seccionesParam) {
        urlEmail = urlEmail + "&" + seccionesParam;
      }

      var response = await fetch(urlEmail, {
        method: "POST",
        headers: {
          "ngrok-skip-browser-warning": "true"
        }
      });

      var data = await response.json();
      toast.dismiss();

      if (response.ok && data.success) {
        toast.success("Correo enviado exitosamente a " + email);
      } else {
        if (response.status === 503) {
          toast.info("Abriendo cliente de correo...");
          abrirMailtoConEnlace(email, deportista);
        } else {
          toast.error(data.detail || "Error al enviar el correo");
        }
      }
    } catch (error) {
      console.error("Error enviando email:", error);
      toast.dismiss();
      var dep = historia?.deportista || {};
      abrirMailtoConEnlace(dep.email, dep);
    } finally {
      setIsSendingEmail(false);
    }
  };

  const abrirMailtoConEnlace = (email: string, deportista: any) => {
    var subject = encodeURIComponent("Historia Clinica - " + deportista.nombres + " " + deportista.apellidos);
    var pdfUrl = API_BASE_URL + "/documentos/" + historiaId + "/historia-clinica-pdf";
    var fechaApertura = historia.fecha_apertura
      ? format(new Date(historia.fecha_apertura + "T12:00:00"), "d MMM yyyy", { locale: es })
      : "N/A";
    var body = encodeURIComponent(
      "Estimado(a) " + deportista.nombres + " " + deportista.apellidos + ",\n\n" +
      "Puede descargar su historia clinica deportiva desde el siguiente enlace:\n\n" +
      pdfUrl + "\n\n" +
      "Datos de la historia:\n" +
      "- Documento: " + deportista.numero_documento + "\n" +
      "- Fecha de apertura: " + fechaApertura + "\n" +
      "- ID Historia: " + historia.id + "\n\n" +
      "Atentamente,\n" +
      "INDERHUILA - Instituto Departamental de Recreacion y Deportes del Huila"
    );

    window.open("mailto:" + email + "?subject=" + subject + "&body=" + body, "_blank");
    toast.info("Abriendo cliente de correo...");
  };

  const ejecutarEnviarWhatsApp = async () => {
    var deportista = historia?.deportista || {};
    var telefono = deportista.telefono || deportista.celular;

    if (!telefono) {
      toast.error("El deportista no tiene numero de telefono registrado");
      return;
    }

    telefono = telefono.replace(/\D/g, "");
    if (telefono.length === 10) {
      telefono = "57" + telefono;
    }

    try {
      setIsSendingWhatsApp(true);
      toast.loading("Generando enlace seguro...");

      var seccionesParam = buildSeccionesParam();
      var urlToken = API_BASE_URL + "/descarga-segura/generar-token/" + historiaId;
      if (seccionesParam) {
        urlToken = urlToken + "?" + seccionesParam;
      }

      var response = await fetch(urlToken, {
        method: "POST",
        headers: {
          "ngrok-skip-browser-warning": "true"
        }
      });

      if (!response.ok) {
        throw new Error("Error al generar enlace");
      }

      var data = await response.json();
      toast.dismiss();

      if (data.success) {
        var mensaje = encodeURIComponent(
          "*INDERHUILA - Historia Clinica Deportiva*\n\n" +
          "Hola " + deportista.nombres + ",\n\n" +
          "Tu historia clinica esta lista para descargar.\n\n" +
          "Haz clic aqui para descargar:\n" +
          data.url + "\n\n" +
          "Ingresa tu cedula: " + deportista.numero_documento + "\n\n" +
          "El enlace expira en 2 horas."
        );

        window.open("https://wa.me/" + telefono + "?text=" + mensaje, "_blank");
        toast.success("Se abrira WhatsApp con el enlace");
      } else {
        throw new Error(data.mensaje || "Error al generar enlace");
      }

    } catch (error) {
      console.error("Error preparando WhatsApp:", error);
      toast.dismiss();
      toast.error("Error al generar el enlace seguro");
    } finally {
      setIsSendingWhatsApp(false);
    }
  };

  const ejecutarImprimir = () => {
    // Agregar clase CSS para ocultar secciones no seleccionadas al imprimir
    var seccionesOcultas = SECCIONES_DISPONIBLES
      .filter(s => !seccionesSeleccionadas.includes(s.id))
      .map(s => s.id);

    // Crear hoja de estilos temporal para impresion
    var style = document.createElement('style');
    style.id = 'print-sections-filter';
    style.textContent = seccionesOcultas
      .map(id => '[data-seccion="' + id + '"] { display: none !important; }')
      .join('\n');
    document.head.appendChild(style);

    // Imprimir y luego limpiar
    setTimeout(function() {
      window.print();
      setTimeout(function() {
        var styleEl = document.getElementById('print-sections-filter');
        if (styleEl) styleEl.remove();
      }, 500);
    }, 100);
  };

  // =========================================================================
  // RENDERIZADO
  // =========================================================================

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader className="w-8 h-8 text-blue-600 animate-spin" />
          <p className="text-gray-600">Cargando historia clinica...</p>
        </div>
      </div>
    );
  }

  if (!historia) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <button
            onClick={() => onNavigate?.("historias-clinicas")}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6"
          >
            <ArrowLeft className="w-5 h-5" />
            Volver
          </button>
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            Historia clinica no encontrada
          </div>
        </div>
      </div>
    );
  }

  var deportista = historia.deportista || {};
  var antecedentes = historia.antecedentes_personales || [];
  var antecedentes_familiares = historia.antecedentes_familiares || [];
  var lesiones = historia.lesiones_deportivas || [];
  var cirugias = historia.cirugias_previas || [];
  var alergias = historia.alergias || [];
  var medicaciones = historia.medicaciones || [];
  var vacunas = historia.vacunas_administradas || [];
  var revision_sistemas = historia.revision_sistemas || [];
  var signos_vitales = historia.signos_vitales || [];
  var pruebas = historia.pruebas_complementarias || [];
  var diagnosticos = historia.diagnosticos || [];
  var plan_tratamiento = Array.isArray(historia.plan_tratamiento) ? historia.plan_tratamiento : (historia.plan_tratamiento ? [historia.plan_tratamiento] : []);
  var remisiones = historia.remisiones_especialistas || [];
  var motivo_consulta_enfermedad = historia.motivo_consulta_enfermedad || null;
  var exploracion_fisica = historia.exploracion_fisica_sistemas || null;

  return (
    <div className="min-h-screen bg-gray-50 p-6 print:p-0 print:bg-white">
      <div className="max-w-5xl mx-auto">
        {/* ENCABEZADO */}
        <div className="mb-6 print:hidden">
          <button
            onClick={() => onNavigate?.("historias-clinicas")}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Volver al listado
          </button>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6 print:shadow-none print:rounded-none">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Historia Clinica - {deportista.nombres} {deportista.apellidos}
              </h1>
              <p className="text-gray-600">INDERHUILA - Instituto Departamental de Recreacion y Deportes del Huila</p>
            </div>

            {/* BOTONES DE ACCION - Ahora abren el modal */}
            <div className="flex flex-wrap gap-2 print:hidden">
              <button
                onClick={() => abrirSelectorSecciones('pdf')}
                disabled={isDownloading}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:bg-red-400"
                title="Descargar PDF"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">{isDownloading ? "Descargando..." : "PDF"}</span>
              </button>

              <button
                onClick={() => abrirSelectorSecciones('email')}
                disabled={isSendingEmail}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400"
                title="Enviar por Email con PDF adjunto"
              >
                <Mail className="w-4 h-4" />
                <span className="hidden sm:inline">{isSendingEmail ? "Enviando..." : "Email"}</span>
              </button>

              <button
                onClick={() => abrirSelectorSecciones('whatsapp')}
                disabled={isSendingWhatsApp}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-green-400"
                title="Enviar por WhatsApp con enlace seguro"
              >
                <MessageCircle className="w-4 h-4" />
                <span className="hidden sm:inline">{isSendingWhatsApp ? "Generando..." : "WhatsApp"}</span>
              </button>

              <button
                onClick={() => abrirSelectorSecciones('imprimir')}
                className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                title="Imprimir"
              >
                <Printer className="w-4 h-4" />
                <span className="hidden sm:inline">Imprimir</span>
              </button>
            </div>
          </div>

          {/* DATOS GENERALES */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm border-t pt-4">
            <div>
              <p className="text-gray-600">Documento</p>
              <p className="font-semibold text-gray-900">{deportista.numero_documento}</p>
            </div>
            <div>
              <p className="text-gray-600">Fecha Nacimiento</p>
              <p className="font-semibold text-gray-900">
                {deportista.fecha_nacimiento ? format(new Date(deportista.fecha_nacimiento + "T12:00:00"), "d MMM yyyy", { locale: es }) : "-"}
              </p>
            </div>
            <div>
              <p className="text-gray-600">Telefono</p>
              <p className="font-semibold text-gray-900">{deportista.telefono || deportista.celular || "-"}</p>
            </div>
            <div>
              <p className="text-gray-600">Email</p>
              <p className="font-semibold text-gray-900 text-xs break-all">{deportista.email || "-"}</p>
            </div>
            <div>
              <p className="text-gray-600">Fecha Apertura</p>
              <p className="font-semibold text-gray-900">
                {historia.fecha_apertura ? format(new Date(historia.fecha_apertura + "T12:00:00"), "d MMM yyyy", { locale: es }) : "-"}
              </p>
            </div>
            <div>
              <p className="text-gray-600">Fecha Creacion</p>
              <p className="font-semibold text-gray-900">
                {historia.created_at ? format(new Date(historia.created_at), "d MMM yyyy HH:mm", { locale: es }) : "-"}
              </p>
            </div>
            <div>
              <p className="text-gray-600">ID Historia</p>
              <p className="font-semibold text-gray-900 text-xs">{historia.id.slice(0, 8)}...</p>
            </div>
            <div>
              <p className="text-gray-600">Deporte</p>
              <p className="font-semibold text-gray-900">{deportista.deporte || deportista.disciplina || "-"}</p>
            </div>
          </div>
        </div>

        {/* =============================================================== */}
        {/* SECCIONES - Cada una con data-seccion para filtro de impresion  */}
        {/* =============================================================== */}
        <div className="space-y-6">
          {/* 1. MOTIVO DE CONSULTA Y ENFERMEDAD ACTUAL */}
          {motivo_consulta_enfermedad && (
            <div data-seccion="motivo_consulta" className="bg-white rounded-lg shadow p-6 print:shadow-none print:border print:border-gray-300">
              <h2 className="text-xl font-bold text-gray-900 mb-4 print:text-lg">1. Motivo de Consulta y Enfermedad Actual</h2>
              <div className="border-l-4 border-sky-500 pl-4 py-2 space-y-3">
                {motivo_consulta_enfermedad.motivo_consulta && (
                  <div>
                    <p className="font-semibold text-gray-900">Motivo de Consulta</p>
                    <p className="text-gray-600">{motivo_consulta_enfermedad.motivo_consulta}</p>
                  </div>
                )}
                {motivo_consulta_enfermedad.sintomas_principales && (
                  <div>
                    <p className="font-semibold text-gray-900">Sintomas Principales</p>
                    <p className="text-gray-600">{motivo_consulta_enfermedad.sintomas_principales}</p>
                  </div>
                )}
                {motivo_consulta_enfermedad.duracion_sintomas && (
                  <div>
                    <p className="font-semibold text-gray-900">Duracion de Sintomas</p>
                    <p className="text-gray-600">{motivo_consulta_enfermedad.duracion_sintomas}</p>
                  </div>
                )}
                {motivo_consulta_enfermedad.inicio_enfermedad && (
                  <div>
                    <p className="font-semibold text-gray-900">Inicio de la Enfermedad</p>
                    <p className="text-gray-600">{motivo_consulta_enfermedad.inicio_enfermedad}</p>
                  </div>
                )}
                {motivo_consulta_enfermedad.evolucion && (
                  <div>
                    <p className="font-semibold text-gray-900">Evolucion</p>
                    <p className="text-gray-600">{motivo_consulta_enfermedad.evolucion}</p>
                  </div>
                )}
                {motivo_consulta_enfermedad.factor_desencadenante && (
                  <div>
                    <p className="font-semibold text-gray-900">Factor Desencadenante</p>
                    <p className="text-gray-600">{motivo_consulta_enfermedad.factor_desencadenante}</p>
                  </div>
                )}
                {motivo_consulta_enfermedad.medicamentos_previos && (
                  <div>
                    <p className="font-semibold text-gray-900">Medicamentos Previos</p>
                    <p className="text-gray-600">{motivo_consulta_enfermedad.medicamentos_previos}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 2. ANTECEDENTES MEDICOS (agrupa personales, familiares, lesiones, cirugias, alergias, medicaciones, vacunas) */}
          {(antecedentes.length > 0 || antecedentes_familiares.length > 0 || lesiones.length > 0 || cirugias.length > 0 || alergias.length > 0 || medicaciones.length > 0 || vacunas.length > 0) && (
            <div data-seccion="antecedentes">
              {antecedentes.length > 0 && (
                <div className="bg-white rounded-lg shadow p-6 mb-4 print:shadow-none print:border print:border-gray-300">
                  <h2 className="text-xl font-bold text-gray-900 mb-4 print:text-lg">2. Antecedentes Personales</h2>
                  <div className="space-y-3">
                    {antecedentes.map((a: any, i: number) => (
                      <div key={i} className="border-l-4 border-blue-500 pl-4 py-2">
                        <p className="font-semibold text-gray-900">{a.nombre_enfermedad}</p>
                        {a.codigo_cie11 && <p className="text-sm text-gray-600">CIE-11: {a.codigo_cie11}</p>}
                        {a.observaciones && <p className="text-sm text-gray-600">Observaciones: {a.observaciones}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {antecedentes_familiares.length > 0 && (
                <div className="bg-white rounded-lg shadow p-6 mb-4 print:shadow-none print:border print:border-gray-300">
                  <h2 className="text-xl font-bold text-gray-900 mb-4 print:text-lg">Antecedentes Familiares</h2>
                  <div className="space-y-3">
                    {antecedentes_familiares.map((a: any, i: number) => (
                      <div key={i} className="border-l-4 border-purple-500 pl-4 py-2">
                        <p className="font-semibold text-gray-900">{a.nombre_enfermedad}</p>
                        {a.tipo_familiar && <p className="text-sm text-gray-600">Relacion: {a.tipo_familiar}</p>}
                        {a.codigo_cie11 && <p className="text-sm text-gray-600">CIE-11: {a.codigo_cie11}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {lesiones.length > 0 && (
                <div className="bg-white rounded-lg shadow p-6 mb-4 print:shadow-none print:border print:border-gray-300">
                  <h2 className="text-xl font-bold text-gray-900 mb-4 print:text-lg">Lesiones Deportivas</h2>
                  <div className="space-y-3">
                    {lesiones.map((l: any, i: number) => (
                      <div key={i} className="border-l-4 border-red-500 pl-4 py-2">
                        <p className="font-semibold text-gray-900">{l.descripcion || l.tipo_lesion}</p>
                        {l.fecha_ultima_lesion && <p className="text-sm text-gray-600">Fecha: {format(new Date(l.fecha_ultima_lesion + "T12:00:00"), "d MMM yyyy", { locale: es })}</p>}
                        {l.observaciones && <p className="text-sm text-gray-600">Observaciones: {l.observaciones}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {cirugias.length > 0 && (
                <div className="bg-white rounded-lg shadow p-6 mb-4 print:shadow-none print:border print:border-gray-300">
                  <h2 className="text-xl font-bold text-gray-900 mb-4 print:text-lg">Cirugias Previas</h2>
                  <div className="space-y-3">
                    {cirugias.map((c: any, i: number) => (
                      <div key={i} className="border-l-4 border-orange-500 pl-4 py-2">
                        <p className="font-semibold text-gray-900">{c.tipo_cirugia}</p>
                        {c.fecha_cirugia && <p className="text-sm text-gray-600">Fecha: {format(new Date(c.fecha_cirugia + "T12:00:00"), "d MMM yyyy", { locale: es })}</p>}
                        {c.observaciones && <p className="text-sm text-gray-600">Observaciones: {c.observaciones}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {alergias.length > 0 && (
                <div className="bg-white rounded-lg shadow p-6 mb-4 print:shadow-none print:border print:border-gray-300">
                  <h2 className="text-xl font-bold text-gray-900 mb-4 print:text-lg">Alergias</h2>
                  <div className="space-y-3">
                    {alergias.map((a: any, i: number) => (
                      <div key={i} className="border-l-4 border-yellow-500 pl-4 py-2">
                        <p className="font-semibold text-gray-900">{a.tipo_alergia}</p>
                        {a.observaciones && <p className="text-sm text-gray-600">Observaciones: {a.observaciones}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {medicaciones.length > 0 && (
                <div className="bg-white rounded-lg shadow p-6 mb-4 print:shadow-none print:border print:border-gray-300">
                  <h2 className="text-xl font-bold text-gray-900 mb-4 print:text-lg">Medicaciones Actuales</h2>
                  <div className="space-y-3">
                    {medicaciones.map((m: any, i: number) => (
                      <div key={i} className="border-l-4 border-green-500 pl-4 py-2">
                        <p className="font-semibold text-gray-900">{m.nombre_medicacion}</p>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm mt-2">
                          {m.dosis && <p className="text-gray-600">Dosis: {m.dosis}</p>}
                          {m.frecuencia && <p className="text-gray-600">Frecuencia: {m.frecuencia}</p>}
                        </div>
                        {m.observaciones && <p className="text-sm text-gray-600 mt-2">Observaciones: {m.observaciones}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {vacunas.length > 0 && (
                <div className="bg-white rounded-lg shadow p-6 mb-4 print:shadow-none print:border print:border-gray-300">
                  <h2 className="text-xl font-bold text-gray-900 mb-4 print:text-lg">Vacunas Administradas</h2>
                  <div className="space-y-3">
                    {vacunas.map((v: any, i: number) => (
                      <div key={i} className="border-l-4 border-indigo-500 pl-4 py-2">
                        <p className="font-semibold text-gray-900">{v.nombre_vacuna}</p>
                        {v.fecha_administracion && <p className="text-sm text-gray-600">Fecha: {format(new Date(v.fecha_administracion + "T12:00:00"), "d MMM yyyy", { locale: es })}</p>}
                        {v.observaciones && <p className="text-sm text-gray-600">Observaciones: {v.observaciones}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 3. REVISION POR SISTEMAS */}
          {revision_sistemas.length > 0 && (
            <div data-seccion="revision_sistemas" className="bg-white rounded-lg shadow p-6 print:shadow-none print:border print:border-gray-300">
              <h2 className="text-xl font-bold text-gray-900 mb-4 print:text-lg">3. Revision por Sistemas</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {revision_sistemas.map((r: any, i: number) => (
                  <div key={i} className="border-l-4 border-slate-500 pl-4 py-2">
                    <p className="font-semibold text-gray-900">{r.sistema_nombre}</p>
                    <p className={"text-sm " + (r.estado === "normal" || r.estado === "Normal" ? "text-green-600" : "text-red-600")}>
                      Estado: {r.estado}
                    </p>
                    {r.observaciones && <p className="text-sm text-gray-600">Obs: {r.observaciones}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 4. SIGNOS VITALES */}
          {signos_vitales.length > 0 && (
            <div data-seccion="signos_vitales" className="bg-white rounded-lg shadow p-6 print:shadow-none print:border print:border-gray-300">
              <h2 className="text-xl font-bold text-gray-900 mb-4 print:text-lg">4. Signos Vitales</h2>
              <div className="space-y-3">
                {signos_vitales.map((s: any, i: number) => (
                  <div key={i} className="border-l-4 border-cyan-500 pl-4 py-2">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      {s.estatura_cm && (
                        <div className="bg-gray-50 p-2 rounded">
                          <p className="text-gray-600">Estatura</p>
                          <p className="font-semibold">{s.estatura_cm} cm</p>
                        </div>
                      )}
                      {s.peso_kg && (
                        <div className="bg-gray-50 p-2 rounded">
                          <p className="text-gray-600">Peso</p>
                          <p className="font-semibold">{s.peso_kg} kg</p>
                        </div>
                      )}
                      {s.imc && (
                        <div className="bg-gray-50 p-2 rounded">
                          <p className="text-gray-600">IMC</p>
                          <p className="font-semibold">{s.imc}</p>
                        </div>
                      )}
                      {s.frecuencia_cardiaca_lpm && (
                        <div className="bg-gray-50 p-2 rounded">
                          <p className="text-gray-600">Frec. Cardiaca</p>
                          <p className="font-semibold">{s.frecuencia_cardiaca_lpm} lpm</p>
                        </div>
                      )}
                      {(s.presion_arterial_sistolica || s.presion_arterial_diastolica) && (
                        <div className="bg-gray-50 p-2 rounded">
                          <p className="text-gray-600">Presion Arterial</p>
                          <p className="font-semibold">{s.presion_arterial_sistolica}/{s.presion_arterial_diastolica} mmHg</p>
                        </div>
                      )}
                      {s.frecuencia_respiratoria_rpm && (
                        <div className="bg-gray-50 p-2 rounded">
                          <p className="text-gray-600">Frec. Respiratoria</p>
                          <p className="font-semibold">{s.frecuencia_respiratoria_rpm} rpm</p>
                        </div>
                      )}
                      {s.temperatura_celsius && (
                        <div className="bg-gray-50 p-2 rounded">
                          <p className="text-gray-600">Temperatura</p>
                          <p className="font-semibold">{s.temperatura_celsius} C</p>
                        </div>
                      )}
                      {s.saturacion_oxigeno_percent && (
                        <div className="bg-gray-50 p-2 rounded">
                          <p className="text-gray-600">Saturacion O2</p>
                          <p className="font-semibold">{s.saturacion_oxigeno_percent}%</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 5. EXPLORACION FISICA POR SISTEMAS */}
          {exploracion_fisica && (
            <div data-seccion="exploracion_fisica" className="bg-white rounded-lg shadow p-6 print:shadow-none print:border print:border-gray-300">
              <h2 className="text-xl font-bold text-gray-900 mb-4 print:text-lg">5. Exploracion Fisica por Sistemas</h2>
              <div className="border-l-4 border-emerald-500 pl-4 py-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {exploracion_fisica.sistema_cardiovascular && (
                    <div>
                      <p className="font-semibold text-gray-900">Sistema Cardiovascular</p>
                      <p className="text-gray-600 text-sm">{exploracion_fisica.sistema_cardiovascular}</p>
                    </div>
                  )}
                  {exploracion_fisica.sistema_respiratorio && (
                    <div>
                      <p className="font-semibold text-gray-900">Sistema Respiratorio</p>
                      <p className="text-gray-600 text-sm">{exploracion_fisica.sistema_respiratorio}</p>
                    </div>
                  )}
                  {exploracion_fisica.sistema_digestivo && (
                    <div>
                      <p className="font-semibold text-gray-900">Sistema Digestivo</p>
                      <p className="text-gray-600 text-sm">{exploracion_fisica.sistema_digestivo}</p>
                    </div>
                  )}
                  {exploracion_fisica.sistema_neurologico && (
                    <div>
                      <p className="font-semibold text-gray-900">Sistema Neurologico</p>
                      <p className="text-gray-600 text-sm">{exploracion_fisica.sistema_neurologico}</p>
                    </div>
                  )}
                  {exploracion_fisica.sistema_genitourinario && (
                    <div>
                      <p className="font-semibold text-gray-900">Sistema Genitourinario</p>
                      <p className="text-gray-600 text-sm">{exploracion_fisica.sistema_genitourinario}</p>
                    </div>
                  )}
                  {exploracion_fisica.sistema_musculoesqueletico && (
                    <div>
                      <p className="font-semibold text-gray-900">Sistema Musculoesqueletico</p>
                      <p className="text-gray-600 text-sm">{exploracion_fisica.sistema_musculoesqueletico}</p>
                    </div>
                  )}
                  {exploracion_fisica.sistema_integumentario && (
                    <div>
                      <p className="font-semibold text-gray-900">Sistema Integumentario (Piel)</p>
                      <p className="text-gray-600 text-sm">{exploracion_fisica.sistema_integumentario}</p>
                    </div>
                  )}
                  {exploracion_fisica.sistema_endocrino && (
                    <div>
                      <p className="font-semibold text-gray-900">Sistema Endocrino</p>
                      <p className="text-gray-600 text-sm">{exploracion_fisica.sistema_endocrino}</p>
                    </div>
                  )}
                  {exploracion_fisica.cabeza_cuello && (
                    <div>
                      <p className="font-semibold text-gray-900">Cabeza y Cuello</p>
                      <p className="text-gray-600 text-sm">{exploracion_fisica.cabeza_cuello}</p>
                    </div>
                  )}
                  {exploracion_fisica.extremidades && (
                    <div>
                      <p className="font-semibold text-gray-900">Extremidades</p>
                      <p className="text-gray-600 text-sm">{exploracion_fisica.extremidades}</p>
                    </div>
                  )}
                </div>
                {exploracion_fisica.observaciones_generales && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="font-semibold text-gray-900">Observaciones Generales</p>
                    <p className="text-gray-600 text-sm">{exploracion_fisica.observaciones_generales}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 6. PRUEBAS COMPLEMENTARIAS */}
          {pruebas.length > 0 && (
            <div data-seccion="pruebas_complementarias" className="bg-white rounded-lg shadow p-6 print:shadow-none print:border print:border-gray-300">
              <h2 className="text-xl font-bold text-gray-900 mb-4 print:text-lg">6. Pruebas Complementarias / Ayudas Diagnosticas</h2>
              <div className="space-y-3">
                {pruebas.map((p: any, i: number) => (
                  <div key={i} className="border-l-4 border-lime-500 pl-4 py-2">
                    <p className="font-semibold text-gray-900">{p.nombre_prueba}</p>
                    {p.categoria && <p className="text-sm text-gray-600">Categoria: {p.categoria}</p>}
                    {p.codigo_cups && <p className="text-sm text-gray-600">Codigo CUPS: {p.codigo_cups}</p>}
                    {p.resultado && <p className="text-sm text-gray-600">Resultado: {p.resultado}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 7. DIAGNOSTICOS */}
          {diagnosticos.length > 0 && (
            <div data-seccion="diagnosticos" className="bg-white rounded-lg shadow p-6 print:shadow-none print:border print:border-gray-300">
              <h2 className="text-xl font-bold text-gray-900 mb-4 print:text-lg">7. Diagnosticos</h2>
              <div className="space-y-3">
                {diagnosticos.map((d: any, i: number) => (
                  <div key={i} className="border-l-4 border-pink-500 pl-4 py-2">
                    <p className="font-semibold text-gray-900">{d.nombre_enfermedad}</p>
                    {d.codigo_cie11 && <p className="text-sm text-gray-600">CIE-11: {d.codigo_cie11}</p>}
                    {d.tipo_diagnostico && <p className="text-sm text-gray-600">Tipo: {d.tipo_diagnostico}</p>}
                    {d.observaciones && <p className="text-sm text-gray-600">Observaciones: {d.observaciones}</p>}
                    {d.impresion_diagnostica && <p className="text-sm text-gray-600">Impresion: {d.impresion_diagnostica}</p>}
                    {d.analisis_objetivo && <p className="text-sm text-gray-600">Analisis: {d.analisis_objetivo}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 8. PLAN DE TRATAMIENTO */}
          {plan_tratamiento.length > 0 && (
            <div data-seccion="plan_tratamiento" className="bg-white rounded-lg shadow p-6 print:shadow-none print:border print:border-gray-300">
              <h2 className="text-xl font-bold text-gray-900 mb-4 print:text-lg">8. Plan de Tratamiento</h2>
              <div className="space-y-4">
                {plan_tratamiento.map((p: any, i: number) => (
                  <div key={i} className="border-l-4 border-violet-500 pl-4 py-2">
                    {p.indicaciones_medicas && (
                      <div className="mb-3">
                        <p className="font-semibold text-gray-900 mb-1">Indicaciones Medicas</p>
                        <p className="text-gray-600 text-sm whitespace-pre-line">{p.indicaciones_medicas}</p>
                      </div>
                    )}
                    {p.recomendaciones_entrenamiento && (
                      <div className="mb-3">
                        <p className="font-semibold text-gray-900 mb-1">Recomendaciones de Entrenamiento</p>
                        <p className="text-gray-600 text-sm whitespace-pre-line">{p.recomendaciones_entrenamiento}</p>
                      </div>
                    )}
                    {p.plan_seguimiento && (
                      <div className="mb-3">
                        <p className="font-semibold text-gray-900 mb-1">Plan de Seguimiento</p>
                        <p className="text-gray-600 text-sm whitespace-pre-line">{p.plan_seguimiento}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 9. REMISIONES A ESPECIALISTAS */}
          {remisiones.length > 0 && (
            <div data-seccion="remisiones" className="bg-white rounded-lg shadow p-6 print:shadow-none print:border print:border-gray-300">
              <h2 className="text-xl font-bold text-gray-900 mb-4 print:text-lg">9. Remisiones a Especialistas</h2>
              <div className="space-y-3">
                {remisiones.map((r: any, i: number) => (
                  <div key={i} className="border-l-4 border-teal-500 pl-4 py-2">
                    <p className="font-semibold text-gray-900">{r.especialista}</p>
                    <p className="text-sm text-gray-600">Motivo: {r.motivo}</p>
                    <div className="flex gap-4 text-sm mt-2">
                      {r.prioridad && (
                        <span className={"px-2 py-1 rounded " + (r.prioridad === "Urgente" ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700")}>
                          {r.prioridad}
                        </span>
                      )}
                      {r.fecha_remision && <p className="text-gray-600">Fecha: {format(new Date(r.fecha_remision + "T12:00:00"), "d MMM yyyy", { locale: es })}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* MENSAJE SI NO HAY DATOS */}
          {antecedentes.length === 0 && antecedentes_familiares.length === 0 && lesiones.length === 0 &&
           cirugias.length === 0 && alergias.length === 0 && medicaciones.length === 0 &&
           vacunas.length === 0 && signos_vitales.length === 0 && diagnosticos.length === 0 &&
           remisiones.length === 0 && pruebas.length === 0 && revision_sistemas.length === 0 &&
           plan_tratamiento.length === 0 && !motivo_consulta_enfermedad && !exploracion_fisica && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <p className="text-yellow-800">Esta historia clinica aun no contiene informacion detallada.</p>
            </div>
          )}

          {/* PIE DE PAGINA PARA IMPRESION */}
          <div className="hidden print:block mt-8 pt-4 border-t border-gray-300 text-center text-sm text-gray-600">
            <p>INDERHUILA - Instituto Departamental de Recreacion y Deportes del Huila</p>
            <p>Documento generado el {format(new Date(), "d 'de' MMMM 'de' yyyy 'a las' HH:mm", { locale: es })}</p>
          </div>
        </div>
      </div>

      {/* ================================================================= */}
      {/* MODAL SELECTOR DE SECCIONES                                       */}
      {/* ================================================================= */}
      {mostrarModalSecciones && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 print:hidden">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
            {/* Header del modal */}
            <div className="bg-blue-600 text-white px-6 py-4 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold">Seleccionar Secciones</h3>
                <p className="text-blue-100 text-sm">
                  {accionPendiente === 'pdf' && 'Elija las secciones para incluir en el PDF'}
                  {accionPendiente === 'email' && 'Elija las secciones para enviar por Email'}
                  {accionPendiente === 'whatsapp' && 'Elija las secciones para enviar por WhatsApp'}
                  {accionPendiente === 'imprimir' && 'Elija las secciones para imprimir'}
                </p>
              </div>
              <button
                onClick={() => { setMostrarModalSecciones(false); setAccionPendiente(null); }}
                className="p-1 hover:bg-blue-500 rounded transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Botones seleccionar/deseleccionar todas */}
            <div className="px-6 pt-4 pb-2 flex gap-3 border-b">
              <button
                onClick={seleccionarTodas}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
              >
                <CheckSquare className="w-4 h-4" />
                Seleccionar todas
              </button>
              <button
                onClick={deseleccionarTodas}
                className="text-sm text-gray-500 hover:text-gray-700 font-medium flex items-center gap-1"
              >
                <Square className="w-4 h-4" />
                Deseleccionar todas
              </button>
              <span className="ml-auto text-sm text-gray-400">
                {seccionesSeleccionadas.length} de {SECCIONES_DISPONIBLES.length}
              </span>
            </div>

            {/* Lista de secciones */}
            <div className="px-6 py-3 max-h-80 overflow-y-auto">
              <div className="space-y-1">
                {SECCIONES_DISPONIBLES.map((seccion) => {
                  var isSelected = seccionesSeleccionadas.includes(seccion.id);
                  return (
                    <label
                      key={seccion.id}
                      className={"flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors " +
                        (isSelected ? "bg-blue-50 border border-blue-200" : "hover:bg-gray-50 border border-transparent")}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSeccion(seccion.id)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className={"flex items-center gap-2 text-sm " + (isSelected ? "text-blue-900 font-medium" : "text-gray-700")}>
                        <span className={"inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold " +
                          (isSelected ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-500")}>
                          {seccion.numero}
                        </span>
                        {seccion.nombre}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Footer con botones de accion */}
            <div className="px-6 py-4 bg-gray-50 border-t flex justify-end gap-3">
              <button
                onClick={() => { setMostrarModalSecciones(false); setAccionPendiente(null); }}
                className="px-5 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={confirmarAccion}
                disabled={seccionesSeleccionadas.length === 0}
                className={"px-5 py-2.5 text-white rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed " +
                  (accionPendiente === 'pdf' ? "bg-red-600 hover:bg-red-700" :
                   accionPendiente === 'email' ? "bg-blue-600 hover:bg-blue-700" :
                   accionPendiente === 'whatsapp' ? "bg-green-600 hover:bg-green-700" :
                   "bg-gray-600 hover:bg-gray-700")}
              >
                {accionPendiente === 'pdf' && "Descargar PDF"}
                {accionPendiente === 'email' && "Enviar Email"}
                {accionPendiente === 'whatsapp' && "Enviar WhatsApp"}
                {accionPendiente === 'imprimir' && "Imprimir"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}