import { useEffect, useState } from "react";
import { Deportista, citasService } from "../services/apiClient";

interface DeportistaConCita extends Deportista {
  cita_hora?: string;
  cita_tipo?: string;
  cita_deporte?: string;
  cita_estado?: string;
}

export function useCitasDelDia() {
  const [deportistas, setDeportistas] = useState<DeportistaConCita[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDeportistas = async () => {
      setLoading(true);
      setError(null);
      try {
        console.log("📅 Llamando a GET /citas/deportistas-con-citas-hoy...");
        const deportistasData = await citasService.getDeportistasConCitasHoy();
        console.log("✅ Datos recibidos:", deportistasData);
        
        // Procesar deportistas manteniendo la información ya devuelta por el endpoint
        const deportistasConCitas = (deportistasData || []).map((dep: any) => ({
          ...dep,
          // El endpoint ya devuelve estos datos, pero los aseguramos como fallback
          cita_hora: dep.cita_hora || 'N/A',
          cita_tipo: dep.cita_tipo || 'No especificado',
          cita_deporte: dep.cita_deporte || 'No especificado',
          cita_estado: dep.cita_estado || 'Pendiente',
        }));
        
        setDeportistas(deportistasConCitas);
      } catch (err) {
        console.error("❌ Error al obtener deportistas con citas:", err);
        const errorMsg = err instanceof Error ? err.message : "Error desconocido";
        setError(`No se pudo cargar los deportistas con citas: ${errorMsg}`);
        setDeportistas([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDeportistas();
  }, []);

  return { deportistas, loading, error };
}
