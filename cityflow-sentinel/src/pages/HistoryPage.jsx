import React from 'react';
import { tensionLabel, tensionColor } from '../utils/tensionColor';
import { fmtDate, fmtTempC, fmtRain, fmtScore } from '../utils/formatters';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function HistoryPage({ historyLog }) {
  const chartData = [...(historyLog || [])].reverse().map(h => ({
    time: new Date(h.timestamp).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
    score: h.score,
    fullTimestamp: h.timestamp
  }));

  const uniqueChartData = chartData.filter((v,i,a)=>a.findIndex(t=>(t.time === v.time))===i);

  return (
    <div style={{ padding: 'var(--space-6)', overflowY: 'auto', height: '100%' }}>
      <h2 style={{ marginBottom: 'var(--space-6)' }}>HISTORIQUE DES PRÉDICTIONS</h2>
      
      {/* Sparkline */}
      <div className="card" style={{ marginBottom: 'var(--space-6)', height: '240px' }}>
        <h3 style={{ marginBottom: 'var(--space-4)' }}>TENDANCE DE LA SESSION</h3>
        <ResponsiveContainer width="100%" height="80%">
          <LineChart data={uniqueChartData}>
            <XAxis dataKey="time" stroke="var(--color-text-muted)" tick={{fontSize: 10}} />
            <YAxis stroke="var(--color-text-muted)" tick={{fontSize: 10}} domain={[0, 100]} />
            <Tooltip 
              contentStyle={{ backgroundColor: 'var(--color-bg-elevated)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)' }} 
            />
            <Line type="monotone" dataKey="score" stroke="var(--color-teal-400)" strokeWidth={2} dot={{ r: 3, fill: 'var(--color-bg-surface)' }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Table */}
      <div className="card">
        <table>
          <thead>
            <tr>
              <th>Horodatage</th>
              <th>Temp (°C)</th>
              <th>Pluie</th>
              <th>Neige</th>
              <th>Score</th>
              <th>Modèle</th>
              <th>Tension</th>
            </tr>
          </thead>
          <tbody>
            {historyLog && historyLog.length > 0 ? historyLog.map((log, i) => {
              const rowClass = tensionColor(log.score).cls;
              return (
                <tr key={i} className={`row-${rowClass}`}>
                  <td>{fmtDate(log.timestamp)}</td>
                  <td>{fmtTempC(log.weather?.temp_c)}</td>
                  <td>{fmtRain(log.weather?.rain_1h)}</td>
                  <td>{fmtRain(log.weather?.snow_1h)}</td>
                  <td style={{ color: 'var(--color-gold-300)' }}>{fmtScore(log.score)}</td>
                  <td>{log.model || '—'}</td>
                  <td><span className={`badge badge-${rowClass === 'low' ? 'teal' : rowClass === 'medium' ? 'gold' : 'danger'}`}>{tensionLabel(log.score)}</span></td>
                </tr>
              );
            }) : (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: 'var(--space-6)' }}>
                  Aucune prédiction enregistrée pour cette session.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
