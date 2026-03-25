import { useState, useCallback } from 'react';

/**
 * Manages the AI regulatory assistant chat.
 */
export function useChat() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getSessionId = () => {
    let sid = localStorage.getItem('cf_session_id');
    if (!sid) {
      sid = 'sess_' + Math.random().toString(36).substring(2, 9);
      localStorage.setItem('cf_session_id', sid);
    }
    return sid;
  };

  const loadHistory = useCallback(async () => {
    const token = localStorage.getItem('cf_token');
    const userId = getSessionId();
    if (!token) return;

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/chat/history/${userId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setMessages(data);
      }
    } catch {
      console.warn("Could not load history");
    }
  }, []);

  const sendMessage = useCallback(async (userText) => {
    const userMsg = { role: 'user', content: userText };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);
    setError(null);

    const token = localStorage.getItem('cf_token');
    const userId = getSessionId();

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/chat/`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          user_id: userId,
          query: userText
        }),
      });

      if (!response.ok) throw new Error('API Error');

      const data = await response.json();
      
      let assistantText = data.answer;

      setMessages(prev => [...prev, { role: 'assistant', content: assistantText }]);
    } catch {
      setError("Impossible de contacter l'assistant IA local via FastAPI.");
    } finally {
      setLoading(false);
    }
  }, []);

  const clearChat = useCallback(async () => {
    const token = localStorage.getItem('cf_token');
    const userId = getSessionId();

    try {
      if (!token) {
        setError("Session expirée. Reconnectez-vous pour effacer l'historique.");
        return;
      }

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/chat/history/${userId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) {
        throw new Error(`Delete failed with status ${response.status}`);
      }

      setMessages([]);
      setError(null);
    } catch (err) {
      console.warn('Could not clear chat history from backend', err);
      setError("Échec de suppression côté serveur. Réessayez dans quelques secondes.");
    }
  }, []);

  return { messages, loading, error, sendMessage, clearChat, loadHistory };
}
