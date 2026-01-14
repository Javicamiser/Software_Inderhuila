import { HistoriaClinicaData } from "../HistoriaClinica";
import { ChevronRight, X } from "lucide-react";

type Props = {
  data: HistoriaClinicaData;
  updateData: (data: Partial<HistoriaClinicaData>) => void;
  onNext: () => void;
  onCancel: () => void;
};

export function Evaluacion({ data, updateData, onNext, onCancel }: Props) {
  const handleNext = () => {
    // Validar que los campos obligatorios estén llenos
    if (!data.motivoConsulta || data.motivoConsulta.trim() === "") {
      alert("Por favor ingrese el motivo de consulta");
      return;
    }
    if (!data.enfermedadActual || data.enfermedadActual.trim() === "") {
      alert("Por favor ingrese la enfermedad actual");
      return;
    }
    onNext();
  };

  return (
    <div className="space-y-6">
      {/* Motivo de consulta */}
      <div>
        <label className="block mb-2 font-medium text-gray-800">
          Motivo de consulta <span className="text-red-500">*</span>
        </label>
        <textarea
          value={data.motivoConsulta}
          onChange={(e) => updateData({ motivoConsulta: e.target.value })}
          rows={4}
          placeholder="Describa el motivo principal por el cual el deportista acude a consulta..."
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#C84F3B] focus:border-transparent resize-none"
        />
        <p className="mt-1 text-sm text-gray-500">
          Ej: Dolor en rodilla derecha, control de lesión previa, evaluación precompetitiva, etc.
        </p>
      </div>

      {/* Enfermedad actual */}
      <div>
        <label className="block mb-2 font-medium text-gray-800">
          Enfermedad actual / Anamnesis <span className="text-red-500">*</span>
        </label>
        <textarea
          value={data.enfermedadActual}
          onChange={(e) => updateData({ enfermedadActual: e.target.value })}
          rows={6}
          placeholder="Describa detalladamente la historia de la enfermedad o condición actual: inicio de síntomas, evolución, características, factores que mejoran o empeoran, tratamientos previos..."
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1F4788] focus:border-transparent resize-none"
        />
        <p className="mt-1 text-sm text-gray-500">
          Incluya: tiempo de evolución, intensidad de síntomas, relación con la actividad deportiva, etc.
        </p>
      </div>

      {/* Botones de navegación */}
      <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
        <button
          type="button"
          onClick={handleNext}
          className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 transition-colors"
        >
          Continuar
          <ChevronRight className="w-5 h-5" />
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex items-center justify-center gap-2 bg-gray-300 text-gray-700 py-3 px-6 rounded-md hover:bg-gray-400 transition-colors"
        >
          <X className="w-5 h-5" />
          Cancelar
        </button>
      </div>
    </div>
  );
}
