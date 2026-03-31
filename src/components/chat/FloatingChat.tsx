import { useEffect, useRef, useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { MessageCircle, X, Send, Loader2, ChevronDown, User } from 'lucide-react';
import { StreamChat, type Channel, type MessageResponse } from 'stream-chat';
import { sponsorsApi } from '../../api/sponsors';
import { useAppSelector } from '../../store/hooks';
import Avatar from '../ui/Avatar';

interface ChatMessage {
  id: string;
  text: string;
  userId: string;
  userName: string;
  createdAt: Date;
}

export default function FloatingChat() {
  // Only render when there is an active sponsorship.
  const { data: sponsorshipData, isLoading: sponsorshipLoading } = useQuery({
    queryKey: ['mySponsorship'],
    queryFn: sponsorsApi.mySponsorship,
    refetchInterval: 30_000,
  });

  const sponsorship = sponsorshipData?.sponsorship ?? null;

  if (sponsorshipLoading || !sponsorship) return null;

  return <ChatWidget channelId={sponsorship.channel_id} partnerName={sponsorship.partner_name} partnerAvatar={sponsorship.partner_avatar} />;
}

function ChatWidget({
  channelId,
  partnerName,
  partnerAvatar,
}: {
  channelId: string;
  partnerName: string;
  partnerAvatar: string;
}) {
  const currentUser = useAppSelector(s => s.auth.user);
  const userId = currentUser?.id ?? '';
  const userName =
    currentUser?.role === 'student'
      ? currentUser.display_name || `${currentUser.first_name} ${currentUser.last_name}`
      : 'User';

  const [isOpen, setIsOpen]           = useState(false);
  const [messages, setMessages]       = useState<ChatMessage[]>([]);
  const [inputText, setInputText]     = useState('');
  const [connected, setConnected]     = useState(false);
  const [sending, setSending]         = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [error, setError]             = useState<string | null>(null);

  const clientRef  = useRef<StreamChat | null>(null);
  const channelRef = useRef<Channel | null>(null);
  const bottomRef  = useRef<HTMLDivElement | null>(null);
  const isOpenRef  = useRef(false);
  isOpenRef.current = isOpen;

  // Fetch the Stream JWT once.
  const { data: tokenData } = useQuery({
    queryKey: ['streamToken'],
    queryFn: sponsorsApi.getStreamToken,
    staleTime: Infinity,
  });

  const normaliseMessages = useCallback((raw: MessageResponse[]): ChatMessage[] =>
    raw
      .filter(m => m.text)
      .map(m => ({
        id:        m.id,
        text:      m.text ?? '',
        userId:    m.user?.id ?? '',
        userName:  m.user?.name ?? m.user?.id ?? 'User',
        createdAt: new Date(m.created_at ?? Date.now()),
      })),
  []);

  // Initialise the Stream Chat client once tokenData is ready.
  useEffect(() => {
    if (!tokenData || !userId) return;

    let active = true;

    const init = async () => {
      try {
        const client = StreamChat.getInstance(tokenData.api_key);

        if (!client.userID) {
          await client.connectUser({ id: userId, name: userName }, tokenData.token);
        }

        if (!active) return;
        clientRef.current = client;

        const ch = client.channel('messaging', channelId);
        await ch.watch();
        if (!active) return;

        channelRef.current = ch;
        setMessages(normaliseMessages(ch.state.messages as unknown as MessageResponse[]));
        setConnected(true);

        ch.on('message.new', event => {
          if (!event.message) return;
          const msg: ChatMessage = {
            id:        event.message.id,
            text:      event.message.text ?? '',
            userId:    event.message.user?.id ?? '',
            userName:  event.message.user?.name ?? event.message.user?.id ?? 'User',
            createdAt: new Date(event.message.created_at ?? Date.now()),
          };
          setMessages(prev => {
            if (prev.some(m => m.id === msg.id)) return prev;
            return [...prev, msg];
          });
          if (!isOpenRef.current) {
            setUnreadCount(c => c + 1);
          }
        });
      } catch (e) {
        if (active) setError('Could not connect to chat. Please refresh.');
      }
    };

    init();

    return () => {
      active = false;
      channelRef.current?.stopWatching();
      clientRef.current?.disconnectUser().catch(() => {});
      clientRef.current  = null;
      channelRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tokenData, userId]);

  // Scroll to bottom whenever messages change or panel opens.
  useEffect(() => {
    if (isOpen) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleOpen = () => {
    setIsOpen(true);
    setUnreadCount(0);
  };

  const handleSend = async () => {
    const text = inputText.trim();
    if (!text || !channelRef.current || sending) return;
    setSending(true);
    setInputText('');
    try {
      await channelRef.current.sendMessage({ text });
    } catch {
      setInputText(text);
    } finally {
      setSending(false);
    }
  };

  const formatTime = (d: Date) =>
    d.toLocaleTimeString('en-UG', { hour: '2-digit', minute: '2-digit' });

  return (
    <>
      {/* ── Chat panel ── */}
      <div
        className={`fixed bottom-20 right-4 sm:right-6 z-50 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-4 pointer-events-none'
        }`}
        style={{ maxHeight: '70vh' }}
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3 bg-primary-600 text-white shrink-0">
          <Avatar src={partnerAvatar} name={partnerName} size="sm" />
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm truncate">{partnerName}</p>
            <p className="text-xs text-primary-200">
              {connected ? (
                <span className="flex items-center gap-1">
                  <span className="h-1.5 w-1.5 bg-green-400 rounded-full" />
                  Connected
                </span>
              ) : 'Connecting…'}
            </p>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="text-primary-200 hover:text-white transition-colors p-1 rounded-lg hover:bg-primary-700"
          >
            <ChevronDown size={18} />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 bg-gray-50" style={{ minHeight: 0 }}>
          {error ? (
            <p className="text-center text-xs text-red-500 py-4">{error}</p>
          ) : !connected ? (
            <div className="flex justify-center py-8">
              <Loader2 size={20} className="animate-spin text-gray-400" />
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <MessageCircle size={28} className="mx-auto mb-2 text-gray-300" />
              <p className="text-xs">No messages yet. Say hello!</p>
            </div>
          ) : (
            messages.map(msg => {
              const isMe = msg.userId === userId;
              return (
                <div key={msg.id} className={`flex gap-2 ${isMe ? 'flex-row-reverse' : ''}`}>
                  {!isMe && (
                    <div className="h-6 w-6 rounded-full bg-primary-100 flex items-center justify-center shrink-0 mt-1">
                      <User size={12} className="text-primary-600" />
                    </div>
                  )}
                  <div className={`max-w-[75%] flex flex-col gap-0.5 ${isMe ? 'items-end' : 'items-start'}`}>
                    {!isMe && (
                      <span className="text-[10px] text-gray-400 px-1">{msg.userName}</span>
                    )}
                    <div className={`px-3 py-2 rounded-2xl text-sm leading-relaxed break-words ${
                      isMe
                        ? 'bg-primary-600 text-white rounded-tr-sm'
                        : 'bg-white text-gray-800 border border-gray-200 rounded-tl-sm'
                    }`}>
                      {msg.text}
                    </div>
                    <span className="text-[10px] text-gray-400 px-1">{formatTime(msg.createdAt)}</span>
                  </div>
                </div>
              );
            })
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="px-3 py-3 bg-white border-t border-gray-100 shrink-0">
          <div className="flex gap-2">
            <input
              type="text"
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
              placeholder="Type a message…"
              disabled={!connected || !!error}
              className="flex-1 px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-gray-50"
            />
            <button
              onClick={handleSend}
              disabled={!inputText.trim() || !connected || sending}
              className="h-9 w-9 rounded-xl bg-primary-600 text-white flex items-center justify-center hover:bg-primary-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {sending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
            </button>
          </div>
        </div>
      </div>

      {/* ── Toggle button ── */}
      <button
        onClick={isOpen ? () => setIsOpen(false) : handleOpen}
        className="fixed bottom-4 right-4 sm:right-6 z-50 h-14 w-14 rounded-full bg-primary-600 text-white shadow-lg hover:bg-primary-700 active:scale-95 transition-all flex items-center justify-center"
        aria-label={isOpen ? 'Close chat' : 'Open chat'}
      >
        {isOpen ? (
          <X size={22} />
        ) : (
          <>
            <MessageCircle size={22} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 h-5 min-w-5 px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </>
        )}
      </button>
    </>
  );
}
