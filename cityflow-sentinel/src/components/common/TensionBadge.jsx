import { tensionColor, tensionLabel } from '../../utils/tensionColor';

export default function TensionBadge({ score }) {
  if (score == null) return null;
  const colorInfo = tensionColor(score);
  const label = tensionLabel(score);
  
  return (
    <span className={`badge badge-${colorInfo.cls === 'low' ? 'teal' : colorInfo.cls === 'medium' ? 'gold' : 'danger'}`}>
      {label}
    </span>
  );
}
