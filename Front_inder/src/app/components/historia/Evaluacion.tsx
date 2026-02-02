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

      {/* Indicador de completitud */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          ✓ Campos completados: 
          <span className="font-semibold ml-2">
            {[data.motivoConsulta?.trim(), data.enfermedadActual?.trim()].filter(Boolean).length} / 2
          </span>
        </p>
      </div>

      {/* Información útil */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <p className="text-sm text-amber-800">
          💡 <strong>Nota:</strong> Puede guardar su progreso en cualquier momento y continuar después. Los datos se guardan automáticamente.
        </p>
      </div>
    </div>
  );
}