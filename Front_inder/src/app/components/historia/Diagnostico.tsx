import { HistoriaClinicaData } from "../HistoriaClinica";
import { ChevronLeft, ChevronRight, X, BarChart3, Lightbulb, ClipboardList, AlertCircle, CheckCircle } from "lucide-react";
import { useState } from "react";
import { buscarEnfermedadPorCodigo, buscarCodigosPorNombre } from "./cie11Database";

type Diagnostico = {
  codigo: string;
  nombre: string;
  observaciones: string;
};

type Props = {
  data: HistoriaClinicaData;
  updateData: (data: Partial<HistoriaClinicaData>) => void;
  onNext: () => void;
  onPrevious: () => void;
  onCancel?: () => void;
};

export function Diagnostico({ data, updateData, onNext, onPrevious, onCancel }: Props) {
  const [diagnosticos, setDiagnosticos] = useState<Diagnostico[]>(data.diagnosticos || []);
  const [nuevoDiagnostico, setNuevoDiagnostico] = useState({
    codigo: "",
    nombre: "",
    observaciones: "",
  });
  const [sugerenciasCIE, setSugerenciasCIE] = useState<Array<{ codigo: string; nombre: string }>>([]);
  const [mostrarSugerencias, setMostrarSugerencias] = useState(false);
  const [errorCodigo, setErrorCodigo] = useState("");

  const handleCodigoChange = (codigo: string) => {
    const codigoUpper = codigo.toUpperCase();
    setNuevoDiagnostico({
      ...nuevoDiagnostico,
      codigo: codigoUpper,
    });
    setErrorCodigo("");

    if (codigoUpper.trim()) {
      const enfermedad = buscarEnfermedadPorCodigo(codigoUpper);
      if (enfermedad) {
        setNuevoDiagnostico((prev) => ({
          ...prev,
          nombre: enfermedad,
        }));
        setErrorCodigo("");
      } else {
        setErrorCodigo("Código CIE-11 no encontrado");
        setNuevoDiagnostico((prev) => ({
          ...prev,
          nombre: "",
        }));
      }
    } else {
      setNuevoDiagnostico((prev) => ({
        ...prev,
        nombre: "",
      }));
    }
  };

  const handleNombreChange = (nombre: string) => {
    setNuevoDiagnostico({
      ...nuevoDiagnostico,
      nombre: nombre,
    });
    setErrorCodigo("");

    if (nombre.trim() && nombre.length >= 3) {
      const resultados = buscarCodigosPorNombre(nombre);
      if (resultados.length > 0) {
        setSugerenciasCIE(resultados);
        setMostrarSugerencias(true);
      } else {
        setNuevoDiagnostico((prev) => ({
          ...prev,
          codigo: "",
        }));
        setSugerenciasCIE([]);
        setMostrarSugerencias(false);
      }
    } else {
      setSugerenciasCIE([]);
      setMostrarSugerencias(false);
    }
  };

  const seleccionarCIE = (item: { codigo: string; nombre: string }) => {
    setNuevoDiagnostico({
      ...nuevoDiagnostico,
      codigo: item.codigo,
      nombre: item.nombre,
    });
    setSugerenciasCIE([]);
    setMostrarSugerencias(false);
    setErrorCodigo("");
  };

  const agregarDiagnostico = () => {
    if (!nuevoDiagnostico.codigo.trim()) {
      alert("Ingrese un código CIE-11");
      return;
    }
    if (!nuevoDiagnostico.nombre.trim()) {
      alert("Primero busque el código CIE-11 para verificar la enfermedad");
      return;
    }
    const actualizado = [...diagnosticos, nuevoDiagnostico];
    setDiagnosticos(actualizado);
    updateData({ diagnosticos: actualizado });
    setNuevoDiagnostico({ codigo: "", nombre: "", observaciones: "" });
    setSugerenciasCIE([]);
    setMostrarSugerencias(false);
  };

  const eliminarDiagnostico = (idx: number) => {
    const actualizado = diagnosticos.filter((_, i) => i !== idx);
    setDiagnosticos(actualizado);
    updateData({ diagnosticos: actualizado });
  };

  const handleNext = () => {
    if (!data.analisisObjetivoDiagnostico?.trim()) {
      alert("Por favor complete el Análisis Objetivo");
      return;
    }
    if (!data.impresionDiagnostica?.trim()) {
      alert("Por favor complete la Impresión Diagnóstica");
      return;
    }
    if (diagnosticos.length === 0) {
      alert("Por favor agregue al menos un diagnóstico CIE-11");
      return;
    }
    onNext();
  };

  const completitud = [
    data.analisisObjetivoDiagnostico?.trim(),
    data.impresionDiagnostica?.trim(),
    diagnosticos.length > 0 ? 'diagnosticos' : ''
  ].filter(Boolean).length;

  return (
    <div className="space-y-8">
      {/* RECOMENDACIONES */}
      <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-xl">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-bold text-blue-900 mb-3">Recomendaciones para el diagnóstico:</h3>
            <ul className="space-y-2 text-sm text-blue-800">
              <li className="flex gap-2">
                <span className="font-bold">•</span>
                <span>Sea claro y específico en sus observaciones</span>
              </li>
              <li className="flex gap-2">
                <span className="font-bold">•</span>
                <span>Indique código diagnóstico CIE-11 para cada diagnóstico</span>
              </li>
              <li className="flex gap-2">
                <span className="font-bold">•</span>
                <span>Mencione limitaciones o contraindicaciones para la práctica deportiva</span>
              </li>
              <li className="flex gap-2">
                <span className="font-bold">•</span>
                <span>Indique nivel de urgencia si requiere atención especializada</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* ANÁLISIS OBJETIVO */}
      <div className="bg-gradient-to-r from-purple-50 to-purple-100/50 border-l-4 border-purple-500 p-6 rounded-xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-purple-600 p-2.5 rounded-lg">
            <BarChart3 className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-lg font-bold text-purple-900">Análisis Objetivo</h3>
          <span className="text-red-500 font-bold">*</span>
        </div>

        <textarea
          value={data.analisisObjetivoDiagnostico || ""}
          onChange={(e) =>
            updateData({ analisisObjetivoDiagnostico: e.target.value })
          }
          placeholder="Resumen de hallazgos objetivos encontrados durante la evaluación física, signos vitales, pruebas complementarias..."
          rows={4}
          className="w-full px-4 py-3 border-2 border-purple-300 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 resize-none font-medium"
        />
        <p className="text-xs text-purple-700 mt-2">
          Describa los hallazgos objetivos y medibles encontrados durante la evaluación
        </p>
      </div>

      {/* IMPRESIÓN DIAGNÓSTICA */}
      <div className="bg-gradient-to-r from-amber-50 to-amber-100/50 border-l-4 border-amber-500 p-6 rounded-xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-amber-600 p-2.5 rounded-lg">
            <Lightbulb className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-lg font-bold text-amber-900">Impresión Diagnóstica</h3>
          <span className="text-red-500 font-bold">*</span>
        </div>

        <textarea
          value={data.impresionDiagnostica || ""}
          onChange={(e) =>
            updateData({ impresionDiagnostica: e.target.value })
          }
          placeholder="Interpretación clínica basada en los hallazgos, hipótesis diagnóstica preliminar..."
          rows={4}
          className="w-full px-4 py-3 border-2 border-amber-300 rounded-lg focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200 resize-none font-medium"
        />
        <p className="text-xs text-amber-700 mt-2">
          Escriba la impresión diagnóstica preliminar basada en la evaluación realizada
        </p>
      </div>

      {/* DIAGNÓSTICO CLÍNICO CIE-11 */}
      <div className="bg-gradient-to-r from-cyan-50 to-cyan-100/50 border-l-4 border-cyan-500 p-6 rounded-xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-cyan-600 p-2.5 rounded-lg">
            <ClipboardList className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-lg font-bold text-cyan-900">Diagnóstico Clínico (CIE-11)</h3>
          <span className="text-red-500 font-bold">*</span>
        </div>

        <div className="space-y-5 bg-white p-5 rounded-lg border-2 border-cyan-200">
          {/* Código CIE-11 */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2.5">
              Código CIE-11
            </label>
            <div className="relative">
              <input
                type="text"
                value={nuevoDiagnostico.codigo}
                onChange={(e) => handleCodigoChange(e.target.value)}
                placeholder="Ej. I51, B80D23..."
                className={`w-full px-4 py-2.5 border-2 rounded-lg focus:outline-none focus:ring-2 font-medium ${
                  errorCodigo 
                    ? "border-red-500 focus:ring-red-200" 
                    : "border-gray-300 focus:border-cyan-500 focus:ring-cyan-200"
                }`}
              />
              {errorCodigo && (
                <div className="flex items-center gap-2 mt-2 text-red-600 text-sm bg-red-50 p-2 rounded">
                  <AlertCircle className="w-4 h-4" />
                  <span>{errorCodigo}</span>
                </div>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-2">Buscar por nombre abajo</p>
          </div>

          {/* Nombre del Diagnóstico */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2.5">
              Nombre de la enfermedad / diagnóstico
            </label>
            <div className="relative">
              <input
                type="text"
                value={nuevoDiagnostico.nombre}
                onChange={(e) => handleNombreChange(e.target.value)}
                onFocus={() => nuevoDiagnostico.nombre && mostrarSugerencias && setMostrarSugerencias(true)}
                placeholder="Ej. Hipertensión, Asma, Diabetes..."
                className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 font-medium"
              />
              {mostrarSugerencias && sugerenciasCIE.length > 0 && (
                <div className="absolute top-full left-0 right-0 bg-white border-2 border-cyan-300 rounded-lg mt-2 z-10 max-h-64 overflow-y-auto shadow-xl">
                  {sugerenciasCIE.map((item, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => seleccionarCIE(item)}
                      className="w-full text-left px-4 py-3 hover:bg-cyan-50 text-sm border-b border-gray-100 last:border-b-0 transition-colors font-medium"
                    >
                      <span className="font-mono font-bold text-cyan-700">{item.codigo}</span>
                      <span className="text-gray-800 ml-3">{item.nombre}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Escriba al menos 3 caracteres para buscar diagnósticos
            </p>
          </div>

          {/* Observaciones */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2.5">
              Observaciones adicionales / Especificaciones
            </label>
            <textarea
              value={nuevoDiagnostico.observaciones}
              onChange={(e) =>
                setNuevoDiagnostico({
                  ...nuevoDiagnostico,
                  observaciones: e.target.value,
                })
              }
              placeholder="Detalles adicionales, comorbilidades, especificidad deportiva, pronósticos..."
              rows={3}
              className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 resize-none font-medium"
            />
          </div>

          {/* Botón Agregar */}
          <button
            type="button"
            onClick={agregarDiagnostico}
            className="w-full bg-gradient-to-r from-cyan-600 to-cyan-700 text-white py-3 px-4 rounded-lg hover:from-cyan-700 hover:to-cyan-800 transition-all font-semibold shadow-md hover:shadow-lg"
          >
            Agregar Diagnóstico
          </button>
        </div>
      </div>

      {/* LISTA DE DIAGNÓSTICOS */}
      {diagnosticos.length > 0 ? (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <h4 className="font-bold text-gray-800 text-lg">
              Diagnósticos agregados ({diagnosticos.length})
            </h4>
          </div>
          <div className="space-y-3">
            {diagnosticos.map((diag, idx) => (
              <div
                key={idx}
                className="bg-gradient-to-r from-green-50 to-green-100/50 border-2 border-green-200 rounded-lg p-4 hover:border-green-300 transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="inline-block bg-green-600 text-white px-3 py-1 rounded-full text-xs font-bold">
                        {diag.codigo}
                      </span>
                      <p className="font-semibold text-green-900 text-sm">
                        {diag.nombre}
                      </p>
                    </div>
                    {diag.observaciones && (
                      <p className="text-sm text-green-800 bg-white bg-opacity-50 px-3 py-2 rounded mt-2">
                        {diag.observaciones}
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => eliminarDiagnostico(idx)}
                    className="ml-4 p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title="Eliminar diagnóstico"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-8 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300">
          <p className="text-gray-500 font-medium">No se han registrado diagnósticos clínicos</p>
        </div>
      )}

      {/* INDICADOR DE COMPLETITUD */}
      <div className="bg-gradient-to-r from-green-50 to-green-100/50 border-2 border-green-300 rounded-lg p-5">
        <div className="flex items-center gap-3">
          <CheckCircle className="w-6 h-6 text-green-600" />
          <div>
            <p className="text-sm font-semibold text-green-900">
              Paso completado:
              <span className="ml-2 bg-green-600 text-white px-3 py-1 rounded-full text-xs font-bold">
                {completitud} / 3
              </span>
            </p>
            <p className="text-xs text-green-700 mt-1">
              {completitud === 3 ? '✓ Todos los campos completados' : 'Completa los campos requeridos para continuar'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}