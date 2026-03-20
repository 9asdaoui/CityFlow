import React, { useEffect } from 'react';
import { MapContainer, TileLayer, useMapEvents } from 'react-leaflet';
import TensionMarker from './TensionMarker';
import LoadingSpinner from '../common/LoadingSpinner';

function MapEventsHandler({ onBoundsChange }) {
  const map = useMapEvents({
    moveend: () => onBoundsChange(map),
    zoomend: () => onBoundsChange(map),
  });
  
  useEffect(() => {
    // Initial load
    onBoundsChange(map);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map]);

  return null;
}

export default function SentinelMap({ markers, loading, onBoundsChange }) {
  return (
    <div style={{ height: '100%', width: '100%', position: 'relative' }}>
      {loading && <LoadingSpinner />}
      <MapContainer 
        center={[48.8566, 2.3522]} 
        zoom={12} 
        style={{ height: '100%', width: '100%', backgroundColor: 'var(--color-bg-base)', zIndex: 1 }}
        zoomControl={false}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://carto.com/">CartoDB</a>'
        />
        <MapEventsHandler onBoundsChange={onBoundsChange} />
        {markers.map((m, i) => (
          <TensionMarker key={i} point={m} />
        ))}
      </MapContainer>
    </div>
  );
}
