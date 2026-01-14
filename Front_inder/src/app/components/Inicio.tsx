import { ClipboardList, Users, Activity, BarChart3 } from "lucide-react";

type InicioProps = {
  onNavigate: (view: string) => void;
};

export function Inicio({ onNavigate }: InicioProps) {
  return (
    <div className="max-w-7xl mx-auto p-6 py-8">
      {/* Hero section */}
      <div className="bg-gradient-to-r from-[#C84F3B] to-[#A23E2D] rounded-lg p-8 text-white mb-8 shadow-lg">
        <h1 className="mb-3">Bienvenido al Sistema Médico Deportivo</h1>
        <p className="text-white/90 text-lg">
          INDERHuila - Instituto Departamental de Recreación y Deportes del Huila
        </p>
      </div>

      {/* Tarjetas de acceso rápido */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <button
          onClick={() => onNavigate("registro")}
          className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-all hover:-translate-y-1 text-left border-t-4 border-[#1F4788]"
        >
          <div className="w-12 h-12 bg-[#1F4788]/10 rounded-lg flex items-center justify-center mb-4">
            <ClipboardList className="w-6 h-6 text-[#1F4788]" />
          </div>
          <h3 className="mb-2 text-gray-800">Nuevo Registro</h3>
          <p className="text-sm text-gray-600">Registrar nuevo deportista</p>
        </button>

        <button
          onClick={() => onNavigate("deportistas")}
          className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-all hover:-translate-y-1 text-left border-t-4 border-[#B8C91A]"
        >
          <div className="w-12 h-12 bg-[#B8C91A]/10 rounded-lg flex items-center justify-center mb-4">
            <Users className="w-6 h-6 text-[#93A115]" />
          </div>
          <h3 className="mb-2 text-gray-800">Deportistas</h3>
          <p className="text-sm text-gray-600">Ver lista de deportistas</p>
        </button>

        <button
          onClick={() => onNavigate("consultas")}
          className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-all hover:-translate-y-1 text-left border-t-4 border-[#B23600]"
        >
          <div className="w-12 h-12 bg-[#B23600]/10 rounded-lg flex items-center justify-center mb-4">
            <Activity className="w-6 h-6 text-[#B23600]" />
          </div>
          <h3 className="mb-2 text-gray-800">Consultas</h3>
          <p className="text-sm text-gray-600">Consultas médicas</p>
        </button>

        <div className="bg-white rounded-lg p-6 shadow-md border-t-4 border-[#6A006F]">
          <div className="w-12 h-12 bg-[#6A006F]/10 rounded-lg flex items-center justify-center mb-4">
            <BarChart3 className="w-6 h-6 text-[#6A006F]" />
          </div>
          <h3 className="mb-2 text-gray-800">Estadísticas</h3>
          <p className="text-sm text-gray-600">Ver reportes y estadísticas</p>
        </div>
      </div>

      {/* Información adicional */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg p-6 shadow-md">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-gray-800">Total Deportistas</h3>
            <div className="w-10 h-10 bg-[#1F4788]/10 rounded-full flex items-center justify-center">
              <Users className="w-5 h-5 text-[#1F4788]" />
            </div>
          </div>
          <p className="text-3xl text-[#1F4788]">0</p>
          <p className="text-sm text-gray-500 mt-1">Registrados en el sistema</p>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-md">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-gray-800">Consultas Hoy</h3>
            <div className="w-10 h-10 bg-[#B8C91A]/10 rounded-full flex items-center justify-center">
              <Activity className="w-5 h-5 text-[#93A115]" />
            </div>
          </div>
          <p className="text-3xl text-[#B8C91A]">0</p>
          <p className="text-sm text-gray-500 mt-1">Consultas programadas</p>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-md">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-gray-800">Historias Activas</h3>
            <div className="w-10 h-10 bg-[#B23600]/10 rounded-full flex items-center justify-center">
              <ClipboardList className="w-5 h-5 text-[#B23600]" />
            </div>
          </div>
          <p className="text-3xl text-[#B23600]">0</p>
          <p className="text-sm text-gray-500 mt-1">Historias clínicas</p>
        </div>
      </div>
    </div>
  );
}