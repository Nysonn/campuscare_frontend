import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Users, Search, Clock, CheckCircle2, UserCheck, Loader2, AlertTriangle, X } from 'lucide-react';
import { sponsorsApi } from '../../api/sponsors';
import type { SponsorProfile, SponsorRequest } from '../../types';
import Avatar from '../../components/ui/Avatar';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';

export default function SponsorsPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState<'browse' | 'requests'>('browse');
  const [actionError, setActionError] = useState<string | null>(null);

  const { data: sponsors = [], isLoading: loadingSponsors } = useQuery({
    queryKey: ['sponsors'],
    queryFn: sponsorsApi.listSponsors,
  });

  const { data: outgoing = [], isLoading: loadingRequests } = useQuery({
    queryKey: ['outgoingRequests'],
    queryFn: sponsorsApi.outgoingRequests,
  });

  const { data: sponsorshipData } = useQuery({
    queryKey: ['mySponsorship'],
    queryFn: sponsorsApi.mySponsorship,
  });

  const hasActiveSponsorship = !!sponsorshipData?.sponsorship;

  const sendRequest = useMutation({
    mutationFn: (sponsorId: string) => sponsorsApi.sendRequest(sponsorId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sponsors'] });
      qc.invalidateQueries({ queryKey: ['outgoingRequests'] });
      setActionError(null);
    },
    onError: (err: Error) => setActionError(err.message),
  });

  const cancelRequest = useMutation({
    mutationFn: (requestId: string) => sponsorsApi.cancelRequest(requestId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sponsors'] });
      qc.invalidateQueries({ queryKey: ['outgoingRequests'] });
    },
    onError: (err: Error) => setActionError(err.message),
  });

  const filtered = sponsors.filter(s =>
    s.display_name.toLowerCase().includes(search.toLowerCase()) ||
    s.university.toLowerCase().includes(search.toLowerCase()) ||
    s.what_i_offer.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-gray-900 mb-1">Find a Sponsor</h1>
        <p className="text-gray-500">
          Sponsors are fellow students who have been through tough times and want to support someone
          else on their journey. A sponsorship is a private, one-on-one connection built on trust.
        </p>
      </div>

      {/* Active sponsorship banner */}
      {hasActiveSponsorship && (
        <div className="mb-6 bg-primary-50 border border-primary-200 rounded-2xl px-5 py-4 flex items-center gap-3">
          <UserCheck size={20} className="text-primary-600 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-primary-800">
              You already have an active sponsor — {sponsorshipData?.sponsorship?.partner_name}
            </p>
            <p className="text-xs text-primary-600 mt-0.5">
              Use the chat bubble in the bottom-right corner to talk with them.
            </p>
          </div>
        </div>
      )}

      {/* Error banner */}
      {actionError && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-center gap-3 text-sm text-red-700">
          <AlertTriangle size={16} className="shrink-0" />
          <span className="flex-1">{actionError}</span>
          <button onClick={() => setActionError(null)} className="hover:text-red-900">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-gray-100 rounded-xl p-1 w-fit">
        {(['browse', 'requests'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === t ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {t === 'browse' ? (
              <span className="flex items-center gap-2"><Users size={14} /> Browse Sponsors</span>
            ) : (
              <span className="flex items-center gap-2">
                <Clock size={14} /> My Requests
                {outgoing.filter(r => r.status === 'pending').length > 0 && (
                  <span className="bg-yellow-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                    {outgoing.filter(r => r.status === 'pending').length}
                  </span>
                )}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Browse tab ── */}
      {tab === 'browse' && (
        <>
          <div className="relative mb-6">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, university or what they offer…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
            />
          </div>

          {loadingSponsors ? (
            <div className="flex justify-center py-20"><Spinner size="lg" /></div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <Users size={40} className="mx-auto mb-3 text-gray-300" />
              <p className="font-medium text-gray-500">No sponsors found</p>
              <p className="text-sm mt-1">Try a different search, or check back later.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filtered.map(sponsor => (
                <SponsorCard
                  key={sponsor.id}
                  sponsor={sponsor}
                  hasActiveSponsorship={hasActiveSponsorship}
                  onRequest={() => sendRequest.mutate(sponsor.id)}
                  requesting={sendRequest.isPending && sendRequest.variables === sponsor.id}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* ── My requests tab ── */}
      {tab === 'requests' && (
        <div>
          {loadingRequests ? (
            <div className="flex justify-center py-20"><Spinner size="lg" /></div>
          ) : outgoing.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <Clock size={40} className="mx-auto mb-3 text-gray-300" />
              <p className="font-medium text-gray-500">No requests sent yet</p>
              <p className="text-sm mt-1">Browse sponsors and send a request to get started.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {outgoing.map(req => (
                <RequestRow
                  key={req.id}
                  request={req}
                  onCancel={() => cancelRequest.mutate(req.id)}
                  cancelling={cancelRequest.isPending && cancelRequest.variables === req.id}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function SponsorCard({
  sponsor,
  hasActiveSponsorship,
  onRequest,
  requesting,
}: {
  sponsor: SponsorProfile;
  hasActiveSponsorship: boolean;
  onRequest: () => void;
  requesting: boolean;
}) {
  const canRequest = !hasActiveSponsorship && !sponsor.has_pending_request && !sponsor.is_my_sponsor && !sponsor.sponsor_is_busy;

  let buttonLabel = 'Request Sponsor';
  let buttonDisabled = false;
  let buttonStyle = 'bg-primary-600 text-white hover:bg-primary-700';

  if (sponsor.is_my_sponsor) {
    buttonLabel = 'Your Sponsor';
    buttonDisabled = true;
    buttonStyle = 'bg-primary-100 text-primary-700 cursor-default';
  } else if (sponsor.has_pending_request) {
    buttonLabel = 'Request Pending';
    buttonDisabled = true;
    buttonStyle = 'bg-yellow-100 text-yellow-700 cursor-default';
  } else if (sponsor.sponsor_is_busy) {
    buttonLabel = 'Currently Busy';
    buttonDisabled = true;
    buttonStyle = 'bg-gray-100 text-gray-500 cursor-default';
  } else if (hasActiveSponsorship) {
    buttonLabel = 'Already Sponsored';
    buttonDisabled = true;
    buttonStyle = 'bg-gray-100 text-gray-400 cursor-default';
  }

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col gap-4">
      <div className="flex items-start gap-3">
        <Avatar src={sponsor.avatar_url} name={sponsor.display_name} size="lg" />
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900 truncate">{sponsor.display_name}</p>
          <p className="text-xs text-gray-400 truncate">{sponsor.university}</p>
          {sponsor.course && <p className="text-xs text-gray-400 truncate">{sponsor.course}</p>}
        </div>
        {sponsor.is_my_sponsor && (
          <CheckCircle2 size={18} className="text-primary-500 shrink-0" />
        )}
      </div>

      {sponsor.what_i_offer && (
        <div className="bg-primary-50 rounded-xl px-3 py-2.5">
          <p className="text-xs font-semibold text-primary-700 mb-0.5">What I can offer</p>
          <p className="text-sm text-primary-800 leading-relaxed line-clamp-3">{sponsor.what_i_offer}</p>
        </div>
      )}

      {sponsor.bio && (
        <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed">{sponsor.bio}</p>
      )}

      <button
        onClick={canRequest ? onRequest : undefined}
        disabled={buttonDisabled || requesting}
        className={`w-full py-2 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2 ${buttonStyle} disabled:opacity-60`}
      >
        {requesting && <Loader2 size={14} className="animate-spin" />}
        {buttonLabel}
      </button>
    </div>
  );
}

function RequestRow({
  request,
  onCancel,
  cancelling,
}: {
  request: SponsorRequest;
  onCancel: () => void;
  cancelling: boolean;
}) {
  const statusConfig = {
    pending:  { variant: 'yellow' as const, label: 'Pending' },
    accepted: { variant: 'green'  as const, label: 'Accepted' },
    declined: { variant: 'red'    as const, label: 'Declined' },
  };
  const cfg = statusConfig[request.status];

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-4 flex items-center gap-4 shadow-sm">
      <Avatar src={request.avatar_url} name={request.display_name} size="md" />
      <div className="flex-1 min-w-0">
        <p className="font-medium text-gray-900 truncate">{request.display_name}</p>
        <p className="text-xs text-gray-400">{request.university}</p>
        <p className="text-xs text-gray-400 mt-0.5">
          Sent {new Date(request.created_at).toLocaleDateString('en-UG', { dateStyle: 'medium' })}
        </p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <Badge variant={cfg.variant}>{cfg.label}</Badge>
        {request.status === 'pending' && (
          <button
            onClick={onCancel}
            disabled={cancelling}
            className="text-xs text-red-500 hover:text-red-700 underline disabled:opacity-50"
          >
            {cancelling ? '…' : 'Cancel'}
          </button>
        )}
      </div>
    </div>
  );
}
