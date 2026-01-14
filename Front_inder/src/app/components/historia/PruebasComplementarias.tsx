import { useState, useRef } from "react";
import { HistoriaClinicaData } from "../HistoriaClinica";
import { ChevronLeft, ChevronRight, Upload, X, Plus, Trash2, FlaskConical, ScanLine, Activity, Dumbbell, AlertCircle, Search, File, Paperclip } from "lucide-react";
import { buscarProcedimientoPorCodigo, buscarCodigosPorNombre, formatearCodigoCUPS } from "./cupsDatabase";

type Props = {
  data: HistoriaClinicaData;
  updateData: (data: Partial<HistoriaClinicaData>) => void;
  onNext: () => void;
  onPrevious: () => void;
  onCancel?: () => void;
};

const getCategoriaIcon = (categoria: string) => {
  switch (categoria) {
    case "Laboratorios":
      return { Icon: FlaskConical, color: "text-purple-600", bgColor: "bg-purple-50" };
    case "Imágenes":
      return { Icon: ScanLine, color: "text-blue-600", bgColor: "bg-blue-50" };
    case "Pruebas Funcionales":
      return { Icon: Activity, color: "text-green-600", bgColor: "bg-green-50" };
    case "Pruebas Deportivas":
      return { Icon: Dumbbell, color: "text-orange-600", bgColor: "bg-orange-50" };
    case "Procedimientos":
      return { Icon: Activity, color: "text-indigo-600", bgColor: "bg-indigo-50" };
    default:
      return { Icon: Activity, color: "text-gray-600", bgColor: "bg-gray-50" };
  }
};

export function PruebasComplementarias({ data, updateData, onNext, onPrevious }: Props) {
  const [codigoCUPS, setCodigoCUPS] = useState("");
  const [nombreProcedimiento, setNombreProcedimiento] = useState("");
  const [categoriaProcedimiento, setCategoriaProcedimiento] = useState("");
  const [resultado, setResultado] = useState("");
  const [errorCodigoCUPS, setErrorCodigoCUPS] = useState("");
  const [sugerenciasCUPS, setSugerenciasCUPS] = useState<Array<{ codigo: string; nombre: string; categoria: string }>>([]);
  const [mostrarSugerenciasCUPS, setMostrarSugerenciasCUPS] = useState(false);
  const [archivosSeleccionados, setArchivosSeleccionados] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Buscar automáticamente por código CUPS
  const handleCodigoCUPSChange = (codigo: string) => {
    const codigoLimpio = codigo.trim().replace(/\D/g, ""); // Solo números
    setCodigoCUPS(codigoLimpio);
    setErrorCodigoCUPS("");

    if (codigoLimpio.length >= 3) {
      const procedimiento = buscarProcedimientoPorCodigo(codigoLimpio);
      if (procedimiento) {
        setNombreProcedimiento(procedimiento.nombre);
        setCategoriaProcedimiento(procedimiento.categoria);
        setErrorCodigoCUPS("");
      } else {
        setErrorCodigoCUPS("Código CUPS no encontrado");
        setNombreProcedimiento("");
        setCategoriaProcedimiento("");
      }
    } else {
      setNombreProcedimiento("");
      setCategoriaProcedimiento("");
    }
  };

  // Buscar automáticamente por nombre de procedimiento
  const handleNombreProcedimientoChange = (nombre: string) => {
    setNombreProcedimiento(nombre);
    setErrorCodigoCUPS("");

    if (nombre.trim() && nombre.length >= 3) {
      const resultados = buscarCodigosPorNombre(nombre);
      if (resultados.length > 0) {
        setSugerenciasCUPS(resultados);
        setMostrarSugerenciasCUPS(true);
      } else {
        // Permitir escribir procedimiento personalizado
        setCodigoCUPS("");
        setCategoriaProcedimiento("");
        setSugerenciasCUPS([]);
        setMostrarSugerenciasCUPS(false);
      }
    } else {
      setSugerenciasCUPS([]);
      setMostrarSugerenciasCUPS(false);
    }
  };

  // Seleccionar una sugerencia de la lista
  const seleccionarSugerenciaCUPS = (codigo: string, nombre: string, categoria: string) => {
    setCodigoCUPS(codigo);
    setNombreProcedimiento(nombre);
    setCategoriaProcedimiento(categoria);
    setMostrarSugerenciasCUPS(false);
    setSugerenciasCUPS([]);
    setErrorCodigoCUPS("");
  };

  // Manejar selección de archivos
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setArchivosSeleccionados([...archivosSeleccionados, ...newFiles]);
    }
  };

  // Eliminar archivo seleccionado
  const eliminarArchivoSeleccionado = (index: number) => {
    setArchivosSeleccionados(archivosSeleccionados.filter((_, i) => i !== index));
  };

  const handleAgregarPrueba = () => {
    if (!nombreProcedimiento.trim()) {
      alert("Busque y seleccione un procedimiento o escriba el nombre de la prueba");
      return;
    }

    const nuevaPrueba = {
      categoria: categoriaProcedimiento || "Sin categoría",
      nombrePrueba: nombreProcedimiento.trim(),
      codigoCUPS: codigoCUPS,
      resultado: resultado,
      archivosAdjuntos: archivosSeleccionados,
    };

    updateData({
      ayudasDiagnosticas: [...data.ayudasDiagnosticas, nuevaPrueba],
    });

    // Limpiar campos
    setCodigoCUPS("");
    setNombreProcedimiento("");
    setCategoriaProcedimiento("");
    setResultado("");
    setErrorCodigoCUPS("");
    setSugerenciasCUPS([]);
    setMostrarSugerenciasCUPS(false);
    setArchivosSeleccionados([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleEliminarPrueba = (index: number) => {
    const updated = data.ayudasDiagnosticas.filter((_, i) => i !== index);
    updateData({ ayudasDiagnosticas: updated });
  };

  // Eliminar archivo de una prueba existente
  const handleEliminarArchivoPrueba = (indexPrueba: number, indexArchivo: number) => {
    const pruebasActualizadas = data.ayudasDiagnosticas.map((prueba, i) => {
      if (i === indexPrueba) {
        return {
          ...prueba,
          archivosAdjuntos: prueba.archivosAdjuntos.filter((_, j) => j !== indexArchivo),
        };
      }
      return prueba;
    });
    updateData({ ayudasDiagnosticas: pruebasActualizadas });
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-[#C84F3B]/10 to-[#1F4788]/10 p-4 rounded-lg border-l-4 border-[#C84F3B]">
        <p className="text-sm text-gray-700">
          <span className="font-semibold">Ayudas diagnósticas:</span> Busque el procedimiento mediante código CUPS o por nombre.
          El sistema identificará automáticamente el tipo de prueba. Este campo es opcional y se completa solo si se requieren exámenes adicionales.
        </p>
      </div>

      {/* Formulario para agregar ayuda diagnóstica */}
      <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
        <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Search className="w-5 h-5 text-[#C84F3B]" />
          Buscar Ayuda Diagnóstica
        </h3>
        
        <div className="space-y-4">
          {/* Código CUPS - Sistema de búsqueda */}
          <div className="relative">
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Código CUPS
            </label>
            <div className="relative">
              <input
                type="text"
                value={codigoCUPS}
                onChange={(e) => handleCodigoCUPSChange(e.target.value)}
                placeholder="Ej: 902201, 890201, 990101..."
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errorCodigoCUPS ? "border-red-300" : "border-gray-300"
                }`}
              />
              <Search className="absolute right-3 top-2.5 w-5 h-5 text-gray-400" />
            </div>
            {errorCodigoCUPS && (
              <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                <span>{errorCodigoCUPS}</span>
              </p>
            )}
            {codigoCUPS && nombreProcedimiento && !errorCodigoCUPS && (
              <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-md">
                <p className="text-sm text-green-700">
                  <span className="font-semibold">✓ Procedimiento encontrado:</span> {nombreProcedimiento}
                </p>
                <p className="text-xs text-green-600 mt-1">
                  <span className="font-semibold">Tipo:</span> {categoriaProcedimiento}
                </p>
              </div>
            )}
          </div>

          {/* Divisor */}
          <div className="flex items-center gap-3">
            <div className="flex-1 border-t border-gray-300"></div>
            <span className="text-sm text-gray-500 font-medium">O buscar por nombre</span>
            <div className="flex-1 border-t border-gray-300"></div>
          </div>

          {/* Búsqueda por nombre del procedimiento */}
          <div className="relative">
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Nombre del procedimiento
            </label>
            <div className="relative">
              <input
                type="text"
                value={nombreProcedimiento}
                onChange={(e) => handleNombreProcedimientoChange(e.target.value)}
                onBlur={() => {
                  // Retraso para permitir clic en sugerencias
                  setTimeout(() => setMostrarSugerenciasCUPS(false), 200);
                }}
                onFocus={() => {
                  if (sugerenciasCUPS.length > 0) {
                    setMostrarSugerenciasCUPS(true);
                  }
                }}
                placeholder="Ej: Hemograma, Ecografía, Radiografía..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Search className="absolute right-3 top-2.5 w-5 h-5 text-gray-400" />
            </div>
            
            {/* Lista de sugerencias */}
            {mostrarSugerenciasCUPS && sugerenciasCUPS.length > 0 && (
              <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                {sugerenciasCUPS.map((sugerencia) => {
                  const { Icon, color, bgColor } = getCategoriaIcon(sugerencia.categoria);
                  return (
                    <button
                      type="button"
                      key={sugerencia.codigo}
                      className="w-full text-left px-4 py-3 hover:bg-blue-50 border-b border-gray-100 last:border-b-0 transition-colors"
                      onClick={() => seleccionarSugerenciaCUPS(sugerencia.codigo, sugerencia.nombre, sugerencia.categoria)}
                    >
                      <div className="flex items-start gap-3">
                        <Icon className={`w-4 h-4 ${color} mt-0.5 flex-shrink-0`} />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm text-gray-800 font-medium">{sugerencia.nombre}</div>
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <span className={`text-xs ${color} px-2 py-0.5 ${bgColor} rounded`}>
                              {sugerencia.categoria}
                            </span>
                            <span className="text-xs font-mono bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                              {formatearCodigoCUPS(sugerencia.codigo)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
            
            <p className="text-xs text-gray-500 mt-1">
              Escriba al menos 3 caracteres para buscar. También puede escribir un procedimiento personalizado.
            </p>
          </div>

          {/* Tipo de prueba detectado */}
          {categoriaProcedimiento && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-sm text-blue-700">
                <span className="font-semibold">Tipo de prueba:</span> {categoriaProcedimiento}
              </p>
            </div>
          )}

          {/* Resultado */}
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Resultado / Observaciones
            </label>
            <textarea
              value={resultado}
              onChange={(e) => setResultado(e.target.value)}
              rows={3}
              placeholder="Describa los resultados o hallazgos relevantes de la prueba..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          {/* Adjuntar archivos */}
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700 flex items-center gap-2">
              <Paperclip className="w-4 h-4" />
              Adjuntar archivos (opcional)
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-md p-4 text-center hover:border-blue-400 transition-colors">
              <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <label className="cursor-pointer">
                <span className="text-blue-600 hover:text-blue-700 font-medium text-sm">Seleccionar archivos</span>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".pdf,.jpg,.jpeg,.png,.dcm"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
              <p className="text-xs text-gray-500 mt-1">
                Formatos: PDF, JPG, PNG, DICOM
              </p>
            </div>

            {/* Archivos seleccionados para esta prueba */}
            {archivosSeleccionados.length > 0 && (
              <div className="mt-3 space-y-2">
                <p className="text-xs font-medium text-gray-700">Archivos seleccionados:</p>
                {archivosSeleccionados.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-md px-3 py-2"
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <File className="w-4 h-4 text-blue-600 flex-shrink-0" />
                      <span className="text-sm text-gray-700 truncate">{file.name}</span>
                      <span className="text-xs text-gray-500">({(file.size / 1024).toFixed(1)} KB)</span>
                    </div>
                    <button
                      onClick={() => eliminarArchivoSeleccionado(index)}
                      className="text-red-500 hover:text-red-700 ml-2 flex-shrink-0"
                      type="button"
                      title="Eliminar archivo"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Botón agregar */}
          <button
            type="button"
            onClick={handleAgregarPrueba}
            className="w-full flex items-center justify-center gap-2 bg-[#C84F3B] text-white py-2 px-4 rounded-md hover:bg-[#B23600] transition-colors"
          >
            <Plus className="w-5 h-5" />
            Agregar Ayuda Diagnóstica
          </button>
        </div>
      </div>

      {/* Lista de ayudas diagnósticas agregadas */}
      {data.ayudasDiagnosticas.length > 0 && (
        <div>
          <h3 className="font-semibold text-gray-800 mb-3">Ayudas Diagnósticas Registradas</h3>
          <div className="space-y-3">
            {data.ayudasDiagnosticas.map((prueba, index) => {
              const { Icon, color, bgColor } = getCategoriaIcon(prueba.categoria);

              return (
                <div
                  key={index}
                  className={`${bgColor} p-4 rounded-lg border border-gray-200`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start gap-3 flex-1">
                      <Icon className={`w-5 h-5 ${color} mt-0.5`} />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-xs font-medium ${color} px-2 py-0.5 bg-white rounded`}>
                            {prueba.categoria}
                          </span>
                          {prueba.codigoCUPS && (
                            <span className="text-xs font-mono bg-blue-100 text-blue-700 px-2 py-0.5 rounded border border-blue-200">
                              CUPS: {formatearCodigoCUPS(prueba.codigoCUPS)}
                            </span>
                          )}
                        </div>
                        <p className="font-medium text-gray-800 mt-2">
                          {prueba.nombrePrueba}
                        </p>
                        {prueba.resultado && (
                          <p className="text-sm text-gray-600 mt-2 bg-white/50 p-2 rounded">
                            <span className="font-medium">Resultado:</span> {prueba.resultado}
                          </p>
                        )}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleEliminarPrueba(index)}
                      className="ml-3 p-1.5 text-red-500 hover:bg-red-50 rounded transition-colors"
                      title="Eliminar"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Archivos adjuntos de esta prueba */}
                  {prueba.archivosAdjuntos && prueba.archivosAdjuntos.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <p className="text-xs font-medium text-gray-700 mb-2 flex items-center gap-1">
                        <Paperclip className="w-3 h-3" />
                        Archivos adjuntos ({prueba.archivosAdjuntos.length}):
                      </p>
                      <div className="space-y-1.5">
                        {prueba.archivosAdjuntos.map((archivo, archivoIndex) => (
                          <div
                            key={archivoIndex}
                            className="flex items-center justify-between bg-white border border-gray-200 rounded px-3 py-1.5"
                          >
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              <File className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                              <span className="text-xs text-gray-700 truncate">{archivo.name}</span>
                              <span className="text-xs text-gray-500">({(archivo.size / 1024).toFixed(1)} KB)</span>
                            </div>
                            <button
                              onClick={() => handleEliminarArchivoPrueba(index, archivoIndex)}
                              className="text-red-500 hover:text-red-700 ml-2 flex-shrink-0"
                              type="button"
                              title="Eliminar archivo"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {data.ayudasDiagnosticas.length === 0 && (
        <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
          <Activity className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-sm text-gray-500 italic">
            No se han registrado ayudas diagnósticas
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Este campo es opcional. Agregue solo si se solicitaron o realizaron pruebas.
          </p>
        </div>
      )}

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
          onClick={onNext}
          className="flex-1 flex items-center justify-center gap-2 bg-[#C84F3B] text-white py-3 px-6 rounded-md hover:bg-[#B23600] transition-colors"
        >
          Siguiente
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
