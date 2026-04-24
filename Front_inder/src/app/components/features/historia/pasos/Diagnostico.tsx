import { HistoriaClinicaData } from "../HistoriaClinica";
import {
  ChevronLeft,
  ChevronRight,
  X,
  AlertCircle,
  BarChart2,
  Lightbulb,
  ClipboardList,
  Plus,
  Search,
} from "lucide-react";
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

  // ✅ Función eliminar correctamente definida
  const eliminarDiagnostico = (idx: number) => {
    const actualizado = diagnosticos.filter((_, i) => i !== idx);
    setDiagnosticos(actualizado);
    updateData({ diagnosticos: actualizado });
  };

  const handleCodigoChange = (codigo: string) => {
    const codigoUpper = codigo.toUpperCase();
    setNuevoDiagnostico({ ...nuevoDiagnostico, codigo: codigoUpper });
    setErrorCodigo("");

    if (codigoUpper.trim()) {
      const enfermedad = buscarEnfermedadPorCodigo(codigoUpper);
      if (enfermedad) {
        setNuevoDiagnostico((prev) => ({ ...prev, nombre: enfermedad }));
      } else {
        setErrorCodigo("Código CIE-11 no encontrado");
        setNuevoDiagnostico((prev) => ({ ...prev, nombre: "" }));
      }
    } else {
      setNuevoDiagnostico((prev) => ({ ...prev, nombre: "" }));
    }
  };

  const handleNombreChange = (nombre: string) => {
    setNuevoDiagnostico({ ...nuevoDiagnostico, nombre });
    setErrorCodigo("");

    if (nombre.trim() && nombre.length >= 3) {
      const resultados = buscarCodigosPorNombre(nombre);
      if (resultados.length > 0) {
        setSugerenciasCIE(resultados);
        setMostrarSugerencias(true);
      } else {
        setNuevoDiagnostico((prev) => ({ ...prev, codigo: "" }));
        setSugerenciasCIE([]);
        setMostrarSugerencias(false);
      }
    } else {
      setSugerenciasCIE([]);
      setMostrarSugerencias(false);
    }
  };

  const seleccionarCIE = (item: { codigo: string; nombre: string }) => {
    setNuevoDiagnostico({ ...nuevoDiagnostico, codigo: item.codigo, nombre: item.nombre });
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

  return (
    <div className="space-y-6">

      {/* Recomendaciones */}
      <div className="bg-gray-100 border border-gray-300 rounded-md p-4">
        <div className="flex items-start gap-2 mb-2">
          <AlertCircle className="w-4 h-4 text-gray-600 flex-shrink-0 mt-0.5" />
          <h3 className="text-sm font-medium text-gray-800">
            Recomendaciones para el diagnóstico:
          </h3>
        </div>
        <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside ml-6">
          <li>Sea claro y específico en sus observaciones</li>
          <li>Indique código diagnóstico CIE 11 para cada diagnóstico</li>
          <li>Mencione limitaciones o contraindicaciones para la práctica deportiva</li>
          <li>Indique nivel de urgencia si requiere atención especializada</li>
        </ul>
      </div>

      {/* Análisis Objetivo */}
      <div>
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
          <BarChart2 className="w-4 h-4 text-purple-600" />
          Análisis Objetivo
        </label>
        <textarea
          value={data.analisisObjetivoDiagnostico || ""}
          onChange={(e) => updateData({ analisisObjetivoDiagnostico: e.target.value })}
          placeholder="Resumen de hallazgos objetivos encontrados durante la evaluación física, signos vitales, pruebas complementarias..."
          rows={4}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
        <p className="text-xs text-gray-500 mt-1">
          Describa los hallazgos objetivos y medibles encontrados durante la evaluación
        </p>
      </div>

      {/* Impresión Diagnóstica */}
      <div>
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
          <Lightbulb className="w-4 h-4 text-yellow-500" />
          Impresión Diagnóstica
        </label>
        <textarea
          value={data.impresionDiagnostica || ""}
          onChange={(e) => updateData({ impresionDiagnostica: e.target.value })}
          placeholder="Interpretación clínica basada en los hallazgos, hipótesis diagnóstica preliminar..."
          rows={4}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
        <p className="text-xs text-gray-500 mt-1">
          Escriba la impresión diagnóstica preliminar basada en la evaluación realizada
        </p>
      </div>

      {/* Diagnóstico Clínico CIE-11 */}
      <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
        <div className="flex items-center gap-2 mb-4">
          <ClipboardList className="w-4 h-4 text-gray-700" />
          <h3 className="text-sm font-semibold text-gray-800">
            Diagnóstico Clínico (CIE-11) <span className="text-red-500">*</span>
          </h3>
        </div>

        <div className="space-y-4">
          {/* Código CIE-11 */}
          <div>
            <label className="block text-sm text-gray-700 mb-2">Código CIE-11</label>
            <input
              type="text"
              value={nuevoDiagnostico.codigo}
              onChange={(e) => handleCodigoChange(e.target.value)}
              placeholder="Ej. I51, B80D23..."
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errorCodigo ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errorCodigo && (
              <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {errorCodigo}
              </p>
            )}
            <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
              <Search className="w-3 h-3" /> Buscar por nombre abajo
            </p>
          </div>

          {/* Nombre del Diagnóstico */}
          <div>
            <label className="block text-sm text-gray-700 mb-2">
              Nombre de la enfermedad / diagnóstico
            </label>
            <div className="relative">
              <input
                type="text"
                value={nuevoDiagnostico.nombre}
                onChange={(e) => handleNombreChange(e.target.value)}
                onFocus={() =>
                  nuevoDiagnostico.nombre && mostrarSugerencias && setMostrarSugerencias(true)
                }
                placeholder="Ej. Hipertensión, Asma, Diabetes..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {mostrarSugerencias && sugerenciasCIE.length > 0 && (
                <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-md mt-1 z-10 max-h-48 overflow-y-auto shadow-lg">
                  {sugerenciasCIE.map((item, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => seleccionarCIE(item)}
                      className="w-full text-left px-4 py-2 hover:bg-blue-100 text-sm border-b border-gray-100 last:border-b-0"
                    >
                      <strong>{item.codigo}</strong> - {item.nombre}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Escriba al menos 3 caracteres para buscar diagnósticos
            </p>
          </div>

          {/* Observaciones */}
          <div>
            <label className="block text-sm text-gray-700 mb-2">
              Observaciones adicionales / Especificaciones
            </label>
            <textarea
              value={nuevoDiagnostico.observaciones}
              onChange={(e) =>
                setNuevoDiagnostico({ ...nuevoDiagnostico, observaciones: e.target.value })
              }
              placeholder="Detalles adicionales, comorbilidades, especificidad deportiva, pronósticos..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          {/* Botón Agregar */}
          <button
            type="button"
            onClick={agregarDiagnostico}
            className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors font-medium flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Agregar Diagnóstico
          </button>
        </div>
      </div>

      {/* Lista de Diagnósticos */}
      {diagnosticos.length > 0 ? (
        <div className="space-y-3">
          {diagnosticos.map((diag, idx) => (
            <div
              key={idx}
              className="bg-white border border-gray-300 rounded-md p-4 flex justify-between items-start"
            >
              <div className="flex-1">
                <p className="font-semibold text-gray-800">
                  {diag.codigo} - {diag.nombre}
                </p>
                {diag.observaciones && (
                  <p className="text-sm text-gray-600 mt-1">{diag.observaciones}</p>
                )}
              </div>
              <button
                type="button"
                onClick={() => eliminarDiagnostico(idx)}
                className="ml-4 text-red-500 hover:text-red-700 hover:bg-red-50 p-1 rounded transition-colors"
                title="Eliminar diagnóstico"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          No se han registrado diagnósticos clínicos
        </div>
      )}

    </div>
  );
}