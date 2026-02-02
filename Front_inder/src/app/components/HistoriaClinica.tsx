'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { ArrowLeft, ChevronRight, ChevronLeft, AlertCircle } from 'lucide-react';
import { Deportista, historiaClinicaService, documentosService } from '../services/apiClient';
import { ProgressIndicator } from './historia/ProgressIndicator';
import { Evaluacion } from './historia/Evaluacion';
import { AntecedentesMedicos } from './historia/AntecedentesMedicos';
import { RevisionSistemas } from './historia/RevisionSistemas';
import { ExploracionFisica } from './historia/ExploracionFisica';
import { PruebasComplementarias } from './historia/PruebasComplementarias';
import { Diagnostico } from './historia/Diagnostico';
import { PlanTratamiento } from './historia/PlanTratamiento';
import { useAlert } from './AlertModal';

type TipoAlergia = 'Respiratorias' | 'Digestivas' | 'Dermatológicas' | 'Medicamentosas' | 'Otra';

type AlergiaSeleccionada = {
  tipo: TipoAlergia;
  subtipos: string[];
  detalles: string;
};

export type HistoriaClinicaData = {
  tipoCita: string;
  motivoConsulta: string;
  enfermedadActual: string;
  deportista_id?: string;
  antecedentesPersonales: Array<{ codigoCIE11: string; nombreEnfermedad: string; observaciones: string }>;
  antecedentesFamiliares: Array<{ codigoCIE11: string; nombreEnfermedad: string; familiar: string; observaciones: string }>;
  lesionesDeportivas: boolean;
  descripcionLesiones: string;
  fechaUltimaLesion: string;
  cirugiasPrevias: boolean;
  detalleCirugias: string;
  tieneAlergias: boolean;
  alergias: AlergiaSeleccionada[];
  tomaMedicacion: boolean;
  medicacionActual: string;
  vacunas: string[];
  revisionSistemas: {
    cardiovascular: { estado: "normal" | "anormal" | ""; observaciones: string };
    respiratorio: { estado: "normal" | "anormal" | ""; observaciones: string };
    digestivo: { estado: "normal" | "anormal" | ""; observaciones: string };
    neurologico: { estado: "normal" | "anormal" | ""; observaciones: string };
    musculoesqueletico: { estado: "normal" | "anormal" | ""; observaciones: string };
    genitourinario: { estado: "normal" | "anormal" | ""; observaciones: string };
    endocrino: { estado: "normal" | "anormal" | ""; observaciones: string };
    pielFaneras: { estado: "normal" | "anormal" | ""; observaciones: string };
  };
  estatura: string;
  peso: string;
  frecuenciaCardiaca: string;
  presionArterial: string;
  frecuenciaRespiratoria: string;
  temperatura: string;
  saturacionOxigeno: string;
  exploracionSistemas: {
    cardiovascular: { estado: "normal" | "anormal" | ""; observaciones: string };
    respiratorio: { estado: "normal" | "anormal" | ""; observaciones: string };
    digestivo: { estado: "normal" | "anormal" | ""; observaciones: string };
    neurologico: { estado: "normal" | "anormal" | ""; observaciones: string };
    musculoesqueletico: { estado: "normal" | "anormal" | ""; observaciones: string };
    genitourinario: { estado: "normal" | "anormal" | ""; observaciones: string };
    endocrino: { estado: "normal" | "anormal" | ""; observaciones: string };
    pielFaneras: { estado: "normal" | "anormal" | ""; observaciones: string };
  };
  ayudasDiagnosticas: Array<{ categoria: string; nombrePrueba: string; codigoCUPS: string; resultado: string; archivosAdjuntos: File[] }>;
  analisisObjetivoDiagnostico: string;
  impresionDiagnostica: string;
  diagnosticos: Array<{ codigo: string; nombre: string; observaciones: string }>;
  indicacionesMedicas: string;
  recomendacionesEntrenamiento: string;
  planSeguimiento: string;
  remisionesEspecialistas: Array<{ especialista: string; motivo: string; prioridad: "Normal" | "Urgente"; fechaRemision: string }>;
};

interface HistoriaClinicaProps {
  deportista: Deportista;
  onBack?: () => void;
  onSuccess?: (historiaId: string) => void;
}

export const HistoriaClinica: React.FC<HistoriaClinicaProps> = ({
  deportista,
  onBack,
  onSuccess,
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingProgress, setIsSavingProgress] = useState(false);
  const [historiaGuardadaId, setHistoriaGuardadaId] = useState<string | null>(null);
  const { AlertModal, showAlert } = useAlert();

  const [formData, setFormData] = useState<HistoriaClinicaData>(() => {
    const saved = localStorage.getItem(`historia_clinica_${deportista.id}`);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error al cargar datos guardados:', e);
      }
    }
    return getInitialFormData();
  });

  const totalSteps = 7;

  function getInitialFormData(): HistoriaClinicaData {
    return {
      tipoCita: "",
      motivoConsulta: "",
      enfermedadActual: "",
      antecedentesPersonales: [],
      antecedentesFamiliares: [],
      lesionesDeportivas: false,
      descripcionLesiones: "",
      fechaUltimaLesion: "",
      cirugiasPrevias: false,
      detalleCirugias: "",
      tieneAlergias: false,
      alergias: [],
      tomaMedicacion: false,
      medicacionActual: "",
      vacunas: [],
      revisionSistemas: {
        cardiovascular: { estado: "normal", observaciones: "" },
        respiratorio: { estado: "normal", observaciones: "" },
        digestivo: { estado: "normal", observaciones: "" },
        neurologico: { estado: "normal", observaciones: "" },
        musculoesqueletico: { estado: "normal", observaciones: "" },
        genitourinario: { estado: "normal", observaciones: "" },
        endocrino: { estado: "normal", observaciones: "" },
        pielFaneras: { estado: "normal", observaciones: "" },
      },
      estatura: "",
      peso: "",
      frecuenciaCardiaca: "70",
      presionArterial: "120/80",
      frecuenciaRespiratoria: "16",
      temperatura: "36.5",
      saturacionOxigeno: "98",
      exploracionSistemas: {
        cardiovascular: { estado: "normal", observaciones: "" },
        respiratorio: { estado: "normal", observaciones: "" },
        digestivo: { estado: "normal", observaciones: "" },
        neurologico: { estado: "normal", observaciones: "" },
        musculoesqueletico: { estado: "normal", observaciones: "" },
        genitourinario: { estado: "normal", observaciones: "" },
        endocrino: { estado: "normal", observaciones: "" },
        pielFaneras: { estado: "normal", observaciones: "" },
      },
      ayudasDiagnosticas: [],
      analisisObjetivoDiagnostico: "",
      impresionDiagnostica: "",
      diagnosticos: [],
      indicacionesMedicas: "",
      recomendacionesEntrenamiento: "",
      planSeguimiento: "",
      remisionesEspecialistas: [],
    };
  }

  // Guardar progreso automáticamente
  useEffect(() => {
    const timer = setTimeout(() => {
      localStorage.setItem(`historia_clinica_${deportista.id}`, JSON.stringify(formData));
    }, 1000);
    return () => clearTimeout(timer);
  }, [formData, deportista.id]);

  const updateFormData = (data: Partial<HistoriaClinicaData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  // ============================================================================
  // VALIDACIONES POR PASO
  // ============================================================================

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1: // Evaluación
        if (!formData.motivoConsulta?.trim()) {
          showAlert('error', 'Campo requerido', 'Por favor ingrese el motivo de consulta');
          return false;
        }
        if (!formData.enfermedadActual?.trim()) {
          showAlert('error', 'Campo requerido', 'Por favor ingrese la enfermedad actual / anamnesis');
          return false;
        }
        return true;

      case 2: // Antecedentes Médicos
        if (formData.antecedentesPersonales.length === 0 && formData.antecedentesFamiliares.length === 0) {
          showAlert('error', 'Antecedentes requeridos', 'Por favor agregue al menos un antecedente (personal o familiar)');
          return false;
        }
        if (formData.tomaMedicacion && !formData.medicacionActual?.trim()) {
          showAlert('error', 'Campo requerido', 'Por favor especifique la medicación actual');
          return false;
        }
        if (formData.tieneAlergias && formData.alergias.length === 0) {
          showAlert('error', 'Alergia requerida', 'Por favor agregue al menos una alergia');
          return false;
        }
        const alergiasIncompletas = formData.alergias.filter(a => {
          const necesitaDetalles = a.subtipos.some(s => 
            s.includes('Otro') || s.includes('Especifique') || s.toLowerCase().includes('especifique')
          );
          return necesitaDetalles && !a.detalles?.trim();
        });
        if (alergiasIncompletas.length > 0) {
          showAlert('error', 'Detalles requeridos', 'Por favor complete los detalles de las alergias marcadas como "Otro"');
          return false;
        }
        if (formData.lesionesDeportivas && !formData.descripcionLesiones?.trim()) {
          showAlert('error', 'Descripción requerida', 'Por favor describa las lesiones deportivas');
          return false;
        }
        if (formData.cirugiasPrevias && !formData.detalleCirugias?.trim()) {
          showAlert('error', 'Detalles requeridos', 'Por favor detalle las cirugías previas');
          return false;
        }
        return true;

      case 3: // Revisión por Sistemas
        const sistemas3 = ['cardiovascular', 'respiratorio', 'digestivo', 'neurologico', 'musculoesqueletico', 'genitourinario', 'endocrino', 'pielFaneras'];
        const noEvaluados = sistemas3.filter(
          (s) => !(formData.revisionSistemas as any)[s].estado
        );
        if (noEvaluados.length > 0) {
          showAlert('error', 'Evaluación incompleta', `Por favor evalúe todos los sistemas. Faltan: ${noEvaluados.join(", ")}`);
          return false;
        }
        const anormalesSinObs = sistemas3.filter(
          (s) => (formData.revisionSistemas as any)[s].estado === "anormal" && !(formData.revisionSistemas as any)[s].observaciones.trim()
        );
        if (anormalesSinObs.length > 0) {
          showAlert('error', 'Observaciones requeridas', `Por favor agregue observaciones para sistemas anormales`);
          return false;
        }
        return true;

      case 4: // Exploración Física
        // Validar Estatura
        if (!formData.estatura || formData.estatura.toString().trim() === '') {
          showAlert('error', 'Campo requerido', 'Por favor ingrese la estatura (cm)');
          return false;
        }
        const estatura = parseFloat(formData.estatura);
        if (isNaN(estatura) || estatura <= 0) {
          showAlert('error', 'Valor inválido', 'La estatura debe ser un número mayor a 0');
          return false;
        }

        // Validar Peso
        if (!formData.peso || formData.peso.toString().trim() === '') {
          showAlert('error', 'Campo requerido', 'Por favor ingrese el peso (kg)');
          return false;
        }
        const peso = parseFloat(formData.peso);
        if (isNaN(peso) || peso <= 0) {
          showAlert('error', 'Valor inválido', 'El peso debe ser un número mayor a 0');
          return false;
        }

        // Validar Presión Arterial
        if (!formData.presionArterial || formData.presionArterial.trim() === '') {
          showAlert('error', 'Campo requerido', 'Por favor ingrese la presión arterial (TA)');
          return false;
        }

        // Validar Frecuencia Cardíaca
        if (!formData.frecuenciaCardiaca || formData.frecuenciaCardiaca.toString().trim() === '') {
          showAlert('error', 'Campo requerido', 'Por favor ingrese la frecuencia cardíaca (FC)');
          return false;
        }
        const fc = parseFloat(formData.frecuenciaCardiaca);
        if (isNaN(fc) || fc <= 0) {
          showAlert('error', 'Valor inválido', 'La frecuencia cardíaca debe ser un número mayor a 0');
          return false;
        }

        // Validar Frecuencia Respiratoria
        if (!formData.frecuenciaRespiratoria || formData.frecuenciaRespiratoria.toString().trim() === '') {
          showAlert('error', 'Campo requerido', 'Por favor ingrese la frecuencia respiratoria (FR)');
          return false;
        }
        const fr = parseFloat(formData.frecuenciaRespiratoria);
        if (isNaN(fr) || fr <= 0) {
          showAlert('error', 'Valor inválido', 'La frecuencia respiratoria debe ser un número mayor a 0');
          return false;
        }

        // Validar Temperatura
        if (!formData.temperatura || formData.temperatura.toString().trim() === '') {
          showAlert('error', 'Campo requerido', 'Por favor ingrese la temperatura (T°)');
          return false;
        }
        const temp = parseFloat(formData.temperatura);
        if (isNaN(temp) || temp <= 0) {
          showAlert('error', 'Valor inválido', 'La temperatura debe ser un número mayor a 0');
          return false;
        }

        // Validar TODOS los sistemas (obligatorio)
        const sistemas4 = ['cardiovascular', 'respiratorio', 'digestivo', 'neurologico', 'musculoesqueletico', 'genitourinario', 'endocrino', 'pielFaneras'];
        const noEvaluados4 = sistemas4.filter(
          (s) => !(formData.exploracionSistemas as any)[s].estado
        );
        if (noEvaluados4.length > 0) {
          showAlert('error', 'Exploración incompleta', `Por favor evalúe TODOS los sistemas. Faltan: ${noEvaluados4.join(", ")}`);
          return false;
        }

        // Validar que TODOS los sistemas tengan observaciones (normal O anormal)
        const anormalesSinObs4 = sistemas4.filter(
          (s) => {
            const sistema = (formData.exploracionSistemas as any)[s];
            return sistema.estado && !sistema.observaciones.trim();
          }
        );
        if (anormalesSinObs4.length > 0) {
          showAlert('error', 'Observaciones requeridas', 'Por favor agregue observaciones para TODOS los sistemas evaluados');
          return false;
        }
        return true;

      case 5: // Pruebas Complementarias
        return true;

      case 6: // Diagnóstico
        if (!formData.analisisObjetivoDiagnostico?.trim()) {
          showAlert('error', 'Campo requerido', 'Por favor complete el Análisis Objetivo');
          return false;
        }
        if (!formData.impresionDiagnostica?.trim()) {
          showAlert('error', 'Campo requerido', 'Por favor complete la Impresión Diagnóstica');
          return false;
        }
        if (formData.diagnosticos.length === 0) {
          showAlert('error', 'Diagnóstico requerido', 'Por favor agregue al menos un diagnóstico CIE-11');
          return false;
        }
        return true;

      case 7: // Plan de Tratamiento
        if (!formData.indicacionesMedicas?.trim()) {
          showAlert('error', 'Campo requerido', 'Por favor ingrese las indicaciones médicas');
          return false;
        }
        if (!formData.planSeguimiento?.trim()) {
          showAlert('error', 'Campo requerido', 'Por favor ingrese el plan de seguimiento');
          return false;
        }
        return true;

      default:
        return true;
    }
  };

  const handleNext = () => {
    if (!validateStep(currentStep)) {
      return;
    }

    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleCancel = () => {
    showAlert('warning', '¿Cancelar formulario?', 'El progreso se ha guardado automáticamente. ¿Desea continuar?', {
      actions: [
        {
          label: 'Continuar',
          onClick: () => {},
          variant: 'secondary',
        },
        {
          label: 'Cancelar',
          onClick: () => {
            localStorage.removeItem(`historia_clinica_${deportista.id}`);
            onBack?.();
          },
          variant: 'danger',
        },
      ],
    });
  };

  const handleSaveProgress = async () => {
    setIsSavingProgress(true);
    try {
      showAlert('success', 'Progreso guardado', 'Su progreso ha sido guardado en el navegador. Continúe cuando esté listo.', {
        duration: 3000,
      });
    } catch (error) {
      showAlert('error', 'Error', 'Error al guardar progreso');
    } finally {
      setIsSavingProgress(false);
    }
  };

  const descargarDocumentoPDF = async (historiaId: string) => {
    try {
      await documentosService.descargarHistoriaClinicaPdf(historiaId);
      toast.success("Documento descargado correctamente");
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Error desconocido";
      toast.error(`Error al descargar documento: ${errorMsg}`);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(7)) {
      return;
    }

    showAlert('warning', 'Guardar Historia Clínica', '¿Está seguro que desea guardar la historia clínica? Esta acción no se puede deshacer.', {
      actions: [
        {
          label: 'Guardar',
          onClick: async () => {
            setIsSubmitting(true);
            try {
              const datosParaEnvio = {
                ...formData,
                ayudasDiagnosticas: formData.ayudasDiagnosticas.map(prueba => ({
                  ...prueba,
                  archivosAdjuntos: (prueba.archivosAdjuntos || []).map(file => ({
                    nombre: file.name,
                    tamaño: file.size,
                    tipo: file.type,
                  }))
                }))
              };

              const datosEnvio = {
                deportista_id: deportista.id,
                ...datosParaEnvio
              };
              
              const response = await historiaClinicaService.crearCompleta(datosEnvio);
              
              setHistoriaGuardadaId(response.historia_clinica_id || response.id);
              
              window.dispatchEvent(new CustomEvent('citasActualizadas', { 
                detail: { deportista_id: deportista.id, historia_id: response.historia_clinica_id || response.id } 
              }));
              
              localStorage.removeItem(`historia_clinica_${deportista.id}`);
              localStorage.setItem('citasActualizadas_timestamp', new Date().toISOString());
              localStorage.setItem('citasActualizadas_deportista', deportista.id);
              
              showAlert('success', 'Historia guardada', 'La historia clínica ha sido guardada correctamente.', {
                duration: 2000,
              });
              
              onSuccess?.(response.historia_clinica_id || response.id);
              
              setTimeout(() => {
                onBack?.();
              }, 2000);
              
            } catch (error) {
              const errorMsg = error instanceof Error ? error.message : "Error desconocido";
              showAlert('error', 'Error al guardar', `Error al guardar la historia clínica: ${errorMsg}`);
              console.error(error);
            } finally {
              setIsSubmitting(false);
            }
          },
          variant: 'primary',
        },
        {
          label: 'Cancelar',
          onClick: () => {},
          variant: 'secondary',
        },
      ],
    });
  };

  const handlePrint = () => {
    if (historiaGuardadaId) {
      descargarDocumentoPDF(historiaGuardadaId);
    } else {
      window.print();
    }
  };

  return (
    <div className="space-y-6">
      {/* Alert Modal */}
      {AlertModal}

      <div className="bg-white rounded-lg shadow-md p-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          {onBack && (
            <button
              onClick={onBack}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Volver"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
          )}
          <div>
            <h1 className="text-3xl font-bold text-blue-600">Historia Clínica Deportiva</h1>
            <p className="text-gray-600 mt-1">
              {deportista.nombres} {deportista.apellidos} • Doc: {deportista.numero_documento}
            </p>
          </div>
        </div>

        {/* Progress Indicator */}
        <ProgressIndicator currentStep={currentStep} totalSteps={totalSteps} />

        {/* Contenido del paso actual */}
        <div className="bg-gray-50 rounded-lg p-8 mb-8">
          {currentStep === 1 && (
            <Evaluacion 
              data={formData} 
              updateData={updateFormData} 
              onNext={handleNext}
              onCancel={handleCancel}
            />
          )}
          {currentStep === 2 && (
            <AntecedentesMedicos 
              data={formData} 
              updateData={updateFormData} 
              onNext={handleNext}
              onPrevious={handlePrevious}
              onCancel={handleCancel}
            />
          )}
          {currentStep === 3 && (
            <RevisionSistemas 
              data={formData} 
              updateData={updateFormData} 
              onNext={handleNext}
              onPrevious={handlePrevious}
              onCancel={handleCancel}
            />
          )}
          {currentStep === 4 && (
            <ExploracionFisica 
              data={formData} 
              updateData={updateFormData} 
              onNext={handleNext}
              onPrevious={handlePrevious}
              onCancel={handleCancel}
            />
          )}
          {currentStep === 5 && (
            <PruebasComplementarias 
              data={formData} 
              updateData={updateFormData} 
              onNext={handleNext}
              onPrevious={handlePrevious}
              onCancel={handleCancel}
            />
          )}
          {currentStep === 6 && (
            <Diagnostico 
              data={formData} 
              updateData={updateFormData} 
              onNext={handleNext}
              onPrevious={handlePrevious}
              onCancel={handleCancel}
            />
          )}
          {currentStep === 7 && (
            <PlanTratamiento 
              data={formData} 
              updateData={updateFormData} 
              onSave={handleSubmit}
              onPrevious={handlePrevious}
              onCancel={handleCancel}
              onPrint={handlePrint}
              historiaId={historiaGuardadaId}
              deportista={deportista}
              historia={null}
            />
          )}
        </div>

        {/* Botones de navegación */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="flex gap-4 w-full sm:w-auto">
            {currentStep > 1 && (
              <button
                onClick={handlePrevious}
                className="flex items-center gap-2 px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-semibold"
              >
                <ChevronLeft className="w-5 h-5" />
                Anterior
              </button>
            )}
          </div>

          <div className="flex gap-4 w-full sm:w-auto">
            <button
              onClick={handleCancel}
              className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold"
            >
              Salir
            </button>

            {currentStep < totalSteps && (
              <button
                onClick={handleNext}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
              >
                Siguiente
                <ChevronRight className="w-5 h-5" />
              </button>
            )}
            {currentStep === totalSteps && (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-green-400 transition-colors font-semibold"
              >
                {isSubmitting ? 'Guardando...' : 'Guardar Historia Clínica'}
              </button>
            )}
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-blue-800">
            <strong>Nota:</strong> Todos los campos marcados con <span className="text-red-500">*</span> son obligatorios. El sistema validará antes de permitir continuar.
          </p>
        </div>
      </div>
    </div>
  );
};

export default HistoriaClinica;