import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  X, CheckCircle, XCircle, AlertTriangle, MapPin,
  Calendar, Phone, Briefcase, FileText, ExternalLink, User,
} from 'lucide-react';
import { adminApi } from '../../api/admin';
import type { AdminCounselor } from '../../types';
import Avatar from '../../components/ui/Avatar';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import SEO from '../../components/seo/SEO';

type StatusFilter = 'pending' | 'approved' | 'rejected' | 'all';

export default function AdminCounselorsPage() {
  const qc = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('pending');
  const [selected, setSelected] = useState<AdminCounselor | null>(null);
  const [confirmAction, setConfirmAction] = useState<'approved' | 'rejected' | null>(null);

  const { data: counselors, isLoading } = useQuery({
    queryKey: ['adminCounselors', statusFilter],
    queryFn: () => adminApi.counselors(statusFilter),
  });

  const mutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'approved' | 'rejected' }) =>
      adminApi.verifyCounselor(id, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['adminCounselors'] });
      setSelected(null);
      setConfirmAction(null);
    },
  });

  const statusBadge = (s: string) => {
    if (s === 'approved') return <Badge variant="green">Approved</Badge>;
    if (s === 'rejected') return <Badge variant="red">Rejected</Badge>;
    return <Badge variant="yellow">Pending</Badge>;
  };

  const filters: { value: StatusFilter; label: string }[] = [
    { value: 'pending', label: 'Pending' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'all', label: 'All' },
  ];

  return (
    <div>
      <SEO title="Counsellor Verification" description="Review and approve counsellor applications." noindex />

      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-gray-900 mb-1">Counsellor Verification</h1>
        <p className="text-gray-500">Review applications and approve or reject counsellors.</p>
      </div>

      {/* Status filter */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {filters.map(f => (
          <button
            key={f.value}
            onClick={() => setStatusFilter(f.value)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all cursor-pointer ${
              statusFilter === f.value
                ? 'bg-primary-600 text-white'
                : 'bg-white text-gray-600 border border-gray-200 hover:border-primary-300'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="py-16 flex justify-center"><Spinner size="lg" /></div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-5 py-3">Counsellor</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-5 py-3">Specialization</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-5 py-3">Location</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-5 py-3">Status</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-5 py-3">Applied</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-5 py-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {(counselors ?? []).map(c => (
                  <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <Avatar src={c.avatar_url || undefined} name={c.full_name} size="sm" />
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{c.full_name}</p>
                          <p className="text-xs text-gray-400">{c.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-gray-600">{c.specialization || <span className="text-gray-300 italic">—</span>}</td>
                    <td className="px-5 py-3.5 text-sm text-gray-600">{c.location || <span className="text-gray-300 italic">—</span>}</td>
                    <td className="px-5 py-3.5">{statusBadge(c.verification_status)}</td>
                    <td className="px-5 py-3.5 text-sm text-gray-500">
                      {new Date(c.created_at).toLocaleDateString('en-UG', { dateStyle: 'medium' })}
                    </td>
                    <td className="px-5 py-3.5">
                      <Button variant="outline" size="sm" onClick={() => setSelected(c)}>
                        View Details
                      </Button>
                    </td>
                  </tr>
                ))}
                {(counselors ?? []).length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-sm text-gray-400">
                      No {statusFilter === 'all' ? '' : statusFilter} counsellors found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Detail modal */}
      {selected && (
        <>
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" onClick={() => { setSelected(null); setConfirmAction(null); }} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <div
              className="pointer-events-auto w-full max-w-lg bg-white rounded-3xl shadow-2xl flex flex-col max-h-[90vh]"
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-start justify-between px-6 pt-6 pb-4 shrink-0 border-b border-gray-100">
                <div className="flex items-center gap-4">
                  <Avatar src={selected.avatar_url || undefined} name={selected.full_name} size="lg" />
                  <div>
                    <h2 className="font-display text-lg font-bold text-gray-900">{selected.full_name}</h2>
                    <p className="text-sm text-primary-600 font-medium">{selected.specialization || 'No specialization listed'}</p>
                    <div className="mt-1">{statusBadge(selected.verification_status)}</div>
                  </div>
                </div>
                <button
                  onClick={() => { setSelected(null); setConfirmAction(null); }}
                  className="h-8 w-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors shrink-0"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Body */}
              <div className="overflow-y-auto flex-1 px-6 py-5 space-y-4">

                {/* Info grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-start gap-2.5 bg-gray-50 rounded-xl p-3">
                    <User size={14} className="text-primary-500 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Email</p>
                      <p className="text-sm text-gray-700 break-all">{selected.email}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5 bg-gray-50 rounded-xl p-3">
                    <Phone size={14} className="text-primary-500 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Phone</p>
                      <p className="text-sm text-gray-700">{selected.phone || '—'}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5 bg-gray-50 rounded-xl p-3">
                    <MapPin size={14} className="text-primary-500 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Location</p>
                      <p className="text-sm text-gray-700">{selected.location || '—'}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5 bg-gray-50 rounded-xl p-3">
                    <Calendar size={14} className="text-primary-500 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Age / Experience</p>
                      <p className="text-sm text-gray-700">
                        {selected.age != null ? `${selected.age} yrs old` : '—'}{selected.years_of_experience ? ` · ${selected.years_of_experience}` : ''}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Bio */}
                <div className="flex items-start gap-2.5">
                  <FileText size={14} className="text-primary-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Bio</p>
                    <p className="text-sm text-gray-700 leading-relaxed">{selected.bio || <span className="italic text-gray-400">No bio provided.</span>}</p>
                  </div>
                </div>

                {/* Specialization */}
                <div className="flex items-start gap-2.5">
                  <Briefcase size={14} className="text-primary-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Specialization</p>
                    <p className="text-sm text-gray-700">{selected.specialization || <span className="italic text-gray-400">Not specified.</span>}</p>
                  </div>
                </div>

                {/* Licence */}
                <div className="flex items-start gap-2.5">
                  <ExternalLink size={14} className="text-primary-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Professional Licence</p>
                    {selected.licence_url ? (
                      <a
                        href={selected.licence_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-sm text-primary-600 font-medium hover:underline"
                      >
                        View Licence <ExternalLink size={12} />
                      </a>
                    ) : (
                      <p className="text-sm text-gray-400 italic">No licence uploaded.</p>
                    )}
                  </div>
                </div>

                {/* Error */}
                {mutation.isError && (
                  <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-sm text-red-600 flex items-center gap-2">
                    <AlertTriangle size={14} className="shrink-0" />
                    {mutation.error?.message ?? 'Something went wrong.'}
                  </div>
                )}

                {/* Confirm prompt */}
                {confirmAction && (
                  <div className={`rounded-xl border px-4 py-3 text-sm ${confirmAction === 'approved' ? 'bg-primary-50 border-primary-100 text-primary-800' : 'bg-red-50 border-red-100 text-red-800'}`}>
                    <p className="font-semibold mb-1">
                      {confirmAction === 'approved' ? 'Approve this counsellor?' : 'Reject this counsellor?'}
                    </p>
                    <p className="text-xs opacity-80 mb-3">
                      {confirmAction === 'approved'
                        ? 'They will receive an email and can log in immediately.'
                        : 'They will remain locked out. No email will be sent.'}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant={confirmAction === 'approved' ? 'primary' : 'danger'}
                        loading={mutation.isPending}
                        onClick={() => mutation.mutate({ id: selected.id, status: confirmAction })}
                      >
                        Confirm {confirmAction === 'approved' ? 'Approval' : 'Rejection'}
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setConfirmAction(null)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer actions — only show if not yet decided */}
              {selected.verification_status === 'pending' && !confirmAction && (
                <div className="px-6 pb-6 pt-4 border-t border-gray-100 flex gap-3 shrink-0">
                  <Button
                    className="flex-1"
                    onClick={() => setConfirmAction('approved')}
                  >
                    <CheckCircle size={16} /> Approve
                  </Button>
                  <Button
                    variant="danger"
                    className="flex-1"
                    onClick={() => setConfirmAction('rejected')}
                  >
                    <XCircle size={16} /> Reject
                  </Button>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
