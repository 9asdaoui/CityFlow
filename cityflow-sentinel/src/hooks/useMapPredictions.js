import { useState, useCallback, useRef } from 'react';
import { predict } from '../api/predictApi';

/**
 * THE CORE HOOK — Refactored for Point-and-Click Map Prediction!
 */
export function useMapPredictions() {
  const [markers, setMarkers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [predictCount, setPredictCount] = useState(0);

  const clearMarkers = useCallback(() => {
    setMarkers([]);
  }, []);

  const predictPoint = useCallback(async (lat, lng, weather) => {
    if (!weather) return null;
    
    // Mount a pending marker instantly at the click coordinates
    const newMarkerId = 'm_' + Date.now() + Math.random().toFixed(4);
    setMarkers(prev => [...prev, { id: newMarkerId, lat, lng, loading: true }]);
    
    try {
      setLoading(true);
      const now = new Date();
      now.setMinutes(0, 0, 0);
      const date_time = now.toISOString().replace('T', ' ').slice(0, 19);

      // Fetch precise prediction for this specific latitude & longitude
      const result = await predict({
        date_time,
        temp: weather.temp_k,
        rain_1h: weather.rain_1h,
        snow_1h: weather.snow_1h,
        lat,
        lng
      });

      // Update the pending marker with real data
      setMarkers(prev => prev.map(m => 
        m.id === newMarkerId 
          ? { ...m, loading: false, tension_score: result.tension_score, model: result.model } 
          : m
      ));
      
      setPredictCount(pre => pre + 1);
      return result;
    } catch (err) {
      setError(err.userMessage || 'Prediction failed');
      // Prune the pending marker if API completely fails
      setMarkers(prev => prev.filter(m => m.id !== newMarkerId));
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { markers, loading, error, predictPoint, predictCount, clearMarkers };
}
