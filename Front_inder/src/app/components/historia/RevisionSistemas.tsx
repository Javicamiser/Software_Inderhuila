import { HistoriaClinicaData } from "../HistoriaClinica";
import { ChevronRight, ChevronLeft, Heart, Wind, Utensils, Brain, Bone, Droplet, Activity, User2 } from "lucide-react";

type Props = {
  data: HistoriaClinicaData;
  updateData: (data: Partial<HistoriaClinicaData>) => void;
  onNext: () => void;
  onPrevious: () => void;
  onCancel?: () => void;
};

type Sistema = {
  id: keyof HistoriaClinicaData["revisionSistemas"];
  nombre: string;
  icon: any;
  color: string;
  bgColor: string;
  borderColor: string;
};

const sistemas: Sistema[] = [
  {
    id: "cardiovascular",
    nombre: "Cardiovascular",
    icon: Heart,
    color: "text-red-600",
    bgColor: "bg-red-50",
    borderColor: "border-red-500",
  },
  {
    id: "respiratorio",
    nombre: "Respiratorio",
    icon: Wind,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-500",
  },
  {
    id: "digestivo",
    nombre: "Digestivo",
    icon: Utensils,
    color: "text-amber-600",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-500",
  },
  {
    id: "neurologico",
    nombre: "Neurológico",
    icon: Brain,
    color: "text-purple-600",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-500",
  },
  {
    id: "musculoesqueletico",
    nombre: "Musculoesquelético",
    icon: Bone,
    color: "text-gray-700",
    bgColor: "bg-gray-50",
    borderColor: "border-gray-500",
  },
  {
    id: "genitourinario",
    nombre: "Genitourinario",
    icon: Droplet,
    color: "text-cyan-600",
    bgColor: "bg-cyan-50",
    borderColor: "border-cyan-500",
  },
  {
    id: "endocrino",
    nombre: "Endocrino",
    icon: Activity,
    color: "text-green-600",
    bgColor: "bg-green-50",
    borderColor: "border-green-500",
  },
  {
    id: "pielFaneras",
    nombre: "Piel y Faneras",
    icon: User2,
    color: "text-orange-600",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-500",
  },
];

export function RevisionSistemas({ data, updateData, onNext, onPrevious, onCancel }: Props) {
  const handleEstadoChange = (sistemaId: keyof HistoriaClinicaData["revisionSistemas"], estado: "normal" | "anormal") => {
    const newRevision = { ...data.revisionSistemas };
    newRevision[sistemaId] = {
      ...newRevision[sistemaId],
      estado,
      observaciones: estado === "normal" ? "" : newRevision[sistemaId].observaciones,
    };
    updateData({ revisionSistemas: newRevision });
  };

  const handleObservacionesChange = (sistemaId: keyof HistoriaClinicaData["revisionSistemas"], observaciones: string) => {
    const newRevision = { ...data.revisionSistemas };
    newRevision[sistemaId] = {
      ...newRevision[sistemaId],
      observaciones,
    };
    updateData({ revisionSistemas: newRevision });
  };

  const handleNext = () => {
    // Validar que todos los sistemas hayan sido evaluados
    const sistemasNoEvaluados = sistemas.filter(
      (sistema) => !data.revisionSistemas[sistema.id].estado
    );

    if (sistemasNoEvaluados.length > 0) {
      alert(
        `Por favor evalúe todos los sistemas. Faltan: ${sistemasNoEvaluados
          .map((s) => s.nombre)
          .join(", ")}`
      );
      return;
    }

    // Validar que los sistemas marcados como anormales tengan observaciones
    const sistemasAnormalesSinObservaciones = sistemas.filter(
      (sistema) =>
        data.revisionSistemas[sistema.id].estado === "anormal" &&
        !data.revisionSistemas[sistema.id].observaciones.trim()
    );

    if (sistemasAnormalesSinObservaciones.length > 0) {
      alert(
        `Por favor agregue observaciones para los sistemas marcados como anormales: ${sistemasAnormalesSinObservaciones
          .map((s) => s.nombre)
          .join(", ")}`
      );
      return;
    }

    onNext();
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-[#C84F3B]/10 to-[#1F4788]/10 p-4 rounded-lg border-l-4 border-[#C84F3B]">
        <p className="text-sm text-gray-700">
          <span className="font-semibold">Instrucciones:</span> Revise cada sistema y marque si está <strong>Normal</strong> o <strong>Anormal</strong>.
          Si marca como anormal, debe agregar observaciones detalladas.
        </p>
      </div>

      {/* Grid de sistemas */}
      <div className="space-y-4">
        {sistemas.map((sistema) => {
          const Icon = sistema.icon;
          const estadoActual = data.revisionSistemas[sistema.id].estado;
          const observaciones = data.revisionSistemas[sistema.id].observaciones;

          return (
            <div
              key={sistema.id}
              className={`${sistema.bgColor} p-5 rounded-lg border-l-4 ${sistema.borderColor}`}
            >
              <div className="flex items-start gap-4">
                {/* Icono y nombre del sistema */}
                <div className="flex items-center gap-3 min-w-[200px]">
                  <Icon className={`w-6 h-6 ${sistema.color}`} />
                  <h3 className={`font-semibold ${sistema.color}`}>
                    {sistema.nombre}
                  </h3>
                </div>

                {/* Opciones Normal/Anormal */}
                <div className="flex-1">
                  <div className="flex gap-6 mb-3">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name={`sistema-${sistema.id}`}
                        checked={estadoActual === "normal"}
                        onChange={() => handleEstadoChange(sistema.id, "normal")}
                        className="w-4 h-4 text-green-600 focus:ring-2 focus:ring-green-500"
                      />
                      <span className="text-gray-700 font-medium">Normal</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name={`sistema-${sistema.id}`}
                        checked={estadoActual === "anormal"}
                        onChange={() => handleEstadoChange(sistema.id, "anormal")}
                        className="w-4 h-4 text-red-600 focus:ring-2 focus:ring-red-500"
                      />
                      <span className="text-gray-700 font-medium">Anormal</span>
                    </label>
                  </div>

                  {/* Campo de observaciones (visible solo si es anormal) */}
                  {estadoActual === "anormal" && (
                    <div className="mt-3">
                      <label className="block mb-1 text-sm font-medium text-gray-700">
                        Observaciones <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        value={observaciones}
                        onChange={(e) => handleObservacionesChange(sistema.id, e.target.value)}
                        rows={2}
                        placeholder={`Describa los hallazgos anormales del sistema ${sistema.nombre.toLowerCase()}...`}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#C84F3B] resize-none bg-white"
                      />
                    </div>
                  )}

                  {/* Mensaje informativo si está marcado como normal */}
                  {estadoActual === "normal" && (
                    <p className="text-xs text-green-700 mt-1">
                      ✓ Sistema evaluado sin hallazgos patológicos
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Contador de sistemas evaluados */}
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">
            Sistemas evaluados: 
            <span className="font-semibold ml-2">
              {sistemas.filter((s) => data.revisionSistemas[s.id].estado).length} / {sistemas.length}
            </span>
          </span>
          {sistemas.filter((s) => data.revisionSistemas[s.id].estado).length === sistemas.length && (
            <span className="text-sm text-green-600 font-semibold">
              ✓ Revisión completa
            </span>
          )}
        </div>
      </div>

      {/* Botones de navegación */}
      <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200">
        <button
          onClick={onPrevious}
          className="flex-1 flex items-center justify-center gap-2 bg-gray-300 text-gray-700 py-3 px-6 rounded-md hover:bg-gray-400 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
          Anterior
        </button>
        <button
          onClick={handleNext}
          className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 transition-colors"
        >
          Siguiente
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
