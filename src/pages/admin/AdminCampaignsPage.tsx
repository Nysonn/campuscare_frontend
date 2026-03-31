import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Check, X, Trash2, Heart, AlertTriangle, Eye, Paperclip,
  User, Target, Tag, Zap, Banknote, ShieldCheck, ShieldX,
} from 'lucide-react';
import { adminApi } from '../../api/admin';
import type { AdminCampaign } from '../../types';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import Modal from '../../components/ui/Modal';

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

  // Tab state
  const [activeTab, setActiveTab] = useState<'content' | 'accounts'>('content');

  // Content review state
  const [selected, setSelected] = useState<AdminCampaign | null>(null);
  const [action, setAction] = useState<'approved' | 'rejected' | 'delete' | null>(null);
  const [previewing, setPreviewing] = useState<AdminCampaign | null>(null);

  // Account verification state
  const [accountSelected, setAccountSelected] = useState<AdminCampaign | null>(null);
  const [accountAction, setAccountAction] = useState<'verified' | 'rejected' | null>(null);
  const [accountPreviewing, setAccountPreviewing] = useState<AdminCampaign | null>(null);

  // Queries
  const { data: campaigns, isLoading } = useQuery({
    queryKey: ['adminCampaigns'],
    queryFn: adminApi.unapprovedCampaigns,
  });

  const { data: accountCampaigns, isLoading: accountsLoading } = useQuery({
    queryKey: ['adminPendingAccounts'],
    queryFn: adminApi.pendingAccountCampaigns,
  });

  // Mutations
  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'approved' | 'rejected' }) =>
      adminApi.updateCampaignStatus(id, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['adminCampaigns'] });
      qc.invalidateQueries({ queryKey: ['adminPendingAccounts'] });
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
    mutationFn: ({ id, accountStatus }: { id: string; accountStatus: 'verified' | 'rejected' }) =>
      adminApi.verifyAccount(id, accountStatus),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['adminPendingAccounts'] });
      setAccountSelected(null); setAccountAction(null);
    },
  });

  const pendingCount = (campaigns ?? []).length;
  const accountCount = (accountCampaigns ?? []).length;

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-3xl font-bold text-gray-900 mb-1">Campaign Management</h1>
        <p className="text-gray-500">Review campaign content and verify payment account details.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-6 w-fit">
        <button
          onClick={() => setActiveTab('content')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
            activeTab === 'content'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Content Review
          {pendingCount > 0 && (
            <span className="ml-2 bg-primary-100 text-primary-700 text-xs px-1.5 py-0.5 rounded-full">{pendingCount}</span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('accounts')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
            activeTab === 'accounts'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Account Verification
          {accountCount > 0 && (
            <span className="ml-2 bg-amber-100 text-amber-700 text-xs px-1.5 py-0.5 rounded-full">{accountCount}</span>
          )}
        </button>
      </div>

      {/* ── CONTENT REVIEW TAB ── */}
      {activeTab === 'content' && (
        <>
          {isLoading ? (
            <div className="py-16 flex justify-center"><Spinner size="lg" /></div>
          ) : pendingCount === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
              <Heart size={48} className="mx-auto mb-4 text-gray-300" />
              <h3 className="font-display text-lg text-gray-600 mb-1">No pending campaigns</h3>
              <p className="text-sm text-gray-400">All campaigns have been reviewed.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {(campaigns ?? []).map(c => (
                <div key={c.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5">
                        <h3 className="font-display font-semibold text-gray-900">{c.title}</h3>
                        <Badge variant="yellow">Pending Review</Badge>
                        <Badge variant="gray">{c.category}</Badge>
                      </div>
                      <p className="text-sm text-gray-500 mb-3 line-clamp-2">{c.description}</p>
                      <div className="flex gap-4 text-xs text-gray-400">
                        <span>Goal: <strong className="text-primary-700">UGX {c.target_amount.toLocaleString()}</strong></span>
                        <span>Submitted: {new Date(c.created_at).toLocaleDateString('en-UG', { dateStyle: 'medium' })}</span>
                      </div>
                    </div>
                    <div className="flex gap-2 shrink-0 items-start">
                      <Button variant="ghost" size="sm" onClick={() => setPreviewing(c)} title="View full details">
                        <Eye size={14} />
                      </Button>
                      <Button size="sm" onClick={() => { setSelected(c); setAction('approved'); }}>
                        <Check size={14} /> Approve
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => { setSelected(c); setAction('rejected'); }}>
                        <X size={14} /> Reject
                      </Button>
                      <Button variant="danger" size="sm" onClick={() => { setSelected(c); setAction('delete'); }}>
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* ── ACCOUNT VERIFICATION TAB ── */}
      {activeTab === 'accounts' && (
        <>
          {accountsLoading ? (
            <div className="py-16 flex justify-center"><Spinner size="lg" /></div>
          ) : accountCount === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
              <ShieldCheck size={48} className="mx-auto mb-4 text-gray-300" />
              <h3 className="font-display text-lg text-gray-600 mb-1">No accounts pending verification</h3>
              <p className="text-sm text-gray-400">All approved campaign accounts have been reviewed.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {(accountCampaigns ?? []).map(c => (
                <div key={c.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5">
                        <h3 className="font-display font-semibold text-gray-900">{c.title}</h3>
                        <Badge variant="yellow">Account Unverified</Badge>
                        <Badge variant="gray">{c.category}</Badge>
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500 mb-2">
                        <span><strong className="text-gray-700">Org:</strong> {c.beneficiary_org_name || '—'}</span>
                        <span><strong className="text-gray-700">Bank:</strong> {c.bank_name || '—'}</span>
                        <span><strong className="text-gray-700">Account:</strong> {c.account_number || '—'}</span>
                        <span><strong className="text-gray-700">Holder:</strong> {c.account_holder_name || '—'}</span>
                      </div>
                      <p className="text-xs text-gray-400">
                        By: {c.student_name} · Submitted {new Date(c.created_at).toLocaleDateString('en-UG', { dateStyle: 'medium' })}
                      </p>
                    </div>
                    <div className="flex gap-2 shrink-0 items-start">
                      <Button variant="ghost" size="sm" onClick={() => setAccountPreviewing(c)} title="View details">
                        <Eye size={14} />
                      </Button>
                      <Button size="sm" onClick={() => { setAccountSelected(c); setAccountAction('verified'); }}>
                        <ShieldCheck size={14} /> Verify
                      </Button>
                      <Button variant="danger" size="sm" onClick={() => { setAccountSelected(c); setAccountAction('rejected'); }}>
                        <ShieldX size={14} /> Reject
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* ── Detail preview modal (Content Review) ── */}
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
              <Badge variant="yellow">Pending Review</Badge>
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

            {/* Payment destination */}
            {(previewing.beneficiary_org_name || previewing.bank_name || previewing.account_number) && (
              <div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1.5">Payment Destination</p>
                <div className="bg-gray-50 rounded-xl p-3 text-sm text-gray-700 space-y-1">
                  {previewing.beneficiary_org_name && <p><span className="text-gray-400">Organisation:</span> {previewing.beneficiary_org_name}</p>}
                  {previewing.bank_name && <p><span className="text-gray-400">Bank:</span> {previewing.bank_name}</p>}
                  {previewing.account_number && <p><span className="text-gray-400">Account No:</span> {previewing.account_number}</p>}
                  {previewing.account_holder_name && <p><span className="text-gray-400">Account Holder:</span> {previewing.account_holder_name}</p>}
                </div>
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

            <div className="flex gap-3 pt-1 border-t border-gray-100">
              <Button className="flex-1" onClick={() => { setPreviewing(null); setSelected(previewing); setAction('approved'); }}>
                <Check size={14} /> Approve
              </Button>
              <Button variant="outline" className="flex-1" onClick={() => { setPreviewing(null); setSelected(previewing); setAction('rejected'); }}>
                <X size={14} /> Reject
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* ── Account detail preview modal ── */}
      <Modal
        open={!!accountPreviewing}
        onClose={() => setAccountPreviewing(null)}
        title={accountPreviewing?.title ?? ''}
        subtitle="Payment Account Details"
        maxWidth="max-w-lg"
      >
        {accountPreviewing && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <User size={14} className="text-primary-600" />
              Submitted by <strong className="text-gray-800">{accountPreviewing.student_name}</strong>
            </div>

            <div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">Bank Account Details</p>
              <div className="bg-gray-50 rounded-xl divide-y divide-gray-100 overflow-hidden">
                {[
                  { label: 'Organisation / Institution', value: accountPreviewing.beneficiary_org_name },
                  { label: 'Bank Name', value: accountPreviewing.bank_name },
                  { label: 'Account Number', value: accountPreviewing.account_number },
                  { label: 'Account Holder Name', value: accountPreviewing.account_holder_name },
                ].map(row => (
                  <div key={row.label} className="flex items-center justify-between px-4 py-2.5">
                    <span className="text-xs text-gray-400">{row.label}</span>
                    <span className="text-sm font-medium text-gray-800">{row.value || <span className="text-gray-300 italic">Not provided</span>}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-1 border-t border-gray-100">
              <Button className="flex-1" onClick={() => { setAccountPreviewing(null); setAccountSelected(accountPreviewing); setAccountAction('verified'); }}>
                <ShieldCheck size={14} /> Verify Account
              </Button>
              <Button variant="danger" className="flex-1" onClick={() => { setAccountPreviewing(null); setAccountSelected(accountPreviewing); setAccountAction('rejected'); }}>
                <ShieldX size={14} /> Reject Account
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* ── Confirm content action modal ── */}
      <Modal
        open={!!selected && !!action}
        onClose={() => { setSelected(null); setAction(null); }}
        title={
          action === 'approved' ? 'Approve Campaign'
          : action === 'rejected' ? 'Reject Campaign'
          : 'Delete Campaign'
        }
      >
        <div className="text-center space-y-5">
          <p className="text-sm text-gray-600">
            {action === 'approved' && `Approve "${selected?.title}"? It will become publicly visible on the platform.`}
            {action === 'rejected' && `Reject "${selected?.title}"? The student will need to edit and resubmit.`}
            {action === 'delete' && `Permanently delete "${selected?.title}"? This cannot be undone.`}
          </p>
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

      {/* ── Confirm account action modal ── */}
      <Modal
        open={!!accountSelected && !!accountAction}
        onClose={() => { setAccountSelected(null); setAccountAction(null); }}
        title={accountAction === 'verified' ? 'Verify Account' : 'Reject Account'}
      >
        <div className="text-center space-y-5">
          <div className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center ${accountAction === 'verified' ? 'bg-emerald-50' : 'bg-red-50'}`}>
            {accountAction === 'verified'
              ? <ShieldCheck size={22} className="text-emerald-600" />
              : <ShieldX size={22} className="text-red-500" />
            }
          </div>
          <p className="text-sm text-gray-600">
            {accountAction === 'verified'
              ? `Mark the bank account for "${accountSelected?.title}" as verified? Future donations will be released immediately.`
              : `Reject the bank account for "${accountSelected?.title}"? Donations will remain held until new details are submitted and verified.`
            }
          </p>
          {accountMutation.isError && (
            <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-sm text-red-600 flex items-center gap-2">
              <AlertTriangle size={14} className="text-red-500 shrink-0" />
              {accountMutation.error?.message}
            </div>
          )}
          <div className="flex gap-3">
            <Button variant="ghost" className="flex-1" onClick={() => { setAccountSelected(null); setAccountAction(null); }}>Cancel</Button>
            <Button
              variant={accountAction === 'verified' ? 'primary' : 'danger'}
              className="flex-1"
              loading={accountMutation.isPending}
              onClick={() => {
                if (!accountSelected || !accountAction) return;
                accountMutation.mutate({ id: accountSelected.id, accountStatus: accountAction });
              }}
            >
              {accountAction === 'verified' ? 'Verify' : 'Reject'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
