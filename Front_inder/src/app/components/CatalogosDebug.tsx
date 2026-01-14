import React from 'react';
import { useCatalogos } from '../contexts/CatalogosContext';

export function CatalogosDebug() {
  const { catalogos, isLoading, error } = useCatalogos();

  return (
    <div className="p-6 bg-gray-100 rounded-lg m-4">
      <h2 className="text-2xl font-bold mb-4">Debug: Catálogos</h2>
      <div className="space-y-4">
        <div>
          <p><strong>Loading:</strong> {isLoading ? 'Sí' : 'No'}</p>
          <p><strong>Error:</strong> {error || 'No hay error'}</p>
        </div>
        <div>
          <p><strong>Tipos de Documento:</strong> {catalogos.tiposDocumento.length} items</p>
          <ul className="ml-4">
            {catalogos.tiposDocumento.map(item => (
              <li key={item.id}>- {item.nombre} ({item.codigo})</li>
            ))}
          </ul>
        </div>
        <div>
          <p><strong>Sexos:</strong> {catalogos.sexos.length} items</p>
          <ul className="ml-4">
            {catalogos.sexos.map(item => (
              <li key={item.id}>- {item.nombre} ({item.codigo})</li>
            ))}
          </ul>
        </div>
        <div>
          <p><strong>Estados:</strong> {catalogos.estados.length} items</p>
          <ul className="ml-4">
            {catalogos.estados.map(item => (
              <li key={item.id}>- {item.nombre} ({item.codigo})</li>
            ))}
          </ul>
        </div>
        <div>
          <p><strong>Tipos de Cita:</strong> {catalogos.tiposCita.length} items</p>
          <ul className="ml-4">
            {catalogos.tiposCita.map(item => (
              <li key={item.id}>- {item.nombre} ({item.codigo})</li>
            ))}
          </ul>
        </div>
        <div>
          <p><strong>Estados de Cita:</strong> {catalogos.estadosCita.length} items</p>
          <ul className="ml-4">
            {catalogos.estadosCita.map(item => (
              <li key={item.id}>- {item.nombre} ({item.codigo})</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
