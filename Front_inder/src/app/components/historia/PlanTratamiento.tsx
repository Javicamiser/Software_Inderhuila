import { HistoriaClinicaData } from "../HistoriaClinica";
import { Download, Mail, MessageCircle, Printer, X } from "lucide-react";
import { useState } from "react";
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
  const [interconsultas, setInterconsultas] = useState<Interconsulta[]>(data.remisionesEspecialistas?.filter((r) => r.prioridad === "Normal") || []);
  const [remisiones, setRemisiones] = useState<Remision[]>(data.remisionesEspecialistas?.filter((r) => r.prioridad === "Urgente") || []);
  
  const [nuevaInterconsulta, setNuevaInterconsulta] = useState({ especialista: "", motivo: "" });
  const [nuevaRemision, setNuevaRemision] = useState({ especialista: "", motivo: "", prioridad: "Urgente" as "Normal" | "Urgente", fechaRemision: new Date().toISOString().split('T')[0] });

  const [isDownloading, setIsDownloading] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [isSendingWhatsApp, setIsSendingWhatsApp] = useState(false);

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

  // DESCARGAR PDF - IGUAL A VISTAHIST
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

  // ENVIAR EMAIL - IGUAL A VISTAHIST
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

  // ENVIAR WHATSAPP - IGUAL A VISTAHIST
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
      <div className="bg-gray-50 border-l-4 border-gray-400 p-6 rounded-lg space-y-4">
        <h3 className="font-semibold text-gray-800">Interconsultas con Especialistas</h3>
        
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
        </div>

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

      {/* REMISIONES */}
      <div className="bg-gray-50 border-l-4 border-gray-400 p-6 rounded-lg space-y-4">
        <h3 className="font-semibold text-gray-800">Remisiones a Especialistas (Urgentes)</h3>
        
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
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
          >
            Agregar Remisión
          </button>
        </div>

        {remisiones.length > 0 && (
          <div className="space-y-2 mt-4 pt-4 border-t-2 border-gray-300">
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

      {/* BOTONES DE DISTRIBUCIÓN - FINAL (EXACTOS DE VISTAHIST) */}
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