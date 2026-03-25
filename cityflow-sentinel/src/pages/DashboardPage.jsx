import React, { useState, useEffect } from 'react';
import SentinelMap from '../components/map/SentinelMap';
import LivePanel from '../components/prediction/LivePanel';
import WeatherStrip from '../components/prediction/WeatherStrip';
import KpiStrip from '../components/prediction/KpiStrip';
import { useWeather, fetchWeatherAt } from '../hooks/useWeather';
import { useMapPredictions } from '../hooks/useMapPredictions';

export default function DashboardPage({ historyLog, setHistoryLog }) {
  const [mapCenter, setMapCenter] = useState({ lat: 33.5731, lng: -7.5898 });
  const [activeWeather, setActiveWeather] = useState(null);
  const { weather: autoWeather } = useWeather(mapCenter.lat, mapCenter.lng);
  
  const displayWeather = activeWeather || autoWeather;
  
  const { markers, error, predictPoint, predictCount, clearMarkers } = useMapPredictions();

  const handleBoundsChange = (map) => {
    const center = map.getCenter();
    setMapCenter({ lat: center.lat, lng: center.lng });
  };

  const handleMapClick = async (latlng) => {
    try {
      const pointWeather = await fetchWeatherAt(latlng.lat, latlng.lng);
      
      setActiveWeather(pointWeather);
      
      predictPoint(latlng.lat, latlng.lng, pointWeather);
    } catch {
      if (displayWeather) predictPoint(latlng.lat, latlng.lng, displayWeather);
    }
  };

  const completedMarkers = markers.filter(m => !m.loading);
  const lastMarker = completedMarkers.length > 0 ? completedMarkers[completedMarkers.length - 1] : null;
  const lastScore = lastMarker?.tension_score || null;
  const lastModel = lastMarker?.model || null;

  useEffect(() => {
    if (lastScore && displayWeather) {
      const isAlreadyLogged = historyLog?.[0]?.score === lastScore && historyLog?.[0]?.model === lastModel;
      if (!isAlreadyLogged) {
        setHistoryLog(prev => [{
          timestamp: new Date().toISOString(),
          weather: displayWeather,
          score: lastScore,
          model: lastModel
        }, ...(prev || [])]);
      }
    }
  }, [lastScore, lastModel, displayWeather]);

  const avgScore = historyLog?.length ? historyLog.reduce((a, b) => a + b.score, 0) / historyLog.length : 0;
  const peak = historyLog?.slice().sort((a,b) => b.score - a.score)[0];
  const peakHour = peak ? new Date(peak.timestamp).toLocaleTimeString('fr-FR', {hour: '2-digit', minute:'2-digit'}) : '--:--';

  return (
    <div style={{ height: '100%', width: '100%', position: 'relative' }}>
      <SentinelMap 
        markers={markers} 
        onBoundsChange={handleBoundsChange} 
        onMapClick={handleMapClick}
        onClearMarkers={clearMarkers}
      />
      <LivePanel 
        score={lastScore} 
        model={lastModel} 
        error={error} 
        lastUpdated={historyLog?.[0]?.timestamp} 
      />
      <WeatherStrip weather={displayWeather} />
      <KpiStrip 
        predictionsCount={predictCount} 
        avgScore={avgScore} 
        peakHour={peakHour} 
        model={lastModel} 
      />
    </div>
  );
}
