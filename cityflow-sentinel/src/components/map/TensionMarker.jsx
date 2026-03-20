import React from 'react';
import { Marker } from 'react-leaflet';
import L from 'leaflet';
import TensionTooltip from './TensionTooltip';
import { tensionColor } from '../../utils/tensionColor';

export default function TensionMarker({ point }) {
  const { lat, lng, tension_score } = point;
  const color = tensionColor(tension_score);
  
  const size = tension_score < 34 ? 28 : tension_score < 67 ? 36 : 44;
  
  const icon = L.divIcon({
    className: '',
    html: `
      <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
        <circle
          cx="${size/2}" cy="${size/2}" r="${size/2 - 2}"
          fill="${color.hex}"
          fill-opacity="0.5"
          stroke="${color.hex}"
          stroke-width="1.5"
          class="${tension_score >= 67 ? 'tension-ring critical' : 'tension-ring'}"
        />
        <text
          x="50%" y="50%"
          dominant-baseline="central"
          text-anchor="middle"
          font-size="${size < 36 ? 8 : 10}"
          font-family="DM Mono, monospace"
          fill="white"
          font-weight="600"
        >${tension_score.toFixed(0)}</text>
      </svg>
    `,
    iconSize: [size, size],
    iconAnchor: [size/2, size/2],
  });

  return (
    <Marker position={[lat, lng]} icon={icon}>
      <TensionTooltip point={point} />
    </Marker>
  );
}
