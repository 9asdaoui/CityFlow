import React from 'react';
import { tensionColor } from '../../utils/tensionColor';

export default function TensionGauge({ score }) {
  if (score == null) return null;
  
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;
  const color = tensionColor(score);
  
  return (
    <div className="tension-gauge-wrap" style={{ position: 'relative' }}>
      <svg width="100" height="100" viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
        {/* Background track */}
        <circle cx="50" cy="50" r={radius} fill="none" stroke="var(--color-border)" strokeWidth="6" />
        {/* Value track */}
        <circle 
          cx="50" cy="50" r={radius} fill="none" stroke={color.hex} strokeWidth="6"
          strokeDasharray={circumference} strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.5s ease-in-out, stroke 0.5s ease-in-out' }}
        />
      </svg>
      <div style={{ position: 'absolute', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100px', height: '100px' }}>
        <span className={`tension-score-label ${color.cls}`}>{score.toFixed(0)}</span>
      </div>
    </div>
  );
}
