import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Send, Bot, User, AlertTriangle, Calendar, Heart, Plus, Users, UserCheck, ChevronRight, Bell, LogOut, Loader2, Quote } from 'lucide-react';
import { useAppSelector } from '../../store/hooks';
import { chatbotApi } from '../../api/chatbot';
import { bookingsApi } from '../../api/bookings';
import { campaignsApi } from '../../api/campaigns';
import { sponsorsApi } from '../../api/sponsors';
import { testimonialsApi } from '../../api/testimonials';
import type { ChatMessage, StudentProfile } from '../../types';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import BecomeSponsorModal from '../../components/sponsor/BecomeSponsorModal';
import SEO from '../../components/seo/SEO';

function cleanBotText(text: string) {
  return text.replace(/\s*\*\s*/g, ' ').replace(/\s{2,}/g, ' ').trim();
}

const STATUS_STYLES: Record<string, string> = {
  pending:  'bg-yellow-50 text-yellow-700 border-yellow-200',
  approved: 'bg-green-50 text-green-700 border-green-200',
  rejected: 'bg-red-50 text-red-600 border-red-200',
};

const STATUS_LABELS: Record<string, string> = {
  pending:  'Under Review',
  approved: 'Published',
  rejected: 'Not Approved',
};

function TestimonialWidget() {
  const qc = useQueryClient();
  const [draft, setDraft] = useState('');
  const [editing, setEditing] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['myTestimonials'],
    queryFn: testimonialsApi.mine,
  });

  const testimonial = data?.testimonials?.[0] ?? null;
  const canSubmit = data?.can_submit ?? true;
  const nextAllowedAt = data?.next_allowed_at ?? null;

  function openEditor() {
    setDraft('');
    setEditing(true);
  }

  const submitMutation = useMutation({
    mutationFn: () => testimonialsApi.submit(draft.trim()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['myTestimonials'] });
      setEditing(false);
    },
  });

  return (
    <div className="mt-6 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-5">
      <div className="flex items-center gap-2.5 mb-4">
        <div className="h-8 w-8 rounded-xl bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center">
          <Quote size={16} className="text-primary-600 dark:text-primary-400" />
        </div>
        <div>
          <h3 className="font-display font-semibold text-gray-900 dark:text-white text-sm">Share Your Experience</h3>
          <p className="text-[11px] text-gray-400 dark:text-gray-500">Your story may inspire another student</p>
        </div>
      </div>

      {isLoading && (
        <div className="h-20 flex items-center justify-center">
          <Loader2 size={18} className="animate-spin text-gray-300" />
        </div>
      )}

      {!isLoading && !editing && (
        <>
          {testimonial ? (
            <div className="space-y-3">
              <div className="bg-gray-50 dark:bg-gray-700/40 rounded-xl p-4 relative">
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed line-clamp-4">
                  &ldquo;{testimonial.content}&rdquo;
                </p>
              </div>
              <div className="flex items-center justify-between">
                <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${STATUS_STYLES[testimonial.status] ?? ''}`}>
                  {STATUS_LABELS[testimonial.status] ?? testimonial.status}
                </span>
                {canSubmit ? (
                  <button
                    onClick={openEditor}
                    className="text-xs font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
                  >
                    Write new
                  </button>
                ) : (
                  <span className="text-xs text-gray-400 dark:text-gray-500">
                    Next: {nextAllowedAt ? new Date(nextAllowedAt).toLocaleDateString('en-UG', { dateStyle: 'medium' }) : ''}
                  </span>
                )}
              </div>
              {testimonial.status === 'rejected' && (
                <p className="text-xs text-red-500 dark:text-red-400">
                  Your testimonial wasn&apos;t approved. Submit a new one when the cooldown ends.
                </p>
              )}
              {testimonial.status === 'approved' && (
                <p className="text-xs text-green-600 dark:text-green-400">
                  Your testimonial is live on the homepage. Thank you! 🎉
                </p>
              )}
            </div>
          ) : (
            <div
              className="border-2 border-dashed border-primary-200 dark:border-primary-700 rounded-xl p-5 text-center hover:border-primary-400 hover:bg-primary-50/50 dark:hover:bg-primary-900/10 transition-all cursor-pointer group"
              onClick={openEditor}
            >
              <Quote size={22} className="mx-auto mb-2 text-primary-300 dark:text-primary-600 group-hover:text-primary-500 transition-colors" />
              <p className="text-sm font-medium text-primary-600 dark:text-primary-400 group-hover:text-primary-800 dark:group-hover:text-primary-300">
                Tell us about your experience
              </p>
              <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-1">
                Approved testimonials appear on our public homepage
              </p>
            </div>
          )}
        </>
      )}

      {!isLoading && editing && (
        <div className="space-y-3">
          <textarea
            value={draft}
            onChange={e => setDraft(e.target.value)}
            placeholder="Tell us how CampusCare has helped you. Be honest and specific — your words can encourage other students to seek support."
            rows={4}
            className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
          />
          <p className="text-[11px] text-gray-400 dark:text-gray-500">
            Your testimonial will be reviewed before appearing on the homepage.
          </p>
          {submitMutation.isError && (
            <p className="text-xs text-red-500">Failed to submit. Please try again.</p>
          )}
          <div className="flex justify-end gap-2.5">
            <button
              onClick={() => setEditing(false)}
              disabled={submitMutation.isPending}
              className="px-4 py-2 rounded-xl text-xs font-medium text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={() => submitMutation.mutate()}
              disabled={submitMutation.isPending || draft.trim().length < 10}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {submitMutation.isPending && <Loader2 size={12} className="animate-spin" />}
              {submitMutation.isPending ? 'Submitting…' : 'Submit for Review'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function StudentDashboard() {
  const queryClient = useQueryClient();
  const user = useAppSelector(s => s.auth.user);
  const displayName = user?.role === 'student'
    ? (user.display_name || user.first_name || 'Student')
    : 'Student';

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: historyData, isLoading: historyLoading } = useQuery({
    queryKey: ['chatHistory'],
    queryFn: chatbotApi.history,
  });

  const { data: bookings } = useQuery({ queryKey: ['myBookings'], queryFn: bookingsApi.myBookings });
  const { data: myCampaigns } = useQuery({ queryKey: ['myCampaigns'], queryFn: campaignsApi.mine });

  // Seed messages from history once on load. After that, messages are managed
  // locally so ongoing conversation is not disrupted by background refetches.
  useEffect(() => {
    if (historyLoaded || historyData === undefined) return;

    if (historyData.length === 0) {
      setMessages([{
        id: 'welcome',
        role: 'bot',
        content: `Hi ${displayName}! I'm your CampusCare support assistant. I'm here to listen and provide guidance on mental health and wellbeing. How are you feeling today?`,
        timestamp: new Date(),
      }]);
    } else {
      setMessages(
        historyData.map(item => ({
          id: item.id,
          role: item.role === 'assistant' ? 'bot' : 'user',
          content: item.content,
          timestamp: new Date(item.created_at),
        }))
      );
    }

    setHistoryLoaded(true);
  }, [historyData, historyLoaded, displayName]);

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

  const [sponsorModalOpen, setSponsorModalOpen] = useState(false);
  const [confirmEndSponsorship, setConfirmEndSponsorship] = useState(false);

  const terminateSponsorship = useMutation({
    mutationFn: sponsorsApi.terminateSponsorship,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mySponsorship'] });
      setConfirmEndSponsorship(false);
    },
  });

  const studentUser = user?.role === 'student' ? (user as StudentProfile) : null;
  const isSponsor = studentUser?.is_sponsor ?? false;

  useQuery({
    queryKey: ['mySponsorStatus'],
    queryFn: sponsorsApi.myStatus,
    enabled: !!user,
  });

  const { data: incomingRequests = [] } = useQuery({
    queryKey: ['incomingRequests'],
    queryFn: sponsorsApi.incomingRequests,
    enabled: isSponsor,
  });

  const { data: sponsorshipData } = useQuery({
    queryKey: ['mySponsorship'],
    queryFn: sponsorsApi.mySponsorship,
    enabled: !!user,
  });

  const pendingBookings = (bookings ?? []).filter(b => b.status === 'pending').length;
  const acceptedBookings = (bookings ?? []).filter(b => b.status === 'accepted').length;
  const activeCampaigns = (myCampaigns ?? []).length;
  const pendingIncoming = incomingRequests.filter(r => r.status === 'pending').length;
  const hasActiveSponsorship = !!sponsorshipData?.sponsorship;

  return (
    <div>
      <SEO
        title="My Dashboard"
        description="Manage your CampusCare account, view campaigns, bookings, and access mental health resources."
        noindex
      />
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-gray-900 dark:text-white mb-1">
          Good day, {displayName}
        </h1>
        <p className="text-gray-500 dark:text-gray-400">Here's what's happening with your CampusCare account.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Active Campaigns', value: activeCampaigns, icon: <Heart size={20} className="text-primary-600" />, color: 'bg-primary-50' },
          { label: 'Pending Bookings', value: pendingBookings, icon: <Calendar size={20} className="text-yellow-600" />, color: 'bg-yellow-50' },
          { label: 'Confirmed Sessions', value: acceptedBookings, icon: <Calendar size={20} className="text-blue-600" />, color: 'bg-blue-50' },
        ].map(s => (
          <div key={s.label} className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm flex items-center gap-4">
            <div className={`h-12 w-12 rounded-xl ${s.color} flex items-center justify-center`}>
              {s.icon}
            </div>
            <div>
              <p className="font-display text-2xl font-bold text-gray-900 dark:text-white">{s.value}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Sponsor Hub ── */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-5 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-xl bg-purple-50 flex items-center justify-center">
              <Users size={16} className="text-purple-600" />
            </div>
            <h3 className="font-display font-semibold text-gray-900 dark:text-white">Sponsor Hub</h3>
          </div>
          {hasActiveSponsorship && (
            <span className="flex items-center gap-1.5 text-xs text-primary-600 bg-primary-50 px-2.5 py-1 rounded-full font-medium">
              <UserCheck size={12} />
              Active connection
            </span>
          )}
        </div>

        {hasActiveSponsorship ? (
          /* Has active sponsorship */
          <div className="bg-primary-50 rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-3">
              <UserCheck size={18} className="text-primary-600 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-primary-800">
                  Connected with {sponsorshipData?.sponsorship?.partner_name}
                </p>
                <p className="text-xs text-primary-600 mt-0.5">
                  Use the chat bubble in the bottom-right corner to message them.
                </p>
              </div>
              {!confirmEndSponsorship && (
                <button
                  onClick={() => setConfirmEndSponsorship(true)}
                  className="shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-rose-600 bg-white border border-rose-200 hover:bg-rose-50 transition-colors"
                >
                  <LogOut size={11} />
                  End
                </button>
              )}
            </div>
            {confirmEndSponsorship && (
              <div className="flex items-center justify-between gap-3 pt-2 border-t border-primary-200">
                <p className="text-xs text-primary-700">End this sponsorship?</p>
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => setConfirmEndSponsorship(false)}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium text-gray-600 border border-gray-200 bg-white hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => terminateSponsorship.mutate()}
                    disabled={terminateSponsorship.isPending}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-rose-600 text-white hover:bg-rose-700 disabled:opacity-50 transition-colors"
                  >
                    {terminateSponsorship.isPending && <Loader2 size={11} className="animate-spin" />}
                    Yes, End It
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : isSponsor ? (
          /* User is an active sponsor */
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Link to="/student/sponsors/become">
              <div className="border border-gray-100 bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors cursor-pointer">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-medium text-gray-900">Sponsor Status</p>
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">Active</span>
                </div>
                <p className="text-xs text-gray-500">You are listed as a sponsor. Manage your profile.</p>
              </div>
            </Link>
            <Link to="/student/sponsors/become">
              <div className="border border-purple-100 bg-purple-50 rounded-xl p-4 hover:bg-purple-100 transition-colors cursor-pointer relative">
                {pendingIncoming > 0 && (
                  <span className="absolute top-3 right-3 h-5 w-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {pendingIncoming}
                  </span>
                )}
                <div className="flex items-center gap-1.5 mb-1">
                  <Bell size={14} className="text-purple-600" />
                  <p className="text-sm font-medium text-purple-900">Incoming Requests</p>
                </div>
                <p className="text-xs text-purple-600">
                  {pendingIncoming > 0
                    ? `${pendingIncoming} student${pendingIncoming > 1 ? 's' : ''} waiting for your response`
                    : 'No pending requests right now'}
                </p>
              </div>
            </Link>
          </div>
        ) : (
          /* Not a sponsor, no active sponsorship */
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button onClick={() => setSponsorModalOpen(true)} className="w-full text-left">
              <div className="border-2 border-dashed border-purple-200 rounded-xl p-4 text-center hover:border-purple-400 hover:bg-purple-50 transition-all cursor-pointer group">
                <Users size={20} className="mx-auto mb-2 text-purple-400 group-hover:text-purple-600" />
                <p className="text-xs font-medium text-purple-600 group-hover:text-purple-800">Become a Sponsor</p>
                <p className="text-[11px] text-gray-400 mt-0.5">Support a fellow student</p>
              </div>
            </button>
            <Link to="/student/sponsors">
              <div className="border-2 border-dashed border-blue-200 rounded-xl p-4 text-center hover:border-blue-400 hover:bg-blue-50 transition-all cursor-pointer group">
                <ChevronRight size={20} className="mx-auto mb-2 text-blue-400 group-hover:text-blue-600" />
                <p className="text-xs font-medium text-blue-600 group-hover:text-blue-800">Find a Sponsor</p>
                <p className="text-[11px] text-gray-400 mt-0.5">Connect with someone who cares</p>
              </div>
            </Link>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chatbot */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col" style={{ height: '500px' }}>
          <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100 dark:border-gray-700">
            <div className="h-9 w-9 bg-primary-100 rounded-xl flex items-center justify-center">
              <Bot size={18} className="text-primary-600" />
            </div>
            <div>
              <p className="font-semibold text-sm text-gray-900">Kae Assistant</p>
              <p className="text-xs text-primary-500 flex items-center gap-1">
                <span className="h-1.5 w-1.5 bg-primary-500 rounded-full inline-block" />
                Online
              </p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
            {historyLoading && !historyLoaded && (
              <div className="flex items-center justify-center h-full">
                <Spinner size="md" />
              </div>
            )}
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
                    {msg.role === 'bot' ? cleanBotText(msg.content) : msg.content}
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
          <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-700">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                placeholder="Type a message..."
                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
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
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-5">
            <h3 className="font-display font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
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

          {/* Sessions — Upcoming + Previous */}
          {(() => {
            const now = new Date();
            const upcoming = (bookings ?? []).filter(b => new Date(b.end_time) >= now);
            const previous = (bookings ?? []).filter(b => new Date(b.end_time) < now);

            return (
              <div className="space-y-5">
                {/* Upcoming */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-display font-semibold text-gray-900 dark:text-white">Upcoming Sessions</h3>
                    <Link to="/student/bookings" className="text-xs text-primary-600 hover:underline">View all</Link>
                  </div>
                  {upcoming.length === 0 ? (
                    <div className="text-center py-6 text-gray-400">
                      <Calendar size={30} className="mx-auto mb-2 text-gray-300 dark:text-gray-600" />
                      <p className="text-sm">No upcoming sessions.</p>
                      <Link to="/student/bookings/new" className="text-xs text-primary-600 mt-1 inline-block hover:underline">Book a counsellor</Link>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {upcoming.slice(0, 3).map(b => (
                        <div key={b.id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                          <div className="h-8 w-8 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center shrink-0">
                            <Calendar size={14} className="text-primary-600 dark:text-primary-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{b.counselor_name}</p>
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

                {/* Previous */}
                {previous.length > 0 && (
                  <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-5">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-display font-semibold text-gray-900 dark:text-white">Previous Sessions</h3>
                    </div>
                    <div className="space-y-3">
                      {previous.slice(0, 3).map(b => (
                        <div key={b.id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl opacity-75">
                          <div className="h-8 w-8 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center shrink-0">
                            <Calendar size={14} className="text-gray-400 dark:text-gray-500" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">{b.counselor_name}</p>
                            <p className="text-xs text-gray-400">
                              {new Date(b.start_time).toLocaleDateString('en-UG', { dateStyle: 'medium' })} · {b.type}
                            </p>
                          </div>
                          <span className="text-[10px] font-medium text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full">
                            Past
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      </div>

      {/* ── Share Your Experience ─────────────────────────────────────────────── */}
      <TestimonialWidget />

      <BecomeSponsorModal open={sponsorModalOpen} onClose={() => setSponsorModalOpen(false)} />
    </div>
  );
}
