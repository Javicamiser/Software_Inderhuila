import { useState } from "react";
import { HistoriaClinicaData } from "../HistoriaClinica";
import ComponenteAlergias from './ComponenteAlergias';
import VacunasConArchivos from '../VacunasConArchivos';
import { ChevronRight, ChevronLeft, Plus, Trash2, User, Users, AlertCircle } from "lucide-react";
import { buscarEnfermedadPorCodigo, buscarCodigosPorNombre, buscarPorCodigoParcial } from "./cie11Database";

type VacunaConArchivo = {
  id?: string;
  nombre_vacuna: string;
  fecha_administracion?: string;
  observaciones?: string;
  archivo?: File;
  nombre_archivo?: string;
  ruta_archivo?: string;
  tipo_archivo?: string;
  es_nueva?: boolean;
};

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
  const [sugerenciasCodigoPersonal, setSugerenciasCodigoPersonal] = useState<Array<{ codigo: string; nombre: string }>>([]);
  const [mostrarSugerenciasCodigoPersonal, setMostrarSugerenciasCodigoPersonal] = useState(false);

  const [nuevoCodigoFamiliar, setNuevoCodigoFamiliar] = useState("");
  const [nuevoNombreFamiliar, setNuevoNombreFamiliar] = useState("");
  const [nuevoFamiliar, setNuevoFamiliar] = useState("");
  const [nuevaObservacionFamiliar, setNuevaObservacionFamiliar] = useState("");
  const [errorCodigoFamiliar, setErrorCodigoFamiliar] = useState("");
  const [sugerenciasFamiliares, setSugerenciasFamiliares] = useState<Array<{ codigo: string; nombre: string }>>([]);
  const [mostrarSugerenciasFamiliares, setMostrarSugerenciasFamiliares] = useState(false);
  const [sugerenciasCodigoFamiliar, setSugerenciasCodigoFamiliar] = useState<Array<{ codigo: string; nombre: string }>>([]);
  const [mostrarSugerenciasCodigoFamiliar, setMostrarSugerenciasCodigoFamiliar] = useState(false);

  const handleCodigoPersonalChange = (codigo: string) => {
    const codigoUpper = codigo.toUpperCase();
    setNuevoCodigoPersonal(codigoUpper);
    setErrorCodigoPersonal("");

    if (codigoUpper.trim()) {
      const enfermedad = buscarEnfermedadPorCodigo(codigoUpper);
      if (enfermedad) {
        setNuevoNombrePersonal(enfermedad);
        setErrorCodigoPersonal("");
        setSugerenciasCodigoPersonal([]);
        setMostrarSugerenciasCodigoPersonal(false);
      } else {
        const resultados = buscarPorCodigoParcial(codigoUpper);
        if (resultados.length > 0) {
          setSugerenciasCodigoPersonal(resultados);
          setMostrarSugerenciasCodigoPersonal(true);
          setErrorCodigoPersonal("");
        } else {
          setErrorCodigoPersonal("Código CIE-11 no encontrado");
          setSugerenciasCodigoPersonal([]);
          setMostrarSugerenciasCodigoPersonal(false);
        }
        setNuevoNombrePersonal("");
      }
    } else {
      setNuevoNombrePersonal("");
      setSugerenciasCodigoPersonal([]);
      setMostrarSugerenciasCodigoPersonal(false);
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
        setSugerenciasCodigoFamiliar([]);
        setMostrarSugerenciasCodigoFamiliar(false);
      } else {
        const resultados = buscarPorCodigoParcial(codigoUpper);
        if (resultados.length > 0) {
          setSugerenciasCodigoFamiliar(resultados);
          setMostrarSugerenciasCodigoFamiliar(true);
          setErrorCodigoFamiliar("");
        } else {
          setErrorCodigoFamiliar("Código CIE-11 no encontrado");
          setSugerenciasCodigoFamiliar([]);
          setMostrarSugerenciasCodigoFamiliar(false);
        }
        setNuevoNombreFamiliar("");
      }
    } else {
      setNuevoNombreFamiliar("");
      setSugerenciasCodigoFamiliar([]);
      setMostrarSugerenciasCodigoFamiliar(false);
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
    setSugerenciasCodigoPersonal([]);
    setMostrarSugerenciasCodigoPersonal(false);
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
    setSugerenciasCodigoFamiliar([]);
    setMostrarSugerenciasCodigoFamiliar(false);
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
      <div className="border-2 border-blue-200 bg-blue-50 p-6 rounded-xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-blue-600 p-2.5 rounded-lg">
            <User className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-lg font-bold text-blue-900">Antecedentes Personales</h3>
        </div>

        <div className="bg-white p-5 rounded-lg border border-blue-100 space-y-4 mb-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Código CIE-11 */}
            <div className="relative">
              <label className="block mb-2 text-sm font-semibold text-gray-700">
                Código CIE-11
              </label>
              <input
                type="text"
                value={nuevoCodigoPersonal}
                onChange={(e) => handleCodigoPersonalChange(e.target.value)}
                onFocus={() => {
                  if (sugerenciasCodigoPersonal.length > 0) {
                    setMostrarSugerenciasCodigoPersonal(true);
                  }
                }}
                placeholder="Ej: BA00"
                className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 uppercase font-mono"
              />
              {errorCodigoPersonal && (
                <div className="flex items-center gap-2 mt-2 text-red-600 text-sm bg-red-50 p-2 rounded">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{errorCodigoPersonal}</span>
                </div>
              )}
              {mostrarSugerenciasCodigoPersonal && sugerenciasCodigoPersonal.length > 0 && (
                <div className="absolute z-20 bg-white border-2 border-blue-300 rounded-lg shadow-xl max-h-64 overflow-y-auto mt-1 w-full">
                  {sugerenciasCodigoPersonal.map((sugerencia) => (
                    <button
                      key={sugerencia.codigo}
                      type="button"
                      onClick={() => {
                        setNuevoCodigoPersonal(sugerencia.codigo);
                        setNuevoNombrePersonal(sugerencia.nombre);
                        setMostrarSugerenciasCodigoPersonal(false);
                        setErrorCodigoPersonal("");
                      }}
                      className="w-full px-4 py-3 hover:bg-blue-50 border-b border-gray-100 last:border-b-0 transition-colors text-left"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-mono font-bold bg-blue-100 text-blue-700 px-2.5 py-1 rounded">
                          {sugerencia.codigo}
                        </span>
                        <span className="text-sm text-gray-800">{sugerencia.nombre}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Enfermedad */}
            <div className="md:col-span-2 relative">
              <label className="block mb-2 text-sm font-semibold text-gray-700">
                Enfermedad
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
                placeholder="Escriba el nombre (mínimo 3 caracteres)"
                className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              />
              {mostrarSugerenciasPersonales && sugerenciasPersonales.length > 0 && (
                <div className="absolute z-20 bg-white border-2 border-blue-300 rounded-lg shadow-xl max-h-64 overflow-y-auto mt-1 w-full">
                  {sugerenciasPersonales.map((sugerencia) => (
                    <button
                      key={sugerencia.codigo}
                      type="button"
                      onClick={() => {
                        setNuevoCodigoPersonal(sugerencia.codigo);
                        setNuevoNombrePersonal(sugerencia.nombre);
                        setMostrarSugerenciasPersonales(false);
                      }}
                      className="w-full px-4 py-3 hover:bg-blue-50 border-b border-gray-100 last:border-b-0 transition-colors text-left"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-mono font-bold bg-blue-100 text-blue-700 px-2.5 py-1 rounded">
                          {sugerencia.codigo}
                        </span>
                        <span className="text-sm text-gray-800">{sugerencia.nombre}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Observaciones */}
          <div>
            <label className="block mb-2 text-sm font-semibold text-gray-700">
              Observaciones
            </label>
            <textarea
              value={nuevaObservacionPersonal}
              onChange={(e) => setNuevaObservacionPersonal(e.target.value)}
              rows={2}
              placeholder="Detalles adicionales, fecha de diagnóstico, tratamiento actual..."
              className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 resize-none"
            />
          </div>

          {/* Botón Agregar */}
          <button
            type="button"
            onClick={handleAgregarPersonal}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-2.5 px-4 rounded-lg hover:bg-blue-700 transition-all font-semibold shadow-md hover:shadow-lg"
          >
            <Plus className="w-5 h-5" />
            Agregar Antecedente Personal
          </button>
        </div>

        {/* Lista de Antecedentes */}
        {data.antecedentesPersonales.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-semibold text-gray-700 px-1">Antecedentes registrados:</p>
            {data.antecedentesPersonales.map((antecedente, index) => (
              <div
                key={index}
                className="bg-white p-4 rounded-lg border-2 border-blue-100 flex items-start justify-between hover:border-blue-300 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-mono">
                      {antecedente.codigoCIE11}
                    </span>
                    <span className="font-semibold text-gray-800">
                      {antecedente.nombreEnfermedad}
                    </span>
                  </div>
                  {antecedente.observaciones && (
                    <p className="text-sm text-gray-600 mt-2">{antecedente.observaciones}</p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => handleEliminarPersonal(index)}
                  className="ml-3 p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  title="Eliminar"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        )}

        {data.antecedentesPersonales.length === 0 && (
          <p className="text-sm text-gray-500 italic text-center py-4 bg-white rounded-lg border-2 border-dashed border-gray-300">
            No hay antecedentes personales registrados
          </p>
        )}
      </div>

      {/* ANTECEDENTES FAMILIARES */}
      <div className="border-2 border-yellow-200 bg-yellow-50 p-6 rounded-xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-yellow-600 p-2.5 rounded-lg">
            <Users className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-lg font-bold text-yellow-900">Antecedentes Familiares</h3>
        </div>

        <div className="bg-white p-5 rounded-lg border border-yellow-100 space-y-4 mb-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Código CIE-11 */}
            <div className="relative">
              <label className="block mb-2 text-sm font-semibold text-gray-700">
                Código CIE-11
              </label>
              <input
                type="text"
                value={nuevoCodigoFamiliar}
                onChange={(e) => handleCodigoFamiliarChange(e.target.value)}
                onFocus={() => {
                  if (sugerenciasCodigoFamiliar.length > 0) {
                    setMostrarSugerenciasCodigoFamiliar(true);
                  }
                }}
                placeholder="Ej: BA00"
                className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 uppercase font-mono"
              />
              {errorCodigoFamiliar && (
                <div className="flex items-center gap-2 mt-2 text-red-600 text-sm bg-red-50 p-2 rounded">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{errorCodigoFamiliar}</span>
                </div>
              )}
              {mostrarSugerenciasCodigoFamiliar && sugerenciasCodigoFamiliar.length > 0 && (
                <div className="absolute z-20 bg-white border-2 border-yellow-300 rounded-lg shadow-xl max-h-64 overflow-y-auto mt-1 w-full">
                  {sugerenciasCodigoFamiliar.map((sugerencia) => (
                    <button
                      key={sugerencia.codigo}
                      type="button"
                      onClick={() => {
                        setNuevoCodigoFamiliar(sugerencia.codigo);
                        setNuevoNombreFamiliar(sugerencia.nombre);
                        setMostrarSugerenciasCodigoFamiliar(false);
                        setErrorCodigoFamiliar("");
                      }}
                      className="w-full px-4 py-3 hover:bg-yellow-50 border-b border-gray-100 last:border-b-0 transition-colors text-left"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-mono font-bold bg-yellow-100 text-yellow-700 px-2.5 py-1 rounded">
                          {sugerencia.codigo}
                        </span>
                        <span className="text-sm text-gray-800">{sugerencia.nombre}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Enfermedad */}
            <div className="md:col-span-2 relative">
              <label className="block mb-2 text-sm font-semibold text-gray-700">
                Enfermedad
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
                placeholder="Escriba el nombre (mínimo 3 caracteres)"
                className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200"
              />
              {mostrarSugerenciasFamiliares && sugerenciasFamiliares.length > 0 && (
                <div className="absolute z-20 bg-white border-2 border-yellow-300 rounded-lg shadow-xl max-h-64 overflow-y-auto mt-1 w-full">
                  {sugerenciasFamiliares.map((sugerencia) => (
                    <button
                      key={sugerencia.codigo}
                      type="button"
                      onClick={() => {
                        setNuevoCodigoFamiliar(sugerencia.codigo);
                        setNuevoNombreFamiliar(sugerencia.nombre);
                        setMostrarSugerenciasFamiliares(false);
                      }}
                      className="w-full px-4 py-3 hover:bg-yellow-50 border-b border-gray-100 last:border-b-0 transition-colors text-left"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-mono font-bold bg-yellow-100 text-yellow-700 px-2.5 py-1 rounded">
                          {sugerencia.codigo}
                        </span>
                        <span className="text-sm text-gray-800">{sugerencia.nombre}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Familiar afectado */}
          <div>
            <label className="block mb-2 text-sm font-semibold text-gray-700">
              Familiar afectado
            </label>
            <select
              value={nuevoFamiliar}
              onChange={(e) => setNuevoFamiliar(e.target.value)}
              className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 bg-white"
            >
              <option value="">Seleccione...</option>
              {familiares.map((fam) => (
                <option key={fam} value={fam}>
                  {fam}
                </option>
              ))}
            </select>
          </div>

          {/* Observaciones */}
          <div>
            <label className="block mb-2 text-sm font-semibold text-gray-700">
              Observaciones
            </label>
            <textarea
              value={nuevaObservacionFamiliar}
              onChange={(e) => setNuevaObservacionFamiliar(e.target.value)}
              rows={2}
              placeholder="Detalles adicionales sobre el antecedente familiar..."
              className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 resize-none"
            />
          </div>

          {/* Botón Agregar */}
          <button
            type="button"
            onClick={handleAgregarFamiliar}
            className="w-full flex items-center justify-center gap-2 bg-yellow-600 text-white py-2.5 px-4 rounded-lg hover:bg-yellow-700 transition-all font-semibold shadow-md hover:shadow-lg"
          >
            <Plus className="w-5 h-5" />
            Agregar Antecedente Familiar
          </button>
        </div>

        {/* Lista de Antecedentes */}
        {data.antecedentesFamiliares.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-semibold text-gray-700 px-1">Antecedentes registrados:</p>
            {data.antecedentesFamiliares.map((antecedente, index) => (
              <div
                key={index}
                className="bg-white p-4 rounded-lg border-2 border-yellow-100 flex items-start justify-between hover:border-yellow-300 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full font-mono">
                      {antecedente.codigoCIE11}
                    </span>
                    <span className="font-semibold text-gray-800">
                      {antecedente.nombreEnfermedad}
                    </span>
                    <span className="text-xs bg-gray-100 text-gray-700 px-2.5 py-1 rounded">
                      {antecedente.familiar}
                    </span>
                  </div>
                  {antecedente.observaciones && (
                    <p className="text-sm text-gray-600 mt-2">{antecedente.observaciones}</p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => handleEliminarFamiliar(index)}
                  className="ml-3 p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  title="Eliminar"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        )}

        {data.antecedentesFamiliares.length === 0 && (
          <p className="text-sm text-gray-500 italic text-center py-4 bg-white rounded-lg border-2 border-dashed border-gray-300">
            No hay antecedentes familiares registrados
          </p>
        )}
      </div>

      {/* LESIONES PREVIAS */}
      <div className="bg-orange-50 border-2 border-orange-200 p-6 rounded-xl">
        <label className="block mb-4 font-semibold text-gray-800">Lesiones previas</label>
        <div className="flex gap-6 mb-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="radio"
              name="lesiones"
              checked={data.lesionesDeportivas === true}
              onChange={() => updateData({ lesionesDeportivas: true })}
              className="w-5 h-5 text-orange-600 focus:ring-2 focus:ring-orange-300"
            />
            <span className="text-gray-700 font-medium">Sí</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
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
              className="w-5 h-5 text-orange-600 focus:ring-2 focus:ring-orange-300"
            />
            <span className="text-gray-700 font-medium">No</span>
          </label>
        </div>

        {data.lesionesDeportivas && (
          <div className="space-y-4 bg-white p-4 rounded-lg border border-orange-100">
            <div>
              <label className="block mb-2 text-sm font-semibold text-gray-700">Descripción de lesiones</label>
              <textarea
                value={data.descripcionLesiones}
                onChange={(e) => updateData({ descripcionLesiones: e.target.value })}
                rows={4}
                placeholder="Describa las lesiones sufridas (tipo, gravedad, zona afectada)..."
                className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200 resize-none"
              />
            </div>

            <div>
              <label className="block mb-2 text-sm font-semibold text-gray-700">Fecha de la última lesión</label>
              <input
                type="date"
                value={data.fechaUltimaLesion}
                onChange={(e) => updateData({ fechaUltimaLesion: e.target.value })}
                max={new Date().toISOString().split("T")[0]}
                className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
              />
            </div>
          </div>
        )}
      </div>

      {/* CIRUGÍAS PREVIAS */}
      <div className="bg-purple-50 border-2 border-purple-200 p-6 rounded-xl">
        <label className="block mb-4 font-semibold text-gray-800">Cirugías previas</label>
        <div className="flex gap-6 mb-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="radio"
              name="cirugias"
              checked={data.cirugiasPrevias === true}
              onChange={() => updateData({ cirugiasPrevias: true })}
              className="w-5 h-5 text-purple-600 focus:ring-2 focus:ring-purple-300"
            />
            <span className="text-gray-700 font-medium">Sí</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="radio"
              name="cirugias"
              checked={data.cirugiasPrevias === false}
              onChange={() => updateData({ cirugiasPrevias: false, detalleCirugias: "" })}
              className="w-5 h-5 text-purple-600 focus:ring-2 focus:ring-purple-300"
            />
            <span className="text-gray-700 font-medium">No</span>
          </label>
        </div>

        {data.cirugiasPrevias && (
          <textarea
            value={data.detalleCirugias}
            onChange={(e) => updateData({ detalleCirugias: e.target.value })}
            rows={3}
            placeholder="Detalle las cirugías realizadas (tipo, fecha, resultados)..."
            className="w-full px-4 py-2.5 border-2 border-purple-300 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 resize-none bg-white"
          />
        )}
      </div>

      {/* ALERGIAS */}
      <div className="bg-red-50 border-2 border-red-200 p-6 rounded-xl">
        <label className="block mb-4 font-semibold text-gray-800">Alergias</label>
        <div className="flex gap-6 mb-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="radio"
              name="alergias"
              checked={data.tieneAlergias === true}
              onChange={() => updateData({ tieneAlergias: true })}
              className="w-5 h-5 text-red-600 focus:ring-2 focus:ring-red-300"
            />
            <span className="text-gray-700 font-medium">Sí</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="radio"
              name="alergias"
              checked={data.tieneAlergias === false}
              onChange={() => updateData({ tieneAlergias: false, alergias: [] })}
              className="w-5 h-5 text-red-600 focus:ring-2 focus:ring-red-300"
            />
            <span className="text-gray-700 font-medium">No</span>
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
      <div className="bg-cyan-50 border-2 border-cyan-200 p-6 rounded-xl">
        <label className="block mb-4 font-semibold text-gray-800">Medicación actual</label>
        <div className="flex gap-6 mb-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="radio"
              name="medicacion"
              checked={data.tomaMedicacion === true}
              onChange={() => updateData({ tomaMedicacion: true })}
              className="w-5 h-5 text-cyan-600 focus:ring-2 focus:ring-cyan-300"
            />
            <span className="text-gray-700 font-medium">Sí</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="radio"
              name="medicacion"
              checked={data.tomaMedicacion === false}
              onChange={() => updateData({ tomaMedicacion: false, medicacionActual: "" })}
              className="w-5 h-5 text-cyan-600 focus:ring-2 focus:ring-cyan-300"
            />
            <span className="text-gray-700 font-medium">No</span>
          </label>
        </div>

        {data.tomaMedicacion && (
          <input
            type="text"
            value={data.medicacionActual}
            onChange={(e) => updateData({ medicacionActual: e.target.value })}
            placeholder="Especifique los medicamentos que toma actualmente..."
            className="w-full px-4 py-2.5 border-2 border-cyan-300 rounded-lg focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 bg-white"
          />
        )}
      </div>

      {/* VACUNAS */}
      <div className="bg-green-50 border-2 border-green-200 p-6 rounded-xl">
        <label className="block mb-3 font-semibold text-gray-800">Vacunas</label>
        <p className="text-sm text-gray-600 mb-4">
          Aquí se muestran las vacunas registradas del deportista. Puede agregar nuevas vacunas, cargar certificados y descargar archivos.
        </p>
        {data.deportista_id && typeof data.deportista_id === 'string' ? (
          <VacunasConArchivos
            deportista_id={data.deportista_id}
            vacunas={data.vacunas || []}
            onChangeVacunas={(vacunas: VacunaConArchivo[]) => updateData({ vacunas })}
            readonly={false}
          />
        ) : (
          <p className="text-sm text-gray-500 italic text-center py-4 bg-white rounded-lg border-2 border-dashed border-gray-300">
            Los datos del deportista se cargarán cuando se abra la historia clínica.
          </p>
        )}
      </div>
    </div>
  );
}