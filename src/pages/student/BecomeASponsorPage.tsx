import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Heart, ShieldCheck, MessageCircle, AlertTriangle,
  CheckCircle2, LogOut, Loader2, ChevronRight, UserCheck, X,
} from 'lucide-react';
import { useAppDispatch } from '../../store/hooks';
import { setUser } from '../../store/authSlice';
import { authApi } from '../../api/auth';
import { sponsorsApi } from '../../api/sponsors';
import type { SponsorRequest } from '../../types';
import Avatar from '../../components/ui/Avatar';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import SEO from '../../components/seo/SEO';
import Spinner from '../../components/ui/Spinner';

const whatItMeans = [
  {
    icon: <Heart size={20} className="text-rose-500" />,
    title: 'You become a safe person',
    body: 'Another student will be able to reach out to you privately when they\'re struggling. You\'re not a counsellor — you\'re just someone who listens and cares.',
  },
  {
    icon: <MessageCircle size={20} className="text-blue-500" />,
    title: 'One-on-one private messaging',
    body: 'Once you accept a student\'s request, you\'ll both get access to a private chat. What\'s said there stays between the two of you.',
  },
  {
    icon: <ShieldCheck size={20} className="text-primary-600" />,
    title: 'Your identity is always visible',
    body: 'Because trust matters in this relationship, sponsors cannot use anonymous mode. Other students will see your name and profile when browsing for support.',
  },
  {
    icon: <AlertTriangle size={20} className="text-amber-500" />,
    title: 'You can step back any time',
    body: 'Life gets heavy sometimes. If you need to stop being a sponsor, you can opt out at any time from your dashboard. Any active connection will end, and the other student will be notified with care.',
  },
];

export default function BecomeASponsorPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const qc = useQueryClient();
  const [whatIOffer, setWhatIOffer] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [step, setStep] = useState<'info' | 'form'>('info');

  const { data: status, isLoading: statusLoading } = useQuery({
    queryKey: ['mySponsorStatus'],
    queryFn: sponsorsApi.myStatus,
  });

  const becomeSponsor = useMutation({
    mutationFn: () => sponsorsApi.becomeSponsor(whatIOffer),
    onSuccess: async () => {
      const updated = await authApi.getProfile();
      dispatch(setUser(updated));
      qc.invalidateQueries({ queryKey: ['mySponsorStatus'] });
      navigate('/student/dashboard');
    },
  });

  const optOut = useMutation({
    mutationFn: sponsorsApi.optOut,
    onSuccess: async () => {
      const updated = await authApi.getProfile();
      dispatch(setUser(updated));
      qc.invalidateQueries({ queryKey: ['mySponsorStatus'] });
      qc.invalidateQueries({ queryKey: ['mySponsorship'] });
    },
  });

  if (statusLoading) {
    return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;
  }

  // ── Already a sponsor: show management view ──────────────────────────────
  if (status?.is_sponsor) {
    return (
      <SponsorManagementView
        status={status}
        onOptOut={() => optOut.mutate()}
        isOptingOut={optOut.isPending}
        optOutError={optOut.isError ? (optOut.error as Error)?.message : null}
        qc={qc}
      />
    );
  }

  // ── Step 1: Information ──────────────────────────────────────────────────
  if (step === 'info') {
    return (
      <div>
        <SEO
          title="Become a Sponsor"
          description="Become a peer sponsor on CampusCare and support a fellow student through difficult times."
          noindex
        />
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-gray-900 mb-1">Become a Sponsor</h1>
          <p className="text-gray-500">
            A sponsor on CampusCare is a student who has chosen to be available for another student
            going through a difficult time. Before you sign up, please take a moment to understand
            what this means.
          </p>
        </div>

        <div className="space-y-4 mb-8">
          {whatItMeans.map((item, i) => (
            <div key={i} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm flex gap-4">
              <div className="h-10 w-10 rounded-xl bg-gray-50 flex items-center justify-center shrink-0">
                {item.icon}
              </div>
              <div>
                <p className="font-semibold text-gray-900 mb-1">{item.title}</p>
                <p className="text-sm text-gray-500 leading-relaxed">{item.body}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-8">
          <p className="text-sm text-amber-800 leading-relaxed">
            <strong>Important reminder:</strong> Sponsorship is peer support, not professional
            counselling. If the student you are supporting discloses a crisis or mentions
            self-harm, please encourage them to speak with a professional counsellor through
            the Bookings section, or contact an emergency service. Your wellbeing matters too.
          </p>
        </div>

        <button
          onClick={() => setStep('form')}
          className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-xl font-medium text-sm transition-colors"
        >
          I understand — continue
          <ChevronRight size={16} />
        </button>
      </div>
    );
  }

  // ── Step 2: Form ─────────────────────────────────────────────────────────
  return (
    <div>
      <div className="mb-8">
        <button
          onClick={() => setStep('info')}
          className="text-sm text-gray-400 hover:text-gray-600 mb-4 flex items-center gap-1"
        >
          ← Back
        </button>
        <h1 className="font-display text-3xl font-bold text-gray-900 mb-1">Set Up Your Sponsor Profile</h1>
        <p className="text-gray-500">Tell students what kind of support you can offer.</p>
      </div>

      <form
        onSubmit={e => { e.preventDefault(); if (confirmed) becomeSponsor.mutate(); }}
        className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-6"
      >
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            What kind of support can you offer?
            <span className="text-red-500 ml-0.5">*</span>
          </label>
          <textarea
            value={whatIOffer}
            onChange={e => setWhatIOffer(e.target.value)}
            rows={5}
            placeholder="e.g. I've dealt with academic pressure and loneliness in my first year. I'm happy to listen, share what helped me, and be a consistent presence for someone who needs it."
            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary-500"
            maxLength={500}
          />
          <p className="text-xs text-gray-400 text-right mt-1">{whatIOffer.length}/500</p>
        </div>

        <div className="bg-gray-50 rounded-xl p-4">
          <label className="flex items-start gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={confirmed}
              onChange={e => setConfirmed(e.target.checked)}
              className="accent-primary-600 h-4 w-4 mt-0.5 shrink-0"
            />
            <span className="text-sm text-gray-600 leading-relaxed">
              I understand that becoming a sponsor makes my profile visible to other students,
              and that I can opt out at any time if I need to prioritise my own wellbeing.
            </span>
          </label>
        </div>

        {becomeSponsor.isError && (
          <p className="text-sm text-red-600 flex items-center gap-2">
            <AlertTriangle size={14} /> {becomeSponsor.error?.message}
          </p>
        )}

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={!confirmed || !whatIOffer.trim() || becomeSponsor.isPending}
            className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl font-medium text-sm transition-colors"
          >
            {becomeSponsor.isPending && <Loader2 size={14} className="animate-spin" />}
            List me as a sponsor
          </button>
          <button
            type="button"
            onClick={() => navigate('/student/dashboard')}
            className="text-sm text-gray-400 hover:text-gray-600"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

// ── Sponsor management view (extracted so hooks are always called in order) ──

function SponsorManagementView({
  status,
  onOptOut,
  isOptingOut,
  optOutError,
  qc,
}: {
  status: { is_sponsor: boolean; what_i_offer: string };
  onOptOut: () => void;
  isOptingOut: boolean;
  optOutError: string | null;
  qc: ReturnType<typeof useQueryClient>;
}) {
  const { data: incoming = [], isLoading: loadingIncoming } = useQuery({
    queryKey: ['incomingRequests'],
    queryFn: sponsorsApi.incomingRequests,
    refetchInterval: 30_000,
  });

  const respond = useMutation({
    mutationFn: ({ id, action }: { id: string; action: 'accepted' | 'declined' }) =>
      sponsorsApi.respondToRequest(id, action),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['incomingRequests'] });
      qc.invalidateQueries({ queryKey: ['mySponsorship'] });
      qc.invalidateQueries({ queryKey: ['sponsors'] });
    },
  });

  const pendingCount = incoming.filter(r => r.status === 'pending').length;

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-gray-900 mb-1">You Are a Sponsor</h1>
        <p className="text-gray-500">Thank you for showing up for someone else.</p>
      </div>

      <div className="space-y-6">
        {/* Status card */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-5">
          <div className="flex items-center gap-3 p-4 bg-primary-50 rounded-xl">
            <CheckCircle2 size={20} className="text-primary-600 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-primary-800">Active sponsor</p>
              <p className="text-xs text-primary-600 mt-0.5">
                You are listed and visible to students looking for support.
              </p>
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-700 mb-1">What you currently offer</p>
            <p className="text-sm text-gray-500 bg-gray-50 rounded-xl px-4 py-3 leading-relaxed">
              {status.what_i_offer || '—'}
            </p>
          </div>

          <div className="border-t border-gray-100 pt-4">
            <p className="text-sm font-semibold text-gray-900 mb-2">Stepping back</p>
            <p className="text-sm text-gray-500 mb-4 leading-relaxed">
              If you need to take a break, you can opt out below. Any student you are currently
              supporting will be notified with care, and your chat history will be preserved.
              You can become a sponsor again whenever you feel ready.
            </p>

            {optOutError && (
              <p className="text-sm text-red-600 mb-3 flex items-center gap-2">
                <AlertTriangle size={14} /> {optOutError}
              </p>
            )}

            <Button
              variant="danger"
              loading={isOptingOut}
              onClick={onOptOut}
            >
              <LogOut size={14} />
              Opt out of being a sponsor
            </Button>
          </div>
        </div>

        {/* Incoming requests */}
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <UserCheck size={16} className="text-primary-600" />
              <h2 className="font-semibold text-gray-900 text-sm">Support Requests</h2>
            </div>
            {pendingCount > 0 && (
              <span className="bg-yellow-100 text-yellow-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                {pendingCount} pending
              </span>
            )}
          </div>

          {loadingIncoming ? (
            <div className="flex justify-center py-10"><Spinner size="md" /></div>
          ) : incoming.length === 0 ? (
            <div className="text-center py-10 text-gray-400">
              <UserCheck size={28} className="mx-auto mb-2 text-gray-300" />
              <p className="text-sm">No requests yet.</p>
              <p className="text-xs mt-0.5">Students will appear here when they reach out to you.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {incoming.map(req => (
                <IncomingRequestRow
                  key={req.id}
                  request={req}
                  onAccept={() => respond.mutate({ id: req.id, action: 'accepted' })}
                  onDecline={() => respond.mutate({ id: req.id, action: 'declined' })}
                  isPending={respond.isPending && respond.variables?.id === req.id}
                  respondError={respond.isError && respond.variables?.id === req.id ? (respond.error as Error)?.message : null}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function IncomingRequestRow({
  request,
  onAccept,
  onDecline,
  isPending,
  respondError,
}: {
  request: SponsorRequest;
  onAccept: () => void;
  onDecline: () => void;
  isPending: boolean;
  respondError: string | null;
}) {
  const statusConfig = {
    pending:  { variant: 'yellow' as const, label: 'Pending' },
    accepted: { variant: 'green'  as const, label: 'Accepted' },
    declined: { variant: 'gray'   as const, label: 'Declined' },
  };

  return (
    <div className="px-5 py-4">
      <div className="flex items-start gap-3">
        <Avatar src={request.avatar_url} name={request.display_name} size="md" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-medium text-gray-900 text-sm">{request.display_name}</p>
            <Badge variant={statusConfig[request.status].variant}>
              {statusConfig[request.status].label}
            </Badge>
          </div>
          <p className="text-xs text-gray-400">{request.university}{request.course ? ` · ${request.course}` : ''}</p>
          {request.bio && (
            <p className="text-xs text-gray-500 mt-1.5 leading-relaxed line-clamp-2">{request.bio}</p>
          )}
          <p className="text-xs text-gray-400 mt-1">
            Requested {new Date(request.created_at).toLocaleDateString('en-UG', { dateStyle: 'medium' })}
          </p>
        </div>
      </div>

      {request.status === 'pending' && (
        <div className="mt-3 flex items-center gap-2">
          <button
            onClick={onAccept}
            disabled={isPending}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-primary-600 hover:bg-primary-700 text-white text-xs font-medium transition-colors disabled:opacity-50"
          >
            {isPending ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle2 size={12} />}
            Accept
          </button>
          <button
            onClick={onDecline}
            disabled={isPending}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs font-medium transition-colors disabled:opacity-50"
          >
            <X size={12} />
            Decline
          </button>
          {respondError && (
            <p className="text-xs text-red-500 flex items-center gap-1 ml-1">
              <AlertTriangle size={11} /> {respondError}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
