import { HistoriaClinicaData } from "../HistoriaClinica";
import { ChevronLeft, Check, X, Printer, Trash2 } from "lucide-react";
import { useState } from "react";

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
};

const especialistas = [
  "Psicólogo/a Deportivo",
  "Médico Fisiatra",
  "Nutricionista Deportivo",
  "Fisioterapeuta",
  "Cardiólogo",
  "Médico Ortopedista"
];

export function PlanTratamiento({
  data,
  updateData,
  onPrevious,
  onSave,
  onCancel,
  onPrint,
}: Props) {
  const [interconsultas, setInterconsultas] = useState<Interconsulta[]>(data.remisionesEspecialistas?.filter((r) => r.prioridad === "Normal") || []);
  const [remisiones, setRemisiones] = useState<Remision[]>(data.remisionesEspecialistas?.filter((r) => r.prioridad === "Urgente") || []);
  
  const [nuevaInterconsulta, setNuevaInterconsulta] = useState({ especialista: "", motivo: "" });
  const [nuevaRemision, setNuevaRemision] = useState({ especialista: "", motivo: "", prioridad: "Urgente" as "Normal" | "Urgente", fechaRemision: new Date().toISOString().split('T')[0] });

  const agregarInterconsulta = () => {
    if (!nuevaInterconsulta.especialista || !nuevaInterconsulta.motivo) {
      alert("Complete todos los campos de interconsulta");
      return;
    }
    const actualizado = [...interconsultas, nuevaInterconsulta];
    setInterconsultas(actualizado);
    setNuevaInterconsulta({ especialista: "", motivo: "" });
  };

  const eliminarInterconsulta = (index: number) => {
    setInterconsultas(interconsultas.filter((_, i) => i !== index));
  };

  const agregarRemision = () => {
    if (!nuevaRemision.especialista || !nuevaRemision.motivo) {
      alert("Complete todos los campos de remisión");
      return;
    }
    const actualizado = [...remisiones, nuevaRemision];
    setRemisiones(actualizado);
    setNuevaRemision({ especialista: "", motivo: "", prioridad: "Urgente", fechaRemision: new Date().toISOString().split('T')[0] });
  };

  const eliminarRemision = (index: number) => {
    setRemisiones(remisiones.filter((_, i) => i !== index));
  };

  // Sincronizar con datos globales
  const syncRemisiones = () => {
    const todas = [
      ...interconsultas.map((i) => ({ ...i, prioridad: "Normal" as const, fechaRemision: new Date().toISOString().split('T')[0] })),
      ...remisiones,
    ];
    updateData({ remisionesEspecialistas: todas });
  };

  return (
    <div className="space-y-6">
      {/* Indicaciones médicas */}
      <div>
        <label className="block text-sm font-medium text-gray-800 mb-2">
          📋 Indicaciones médicas <span className="text-red-500">*</span>
        </label>
        <textarea
          value={data.indicacionesMedicas}
          onChange={(e) => updateData({ indicacionesMedicas: e.target.value })}
          rows={5}
          placeholder="Medicamentos, terapias, restricciones, cuidados especiales..."
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
        />
      </div>

      {/* Recomendaciones */}
      <div>
        <label className="block text-sm font-medium text-gray-800 mb-2">
          📝 Recomendaciones <span className="text-red-500">*</span>
        </label>
        <textarea
          value={data.recomendacionesEntrenamiento}
          onChange={(e) => updateData({ recomendacionesEntrenamiento: e.target.value })}
          rows={5}
          placeholder="Intensidad de entrenamiento, ejercicios recomendados, ejercicios contraindicados, precauciones..."
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
        />
      </div>

      {/* Plan de seguimiento */}
      <div>
        <label className="block text-sm font-medium text-gray-800 mb-2">
          📅 Plan de seguimiento / Citas
        </label>
        <textarea
          value={data.planSeguimiento}
          onChange={(e) => updateData({ planSeguimiento: e.target.value })}
          rows={5}
          placeholder="Fechas de próximas citas, controles periódicos, reevaluaciones, especialistas a consultar..."
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
        />
      </div>

      {/* Interconsultas con Especialistas */}
      <div className="bg-red-50 border border-red-200 rounded-md p-4 space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-red-900 mb-2 flex items-center gap-2">
            👥 Interconsultas con Especialistas
          </h3>
          <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mb-3">
            <p className="text-xs text-blue-700">
              ℹ️ <strong>Funcionalidad con backend:</strong> Las interconsultas registradas se enviarán automáticamente a la secretaría para agendar la cita y al especialista seleccionado para que este informado.
            </p>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-sm text-gray-700 mb-2">
                Especialista <span className="text-red-500">*</span>
              </label>
              <select
                value={nuevaInterconsulta.especialista}
                onChange={(e) =>
                  setNuevaInterconsulta({ ...nuevaInterconsulta, especialista: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="">Seleccione un especialista...</option>
                {especialistas.map((esp) => (
                  <option key={esp} value={esp}>
                    {esp}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm text-gray-700 mb-2">
                Motivo de la interconsulta <span className="text-red-500">*</span>
              </label>
              <textarea
                value={nuevaInterconsulta.motivo}
                onChange={(e) =>
                  setNuevaInterconsulta({ ...nuevaInterconsulta, motivo: e.target.value })
                }
                placeholder="Describa el motivo de la interconsulta al especialista..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
              />
            </div>

            <button
              type="button"
              onClick={() => {
                agregarInterconsulta();
                syncRemisiones();
              }}
              className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors font-medium"
            >
              👥 Agregar Interconsulta
            </button>
          </div>

          {interconsultas.length > 0 ? (
            <div className="mt-4 space-y-2">
              {interconsultas.map((inter, idx) => (
                <div key={idx} className="bg-white border border-gray-200 rounded-md p-3 flex justify-between items-start">
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800">{inter.especialista}</p>
                    <p className="text-sm text-gray-600">{inter.motivo}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      eliminarInterconsulta(idx);
                      syncRemisiones();
                    }}
                    className="ml-4 text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 text-gray-500">
              No se han registrado interconsultas con especialistas
            </div>
          )}
        </div>
      </div>

      {/* Remisiones a Especialistas */}
      <div className="bg-red-50 border border-red-200 rounded-md p-4 space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-red-900 mb-2 flex items-center gap-2">
            🚑 Remisiones a Especialistas
          </h3>
          <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mb-3">
            <p className="text-xs text-blue-700">
              ℹ️ <strong>Funcionalidad con backend:</strong> Las remisiones registradas se enviarán automáticamente a la secretaría para agendar la cita y al especialista seleccionado para que este informado.
            </p>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-sm text-gray-700 mb-2">
                Especialista <span className="text-red-500">*</span>
              </label>
              <select
                value={nuevaRemision.especialista}
                onChange={(e) =>
                  setNuevaRemision({ ...nuevaRemision, especialista: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="">Seleccione un especialista...</option>
                {especialistas.map((esp) => (
                  <option key={esp} value={esp}>
                    {esp}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm text-gray-700 mb-2">
                Motivo de la remisión <span className="text-red-500">*</span>
              </label>
              <textarea
                value={nuevaRemision.motivo}
                onChange={(e) =>
                  setNuevaRemision({ ...nuevaRemision, motivo: e.target.value })
                }
                placeholder="Describa el motivo de la remisión al especialista..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-700 mb-2">
                Fecha de la remisión <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={nuevaRemision.fechaRemision}
                onChange={(e) =>
                  setNuevaRemision({ ...nuevaRemision, fechaRemision: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <button
              type="button"
              onClick={() => {
                agregarRemision();
                syncRemisiones();
              }}
              className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors font-medium"
            >
              🚑 Agregar Remisión
            </button>
          </div>

          {remisiones.length > 0 ? (
            <div className="mt-4 space-y-2">
              {remisiones.map((rem, idx) => (
                <div key={idx} className="bg-white border border-red-300 rounded-md p-3 flex justify-between items-start">
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800">{rem.especialista}</p>
                    <p className="text-sm text-gray-600">{rem.motivo}</p>
                    <p className={`text-xs font-semibold mt-1 ${rem.prioridad === "Urgente" ? "text-red-600" : "text-gray-600"}`}>
                      Prioridad: {rem.prioridad}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Fecha: {new Date(rem.fechaRemision).toLocaleDateString("es-CO")}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      eliminarRemision(idx);
                      syncRemisiones();
                    }}
                    className="ml-4 text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 text-gray-500">
              No se han registrado remisiones a especialistas
            </div>
          )}
        </div>
      </div>

      {/* Resumen informativo */}
      <div className="bg-green-50 border border-green-200 rounded-md p-4">
        <h3 className="text-sm text-green-800 mb-2 flex items-center gap-2">
          ✓ Ha completado todos los pasos de la historia clínica
        </h3>
        <p className="text-sm text-green-700">
          Revise la información ingresada y presione "Guardar historia clínica" para finalizar el
          proceso.
        </p>
      </div>

      {/* Botones de acción final */}
      <div className="space-y-3 pt-6 border-t border-gray-200">
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={onPrevious}
            className="flex items-center justify-center gap-2 bg-gray-300 text-gray-700 py-3 px-6 rounded-md hover:bg-gray-400 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            Anterior
          </button>
          <button
            onClick={onSave}
            className="flex-1 flex items-center justify-center gap-2 bg-green-600 text-white py-3 px-6 rounded-md hover:bg-green-700 transition-colors font-medium"
          >
            <Check className="w-5 h-5" />
            Guardar historia clínica
          </button>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={onPrint}
            className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 transition-colors"
          >
            <Printer className="w-5 h-5" />
            Imprimir / Generar PDF
          </button>
          <button
            onClick={onCancel}
            className="flex items-center justify-center gap-2 bg-red-600 text-white py-3 px-6 rounded-md hover:bg-red-700 transition-colors"
          >
            <X className="w-5 h-5" />
            Cancelar y salir
          </button>
        </div>
      </div>
    </div>
  );
}
