import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { Shield, Download, AlertTriangle, Clock, CheckCircle, XCircle, Loader } from 'lucide-react';

// URL base de la API
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

interface TokenInfo {
  success: boolean;
  estado: string;
  deportista_nombre: string;
  intentos_restantes: number;
  minutos_restantes: number;
  mensaje: string;
}

export function DescargarHistoria() {
  const { token } = useParams<{ token: string }>();
  const [tokenInfo, setTokenInfo] = useState<TokenInfo | null>(null);
  const [cedula, setCedula] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verificado, setVerificado] = useState(false);
  const [intentosRestantes, setIntentosRestantes] = useState(3);

  useEffect(() => {
    if (token) {
      verificarToken();
    }
  }, [token]);

  const verificarToken = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_BASE_URL}/descarga-segura/info/${token}`);
      const data = await response.json();
      
      if (response.ok && data.success) {
        setTokenInfo(data);
        setIntentosRestantes(data.intentos_restantes);
      } else {
        setError(data.mensaje || 'Enlace no válido');
      }
    } catch (err) {
      console.error('Error verificando token:', err);
      setError('Error al verificar el enlace');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerificarCedula = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!cedula.trim()) {
      toast.error('Ingresa tu número de cédula');
      return;
    }

    try {
      setIsVerifying(true);
      
      const response = await fetch(`${API_BASE_URL}/descarga-segura/verificar/${token}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ cedula: cedula.trim() }),
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        setVerificado(true);
        toast.success('Verificación exitosa');
        // Descargar automáticamente
        handleDescargar();
      } else {
        if (data.intentos_restantes !== undefined) {
          setIntentosRestantes(data.intentos_restantes);
        }
        
        if (response.status === 403) {
          setError('Enlace bloqueado por múltiples intentos fallidos');
        } else {
          toast.error(data.mensaje || 'Cédula incorrecta');
        }
      }
    } catch (err) {
      console.error('Error verificando cédula:', err);
      toast.error('Error al verificar');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleDescargar = async () => {
    try {
      setIsDownloading(true);
      
      const response = await fetch(
        `${API_BASE_URL}/descarga-segura/descargar-pdf/${token}?cedula=${encodeURIComponent(cedula)}`
      );
      
      if (!response.ok) {
        throw new Error('Error al descargar');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      
      // Obtener nombre del archivo del header
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = 'historia_clinica.pdf';
      if (contentDisposition) {
        const match = contentDisposition.match(/filename=(.+)/);
        if (match) {
          filename = match[1].replace(/"/g, '');
        }
      }
      
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      toast.success('Historia clínica descargada correctamente');
    } catch (err) {
      console.error('Error descargando:', err);
      toast.error('Error al descargar el archivo');
    } finally {
      setIsDownloading(false);
    }
  };

  // Pantalla de carga
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <Loader className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Verificando enlace...</p>
        </div>
      </div>
    );
  }

  // Pantalla de error
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircle className="w-10 h-10 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Enlace No Disponible</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-500">
            <p>Si necesitas acceder a tu historia clínica, contacta a INDERHUILA para solicitar un nuevo enlace.</p>
          </div>
        </div>
      </div>
    );
  }

  // Pantalla de descarga exitosa
  if (verificado) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">¡Verificación Exitosa!</h1>
          <p className="text-gray-600 mb-6">Tu historia clínica se está descargando...</p>
          
          {isDownloading ? (
            <div className="flex items-center justify-center gap-2 text-blue-600">
              <Loader className="w-5 h-5 animate-spin" />
              <span>Descargando...</span>
            </div>
          ) : (
            <button
              onClick={handleDescargar}
              className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
            >
              <Download className="w-5 h-5" />
              Descargar nuevamente
            </button>
          )}
          
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              Este enlace ya no puede ser utilizado nuevamente.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Pantalla de verificación
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-10 h-10 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Descarga Segura
          </h1>
          <p className="text-gray-600">Historia Clínica - INDERHUILA</p>
        </div>

        {/* Info del deportista */}
        {tokenInfo && (
          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-800">
              <span className="font-semibold">Paciente:</span> {tokenInfo.deportista_nombre}
            </p>
            <div className="flex items-center gap-2 mt-2 text-sm text-blue-600">
              <Clock className="w-4 h-4" />
              <span>Expira en {tokenInfo.minutos_restantes} minutos</span>
            </div>
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleVerificarCedula}>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Número de Cédula
            </label>
            <input
              type="text"
              value={cedula}
              onChange={(e) => setCedula(e.target.value.replace(/\D/g, ''))}
              placeholder="Ingresa tu número de cédula"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg text-center tracking-wider"
              maxLength={15}
              autoFocus
            />
            <p className="text-xs text-gray-500 mt-2 text-center">
              Ingresa tu cédula para verificar tu identidad
            </p>
          </div>

          {/* Advertencia de intentos */}
          {intentosRestantes < 3 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4 flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-yellow-800 font-medium">
                  {intentosRestantes === 1 ? '¡Último intento!' : `Te quedan ${intentosRestantes} intentos`}
                </p>
                <p className="text-xs text-yellow-600">
                  El enlace se bloqueará después de 3 intentos fallidos
                </p>
              </div>
            </div>
          )}

          {/* Botón de verificar */}
          <button
            type="submit"
            disabled={isVerifying || !cedula.trim()}
            className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isVerifying ? (
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
        </form>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-gray-200 text-center">
          <p className="text-xs text-gray-500">
            🔒 Conexión segura · Los datos son verificados de forma privada
          </p>
          <p className="text-xs text-gray-400 mt-2">
            INDERHUILA - Instituto Departamental de Recreación y Deportes del Huila
          </p>
        </div>
      </div>
    </div>
  );
}
