import React from 'react';
import { fmtScore } from '../../utils/formatters';

export default function KpiStrip({ predictionsCount, avgScore, peakHour, model }) {
  return (
    <div className="map-panel" style={{
      position: 'absolute', bottom: 30, left: '50%', transform: 'translateX(-50%)',
      display: 'flex', gap: 'var(--space-6)', padding: 'var(--space-3) var(--space-6)',
      zIndex: 1000, alignItems: 'center'
    }}>
      <KpiItem label="PRÉDICTIONS (SESSION)" value={predictionsCount} />
      <KpiItem label="SCORE MOYEN" value={fmtScore(avgScore)} isScore />
      <KpiItem label="HEURE DE POINTE" value={peakHour || '—'} />
      <KpiItem label="MODÈLE" value={model || '—'} />
    </div>
  );
}

function KpiItem({ label, value, isScore }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
      <label>{label}</label>
      <span style={{ 
        fontFamily: 'var(--font-data)', fontSize: '18px', fontWeight: 600,
        color: isScore ? 'var(--color-gold-300)' : 'var(--color-teal-400)'
      }}>
        {value}
      </span>
    </div>
  );
}
