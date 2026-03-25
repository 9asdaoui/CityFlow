import React, { useState, useRef, useEffect } from 'react';
import { useChat } from '../hooks/useChat';
import ReactMarkdown from 'react-markdown';

export default function AssistantPage() {
  const { messages, loading, error, sendMessage, clearChat, loadHistory } = useChat();
  const [inputMsg, setInputMsg] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

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

  return (
    <div className="flex h-full w-full bg-slate-900 text-slate-200 font-sans">
      {/* Left panel */}
      <div className="w-1/3 border-r border-slate-700/50 p-8 flex flex-col bg-slate-800/20">
        <h2 className="text-xl font-bold tracking-wider text-white mb-2 uppercase">ASSISTANT RÉGLEMENTAIRE IA</h2>
        <p className="text-sm text-slate-400 mb-8 leading-relaxed">
          Posez vos questions sur les politiques de mobilité urbaine, les protocoles d'urgence et la gestion du trafic.
        </p>

        <h3 className="text-xs font-semibold tracking-widest text-slate-500 uppercase mb-4">EXEMPLES DE QUESTIONS</h3>
        <ul className="flex flex-col gap-3">
          {["Quels sont les différents niveaux de tension et leurs impacts sur la gestion du trafic ?",
            "Quelle est la procédure d'urgence lors d'un accident bloquant (Alerte Rouge) ?",
            "Quelles sont les restrictions de circulation obligatoires pendant les pics de pollution (IQA > 300) ?"].map((q, i) => (
            <li key={i}>
              <button 
                onClick={() => setInputMsg(q)}
                className="w-full text-left p-4 rounded-xl border border-slate-600/40 bg-slate-800/30 text-sm text-slate-300 hover:text-gold-300 hover:border-gold-500/50 hover:shadow-[0_0_15px_rgba(255,228,75,0.1)] transition-all duration-300 ease-in-out"
              >
                {q}
              </button>
            </li>
          ))}
        </ul>
        <div className="flex-1" />
        <button 
          onClick={clearChat} 
          className="w-full mt-6 py-3 px-4 rounded-lg border border-slate-600/50 text-slate-400 hover:text-red-400 hover:border-red-500/50 hover:bg-red-500/10 transition-colors uppercase text-xs font-bold tracking-widest"
        >
          EFFACER L'HISTORIQUE
        </button>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col relative bg-slate-900/50">
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 custom-scrollbar">
          {messages.length === 0 ? (
            <div className="m-auto text-center text-slate-500 text-sm italic">
              L'assistant est prêt. Posez votre question ci-dessous.
            </div>
          ) : (
            messages.map((msg, idx) => (
              <div 
                key={idx} 
                className={`max-w-[85%] text-sm leading-relaxed shadow-sm ${
                  msg.role === 'user' 
                    ? 'ml-auto bg-slate-700/60 text-slate-100 p-5 rounded-2xl rounded-tr-sm border border-slate-600/30' 
                    : 'mr-auto bg-slate-800/40 text-slate-300 p-6 rounded-2xl rounded-tl-sm border border-teal-900/30'
                }`}
              >
                {/* Specific Markdown styling mapped beautifully to Custom React components! */}
                {msg.role === 'user' ? (
                  <span className="whitespace-pre-wrap">{msg.content}</span>
                ) : (
                  <ReactMarkdown 
                    components={{
                      h3: ({node, ...props}) => {
                        return <h3 className="text-gold-400 mt-6 mb-3 font-bold uppercase text-xs tracking-widest flex items-center gap-2 before:content-[''] before:w-1 before:h-4 before:bg-gold-500 before:block" {...props} />;
                      },
                      hr: ({node, ...props}) => <hr className="border-t border-dashed border-slate-700/60 my-6" {...props} />,
                      p: ({node, ...props}) => <p className="mb-4 leading-relaxed tracking-wide" {...props} />,
                      strong: ({node, ...props}) => <strong className="text-white font-semibold tracking-wide" {...props} />,
                      ul: ({node, ...props}) => <ul className="list-disc list-outside pl-5 mb-4 space-y-2 text-slate-300" {...props} />,
                      li: ({node, ...props}) => <li className="marker:text-teal-500" {...props} />,
                    }}
                  >
                    {msg.content}
                  </ReactMarkdown>
                )}
              </div>
            ))
          )}
          
          {loading && (
            <div className="mr-auto bg-slate-800/40 p-5 rounded-2xl rounded-tl-sm w-24 flex justify-center items-center border border-slate-700/50">
              <div className="flex gap-1.5">
                <div className="w-2 h-2 rounded-full bg-teal-500 animate-[pulse_1.5s_ease-in-out_infinite_(-0.3s)]"></div>
                <div className="w-2 h-2 rounded-full bg-teal-500 animate-[pulse_1.5s_ease-in-out_infinite_(-0.15s)]"></div>
                <div className="w-2 h-2 rounded-full bg-teal-500 animate-[pulse_1.5s_ease-in-out_infinite]"></div>
              </div>
            </div>
          )}
          {error && (
            <div className="text-center text-red-400 text-sm p-2 bg-red-500/10 rounded-lg mx-auto border border-red-500/20">
              {error}
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSubmit} className="p-5 border-t border-slate-700/50 bg-slate-800/40">
          <div className="flex gap-3">
            <textarea
              value={inputMsg}
              onChange={e => setInputMsg(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Posez votre question à l'expert..."
              className="flex-1 h-12 bg-slate-900/80 border border-slate-600/50 rounded-xl px-4 py-3 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-gold-500/70 focus:ring-1 focus:ring-gold-500/70 resize-none transition-all shadow-inner"
            />
            <button 
              type="submit" 
              disabled={loading || !inputMsg.trim()}
              className="bg-gold-500 hover:bg-gold-400 disabled:bg-slate-700 disabled:text-slate-500 text-slate-900 font-bold uppercase tracking-wider text-xs px-8 rounded-xl shadow-[0_0_15px_rgba(255,228,75,0.2)] disabled:shadow-none transition-all duration-300"
            >
              Envoyer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
