import React, { useState, useEffect } from 'react';
import SentinelMap from '../components/map/SentinelMap';
import LivePanel from '../components/prediction/LivePanel';
import WeatherStrip from '../components/prediction/WeatherStrip';
import KpiStrip from '../components/prediction/KpiStrip';
import { useWeather } from '../hooks/useWeather';
import { useMapPredictions } from '../hooks/useMapPredictions';

export default function DashboardPage({ historyLog, setHistoryLog }) {
  const [mapCenter, setMapCenter] = useState({ lat: 33.5731, lng: -7.5898 }); // Casablanca, Morocco
  const [activeWeather, setActiveWeather] = useState(null);
  const { weather: autoWeather } = useWeather(mapCenter.lat, mapCenter.lng);
  
  const displayWeather = activeWeather || autoWeather;
  
  // Connect to our refactored Click-based Hook!
  const { markers, error, predictPoint, predictCount, clearMarkers } = useMapPredictions();

  const handleBoundsChange = (map) => {
    const center = map.getCenter();
    setMapCenter({ lat: center.lat, lng: center.lng });
  };

  const handleMapClick = async (latlng) => {
    // Absolute precision Open-Meteo fetch for the exact click coordinates
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${latlng.lat}&longitude=${latlng.lng}&current=temperature_2m,rain,snowfall&timezone=auto`;
    try {
      const res = await fetch(url);
      const data = await res.json();
      const c = data.current;
      const pointWeather = {
        temp_k: (c.temperature_2m ?? 15) + 273.15,
        rain_1h: c.rain ?? 0,
        snow_1h: c.snowfall ?? 0,
        temp_c: c.temperature_2m ?? 15,
      };
      
      // Override the top-bar visual strip with precise point weather
      setActiveWeather(pointWeather);
      
      // Dispatch immediately to ML logic
      predictPoint(latlng.lat, latlng.lng, pointWeather);
    } catch {
      // Fallback
      if (displayWeather) predictPoint(latlng.lat, latlng.lng, displayWeather);
    }
  };

  // LivePanel Integration: Extract info exclusively from the MOST RECENT fully-loaded marker
  const completedMarkers = markers.filter(m => !m.loading);
  const lastMarker = completedMarkers.length > 0 ? completedMarkers[completedMarkers.length - 1] : null;
  const lastScore = lastMarker?.tension_score || null;
  const lastModel = lastMarker?.model || null;

  // Persist newly clicked predictions into the centralized Session Log
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
