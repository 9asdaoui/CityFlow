import React from 'react';
import { fmtTempC, fmtRain } from '../../utils/formatters';

export default function WeatherStrip({ weather }) {
  if (!weather) return null;
  
  return (
    <div className="map-panel" style={{
      position: 'absolute', top: 20, right: 20, display: 'flex', gap: 'var(--space-4)',
      padding: 'var(--space-2) var(--space-4)', zIndex: 1000, alignItems: 'center'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <span style={{ fontSize: '16px' }}>🌡</span>
        <span style={{ fontFamily: 'var(--font-data)', color: 'var(--color-text-primary)' }}>{fmtTempC(weather.temp_c)}</span>
      </div>
      <div style={{ borderLeft: '1px solid var(--color-border)', height: '24px' }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <span style={{ fontSize: '16px' }}>🌧</span>
        <span style={{ fontFamily: 'var(--font-data)', color: 'var(--color-text-primary)' }}>{fmtRain(weather.rain_1h)}</span>
      </div>
      <div style={{ borderLeft: '1px solid var(--color-border)', height: '24px' }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <span style={{ fontSize: '16px' }}>❄</span>
        <span style={{ fontFamily: 'var(--font-data)', color: 'var(--color-text-primary)' }}>{fmtRain(weather.snow_1h)}</span>
      </div>
    </div>
  );
}
