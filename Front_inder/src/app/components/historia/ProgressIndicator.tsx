import { Check } from "lucide-react";

type ProgressIndicatorProps = {
  currentStep: number;
  totalSteps: number;
};

const stepLabels = [
  "Evaluación",
  "Antecedentes Médicos",
  "Revisión por Sistemas",
  "Exploración Física",
  "Pruebas Complementarias",
  "Diagnóstico",
  "Plan de Tratamiento",
];

export function ProgressIndicator({ currentStep, totalSteps }: ProgressIndicatorProps) {
  return (
    <div className="mb-8">
      {/* Indicador textual */}
      <div className="text-center mb-6">
        <p className="text-sm text-gray-500">
          Paso {currentStep} de {totalSteps}
        </p>
        <h2 className="text-gray-800 mt-1">{stepLabels[currentStep - 1]}</h2>
      </div>

      {/* Barra de progreso visual */}
      <div className="flex items-center justify-between mb-2">
        {Array.from({ length: totalSteps }).map((_, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber < currentStep;
          const isCurrent = stepNumber === currentStep;

          return (
            <div key={stepNumber} className="flex items-center flex-1">
              {/* Círculo del paso */}
              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                    isCompleted
                      ? "bg-green-500 text-white"
                      : isCurrent
                      ? "bg-blue-600 text-white ring-4 ring-blue-200"
                      : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <span className="font-semibold">{stepNumber}</span>
                  )}
                </div>
                <span
                  className={`text-xs mt-2 hidden md:block text-center max-w-[80px] ${
                    isCurrent ? "text-blue-600 font-semibold" : "text-gray-500"
                  }`}
                >
                  {stepLabels[index].split(" ")[0]}
                </span>
              </div>

              {/* Línea conectora */}
              {stepNumber < totalSteps && (
                <div
                  className={`h-1 flex-1 mx-2 transition-all ${
                    isCompleted ? "bg-green-500" : "bg-gray-200"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}