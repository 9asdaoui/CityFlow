/**
 * Generates a lat/lng grid of points covering a Leaflet map bounds object.
 * @param {Object} bounds — Leaflet LatLngBounds
 * @param {number} size   — grid dimension (size × size points)
 * @returns {Array<{ lat, lng }>}
 */
export function generateGridPoints(bounds, size = 6) {
  const sw = bounds.getSouthWest();
  const ne = bounds.getNorthEast();
  const latStep = (ne.lat - sw.lat) / (size - 1);
  const lngStep = (ne.lng - sw.lng) / (size - 1);
  const points = [];
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      points.push({
        lat: sw.lat + r * latStep,
        lng: sw.lng + c * lngStep,
      });
    }
  }
  return points;
}
