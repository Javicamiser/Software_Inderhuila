'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import MedicalLayout from './MedicalLayout';
import './styles/index.css';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [currentView, setCurrentView] = useState('dashboard');

  useEffect(() => {
    // Verificar si hay token (protección de rutas)
    const token = typeof window !== 'undefined' 
      ? localStorage.getItem('auth_token')
      : null;
    
    if (!token && typeof window !== 'undefined') {
      router.push('/login');
    }
  }, [router]);

  return (
    <MedicalLayout currentView={currentView} onNavigate={setCurrentView}>
      <main className="min-h-screen">
        {children}
      </main>
    </MedicalLayout>
  );
}