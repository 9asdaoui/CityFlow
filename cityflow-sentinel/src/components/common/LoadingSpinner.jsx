export default function LoadingSpinner() {
  return (
    <div style={{
      position: 'absolute', top: 16, right: 16, zIndex: 1000,
      background: 'var(--color-bg-surface)', padding: '6px 12px',
      borderRadius: 'var(--radius)', border: '1px solid var(--color-border)',
      fontFamily: 'var(--font-data)', fontSize: '12px', color: 'var(--color-gold-300)',
      boxShadow: '0 2px 8px rgba(0,0,0,0.5)'
    }}>
      ◉ CALCUL EN COURS...
    </div>
  );
}
