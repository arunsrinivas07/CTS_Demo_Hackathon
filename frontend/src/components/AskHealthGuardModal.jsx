import React, { useState } from 'react';
import { Bot, Send, X, Sparkles, AlertCircle, FileText, CheckCircle2 } from 'lucide-react';
import { fetchAiExplanation } from '../services/api';

export default function AskHealthGuardModal({ isOpen, onClose, defaultProviderId = "PRV51003", defaultClaimId = "CLM-904812" }) {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: `Hello! I am **HealthGuard AI Assistant**. Ask me anything about claims risk drivers, provider behavior patterns, or model predictions for \`${defaultClaimId}\` (\`${defaultProviderId}\`).`
    }
  ]);

  if (!isOpen) return null;

  const handleSend = async (e) => {
    e?.preventDefault();
    if (!query.trim()) return;

    const userText = query;
    setQuery('');
    setMessages(prev => [...prev, { sender: 'user', text: userText }]);
    setLoading(true);

    const res = await fetchAiExplanation(userText, defaultProviderId, defaultClaimId);

    setMessages(prev => [...prev, { sender: 'ai', text: res.answer }]);
    setLoading(false);
  };

  const handleQuickQuestion = (q) => {
    setQuery(q);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/50 backdrop-blur-xs transition-opacity">
      <div className="w-full max-w-lg bg-white h-full shadow-2xl flex flex-col justify-between border-l border-slate-200">
        
        {/* Modal Header */}
        <div className="p-4 bg-navy-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-brand-blue/20 text-brand-teal border border-brand-teal/30">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="font-bold text-base flex items-center gap-2">
                Ask HealthGuard AI
                <span className="text-[10px] bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 px-1.5 py-0.5 rounded font-mono">
                  Copilot
                </span>
              </h3>
              <p className="text-xs text-slate-300">Natural Language Fraud Intelligence & Case Explanation</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Chat History */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex gap-3 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {m.sender === 'ai' && (
                <div className="w-8 h-8 rounded-full bg-brand-blue text-white flex items-center justify-center shrink-0 text-xs font-bold shadow">
                  HG
                </div>
              )}
              <div
                className={`max-w-[85%] p-3.5 rounded-2xl text-xs leading-relaxed ${
                  m.sender === 'user'
                    ? 'bg-brand-blue text-white rounded-tr-none shadow-sm'
                    : 'bg-white text-slate-800 rounded-tl-none border border-slate-200 shadow-xs'
                }`}
              >
                <div className="whitespace-pre-line font-sans">{m.text}</div>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2 text-xs text-slate-500 italic p-2 bg-white rounded-lg border border-slate-200 max-w-[200px]">
              <Sparkles className="w-4 h-4 animate-spin text-brand-blue" />
              Generating analysis...
            </div>
          )}
        </div>

        {/* Quick Question Chips */}
        <div className="p-3 bg-white border-t border-slate-200 flex flex-wrap gap-1.5">
          <span className="w-full text-[11px] text-slate-400 font-medium">Suggested queries:</span>
          {[
            "Why was this provider flagged?",
            "What are the top risk factors?",
            "Explain Model A prediction",
            "Summarize case evidence"
          ].map((q, i) => (
            <button
              key={i}
              onClick={() => handleQuickQuestion(q)}
              className="text-[11px] bg-slate-100 hover:bg-brand-lightBlue hover:text-brand-blue text-slate-600 px-2.5 py-1 rounded-full border border-slate-200 transition-colors"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Input Form */}
        <form onSubmit={handleSend} className="p-3 bg-white border-t border-slate-200 flex gap-2">
          <input
            type="text"
            placeholder="Ask a question about this claim or provider..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 text-xs border border-slate-300 rounded-lg px-3 py-2.5 focus:outline-hidden focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue"
          />
          <button
            type="submit"
            disabled={!query.trim() || loading}
            className="bg-brand-blue hover:bg-brand-darkBlue text-white text-xs font-semibold px-4 py-2.5 rounded-lg flex items-center gap-1.5 transition-colors disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
            Send
          </button>
        </form>

      </div>
    </div>
  );
}
