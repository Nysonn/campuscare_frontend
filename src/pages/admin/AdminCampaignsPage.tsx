import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Check, X, Trash2, Heart, AlertTriangle, Eye, Paperclip,
  User, Target, Tag, Zap, TrendingUp, ShieldCheck, ShieldX, Lock, FileDown,
} from 'lucide-react';
import { adminApi } from '../../api/admin';
import type { AdminCampaign } from '../../types';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import Modal from '../../components/ui/Modal';
import SEO from '../../components/seo/SEO';
import { exportToPdf } from '../../utils/exportToPdf';
import { exportToCsv } from '../../utils/exportToCsv';

type StatusFilter = 'all' | 'pending' | 'approved' | 'rejected';

const STATUS_TABS: { key: StatusFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'approved', label: 'Approved' },
  { key: 'rejected', label: 'Rejected' },
];

function statusBadge(status: string) {
  switch (status) {
    case 'approved': return <Badge variant="green">Approved</Badge>;
    case 'rejected': return <Badge variant="red">Rejected</Badge>;
    default:         return <Badge variant="yellow">Pending Review</Badge>;
  }
}

function openAttachment(url: string) {
  if (url.startsWith('data:')) {
    const [header, b64] = url.split(',');
    const mime = header.match(/:(.*?);/)?.[1] ?? 'application/octet-stream';
    const binary = atob(b64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    const blob = new Blob([bytes], { type: mime });
    window.open(URL.createObjectURL(blob), '_blank');
  } else {
    window.open(url, '_blank');
  }
}

export default function AdminCampaignsPage() {
  const qc = useQueryClient();
  const [filter, setFilter] = useState<StatusFilter>('pending');
  const [selected, setSelected] = useState<AdminCampaign | null>(null);
  const [action, setAction] = useState<'approved' | 'rejected' | 'delete' | null>(null);
  const [previewing, setPreviewing] = useState<AdminCampaign | null>(null);
  const [exporting, setExporting] = useState(false);

  const handleExportPdf = async () => {
    setExporting(true);
    await exportToPdf('campaigns-pdf-content', `campuscare-campaigns-${new Date().toISOString().slice(0, 10)}.pdf`);
    setExporting(false);
  };

  const handleExportCsv = () => {
    exportToCsv(
      campaigns ?? [],
      [
        { key: 'id',             label: 'ID' },
        { key: 'title',          label: 'Title' },
        { key: 'student_name',   label: 'Student' },
        { key: 'category',       label: 'Category' },
        { key: 'status',         label: 'Status' },
        { key: 'target_amount',  label: 'Goal (UGX)' },
        { key: 'current_amount', label: 'Raised (UGX)' },
        { key: 'urgency_level',  label: 'Urgency' },
        { key: 'beneficiary_type', label: 'Beneficiary Type' },
        { key: 'bank_name',      label: 'Bank' },
        { key: 'account_number', label: 'Account Number' },
        { key: 'account_status', label: 'Account Status' },
        { key: 'created_at',     label: 'Created' },
      ],
      `campuscare-campaigns-${new Date().toISOString().slice(0, 10)}.csv`,
    );
  };

  const { data: campaigns, isLoading } = useQuery({
    queryKey: ['adminCampaigns', filter],
    queryFn: () => adminApi.campaigns(filter),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'approved' | 'rejected' }) =>
      adminApi.updateCampaignStatus(id, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['adminCampaigns'] });
      setSelected(null); setAction(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminApi.deleteCampaign(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['adminCampaigns'] });
      setSelected(null); setAction(null);
    },
  });

  const accountMutation = useMutation({
    mutationFn: ({ id, account_status }: { id: string; account_status: 'verified' | 'rejected' }) =>
      adminApi.verifyAccount(id, account_status),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ['adminCampaigns'] });
      // Update the previewing state so the modal reflects the new account_status immediately.
      setPreviewing(prev => prev ? { ...prev, account_status: vars.account_status } : prev);
    },
  });

  const list = campaigns ?? [];

  return (
    <div>
      <SEO
        title="Manage Campaigns"
        description="Review and approve student fundraising campaigns on CampusCare."
        noindex
      />
      <div className="mb-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-3xl font-bold text-gray-900 mb-1">Campaign Management</h1>
            <p className="text-gray-500">Review and manage all student fundraising campaigns.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExportCsv}>
              <FileDown size={16} /> Export CSV
            </Button>
            <Button variant="outline" onClick={handleExportPdf} loading={exporting}>
              <FileDown size={16} /> Export PDF
            </Button>
          </div>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit mb-6">
        {STATUS_TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setFilter(t.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              filter === t.key
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="py-16 flex justify-center"><Spinner size="lg" /></div>
      ) : list.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
          <Heart size={48} className="mx-auto mb-4 text-gray-300" />
          <h3 className="font-display text-lg text-gray-600 mb-1">No campaigns found</h3>
          <p className="text-sm text-gray-400">
            {filter === 'pending' ? 'All campaigns have been reviewed.' : `No ${filter} campaigns yet.`}
          </p>
        </div>
      ) : (
        <div id="campaigns-pdf-content" className="space-y-4">
          {list.map(c => (
            <div key={c.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <h3 className="font-display font-semibold text-gray-900">{c.title}</h3>
                    {statusBadge(c.status)}
                    <Badge variant="gray">{c.category}</Badge>
                  </div>
                  <p className="text-sm text-gray-500 mb-3 line-clamp-2">{c.description}</p>
                  <div className="flex flex-wrap gap-4 text-xs text-gray-400">
                    <span>Goal: <strong className="text-primary-700">UGX {c.target_amount.toLocaleString()}</strong></span>
                    {c.current_amount > 0 && (
                      <span>Raised: <strong className="text-emerald-700">UGX {c.current_amount.toLocaleString()}</strong></span>
                    )}
                    <span>By: <strong className="text-gray-600">{c.student_name || 'Unknown'}</strong></span>
                    <span>{new Date(c.created_at).toLocaleDateString('en-UG', { dateStyle: 'medium' })}</span>
                  </div>
                  {c.status === 'pending' && (c.bank_name || c.account_number || c.beneficiary_org_name) && (
                    <div className="mt-3 flex items-center gap-2">
                      {c.account_status === 'verified' ? (
                        <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-full px-2 py-0.5">
                          <ShieldCheck size={11} /> Account Verified
                        </span>
                      ) : c.account_status === 'rejected' ? (
                        <span className="flex items-center gap-1 text-xs font-semibold text-red-600 bg-red-50 border border-red-200 rounded-full px-2 py-0.5">
                          <ShieldX size={11} /> Account Rejected
                        </span>
                      ) : (
                        <>
                          <span className="flex items-center gap-1 text-xs font-semibold text-amber-600 bg-amber-50 border border-amber-200 rounded-full px-2 py-0.5">
                            <Lock size={11} /> Account Unverified
                          </span>
                          <button
                            onClick={() => accountMutation.mutate({ id: c.id, account_status: 'verified' })}
                            disabled={accountMutation.isPending}
                            className="flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-2.5 py-0.5 hover:bg-emerald-100 transition-colors disabled:opacity-50"
                          >
                            <ShieldCheck size={11} /> Approve Account
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>
                <div className="flex gap-2 shrink-0 items-start">
                  <Button variant="ghost" size="sm" onClick={() => setPreviewing(c)} title="View full details">
                    <Eye size={14} />
                  </Button>
                  {c.status === 'pending' && (
                    <>
                      <Button size="sm" onClick={() => { setSelected(c); setAction('approved'); }}>
                        <Check size={14} /> Approve
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => { setSelected(c); setAction('rejected'); }}>
                        <X size={14} /> Reject
                      </Button>
                    </>
                  )}
                  <Button variant="danger" size="sm" onClick={() => { setSelected(c); setAction('delete'); }}>
                    <Trash2 size={14} />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Detail preview modal ── */}
      <Modal
        open={!!previewing}
        onClose={() => setPreviewing(null)}
        title={previewing?.title ?? ''}
        subtitle="Campaign Details"
        maxWidth="max-w-2xl"
      >
        {previewing && (
          <div className="space-y-5">
            <div className="flex flex-wrap gap-2">
              {statusBadge(previewing.status)}
              <Badge variant="gray">{previewing.category}</Badge>
              {previewing.urgency_level && previewing.urgency_level !== 'normal' && (
                <Badge variant={previewing.urgency_level === 'critical' ? 'red' : 'yellow'}>
                  {previewing.urgency_level.charAt(0).toUpperCase() + previewing.urgency_level.slice(1)}
                </Badge>
              )}
              {previewing.is_anonymous && <Badge variant="gray">Anonymous</Badge>}
            </div>

            <div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1.5">Description</p>
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{previewing.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 rounded-xl p-3 flex items-start gap-2.5">
                <User size={15} className="text-primary-600 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-gray-400">Submitted by</p>
                  <p className="text-sm font-semibold text-gray-800">{previewing.student_name || 'Unknown'}</p>
                </div>
              </div>
              <div className="bg-gray-50 rounded-xl p-3 flex items-start gap-2.5">
                <Target size={15} className="text-primary-600 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-gray-400">Funding Goal</p>
                  <p className="text-sm font-semibold text-gray-800">UGX {previewing.target_amount.toLocaleString()}</p>
                </div>
              </div>
              {previewing.current_amount > 0 && (
                <div className="bg-gray-50 rounded-xl p-3 flex items-start gap-2.5">
                  <TrendingUp size={15} className="text-emerald-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-gray-400">Amount Raised</p>
                    <p className="text-sm font-semibold text-emerald-700">UGX {previewing.current_amount.toLocaleString()}</p>
                  </div>
                </div>
              )}
              <div className="bg-gray-50 rounded-xl p-3 flex items-start gap-2.5">
                <Tag size={15} className="text-primary-600 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-gray-400">Category</p>
                  <p className="text-sm font-semibold text-gray-800 capitalize">{previewing.category}</p>
                </div>
              </div>
              <div className="bg-gray-50 rounded-xl p-3 flex items-start gap-2.5">
                <Zap size={15} className="text-primary-600 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-gray-400">Urgency</p>
                  <p className="text-sm font-semibold text-gray-800 capitalize">{previewing.urgency_level}</p>
                </div>
              </div>
            </div>

            <div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1.5">Beneficiary</p>
              <div className="bg-gray-50 rounded-xl p-3 text-sm text-gray-700 space-y-1">
                <p><span className="text-gray-400">Type:</span> <span className="capitalize">{previewing.beneficiary_type}</span></p>
                {previewing.beneficiary_name && (
                  <p><span className="text-gray-400">Name:</span> {previewing.beneficiary_name}</p>
                )}
              </div>
            </div>

            {(previewing.beneficiary_org_name || previewing.bank_name || previewing.account_number) && (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Payment Destination</p>
                  {previewing.account_status === 'verified' && (
                    <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-full px-2 py-0.5">
                      <ShieldCheck size={11} /> Account Verified
                    </span>
                  )}
                  {previewing.account_status === 'rejected' && (
                    <span className="flex items-center gap-1 text-xs font-semibold text-red-600 bg-red-50 border border-red-200 rounded-full px-2 py-0.5">
                      <ShieldX size={11} /> Account Rejected
                    </span>
                  )}
                  {previewing.account_status === 'unverified' && (
                    <span className="flex items-center gap-1 text-xs font-semibold text-amber-600 bg-amber-50 border border-amber-200 rounded-full px-2 py-0.5">
                      <Lock size={11} /> Awaiting Verification
                    </span>
                  )}
                </div>
                <div className="bg-gray-50 rounded-xl p-3 text-sm text-gray-700 space-y-1 mb-2">
                  {previewing.beneficiary_org_name && <p><span className="text-gray-400">Organisation:</span> {previewing.beneficiary_org_name}</p>}
                  {previewing.bank_name && <p><span className="text-gray-400">Bank:</span> {previewing.bank_name}</p>}
                  {previewing.account_number && <p><span className="text-gray-400">Account No:</span> {previewing.account_number}</p>}
                  {previewing.account_holder_name && <p><span className="text-gray-400">Account Holder:</span> {previewing.account_holder_name}</p>}
                </div>
                {previewing.account_status !== 'verified' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => accountMutation.mutate({ id: previewing.id, account_status: 'verified' })}
                      disabled={accountMutation.isPending}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors disabled:opacity-50"
                    >
                      <ShieldCheck size={13} /> Approve Account
                    </button>
                    <button
                      onClick={() => accountMutation.mutate({ id: previewing.id, account_status: 'rejected' })}
                      disabled={accountMutation.isPending}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 text-xs font-semibold transition-colors disabled:opacity-50"
                    >
                      <ShieldX size={13} /> Reject Account
                    </button>
                  </div>
                )}
                {previewing.account_status === 'verified' && (
                  <button
                    onClick={() => accountMutation.mutate({ id: previewing.id, account_status: 'rejected' })}
                    disabled={accountMutation.isPending}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 text-xs font-medium transition-colors disabled:opacity-50"
                  >
                    <ShieldX size={13} /> Revoke Verification
                  </button>
                )}
              </div>
            )}

            {(previewing.verification_contact_name || previewing.verification_contact_info) && (
              <div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1.5">Verification Contact</p>
                <div className="bg-gray-50 rounded-xl p-3 text-sm text-gray-700 space-y-1">
                  {previewing.verification_contact_name && <p>{previewing.verification_contact_name}</p>}
                  {previewing.verification_contact_info && <p className="text-gray-500">{previewing.verification_contact_info}</p>}
                </div>
              </div>
            )}

            {previewing.attachments.length > 0 && (
              <div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1.5">Attachments ({previewing.attachments.length})</p>
                <div className="space-y-2">
                  {previewing.attachments.map((att, i) => (
                    <button
                      key={i}
                      onClick={() => openAttachment(att.url)}
                      className="w-full flex items-center gap-2.5 bg-gray-50 hover:bg-primary-50 border border-gray-100 hover:border-primary-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 hover:text-primary-700 transition-colors cursor-pointer"
                    >
                      <Paperclip size={14} className="shrink-0 text-gray-400" />
                      <span className="flex-1 text-left truncate">{att.label}</span>
                      <span className="text-xs text-gray-400 shrink-0">View →</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {previewing.status === 'pending' && (() => {
              const hasPaymentDetails = !!(previewing.bank_name || previewing.account_number || previewing.beneficiary_org_name);
              const accountVerified = previewing.account_status === 'verified';
              const canApprove = !hasPaymentDetails || accountVerified;
              return (
                <div className="pt-2 border-t border-gray-100 space-y-2">
                  {!canApprove && (
                    <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5 text-xs text-amber-700">
                      <Lock size={13} className="shrink-0" />
                      Verify the payment account above before approving this campaign.
                    </div>
                  )}
                  <div className="flex gap-3">
                    <Button
                      className="flex-1"
                      disabled={!canApprove}
                      onClick={() => { setPreviewing(null); setSelected(previewing); setAction('approved'); }}
                    >
                      <Check size={14} /> Approve Campaign
                    </Button>
                    <Button variant="outline" className="flex-1" onClick={() => { setPreviewing(null); setSelected(previewing); setAction('rejected'); }}>
                      <X size={14} /> Reject
                    </Button>
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </Modal>

      {/* ── Confirm action modal ── */}
      <Modal
        open={!!selected && !!action}
        onClose={() => { setSelected(null); setAction(null); }}
        title={
          action === 'approved' ? 'Approve Campaign'
          : action === 'rejected' ? 'Reject Campaign'
          : 'Delete Campaign'
        }
      >
        <div className="space-y-4">
          {action === 'approved' && selected && (() => {
            const hasPayment = !!(selected.bank_name || selected.account_number || selected.beneficiary_org_name);
            const verified = selected.account_status === 'verified';
            return hasPayment ? (
              <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Payment Destination</p>
                  {verified
                    ? <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-full px-2 py-0.5"><ShieldCheck size={11} /> Verified</span>
                    : <span className="flex items-center gap-1 text-xs font-semibold text-amber-600 bg-amber-50 border border-amber-200 rounded-full px-2 py-0.5"><Lock size={11} /> Unverified</span>
                  }
                </div>
                <div className="text-sm text-gray-700 space-y-0.5">
                  {selected.beneficiary_org_name && <p><span className="text-gray-400">Org:</span> {selected.beneficiary_org_name}</p>}
                  {selected.bank_name && <p><span className="text-gray-400">Bank:</span> {selected.bank_name}</p>}
                  {selected.account_number && <p><span className="text-gray-400">Account No:</span> {selected.account_number}</p>}
                  {selected.account_holder_name && <p><span className="text-gray-400">Holder:</span> {selected.account_holder_name}</p>}
                </div>
                {!verified && (
                  <button
                    onClick={() => {
                      accountMutation.mutate({ id: selected.id, account_status: 'verified' });
                      setSelected(prev => prev ? { ...prev, account_status: 'verified' } : prev);
                    }}
                    disabled={accountMutation.isPending}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors disabled:opacity-50"
                  >
                    <ShieldCheck size={13} /> Approve Account
                  </button>
                )}
                {!verified && (
                  <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-xs text-amber-700">
                    <Lock size={12} className="shrink-0" />
                    Approve the payment account before confirming the campaign.
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-gray-600 text-center">Approve <strong>"{selected.title}"</strong>? It will become publicly visible on the platform.</p>
            );
          })()}
          {(action === 'rejected') && <p className="text-sm text-gray-600 text-center">Reject <strong>"{selected?.title}"</strong>? The student will need to edit and resubmit.</p>}
          {(action === 'delete') && <p className="text-sm text-gray-600 text-center">Permanently delete <strong>"{selected?.title}"</strong>? This cannot be undone.</p>}

          {(statusMutation.isError || deleteMutation.isError) && (
            <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-sm text-red-600 flex items-center gap-2">
              <AlertTriangle size={14} className="text-red-500 shrink-0" />
              {statusMutation.error?.message || deleteMutation.error?.message}
            </div>
          )}
          <div className="flex gap-3">
            <Button variant="ghost" className="flex-1" onClick={() => { setSelected(null); setAction(null); }}>Cancel</Button>
            <Button
              variant={action === 'approved' ? 'primary' : 'danger'}
              className="flex-1"
              disabled={
                action === 'approved' &&
                !!(selected?.bank_name || selected?.account_number || selected?.beneficiary_org_name) &&
                selected?.account_status !== 'verified'
              }
              loading={statusMutation.isPending || deleteMutation.isPending}
              onClick={() => {
                if (!selected) return;
                if (action === 'delete') deleteMutation.mutate(selected.id);
                else if (action === 'approved' || action === 'rejected') statusMutation.mutate({ id: selected.id, status: action });
              }}
            >
              Confirm
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
