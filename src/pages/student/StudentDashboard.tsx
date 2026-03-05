import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Send, Bot, User, AlertTriangle, Calendar, Heart, Plus } from 'lucide-react';
import { useAppSelector } from '../../store/hooks';
import { chatbotApi } from '../../api/chatbot';
import { bookingsApi } from '../../api/bookings';
import { campaignsApi } from '../../api/campaigns';
import type { ChatMessage } from '../../types';
import Badge from '../../components/ui/Badge';

export default function StudentDashboard() {
  const user = useAppSelector(s => s.auth.user);
  const displayName = user?.role === 'student'
    ? (user.display_name || user.first_name || 'Student')
    : 'Student';

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '0',
      role: 'bot',
      content: `Hi ${displayName}! 👋 I'm your CampusCare support assistant. I'm here to listen and provide guidance on mental health and wellbeing. How are you feeling today?`,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: bookings } = useQuery({ queryKey: ['myBookings'], queryFn: bookingsApi.myBookings });
  const { data: myCampaigns } = useQuery({ queryKey: ['myCampaigns'], queryFn: campaignsApi.mine });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || sending) return;
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMsg]);
    const text = input.trim();
    setInput('');
    setSending(true);

    try {
      const res = await chatbotApi.send(text);
      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'bot',
        content: res.reply,
        crisis_flagged: res.crisis_flagged,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, botMsg]);
    } catch {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'bot',
        content: 'I\'m having trouble connecting right now. Please try again in a moment.',
        timestamp: new Date(),
      }]);
    } finally {
      setSending(false);
    }
  };

  const pendingBookings = (bookings ?? []).filter(b => b.status === 'pending').length;
  const acceptedBookings = (bookings ?? []).filter(b => b.status === 'accepted').length;
  const activeCampaigns = (myCampaigns ?? []).length;

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-gray-900 mb-1">
          Good day, {displayName} 👋
        </h1>
        <p className="text-gray-500">Here's what's happening with your CampusCare account.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Active Campaigns', value: activeCampaigns, icon: <Heart size={20} className="text-primary-600" />, color: 'bg-primary-50' },
          { label: 'Pending Bookings', value: pendingBookings, icon: <Calendar size={20} className="text-yellow-600" />, color: 'bg-yellow-50' },
          { label: 'Confirmed Sessions', value: acceptedBookings, icon: <Calendar size={20} className="text-blue-600" />, color: 'bg-blue-50' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center gap-4">
            <div className={`h-12 w-12 rounded-xl ${s.color} flex items-center justify-center`}>
              {s.icon}
            </div>
            <div>
              <p className="font-display text-2xl font-bold text-gray-900">{s.value}</p>
              <p className="text-xs text-gray-500">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chatbot */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col" style={{ height: '500px' }}>
          <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
            <div className="h-9 w-9 bg-primary-100 rounded-xl flex items-center justify-center">
              <Bot size={18} className="text-primary-600" />
            </div>
            <div>
              <p className="font-semibold text-sm text-gray-900">CampusCare Assistant</p>
              <p className="text-xs text-primary-500 flex items-center gap-1">
                <span className="h-1.5 w-1.5 bg-primary-500 rounded-full inline-block" />
                Online
              </p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
            {messages.map(msg => (
              <div key={msg.id} className={`flex gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`h-7 w-7 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'bot' ? 'bg-primary-100' : 'bg-gray-200'}`}>
                  {msg.role === 'bot'
                    ? <Bot size={14} className="text-primary-600" />
                    : <User size={14} className="text-gray-600" />
                  }
                </div>
                <div className={`max-w-[75%] ${msg.role === 'user' ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                  {msg.crisis_flagged && (
                    <div className="flex items-center gap-1.5 bg-red-50 border border-red-200 rounded-lg px-3 py-1.5 mb-1 w-full">
                      <AlertTriangle size={13} className="text-red-500 shrink-0" />
                      <span className="text-xs text-red-600 font-medium">Crisis resources included — You're not alone.</span>
                    </div>
                  )}
                  <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-primary-600 text-white rounded-tr-sm'
                      : msg.crisis_flagged
                      ? 'bg-red-50 text-gray-800 border border-red-100 rounded-tl-sm'
                      : 'bg-gray-100 text-gray-800 rounded-tl-sm'
                  }`}>
                    {msg.content}
                  </div>
                  <span className="text-[10px] text-gray-400">
                    {msg.timestamp.toLocaleTimeString('en-UG', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}
            {sending && (
              <div className="flex gap-2.5">
                <div className="h-7 w-7 rounded-full bg-primary-100 flex items-center justify-center">
                  <Bot size={14} className="text-primary-600" />
                </div>
                <div className="bg-gray-100 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1">
                  {[0, 1, 2].map(i => (
                    <span key={i} className="h-1.5 w-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                  ))}
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="px-4 py-3 border-t border-gray-100">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                placeholder="Type a message..."
                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                disabled={sending}
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim() || sending}
                className="h-10 w-10 rounded-xl bg-primary-600 text-white flex items-center justify-center hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Quick actions + recent bookings */}
        <div className="space-y-5">
          {/* Quick actions */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-display font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-3">
              <Link to="/student/campaigns/new">
                <div className="border-2 border-dashed border-primary-200 rounded-xl p-4 text-center hover:border-primary-400 hover:bg-primary-50 transition-all cursor-pointer group">
                  <Plus size={20} className="mx-auto mb-2 text-primary-500 group-hover:text-primary-700" />
                  <p className="text-xs font-medium text-primary-600 group-hover:text-primary-800">New Campaign</p>
                </div>
              </Link>
              <Link to="/student/bookings/new">
                <div className="border-2 border-dashed border-blue-200 rounded-xl p-4 text-center hover:border-blue-400 hover:bg-blue-50 transition-all cursor-pointer group">
                  <Calendar size={20} className="mx-auto mb-2 text-blue-500 group-hover:text-blue-700" />
                  <p className="text-xs font-medium text-blue-600 group-hover:text-blue-800">Book Session</p>
                </div>
              </Link>
            </div>
          </div>

          {/* Upcoming bookings */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-semibold text-gray-900">Upcoming Sessions</h3>
              <Link to="/student/bookings" className="text-xs text-primary-600 hover:underline">View all</Link>
            </div>
            {(bookings ?? []).length === 0 ? (
              <div className="text-center py-6 text-gray-400">
                <Calendar size={30} className="mx-auto mb-2 text-gray-300" />
                <p className="text-sm">No sessions booked yet.</p>
                <Link to="/student/bookings/new" className="text-xs text-primary-600 mt-1 inline-block hover:underline">Book a counsellor</Link>
              </div>
            ) : (
              <div className="space-y-3">
                {(bookings ?? []).slice(0, 3).map(b => (
                  <div key={b.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <div className="h-8 w-8 rounded-lg bg-primary-100 flex items-center justify-center shrink-0">
                      <Calendar size={14} className="text-primary-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{b.counselor_name}</p>
                      <p className="text-xs text-gray-400">
                        {new Date(b.start_time).toLocaleDateString('en-UG', { dateStyle: 'medium' })} · {b.type}
                      </p>
                    </div>
                    <Badge variant={b.status === 'accepted' ? 'green' : b.status === 'declined' ? 'red' : 'yellow'}>
                      {b.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
