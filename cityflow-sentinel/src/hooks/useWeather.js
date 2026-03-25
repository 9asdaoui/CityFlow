import { useState, useEffect } from 'react';

function indexForCurrentHour(data) {
  const hourlyTimes = data?.hourly?.time || [];
  const currentTime = data?.current?.time;
  if (!currentTime || !hourlyTimes.length) return 0;
  const idx = hourlyTimes.indexOf(currentTime);
  return idx >= 0 ? idx : 0;
}

export async function fetchWeatherAt(lat, lng) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,rain,snowfall,precipitation&hourly=rain,snowfall,precipitation&forecast_hours=24&timezone=auto`;
  const res = await fetch(url);
  const data = await res.json();

  const c = data?.current || {};
  const idx = indexForCurrentHour(data);
  const hourly = data?.hourly || {};

  const rainNow = Number(c.rain ?? 0);
  const snowNow = Number(c.snowfall ?? 0);
  const rainHourly = Number((hourly.rain || [])[idx] ?? 0);
  const snowHourly = Number((hourly.snowfall || [])[idx] ?? 0);

  return {
    temp_k: (c.temperature_2m ?? 15) + 273.15,
    temp_c: c.temperature_2m ?? 15,
    // Keep API compatibility with existing prediction payload fields.
    rain_1h: Math.max(rainNow, rainHourly),
    snow_1h: Math.max(snowNow, snowHourly),
  };
}

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
    fetchWeatherAt(lat, lng)
      .then((w) => setWeather(w))
      .catch(() => setError('Météo non disponible'))
      .finally(() => setLoading(false));
  }, [lat, lng]);

  return { weather, loading, error };
}
