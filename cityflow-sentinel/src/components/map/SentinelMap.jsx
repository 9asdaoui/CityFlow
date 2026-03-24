import React, { useEffect } from 'react';
import { MapContainer, TileLayer, useMapEvents } from 'react-leaflet';
import TensionMarker from './TensionMarker';

function MapEventsHandler({ onBoundsChange, onMapClick }) {
  const map = useMapEvents({
    moveend: () => onBoundsChange && onBoundsChange(map),
    zoomend: () => onBoundsChange && onBoundsChange(map),
    click: (e) => onMapClick && onMapClick(e.latlng) // Binds Leaflet click logic
  });
  
  useEffect(() => {
    if (onBoundsChange) onBoundsChange(map);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map]);

  return null;
}

export default function SentinelMap({ markers, onBoundsChange, onMapClick, onClearMarkers }) {
  return (
    <div style={{ height: '100%', width: '100%', position: 'relative' }}>
      
      {/* Absolute FAB to quickly clear Map Screen */}
      {markers && markers.length > 0 && (
        <button 
          onClick={(e) => { e.stopPropagation(); onClearMarkers && onClearMarkers(); }}
          className="absolute z-[1000] bottom-8 left-8 bg-red-600/90 hover:bg-red-500 text-white px-5 py-2.5 rounded-full shadow-[0_4px_20px_rgba(220,38,38,0.4)] border border-red-400 font-semibold text-xs tracking-widest uppercase transition-all flex items-center gap-2 hover:scale-105 active:scale-95 duration-200"
        >
          <svg className="w-4 h-4 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          Supprimer tous les marqueurs
        </button>
      )}

      <MapContainer 
        center={[33.5731, -7.5898]} 
        zoom={13} 
        style={{ height: '100%', width: '100%', backgroundColor: 'var(--color-bg-base)', zIndex: 1 }}
        zoomControl={false}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://carto.com/">CartoDB</a>'
        />
        <MapEventsHandler onBoundsChange={onBoundsChange} onMapClick={onMapClick} />
        {markers?.map((m) => (
          <TensionMarker key={m.id} point={m} />
        ))}
      </MapContainer>
    </div>
  );
}
