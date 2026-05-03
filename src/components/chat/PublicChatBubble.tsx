import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, X, Send, Bot, UserRound, AlertTriangle } from 'lucide-react';
import { chatbotApi } from '../../api/chatbot';

// ─── Types ────────────────────────────────────────────────────────────────────
interface Message {
  role: 'assistant' | 'user';
  text: string;
  crisis?: boolean;
}

type Phase = 'idle' | 'open' | 'replied' | 'gate';

const GREETING: Message = {
  role: 'assistant',
  text: "Hi there! I'm Kae, your CampusCare wellness companion 👋",
};

// ─── Component ────────────────────────────────────────────────────────────────
export default function PublicChatBubble() {
  const [phase, setPhase] = useState<Phase>('idle');
  const [gateVisible, setGateVisible] = useState(false);
  const [messages, setMessages] = useState<Message[]>([GREETING]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to latest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Focus input when chat opens or after a reply lands
  useEffect(() => {
    if (phase === 'open' || phase === 'replied') {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [phase]);

  function openChat() {
    setPhase('open');
  }

  function closeChat() {
    setPhase('idle');
  }

  async function handleSend() {
    const text = input.trim();
    if (!text || loading) return;

    // After the first reply, the next send attempt opens the gate modal.
    if (phase === 'replied') {
      setPhase('gate');
      // Trigger entrance animation on next tick
      requestAnimationFrame(() => requestAnimationFrame(() => setGateVisible(true)));
      return;
    }

    const userMsg: Message = { role: 'user', text };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const { reply, crisis_flagged } = await chatbotApi.sendPublic(text);
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', text: reply, crisis: crisis_flagged },
      ]);
      setPhase('replied');
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: "I'm sorry, I'm having trouble connecting right now. Please try again in a moment.",
        },
      ]);
      setPhase('replied');
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function closeGate() {
    setGateVisible(false);
    setTimeout(() => setPhase('replied'), 300);
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <>
      {/* ── Floating Bubble Button ── */}
      {phase === 'idle' && (
        <button
          onClick={openChat}
          className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-primary-600 text-white shadow-xl hover:bg-primary-700 active:scale-95 transition-all flex items-center justify-center"
          aria-label="Open Kae Assistant"
        >
          <MessageCircle size={26} />
          {/* Pulse ring */}
          <span className="absolute inset-0 rounded-full animate-ping bg-primary-400 opacity-30 pointer-events-none" />
        </button>
      )}

      {/* ── Chat Window ── */}
      {(phase === 'open' || phase === 'replied') && (
        <div className="fixed bottom-6 right-6 z-50 w-85 sm:w-95 flex flex-col rounded-2xl shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-700"
             style={{ maxHeight: '520px' }}>

          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3 bg-primary-600 dark:bg-primary-700 shrink-0">
            <div className="h-9 w-9 rounded-full bg-white/20 flex items-center justify-center shrink-0">
              <Bot size={20} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-semibold text-sm leading-tight">Kae Assistant</p>
              <p className="text-primary-200 text-xs">CampusCare Wellness Bot</p>
            </div>
            <button
              onClick={closeChat}
              className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Close chat"
            >
              <X size={16} />
            </button>
          </div>

          {/* Message list */}
          <div className="flex-1 overflow-y-auto bg-white dark:bg-gray-900 px-3 py-3 space-y-3">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex items-end gap-2 ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
              >
                {/* Avatar */}
                <div className={`h-7 w-7 rounded-full flex items-center justify-center shrink-0 mb-0.5 ${
                  m.role === 'assistant'
                    ? 'bg-primary-100 dark:bg-primary-900/40 text-primary-600'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                }`}>
                  {m.role === 'assistant' ? <Bot size={14} /> : <UserRound size={14} />}
                </div>

                {/* Bubble */}
                <div className={`max-w-[75%] px-3 py-2 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                  m.role === 'assistant'
                    ? 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-bl-sm'
                    : 'bg-primary-600 text-white rounded-br-sm'
                }`}>
                  {m.crisis && (
                    <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 text-xs font-semibold mb-1">
                      <AlertTriangle size={12} /> Crisis support flagged
                    </span>
                  )}
                  {m.text}
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {loading && (
              <div className="flex items-end gap-2">
                <div className="h-7 w-7 rounded-full bg-primary-100 dark:bg-primary-900/40 text-primary-600 flex items-center justify-center shrink-0">
                  <Bot size={14} />
                </div>
                <div className="bg-gray-100 dark:bg-gray-800 px-4 py-2.5 rounded-2xl rounded-bl-sm flex gap-1 items-center">
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="h-1.5 w-1.5 rounded-full bg-gray-400 dark:bg-gray-500 animate-bounce"
                      style={{ animationDelay: `${i * 150}ms` }}
                    />
                  ))}
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Input bar — always visible while chat is open */}
          <div className="shrink-0 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 px-3 py-2.5 flex items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message…"
              maxLength={500}
              disabled={loading}
              className="flex-1 text-sm bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 rounded-full px-4 py-2 outline-none focus:ring-2 focus:ring-primary-400 disabled:opacity-50"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || loading}
              className="h-9 w-9 rounded-full bg-primary-600 text-white flex items-center justify-center hover:bg-primary-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shrink-0"
              aria-label="Send message"
            >
              <Send size={15} />
            </button>
          </div>
        </div>
      )}

      {/* ── Gate Modal ── */}
      {phase === 'gate' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300"
            style={{ opacity: gateVisible ? 1 : 0 }}
            onClick={closeGate}
            aria-hidden="true"
          />

          {/* Panel */}
          <div
            className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center transition-all duration-300"
            style={{
              opacity: gateVisible ? 1 : 0,
              transform: gateVisible ? 'translateY(0) scale(1)' : 'translateY(24px) scale(0.96)',
            }}
          >
            <button
              onClick={closeGate}
              className="absolute top-3 right-3 p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Close"
            >
              <X size={16} />
            </button>

            {/* Icon */}
            <div className="h-14 w-14 rounded-full bg-primary-100 dark:bg-primary-900/40 text-primary-600 flex items-center justify-center mx-auto mb-4">
              <Bot size={28} />
            </div>

            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2 font-display">
              Continue with Kae Assistant
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-6">
              You've used your free preview message. Join CampusCare to unlock unlimited
              mental wellness support, confidential counselling bookings, and so much more — all in one place.
            </p>

            <div className="flex flex-col gap-3">
              <Link
                to="/register/student"
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-primary-600 text-white font-semibold text-sm hover:bg-primary-700 transition-colors"
              >
                Create a Free Account
              </Link>
              <Link
                to="/login"
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-semibold text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                I already have an account
              </Link>
            </div>

            <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-4 leading-relaxed">
              CampusCare is exclusively for university students. By joining you agree to our terms of use.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
