import { Link } from 'react-router-dom';

export default function Topbar({ auth }) {
  const { username, role, logout } = auth;

  return (
    <header style={{
      height: '60px', width: '100%', backgroundColor: 'var(--color-bg-surface)',
      borderBottom: '1px solid var(--color-border)', display: 'flex',
      alignItems: 'center', justifyContent: 'space-between', padding: '0 var(--space-4)',
      position: 'fixed', top: 0, left: 0, zIndex: 1000
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
        {/* Animated radar icon */}
        <div style={{ position: 'relative', width: '16px', height: '16px' }}>
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
            borderRadius: '50%', border: '2px solid var(--color-teal-400)',
            opacity: 0.5
          }} />
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
            borderRadius: '50%', backgroundColor: 'var(--color-teal-400)',
            animation: 'radarPulse 2s linear infinite'
          }} />
          <style>{`
            @keyframes radarPulse {
              0% { transform: scale(0.1); opacity: 1; }
              100% { transform: scale(3); opacity: 0; }
            }
          `}</style>
        </div>
        <h1 style={{ fontSize: '18px', color: 'var(--color-text-primary)' }}>CITYFLOW SENTINEL</h1>
      </div>

      <nav style={{ display: 'flex', gap: 'var(--space-6)' }}>
        <Link to="/dashboard" style={{ textDecoration: 'none', color: 'var(--color-teal-400)', fontWeight: 600, fontSize: '13px', letterSpacing: '0.06em' }}>CARTE</Link>
        <Link to="/historique" style={{ textDecoration: 'none', color: 'var(--color-teal-400)', fontWeight: 600, fontSize: '13px', letterSpacing: '0.06em' }}>HISTORIQUE</Link>
        <Link to="/assistant" style={{ textDecoration: 'none', color: 'var(--color-teal-400)', fontWeight: 600, fontSize: '13px', letterSpacing: '0.06em' }}>ASSISTANT IA</Link>
      </nav>

      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
        <span className={`badge ${role === 'admin' ? 'badge-admin' : 'badge-operator'}`}>
          {username || role}
        </span>
        <button onClick={logout} className="btn-ghost" style={{ fontWeight: 600, letterSpacing: '0.06em' }}>DÉCONNEXION</button>
      </div>
    </header>
  );
}
