import { useState, useCallback } from 'react';

/**
 * Manages the AI regulatory assistant chat.
 */
export function useChat() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const sendMessage = useCallback(async (userText) => {
    const userMsg = { role: 'user', content: userText };
    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setLoading(true);
    setError(null);

    const systemPrompt = `You are CityFlow Sentinel's urban regulation assistant. 
You help city operators understand urban mobility policies, traffic management 
protocols, and emergency procedures. You answer questions by citing relevant 
policy documents. Always end your response with a "Source:" line indicating 
which regulatory document you referenced (e.g., "Source: Code de la mobilité 
urbaine, Article 14" or "Source: Manuel de gestion des crises routières, §3.2"). 
Keep answers concise and operational. If you don't know, say so clearly.`;

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          system: systemPrompt,
          messages: newHistory,
        }),
      });

      const data = await response.json();
      const assistantText = data.content?.find((b) => b.type === 'text')?.text || 'Aucune réponse.';
      setMessages([...newHistory, { role: 'assistant', content: assistantText }]);
    } catch {
      setError('Impossible de contacter l\'assistant IA.');
    } finally {
      setLoading(false);
    }
  }, [messages]);

  const clearChat = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  return { messages, loading, error, sendMessage, clearChat };
}
