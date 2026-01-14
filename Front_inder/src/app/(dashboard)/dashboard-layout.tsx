'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '../components/Navbar';

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
    
    if (!token) {
      router.push('/login');
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar onNavigate={setCurrentView} currentView={currentView} />
      <main className="min-h-screen">
        {children}
      </main>
    </div>
  );
}
