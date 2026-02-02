import { useState } from 'react';
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
        
        <div className="medical-content">
          {children}
        </div>
      </div>
    </div>
  );
}