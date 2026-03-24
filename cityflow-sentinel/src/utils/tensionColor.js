/* HSL interpolation for vibrant, highly differentiated colors */
const config = {
  0:   { h: 170, s: 54,  l: 76 }, // matches ~ #A1E3D8 (Teal)
  50:  { h: 51,  s: 100, l: 65 }, // matches ~ #FFE44B (Gold)
  100: { h: 12,  s: 79,  l: 57 }  // matches ~ #e85d3a (Red-Orange)
};

function lerp(start, end, t) {
  return start + (end - start) * t;
}

function hslToHex(h, s, l) {
  s /= 100;
  l /= 100;

  let c = (1 - Math.abs(2 * l - 1)) * s,
      x = c * (1 - Math.abs((h / 60) % 2 - 1)),
      m = l - c/2,
      r = 0,
      g = 0,
      b = 0;

  if (0 <= h && h < 60) {
    r = c; g = x; b = 0;
  } else if (60 <= h && h < 120) {
    r = x; g = c; b = 0;
  } else if (120 <= h && h < 180) {
    r = 0; g = c; b = x;
  } else if (180 <= h && h < 240) {
    r = 0; g = x; b = c;
  } else if (240 <= h && h < 300) {
    r = x; g = 0; b = c;
  } else if (300 <= h && h < 360) {
    r = c; g = 0; b = x;
  }

  r = Math.round((r + m) * 255).toString(16).padStart(2, '0');
  g = Math.round((g + m) * 255).toString(16).padStart(2, '0');
  b = Math.round((b + m) * 255).toString(16).padStart(2, '0');

  return `#${r}${g}${b}`.toUpperCase();
}

export function tensionColor(score) {
  if (score == null) return { hex: '#A1E3D8', cls: 'low' };
  
  const s = Math.max(0, Math.min(100, score));
  let h, st, l;
  
  if (s <= 50) {
    const t = s / 50;
    h = lerp(config[0].h, config[50].h, t);
    st = lerp(config[0].s, config[50].s, t);
    l = lerp(config[0].l, config[50].l, t);
  } else {
    const t = (s - 50) / 50;
    h = lerp(config[50].h, config[100].h, t);
    st = lerp(config[50].s, config[100].s, t);
    l = lerp(config[50].l, config[100].l, t);
  }

  let cls = 'high';
  if (s < 34) cls = 'low';
  else if (s < 67) cls = 'medium';

  return { hex: hslToHex(h, st, l), cls };
}

export function tensionLabel(score) {
  if (score < 34) return 'FAIBLE';
  if (score < 67) return 'MODÉRÉ';
  return 'CRITIQUE';
}
