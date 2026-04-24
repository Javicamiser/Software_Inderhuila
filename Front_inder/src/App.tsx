import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useParams, useNavigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { CatalogosProvider } from '@/app/contexts/CatalogosContext';
import { AuthProvider } from '@/app/contexts/AuthContext';
import { DashboardLayout } from '@/app/components/layout/Dashboardlayout';
import { ProtectedRoute } from '@/app/components/layout/ProtectedRoute';

import { Inicio } from '@/app/components/Inicio';
import { ListadoDeportistas } from '@/app/components/features/deportistas/ListadoDeportistas';
import { ListadoHistoriaClinica } from '@/app/components/features/historia/ListadoHistoriaClinica';
import { VistaHistoriaClinica } from '@/app/components/features/historia/VistaHistoriaClinica';
import { GestionCitas } from '@/app/components/features/citas/GestionCitas';
import { ArchivosGestion } from '@/app/components/features/archivos/ArchivosGestion';
import { Reportes } from '@/app/components/features/reportes/Reportes';
import { GestionUsuarios } from '@/app/components/features/usuarios/GestionUsuarios';

import LoginPage from '@/pages/LoginPage';
import SetupPage from '@/pages/SetupPage';
import SetupGuard from '@/app/components/layout/SetupGuard';

function VistaHistoriaWrapper() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  if (!id) return <Navigate to="/historia" replace />;
  return (
    <VistaHistoriaClinica
      historiaId={id}
      onNavigate={(view) => navigate(`/${view}`)}
    />
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CatalogosProvider>
          <Toaster position="top-right" richColors />
          <Routes>
            <Route path="/setup" element={<SetupPage />} />
            <Route path="/login" element={<SetupGuard><LoginPage /></SetupGuard>} />
            <Route path="/" element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard"    element={<Inicio />} />
              <Route path="deportistas"  element={<ListadoDeportistas />} />
              <Route path="historia"     element={<ListadoHistoriaClinica />} />
              <Route path="historia/:id" element={<VistaHistoriaWrapper />} />
              <Route path="citas"        element={<GestionCitas />} />
              <Route path="archivos"     element={<ArchivosGestion />} />
              <Route path="reportes"     element={<Reportes />} />
              <Route path="usuarios"     element={
                <ProtectedRoute requiereAdmin>
                  <GestionUsuarios />
                </ProtectedRoute>
              } />
            </Route>
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </CatalogosProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}