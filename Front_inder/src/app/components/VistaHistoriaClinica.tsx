import { useState, useEffect } from 'react';
import { historiaClinicaService } from '../services/apiClient';
import { toast } from 'sonner';
import { ArrowLeft, Loader } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface VistaHistoriaClinicaProps {
  historiaId: string;
  onNavigate?: (view: string) => void;
}

export function VistaHistoriaClinica({ historiaId, onNavigate }: VistaHistoriaClinicaProps) {
  const [historia, setHistoria] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    cargarHistoria();
  }, [historiaId]);

  const cargarHistoria = async () => {
    try {
      setIsLoading(true);
      const response = await historiaClinicaService.getById(historiaId);
      setHistoria(response);
    } catch (error) {
      toast.error('Error cargando historia clínica');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader className="w-8 h-8 text-blue-600 animate-spin" />
          <p className="text-gray-600">Cargando historia clínica...</p>
        </div>
      </div>
    );
  }

  if (!historia) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <button
            onClick={() => onNavigate?.('historias-clinicas')}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6"
          >
            <ArrowLeft className="w-5 h-5" />
            Volver
          </button>
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            Historia clínica no encontrada
          </div>
        </div>
      </div>
    );
  }

  const deportista = historia.deportista || {};
  const antecedentes = historia.antecedentes_personales || [];
  const antecedentes_familiares = historia.antecedentes_familiares || [];
  const lesiones = historia.lesiones_deportivas || [];
  const cirugias = historia.cirugias_previas || [];
  const alergias = historia.alergias || [];
  const medicaciones = historia.medicaciones || [];
  const vacunas = historia.vacunas_administradas || [];
  const revision_sistemas = historia.revision_sistemas || [];
  const signos_vitales = historia.signos_vitales || [];
  const pruebas = historia.pruebas_complementarias || [];
  const diagnosticos = historia.diagnosticos || [];
  const plan_tratamiento = Array.isArray(historia.plan_tratamiento) ? historia.plan_tratamiento : (historia.plan_tratamiento ? [historia.plan_tratamiento] : []);
  const remisiones = historia.remisiones_especialistas || [];
  const motivo_consulta_enfermedad = historia.motivo_consulta_enfermedad || null;
  const exploracion_fisica = historia.exploracion_fisica_sistemas || null;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">
        {/* ENCABEZADO */}
        <div className="mb-6">
          <button
            onClick={() => onNavigate?.('historias-clinicas')}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Volver al listado
          </button>
          
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Historia Clínica - {deportista.nombres} {deportista.apellidos}
            </h1>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Documento</p>
                <p className="font-semibold text-gray-900">{deportista.numero_documento}</p>
              </div>
              <div>
                <p className="text-gray-600">Fecha Apertura</p>
                <p className="font-semibold text-gray-900">
                  {historia.fecha_apertura ? format(new Date(historia.fecha_apertura), 'd MMM yyyy', { locale: es }) : '-'}
                </p>
              </div>
              <div>
                <p className="text-gray-600">Fecha Creación</p>
                <p className="font-semibold text-gray-900">
                  {historia.created_at ? format(new Date(historia.created_at), 'd MMM yyyy HH:mm', { locale: es }) : '-'}
                </p>
              </div>
              <div>
                <p className="text-gray-600">ID Historia</p>
                <p className="font-semibold text-gray-900 text-xs">{historia.id.slice(0, 8)}...</p>
              </div>
            </div>
          </div>
        </div>

        {/* SECCIONES */}
        <div className="space-y-6">
          {/* MOTIVO DE CONSULTA Y ENFERMEDAD ACTUAL */}
          {motivo_consulta_enfermedad && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Motivo de Consulta y Enfermedad Actual</h2>
              <div className="border-l-4 border-sky-500 pl-4 py-2 space-y-3">
                {motivo_consulta_enfermedad.motivo_consulta && (
                  <div>
                    <p className="font-semibold text-gray-900">Motivo de Consulta</p>
                    <p className="text-gray-600">{motivo_consulta_enfermedad.motivo_consulta}</p>
                  </div>
                )}
                {motivo_consulta_enfermedad.sintomas_principales && (
                  <div>
                    <p className="font-semibold text-gray-900">Síntomas Principales</p>
                    <p className="text-gray-600">{motivo_consulta_enfermedad.sintomas_principales}</p>
                  </div>
                )}
                {motivo_consulta_enfermedad.duracion_sintomas && (
                  <div>
                    <p className="font-semibold text-gray-900">Duración de Síntomas</p>
                    <p className="text-gray-600">{motivo_consulta_enfermedad.duracion_sintomas}</p>
                  </div>
                )}
                {motivo_consulta_enfermedad.inicio_enfermedad && (
                  <div>
                    <p className="font-semibold text-gray-900">Inicio de la Enfermedad</p>
                    <p className="text-gray-600">{motivo_consulta_enfermedad.inicio_enfermedad}</p>
                  </div>
                )}
                {motivo_consulta_enfermedad.evolucion && (
                  <div>
                    <p className="font-semibold text-gray-900">Evolución</p>
                    <p className="text-gray-600">{motivo_consulta_enfermedad.evolucion}</p>
                  </div>
                )}
                {motivo_consulta_enfermedad.factor_desencadenante && (
                  <div>
                    <p className="font-semibold text-gray-900">Factor Desencadenante</p>
                    <p className="text-gray-600">{motivo_consulta_enfermedad.factor_desencadenante}</p>
                  </div>
                )}
                {motivo_consulta_enfermedad.medicamentos_previos && (
                  <div>
                    <p className="font-semibold text-gray-900">Medicamentos Previos</p>
                    <p className="text-gray-600">{motivo_consulta_enfermedad.medicamentos_previos}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ANTECEDENTES PERSONALES */}
          {antecedentes.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Antecedentes Personales</h2>
              <div className="space-y-3">
                {antecedentes.map((a, i) => (
                  <div key={i} className="border-l-4 border-blue-500 pl-4 py-2">
                    <p className="font-semibold text-gray-900">{a.nombre_enfermedad}</p>
                    {a.codigo_cie11 && <p className="text-sm text-gray-600">CIE-11: {a.codigo_cie11}</p>}
                    {a.observaciones && <p className="text-sm text-gray-600">Observaciones: {a.observaciones}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ANTECEDENTES FAMILIARES */}
          {antecedentes_familiares.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Antecedentes Familiares</h2>
              <div className="space-y-3">
                {antecedentes_familiares.map((a, i) => (
                  <div key={i} className="border-l-4 border-purple-500 pl-4 py-2">
                    <p className="font-semibold text-gray-900">{a.nombre_enfermedad}</p>
                    {a.tipo_familiar && <p className="text-sm text-gray-600">Relación: {a.tipo_familiar}</p>}
                    {a.codigo_cie11 && <p className="text-sm text-gray-600">CIE-11: {a.codigo_cie11}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* LESIONES DEPORTIVAS */}
          {lesiones.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Lesiones Deportivas</h2>
              <div className="space-y-3">
                {lesiones.map((l, i) => (
                  <div key={i} className="border-l-4 border-red-500 pl-4 py-2">
                    <p className="font-semibold text-gray-900">{l.tipo_lesion}</p>
                    {l.fecha_lesion && <p className="text-sm text-gray-600">Fecha: {format(new Date(l.fecha_lesion), 'd MMM yyyy', { locale: es })}</p>}
                    {l.tratamiento && <p className="text-sm text-gray-600">Tratamiento: {l.tratamiento}</p>}
                    {l.observaciones && <p className="text-sm text-gray-600">Observaciones: {l.observaciones}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CIRUGÍAS PREVIAS */}
          {cirugias.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Cirugías Previas</h2>
              <div className="space-y-3">
                {cirugias.map((c, i) => (
                  <div key={i} className="border-l-4 border-orange-500 pl-4 py-2">
                    <p className="font-semibold text-gray-900">{c.tipo_cirugia}</p>
                    {c.fecha_cirugia && <p className="text-sm text-gray-600">Fecha: {format(new Date(c.fecha_cirugia), 'd MMM yyyy', { locale: es })}</p>}
                    {c.observaciones && <p className="text-sm text-gray-600">Observaciones: {c.observaciones}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ALERGIAS */}
          {alergias.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Alergias</h2>
              <div className="space-y-3">
                {alergias.map((a, i) => (
                  <div key={i} className="border-l-4 border-yellow-500 pl-4 py-2">
                    <p className="font-semibold text-gray-900">{a.tipo_alergia}</p>
                    {a.descripcion && <p className="text-sm text-gray-600">Descripción: {a.descripcion}</p>}
                    {a.reaccion && <p className="text-sm text-gray-600">Reacción: {a.reaccion}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* MEDICACIONES */}
          {medicaciones.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Medicaciones</h2>
              <div className="space-y-3">
                {medicaciones.map((m, i) => (
                  <div key={i} className="border-l-4 border-green-500 pl-4 py-2">
                    <p className="font-semibold text-gray-900">{m.nombre_medicamento}</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm mt-2">
                      {m.dosis && <p className="text-gray-600">Dosis: {m.dosis}</p>}
                      {m.frecuencia && <p className="text-gray-600">Frecuencia: {m.frecuencia}</p>}
                      {m.duracion && <p className="text-gray-600">Duración: {m.duracion}</p>}
                    </div>
                    {m.indicacion && <p className="text-sm text-gray-600 mt-2">Indicación: {m.indicacion}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* VACUNAS */}
          {vacunas.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Vacunas Administradas</h2>
              <div className="space-y-3">
                {vacunas.map((v, i) => (
                  <div key={i} className="border-l-4 border-indigo-500 pl-4 py-2">
                    <p className="font-semibold text-gray-900">{v.nombre_vacuna}</p>
                    {v.fecha_administracion && <p className="text-sm text-gray-600">Fecha: {format(new Date(v.fecha_administracion), 'd MMM yyyy', { locale: es })}</p>}
                    {v.observaciones && <p className="text-sm text-gray-600">Observaciones: {v.observaciones}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SIGNOS VITALES */}
          {signos_vitales.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Signos Vitales</h2>
              <div className="space-y-3">
                {signos_vitales.map((s, i) => (
                  <div key={i} className="border-l-4 border-cyan-500 pl-4 py-2">
                    <p className="font-semibold text-gray-900">Registro {i + 1}</p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm mt-2">
                      {s.estatura_cm && <p className="text-gray-600">Estatura: {s.estatura_cm} cm</p>}
                      {s.peso_kg && <p className="text-gray-600">Peso: {s.peso_kg} kg</p>}
                      {s.imc && <p className="text-gray-600">IMC: {s.imc}</p>}
                      {s.frecuencia_cardiaca_lpm && <p className="text-gray-600">FC: {s.frecuencia_cardiaca_lpm} lpm</p>}
                      {s.presion_arterial_sistolica && <p className="text-gray-600">PA: {s.presion_arterial_sistolica}/{s.presion_arterial_diastolica}</p>}
                      {s.temperatura_celsius && <p className="text-gray-600">Temp: {s.temperatura_celsius}°C</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* DIAGNÓSTICOS */}
          {diagnosticos.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Diagnósticos</h2>
              <div className="space-y-3">
                {diagnosticos.map((d, i) => (
                  <div key={i} className="border-l-4 border-pink-500 pl-4 py-2">
                    <p className="font-semibold text-gray-900">{d.nombre_enfermedad}</p>
                    {d.codigo_cie11 && <p className="text-sm text-gray-600">CIE-11: {d.codigo_cie11}</p>}
                    {d.impresion_diagnostica && <p className="text-sm text-gray-600">Impresión: {d.impresion_diagnostica}</p>}
                    {d.analisis_objetivo && <p className="text-sm text-gray-600">Análisis: {d.analisis_objetivo}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* PLAN DE TRATAMIENTO */}
          {plan_tratamiento.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Plan de Tratamiento</h2>
              <div className="space-y-4">
                {plan_tratamiento.map((p, i) => (
                  <div key={i} className="border-l-4 border-violet-500 pl-4 py-2 text-sm">
                    {p.indicaciones_medicas && (
                      <div className="mb-3">
                        <p className="font-semibold text-gray-900 mb-1">Indicaciones Médicas</p>
                        <p className="text-gray-600">{p.indicaciones_medicas}</p>
                      </div>
                    )}
                    {p.recomendaciones_entrenamiento && (
                      <div className="mb-3">
                        <p className="font-semibold text-gray-900 mb-1">Recomendaciones de Entrenamiento</p>
                        <p className="text-gray-600">{p.recomendaciones_entrenamiento}</p>
                      </div>
                    )}
                    {p.plan_seguimiento && (
                      <div className="mb-3">
                        <p className="font-semibold text-gray-900 mb-1">Plan de Seguimiento</p>
                        <p className="text-gray-600">{p.plan_seguimiento}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* REMISIONES A ESPECIALISTAS */}
          {remisiones.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Remisiones a Especialistas</h2>
              <div className="space-y-3">
                {remisiones.map((r, i) => (
                  <div key={i} className="border-l-4 border-teal-500 pl-4 py-2">
                    <p className="font-semibold text-gray-900">{r.especialista}</p>
                    <p className="text-sm text-gray-600">Motivo: {r.motivo}</p>
                    <div className="flex gap-4 text-sm mt-2">
                      {r.prioridad && <span className={`px-2 py-1 rounded ${r.prioridad === 'Urgente' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>{r.prioridad}</span>}
                      {r.fecha_remision && <p className="text-gray-600">Fecha: {format(new Date(r.fecha_remision), 'd MMM yyyy', { locale: es })}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* PRUEBAS COMPLEMENTARIAS */}
          {pruebas.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Pruebas Complementarias</h2>
              <div className="space-y-3">
                {pruebas.map((p, i) => (
                  <div key={i} className="border-l-4 border-lime-500 pl-4 py-2">
                    <p className="font-semibold text-gray-900">{p.nombre_prueba}</p>
                    {p.categoria && <p className="text-sm text-gray-600">Categoría: {p.categoria}</p>}
                    {p.codigo_cups && <p className="text-sm text-gray-600">CUPS: {p.codigo_cups}</p>}
                    {p.resultado && <p className="text-sm text-gray-600">Resultado: {p.resultado}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* REVISIÓN DE SISTEMAS */}
          {revision_sistemas.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Revisión de Sistemas</h2>
              <div className="space-y-3">
                {revision_sistemas.map((r, i) => (
                  <div key={i} className="border-l-4 border-slate-500 pl-4 py-2">
                    <p className="font-semibold text-gray-900">{r.sistema_nombre}</p>
                    <p className="text-sm text-gray-600">Estado: {r.estado}</p>
                    {r.observaciones && <p className="text-sm text-gray-600">Observaciones: {r.observaciones}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* EXPLORACIÓN FÍSICA POR SISTEMAS */}
          {exploracion_fisica && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Exploración Física por Sistemas</h2>
              <div className="border-l-4 border-emerald-500 pl-4 py-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {exploracion_fisica.sistema_cardiovascular && (
                    <div>
                      <p className="font-semibold text-gray-900">Sistema Cardiovascular</p>
                      <p className="text-gray-600 text-sm">{exploracion_fisica.sistema_cardiovascular}</p>
                    </div>
                  )}
                  {exploracion_fisica.sistema_respiratorio && (
                    <div>
                      <p className="font-semibold text-gray-900">Sistema Respiratorio</p>
                      <p className="text-gray-600 text-sm">{exploracion_fisica.sistema_respiratorio}</p>
                    </div>
                  )}
                  {exploracion_fisica.sistema_digestivo && (
                    <div>
                      <p className="font-semibold text-gray-900">Sistema Digestivo</p>
                      <p className="text-gray-600 text-sm">{exploracion_fisica.sistema_digestivo}</p>
                    </div>
                  )}
                  {exploracion_fisica.sistema_neurologico && (
                    <div>
                      <p className="font-semibold text-gray-900">Sistema Neurológico</p>
                      <p className="text-gray-600 text-sm">{exploracion_fisica.sistema_neurologico}</p>
                    </div>
                  )}
                  {exploracion_fisica.sistema_genitourinario && (
                    <div>
                      <p className="font-semibold text-gray-900">Sistema Genitourinario</p>
                      <p className="text-gray-600 text-sm">{exploracion_fisica.sistema_genitourinario}</p>
                    </div>
                  )}
                  {exploracion_fisica.sistema_musculoesqueletico && (
                    <div>
                      <p className="font-semibold text-gray-900">Sistema Musculoesquelético</p>
                      <p className="text-gray-600 text-sm">{exploracion_fisica.sistema_musculoesqueletico}</p>
                    </div>
                  )}
                  {exploracion_fisica.sistema_integumentario && (
                    <div>
                      <p className="font-semibold text-gray-900">Sistema Integumentario</p>
                      <p className="text-gray-600 text-sm">{exploracion_fisica.sistema_integumentario}</p>
                    </div>
                  )}
                  {exploracion_fisica.sistema_endocrino && (
                    <div>
                      <p className="font-semibold text-gray-900">Sistema Endocrino</p>
                      <p className="text-gray-600 text-sm">{exploracion_fisica.sistema_endocrino}</p>
                    </div>
                  )}
                  {exploracion_fisica.cabeza_cuello && (
                    <div>
                      <p className="font-semibold text-gray-900">Cabeza y Cuello</p>
                      <p className="text-gray-600 text-sm">{exploracion_fisica.cabeza_cuello}</p>
                    </div>
                  )}
                  {exploracion_fisica.extremidades && (
                    <div>
                      <p className="font-semibold text-gray-900">Extremidades</p>
                      <p className="text-gray-600 text-sm">{exploracion_fisica.extremidades}</p>
                    </div>
                  )}
                </div>
                {exploracion_fisica.observaciones_generales && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="font-semibold text-gray-900">Observaciones Generales</p>
                    <p className="text-gray-600 text-sm">{exploracion_fisica.observaciones_generales}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* MENSAJE SI NO HAY DATOS */}
          {antecedentes.length === 0 && antecedentes_familiares.length === 0 && lesiones.length === 0 && 
           cirugias.length === 0 && alergias.length === 0 && medicaciones.length === 0 && 
           vacunas.length === 0 && signos_vitales.length === 0 && diagnosticos.length === 0 && 
           remisiones.length === 0 && pruebas.length === 0 && revision_sistemas.length === 0 && 
           plan_tratamiento.length === 0 && !motivo_consulta_enfermedad && !exploracion_fisica && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <p className="text-yellow-800">Esta historia clínica aún no contiene información detallada. Edítala para agregar datos.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
