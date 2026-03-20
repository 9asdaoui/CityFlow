export function tensionColor(score) {
  if (score < 34) return { hex: '#A1E3D8', cls: 'low' };
  if (score < 67) return { hex: '#FFE44B', cls: 'medium' };
  return { hex: '#e85d3a', cls: 'high' };
}

export function tensionLabel(score) {
  if (score < 34) return 'FAIBLE';
  if (score < 67) return 'MODÉRÉ';
  return 'CRITIQUE';
}
