import { useState, useEffect } from "react";
import { HistoriaClinicaData } from "../HistoriaClinica";
import { ChevronLeft, ChevronRight, Heart, Thermometer, Wind, Droplets, Activity, Ruler, Weight, AlertTriangle, FileText, Plus, X } from "lucide-react";

type Props = {
  data: HistoriaClinicaData;
  updateData: (data: Partial<HistoriaClinicaData>) => void;
  onNext: () => void;
  onPrevious: () => void;
  onCancel?: () => void;
};

type AlertLevel = "normal" | "warning" | "danger" | "critical";
type AlertInfo = {
  level: AlertLevel;
  message: string;
};

// Componente reutilizable para cada sistema
const SistemaExploracion = ({ 
  nombre, 
  nombreClave, 
  estado, 
  observaciones,
  data,
  updateData,
  showTemplates,
  toggleTemplates,
  plantillasPredefinidas,
  aplicarPlantilla,
  customTemplates,
  showAddTemplate,
  toggleAddTemplate,
  newTemplate,
  setNewTemplate,
  guardarNuevaPlantilla,
  eliminarPlantillaPersonalizada
}: { 
  nombre: string; 
  nombreClave: string; 
  estado: "normal" | "anormal" | "";
  observaciones: string;
  data: HistoriaClinicaData;
  updateData: (data: Partial<HistoriaClinicaData>) => void;
  showTemplates: {[key: string]: boolean};
  toggleTemplates: (sistema: string) => void;
  plantillasPredefinidas: {[key: string]: string[]};
  aplicarPlantilla: (sistema: string, texto: string) => void;
  customTemplates: {[key: string]: string[]};
  showAddTemplate: {[key: string]: boolean};
  toggleAddTemplate: (sistema: string) => void;
  newTemplate: {[key: string]: string};
  setNewTemplate: React.Dispatch<React.SetStateAction<{[key: string]: string}>>;
  guardarNuevaPlantilla: (sistema: string) => void;
  eliminarPlantillaPersonalizada: (sistema: string, index: number) => void;
}) => {
  return (
    <div className="border-2 border-gray-200 rounded-xl p-5 hover:border-blue-300 transition-colors">
      <label className="block mb-4 font-semibold text-gray-800">{nombre}</label>
      
      <div className="flex gap-6 mb-4">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="radio"
            name={`exploracion-${nombreClave}`}
            checked={estado === "normal"}
            onChange={() => {
              const newExploracion = { ...data.exploracionSistemas };
              (newExploracion as any)[nombreClave] = { 
                estado: "normal", 
                observaciones: "" 
              };
              updateData({ exploracionSistemas: newExploracion });
            }}
            className="w-5 h-5 text-green-600 focus:ring-2 focus:ring-green-300"
          />
          <span className="text-gray-700 font-medium">Normal</span>
        </label>
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="radio"
            name={`exploracion-${nombreClave}`}
            checked={estado === "anormal"}
            onChange={() => {
              const newExploracion = { ...data.exploracionSistemas };
              (newExploracion as any)[nombreClave] = { estado: "anormal", observaciones: "" };
              updateData({ exploracionSistemas: newExploracion });
            }}
            className="w-5 h-5 text-red-600 focus:ring-2 focus:ring-red-300"
          />
          <span className="text-gray-700 font-medium">Anormal</span>
        </label>
      </div>
      
      {(estado === "normal" || estado === "anormal") && (
        <>
          <label className="block mb-2.5 font-semibold text-gray-800">
            Observaciones <span className="text-red-500">*</span>
          </label>
          <textarea
            value={observaciones}
            onChange={(e) => {
              const newExploracion = { ...data.exploracionSistemas };
              (newExploracion as any)[nombreClave].observaciones = e.target.value;
              updateData({ exploracionSistemas: newExploracion });
            }}
            rows={3}
            placeholder={estado === "normal" ? "Describa los hallazgos normales..." : "Describa los hallazgos anormales..."}
            className={`w-full px-4 py-2.5 border-2 rounded-lg focus:outline-none focus:ring-2 resize-none font-medium ${
              estado === "normal" 
                ? "border-green-300 bg-green-50 focus:border-green-500 focus:ring-green-200" 
                : "border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-200"
            }`}
          />
          
          {/* Mostrar plantillas SOLO si estado es "normal" */}
          {estado === "normal" && (
            <div className="mt-4">
              <button
                type="button"
                onClick={() => toggleTemplates(nombreClave)}
                className="flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 px-3 py-2 rounded-lg transition-all hover:bg-blue-100"
              >
                <FileText className="w-4 h-4" />
                {showTemplates[nombreClave] ? "Ocultar plantillas" : "Mostrar plantillas"}
              </button>
              
              {showTemplates[nombreClave] && (
                <div className="mt-4 space-y-3 bg-gray-50 p-4 rounded-lg border border-gray-200">
                  {/* Plantillas predefinidas */}
                  <div>
                    <p className="text-xs font-bold text-gray-600 uppercase mb-2.5">Plantillas Predefinidas:</p>
                    <div className="space-y-2">
                      {plantillasPredefinidas[nombreClave].map((plantilla: string, index: number) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => aplicarPlantilla(nombreClave, plantilla)}
                          className="block w-full text-left px-4 py-2.5 bg-white border-2 border-blue-200 text-gray-700 text-sm rounded-lg hover:bg-blue-50 hover:border-blue-400 transition-all font-medium"
                        >
                          {plantilla}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  {/* Plantillas personalizadas */}
                  {customTemplates[nombreClave].length > 0 && (
                    <div>
                      <p className="text-xs font-bold text-gray-600 uppercase mb-2.5">⭐ Plantillas Personalizadas:</p>
                      <div className="space-y-2">
                        {customTemplates[nombreClave].map((plantilla: string, index: number) => (
                          <div key={index} className="flex items-center gap-2 group">
                            <button
                              type="button"
                              onClick={() => aplicarPlantilla(nombreClave, plantilla)}
                              className="flex-1 text-left px-4 py-2.5 bg-white border-2 border-purple-200 text-gray-700 text-sm rounded-lg hover:bg-purple-50 hover:border-purple-400 transition-all font-medium"
                            >
                              {plantilla}
                            </button>
                            <button
                              type="button"
                              onClick={() => eliminarPlantillaPersonalizada(nombreClave, index)}
                              className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                              title="Eliminar plantilla"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Agregar plantilla */}
                  {!showAddTemplate[nombreClave] ? (
                    <button
                      type="button"
                      onClick={() => toggleAddTemplate(nombreClave)}
                      className="flex items-center gap-2 text-sm text-green-600 hover:text-green-700 font-semibold bg-green-50 px-3 py-2 rounded-lg transition-all hover:bg-green-100 mt-2"
                    >
                      <Plus className="w-4 h-4" />
                      Agregar nueva plantilla
                    </button>
                  ) : (
                    <div className="mt-3 p-4 bg-white border-2 border-green-200 rounded-lg">
                      <textarea
                        value={newTemplate[nombreClave]}
                        onChange={(e) => setNewTemplate(prev => ({ ...prev, [nombreClave]: e.target.value }))}
                        rows={2}
                        placeholder="Escriba la nueva plantilla..."
                        className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-300 resize-none text-sm font-medium"
                      />
                      <div className="flex gap-2 mt-3">
                        <button
                          type="button"
                          onClick={() => guardarNuevaPlantilla(nombreClave)}
                          className="px-4 py-2 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700 transition-colors"
                        >
                          Guardar
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            toggleAddTemplate(nombreClave);
                            setNewTemplate(prev => ({ ...prev, [nombreClave]: "" }));
                          }}
                          className="px-4 py-2 bg-gray-300 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-400 transition-colors"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export function ExploracionFisica({ data, updateData, onNext, onPrevious, onCancel }: Props) {
  const [imc, setImc] = useState<string>("");
  const [showTemplates, setShowTemplates] = useState<{[key: string]: boolean}>({
    cardiovascular: false,
    respiratorio: false,
    digestivo: false,
    neurologico: false,
    musculoesqueletico: false,
    genitourinario: false,
    endocrino: false,
    pielFaneras: false,
  });

  const [showAddTemplate, setShowAddTemplate] = useState<{[key: string]: boolean}>({
    cardiovascular: false,
    respiratorio: false,
    digestivo: false,
    neurologico: false,
    musculoesqueletico: false,
    genitourinario: false,
    endocrino: false,
    pielFaneras: false,
  });

  const [newTemplate, setNewTemplate] = useState<{[key: string]: string}>({
    cardiovascular: "",
    respiratorio: "",
    digestivo: "",
    neurologico: "",
    musculoesqueletico: "",
    genitourinario: "",
    endocrino: "",
    pielFaneras: "",
  });

  const [customTemplates, setCustomTemplates] = useState<{[key: string]: string[]}>({
    cardiovascular: [],
    respiratorio: [],
    digestivo: [],
    neurologico: [],
    musculoesqueletico: [],
    genitourinario: [],
    endocrino: [],
    pielFaneras: [],
  });

  const plantillasPredefinidas = {
    cardiovascular: [
      "Ruidos cardíacos rítmicos, sin soplos ni agregados. Pulsos periféricos simétricos y de buena amplitud.",
      "Ruidos cardíacos normales. Frecuencia y ritmo regular. Sin soplos audibles.",
      "Auscultación cardíaca sin alteraciones. Pulsos presentes y simétricos en las cuatro extremidades.",
    ],
    respiratorio: [
      "Murmullo vesicular conservado bilateral. Sin ruidos agregados. Expansión torácica simétrica.",
      "Tórax simétrico con buena expansibilidad. Murmullo vesicular audible en ambos campos pulmonares.",
      "Auscultación pulmonar sin estertores, sibilancias ni roncus. Ventilación bilateral adecuada.",
    ],
    digestivo: [
      "Abdomen blando, depresible, no doloroso. Ruidos hidroaéreos presentes. Sin visceromegalias.",
      "Abdomen plano, blando, depresible, no doloroso a la palpación superficial ni profunda.",
      "Ruidos intestinales normales. Sin masas palpables. No se evidencia hepatomegalia ni esplenomegalia.",
    ],
    neurologico: [
      "Consciente, alerta y orientado. Fuerza muscular conservada. Sensibilidad y reflejos normales. Sin alteraciones en coordinación ni equilibrio.",
      "Paciente consciente y orientado en tiempo, espacio y persona. Funciones mentales superiores conservadas.",
      "Pares craneales sin alteraciones. Fuerza muscular 5/5 en las cuatro extremidades. Reflejos osteotendinosos presentes y simétricos.",
    ],
    musculoesqueletico: [
      "Rangos de movilidad articular conservados. Sin signos de inflamación ni deformidades. Fuerza muscular adecuada. Marcha normal.",
      "Articulaciones sin deformidades, edema ni limitación funcional. Movilidad activa y pasiva conservada.",
      "Tono y trofismo muscular adecuados. Sin atrofias. Marcha sin alteraciones. Balance articular completo.",
    ],
    genitourinario: [
      "Sin alteraciones. Sin dolor a la palpación en región lumbar ni hipogastrio.",
      "No se evidencian alteraciones en región genital. Puño percusión lumbar negativa bilateral.",
      "Sin dolor a la palpación abdominal. No se palpa globo vesical.",
    ],
    endocrino: [
      "Tiroides no palpable. Sin signos de alteraciones endocrinas.",
      "Glándula tiroides de tamaño y consistencia normales. Sin nódulos palpables.",
      "No se evidencian signos de hipo o hipertiroidismo. Distribución de grasa corporal normal.",
    ],
    pielFaneras: [
      "Piel de coloración y temperatura normales. Hidratada. Sin lesiones dérmicas.",
      "Piel íntegra, sin lesiones, cicatrices ni manchas. Buena turgencia e hidratación.",
      "Faneras sin alteraciones. Uñas sin cambios de coloración. Cabello de implantación normal.",
    ],
  };

  const toggleTemplates = (sistema: string) => {
    setShowTemplates(prev => ({
      ...prev,
      [sistema]: !prev[sistema]
    }));
    if (showAddTemplate[sistema]) {
      setShowAddTemplate(prev => ({
        ...prev,
        [sistema]: false
      }));
    }
  };

  const aplicarPlantilla = (sistema: string, texto: string) => {
    const newExploracion = { ...data.exploracionSistemas };
    (newExploracion as any)[sistema].observaciones = texto;
    updateData({ exploracionSistemas: newExploracion });
    setShowTemplates(prev => ({
      ...prev,
      [sistema]: false
    }));
  };

  const toggleAddTemplate = (sistema: string) => {
    setShowAddTemplate(prev => ({
      ...prev,
      [sistema]: !prev[sistema]
    }));
  };

  const guardarNuevaPlantilla = (sistema: string) => {
    const texto = newTemplate[sistema].trim();
    if (texto) {
      setCustomTemplates(prev => ({
        ...prev,
        [sistema]: [...prev[sistema], texto]
      }));
      setNewTemplate(prev => ({
        ...prev,
        [sistema]: ""
      }));
      setShowAddTemplate(prev => ({
        ...prev,
        [sistema]: false
      }));
    }
  };

  const eliminarPlantillaPersonalizada = (sistema: string, index: number) => {
    setCustomTemplates(prev => ({
      ...prev,
      [sistema]: prev[sistema].filter((_, i) => i !== index)
    }));
  };

  useEffect(() => {
    const peso = parseFloat(data.peso);
    const estaturaMetros = parseFloat(data.estatura) / 100;

    if (peso > 0 && estaturaMetros > 0) {
      const imcCalculado = peso / (estaturaMetros * estaturaMetros);
      setImc(imcCalculado.toFixed(2));
    } else {
      setImc("");
    }
  }, [data.peso, data.estatura]);

  const getImcCategoria = (imcValue: number): { texto: string; color: string; bgColor: string } => {
    if (imcValue < 18.5) return { texto: "Bajo peso", color: "text-yellow-700", bgColor: "bg-yellow-50 border-yellow-300" };
    if (imcValue < 25) return { texto: "Normal", color: "text-green-700", bgColor: "bg-green-50 border-green-300" };
    if (imcValue < 30) return { texto: "Sobrepeso", color: "text-orange-700", bgColor: "bg-orange-50 border-orange-300" };
    return { texto: "Obesidad", color: "text-red-700", bgColor: "bg-red-50 border-red-300" };
  };

  const evaluarFC = (fc: string): AlertInfo | null => {
    const valor = parseFloat(fc);
    if (isNaN(valor) || !fc) return null;
    
    if (valor < 40) return { level: "warning", message: "Bradicardia (puede ser normal en deportistas)" };
    if (valor > 120) return { level: "critical", message: "Taquicardia severa" };
    if (valor > 100) return { level: "danger", message: "Taquicardia" };
    return { level: "normal", message: "Frecuencia cardíaca normal" };
  };

  const evaluarTA = (ta: string): AlertInfo | null => {
    if (!ta || !ta.includes('/')) return null;
    
    const partes = ta.split('/');
    const sistolica = parseFloat(partes[0]);
    const diastolica = parseFloat(partes[1]);
    
    if (isNaN(sistolica) || isNaN(diastolica)) return null;
    
    if (sistolica > 180 || diastolica > 120) {
      return { level: "critical", message: "Crisis de hipertensión - Requiere atención inmediata" };
    }
    
    if (sistolica >= 140 || diastolica >= 90) {
      return { level: "danger", message: "Hipertensión Nivel 2" };
    }
    
    if ((sistolica >= 130 && sistolica <= 139) || (diastolica > 80 && diastolica <= 89)) {
      return { level: "danger", message: "Hipertensión Nivel 1" };
    }
    
    if (sistolica >= 120 && sistolica <= 129 && diastolica <= 80) {
      return { level: "warning", message: "Presión arterial elevada" };
    }
    
    if (sistolica < 80 || diastolica < 60) {
      return { level: "warning", message: "Hipotensión" };
    }
    
    if (sistolica >= 80 && sistolica <= 120 && diastolica >= 60 && diastolica <= 80) {
      return { level: "normal", message: "Presión arterial normal" };
    }
    
    return { level: "normal", message: "Presión arterial normal" };
  };

  const evaluarFR = (fr: string): AlertInfo | null => {
    const valor = parseFloat(fr);
    if (isNaN(valor) || !fr) return null;
    
    if (valor > 30) return { level: "critical", message: "Taquipnea severa" };
    if (valor > 20) return { level: "danger", message: "Taquipnea" };
    if (valor < 12) return { level: "warning", message: "Bradipnea" };
    return { level: "normal", message: "Frecuencia respiratoria normal" };
  };

  const evaluarTemperatura = (temp: string): AlertInfo | null => {
    const valor = parseFloat(temp);
    if (isNaN(valor) || !temp) return null;
    
    if (valor > 39) return { level: "critical", message: "Fiebre alta" };
    if (valor > 38) return { level: "danger", message: "Fiebre" };
    if (valor >= 37.5 && valor <= 38) return { level: "warning", message: "Febrícula" };
    if (valor < 36) return { level: "warning", message: "Hipotermia" };
    return { level: "normal", message: "Temperatura normal" };
  };

  const evaluarSaturacion = (sat: string): AlertInfo | null => {
    const valor = parseFloat(sat);
    if (isNaN(valor) || !sat) return null;
    
    if (valor < 90) return { level: "critical", message: "Saturación crítica - Requiere atención inmediata" };
    if (valor < 95) return { level: "danger", message: "Saturación baja" };
    if (valor < 97) return { level: "warning", message: "Saturación levemente baja" };
    return { level: "normal", message: "Saturación normal" };
  };

  const AlertaBanner = ({ alert }: { alert: AlertInfo }) => {
    const colores = {
      normal: "bg-green-50 border-green-300 text-green-800",
      warning: "bg-yellow-50 border-yellow-300 text-yellow-800",
      danger: "bg-orange-50 border-orange-300 text-orange-800",
      critical: "bg-red-50 border-red-300 text-red-800"
    };

    const iconColors = {
      normal: "text-green-600",
      warning: "text-yellow-600",
      danger: "text-orange-600",
      critical: "text-red-600"
    };

    return (
      <div className={`flex items-center gap-2 mt-2 p-3 rounded-lg border-2 ${colores[alert.level]}`}>
        <AlertTriangle className={`w-4 h-4 ${iconColors[alert.level]} flex-shrink-0`} />
        <span className="text-sm font-semibold">{alert.message}</span>
      </div>
    );
  };

  const categoria = imc ? getImcCategoria(parseFloat(imc)) : null;

  // La validación ahora está en HistoriaClinica-CON-ALERTAS.tsx en validateStep()

  return (
    <div className="space-y-8">
      {/* MEDIDAS ANTROPOMÉTRICAS */}
      <div className="bg-gradient-to-r from-purple-50 to-purple-100/50 border-l-4 border-purple-500 p-6 rounded-xl">
        <div className="flex items-center gap-3">
          <div className="bg-purple-600 p-2.5 rounded-lg">
            <Weight className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-lg font-bold text-purple-900">Medidas Antropométricas</h3>
        </div>
      </div>

      {/* Talla y Peso */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block mb-2.5 font-semibold text-gray-800">
            Talla (cm) <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Ruler className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="number"
              value={data.estatura}
              onChange={(e) => updateData({ estatura: e.target.value })}
              placeholder="Ej: 175"
              min="0"
              step="0.1"
              className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 font-medium"
            />
          </div>
        </div>

        <div>
          <label className="block mb-2.5 font-semibold text-gray-800">
            Peso (kg) <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Weight className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="number"
              value={data.peso}
              onChange={(e) => updateData({ peso: e.target.value })}
              placeholder="Ej: 70"
              min="0"
              step="0.1"
              className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 font-medium"
            />
          </div>
        </div>
      </div>

      {/* IMC */}
      <div>
        <label className="block mb-2.5 font-semibold text-gray-800">Índice de Masa Corporal (IMC)</label>
        <div className={`border-2 rounded-xl p-6 ${categoria ? categoria.bgColor : 'bg-gray-50 border-gray-300'}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-4xl font-bold text-gray-800">
                {imc ? imc : "-"}
                {imc && <span className="text-lg text-gray-500 ml-3">kg/m²</span>}
              </p>
              {categoria && (
                <p className={`font-bold mt-2 text-lg ${categoria.color}`}>{categoria.texto}</p>
              )}
            </div>
            <div className="text-right">
              <p className="font-bold text-gray-700">Cálculo Automático</p>
              <p className="text-sm text-gray-600 mt-1">IMC = Peso / Talla²</p>
            </div>
          </div>
        </div>
      </div>

      {/* SIGNOS VITALES */}
      <div className="bg-gradient-to-r from-red-50 to-red-100/50 border-l-4 border-red-500 p-6 rounded-xl">
        <div className="flex items-center gap-3">
          <div className="bg-red-600 p-2.5 rounded-lg">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-lg font-bold text-red-900">Signos Vitales</h3>
        </div>
      </div>

      {/* Presión Arterial */}
      <div>
        <label className="block mb-2.5 font-semibold text-gray-800">
          Presión Arterial (TA) <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <Heart className="absolute left-4 top-3.5 w-5 h-5 text-gray-400 pointer-events-none" />
          <select
            value={data.presionArterial}
            onChange={(e) => updateData({ presionArterial: e.target.value })}
            className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-200 appearance-none bg-white font-medium"
          >
            <option value="">Seleccione TA...</option>
            <option value="80/50">80/50 mmHg</option>
            <option value="85/55">85/55 mmHg</option>
            <option value="90/60">90/60 mmHg</option>
            <option value="95/65">95/65 mmHg</option>
            <option value="100/65">100/65 mmHg</option>
            <option value="100/70">100/70 mmHg</option>
            <option value="105/70">105/70 mmHg</option>
            <option value="110/70">110/70 mmHg</option>
            <option value="110/75">110/75 mmHg</option>
            <option value="115/75">115/75 mmHg</option>
            <option value="120/70">120/70 mmHg</option>
            <option value="120/75">120/75 mmHg</option>
            <option value="120/80">120/80 mmHg</option>
            <option value="125/80">125/80 mmHg</option>
            <option value="130/80">130/80 mmHg</option>
            <option value="130/85">130/85 mmHg</option>
            <option value="135/85">135/85 mmHg</option>
            <option value="135/90">135/90 mmHg</option>
            <option value="140/85">140/85 mmHg</option>
            <option value="140/90">140/90 mmHg</option>
            <option value="145/90">145/90 mmHg</option>
            <option value="150/90">150/90 mmHg</option>
            <option value="150/95">150/95 mmHg</option>
            <option value="160/95">160/95 mmHg</option>
            <option value="160/100">160/100 mmHg</option>
            <option value="170/100">170/100 mmHg</option>
            <option value="170/105">170/105 mmHg</option>
            <option value="180/110">180/110 mmHg</option>
            <option value="190/110">190/110 mmHg</option>
            <option value="200/120">200/120 mmHg</option>
          </select>
        </div>
        <p className="text-xs text-gray-500 mt-2">Formato: Sistólica/Diastólica (mmHg)</p>
        {evaluarTA(data.presionArterial) && <AlertaBanner alert={evaluarTA(data.presionArterial)!} />}
      </div>

      {/* Grid de signos vitales */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* FC */}
        <div>
          <label className="block mb-2.5 font-semibold text-gray-800">
            Frecuencia Cardíaca (FC) <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Heart className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
            <input
              type="number"
              value={data.frecuenciaCardiaca}
              onChange={(e) => updateData({ frecuenciaCardiaca: e.target.value })}
              placeholder="Ej: 70"
              min="0"
              className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-200 font-medium"
            />
          </div>
          <p className="text-xs text-gray-500 mt-2">Latidos por minuto (lpm)</p>
          {evaluarFC(data.frecuenciaCardiaca) && <AlertaBanner alert={evaluarFC(data.frecuenciaCardiaca)!} />}
        </div>

        {/* FR */}
        <div>
          <label className="block mb-2.5 font-semibold text-gray-800">
            Frecuencia Respiratoria (FR) <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Wind className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
            <input
              type="number"
              value={data.frecuenciaRespiratoria}
              onChange={(e) => updateData({ frecuenciaRespiratoria: e.target.value })}
              placeholder="Ej: 16"
              min="0"
              className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-200 font-medium"
            />
          </div>
          <p className="text-xs text-gray-500 mt-2">Respiraciones por minuto (rpm)</p>
          {evaluarFR(data.frecuenciaRespiratoria) && <AlertaBanner alert={evaluarFR(data.frecuenciaRespiratoria)!} />}
        </div>

        {/* Temperatura */}
        <div>
          <label className="block mb-2.5 font-semibold text-gray-800">
            Temperatura (T°) <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Thermometer className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
            <input
              type="number"
              value={data.temperatura}
              onChange={(e) => updateData({ temperatura: e.target.value })}
              placeholder="Ej: 36.5"
              min="0"
              step="0.1"
              className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-200 font-medium"
            />
          </div>
          <p className="text-xs text-gray-500 mt-2">Grados Celsius (°C)</p>
          {evaluarTemperatura(data.temperatura) && <AlertaBanner alert={evaluarTemperatura(data.temperatura)!} />}
        </div>

        {/* SpO2 */}
        <div>
          <label className="block mb-2.5 font-semibold text-gray-800">
            Saturación de Oxígeno (SpO₂)
          </label>
          <div className="relative">
            <Droplets className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
            <input
              type="number"
              value={data.saturacionOxigeno}
              onChange={(e) => updateData({ saturacionOxigeno: e.target.value })}
              placeholder="Ej: 98"
              min="0"
              max="100"
              className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-200 font-medium"
            />
          </div>
          <p className="text-xs text-gray-500 mt-2">Porcentaje (%)</p>
          {evaluarSaturacion(data.saturacionOxigeno) && <AlertaBanner alert={evaluarSaturacion(data.saturacionOxigeno)!} />}
        </div>
      </div>

      {/* EXPLORACIÓN POR SISTEMAS */}
      <div className="bg-gradient-to-r from-indigo-50 to-indigo-100/50 border-l-4 border-indigo-500 p-6 rounded-xl">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 p-2.5 rounded-lg">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-lg font-bold text-indigo-900">Exploración Física por Sistemas</h3>
        </div>
      </div>

      {/* Grid de sistemas */}
      <div className="grid grid-cols-1 gap-6">
        <SistemaExploracion 
          nombre="Sistema Cardiovascular"
          nombreClave="cardiovascular"
          estado={data.exploracionSistemas.cardiovascular.estado}
          observaciones={data.exploracionSistemas.cardiovascular.observaciones}
          data={data}
          updateData={updateData}
          showTemplates={showTemplates}
          toggleTemplates={toggleTemplates}
          plantillasPredefinidas={plantillasPredefinidas}
          aplicarPlantilla={aplicarPlantilla}
          customTemplates={customTemplates}
          showAddTemplate={showAddTemplate}
          toggleAddTemplate={toggleAddTemplate}
          newTemplate={newTemplate}
          setNewTemplate={setNewTemplate}
          guardarNuevaPlantilla={guardarNuevaPlantilla}
          eliminarPlantillaPersonalizada={eliminarPlantillaPersonalizada}
        />

        <SistemaExploracion 
          nombre="Sistema Respiratorio"
          nombreClave="respiratorio"
          estado={data.exploracionSistemas.respiratorio.estado}
          observaciones={data.exploracionSistemas.respiratorio.observaciones}
          data={data}
          updateData={updateData}
          showTemplates={showTemplates}
          toggleTemplates={toggleTemplates}
          plantillasPredefinidas={plantillasPredefinidas}
          aplicarPlantilla={aplicarPlantilla}
          customTemplates={customTemplates}
          showAddTemplate={showAddTemplate}
          toggleAddTemplate={toggleAddTemplate}
          newTemplate={newTemplate}
          setNewTemplate={setNewTemplate}
          guardarNuevaPlantilla={guardarNuevaPlantilla}
          eliminarPlantillaPersonalizada={eliminarPlantillaPersonalizada}
        />

        <SistemaExploracion 
          nombre="Sistema Digestivo"
          nombreClave="digestivo"
          estado={data.exploracionSistemas.digestivo.estado}
          observaciones={data.exploracionSistemas.digestivo.observaciones}
          data={data}
          updateData={updateData}
          showTemplates={showTemplates}
          toggleTemplates={toggleTemplates}
          plantillasPredefinidas={plantillasPredefinidas}
          aplicarPlantilla={aplicarPlantilla}
          customTemplates={customTemplates}
          showAddTemplate={showAddTemplate}
          toggleAddTemplate={toggleAddTemplate}
          newTemplate={newTemplate}
          setNewTemplate={setNewTemplate}
          guardarNuevaPlantilla={guardarNuevaPlantilla}
          eliminarPlantillaPersonalizada={eliminarPlantillaPersonalizada}
        />

        <SistemaExploracion 
          nombre="Sistema Neurológico"
          nombreClave="neurologico"
          estado={data.exploracionSistemas.neurologico.estado}
          observaciones={data.exploracionSistemas.neurologico.observaciones}
          data={data}
          updateData={updateData}
          showTemplates={showTemplates}
          toggleTemplates={toggleTemplates}
          plantillasPredefinidas={plantillasPredefinidas}
          aplicarPlantilla={aplicarPlantilla}
          customTemplates={customTemplates}
          showAddTemplate={showAddTemplate}
          toggleAddTemplate={toggleAddTemplate}
          newTemplate={newTemplate}
          setNewTemplate={setNewTemplate}
          guardarNuevaPlantilla={guardarNuevaPlantilla}
          eliminarPlantillaPersonalizada={eliminarPlantillaPersonalizada}
        />

        <SistemaExploracion 
          nombre="Sistema Musculoesquelético"
          nombreClave="musculoesqueletico"
          estado={data.exploracionSistemas.musculoesqueletico.estado}
          observaciones={data.exploracionSistemas.musculoesqueletico.observaciones}
          data={data}
          updateData={updateData}
          showTemplates={showTemplates}
          toggleTemplates={toggleTemplates}
          plantillasPredefinidas={plantillasPredefinidas}
          aplicarPlantilla={aplicarPlantilla}
          customTemplates={customTemplates}
          showAddTemplate={showAddTemplate}
          toggleAddTemplate={toggleAddTemplate}
          newTemplate={newTemplate}
          setNewTemplate={setNewTemplate}
          guardarNuevaPlantilla={guardarNuevaPlantilla}
          eliminarPlantillaPersonalizada={eliminarPlantillaPersonalizada}
        />

        <SistemaExploracion 
          nombre="Sistema Genitourinario"
          nombreClave="genitourinario"
          estado={data.exploracionSistemas.genitourinario.estado}
          observaciones={data.exploracionSistemas.genitourinario.observaciones}
          data={data}
          updateData={updateData}
          showTemplates={showTemplates}
          toggleTemplates={toggleTemplates}
          plantillasPredefinidas={plantillasPredefinidas}
          aplicarPlantilla={aplicarPlantilla}
          customTemplates={customTemplates}
          showAddTemplate={showAddTemplate}
          toggleAddTemplate={toggleAddTemplate}
          newTemplate={newTemplate}
          setNewTemplate={setNewTemplate}
          guardarNuevaPlantilla={guardarNuevaPlantilla}
          eliminarPlantillaPersonalizada={eliminarPlantillaPersonalizada}
        />

        <SistemaExploracion 
          nombre="Sistema Endocrino"
          nombreClave="endocrino"
          estado={data.exploracionSistemas.endocrino.estado}
          observaciones={data.exploracionSistemas.endocrino.observaciones}
          data={data}
          updateData={updateData}
          showTemplates={showTemplates}
          toggleTemplates={toggleTemplates}
          plantillasPredefinidas={plantillasPredefinidas}
          aplicarPlantilla={aplicarPlantilla}
          customTemplates={customTemplates}
          showAddTemplate={showAddTemplate}
          toggleAddTemplate={toggleAddTemplate}
          newTemplate={newTemplate}
          setNewTemplate={setNewTemplate}
          guardarNuevaPlantilla={guardarNuevaPlantilla}
          eliminarPlantillaPersonalizada={eliminarPlantillaPersonalizada}
        />

        <SistemaExploracion 
          nombre="Piel y Faneras"
          nombreClave="pielFaneras"
          estado={data.exploracionSistemas.pielFaneras.estado}
          observaciones={data.exploracionSistemas.pielFaneras.observaciones}
          data={data}
          updateData={updateData}
          showTemplates={showTemplates}
          toggleTemplates={toggleTemplates}
          plantillasPredefinidas={plantillasPredefinidas}
          aplicarPlantilla={aplicarPlantilla}
          customTemplates={customTemplates}
          showAddTemplate={showAddTemplate}
          toggleAddTemplate={toggleAddTemplate}
          newTemplate={newTemplate}
          setNewTemplate={setNewTemplate}
          guardarNuevaPlantilla={guardarNuevaPlantilla}
          eliminarPlantillaPersonalizada={eliminarPlantillaPersonalizada}
        />
      </div>
    </div>
  );
}