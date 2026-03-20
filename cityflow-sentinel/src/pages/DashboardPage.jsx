import React, { useState, useEffect } from 'react';
import SentinelMap from '../components/map/SentinelMap';
import LivePanel from '../components/prediction/LivePanel';
import WeatherStrip from '../components/prediction/WeatherStrip';
import KpiStrip from '../components/prediction/KpiStrip';
import { useWeather } from '../hooks/useWeather';
import { useMapPredictions } from '../hooks/useMapPredictions';

export default function DashboardPage({ historyLog, setHistoryLog }) {
  const [mapCenter, setMapCenter] = useState({ lat: 48.8566, lng: 2.3522 });
  const [mapBounds, setMapBounds] = useState(null);
  const { weather } = useWeather(mapCenter.lat, mapCenter.lng);
  const { markers, loading, error, lastScore, lastModel, fetchPredictionsForBounds, predictCount } = useMapPredictions();

  const handleBoundsChange = (map) => {
    const center = map.getCenter();
    setMapCenter({ lat: center.lat, lng: center.lng });
    setMapBounds(map.getBounds());
  };

  useEffect(() => {
    if (mapBounds && weather) {
      const timeoutId = setTimeout(() => {
        fetchPredictionsForBounds(mapBounds, weather);
      }, 600);
      return () => clearTimeout(timeoutId);
    }
  }, [mapBounds, weather, fetchPredictionsForBounds]);

  useEffect(() => {
    if (lastScore && weather) {
      setHistoryLog(prev => [{
        timestamp: new Date().toISOString(),
        weather: weather,
        score: lastScore,
        model: lastModel
      }, ...prev]);
    }
  }, [lastScore, lastModel]); // Only log when a new city-wide prediction arrives

  const avgScore = historyLog?.length ? historyLog.reduce((a, b) => a + b.score, 0) / historyLog.length : 0;
  const peak = historyLog?.slice().sort((a,b) => b.score - a.score)[0];
  const peakHour = peak ? new Date(peak.timestamp).toLocaleTimeString('fr-FR', {hour: '2-digit', minute:'2-digit'}) : '--:--';

  return (
    <div style={{ height: '100%', width: '100%', position: 'relative' }}>
      <SentinelMap 
        markers={markers} 
        loading={loading} 
        onBoundsChange={handleBoundsChange} 
      />
      <LivePanel 
        score={lastScore} 
        model={lastModel} 
        error={error} 
        lastUpdated={historyLog?.[0]?.timestamp} 
      />
      <WeatherStrip weather={weather} />
      <KpiStrip 
        predictionsCount={predictCount} 
        avgScore={avgScore} 
        peakHour={peakHour} 
        model={lastModel} 
      />
    </div>
  );
}
