import { useState, useEffect, useRef } from 'react';
import MedicalSidebar from './MedicalSidebar';
import MedicalTopBar from './MedicalTopBar';
import '../styles/medical-layout.css';

interface MedicalLayoutProps {
  children: React.ReactNode;
  currentView: string;
  onNavigate: (view: string) => void;
}

export default function MedicalLayout({
  children,
  currentView,
  onNavigate,
}: MedicalLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const contentRef = useRef<HTMLDivElement>(null);

  // AUTO-SCROLL AL CAMBIAR DE VISTA
  useEffect(() => {
    // Scroll del window
    window.scrollTo(0, 0);
    
    // Scroll del contenedor de contenido si existe
    if (contentRef.current) {
      contentRef.current.scrollTop = 0;
      contentRef.current.scrollLeft = 0;
    }
  }, [currentView]);

  return (
    <div className="medical-layout">
      <MedicalSidebar 
        isOpen={sidebarOpen} 
        onNavigate={onNavigate}
        currentView={currentView}
      />
      
      <div className="medical-main">
        <MedicalTopBar 
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        />
        
        <div className="medical-content" ref={contentRef}>
          {children}
        </div>
      </div>
    </div>
  );
}