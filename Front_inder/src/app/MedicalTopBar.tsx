'use client';

import React, { useState } from 'react';
import { Menu, Search, Bell } from 'lucide-react';
import '../styles/medical-topbar.css';

interface MedicalTopBarProps {
  onToggleSidebar: () => void;
}

export default function MedicalTopBar({ onToggleSidebar }: MedicalTopBarProps) {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="medical-topbar">
      <button
        onClick={onToggleSidebar}
        className="toggle-sidebar"
      >
        <Menu size={20} />
      </button>

      <div className="search-box">
        <Search size={18} />
        <input
          type="text"
          placeholder="Buscar..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <button className="notification-btn">
        <Bell size={20} />
        <span className="badge">3</span>
      </button>
    </div>
  );
}