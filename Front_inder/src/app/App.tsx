import { useState } from "react";
import { toast } from "sonner";

import { CatalogosProvider } from "./contexts/CatalogosContext";
import Navbar from "./components/Navbar";
import { Inicio } from "./components/Inicio";
import { RegistroDeportista } from "./components/RegistroDeportista";
import { HistoriaClinica } from "./components/HistoriaClinica";
import { SelectDeportista } from "./components/SelectDeportista";
import { GestionCitas } from "./components/GestionCitas";
import { CitasManager } from "./components/CitasManager";
import { ListadoDeportistas } from "./components/ListadoDeportistas";
import { ListadoHistoriaClinica } from "./components/ListadoHistoriaClinica";
import { VistaHistoriaClinica } from "./components/VistaHistoriaClinica";
import { DetalleDeportista } from "./components/DetalleDeportista";
import { Reportes } from "./components/Reportes";
import { ArchivosGestion } from "./components/ArchivosGestion";
import { deportistasService, Deportista } from "./services/apiClient";

export default function App() {
  const [currentView, setCurrentView] = useState("inicio");
  const [selectedDeportista, setSelectedDeportista] = useState<Deportista | null>(null);
  const [selectedDeportistaId, setSelectedDeportistaId] = useState<string | null>(null);

  const handleSelectDeportista = (deportista: Deportista) => {
    setSelectedDeportista(deportista);
    setSelectedDeportistaId(deportista.id); // Agregar esta línea
    setCurrentView("historia-form");
  };

  const handleBackToSelect = () => {
    setSelectedDeportista(null);
    setCurrentView("historia");
  };

  const handleRegistroSubmit = async (data: any) => {
    try {
      // El deportista ya fue creado en el paso 1 de RegistroDeportista
      // Solo necesitamos navegar a la siguiente vista
      toast.success("Deportista registrado correctamente");
      setCurrentView("historia");
    } catch (error) {
      toast.error("Error al registrar deportista");
      console.error("Error registrando deportista:", error);
    }
  };

  const handleRegistroCancel = () => {
    // Volver a la vista de listado de deportistas
    setCurrentView("deportistas");
  };

  const renderView = () => {
    switch (currentView) {
      case "inicio":
        return <Inicio onNavigate={setCurrentView} />;
      case "registro":
        return <RegistroDeportista onSubmit={handleRegistroSubmit} onCancel={handleRegistroCancel} />;
      case "historia":
        return (
          <SelectDeportista
            onSelect={handleSelectDeportista}
          />
        );
      case "historia-form":
        return selectedDeportista ? (
          <HistoriaClinica
            deportista={selectedDeportista}
            onBack={handleBackToSelect}
          />
        ) : (
          <SelectDeportista
            onSelect={handleSelectDeportista}
          />
        );
      case "deportistas":
        return <ListadoDeportistas onNavigate={setCurrentView} />;
      case "historias-clinicas":
        return <ListadoHistoriaClinica onNavigate={setCurrentView} />;
      case "detalles-deportista":
        return selectedDeportistaId ? (
          <DetalleDeportista deportistaId={selectedDeportistaId} />
        ) : (
          <ListadoDeportistas />
        );      case "consultas":
        return <GestionCitas />;
      case "reportes":
        return <Reportes />;
      case "archivos":
        return <ArchivosGestion deportistaId={selectedDeportistaId || undefined} />;
      case "configuracion":
        return (
          <div className="p-8">
            <h1 className="text-2xl font-bold">Configuración</h1>
            <p className="text-gray-600">Configura los parámetros del sistema y gestiona usuarios.</p>
          </div>
        );      default:
        // Manejo de vistas dinámicas como historia-vista-{id}
        if (currentView.startsWith("historia-vista-")) {
          const historiaId = currentView.replace("historia-vista-", "");
          return <VistaHistoriaClinica historiaId={historiaId} onNavigate={setCurrentView} />;
        }
        return <Inicio onNavigate={setCurrentView} />
    }
  };

  return (
    <CatalogosProvider>
      <div className="min-h-screen bg-slate-50">
        <Navbar onNavigate={setCurrentView} currentView={currentView} />
        {renderView()}
      </div>
    </CatalogosProvider>
  );
}