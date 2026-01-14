import { useState } from "react";
import { HistoriaClinicaData } from "../HistoriaClinica";
import ComponenteAlergias from './ComponenteAlergias';
import VacunasHistoriaClinica from '../VacunasHistoriaClinica';
import { ChevronRight, ChevronLeft, Plus, Trash2, User, Users, AlertCircle } from "lucide-react";
import { buscarEnfermedadPorCodigo, buscarCodigosPorNombre } from "./cie11Database";

type Props = {
  data: HistoriaClinicaData;
  updateData: (data: Partial<HistoriaClinicaData>) => void;
  onNext: () => void;
  onPrevious: () => void;
  onCancel?: () => void;
};

const familiares = [
  "Padre",
  "Madre",
  "Hermano/a",
  "Abuelo Paterno",
  "Abuela Paterna",
  "Abuelo Materno",
  "Abuela Materna",
  "Tío/a Paterno/a",
  "Tío/a Materno/a",
  "Otro"
];

export function AntecedentesMedicos({ data, updateData, onNext, onPrevious, onCancel }: Props) {
  const [nuevoCodigoPersonal, setNuevoCodigoPersonal] = useState("");
  const [nuevoNombrePersonal, setNuevoNombrePersonal] = useState("");
  const [nuevaObservacionPersonal, setNuevaObservacionPersonal] = useState("");
  const [errorCodigoPersonal, setErrorCodigoPersonal] = useState("");
  const [sugerenciasPersonales, setSugerenciasPersonales] = useState<Array<{ codigo: string; nombre: string }>>([]);
  const [mostrarSugerenciasPersonales, setMostrarSugerenciasPersonales] = useState(false);

  const [nuevoCodigoFamiliar, setNuevoCodigoFamiliar] = useState("");
  const [nuevoNombreFamiliar, setNuevoNombreFamiliar] = useState("");
  const [nuevoFamiliar, setNuevoFamiliar] = useState("");
  const [nuevaObservacionFamiliar, setNuevaObservacionFamiliar] = useState("");
  const [errorCodigoFamiliar, setErrorCodigoFamiliar] = useState("");
  const [sugerenciasFamiliares, setSugerenciasFamiliares] = useState<Array<{ codigo: string; nombre: string }>>([]);
  const [mostrarSugerenciasFamiliares, setMostrarSugerenciasFamiliares] = useState(false);

  const handleCodigoPersonalChange = (codigo: string) => {
    const codigoUpper = codigo.toUpperCase();
    setNuevoCodigoPersonal(codigoUpper);
    setErrorCodigoPersonal("");

    if (codigoUpper.trim()) {
      const enfermedad = buscarEnfermedadPorCodigo(codigoUpper);
      if (enfermedad) {
        setNuevoNombrePersonal(enfermedad);
        setErrorCodigoPersonal("");
      } else {
        setErrorCodigoPersonal("Código CIE-11 no encontrado");
        setNuevoNombrePersonal("");
      }
    } else {
      setNuevoNombrePersonal("");
    }
  };

  const handleNombrePersonalChange = (nombre: string) => {
    setNuevoNombrePersonal(nombre);
    setErrorCodigoPersonal("");

    if (nombre.trim() && nombre.length >= 3) {
      const resultados = buscarCodigosPorNombre(nombre);
      if (resultados.length > 0) {
        setSugerenciasPersonales(resultados);
        setMostrarSugerenciasPersonales(true);
      } else {
        setNuevoCodigoPersonal("");
        setSugerenciasPersonales([]);
        setMostrarSugerenciasPersonales(false);
      }
    } else {
      setSugerenciasPersonales([]);
      setMostrarSugerenciasPersonales(false);
    }
  };

  const handleCodigoFamiliarChange = (codigo: string) => {
    const codigoUpper = codigo.toUpperCase();
    setNuevoCodigoFamiliar(codigoUpper);
    setErrorCodigoFamiliar("");

    if (codigoUpper.trim()) {
      const enfermedad = buscarEnfermedadPorCodigo(codigoUpper);
      if (enfermedad) {
        setNuevoNombreFamiliar(enfermedad);
        setErrorCodigoFamiliar("");
      } else {
        setErrorCodigoFamiliar("Código CIE-11 no encontrado");
        setNuevoNombreFamiliar("");
      }
    } else {
      setNuevoNombreFamiliar("");
    }
  };

  const handleNombreFamiliarChange = (nombre: string) => {
    setNuevoNombreFamiliar(nombre);
    setErrorCodigoFamiliar("");

    if (nombre.trim() && nombre.length >= 3) {
      const resultados = buscarCodigosPorNombre(nombre);
      if (resultados.length > 0) {
        setSugerenciasFamiliares(resultados);
        setMostrarSugerenciasFamiliares(true);
      } else {
        setNuevoCodigoFamiliar("");
        setSugerenciasFamiliares([]);
        setMostrarSugerenciasFamiliares(false);
      }
    } else {
      setSugerenciasFamiliares([]);
      setMostrarSugerenciasFamiliares(false);
    }
  };

  const handleAgregarPersonal = () => {
    if (!nuevoCodigoPersonal.trim()) {
      alert("Ingrese un código CIE-11");
      return;
    }
    if (!nuevoNombrePersonal.trim()) {
      alert("Primero busque el código CIE-11 para verificar la enfermedad");
      return;
    }

    const nuevoAntecedente = {
      codigoCIE11: nuevoCodigoPersonal.toUpperCase().trim(),
      nombreEnfermedad: nuevoNombrePersonal,
      observaciones: nuevaObservacionPersonal,
    };

    updateData({
      antecedentesPersonales: [...data.antecedentesPersonales, nuevoAntecedente],
    });

    setNuevoCodigoPersonal("");
    setNuevoNombrePersonal("");
    setNuevaObservacionPersonal("");
    setErrorCodigoPersonal("");
    setSugerenciasPersonales([]);
    setMostrarSugerenciasPersonales(false);
  };

  const handleAgregarFamiliar = () => {
    if (!nuevoCodigoFamiliar.trim()) {
      alert("Ingrese un código CIE-11");
      return;
    }
    if (!nuevoNombreFamiliar.trim()) {
      alert("Primero busque el código CIE-11 para verificar la enfermedad");
      return;
    }
    if (!nuevoFamiliar) {
      alert("Seleccione el familiar afectado");
      return;
    }

    const nuevoAntecedente = {
      codigoCIE11: nuevoCodigoFamiliar.toUpperCase().trim(),
      nombreEnfermedad: nuevoNombreFamiliar,
      familiar: nuevoFamiliar,
      observaciones: nuevaObservacionFamiliar,
    };

    updateData({
      antecedentesFamiliares: [...data.antecedentesFamiliares, nuevoAntecedente],
    });

    setNuevoCodigoFamiliar("");
    setNuevoNombreFamiliar("");
    setNuevoFamiliar("");
    setNuevaObservacionFamiliar("");
    setErrorCodigoFamiliar("");
    setSugerenciasFamiliares([]);
    setMostrarSugerenciasFamiliares(false);
  };

  const handleEliminarPersonal = (index: number) => {
    const updated = data.antecedentesPersonales.filter((_, i) => i !== index);
    updateData({ antecedentesPersonales: updated });
  };

  const handleEliminarFamiliar = (index: number) => {
    const updated = data.antecedentesFamiliares.filter((_, i) => i !== index);
    updateData({ antecedentesFamiliares: updated });
  };

  return (
    <div className="space-y-8">
      {/* ANTECEDENTES PERSONALES */}
      <div className="bg-gradient-to-r from-blue-50 to-blue-100/50 p-6 rounded-lg border-l-4 border-blue-500">
        <div className="flex items-center gap-2 mb-4">
          <User className="w-6 h-6 text-blue-600" />
          <h3 className="text-lg font-semibold text-blue-900">Antecedentes Personales</h3>
        </div>

        <div className="bg-white p-4 rounded-lg space-y-4 mb-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Código CIE-11 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={nuevoCodigoPersonal}
                onChange={(e) => handleCodigoPersonalChange(e.target.value)}
                placeholder="Ej: BA00"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase"
              />
              {errorCodigoPersonal && (
                <div className="flex items-center gap-1 mt-1 text-red-500 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  <span>{errorCodigoPersonal}</span>
                </div>
              )}
            </div>

            <div className="md:col-span-2 relative">
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Enfermedad <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={nuevoNombrePersonal}
                onChange={(e) => handleNombrePersonalChange(e.target.value)}
                onFocus={() => {
                  if (sugerenciasPersonales.length > 0) {
                    setMostrarSugerenciasPersonales(true);
                  }
                }}
                placeholder="Escriba el nombre de la enfermedad (mínimo 3 caracteres)"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {mostrarSugerenciasPersonales && sugerenciasPersonales.length > 0 && (
                <div className="absolute z-20 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto mt-1 w-full">
                  {sugerenciasPersonales.map((sugerencia) => (
                    <div
                      key={sugerencia.codigo}
                      className="px-4 py-2 cursor-pointer hover:bg-blue-50 border-b border-gray-100 last:border-b-0 transition-colors"
                      onClick={() => {
                        setNuevoCodigoPersonal(sugerencia.codigo);
                        setNuevoNombrePersonal(sugerencia.nombre);
                        setMostrarSugerenciasPersonales(false);
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                          {sugerencia.codigo}
                        </span>
                        <span className="text-sm text-gray-800">{sugerencia.nombre}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Observaciones
            </label>
            <textarea
              value={nuevaObservacionPersonal}
              onChange={(e) => setNuevaObservacionPersonal(e.target.value)}
              rows={2}
              placeholder="Detalles adicionales, fecha de diagnóstico, tratamiento actual..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          <button
            type="button"
            onClick={handleAgregarPersonal}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Agregar Antecedente Personal
          </button>
        </div>

        {data.antecedentesPersonales.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700 mb-2">Antecedentes registrados:</p>
            {data.antecedentesPersonales.map((antecedente, index) => (
              <div
                key={index}
                className="bg-white p-3 rounded-md border border-gray-200 flex items-start justify-between"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                      {antecedente.codigoCIE11}
                    </span>
                    <span className="font-medium text-gray-800">
                      {antecedente.nombreEnfermedad}
                    </span>
                  </div>
                  {antecedente.observaciones && (
                    <p className="text-sm text-gray-600 mt-1">{antecedente.observaciones}</p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => handleEliminarPersonal(index)}
                  className="ml-3 p-1.5 text-red-500 hover:bg-red-50 rounded transition-colors"
                  title="Eliminar"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {data.antecedentesPersonales.length === 0 && (
          <p className="text-sm text-gray-500 italic text-center py-2">
            No hay antecedentes personales registrados
          </p>
        )}
      </div>

      {/* ANTECEDENTES FAMILIARES */}
      <div className="bg-gradient-to-r from-[#B8C91A]/20 to-[#B8C91A]/10 p-6 rounded-lg border-l-4 border-[#B8C91A]">
        <div className="flex items-center gap-2 mb-4">
          <Users className="w-6 h-6 text-[#93A115]" />
          <h3 className="text-lg font-semibold text-gray-900">Antecedentes Familiares</h3>
        </div>

        <div className="bg-white p-4 rounded-lg space-y-4 mb-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Código CIE-11 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={nuevoCodigoFamiliar}
                onChange={(e) => handleCodigoFamiliarChange(e.target.value)}
                placeholder="Ej: BA00"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#B8C91A] uppercase"
              />
              {errorCodigoFamiliar && (
                <div className="flex items-center gap-1 mt-1 text-red-500 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  <span>{errorCodigoFamiliar}</span>
                </div>
              )}
            </div>

            <div className="md:col-span-2 relative">
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Enfermedad <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={nuevoNombreFamiliar}
                onChange={(e) => handleNombreFamiliarChange(e.target.value)}
                onFocus={() => {
                  if (sugerenciasFamiliares.length > 0) {
                    setMostrarSugerenciasFamiliares(true);
                  }
                }}
                placeholder="Escriba el nombre de la enfermedad (mínimo 3 caracteres)"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#B8C91A]"
              />
              {mostrarSugerenciasFamiliares && sugerenciasFamiliares.length > 0 && (
                <div className="absolute z-20 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto mt-1 w-full">
                  {sugerenciasFamiliares.map((sugerencia) => (
                    <div
                      key={sugerencia.codigo}
                      className="px-4 py-2 cursor-pointer hover:bg-blue-50 border-b border-gray-100 last:border-b-0 transition-colors"
                      onClick={() => {
                        setNuevoCodigoFamiliar(sugerencia.codigo);
                        setNuevoNombreFamiliar(sugerencia.nombre);
                        setMostrarSugerenciasFamiliares(false);
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                          {sugerencia.codigo}
                        </span>
                        <span className="text-sm text-gray-800">{sugerencia.nombre}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Familiar afectado <span className="text-red-500">*</span>
            </label>
            <select
              value={nuevoFamiliar}
              onChange={(e) => setNuevoFamiliar(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#B8C91A]"
            >
              <option value="">Seleccione...</option>
              {familiares.map((fam) => (
                <option key={fam} value={fam}>
                  {fam}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Observaciones
            </label>
            <textarea
              value={nuevaObservacionFamiliar}
              onChange={(e) => setNuevaObservacionFamiliar(e.target.value)}
              rows={2}
              placeholder="Detalles adicionales sobre el antecedente familiar..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#B8C91A] resize-none"
            />
          </div>

          <button
            type="button"
            onClick={handleAgregarFamiliar}
            className="w-full flex items-center justify-center gap-2 bg-[#B8C91A] text-gray-800 py-2 px-4 rounded-md hover:bg-[#93A115] hover:text-white transition-colors"
          >
            <Plus className="w-5 h-5" />
            Agregar Antecedente Familiar
          </button>
        </div>

        {data.antecedentesFamiliares.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700 mb-2">Antecedentes registrados:</p>
            {data.antecedentesFamiliares.map((antecedente, index) => (
              <div
                key={index}
                className="bg-white p-3 rounded-md border border-gray-200 flex items-start justify-between"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-mono bg-[#B8C91A]/30 text-gray-800 px-2 py-0.5 rounded">
                      {antecedente.codigoCIE11}
                    </span>
                    <span className="font-medium text-gray-800">
                      {antecedente.nombreEnfermedad}
                    </span>
                    <span className="text-sm text-gray-500">
                      • {antecedente.familiar}
                    </span>
                  </div>
                  {antecedente.observaciones && (
                    <p className="text-sm text-gray-600 mt-1">{antecedente.observaciones}</p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => handleEliminarFamiliar(index)}
                  className="ml-3 p-1.5 text-red-500 hover:bg-red-50 rounded transition-colors"
                  title="Eliminar"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {data.antecedentesFamiliares.length === 0 && (
          <p className="text-sm text-gray-500 italic text-center py-2">
            No hay antecedentes familiares registrados
          </p>
        )}
      </div>

      {/* LESIONES PREVIAS */}
      <div>
        <label className="block mb-3 font-medium text-gray-800">Lesiones previas</label>
        <div className="flex gap-4 mb-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="lesiones"
              checked={data.lesionesDeportivas === true}
              onChange={() => updateData({ lesionesDeportivas: true })}
              className="w-4 h-4 text-blue-600 focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-gray-700">Sí</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="lesiones"
              checked={data.lesionesDeportivas === false}
              onChange={() =>
                updateData({
                  lesionesDeportivas: false,
                  descripcionLesiones: "",
                  fechaUltimaLesion: "",
                })
              }
              className="w-4 h-4 text-blue-600 focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-gray-700">No</span>
          </label>
        </div>

        {data.lesionesDeportivas && (
          <div className="space-y-4">
            <div>
              <label className="block mb-2 text-sm text-gray-600">Descripción de lesiones</label>
              <textarea
                value={data.descripcionLesiones}
                onChange={(e) => updateData({ descripcionLesiones: e.target.value })}
                rows={4}
                placeholder="Describa las lesiones sufridas (tipo, gravedad, zona afectada)..."
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>

            <div>
              <label className="block mb-2 text-sm text-gray-600">Fecha de la última lesión</label>
              <input
                type="date"
                value={data.fechaUltimaLesion}
                onChange={(e) => updateData({ fechaUltimaLesion: e.target.value })}
                max={new Date().toISOString().split("T")[0]}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        )}
      </div>

      {/* CIRUGÍAS PREVIAS */}
      <div>
        <label className="block mb-3 font-medium text-gray-800">Cirugías previas</label>
        <div className="flex gap-4 mb-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="cirugias"
              checked={data.cirugiasPrevias === true}
              onChange={() => updateData({ cirugiasPrevias: true })}
              className="w-4 h-4 text-blue-600 focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-gray-700">Sí</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="cirugias"
              checked={data.cirugiasPrevias === false}
              onChange={() => updateData({ cirugiasPrevias: false, detalleCirugias: "" })}
              className="w-4 h-4 text-blue-600 focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-gray-700">No</span>
          </label>
        </div>

        {data.cirugiasPrevias && (
          <textarea
            value={data.detalleCirugias}
            onChange={(e) => updateData({ detalleCirugias: e.target.value })}
            rows={3}
            placeholder="Detalle las cirugías realizadas (tipo, fecha, resultados)..."
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        )}
      </div>

      {/* ALERGIAS */}
      <div>
        <label className="block mb-3 font-medium text-gray-800">Alergias</label>
        <div className="flex gap-4 mb-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="alergias"
              checked={data.tieneAlergias === true}
              onChange={() => updateData({ tieneAlergias: true })}
              className="w-4 h-4 text-blue-600 focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-gray-700">Sí</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="alergias"
              checked={data.tieneAlergias === false}
              onChange={() => updateData({ tieneAlergias: false, alergias: [] })}
              className="w-4 h-4 text-blue-600 focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-gray-700">No</span>
          </label>
        </div>

        <ComponenteAlergias
          tieneAlergias={data.tieneAlergias}
          alergias={data.alergias}
          onChangeTieneAlergias={(value) => 
            updateData({ tieneAlergias: value })
          }
          onChangeAlergias={(alergias) => 
            updateData({ alergias })
          }
        />
      </div>

      {/* MEDICACIÓN ACTUAL */}
      <div>
        <label className="block mb-3 font-medium text-gray-800">Medicación actual</label>
        <div className="flex gap-4 mb-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="medicacion"
              checked={data.tomaMedicacion === true}
              onChange={() => updateData({ tomaMedicacion: true })}
              className="w-4 h-4 text-blue-600 focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-gray-700">Sí</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="medicacion"
              checked={data.tomaMedicacion === false}
              onChange={() => updateData({ tomaMedicacion: false, medicacionActual: "" })}
              className="w-4 h-4 text-blue-600 focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-gray-700">No</span>
          </label>
        </div>

        {data.tomaMedicacion && (
          <input
            type="text"
            value={data.medicacionActual}
            onChange={(e) => updateData({ medicacionActual: e.target.value })}
            placeholder="Especifique los medicamentos que toma actualmente..."
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        )}
      </div>

      {/* VACUNAS */}
      <div>
        <label className="block mb-3 font-medium text-gray-800">Vacunas</label>
        <p className="text-sm text-gray-600 mb-4">
          Aquí se muestran las vacunas registradas del deportista. Puede agregar nuevas vacunas, cargar certificados y descargar archivos.
        </p>
        {data.deportista_id && typeof data.deportista_id === 'string' ? (
          <VacunasHistoriaClinica 
            deportista_id={data.deportista_id}
            readonly={false}
          />
        ) : (
          <p className="text-sm text-gray-500 italic text-center py-4">
            Los datos del deportista se cargarán cuando se abra la historia clínica.
          </p>
        )}
      </div>

      {/* Botones */}
      <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200">
        <button
          onClick={onPrevious}
          className="flex-1 flex items-center justify-center gap-2 bg-gray-300 text-gray-700 py-3 px-6 rounded-md hover:bg-gray-400 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
          Anterior
        </button>
        <button
          onClick={onNext}
          className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 transition-colors"
        >
          Siguiente
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}