'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import {
  Calendar,
  Clock,
  Plus,
  Edit2,
  X,
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { citasService, Cita, Deportista } from '../services/apiClient';
import { useCatalogos } from '../contexts/CatalogosContext';
import { InputDate } from './form-fields/InputDate';
import { InputTime } from './form-fields/InputTime';
import { SelectCatalogo } from './form-fields/SelectCatalogo';
import { TextArea } from './form-fields/TextArea';

// ============================================================================
// TIPOS
// ============================================================================

type CitaForm = {
  deportista_id: string;
  fecha: string;
  hora: string;
  tipo_cita_id: string;
  estado_cita_id: string;
  observaciones?: string;
};

interface CitasManagerProps {
  deportista?: Deportista;
  onSuccess?: (cita: Cita) => void;
}

// ============================================================================
// COMPONENTE
// ============================================================================

export function CitasManager({ deportista, onSuccess }: CitasManagerProps) {
  const { catalogos, isLoading } = useCatalogos();
  const [view, setView] = useState<'list' | 'create' | 'edit'>('list');
  const [citas, setCitas] = useState<Cita[]>([]);
  const [proximasCitas, setProximasCitas] = useState<Cita[]>([]);
  const [selectedCita, setSelectedCita] = useState<Cita | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [errors, setErrors] = useState<Partial<CitaForm>>({});
  const [formData, setFormData] = useState<CitaForm>({
    deportista_id: deportista?.id || '',
    fecha: '',
    hora: '',
    tipo_cita_id: '',
    estado_cita_id: '',
    observaciones: '',
  });

  // Cargar citas cuando cambia el deportista
  useEffect(() => {
    if (deportista?.id) {
      cargarCitas(deportista.id);
    }
  }, [deportista?.id]);

  // Establecer estado "Pendiente" por defecto
  useEffect(() => {
    if (catalogos.estadosCita && catalogos.estadosCita.length > 0) {
      const estadoPendiente = catalogos.estadosCita.find(
        (e) => e.nombre.toLowerCase() === 'pendiente'
      );
      if (estadoPendiente) {
        setFormData((prev) => ({
          ...prev,
          estado_cita_id: estadoPendiente.id,
        }));
      }
    }
  }, [catalogos.estadosCita]);

  const cargarCitas = async (deportistaId: string) => {
    try {
      const todasLasCitas = await citasService.getByDeportistaId(deportistaId);
      setCitas(todasLasCitas);

      // Filtrar próximas citas (fecha >= hoy)
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      const proximas = todasLasCitas.filter(
        (cita) => new Date(cita.fecha) >= hoy
      );
      setProximasCitas(proximas);
    } catch (error) {
      console.error('Error cargando citas:', error);
      setErrorMessage('Error al cargar citas');
    }
  };

  // ✅ AGREGAR TIPO EXPLÍCITO A value
  const handleChange = (field: keyof CitaForm, value: string): void => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<CitaForm> = {};

    if (!formData.deportista_id) newErrors.deportista_id = 'Requerido';
    if (!formData.fecha) newErrors.fecha = 'Requerido';
    if (!formData.hora) newErrors.hora = 'Requerido';
    if (!formData.tipo_cita_id) newErrors.tipo_cita_id = 'Requerido';
    if (!formData.estado_cita_id) newErrors.estado_cita_id = 'Requerido';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Por favor completa los campos requeridos');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage('');
      setSuccessMessage('');

      if (view === 'create') {
        const citaData: Cita = {
          deportista_id: formData.deportista_id,
          fecha: formData.fecha,
          hora: formData.hora,
          tipo_cita_id: formData.tipo_cita_id,
          estado_cita_id: formData.estado_cita_id,
          observaciones: formData.observaciones,
        };

        const nuevaCita = await citasService.create(citaData);
        setSuccessMessage('✅ Cita registrada correctamente');
        toast.success('Cita creada exitosamente');

        // Reset formulario
        setFormData({
          deportista_id: deportista?.id || '',
          fecha: '',
          hora: '',
          tipo_cita_id: '',
          estado_cita_id:
            catalogos.estadosCita.find((e) => e.nombre.toLowerCase() === 'pendiente')?.id || '',
          observaciones: '',
        });

        setView('list');
        if (deportista?.id) {
          cargarCitas(deportista.id);
        }

        if (onSuccess) {
          onSuccess(nuevaCita);
        }
      } else if (view === 'edit' && selectedCita?.id) {
        const citaData: Partial<Cita> = {
          deportista_id: formData.deportista_id,
          fecha: formData.fecha,
          hora: formData.hora,
          tipo_cita_id: formData.tipo_cita_id,
          estado_cita_id: formData.estado_cita_id,
          observaciones: formData.observaciones,
        };

        await citasService.update(selectedCita.id, citaData);
        setSuccessMessage('✅ Cita actualizada correctamente');
        toast.success('Cita actualizada exitosamente');

        setView('list');
        setSelectedCita(null);
        if (deportista?.id) {
          cargarCitas(deportista.id);
        }
      }

      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Error al guardar cita';
      setErrorMessage(msg);
      toast.error(msg);
      console.error('Error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditCita = (cita: Cita): void => {
    setSelectedCita(cita);
    setFormData({
      deportista_id: cita.deportista_id,
      fecha: cita.fecha,
      hora: cita.hora,
      tipo_cita_id: cita.tipo_cita_id,
      estado_cita_id: cita.estado_cita_id,
      observaciones: cita.observaciones || '',
    });
    setView('edit');
  };

  const handleCancelarCita = async (citaId: string): Promise<void> => {
    try {
      setIsSubmitting(true);
      const estadoCancelada = catalogos.estadosCita.find(
        (e) => e.nombre.toLowerCase() === 'cancelada'
      );

      if (!estadoCancelada) {
        throw new Error('Estado "Cancelada" no encontrado');
      }

      await citasService.update(citaId, {
        estado_cita_id: estadoCancelada.id,
      });

      setSuccessMessage('✅ Cita cancelada');
      if (deportista?.id) {
        cargarCitas(deportista.id);
      }

      setTimeout(() => setSuccessMessage(''), 2000);
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Error al cancelar';
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatHora = (hora: string): string => {
    if (!hora) return '-';
    return hora;
  };

  const formatFecha = (fecha: string): string => {
    return new Date(fecha).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getEstadoColor = (estadoNombre?: string): string => {
    if (!estadoNombre) return 'bg-gray-100 text-gray-700';
    const lower = estadoNombre.toLowerCase();
    if (lower === 'pendiente') return 'bg-yellow-100 text-yellow-700';
    if (lower === 'confirmada') return 'bg-green-100 text-green-700';
    if (lower === 'cancelada') return 'bg-red-100 text-red-700';
    if (lower === 'realizada') return 'bg-blue-100 text-blue-700';
    return 'bg-gray-100 text-gray-700';
  };

  // ✅ AGREGAR TIPO EXPLÍCITO A citaId
  const handleToggleExpanded = (citaId?: string): void => {
    if (!citaId) return;
    setExpandedId(expandedId === citaId ? null : citaId);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-4">Cargando catálogos...</span>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      {/* Encabezado */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Gestión de Citas</h1>
        {deportista && (
          <p className="text-gray-600 mt-2">
            {deportista.nombres} {deportista.apellidos}
          </p>
        )}
      </div>

      {/* Mensajes */}
      {successMessage && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <p className="text-green-800">{successMessage}</p>
        </div>
      )}

      {errorMessage && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-red-800">{errorMessage}</p>
        </div>
      )}

      {/* VIEW: LISTAR CITAS */}
      {view === 'list' && (
        <div className="space-y-6">
          {/* Botón nueva cita */}
          <button
            onClick={() => setView('create')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Nueva Cita
          </button>

          {/* Próximas citas */}
          {proximasCitas.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h2 className="text-lg font-semibold text-blue-900 mb-4">
                📅 Próximas Citas ({proximasCitas.length})
              </h2>
              <div className="space-y-2">
                {proximasCitas.map((cita) => (
                  <div
                    key={cita.id}
                    className="bg-white p-4 rounded-lg flex items-center justify-between"
                  >
                    <div className="flex items-center gap-4">
                      <Calendar className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="font-semibold text-gray-800">
                          {formatFecha(cita.fecha)} a las {formatHora(cita.hora)}
                        </p>
                        <p className="text-sm text-gray-600">
                          {cita.tipo_cita?.nombre || 'Cita'} • 
                          <span className={`ml-1 font-medium ${
                            cita.estado_cita?.nombre?.toLowerCase() === 'atendida' 
                              ? 'text-green-600' 
                              : 'text-yellow-600'
                          }`}>
                            {cita.estado_cita?.nombre || 'Pendiente'}
                          </span>
                        </p>
                      </div>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-semibold ${getEstadoColor(
                        cita.estado_cita?.nombre
                      )}`}
                    >
                      {cita.estado_cita?.nombre || 'Pendiente'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
                      </div>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-semibold ${getEstadoColor(
                        cita.estado_cita?.nombre
                      )}`}
                    >
                      {cita.estado_cita?.nombre || 'Pendiente'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Todas las citas */}
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Todas las Citas ({citas.length})
            </h2>

            {citas.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                No hay citas registradas
              </p>
            ) : (
              <div className="space-y-3">
                {citas.map((cita) => (
                  <div
                    key={cita.id}
                    className="border border-gray-200 rounded-lg overflow-hidden"
                  >
                    {/* Fila principal */}
                    <div
                      onClick={() => handleToggleExpanded(cita.id)}
                      className="p-4 bg-white hover:bg-gray-50 cursor-pointer flex items-center justify-between"
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <Calendar className="w-5 h-5 text-gray-600" />
                        <div>
                          <p className="font-semibold text-gray-800">
                            {formatFecha(cita.fecha)} {formatHora(cita.hora)}
                          </p>
                          <p className="text-sm text-gray-600">
                            {cita.tipo_cita?.nombre || 'Cita'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-semibold ${getEstadoColor(
                            cita.estado_cita?.nombre
                          )}`}
                        >
                          {cita.estado_cita?.nombre}
                        </span>

                        <button className="p-2 hover:bg-gray-200 rounded-lg">
                          {expandedId === cita.id ? (
                            <ChevronUp className="w-5 h-5" />
                          ) : (
                            <ChevronDown className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Fila expandida */}
                    {expandedId === cita.id && (
                      <div className="bg-gray-50 p-4 border-t border-gray-200 space-y-4">
                        {cita.observaciones && (
                          <div>
                            <p className="text-sm text-gray-600 mb-1">
                              Observaciones:
                            </p>
                            <p className="text-gray-800">{cita.observaciones}</p>
                          </div>
                        )}

                        <div className="flex gap-2 pt-2">
                          {cita.estado_cita?.nombre?.toLowerCase() !==
                            'cancelada' && (
                            <>
                              <button
                                onClick={() => handleEditCita(cita)}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                              >
                                <Edit2 className="w-4 h-4" />
                                Editar
                              </button>

                              <button
                                onClick={() => {
                                  if (cita.id) {
                                    handleCancelarCita(cita.id);
                                  }
                                }}
                                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                              >
                                <X className="w-4 h-4" />
                                Cancelar
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* VIEW: CREAR/EDITAR CITA */}
      {(view === 'create' || view === 'edit') && (
        <div>
          <button
            onClick={() => {
              setView('list');
              setSelectedCita(null);
              setFormData({
                deportista_id: deportista?.id || '',
                fecha: '',
                hora: '',
                tipo_cita_id: '',
                estado_cita_id:
                  catalogos.estadosCita.find((e) => e.nombre.toLowerCase() === 'pendiente')?.id || '',
                observaciones: '',
              });
            }}
            className="mb-4 text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            ← Volver
          </button>

          <form onSubmit={handleSubmit} className="space-y-6 bg-gray-50 p-6 rounded-lg">
            <h2 className="text-xl font-bold text-gray-800">
              {view === 'create' ? 'Nueva Cita' : 'Editar Cita'}
            </h2>

            <div className="grid grid-cols-2 gap-4">
              {/* FECHA */}
              <InputDate
                label="Fecha"
                value={formData.fecha}
                onChange={(value) => handleChange('fecha', value)}
                required
                error={errors.fecha}
              />

              {/* HORA */}
              <InputTime
                label="Hora"
                value={formData.hora}
                onChange={(value) => handleChange('hora', value)}
                required
                error={errors.hora}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* TIPO CITA */}
              <SelectCatalogo
                label="Tipo de Cita"
                value={formData.tipo_cita_id}
                onChange={(value) => handleChange('tipo_cita_id', value)}
                options={catalogos.tiposCita}
                required
                error={errors.tipo_cita_id}
              />

              {/* ESTADO CITA */}
              <SelectCatalogo
                label="Estado"
                value={formData.estado_cita_id}
                onChange={(value) => handleChange('estado_cita_id', value)}
                options={catalogos.estadosCita}
                required
                error={errors.estado_cita_id}
              />
            </div>

            {/* OBSERVACIONES */}
            <TextArea
              label="Observaciones (Opcional)"
              value={formData.observaciones || ''}
              onChange={(value) => handleChange('observaciones', value)}
              placeholder="Notas sobre la cita..."
              rows={4}
            />

            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition"
              >
                {isSubmitting
                  ? 'Guardando...'
                  : view === 'create'
                  ? 'Crear Cita'
                  : 'Guardar Cambios'}
              </button>

              <button
                type="button"
                onClick={() => {
                  setView('list');
                  setSelectedCita(null);
                }}
                className="flex-1 px-6 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default CitasManager;
