import api from './axiosConfig';

/**
 * Get tension prediction for a given time/weather combination.
 * POST /predict
 * Requires: Authorization Bearer token
 * Body: { date_time, temp, rain_1h, snow_1h }
 *   - date_time: ISO string "YYYY-MM-DD HH:MM:SS"
 *   - temp: Kelvin (e.g. 293.15 for 20°C)
 *   - rain_1h: mm (float)
 *   - snow_1h: mm (float)
 * Returns: { tension_score: number, model: string }
 */
export async function predict({ date_time, temp, rain_1h, snow_1h, lat, lng }) {
  const res = await api.post('/predict', { date_time, temp, rain_1h, snow_1h, lat, lng });
  return res.data; // { tension_score, model }
}
