import React from 'react';
import TensionGauge from './TensionGauge';
import TensionBadge from '../common/TensionBadge';
import ErrorMessage from '../common/ErrorMessage';
import { fmtDate } from '../../utils/formatters';

export default function LivePanel({ score, model, error, lastUpdated }) {
  return (
    <div className="map-panel" style={{
      position: 'absolute', top: 20, left: 20, width: '280px', padding: 'var(--space-4)', zIndex: 1000
    }}>
      <h2 style={{ marginBottom: 'var(--space-3)', borderBottom: '1px solid var(--color-border)', paddingBottom: 'var(--space-2)' }}>
        ÉTAT EN DIRECT
      </h2>
      
      {error && <ErrorMessage message={error} />}
      
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: 'var(--space-4) 0' }}>
        <TensionGauge score={score} />
        <div style={{ marginTop: 'var(--space-3)' }}>
          <TensionBadge score={score} />
        </div>
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', marginTop: 'var(--space-4)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <label>MODÈLE IA</label>
          <span style={{ color: 'var(--color-text-secondary)', fontFamily: 'var(--font-data)' }}>{model || '—'}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <label>ACTUALISÉ</label>
          <span style={{ color: 'var(--color-text-muted)' }}>{lastUpdated ? fmtDate(lastUpdated) : '—'}</span>
        </div>
      </div>
    </div>
  );
}
