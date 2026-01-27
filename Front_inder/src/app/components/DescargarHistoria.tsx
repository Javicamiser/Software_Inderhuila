import { useState, useEffect } from 'react';
import { Loader, Download, Shield, AlertCircle, CheckCircle } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

interface DescargarHistoriaProps {
  token: string;
}

export function DescargarHistoria({ token }: DescargarHistoriaProps) {
  const [cedula, setCedula] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [tokenValido, setTokenValido] = useState<boolean | null>(null);
  const [mensajeToken, setMensajeToken] = useState<string>('');

  // Verificar si el token es válido al cargar
  useEffect(() => {
    const verificarToken = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/descarga-segura/info/${token}`);
        const data = await response.json();
        setTokenValido(data.valido);
        if (!data.valido) {
          setMensajeToken(data.mensaje || 'Enlace no válido');
        }
      } catch (err) {
        setTokenValido(false);
        setMensajeToken('Error al verificar el enlace');
      }
    };
    verificarToken();
  }, [token]);

  const handleVerificar = async () => {
    if (!cedula.trim()) {
      setError('Por favor ingrese su número de cédula');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Paso 1: Verificar cédula
      const response = await fetch(`${API_BASE_URL}/descarga-segura/verificar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: token,
          cedula: cedula.trim()
        }),
      });

      const data = await response.json();

      // Si la respuesta no es OK (401, 403, etc.), mostrar error
      if (!response.ok) {
        throw new Error(data.detail || 'Error al verificar');
      }

      // Verificar que la respuesta indique éxito
      if (!data.success) {
        throw new Error(data.detail || data.mensaje || 'Error en la verificación');
      }

      // Paso 2: Descargar el PDF
      const pdfResponse = await fetch(`${API_BASE_URL}/descarga-segura/descargar/${token}`, {
        method: 'GET',
      });

      if (!pdfResponse.ok) {
        const errorData = await pdfResponse.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Error al descargar el archivo');
      }

      const blob = await pdfResponse.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `historia_clinica_${cedula}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);

      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Error al procesar la solicitud');
    } finally {
      setLoading(false);
    }
  };

  // Pantalla de token inválido
  if (tokenValido === false) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-red-600 to-red-800 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-10 h-10 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Enlace No Disponible</h1>
          <p className="text-gray-600 mb-6">{mensajeToken}</p>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600">
              Solicite un nuevo enlace de descarga a través del sistema INDERHUILA.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Pantalla de carga inicial
  if (tokenValido === null) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-600 to-blue-800 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <Loader className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Verificando enlace...</p>
        </div>
      </div>
    );
  }

  // Pantalla de éxito
  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-600 to-green-800 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">¡Descarga Exitosa!</h1>
          <p className="text-gray-600 mb-6">
            Su historia clínica ha sido descargada correctamente.
          </p>
          <div className="bg-blue-50 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>INDERHUILA</strong><br />
              Instituto Departamental de Recreación y Deportes del Huila
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Pantalla principal de verificación
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-600 to-blue-800 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-10 h-10 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Descarga Segura</h1>
          <p className="text-gray-600">Historia Clínica - INDERHUILA</p>
        </div>

        {/* Formulario */}
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Número de Cédula
            </label>
            <input
              type="text"
              value={cedula}
              onChange={(e) => setCedula(e.target.value.replace(/\D/g, ''))}
              onKeyPress={(e) => e.key === 'Enter' && handleVerificar()}
              placeholder="Ingrese su número de cédula"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
              maxLength={15}
              disabled={loading}
              autoFocus
            />
            <p className="mt-2 text-sm text-gray-500">
              Ingrese la cédula del deportista para verificar su identidad
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          <button
            onClick={handleVerificar}
            disabled={loading || !cedula.trim()}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
          >
            {loading ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                Verificando...
              </>
            ) : (
              <>
                <Download className="w-5 h-5" />
                Verificar y Descargar
              </>
            )}
          </button>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-gray-200 text-center">
          <p className="text-xs text-gray-500">
            Este enlace es válido por 2 horas y tiene un máximo de 3 intentos de verificación.
          </p>
          <p className="text-xs text-gray-400 mt-2">
            INDERHUILA - Sistema de Historias Clínicas Deportivas
          </p>
        </div>
      </div>
    </div>
  );
}