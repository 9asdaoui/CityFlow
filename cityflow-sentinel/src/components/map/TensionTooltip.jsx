import React from 'react';
import { Tooltip } from 'react-leaflet';
import TensionBadge from '../common/TensionBadge';
import { fmtScore, fmtHour, fmtTempC, fmtRain } from '../../utils/formatters';

export default function TensionTooltip({ point }) {
  const { lat, lng, tension_score, weather, timestamp } = point;
  
  return (
    <Tooltip direction="top" offset={[0, -20]} opacity={0.95} interactive={false}>
      <div style={{
        backgroundColor: 'var(--color-bg-surface)', padding: 'var(--space-3)',
        border: '1px solid var(--color-border)', borderRadius: 'var(--radius)',
        color: 'var(--color-text-primary)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-2)' }}>
          <span style={{ fontFamily: 'var(--font-data)', fontSize: '18px', fontWeight: 600, color: 'var(--color-gold-300)', marginRight: 'var(--space-4)' }}>
            SCORE {fmtScore(tension_score)}
          </span>
          <TensionBadge score={tension_score} />
        </div>
        <hr style={{ borderColor: 'var(--color-border)', margin: 'var(--space-2) 0' }} />
        <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontFamily: 'var(--font-body)' }}>
          {lat.toFixed(3)}°N {lng.toFixed(3)}°E
        </div>
        {weather && (
          <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
            {timestamp ? fmtHour(timestamp) : ''} · {fmtTempC(weather.temp_c)} · {fmtRain(weather.rain_1h)}
          </div>
        )}
      </div>
    </Tooltip>
  );
}
