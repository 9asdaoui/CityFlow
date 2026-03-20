import { useState, useCallback, useRef } from 'react';
import { predict } from '../api/predictApi';
import { generateGridPoints } from '../utils/mapGrid';

/**
 * THE CORE HOOK — powers the automatic map prediction system.
 */
export function useMapPredictions() {
  const [markers, setMarkers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastScore, setLastScore] = useState(null);
  const [lastModel, setLastModel] = useState(null);
  const [predictCount, setPredictCount] = useState(0);
  const abortRef = useRef(null);

  const fetchPredictionsForBounds = useCallback(async (bounds, weather) => {
    // Cancel previous batch
    if (abortRef.current) abortRef.current = false;
    const currentToken = {};
    abortRef.current = currentToken;

    if (!weather) return;
    setLoading(true);
    setError(null);

    const now = new Date();
    now.setMinutes(0, 0, 0);
    const date_time = now.toISOString().replace('T', ' ').slice(0, 19);

    try {
      // One prediction call to get the city-wide base score
      const result = await predict({
        date_time,
        temp: weather.temp_k,
        rain_1h: weather.rain_1h,
        snow_1h: weather.snow_1h,
      });

      if (currentToken !== abortRef.current) return; // stale

      setLastScore(result.tension_score);
      setLastModel(result.model);
      setPredictCount(pre => pre + 1);

      // Generate grid points and apply per-point jitter
      const gridPoints = generateGridPoints(bounds, 6); // 6x6 grid
      const jitteredMarkers = gridPoints.map((point) => ({
        ...point,
        tension_score: clamp(result.tension_score + (Math.random() - 0.5) * 30, 0, 100),
      }));

      setMarkers(jitteredMarkers);
    } catch (err) {
      if (currentToken === abortRef.current) setError(err.userMessage);
    } finally {
      if (currentToken === abortRef.current) setLoading(false);
    }
  }, []);

  return { markers, loading, error, lastScore, lastModel, fetchPredictionsForBounds, predictCount };
}

function clamp(val, min, max) { return Math.min(Math.max(val, min), max); }
