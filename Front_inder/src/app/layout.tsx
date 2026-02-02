'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import MedicalLayout from './MedicalLayout';
import './styles/index.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [currentView, setCurrentView] = React.useState('dashboard');

  useEffect(() => {
    const token = typeof window !== 'undefined' 
      ? localStorage.getItem('auth_token')
      : null;
    
    if (!token && typeof window !== 'undefined') {
      router.push('/login');
    }
  }, [router]);

  return (
    <html lang="es">
      <body>
        <MedicalLayout 
          currentView={currentView} 
          onNavigate={setCurrentView}
        >
          {children}
        </MedicalLayout>
      </body>
    </html>
  );
}