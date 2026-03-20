import React, { useState, useRef, useEffect } from 'react';
import { useChat } from '../hooks/useChat';

export default function AssistantPage() {
  const { messages, loading, error, sendMessage, clearChat } = useChat();
  const [inputMsg, setInputMsg] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputMsg.trim() && !loading) {
      sendMessage(inputMsg);
      setInputMsg('');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const renderMessageContent = (content) => {
    if (!content) return null;
    const parts = content.split(/(Source:.*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('Source:')) {
        return <div key={index} className="chat-citation">{part}</div>;
      }
      return <span key={index}>{part}</span>;
    });
  };

  return (
    <div style={{ display: 'flex', height: '100%' }}>
      {/* Left panel */}
      <div style={{ flex: '0 0 35%', borderRight: '1px solid var(--color-border)', padding: 'var(--space-6)', backgroundColor: 'var(--color-bg-surface)', display: 'flex', flexDirection: 'column' }}>
        <h2 style={{ marginBottom: 'var(--space-2)' }}>ASSISTANT RÉGLEMENTAIRE IA</h2>
        <p style={{ color: 'var(--color-text-muted)', marginBottom: 'var(--space-8)' }}>
          Posez vos questions sur les politiques de mobilité urbaine, les protocoles d'urgence et la gestion du trafic.
        </p>

        <h3 style={{ marginBottom: 'var(--space-4)' }}>EXEMPLES DE QUESTIONS</h3>
        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          {["Quel est le protocole en cas de score de tension critique dans le centre-ville ?",
            "Quelles sont les règles de circulation pour les poids lourds aux heures de pointe ?",
            "Comment gérer une alerte météo orange avec un score de trafic modéré ?"].map((q, i) => (
            <li key={i}>
              <button 
                onClick={() => setInputMsg(q)}
                style={{ 
                  background: 'none', border: '1px solid var(--color-border)', color: 'var(--color-text-secondary)',
                  padding: 'var(--space-3)', width: '100%', textAlign: 'left', borderRadius: 'var(--radius)',
                  cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: '12px'
                }}
              >
                {q}
              </button>
            </li>
          ))}
        </ul>
        <div style={{ flex: 1 }} />
        <button className="btn-secondary" onClick={clearChat} style={{ width: '100%', marginTop: 'var(--space-4)' }}>
          EFFACER L'HISTORIQUE
        </button>
      </div>

      {/* Chat Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative' }}>
        <div className="chat-container">
          {messages.length === 0 ? (
            <div style={{ margin: 'auto', textAlign: 'center', color: 'var(--color-text-muted)' }}>
              L'assistant est prêt. Posez votre question ci-dessous.
            </div>
          ) : (
            messages.map((msg, idx) => (
              <div key={idx} className={`chat-bubble ${msg.role}`}>
                {renderMessageContent(msg.content)}
              </div>
            ))
          )}
          
          {loading && (
            <div className="chat-bubble assistant">
              <div className="chat-typing">
                <span /><span /><span />
              </div>
            </div>
          )}
          {error && (
            <div style={{ color: 'var(--color-danger)', textAlign: 'center', margin: 'var(--space-2)' }}>
              {error}
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSubmit} style={{ 
          padding: 'var(--space-4)', borderTop: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg-base)' 
        }}>
          <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
            <textarea
              value={inputMsg}
              onChange={e => setInputMsg(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Tapez votre message ici..."
              style={{ flex: 1, height: '44px', resize: 'none', lineHeight: '1.5', fontFamily: 'var(--font-body)' }}
            />
            <button type="submit" className="btn-primary" disabled={loading || !inputMsg.trim()}>ENVOYER</button>
          </div>
        </form>
      </div>
    </div>
  );
}
