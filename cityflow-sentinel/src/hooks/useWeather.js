import { useState, useEffect } from 'react';

/**
 * Fetches current weather at a given lat/lng using Open-Meteo (free, no API key).
 * Returns: { temp_k, rain_1h, snow_1h, loading, error }
 * temp_k is in Kelvin (= Celsius + 273.15) to match the /predict API.
 */
export function useWeather(lat, lng) {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (lat == null || lng == null) return;
    setLoading(true);
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,rain,snowfall&timezone=auto`;
    fetch(url)
      .then((r) => r.json())
      .then((data) => {
        const c = data.current;
        setWeather({
          temp_k: (c.temperature_2m ?? 15) + 273.15,
          rain_1h: c.rain ?? 0,
          snow_1h: c.snowfall ?? 0,
          temp_c: c.temperature_2m ?? 15,
        });
      })
      .catch(() => setError('Météo non disponible'))
      .finally(() => setLoading(false));
  }, [lat, lng]);

  return { weather, loading, error };
}
