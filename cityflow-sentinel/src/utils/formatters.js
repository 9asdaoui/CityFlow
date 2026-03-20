export const fmtScore   = (s) => s?.toFixed(1) ?? '—';
export const fmtTempC   = (c) => `${c?.toFixed(1) ?? '—'} °C`;
export const fmtTempK   = (k) => `${(k - 273.15).toFixed(1)} °C`;
export const fmtRain    = (r) => `${r?.toFixed(1) ?? '0.0'} mm`;
export const fmtDate    = (d) => new Date(d).toLocaleString('fr-FR', { hour12: false });
export const fmtHour    = (d) => new Date(d).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
