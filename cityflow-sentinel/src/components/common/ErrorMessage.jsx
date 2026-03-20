export default function ErrorMessage({ message }) {
  if (!message) return null;
  return (
    <div style={{
      background: 'var(--color-danger-bg)', color: 'var(--color-danger)',
      border: '1px solid var(--color-danger-border)', padding: 'var(--space-3)',
      borderRadius: 'var(--radius)', fontSize: '12px', marginTop: 'var(--space-2)'
    }}>
      {message}
    </div>
  );
}
