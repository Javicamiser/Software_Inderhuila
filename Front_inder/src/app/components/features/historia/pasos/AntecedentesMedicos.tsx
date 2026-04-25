import { useState } from "react";
import { HistoriaClinicaData } from "../HistoriaClinica";
import ComponenteAlergias from './ComponenteAlergias';
import VacunasConArchivos from '@/app/components/features/archivos/VacunasConArchivos';
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


// ── Tokens de diseño (consistentes con el sistema) ──────────
const T = {
  primary:      '#1F4788',
  primaryLight: '#EEF3FB',
  surface:      '#ffffff',
  surfaceAlt:   '#f8fafc',
  border:       '#e2e8f0',
  borderLight:  '#f1f5f9',
  textPrimary:  '#0f172a',
  textSecondary:'#475569',
  textMuted:    '#94a3b8',
  danger:       '#ef4444',
  dangerBg:     '#fef2f2',
  success:      '#10b981',
  successBg:    '#f0fdf4',
  radius:       '12px',
  radiusSm:     '8px',
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
      <div style={{ border:`1px solid ${T.border}`, background:T.primaryLight, padding:24, borderRadius:T.radius }}>
        <div className="flex items-center gap-3 mb-6">
          <div style={{ background:T.primary, padding:10, borderRadius:T.radiusSm, display:"flex" }}>
            <User className="w-5 h-5 text-white" />
          </div>
          <h3 style={{ margin:0, fontSize:15, fontWeight:700, color:T.textPrimary }}>Antecedentes Personales</h3>
        </div>

        <div style={{ background:"#fff", padding:18, borderRadius:"8px", border:"1px solid #e2e8f0", marginBottom:16 }}>
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
                <div style={{ display:"flex", alignItems:"center", gap:8, marginTop:8, color:"#ef4444", fontSize:12, background:"#fef2f2", padding:"8px 10px", borderRadius:"6px" }}>
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{errorCodigoPersonal}</span>
                </div>
              )}
              {mostrarSugerenciasCodigoPersonal && sugerenciasCodigoPersonal.length > 0 && (
                <div style={{ position:"absolute", zIndex:20, background:"#fff", border:"1px solid #1F4788", borderRadius:"8px", boxShadow:"0 8px 24px rgba(0,0,0,0.12)", maxHeight:256, overflowY:"auto", marginTop:4, width:"100%" }}>
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
                      style={{ width:"100%", padding:"10px 14px", background:"transparent", border:"none", borderBottom:"1px solid #f1f5f9", cursor:"pointer", textAlign:"left", fontSize:13 }}
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
                <div style={{ position:"absolute", zIndex:20, background:"#fff", border:"1px solid #1F4788", borderRadius:"8px", boxShadow:"0 8px 24px rgba(0,0,0,0.12)", maxHeight:256, overflowY:"auto", marginTop:4, width:"100%" }}>
                  {sugerenciasPersonales.map((sugerencia) => (
                    <button
                      key={sugerencia.codigo}
                      type="button"
                      onClick={() => {
                        setNuevoCodigoPersonal(sugerencia.codigo);
                        setNuevoNombrePersonal(sugerencia.nombre);
                        setMostrarSugerenciasPersonales(false);
                      }}
                      style={{ width:"100%", padding:"10px 14px", background:"transparent", border:"none", borderBottom:"1px solid #f1f5f9", cursor:"pointer", textAlign:"left", fontSize:13 }}
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
            style={{ width:"100%", background:"#1F4788", color:"#fff", padding:"11px 16px", borderRadius:"8px", border:"none", cursor:"pointer", fontSize:13, fontWeight:600, display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}
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
                style={{ background:"#fff", padding:14, borderRadius:"8px", border:"1px solid #e2e8f0", display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:8 }}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span style={{ fontSize:11, fontWeight:700, background:"#EEF3FB", color:"#1F4788", padding:"2px 8px", borderRadius:20, fontFamily:"monospace" }}>
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
                  style={{ marginLeft:8, padding:6, color:"#ef4444", background:"none", border:"none", borderRadius:"6px", cursor:"pointer" }}
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
      <div style={{ border:`1px solid ${T.border}`, background:T.surfaceAlt, padding:24, borderRadius:T.radius }}>
        <div className="flex items-center gap-3 mb-6">
          <div style={{ background:"#1F4788", padding:10, borderRadius:"8px", display:"flex" }}>
            <Users className="w-5 h-5 text-white" />
          </div>
          <h3 style={{ margin:0, fontSize:15, fontWeight:700, color:T.textPrimary }}>Antecedentes Familiares</h3>
        </div>

        <div style={{ background:"#fff", padding:18, borderRadius:"8px", border:"1px solid #e2e8f0", marginBottom:16 }}>
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
                className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 uppercase font-mono"
              />
              {errorCodigoFamiliar && (
                <div style={{ display:"flex", alignItems:"center", gap:8, marginTop:8, color:"#ef4444", fontSize:12, background:"#fef2f2", padding:"8px 10px", borderRadius:"6px" }}>
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
                      style={{ width:"100%", padding:"10px 14px", background:"transparent", border:"none", borderBottom:"1px solid #f1f5f9", cursor:"pointer", textAlign:"left", fontSize:13 }}
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
                      style={{ width:"100%", padding:"10px 14px", background:"transparent", border:"none", borderBottom:"1px solid #f1f5f9", cursor:"pointer", textAlign:"left", fontSize:13 }}
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
              className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-white"
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
              className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 resize-none"
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
                style={{ background:"#fff", padding:14, borderRadius:"8px", border:"1px solid #e2e8f0", display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:8 }}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span style={{ fontSize:11, fontWeight:700, background:"#EEF3FB", color:"#1F4788", padding:"2px 8px", borderRadius:20, fontFamily:"monospace" }}>
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
                  style={{ marginLeft:8, padding:6, color:"#ef4444", background:"none", border:"none", borderRadius:"6px", cursor:"pointer" }}
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
      <div style={{ background:"#f8fafc", border:"1px solid #e2e8f0", padding:24, borderRadius:"12px" }}>
        <label className="block mb-4 font-semibold text-gray-800">Lesiones previas</label>
        <div className="flex gap-6 mb-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="radio"
              name="lesiones"
              checked={data.lesionesDeportivas === true}
              onChange={() => updateData({ lesionesDeportivas: true })}
              className="w-5 h-5" style={{ accentColor:"#1F4788" }}
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
              className="w-5 h-5" style={{ accentColor:"#1F4788" }}
            />
            <span className="text-gray-700 font-medium">No</span>
          </label>
        </div>

        {data.lesionesDeportivas && (
          <div style={{ background:"#fff", padding:16, borderRadius:"8px", border:"1px solid #e2e8f0" }}>
            <div>
              <label className="block mb-2 text-sm font-semibold text-gray-700">Descripción de lesiones</label>
              <textarea
                value={data.descripcionLesiones}
                onChange={(e) => updateData({ descripcionLesiones: e.target.value })}
                rows={4}
                placeholder="Describa las lesiones sufridas (tipo, gravedad, zona afectada)..."
                className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 resize-none"
              />
            </div>

            <div>
              <label className="block mb-2 text-sm font-semibold text-gray-700">Fecha de la última lesión</label>
              <input
                type="date"
                value={data.fechaUltimaLesion}
                onChange={(e) => updateData({ fechaUltimaLesion: e.target.value })}
                max={new Date().toISOString().split("T")[0]}
                className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              />
            </div>
          </div>
        )}
      </div>

      {/* CIRUGÍAS PREVIAS */}
      <div style={{ background:"#f8fafc", border:"1px solid #e2e8f0", padding:24, borderRadius:"12px" }}>
        <label className="block mb-4 font-semibold text-gray-800">Cirugías previas</label>
        <div className="flex gap-6 mb-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="radio"
              name="cirugias"
              checked={data.cirugiasPrevias === true}
              onChange={() => updateData({ cirugiasPrevias: true })}
              className="w-5 h-5" style={{ accentColor:"#1F4788" }}
            />
            <span className="text-gray-700 font-medium">Sí</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="radio"
              name="cirugias"
              checked={data.cirugiasPrevias === false}
              onChange={() => updateData({ cirugiasPrevias: false, detalleCirugias: "" })}
              className="w-5 h-5" style={{ accentColor:"#1F4788" }}
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
            className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 resize-none bg-white"
          />
        )}
      </div>

      {/* ALERGIAS */}
      <div style={{ background:"#f8fafc", border:"1px solid #e2e8f0", padding:24, borderRadius:"12px" }}>
        <label className="block mb-4 font-semibold text-gray-800">Alergias</label>
        <div className="flex gap-6 mb-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="radio"
              name="alergias"
              checked={data.tieneAlergias === true}
              onChange={() => updateData({ tieneAlergias: true })}
              className="w-5 h-5" style={{ accentColor:"#1F4788" }}
            />
            <span className="text-gray-700 font-medium">Sí</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="radio"
              name="alergias"
              checked={data.tieneAlergias === false}
              onChange={() => updateData({ tieneAlergias: false, alergias: [] })}
              className="w-5 h-5" style={{ accentColor:"#1F4788" }}
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
      <div style={{ background:"#f8fafc", border:"1px solid #e2e8f0", padding:24, borderRadius:"12px" }}>
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