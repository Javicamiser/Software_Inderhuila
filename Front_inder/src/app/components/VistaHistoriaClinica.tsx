import { useState, useEffect } from 'react';
import { historiaClinicaService, documentosService } from '../services/apiClient';
import { toast } from 'sonner';
import { ArrowLeft, Loader, Download, Mail, MessageCircle, Printer } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

// URL base de la API
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

interface VistaHistoriaClinicaProps {
  historiaId: string;
  onNavigate?: (view: string) => void;
}

export function VistaHistoriaClinica({ historiaId, onNavigate }: VistaHistoriaClinicaProps) {
  const [historia, setHistoria] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [isSendingWhatsApp, setIsSendingWhatsApp] = useState(false);

  useEffect(() => {
    cargarHistoria();
  }, [historiaId]);

  const cargarHistoria = async () => {
    try {
      setIsLoading(true);
      const response = await historiaClinicaService.getById(historiaId);
      setHistoria(response);
    } catch (error) {
      toast.error('Error cargando historia clínica');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Descargar PDF
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
      a.download = `historia_clinica_${historia?.deportista?.numero_documento || historiaId}.pdf`;
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

  // Enviar por Email
  const handleEnviarEmail = async () => {
    const deportista = historia?.deportista || {};
    const email = deportista.email;
    
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
      
      const data = await response.json();
      
      toast.dismiss();
      
      if (response.ok && data.success) {
        toast.success(`Correo enviado exitosamente a ${email}`);
      } else {
        if (response.status === 503) {
          toast.info('Abriendo cliente de correo...');
          abrirMailtoConEnlace(email, deportista);
        } else {
          toast.error(data.detail || 'Error al enviar el correo');
        }
      }
    } catch (error) {
      console.error('Error enviando email:', error);
      toast.dismiss();
      const deportista = historia?.deportista || {};
      abrirMailtoConEnlace(deportista.email, deportista);
    } finally {
      setIsSendingEmail(false);
    }
  };

  // Fallback: Abrir cliente de correo con enlace de descarga
  const abrirMailtoConEnlace = (email: string, deportista: any) => {
    const subject = encodeURIComponent(`Historia Clínica - ${deportista.nombres} ${deportista.apellidos}`);
    const pdfUrl = `${API_BASE_URL}/documentos/${historiaId}/historia-clinica-pdf`;
    const body = encodeURIComponent(
      `Estimado(a) ${deportista.nombres} ${deportista.apellidos},\n\n` +
      `Puede descargar su historia clínica deportiva desde el siguiente enlace:\n\n` +
      `${pdfUrl}\n\n` +
      `Datos de la historia:\n` +
      `- Documento: ${deportista.numero_documento}\n` +
      `- Fecha de apertura: ${historia.fecha_apertura ? format(new Date(historia.fecha_apertura), 'd MMM yyyy', { locale: es }) : 'N/A'}\n` +
      `- ID Historia: ${historia.id}\n\n` +
      `Atentamente,\n` +
      `INDERHUILA - Instituto Departamental de Recreación y Deportes del Huila`
    );

    window.open(`mailto:${email}?subject=${subject}&body=${body}`, '_blank');
    toast.info('Abriendo cliente de correo...');
  };

  // Enviar por WhatsApp - Genera enlace seguro con verificación de cédula
  const handleEnviarWhatsApp = async () => {
    const deportista = historia?.deportista || {};
    let telefono = deportista.telefono || deportista.celular;
    
    if (!telefono) {
      toast.error('El deportista no tiene número de teléfono registrado');
      return;
    }

    // Limpiar número de teléfono (solo números)
    telefono = telefono.replace(/\D/g, '');
    
    // Si no tiene código de país, agregar Colombia (+57)
    if (telefono.length === 10) {
      telefono = '57' + telefono;
    }

    try {
      setIsSendingWhatsApp(true);
      toast.loading('Generando enlace seguro...');
      
      // Generar token de descarga segura
      const response = await fetch(`${API_BASE_URL}/descarga-segura/generar-token/${historiaId}`, {
        method: 'POST'
      });
      
      if (!response.ok) {
        throw new Error('Error al generar enlace');
      }
      
      const data = await response.json();
      
      toast.dismiss();
      
      if (data.success) {
        // Mensaje simplificado - URL en línea separada para que sea clickeable
        const mensaje = encodeURIComponent(
          `*INDERHUILA - Historia Clínica Deportiva*\n\n` +
          `Hola ${deportista.nombres},\n\n` +
          `Tu historia clínica está lista para descargar.\n\n` +
          `Haz clic aquí para descargar:\n` +
          `${data.url}\n\n` +
          `Ingresa tu cédula: ${deportista.numero_documento}\n\n` +
          `El enlace expira en 2 horas.`
        );
        
        // Abrir WhatsApp con el mensaje
        window.open(`https://wa.me/${telefono}?text=${mensaje}`, '_blank');
        toast.success('Se abrirá WhatsApp con el enlace');
      } else {
        throw new Error(data.mensaje || 'Error al generar enlace');
      }
      
    } catch (error) {
      console.error('Error preparando WhatsApp:', error);
      toast.dismiss();
      toast.error('Error al generar el enlace seguro');
    } finally {
      setIsSendingWhatsApp(false);
    }
  };

  // Imprimir
  const handleImprimir = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader className="w-8 h-8 text-blue-600 animate-spin" />
          <p className="text-gray-600">Cargando historia clínica...</p>
        </div>
      </div>
    );
  }

  if (!historia) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <button
            onClick={() => onNavigate?.('historias-clinicas')}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6"
          >
            <ArrowLeft className="w-5 h-5" />
            Volver
          </button>
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            Historia clínica no encontrada
          </div>
        </div>
      </div>
    );
  }

  const deportista = historia.deportista || {};
  const antecedentes = historia.antecedentes_personales || [];
  const antecedentes_familiares = historia.antecedentes_familiares || [];
  const lesiones = historia.lesiones_deportivas || [];
  const cirugias = historia.cirugias_previas || [];
  const alergias = historia.alergias || [];
  const medicaciones = historia.medicaciones || [];
  const vacunas = historia.vacunas_administradas || [];
  const revision_sistemas = historia.revision_sistemas || [];
  const signos_vitales = historia.signos_vitales || [];
  const pruebas = historia.pruebas_complementarias || [];
  const diagnosticos = historia.diagnosticos || [];
  const plan_tratamiento = Array.isArray(historia.plan_tratamiento) ? historia.plan_tratamiento : (historia.plan_tratamiento ? [historia.plan_tratamiento] : []);
  const remisiones = historia.remisiones_especialistas || [];
  const motivo_consulta_enfermedad = historia.motivo_consulta_enfermedad || null;
  const exploracion_fisica = historia.exploracion_fisica_sistemas || null;

  return (
    <div className="min-h-screen bg-gray-50 p-6 print:p-0 print:bg-white">
      <div className="max-w-5xl mx-auto">
        {/* ENCABEZADO */}
        <div className="mb-6 print:hidden">
          <button
            onClick={() => onNavigate?.('historias-clinicas')}
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
                Historia Clínica - {deportista.nombres} {deportista.apellidos}
              </h1>
              <p className="text-gray-600">INDERHUILA - Instituto Departamental de Recreación y Deportes del Huila</p>
            </div>
            
            {/* BOTONES DE ACCIÓN */}
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
                title="Enviar por Email con PDF adjunto"
              >
                <Mail className="w-4 h-4" />
                <span className="hidden sm:inline">{isSendingEmail ? 'Enviando...' : 'Email'}</span>
              </button>
              
              <button
                onClick={handleEnviarWhatsApp}
                disabled={isSendingWhatsApp}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-green-400"
                title="Enviar por WhatsApp con enlace seguro"
              >
                <MessageCircle className="w-4 h-4" />
                <span className="hidden sm:inline">{isSendingWhatsApp ? 'Generando...' : 'WhatsApp'}</span>
              </button>
              
              <button
                onClick={handleImprimir}
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
                {deportista.fecha_nacimiento ? format(new Date(deportista.fecha_nacimiento), 'd MMM yyyy', { locale: es }) : '-'}
              </p>
            </div>
            <div>
              <p className="text-gray-600">Teléfono</p>
              <p className="font-semibold text-gray-900">{deportista.telefono || deportista.celular || '-'}</p>
            </div>
            <div>
              <p className="text-gray-600">Email</p>
              <p className="font-semibold text-gray-900 text-xs break-all">{deportista.email || '-'}</p>
            </div>
            <div>
              <p className="text-gray-600">Fecha Apertura</p>
              <p className="font-semibold text-gray-900">
                {historia.fecha_apertura ? format(new Date(historia.fecha_apertura), 'd MMM yyyy', { locale: es }) : '-'}
              </p>
            </div>
            <div>
              <p className="text-gray-600">Fecha Creación</p>
              <p className="font-semibold text-gray-900">
                {historia.created_at ? format(new Date(historia.created_at), 'd MMM yyyy HH:mm', { locale: es }) : '-'}
              </p>
            </div>
            <div>
              <p className="text-gray-600">ID Historia</p>
              <p className="font-semibold text-gray-900 text-xs">{historia.id.slice(0, 8)}...</p>
            </div>
            <div>
              <p className="text-gray-600">Deporte</p>
              <p className="font-semibold text-gray-900">{deportista.deporte || deportista.disciplina || '-'}</p>
            </div>
          </div>
        </div>

        {/* SECCIONES */}
        <div className="space-y-6">
          {/* MOTIVO DE CONSULTA Y ENFERMEDAD ACTUAL */}
          {motivo_consulta_enfermedad && (
            <div className="bg-white rounded-lg shadow p-6 print:shadow-none print:border print:border-gray-300">
              <h2 className="text-xl font-bold text-gray-900 mb-4 print:text-lg">Motivo de Consulta y Enfermedad Actual</h2>
              <div className="border-l-4 border-sky-500 pl-4 py-2 space-y-3">
                {motivo_consulta_enfermedad.motivo_consulta && (
                  <div>
                    <p className="font-semibold text-gray-900">Motivo de Consulta</p>
                    <p className="text-gray-600">{motivo_consulta_enfermedad.motivo_consulta}</p>
                  </div>
                )}
                {motivo_consulta_enfermedad.sintomas_principales && (
                  <div>
                    <p className="font-semibold text-gray-900">Síntomas Principales</p>
                    <p className="text-gray-600">{motivo_consulta_enfermedad.sintomas_principales}</p>
                  </div>
                )}
                {motivo_consulta_enfermedad.duracion_sintomas && (
                  <div>
                    <p className="font-semibold text-gray-900">Duración de Síntomas</p>
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
                    <p className="font-semibold text-gray-900">Evolución</p>
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

          {/* ANTECEDENTES PERSONALES */}
          {antecedentes.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6 print:shadow-none print:border print:border-gray-300">
              <h2 className="text-xl font-bold text-gray-900 mb-4 print:text-lg">Antecedentes Personales</h2>
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

          {/* ANTECEDENTES FAMILIARES */}
          {antecedentes_familiares.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6 print:shadow-none print:border print:border-gray-300">
              <h2 className="text-xl font-bold text-gray-900 mb-4 print:text-lg">Antecedentes Familiares</h2>
              <div className="space-y-3">
                {antecedentes_familiares.map((a: any, i: number) => (
                  <div key={i} className="border-l-4 border-purple-500 pl-4 py-2">
                    <p className="font-semibold text-gray-900">{a.nombre_enfermedad}</p>
                    {a.tipo_familiar && <p className="text-sm text-gray-600">Relación: {a.tipo_familiar}</p>}
                    {a.codigo_cie11 && <p className="text-sm text-gray-600">CIE-11: {a.codigo_cie11}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* LESIONES DEPORTIVAS */}
          {lesiones.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6 print:shadow-none print:border print:border-gray-300">
              <h2 className="text-xl font-bold text-gray-900 mb-4 print:text-lg">Lesiones Deportivas</h2>
              <div className="space-y-3">
                {lesiones.map((l: any, i: number) => (
                  <div key={i} className="border-l-4 border-red-500 pl-4 py-2">
                    <p className="font-semibold text-gray-900">{l.descripcion || l.tipo_lesion}</p>
                    {l.fecha_ultima_lesion && <p className="text-sm text-gray-600">Fecha: {format(new Date(l.fecha_ultima_lesion), 'd MMM yyyy', { locale: es })}</p>}
                    {l.tratamiento && <p className="text-sm text-gray-600">Tratamiento: {l.tratamiento}</p>}
                    {l.observaciones && <p className="text-sm text-gray-600">Observaciones: {l.observaciones}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CIRUGÍAS PREVIAS */}
          {cirugias.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6 print:shadow-none print:border print:border-gray-300">
              <h2 className="text-xl font-bold text-gray-900 mb-4 print:text-lg">Cirugías Previas</h2>
              <div className="space-y-3">
                {cirugias.map((c: any, i: number) => (
                  <div key={i} className="border-l-4 border-orange-500 pl-4 py-2">
                    <p className="font-semibold text-gray-900">{c.tipo_cirugia}</p>
                    {c.fecha_cirugia && <p className="text-sm text-gray-600">Fecha: {format(new Date(c.fecha_cirugia), 'd MMM yyyy', { locale: es })}</p>}
                    {c.observaciones && <p className="text-sm text-gray-600">Observaciones: {c.observaciones}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ALERGIAS */}
          {alergias.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6 print:shadow-none print:border print:border-gray-300">
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

          {/* MEDICACIONES */}
          {medicaciones.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6 print:shadow-none print:border print:border-gray-300">
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

          {/* VACUNAS */}
          {vacunas.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6 print:shadow-none print:border print:border-gray-300">
              <h2 className="text-xl font-bold text-gray-900 mb-4 print:text-lg">Vacunas Administradas</h2>
              <div className="space-y-3">
                {vacunas.map((v: any, i: number) => (
                  <div key={i} className="border-l-4 border-indigo-500 pl-4 py-2">
                    <p className="font-semibold text-gray-900">{v.nombre_vacuna}</p>
                    {v.fecha_administracion && <p className="text-sm text-gray-600">Fecha: {format(new Date(v.fecha_administracion), 'd MMM yyyy', { locale: es })}</p>}
                    {v.observaciones && <p className="text-sm text-gray-600">Observaciones: {v.observaciones}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* REVISIÓN DE SISTEMAS */}
          {revision_sistemas.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6 print:shadow-none print:border print:border-gray-300">
              <h2 className="text-xl font-bold text-gray-900 mb-4 print:text-lg">Revisión por Sistemas</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {revision_sistemas.map((r: any, i: number) => (
                  <div key={i} className="border-l-4 border-slate-500 pl-4 py-2">
                    <p className="font-semibold text-gray-900">{r.sistema_nombre}</p>
                    <p className={`text-sm ${r.estado === 'normal' ? 'text-green-600' : 'text-red-600'}`}>
                      Estado: {r.estado}
                    </p>
                    {r.observaciones && <p className="text-sm text-gray-600">Obs: {r.observaciones}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SIGNOS VITALES */}
          {signos_vitales.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6 print:shadow-none print:border print:border-gray-300">
              <h2 className="text-xl font-bold text-gray-900 mb-4 print:text-lg">Signos Vitales</h2>
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
                          <p className="text-gray-600">Frec. Cardíaca</p>
                          <p className="font-semibold">{s.frecuencia_cardiaca_lpm} lpm</p>
                        </div>
                      )}
                      {(s.presion_arterial_sistolica || s.presion_arterial_diastolica) && (
                        <div className="bg-gray-50 p-2 rounded">
                          <p className="text-gray-600">Presión Arterial</p>
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
                          <p className="font-semibold">{s.temperatura_celsius}°C</p>
                        </div>
                      )}
                      {s.saturacion_oxigeno_percent && (
                        <div className="bg-gray-50 p-2 rounded">
                          <p className="text-gray-600">Saturación O₂</p>
                          <p className="font-semibold">{s.saturacion_oxigeno_percent}%</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* EXPLORACIÓN FÍSICA POR SISTEMAS */}
          {exploracion_fisica && (
            <div className="bg-white rounded-lg shadow p-6 print:shadow-none print:border print:border-gray-300">
              <h2 className="text-xl font-bold text-gray-900 mb-4 print:text-lg">Exploración Física por Sistemas</h2>
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
                      <p className="font-semibold text-gray-900">Sistema Neurológico</p>
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
                      <p className="font-semibold text-gray-900">Sistema Musculoesquelético</p>
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

          {/* PRUEBAS COMPLEMENTARIAS */}
          {pruebas.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6 print:shadow-none print:border print:border-gray-300">
              <h2 className="text-xl font-bold text-gray-900 mb-4 print:text-lg">Pruebas Complementarias / Ayudas Diagnósticas</h2>
              <div className="space-y-3">
                {pruebas.map((p: any, i: number) => (
                  <div key={i} className="border-l-4 border-lime-500 pl-4 py-2">
                    <p className="font-semibold text-gray-900">{p.nombre_prueba}</p>
                    {p.categoria && <p className="text-sm text-gray-600">Categoría: {p.categoria}</p>}
                    {p.codigo_cups && <p className="text-sm text-gray-600">Código CUPS: {p.codigo_cups}</p>}
                    {p.resultado && <p className="text-sm text-gray-600">Resultado: {p.resultado}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* DIAGNÓSTICOS */}
          {diagnosticos.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6 print:shadow-none print:border print:border-gray-300">
              <h2 className="text-xl font-bold text-gray-900 mb-4 print:text-lg">Diagnósticos</h2>
              <div className="space-y-3">
                {diagnosticos.map((d: any, i: number) => (
                  <div key={i} className="border-l-4 border-pink-500 pl-4 py-2">
                    <p className="font-semibold text-gray-900">{d.nombre_enfermedad}</p>
                    {d.codigo_cie11 && <p className="text-sm text-gray-600">CIE-11: {d.codigo_cie11}</p>}
                    {d.tipo_diagnostico && <p className="text-sm text-gray-600">Tipo: {d.tipo_diagnostico}</p>}
                    {d.observaciones && <p className="text-sm text-gray-600">Observaciones: {d.observaciones}</p>}
                    {d.impresion_diagnostica && <p className="text-sm text-gray-600">Impresión: {d.impresion_diagnostica}</p>}
                    {d.analisis_objetivo && <p className="text-sm text-gray-600">Análisis: {d.analisis_objetivo}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* PLAN DE TRATAMIENTO */}
          {plan_tratamiento.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6 print:shadow-none print:border print:border-gray-300">
              <h2 className="text-xl font-bold text-gray-900 mb-4 print:text-lg">Plan de Tratamiento</h2>
              <div className="space-y-4">
                {plan_tratamiento.map((p: any, i: number) => (
                  <div key={i} className="border-l-4 border-violet-500 pl-4 py-2">
                    {p.indicaciones_medicas && (
                      <div className="mb-3">
                        <p className="font-semibold text-gray-900 mb-1">Indicaciones Médicas</p>
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

          {/* REMISIONES A ESPECIALISTAS */}
          {remisiones.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6 print:shadow-none print:border print:border-gray-300">
              <h2 className="text-xl font-bold text-gray-900 mb-4 print:text-lg">Remisiones a Especialistas</h2>
              <div className="space-y-3">
                {remisiones.map((r: any, i: number) => (
                  <div key={i} className="border-l-4 border-teal-500 pl-4 py-2">
                    <p className="font-semibold text-gray-900">{r.especialista}</p>
                    <p className="text-sm text-gray-600">Motivo: {r.motivo}</p>
                    <div className="flex gap-4 text-sm mt-2">
                      {r.prioridad && (
                        <span className={`px-2 py-1 rounded ${r.prioridad === 'Urgente' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                          {r.prioridad}
                        </span>
                      )}
                      {r.fecha_remision && <p className="text-gray-600">Fecha: {format(new Date(r.fecha_remision), 'd MMM yyyy', { locale: es })}</p>}
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
              <p className="text-yellow-800">Esta historia clínica aún no contiene información detallada.</p>
            </div>
          )}

          {/* PIE DE PÁGINA PARA IMPRESIÓN */}
          <div className="hidden print:block mt-8 pt-4 border-t border-gray-300 text-center text-sm text-gray-600">
            <p>INDERHUILA - Instituto Departamental de Recreación y Deportes del Huila</p>
            <p>Documento generado el {format(new Date(), "d 'de' MMMM 'de' yyyy 'a las' HH:mm", { locale: es })}</p>
          </div>
        </div>
      </div>
    </div>
  );
}