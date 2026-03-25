import React, { useState } from 'react';

interface CorporateFooterProps {
  logoPath?: string;
  companyName?: string;
  year?: number;
}

function CorporateFooter({
  logoPath = '/src/assets/logo_wap.jpeg',
  companyName = 'WAP Enterprise',
  year = new Date().getFullYear(),
}: CorporateFooterProps) {
  const [logoError, setLogoError] = useState(false);

  const handleLogoError = () => {
    setLogoError(true);
  };

  return (
    <footer
      className="sticky bottom-0 w-full bg-white border-t print:hidden"
      style={{
        borderTopColor: '#0369A1',
        borderTopWidth: '1px',
        boxShadow: '0 -2px 8px rgba(3, 105, 161, 0.05)',
        zIndex: 1,
      }}
    >
      <div className="max-w-full mx-auto px-3 sm:px-4">
        <div className="py-2 sm:py-3">
          <div className="flex flex-row items-center justify-between gap-2">
            {/* Logo pequeño */}
            <div className="flex items-center gap-2 flex-shrink-0 min-w-0">
              {!logoError ? (
                <img
                  src={logoPath}
                  alt="WAP"
                  className="h-10 sm:h-12 w-auto object-contain"
                  onError={handleLogoError}
                  loading="lazy"
                />
              ) : (
                <div
                  className="h-5 sm:h-6 px-1.5 rounded text-xs font-bold flex items-center"
                  style={{ backgroundColor: '#0369A1', color: 'white' }}
                >
                  WAP
                </div>
              )}
            </div>

            {/* Texto central - versión corta */}
            <div className="flex items-center justify-center flex-1 min-w-0">
              <span className="text-xs text-gray-700 text-center truncate">
                Desarrollado por{' '}
                <span className="font-semibold" style={{ color: '#0369A1' }}>
                  {companyName}
                </span>
              </span>
            </div>

            {/* Copyright compacto */}
            <div className="flex items-center flex-shrink-0 whitespace-nowrap">
              <span className="text-xs text-gray-600">
                © {year}{' '}
                <span className="font-semibold" style={{ color: '#0369A1' }}>
                  INDERHUILA
                </span>
              </span>
            </div>
          </div>

          {/* Línea decorativa - más delgada */}
          <div
            className="h-px mt-1.5 opacity-20"
            style={{ backgroundColor: '#0369A1' }}
          />
        </div>
      </div>
    </footer>
  );
}

export default CorporateFooter;