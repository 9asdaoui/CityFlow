import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ErrorMessage from '../components/common/ErrorMessage';

export default function LoginPage({ auth }) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isRegistering) {
      await auth.registerUser(username, password, 'operator');
    } else {
      await auth.loginUser(username, password);
    }
    if (auth.isAuthenticated || localStorage.getItem('cf_token')) {
      navigate('/dashboard');
    }
  };

  return (
    <div style={{
      display: 'flex', height: '100vh', width: '100vw', backgroundColor: 'var(--color-bg-base)'
    }}>
      {/* Left decorative panel */}
      <div style={{
        flex: 1, position: 'relative', overflow: 'hidden', 
        borderRight: '1px solid var(--color-border)'
      }}>
        {/* Radar animation decorative element */}
        <div style={{
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
          width: '600px', height: '600px', borderRadius: '50%',
          border: '1px solid rgba(161, 227, 216, 0.1)',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div style={{ width: '400px', height: '400px', borderRadius: '50%', border: '1px solid rgba(161, 227, 216, 0.15)' }} />
          <div style={{ width: '200px', height: '200px', borderRadius: '50%', border: '1px solid rgba(161, 227, 216, 0.2)' }} />
        </div>
      </div>

      {/* Right login panel */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        padding: 'var(--space-10)'
      }}>
        <div className="card" style={{ width: '100%', maxWidth: '400px', borderTop: '4px solid var(--color-gold-500)' }}>
          <h1 style={{ marginBottom: 'var(--space-2)', fontSize: '28px' }}>CITYFLOW<br/>SENTINEL</h1>
          <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-6)', fontFamily: 'var(--font-body)' }}>
            Plateforme d'intelligence urbaine
          </p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <div>
              <label style={{ display: 'block', marginBottom: 'var(--space-2)' }}>Identifiant</label>
              <input 
                type="text" 
                value={username} onChange={e => setUsername(e.target.value)} 
                placeholder="Ex: operator_admin" required
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 'var(--space-2)' }}>Mot de passe</label>
              <input 
                type="password" 
                value={password} onChange={e => setPassword(e.target.value)} 
                placeholder="••••••••" required
              />
            </div>
            
            <button type="submit" className="btn-primary" disabled={auth.loading} style={{ marginTop: 'var(--space-2)' }}>
              {auth.loading 
                ? (isRegistering ? 'INSCRIPTION...' : 'CONNEXION...') 
                : (isRegistering ? 'INSCRIPTION' : 'CONNEXION')}
            </button>
            <ErrorMessage message={auth.error} />
          </form>

          <div style={{ marginTop: 'var(--space-6)', textAlign: 'center' }}>
            <button 
              onClick={() => setIsRegistering(!isRegistering)} 
              className="btn-ghost"
              style={{ fontSize: '11px' }}
            >
              {isRegistering ? 'Déjà un compte ? Se connecter' : 'Pas de compte ? S\'inscrire'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
