import React from 'react';
import { Marker } from 'react-leaflet';
import L from 'leaflet';
import TensionTooltip from './TensionTooltip';
import { tensionColor } from '../../utils/tensionColor';

export default function TensionMarker({ point }) {
  const { lat, lng, tension_score, loading } = point;
  
  const color = loading ? { hex: '#475569' } : tensionColor(tension_score); 
  const size = 68;
  
  const innerContent = loading 
    ? `<circle cx="${size/2}" cy="${size/2 - 12}" r="6" fill="#FFE44B">
         <animate attributeName="opacity" values="1;0.2;1" dur="0.8s" repeatCount="indefinite" />
       </circle>`
    : `<text
          x="50%" y="${size/2 - 12}"
          dominant-baseline="central"
          text-anchor="middle"
          font-size="14"
          font-family="DM Mono, monospace"
          fill="white"
          font-weight="700"
        >${tension_score.toFixed(0)}</text>`;

  const icon = L.divIcon({
    className: 'bg-transparent',
    html: `
      <!-- Tailwind drop shadow + Smooth appearance animation -->
      <div style="filter: drop-shadow(0px 8px 10px rgba(0,0,0,0.6)); transform-origin: center bottom; animation: teardropBounce 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;">
        <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
          
          <!-- Classic Teardrop Pin Shape (Anchored precisely at coordinate axis) -->
          <path d="M${size/2} ${size - 4} Q${size - 6} ${size/2 + 6} ${size - 6} ${size/2 - 12} A${size/2 - 6} ${size/2 - 6} 0 1 0 6 ${size/2 - 12} Q6 ${size/2 + 6} ${size/2} ${size - 4} Z" 
                fill="${color.hex}" stroke="rgba(255,255,255,0.7)" stroke-width="2" />
          
          <!-- Central Overlay Circle -->
          <circle cx="${size/2}" cy="${size/2 - 12}" r="${size/2 - 14}" fill="rgba(0,0,0,0.25)" />
          
          ${innerContent}
        </svg>
      </div>
      <style>
        @keyframes teardropBounce {
          0% { transform: scale(0) translateY(-60px); opacity: 0; }
          75% { transform: scale(1.05) translateY(5px); }
          100% { transform: scale(1) translateY(0); opacity: 1; }
        }
      </style>
    `,
    iconSize: [size, size],
    iconAnchor: [size/2, size - 4],
  });

  return (
    <Marker position={[lat, lng]} icon={icon} zIndexOffset={loading ? 1000 : 0}>
      {/* Do not render tooltip interactions until node guarantees real API payload completion */}
      {!loading && <TensionTooltip point={point} />}
    </Marker>
  );
}
